/**
 * @class AutoMixEngine
 * @description Manages intelligent, beat-matched crossfading between audio tracks.
 * This implementation is based on the specifications from AUTOMIX_IMPROVEMENTS.md.
 */
class AutoMixEngine {
    /**
     * @param {AudioContext} audioContext - The Web Audio API AudioContext.
     * @param {PlaylistManager} playlistManager - The playlist manager instance.
     */
    constructor(audioContext, playlistManager) {
        this.audioContext = audioContext;
        this.playlistManager = playlistManager;
        this.isMixing = false;
        this.debugMode = false;
        this.sourceNodeA = null;
        this.sourceNodeB = null;
        this.gainNodeA = null;
        this.gainNodeB = null;
        this.FADE_TIME = 15 / 1000; // 15ms for micro-fades
        this.CURVE_RESOLUTION = 512; // Number of points in the S-curve
    }

    /**
     * Enables or disables debug mode.
     * @param {boolean} enabled - True to enable, false to disable.
     */
    setDebugMode(enabled) {
        this.debugMode = enabled;
        console.log(`[AutoMixEngine] Debug mode ${enabled ? 'enabled' : 'disabled'}.`);
    }

    /**
     * Initiates an automated mix between the current and next track.
     * @param {object} currentTrack - The currently playing track object.
     * @param {object} nextTrack - The upcoming track object.
     * @param {number} currentPosition - The current playback position of the outgoing track.
     */
    async startAutoMix(currentTrack, nextTrack, currentPosition) {
        if (this.isMixing) {
            if (this.debugMode) console.warn('[AutoMixEngine] Mix is already in progress.');
            return false;
        }
        this.isMixing = true;

        if (this.debugMode) console.log('[AutoMixEngine] Starting AutoMix...');

        const crossfadeDuration = this.playlistManager.getCrossfadeDuration();
        const mixPoint = currentTrack.buffer.duration - crossfadeDuration;

        // 1. Get audio buffers and analysis data
        const bufferA = currentTrack.buffer;
        let bufferB = nextTrack.buffer;
        const analysisA = currentTrack.analysis;
        const analysisB = nextTrack.analysis;

        // 2. Tempo Resampling if needed
        const bpmDifference = Math.abs(analysisA.bpm - analysisB.bpm);
        if (bpmDifference > analysisA.bpm * 0.03 && bpmDifference < analysisA.bpm * 0.25) {
            if (this.debugMode) console.log(`[AutoMixEngine] Resampling next track from ${analysisB.bpm} BPM to ${analysisA.bpm} BPM.`);
            bufferB = await this.resampleBufferForTempo(bufferB, analysisA, analysisB);
        }

        // 3. Beat alignment
        const startTimeB = this.calculateBeatAlignedStartOffset(analysisA, analysisB, mixPoint);

        // 4. Scheduling with audioContext.currentTime for precision
        const now = this.audioContext.currentTime;
        const mixStartTime = now + (mixPoint - currentPosition);

        if (mixStartTime <= now) {
            if (this.debugMode) console.warn('[AutoMixEngine] Mix start time is in the past. Aborting.');
            this.isMixing = false;
            return false;
        }

        // 5. Create and configure audio nodes
        this.sourceNodeA = this.audioContext.createBufferSource();
        this.sourceNodeB = this.audioContext.createBufferSource();
        this.gainNodeA = this.audioContext.createGain();
        this.gainNodeB = this.audioContext.createGain();

        this.sourceNodeA.buffer = bufferA;
        this.sourceNodeB.buffer = bufferB;

        this.sourceNodeA.connect(this.gainNodeA).connect(this.audioContext.destination);
        this.sourceNodeB.connect(this.gainNodeB).connect(this.audioContext.destination);

        // 6. Schedule crossfade using S-curves
        const fadeOutCurve = this.createSCurveFade(1, 0.0001, this.CURVE_RESOLUTION, 'out');
        const fadeInCurve = this.createSCurveFade(0.0001, 1, this.CURVE_RESOLUTION, 'in');

        this.gainNodeA.gain.setValueAtTime(1.0, mixStartTime);
        this.gainNodeA.gain.setValueCurveAtTime(fadeOutCurve, mixStartTime, crossfadeDuration);

        this.gainNodeB.gain.setValueAtTime(0.0001, mixStartTime);
        this.gainNodeB.gain.setValueCurveAtTime(fadeInCurve, mixStartTime, crossfadeDuration);

        // 7. Schedule playback and micro-fades
        this.sourceNodeB.start(mixStartTime, startTimeB);
        // Add micro-fade in for the new track
        this.gainNodeB.gain.setTargetAtTime(1.0, mixStartTime, this.FADE_TIME);

        // Schedule stop for the old track and micro-fade out
        this.gainNodeA.gain.setTargetAtTime(0, mixStartTime + crossfadeDuration - this.FADE_TIME, this.FADE_TIME);
        this.sourceNodeA.stop(mixStartTime + crossfadeDuration);

        // 8. Synchronize animation
        this.syncCrossfadeAnimation(mixStartTime, crossfadeDuration);

        if (this.debugMode) {
            console.log(`[AutoMixEngine] Mix scheduled:
            - Mix Start Time: ${mixStartTime.toFixed(3)}s (in ${ (mixStartTime - now).toFixed(3)}s)
            - Crossfade Duration: ${crossfadeDuration}s
            - Track A (out): ${currentTrack.file.name}
            - Track B (in): ${nextTrack.file.name}
            - Track B Start Offset: ${startTimeB.toFixed(3)}s`);
        }

        setTimeout(() => { this.isMixing = false; }, (mixStartTime - now + crossfadeDuration) * 1000);

        return true;
    }

