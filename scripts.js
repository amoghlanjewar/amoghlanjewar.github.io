// Smooth scrolling for navigation
document.querySelectorAll('.nav-links a').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const sectionId = this.getAttribute('href').substring(1);
        document.getElementById(sectionId).scrollIntoView({ behavior: 'smooth' });
        toggleMenu(); // Close menu on link click
    });
});

// Dark mode toggle
function toggleMode() {
    const body = document.body;
    const button = document.querySelector('.toggle-mode');
    if (body.classList.contains('light-mode')) {
        body.classList.remove('light-mode');
        body.classList.add('dark-mode');
        button.textContent = '☀️';
    } else {
        body.classList.remove('dark-mode');
        body.classList.add('light-mode');
        button.textContent = '🌙';
    }
}

// Mobile menu toggle
function toggleMenu() {
    const navLinks = document.querySelector('.nav-links');
    navLinks.classList.toggle('active');
    console.log('Menu toggled, active:', navLinks.classList.contains('active')); // Debug log
}

// Close menu on outside click
document.addEventListener('click', (e) => {
    const navLinks = document.querySelector('.nav-links');
    const hamburger = document.querySelector('.hamburger');
    if (navLinks.classList.contains('active') && !navLinks.contains(e.target) && !hamburger.contains(e.target)) {
        navLinks.classList.remove('active');
        console.log('Menu closed via outside click'); // Debug log
    }
});

// Animation handling (Intersection Observer for lazy-loading animations)
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.animated');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    animatedElements.forEach(element => {
        observer.observe(element);
    });
});

// Prevent image interaction and check photo loading
document.addEventListener('DOMContentLoaded', () => {
    const profilePhoto = document.querySelector('.profile-photo');
    if (profilePhoto) {
        profilePhoto.addEventListener('contextmenu', (e) => e.preventDefault());
        profilePhoto.addEventListener('dragstart', (e) => e.preventDefault());
        profilePhoto.addEventListener('click', (e) => {
            if (e.button === 1 || e.button === 2) {
                e.preventDefault();
            }
        });
        // Check if photo loads
        profilePhoto.addEventListener('load', () => {
            console.log('Profile photo loaded successfully');
        });
        profilePhoto.addEventListener('error', () => {
            console.error('Failed to load profile photo. Check path: IMG_20211015_213813.jpg');
        });
    } else {
        console.error('Profile photo element not found. Check .profile-photo in index.html');
    }
});

// Physics-based particle simulation
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const particleCount = 150;
    let attractor = { x: null, y: null, active: false };
    let tilt = { x: 0, y: 0 };
    const G = 1000; // Gravitational constant
    const k = 0.05; // Spring constant
    const damping = 0.95;
    const collisionDamping = 0.7;

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 3 + 2;
            this.mass = this.size * 0.5;
            this.vx = Math.random() * 2 - 1;
            this.vy = Math.random() * 2 - 1;
            this.color = Math.random() > 0.5 ? '#1e3a8a' : '#ffedd5';
            this.prevX = this.x;
            this.prevY = this.y;
        }

        update(attractor) {
            let ax = 0, ay = 0;

            // Gravitational and spring force towards attractor
            if (attractor.x !== null && attractor.y !== null) {
                const dx = attractor.x - this.x;
                const dy = attractor.y - this.y;
                const distance = Math.max(10, Math.sqrt(dx * dx + dy * dy));
                const gravity = G * this.mass / (distance * distance);
                const spring = k * distance;
                ax += (dx / distance) * (gravity + spring);
                ay += (dy / distance) * (gravity + spring);
            } else {
                // Fallback: Damped oscillation
                ax += -0.01 * this.x;
                ay += -0.01 * this.y;
            }

            // Particle-particle collisions
            for (let other of particles) {
                if (other === this) continue;
                const dx = other.x - this.x;
                const dy = other.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < this.size + other.size) {
                    const overlap = (this.size + other.size - distance) / 2;
                    const nx = dx / distance;
                    const ny = dy / distance;
                    this.x -= overlap * nx;
                    this.y -= overlap * ny;
                    other.x += overlap * nx;
                    other.y += overlap * ny;
                    const relativeVx = this.vx - other.vx;
                    const relativeVy = this.vy - other.vy;
                    const dot = relativeVx * nx + relativeVy * ny;
                    this.vx -= dot * nx * collisionDamping;
                    this.vy -= dot * ny * collisionDamping;
                    other.vx += dot * nx * collisionDamping;
                    other.vy += dot * ny * collisionDamping;
                }
            }

            // Velocity Verlet integration
            this.vx = (this.vx + ax * 0.016) * damping;
            this.vy = (this.vy + ay * 0.016) * damping;
            this.prevX = this.x;
            this.prevY = this.y;
            this.x += this.vx;
            this.y += this.vy;

            // Edge bouncing
            if (this.x < this.size || this.x > canvas.width - this.size) {
                this.x = Math.max(this.size, Math.min(this.x, canvas.width - this.size));
                this.vx *= -collisionDamping;
            }
            if (this.y < this.size || this.y > canvas.height - this.size) {
                this.y = Math.max(this.size, Math.min(this.y, canvas.height - this.size));
                this.vy *= -collisionDamping;
            }
        }

        draw() {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(this.prevX, this.prevY);
            ctx.lineTo(this.x, this.y);
            ctx.stroke();
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 15;
        }
    }

    function init() {
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.width);
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        const target = isTouchDevice && attractor.active ? attractor : 
                      window.DeviceMotionEvent && !attractor.active ? 
                      { x: canvas.width / 2 + tilt.x * 100, y: canvas.height / 2 + tilt.y * 100 } : 
                      attractor.active ? attractor : { x: null, y: null };
        particles.forEach(particle => {
            particle.update(target);
            particle.draw();
        });
        requestAnimationFrame(animate);
    }

    init();
    animate();

    // Mouse tracking
    let lastUpdate = 0;
    canvas.addEventListener('mousemove', (e) => {
        const now = performance.now();
        if (now - lastUpdate > 16) {
            attractor.x = e.clientX;
            attractor.y = e.clientY;
            attractor.active = true;
            lastUpdate = now;
        }
    });

    canvas.addEventListener('mouseleave', () => {
        attractor.active = false;
    });

    // Touch tracking
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        attractor.x = touch.clientX;
        attractor.y = touch.clientY;
        attractor.active = true;
    }, { passive: false });

    canvas.addEventListener('touchend', () => {
        attractor.active = false;
    });

    // Device motion for mobile (secondary)
    if (window.DeviceMotionEvent) {
        window.addEventListener('devicemotion', (e) => {
            tilt.x = (e.accelerationIncludingGravity.x || 0) / 9.81;
            tilt.y = (e.accelerationIncludingGravity.y || 0) / 9.81;
        });
    }

    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
});
