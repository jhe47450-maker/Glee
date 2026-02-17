/**
 * Header, Footer & Modal Utilities
 * Handles dynamic functionality for header, footer, and modal sections
 */

// ===== MOBILE MENU TOGGLE =====
export function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navMenu = document.getElementById('navMenu');

    if (!mobileMenuBtn || !navMenu) return;

    mobileMenuBtn.addEventListener('click', () => {
        const isExpanded = mobileMenuBtn.getAttribute('aria-expanded') === 'true';
        mobileMenuBtn.setAttribute('aria-expanded', !isExpanded);
        navMenu.classList.toggle('active');

        // Toggle icon visibility
        const bars = mobileMenuBtn.querySelector('.fa-bars');
        const times = mobileMenuBtn.querySelector('.fa-times');
        if (bars && times) {
            bars.style.display = isExpanded ? 'inline' : 'none';
            times.style.display = isExpanded ? 'none' : 'inline';
        }
    });

    // Close menu when clicking on a link
    navMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenuBtn.setAttribute('aria-expanded', 'false');
            navMenu.classList.remove('active');
            const bars = mobileMenuBtn.querySelector('.fa-bars');
            const times = mobileMenuBtn.querySelector('.fa-times');
            if (bars && times) {
                bars.style.display = 'inline';
                times.style.display = 'none';
            }
        });
    });
}

// ===== THEME TOGGLE (DARK MODE) =====
export function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) return;

    // Check saved preference
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);

    themeToggle.addEventListener('click', () => {
        const currentTheme = localStorage.getItem('theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme', newTheme);
        applyTheme(newTheme);
    });
}

function applyTheme(theme) {
    const htmlElement = document.documentElement;
    const themeToggle = document.getElementById('themeToggle');

    if (theme === 'dark') {
        htmlElement.classList.add('dark-mode');
        if (themeToggle) {
            themeToggle.innerHTML = '<i class="fas fa-sun" aria-hidden="true"></i>';
            themeToggle.title = 'Toggle light mode';
        }
    } else {
        htmlElement.classList.remove('dark-mode');
        if (themeToggle) {
            themeToggle.innerHTML = '<i class="fas fa-moon" aria-hidden="true"></i>';
            themeToggle.title = 'Toggle dark mode';
        }
    }
}

// ===== ANNOUNCEMENT BANNER CLOSE =====
export function initAnnouncementBanner() {
    const banner = document.getElementById('announcementBanner');
    const closeBanner = document.querySelector('.close-banner');

    if (!banner || !closeBanner) return;

    // Check if banner was previously closed
    if (localStorage.getItem('bannerClosed') === 'true') {
        banner.style.display = 'none';
    }

    closeBanner.addEventListener('click', () => {
        banner.style.animate = 'slideOut 0.3s ease forwards';
        setTimeout(() => {
            banner.style.display = 'none';
            localStorage.setItem('bannerClosed', 'true');
        }, 300);
    });
}

// ===== BACK TO TOP BUTTON =====
export function initBackToTop() {
    const backToTopBtn = document.getElementById('backToTopBtn');
    if (!backToTopBtn) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTopBtn.classList.add('active');
        } else {
            backToTopBtn.classList.remove('active');
        }
    });

    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// ===== NEWSLETTER SIGNUP =====
export function initNewsletter() {
    const newsletterForm = document.getElementById('newsletterForm');
    if (!newsletterForm) return;

    newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        handleNewsletterSignup(e);
    });
}

window.handleNewsletterSignup = function(e) {
    e.preventDefault();
    const form = e.target;
    const email = form.querySelector('input[type="email"]').value;

    if (!email) return;

    // Simulate API call
    console.log('Newsletter signup:', email);
    alert(`✨ Thanks for subscribing, ${email}!\nWe'll send you updates on new flavors and special offers.`);

    form.reset();
    form.style.opacity = '0.6';

    setTimeout(() => {
        form.style.opacity = '1';
    }, 1000);
};

// ===== MODAL FUNCTIONS =====
export function initModal() {
    const modalOverlay = document.getElementById('successModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const modalCloseX = document.getElementById('modalCloseX');
    const newOrderBtn = document.getElementById('newOrderBtn');

    if (!modalOverlay) return;

    function closeModal() {
        modalOverlay.classList.remove('active');
    }

    function openModal() {
        modalOverlay.classList.add('active');
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            closeModal();
            window.location.href = 'index.html';
        });
    }

    if (modalCloseX) {
        modalCloseX.addEventListener('click', closeModal);
    }

    if (newOrderBtn) {
        newOrderBtn.addEventListener('click', () => {
            closeModal();
            window.location.href = 'order.html';
        });
    }

    // Close on overlay click
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            closeModal();
        }
    });

    // Expose globally
    window.showSuccessModal = openModal;
    window.closeSuccessModal = closeModal;
}

// ===== COPY TO CLIPBOARD =====
window.copyToClipboard = function(elementId) {
    const element = document.getElementById(elementId);
    if (!element) return;

    const text = element.textContent;
    navigator.clipboard.writeText(text).then(() => {
        alert(`✅ Copied: ${text}`);
    }).catch(() => {
        alert('Failed to copy to clipboard');
    });
};

// ===== LOAD SHARED COMPONENTS =====
export async function loadHeaderFooterModal() {
    try {
        // Load header
        const headerResponse = await fetch('shared/header.html');
        const headerHTML = await headerResponse.text();
        const headerContainer = document.getElementById('site-header');
        if (headerContainer) {
            headerContainer.innerHTML = headerHTML;
        }

        // Load footer
        const footerResponse = await fetch('shared/footer.html');
        const footerHTML = await footerResponse.text();
        const footerContainer = document.getElementById('site-footer');
        if (footerContainer) {
            footerContainer.innerHTML = footerHTML;
        }

        // Load modal
        const modalResponse = await fetch('shared/modal.html');
        const modalHTML = await modalResponse.text();
        const modalContainer = document.getElementById('site-modal');
        if (modalContainer) {
            modalContainer.innerHTML = modalHTML;
        }

        // Initialize components after loading
        initMobileMenu();
        initThemeToggle();
        initAnnouncementBanner();
        initBackToTop();
        initNewsletter();
        initModal();

    } catch (error) {
        console.error('Error loading shared components:', error);
    }
}

// ===== INITIALIZE ON DOM READY =====
export function init() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
}

function initialize() {
    loadHeaderFooterModal();
}

// Auto-initialize if not using as module
if (typeof module === 'undefined') {
    init();
}
