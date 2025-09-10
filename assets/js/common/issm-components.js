/**
 * ISSM Entity Portal - Common JavaScript Components
 * Central functionality for API integration, form handling, and table management
 */

// Global configuration
const ISSM_CONFIG = {
    API_BASE_URL: '/api/v1',
    STORAGE_PREFIX: 'issm_entity_',
    AUTO_SAVE_INTERVAL: 30000, // 30 seconds
    SESSION_TIMEOUT: 1800000, // 30 minutes
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_FILE_TYPES: ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'],
    PAGINATION_SIZE: 10,
    DATE_FORMAT: 'pt-PT'
};

// API Manager
class APIManager {
    constructor() {
        this.baseURL = ISSM_CONFIG.API_BASE_URL;
        this.headers = {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        };
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: { ...this.headers, ...options.headers },
            ...options
        };

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return { success: true, data };
        } catch (error) {
            console.error('API Request failed:', error);
            return { success: false, error: error.message };
        }
    }

    async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }

    async uploadFile(endpoint, file, additionalData = {}) {
        const formData = new FormData();
        formData.append('file', file);
        
        Object.keys(additionalData).forEach(key => {
            formData.append(key, additionalData[key]);
        });

        return this.request(endpoint, {
            method: 'POST',
            body: formData,
            headers: {} // Remove Content-Type to let browser set it with boundary
        });
    }
}

// Storage Manager
class StorageManager {
    constructor(prefix = ISSM_CONFIG.STORAGE_PREFIX) {
        this.prefix = prefix;
    }

    set(key, value, expiry = null) {
        const item = {
            value: value,
            timestamp: Date.now(),
            expiry: expiry ? Date.now() + expiry : null
        };
        localStorage.setItem(this.prefix + key, JSON.stringify(item));
    }

    get(key) {
        const itemStr = localStorage.getItem(this.prefix + key);
        if (!itemStr) return null;

        try {
            const item = JSON.parse(itemStr);
            
            if (item.expiry && Date.now() > item.expiry) {
                this.remove(key);
                return null;
            }
            
            return item.value;
        } catch (error) {
            console.error('Error parsing stored item:', error);
            this.remove(key);
            return null;
        }
    }

    remove(key) {
        localStorage.removeItem(this.prefix + key);
    }

    clear() {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith(this.prefix)) {
                localStorage.removeItem(key);
            }
        });
    }

    has(key) {
        return this.get(key) !== null;
    }
}

// Form Validator
class FormValidator {
    constructor(form) {
        this.form = typeof form === 'string' ? document.getElementById(form) : form;
        this.rules = {};
        this.customMessages = {};
    }

    addRule(fieldName, validationRules) {
        this.rules[fieldName] = validationRules;
        return this;
    }

    addCustomMessage(fieldName, message) {
        this.customMessages[fieldName] = message;
        return this;
    }

    validate() {
        let isValid = true;
        const errors = {};

        Object.keys(this.rules).forEach(fieldName => {
            const field = this.form.querySelector(`[name="${fieldName}"], #${fieldName}`);
            if (!field) return;

            const value = field.value.trim();
            const rules = this.rules[fieldName];
            
            // Clear previous validation state
            field.classList.remove('is-valid', 'is-invalid');
            
            let fieldValid = true;
            let errorMessage = '';

            // Required validation
            if (rules.required && !value) {
                fieldValid = false;
                errorMessage = this.customMessages[fieldName] || 'Este campo é obrigatório.';
            }

            // Email validation
            if (rules.email && value && !this.isValidEmail(value)) {
                fieldValid = false;
                errorMessage = 'Por favor, insira um email válido.';
            }

            // Phone validation
            if (rules.phone && value && !this.isValidPhone(value)) {
                fieldValid = false;
                errorMessage = 'Por favor, insira um telefone válido (+258 XX XXX XXXX).';
            }

            // URL validation
            if (rules.url && value && !this.isValidURL(value)) {
                fieldValid = false;
                errorMessage = 'Por favor, insira uma URL válida.';
            }

            // Min length validation
            if (rules.minLength && value && value.length < rules.minLength) {
                fieldValid = false;
                errorMessage = `Mínimo ${rules.minLength} caracteres.`;
            }

            // Max length validation
            if (rules.maxLength && value && value.length > rules.maxLength) {
                fieldValid = false;
                errorMessage = `Máximo ${rules.maxLength} caracteres.`;
            }

            // Custom validation
            if (rules.custom && value && !rules.custom(value)) {
                fieldValid = false;
                errorMessage = this.customMessages[fieldName] || 'Valor inválido.';
            }

            if (fieldValid) {
                field.classList.add('is-valid');
            } else {
                field.classList.add('is-invalid');
                errors[fieldName] = errorMessage;
                isValid = false;
                
                // Show error message
                this.showFieldError(field, errorMessage);
            }
        });

        return { isValid, errors };
    }

