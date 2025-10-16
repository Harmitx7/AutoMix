# AutoMix - Smart Music Player

🎧 A professional-grade browser-based music player with Apple Music-quality intelligent mixing features. Automatically transitions between tracks with advanced beat-matching, S-curve crossfades, and tempo resampling for seamless musical experiences.

![AutoMix Preview](https://via.placeholder.com/800x400/1a1a1a/4ecdc4?text=AutoMix+Smart+Music+Player)

## ✨ Features

### 🎵 Core Functionality
- **Drag & Drop Upload**: Upload multiple audio files (MP3, WAV) with intuitive drag-and-drop interface
- **Smart Playlist Management**: Organize, reorder, and manage your music collection
- **Advanced Audio Playback**: High-quality playback using Web Audio API
- **Persistent Storage**: Your playlists are saved locally in your browser

### 🔀 AutoMix Engine (Enhanced)
- **Advanced BPM Detection**: Meyda.js-powered tempo analysis with fallback algorithms
- **Beat Grid Alignment**: Precise beat-to-beat synchronization for musical transitions
- **S-Curve Crossfades**: Professional fade curves instead of linear for natural blending
- **Tempo Resampling**: OfflineAudioContext-based tempo matching (3-25% BPM difference)
- **Micro-Fade Technology**: 15ms click elimination for artifact-free transitions
- **Smart Mix Modes**: Chill (16s), Club (8s), Random (12s) with adaptive crossfade duration
- **Key Compatibility**: Harmonic mixing with circle of fifths analysis
- **Crash-Resistant**: Comprehensive error handling with graceful fallbacks

### 🎨 Beautiful Interface
- **Dark Theme**: Modern, Spotify-inspired design with neon accents
- **Synchronized Animations**: anime.js animations perfectly synced with audio crossfades
- **Responsive Design**: Works perfectly on desktop and tablet
- **Visual Feedback**: Real-time crossfade visualization with S-curve matching
- **Magic Bento Cards**: Interactive feature showcase with particle effects
- **Tilted Card Display**: 3D track artwork with dynamic lighting

### ⚡ Performance
- **Client-Side Only**: No backend required - runs entirely in your browser
- **Offline Ready**: Works without internet connection with PWA support
- **Lightweight**: Optimized for fast loading and smooth performance
- **Memory Efficient**: Proper cleanup prevents memory leaks
- **Sample-Accurate Timing**: Uses audioContext.currentTime for zero drift
- **Fresh Audio Nodes**: Prevents Web Audio API reuse bugs

## 🚀 Quick Start

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Local web server (for file access - see setup below)

### Installation

1. **Clone or Download**
   ```bash
   git clone https://github.com/yourusername/automix.git
   cd automix
   ```

2. **Start Local Server**
   
   **Option A: Using Python**
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Python 2
   python -m SimpleHTTPServer 8000
   ```
   
   **Option B: Using Node.js**
   ```bash
   npx http-server -p 8000
   ```
   
   **Option C: Using PHP**
   ```bash
   php -S localhost:8000
   ```

3. **Open in Browser**
   Navigate to `http://localhost:8000` in your web browser

### First Use

1. **Upload Music**: Drag and drop your audio files or click "Browse Files" button
2. **Select Track**: Click any track in the playlist to start playing
3. **Enable AutoMix**: Click the AutoMix button to enable intelligent transitions
4. **Customize**: Adjust crossfade duration and mix mode to your preference
5. **Debug Mode**: Enable debug mode for detailed mixing analytics and performance metrics

## 🎛 Controls & Shortcuts

### Player Controls
- **Play/Pause**: Space bar or click play button
- **Previous/Next**: Arrow keys or navigation buttons
- **Volume**: Up/Down arrows or volume slider
- **Seek**: Click anywhere on the progress bar

### Keyboard Shortcuts
- `Space` - Play/Pause
- `←/→` - Previous/Next track
- `↑/↓` - Volume up/down
- `M` - Mute/Unmute
- `A` - Toggle AutoMix

### AutoMix Settings
- **Crossfade Duration**: 3-20 seconds (adaptive based on track compatibility)
- **Mix Modes**:
  - **Chill**: Smooth, relaxed transitions (16s default, exponential curves)
  - **Club**: Energetic, DJ-style mixing (8s default, beat-aligned)
  - **Random**: Unpredictable mix points (12s default, mixed curves)
- **Advanced Features**:
  - **Beat Matching**: Toggle beat grid alignment
  - **Tempo Resampling**: Automatic BPM matching
  - **Debug Mode**: Detailed logging and performance metrics

## 🏗 Architecture

### File Structure
```
automix/
├── index.html              # Main HTML structure
├── css/
│   └── style.css          # Styling and animations
├── js/
│   ├── main.js            # Application orchestrator
│   ├── playlistManager.js # File handling & playlist logic
│   ├── automixEngine.js   # Enhanced mixing engine with crash protection
│   ├── analyzer.js        # Advanced audio analysis with Meyda.js
│   ├── ui.js              # Interface and synchronized animations
│   ├── magicBento.js      # Interactive feature cards
│   └── animatedList.js    # Smooth playlist animations
├── AUTOMIX_IMPROVEMENTS.md # Detailed technical improvements
└── README.md              # This file
```

### Core Modules

#### PlaylistManager
- Enhanced file upload with comprehensive error handling
- Shared AudioContext management
- Advanced audio buffer caching
- Persistent storage with track analysis
- Fallback file input for browser compatibility

#### AutoMixEngine (Crash-Resistant)
- Professional S-curve crossfade algorithms
- Beat grid alignment with downbeat detection
- OfflineAudioContext tempo resampling
- Comprehensive error handling and recovery
- Fresh AudioBufferSourceNode creation
- Sample-accurate timing with audioContext.currentTime

#### AudioAnalyzer
- Meyda.js integration for advanced analysis
- BPM detection with confidence scoring
- Energy curve analysis for optimal fade zones
- Spectral analysis for key detection
- Fallback analysis when advanced features fail

#### UIManager
- Synchronized anime.js animations with audio
- S-curve easing matching crossfade curves
- Error-resistant event handling
- Real-time visual feedback
- Magic Bento interactive cards

## 🔧 Technical Details

### Audio Processing
- **Web Audio API**: Sample-accurate audio processing with proper node management
- **Advanced BPM Detection**: Meyda.js peak detection with fallback algorithms
- **S-Curve Crossfading**: Professional fade curves with different in/out characteristics
- **Tempo Resampling**: OfflineAudioContext for pitch-preserving tempo matching
- **Micro-Fade Technology**: 15ms fade elimination for click-free transitions
- **Beat Grid Alignment**: Musical phrase and downbeat synchronization
- **Error Recovery**: Graceful fallbacks when audio processing fails

### Browser Compatibility
- ✅ Chrome 66+
- ✅ Firefox 60+
- ✅ Safari 11.1+
- ✅ Edge 79+

### Performance Optimizations
- Fresh AudioBufferSourceNode creation prevents reuse bugs
- Shared AudioContext across all components
- Comprehensive memory cleanup and error recovery
- Lazy loading of audio analysis with caching
- Optimized DOM updates with error-resistant event handling
- Sample-accurate timing eliminates scheduling drift
- Debug mode for performance monitoring and metrics

## 🎨 Customization

### Themes
The CSS uses CSS custom properties for easy theming:
```css
:root {
  --primary-color: #4ecdc4;
  --secondary-color: #ff6b6b;
  --background-dark: #121212;
  --background-light: #1e1e1e;
}
```

### Mix Algorithms
Extend the AutoMix engine by modifying `automixEngine.js`:
- Add new BPM detection methods in `analyzer.js`
- Implement harmonic mixing with circle of fifths
- Create custom S-curve crossfade algorithms
- Add tempo resampling with OfflineAudioContext
- Implement beat grid alignment algorithms
- Add energy-based transition point detection

## 🚀 Deployment

### GitHub Pages
1. Push your code to a GitHub repository
2. Go to Settings > Pages
3. Select source branch (usually `main`)
4. Your app will be available at `https://yourusername.github.io/automix`

### Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in your project directory
3. Follow the prompts to deploy

### Netlify
1. Drag and drop your project folder to [Netlify Drop](https://app.netlify.com/drop)
2. Or connect your GitHub repository for automatic deployments

## 🔮 Recent Improvements & Future Enhancements

### ✅ Recently Implemented
- **S-Curve Crossfades**: Professional fade curves for natural transitions
- **Beat Grid Alignment**: Musical phrase and downbeat synchronization
- **Tempo Resampling**: Automatic BPM matching with OfflineAudioContext
- **Crash Protection**: Comprehensive error handling and recovery
- **Synchronized Animations**: anime.js perfectly synced with audio
- **Advanced Analysis**: Meyda.js integration with fallback algorithms
- **Debug Mode**: Detailed logging and performance metrics

### Planned Features
- **Waveform Visualization**: Real-time audio waveform display
- **Cloud Storage**: Save playlists online
- **AI Recommendations**: Machine learning-based track suggestions
- **Loop/Cue Points**: DJ-style loop controls
- **Effects Rack**: Built-in audio effects (reverb, delay, filters)

### Advanced Mixing
- **Enhanced Harmonic Mixing**: Full circle of fifths implementation
- **Phrase Matching**: Advanced musical structure analysis
- **Stem Separation**: Isolate drums, bass, vocals for advanced mixing
- **Real-time EQ**: Dynamic frequency adjustment during transitions

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Setup
```bash
# Clone your fork
git clone https://github.com/yourusername/automix.git
cd automix

# Start development server
python -m http.server 8000

# Make your changes and test
# Submit a pull request
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Web Audio API** - For powerful browser-based audio processing
- **anime.js** - For smooth and beautiful animations
- **Modern CSS** - For responsive and attractive styling
- **Open Source Community** - For inspiration and best practices

## 🐛 Troubleshooting

### Common Issues
- **Browse Files Not Working**: Check browser console for `[PLAYLIST]` logs
- **AutoMix Crashes**: Enable debug mode for detailed error tracking
- **Audio Not Playing**: Ensure Web Audio API is supported and enabled
- **Crossfade Issues**: Check that both tracks have valid audio buffers

### Debug Mode
Enable debug mode for detailed logging:
```javascript
// In browser console
autoMixApp.autoMixEngine.setDebugMode(true);
```

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/automix/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/automix/discussions)
- **Technical Details**: See `AUTOMIX_IMPROVEMENTS.md` for implementation details

---

**Made with ❤️ for music lovers and developers**

*AutoMix brings Apple Music-grade professional DJ mixing to your browser with advanced beat matching, S-curve crossfades, and tempo resampling - all running client-side with zero latency and crash-resistant reliability.*
