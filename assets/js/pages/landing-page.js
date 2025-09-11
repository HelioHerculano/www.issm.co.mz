/**
 * ISSM Portal Landing Page JavaScript
 * Interactive components and animations for the landing page
 */

/**
 * Advanced Theme Controller
 * Handles smooth theme transitions with enhanced user experience
 */
class AdvancedThemeController {
    constructor() {
        this.themeToggle = document.getElementById('landing-theme-toggle');
        this.currentTheme = this.getStoredTheme() || this.getSystemTheme();
        this.isTransitioning = false;
        this.transitionDuration = 300;
        this.init();
    }

    init() {
        this.applyTheme(this.currentTheme, false);
        this.bindEvents();
        this.updateIcon();
        this.setupSystemThemeListener();
    }

    /**
     * Get system theme preference
     */
    getSystemTheme() {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    /**
     * Get stored theme preference
     */
    getStoredTheme() {
        return localStorage.getItem('landing-theme');
    }

    /**
     * Store theme preference
     */
    storeTheme(theme) {
        localStorage.setItem('landing-theme', theme);
    }

    /**
     * Apply theme with optional smooth transition
     */
    applyTheme(theme, animate = true) {
        if (animate && !this.isTransitioning) {
            this.animateThemeTransition(theme);
        } else {
            document.documentElement.setAttribute('data-bs-theme', theme);
        }
        this.currentTheme = theme;
    }

    /**
     * Animate theme transition with smooth effects
     */
    animateThemeTransition(newTheme) {
        this.isTransitioning = true;
        
        // Add transition classes
        document.body.style.transition = `
            background-color ${this.transitionDuration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94),
            color ${this.transitionDuration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)
        `;
        
        // Create overlay for smooth transition
        const overlay = this.createTransitionOverlay();
        document.body.appendChild(overlay);
        
        // Animate overlay in
        requestAnimationFrame(() => {
            overlay.style.opacity = '0.1';
        });
        
        // Change theme after short delay
        setTimeout(() => {
            document.documentElement.setAttribute('data-bs-theme', newTheme);
            
            // Animate overlay out
            overlay.style.opacity = '0';
            
            // Clean up
            setTimeout(() => {
                if (overlay.parentNode) {
                    overlay.parentNode.removeChild(overlay);
                }
                document.body.style.transition = '';
                this.isTransitioning = false;
            }, this.transitionDuration);
            
        }, 50);
    }

    /**
     * Create transition overlay element
     */
    createTransitionOverlay() {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: radial-gradient(circle at center, rgba(0, 0, 0, 0.1) 0%, transparent 70%);
            opacity: 0;
            pointer-events: none;
            z-index: 9999;
            transition: opacity ${this.transitionDuration}ms ease;
        `;
        return overlay;
    }

    /**
     * Toggle between light and dark themes
     */
    toggleTheme() {
        if (this.isTransitioning) return;
        
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
        this.storeTheme(newTheme);
        this.updateIcon();
        this.triggerThemeChangeEvent(newTheme);
        
        // Add haptic feedback if available
        this.addHapticFeedback();
    }

    /**
     * Update theme toggle icon with animation
     */
    updateIcon() {
        const icon = this.themeToggle?.querySelector('i');
        if (!icon) return;
        
        // Animate icon transition
        icon.style.transform = 'scale(0.8) rotate(180deg)';
        icon.style.transition = 'transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
        
        setTimeout(() => {
            if (this.currentTheme === 'light') {
                icon.className = 'bi bi-moon icon-lg';
            } else {
                icon.className = 'bi bi-sun icon-lg';
            }
            
            icon.style.transform = 'scale(1) rotate(0deg)';
        }, 150);
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        if (!this.themeToggle) return;
        
        this.themeToggle.addEventListener('click', () => {
            this.toggleTheme();
        });
        
        // Keyboard support
        this.themeToggle.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.toggleTheme();
            }
        });
    }

    /**
     * Setup system theme change listener
     */
    setupSystemThemeListener() {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addEventListener('change', (e) => {
            // Only follow system theme if user hasn't set a preference
            if (!this.getStoredTheme()) {
                const systemTheme = e.matches ? 'dark' : 'light';
                this.applyTheme(systemTheme);
                this.updateIcon();
            }
        });
    }

    /**
     * Trigger custom theme change event
     */
    triggerThemeChangeEvent(theme) {
        const event = new CustomEvent('themeChanged', {
            detail: { theme, timestamp: Date.now() }
        });
        document.dispatchEvent(event);
    }

    /**
     * Add haptic feedback for supported devices
     */
    addHapticFeedback() {
        if ('vibrate' in navigator) {
            navigator.vibrate(50);
        }
    }

    /**
     * Get current theme
     */
    getCurrentTheme() {
        return this.currentTheme;
    }

    /**
     * Programmatically set theme
     */
    setTheme(theme, store = true) {
        if (['light', 'dark'].includes(theme)) {
            this.applyTheme(theme);
            if (store) {
                this.storeTheme(theme);
            }
            this.updateIcon();
            this.triggerThemeChangeEvent(theme);
        }
    }
}

class LandingPage {
    constructor() {
        this.navbar = document.getElementById('landingNavbar');
        this.themeController = new AdvancedThemeController();
        this.init();
    }

    init() {
        this.initScrollEffects();
        this.initSmoothScrolling();
        this.initScrollAnimations();
        this.initHeroAnimations();
        this.initFormInteractions();
        this.initTooltips();
        this.initIconOptimizations();
        this.initThemeChangeListeners();
    }

    /**
     * Initialize theme change listeners
     */
    initThemeChangeListeners() {
        document.addEventListener('themeChanged', (e) => {
            console.log(`Theme changed to: ${e.detail.theme}`);
            
            // Update any theme-dependent components
            this.updateComponentsForTheme(e.detail.theme);
            
            // Analytics tracking
            this.trackThemeChange(e.detail.theme);
        });
    }

    /**
     * Update components when theme changes
     */
    updateComponentsForTheme(theme) {
        // Update chart colors if present
        this.updateChartColors(theme);
        
        // Update any dynamic SVGs or canvases
        this.updateDynamicGraphics(theme);
        
        // Update iframe content if needed
        this.updateEmbeddedContent(theme);
    }

    /**
     * Track theme changes for analytics
     */
    trackThemeChange(theme) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'theme_change', {
                theme_mode: theme,
                page_title: document.title
            });
        }
    }

    /**
     * Update chart colors for theme
     */
    updateChartColors(theme) {
        // This would update any charts present on the page
        const charts = document.querySelectorAll('.chart-container');
        charts.forEach(chart => {
            // Update chart theme colors
            if (chart.chart && chart.chart.updateOptions) {
                const newColors = this.getChartColorsForTheme(theme);
                chart.chart.updateOptions({
                    theme: {
                        mode: theme,
                        palette: 'palette1'
                    }
                });
            }
        });
    }

    /**
     * Get chart colors for theme
     */
    getChartColorsForTheme(theme) {
        if (theme === 'dark') {
            return {
                background: '#2d3748',
                foreground: '#f7fafc',
                primary: '#d78b29'
            };
        }
        return {
            background: '#ffffff',
            foreground: '#1f2937',
            primary: '#211e3a'
        };
    }

    /**
     * Update dynamic graphics for theme
     */
    updateDynamicGraphics(theme) {
        const svgs = document.querySelectorAll('svg[data-theme-aware]');
        svgs.forEach(svg => {
            if (theme === 'dark') {
                svg.style.filter = 'invert(1) hue-rotate(180deg)';
            } else {
                svg.style.filter = 'none';
            }
        });
    }

    /**
     * Update embedded content for theme
     */
    updateEmbeddedContent(theme) {
        const iframes = document.querySelectorAll('iframe[data-theme-aware]');
        iframes.forEach(iframe => {
            // Send theme message to iframe if it supports it
            try {
                iframe.contentWindow.postMessage({
                    type: 'theme-change',
                    theme: theme
                }, '*');
            } catch (e) {
                // Ignore cross-origin errors
            }
        });
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
     * Initialize scroll-triggered animations with enhanced effects
     */
    initScrollAnimations() {
        this.setupAdvancedScrollObserver();
        this.initStaggeredAnimations();
        this.initParallaxEffects();
        this.initCounterAnimations();
        this.initHoverAnimations();
    }

    /**
     * Setup advanced scroll observer with multiple thresholds
     */
    setupAdvancedScrollObserver() {
        const observerOptions = {
            threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const element = entry.target;
                const ratio = entry.intersectionRatio;
                
                if (entry.isIntersecting) {
                    // Add progressive animation classes based on visibility
                    if (ratio >= 0.1) {
                        element.classList.add('animate-in');
                    }
                    if (ratio >= 0.5) {
                        element.classList.add('animate-full');
                    }
                    
                    // Special handling for different element types
                    this.handleSpecialAnimations(element, ratio);
                    
                    // Unobserve after full animation
                    if (ratio >= 0.75) {
                        observer.unobserve(element);
                    }
                } else {
                    // Remove classes when out of view (for re-triggering)
                    element.classList.remove('animate-in', 'animate-full');
                }
            });
        }, observerOptions);

        // Observe all animatable elements
        const animateElements = document.querySelectorAll(`
            .process-card,
            .feature-card,
            .portal-card,
            .support-card,
            .section-header,
            .statistics-dashboard,
            .benefit-item,
            .hero-visual,
            .info-box
        `);

        animateElements.forEach((el, index) => {
            el.classList.add('scroll-animation');
            el.style.setProperty('--animation-delay', `${index * 0.1}s`);
            observer.observe(el);
        });
    }

    /**
     * Handle special animations for specific elements
     */
    handleSpecialAnimations(element, ratio) {
        // Statistics dashboard
        if (element.classList.contains('statistics-dashboard') && ratio >= 0.5) {
            this.triggerStatisticsAnimation();
        }
        
        // Process cards with staggered effect
        if (element.classList.contains('process-card') && ratio >= 0.3) {
            this.triggerProcessCardAnimation(element);
        }
        
        // Portal cards with flip effect
        if (element.classList.contains('portal-card') && ratio >= 0.4) {
            this.triggerPortalCardAnimation(element);
        }
        
        // Feature cards with scale effect
        if (element.classList.contains('feature-card') && ratio >= 0.3) {
            this.triggerFeatureCardAnimation(element);
        }
    }

    /**
     * Initialize staggered animations for grouped elements
     */
    initStaggeredAnimations() {
        const staggerGroups = {
            '.process-card': 200,
            '.feature-card': 150,
            '.portal-card': 250,
            '.support-card': 180,
            '.benefit-item': 100
        };

        Object.entries(staggerGroups).forEach(([selector, delay]) => {
            const elements = document.querySelectorAll(selector);
            elements.forEach((el, index) => {
                el.style.setProperty('--stagger-delay', `${index * delay}ms`);
            });
        });
    }

    /**
     * Initialize parallax effects for hero section
     */
    initParallaxEffects() {
        const parallaxElements = document.querySelectorAll('[data-parallax]');
        
        if (parallaxElements.length === 0) return;
        
        let ticking = false;
        
        const updateParallax = () => {
            const scrolled = window.pageYOffset;
            
            parallaxElements.forEach(el => {
                const rate = parseFloat(el.dataset.parallax) || 0.5;
                const yPos = -(scrolled * rate);
                el.style.transform = `translateY(${yPos}px)`;
            });
            
            ticking = false;
        };
        
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateParallax);
                ticking = true;
            }
        });
    }

    /**
     * Initialize counter animations
     */
    initCounterAnimations() {
        const counters = document.querySelectorAll('[data-counter]');
        
        counters.forEach(counter => {
            const target = parseInt(counter.dataset.counter);
            const duration = parseInt(counter.dataset.duration) || 2000;
            const isDecimal = counter.dataset.decimal === 'true';
            
            counter.addEventListener('animate-counter', () => {
                this.animateCounter(counter, target, duration, isDecimal);
            });
        });
    }

    /**
     * Animate counter with easing
     */
    animateCounter(element, target, duration, isDecimal = false) {
        const start = parseFloat(element.textContent) || 0;
        const startTime = performance.now();
        
        const updateCounter = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function (ease-out-cubic)
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = start + (target - start) * easeOut;
            
            if (isDecimal) {
                element.textContent = current.toFixed(1);
            } else {
                element.textContent = Math.floor(current).toLocaleString();
            }
            
            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = isDecimal ? target.toFixed(1) : target.toLocaleString();
            }
        };
        
        requestAnimationFrame(updateCounter);
    }

    /**
     * Initialize hover animations
     */
    initHoverAnimations() {
        // Card hover effects
        const cards = document.querySelectorAll('.process-card, .feature-card, .portal-card, .support-card');
        
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                this.addHoverEffect(card);
            });
            
            card.addEventListener('mouseleave', () => {
                this.removeHoverEffect(card);
            });
        });
        
        // Button ripple effects
        const buttons = document.querySelectorAll('.btn');
        buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                this.createRippleEffect(button, e);
            });
        });
    }

    /**
     * Add hover effect to element
     */
    addHoverEffect(element) {
        element.style.transform = 'translateY(-8px) scale(1.02)';
        element.style.boxShadow = 'var(--landing-shadow-xl)';
        
        // Animate child elements
        const icon = element.querySelector('.process-icon, .feature-icon, .portal-icon, .card-icon');
        if (icon) {
            icon.style.transform = 'scale(1.1) rotate(5deg)';
        }
    }

    /**
     * Remove hover effect from element
     */
    removeHoverEffect(element) {
        element.style.transform = 'translateY(0) scale(1)';
        element.style.boxShadow = '';
        
        // Reset child elements
        const icon = element.querySelector('.process-icon, .feature-icon, .portal-icon, .card-icon');
        if (icon) {
            icon.style.transform = 'scale(1) rotate(0deg)';
        }
    }

    /**
     * Create ripple effect on button click
     */
    createRippleEffect(button, event) {
        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.6);
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            transform: scale(0);
            animation: ripple-animation 0.6s linear;
            pointer-events: none;
        `;
        
        ripple.classList.add('ripple');
        button.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    /**
     * Trigger process card animation
     */
    triggerProcessCardAnimation(element) {
        const features = element.querySelectorAll('.feature-tag');
        features.forEach((tag, index) => {
            setTimeout(() => {
                tag.style.animation = 'fadeInUp 0.5s ease-out forwards';
                tag.style.animationDelay = `${index * 0.1}s`;
            }, 300);
        });
    }

    /**
     * Trigger portal card animation
     */
    triggerPortalCardAnimation(element) {
        const features = element.querySelectorAll('.feature-list li');
        features.forEach((item, index) => {
            setTimeout(() => {
                item.style.animation = 'slideInLeft 0.5s ease-out forwards';
                item.style.animationDelay = `${index * 0.1}s`;
            }, 200);
        });
    }

    /**
     * Trigger feature card animation
     */
    triggerFeatureCardAnimation(element) {
        const icon = element.querySelector('.feature-icon');
        if (icon) {
            icon.style.animation = 'bounce 0.8s ease-out';
        }
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
     * Initialize icon loading optimizations
     */
    initIconOptimizations() {
        // Preload critical icons
        this.preloadCriticalIcons();
        
        // Lazy load non-critical icons
        this.initIconLazyLoading();
        
        // Icon loading error handling
        this.initIconErrorHandling();
        
        // Icon animation performance optimization
        this.optimizeIconAnimations();
    }

    /**
     * Preload critical icons that are immediately visible
     */
    preloadCriticalIcons() {
        const criticalIcons = [
            'solar:home-bold-duotone',
            'solar:settings-bold-duotone',
            'solar:widget-bold-duotone',
            'solar:chat-round-bold-duotone',
            'solar:login-3-bold-duotone',
            'solar:moon-bold-duotone',
            'solar:sun-bold-duotone',
            'solar:shield-check-bold-duotone',
            'solar:document-add-bold-duotone',
            'solar:shield-keyhole-bold-duotone'
        ];
        
        // Create invisible elements to trigger icon loading
        const preloadContainer = document.createElement('div');
        preloadContainer.style.position = 'absolute';
        preloadContainer.style.left = '-9999px';
        preloadContainer.style.visibility = 'hidden';
        
        criticalIcons.forEach(iconName => {
            const iconElement = document.createElement('iconify-icon');
            iconElement.setAttribute('icon', iconName);
            iconElement.style.fontSize = '1px';
            preloadContainer.appendChild(iconElement);
        });
        
        document.body.appendChild(preloadContainer);
        
        // Remove preload container after icons are loaded
        setTimeout(() => {
            if (preloadContainer.parentNode) {
                preloadContainer.parentNode.removeChild(preloadContainer);
            }
        }, 3000);
    }

    /**
     * Initialize lazy loading for non-critical icons
     */
    initIconLazyLoading() {
        const iconObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const icon = entry.target;
                    
                    // Load the icon
                    if (icon.hasAttribute('data-icon-lazy')) {
                        const iconName = icon.getAttribute('data-icon-lazy');
                        icon.setAttribute('icon', iconName);
                        icon.removeAttribute('data-icon-lazy');
                        icon.classList.add('icon-loaded');
                    }
                    
                    iconObserver.unobserve(icon);
                }
            });
        }, {
            rootMargin: '50px 0px'
        });
        
        // Observe icons below the fold
        const lazyIcons = document.querySelectorAll('iconify-icon[data-icon-lazy]');
        lazyIcons.forEach(icon => iconObserver.observe(icon));
    }

    /**
     * Initialize icon error handling
     */
    initIconErrorHandling() {
        // Monitor for failed icon loads
        document.addEventListener('iconify:loadError', (e) => {
            console.warn('Failed to load icon:', e.detail.name);
            
            // Fallback to text representation or alternative icon
            const failedIcons = document.querySelectorAll(`iconify-icon[icon="${e.detail.name}"]`);
            failedIcons.forEach(icon => {
                icon.style.display = 'none';
                
                // Create fallback element
                const fallback = document.createElement('span');
                fallback.className = 'icon-fallback';
                fallback.textContent = '•'; // Simple bullet as fallback
                fallback.setAttribute('aria-hidden', 'true');
                
                icon.parentNode.insertBefore(fallback, icon);
            });
        });
    }

    /**
     * Optimize icon animations for performance
     */
    optimizeIconAnimations() {
        // Use will-change property for icons with animations
        const animatedIcons = document.querySelectorAll(`
            .icon-hover-pulse,
            .icon-hover-bounce,
            .icon-hover-rotate,
            .icon-hover-scale,
            .icon-hover-shake,
            .icon-spin,
            .icon-float
        `);
        
        animatedIcons.forEach(icon => {
            icon.addEventListener('mouseenter', () => {
                icon.style.willChange = 'transform';
            });
            
            icon.addEventListener('mouseleave', () => {
                // Remove will-change after animation completes
                setTimeout(() => {
                    icon.style.willChange = 'auto';
                }, 600);
            });
        });
        
        // Disable animations if user prefers reduced motion
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            animatedIcons.forEach(icon => {
                icon.classList.add('reduced-motion');
            });
        }
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
 * Monitors and optimizes page performance
 */
