/**
 * Flappy Psyduck - Main Game Logic
 * Core game mechanics, physics, and game loop
 */

class FlappyPsyduckGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Disable image smoothing for pixel art
        this.ctx.imageSmoothingEnabled = false;
        
        // Game state
        this.gameState = 'waiting'; // waiting, playing, gameOver
        this.gameWidth = 400;
        this.gameHeight = 600;
        this.lastTime = 0;
        this.gameSpeed = 1;
        
        // Initialize systems
        this.spriteManager = new SpriteManager();
        this.particleSystem = new ParticleSystem();
        this.audioManager = createAudioManager();
        this.uiManager = new UIManager(this);
        
        // Game objects
        this.player = null;
        this.obstacles = [];
        this.powerUps = [];
        this.backgroundElements = [];
        
        // Game settings
        this.gravity = 0.6;
        this.jumpVelocity = -12;
        this.obstacleSpeed = 3;
        this.difficultyIncrement = 0.02;
        this.maxSpeed = 6;
        
        // Evolution system
        this.evolutionMode = false;
        this.evolutionTimer = 0;
        this.evolutionDuration = 5000; // 5 seconds
        
        // Obstacle generation
        this.obstacleTimer = 0;
        this.obstacleInterval = 2000; // 2 seconds
        this.minObstacleInterval = 1200; // Minimum 1.2 seconds
        
        // Power-up generation
        this.powerUpTimer = 0;
        this.powerUpInterval = 15000; // 15 seconds
        
        // Background scrolling
        this.backgroundOffset = 0;
        this.backgroundSpeed = 1;
        
        this.initializeGame();
    }

    // Initialize the game
    initializeGame() {
        this.resize(this.uiManager.elements.gameCanvas.clientWidth, this.uiManager.elements.gameCanvas.clientHeight);
        this.createPlayer();
        this.generateBackgroundElements();
        this.bindControls();
        this.startGameLoop();
    }

    // Create the player (Psyduck)
    createPlayer() {
        this.player = {
            x: this.gameWidth * 0.2,
            y: this.gameHeight * 0.4,
            width: 32,
            height: 32,
            velocity: 0,
            rotation: 0,
            isFlapping: false,
            flapTimer: 0,
            evolved: false,
            invulnerable: false
        };
    }

    // Generate background elements
    generateBackgroundElements() {
        this.backgroundElements = [];
        
        // Create clouds
        for (let i = 0; i < 5; i++) {
            this.backgroundElements.push({
                type: 'cloud',
                x: Math.random() * this.gameWidth * 2,
                y: Math.random() * this.gameHeight * 0.3,
                speed: 0.5 + Math.random() * 0.5
            });
        }
        
        // Create water ripples
        for (let i = 0; i < 3; i++) {
            this.backgroundElements.push({
                type: 'waterRipple',
                x: Math.random() * this.gameWidth * 2,
                y: this.gameHeight * 0.8 + Math.random() * 50,
                speed: 0.3 + Math.random() * 0.3
            });
        }
    }

    // Bind input controls
    bindControls() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && this.uiManager.isPlaying()) {
                e.preventDefault();
                this.flap();
            }
        });
        
        // Mouse controls
        this.canvas.addEventListener('click', (e) => {
            if (this.uiManager.isPlaying()) {
                this.flap();
            }
        });
        
        // Touch controls
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (this.uiManager.isPlaying()) {
                this.flap();
            }
        });
    }

    // Player flap action
    flap() {
        if (this.gameState === 'playing') {
            this.player.velocity = this.jumpVelocity;
            this.player.isFlapping = true;
            this.player.flapTimer = 200; // Flap animation duration
            
            // Play flap sound
            this.audioManager.playSound('flap');
        }
    }

    // Start the game
    start() {
        this.gameState = 'playing';
        this.resetGameObjects();
    }

    // Reset game objects for new game
    resetGameObjects() {
        this.player.y = this.gameHeight * 0.4;
        this.player.velocity = 0;
        this.player.rotation = 0;
        this.player.evolved = false;
        this.player.invulnerable = false;
        
        this.obstacles = [];
        this.powerUps = [];
        this.particleSystem.clear();
        
        this.evolutionMode = false;
        this.evolutionTimer = 0;
        this.obstacleTimer = 0;
        this.powerUpTimer = 0;
        this.gameSpeed = 1;
        
        this.uiManager.hideEvolutionIndicator();
    }

    // Main game loop
    gameLoop(currentTime) {
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        // Update game
        this.update(deltaTime);
        
        // Render game
        this.render();
        
        // Continue loop
        requestAnimationFrame((time) => this.gameLoop(time));
    }

    // Start the game loop
    startGameLoop() {
        requestAnimationFrame((time) => {
            this.lastTime = time;
            this.gameLoop(time);
        });
    }

    // Update game logic
    update(deltaTime) {
        if (this.gameState !== 'playing') return;
        
        // Update player
        this.updatePlayer(deltaTime);
        
        // Update obstacles
        this.updateObstacles(deltaTime);
        
        // Update power-ups
        this.updatePowerUps(deltaTime);
        
        // Update background
        this.updateBackground(deltaTime);
        
        // Update particle system
        this.particleSystem.update(deltaTime);
        
        // Update evolution mode
        this.updateEvolution(deltaTime);
        
        // Generate new obstacles and power-ups
        this.generateGameObjects(deltaTime);
        
        // Check collisions
        this.checkCollisions();
        
        // Increase difficulty over time
        this.updateDifficulty();
    }

    // Update player physics and animation
    updatePlayer(deltaTime) {
        const player = this.player;
        
        // Apply gravity
        player.velocity += this.gravity * this.gameSpeed;
        
        // Update position
        player.y += player.velocity * this.gameSpeed;
        
        // Update rotation based on velocity
        player.rotation = Math.max(-Math.PI / 6, Math.min(Math.PI / 3, player.velocity * 0.05));
        
        // Update flap animation
        if (player.flapTimer > 0) {
            player.flapTimer -= deltaTime;
            if (player.flapTimer <= 0) {
                player.isFlapping = false;
            }
        }
        
        // Check boundaries
        if (player.y < 0) {
            player.y = 0;
            player.velocity = 0;
        }
        
        if (player.y + player.height > this.gameHeight) {
            this.gameOver();
        }
    }

    // Update obstacles
    updateObstacles(deltaTime) {
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obstacle = this.obstacles[i];
            
            // Move obstacle
            obstacle.x -= this.obstacleSpeed * this.gameSpeed;
            
            // Check if obstacle passed player (score point)
            if (!obstacle.scored && obstacle.x + obstacle.width < this.player.x) {
                obstacle.scored = true;
                this.uiManager.addScore(1);
                
                // Add score particles
                this.particleSystem.addParticle(
                    obstacle.x + obstacle.width / 2,
                    obstacle.y + obstacle.height / 2,
                    'score'
                );
            }
            
            // Remove off-screen obstacles
            if (obstacle.x + obstacle.width < 0) {
                this.obstacles.splice(i, 1);
            }
        }
    }

    // Update power-ups
    updatePowerUps(deltaTime) {
        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            const powerUp = this.powerUps[i];
            
            // Move power-up
            powerUp.x -= this.obstacleSpeed * this.gameSpeed * 0.8;
            
            // Floating animation
            powerUp.y += Math.sin(powerUp.floatPhase) * 0.5;
            powerUp.floatPhase += 0.05;
            
            // Rotation animation
            powerUp.rotation += 0.05;
            
            // Remove off-screen power-ups
            if (powerUp.x + powerUp.width < 0) {
                this.powerUps.splice(i, 1);
            }
        }
    }

    // Update background elements
    updateBackground(deltaTime) {
        this.backgroundOffset += this.backgroundSpeed * this.gameSpeed;
        
        this.backgroundElements.forEach(element => {
            element.x -= element.speed * this.gameSpeed;
            
            // Reset position when off-screen
            if (element.x + 100 < 0) {
                element.x = this.gameWidth + Math.random() * 200;
            }
        });
    }

    // Update evolution mode
    updateEvolution(deltaTime) {
        if (this.evolutionMode) {
            this.evolutionTimer += deltaTime;
            
            if (this.evolutionTimer >= this.evolutionDuration) {
                this.endEvolution();
            }
        }
    }

    // Generate obstacles and power-ups
    generateGameObjects(deltaTime) {
        // Generate obstacles
        this.obstacleTimer += deltaTime;
        if (this.obstacleTimer >= this.obstacleInterval) {
            this.createObstacle();
            this.obstacleTimer = 0;
        }
        
        // Generate power-ups
        this.powerUpTimer += deltaTime;
        if (this.powerUpTimer >= this.powerUpInterval) {
            this.createPowerUp();
            this.powerUpTimer = 0;
        }
    }

    // Create a new obstacle (psychic wave)
    createObstacle() {
        const gapHeight = 200;
        const minObstacleHeight = 50;
        const maxObstacleHeight = this.gameHeight - gapHeight - minObstacleHeight;
        
        const topHeight = minObstacleHeight + Math.random() * (maxObstacleHeight - minObstacleHeight);
        const bottomHeight = this.gameHeight - topHeight - gapHeight;
        
        // Top obstacle
        this.obstacles.push({
            x: this.gameWidth,
            y: 0,
            width: 60,
            height: topHeight,
            type: 'psychicWave',
            scored: false
        });
        
        // Bottom obstacle
        this.obstacles.push({
            x: this.gameWidth,
            y: this.gameHeight - bottomHeight,
            width: 60,
            height: bottomHeight,
            type: 'psychicWave',
            scored: false
        });
    }

    // Create a power-up
    createPowerUp() {
        this.powerUps.push({
            x: this.gameWidth,
            y: 100 + Math.random() * (this.gameHeight - 200),
            width: 20,
            height: 20,
            type: 'evolution',
            floatPhase: 0,
            rotation: 0
        });
    }

    // Check collisions
    checkCollisions() {
        if (this.player.invulnerable) return;
        
        // Check obstacle collisions
        this.obstacles.forEach(obstacle => {
            if (this.isColliding(this.player, obstacle)) {
                if (!this.evolutionMode) {
                    this.gameOver();
                } else {
                    // In evolution mode, destroy the obstacle instead
                    this.destroyObstacle(obstacle);
                }
            }
        });
        
        // Check power-up collisions
        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            const powerUp = this.powerUps[i];
            if (this.isColliding(this.player, powerUp)) {
                this.collectPowerUp(powerUp);
                this.powerUps.splice(i, 1);
            }
        }
    }

    // Check if two objects are colliding
    isColliding(obj1, obj2) {
        return obj1.x < obj2.x + obj2.width &&
               obj1.x + obj1.width > obj2.x &&
               obj1.y < obj2.y + obj2.height &&
               obj1.y + obj1.height > obj2.y;
    }

    // Collect power-up
    collectPowerUp(powerUp) {
        if (powerUp.type === 'evolution') {
            this.startEvolution();
        }
        
        // Add evolution particles
        for (let i = 0; i < 10; i++) {
            this.particleSystem.addParticle(
                powerUp.x + powerUp.width / 2,
                powerUp.y + powerUp.height / 2,
                'evolution'
            );
        }
        
        // Play evolution sound
        this.audioManager.playSound('evolution');
        
        // Flash effect
        this.uiManager.flashScreen('#00FFFF', 200);
    }

    // Start evolution mode
    startEvolution() {
        this.evolutionMode = true;
        this.evolutionTimer = 0;
        this.player.evolved = true;
        this.player.invulnerable = true;
        
        this.uiManager.showEvolutionIndicator();
        
        // Auto-collect points during evolution
        this.evolutionScoreInterval = setInterval(() => {
            if (this.evolutionMode) {
                this.uiManager.addScore(1);
            }
        }, 500);
    }

    // End evolution mode
    endEvolution() {
        this.evolutionMode = false;
        this.player.evolved = false;
        this.player.invulnerable = false;
        
        this.uiManager.hideEvolutionIndicator();
        
        if (this.evolutionScoreInterval) {
            clearInterval(this.evolutionScoreInterval);
            this.evolutionScoreInterval = null;
        }
    }

    // Destroy obstacle (during evolution)
    destroyObstacle(obstacle) {
        const index = this.obstacles.indexOf(obstacle);
        if (index > -1) {
            this.obstacles.splice(index, 1);
            
            // Add destruction particles
            for (let i = 0; i < 5; i++) {
                this.particleSystem.addParticle(
                    obstacle.x + obstacle.width / 2,
                    obstacle.y + obstacle.height / 2,
                    'collision'
                );
            }
        }
    }

    // Update difficulty
    updateDifficulty() {
        // Increase speed gradually
        this.gameSpeed = Math.min(this.maxSpeed, 1 + this.uiManager.getScore() * this.difficultyIncrement);
        
        // Decrease obstacle interval
        const currentInterval = Math.max(this.minObstacleInterval, this.obstacleInterval - (this.uiManager.getScore() * 50));
        this.obstacleInterval = currentInterval;
    }

    // Game over
    gameOver() {
        this.gameState = 'gameOver';
        this.endEvolution();
        
        // Screen shake effect
        this.uiManager.screenShake(15, 500);
        
        // Add collision particles
        for (let i = 0; i < 15; i++) {
            this.particleSystem.addParticle(
                this.player.x + this.player.width / 2,
                this.player.y + this.player.height / 2,
                'collision'
            );
        }
        
        // Show game over screen
        this.uiManager.gameOver();
    }

    // Render the game
    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.gameWidth, this.gameHeight);
        
        // Render background
        this.renderBackground();
        
        // Render game objects
        if (this.gameState === 'playing') {
            this.renderObstacles();
            this.renderPowerUps();
            this.renderPlayer();
        }
        
        // Render particle effects
        this.particleSystem.render(this.ctx);
    }

    // Render background
    renderBackground() {
        // Create gradient background
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.gameHeight);
        gradient.addColorStop(0, '#87CEEB'); // Sky blue
        gradient.addColorStop(0.5, '#4682B4'); // Steel blue
        gradient.addColorStop(1, '#2E8B57'); // Sea green
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.gameWidth, this.gameHeight);
        
        // Render background elements
        this.backgroundElements.forEach(element => {
            this.spriteManager.renderSprite(
                this.ctx,
                element.type,
                element.x,
                element.y,
                { alpha: 0.6 }
            );
        });
        
        // Render scrolling water pattern at bottom
        this.ctx.save();
        this.ctx.globalAlpha = 0.3;
        this.ctx.fillStyle = '#4682B4';
        
        for (let x = -50; x < this.gameWidth + 50; x += 20) {
            const waveOffset = Math.sin((x + this.backgroundOffset) * 0.02) * 5;
            this.ctx.fillRect(x, this.gameHeight - 30 + waveOffset, 15, 30);
        }
        
        this.ctx.restore();
    }

    // Render obstacles
    renderObstacles() {
        this.obstacles.forEach(obstacle => {
            // Render psychic wave pattern
            this.ctx.save();
            
            // Create pulsing effect
            const pulse = Math.sin(Date.now() * 0.01) * 0.1 + 0.9;
            this.ctx.globalAlpha = pulse;
            
            // Render obstacle sprite
            this.spriteManager.renderSprite(
                this.ctx,
                'psychicWave',
                obstacle.x + obstacle.width / 2,
                obstacle.y + obstacle.height / 2,
                { scale: obstacle.height / 400 } // Scale to fit height
            );
            
            this.ctx.restore();
        });
    }

    // Render power-ups
    renderPowerUps() {
        this.powerUps.forEach(powerUp => {
            this.spriteManager.renderSprite(
                this.ctx,
                'powerUp',
                powerUp.x + powerUp.width / 2,
                powerUp.y + powerUp.height / 2,
                { 
                    rotation: powerUp.rotation,
                    scale: 1 + Math.sin(powerUp.floatPhase * 2) * 0.2
                }
            );
        });
    }

    // Render player
    renderPlayer() {
        const spriteName = this.player.evolved ? 'golduck' : 
                          this.player.isFlapping ? 'psyduckFlap' : 'psyduck';
        
        const options = {
            rotation: this.player.rotation,
            alpha: this.player.invulnerable ? 0.7 : 1.0
        };
        
        // Add glow effect during evolution
        if (this.player.evolved) {
            this.ctx.save();
            this.ctx.shadowColor = '#00FFFF';
            this.ctx.shadowBlur = 10;
        }
        
        this.spriteManager.renderSprite(
            this.ctx,
            spriteName,
            this.player.x + this.player.width / 2,
            this.player.y + this.player.height / 2,
            options
        );
        
        if (this.player.evolved) {
            this.ctx.restore();
        }
    }

    // Resize game
    resize(width, height) {
        this.gameWidth = width;
        this.gameHeight = height;
        
        // Update canvas size
        this.canvas.width = width;
        this.canvas.height = height;
        
        // Re-disable image smoothing after resize
        this.ctx.imageSmoothingEnabled = false;
        
        // Recreate player if it exists
        if (this.player) {
            this.player.x = this.gameWidth * 0.2;
        }
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.flappyPsyduckGame = new FlappyPsyduckGame();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { FlappyPsyduckGame };
}