    showFieldError(field, message) {
        let feedback = field.parentNode.querySelector('.invalid-feedback');
        if (!feedback) {
            feedback = document.createElement('div');
            feedback.className = 'invalid-feedback';
            field.parentNode.appendChild(feedback);
        }
        feedback.textContent = message;
    }

    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    isValidPhone(phone) {
        return /^\+258\s\d{2}\s\d{3}\s\d{3,4}$/.test(phone);
    }

    isValidURL(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }
}

// Data Table Manager
class DataTableManager {
    constructor(tableId, options = {}) {
        this.table = document.getElementById(tableId);
        this.tbody = this.table.querySelector('tbody');
        this.data = [];
        this.filteredData = [];
        this.currentPage = 1;
        this.pageSize = options.pageSize || ISSM_CONFIG.PAGINATION_SIZE;
        this.sortColumn = null;
        this.sortDirection = 'asc';
        this.filters = {};
        this.options = options;
        
        this.init();
    }

    init() {
        this.setupPagination();
        this.setupSorting();
        this.setupFilters();
    }

    setData(data) {
        this.data = [...data];
        this.filteredData = [...data];
        this.render();
    }

    addRow(rowData) {
        this.data.push(rowData);
        this.applyFilters();
        this.render();
    }

    updateRow(index, rowData) {
        if (index >= 0 && index < this.data.length) {
            this.data[index] = { ...this.data[index], ...rowData };
            this.applyFilters();
            this.render();
        }
    }

    removeRow(index) {
        if (index >= 0 && index < this.data.length) {
            this.data.splice(index, 1);
            this.applyFilters();
            this.render();
        }
    }

    filter(filters) {
        this.filters = { ...this.filters, ...filters };
        this.applyFilters();
        this.render();
    }

    applyFilters() {
        this.filteredData = this.data.filter(row => {
            return Object.keys(this.filters).every(key => {
                const filterValue = this.filters[key];
                const rowValue = row[key];
                
                if (!filterValue) return true;
                
                if (typeof filterValue === 'string') {
                    return rowValue.toString().toLowerCase().includes(filterValue.toLowerCase());
                }
                
                return rowValue === filterValue;
            });
        });
        
        this.currentPage = 1; // Reset to first page after filtering
    }

    sort(column, direction = null) {
        if (this.sortColumn === column && !direction) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortColumn = column;
            this.sortDirection = direction || 'asc';
        }
        
        this.filteredData.sort((a, b) => {
            const aVal = a[column];
            const bVal = b[column];
            
            if (aVal < bVal) return this.sortDirection === 'asc' ? -1 : 1;
            if (aVal > bVal) return this.sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
        
        this.render();
    }

    goToPage(page) {
        const totalPages = Math.ceil(this.filteredData.length / this.pageSize);
        if (page >= 1 && page <= totalPages) {
            this.currentPage = page;
            this.render();
        }
    }

    render() {
        const startIndex = (this.currentPage - 1) * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        const pageData = this.filteredData.slice(startIndex, endIndex);
        
        // Clear tbody
        this.tbody.innerHTML = '';
        
        // Render rows
        pageData.forEach((row, index) => {
            const tr = this.createRow(row, startIndex + index);
            this.tbody.appendChild(tr);
        });
        
        // Update pagination
        this.updatePagination();
        
        // Update sort indicators
        this.updateSortIndicators();
    }

    createRow(data, index) {
        const tr = document.createElement('tr');
        tr.dataset.index = index;
        
        if (this.options.rowTemplate) {
            tr.innerHTML = this.options.rowTemplate(data, index);
        } else {
            // Default row creation
            Object.values(data).forEach(value => {
                const td = document.createElement('td');
                td.textContent = value;
                tr.appendChild(td);
            });
        }
        
        return tr;
    }

    setupPagination() {
        // Implementation depends on specific pagination structure
    }

    setupSorting() {
        const headers = this.table.querySelectorAll('th[data-sort]');
        headers.forEach(header => {
            header.style.cursor = 'pointer';
            header.addEventListener('click', () => {
                const column = header.dataset.sort;
                this.sort(column);
            });
        });
    }

    setupFilters() {
        // Implementation depends on specific filter structure
    }

    updatePagination() {
        const totalPages = Math.ceil(this.filteredData.length / this.pageSize);
        // Update pagination UI
    }

    updateSortIndicators() {
        // Update sort indicators in headers
        const headers = this.table.querySelectorAll('th[data-sort]');
        headers.forEach(header => {
            header.classList.remove('sort-asc', 'sort-desc');
            if (header.dataset.sort === this.sortColumn) {
                header.classList.add(`sort-${this.sortDirection}`);
            }
        });
    }
}

// File Upload Manager
class FileUploadManager {
    constructor(options = {}) {
        this.maxSize = options.maxSize || ISSM_CONFIG.MAX_FILE_SIZE;
        this.allowedTypes = options.allowedTypes || ISSM_CONFIG.ALLOWED_FILE_TYPES;
        this.onFileSelect = options.onFileSelect || (() => {});
        this.onUploadProgress = options.onUploadProgress || (() => {});
        this.onUploadComplete = options.onUploadComplete || (() => {});
        this.onError = options.onError || (() => {});
    }

