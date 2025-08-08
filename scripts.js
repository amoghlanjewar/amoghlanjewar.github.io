// --- Smooth scrolling for navigation ---
document.querySelectorAll('.nav-links a').forEach(anchor => {
    anchor.addEventListener('click', e => {
        // The default scrollIntoView is used since we set scroll-behavior in CSS
        // but this prevents the hash from being added to the URL.
        e.preventDefault();
        const sectionId = anchor.getAttribute('href');
        document.querySelector(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    });
});

// --- Dark mode toggle ---
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

// --- Intersection Observer for animations ---
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.animated');
    if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        animatedElements.forEach(el => observer.observe(el));
    } else {
        // Fallback for older browsers
        animatedElements.forEach(el => el.classList.add('visible'));
    }
});

// --- Prevent default interaction with profile photo ---
document.addEventListener('DOMContentLoaded', () => {
    const photo = document.querySelector('.profile-photo');
    if (photo) {
        // Prevents right-click context menu
        photo.addEventListener('contextmenu', e => e.preventDefault());
        // Prevents dragging the image
        photo.addEventListener('dragstart', e => e.preventDefault());
    }
});

// The old 2D canvas particle simulation has been completely removed from this file
// to prevent conflicts with the new gpu-particles.js script.
console.log("✅ Main interaction scripts loaded.");
