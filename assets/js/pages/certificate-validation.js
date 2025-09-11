/**
 * Certificate Validation Page JavaScript - ISSM Portal das Entidades
 * Handles certificate display, validation, and user interactions
 */

class CertificateValidationController {
    constructor() {
        this.certificateId = null;
        this.certificateData = null;
        this.pdfService = null;
        this.qrService = null;
        this.currentZoom = 100;
        this.maxZoom = 200;
        this.minZoom = 50;
        this.zoomStep = 25;
        
        // Initialize services
        this.initializeServices();
        
        // Bind methods
        this.handleDownload = this.handleDownload.bind(this);
        this.handlePrint = this.handlePrint.bind(this);
        this.handleShare = this.handleShare.bind(this);
        this.handleEmail = this.handleEmail.bind(this);
        this.handleZoomIn = this.handleZoomIn.bind(this);
        this.handleZoomOut = this.handleZoomOut.bind(this);
        this.handleFitToWidth = this.handleFitToWidth.bind(this);
        this.copyUrl = this.copyUrl.bind(this);
    }

    /**
     * Initialize PDF and QR services
     */
    async initializeServices() {
        try {
            this.pdfService = new PDFCertificateService();
            this.qrService = new QRCodeGeneratorService();
            await this.qrService.initialize();
        } catch (error) {
            console.error('Failed to initialize services:', error);
            this.showError('Erro ao carregar os serviços necessários.');
        }
    }

    /**
     * Initialize the page
     */
    async initialize() {
        try {
            // Get certificate ID from URL parameters
            this.certificateId = this.getCertificateIdFromUrl();
            
            if (!this.certificateId) {
                this.showError('ID do certificado não fornecido.');
                return;
            }

            // Load certificate data
            await this.loadCertificateData();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Generate and display certificate
            await this.displayCertificate();
            
        } catch (error) {
            console.error('Failed to initialize certificate page:', error);
            this.showError('Erro ao carregar o certificado.');
        }
    }

