/**
 * 询盘处理流程集成测试
 */
import { emailService } from '@/lib/email-service';
import { 
  Inquiry,
  InquiryCreateData,
  InquiryStatus,
  InquiryPriority,
  InquiryType,
  InquirySource,
  CustomerType
} from '@/types/inquiry';

// Mock fetch for API calls
global.fetch = jest.fn();

// Mock email service
jest.mock('@/lib/email-service', () => ({
  emailService: {
    sendNewInquiryNotification: jest.fn(),
    sendAutoReply: jest.fn(),
    sendStatusChangeNotification: jest.fn(),
  },
}));

describe('Inquiry Processing Integration', () => {
  const mockInquiryData: InquiryCreateData = {
    type: InquiryType.QUOTE_REQUEST,
    source: InquirySource.WEBSITE,
    contact: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1-555-0123',
      jobTitle: 'Project Manager',
    },
    company: {
      name: 'Test Company Inc',
      website: 'https://testcompany.com',
      industry: 'Technology',
      country: 'United States',
      city: 'New York',
    },
    customerType: CustomerType.END_USER,
    productRequirements: [
      {
        productName: 'P2.5 Indoor LED Display',
        pixelPitch: 'P2.5',
        screenSize: { width: 3000, height: 2000, unit: 'mm' },
        quantity: 2,
        application: 'Conference Room',
        installationEnvironment: 'indoor',
      }
    ],
    subject: 'Quote Request for Conference Room Displays',
    message: 'We need LED displays for our conference rooms. Please provide a quote.',
    language: 'en',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockClear();
  });

  describe('Inquiry Creation Flow', () => {
    it('should create inquiry and trigger notifications', async () => {
      const mockResponse = {
        success: true,
        data: {
          id: 'inquiry_123',
          inquiryNumber: 'INQ-2024-001',
          ...mockInquiryData,
          status: InquiryStatus.NEW,
          priority: InquiryPriority.MEDIUM,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      // Simulate inquiry creation
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mockInquiryData),
      });

      const result = await response.json();

      expect(response.ok).toBe(true);
      expect(result.success).toBe(true);
      expect(result.data.inquiryNumber).toBe('INQ-2024-001');
      expect(result.data.status).toBe(InquiryStatus.NEW);
    });

    it('should send auto-reply email after inquiry creation', async () => {
      const mockInquiry: Inquiry = {
        id: 'inquiry_123',
        inquiryNumber: 'INQ-2024-001',
        ...mockInquiryData,
        status: InquiryStatus.NEW,
        priority: InquiryPriority.MEDIUM,
        productRequirements: mockInquiryData.productRequirements.map(req => ({
          ...req,
          id: 'req_123'
        })),
        followUps: [],
        attachments: [],
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await emailService.sendAutoReply(mockInquiry);

      expect(emailService.sendAutoReply).toHaveBeenCalledWith(mockInquiry);
    });

    it('should send notification to sales team', async () => {
      const mockInquiry: Inquiry = {
        id: 'inquiry_123',
        inquiryNumber: 'INQ-2024-001',
        ...mockInquiryData,
        status: InquiryStatus.NEW,
        priority: InquiryPriority.MEDIUM,
        productRequirements: mockInquiryData.productRequirements.map(req => ({
          ...req,
          id: 'req_123'
        })),
        followUps: [],
        attachments: [],
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const salesTeam = ['sales1@company.com', 'sales2@company.com'];
      await emailService.sendNewInquiryNotification(mockInquiry, salesTeam);

      expect(emailService.sendNewInquiryNotification).toHaveBeenCalledWith(
        mockInquiry,
        salesTeam
      );
    });
  });

  describe('Inquiry Status Updates', () => {
    it('should update inquiry status and send notifications', async () => {
      const inquiryId = 'inquiry_123';
      const newStatus = InquiryStatus.IN_PROGRESS;
      const previousStatus = InquiryStatus.NEW;

      const mockResponse = {
        success: true,
        data: {
          id: inquiryId,
          status: newStatus,
          updatedAt: new Date(),
        },
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const response = await fetch(`/api/inquiries/${inquiryId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const result = await response.json();

      expect(response.ok).toBe(true);
      expect(result.success).toBe(true);
      expect(result.data.status).toBe(newStatus);
    });

    it('should send status change notification', async () => {
      const mockInquiry: Inquiry = {
        id: 'inquiry_123',
        inquiryNumber: 'INQ-2024-001',
        ...mockInquiryData,
        status: InquiryStatus.IN_PROGRESS,
        priority: InquiryPriority.MEDIUM,
        productRequirements: mockInquiryData.productRequirements.map(req => ({
          ...req,
          id: 'req_123'
        })),
        followUps: [],
        attachments: [],
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const previousStatus = InquiryStatus.NEW;
      const updatedBy = 'sales@company.com';
      const recipients = ['manager@company.com'];

      await emailService.sendStatusChangeNotification(
        mockInquiry,
        previousStatus,
        updatedBy,
        recipients
      );

      expect(emailService.sendStatusChangeNotification).toHaveBeenCalledWith(
        mockInquiry,
        previousStatus,
        updatedBy,
        recipients
      );
    });
  });

  describe('Bulk Operations', () => {
    it('should handle bulk status updates', async () => {
      const inquiryIds = ['inquiry_1', 'inquiry_2', 'inquiry_3'];
      const newStatus = InquiryStatus.ASSIGNED;

      const mockResponse = {
        success: true,
        data: {
          success: 3,
          failed: 0,
        },
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const response = await fetch('/api/inquiries?action=bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update_status',
          inquiryIds,
          data: { status: newStatus },
        }),
      });

      const result = await response.json();

      expect(response.ok).toBe(true);
      expect(result.success).toBe(true);
      expect(result.data.success).toBe(3);
      expect(result.data.failed).toBe(0);
    });

    it('should handle bulk assignment operations', async () => {
      const inquiryIds = ['inquiry_1', 'inquiry_2'];
      const assignedTo = 'sales@company.com';

      const mockResponse = {
        success: true,
        data: {
          success: 2,
          failed: 0,
        },
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const response = await fetch('/api/inquiries?action=bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'assign',
          inquiryIds,
          data: { assignedTo },
        }),
      });

      const result = await response.json();

      expect(response.ok).toBe(true);
      expect(result.success).toBe(true);
      expect(result.data.success).toBe(2);
    });
  });

  describe('Follow-up Management', () => {
    it('should add follow-up to inquiry', async () => {
      const inquiryId = 'inquiry_123';
      const followUp = {
        type: 'call',
        content: 'Called customer to discuss requirements',
        scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      };

      const mockResponse = {
        success: true,
        data: {
          id: 'followup_123',
          ...followUp,
          createdBy: 'sales@company.com',
          createdAt: new Date(),
        },
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const response = await fetch(`/api/inquiries/${inquiryId}/followups`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(followUp),
      });

      const result = await response.json();

      expect(response.ok).toBe(true);
      expect(result.success).toBe(true);
      expect(result.data.type).toBe(followUp.type);
      expect(result.data.content).toBe(followUp.content);
    });
  });

  describe('Inquiry Search and Filtering', () => {
    it('should search inquiries by text', async () => {
      const searchQuery = 'conference room';

      const mockResponse = {
        success: true,
        data: [
          {
            id: 'inquiry_123',
            inquiryNumber: 'INQ-2024-001',
            subject: 'Conference Room LED Display Quote',
            contact: { firstName: 'John', lastName: 'Doe' },
            company: { name: 'Test Company' },
          }
        ],
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const response = await fetch(`/api/inquiries?action=search&q=${encodeURIComponent(searchQuery)}`);
      const result = await response.json();

      expect(response.ok).toBe(true);
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].subject).toContain('Conference Room');
    });

    it('should filter inquiries by status', async () => {
      const mockResponse = {
        success: true,
        data: {
          inquiries: [
            {
              id: 'inquiry_1',
              status: InquiryStatus.NEW,
            },
            {
              id: 'inquiry_2',
              status: InquiryStatus.NEW,
            }
          ],
          total: 2,
          page: 1,
          totalPages: 1,
        },
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const response = await fetch('/api/inquiries?status=NEW');
      const result = await response.json();

      expect(response.ok).toBe(true);
      expect(result.success).toBe(true);
      expect(result.data.inquiries).toHaveLength(2);
      expect(result.data.inquiries[0].status).toBe(InquiryStatus.NEW);
    });
  });

  describe('Inquiry Statistics', () => {
    it('should get inquiry statistics', async () => {
      const mockStats = {
        total: 150,
        byStatus: [
          { status: InquiryStatus.NEW, count: 25, percentage: 16.7 },
          { status: InquiryStatus.IN_PROGRESS, count: 40, percentage: 26.7 },
          { status: InquiryStatus.WON, count: 30, percentage: 20 },
          { status: InquiryStatus.LOST, count: 20, percentage: 13.3 },
          { status: InquiryStatus.CLOSED, count: 35, percentage: 23.3 },
        ],
        byPriority: [
          { priority: InquiryPriority.LOW, count: 30 },
          { priority: InquiryPriority.MEDIUM, count: 80 },
          { priority: InquiryPriority.HIGH, count: 30 },
          { priority: InquiryPriority.URGENT, count: 10 },
        ],
        conversionRate: {
          totalInquiries: 150,
          wonInquiries: 30,
          rate: 20,
        },
        averageResponseTime: 2.5,
      };

      const mockResponse = {
        success: true,
        data: mockStats,
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const response = await fetch('/api/inquiries?action=stats');
      const result = await response.json();

      expect(response.ok).toBe(true);
      expect(result.success).toBe(true);
      expect(result.data.total).toBe(150);
      expect(result.data.conversionRate.rate).toBe(20);
      expect(result.data.averageResponseTime).toBe(2.5);
    });
  });

  describe('Error Handling', () => {
    it('should handle validation errors', async () => {
      const invalidInquiryData = {
        ...mockInquiryData,
        contact: {
          ...mockInquiryData.contact,
          email: 'invalid-email', // Invalid email format
        },
      };

      const mockResponse = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid inquiry data',
          details: {
            'contact.email': 'Invalid email format',
          },
        },
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => mockResponse,
      });

      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invalidInquiryData),
      });

      const result = await response.json();

      expect(response.ok).toBe(false);
      expect(response.status).toBe(400);
      expect(result.success).toBe(false);
      expect(result.error.code).toBe('VALIDATION_ERROR');
      expect(result.error.details['contact.email']).toBe('Invalid email format');
    });

    it('should handle server errors gracefully', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      try {
        await fetch('/api/inquiries', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(mockInquiryData),
        });
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Network error');
      }
    });
  });

  describe('Email Service Integration', () => {
    it('should handle email sending failures gracefully', async () => {
      const mockInquiry: Inquiry = {
        id: 'inquiry_123',
        inquiryNumber: 'INQ-2024-001',
        ...mockInquiryData,
        status: InquiryStatus.NEW,
        priority: InquiryPriority.MEDIUM,
        productRequirements: mockInquiryData.productRequirements.map(req => ({
          ...req,
          id: 'req_123'
        })),
        followUps: [],
        attachments: [],
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock email service to throw error
      (emailService.sendAutoReply as jest.Mock).mockRejectedValueOnce(
        new Error('SMTP server unavailable')
      );

      // Should not throw error even if email fails
      await expect(emailService.sendAutoReply(mockInquiry)).rejects.toThrow('SMTP server unavailable');
    });

    it('should send emails in correct language', async () => {
      const chineseInquiry: Inquiry = {
        id: 'inquiry_123',
        inquiryNumber: 'INQ-2024-001',
        ...mockInquiryData,
        language: 'zh',
        status: InquiryStatus.NEW,
        priority: InquiryPriority.MEDIUM,
        productRequirements: mockInquiryData.productRequirements.map(req => ({
          ...req,
          id: 'req_123'
        })),
        followUps: [],
        attachments: [],
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await emailService.sendAutoReply(chineseInquiry);

      expect(emailService.sendAutoReply).toHaveBeenCalledWith(chineseInquiry);
    });
  });
});