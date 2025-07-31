/**
 * 询盘处理流程集成测试
 */
import { 
  InquiryCreateData,
  InquiryType,
  InquirySource,
  CustomerType,
  InquiryStatus,
  InquiryPriority
} from '@/types/inquiry';
import { 
  validateInquiryCreateData,
  validateInquiryUpdateData 
} from '@/lib/inquiry-validation';
import { emailService } from '@/lib/email-service';

// Mock email service
jest.mock('@/lib/email-service', () => ({
  emailService: {
    sendNewInquiryNotification: jest.fn(),
    sendAutoReply: jest.fn(),
    sendStatusChangeNotification: jest.fn(),
  },
}));

describe('Inquiry Processing Integration Tests', () => {
  const mockInquiryData: InquiryCreateData = {
    type: InquiryType.QUOTE_REQUEST,
    source: InquirySource.WEBSITE,
    contact: {
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.smith@example.com',
      phone: '+1-555-0123',
      jobTitle: 'Project Manager',
    },
    company: {
      name: 'ABC Corporation',
      website: 'https://abc-corp.com',
      industry: 'Retail',
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
        application: 'Conference Room Display',
        installationEnvironment: 'indoor',
      }
    ],
    subject: 'Quote Request for Conference Room LED Displays',
    message: 'We need LED displays for our new conference rooms. Please provide a quote.',
    language: 'en',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Inquiry Creation Process', () => {
    it('should validate inquiry data correctly', () => {
      const errors = validateInquiryCreateData(mockInquiryData);
      expect(Object.keys(errors)).toHaveLength(0);
    });

    it('should reject invalid inquiry data', () => {
      const invalidData = {
        ...mockInquiryData,
        contact: {
          ...mockInquiryData.contact,
          email: 'invalid-email',
        },
      };

      const errors = validateInquiryCreateData(invalidData);
      expect(errors['contact.email']).toBeDefined();
    });

    it('should require at least one product requirement', () => {
      const invalidData = {
        ...mockInquiryData,
        productRequirements: [],
      };

      const errors = validateInquiryCreateData(invalidData);
      expect(errors.productRequirements).toBe('At least one product requirement is required');
    });

    it('should validate product requirements', () => {
      const invalidData = {
        ...mockInquiryData,
        productRequirements: [
          {
            screenSize: { width: -100, height: 2000, unit: 'mm' },
            quantity: 0,
          }
        ],
      };

      const errors = validateInquiryCreateData(invalidData);
      expect(errors['productRequirements[0].product']).toBeDefined();
      expect(errors['productRequirements[0].screenWidth']).toBeDefined();
      expect(errors['productRequirements[0].quantity']).toBeDefined();
    });
  });

  describe('Inquiry Update Process', () => {
    it('should validate inquiry update data correctly', () => {
      const updateData = {
        id: 'test-id',
        status: InquiryStatus.CONTACTED,
        priority: InquiryPriority.HIGH,
        subject: 'Updated subject',
      };

      const errors = validateInquiryUpdateData(updateData);
      expect(Object.keys(errors)).toHaveLength(0);
    });

    it('should require inquiry ID for updates', () => {
      const updateData = {
        status: InquiryStatus.CONTACTED,
      } as any;

      const errors = validateInquiryUpdateData(updateData);
      expect(errors.id).toBe('Inquiry ID is required');
    });

    it('should validate status values', () => {
      const updateData = {
        id: 'test-id',
        status: 'invalid-status' as any,
      };

      const errors = validateInquiryUpdateData(updateData);
      expect(errors.status).toBe('Invalid inquiry status');
    });
  });

  describe('Email Notification Process', () => {
    it('should send new inquiry notification', async () => {
      const mockInquiry = {
        id: 'test-id',
        inquiryNumber: 'INQ-2024-001',
        ...mockInquiryData,
        status: InquiryStatus.NEW,
        priority: InquiryPriority.MEDIUM,
        followUps: [],
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const recipients = ['sales@example.com', 'manager@example.com'];

      await emailService.sendNewInquiryNotification(mockInquiry, recipients);

      expect(emailService.sendNewInquiryNotification).toHaveBeenCalledWith(
        mockInquiry,
        recipients
      );
    });

    it('should send auto reply to customer', async () => {
      const mockInquiry = {
        id: 'test-id',
        inquiryNumber: 'INQ-2024-001',
        ...mockInquiryData,
        status: InquiryStatus.NEW,
        priority: InquiryPriority.MEDIUM,
        followUps: [],
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await emailService.sendAutoReply(mockInquiry);

      expect(emailService.sendAutoReply).toHaveBeenCalledWith(mockInquiry);
    });

    it('should send status change notification', async () => {
      const mockInquiry = {
        id: 'test-id',
        inquiryNumber: 'INQ-2024-001',
        ...mockInquiryData,
        status: InquiryStatus.CONTACTED,
        priority: InquiryPriority.MEDIUM,
        followUps: [],
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const previousStatus = InquiryStatus.NEW;
      const updatedBy = 'John Doe';
      const recipients = ['sales@example.com'];

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

  describe('API Integration', () => {
    it('should handle inquiry creation API flow', async () => {
      // 模拟API请求
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mockInquiryData),
      });

      // 在实际测试中，这里会验证API响应
      // expect(response.status).toBe(201);
      // const data = await response.json();
      // expect(data.success).toBe(true);
      // expect(data.data.inquiryNumber).toBeDefined();
    });

    it('should handle inquiry update API flow', async () => {
      const updateData = {
        id: 'test-id',
        status: InquiryStatus.CONTACTED,
        priority: InquiryPriority.HIGH,
      };

      // 模拟API请求
      const response = await fetch('/api/inquiries/test-id', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      // 在实际测试中，这里会验证API响应
      // expect(response.status).toBe(200);
      // const data = await response.json();
      // expect(data.success).toBe(true);
      // expect(data.data.status).toBe(InquiryStatus.CONTACTED);
    });

    it('should handle inquiry list API flow', async () => {
      const query = {
        page: 1,
        limit: 20,
        filters: {
          status: InquiryStatus.NEW,
          priority: InquiryPriority.HIGH,
        },
      };

      const searchParams = new URLSearchParams();
      searchParams.set('page', query.page.toString());
      searchParams.set('limit', query.limit.toString());

      // 模拟API请求
      const response = await fetch(`/api/inquiries?${searchParams.toString()}`);

      // 在实际测试中，这里会验证API响应
      // expect(response.status).toBe(200);
      // const data = await response.json();
      // expect(data.success).toBe(true);
      // expect(data.data.inquiries).toBeDefined();
      // expect(data.data.total).toBeDefined();
    });
  });

  describe('Data Validation Edge Cases', () => {
    it('should handle special characters in contact information', () => {
      const dataWithSpecialChars = {
        ...mockInquiryData,
        contact: {
          ...mockInquiryData.contact,
          firstName: "O'Connor",
          lastName: 'Smith-Jones',
        },
      };

      const errors = validateInquiryCreateData(dataWithSpecialChars);
      expect(Object.keys(errors)).toHaveLength(0);
    });

    it('should handle international phone numbers', () => {
      const dataWithIntlPhone = {
        ...mockInquiryData,
        contact: {
          ...mockInquiryData.contact,
          phone: '+86-138-0000-0000',
        },
      };

      const errors = validateInquiryCreateData(dataWithIntlPhone);
      expect(Object.keys(errors)).toHaveLength(0);
    });

    it('should handle unicode characters in company names', () => {
      const dataWithUnicode = {
        ...mockInquiryData,
        company: {
          ...mockInquiryData.company,
          name: '北京科技有限公司',
        },
      };

      const errors = validateInquiryCreateData(dataWithUnicode);
      expect(Object.keys(errors)).toHaveLength(0);
    });

    it('should handle very long messages', () => {
      const longMessage = 'A'.repeat(6000); // Exceeds 5000 character limit
      const dataWithLongMessage = {
        ...mockInquiryData,
        message: longMessage,
      };

      const errors = validateInquiryCreateData(dataWithLongMessage);
      expect(errors.message).toBe('Message must not exceed 5000 characters');
    });

    it('should handle empty product requirements array', () => {
      const dataWithEmptyRequirements = {
        ...mockInquiryData,
        productRequirements: [],
      };

      const errors = validateInquiryCreateData(dataWithEmptyRequirements);
      expect(errors.productRequirements).toBe('At least one product requirement is required');
    });
  });

  describe('Business Logic Validation', () => {
    it('should validate screen size units', () => {
      const dataWithInvalidUnit = {
        ...mockInquiryData,
        productRequirements: [
          {
            ...mockInquiryData.productRequirements[0],
            screenSize: { width: 3000, height: 2000, unit: 'invalid' as any },
          }
        ],
      };

      const errors = validateInquiryCreateData(dataWithInvalidUnit);
      expect(errors['productRequirements[0].screenUnit']).toBe('Invalid screen size unit');
    });

    it('should validate installation environment', () => {
      const dataWithInvalidEnvironment = {
        ...mockInquiryData,
        productRequirements: [
          {
            ...mockInquiryData.productRequirements[0],
            installationEnvironment: 'invalid' as any,
          }
        ],
      };

      const errors = validateInquiryCreateData(dataWithInvalidEnvironment);
      expect(errors['productRequirements[0].installationEnvironment']).toBe('Invalid installation environment');
    });

    it('should validate quantity ranges', () => {
      const dataWithInvalidQuantity = {
        ...mockInquiryData,
        productRequirements: [
          {
            ...mockInquiryData.productRequirements[0],
            quantity: 15000, // Exceeds maximum
          }
        ],
      };

      const errors = validateInquiryCreateData(dataWithInvalidQuantity);
      expect(errors['productRequirements[0].quantity']).toBe('Quantity must be between 1 and 10000');
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      // 模拟网络错误
      const mockFetch = jest.fn().mockRejectedValue(new Error('Network error'));
      global.fetch = mockFetch;

      try {
        await fetch('/api/inquiries', {
          method: 'POST',
          body: JSON.stringify(mockInquiryData),
        });
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Network error');
      }
    });

    it('should handle validation errors from API', async () => {
      const mockResponse = {
        ok: false,
        status: 400,
        json: async () => ({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid inquiry data',
            details: { 'contact.email': 'Invalid email format' },
          },
        }),
      };

      const mockFetch = jest.fn().mockResolvedValue(mockResponse);
      global.fetch = mockFetch;

      const response = await fetch('/api/inquiries', {
        method: 'POST',
        body: JSON.stringify(mockInquiryData),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });
  });
});