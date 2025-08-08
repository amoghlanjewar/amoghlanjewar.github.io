// Enhanced GPU Particle System using PIXI.js - INTERCONNECTED SPRING-WEB PATTERN

document.addEventListener('DOMContentLoaded', () => {
    // --- Application Setup ---
    const app = new PIXI.Application({
        resizeTo: window,
        backgroundAlpha: 0,
        antialias: true,
    });
    app.view.style.position = 'fixed';
    app.view.style.top = '0';
    app.view.style.left = '0';
    app.view.style.zIndex = '-1';
    document.body.appendChild(app.view);

    // --- Configuration & Physics Parameters ---
    const isMobile = window.innerWidth < 768;
    const particleCount = isMobile ? 100 : 200; // Reduced for performance due to higher complexity
    const particles = [];
    const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

    // Mouse interaction
    let repelActive = false;
    const mouseForce = 8000;
    const drag = 0.90; // Higher drag for stability

    // NEW: Spring physics parameters
    const springConstant = 0.001; // How "stiff" the connections are
    const restLength = isMobile ? 80 : 120; // The ideal distance for the springs
    const connectionRadius = isMobile ? 100 : 150; // How close particles must be to connect

    // --- Graphics Setup ---
    // We use a regular Container because ParticleContainer doesn't support line drawing.
    const particleContainer = new PIXI.Container();
    app.stage.addChild(particleContainer);

    // A separate graphics object for drawing the connecting lines
    const lineGraphics = new PIXI.Graphics();
    app.stage.addChild(lineGraphics);


    // --- Particle Aesthetics (Unchanged) ---
    const lightModeColors = [0x1e3a8a, 0x3b82f6, 0x60a5fa];
    const darkModeColors = [0x93c5fd, 0x60a5fa, 0xffedd5];

    function createGlowTexture(color) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        const size = 32;
        const glowRadius = size / 2;
        canvas.width = size;
        canvas.height = size;
        const gradient = context.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, glowRadius);
        const r = (color >> 16) & 0xFF, g = (color >> 8) & 0xFF, b = color & 0xFF;
        gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.9)`);
        gradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, 0.4)`);
        gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
        context.fillStyle = gradient;
        context.fillRect(0, 0, size, size);
        return PIXI.Texture.from(canvas);
    }

    function createParticles() {
        particleContainer.removeChildren();
        particles.length = 0;
        const isDarkMode = document.body.classList.contains('dark-mode');
        const colors = isDarkMode ? darkModeColors : lightModeColors;
        const textures = colors.map(createGlowTexture);

        for (let i = 0; i < particleCount; i++) {
            const texture = textures[i % textures.length];
            const sprite = new PIXI.Sprite(texture);
            sprite.x = Math.random() * app.screen.width;
            sprite.y = Math.random() * app.screen.height;
            sprite.vx = 0;
            sprite.vy = 0;
            sprite.scale.set(Math.random() * 0.5 + 0.3);
            sprite.anchor.set(0.5);
            particleContainer.addChild(sprite);
            particles.push(sprite);
        }
    }

    // --- Event Listeners (Unchanged from Repel pattern) ---
    window.addEventListener('pointermove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
    window.addEventListener('pointerdown', () => { repelActive = true; });
    window.addEventListener('pointerup', () => { repelActive = false; });
    const toggleButton = document.querySelector('.toggle-mode');
    if (toggleButton) {
        toggleButton.addEventListener('click', () => setTimeout(createParticles, 50));
    }

    // --- Animation Loop ---
    app.ticker.add(() => {
        // Clear previous lines
        lineGraphics.clear();
        const isDarkMode = document.body.classList.contains('dark-mode');
        const lineColor = isDarkMode ? 0x60a5fa : 0x1e3a8a;
        lineGraphics.lineStyle(1, lineColor, 0.2); // Set line style once per frame

        const forceMultiplier = repelActive ? -1.5 : 1;

        for (let i = 0; i < particles.length; i++) {
            const p1 = particles[i];

            // 1. Mouse Interaction Force
            const dx_mouse = mouse.x - p1.x;
            const dy_mouse = mouse.y - p1.y;
            const distSq_mouse = dx_mouse * dx_mouse + dy_mouse * dy_mouse;
            const dist_mouse = Math.sqrt(distSq_mouse) + 0.1;
            const force_mouse = (mouseForce / distSq_mouse) * forceMultiplier;
            
            let total_ax = (dx_mouse / dist_mouse) * force_mouse;
            let total_ay = (dy_mouse / dist_mouse) * force_mouse;

            // 2. Inter-particle Spring Forces
            for (let j = i + 1; j < particles.length; j++) {
                const p2 = particles[j];

                const dx_spring = p2.x - p1.x;
                const dy_spring = p2.y - p1.y;
                const dist_spring = Math.sqrt(dx_spring * dx_spring + dy_spring * dy_spring);

                // If particles are close enough, apply spring force and draw a line
                if (dist_spring < connectionRadius) {
                    const displacement = dist_spring - restLength;
                    const springForce = displacement * springConstant;

                    const ax_spring = (dx_spring / (dist_spring || 1)) * springForce;
                    const ay_spring = (dy_spring / (dist_spring || 1)) * springForce;

                    // Apply force to both particles
                    total_ax += ax_spring;
                    total_ay += ay_spring;
                    p2.vx -= ax_spring;
                    p2.vy -= ay_spring;

                    // Draw the connection
                    lineGraphics.moveTo(p1.x, p1.y);
                    lineGraphics.lineTo(p2.x, p2.y);
                }
            }
            
            // 3. Update particle velocity and position
            p1.vx += total_ax;
            p1.vy += total_ay;
            p1.vx *= drag;
            p1.vy *= drag;
            p1.x += p1.vx;
            p1.y += p1.vy;
        }
    });

    // --- Initialization ---
    createParticles();
    console.log("✅ Spring-Web Particle System Initialized");
});
