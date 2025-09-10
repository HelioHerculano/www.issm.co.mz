/**
 * Verification Edit Page JavaScript - ISSM Portal das Entidades
 * Handles functionality for editing verification requests
 */

// Original data for reset functionality
let originalFormData = {};
let currentFormData = {};
let newDocuments = [];

// Initialize page when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
    loadRequestData();
    setupFormHandlers();
    setupDocumentUpload();
});

// Initialize page components
function initializePage() {
    // Get request ID from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const requestId = urlParams.get('id') || 'REQ-2024-001';
    
    // Update page with request ID
    updateRequestInfo(requestId);
    
    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

// Load request data for editing
function loadRequestData() {
    // Simulate loading data from API
    const requestData = {
        id: 'REQ-2024-001',
        policyNumber: 'POL-2024-789456',
        insuranceCompany: 'Empresa Seguradora A',
        insuredName: 'João Manuel Silva',
        verificationType: 'validade',
        verificationReason: 'Renovação do contrato de prestação de serviços',
        contactPerson: 'Maria Santos',
        contactPhone: '+258 84 123 4567',
        contactEmail: 'maria.santos@entidadexyz.co.mz',
        urgencyLevel: 'normal',
        additionalNotes: 'Solicitação para renovação de contrato anual.',
        documents: [
            { name: 'apolice-exemplo.pdf', type: 'Documento da Apólice', size: '2.4 MB' },
            { name: 'identificacao-segurado.pdf', type: 'Identificação', size: '1.8 MB' }
        ]
    };
    
    // Store original data
    originalFormData = { ...requestData };
    
    // Populate form fields
    populateForm(requestData);
}

// Populate form with data
function populateForm(data) {
    document.getElementById('policy-number').value = data.policyNumber || '';
    document.getElementById('insurance-company').value = data.insuranceCompany || '';
    document.getElementById('insured-name').value = data.insuredName || '';
    document.getElementById('verification-type').value = data.verificationType || '';
    document.getElementById('verification-reason').value = data.verificationReason || '';
    
    // Mark form as loaded
    document.getElementById('edit-verification-form').dataset.loaded = 'true';
}

// Update request information
function updateRequestInfo(requestId) {
    document.title = `Editar Verificação ${requestId} | ISSM - Portal das Entidades`;
    document.getElementById('edit-request-id').textContent = `Editando Solicitação #${requestId}`;
    
    // Update links
    const detailsLink = document.querySelector('a[href*="verificacao-detalhes.html"]');
    if (detailsLink) {
        detailsLink.href = `verificacao-detalhes.html?id=${requestId}`;
    }
}

// Setup form event handlers
function setupFormHandlers() {
    const form = document.getElementById('edit-verification-form');
    
    // Form submission handler
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (validateForm()) {
            submitForm();
        }
    });
    
    // Auto-save functionality
    const formInputs = form.querySelectorAll('input, select, textarea');
    formInputs.forEach(input => {
        input.addEventListener('change', function() {
            autoSave();
        });
    });
    
    // Enable auto-save every 30 seconds
    setInterval(autoSave, 30000);
}

// Setup document upload functionality
function setupDocumentUpload() {
    const uploadArea = document.getElementById('document-upload-area');
    const fileInput = document.getElementById('additional-documents');
    
    // Drag and drop handlers
    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        uploadArea.classList.add('border-primary');
    });
    
    uploadArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        uploadArea.classList.remove('border-primary');
    });
    
    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        uploadArea.classList.remove('border-primary');
        
        const files = e.dataTransfer.files;
        handleFileSelection(files);
    });
    
    // File input change handler
    fileInput.addEventListener('change', function(e) {
        handleFileSelection(e.target.files);
    });
}

// Handle file selection
function handleFileSelection(files) {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    Array.from(files).forEach(file => {
        if (!allowedTypes.includes(file.type)) {
            showAlert('Tipo de arquivo não suportado: ' + file.name, 'warning');
            return;
        }
        
        if (file.size > maxSize) {
            showAlert('Arquivo muito grande: ' + file.name + ' (máximo 10MB)', 'warning');
            return;
        }
        
        // Add to new documents list
        newDocuments.push({
            file: file,
            name: file.name,
            type: getDocumentType(file.name),
            size: formatFileSize(file.size)
        });
    });
    
    updateNewDocumentsPreview();
    showAlert(`${files.length} arquivo(s) adicionado(s) com sucesso!`, 'success');
}

