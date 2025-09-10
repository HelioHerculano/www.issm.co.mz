/**
 * Entity Dashboard Charts - ISSM Portal das Entidades
 * Custom charts for insurance policy verification requests
 */

// Sample data for demonstration
const entityDashboardData = {
    stats: {
        totalRequests: 156,
        pendingRequests: 23,
        approvedRequests: 118,
        rejectedRequests: 15
    },
    monthlyTrends: {
        labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
        requests: [12, 19, 15, 25, 28, 35, 31, 29, 33, 38, 42, 45],
        approved: [10, 16, 12, 20, 24, 30, 27, 25, 29, 34, 38, 40],
        rejected: [1, 2, 2, 3, 2, 3, 2, 2, 2, 2, 2, 3]
    },
    statusDistribution: {
        approved: 118,
        pending: 23,
        inReview: 8,
        rejected: 15
    },
    responseTime: {
        labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
        avgTime: [2.1, 2.8, 2.4, 2.2] // in days
    }
};

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeStatistics();
    initializeCharts();
    initializeEventHandlers();
});

// Update statistics cards with data
function initializeStatistics() {
    document.getElementById('total-requests').textContent = entityDashboardData.stats.totalRequests;
    document.getElementById('pending-requests').textContent = entityDashboardData.stats.pendingRequests;
    document.getElementById('approved-requests').textContent = entityDashboardData.stats.approvedRequests;
    document.getElementById('rejected-requests').textContent = entityDashboardData.stats.rejectedRequests;
    
    // Update chart counters
    document.getElementById('chart-approved-count').textContent = entityDashboardData.statusDistribution.approved;
    document.getElementById('chart-pending-count').textContent = entityDashboardData.statusDistribution.pending;
    document.getElementById('chart-review-count').textContent = entityDashboardData.statusDistribution.inReview;
    document.getElementById('chart-rejected-count').textContent = entityDashboardData.statusDistribution.rejected;
    
    // Calculate growth percentages (mock data)
    document.getElementById('total-growth').textContent = '+12.5%';
    document.getElementById('approved-growth').textContent = '+8.3%';
    document.getElementById('rejected-rate').textContent = '9.6%';
}

// Initialize all charts
function initializeCharts() {
    initMonthlyTrendsChart();
    initStatusDistributionChart();
    initResponseTimeChart();
}

// Monthly Request Trends Chart
function initMonthlyTrendsChart() {
    const options = {
        series: [{
            name: 'Total Solicitações',
            type: 'area',
            data: entityDashboardData.monthlyTrends.requests
        }, {
            name: 'Aprovadas',
            type: 'line',
            data: entityDashboardData.monthlyTrends.approved
        }, {
            name: 'Rejeitadas',
            type: 'line',
            data: entityDashboardData.monthlyTrends.rejected
        }],
        chart: {
            height: 350,
            type: 'line',
            stacked: false,
            toolbar: {
                show: true,
                tools: {
                    download: true,
                    selection: false,
                    zoom: false,
                    zoomin: false,
                    zoomout: false,
                    pan: false,
                    reset: false
                }
            }
        },
        colors: ['#3b82f6', '#10b981', '#ef4444'],
        stroke: {
            width: [0, 3, 3],
            curve: 'smooth'
        },
        plotOptions: {
            bar: {
                columnWidth: '50%'
            }
        },
        fill: {
            opacity: [0.85, 1, 1],
            gradient: {
                inverseColors: false,
                shade: 'light',
                type: "vertical",
                stops: [0, 100, 100, 100]
            }
        },
        labels: entityDashboardData.monthlyTrends.labels,
        markers: {
            size: 0
        },
        xaxis: {
            type: 'category'
        },
        yaxis: {
            title: {
                text: 'Número de Solicitações',
            },
            min: 0
        },
        tooltip: {
            shared: true,
            intersect: false,
            y: {
                formatter: function (y) {
                    if (typeof y !== "undefined") {
                        return y.toFixed(0) + " solicitações";
                    }
                    return y;
                }
            }
        },
        legend: {
            position: 'top',
            horizontalAlign: 'right'
        }
    };

    const chart = new ApexCharts(document.querySelector("#monthly-trends-chart"), options);
    chart.render();
}

