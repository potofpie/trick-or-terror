import { SparkleParticle } from '../types/interfaces';

export class ParticleSystem {
    private particles: SparkleParticle[] = [];

    update(deltaMultiplier: number): void {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];

            particle.x += particle.vx * deltaMultiplier;
            particle.y += particle.vy * deltaMultiplier;
            particle.vy += 0.1 * deltaMultiplier; // Gravity
            particle.life -= deltaMultiplier;

            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    render(ctx: CanvasRenderingContext2D): void {
        for (const particle of this.particles) {
            const alpha = particle.life / particle.maxLife;
            const size = particle.size * alpha;

            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = particle.color;
            ctx.fillRect(particle.x - size / 2, particle.y - size / 2, size, size);
            ctx.restore();
        }
    }

    emit(x: number, y: number, colors: string[], count: number = 8): void {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count;
            const speed = 1 + Math.random() * 2;
            this.particles.push({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 1,
                life: 30 + Math.random() * 20,
                maxLife: 30 + Math.random() * 20,
                color: colors[Math.floor(Math.random() * colors.length)],
                size: 1 + Math.random() * 2
            });
        }
    }

    clear(): void {
        this.particles = [];
    }

    getParticles(): SparkleParticle[] {
        return this.particles;
    }
}

