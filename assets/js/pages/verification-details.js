/**
 * Verification Details Page JavaScript - ISSM Portal das Entidades
 * Handles functionality for the verification request details page
 */

// Sample verification data
const verificationData = {
    id: 'REQ-2024-001',
    submissionDate: '2024-01-05T14:30:00',
    status: 'pending',
    policy: {
        number: 'POL-2024-789456',
        company: 'Empresa Seguradora A',
        insuredName: 'João Manuel Silva',
        period: '01/01/2024 - 31/12/2024',
        verificationType: 'Validade',
        reason: 'Renovação do contrato de prestação de serviços'
    },
    documents: [
        {
            name: 'apolice-exemplo.pdf',
            type: 'Documento da Apólice',
            size: '2.4 MB',
            uploadDate: '2024-01-05T14:25:00'
        },
        {
            name: 'identificacao-segurado.pdf',
            type: 'Identificação',
            size: '1.8 MB',
            uploadDate: '2024-01-05T14:26:00'
        }
    ],
    timeline: [
        {
            status: 'created',
            title: 'Solicitação Criada',
            date: '2024-01-05T14:30:00',
            description: 'Documentos enviados e validados',
            icon: 'solar:check-circle-bold',
            color: 'success'
        },
        {
            status: 'in_review',
            title: 'Em Revisão',
            date: '2024-01-05T15:00:00',
            description: 'Análise técnica iniciada',
            icon: 'solar:eye-bold',
            color: 'info'
        },
        {
            status: 'pending',
            title: 'Aguardando Análise',
            date: null,
            description: 'Tempo estimado: 2-3 dias úteis',
            icon: 'solar:clock-circle-bold',
            color: 'warning',
            current: true
        }
    ]
};

// Initialize page when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
    loadVerificationData();
    initializeEventHandlers();
});

