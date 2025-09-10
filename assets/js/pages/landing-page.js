/**
 * ISSM Portal Landing Page JavaScript
 * Interactive components and animations for the landing page
 */

class LandingPage {
    constructor() {
        this.navbar = document.getElementById('landingNavbar');
        this.themeToggle = document.getElementById('landing-theme-toggle');
        this.init();
    }

    init() {
        this.initScrollEffects();
        this.initSmoothScrolling();
        this.initThemeToggle();
        this.initScrollAnimations();
        this.initHeroAnimations();
        this.initFormInteractions();
        this.initTooltips();
    }

    /**
     * Initialize scroll effects for navbar
     */
    initScrollEffects() {
        let lastScrollTop = 0;
        
        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            // Navbar scroll effect
            if (scrollTop > 100) {
                this.navbar.classList.add('scrolled');
            } else {
                this.navbar.classList.remove('scrolled');
            }
            
            // Navbar hide/show on scroll
            if (scrollTop > lastScrollTop && scrollTop > 200) {
                this.navbar.style.transform = 'translateY(-100%)';
            } else {
                this.navbar.style.transform = 'translateY(0)';
            }
            
            lastScrollTop = scrollTop;
        });
    }

    /**
     * Initialize smooth scrolling for navigation links
     */
    initSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const targetId = anchor.getAttribute('href');
                if (targetId === '#') return;
                
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    e.preventDefault();
                    
                    const navbarHeight = this.navbar.offsetHeight;
                    const targetPosition = targetElement.offsetTop - navbarHeight - 20;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                    
                    // Close mobile menu if open
                    const navbarCollapse = document.querySelector('.navbar-collapse');
                    if (navbarCollapse.classList.contains('show')) {
                        bootstrap.Collapse.getInstance(navbarCollapse).hide();
                    }
                }
            });
        });
    }

    /**
     * Initialize theme toggle functionality
     */
    initThemeToggle() {
        if (!this.themeToggle) return;
        
        // Get current theme
        const currentTheme = document.documentElement.getAttribute('data-bs-theme') || 'light';
        this.updateThemeIcon(currentTheme);
        
        this.themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-bs-theme') || 'light';
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            
            document.documentElement.setAttribute('data-bs-theme', newTheme);
            localStorage.setItem('landing-theme', newTheme);
            this.updateThemeIcon(newTheme);
            
            // Animate theme change
            document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
            setTimeout(() => {
                document.body.style.transition = '';
            }, 300);
        });
        
        // Load saved theme
        const savedTheme = localStorage.getItem('landing-theme');
        if (savedTheme) {
            document.documentElement.setAttribute('data-bs-theme', savedTheme);
            this.updateThemeIcon(savedTheme);
        }
    }

    /**
     * Update theme toggle icon
     */
    updateThemeIcon(theme) {
        const icon = this.themeToggle.querySelector('iconify-icon');
        if (icon) {
            icon.setAttribute('icon', 
                theme === 'light' ? 'solar:moon-bold-duotone' : 'solar:sun-bold-duotone'
            );
        }
    }

    /**
     * Initialize scroll-triggered animations
     */
    initScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate');
                    
                    // Special handling for statistics dashboard
                    if (entry.target.classList.contains('statistics-dashboard')) {
                        this.triggerStatisticsAnimation();
                    }
                    
                    // Staggered animation for process cards
                    if (entry.target.classList.contains('process-card')) {
                        const index = Array.from(entry.target.parentElement.children).indexOf(entry.target.parentElement);
                        entry.target.style.animationDelay = `${index * 0.2}s`;
                    }
                }
            });
        }, observerOptions);

        // Add scroll animation class to elements
        const animateElements = document.querySelectorAll(`
            .process-card,
            .feature-card,
            .portal-card,
            .support-card,
            .section-header,
            .statistics-dashboard,
            .benefit-item
        `);

        animateElements.forEach((el, index) => {
            el.classList.add('scroll-animation');
            el.style.animationDelay = `${index * 0.1}s`;
            observer.observe(el);
        });
    }
    
    /**
     * Trigger statistics dashboard animation
     */
    triggerStatisticsAnimation() {
        const dashboard = document.querySelector('.statistics-dashboard');
        if (dashboard) {
            dashboard.classList.add('animate-dashboard');
            
            // Trigger counter animations with delay
            setTimeout(() => {
                const counters = dashboard.querySelectorAll('.stat-number[data-target]');
                counters.forEach((counter, index) => {
                    setTimeout(() => {
                        counter.classList.add('animate-counter');
                    }, index * 200);
                });
            }, 500);
        }
    }

    /**
     * Initialize hero section animations
     */
    initHeroAnimations() {
        // Animate floating stats
        const floatingStats = document.querySelectorAll('.floating-stat');
        floatingStats.forEach((stat, index) => {
            stat.style.animationDelay = `${index * 0.5}s`;
        });

        // Animate verification demo card
        const demoCard = document.querySelector('.verification-demo-card');
        if (demoCard) {
            // Add hover effect for demo inputs
            const inputs = demoCard.querySelectorAll('.form-control, .form-select');
            inputs.forEach(input => {
                input.addEventListener('focus', () => {
                    input.parentElement.style.transform = 'scale(1.02)';
                    input.parentElement.style.transition = 'transform 0.2s ease';
                });
                
                input.addEventListener('blur', () => {
                    input.parentElement.style.transform = 'scale(1)';
                });
            });
        }
    }

    /**
     * Initialize form interactions
     */
    initFormInteractions() {
        // Demo form in hero section
        const demoForm = document.querySelector('.verification-demo-card form');
        const demoButton = document.querySelector('.verification-demo-card .btn');
        
        if (demoButton) {
            demoButton.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Add loading state
                const originalText = demoButton.innerHTML;
                demoButton.innerHTML = '<iconify-icon icon="solar:refresh-bold-duotone" class="me-2"></iconify-icon>Verificando...';
                demoButton.disabled = true;
                
                // Simulate verification process
                setTimeout(() => {
                    demoButton.innerHTML = '<iconify-icon icon="solar:check-circle-bold-duotone" class="me-2"></iconify-icon>Verificado!';
                    demoButton.classList.remove('btn-primary');
                    demoButton.classList.add('btn-success');
                    
                    setTimeout(() => {
                        demoButton.innerHTML = originalText;
                        demoButton.disabled = false;
                        demoButton.classList.remove('btn-success');
                        demoButton.classList.add('btn-primary');
                    }, 2000);
                }, 1500);
            });
        }
    }

    /**
     * Initialize tooltips
     */
    initTooltips() {
        // Initialize Bootstrap tooltips
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }
}