    /**
     * Get certificate ID from URL parameters
     * @returns {string|null} Certificate ID
     */
    getCertificateIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('cert') || urlParams.get('id') || 'CERT-2024-001'; // Default for demo
    }

    /**
     * Load certificate data
     */
    async loadCertificateData() {
        try {
            // Try to get existing certificate first
            const result = await this.pdfService.getCertificate(this.certificateId);
            
            if (result.success) {
                this.certificateData = result.data;
            } else {
                // If certificate doesn't exist, generate it from verification data
                await this.generateCertificateFromVerification();
            }
            
            // Update UI with certificate data
            this.updateCertificateInfo();
            
        } catch (error) {
            console.error('Failed to load certificate data:', error);
            throw new Error('Falha ao carregar os dados do certificado');
        }
    }

    /**
     * Generate certificate from verification data
     */
    async generateCertificateFromVerification() {
        try {
            // Extract verification ID from certificate ID or URL params
            const urlParams = new URLSearchParams(window.location.search);
            const verificationId = urlParams.get('verification') || 'REQ-2024-001';
            
            // Generate certificate
            const result = await this.pdfService.generateCertificateForVerification(verificationId);
            
            if (result.success) {
                this.certificateData = result.data;
                this.certificateId = result.data.certificateId;
            } else {
                throw new Error(result.error);
            }
            
        } catch (error) {
            console.error('Failed to generate certificate:', error);
            throw new Error('Falha ao gerar o certificado');
        }
    }

    /**
     * Update certificate information in UI
     */
    updateCertificateInfo() {
        if (!this.certificateData) return;

        // Update main display
        document.getElementById('certificate-display-id').textContent = this.certificateId;
        document.getElementById('certificate-issue-date').textContent = this.formatDate(this.certificateData.issueDate);
        
        // Update info panel
        document.getElementById('certificate-info-id').textContent = this.certificateId;
        document.getElementById('certificate-info-issue-date').textContent = this.formatDate(this.certificateData.issueDate);
        document.getElementById('certificate-info-expiry').textContent = this.formatDate(this.certificateData.expiryDate);
        
        // Update verification link
        const verificationLink = document.getElementById('verification-link');
        if (verificationLink && this.certificateData.verificationId) {
            verificationLink.textContent = this.certificateData.verificationId;
            verificationLink.href = `verificacao-detalhes.html?id=${this.certificateData.verificationId}`;
        }
        
        // Update validation URL
        const validationUrl = this.certificateData.validationUrl || `${window.location.origin}/validate/${this.certificateId}`;
        document.getElementById('validation-url-input').value = validationUrl;
        document.getElementById('share-url-input').value = window.location.href;
        
        // Update page title
        document.title = `Certificado ${this.certificateId} | ISSM - Portal das Entidades`;
    }

    /**
     * Display certificate in the viewer
     */
    async displayCertificate() {
        try {
            const container = document.getElementById('certificate-preview-container');
            const loading = document.getElementById('loading-placeholder');
            
            if (!this.certificateData) {
                throw new Error('Dados do certificado não disponíveis');
            }
            
            // Show loading
            loading.style.display = 'block';
            
            // Generate QR code
            await this.generateAndDisplayQR();
            
            // Load and render certificate template
            const certificateHTML = await this.renderCertificateHTML();
            
            // Create iframe to display certificate
            const iframe = document.createElement('iframe');
            iframe.style.width = '100%';
            iframe.style.height = '800px';
            iframe.style.border = 'none';
            iframe.style.background = 'white';
            iframe.srcdoc = certificateHTML;
            
            // Replace loading with certificate
            loading.style.display = 'none';
            container.innerHTML = '';
            container.appendChild(iframe);
            
            // Apply initial zoom
            this.applyZoom();
            
        } catch (error) {
            console.error('Failed to display certificate:', error);
            this.showError('Erro ao exibir o certificado.');
        }
    }

    /**
     * Generate and display QR code
     */
    async generateAndDisplayQR() {
        try {
            if (!this.qrService) return;
            
            const validationUrl = `${window.location.origin}/validate?cert=${this.certificateId}&hash=${this.certificateData.securityHash}`;
            const qrImageData = await this.qrService.generateQRForUrl(validationUrl);
            
            const qrDisplay = document.getElementById('qr-code-display');
            qrDisplay.innerHTML = `
                <img src="${qrImageData}" alt="QR Code de Validação" class="img-fluid" style="max-width: 150px;">
            `;
            
        } catch (error) {
            console.error('Failed to generate QR code:', error);
        }
    }

    /**
     * Render certificate HTML with data
     */
    async renderCertificateHTML() {
        try {
            // Load template content (in production, this would load the actual template)
            const templateHTML = await this.loadCertificateTemplate();
            
            // Replace placeholders with actual data
            return templateHTML
                .replace(/{CERTIFICATE_ID}/g, this.certificateId)
                .replace(/{ISSUE_DATE}/g, this.formatDate(this.certificateData.issueDate))
                .replace(/{POLICY_NUMBER}/g, this.certificateData.policyNumber || 'POL-2024-789456')
                .replace(/{INSURANCE_COMPANY}/g, this.certificateData.insuranceCompany || 'Empresa Seguradora A')
                .replace(/{INSURED_NAME}/g, this.certificateData.insuredName || 'João Manuel Silva')
                .replace(/{VERIFICATION_TYPE}/g, this.certificateData.verificationType || 'Verificação de Validade')
                .replace(/{REQUESTER_NAME}/g, this.certificateData.requesterName || 'Maria Santos')
                .replace(/{VERIFICATION_DATE}/g, this.formatDate(this.certificateData.verificationDate))
                .replace(/{VALIDATION_STATUS}/g, 'VÁLIDA')
                .replace(/{EXPIRY_DATE}/g, this.formatDate(this.certificateData.expiryDate))
                .replace(/{VERIFICATION_ID}/g, this.certificateData.verificationId || 'REQ-2024-001')
                .replace(/{VALIDATION_URL}/g, `${window.location.origin}/validate/${this.certificateId}`)
                .replace(/{SECURITY_HASH}/g, this.certificateData.securityHash || 'sha256:sample_hash')
                .replace(/{SIGNATURE_TIMESTAMP}/g, this.formatDateTime(this.certificateData.signatureTimestamp));
        } catch (error) {
            console.error('Failed to render certificate HTML:', error);
            throw error;
        }
    }

    /**
     * Load certificate template
     */
    async loadCertificateTemplate() {
        // For demo purposes, return basic template
        // In production, load from ../assets/templates/certificate-template.html
        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Certificado de Validação</title>
    <link href="../assets/css/certificate-pdf.css" rel="stylesheet" type="text/css">
    <style>
        body { margin: 0; padding: 20px; font-family: 'Segoe UI', Arial, sans-serif; }
        .certificate-container { background: white; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    </style>
</head>
<body>
    <div class="certificate-container">
        <header class="certificate-header">
            <div class="header-content">
                <h1 class="certificate-title">Certificado de Validação de Apólice</h1>
                <div class="certificate-meta">
                    <div>Certificado Nº: {CERTIFICATE_ID}</div>
                    <div>Data de Emissão: {ISSUE_DATE}</div>
                </div>
            </div>
        </header>
        
        <main class="certificate-content">
            <section class="certificate-intro">
                <p>O Instituto de Supervisão de Seguros de Moçambique (ISSM) certifica que foi realizada a verificação da apólice de seguros abaixo identificada.</p>
            </section>
            
            <section class="policy-details">
                <h3>Detalhes da Apólice</h3>
                <div class="details-grid">
                    <div class="detail-row">
                        <div class="detail-label">Número da Apólice:</div>
                        <div class="detail-value">{POLICY_NUMBER}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">Seguradora:</div>
                        <div class="detail-value">{INSURANCE_COMPANY}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">Nome do Segurado:</div>
                        <div class="detail-value">{INSURED_NAME}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">Tipo de Verificação:</div>
                        <div class="detail-value">{VERIFICATION_TYPE}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">Solicitante:</div>
                        <div class="detail-value">{REQUESTER_NAME}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">Data da Verificação:</div>
                        <div class="detail-value">{VERIFICATION_DATE}</div>
                    </div>
                </div>
            </section>
            
            <section class="validation-status">
                <h3>Resultado da Verificação</h3>
                <div class="status-badge">
                    <div class="status-title">{VALIDATION_STATUS}</div>
                    <div class="status-subtitle">Apólice verificada com sucesso</div>
                </div>
                <div class="validity-info">
                    <div>Válido até: {EXPIRY_DATE}</div>
                    <div>Verificação ID: {VERIFICATION_ID}</div>
                </div>
            </section>
            
            <section class="qr-validation">
                <h3>Validação Digital</h3>
                <div class="qr-container">
                    <div class="qr-code">
                        <div style="width: 120px; height: 120px; background: #f0f0f0; border: 1px solid #ccc; display: flex; align-items: center; justify-content: center;">
                            QR CODE
                        </div>
                    </div>
                    <div class="validation-info">
                        <div><strong>URL:</strong> {VALIDATION_URL}</div>
                        <div><strong>Hash:</strong> {SECURITY_HASH}</div>
                    </div>
                </div>
            </section>
        </main>
        
        <footer class="certificate-footer">
            <div class="digital-signature">
                <p>Documento assinado digitalmente pelo ISSM</p>
                <p>Assinado em: {SIGNATURE_TIMESTAMP}</p>
            </div>
        </footer>
    </div>
</body>
</html>`;
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Action buttons
        document.getElementById('download-certificate-btn')?.addEventListener('click', this.handleDownload);
        document.getElementById('print-certificate-btn')?.addEventListener('click', this.handlePrint);
        document.getElementById('share-certificate-btn')?.addEventListener('click', this.handleShare);
        document.getElementById('email-certificate-btn')?.addEventListener('click', this.handleEmail);
        
        // Zoom controls
        document.getElementById('zoom-in-btn')?.addEventListener('click', this.handleZoomIn);
        document.getElementById('zoom-out-btn')?.addEventListener('click', this.handleZoomOut);
        document.getElementById('fit-to-width')?.addEventListener('change', this.handleFitToWidth);
        
        // Copy URL buttons
        document.getElementById('copy-url-btn')?.addEventListener('click', this.copyUrl);
        document.getElementById('copy-share-url-btn')?.addEventListener('click', () => this.copyShareUrl());
        
        // Modal buttons
        document.getElementById('send-email-btn')?.addEventListener('click', this.sendEmail.bind(this));
        
        // Social share buttons
        document.getElementById('share-email-btn')?.addEventListener('click', this.shareViaEmail.bind(this));
        document.getElementById('share-whatsapp-btn')?.addEventListener('click', this.shareViaWhatsApp.bind(this));
        document.getElementById('share-telegram-btn')?.addEventListener('click', this.shareViaTelegram.bind(this));
    }

    /**
     * Handle certificate download
     */
    async handleDownload() {
        try {
            if (!this.certificateData) {
                this.showError('Dados do certificado não disponíveis.');
                return;
            }
            
            // Generate PDF download
            const certificateHTML = await this.renderCertificateHTML();
            
            // Create blob and download
            const blob = new Blob([certificateHTML], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `certificado_${this.certificateId}.html`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showSuccess('Certificado baixado com sucesso!');
            
        } catch (error) {
            console.error('Download failed:', error);
            this.showError('Erro ao baixar o certificado.');
        }
    }

    /**
     * Handle print
     */
    handlePrint() {
        const iframe = document.querySelector('#certificate-preview-container iframe');
        if (iframe && iframe.contentWindow) {
            iframe.contentWindow.print();
        } else {
            window.print();
        }
    }

    /**
     * Handle share modal
     */
    handleShare() {
        const modal = new bootstrap.Modal(document.getElementById('shareCertificateModal'));
        modal.show();
    }

    /**
     * Handle email modal
     */
    handleEmail() {
        const modal = new bootstrap.Modal(document.getElementById('emailCertificateModal'));
        modal.show();
    }

    /**
     * Handle zoom in
     */
    handleZoomIn() {
        if (this.currentZoom < this.maxZoom) {
            this.currentZoom += this.zoomStep;
            this.applyZoom();
        }
    }

    /**
     * Handle zoom out
     */
    handleZoomOut() {
        if (this.currentZoom > this.minZoom) {
            this.currentZoom -= this.zoomStep;
            this.applyZoom();
        }
    }

    /**
     * Handle fit to width
     */
    handleFitToWidth(event) {
        const fitToWidth = event.target.checked;
        const container = document.getElementById('certificate-preview-container');
        const iframe = container.querySelector('iframe');
        
        if (iframe) {
            if (fitToWidth) {
                iframe.style.width = '100%';
                iframe.style.transform = 'none';
                this.currentZoom = 100;
            } else {
                this.applyZoom();
            }
        }
        
        this.updateZoomDisplay();
    }

    /**
     * Apply zoom to certificate
     */
    applyZoom() {
        const fitToWidth = document.getElementById('fit-to-width').checked;
        if (fitToWidth) return;
        
        const container = document.getElementById('certificate-preview-container');
        const iframe = container.querySelector('iframe');
        
        if (iframe) {
            const scale = this.currentZoom / 100;
            iframe.style.transform = `scale(${scale})`;
            iframe.style.transformOrigin = 'top left';
            iframe.style.width = `${100 / scale}%`;
        }
        
        this.updateZoomDisplay();
    }

    /**
     * Update zoom display
     */
    updateZoomDisplay() {
        const display = document.getElementById('zoom-display');
        if (display) {
            display.textContent = `${this.currentZoom}%`;
        }
        
        // Update button states
        const zoomInBtn = document.getElementById('zoom-in-btn');
        const zoomOutBtn = document.getElementById('zoom-out-btn');
        
        if (zoomInBtn) {
            zoomInBtn.disabled = this.currentZoom >= this.maxZoom;
        }
        if (zoomOutBtn) {
            zoomOutBtn.disabled = this.currentZoom <= this.minZoom;
        }
    }

    /**
     * Copy validation URL
     */
    async copyUrl() {
        const input = document.getElementById('validation-url-input');
        try {
            await navigator.clipboard.writeText(input.value);
            this.showSuccess('URL copiada para a área de transferência!');
        } catch (error) {
            // Fallback for older browsers
            input.select();
            document.execCommand('copy');
            this.showSuccess('URL copiada para a área de transferência!');
        }
    }

    /**
     * Copy share URL
     */
    async copyShareUrl() {
        const input = document.getElementById('share-url-input');
        try {
            await navigator.clipboard.writeText(input.value);
            this.showSuccess('URL copiada para a área de transferência!');
        } catch (error) {
            input.select();
            document.execCommand('copy');
            this.showSuccess('URL copiada para a área de transferência!');
        }
    }

    /**
     * Send email
     */
    async sendEmail() {
        try {
            const recipient = document.getElementById('email-recipient').value;
            const subject = document.getElementById('email-subject').value;
            const message = document.getElementById('email-message').value;
            
            if (!recipient) {
                this.showError('Por favor, insira o email do destinatário.');
                return;
            }
            
            // In a real implementation, this would send via API
            console.log('Sending email:', { recipient, subject, message, certificateId: this.certificateId });
            
            // Mock email sending
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const modal = bootstrap.Modal.getInstance(document.getElementById('emailCertificateModal'));
            modal.hide();
            
            this.showSuccess('Email enviado com sucesso!');
            
        } catch (error) {
            console.error('Failed to send email:', error);
            this.showError('Erro ao enviar email.');
        }
    }

    /**
     * Share via email
     */
    shareViaEmail() {
        const subject = encodeURIComponent(`Certificado de Validação - ${this.certificateId}`);
        const body = encodeURIComponent(`Certificado de validação de apólice: ${window.location.href}`);
        window.open(`mailto:?subject=${subject}&body=${body}`);
    }

    /**
     * Share via WhatsApp
     */
    shareViaWhatsApp() {
        const text = encodeURIComponent(`Certificado de Validação de Apólice - ${this.certificateId}: ${window.location.href}`);
        window.open(`https://wa.me/?text=${text}`);
    }

    /**
     * Share via Telegram
     */
    shareViaTelegram() {
        const text = encodeURIComponent(`Certificado de Validação de Apólice - ${this.certificateId}`);
        const url = encodeURIComponent(window.location.href);
        window.open(`https://t.me/share/url?url=${url}&text=${text}`);
    }

    /**
     * Format date for display
     */
    formatDate(dateString) {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('pt-PT', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }).format(date);
    }

    /**
     * Format date and time for display
     */
    formatDateTime(dateString) {
        if (!dateString) return '-';
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
     * Show success message
     */
    showSuccess(message) {
        // Using toast notification (assumes bootstrap toast or similar)
        this.showNotification(message, 'success');
    }

    /**
     * Show error message
     */
    showError(message) {
        this.showNotification(message, 'error');
    }

    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = `alert alert-${type === 'error' ? 'danger' : type === 'success' ? 'success' : 'info'} alert-dismissible fade show position-fixed`;
        toast.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        toast.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(toast);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 5000);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async function() {
    try {
        const controller = new CertificateValidationController();
        await controller.initialize();
        
        // Make controller globally available for debugging
        window.certificateController = controller;
        
    } catch (error) {
        console.error('Failed to initialize certificate validation page:', error);
    }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CertificateValidationController;
} else {
    window.CertificateValidationController = CertificateValidationController;
}