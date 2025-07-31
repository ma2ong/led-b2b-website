/**
 * 询盘工作流集成测试
 */
import { createMocks } from 'node-mocks-http';
import inquiryHandler from '@/pages/api/inquiries/index';
import { validateInquiry } from '@/lib/inquiry-validation';
import { sendInquiryNotification } from '@/lib/email-service';
import { createMockInquiry } from '../utils/test-utils';

// Mock external dependencies
jest.mock('@/lib/email-service');
jest.mock('@/lib/inquiry-validation');

const mockSendInquiryNotification = sendInquiryNotification as jest.MockedFunction<typeof sendInquiryNotification>;
const mockValidateInquiry = validateInquiry as jest.MockedFunction<typeof validateInquiry>;

describe('Inquiry Workflow Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockValidateInquiry.mockReturnValue({ isValid: true, errors: [] });
    mockSendInquiryNotification.mockResolvedValue(true);
  });

  describe('Complete inquiry submission flow', () => {
    it('processes a valid inquiry from submission to notification', async () => {
      const inquiryData = createMockInquiry({
        contact: {
          name: 'John Doe',
          email: 'john@testcompany.com',
          phone: '+1234567890',
          position: 'Procurement Manager',
        },
        company: {
          name: 'Test Retail Corp',
          industry: 'Retail',
          website: 'https://testretail.com',
          country: 'US',
          city: 'New York',
        },
        project: {
          name: 'Store LED Display Project',
          description: 'Need LED displays for 5 retail locations',
          budget: {
            min: 50000,
            max: 100000,
            currency: 'USD',
          },
          timeline: '3 months',
          requirements: {
            screenSize: '10-15 sqm per location',
            pixelPitch: 'P2.5 or P3',
            installation: 'Wall mounted',
            quantity: 5,
          },
        },
        products: [
          {
            id: 'prod_001',
            name: 'P2.5 Indoor LED Display',
            quantity: 5,
            specifications: {
              size: '3x2m',
              pixelPitch: '2.5mm',
            },
          },
        ],
        message: 'Please provide detailed quote including installation and maintenance.',
        source: 'website',
        utm: {
          source: 'google',
          medium: 'cpc',
          campaign: 'led-displays-retail',
        },
      });

      const { req, res } = createMocks({
        method: 'POST',
        body: inquiryData,
      });

      // Execute the inquiry submission
      await inquiryHandler(req, res);

      // Verify response
      expect(res._getStatusCode()).toBe(201);
      const responseData = JSON.parse(res._getData());
      
      // Verify inquiry was created with correct data
      expect(responseData).toHaveProperty('inquiry');
      expect(responseData.inquiry.contact.name).toBe(inquiryData.contact.name);
      expect(responseData.inquiry.contact.email).toBe(inquiryData.contact.email);
      expect(responseData.inquiry.company.name).toBe(inquiryData.company.name);
      expect(responseData.inquiry.status).toBe('new');
      expect(responseData.inquiry).toHaveProperty('id');
      expect(responseData.inquiry).toHaveProperty('createdAt');

      // Verify validation was called
      expect(mockValidateInquiry).toHaveBeenCalledWith(inquiryData);

      // Verify notification was sent
      expect(mockSendInquiryNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          contact: inquiryData.contact,
          company: inquiryData.company,
          project: inquiryData.project,
        })
      );

      // Verify response includes confirmation
      expect(responseData).toHaveProperty('emailSent');
      expect(responseData.emailSent).toBe(true);
    });

    it('handles validation errors appropriately', async () => {
      const invalidInquiryData = createMockInquiry({
        contact: {
          name: '', // Invalid: empty name
          email: 'invalid-email', // Invalid: bad email format
          phone: '123', // Invalid: too short
        },
        company: {
          name: '', // Invalid: empty company name
        },
        message: '', // Invalid: empty message
      });

      // Mock validation to return errors
      mockValidateInquiry.mockReturnValue({
        isValid: false,
        errors: [
          { field: 'contact.name', message: 'Name is required' },
          { field: 'contact.email', message: 'Valid email is required' },
          { field: 'contact.phone', message: 'Valid phone number is required' },
          { field: 'company.name', message: 'Company name is required' },
          { field: 'message', message: 'Message is required' },
        ],
      });

      const { req, res } = createMocks({
        method: 'POST',
        body: invalidInquiryData,
      });

      await inquiryHandler(req, res);

      // Verify validation error response
      expect(res._getStatusCode()).toBe(400);
      const responseData = JSON.parse(res._getData());
      
      expect(responseData).toHaveProperty('error');
      expect(responseData).toHaveProperty('details');
      expect(responseData.details).toHaveLength(5);

      // Verify notification was not sent
      expect(mockSendInquiryNotification).not.toHaveBeenCalled();
    });

    it('handles email notification failures gracefully', async () => {
      const inquiryData = createMockInquiry();

      // Mock email service to fail
      mockSendInquiryNotification.mockRejectedValue(new Error('Email service unavailable'));

      const { req, res } = createMocks({
        method: 'POST',
        body: inquiryData,
      });

      await inquiryHandler(req, res);

      // Verify inquiry was still created despite email failure
      expect(res._getStatusCode()).toBe(201);
      const responseData = JSON.parse(res._getData());
      
      expect(responseData).toHaveProperty('inquiry');
      expect(responseData.inquiry).toHaveProperty('id');
      
      // Verify email failure is indicated
      expect(responseData).toHaveProperty('emailSent');
      expect(responseData.emailSent).toBe(false);
      expect(responseData).toHaveProperty('emailError');
    });
  });

  describe('Inquiry status management', () => {
    it('updates inquiry status through complete workflow', async () => {
      // 1. Create initial inquiry
      const inquiryData = createMockInquiry();
      
      const { req: createReq, res: createRes } = createMocks({
        method: 'POST',
        body: inquiryData,
      });

      await inquiryHandler(createReq, createRes);
      const createResponse = JSON.parse(createRes._getData());
      const inquiryId = createResponse.inquiry.id;

      // 2. Update to in_progress
      const { req: updateReq1, res: updateRes1 } = createMocks({
        method: 'PUT',
        body: {
          id: inquiryId,
          status: 'in_progress',
          assignedTo: 'sales@company.com',
          notes: 'Initial review completed',
        },
      });

      await inquiryHandler(updateReq1, updateRes1);
      expect(updateRes1._getStatusCode()).toBe(200);
      
      const updateResponse1 = JSON.parse(updateRes1._getData());
      expect(updateResponse1.inquiry.status).toBe('in_progress');
      expect(updateResponse1.inquiry.assignedTo).toBe('sales@company.com');

      // 3. Update to quoted
      const { req: updateReq2, res: updateRes2 } = createMocks({
        method: 'PUT',
        body: {
          id: inquiryId,
          status: 'quoted',
          notes: 'Quote sent to customer',
          quote: {
            amount: 75000,
            currency: 'USD',
            validUntil: '2024-03-01',
          },
        },
      });

      await inquiryHandler(updateReq2, updateRes2);
      expect(updateRes2._getStatusCode()).toBe(200);
      
      const updateResponse2 = JSON.parse(updateRes2._getData());
      expect(updateResponse2.inquiry.status).toBe('quoted');
      expect(updateResponse2.inquiry.quote).toBeDefined();

      // 4. Update to closed_won
      const { req: updateReq3, res: updateRes3 } = createMocks({
        method: 'PUT',
        body: {
          id: inquiryId,
          status: 'closed_won',
          notes: 'Customer accepted quote',
          closedAt: new Date().toISOString(),
        },
      });

      await inquiryHandler(updateReq3, updateRes3);
      expect(updateRes3._getStatusCode()).toBe(200);
      
      const updateResponse3 = JSON.parse(updateRes3._getData());
      expect(updateResponse3.inquiry.status).toBe('closed_won');
      expect(updateResponse3.inquiry.closedAt).toBeDefined();
    });

    it('prevents invalid status transitions', async () => {
      const inquiryData = createMockInquiry();
      
      const { req: createReq, res: createRes } = createMocks({
        method: 'POST',
        body: inquiryData,
      });

      await inquiryHandler(createReq, createRes);
      const createResponse = JSON.parse(createRes._getData());
      const inquiryId = createResponse.inquiry.id;

      // Try to update directly from 'new' to 'closed_won' (invalid transition)
      const { req: updateReq, res: updateRes } = createMocks({
        method: 'PUT',
        body: {
          id: inquiryId,
          status: 'closed_won', // Invalid: should go through in_progress and quoted first
        },
      });

      await inquiryHandler(updateReq, updateRes);
      expect(updateRes._getStatusCode()).toBe(400);
      
      const updateResponse = JSON.parse(updateRes._getData());
      expect(updateResponse).toHaveProperty('error');
      expect(updateResponse.error).toContain('Invalid status transition');
    });
  });

  describe('Inquiry filtering and search', () => {
    beforeEach(async () => {
      // Create test inquiries with different statuses and properties
      const inquiries = [
        createMockInquiry({
          contact: { name: 'John Doe', email: 'john@retail.com' },
          company: { name: 'Retail Corp', industry: 'Retail' },
          status: 'new',
          priority: 'high',
        }),
        createMockInquiry({
          contact: { name: 'Jane Smith', email: 'jane@hotel.com' },
          company: { name: 'Hotel Chain', industry: 'Hospitality' },
          status: 'in_progress',
          priority: 'medium',
        }),
        createMockInquiry({
          contact: { name: 'Bob Wilson', email: 'bob@mall.com' },
          company: { name: 'Shopping Mall', industry: 'Retail' },
          status: 'quoted',
          priority: 'low',
        }),
      ];

      for (const inquiry of inquiries) {
        const { req, res } = createMocks({
          method: 'POST',
          body: inquiry,
        });
        await inquiryHandler(req, res);
      }
    });

    it('filters inquiries by status', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: { status: 'new' },
      });

      await inquiryHandler(req, res);
      expect(res._getStatusCode()).toBe(200);
      
      const responseData = JSON.parse(res._getData());
      expect(responseData.inquiries).toHaveLength(1);
      expect(responseData.inquiries[0].status).toBe('new');
    });

    it('filters inquiries by industry', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: { industry: 'Retail' },
      });

      await inquiryHandler(req, res);
      expect(res._getStatusCode()).toBe(200);
      
      const responseData = JSON.parse(res._getData());
      expect(responseData.inquiries).toHaveLength(2);
      responseData.inquiries.forEach((inquiry: any) => {
        expect(inquiry.company.industry).toBe('Retail');
      });
    });

    it('searches inquiries by company name', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: { search: 'Hotel' },
      });

      await inquiryHandler(req, res);
      expect(res._getStatusCode()).toBe(200);
      
      const responseData = JSON.parse(res._getData());
      expect(responseData.inquiries).toHaveLength(1);
      expect(responseData.inquiries[0].company.name).toContain('Hotel');
    });

    it('filters inquiries by priority', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: { priority: 'high' },
      });

      await inquiryHandler(req, res);
      expect(res._getStatusCode()).toBe(200);
      
      const responseData = JSON.parse(res._getData());
      expect(responseData.inquiries).toHaveLength(1);
      expect(responseData.inquiries[0].priority).toBe('high');
    });

    it('combines multiple filters', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: { 
          industry: 'Retail',
          status: 'quoted',
        },
      });

      await inquiryHandler(req, res);
      expect(res._getStatusCode()).toBe(200);
      
      const responseData = JSON.parse(res._getData());
      expect(responseData.inquiries).toHaveLength(1);
      expect(responseData.inquiries[0].company.industry).toBe('Retail');
      expect(responseData.inquiries[0].status).toBe('quoted');
    });
  });

  describe('Inquiry analytics and reporting', () => {
    it('provides inquiry statistics', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: { analytics: 'true' },
      });

      await inquiryHandler(req, res);
      expect(res._getStatusCode()).toBe(200);
      
      const responseData = JSON.parse(res._getData());
      expect(responseData).toHaveProperty('analytics');
      expect(responseData.analytics).toHaveProperty('totalInquiries');
      expect(responseData.analytics).toHaveProperty('statusBreakdown');
      expect(responseData.analytics).toHaveProperty('industryBreakdown');
      expect(responseData.analytics).toHaveProperty('conversionRate');
      expect(responseData.analytics).toHaveProperty('averageResponseTime');
    });

    it('provides time-based analytics', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: { 
          analytics: 'true',
          period: 'last_30_days',
        },
      });

      await inquiryHandler(req, res);
      expect(res._getStatusCode()).toBe(200);
      
      const responseData = JSON.parse(res._getData());
      expect(responseData.analytics).toHaveProperty('period');
      expect(responseData.analytics.period).toBe('last_30_days');
      expect(responseData.analytics).toHaveProperty('trends');
    });
  });
});