class PerformanceMonitor {
    constructor() {
        this.metrics = {
            loadTime: 0,
            frameRate: 60,
            memoryUsage: 0,
            animationPerformance: []
        };
        this.init();
    }

    init() {
        this.monitorLoadTime();
        this.monitorFrameRate();
        this.monitorMemoryUsage();
        this.optimizeAnimations();
        this.implementLazyLoading();
        this.setupPerformanceObserver();
    }

    /**
     * Monitor page load time
     */
    monitorLoadTime() {
        window.addEventListener('load', () => {
            const loadTime = performance.now();
            this.metrics.loadTime = loadTime;
            
            console.log(`Landing page loaded in ${Math.round(loadTime)}ms`);
            
            // Report to analytics if available
            this.reportToAnalytics('page_load_time', loadTime);
            
            // Optimize if load time is too high
            if (loadTime > 3000) {
                this.enablePerformanceMode();
            }
        });
    }

    /**
     * Monitor frame rate during animations
     */
    monitorFrameRate() {
        let frameCount = 0;
        let lastTime = performance.now();
        
        const measureFrameRate = () => {
            frameCount++;
            const currentTime = performance.now();
            
            if (currentTime - lastTime >= 1000) {
                this.metrics.frameRate = frameCount;
                frameCount = 0;
                lastTime = currentTime;
                
                // If frame rate is too low, reduce animations
                if (this.metrics.frameRate < 30) {
                    this.reduceAnimations();
                }
            }
            
            requestAnimationFrame(measureFrameRate);
        };
        
        requestAnimationFrame(measureFrameRate);
    }

