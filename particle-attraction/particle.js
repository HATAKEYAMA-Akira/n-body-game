class Particle {
    constructor(x, y, options = {}) {
        this.x = x;
        this.y = y;
        this.vx = options.vx || 0;
        this.vy = options.vy || 0;
        this.ax = 0;
        this.ay = 0;
        this.mass = options.mass || 1;
        // Size hierarchy: regular particles < planets < sun
        this.radius = options.isSun ? 4 : (options.isPlanet ? 2.5 : 1);
        this.trail = [];
        this.maxTrailPoints = 3000; // Increased for smoother trails
        this.orbitRadius = options.orbitRadius;
        this.orbitSpeed = options.orbitSpeed;
        this.orbitCenter = options.orbitCenter;
        this.isOrbiting = Boolean(this.orbitRadius && this.orbitSpeed && this.orbitCenter);
        this.isSun = options.isSun || false;
        this.isPlanet = options.isPlanet || false;
        this.orbitAngle = options.orbitAngle || Math.random() * Math.PI * 2;
        
        if (this.isOrbiting) {
            // Set initial position based on orbit
            this.x = this.orbitCenter.x + Math.cos(this.orbitAngle) * this.orbitRadius;
            this.y = this.orbitCenter.y + Math.sin(this.orbitAngle) * this.orbitRadius;
            
            // Calculate orbital velocity for perfect circular motion
            const speed = Math.sqrt((this.orbitCenter.mass * 1000 * this.orbitSpeed) / this.orbitRadius);
            this.vx = -Math.sin(this.orbitAngle) * speed;
            this.vy = Math.cos(this.orbitAngle) * speed;
        }
    }

    update(deltaTime) {
        if (this.isOrbiting) {
            // Update orbit angle
            this.orbitAngle += (Math.sqrt((this.orbitCenter.mass * 1000 * this.orbitSpeed) / this.orbitRadius) / this.orbitRadius) * deltaTime;
            
            // Update position to maintain perfect circular orbit
            this.x = this.orbitCenter.x + Math.cos(this.orbitAngle) * this.orbitRadius;
            this.y = this.orbitCenter.y + Math.sin(this.orbitAngle) * this.orbitRadius;
            
            // Update velocity direction
            const speed = Math.sqrt((this.orbitCenter.mass * 1000 * this.orbitSpeed) / this.orbitRadius);
            this.vx = -Math.sin(this.orbitAngle) * speed;
            this.vy = Math.cos(this.orbitAngle) * speed;
        } else {
            // Regular particle motion
            this.vx += this.ax * deltaTime;
            this.vy += this.ay * deltaTime;
            this.x += this.vx * deltaTime;
            this.y += this.vy * deltaTime;
        }

        // Store position in trail with interpolation
        if (this.trail.length === 0) {
            this.trail.push({ x: this.x, y: this.y });
        } else {
            const last = this.trail[this.trail.length - 1];
            const dx = this.x - last.x;
            const dy = this.y - last.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Add interpolated points if distance is too large
            if (distance > 0.5) { // Reduced for smoother trails
                const steps = Math.ceil(distance * 2); // Increased interpolation steps
                for (let i = 1; i <= steps; i++) {
                    const t = i / steps;
                    this.trail.push({
                        x: last.x + dx * t,
                        y: last.y + dy * t
                    });
                }
            } else {
                this.trail.push({ x: this.x, y: this.y });
            }
        }

        // Limit trail length
        if (this.trail.length > this.maxTrailPoints) {
            this.trail = this.trail.slice(-this.maxTrailPoints);
        }

        // Reset acceleration
        this.ax = 0;
        this.ay = 0;
    }

    applyForce(fx, fy) {
        if (!this.isSun && !this.isOrbiting) {
            // Only regular particles are affected by forces
            this.ax += fx / this.mass;
            this.ay += fy / this.mass;
        }
    }

    attract(other, G) {
        // Skip gravitational calculations between planets or with the sun
        if (this.isSun || other.isSun || (this.isPlanet && other.isPlanet)) {
            return { fx: 0, fy: 0 };
        }

        const dx = other.x - this.x;
        const dy = other.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        const minDistance = 20;
        const actualDistance = Math.max(distance, minDistance);
        
        // Increase gravitational effect if either particle is a planet
        const gravitationalMultiplier = (this.isPlanet || other.isPlanet) ? 5 : 1;
        const force = G * gravitationalMultiplier * (this.mass * other.mass) / (actualDistance * actualDistance);
        
        const fx = force * dx / actualDistance;
        const fy = force * dy / actualDistance;
        
        return { fx, fy };
    }

    draw(ctx, showTrails = true) {
        // Draw orbit circle if it's an orbiting particle
        if (this.isOrbiting && showTrails) {
            ctx.beginPath();
            ctx.arc(this.orbitCenter.x, this.orbitCenter.y, this.orbitRadius, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.lineWidth = 0.5;
            ctx.stroke();
        }

        // Draw trail
        if (showTrails && this.trail.length > 1) {
            ctx.beginPath();
            ctx.moveTo(this.trail[0].x, this.trail[0].y);
            
            // Use quadratic curves for smooth lines
            for (let i = 1; i < this.trail.length - 1; i++) {
                const xc = (this.trail[i].x + this.trail[i + 1].x) / 2;
                const yc = (this.trail[i].y + this.trail[i + 1].y) / 2;
                ctx.quadraticCurveTo(this.trail[i].x, this.trail[i].y, xc, yc);
            }
            
            // Connect to the last point
            if (this.trail.length > 1) {
                const last = this.trail[this.trail.length - 1];
                ctx.lineTo(last.x, last.y);
            }
            
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 0.5;
            ctx.stroke();
        }

        // Draw particle
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
    }
}
