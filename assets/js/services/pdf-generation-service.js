/**
 * PDF Certificate Generation Service - ISSM Portal das Entidades
 * Handles the generation of insurance policy validation certificates in PDF format
 */

class PDFCertificateService {
    constructor() {
        this.apiEndpoint = '/api/certificates';
        this.templatePath = '../templates/certificate-template.html';
        this.qrCodeService = new QRCodeGeneratorService();
        this.certificates = new Map(); // Local cache for certificates
        
        // Certificate storage
        this.storageKey = 'issm_certificates';
        this.loadCertificatesFromStorage();
    }

    /**
     * Generate a new certificate for a verification request
     * @param {Object} verificationData - The verification data
     * @returns {Promise<Object>} Certificate generation result
     */
    async generateCertificate(verificationData) {
        try {
            // Validate input data
            this.validateVerificationData(verificationData);
            
            // Generate certificate ID and metadata
            const certificateData = await this.prepareCertificateData(verificationData);
            
            // Generate QR code for validation
            const qrCodeData = await this.qrCodeService.generateValidationQR(certificateData);
            
            // Render the certificate template
            const certificateHTML = await this.renderCertificateTemplate(certificateData, qrCodeData);
            
            // Generate PDF (in a real implementation, this would use a PDF library)
            const pdfResult = await this.generatePDFDocument(certificateHTML, certificateData);
            
            // Store certificate data
            await this.storeCertificate(certificateData, pdfResult);
            
            return {
                success: true,
                data: {
                    certificateId: certificateData.certificateId,
                    pdfUrl: pdfResult.pdfUrl,
                    validationUrl: qrCodeData.validationUrl,
                    downloadUrl: pdfResult.downloadUrl,
                    expiryDate: certificateData.expiryDate
                }
            };
            
        } catch (error) {
            console.error('Certificate generation failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Validate verification data before certificate generation
     * @param {Object} data - Verification data to validate
     */
    validateVerificationData(data) {
        const requiredFields = [
            'id', 'policyNumber', 'insuranceCompany', 
            'insuredName', 'verificationType', 'status'
        ];
        
        for (const field of requiredFields) {
            if (!data[field]) {
                throw new Error(`Missing required field: ${field}`);
            }
        }
        
        if (data.status !== 'approved') {
            throw new Error('Certificate can only be generated for approved verifications');
        }
    }

    /**
     * Prepare certificate data with all necessary information
     * @param {Object} verificationData - Original verification data
     * @returns {Object} Complete certificate data
     */
    async prepareCertificateData(verificationData) {
        const now = new Date();
        const certificateId = this.generateCertificateId();
        const expiryDate = new Date(now.getTime() + (365 * 24 * 60 * 60 * 1000)); // 1 year validity
        
        return {
            certificateId,
            verificationId: verificationData.id,
            issueDate: now.toISOString(),
            expiryDate: expiryDate.toISOString(),
            
            // Policy information
            policyNumber: verificationData.policyNumber,
            insuranceCompany: verificationData.insuranceCompany,
            insuredName: verificationData.insuredName,
            verificationType: this.getVerificationTypeText(verificationData.verificationType),
            
            // Verification details
            verificationDate: verificationData.submissionDate || verificationData.lastUpdate,
            validationStatus: 'VÁLIDA',
            requesterName: verificationData.requesterName || 'Nome do Solicitante',
            
            // Security
            securityHash: await this.generateSecurityHash(certificateId, verificationData),
            signatureTimestamp: now.toISOString(),
            
            // Metadata
            createdBy: 'ISSM Sistema Automático',
            version: '1.0'
        };
    }

    /**
     * Generate a unique certificate ID
     * @returns {string} Certificate ID
     */
    generateCertificateId() {
        const year = new Date().getFullYear();
        const sequence = String(Date.now()).slice(-6);
        return `CERT-${year}-${sequence}`;
    }

    /**
     * Get human-readable verification type text
     * @param {string} type - Verification type code
     * @returns {string} Human-readable text
     */
    getVerificationTypeText(type) {
        const typeMap = {
            'validade': 'Verificação de Validade',
            'validity': 'Verificação de Validade',
            'cobertura': 'Verificação de Cobertura',
            'coverage': 'Verificação de Cobertura',
            'historico': 'Histórico de Sinistros',
            'claims_history': 'Histórico de Sinistros'
        };
        return typeMap[type] || 'Verificação Geral';
    }

    /**
     * Generate security hash for certificate validation
     * @param {string} certificateId - Certificate ID
     * @param {Object} verificationData - Verification data
     * @returns {string} Security hash
     */
    async generateSecurityHash(certificateId, verificationData) {
        const dataString = JSON.stringify({
            certificateId,
            verificationId: verificationData.id,
            policyNumber: verificationData.policyNumber,
            timestamp: Date.now()
        });
        
        // In a real implementation, use Web Crypto API or similar
        const hash = await this.simpleHash(dataString);
        return `sha256:${hash}`;
    }

    /**
     * Simple hash function for demonstration (replace with proper crypto in production)
     * @param {string} str - String to hash
     * @returns {string} Hash value
     */
    async simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(16).padStart(8, '0');
    }

    /**
     * Render certificate template with data
     * @param {Object} certificateData - Certificate data
     * @param {Object} qrCodeData - QR code data
     * @returns {string} Rendered HTML
     */
    async renderCertificateTemplate(certificateData, qrCodeData) {
        try {
            // Load template (in a real app, this would fetch from server)
            const template = await this.loadTemplate();
            
            // Create validation URL
            const validationUrl = `${window.location.origin}/validate/${certificateData.certificateId}`;
            
            // Replace template variables
            let renderedHTML = template
                .replace(/{CERTIFICATE_ID}/g, certificateData.certificateId)
                .replace(/{ISSUE_DATE}/g, this.formatDate(certificateData.issueDate))
                .replace(/{POLICY_NUMBER}/g, certificateData.policyNumber)
                .replace(/{INSURANCE_COMPANY}/g, certificateData.insuranceCompany)
                .replace(/{INSURED_NAME}/g, certificateData.insuredName)
                .replace(/{VERIFICATION_TYPE}/g, certificateData.verificationType)
                .replace(/{REQUESTER_NAME}/g, certificateData.requesterName)
                .replace(/{VERIFICATION_DATE}/g, this.formatDate(certificateData.verificationDate))
                .replace(/{VALIDATION_STATUS}/g, certificateData.validationStatus)
                .replace(/{EXPIRY_DATE}/g, this.formatDate(certificateData.expiryDate))
                .replace(/{VERIFICATION_ID}/g, certificateData.verificationId)
                .replace(/{VALIDATION_URL}/g, validationUrl)
                .replace(/{SECURITY_HASH}/g, certificateData.securityHash)
                .replace(/{SIGNATURE_TIMESTAMP}/g, this.formatDateTime(certificateData.signatureTimestamp));
            
            // Set QR code image
            if (qrCodeData.qrImageData) {
                renderedHTML = renderedHTML.replace(
                    'src=""', 
                    `src="${qrCodeData.qrImageData}"`
                );
            }
            
            return renderedHTML;
            
        } catch (error) {
            throw new Error(`Template rendering failed: ${error.message}`);
        }
    }

    /**
     * Load certificate template
     * @returns {string} Template HTML
     */
    async loadTemplate() {
        // In a real implementation, this would fetch the template file
        // For now, return a basic template structure
        return `
        <div class="certificate-container">
            <header class="certificate-header">
                <h1>Certificado de Validação</h1>
                <div>Certificado Nº: {CERTIFICATE_ID}</div>
                <div>Data: {ISSUE_DATE}</div>
            </header>
            <main class="certificate-content">
                <section class="policy-details">
                    <h3>Detalhes da Apólice</h3>
                    <p>Número: {POLICY_NUMBER}</p>
                    <p>Seguradora: {INSURANCE_COMPANY}</p>
                    <p>Segurado: {INSURED_NAME}</p>
                    <p>Tipo: {VERIFICATION_TYPE}</p>
                    <p>Solicitante: {REQUESTER_NAME}</p>
                    <p>Data Verificação: {VERIFICATION_DATE}</p>
                </section>
                <section class="validation-status">
                    <h3>Status: {VALIDATION_STATUS}</h3>
                    <p>Válido até: {EXPIRY_DATE}</p>
                    <p>ID Verificação: {VERIFICATION_ID}</p>
                </section>
                <section class="qr-validation">
                    <img src="" alt="QR Code" width="120" height="120">
                    <p>URL: {VALIDATION_URL}</p>
                    <p>Hash: {SECURITY_HASH}</p>
                </section>
            </main>
            <footer class="certificate-footer">
                <p>Assinado digitalmente em: {SIGNATURE_TIMESTAMP}</p>
            </footer>
        </div>`;
    }

    /**
     * Generate PDF document from HTML
     * @param {string} html - Certificate HTML
     * @param {Object} certificateData - Certificate data
     * @returns {Object} PDF generation result
     */
    async generatePDFDocument(html, certificateData) {
        // In a real implementation, this would use a PDF generation library
        // like jsPDF, html2pdf, or a server-side service
        
        const pdfUrl = `data:text/html;base64,${btoa(html)}`;
        const downloadUrl = `/api/certificates/${certificateData.certificateId}/download`;
        
        return {
            pdfUrl,
            downloadUrl,
            fileName: `certificado_${certificateData.certificateId}.pdf`,
            size: html.length // Mock size
        };
    }

    /**
     * Store certificate data locally and on server
     * @param {Object} certificateData - Certificate data
     * @param {Object} pdfResult - PDF generation result
     */
    async storeCertificate(certificateData, pdfResult) {
        const certificate = {
            ...certificateData,
            pdfUrl: pdfResult.pdfUrl,
            downloadUrl: pdfResult.downloadUrl,
            fileName: pdfResult.fileName,
            createdAt: new Date().toISOString()
        };
        
        // Store in local cache
        this.certificates.set(certificateData.certificateId, certificate);
        
        // Persist to localStorage
        this.saveCertificatesToStorage();
        
        // In production, also save to server
        try {
            await this.saveCertificateToServer(certificate);
        } catch (error) {
            console.warn('Failed to save certificate to server:', error);
        }
    }

    /**
     * Retrieve certificate by ID
     * @param {string} certificateId - Certificate ID
     * @returns {Object|null} Certificate data
     */
    async getCertificate(certificateId) {
        // Check local cache first
        if (this.certificates.has(certificateId)) {
            return {
                success: true,
                data: this.certificates.get(certificateId)
            };
        }
        
        // Try to load from server
        try {
            const response = await fetch(`${this.apiEndpoint}/${certificateId}`);
            if (response.ok) {
                const data = await response.json();
                this.certificates.set(certificateId, data);
                return { success: true, data };
            }
        } catch (error) {
            console.error('Failed to load certificate from server:', error);
        }
        
        return { success: false, error: 'Certificate not found' };
    }

    /**
     * Validate certificate authenticity
     * @param {string} certificateId - Certificate ID
     * @param {string} securityHash - Security hash to verify
     * @returns {Object} Validation result
     */
    async validateCertificate(certificateId, securityHash) {
        try {
            const result = await this.getCertificate(certificateId);
            if (!result.success) {
                return { success: false, error: 'Certificate not found' };
            }
            
            const certificate = result.data;
            
            // Check expiry
            if (new Date(certificate.expiryDate) < new Date()) {
                return { success: false, error: 'Certificate has expired' };
            }
            
            // Verify hash (simplified validation)
            if (certificate.securityHash !== securityHash) {
                return { success: false, error: 'Invalid security hash' };
            }
            
            return {
                success: true,
                data: {
                    valid: true,
                    certificate: certificate,
                    validatedAt: new Date().toISOString()
                }
            };
            
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Format date for display
     * @param {string} dateString - ISO date string
     * @returns {string} Formatted date
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('pt-PT', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }).format(date);
    }

    /**
     * Format date and time for display
     * @param {string} dateString - ISO date string
     * @returns {string} Formatted date and time
     */
    formatDateTime(dateString) {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('pt-PT', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    }

    /**
     * Load certificates from localStorage
     */
    loadCertificatesFromStorage() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                const certificates = JSON.parse(stored);
                Object.entries(certificates).forEach(([id, cert]) => {
                    this.certificates.set(id, cert);
                });
            }
        } catch (error) {
            console.warn('Failed to load certificates from storage:', error);
        }
    }

