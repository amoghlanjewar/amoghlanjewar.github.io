// gpu-particles.js

console.log("✅ GPU Particle Script Loaded");
document.addEventListener('DOMContentLoaded', () => {
    // Create a new PIXI Application
    const app = new PIXI.Application({
        resizeTo: window,
        backgroundAlpha: 0,
        antialias: true
    });

    // Append the canvas to the body
    document.body.appendChild(app.view);
    app.view.style.position = 'fixed';
    app.view.style.top = '0';
    app.view.style.left = '0';
    app.view.style.zIndex = '-1';

    const particleCount = 1000;
    const particles = [];
    const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const gravity = 8000;
    const drag = 0.93;

    // Create a container optimized for particles
    const container = new PIXI.ParticleContainer(particleCount, {
        scale: true,
        position: true,
        rotation: false,
        uvs: false,
        alpha: true
    });
    app.stage.addChild(container);

    // Generate particle texture (small white circle)
    const baseTexture = PIXI.Texture.from(generateCircleTexture());

    for (let i = 0; i < particleCount; i++) {
        const sprite = new PIXI.Sprite(baseTexture);
        sprite.x = Math.random() * window.innerWidth;
        sprite.y = Math.random() * window.innerHeight;
        sprite.vx = (Math.random() - 0.5) * 2;
        sprite.vy = (Math.random() - 0.5) * 2;
        sprite.scale.set(Math.random() * 0.4 + 0.2);
        sprite.anchor.set(0.5);
        container.addChild(sprite);
        particles.push(sprite);
    }

    // Function to generate a white circle texture
    function generateCircleTexture() {
        const g = new PIXI.Graphics();
        g.beginFill(0xffffff);
        g.drawCircle(0, 0, 6);
        g.endFill();
        return app.renderer.generateTexture(g);
    }

    // Mouse pointer attraction
    window.addEventListener('pointermove', e => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    // Animation loop
    app.ticker.add(() => {
        for (let p of particles) {
            const dx = mouse.x - p.x;
            const dy = mouse.y - p.y;
            const distSq = dx * dx + dy * dy;
            const dist = Math.sqrt(distSq) + 0.1;
            const force = gravity / distSq;

            const ax = (dx / dist) * force;
            const ay = (dy / dist) * force;

            p.vx += ax;
            p.vy += ay;

            p.vx *= drag;
            p.vy *= drag;

            p.x += p.vx;
            p.y += p.vy;
        }
    });
});