// Status Distribution Pie Chart
function initStatusDistributionChart() {
    const options = {
        series: [
            entityDashboardData.statusDistribution.approved,
            entityDashboardData.statusDistribution.pending,
            entityDashboardData.statusDistribution.inReview,
            entityDashboardData.statusDistribution.rejected
        ],
        chart: {
            type: 'donut',
            height: 280
        },
        labels: ['Aprovadas', 'Pendentes', 'Em Análise', 'Rejeitadas'],
        colors: ['#10b981', '#f59e0b', '#3b82f6', '#ef4444'],
        legend: {
            show: false
        },
        plotOptions: {
            pie: {
                donut: {
                    size: '75%',
                    labels: {
                        show: true,
                        name: {
                            show: true,
                            fontSize: '16px',
                            fontWeight: 600,
                            offsetY: -10
                        },
                        value: {
                            show: true,
                            fontSize: '24px',
                            fontWeight: 700,
                            offsetY: 10,
                            formatter: function (val) {
                                return parseInt(val)
                            }
                        },
                        total: {
                            show: true,
                            label: 'Total',
                            fontSize: '14px',
                            fontWeight: 400,
                            formatter: function (w) {
                                return w.globals.seriesTotals.reduce((a, b) => {
                                    return a + b
                                }, 0)
                            }
                        }
                    }
                }
            }
        },
        dataLabels: {
            enabled: false
        },
        tooltip: {
            y: {
                formatter: function (val) {
                    return val + " solicitações"
                }
            }
        }
    };

    const chart = new ApexCharts(document.querySelector("#status-distribution-chart"), options);
    chart.render();
}

// Response Time Analytics Chart
function initResponseTimeChart() {
    const options = {
        series: [{
            name: 'Tempo Médio (dias)',
            data: entityDashboardData.responseTime.avgTime
        }],
        chart: {
            type: 'bar',
            height: 300,
            toolbar: {
                show: false
            }
        },
        colors: ['#3b82f6'],
        plotOptions: {
            bar: {
                borderRadius: 4,
                horizontal: false,
                columnWidth: '50%',
            }
        },
        dataLabels: {
            enabled: true,
            formatter: function (val) {
                return val.toFixed(1) + 'd'
            }
        },
        stroke: {
            show: true,
            width: 2,
            colors: ['transparent']
        },
        xaxis: {
            categories: entityDashboardData.responseTime.labels,
        },
        yaxis: {
            title: {
                text: 'Dias'
            },
            min: 0,
            max: 5
        },
        fill: {
            opacity: 1
        },
        tooltip: {
            y: {
                formatter: function (val) {
                    return val.toFixed(1) + " dias"
                }
            }
        },
        grid: {
            borderColor: '#e7e7e7',
            row: {
                colors: ['#f3f3f3', 'transparent'],
                opacity: 0.5
            },
        }
    };

    const chart = new ApexCharts(document.querySelector("#response-time-chart"), options);
    chart.render();
}

// Event handlers for interactive elements
function initializeEventHandlers() {
    // Status filter for recent requests table
    const statusFilter = document.getElementById('status-filter-recent');
    if (statusFilter) {
        statusFilter.addEventListener('change', function() {
            filterRecentRequests(this.value);
        });
    }
}

// Update trends chart based on time period
function updateTrendsChart(period) {
    // Remove active class from all buttons
    document.querySelectorAll('.btn-outline-light').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Add active class to clicked button
    event.target.classList.add('active');
    
    // Here you would typically fetch new data based on the period
    console.log('Updating trends chart for period:', period);
}

// Filter recent requests table
function filterRecentRequests(status) {
    const tableRows = document.querySelectorAll('#recent-requests-table tbody tr');
    
    tableRows.forEach(row => {
        if (status === '' || row.dataset.status === status) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// Action handlers for request management
function cancelRequest(requestId) {
    if (confirm('Tem certeza que deseja cancelar esta solicitação?')) {
        console.log('Canceling request:', requestId);
        // Here you would make an API call to cancel the request
        alert('Solicitação cancelada com sucesso!');
    }
}

function downloadCertificate(requestId) {
    console.log('Downloading certificate for request:', requestId);
    // Here you would trigger certificate download
    alert('Download do certificado iniciado!');
}

function followUp(requestId) {
    console.log('Following up on request:', requestId);
    // Here you would create a follow-up action
    alert('Notificação de acompanhamento enviada!');
}

// Utility function to format numbers
function formatNumber(num) {
    return new Intl.NumberFormat('pt-MZ').format(num);
}

// Utility function to format dates
function formatDate(date) {
    return new Intl.DateTimeFormat('pt-MZ', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(new Date(date));
}

// Export functions for global access
window.updateTrendsChart = updateTrendsChart;
window.cancelRequest = cancelRequest;
window.downloadCertificate = downloadCertificate;
window.followUp = followUp;