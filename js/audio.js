/**
 * Flappy Psyduck - Audio System
 * Generates chiptune-style sounds using Web Audio API
 */

class AudioManager {
    constructor() {
        this.audioContext = null;
        this.masterVolume = 0.3;
        this.sounds = {};
        this.bgMusic = null;
        this.musicLoopId = null;
        this.initialized = false;
        
        // Initialize on first user interaction
        this.initPromise = null;
    }

    // Initialize audio context (must be called after user interaction)
    async init() {
        if (this.initialized) return;
        
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            await this.audioContext.resume();
            this.generateAllSounds();
            this.initialized = true;
            console.log('Audio system initialized');
        } catch (error) {
            console.warn('Audio initialization failed:', error);
        }
    }

    // Ensure audio is initialized
    async ensureInitialized() {
        if (!this.initialized) {
            if (!this.initPromise) {
                this.initPromise = this.init();
            }
            await this.initPromise;
        }
    }

    // Generate all game sounds
    generateAllSounds() {
        this.generateFlapSound();
        this.generateScoreSound();
        this.generateCollisionSound();
        this.generateEvolutionSound();
        this.generateBackgroundMusic();
    }

    // Create a basic oscillator-based sound
    createOscillator(frequency, type = 'sine') {
        const oscillator = this.audioContext.createOscillator();
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        oscillator.type = type;
        return oscillator;
    }

    // Create gain node for volume control
    createGain(volume = 1) {
        const gain = this.audioContext.createGain();
        gain.gain.setValueAtTime(volume * this.masterVolume, this.audioContext.currentTime);
        return gain;
    }

    // Generate flap sound (quick chirp)
    generateFlapSound() {
        this.sounds.flap = () => {
            const duration = 0.1;
            const oscillator = this.createOscillator(350, 'square');
            const gain = this.createGain(0.2);
            
            // Quick frequency slide up
            oscillator.frequency.exponentialRampToValueAtTime(500, this.audioContext.currentTime + 0.05);
            oscillator.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + duration);
            
            // Quick decay
            gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
            
            oscillator.connect(gain);
            gain.connect(this.audioContext.destination);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);
        };
    }

    // Generate score sound (ascending chime)
    generateScoreSound() {
        this.sounds.score = () => {
            const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
            notes.forEach((freq, index) => {
                setTimeout(() => {
                    const duration = 0.2;
                    const oscillator = this.createOscillator(freq, 'sine');
                    const gain = this.createGain(0.3);
                    
                    // Bell-like envelope
                    gain.gain.setValueAtTime(0, this.audioContext.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.3 * this.masterVolume, this.audioContext.currentTime + 0.01);
                    gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
                    
                    oscillator.connect(gain);
                    gain.connect(this.audioContext.destination);
                    
                    oscillator.start(this.audioContext.currentTime);
                    oscillator.stop(this.audioContext.currentTime + duration);
                }, index * 50);
            });
        };
    }

    // Generate collision sound (harsh crash)
    generateCollisionSound() {
        this.sounds.collision = () => {
            const duration = 0.3;
            
            // Low frequency crash
            const lowOsc = this.createOscillator(80, 'sawtooth');
            const lowGain = this.createGain(0.4);
            
            // High frequency crash
            const highOsc = this.createOscillator(200, 'square');
            const highGain = this.createGain(0.3);
            
            // Noise component
            const bufferSize = this.audioContext.sampleRate * duration;
            const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
            const data = buffer.getChannelData(0);
            
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }
            
            const noise = this.audioContext.createBufferSource();
            noise.buffer = buffer;
            const noiseGain = this.createGain(0.2);
            
            // Filter for the noise
            const filter = this.audioContext.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(1000, this.audioContext.currentTime);
            
            // Frequency slides down
            lowOsc.frequency.exponentialRampToValueAtTime(20, this.audioContext.currentTime + duration);
            highOsc.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + duration);
            
            // Volume decay
            lowGain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
            highGain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
            noiseGain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
            
            // Connect everything
            lowOsc.connect(lowGain);
            highOsc.connect(highGain);
            noise.connect(filter);
            filter.connect(noiseGain);
            
            lowGain.connect(this.audioContext.destination);
            highGain.connect(this.audioContext.destination);
            noiseGain.connect(this.audioContext.destination);
            
            // Start sounds
            lowOsc.start(this.audioContext.currentTime);
            highOsc.start(this.audioContext.currentTime);
            noise.start(this.audioContext.currentTime);
            
            lowOsc.stop(this.audioContext.currentTime + duration);
            highOsc.stop(this.audioContext.currentTime + duration);
            noise.stop(this.audioContext.currentTime + duration);
        };
    }

    // Generate evolution sound (magical transformation)
    generateEvolutionSound() {
        this.sounds.evolution = () => {
            const duration = 1.5;
            
            // Ascending magical arpeggio
            const frequencies = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // C major scale
            
            frequencies.forEach((freq, index) => {
                setTimeout(() => {
                    // Main tone
                    const oscillator = this.createOscillator(freq, 'sine');
                    const gain = this.createGain(0.2);
                    
                    // Harmonic
                    const harmonic = this.createOscillator(freq * 2, 'sine');
                    const harmonicGain = this.createGain(0.1);
                    
                    // Sub harmonic
                    const sub = this.createOscillator(freq * 0.5, 'sine');
                    const subGain = this.createGain(0.15);
                    
                    const noteDuration = 0.3;
                    
                    // Envelope
                    [gain, harmonicGain, subGain].forEach(g => {
                        g.gain.setValueAtTime(0, this.audioContext.currentTime);
                        g.gain.exponentialRampToValueAtTime(g.gain.value || 0.1, this.audioContext.currentTime + 0.01);
                        g.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + noteDuration);
                    });
                    
                    // Connect
                    oscillator.connect(gain);
                    harmonic.connect(harmonicGain);
                    sub.connect(subGain);
                    
                    gain.connect(this.audioContext.destination);
                    harmonicGain.connect(this.audioContext.destination);
                    subGain.connect(this.audioContext.destination);
                    
                    // Start
                    oscillator.start(this.audioContext.currentTime);
                    harmonic.start(this.audioContext.currentTime);
                    sub.start(this.audioContext.currentTime);
                    
                    oscillator.stop(this.audioContext.currentTime + noteDuration);
                    harmonic.stop(this.audioContext.currentTime + noteDuration);
                    sub.stop(this.audioContext.currentTime + noteDuration);
                    
                }, index * 150);
            });
        };
    }

    // Generate background music (simple looping melody)
    generateBackgroundMusic() {
        this.sounds.bgMusic = () => {
            if (this.musicLoopId) {
                clearTimeout(this.musicLoopId);
            }
            
            const playMelody = () => {
                // Simple 8-note melody in C major
                const melody = [
                    { freq: 523.25, duration: 0.5 }, // C5
                    { freq: 659.25, duration: 0.5 }, // E5
                    { freq: 783.99, duration: 0.5 }, // G5
                    { freq: 659.25, duration: 0.5 }, // E5
                    { freq: 698.46, duration: 0.5 }, // F5
                    { freq: 659.25, duration: 0.5 }, // E5
                    { freq: 587.33, duration: 0.5 }, // D5
                    { freq: 523.25, duration: 1.0 }  // C5
                ];
                
                let currentTime = this.audioContext.currentTime;
                
                melody.forEach(note => {
                    const oscillator = this.createOscillator(note.freq, 'square');
                    const gain = this.createGain(0.05); // Very quiet background music
                    
                    // Soft envelope
                    gain.gain.setValueAtTime(0, currentTime);
                    gain.gain.linearRampToValueAtTime(0.05 * this.masterVolume, currentTime + 0.1);
                    gain.gain.linearRampToValueAtTime(0.03 * this.masterVolume, currentTime + note.duration - 0.1);
                    gain.gain.linearRampToValueAtTime(0, currentTime + note.duration);
                    
                    oscillator.connect(gain);
                    gain.connect(this.audioContext.destination);
                    
                    oscillator.start(currentTime);
                    oscillator.stop(currentTime + note.duration);
                    
                    currentTime += note.duration;
                });
                
                // Loop the melody
                const totalDuration = melody.reduce((sum, note) => sum + note.duration, 0);
                this.musicLoopId = setTimeout(() => {
                    if (this.bgMusic && this.bgMusic.playing) {
                        playMelody();
                    }
                }, totalDuration * 1000);
            };
            
            // Start the melody
            playMelody();
        };
    }

    // Play a sound effect
    async playSound(soundName) {
        await this.ensureInitialized();
        if (this.sounds[soundName]) {
            this.sounds[soundName]();
        } else {
            console.warn(`Sound '${soundName}' not found`);
        }
    }

    // Start background music
    async startMusic() {
        await this.ensureInitialized();
        if (!this.bgMusic || !this.bgMusic.playing) {
            this.bgMusic = { playing: true };
            this.playSound('bgMusic');
        }
    }

    // Stop background music
    stopMusic() {
        if (this.bgMusic) {
            this.bgMusic.playing = false;
            this.bgMusic = null;
        }
        if (this.musicLoopId) {
            clearTimeout(this.musicLoopId);
            this.musicLoopId = null;
        }
    }

    // Set master volume (0.0 to 1.0)
    setVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
    }

    // Mute/unmute all sounds
    mute() {
        this.setVolume(0);
    }

    unmute() {
        this.setVolume(0.3);
    }

    // Get current volume
    getVolume() {
        return this.masterVolume;
    }

    // Check if audio is supported
    isSupported() {
        return !!(window.AudioContext || window.webkitAudioContext);
    }

    // Clean up audio resources
    destroy() {
        this.stopMusic();
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
        this.initialized = false;
    }
}