    /**
     * Creates a smooth S-curve for gain automation using a cosine function.
     * This provides an "equal power" crossfade feel.
     */
    createSCurveFade(startValue, endValue, numPoints) {
        const curve = new Float32Array(numPoints);
        const isFadeIn = endValue > startValue;

        for (let i = 0; i < numPoints; i++) {
            const x = i / (numPoints - 1);
            // Use cosine shaping for a smooth, natural curve
            const scaledX = isFadeIn ? x : 1 - x;
            const y = 0.5 * (1 - Math.cos(scaledX * Math.PI));

            curve[i] = startValue + (endValue - startValue) * y;
        }
        return curve;
    }

    /**
     * Calculates the start offset for beat-aligned transitions.
     */
    calculateBeatAlignedStartOffset(analysisA, analysisB, mixPoint) {
        if (!analysisA || !analysisA.beats || !analysisB || !analysisB.beats) {
            if(this.debugMode) console.warn("[AutoMixEngine] Beat data not available for alignment. Falling back to 0 offset.");
            return 0;
        }

        const outgoingBeats = analysisA.beats;
        const incomingBeats = analysisB.beats;

        // Find the closest beat in the outgoing track to the mix point
        let closestBeatTime = outgoingBeats.reduce((prev, curr) => {
            return (Math.abs(curr - mixPoint) < Math.abs(prev - mixPoint) ? curr : prev);
        });

        // Find the first downbeat (or any early beat) in the incoming track
        let firstIncomingBeat = incomingBeats.find(beat => beat > 0.1) || incomingBeats[0] || 0;

        if(this.debugMode) console.log(`[AutoMixEngine] Aligning to outgoing beat at ${closestBeatTime.toFixed(3)}s. Incoming track will start at its beat at ${firstIncomingBeat.toFixed(3)}s.`);

        return firstIncomingBeat;
    }

    /**
     * Resamples an audio buffer to a new tempo.
     */
    async resampleBufferForTempo(sourceBuffer, analysisA, analysisB) {
        const tempoRatio = analysisA.bpm / analysisB.bpm;
        const newDuration = sourceBuffer.duration / tempoRatio;

        const offlineCtx = new OfflineAudioContext(
            sourceBuffer.numberOfChannels,
            Math.ceil(newDuration * sourceBuffer.sampleRate),
            sourceBuffer.sampleRate
        );

        const bufferSource = offlineCtx.createBufferSource();
        bufferSource.buffer = sourceBuffer;
        bufferSource.playbackRate.value = tempoRatio;
        bufferSource.connect(offlineCtx.destination);
        bufferSource.start(0);

        if (this.debugMode) console.log(`[AutoMixEngine] Starting offline render for tempo change. Ratio: ${tempoRatio.toFixed(3)}`);

        return offlineCtx.startRendering();
    }

    /**
     * Synchronizes an anime.js animation with the crossfade.
     */
    syncCrossfadeAnimation(startTime, duration) {
        if (typeof anime !== 'undefined') {
            const delay = (startTime - this.audioContext.currentTime) * 1000;

            if (this.debugMode) console.log(`[AutoMixEngine] Scheduling anime.js animation with ${delay.toFixed(0)}ms delay.`);

            const animationProxy = { progress: 0 };

            anime({
                targets: animationProxy,
                progress: 1,
                delay: delay > 0 ? delay : 0,
                duration: duration * 1000,
                easing: 'cubicBezier(0.25, 0.46, 0.45, 0.94)', // S-curve like easing
                update: () => {
                    // UI update logic would go here
                }
            });
        }
    }

    /**
     * Simulates a mix session for debugging purposes.
     */
    async simulateMixSession(currentTrack, nextTrack) {
        if (!currentTrack || !nextTrack || !currentTrack.analysis || !nextTrack.analysis) {
            return { error: "Missing track data or analysis." };
        }

        const crossfadeDuration = this.playlistManager.getCrossfadeDuration();
        const mixPoint = currentTrack.buffer.duration - crossfadeDuration;

        const analysisA = currentTrack.analysis;
        let analysisB = nextTrack.analysis;

        const report = {
            timestamps: {
                mixPoint: mixPoint,
                crossfadeDuration: crossfadeDuration,
            },
            tempo: {
                trackA_BPM: analysisA.bpm,
                trackB_BPM: analysisB.bpm,
                resamplingNeeded: false,
                resampledBPM: null
            },
            beatAlignment: {
                outgoingBeat: null,
                incomingBeat: null,
                finalOffset: null
            }
        };

        const bpmDifference = Math.abs(analysisA.bpm - analysisB.bpm);
        if (bpmDifference > analysisA.bpm * 0.03 && bpmDifference < analysisA.bpm * 0.25) {
            report.tempo.resamplingNeeded = true;
            report.tempo.resampledBPM = analysisA.bpm;
            analysisB = { ...analysisB, bpm: analysisA.bpm };
        }

        const offset = this.calculateBeatAlignedStartOffset(analysisA, analysisB, mixPoint);
        report.beatAlignment.finalOffset = offset;
        if(analysisA.beats) report.beatAlignment.outgoingBeat = analysisA.beats.reduce((prev, curr) => (Math.abs(curr - mixPoint) < Math.abs(prev - mixPoint) ? curr : prev));
        if(analysisB.beats) report.beatAlignment.incomingBeat = analysisB.beats.find(b => b > 0.1) || analysisB.beats[0];

        if (this.debugMode) {
            console.log("[AutoMixEngine] Simulation Report:", report);
        }

        return report;
    }

    /**
     * Test function to check if the engine is ready.
     */
    testAutoMix() {
        return {
            isReady: this.audioContext && this.playlistManager,
            audioContextState: this.audioContext.state,
        };
    }
}