// Initialize page components
function initializePage() {
    // Get request ID from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const requestId = urlParams.get('id') || 'REQ-2024-001';
    
    // Update page with request ID
    updateRequestInfo(requestId);
    
    // Initialize tooltips and other Bootstrap components
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

// Load verification data into the page
function loadVerificationData() {
    // Update request header
    document.getElementById('request-id').textContent = `Solicitação #${verificationData.id}`;
    document.getElementById('submission-date').textContent = formatDate(verificationData.submissionDate);
    document.getElementById('current-status').textContent = getStatusText(verificationData.status);
    document.getElementById('current-status').className = `badge fs-12 px-3 py-2 ${getStatusClass(verificationData.status)}`;
    
    // Update policy information
    document.getElementById('policy-number').textContent = verificationData.policy.number;
    document.getElementById('insurance-company').textContent = verificationData.policy.company;
    document.getElementById('insured-name').textContent = verificationData.policy.insuredName;
    document.getElementById('policy-period').textContent = verificationData.policy.period;
    document.getElementById('verification-type').textContent = verificationData.policy.verificationType;
    document.getElementById('verification-reason').textContent = verificationData.policy.reason;
    
    // Load documents
    loadDocumentsList();
    
    // Load status timeline
    loadStatusTimeline();
}

// Update request information
function updateRequestInfo(requestId) {
    // Update page title
    document.title = `Detalhes da Verificação ${requestId} | ISSM - Portal das Entidades`;
    
    // Update breadcrumb and other elements as needed
    console.log('Request ID loaded:', requestId);
}

// Load documents list
function loadDocumentsList() {
    const documentsList = document.getElementById('documents-list');
    documentsList.innerHTML = '';
    
    verificationData.documents.forEach(doc => {
        const docElement = createDocumentElement(doc);
        documentsList.appendChild(docElement);
    });
}

// Create document element
function createDocumentElement(doc) {
    const col = document.createElement('div');
    col.className = 'col-md-6 mb-3';
    
    col.innerHTML = `
        <div class="border rounded p-3 d-flex align-items-center">
            <div class="me-3">
                <iconify-icon icon="solar:file-text-bold-duotone" class="fs-24 ${getDocumentIconColor(doc.type)}"></iconify-icon>
            </div>
            <div class="flex-grow-1">
                <h6 class="mb-1">${doc.name}</h6>
                <p class="text-muted mb-0 small">${doc.type} • ${doc.size}</p>
            </div>
            <div>
                <button class="btn btn-soft-primary btn-sm" onclick="viewDocument('${doc.name}')">
                    <iconify-icon icon="solar:eye-bold"></iconify-icon>
                </button>
                <button class="btn btn-soft-success btn-sm ms-1" onclick="downloadDocument('${doc.name}')">
                    <iconify-icon icon="solar:download-bold"></iconify-icon>
                </button>
            </div>
        </div>
    `;
    
    return col;
}

// Load status timeline
function loadStatusTimeline() {
    const timeline = document.getElementById('status-timeline');
    timeline.innerHTML = '';
    
    verificationData.timeline.forEach(item => {
        const timelineElement = createTimelineElement(item);
        timeline.appendChild(timelineElement);
    });
}

// Create timeline element
function createTimelineElement(item) {
    const timelineItem = document.createElement('div');
    timelineItem.className = 'timeline-item';
    
    const dateText = item.date ? formatDateTime(item.date) : 'Status Atual';
    
    timelineItem.innerHTML = `
        <div class="timeline-icon bg-${item.color}">
            <iconify-icon icon="${item.icon}"></iconify-icon>
        </div>
        <div class="timeline-item-info">
            <h6 class="mt-0 mb-1">${item.title}</h6>
            <p class="text-muted mb-1">
                <small>${dateText}</small>
            </p>
            <p class="text-muted mb-0">
                <small>${item.description}</small>
            </p>
        </div>
    `;
    
    return timelineItem;
}

// Initialize event handlers
function initializeEventHandlers() {
    // Add comment form handler
    const commentForm = document.getElementById('comment-form');
    if (commentForm) {
        commentForm.addEventListener('submit', handleCommentSubmit);
    }
}

// Handle comment form submission
function handleCommentSubmit(e) {
    e.preventDefault();
    
    const commentText = document.getElementById('new-comment').value.trim();
    if (commentText) {
        addComment(commentText);
        document.getElementById('new-comment').value = '';
    }
}

// Add new comment to timeline
function addComment(commentText) {
    const timeline = document.getElementById('comments-timeline');
    
    const newComment = document.createElement('div');
    newComment.className = 'timeline-item';
    
    newComment.innerHTML = `
        <div class="timeline-icon bg-primary">
            <iconify-icon icon="solar:user-bold"></iconify-icon>
        </div>
        <div class="timeline-item-info">
            <h5 class="mt-0 mb-1">Entidade XYZ</h5>
            <p class="text-muted mb-2">
                <small>${formatDateTime(new Date())}</small>
            </p>
            <p class="mb-0">${commentText}</p>
        </div>
    `;
    
    timeline.appendChild(newComment);
    
    // Show success message
    showAlert('Comentário adicionado com sucesso!', 'success');
}

// Document viewer functions
function viewDocument(filename) {
    const modal = new bootstrap.Modal(document.getElementById('documentViewerModal'));
    const iframe = document.getElementById('documentFrame');
    
    // In a real application, this would be the actual document URL
    iframe.src = `../assets/documents/${filename}#toolbar=1&navpanes=1&scrollbar=1`;
    
    modal.show();
    
    // Store current document for download
    window.currentDocument = filename;
}

function downloadDocument(filename) {
    // Create a temporary link and trigger download
    const link = document.createElement('a');
    link.href = `../assets/documents/${filename}`;
    link.download = filename;
    link.click();
    
    showAlert('Download iniciado!', 'info');
}

function downloadCurrentDocument() {
    if (window.currentDocument) {
        downloadDocument(window.currentDocument);
    }
}

// Action functions
function printRequest() {
    window.print();
}

function downloadRequest() {
    // Generate and download request PDF
    showAlert('Preparando arquivo para download...', 'info');
    
    setTimeout(() => {
        const link = document.createElement('a');
        link.href = '#'; // Would be actual PDF URL
        link.download = `solicitacao-${verificationData.id}.pdf`;
        link.click();
        
        showAlert('Download iniciado!', 'success');
    }, 1000);
}

function trackRequest() {
    // Enable request tracking notifications
    showAlert('Notificações de acompanhamento ativadas!', 'success');
}

function contactSupport() {
    // Redirect to support contact page
    window.location.href = 'contato.html?ref=verification&id=' + verificationData.id;
}

function cancelRequest() {
    if (confirm('Tem certeza que deseja cancelar esta solicitação? Esta ação não pode ser desfeita.')) {
        // Show loading state
        showAlert('Cancelando solicitação...', 'warning');
        
        // Simulate API call
        setTimeout(() => {
            showAlert('Solicitação cancelada com sucesso!', 'success');
            
            // Update status
            document.getElementById('current-status').textContent = 'Cancelada';
            document.getElementById('current-status').className = 'badge bg-danger fs-12 px-3 py-2';
            
            // Redirect after a delay
            setTimeout(() => {
                window.location.href = 'verificacoes-lista.html';
            }, 2000);
        }, 1500);
    }
}

// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-PT', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }).format(date);
}

function formatDateTime(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-PT', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}

function getStatusText(status) {
    const statusMap = {
        'pending': 'Pendente',
        'in_review': 'Em Análise',
        'approved': 'Aprovado',
        'rejected': 'Rejeitado',
        'cancelled': 'Cancelado'
    };
    return statusMap[status] || 'Desconhecido';
}

function getStatusClass(status) {
    const classMap = {
        'pending': 'bg-warning',
        'in_review': 'bg-info',
        'approved': 'bg-success',
        'rejected': 'bg-danger',
        'cancelled': 'bg-secondary'
    };
    return classMap[status] || 'bg-secondary';
}

function getDocumentIconColor(type) {
    const colorMap = {
        'Documento da Apólice': 'text-primary',
        'Identificação': 'text-success',
        'Comprovativo': 'text-info',
        'Outro': 'text-muted'
    };
    return colorMap[type] || 'text-muted';
}

function showAlert(message, type = 'info') {
    // Create alert element
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alertDiv);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 3000);
}

// Export functions for global access
window.viewDocument = viewDocument;
window.downloadDocument = downloadDocument;
window.downloadCurrentDocument = downloadCurrentDocument;
window.printRequest = printRequest;
window.downloadRequest = downloadRequest;
window.trackRequest = trackRequest;
window.contactSupport = contactSupport;
window.cancelRequest = cancelRequest;