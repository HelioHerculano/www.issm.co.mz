/**
 * ISSM Portal - Statistics Dashboard
 * Interactive statistics dashboard with real-time data visualization
 */

class StatisticsDashboard {
    constructor() {
        this.apiEndpoint = '/api/v1/statistics';
        this.chartInstances = new Map();
        this.animationQueue = [];
        this.isInitialized = false;
        this.updateInterval = null;
        
        // Statistics data structure
        this.statisticsData = {
            totalRequests: {
                current: 3480,
                previousPeriod: 3120,
                trend: 'up',
                percentage: 12
            },
            averageResponseTime: {
                hours: 18,
                minutes: 30,
                trend: 'improving',
                reduction: 6
            },
            successRate: {
                percentage: 94.2,
                breakdown: {
                    approved: 3276,
                    pending: 156,
                    rejected: 48
                },
                trend: 'stable',
                change: 0.2
            },
            activeInsurers: {
                count: 28,
                recentlyJoined: ['Seguradora Maputo', 'Hollard Moçambique'],
                trend: 'up',
                newCount: 2
            },
            monthlyTrends: {
                labels: ['Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
                requests: [420, 450, 440, 470, 485, 520],
                responseTime: [22, 20, 18, 19, 17, 16]
            },
            responseDistribution: {
                labels: ['< 2h', '2-12h', '12-24h', '> 24h'],
                values: [15, 45, 32, 8],
                colors: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444']
            }
        };
    }

    /**
     * Initialize the statistics dashboard
     */
    async init() {
        if (this.isInitialized) return;
        
        try {
            console.log('Initializing Statistics Dashboard...');
            
            // Check if dashboard container exists
            const dashboardContainer = document.querySelector('.statistics-dashboard');
            if (!dashboardContainer) {
                console.warn('Statistics dashboard container not found');
                return;
            }

            // Initialize components in sequence
            await this.loadStatistics();
            this.initializeCounters();
            this.initializeCharts();
            this.initScrollAnimations();
            this.startRealTimeUpdates();
            
            this.isInitialized = true;
            console.log('Statistics Dashboard initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize Statistics Dashboard:', error);
            this.handleInitializationError();
        }
    }

    /**
     * Load statistics data (from API or mock data)
     */
    async loadStatistics() {
        try {
            // Try to fetch from API first
            if (this.isApiAvailable()) {
                const response = await fetch(this.apiEndpoint);
                if (response.ok) {
                    this.statisticsData = await response.json();
                    console.log('Statistics loaded from API');
                    return;
                }
            }
            
            // Use mock data as fallback
            console.log('Using mock statistics data');
            await this.simulateApiDelay();
            
        } catch (error) {
            console.warn('Failed to load statistics from API, using mock data:', error);
        }
    }

    /**
     * Check if API is available
     */
    isApiAvailable() {
        return false; // Set to true when API is implemented
    }

    /**
     * Simulate API delay for demo purposes
     */
    async simulateApiDelay() {
        return new Promise(resolve => setTimeout(resolve, 500));
    }

    /**
     * Initialize animated counters
     */
    initializeCounters() {
        const counters = document.querySelectorAll('.stat-number[data-target]');
        
        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-target'));
            this.animateCounter(counter, target);
        });
    }

    /**
     * Animate counter from 0 to target value
     */
    animateCounter(element, target, duration = 2000) {
        let current = 0;
        const increment = target / (duration / 16); // 60fps
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
                element.classList.add('stat-highlight');
                setTimeout(() => element.classList.remove('stat-highlight'), 1000);
            }
            element.textContent = Math.floor(current).toLocaleString();
        }, 16);
    }

    /**
     * Initialize ApexCharts
     */
    initializeCharts() {
        this.createMonthlyTrendChart();
        this.createResponseDistributionChart();
    }

    /**
     * Create monthly trend chart
     */
    createMonthlyTrendChart() {
        const chartElement = document.querySelector('#monthly-trend-chart');
        if (!chartElement) return;

        const options = {
            series: [{
                name: 'Solicitações',
                data: this.statisticsData.monthlyTrends.requests,
                type: 'area'
            }],
            chart: {
                height: 120,
                type: 'area',
                toolbar: { show: false },
                zoom: { enabled: false },
                sparkline: { enabled: true }
            },
            colors: ['#d78b29'],
            fill: {
                type: 'gradient',
                gradient: {
                    shadeIntensity: 1,
                    opacityFrom: 0.7,
                    opacityTo: 0.1,
                    stops: [0, 90, 100]
                }
            },
            stroke: {
                curve: 'smooth',
                width: 3
            },
            xaxis: {
                categories: this.statisticsData.monthlyTrends.labels,
                labels: { show: false },
                axisBorder: { show: false },
                axisTicks: { show: false }
            },
            yaxis: {
                labels: { show: false }
            },
            grid: {
                show: false,
                padding: {
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0
                }
            },
            tooltip: {
                enabled: true,
                theme: 'light',
                style: {
                    fontSize: '12px'
                },
                y: {
                    formatter: function(value) {
                        return value + ' solicitações';
                    }
                }
            },
            dataLabels: {
                enabled: false
            }
        };

        try {
            const chart = new ApexCharts(chartElement, options);
            chart.render();
            this.chartInstances.set('monthlyTrend', chart);
            console.log('Monthly trend chart created successfully');
        } catch (error) {
            console.error('Failed to create monthly trend chart:', error);
            this.showChartError(chartElement, 'Erro ao carregar gráfico de tendência');
        }
    }

    /**
     * Create response distribution chart
     */
    createResponseDistributionChart() {
        const chartElement = document.querySelector('#response-distribution-chart');
        if (!chartElement) return;

        const options = {
            series: this.statisticsData.responseDistribution.values,
            chart: {
                height: 120,
                type: 'donut',
                sparkline: { enabled: true }
            },
            colors: this.statisticsData.responseDistribution.colors,
            labels: this.statisticsData.responseDistribution.labels,
            plotOptions: {
                pie: {
                    donut: {
                        size: '65%',
                        labels: {
                            show: false
                        }
                    }
                }
            },
            stroke: {
                width: 2,
                colors: ['transparent']
            },
            legend: {
                show: false
            },
            tooltip: {
                enabled: true,
                theme: 'light',
                style: {
                    fontSize: '12px'
                },
                y: {
                    formatter: function(value) {
                        return value + '%';
                    }
                }
            },
            dataLabels: {
                enabled: false
            }
        };

        try {
            const chart = new ApexCharts(chartElement, options);
            chart.render();
            this.chartInstances.set('responseDistribution', chart);
            console.log('Response distribution chart created successfully');
        } catch (error) {
            console.error('Failed to create response distribution chart:', error);
            this.showChartError(chartElement, 'Erro ao carregar gráfico de distribuição');
        }
    }

    /**
     * Show chart error message
     */
    showChartError(element, message) {
        element.innerHTML = `
            <div class="chart-error">
                <iconify-icon icon="solar:danger-triangle-bold-duotone"></iconify-icon>
                ${message}
            </div>
        `;
    }

    /**
     * Initialize scroll animations
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
                    
                    // Trigger chart animations when visible
                    if (entry.target.classList.contains('statistics-dashboard')) {
                        this.triggerChartAnimations();
                    }
                }
            });
        }, observerOptions);

        const dashboardElement = document.querySelector('.statistics-dashboard');
        if (dashboardElement) {
            observer.observe(dashboardElement);
        }
    }

    /**
     * Trigger chart animations
     */
    triggerChartAnimations() {
        this.chartInstances.forEach((chart, name) => {
            try {
                setTimeout(() => {
                    chart.updateOptions({
                        chart: {
                            animations: {
                                enabled: true,
                                easing: 'easeinout',
                                speed: 800
                            }
                        }
                    });
                }, 500);
            } catch (error) {
                console.warn(`Failed to animate chart ${name}:`, error);
            }
        });
    }

    /**
     * Start real-time updates
     */
    startRealTimeUpdates() {
        // Update statistics every 30 seconds (demo purposes)
        this.updateInterval = setInterval(() => {
            this.updateStatistics();
        }, 30000);
    }

    /**
     * Update statistics with new data
     */
    async updateStatistics() {
        try {
            // Simulate data changes
            this.simulateDataChanges();
            
            // Update counter displays
            this.updateCounterDisplays();
            
            // Update charts
            this.updateCharts();
            
            console.log('Statistics updated');
        } catch (error) {
            console.error('Failed to update statistics:', error);
        }
    }

    /**
     * Simulate realistic data changes
     */
    simulateDataChanges() {
        // Randomly adjust statistics within realistic bounds
        const variations = {
            totalRequests: Math.floor(Math.random() * 10) - 5, // ±5
            successRate: (Math.random() * 2 - 1) * 0.5, // ±0.5%
            activeInsurers: Math.random() > 0.9 ? 1 : 0, // Occasional increase
            responseTime: Math.floor(Math.random() * 4) - 2 // ±2 hours
        };

        // Apply variations
        this.statisticsData.totalRequests.current += variations.totalRequests;
        this.statisticsData.successRate.percentage += variations.successRate;
        this.statisticsData.activeInsurers.count += variations.activeInsurers;
        
        // Keep values within realistic bounds
        this.statisticsData.totalRequests.current = Math.max(3000, this.statisticsData.totalRequests.current);
        this.statisticsData.successRate.percentage = Math.max(85, Math.min(98, this.statisticsData.successRate.percentage));
        this.statisticsData.activeInsurers.count = Math.max(25, Math.min(35, this.statisticsData.activeInsurers.count));
    }

    /**
     * Update counter displays
     */
    updateCounterDisplays() {
        const totalRequestsElement = document.querySelector('#total-requests-card .stat-number');
        const successRateElement = document.querySelector('#success-rate-card .stat-number');
        const activeInsurersElement = document.querySelector('#active-insurers-card .stat-number');

        if (totalRequestsElement) {
            this.animateCounter(totalRequestsElement, this.statisticsData.totalRequests.current, 1000);
        }
        
        if (successRateElement) {
            this.animateCounter(successRateElement, Math.round(this.statisticsData.successRate.percentage), 1000);
        }
        
        if (activeInsurersElement) {
            this.animateCounter(activeInsurersElement, this.statisticsData.activeInsurers.count, 1000);
        }
    }

    /**
     * Update charts with new data
     */
    updateCharts() {
        const monthlyChart = this.chartInstances.get('monthlyTrend');
        if (monthlyChart) {
            // Add new data point and remove oldest
            const newRequests = [...this.statisticsData.monthlyTrends.requests];
            newRequests.shift();
            newRequests.push(Math.floor(Math.random() * 100) + 400);
            
            monthlyChart.updateSeries([{
                data: newRequests
            }]);
        }
    }

    /**
     * Handle initialization errors
     */
    handleInitializationError() {
        const dashboardElement = document.querySelector('.statistics-dashboard');
        if (dashboardElement) {
            dashboardElement.innerHTML = `
                <div class="text-center py-4">
                    <iconify-icon icon="solar:danger-triangle-bold-duotone" class="text-warning fs-24 mb-2"></iconify-icon>
                    <h6>Erro ao carregar estatísticas</h6>
                    <p class="text-muted small mb-3">Não foi possível carregar os dados do dashboard.</p>
                    <button class="btn btn-outline-primary btn-sm" onclick="statisticsDashboard.init()">
                        <iconify-icon icon="solar:refresh-bold-duotone" class="me-1"></iconify-icon>
                        Tentar Novamente
                    </button>
                </div>
            `;
        }
    }

    /**
     * Destroy dashboard and clean up resources
     */
    destroy() {
        // Clear update interval
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }

        // Destroy charts
        this.chartInstances.forEach((chart, name) => {
            try {
                chart.destroy();
            } catch (error) {
                console.warn(`Failed to destroy chart ${name}:`, error);
            }
        });
        
        this.chartInstances.clear();
        this.isInitialized = false;
        
        console.log('Statistics Dashboard destroyed');
    }

    /**
     * Refresh dashboard data
     */
    async refresh() {
        console.log('Refreshing Statistics Dashboard...');
        await this.loadStatistics();
        this.updateCounterDisplays();
        this.updateCharts();
    }
}