    validateFile(file) {
        if (file.size > this.maxSize) {
            return { valid: false, error: `Arquivo muito grande. Tamanho máximo: ${this.formatFileSize(this.maxSize)}` };
        }

        if (!this.allowedTypes.includes(file.type)) {
            return { valid: false, error: 'Tipo de arquivo não suportado.' };
        }

        return { valid: true };
    }

    async uploadFile(file, endpoint, additionalData = {}) {
        const validation = this.validateFile(file);
        if (!validation.valid) {
            this.onError(validation.error);
            return;
        }

        const api = new APIManager();
        
        try {
            const result = await api.uploadFile(endpoint, file, additionalData);
            
            if (result.success) {
                this.onUploadComplete(result.data);
            } else {
                this.onError(result.error);
            }
        } catch (error) {
            this.onError('Erro no upload: ' + error.message);
        }
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    setupDragAndDrop(element, onFileDrop) {
        element.addEventListener('dragover', (e) => {
            e.preventDefault();
            element.classList.add('drag-over');
        });

        element.addEventListener('dragleave', (e) => {
            e.preventDefault();
            element.classList.remove('drag-over');
        });

        element.addEventListener('drop', (e) => {
            e.preventDefault();
            element.classList.remove('drag-over');
            
            const files = Array.from(e.dataTransfer.files);
            onFileDrop(files);
        });
    }
}

// Notification Manager
class NotificationManager {
    static show(message, type = 'info', duration = 4000) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        
        const icon = this.getIcon(type);
        alertDiv.innerHTML = `
            <iconify-icon icon="${icon}" class="me-2"></iconify-icon>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(alertDiv);
        
        // Auto remove
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, duration);
    }

    static getIcon(type) {
        const icons = {
            success: 'solar:check-circle-bold',
            warning: 'solar:danger-triangle-bold',
            danger: 'solar:close-circle-bold',
            info: 'solar:info-circle-bold'
        };
        return icons[type] || icons.info;
    }

    static success(message, duration) {
        this.show(message, 'success', duration);
    }

    static warning(message, duration) {
        this.show(message, 'warning', duration);
    }

    static error(message, duration) {
        this.show(message, 'danger', duration);
    }

    static info(message, duration) {
        this.show(message, 'info', duration);
    }
}

// Utility Functions
const Utils = {
    formatDate(date, locale = ISSM_CONFIG.DATE_FORMAT) {
        if (!date) return '';
        return new Date(date).toLocaleDateString(locale, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },

    formatDateTime(date, locale = ISSM_CONFIG.DATE_FORMAT) {
        if (!date) return '';
        return new Date(date).toLocaleDateString(locale, {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    formatCurrency(amount, currency = 'MZN') {
        return new Intl.NumberFormat('pt-PT', {
            style: 'currency',
            currency: currency
        }).format(amount);
    },

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    generateId() {
        return Math.random().toString(36).substr(2, 9);
    },

    copyToClipboard(text) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                NotificationManager.success('Copiado para a área de transferência!');
            });
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            NotificationManager.success('Copiado para a área de transferência!');
        }
    }
};

// Initialize global instances
window.ISSM = {
    API: new APIManager(),
    Storage: new StorageManager(),
    Utils: Utils,
    NotificationManager: NotificationManager,
    FormValidator: FormValidator,
    DataTableManager: DataTableManager,
    FileUploadManager: FileUploadManager
};

// Global initialization
document.addEventListener('DOMContentLoaded', function() {
    // Initialize common components
    initializeTooltips();
    initializePopovers();
    setupGlobalEventHandlers();
});

function initializeTooltips() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

function initializePopovers() {
    const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });
}

function setupGlobalEventHandlers() {
    // Handle navigation warnings for unsaved changes
    let hasUnsavedChanges = false;
    
    window.addEventListener('beforeunload', function(e) {
        if (hasUnsavedChanges) {
            e.preventDefault();
            e.returnValue = '';
        }
    });
    
    // Global form change detection
    document.addEventListener('input', function(e) {
        if (e.target.matches('input, textarea, select')) {
            hasUnsavedChanges = true;
        }
    });
    
    // Reset unsaved changes flag on form submit
    document.addEventListener('submit', function(e) {
        hasUnsavedChanges = false;
    });
}