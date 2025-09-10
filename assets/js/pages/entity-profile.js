/**
 * Entity Profile Page JavaScript - ISSM Portal das Entidades
 * Handles functionality for entity profile management
 */

// Profile data
let profileData = {};
let hasUnsavedChanges = false;

// Initialize page when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
    loadProfileData();
    setupFormHandlers();
    setupAutoSave();
});

// Initialize page components
function initializePage() {
    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    // Setup form validation
    setupFormValidation();
}

// Load profile data
function loadProfileData() {
    // Simulate API call to load profile data
    profileData = {
        // Basic Information
        entityName: 'Entidade XYZ, Lda',
        entityType: 'empresa_privada',
        nuit: '400123456',
        registrationNumber: 'REG-2020-001234',
        sector: 'construcao',
        website: 'https://www.entidadexyz.co.mz',
        description: 'Empresa especializada em construção civil e obras públicas, com mais de 15 anos de experiência no mercado moçambicano.',
        
        // Contact Information
        address: 'Av. Julius Nyerere, 123\nBairro Central, Maputo',
        city: 'Maputo',
        province: 'maputo_cidade',
        postalCode: '1100',
        phone: '+258 21 123 456',
        mobile: '+258 84 123 4567',
        email: 'geral@entidadexyz.co.mz',
        
        // Legal Representative
        repName: 'João Manuel Silva',
        repPosition: 'Director Geral',
        repDocument: '123456789L',
        repEmail: 'joao.silva@entidadexyz.co.mz',
        repPhone: '+258 84 987 6543',
        repAuthorization: 'PROC-2024-001',
        
        // Profile Status
        entityId: 'ENT-2024-001',
        registrationDate: '2024-01-15',
        lastUpdate: '2024-01-08',
        verificationStatus: 'verified',
        completionPercentage: 100
    };
    
    // Store original data for change detection
    window.originalProfileData = JSON.parse(JSON.stringify(profileData));
    
    console.log('Profile data loaded successfully');
}

// Setup form validation
function setupFormValidation() {
    // Add validation classes to required fields
    const requiredFields = document.querySelectorAll('input[required], select[required], textarea[required]');
    
    requiredFields.forEach(field => {
        field.addEventListener('blur', function() {
            validateField(this);
        });
    });
}

// Validate individual field
function validateField(field) {
    const value = field.value.trim();
    
    // Remove existing validation classes
    field.classList.remove('is-valid', 'is-invalid');
    
    if (field.hasAttribute('required') && !value) {
        field.classList.add('is-invalid');
        return false;
    }
    
    // Email validation
    if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            field.classList.add('is-invalid');
            return false;
        }
    }
    
    // URL validation
    if (field.type === 'url' && value) {
        try {
            new URL(value);
        } catch {
            field.classList.add('is-invalid');
            return false;
        }
    }
    
    // Phone validation (basic)
    if (field.type === 'tel' && value) {
        const phoneRegex = /^\+258\s\d{2}\s\d{3}\s\d{3,4}$/;
        if (!phoneRegex.test(value)) {
            field.classList.add('is-invalid');
            return false;
        }
    }
    
    field.classList.add('is-valid');
    return true;
}

// Setup form handlers
function setupFormHandlers() {
    // Track changes in all forms
    const forms = ['basic-info-form', 'contact-info-form', 'representative-form'];
    
    forms.forEach(formId => {
        const form = document.getElementById(formId);
        if (form) {
            const inputs = form.querySelectorAll('input, select, textarea');
            inputs.forEach(input => {
                input.addEventListener('input', function() {
                    markAsChanged();
                });
                
                input.addEventListener('change', function() {
                    markAsChanged();
                });
            });
        }
    });
    
    // Warn user about unsaved changes
    window.addEventListener('beforeunload', function(e) {
        if (hasUnsavedChanges) {
            e.preventDefault();
            e.returnValue = '';
        }
    });
}

// Setup auto-save functionality
function setupAutoSave() {
    // Auto-save every 2 minutes
    setInterval(function() {
        if (hasUnsavedChanges) {
            autoSaveProfile();
        }
    }, 120000);
}

// Mark profile as changed
function markAsChanged() {
    hasUnsavedChanges = true;
    
    // Add visual indicator
    const saveBtn = document.querySelector('button[onclick="saveProfile()"]');
    if (saveBtn && !saveBtn.classList.contains('btn-warning')) {
        saveBtn.classList.remove('btn-primary');
        saveBtn.classList.add('btn-warning');
        saveBtn.innerHTML = '<iconify-icon icon="solar:danger-triangle-bold" class="me-2"></iconify-icon>Alterações Pendentes';
    }
}

// Reset change indicator
function resetChangeIndicator() {
    hasUnsavedChanges = false;
    
    const saveBtn = document.querySelector('button[onclick="saveProfile()"]');
    if (saveBtn) {
        saveBtn.classList.remove('btn-warning');
        saveBtn.classList.add('btn-primary');
        saveBtn.innerHTML = '<iconify-icon icon="solar:diskette-bold" class="me-2"></iconify-icon>Salvar Alterações';
    }
}

