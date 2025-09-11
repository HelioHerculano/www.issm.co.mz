/**
 * Verification Form - ISSM Portal das Entidades
 * Multi-step form with validation, file upload, and draft saving
 * Enhanced with insurance type and company selectors
 */

// Form state management
let currentStep = 1;
let totalSteps = 4;
let uploadedFiles = [];
let formData = {};

// Insurance components
let insuranceTypeSelector = null;
let companySelector = null;

// Initialize form when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeForm();
    initializeInsuranceComponents();
    setupEventHandlers();
    loadDraftIfExists();
});

// Initialize insurance components
async function initializeInsuranceComponents() {
    try {
        // Initialize Company Selector
        const companyContainer = document.getElementById('company-selector-container');
        if (companyContainer) {
            companySelector = new CompanySelector(companyContainer, {
                allowMultiple: false,
                showOnlyActive: true,
                enableSearch: true,
                showMarketShare: false,
                showRating: true,
                sortBy: 'market_share',
                placeholder: 'Selecione a seguradora...',
                required: true
            });
            
            // Listen for company selection changes
            companyContainer.addEventListener('companySelector:change', function(e) {
                const selectedCompanies = e.detail.selectedCompanies;
                if (selectedCompanies.length > 0) {
                    // Update insurance type selector to show types available for selected company
                    updateInsuranceTypesByCompany(selectedCompanies[0]);
                }
                
                // Update form data
                formData.insuranceCompany = selectedCompanies.length > 0 ? selectedCompanies[0].id : '';
                
                // Clear validation state
                companyContainer.classList.remove('is-invalid');
            });
        }
        
        // Initialize Insurance Type Selector
        const typeContainer = document.getElementById('insurance-type-selector-container');
        if (typeContainer) {
            insuranceTypeSelector = new InsuranceTypeSelector(typeContainer, {
                allowMultiple: false,
                showDescriptions: true,
                enableSearch: true,
                groupByCategory: true,
                showCoverageInfo: true,
                placeholder: 'Selecione o tipo de seguro...',
                required: true
            });
            
            // Listen for type selection changes
            typeContainer.addEventListener('typeSelector:change', function(e) {
                const selectedTypes = e.detail.selectedTypes;
                
                // Update form data
                formData.insuranceType = selectedTypes.length > 0 ? selectedTypes[0].id : '';
                formData.insuranceTypeDetails = selectedTypes.length > 0 ? selectedTypes[0] : null;
                
                // Clear validation state
                typeContainer.classList.remove('is-invalid');
                
                // Update verification options based on selected type
                updateVerificationOptions(selectedTypes[0]);
            });
        }
        
    } catch (error) {
        console.error('Error initializing insurance components:', error);
        showAlert('Erro ao inicializar componentes de seguro. Alguns recursos podem não funcionar corretamente.', 'warning');
    }
}

// Update insurance types based on selected company
function updateInsuranceTypesByCompany(company) {
    if (!insuranceTypeSelector || !company) return;
    
    // Filter types based on company's insurance types
    // This would typically be done server-side, but for demo purposes
    // we'll show all types since the company data includes type categories
    console.log('Filtering insurance types for company:', company.name);
}

// Update verification options based on selected insurance type
function updateVerificationOptions(selectedType) {
    if (!selectedType) return;
    
    // Some insurance types might not support all verification types
    const verificationTypes = document.querySelectorAll('input[name="verificationType"]');
    
    // For example, agricultural insurance might not have claims history
    if (selectedType.category.id === 'agricultural') {
        const claimsOption = document.getElementById('verification-claims');
        if (claimsOption) {
            claimsOption.closest('.col-md-4').style.display = 'none';
        }
    } else {
        // Show all options
        verificationTypes.forEach(option => {
            option.closest('.col-md-4').style.display = 'block';
        });
    }
    
    console.log('Updated verification options for type:', selectedType.type.name);
}

// Setup event handlers
function setupEventHandlers() {
    // File upload handlers
    const dragDropZone = document.getElementById('drag-drop-zone');
    const fileInput = document.getElementById('file-input');
    
    // Drag and drop events
    dragDropZone.addEventListener('dragover', handleDragOver);
    dragDropZone.addEventListener('dragleave', handleDragLeave);
    dragDropZone.addEventListener('drop', handleDrop);
    
    // File input change
    fileInput.addEventListener('change', handleFileSelect);
    
    // Form validation on change
    const formInputs = document.querySelectorAll('input, select, textarea');
    formInputs.forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('change', saveFormData);
    });
    
    // Auto-save draft every 30 seconds
    setInterval(saveDraft, 30000);
}

