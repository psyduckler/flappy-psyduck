/**
 * Flappy Psyduck - UI Manager
 * Handles all user interface interactions, screens, and scoring
 */

class UIManager {
    constructor(game) {
        this.game = game;
        this.currentScreen = 'title';
        this.elements = {};
        this.score = 0;
        this.highScore = this.loadHighScore();
        this.showTutorial = this.shouldShowTutorial();
        
        this.initializeElements();
        this.bindEvents();
        this.setupResponsiveHandling();
    }

    // Initialize DOM element references
    initializeElements() {
        this.elements = {
            titleScreen: document.getElementById('titleScreen'),
            gameScreen: document.getElementById('gameScreen'),
            gameOverScreen: document.getElementById('gameOverScreen'),
            tutorialOverlay: document.getElementById('tutorialOverlay'),
            
            score: document.getElementById('score'),
            finalScore: document.getElementById('finalScore'),
            bestScore: document.getElementById('bestScore'),
            evolutionIndicator: document.getElementById('evolutionIndicator'),
            
            playAgainBtn: document.getElementById('playAgainBtn'),
            shareScoreBtn: document.getElementById('shareScoreBtn'),
            closeTutorialBtn: document.getElementById('closeTutorialBtn'),
            
            gameCanvas: document.getElementById('gameCanvas'),
            gameContainer: document.getElementById('gameContainer')
        };
    }

