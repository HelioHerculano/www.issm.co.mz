/**
 * Email Service - ISSM Portal das Entidades
 * Handles email sending functionality for certificate delivery
 */

class EmailService {
    constructor() {
        this.apiEndpoint = '/api/email';
        this.templates = {
            certificateDelivery: 'certificate-delivery',
            verificationUpdate: 'verification-update',
            verificationApproval: 'verification-approval'
        };
        
        // Email queue for offline scenarios
        this.emailQueue = [];
        this.loadEmailQueueFromStorage();
    }

    /**
     * Send certificate via email
     * @param {Object} emailData - Email sending data
     * @param {Object} certificateData - Certificate data
     * @returns {Promise<Object>} Send result
     */
    async sendCertificateEmail(emailData, certificateData) {
        try {
            const emailPayload = {
                to: emailData.recipient,
                subject: emailData.subject || `Certificado de Validação de Apólice - ${certificateData.certificateId}`,
                template: this.templates.certificateDelivery,
                data: {
                    recipientName: emailData.recipientName || 'Estimado(a) Cliente',
                    certificateId: certificateData.certificateId,
                    verificationId: certificateData.verificationId,
                    policyNumber: certificateData.policyNumber,
                    insuranceCompany: certificateData.insuranceCompany,
                    insuredName: certificateData.insuredName,
                    validationUrl: certificateData.validationUrl,
                    issueDate: this.formatDate(certificateData.issueDate),
                    expiryDate: this.formatDate(certificateData.expiryDate),
                    customMessage: emailData.customMessage || ''
                },
                attachments: [
                    {
                        filename: `certificado_${certificateData.certificateId}.pdf`,
                        content: certificateData.pdfContent || '',
                        contentType: 'application/pdf'
                    }
                ]
            };

            // Send email
            const result = await this.sendEmail(emailPayload);
            
            if (result.success) {
                // Log email activity
                await this.logEmailActivity({
                    type: 'certificate_delivery',
                    recipient: emailData.recipient,
                    certificateId: certificateData.certificateId,
                    verificationId: certificateData.verificationId,
                    status: 'sent',
                    timestamp: new Date().toISOString()
                });
            }
            
            return result;
            
        } catch (error) {
            console.error('Failed to send certificate email:', error);
            
            // Add to queue for retry
            this.addToEmailQueue({
                type: 'certificate',
                emailData,
                certificateData,
                attempts: 0,
                created: new Date().toISOString()
            });
            
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Send verification status update email
     * @param {Object} emailData - Email data
     * @param {Object} verificationData - Verification data
     * @returns {Promise<Object>} Send result
     */
    async sendVerificationUpdateEmail(emailData, verificationData) {
        try {
            const emailPayload = {
                to: emailData.recipient,
                subject: emailData.subject || `Atualização da Verificação ${verificationData.id}`,
                template: this.templates.verificationUpdate,
                data: {
                    recipientName: emailData.recipientName || 'Estimado(a) Cliente',
                    verificationId: verificationData.id,
                    policyNumber: verificationData.policyNumber,
                    status: verificationData.status,
                    statusText: this.getStatusText(verificationData.status),
                    updateDate: this.formatDate(verificationData.lastUpdate),
                    customMessage: emailData.customMessage || ''
                }
            };

            const result = await this.sendEmail(emailPayload);
            
            if (result.success) {
                await this.logEmailActivity({
                    type: 'verification_update',
                    recipient: emailData.recipient,
                    verificationId: verificationData.id,
                    status: 'sent',
                    timestamp: new Date().toISOString()
                });
            }
            
            return result;
            
        } catch (error) {
            console.error('Failed to send verification update email:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Send email using configured service
     * @param {Object} emailPayload - Email payload
     * @returns {Promise<Object>} Send result
     */
    async sendEmail(emailPayload) {
        try {
            // In production, this would integrate with actual email service
            // For now, simulate email sending
            
            if (this.isOnline()) {
                // Simulate API call to email service
                const response = await this.mockEmailSend(emailPayload);
                return response;
            } else {
                throw new Error('Sem conexão com a internet. Email adicionado à fila.');
            }
            
        } catch (error) {
            throw new Error(`Falha ao enviar email: ${error.message}`);
        }
    }

    /**
     * Mock email sending for demonstration
     * @param {Object} emailPayload - Email payload
     * @returns {Promise<Object>} Mock response
     */
    async mockEmailSend(emailPayload) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Simulate occasional failures
        if (Math.random() < 0.1) {
            throw new Error('Falha temporária do serviço de email');
        }
        
        return {
            success: true,
            messageId: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Generate email content from template
     * @param {string} templateName - Template name
     * @param {Object} data - Template data
     * @returns {string} Generated email content
     */
    generateEmailContent(templateName, data) {
        const templates = {
            certificate_delivery: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #d78b29 0%, #b8771f 100%); color: white; padding: 30px; text-align: center;">
                        <h1>Certificado de Validação de Apólice</h1>
                        <p>Instituto de Supervisão de Seguros de Moçambique</p>
                    </div>
                    
                    <div style="padding: 30px; background: white;">
                        <p>Olá ${data.recipientName},</p>
                        
                        <p>Em anexo segue o certificado de validação da apólice de seguros que solicitou.</p>
                        
                        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="margin-top: 0;">Detalhes do Certificado</h3>
                            <p><strong>ID do Certificado:</strong> ${data.certificateId}</p>
                            <p><strong>Verificação:</strong> ${data.verificationId}</p>
                            <p><strong>Número da Apólice:</strong> ${data.policyNumber}</p>
                            <p><strong>Seguradora:</strong> ${data.insuranceCompany}</p>
                            <p><strong>Nome do Segurado:</strong> ${data.insuredName}</p>
                            <p><strong>Data de Emissão:</strong> ${data.issueDate}</p>
                            <p><strong>Válido até:</strong> ${data.expiryDate}</p>
                        </div>
                        
                        ${data.customMessage ? `<div style="background: #e8f4fd; padding: 15px; border-radius: 8px; margin: 20px 0;"><p><strong>Mensagem:</strong> ${data.customMessage}</p></div>` : ''}
                        
                        <p>Para verificar a autenticidade do certificado, acesse:</p>
                        <p><a href="${data.validationUrl}" style="color: #d78b29; text-decoration: none;">${data.validationUrl}</a></p>
                        
                        <p>Em caso de dúvidas, entre em contacto connosco através dos canais oficiais do ISSM.</p>
                        
                        <p>Atenciosamente,<br>
                        <strong>Instituto de Supervisão de Seguros de Moçambique</strong></p>
                    </div>
                    
                    <div style="background: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #6b7280;">
                        <p>Este é um email automático, por favor não responda.</p>
                        <p>© ${new Date().getFullYear()} ISSM - Instituto de Supervisão de Seguros de Moçambique</p>
                    </div>
                </div>
            `,
            
            verification_update: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #d78b29 0%, #b8771f 100%); color: white; padding: 30px; text-align: center;">
                        <h1>Atualização da Verificação</h1>
                        <p>Instituto de Supervisão de Seguros de Moçambique</p>
                    </div>
                    
                    <div style="padding: 30px; background: white;">
                        <p>Olá ${data.recipientName},</p>
                        
                        <p>A sua solicitação de verificação foi atualizada.</p>
                        
                        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="margin-top: 0;">Detalhes da Verificação</h3>
                            <p><strong>ID da Verificação:</strong> ${data.verificationId}</p>
                            <p><strong>Número da Apólice:</strong> ${data.policyNumber}</p>
                            <p><strong>Status Atual:</strong> ${data.statusText}</p>
                            <p><strong>Data da Atualização:</strong> ${data.updateDate}</p>
                        </div>
                        
                        ${data.customMessage ? `<div style="background: #e8f4fd; padding: 15px; border-radius: 8px; margin: 20px 0;"><p><strong>Mensagem:</strong> ${data.customMessage}</p></div>` : ''}
                        
                        <p>Para acompanhar o progresso da sua solicitação, acesse o portal das entidades.</p>
                        
                        <p>Atenciosamente,<br>
                        <strong>Instituto de Supervisão de Seguros de Moçambique</strong></p>
                    </div>
                    
                    <div style="background: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #6b7280;">
                        <p>Este é um email automático, por favor não responda.</p>
                        <p>© ${new Date().getFullYear()} ISSM - Instituto de Supervisão de Seguros de Moçambique</p>
                    </div>
                </div>
            `
        };
        
        return templates[templateName] || '';
    }

    /**
     * Add email to queue for retry
     * @param {Object} emailData - Email data
     */
    addToEmailQueue(emailData) {
        this.emailQueue.push({
            ...emailData,
            id: `email-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            created: new Date().toISOString()
        });
        
        this.saveEmailQueueToStorage();
    }

    /**
     * Process email queue
     * @returns {Promise<Array>} Processing results
     */
    async processEmailQueue() {
        if (!this.isOnline() || this.emailQueue.length === 0) {
            return [];
        }
        
        const results = [];
        const queueCopy = [...this.emailQueue];
        
        for (const emailItem of queueCopy) {
            try {
                let result;
                
                if (emailItem.type === 'certificate') {
                    result = await this.sendCertificateEmail(emailItem.emailData, emailItem.certificateData);
                } else if (emailItem.type === 'verification_update') {
                    result = await this.sendVerificationUpdateEmail(emailItem.emailData, emailItem.verificationData);
                }
                
                if (result.success) {
                    // Remove from queue
                    this.emailQueue = this.emailQueue.filter(item => item.id !== emailItem.id);
                    results.push({ id: emailItem.id, success: true });
                } else {
                    // Increment attempts
                    emailItem.attempts = (emailItem.attempts || 0) + 1;
                    
                    // Remove from queue if too many attempts
                    if (emailItem.attempts >= 3) {
                        this.emailQueue = this.emailQueue.filter(item => item.id !== emailItem.id);
                        results.push({ id: emailItem.id, success: false, error: 'Maximum attempts reached' });
                    }
                }
                
            } catch (error) {
                console.error('Failed to process email from queue:', error);
                results.push({ id: emailItem.id, success: false, error: error.message });
            }
        }
        
        this.saveEmailQueueToStorage();
        return results;
    }

    /**
     * Log email activity
     * @param {Object} activity - Email activity data
     */
    async logEmailActivity(activity) {
        try {
            const activities = JSON.parse(localStorage.getItem('issm_email_activities') || '[]');
            activities.push(activity);
            
            // Keep only last 100 activities
            if (activities.length > 100) {
                activities.splice(0, activities.length - 100);
            }
            
            localStorage.setItem('issm_email_activities', JSON.stringify(activities));
        } catch (error) {
            console.warn('Failed to log email activity:', error);
        }
    }

    /**
     * Get email activities
     * @param {Object} filters - Activity filters
     * @returns {Array} Email activities
     */
    getEmailActivities(filters = {}) {
        try {
            const activities = JSON.parse(localStorage.getItem('issm_email_activities') || '[]');
            
            if (filters.verificationId) {
                return activities.filter(activity => activity.verificationId === filters.verificationId);
            }
            
            if (filters.certificateId) {
                return activities.filter(activity => activity.certificateId === filters.certificateId);
            }
            
            return activities;
        } catch (error) {
            console.warn('Failed to get email activities:', error);
            return [];
        }
    }

    /**
     * Format date for display
     * @param {string} dateString - Date string
     * @returns {string} Formatted date
     */
    formatDate(dateString) {
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
     * Get status text in Portuguese
     * @param {string} status - Status code
     * @returns {string} Status text
     */
    getStatusText(status) {
        const statusMap = {
            'pending': 'Pendente',
            'in_review': 'Em Análise',
            'approved': 'Aprovado',
            'rejected': 'Rejeitado',
            'cancelled': 'Cancelado'
        };
        return statusMap[status] || status;
    }

    /**
     * Check if online
     * @returns {boolean} Online status
     */
    isOnline() {
        return navigator.onLine;
    }

    /**
     * Save email queue to localStorage
     */
    saveEmailQueueToStorage() {
        try {
            localStorage.setItem('issm_email_queue', JSON.stringify(this.emailQueue));
        } catch (error) {
            console.warn('Failed to save email queue:', error);
        }
    }

    /**
     * Load email queue from localStorage
     */
    loadEmailQueueFromStorage() {
        try {
            const stored = localStorage.getItem('issm_email_queue');
            if (stored) {
                this.emailQueue = JSON.parse(stored);
            }
        } catch (error) {
            console.warn('Failed to load email queue:', error);
            this.emailQueue = [];
        }
    }

    /**
     * Initialize email service
     */
    async initialize() {
        // Process any queued emails
        if (this.isOnline()) {
            await this.processEmailQueue();
        }
        
        // Setup online/offline listeners
        window.addEventListener('online', () => {
            this.processEmailQueue();
        });
        
        console.log('Email Service initialized');
    }
}

// Export the service
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EmailService;
} else {
    window.EmailService = EmailService;
}