    /**
     * Save certificates to localStorage
     */
    saveCertificatesToStorage() {
        try {
            const certificates = Object.fromEntries(this.certificates);
            localStorage.setItem(this.storageKey, JSON.stringify(certificates));
        } catch (error) {
            console.warn('Failed to save certificates to storage:', error);
        }
    }

    /**
     * Save certificate to server (mock implementation)
     * @param {Object} certificate - Certificate data
     */
    async saveCertificateToServer(certificate) {
        // Mock implementation - in production, send to actual API
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log('Certificate saved to server:', certificate.certificateId);
    }

    /**
     * Generate certificate for verification (convenience method)
     * @param {string} verificationId - Verification ID
     * @returns {Promise<Object>} Generation result
     */
    async generateCertificateForVerification(verificationId) {
        try {
            // Get verification data (mock implementation)
            const verificationData = await this.getVerificationData(verificationId);
            if (!verificationData) {
                throw new Error('Verification not found');
            }
            
            return await this.generateCertificate(verificationData);
            
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Mock method to get verification data
     * @param {string} verificationId - Verification ID
     * @returns {Object|null} Verification data
     */
    async getVerificationData(verificationId) {
        // This would typically fetch from the verification service
        // For now, return mock data
        return {
            id: verificationId,
            policyNumber: 'POL-2024-789456',
            insuranceCompany: 'Empresa Seguradora A',
            insuredName: 'João Manuel Silva',
            verificationType: 'validade',
            status: 'approved',
            submissionDate: '2024-01-05T14:30:00Z',
            requesterName: 'Maria Santos'
        };
    }
}

// Export the service
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PDFCertificateService;
} else {
    window.PDFCertificateService = PDFCertificateService;
}