// Step navigation functions
function nextStep() {
    if (validateCurrentStep()) {
        if (currentStep < totalSteps) {
            currentStep++;
            showStep(currentStep);
            updateStepIndicator();
            updateNavigationButtons();
            
            if (currentStep === 4) {
                generateReviewContent();
            }
        }
    }
}

function previousStep() {
    if (currentStep > 1) {
        currentStep--;
        showStep(currentStep);
        updateStepIndicator();
        updateNavigationButtons();
    }
}

function showStep(stepNumber) {
    // Hide all steps
    const steps = document.querySelectorAll('.form-step');
    steps.forEach(step => step.classList.add('d-none'));
    
    // Show current step
    document.getElementById(`form-step-${stepNumber}`).classList.remove('d-none');
}

function updateStepIndicator() {
    for (let i = 1; i <= totalSteps; i++) {
        const stepElement = document.getElementById(`step-${i}`);
        stepElement.classList.remove('active', 'completed');
        
        if (i < currentStep) {
            stepElement.classList.add('completed');
        } else if (i === currentStep) {
            stepElement.classList.add('active');
        }
    }
}

function updateNavigationButtons() {
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const submitBtn = document.getElementById('submit-btn');
    
    prevBtn.disabled = currentStep === 1;
    
    if (currentStep === totalSteps) {
        nextBtn.classList.add('d-none');
        submitBtn.classList.remove('d-none');
    } else {
        nextBtn.classList.remove('d-none');
        submitBtn.classList.add('d-none');
    }
}

// Validation functions
function validateCurrentStep() {
    const currentStepElement = document.getElementById(`form-step-${currentStep}`);
    const requiredFields = currentStepElement.querySelectorAll('[required]');
    let isValid = true;
    
    // Standard field validation
    requiredFields.forEach(field => {
        if (!validateField({ target: field })) {
            isValid = false;
        }
    });
    
    // Step-specific validations
    switch (currentStep) {
        case 1:
            // Validate company selector
            if (companySelector && !companySelector.isValid()) {
                const container = document.getElementById('company-selector-container');
                container.classList.add('is-invalid');
                companySelector.setError('Por favor, selecione uma seguradora.');
                isValid = false;
            }
            break;
            
        case 2:
            // Validate insurance type selector
            if (insuranceTypeSelector && !insuranceTypeSelector.isValid()) {
                const container = document.getElementById('insurance-type-selector-container');
                container.classList.add('is-invalid');
                insuranceTypeSelector.setError('Por favor, selecione um tipo de seguro.');
                isValid = false;
            }
            
            // Validate verification type
            const verificationType = document.querySelector('input[name="verificationType"]:checked');
            if (!verificationType) {
                showAlert('Por favor, selecione o tipo de verificação.', 'warning');
                isValid = false;
            }
            break;
            
        case 3:
            // Validate file uploads
            if (uploadedFiles.length === 0) {
                showAlert('Por favor, faça upload de pelo menos um documento.', 'warning');
                isValid = false;
            }
            break;
    }
    
    return isValid;
}

function validateField(event) {
    const field = event.target;
    const value = field.value.trim();
    let isValid = true;
    
    // Required field validation
    if (field.hasAttribute('required') && !value) {
        field.classList.add('is-invalid');
        isValid = false;
    } else {
        field.classList.remove('is-invalid');
    }
    
    // Specific field validations
    switch (field.id) {
        case 'policy-number':
            const policyPattern = /^[A-Z]{3}-[0-9]{4}-[0-9]{6}$/;
            if (value && !policyPattern.test(value)) {
                field.classList.add('is-invalid');
                isValid = false;
            }
            break;
            
        case 'policy-end-date':
            const startDate = document.getElementById('policy-start-date').value;
            if (startDate && value && new Date(value) <= new Date(startDate)) {
                field.classList.add('is-invalid');
                field.setCustomValidity('Data de fim deve ser posterior à data de início');
                isValid = false;
            } else {
                field.setCustomValidity('');
            }
            break;
    }
    
    if (isValid) {
        field.classList.add('is-valid');
    }
    
    return isValid;
}

// File upload functions
function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('dragover');
    
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
}

function handleFileSelect(e) {
    const files = Array.from(e.target.files);
    processFiles(files);
}

function processFiles(files) {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    files.forEach(file => {
        if (!allowedTypes.includes(file.type)) {
            showAlert(`Arquivo ${file.name} não é um tipo permitido.`, 'error');
            return;
        }
        
        if (file.size > maxSize) {
            showAlert(`Arquivo ${file.name} excede o tamanho máximo de 10MB.`, 'error');
            return;
        }
        
        // Check if file already exists
        if (uploadedFiles.some(f => f.name === file.name && f.size === file.size)) {
            showAlert(`Arquivo ${file.name} já foi adicionado.`, 'warning');
            return;
        }
        
        uploadedFiles.push({
            id: generateFileId(),
            file: file,
            name: file.name,
            size: file.size,
            type: file.type,
            uploaded: false
        });
    });
    
    renderFileList();
}

