/**
 * Verification List Page - ISSM Portal das Entidades
 * Advanced filtering, search, and table management for verification requests
 */

// Sample verification requests data
const verificationRequestsData = [
    {
        id: 'REQ-2024-001',
        requestDate: '2024-01-05',
        policyNumber: 'POL-2024-789456',
        insuranceCompany: 'Empresa Seguradora A',
        verificationType: 'validity',
        status: 'pending',
        responseDate: null,
        requesterName: 'João Silva',
        documentCount: 2,
        priority: 'normal'
    },
    {
        id: 'REQ-2024-002',
        requestDate: '2024-01-03',
        policyNumber: 'POL-2024-123789',
        insuranceCompany: 'Seguradora Geral',
        verificationType: 'coverage',
        status: 'approved',
        responseDate: '2024-01-04',
        requesterName: 'Maria Santos',
        documentCount: 3,
        priority: 'normal'
    },
    {
        id: 'REQ-2024-003',
        requestDate: '2024-01-02',
        policyNumber: 'POL-2024-456123',
        insuranceCompany: 'Moçambique Vida',
        verificationType: 'claims_history',
        status: 'in_review',
        responseDate: null,
        requesterName: 'Carlos Machado',
        documentCount: 1,
        priority: 'high'
    },
    {
        id: 'REQ-2024-004',
        requestDate: '2024-01-01',
        policyNumber: 'POL-2024-987654',
        insuranceCompany: 'Emmanuel Seguradora',
        verificationType: 'validity',
        status: 'rejected',
        responseDate: '2024-01-02',
        requesterName: 'Ana Costa',
        documentCount: 2,
        priority: 'normal'
    },
    {
        id: 'REQ-2024-005',
        requestDate: '2023-12-28',
        policyNumber: 'POL-2023-654321',
        insuranceCompany: 'Empresa Seguradora A',
        verificationType: 'coverage',
        status: 'approved',
        responseDate: '2023-12-29',
        requesterName: 'Pedro Nunes',
        documentCount: 4,
        priority: 'normal'
    },
    {
        id: 'REQ-2024-006',
        requestDate: '2023-12-25',
        policyNumber: 'POL-2023-112233',
        insuranceCompany: 'Seguradora Geral',
        verificationType: 'validity',
        status: 'draft',
        responseDate: null,
        requesterName: 'Lucia Fernandes',
        documentCount: 1,
        priority: 'low'
    },
    {
        id: 'REQ-2024-007',
        requestDate: '2023-12-20',
        policyNumber: 'POL-2023-445566',
        insuranceCompany: 'Moçambique Vida',
        verificationType: 'coverage',
        status: 'cancelled',
        responseDate: null,
        requesterName: 'Ricardo Sousa',
        documentCount: 2,
        priority: 'normal'
    },
    {
        id: 'REQ-2024-008',
        requestDate: '2023-12-15',
        policyNumber: 'POL-2023-778899',
        insuranceCompany: 'Emmanuel Seguradora',
        verificationType: 'claims_history',
        status: 'approved',
        responseDate: '2023-12-18',
        requesterName: 'Sofia Mendes',
        documentCount: 3,
        priority: 'normal'
    },
    {
        id: 'REQ-2024-009',
        requestDate: '2023-12-10',
        policyNumber: 'POL-2023-334455',
        insuranceCompany: 'Empresa Seguradora A',
        verificationType: 'validity',
        status: 'in_review',
        responseDate: null,
        requesterName: 'Miguel Torres',
        documentCount: 2,
        priority: 'high'
    },
    {
        id: 'REQ-2024-010',
        requestDate: '2023-12-05',
        policyNumber: 'POL-2023-556677',
        insuranceCompany: 'Seguradora Geral',
        verificationType: 'coverage',
        status: 'pending',
        responseDate: null,
        requesterName: 'Isabel Rodrigues',
        documentCount: 1,
        priority: 'normal'
    }
];

// Global variables
let currentData = [...verificationRequestsData];
let currentPage = 1;
let entriesPerPage = 10;
let selectedRequests = new Set();

// Initialize page when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeFilters();
    renderTable();
    setupEventHandlers();
    updateResultsSummary();
});

// Initialize filter values
function initializeFilters() {
    // Set default date range (last 30 days)
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    document.getElementById('date-to').value = formatDateForInput(today);
    document.getElementById('date-from').value = formatDateForInput(thirtyDaysAgo);
    
    // Check if there are URL parameters to set filters
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('status')) {
        document.getElementById('status-filter').value = urlParams.get('status');
        applyFilters();
    }
}