/**
 * Hero Animation Controller
 */
class HeroAnimationController {
    constructor() {
        this.init();
    }

    init() {
        this.initParallaxEffect();
        this.initTypingEffect();
        this.initCounterAnimations();
    }

    /**
     * Initialize parallax scrolling effect
     */
    initParallaxEffect() {
        const heroSection = document.querySelector('.hero-section');
        if (!heroSection) return;

        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            
            heroSection.style.transform = `translateY(${rate}px)`;
        });
    }

    /**
     * Initialize typing effect for hero title
     */
    initTypingEffect() {
        const titleElement = document.querySelector('.hero-title');
        if (!titleElement) return;

        const text = titleElement.textContent;
        titleElement.textContent = '';
        titleElement.style.opacity = '1';

        let index = 0;
        const typeSpeed = 50;

        const typeWriter = () => {
            if (index < text.length) {
                titleElement.textContent += text.charAt(index);
                index++;
                setTimeout(typeWriter, typeSpeed);
            }
        };

        // Start typing effect after a delay
        setTimeout(typeWriter, 1000);
    }

    /**
     * Initialize counter animations for stats
     */
    initCounterAnimations() {
        const counters = document.querySelectorAll('.floating-stat h4');
        
        counters.forEach(counter => {
            const target = counter.textContent.replace(/[^\d]/g, '');
            if (!target) return;
            
            const targetNumber = parseInt(target);
            let current = 0;
            const increment = targetNumber / 100;
            const duration = 2000; // 2 seconds
            const stepTime = duration / 100;
            
            const timer = setInterval(() => {
                current += increment;
                if (current >= targetNumber) {
                    current = targetNumber;
                    clearInterval(timer);
                }
                
                const displayValue = Math.floor(current);
                if (counter.textContent.includes('<')) {
                    counter.innerHTML = `< ${displayValue}h`;
                } else {
                    counter.textContent = displayValue.toLocaleString();
                }
            }, stepTime);
        });
    }
}

/**
 * Portal Cards Animation
 */
class PortalCardsAnimation {
    constructor() {
        this.init();
    }

    init() {
        this.initHoverEffects();
        this.initClickAnimations();
    }

    /**
     * Initialize hover effects for portal cards
     */
    initHoverEffects() {
        const portalCards = document.querySelectorAll('.portal-card');
        
        portalCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-8px) scale(1.02)';
                