// Simple fallback audio system for browsers without Web Audio API
class FallbackAudioManager {
    constructor() {
        this.masterVolume = 0.3;
        this.initialized = true;
        console.warn('Using fallback audio system - limited functionality');
    }

    async init() {
        // No initialization needed for fallback
    }

    async ensureInitialized() {
        // Always ready
    }

    async playSound(soundName) {
        // Create a simple beep using the HTML5 Audio API
        try {
            const audio = new Audio();
            
            // Generate simple tones based on sound type
            const frequencies = {
                flap: 350,
                score: 523,
                collision: 80,
                evolution: 440
            };
            
            const freq = frequencies[soundName] || 440;
            const duration = soundName === 'collision' ? 300 : 100;
            
            // Create a simple sine wave data URL
            const sampleRate = 8000;
            const samples = sampleRate * duration / 1000;
            const data = [];
            
            for (let i = 0; i < samples; i++) {
                const t = i / sampleRate;
                const sample = Math.sin(2 * Math.PI * freq * t) * this.masterVolume;
                data.push(sample);
            }
            
            // This is a simplified implementation - in practice, you'd need
            // to properly encode the audio data or use pre-recorded sounds
            console.log(`Playing fallback sound: ${soundName}`);
            
        } catch (error) {
            console.warn('Fallback audio failed:', error);
        }
    }

    async startMusic() {
        console.log('Background music started (fallback)');
    }

    stopMusic() {
        console.log('Background music stopped (fallback)');
    }

    setVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
    }

    mute() {
        this.setVolume(0);
    }

    unmute() {
        this.setVolume(0.3);
    }

    getVolume() {
        return this.masterVolume;
    }

    isSupported() {
        return false;
    }

    destroy() {
        // Nothing to clean up
    }
}

// Create audio manager instance based on browser support
function createAudioManager() {
    if (window.AudioContext || window.webkitAudioContext) {
        return new AudioManager();
    } else {
        return new FallbackAudioManager();
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AudioManager, FallbackAudioManager, createAudioManager };
}