    /**
     * Monitor memory usage
     */
    monitorMemoryUsage() {
        if ('memory' in performance) {
            setInterval(() => {
                const memory = performance.memory;
                this.metrics.memoryUsage = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
                
                // If memory usage is high, clean up
                if (this.metrics.memoryUsage > 0.8) {
                    this.cleanupMemory();
                }
            }, 5000);
        }
    }

    /**
     * Setup Performance Observer for Core Web Vitals
     */
    setupPerformanceObserver() {
        if ('PerformanceObserver' in window) {
            // Largest Contentful Paint
            const lcpObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    console.log('LCP:', entry.startTime);
                    this.reportToAnalytics('lcp', entry.startTime);
                }
            });
            lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
            
            // First Input Delay
            const fidObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    console.log('FID:', entry.processingStart - entry.startTime);
                    this.reportToAnalytics('fid', entry.processingStart - entry.startTime);
                }
            });
            fidObserver.observe({ entryTypes: ['first-input'] });
            
            // Cumulative Layout Shift
            const clsObserver = new PerformanceObserver((list) => {
                let clsValue = 0;
                for (const entry of list.getEntries()) {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                    }
                }
                console.log('CLS:', clsValue);
                this.reportToAnalytics('cls', clsValue);
            });
            clsObserver.observe({ entryTypes: ['layout-shift'] });
        }
    }

    /**
     * Optimize animations based on device capabilities
     */
    optimizeAnimations() {
        // Detect device performance
        const isLowPerformance = this.detectLowPerformanceDevice();
        
        if (isLowPerformance) {
            document.body.classList.add('low-performance');
            this.reduceAnimations();
        }
        
        // Optimize based on connection speed
        if ('connection' in navigator) {
            const connection = navigator.connection;
            if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
                this.enableDataSaverMode();
            }
        }
    }

    /**
     * Detect low performance devices
     */
    detectLowPerformanceDevice() {
        // Check device memory
        if ('deviceMemory' in navigator && navigator.deviceMemory < 4) {
            return true;
        }
        
        // Check CPU cores
        if ('hardwareConcurrency' in navigator && navigator.hardwareConcurrency < 4) {
            return true;
        }
        
        // Check user agent for older devices
        const userAgent = navigator.userAgent.toLowerCase();
        const oldDevicePatterns = [
            /android [1-4]\./,
            /iphone os [1-9]_/,
            /cpu os [1-9]_/
        ];
        
        return oldDevicePatterns.some(pattern => pattern.test(userAgent));
    }

    /**
     * Reduce animations for better performance
     */
    reduceAnimations() {
        console.log('Reducing animations for better performance');
        document.body.classList.add('reduced-animations');
        
        // Disable complex animations
        const animatedElements = document.querySelectorAll('.scroll-animation');
        animatedElements.forEach(el => {
            el.style.animation = 'none';
            el.style.transition = 'opacity 0.3s ease';
        });
    }

    /**
     * Enable performance mode
     */
    enablePerformanceMode() {
        console.log('Enabling performance mode');
        document.body.classList.add('performance-mode');
        
        // Disable non-essential features
        this.disableParallax();
        this.simplifyAnimations();
        this.optimizeImages();
    }

    /**
     * Enable data saver mode
     */
    enableDataSaverMode() {
        console.log('Enabling data saver mode');
        document.body.classList.add('data-saver');
        
        // Disable autoplay videos
        const videos = document.querySelectorAll('video[autoplay]');
        videos.forEach(video => {
            video.removeAttribute('autoplay');
        });
        
        // Optimize image loading
        this.optimizeImageLoading();
    }

    /**
     * Implement lazy loading for images and content
     */
    implementLazyLoading() {
        // Lazy load images
        const images = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.add('loaded');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
        
        // Lazy load non-critical sections
        const sections = document.querySelectorAll('[data-lazy-load]');
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('loaded');
                    sectionObserver.unobserve(entry.target);
                }
            });
        }, { rootMargin: '50px' });
        
        sections.forEach(section => sectionObserver.observe(section));
    }

    /**
     * Clean up memory
     */
    cleanupMemory() {
        console.log('Cleaning up memory');
        
        // Remove completed animations
        const completedAnimations = document.querySelectorAll('.animation-complete');
        completedAnimations.forEach(el => {
            el.style.animation = 'none';
            el.style.transform = '';
        });
        
        // Garbage collect if available
        if (window.gc) {
            window.gc();
        }
    }

    /**
     * Report metrics to analytics
     */
    reportToAnalytics(metric, value) {
        if (typeof gtag !== 'undefined') {
            gtag('event', metric, {
                custom_parameter: Math.round(value),
                page_title: document.title
            });
        }
    }

    /**
     * Get current performance metrics
     */
    getMetrics() {
        return this.metrics;
    }
}