                // Animate portal icon
                const icon = card.querySelector('.portal-icon');
                if (icon) {
                    icon.style.transform = 'rotate(5deg) scale(1.1)';
                }
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0) scale(1)';
                
                // Reset portal icon
                const icon = card.querySelector('.portal-icon');
                if (icon) {
                    icon.style.transform = 'rotate(0deg) scale(1)';
                }
            });
        });
    }

    /**
     * Initialize click animations
     */
    initClickAnimations() {
        const portalButtons = document.querySelectorAll('.portal-actions .btn');
        
        portalButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                // Create ripple effect
                const ripple = document.createElement('span');
                ripple.classList.add('ripple');
                button.appendChild(ripple);
                
                const rect = button.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;
                
                ripple.style.width = ripple.style.height = size + 'px';
                ripple.style.left = x + 'px';
                ripple.style.top = y + 'px';
                
                setTimeout(() => {
                    ripple.remove();
                }, 600);
            });
        });
    }
}

/**
 * Performance Monitor
 */
class PerformanceMonitor {
    constructor() {
        this.init();
    }

    init() {
        this.monitorLoadTime();
        this.optimizeImages();
        this.implementLazyLoading();
    }

    /**
     * Monitor page load time
     */
    monitorLoadTime() {
        window.addEventListener('load', () => {
            const loadTime = performance.now();
            console.log(`Landing page loaded in ${Math.round(loadTime)}ms`);
            
            // Report to analytics if available
            if (typeof gtag !== 'undefined') {
                gtag('event', 'page_load_time', {
                    custom_parameter: Math.round(loadTime)
                });
            }
        });
    }

    /**
     * Optimize image loading
     */
    optimizeImages() {
        const images = document.querySelectorAll('img');
        
        images.forEach(img => {
            // Add loading attribute
            img.loading = 'lazy';
            
            // Add error handling
            img.addEventListener('error', () => {
                img.style.display = 'none';
                console.warn(`Failed to load image: ${img.src}`);
            });
        });
    }

    /**
     * Implement lazy loading for non-critical elements
     */
    implementLazyLoading() {
        const lazyElements = document.querySelectorAll('.feature-card, .support-card');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('loaded');
                    observer.unobserve(entry.target);
                }
            });
        });
        
        lazyElements.forEach(el => observer.observe(el));
    }
}

/**
 * Accessibility Enhancements
 */
class AccessibilityEnhancements {
    constructor() {
        this.init();
    }

    init() {
        this.initKeyboardNavigation();
        this.initFocusManagement();
        this.initARIALabels();
        this.initReducedMotion();
    }

    /**
     * Initialize keyboard navigation
     */
    initKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }
        });
        
        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-navigation');
        });
    }

    /**
     * Initialize focus management
     */
    initFocusManagement() {
        const focusableElements = document.querySelectorAll(`
            a[href], button, input, select, textarea, 
            [tabindex]:not([tabindex="-1"])
        `);
        
        focusableElements.forEach(el => {
            el.addEventListener('focus', () => {
                el.classList.add('focused');
            });
            
            el.addEventListener('blur', () => {
                el.classList.remove('focused');
            });
        });
    }

    /**
     * Initialize ARIA labels
     */
    initARIALabels() {
        // Add ARIA labels to interactive elements
        const buttons = document.querySelectorAll('button:not([aria-label])');
        buttons.forEach(button => {
            const text = button.textContent.trim();
            if (text) {
                button.setAttribute('aria-label', text);
            }
        });
    }

    /**
     * Respect reduced motion preference
     */
    initReducedMotion() {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        if (prefersReducedMotion) {
            document.body.classList.add('reduced-motion');
            
            // Disable animations
            const style = document.createElement('style');
            style.textContent = `
                .reduced-motion * {
                    animation-duration: 0.01ms !important;
                    animation-iteration-count: 1 !important;
                    transition-duration: 0.01ms !important;
                }
            `;
            document.head.appendChild(style);
        }
    }
}

/**
 * Initialize all components when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', () => {
    // Initialize main landing page functionality
    new LandingPage();
    
    // Initialize hero animations
    new HeroAnimationController();
    
    // Initialize portal cards animations
    new PortalCardsAnimation();
    
    // Initialize performance monitoring
    new PerformanceMonitor();
    
    // Initialize accessibility enhancements
    new AccessibilityEnhancements();
    
    console.log('ISSM Landing Page initialized successfully');
});

/**
 * Add CSS for ripple effect
 */
const rippleCSS = `
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        transform: scale(0);
        animation: ripple-animation 0.6s linear;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    .btn {
        position: relative;
        overflow: hidden;
    }
    
    .keyboard-navigation *:focus {
        outline: 2px solid var(--issm-primary) !important;
        outline-offset: 2px !important;
    }
`;

const style = document.createElement('style');
style.textContent = rippleCSS;
document.head.appendChild(style);