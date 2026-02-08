/**
 * Flappy Psyduck - Sprite Generation and Rendering
 * All pixel art sprites are generated programmatically
 */

class SpriteManager {
    constructor() {
        this.sprites = {};
        this.generateAllSprites();
    }

    // Create a canvas for sprite generation
    createCanvas(width, height) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        return { canvas, ctx };
    }

    // Generate all game sprites
    generateAllSprites() {
        this.generatePsyduckSprite();
        this.generateGolduckSprite();
        this.generatePsychicWaveSprite();
        this.generatePowerUpSprite();
        this.generateBackgroundElements();
        this.generateParticles();
    }

    // Generate Psyduck sprite (16x16 pixel art)
    generatePsyduckSprite() {
        const { canvas, ctx } = this.createCanvas(32, 32);
        
        // Colors
        const yellow = '#FFD700';
        const darkYellow = '#DAA520';
        const orange = '#FFA500';
        const black = '#000000';
        const white = '#FFFFFF';
        
        // Psyduck body (simplified pixel art)
        const pixels = [
            [0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0],
            [0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
            [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
            [1,1,1,1,4,4,1,1,1,1,4,4,1,1,1,1],
            [1,1,1,1,5,5,1,1,1,1,5,5,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,3,3,3,3,3,3,1,1,1,1,1],
            [1,1,1,1,1,3,3,3,3,3,3,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
            [0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
            [0,0,0,2,2,1,1,1,1,1,1,2,2,0,0,0],
            [0,0,0,2,2,2,1,1,1,1,2,2,2,0,0,0],
            [0,0,0,0,2,2,0,0,0,0,2,2,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
        ];
        
        const colors = ['transparent', yellow, darkYellow, orange, white, black];
        
        // Draw pixels
        for (let y = 0; y < pixels.length; y++) {
            for (let x = 0; x < pixels[y].length; x++) {
                if (pixels[y][x] > 0) {
                    ctx.fillStyle = colors[pixels[y][x]];
                    ctx.fillRect(x * 2, y * 2, 2, 2);
                }
            }
        }
        
        this.sprites.psyduck = canvas;
        
        // Generate flapping animation frames
        this.generatePsyduckFlap();
    }

    // Generate Psyduck flapping animation
    generatePsyduckFlap() {
        const { canvas, ctx } = this.createCanvas(32, 32);
        
        // Copy base Psyduck
        ctx.drawImage(this.sprites.psyduck, 0, 0);
        
        // Modify for wing flap (simple wing positions)
        ctx.fillStyle = '#DAA520';
        ctx.fillRect(0, 20, 6, 8);  // Left wing up
        ctx.fillRect(26, 20, 6, 8); // Right wing up
        
        this.sprites.psyduckFlap = canvas;
    }

    // Generate Golduck sprite (evolved form)
    generateGolduckSprite() {
        const { canvas, ctx } = this.createCanvas(32, 32);
        
        // Colors for Golduck (blue instead of yellow)
        const blue = '#4169E1';
        const darkBlue = '#1E3A8A';
        const lightBlue = '#87CEEB';
        const red = '#FF0000';
        const black = '#000000';
        const white = '#FFFFFF';
        
        const pixels = [
            [0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0],
            [0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
            [0,1,1,1,4,1,1,1,1,1,1,4,1,1,1,0],
            [1,1,1,1,5,5,1,1,1,1,5,5,1,1,1,1],
            [1,1,1,1,6,6,1,1,1,1,6,6,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
            [0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
            [0,0,0,2,2,1,1,1,1,1,1,2,2,0,0,0],
            [0,0,0,2,2,2,1,1,1,1,2,2,2,0,0,0],
            [0,0,0,0,2,2,0,0,0,0,2,2,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
        ];
        
        const colors = ['transparent', blue, darkBlue, lightBlue, red, white, black];
        
        // Draw pixels
        for (let y = 0; y < pixels.length; y++) {
            for (let x = 0; x < pixels[y].length; x++) {
                if (pixels[y][x] > 0) {
                    ctx.fillStyle = colors[pixels[y][x]];
                    ctx.fillRect(x * 2, y * 2, 2, 2);
                }
            }
        }
        
        // Add glowing effect
        ctx.shadowColor = '#00FFFF';
        ctx.shadowBlur = 4;
        ctx.globalCompositeOperation = 'source-over';
        
        this.sprites.golduck = canvas;
    }

    // Generate psychic wave obstacles
    generatePsychicWaveSprite() {
        const { canvas, ctx } = this.createCanvas(60, 400);
        
        // Create psychic wave pattern
        const gradient = ctx.createLinearGradient(0, 0, 60, 0);
        gradient.addColorStop(0, '#8B008B');
        gradient.addColorStop(0.3, '#DA70D6');
        gradient.addColorStop(0.7, '#BA55D3');
        gradient.addColorStop(1, '#9370DB');
        
        ctx.fillStyle = gradient;
        
        // Draw wavy psychic energy pattern
        ctx.beginPath();
        for (let y = 0; y < 400; y += 2) {
            const wave = Math.sin(y * 0.05) * 10;
            const x = 15 + wave;
            const width = 30 - Math.abs(wave);
            ctx.fillRect(x, y, width, 2);
        }
        
        // Add psychic sparks
        ctx.fillStyle = '#FF69B4';
        for (let i = 0; i < 20; i++) {
            const x = Math.random() * 60;
            const y = Math.random() * 400;
            ctx.fillRect(x, y, 2, 2);
        }
        
        this.sprites.psychicWave = canvas;
    }

    // Generate power-up sprite (evolution crystal)
    generatePowerUpSprite() {
        const { canvas, ctx } = this.createCanvas(20, 20);
        
        // Crystal shape
        const gradient = ctx.createRadialGradient(10, 10, 0, 10, 10, 10);
        gradient.addColorStop(0, '#00FFFF');
        gradient.addColorStop(0.5, '#4169E1');
        gradient.addColorStop(1, '#1E3A8A');
        
        ctx.fillStyle = gradient;
        
        // Draw crystal shape
        ctx.beginPath();
        ctx.moveTo(10, 2);
        ctx.lineTo(18, 8);
        ctx.lineTo(10, 18);
        ctx.lineTo(2, 8);
        ctx.closePath();
        ctx.fill();
        
        // Add inner glow
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        this.sprites.powerUp = canvas;
    }

    // Generate background elements
    generateBackgroundElements() {
        // Clouds
        this.generateClouds();
        // Water ripples
        this.generateWaterRipples();
    }

    generateClouds() {
        const { canvas, ctx } = this.createCanvas(80, 40);
        
        ctx.fillStyle = '#FFFFFF';
        ctx.globalAlpha = 0.8;
        
        // Simple cloud shape
        ctx.beginPath();
        ctx.arc(20, 20, 15, 0, Math.PI * 2);
        ctx.arc(35, 20, 18, 0, Math.PI * 2);
        ctx.arc(50, 20, 15, 0, Math.PI * 2);
        ctx.arc(65, 20, 12, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.globalAlpha = 1;
        this.sprites.cloud = canvas;
    }

    generateWaterRipples() {
        const { canvas, ctx } = this.createCanvas(100, 20);
        
        ctx.strokeStyle = '#4682B4';
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.6;
        
        // Ripple lines
        for (let x = 0; x < 100; x += 10) {
            ctx.beginPath();
            ctx.moveTo(x, 10);
            ctx.lineTo(x + 5, 15);
            ctx.lineTo(x + 10, 10);
            ctx.stroke();
        }
        
        ctx.globalAlpha = 1;
        this.sprites.waterRipple = canvas;
    }

    // Generate particle effects
    generateParticles() {
        // Collision particles
        this.generateCollisionParticles();
        // Evolution particles
        this.generateEvolutionParticles();
    }

    generateCollisionParticles() {
        const particles = [];
        for (let i = 0; i < 3; i++) {
            const { canvas, ctx } = this.createCanvas(8, 8);
            ctx.fillStyle = ['#FF0000', '#FF4500', '#FFD700'][i];
            ctx.fillRect(0, 0, 8, 8);
            particles.push(canvas);
        }
        this.sprites.collisionParticles = particles;
    }

    generateEvolutionParticles() {
        const particles = [];
        for (let i = 0; i < 5; i++) {
            const { canvas, ctx } = this.createCanvas(6, 6);
            ctx.fillStyle = ['#00FFFF', '#4169E1', '#8A2BE2', '#FF69B4', '#FFFFFF'][i];
            ctx.fillRect(0, 0, 6, 6);
            particles.push(canvas);
        }
        this.sprites.evolutionParticles = particles;
    }

    // Render sprite with optional scaling and effects
    renderSprite(ctx, spriteName, x, y, options = {}) {
        if (!this.sprites[spriteName]) {
            console.warn(`Sprite '${spriteName}' not found`);
            return;
        }

        const sprite = this.sprites[spriteName];
        const {
            scale = 1,
            rotation = 0,
            alpha = 1,
            flipX = false,
            flipY = false
        } = options;

        ctx.save();
        
        // Set alpha
        ctx.globalAlpha = alpha;
        
        // Move to position
        ctx.translate(x, y);
        
        // Apply rotation
        if (rotation !== 0) {
            ctx.rotate(rotation);
        }
        
        // Apply scaling and flipping
        const scaleX = flipX ? -scale : scale;
        const scaleY = flipY ? -scale : scale;
        ctx.scale(scaleX, scaleY);
        
        // Draw sprite centered
        ctx.drawImage(sprite, -sprite.width / 2, -sprite.height / 2);
        
        ctx.restore();
    }

    // Get sprite for external use
    getSprite(name) {
        return this.sprites[name];
    }

    // Get sprite dimensions
    getSpriteDimensions(name) {
        if (!this.sprites[name]) return { width: 0, height: 0 };
        return {
            width: this.sprites[name].width,
            height: this.sprites[name].height
        };
    }
}

// Particle System for effects
class ParticleSystem {
    constructor() {
        this.particles = [];
    }

    addParticle(x, y, type = 'collision') {
        const particle = {
            x,
            y,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            life: 1.0,
            decay: 0.02,
            type,
            size: Math.random() * 4 + 2,
            color: this.getParticleColor(type)
        };
        this.particles.push(particle);
    }

    getParticleColor(type) {
        switch (type) {
            case 'collision':
                return ['#FF0000', '#FF4500', '#FFD700'][Math.floor(Math.random() * 3)];
            case 'evolution':
                return ['#00FFFF', '#4169E1', '#8A2BE2', '#FF69B4'][Math.floor(Math.random() * 4)];
            case 'score':
                return '#FFD700';
            default:
                return '#FFFFFF';
        }
    }

    update(deltaTime) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life -= particle.decay;
            
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    render(ctx) {
        this.particles.forEach(particle => {
            ctx.save();
            ctx.globalAlpha = particle.life;
            ctx.fillStyle = particle.color;
            ctx.fillRect(particle.x - particle.size / 2, particle.y - particle.size / 2, particle.size, particle.size);
            ctx.restore();
        });
    }

    clear() {
        this.particles = [];
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SpriteManager, ParticleSystem };
}