/**
 * Landing Page Integration
 */
class LandingPageEnhancements {
    constructor() {
        this.statisticsDashboard = null;
        this.init();
    }

    init() {
        // Initialize when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeComponents());
        } else {
            this.initializeComponents();
        }
    }

    async initializeComponents() {
        // Initialize statistics dashboard
        this.statisticsDashboard = new StatisticsDashboard();
        await this.statisticsDashboard.init();

        // Add enhanced interactions
        this.initializeEnhancedInteractions();
        
        console.log('Landing Page Enhancements initialized');
    }

    initializeEnhancedInteractions() {
        // Add hover effects to statistics cards
        const statCards = document.querySelectorAll('.statistics-card');
        statCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-4px) scale(1.02)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0) scale(1)';
            });
        });

        // Add click handlers for dashboard refresh
        const refreshButton = document.querySelector('.dashboard-refresh');
        if (refreshButton) {
            refreshButton.addEventListener('click', () => {
                if (this.statisticsDashboard) {
                    this.statisticsDashboard.refresh();
                }
            });
        }
    }
}

// Global instances
let statisticsDashboard;
let landingPageEnhancements;

// Initialize when script loads
(function() {
    console.log('Statistics Dashboard script loaded');
    
    // Check if ApexCharts is available
    if (typeof ApexCharts === 'undefined') {
        console.error('ApexCharts library is required for Statistics Dashboard');
        return;
    }

    // Initialize enhancements
    landingPageEnhancements = new LandingPageEnhancements();
})();

// Expose global functions for debugging and external access
window.StatisticsDashboard = StatisticsDashboard;
window.refreshStatistics = function() {
    if (landingPageEnhancements && landingPageEnhancements.statisticsDashboard) {
        landingPageEnhancements.statisticsDashboard.refresh();
    }
};

// Clean up on page unload
window.addEventListener('beforeunload', () => {
    if (landingPageEnhancements && landingPageEnhancements.statisticsDashboard) {
        landingPageEnhancements.statisticsDashboard.destroy();
    }
});