// Update new documents preview
function updateNewDocumentsPreview() {
    const previewDiv = document.getElementById('new-documents-preview');
    const listDiv = document.getElementById('new-documents-list');
    
    if (newDocuments.length === 0) {
        previewDiv.style.display = 'none';
        return;
    }
    
    previewDiv.style.display = 'block';
    listDiv.innerHTML = '';
    
    newDocuments.forEach((doc, index) => {
        const docElement = createNewDocumentElement(doc, index);
        listDiv.appendChild(docElement);
    });
}

// Create new document element
function createNewDocumentElement(doc, index) {
    const col = document.createElement('div');
    col.className = 'col-md-6 mb-3';
    
    col.innerHTML = `
        <div class="border border-success rounded p-3 d-flex align-items-center">
            <div class="me-3">
                <iconify-icon icon="solar:file-plus-bold-duotone" class="fs-24 text-success"></iconify-icon>
            </div>
            <div class="flex-grow-1">
                <h6 class="mb-1">${doc.name}</h6>
                <p class="text-muted mb-0 small">${doc.type} • ${doc.size}</p>
            </div>
            <div>
                <button type="button" class="btn btn-soft-danger btn-sm" onclick="removeNewDocument(${index})">
                    <iconify-icon icon="solar:trash-bin-minimalistic-bold"></iconify-icon>
                </button>
            </div>
        </div>
    `;
    
    return col;
}

// Form validation
function validateForm() {
    const form = document.getElementById('edit-verification-form');
    let isValid = true;
    
    // Clear previous validation
    form.querySelectorAll('.is-invalid').forEach(el => {
        el.classList.remove('is-invalid');
    });
    
    // Validate required fields
    const requiredFields = [
        'policy-number',
        'insurance-company',
        'insured-name',
        'verification-type',
        'verification-reason'
    ];
    
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (!field.value.trim()) {
            field.classList.add('is-invalid');
            isValid = false;
        }
    });
    
    if (!isValid) {
        showAlert('Por favor, preencha todos os campos obrigatórios.', 'warning');
    }
    
    return isValid;
}

// Submit form
function submitForm() {
    if (!validateForm()) {
        return;
    }
    
    // Show loading state
    const submitBtn = document.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Salvando...';
    submitBtn.disabled = true;
    
    // Simulate API call
    setTimeout(() => {
        // Reset button state
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        
        showAlert('Alterações salvas com sucesso!', 'success');
        
        // Redirect after success
        setTimeout(() => {
            window.location.href = 'verificacao-detalhes.html?id=REQ-2024-001';
        }, 2000);
    }, 1500);
}

// Auto-save functionality
function autoSave() {
    const form = document.getElementById('edit-verification-form');
    
    if (!form.dataset.loaded) {
        return; // Don't auto-save until form is fully loaded
    }
    
    // Get current form data
    currentFormData = getFormData();
    
    // Check if there are changes
    if (hasChanges()) {
        // Save to localStorage
        localStorage.setItem('edit-verification-draft', JSON.stringify(currentFormData));
        
        // Show auto-save indicator
        showAutoSaveIndicator();
    }
}

// Get current form data
function getFormData() {
    return {
        policyNumber: document.getElementById('policy-number').value,
        insuranceCompany: document.getElementById('insurance-company').value,
        insuredName: document.getElementById('insured-name').value,
        verificationType: document.getElementById('verification-type').value,
        verificationReason: document.getElementById('verification-reason').value,
        newDocuments: newDocuments.length
    };
}

// Check if form has changes
function hasChanges() {
    const current = getFormData();
    
    return (
        current.policyNumber !== originalFormData.policyNumber ||
        current.insuranceCompany !== originalFormData.insuranceCompany ||
        current.insuredName !== originalFormData.insuredName ||
        current.verificationType !== originalFormData.verificationType ||
        current.verificationReason !== originalFormData.verificationReason ||
        current.newDocuments > 0
    );
}

