class ParticleSystem {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d', { alpha: false }); // Optimize for non-transparent canvas
        this.particles = [];
        this.lastTime = 0;
        
        // UI Elements
        this.particleCountElement = document.getElementById('particleCount');
        this.resetButton = document.getElementById('resetBtn');
        this.showTrailsCheckbox = document.getElementById('showTrails');
        this.gravityConstantSlider = document.getElementById('gravityConstant');
        this.gravityValueDisplay = document.getElementById('gravityValue');
        this.solarSystemButton = document.getElementById('solarSystemBtn');
        this.screenshotButton = document.getElementById('screenshotBtn');
        
        // Settings
        this.showTrails = true;
        this.gravityConstant = 1000;
        
        this.setupCanvas();
        this.setupEventListeners();
        this.animate();
    }

    setupCanvas() {
        this.resizeCanvas();
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        // Enable image smoothing for better quality
        this.ctx.imageSmoothingEnabled = true;
        this.ctx.imageSmoothingQuality = 'high';
    }

    setupEventListeners() {
        window.addEventListener('resize', () => this.resizeCanvas());
        
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            this.addParticle(x, y);
        });

        this.resetButton.addEventListener('click', () => this.reset());
        this.showTrailsCheckbox.addEventListener('change', (e) => {
            this.showTrails = e.target.checked;
            if (!this.showTrails) {
                this.ctx.fillStyle = '#000000';
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            }
        });

        this.gravityConstantSlider.addEventListener('input', (e) => {
            // Convert logarithmic scale to actual value (10^x)
            const value = Math.pow(10, parseFloat(e.target.value));
            this.gravityConstant = value;
            this.gravityValueDisplay.textContent = Math.round(value);
        });

        this.solarSystemButton.addEventListener('click', () => this.setupSolarSystem());
        this.screenshotButton.addEventListener('click', () => this.takeScreenshot());
    }

    setupSolarSystem() {
        this.reset();
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const scale = Math.min(this.canvas.width, this.canvas.height) / 8;

        // Create Sun at center
        const sun = new Particle(centerX, centerY, {
            mass: 1000,
            isSun: true
        });

        // Planet data: [distance from sun (AU), orbital period (years)]
        const planets = [
            { name: 'Mercury', distance: 0.4, period: 0.24 },
            { name: 'Venus', distance: 0.7, period: 0.62 },
            { name: 'Earth', distance: 1.0, period: 1.0 },
            { name: 'Mars', distance: 1.5, period: 1.88 },
            { name: 'Jupiter', distance: 5.2, period: 11.86 },
            { name: 'Saturn', distance: 9.5, period: 29.46 }
        ];

        this.particles.push(sun);

        planets.forEach(planet => {
            const orbitRadius = planet.distance * scale;
            this.particles.push(new Particle(0, 0, {
                mass: 50, // Increased mass for stronger gravitational effect
                orbitRadius: orbitRadius,
                orbitSpeed: 1 / planet.period,
                orbitCenter: sun,
                isPlanet: true
            }));
        });

        this.updateParticleCount();
    }

    takeScreenshot() {
        const date = new Date();
        const filename = `screenshot_${date.getFullYear()}${(date.getMonth()+1).toString().padStart(2,'0')}${date.getDate().toString().padStart(2,'0')}_${date.getHours().toString().padStart(2,'0')}${date.getMinutes().toString().padStart(2,'0')}${date.getSeconds().toString().padStart(2,'0')}.png`;
        
        // Convert canvas to blob
        this.canvas.toBlob((blob) => {
            // Create a temporary link element
            const link = document.createElement('a');
            link.download = `output/${filename}`;
            link.href = URL.createObjectURL(blob);
            
            // Programmatically click the link to trigger download
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Clean up the URL object
            URL.revokeObjectURL(link.href);
        }, 'image/png');
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        if (this.showTrails) {
            this.particles.forEach(particle => particle.draw(this.ctx, true));
        }
    }

    addParticle(x, y) {
        this.particles.push(new Particle(x, y));
        this.updateParticleCount();
    }

    reset() {
        this.particles = [];
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.updateParticleCount();
    }

    updateParticleCount() {
        this.particleCountElement.textContent = `Particles: ${this.particles.length}`;
    }

    update(deltaTime) {
        // Calculate forces between all particles
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const forces = this.particles[i].attract(this.particles[j], this.gravityConstant);
                this.particles[i].applyForce(forces.fx, forces.fy);
                this.particles[j].applyForce(-forces.fx, -forces.fy);
            }
        }

        // Update particle positions
        this.particles.forEach(particle => particle.update(deltaTime));
    }

    draw() {
        if (!this.showTrails) {
            this.ctx.fillStyle = '#000000';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }

        this.particles.forEach(particle => {
            particle.draw(this.ctx, this.showTrails);
        });
    }

    animate(currentTime = 0) {
        const deltaTime = Math.min((currentTime - this.lastTime) / 1000, 1/30);
        this.lastTime = currentTime;

        this.update(deltaTime);
        this.draw();

        requestAnimationFrame((time) => this.animate(time));
    }
}

window.addEventListener('load', () => {
    new ParticleSystem();
});
