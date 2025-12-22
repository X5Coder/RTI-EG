// Theme Management
function setTheme(theme) {
    if (theme === 'dark') {
        document.body.classList.add('dark');
        document.body.classList.remove('light');
        localStorage.setItem('theme', 'dark');
        updateThemeButtons('dark');
    } else {
        document.body.classList.add('light');
        document.body.classList.remove('dark');
        localStorage.setItem('theme', 'light');
        updateThemeButtons('light');
    }
}

function updateThemeButtons(theme) {
    const lightBtn = document.getElementById('lightThemeBtn');
    const darkBtn = document.getElementById('darkThemeBtn');
    
    if (lightBtn && darkBtn) {
        if (theme === 'light') {
            lightBtn.classList.add('active');
            darkBtn.classList.remove('active');
        } else {
            darkBtn.classList.add('active');
            lightBtn.classList.remove('active');
        }
    }
}

function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        setTheme('dark');
    } else {
        setTheme('light');
    }
}

// Settings Modal
function openSettings() {
    const modal = document.getElementById('settingsModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeSettings() {
    const modal = document.getElementById('settingsModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// WhatsApp Integration
function openWhatsApp(message) {
    const phone = '201016839352';
    const url = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    closeSettings();
}

// Reveal Animations
function initRevealAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, observerOptions);
    
    // Observe all reveal elements
    document.querySelectorAll('.reveal').forEach(el => {
        observer.observe(el);
    });
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initRevealAnimations();
    
    // Close modal on ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeSettings();
        }
    });
});