// Show auto-save indicator
function showAutoSaveIndicator() {
    // Create or update auto-save indicator
    let indicator = document.getElementById('auto-save-indicator');
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.id = 'auto-save-indicator';
        indicator.className = 'position-fixed bg-success text-white px-3 py-2 rounded';
        indicator.style.cssText = 'bottom: 20px; left: 20px; z-index: 9999; font-size: 14px;';
        document.body.appendChild(indicator);
    }
    
    indicator.innerHTML = '<iconify-icon icon="solar:diskette-bold" class="me-2"></iconify-icon>Rascunho salvo automaticamente';
    indicator.style.display = 'block';
    
    // Hide after 3 seconds
    setTimeout(() => {
        indicator.style.display = 'none';
    }, 3000);
}

// Action functions
function saveDraft() {
    autoSave();
    showAlert('Rascunho salvo com sucesso!', 'success');
}

function previewChanges() {
    const modal = new bootstrap.Modal(document.getElementById('previewModal'));
    const previewContent = document.getElementById('preview-content');
    
    // Generate preview content
    const formData = getFormData();
    previewContent.innerHTML = generatePreviewHTML(formData);
    
    modal.show();
}

function generatePreviewHTML(data) {
    return `
        <div class="row">
            <div class="col-md-6">
                <h6>Informações da Apólice</h6>
                <p><strong>Número:</strong> ${data.policyNumber}</p>
                <p><strong>Seguradora:</strong> ${data.insuranceCompany}</p>
                <p><strong>Segurado:</strong> ${data.insuredName}</p>
                <p><strong>Tipo:</strong> ${data.verificationType}</p>
            </div>
            <div class="col-md-6">
                <h6>Detalhes</h6>
                <p><strong>Motivo:</strong> ${data.verificationReason}</p>
                <p><strong>Novos documentos:</strong> ${data.newDocuments}</p>
            </div>
        </div>
    `;
}

function resetForm() {
    if (confirm('Tem certeza que deseja restaurar os dados originais? Todas as alterações serão perdidas.')) {
        populateForm(originalFormData);
        newDocuments = [];
        updateNewDocumentsPreview();
        
        // Clear validation
        document.querySelectorAll('.is-invalid').forEach(el => {
            el.classList.remove('is-invalid');
        });
        
        showAlert('Formulário restaurado aos dados originais.', 'info');
    }
}

function cancelEdit() {
    if (hasChanges()) {
        if (confirm('Você tem alterações não salvas. Tem certeza que deseja cancelar?')) {
            window.location.href = 'verificacao-detalhes.html?id=REQ-2024-001';
        }
    } else {
        window.location.href = 'verificacao-detalhes.html?id=REQ-2024-001';
    }
}

function removeDocument(filename) {
    if (confirm(`Tem certeza que deseja remover o documento "${filename}"?`)) {
        // Find and remove the document element
        const documentElements = document.querySelectorAll('#current-documents .border');
        documentElements.forEach(element => {
            const nameElement = element.querySelector('h6');
            if (nameElement && nameElement.textContent.trim() === filename) {
                element.closest('.col-md-6').remove();
            }
        });
        
        showAlert('Documento removido. Lembre-se de salvar as alterações.', 'warning');
    }
}

function removeNewDocument(index) {
    newDocuments.splice(index, 1);
    updateNewDocumentsPreview();
    showAlert('Documento removido da lista de novos documentos.', 'info');
}

// Utility functions
function getDocumentType(filename) {
    const extension = filename.split('.').pop().toLowerCase();
    const typeMap = {
        'pdf': 'Documento PDF',
        'jpg': 'Imagem JPEG',
        'jpeg': 'Imagem JPEG',
        'png': 'Imagem PNG'
    };
    return typeMap[extension] || 'Documento';
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
window.saveDraft = saveDraft;
window.previewChanges = previewChanges;
window.resetForm = resetForm;
window.cancelEdit = cancelEdit;
window.removeDocument = removeDocument;
window.removeNewDocument = removeNewDocument;
window.submitForm = submitForm;