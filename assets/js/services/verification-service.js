/**
 * ISSM Entity Portal - Verification API Service
 * Handles all verification-related API calls
 */

class VerificationAPIService extends APIManager {
    constructor() {
        super();
        this.endpoints = {
            verifications: '/verifications',
            documents: '/documents',
            entities: '/entities',
            insurers: '/insurers'
        };
    }

    // Verification CRUD operations
    async getVerifications(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = `${this.endpoints.verifications}${queryString ? '?' + queryString : ''}`;
        return this.get(endpoint);
    }

    async getVerification(id) {
        return this.get(`${this.endpoints.verifications}/${id}`);
    }

    async createVerification(data) {
        return this.post(this.endpoints.verifications, data);
    }

    async updateVerification(id, data) {
        return this.put(`${this.endpoints.verifications}/${id}`, data);
    }

    async deleteVerification(id) {
        return this.delete(`${this.endpoints.verifications}/${id}`);
    }

    async cancelVerification(id, reason = '') {
        return this.post(`${this.endpoints.verifications}/${id}/cancel`, { reason });
    }

    // Document operations
    async uploadDocument(verificationId, file, documentType) {
        const endpoint = `${this.endpoints.verifications}/${verificationId}/documents`;
        return this.uploadFile(endpoint, file, { type: documentType });
    }

    async getDocuments(verificationId) {
        return this.get(`${this.endpoints.verifications}/${verificationId}/documents`);
    }

    async downloadDocument(documentId) {
        const response = await fetch(`${this.baseURL}/documents/${documentId}/download`, {
            headers: this.headers
        });
        
        if (response.ok) {
            return response.blob();
        }
        throw new Error('Failed to download document');
    }

    async deleteDocument(documentId) {
        return this.delete(`${this.endpoints.documents}/${documentId}`);
    }

    // Entity operations
    async getEntityProfile() {
        return this.get(`${this.endpoints.entities}/profile`);
    }

    async updateEntityProfile(data) {
        return this.put(`${this.endpoints.entities}/profile`, data);
    }

    async changePassword(currentPassword, newPassword) {
        return this.post(`${this.endpoints.entities}/change-password`, {
            currentPassword,
            newPassword
        });
    }

    // Insurance companies
    async getInsurers() {
        return this.get(this.endpoints.insurers);
    }

    async getInsurer(id) {
        return this.get(`${this.endpoints.insurers}/${id}`);
    }

    // Dashboard statistics
    async getDashboardStats() {
        return this.get(`${this.endpoints.verifications}/statistics`);
    }

    async getMonthlyTrends(year = new Date().getFullYear()) {
        return this.get(`${this.endpoints.verifications}/trends?year=${year}`);
    }

    // Comments and timeline
    async addComment(verificationId, comment) {
        return this.post(`${this.endpoints.verifications}/${verificationId}/comments`, { comment });
    }

    async getComments(verificationId) {
        return this.get(`${this.endpoints.verifications}/${verificationId}/comments`);
    }

    async getTimeline(verificationId) {
        return this.get(`${this.endpoints.verifications}/${verificationId}/timeline`);
    }

    // Notifications
    async getNotifications(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.get(`/notifications${queryString ? '?' + queryString : ''}`);
    }

    async markNotificationAsRead(notificationId) {
        return this.put(`/notifications/${notificationId}/read`);
    }

    async markAllNotificationsAsRead() {
        return this.put('/notifications/read-all');
    }
}

// Mock data service for development/testing
class MockVerificationService {
    constructor() {
        this.mockData = this.initializeMockData();
    }

    initializeMockData() {
        return {
            verifications: [
                {
                    id: 'REQ-2024-001',
                    policyNumber: 'POL-2024-789456',
                    insuranceCompany: 'Empresa Seguradora A',
                    insuredName: 'João Manuel Silva',
                    verificationType: 'validade',
                    status: 'pending',
                    submissionDate: '2024-01-05T14:30:00Z',
                    lastUpdate: '2024-01-05T15:00:00Z',
                    reason: 'Renovação do contrato de prestação de serviços',
                    documents: [
                        { id: 'DOC-001', name: 'apolice-exemplo.pdf', type: 'policy', size: 2457600 },
                        { id: 'DOC-002', name: 'identificacao-segurado.pdf', type: 'identification', size: 1887436 }
                    ]
                },
                {
                    id: 'REQ-2024-002',
                    policyNumber: 'POL-2024-123789',
                    insuranceCompany: 'Seguradora Geral',
                    insuredName: 'Maria Santos Silva',
                    verificationType: 'cobertura',
                    status: 'approved',
                    submissionDate: '2024-01-03T10:15:00Z',
                    lastUpdate: '2024-01-04T16:20:00Z',
                    reason: 'Verificação para processo licitatório',
                    documents: [
                        { id: 'DOC-003', name: 'apolice-geral.pdf', type: 'policy', size: 3145728 }
                    ]
                }
            ],
            insurers: [
                { id: 1, name: 'Empresa Seguradora A', code: 'ESA' },
                { id: 2, name: 'Seguradora Geral', code: 'SG' },
                { id: 3, name: 'Moçambique Vida', code: 'MV' },
                { id: 4, name: 'Emmanuel Seguradora', code: 'ES' }
            ],
            entityProfile: {
                id: 'ENT-2024-001',
                name: 'Entidade XYZ, Lda',
                type: 'empresa_privada',
                nuit: '400123456',
                email: 'geral@entidadexyz.co.mz',
                phone: '+258 21 123 456',
                address: 'Av. Julius Nyerere, 123\nBairro Central, Maputo',
                representative: {
                    name: 'João Manuel Silva',
                    position: 'Director Geral',
                    email: 'joao.silva@entidadexyz.co.mz'
                }
            },
            statistics: {
                totalRequests: 156,
                pendingRequests: 23,
                approvedRequests: 118,
                rejectedRequests: 15,
                monthlyTrends: {
                    labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
                    data: [12, 19, 15, 25, 28, 35]
                }
            }
        };
    }