// Setup event handlers
function setupEventHandlers() {
    // Search functionality
    document.getElementById('search-btn').addEventListener('click', applyFilters);
    document.getElementById('search-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            applyFilters();
        }
    });
    
    // Filter buttons
    document.getElementById('apply-filters').addEventListener('click', applyFilters);
    document.getElementById('clear-filters').addEventListener('click', clearFilters);
    
    // Entries per page
    document.getElementById('entries-per-page').addEventListener('change', function() {
        entriesPerPage = parseInt(this.value);
        currentPage = 1;
        renderTable();
        updatePagination();
    });
    
    // Select all checkbox
    document.getElementById('select-all').addEventListener('change', function() {
        const checkboxes = document.querySelectorAll('tbody input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = this.checked;
            if (this.checked) {
                selectedRequests.add(checkbox.dataset.requestId);
            } else {
                selectedRequests.delete(checkbox.dataset.requestId);
            }
        });
        updateBulkActionsButton();
    });
}

// Apply filters to the data
function applyFilters() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const statusFilter = document.getElementById('status-filter').value;
    const typeFilter = document.getElementById('type-filter').value;
    const companyFilter = document.getElementById('company-filter').value;
    const dateFrom = document.getElementById('date-from').value;
    const dateTo = document.getElementById('date-to').value;
    
    currentData = verificationRequestsData.filter(request => {
        // Search filter
        const matchesSearch = !searchTerm || 
            request.id.toLowerCase().includes(searchTerm) ||
            request.policyNumber.toLowerCase().includes(searchTerm) ||
            request.insuranceCompany.toLowerCase().includes(searchTerm) ||
            request.requesterName.toLowerCase().includes(searchTerm);
        
        // Status filter
        const matchesStatus = !statusFilter || request.status === statusFilter;
        
        // Type filter
        const matchesType = !typeFilter || request.verificationType === typeFilter;
        
        // Company filter
        const matchesCompany = !companyFilter || 
            request.insuranceCompany.toLowerCase().replace(/\s+/g, '-') === companyFilter;
        
        // Date range filter
        const requestDate = new Date(request.requestDate);
        const matchesDateFrom = !dateFrom || requestDate >= new Date(dateFrom);
        const matchesDateTo = !dateTo || requestDate <= new Date(dateTo);
        
        return matchesSearch && matchesStatus && matchesType && matchesCompany && 
               matchesDateFrom && matchesDateTo;
    });
    
    currentPage = 1;
    selectedRequests.clear();
    renderTable();
    updateResultsSummary();
    updatePagination();
}

// Clear all filters
function clearFilters() {
    document.getElementById('search-input').value = '';
    document.getElementById('status-filter').value = '';
    document.getElementById('type-filter').value = '';
    document.getElementById('company-filter').value = '';
    document.getElementById('date-from').value = '';
    document.getElementById('date-to').value = '';
    
    currentData = [...verificationRequestsData];
    currentPage = 1;
    selectedRequests.clear();
    renderTable();
    updateResultsSummary();
    updatePagination();
}

