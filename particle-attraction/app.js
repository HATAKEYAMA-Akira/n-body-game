class ParticleSystem {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.lastTime = 0;
        this.particleCountElement = document.getElementById('particleCount');
        this.resetButton = document.getElementById('resetBtn');
        
        this.setupCanvas();
        this.setupEventListeners();
        this.animate();
    }

    setupCanvas() {
        // Set canvas size to window size
        this.resizeCanvas();
        // Initial background
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    setupEventListeners() {
        // Handle window resize
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Handle clicks to add particles
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            this.addParticle(x, y);
        });

        // Handle reset button
        this.resetButton.addEventListener('click', () => this.reset());
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        // Redraw background after resize
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        // Redraw all particle trails
        this.particles.forEach(particle => particle.draw(this.ctx));
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
                const forces = this.particles[i].attract(this.particles[j]);
                
                // Apply forces to both particles (action-reaction)
                this.particles[i].applyForce(forces.fx, forces.fy);
                this.particles[j].applyForce(-forces.fx, -forces.fy);
            }
        }

        // Update particle positions
        this.particles.forEach(particle => particle.update(deltaTime));
    }

    draw() {
        // Draw new particle positions
        this.particles.forEach(particle => {
            particle.draw(this.ctx);
        });
    }

    animate(currentTime = 0) {
        // Calculate delta time in seconds
        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;

        if (deltaTime < 0.1) { // Skip large time gaps
            this.update(deltaTime);
            this.draw();
        }

        requestAnimationFrame((time) => this.animate(time));
    }
}

// Start the application when the window loads
window.addEventListener('load', () => {
    new ParticleSystem();
});
