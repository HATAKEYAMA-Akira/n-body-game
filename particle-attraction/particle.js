class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.ax = 0;
        this.ay = 0;
        this.mass = 1;
        this.radius = 1.5;
        this.trail = [];
    }

    update(deltaTime) {
        // Update velocity based on acceleration
        this.vx += this.ax * deltaTime;
        this.vy += this.ay * deltaTime;

        // Update position based on velocity
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;

        // Store position in trail
        this.trail.push({ x: this.x, y: this.y });

        // Reset acceleration
        this.ax = 0;
        this.ay = 0;
    }

    applyForce(fx, fy) {
        // F = ma, therefore a = F/m
        this.ax += fx / this.mass;
        this.ay += fy / this.mass;
    }

    attract(other) {
        const dx = other.x - this.x;
        const dy = other.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Prevent extreme forces at very small distances
        const minDistance = 20;
        const actualDistance = Math.max(distance, minDistance);
        
        // Gravitational constant (adjusted for visual effect)
        const G = 100000000;
        
        // Calculate gravitational force: F = G * (m1 * m2) / r^2
        const force = G * (this.mass * other.mass) / (actualDistance * actualDistance);
        
        // Calculate force components
        const fx = force * dx / actualDistance;
        const fy = force * dy / actualDistance;
        
        return { fx, fy };
    }

    draw(ctx) {
        // Draw trail
        if (this.trail.length > 1) {
            ctx.beginPath();
            ctx.moveTo(this.trail[0].x, this.trail[0].y);
            for (let i = 1; i < this.trail.length; i++) {
                ctx.lineTo(this.trail[i].x, this.trail[i].y);
            }
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        // Draw particle
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
    }
}
