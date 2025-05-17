// Smooth scrolling for navigation
document.querySelectorAll('.nav-links a').forEach(anchor => {
    anchor.addEventListener('click', e => {
        e.preventDefault();
        const sectionId = anchor.getAttribute('href').substring(1);
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    });
});

// Dark mode toggle
function toggleMode() {
    const body = document.body;
    const button = document.querySelector('.toggle-mode');
    if (body.classList.contains('light-mode')) {
        body.classList.replace('light-mode', 'dark-mode');
        button.textContent = '☀️';
    } else {
        body.classList.replace('dark-mode', 'light-mode');
        button.textContent = '🌙';
    }
}

// Intersection Observer for animations
document.addEventListener('DOMContentLoaded', () => {
    const animated = document.querySelectorAll('.animated');
    const obs = new IntersectionObserver((ents) => {
        ents.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('visible');
                obs.unobserve(e.target);
            }
        });
    }, { threshold: 0.1 });
    animated.forEach(el => obs.observe(el));
});

// Prevent interaction with profile photo
document.addEventListener('DOMContentLoaded', () => {
    const photo = document.querySelector('.profile-photo');
    if (photo) {
        ['contextmenu', 'dragstart', 'mousedown'].forEach(evt => {
            photo.addEventListener(evt, e => e.preventDefault());
        });
    }
});

// Particle simulation
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('particle-canvas');
    const ctx = canvas.getContext('2d');
    resizeCanvas();

    // Re-resize on window changes
    window.addEventListener('resize', resizeCanvas);
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    	const particles = [];
	const N = 250;              // 🚀 Number of particles (Heavy GPU/CPU)
	const G = 16000;             // 🧲 Strong gravitational pull
	const k = 0.25;              // 🔗 Strong spring force (elasticity)
	const damping = 0.95;        // 💨 Lower damping = more motion, less friction
	const colDamp = 0.95;        // 🪨 Almost elastic collisions


    const attractor = { x: null, y: null, active: false };

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 1.5;
            this.vy = (Math.random() - 0.5) * 1.5;
            this.size = Math.random() * 3 + 2;
            this.mass = this.size * 0.3;
            this.color = Math.random() > 0.5 ? '#1e3a8a' : '#ffedd5';
            this.prevX = this.x;
            this.prevY = this.y;
        }

        update() {
            let ax = 0, ay = 0;
            if (attractor.active) {
                const dx = attractor.x - this.x;
                const dy = attractor.y - this.y;
                const dist2 = dx*dx + dy*dy;
                const dist = Math.sqrt(dist2) + 0.1;
                const force = (G * this.mass / dist2) + (k * dist);
                ax = (dx / dist) * force;
                ay = (dy / dist) * force;
            } else {
                // gentle drift toward center if no attractor
                ax = (canvas.width / 2 - this.x) * 0.0005;
                ay = (canvas.height / 2 - this.y) * 0.0005;
            }

            // collisions
            for (let o of particles) {
                if (o === this) continue;
                const dx = o.x - this.x;
                const dy = o.y - this.y;
                const d = Math.hypot(dx, dy) || 1;
                if (d < this.size + o.size) {
                    const nx = dx / d, ny = dy / d;
                    const overlap = (this.size + o.size - d) / 2;
                    this.x -= nx * overlap;
                    this.y -= ny * overlap;
                    o.x   += nx * overlap;
                    o.y   += ny * overlap;
                    const rvx = this.vx - o.vx, rvy = this.vy - o.vy;
                    const dot = rvx * nx + rvy * ny;
                    const imp = dot * colDamp;
                    this.vx -= imp * nx;
                    this.vy -= imp * ny;
                    o.vx   += imp * nx;
                    o.vy   += imp * ny;
                }
            }

            this.vx = (this.vx + ax * 0.016) * damping;
            this.vy = (this.vy + ay * 0.016) * damping;

            this.prevX = this.x;
            this.prevY = this.y;
            this.x += this.vx;
            this.y += this.vy;

            // boundary bounce
            if (this.x < this.size) { this.x = this.size; this.vx *= -colDamp; }
            if (this.x > canvas.width - this.size) {
                this.x = canvas.width - this.size; this.vx *= -colDamp;
            }
            if (this.y < this.size) { this.y = this.size; this.vy *= -colDamp; }
            if (this.y > canvas.height - this.size) {
                this.y = canvas.height - this.size; this.vy *= -colDamp;
            }
        }

        draw() {
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 20; // 🔥 Strong glow
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 0.3;
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(this.prevX, this.prevY);
    ctx.lineTo(this.x, this.y);
    ctx.stroke();
    ctx.globalAlpha = 1;
		}

    }

    // initialize particles
    for (let i = 0; i < N; i++) particles.push(new Particle());

    // listen globally so canvas z-index doesn't block us
    window.addEventListener('pointermove', e => {
        attractor.x = e.clientX;
        attractor.y = e.clientY;
        attractor.active = true;
    });
    window.addEventListener('pointerleave', () => {
        attractor.active = false;
    });

    // main loop
    (function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        requestAnimationFrame(animate);
    })();
});