// Collect form data
function collectFormData() {
    return {
        // Basic Information
        entityName: document.getElementById('entity-name').value,
        entityType: document.getElementById('entity-type').value,
        nuit: document.getElementById('nuit').value,
        registrationNumber: document.getElementById('registration-number').value,
        sector: document.getElementById('sector').value,
        website: document.getElementById('website').value,
        description: document.getElementById('description').value,
        
        // Contact Information
        address: document.getElementById('address').value,
        city: document.getElementById('city').value,
        province: document.getElementById('province').value,
        postalCode: document.getElementById('postal-code').value,
        phone: document.getElementById('phone').value,
        mobile: document.getElementById('mobile').value,
        email: document.getElementById('email').value,
        
        // Legal Representative
        repName: document.getElementById('rep-name').value,
        repPosition: document.getElementById('rep-position').value,
        repDocument: document.getElementById('rep-document').value,
        repEmail: document.getElementById('rep-email').value,
        repPhone: document.getElementById('rep-phone').value,
        repAuthorization: document.getElementById('rep-authorization').value
    };
}

// Validate all forms
function validateAllForms() {
    let isValid = true;
    const requiredFields = document.querySelectorAll('input[required], select[required], textarea[required]');
    
    requiredFields.forEach(field => {
        if (!validateField(field)) {
            isValid = false;
        }
    });
    
    return isValid;
}

// Save profile
function saveProfile() {
    if (!validateAllForms()) {
        showAlert('Por favor, corrija os erros no formulário antes de salvar.', 'warning');
        return;
    }
    
    const formData = collectFormData();
    
    // Show loading state
    const saveBtn = document.querySelector('button[onclick="saveProfile()"]');
    const originalHtml = saveBtn.innerHTML;
    saveBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Salvando...';
    saveBtn.disabled = true;
    
    // Simulate API call
    setTimeout(() => {
        // Update profile data
        profileData = { ...profileData, ...formData };
        
        // Reset button state
        saveBtn.innerHTML = originalHtml;
        saveBtn.disabled = false;
        
        // Reset change indicator
        resetChangeIndicator();
        
        // Update last modification date
        const now = new Date();
        document.querySelector('.text-muted + .fw-semibold').textContent = 
            now.toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' });
        
        showAlert('Perfil actualizado com sucesso!', 'success');
        
        // Update browser storage
        localStorage.setItem('entityProfile', JSON.stringify(profileData));
        
    }, 1500);
}

// Auto-save profile
function autoSaveProfile() {
    const formData = collectFormData();
    
    // Save to localStorage as draft
    localStorage.setItem('entityProfileDraft', JSON.stringify(formData));
    
    // Show subtle indicator
    showAutoSaveIndicator();
}

// Show auto-save indicator
function showAutoSaveIndicator() {
    let indicator = document.getElementById('auto-save-indicator');
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.id = 'auto-save-indicator';
        indicator.className = 'position-fixed bg-info text-white px-3 py-2 rounded';
        indicator.style.cssText = 'bottom: 20px; left: 20px; z-index: 9999; font-size: 14px;';
        document.body.appendChild(indicator);
    }
    
    indicator.innerHTML = '<iconify-icon icon="solar:diskette-bold" class="me-2"></iconify-icon>Rascunho salvo';
    indicator.style.display = 'block';
    
    setTimeout(() => {
        indicator.style.display = 'none';
    }, 3000);
}

// Download profile as PDF
function downloadProfile() {
    // Show loading state
    showAlert('Preparando arquivo PDF...', 'info');
    
    // Simulate PDF generation
    setTimeout(() => {
        const link = document.createElement('a');
        link.href = '#'; // Would be actual PDF URL
        link.download = `perfil-entidade-${profileData.entityId}.pdf`;
        link.click();
        
        showAlert('Download iniciado!', 'success');
    }, 2000);
}

// Print profile
function printProfile() {
    // Hide unnecessary elements before printing
    const elementsToHide = document.querySelectorAll('.btn, .dropdown, .navbar-custom, .leftside-menu');
    elementsToHide.forEach(el => el.style.display = 'none');
    
    window.print();
    
    // Restore hidden elements after printing
    setTimeout(() => {
        elementsToHide.forEach(el => el.style.display = '');
    }, 1000);
}

// Change password
function changePassword() {
    const modal = new bootstrap.Modal(document.getElementById('changePasswordModal'));
    modal.show();
}

// Submit password change
function submitPasswordChange() {
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
        showAlert('Por favor, preencha todos os campos.', 'warning');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showAlert('A nova senha e a confirmação não coincidem.', 'warning');
        return;
    }
    
    if (newPassword.length < 8) {
        showAlert('A nova senha deve ter pelo menos 8 caracteres.', 'warning');
        return;
    }
    
    // Password strength validation
    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasNumbers = /\d/.test(newPassword);
    
    if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
        showAlert('A senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número.', 'warning');
        return;
    }
    
    // Simulate API call
    setTimeout(() => {
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('changePasswordModal'));
        modal.hide();
        
        // Clear form
        document.getElementById('change-password-form').reset();
        
        showAlert('Senha alterada com sucesso!', 'success');
    }, 1000);
}

// Update documents
function updateDocuments() {
    showAlert('Função de actualização de documentos em desenvolvimento.', 'info');
    // Would redirect to document management page
}

// Utility function to show alerts
function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alertDiv);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 4000);
}

// Export functions for global access
window.saveProfile = saveProfile;
window.downloadProfile = downloadProfile;
window.printProfile = printProfile;
window.changePassword = changePassword;
window.submitPasswordChange = submitPasswordChange;
window.updateDocuments = updateDocuments;