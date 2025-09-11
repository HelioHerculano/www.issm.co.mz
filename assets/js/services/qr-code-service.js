/**
 * QR Code Generator Service - ISSM Portal das Entidades
 * Handles QR code generation for certificate validation
 */

class QRCodeGeneratorService {
    constructor() {
        this.apiEndpoint = '/api/qr-codes';
        this.baseValidationUrl = window.location.origin + '/validate';
        this.qrCodeCache = new Map();
        
        // QR Code configuration
        this.qrConfig = {
            size: 120,
            margin: 2,
            errorCorrectionLevel: 'M',
            colorDark: '#000000',
            colorLight: '#ffffff'
        };
        
        // Load QRCode library if available, otherwise use fallback
        this.qrCodeLib = this.detectQRLibrary();
    }

    /**
     * Detect available QR code library
     * @returns {Object|null} QR code library reference
     */
    detectQRLibrary() {
        // Check for QRCode.js library
        if (typeof QRCode !== 'undefined') {
            return QRCode;
        }
        
        // Check for qrcode-generator library
        if (typeof qrcode !== 'undefined') {
            return qrcode;
        }
        
        console.warn('No QR code library detected. Using fallback service.');
        return null;
    }

    /**
     * Generate QR code for certificate validation
     * @param {Object} certificateData - Certificate data
     * @returns {Promise<Object>} QR code generation result
     */
    async generateValidationQR(certificateData) {
        try {
            // Prepare validation data
            const validationData = this.prepareValidationData(certificateData);
            
            // Create validation URL
            const validationUrl = this.createValidationUrl(certificateData.certificateId, validationData.hash);
            
            // Generate QR code image
            const qrImageData = await this.generateQRImage(validationUrl);
            
            // Store QR data for future reference
            await this.storeQRData(certificateData.certificateId, validationData, qrImageData);
            
            return {
                success: true,
                data: {
                    qrImageData,
                    validationUrl,
                    validationData,
                    qrCodeId: validationData.qrId
                }
            };
            
        } catch (error) {
            console.error('QR code generation failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Prepare validation data for QR code
     * @param {Object} certificateData - Certificate data
     * @returns {Object} Validation data
     */
    prepareValidationData(certificateData) {
        const qrId = this.generateQRId();
        const timestamp = Date.now();
        
        const validationPayload = {
            qrId,
            certificateId: certificateData.certificateId,
            verificationId: certificateData.verificationId,
            issueDate: certificateData.issueDate,
            expiryDate: certificateData.expiryDate,
            timestamp,
            version: '1.0'
        };
        
        // Generate hash for data integrity
        const hash = this.generateDataHash(validationPayload);
        
        return {
            qrId,
            payload: validationPayload,
            hash,
            createdAt: new Date().toISOString()
        };
    }

    /**
     * Generate unique QR ID
     * @returns {string} QR ID
     */
    generateQRId() {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substr(2, 5);
        return `QR-${timestamp}-${random}`.toUpperCase();
    }

    /**
     * Generate hash for validation data
     * @param {Object} data - Data to hash
     * @returns {string} Hash value
     */
    generateDataHash(data) {
        const dataString = JSON.stringify(data, Object.keys(data).sort());
        return this.simpleHash(dataString);
    }

    /**
     * Simple hash function (replace with crypto.subtle in production)
     * @param {string} str - String to hash
     * @returns {string} Hash value
     */
    simpleHash(str) {
        let hash = 0;
        if (str.length === 0) return hash.toString(16);
        
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        
        return Math.abs(hash).toString(16).padStart(8, '0');
    }

    /**
     * Create validation URL for certificate
     * @param {string} certificateId - Certificate ID
     * @param {string} hash - Validation hash
     * @returns {string} Validation URL
     */
    createValidationUrl(certificateId, hash) {
        const params = new URLSearchParams({
            cert: certificateId,
            hash: hash,
            t: Date.now()
        });
        
        return `${this.baseValidationUrl}?${params.toString()}`;
    }

    /**
     * Generate QR code image
     * @param {string} data - Data to encode in QR code
     * @returns {Promise<string>} Base64 image data
     */
    async generateQRImage(data) {
        if (this.qrCodeLib) {
            return this.generateQRWithLibrary(data);
        } else {
            return this.generateQRFallback(data);
        }
    }

    /**
     * Generate QR code using QR library
     * @param {string} data - Data to encode
     * @returns {Promise<string>} Base64 image data
     */
    async generateQRWithLibrary(data) {
        return new Promise((resolve, reject) => {
            try {
                // Create canvas element
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // Set canvas size
                canvas.width = this.qrConfig.size;
                canvas.height = this.qrConfig.size;
                
                // Generate QR code
                if (typeof QRCode !== 'undefined' && QRCode.toCanvas) {
                    // Using QRCode.js library
                    QRCode.toCanvas(canvas, data, {
                        width: this.qrConfig.size,
                        margin: this.qrConfig.margin,
                        errorCorrectionLevel: this.qrConfig.errorCorrectionLevel,
                        color: {
                            dark: this.qrConfig.colorDark,
                            light: this.qrConfig.colorLight
                        }
                    }, (error) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(canvas.toDataURL('image/png'));
                        }
                    });
                } else if (typeof qrcode !== 'undefined') {
                    // Using qrcode-generator library
                    const qr = qrcode(4, 'M');
                    qr.addData(data);
                    qr.make();
                    
                    const moduleCount = qr.getModuleCount();
                    const cellSize = Math.floor(this.qrConfig.size / moduleCount);
                    const margin = this.qrConfig.margin * cellSize;
                    
                    canvas.width = moduleCount * cellSize + 2 * margin;
                    canvas.height = moduleCount * cellSize + 2 * margin;
                    
                    ctx.fillStyle = this.qrConfig.colorLight;
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    
                    ctx.fillStyle = this.qrConfig.colorDark;
                    for (let row = 0; row < moduleCount; row++) {
                        for (let col = 0; col < moduleCount; col++) {
                            if (qr.isDark(row, col)) {
                                ctx.fillRect(
                                    margin + col * cellSize,
                                    margin + row * cellSize,
                                    cellSize,
                                    cellSize
                                );
                            }
                        }
                    }
                    
                    resolve(canvas.toDataURL('image/png'));
                } else {
                    reject(new Error('No compatible QR code library found'));
                }
                
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Generate QR code using fallback method (placeholder or API service)
     * @param {string} data - Data to encode
     * @returns {Promise<string>} Base64 image data or placeholder
     */
    async generateQRFallback(data) {
        // Option 1: Use online QR code service (for development only)
        if (navigator.onLine) {
            try {
                const encodedData = encodeURIComponent(data);
                const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${this.qrConfig.size}x${this.qrConfig.size}&data=${encodedData}`;
                
                // Convert to base64
                const response = await fetch(qrUrl);
                const blob = await response.blob();
                
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(blob);
                });
                
            } catch (error) {
                console.warn('Online QR service failed, using placeholder:', error);
            }
        }
        
        // Option 2: Generate placeholder QR code image
        return this.generatePlaceholderQR();
    }

    /**
     * Generate placeholder QR code image
     * @returns {string} Base64 placeholder image
     */
    generatePlaceholderQR() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = this.qrConfig.size;
        canvas.height = this.qrConfig.size;
        
        // Draw placeholder pattern
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#333333';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('QR CODE', canvas.width / 2, canvas.height / 2 - 10);
        ctx.fillText('PLACEHOLDER', canvas.width / 2, canvas.height / 2 + 10);
        
        // Draw border
        ctx.strokeStyle = '#cccccc';
        ctx.strokeRect(0, 0, canvas.width, canvas.height);
        
        return canvas.toDataURL('image/png');
    }

    /**
     * Store QR data for future reference
     * @param {string} certificateId - Certificate ID
     * @param {Object} validationData - Validation data
     * @param {string} qrImageData - QR image data
     */
    async storeQRData(certificateId, validationData, qrImageData) {
        const qrData = {
            certificateId,
            ...validationData,
            qrImageData,
            createdAt: new Date().toISOString()
        };
        
        // Store in local cache
        this.qrCodeCache.set(validationData.qrId, qrData);
        this.qrCodeCache.set(certificateId, qrData);
        
        // Persist to localStorage
        this.saveQRDataToStorage();
        
        // In production, also save to server
        try {
            await this.saveQRDataToServer(qrData);
        } catch (error) {
            console.warn('Failed to save QR data to server:', error);
        }
    }

    /**
     * Retrieve QR data by certificate ID or QR ID
     * @param {string} id - Certificate ID or QR ID
     * @returns {Object|null} QR data
     */
    async getQRData(id) {
        // Check local cache first
        if (this.qrCodeCache.has(id)) {
            return {
                success: true,
                data: this.qrCodeCache.get(id)
            };
        }
        
        // Try to load from server
        try {
            const response = await fetch(`${this.apiEndpoint}/${id}`);
            if (response.ok) {
                const data = await response.json();
                this.qrCodeCache.set(id, data);
                return { success: true, data };
            }
        } catch (error) {
            console.error('Failed to load QR data from server:', error);
        }
        
        return { success: false, error: 'QR data not found' };
    }

    /**
     * Validate QR code data
     * @param {string} qrId - QR ID
     * @param {string} hash - Expected hash
     * @returns {Promise<Object>} Validation result
     */
    async validateQRData(qrId, hash) {
        try {
            const result = await this.getQRData(qrId);
            if (!result.success) {
                return { success: false, error: 'QR code not found' };
            }
            
            const qrData = result.data;
            
            // Verify hash
            if (qrData.hash !== hash) {
                return { success: false, error: 'Invalid QR code hash' };
            }
            
            // Check expiry
            const expiryDate = new Date(qrData.payload.expiryDate);
            if (expiryDate < new Date()) {
                return { success: false, error: 'QR code has expired' };
            }
            
            return {
                success: true,
                data: {
                    valid: true,
                    certificateId: qrData.certificateId,
                    verificationId: qrData.payload.verificationId,
                    validatedAt: new Date().toISOString()
                }
            };
            
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Parse validation URL to extract QR data
     * @param {string} url - Validation URL
     * @returns {Object|null} Parsed QR data
     */
    parseValidationUrl(url) {
        try {
            const urlObj = new URL(url);
            const params = urlObj.searchParams;
            
            return {
                certificateId: params.get('cert'),
                hash: params.get('hash'),
                timestamp: params.get('t')
            };
        } catch (error) {
            console.error('Failed to parse validation URL:', error);
            return null;
        }
    }

    /**
     * Save QR data to localStorage
     */
    saveQRDataToStorage() {
        try {
            const qrData = Object.fromEntries(this.qrCodeCache);
            localStorage.setItem('issm_qr_codes', JSON.stringify(qrData));
        } catch (error) {
            console.warn('Failed to save QR data to storage:', error);
        }
    }

    /**
     * Load QR data from localStorage
     */
    loadQRDataFromStorage() {
        try {
            const stored = localStorage.getItem('issm_qr_codes');
            if (stored) {
                const qrData = JSON.parse(stored);
                Object.entries(qrData).forEach(([id, data]) => {
                    this.qrCodeCache.set(id, data);
                });
            }
        } catch (error) {
            console.warn('Failed to load QR data from storage:', error);
        }
    }

    /**
     * Save QR data to server (mock implementation)
     * @param {Object} qrData - QR data
     */
    async saveQRDataToServer(qrData) {
        // Mock implementation - in production, send to actual API
        await new Promise(resolve => setTimeout(resolve, 300));
        console.log('QR data saved to server:', qrData.qrId);
    }

    /**
     * Generate QR code for URL (utility method)
     * @param {string} url - URL to encode
     * @param {Object} options - QR code options
     * @returns {Promise<string>} Base64 image data
     */
    async generateQRForUrl(url, options = {}) {
        const config = { ...this.qrConfig, ...options };
        
        if (this.qrCodeLib) {
            return this.generateQRWithLibrary(url);
        } else {
            return this.generateQRFallback(url);
        }
    }

    /**
     * Initialize QR service
     */
    async initialize() {
        // Load cached QR data
        this.loadQRDataFromStorage();
        
        // Check if QR library is available
        if (!this.qrCodeLib) {
            console.warn('QR Code Service: No QR library detected. Some features may be limited.');
        }
        
        console.log('QR Code Service initialized');
    }
}

// Initialize service when DOM is ready
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        window.qrCodeService = new QRCodeGeneratorService();
        window.qrCodeService.initialize();
    });
}

// Export the service
if (typeof module !== 'undefined' && module.exports) {
    module.exports = QRCodeGeneratorService;
} else {
    window.QRCodeGeneratorService = QRCodeGeneratorService;
}