function removeFile(fileId) {
    uploadedFiles = uploadedFiles.filter(f => f.id !== fileId);
    renderFileList();
}

function renderFileList() {
    const fileList = document.getElementById('file-list');
    
    if (uploadedFiles.length === 0) {
        fileList.innerHTML = '<p class="text-muted text-center">Nenhum arquivo selecionado</p>';
        return;
    }
    
    fileList.innerHTML = uploadedFiles.map(file => `
        <div class="file-item">
            <div class="file-info">
                <iconify-icon icon="${getFileIcon(file.type)}" class="me-2 text-muted"></iconify-icon>
                <div>
                    <div class="fw-medium">${file.name}</div>
                    <small class="text-muted">${formatFileSize(file.size)}</small>
                </div>
            </div>
            <div class="file-actions">
                <button type="button" class="btn btn-sm btn-outline-danger" onclick="removeFile('${file.id}')">
                    <iconify-icon icon="solar:trash-bin-minimalistic-bold"></iconify-icon>
                </button>
            </div>
        </div>
    `).join('');
}

function getFileIcon(type) {
    if (type === 'application/pdf') return 'solar:file-text-bold';
    if (type.startsWith('image/')) return 'solar:gallery-bold';
    return 'solar:file-bold';
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function generateFileId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Form data management
function saveFormData() {
    const form = document.getElementById('verification-form');
    const formDataObj = new FormData(form);
    
    formData = {};
    for (let [key, value] of formDataObj.entries()) {
        formData[key] = value;
    }
    
    // Add insurance component data
    if (companySelector) {
        const selectedCompanies = companySelector.getSelectedCompanies();
        formData.insuranceCompany = selectedCompanies.length > 0 ? selectedCompanies[0].id : '';
        formData.insuranceCompanyName = selectedCompanies.length > 0 ? selectedCompanies[0].name : '';
    }
    
    if (insuranceTypeSelector) {
        const selectedTypes = insuranceTypeSelector.getSelectedTypes();
        formData.insuranceType = selectedTypes.length > 0 ? selectedTypes[0].id : '';
        formData.insuranceTypeName = selectedTypes.length > 0 ? selectedTypes[0].type.name : '';
        formData.insuranceCategory = selectedTypes.length > 0 ? selectedTypes[0].category.name : '';
    }
    
    // Add files data
    formData.files = uploadedFiles.map(f => ({
        id: f.id,
        name: f.name,
        size: f.size,
        type: f.type
    }));
}

function saveDraft() {
    saveFormData();
    
    const draftData = {
        ...formData,
        currentStep: currentStep,
        timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('verification_draft', JSON.stringify(draftData));
    showAlert('Rascunho salvo automaticamente.', 'info', 2000);
}

function loadDraftIfExists() {
    const draftData = localStorage.getItem('verification_draft');
    if (draftData) {
        const draft = JSON.parse(draftData);
        
        if (confirm('Foi encontrado um rascunho salvo. Deseja continuar de onde parou?')) {
            // Restore form data
            Object.keys(draft).forEach(key => {
                if (key !== 'currentStep' && key !== 'timestamp' && key !== 'files' && 
                    key !== 'insuranceCompany' && key !== 'insuranceType') {
                    const element = document.querySelector(`[name="${key}"]`);
                    if (element) {
                        element.value = draft[key];
                    }
                }
            });
            
            // Restore insurance selections
            setTimeout(() => {
                if (draft.insuranceCompany && companySelector) {
                    companySelector.setSelectedCompanies([draft.insuranceCompany]);
                }
                
                if (draft.insuranceType && insuranceTypeSelector) {
                    insuranceTypeSelector.setSelectedTypes([draft.insuranceType]);
                }
            }, 1000); // Wait for components to initialize
            
            // Restore files (metadata only)
            if (draft.files) {
                uploadedFiles = draft.files.map(f => ({
                    ...f,
                    file: null, // File object can't be stored in localStorage
                    uploaded: false
                }));
                renderFileList();
            }
            
            // Restore step
            currentStep = draft.currentStep || 1;
            showStep(currentStep);
            updateStepIndicator();
            updateNavigationButtons();
        }
    }
}

// Review content generation
function generateReviewContent() {
    saveFormData();
    
    const reviewContent = document.getElementById('review-content');
    const verificationType = formData.verificationType;
    const urgencyLevel = formData.urgencyLevel;
    
    const typeLabels = {
        'validity': 'Verificação de Validade',
        'coverage': 'Verificação de Cobertura',
        'claims_history': 'Histórico de Sinistros'
    };
    
    const urgencyLabels = {
        'low': 'Baixa (5-7 dias úteis)',
        'normal': 'Normal (3-5 dias úteis)',
        'high': 'Alta (1-2 dias úteis)',
        'urgent': 'Urgente (24 horas)'
    };
    
    reviewContent.innerHTML = `
        <div class="row g-3">
            <div class="col-md-6">
                <h6>Informações da Apólice</h6>
                <dl class="row">
                    <dt class="col-sm-5">Número:</dt>
                    <dd class="col-sm-7">${formData.policyNumber || '-'}</dd>
                    <dt class="col-sm-5">Seguradora:</dt>
                    <dd class="col-sm-7">${formData.insuranceCompanyName || '-'}</dd>
                    <dt class="col-sm-5">Segurado:</dt>
                    <dd class="col-sm-7">${formData.policyHolderName || '-'}</dd>
                    <dt class="col-sm-5">BI/NUIT:</dt>
                    <dd class="col-sm-7">${formData.policyHolderID || '-'}</dd>
                    <dt class="col-sm-5">Tipo de Seguro:</dt>
                    <dd class="col-sm-7">${formData.insuranceTypeName || '-'}</dd>
                    <dt class="col-sm-5">Categoria:</dt>
                    <dd class="col-sm-7">${formData.insuranceCategory || '-'}</dd>
                </dl>
            </div>
            <div class="col-md-6">
                <h6>Detalhes da Verificação</h6>
                <dl class="row">
                    <dt class="col-sm-5">Tipo:</dt>
                    <dd class="col-sm-7">${typeLabels[verificationType] || '-'}</dd>
                    <dt class="col-sm-5">Data:</dt>
                    <dd class="col-sm-7">${formatDateForDisplay(formData.verificationDate)}</dd>
                    <dt class="col-sm-5">Urgência:</dt>
                    <dd class="col-sm-7">${urgencyLabels[urgencyLevel] || '-'}</dd>
                    <dt class="col-sm-5">Arquivos:</dt>
                    <dd class="col-sm-7">${uploadedFiles.length} documento(s)</dd>
                </dl>
            </div>
            <div class="col-12">
                <h6>Finalidade</h6>
                <p>${formData.verificationPurpose || '-'}</p>
            </div>
            <div class="col-12">
                <h6>Documentos Anexados</h6>
                <ul class="list-unstyled">
                    ${uploadedFiles.map(file => `
                        <li class="d-flex align-items-center mb-1">
                            <iconify-icon icon="${getFileIcon(file.type)}" class="me-2 text-muted"></iconify-icon>
                            ${file.name} (${formatFileSize(file.size)})
                        </li>
                    `).join('')}
                </ul>
            </div>
        </div>
    `;
}

// Form submission
document.getElementById('verification-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    if (!validateCurrentStep()) {
        return;
    }
    
    const termsAgreed = document.getElementById('terms-agreement').checked;
    if (!termsAgreed) {
        showAlert('Por favor, aceite os termos e condições.', 'error');
        return;
    }
    
    submitForm();
});