    // Bind event listeners
    bindEvents() {
        // Button clicks
        this.elements.playAgainBtn?.addEventListener('click', () => this.restartGame());
        this.elements.shareScoreBtn?.addEventListener('click', () => this.shareScore());
        this.elements.closeTutorialBtn?.addEventListener('click', () => this.closeTutorial());
        
        // Game start triggers
        this.elements.titleScreen?.addEventListener('click', () => this.startGame());
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && this.currentScreen === 'title') {
                e.preventDefault();
                this.startGame();
            }
        });
        
        // Touch events for mobile
        this.elements.titleScreen?.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (this.currentScreen === 'title') {
                this.startGame();
            }
        });
        
        // Prevent context menu on right-click
        document.addEventListener('contextmenu', (e) => e.preventDefault());
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            switch (e.code) {
                case 'KeyR':
                    if (this.currentScreen === 'gameOver') {
                        this.restartGame();
                    }
                    break;
                case 'KeyM':
                    this.toggleMute();
                    break;
                case 'Escape':
                    if (this.currentScreen === 'tutorial') {
                        this.closeTutorial();
                    }
                    break;
            }
        });
    }

    // Setup responsive canvas handling
    setupResponsiveHandling() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        window.addEventListener('orientationchange', () => {
            setTimeout(() => this.resizeCanvas(), 100);
        });
    }

    // Resize canvas for responsive design
    resizeCanvas() {
        const canvas = this.elements.gameCanvas;
        if (!canvas) return;
        
        const container = this.elements.gameContainer;
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        
        // Target aspect ratio (similar to original Flappy Bird)
        const targetRatio = 9 / 16; // Height/Width
        
        let canvasWidth, canvasHeight;
        
        if (containerHeight / containerWidth > targetRatio) {
            // Container is taller than target ratio
            canvasWidth = containerWidth;
            canvasHeight = containerWidth * targetRatio;
        } else {
            // Container is wider than target ratio
            canvasHeight = containerHeight;
            canvasWidth = containerHeight / targetRatio;
        }
        
        // Ensure minimum size
        const minWidth = 300;
        const minHeight = 400;
        
        canvasWidth = Math.max(canvasWidth, minWidth);
        canvasHeight = Math.max(canvasHeight, minHeight);
        
        // Set display size
        canvas.style.width = canvasWidth + 'px';
        canvas.style.height = canvasHeight + 'px';
        
        // Set internal resolution (for crisp pixel art)
        const pixelRatio = window.devicePixelRatio || 1;
        canvas.width = canvasWidth * pixelRatio;
        canvas.height = canvasHeight * pixelRatio;
        
        // Scale context for pixel ratio
        const ctx = canvas.getContext('2d');
        ctx.scale(pixelRatio, pixelRatio);
        
        // Update game if it's running
        if (this.game && this.game.resize) {
            this.game.resize(canvasWidth, canvasHeight);
        }
    }

    // Show specific screen
    showScreen(screenName) {
        // Hide all screens
        Object.values(this.elements).forEach(element => {
            if (element && element.classList.contains('screen')) {
                element.classList.add('hidden');
            }
        });
        
        // Show requested screen
        const screen = this.elements[screenName + 'Screen'];
        if (screen) {
            screen.classList.remove('hidden');
        }
        
        this.currentScreen = screenName;
        
        // Handle specific screen logic
        switch (screenName) {
            case 'title':
                this.updateBestScoreDisplay();
                break;
            case 'game':
                this.updateScoreDisplay();
                break;
            case 'gameOver':
                this.updateGameOverDisplay();
                break;
        }
    }

    // Start the game
    startGame() {
        // Initialize audio on first interaction
        if (this.game.audioManager) {
            this.game.audioManager.ensureInitialized();
        }
        
        if (this.showTutorial && this.isFirstTime()) {
            this.showTutorialOverlay();
        } else {
            this.actuallyStartGame();
        }
    }

    // Actually start the game (after tutorial if needed)
    actuallyStartGame() {
        this.score = 0;
        this.showScreen('game');
        this.updateScoreDisplay();
        
        if (this.game.start) {
            this.game.start();
        }
        
        // Start background music
        if (this.game.audioManager) {
            this.game.audioManager.startMusic();
        }
    }

    // Show tutorial overlay
    showTutorialOverlay() {
        this.elements.tutorialOverlay.classList.remove('hidden');
        this.currentScreen = 'tutorial';
    }

    // Close tutorial
    closeTutorial() {
        this.elements.tutorialOverlay.classList.add('hidden');
        this.markTutorialSeen();
        this.actuallyStartGame();
    }

    // Restart the game
    restartGame() {
        this.score = 0;
        this.hideEvolutionIndicator();
        this.actuallyStartGame();
    }

    // End the game and show game over screen
    gameOver() {
        this.showScreen('gameOver');
        this.updateHighScore();
        
        // Stop background music
        if (this.game.audioManager) {
            this.game.audioManager.stopMusic();
        }
        
        // Play collision sound
        if (this.game.audioManager) {
            this.game.audioManager.playSound('collision');
        }
    }

    // Update score display
    updateScoreDisplay() {
        if (this.elements.score) {
            this.elements.score.textContent = this.score;
        }
    }

    // Update game over screen display
    updateGameOverDisplay() {
        if (this.elements.finalScore) {
            this.elements.finalScore.textContent = this.score;
        }
        if (this.elements.bestScore) {
            this.elements.bestScore.textContent = this.highScore;
        }
    }

    // Update best score display on title screen
    updateBestScoreDisplay() {
        const bestScoreElement = document.querySelector('.best-score');
        if (bestScoreElement) {
            bestScoreElement.textContent = `Best: ${this.highScore}`;
        }
    }

    // Increment score
    addScore(points = 1) {
        this.score += points;
        this.updateScoreDisplay();
        
        // Play score sound
        if (this.game.audioManager) {
            this.game.audioManager.playSound('score');
        }
    }

    // Update high score if current score is higher
    updateHighScore() {
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.saveHighScore();
        }
    }

    // Show evolution indicator
    showEvolutionIndicator() {
        if (this.elements.evolutionIndicator) {
            this.elements.evolutionIndicator.classList.remove('hidden');
        }
    }

    // Hide evolution indicator
    hideEvolutionIndicator() {
        if (this.elements.evolutionIndicator) {
            this.elements.evolutionIndicator.classList.add('hidden');
        }
    }

    // Share score functionality
    async shareScore() {
        const shareText = `🦆 I just scored ${this.score} points in Flappy Psyduck! Can you beat it? Play now: ${window.location.href}`;
        
        // Try native Web Share API first
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Flappy Psyduck',
                    text: shareText,
                    url: window.location.href
                });
                return;
            } catch (error) {
                console.log('Web Share API failed, falling back to clipboard');
            }
        }
        
        // Fallback to clipboard
        try {
            await navigator.clipboard.writeText(shareText);
            this.showNotification('Score copied to clipboard!');
        } catch (error) {
            // Final fallback - create a text area and copy
            const textArea = document.createElement('textarea');
            textArea.value = shareText;
            document.body.appendChild(textArea);
            textArea.select();
            
            try {
                document.execCommand('copy');
                this.showNotification('Score copied to clipboard!');
            } catch (fallbackError) {
                this.showNotification('Share failed - please copy manually');
                console.error('All share methods failed:', fallbackError);
            }
            
            document.body.removeChild(textArea);
        }
    }

    // Show notification message
    showNotification(message, duration = 2000) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            z-index: 1000;
            font-family: 'Courier New', monospace;
            font-size: 14px;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, duration);
    }

    // Toggle mute
    toggleMute() {
        if (this.game.audioManager) {
            const volume = this.game.audioManager.getVolume();
            if (volume > 0) {
                this.game.audioManager.mute();
                this.showNotification('Audio muted (M to unmute)');
            } else {
                this.game.audioManager.unmute();
                this.showNotification('Audio unmuted');
            }
        }
    }

    // Screen shake effect
    screenShake(intensity = 10, duration = 300) {
        const canvas = this.elements.gameCanvas;
        if (!canvas) return;
        
        const originalTransform = canvas.style.transform || '';
        let startTime = performance.now();
        
        const shake = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = elapsed / duration;
            
            if (progress >= 1) {
                canvas.style.transform = originalTransform;
                return;
            }
            
            const shakeAmount = intensity * (1 - progress);
            const x = (Math.random() - 0.5) * shakeAmount;
            const y = (Math.random() - 0.5) * shakeAmount;
            
            canvas.style.transform = `${originalTransform} translate(${x}px, ${y}px)`;
            requestAnimationFrame(shake);
        };
        
        requestAnimationFrame(shake);
    }

    // Flash effect
    flashScreen(color = '#FFFFFF', duration = 100) {
        const flash = document.createElement('div');
        flash.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: ${color};
            opacity: 0.5;
            z-index: 999;
            pointer-events: none;
        `;
        
        document.body.appendChild(flash);
        
        setTimeout(() => {
            if (flash.parentNode) {
                flash.parentNode.removeChild(flash);
            }
        }, duration);
    }

    // LocalStorage helpers
    saveHighScore() {
        try {
            localStorage.setItem('flappyPsyduck_highScore', this.highScore.toString());
        } catch (error) {
            console.warn('Could not save high score:', error);
        }
    }

    loadHighScore() {
        try {
            const saved = localStorage.getItem('flappyPsyduck_highScore');
            return saved ? parseInt(saved, 10) : 0;
        } catch (error) {
            console.warn('Could not load high score:', error);
            return 0;
        }
    }

    shouldShowTutorial() {
        try {
            return !localStorage.getItem('flappyPsyduck_tutorialSeen');
        } catch (error) {
            return true; // Show tutorial if localStorage is not available
        }
    }

    markTutorialSeen() {
        try {
            localStorage.setItem('flappyPsyduck_tutorialSeen', 'true');
        } catch (error) {
            console.warn('Could not save tutorial state:', error);
        }
    }

    isFirstTime() {
        return this.shouldShowTutorial();
    }

    // Get current score
    getScore() {
        return this.score;
    }

    // Get high score
    getHighScore() {
        return this.highScore;
    }

    // Get current screen
    getCurrentScreen() {
        return this.currentScreen;
    }

    // Check if game is in playing state
    isPlaying() {
        return this.currentScreen === 'game';
    }

    // Cleanup
    destroy() {
        // Remove event listeners
        window.removeEventListener('resize', this.resizeCanvas);
        window.removeEventListener('orientationchange', this.resizeCanvas);
        
        // Clear any timeouts/intervals if needed
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { UIManager };
}