/**
 * Accessibility Enhancements
 * Comprehensive accessibility features for the landing page
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
        this.initScreenReaderSupport();
        this.initColorContrastSupport();
        this.initVoiceControlSupport();
        this.addSkipLinks();
    }

    /**
     * Initialize keyboard navigation
     */
    initKeyboardNavigation() {
        // Track keyboard usage
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }
            
            // Add keyboard shortcuts
            this.handleKeyboardShortcuts(e);
        });
        
        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-navigation');
        });
        
        // Enhance tab navigation
        this.enhanceTabNavigation();
    }

    /**
     * Handle keyboard shortcuts
     */
    handleKeyboardShortcuts(e) {
        // Alt + T: Toggle theme
        if (e.altKey && e.key === 't') {
            e.preventDefault();
            const themeToggle = document.getElementById('landing-theme-toggle');
            if (themeToggle) {
                themeToggle.click();
            }
        }
        
        // Alt + M: Go to main content
        if (e.altKey && e.key === 'm') {
            e.preventDefault();
            const mainContent = document.querySelector('main, .hero-section');
            if (mainContent) {
                mainContent.focus();
                mainContent.scrollIntoView({ behavior: 'smooth' });
            }
        }
        
        // Escape: Close any open modals or menus
        if (e.key === 'Escape') {
            this.closeOpenElements();
        }
    }

    /**
     * Enhance tab navigation
     */
    enhanceTabNavigation() {
        const focusableElements = document.querySelectorAll(`
            a[href], button, input, select, textarea, 
            [tabindex]:not([tabindex="-1"])
        `);
        
        focusableElements.forEach((el, index) => {
            el.addEventListener('keydown', (e) => {
                // Shift + Tab: Previous element
                if (e.key === 'Tab' && e.shiftKey) {
                    if (index === 0) {
                        e.preventDefault();
                        focusableElements[focusableElements.length - 1].focus();
                    }
                }
                // Tab: Next element
                else if (e.key === 'Tab') {
                    if (index === focusableElements.length - 1) {
                        e.preventDefault();
                        focusableElements[0].focus();
                    }
                }
            });
        });
    }

    /**
     * Initialize focus management
     */
    initFocusManagement() {
        // Focus trap for modals
        this.setupFocusTraps();
        
        // Focus indicators
        this.enhanceFocusIndicators();
        
        // Focus restoration
        this.setupFocusRestoration();
    }

    /**
     * Setup focus traps
     */
    setupFocusTraps() {
        const modals = document.querySelectorAll('.modal, .dropdown-menu');
        
        modals.forEach(modal => {
            modal.addEventListener('shown.bs.modal', () => {
                this.trapFocus(modal);
            });
        });
    }

    /**
     * Trap focus within element
     */
    trapFocus(element) {
        const focusableElements = element.querySelectorAll(`
            a[href], button, input, select, textarea,
            [tabindex]:not([tabindex="-1"])
        `);
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        element.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
            }
        });
        
        // Focus first element
        firstElement?.focus();
    }

    /**
     * Enhance focus indicators
     */
    enhanceFocusIndicators() {
        const focusableElements = document.querySelectorAll(`
            a, button, input, select, textarea,
            [tabindex]:not([tabindex="-1"])
        `);
        
        focusableElements.forEach(el => {
            el.addEventListener('focus', () => {
                el.classList.add('focused');
                this.announceToScreenReader(`Focused on ${this.getElementDescription(el)}`);
            });
            
            el.addEventListener('blur', () => {
                el.classList.remove('focused');
            });
        });
    }

    /**
     * Get element description for screen readers
     */
    getElementDescription(element) {
        return element.getAttribute('aria-label') ||
               element.getAttribute('title') ||
               element.textContent?.trim() ||
               element.tagName.toLowerCase();
    }

    /**
     * Initialize ARIA labels and descriptions
     */
    initARIALabels() {
        // Add ARIA labels to unlabeled interactive elements
        this.addMissingARIALabels();
        
        // Enhance landmark navigation
        this.enhanceLandmarks();
        
        // Add live regions for dynamic content
        this.setupLiveRegions();
    }

    /**
     * Add missing ARIA labels
     */
    addMissingARIALabels() {
        const buttons = document.querySelectorAll('button:not([aria-label]):not([aria-labelledby])');
        buttons.forEach(button => {
            const text = button.textContent?.trim();
            if (text) {
                button.setAttribute('aria-label', text);
            } else {
                button.setAttribute('aria-label', 'Button');
            }
        });
        
        // Add aria-hidden to decorative icons
        const decorativeIcons = document.querySelectorAll('i:not([aria-label]), iconify-icon:not([aria-label])');
        decorativeIcons.forEach(icon => {
            if (!icon.closest('button, a')) {
                icon.setAttribute('aria-hidden', 'true');
            }
        });
    }

    /**
     * Enhance landmarks
     */
    enhanceLandmarks() {
        // Add main landmark if missing
        if (!document.querySelector('main')) {
            const heroSection = document.querySelector('.hero-section');
            if (heroSection) {
                heroSection.setAttribute('role', 'main');
                heroSection.setAttribute('aria-label', 'Main content');
            }
        }
        
        // Add navigation landmarks
        const navElements = document.querySelectorAll('nav:not([aria-label])');
        navElements.forEach((nav, index) => {
            nav.setAttribute('aria-label', `Navigation ${index + 1}`);
        });
    }

    /**
     * Setup live regions for dynamic content
     */
    setupLiveRegions() {
        // Create status region
        const statusRegion = document.createElement('div');
        statusRegion.setAttribute('aria-live', 'polite');
        statusRegion.setAttribute('aria-atomic', 'true');
        statusRegion.className = 'sr-only';
        statusRegion.id = 'status-region';
        document.body.appendChild(statusRegion);
        
        // Create alert region
        const alertRegion = document.createElement('div');
        alertRegion.setAttribute('aria-live', 'assertive');
        alertRegion.setAttribute('aria-atomic', 'true');
        alertRegion.className = 'sr-only';
        alertRegion.id = 'alert-region';
        document.body.appendChild(alertRegion);
    }

    /**
     * Announce to screen reader
     */
    announceToScreenReader(message, priority = 'polite') {
        const regionId = priority === 'assertive' ? 'alert-region' : 'status-region';
        const region = document.getElementById(regionId);
        
        if (region) {
            region.textContent = message;
            setTimeout(() => {
                region.textContent = '';
            }, 1000);
        }
    }

    /**
     * Respect reduced motion preference
     */
    initReducedMotion() {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        if (prefersReducedMotion) {
            document.body.classList.add('reduced-motion');
            this.disableAnimations();
        }
        
        // Listen for changes
        window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
            if (e.matches) {
                document.body.classList.add('reduced-motion');
                this.disableAnimations();
            } else {
                document.body.classList.remove('reduced-motion');
                this.enableAnimations();
            }
        });
    }

    /**
     * Disable animations
     */
    disableAnimations() {
        const style = document.createElement('style');
        style.id = 'reduced-motion-styles';
        style.textContent = `
            .reduced-motion * {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
                scroll-behavior: auto !important;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Enable animations
     */
    enableAnimations() {
        const style = document.getElementById('reduced-motion-styles');
        if (style) {
            style.remove();
        }
    }

    /**
     * Initialize screen reader support
     */
    initScreenReaderSupport() {
        // Add screen reader only content
        this.addScreenReaderContent();
        
        // Improve form accessibility
        this.improveFormAccessibility();
        
        // Add progress indicators
        this.addProgressIndicators();
    }

    /**
     * Add screen reader specific content
     */
    addScreenReaderContent() {
        // Add page structure description
        const structureDescription = document.createElement('div');
        structureDescription.className = 'sr-only';
        structureDescription.textContent = 'This page contains information about ISSM portal verification services. Use the navigation menu to access different sections.';
        document.body.insertBefore(structureDescription, document.body.firstChild);
    }

    /**
     * Initialize color contrast support
     */
    initColorContrastSupport() {
        // Detect high contrast preference
        const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
        
        if (prefersHighContrast) {
            document.body.classList.add('high-contrast');
        }
        
        // Add contrast toggle
        this.addContrastToggle();
    }

    /**
     * Add contrast toggle
     */
    addContrastToggle() {
        const contrastToggle = document.createElement('button');
        contrastToggle.className = 'btn btn-outline-secondary contrast-toggle';
        contrastToggle.innerHTML = '<i class="bi bi-circle-half"></i> <span class="sr-only">Toggle High Contrast</span>';
        contrastToggle.setAttribute('aria-label', 'Toggle high contrast mode');
        
        contrastToggle.addEventListener('click', () => {
            document.body.classList.toggle('high-contrast');
            const isHighContrast = document.body.classList.contains('high-contrast');
            this.announceToScreenReader(`High contrast mode ${isHighContrast ? 'enabled' : 'disabled'}`);
        });
        
        // Add to navigation
        const navbar = document.querySelector('.navbar-nav');
        if (navbar) {
            const li = document.createElement('li');
            li.className = 'nav-item';
            li.appendChild(contrastToggle);
            navbar.appendChild(li);
        }
    }

    /**
     * Initialize voice control support
     */
    initVoiceControlSupport() {
        // Add voice commands if Speech Recognition is available
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            this.setupVoiceCommands();
        }
    }

    /**
     * Setup voice commands
     */
    setupVoiceCommands() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'pt-MZ';
        
        recognition.onresult = (event) => {
            const command = event.results[0][0].transcript.toLowerCase();
            this.processVoiceCommand(command);
        };
        
        // Add voice control toggle
        this.addVoiceControlToggle(recognition);
    }

    /**
     * Process voice commands
     */
    processVoiceCommand(command) {
        const commands = {
            'ir para início': () => document.querySelector('#home')?.scrollIntoView({ behavior: 'smooth' }),
            'como funciona': () => document.querySelector('#como-funciona')?.scrollIntoView({ behavior: 'smooth' }),
            'portais': () => document.querySelector('#portais')?.scrollIntoView({ behavior: 'smooth' }),
            'suporte': () => document.querySelector('#suporte')?.scrollIntoView({ behavior: 'smooth' }),
            'alternar tema': () => document.getElementById('landing-theme-toggle')?.click(),
            'verificar apólice': () => window.location.href = 'entidades/index.html'
        };
        
        const matchedCommand = Object.keys(commands).find(cmd => command.includes(cmd));
        if (matchedCommand) {
            commands[matchedCommand]();
            this.announceToScreenReader(`Executed command: ${matchedCommand}`);
        }
    }

    /**
     * Add skip links
     */
    addSkipLinks() {
        const skipLinks = document.createElement('div');
        skipLinks.className = 'skip-links';
        skipLinks.innerHTML = `
            <a href="#main-content" class="skip-link">Skip to main content</a>
            <a href="#navigation" class="skip-link">Skip to navigation</a>
            <a href="#footer" class="skip-link">Skip to footer</a>
        `;
        
        document.body.insertBefore(skipLinks, document.body.firstChild);
    }

    /**
     * Close open elements (modals, menus, etc.)
     */
    closeOpenElements() {
        // Close modals
        const openModals = document.querySelectorAll('.modal.show');
        openModals.forEach(modal => {
            const modalInstance = bootstrap.Modal.getInstance(modal);
            if (modalInstance) {
                modalInstance.hide();
            }
        });
        
        // Close dropdowns
        const openDropdowns = document.querySelectorAll('.dropdown-menu.show');
        openDropdowns.forEach(dropdown => {
            dropdown.classList.remove('show');
        });
        
        // Close mobile menu
        const navbarCollapse = document.querySelector('.navbar-collapse.show');
        if (navbarCollapse) {
            const collapseInstance = bootstrap.Collapse.getInstance(navbarCollapse);
            if (collapseInstance) {
                collapseInstance.hide();
            }
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