function submitForm() {
    // Show loading state
    const submitBtn = document.getElementById('submit-btn');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Submetendo...';
    submitBtn.disabled = true;
    
    // Simulate form submission
    setTimeout(() => {
        // Clear draft
        localStorage.removeItem('verification_draft');
        
        // Show success message
        showAlert('Solicitação submetida com sucesso! Você receberá uma confirmação por email.', 'success');
        
        // Redirect to list page
        setTimeout(() => {
            window.location.href = 'verificacoes-lista.html';
        }, 2000);
    }, 3000);
}

// Utility functions
function getCompanyName(value) {
    const companies = {
        'empresa-seguradora-a': 'Empresa Seguradora A',
        'seguradora-geral': 'Seguradora Geral',
        'mocambique-vida': 'Moçambique Vida',
        'emmanuel-seguradora': 'Emmanuel Seguradora'
    };
    return companies[value] || value;
}

function formatDateForDisplay(dateString) {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-MZ');
}

function showAlert(message, type = 'info', duration = 5000) {
    // Create alert element
    const alertElement = document.createElement('div');
    alertElement.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show position-fixed`;
    alertElement.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    alertElement.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alertElement);
    
    // Auto-remove after duration
    setTimeout(() => {
        if (alertElement.parentNode) {
            alertElement.remove();
        }
    }, duration);
}

// Export functions for global access
window.nextStep = nextStep;
window.previousStep = previousStep;
window.saveDraft = saveDraft;
window.removeFile = removeFile;