    // Simulate API delays
    async delay(ms = 500) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async getVerifications(params = {}) {
        await this.delay();
        let verifications = [...this.mockData.verifications];
        
        // Apply filters
        if (params.status) {
            verifications = verifications.filter(v => v.status === params.status);
        }
        if (params.search) {
            const search = params.search.toLowerCase();
            verifications = verifications.filter(v => 
                v.policyNumber.toLowerCase().includes(search) ||
                v.insuredName.toLowerCase().includes(search) ||
                v.insuranceCompany.toLowerCase().includes(search)
            );
        }
        
        return { success: true, data: verifications };
    }

    async getVerification(id) {
        await this.delay();
        const verification = this.mockData.verifications.find(v => v.id === id);
        if (verification) {
            return { success: true, data: verification };
        }
        return { success: false, error: 'Verification not found' };
    }

    async createVerification(data) {
        await this.delay(1000);
        const newVerification = {
            id: `REQ-2024-${String(this.mockData.verifications.length + 1).padStart(3, '0')}`,
            ...data,
            status: 'pending',
            submissionDate: new Date().toISOString(),
            lastUpdate: new Date().toISOString(),
            documents: []
        };
        
        this.mockData.verifications.push(newVerification);
        return { success: true, data: newVerification };
    }

    async updateVerification(id, data) {
        await this.delay(800);
        const index = this.mockData.verifications.findIndex(v => v.id === id);
        if (index !== -1) {
            this.mockData.verifications[index] = {
                ...this.mockData.verifications[index],
                ...data,
                lastUpdate: new Date().toISOString()
            };
            return { success: true, data: this.mockData.verifications[index] };
        }
        return { success: false, error: 'Verification not found' };
    }

    async cancelVerification(id, reason) {
        await this.delay();
        return this.updateVerification(id, { status: 'cancelled', reason });
    }

    async getEntityProfile() {
        await this.delay();
        return { success: true, data: this.mockData.entityProfile };
    }

    async updateEntityProfile(data) {
        await this.delay(1000);
        this.mockData.entityProfile = { ...this.mockData.entityProfile, ...data };
        return { success: true, data: this.mockData.entityProfile };
    }

    async getDashboardStats() {
        await this.delay();
        return { success: true, data: this.mockData.statistics };
    }

    async getInsurers() {
        await this.delay();
        return { success: true, data: this.mockData.insurers };
    }

    async uploadDocument(verificationId, file, documentType) {
        await this.delay(2000);
        const newDoc = {
            id: `DOC-${Date.now()}`,
            name: file.name,
            type: documentType,
            size: file.size,
            uploadDate: new Date().toISOString()
        };
        
        // Add to verification's documents
        const verification = this.mockData.verifications.find(v => v.id === verificationId);
        if (verification) {
            verification.documents.push(newDoc);
        }
        
        return { success: true, data: newDoc };
    }

    async changePassword(currentPassword, newPassword) {
        await this.delay(1000);
        // In real implementation, this would validate the current password
        return { success: true, data: { message: 'Password changed successfully' } };
    }
}

// Service factory - returns mock service in development, real service in production
function createVerificationService() {
    // Check if we're in development mode
    const isDevelopment = window.location.hostname === 'localhost' || 
                         window.location.hostname.includes('127.0.0.1') ||
                         window.location.search.includes('mock=true');
    
    if (isDevelopment) {
        console.log('Using Mock Verification Service for development');
        return new MockVerificationService();
    } else {
        return new VerificationAPIService();
    }
}

// Global verification service instance
window.ISSM.VerificationService = createVerificationService();

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { VerificationAPIService, MockVerificationService, createVerificationService };
}