// Render the table with current data
function renderTable() {
    const tbody = document.querySelector('#verification-requests-table tbody');
    const startIndex = (currentPage - 1) * entriesPerPage;
    const endIndex = startIndex + entriesPerPage;
    const pageData = currentData.slice(startIndex, endIndex);
    
    tbody.innerHTML = '';
    
    if (pageData.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" class="text-center py-4">
                    <div class="d-flex flex-column align-items-center">
                        <iconify-icon icon="solar:file-search-bold-duotone" class="fs-48 text-muted mb-2"></iconify-icon>
                        <h5 class="text-muted">Nenhuma solicitação encontrada</h5>
                        <p class="text-muted mb-0">Tente ajustar seus filtros de busca ou criar uma nova solicitação.</p>
                        <a href="verificacao-criar.html" class="btn btn-primary mt-2">
                            <iconify-icon icon="solar:add-circle-bold" class="me-1"></iconify-icon>
                            Nova Solicitação
                        </a>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    pageData.forEach(request => {
        const row = createTableRow(request);
        tbody.appendChild(row);
    });
    
    updatePagination();
}

// Create a table row for a verification request
function createTableRow(request) {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td class="ps-3">
            <input type="checkbox" class="form-check-input" data-request-id="${request.id}" 
                   onchange="handleRowSelection('${request.id}', this.checked)">
        </td>
        <td>
            <a href="verificacao-detalhes.html?id=${request.id}" class="text-primary fw-semibold">
                ${request.id}
            </a>
            ${request.priority === 'high' ? '<span class="badge bg-danger ms-1">Alta</span>' : ''}
        </td>
        <td>${formatDate(request.requestDate)}</td>
        <td>
            <div class="d-flex align-items-center">
                <iconify-icon icon="solar:document-text-bold-duotone" class="text-muted me-2"></iconify-icon>
                ${request.policyNumber}
            </div>
        </td>
        <td>${request.insuranceCompany}</td>
        <td>${getVerificationTypeBadge(request.verificationType)}</td>
        <td>${getStatusBadge(request.status)}</td>
        <td>${request.responseDate ? formatDate(request.responseDate) : '<span class="text-muted">-</span>'}</td>
        <td class="text-center table-actions">
            <div class="dropdown">
                <a href="#" class="dropdown-toggle card-drop" data-bs-toggle="dropdown" aria-expanded="false">
                    <iconify-icon icon="solar:menu-dots-bold" class="text-muted"></iconify-icon>
                </a>
                <div class="dropdown-menu dropdown-menu-end">
                    <a class="dropdown-item" href="verificacao-detalhes.html?id=${request.id}">
                        <iconify-icon icon="solar:eye-bold" class="me-1"></iconify-icon> Ver Detalhes
                    </a>
                    ${getActionMenuItems(request)}
                </div>
            </div>
        </td>
    `;
    return row;
}

// Get verification type badge
function getVerificationTypeBadge(type) {
    const badges = {
        'validity': '<span class="badge badge-soft-info verification-type-badge">Validade</span>',
        'coverage': '<span class="badge badge-soft-primary verification-type-badge">Cobertura</span>',
        'claims_history': '<span class="badge badge-soft-secondary verification-type-badge">Histórico</span>'
    };
    return badges[type] || '<span class="badge badge-soft-light verification-type-badge">N/A</span>';
}

// Get status badge
function getStatusBadge(status) {
    const badges = {
        'draft': '<span class="badge bg-light text-dark status-badge">Rascunho</span>',
        'pending': '<span class="badge bg-warning status-badge">Pendente</span>',
        'in_review': '<span class="badge bg-info status-badge">Em Análise</span>',
        'approved': '<span class="badge bg-success status-badge">Aprovado</span>',
        'rejected': '<span class="badge bg-danger status-badge">Rejeitado</span>',
        'cancelled': '<span class="badge bg-secondary status-badge">Cancelado</span>'
    };
    return badges[status] || '<span class="badge bg-light status-badge">N/A</span>';
}

// Get action menu items based on status
function getActionMenuItems(request) {
    let items = '';
    
    switch (request.status) {
        case 'draft':
            items = `
                <a class="dropdown-item" href="verificacao-editar.html?id=${request.id}">
                    <iconify-icon icon="solar:pen-bold" class="me-1"></iconify-icon> Editar
                </a>
                <a class="dropdown-item" href="#" onclick="submitRequest('${request.id}')">
                    <iconify-icon icon="solar:send-square-bold" class="me-1"></iconify-icon> Submeter
                </a>
                <div class="dropdown-divider"></div>
                <a class="dropdown-item text-danger" href="#" onclick="deleteRequest('${request.id}')">
                    <iconify-icon icon="solar:trash-bin-minimalistic-bold" class="me-1"></iconify-icon> Excluir
                </a>
            `;
            break;
        case 'pending':
        case 'in_review':
            items = `
                <a class="dropdown-item" href="verificacao-editar.html?id=${request.id}">
                    <iconify-icon icon="solar:pen-bold" class="me-1"></iconify-icon> Editar
                </a>
                <a class="dropdown-item" href="#" onclick="followUpRequest('${request.id}')">
                    <iconify-icon icon="solar:bell-bold" class="me-1"></iconify-icon> Acompanhar
                </a>
                <div class="dropdown-divider"></div>
                <a class="dropdown-item text-warning" href="#" onclick="cancelRequest('${request.id}')">
                    <iconify-icon icon="solar:close-circle-bold" class="me-1"></iconify-icon> Cancelar
                </a>
            `;
            break;
        case 'approved':
            items = `
                <a class="dropdown-item" href="#" onclick="downloadCertificate('${request.id}')">
                    <iconify-icon icon="solar:download-bold" class="me-1"></iconify-icon> Baixar Certificado
                </a>
                <a class="dropdown-item" href="#" onclick="duplicateRequest('${request.id}')">
                    <iconify-icon icon="solar:copy-bold" class="me-1"></iconify-icon> Duplicar Solicitação
                </a>
            `;
            break;
        case 'rejected':
            items = `
                <a class="dropdown-item" href="verificacao-criar.html?retry=${request.id}">
                    <iconify-icon icon="solar:restart-bold" class="me-1"></iconify-icon> Nova Tentativa
                </a>
                <a class="dropdown-item" href="#" onclick="duplicateRequest('${request.id}')">
                    <iconify-icon icon="solar:copy-bold" class="me-1"></iconify-icon> Duplicar Solicitação
                </a>
            `;
            break;
        case 'cancelled':
            items = `
                <a class="dropdown-item" href="#" onclick="duplicateRequest('${request.id}')">
                    <iconify-icon icon="solar:copy-bold" class="me-1"></iconify-icon> Duplicar Solicitação
                </a>
            `;
            break;
        default:
            items = '';
    }
    
    return items;
}

// Handle row selection
function handleRowSelection(requestId, isSelected) {
    if (isSelected) {
        selectedRequests.add(requestId);
    } else {
        selectedRequests.delete(requestId);
    }
    updateBulkActionsButton();
}

// Update bulk actions button visibility
function updateBulkActionsButton() {
    const selectedCount = selectedRequests.size;
    const selectAllCheckbox = document.getElementById('select-all');
    
    // Update select all checkbox state
    const visibleCheckboxes = document.querySelectorAll('tbody input[type="checkbox"]');
    const checkedCheckboxes = document.querySelectorAll('tbody input[type="checkbox"]:checked');
    
    if (checkedCheckboxes.length === 0) {
        selectAllCheckbox.indeterminate = false;
        selectAllCheckbox.checked = false;
    } else if (checkedCheckboxes.length === visibleCheckboxes.length) {
        selectAllCheckbox.indeterminate = false;
        selectAllCheckbox.checked = true;
    } else {
        selectAllCheckbox.indeterminate = true;
        selectAllCheckbox.checked = false;
    }
    
    // Show/hide bulk actions
    if (selectedCount > 0) {
        showBulkActionsModal(selectedCount);
    }
}

// Show bulk actions modal
function showBulkActionsModal(count) {
    document.getElementById('selected-count').textContent = count;
    // Uncomment to show modal automatically when items are selected
    // const modal = new bootstrap.Modal(document.getElementById('bulkActionsModal'));
    // modal.show();
}

// Update results summary
function updateResultsSummary() {
    const total = currentData.length;
    const startIndex = (currentPage - 1) * entriesPerPage;
    const endIndex = Math.min(startIndex + entriesPerPage, total);
    const showing = total > 0 ? endIndex - startIndex : 0;
    
    document.getElementById('showing-count').textContent = showing;
    document.getElementById('total-count').textContent = verificationRequestsData.length;
    document.getElementById('page-start').textContent = total > 0 ? startIndex + 1 : 0;
    document.getElementById('page-end').textContent = endIndex;
    document.getElementById('page-total').textContent = total;
}

// Update pagination
function updatePagination() {
    const totalPages = Math.ceil(currentData.length / entriesPerPage);
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';
    
    if (totalPages <= 1) return;
    
    // Previous button
    const prevItem = document.createElement('li');
    prevItem.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
    prevItem.innerHTML = `
        <a href="#" class="page-link" onclick="changePage(${currentPage - 1})">
            <i class="bx bx-left-arrow-alt"></i>
        </a>
    `;
    pagination.appendChild(prevItem);
    
    // Page numbers
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);
    
    if (startPage > 1) {
        const firstItem = document.createElement('li');
        firstItem.className = 'page-item';
        firstItem.innerHTML = `<a href="#" class="page-link" onclick="changePage(1)">1</a>`;
        pagination.appendChild(firstItem);
        
        if (startPage > 2) {
            const dotsItem = document.createElement('li');
            dotsItem.className = 'page-item disabled';
            dotsItem.innerHTML = `<span class="page-link">...</span>`;
            pagination.appendChild(dotsItem);
        }
    }
    
    for (let i = startPage; i <= endPage; i++) {
        const pageItem = document.createElement('li');
        pageItem.className = `page-item ${i === currentPage ? 'active' : ''}`;
        pageItem.innerHTML = `<a href="#" class="page-link" onclick="changePage(${i})">${i}</a>`;
        pagination.appendChild(pageItem);
    }
    
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            const dotsItem = document.createElement('li');
            dotsItem.className = 'page-item disabled';
            dotsItem.innerHTML = `<span class="page-link">...</span>`;
            pagination.appendChild(dotsItem);
        }
        
        const lastItem = document.createElement('li');
        lastItem.className = 'page-item';
        lastItem.innerHTML = `<a href="#" class="page-link" onclick="changePage(${totalPages})">${totalPages}</a>`;
        pagination.appendChild(lastItem);
    }
    
    // Next button
    const nextItem = document.createElement('li');
    nextItem.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
    nextItem.innerHTML = `
        <a href="#" class="page-link" onclick="changePage(${currentPage + 1})">
            <i class="bx bx-right-arrow-alt"></i>
        </a>
    `;
    pagination.appendChild(nextItem);
}

// Change page
function changePage(page) {
    const totalPages = Math.ceil(currentData.length / entriesPerPage);
    if (page >= 1 && page <= totalPages) {
        currentPage = page;
        renderTable();
        updateResultsSummary();
    }
}

// Export data
function exportData(format) {
    console.log(`Exporting ${selectedRequests.size > 0 ? 'selected' : 'all'} data as ${format}`);
    // Implementation would depend on the backend API
    alert(`Exportando dados em formato ${format.toUpperCase()}...`);
}

// Action handlers
function submitRequest(requestId) {
    if (confirm('Tem certeza que deseja submeter esta solicitação?')) {
        console.log('Submitting request:', requestId);
        alert('Solicitação submetida com sucesso!');
        // Update the request status in the data and re-render
        const request = verificationRequestsData.find(r => r.id === requestId);
        if (request) {
            request.status = 'pending';
            renderTable();
        }
    }
}

function deleteRequest(requestId) {
    if (confirm('Tem certeza que deseja excluir esta solicitação? Esta ação não pode ser desfeita.')) {
        console.log('Deleting request:', requestId);
        alert('Solicitação excluída com sucesso!');
        // Remove from data and re-render
        const index = verificationRequestsData.findIndex(r => r.id === requestId);
        if (index > -1) {
            verificationRequestsData.splice(index, 1);
            applyFilters(); // Re-apply current filters
        }
    }
}

function cancelRequest(requestId) {
    if (confirm('Tem certeza que deseja cancelar esta solicitação?')) {
        console.log('Canceling request:', requestId);
        alert('Solicitação cancelada com sucesso!');
        const request = verificationRequestsData.find(r => r.id === requestId);
        if (request) {
            request.status = 'cancelled';
            renderTable();
        }
    }
}

function followUpRequest(requestId) {
    console.log('Following up on request:', requestId);
    alert('Notificação de acompanhamento enviada para a seguradora!');
}

function downloadCertificate(requestId) {
    console.log('Downloading certificate for request:', requestId);
    alert('Download do certificado de verificação iniciado!');
}

function duplicateRequest(requestId) {
    console.log('Duplicating request:', requestId);
    window.location.href = `verificacao-criar.html?duplicate=${requestId}`;
}

// Bulk actions
function bulkAction(action) {
    const selectedArray = Array.from(selectedRequests);
    console.log(`Performing bulk action '${action}' on:`, selectedArray);
    
    switch (action) {
        case 'export':
            alert(`Exportando ${selectedArray.length} solicitações...`);
            break;
        case 'cancel':
            if (confirm(`Tem certeza que deseja cancelar ${selectedArray.length} solicitações?`)) {
                alert(`${selectedArray.length} solicitações canceladas com sucesso!`);
                // Update status for selected requests
                selectedArray.forEach(id => {
                    const request = verificationRequestsData.find(r => r.id === id);
                    if (request && ['draft', 'pending'].includes(request.status)) {
                        request.status = 'cancelled';
                    }
                });
                selectedRequests.clear();
                renderTable();
            }
            break;
        case 'delete':
            if (confirm(`Tem certeza que deseja excluir ${selectedArray.length} rascunhos? Esta ação não pode ser desfeita.`)) {
                alert(`${selectedArray.length} rascunhos excluídos com sucesso!`);
                // Remove draft requests
                selectedArray.forEach(id => {
                    const index = verificationRequestsData.findIndex(r => r.id === id && r.status === 'draft');
                    if (index > -1) {
                        verificationRequestsData.splice(index, 1);
                    }
                });
                selectedRequests.clear();
                applyFilters();
            }
            break;
    }
    
    // Hide modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('bulkActionsModal'));
    if (modal) modal.hide();
}

// Utility functions
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('pt-MZ', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
}

function formatDateForInput(date) {
    return date.toISOString().split('T')[0];
}

// Export functions for global access
window.changePage = changePage;
window.handleRowSelection = handleRowSelection;
window.exportData = exportData;
window.submitRequest = submitRequest;
window.deleteRequest = deleteRequest;
window.cancelRequest = cancelRequest;
window.followUpRequest = followUpRequest;
window.downloadCertificate = downloadCertificate;
window.duplicateRequest = duplicateRequest;
window.bulkAction = bulkAction;