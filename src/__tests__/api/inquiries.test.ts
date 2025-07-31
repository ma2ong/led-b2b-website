/**
 * 询盘API接口集成测试
 */
import { createMocks } from 'node-mocks-http';
import handler from '@/pages/api/inquiries/index';
import { Inquiry } from '@/types/inquiry';

describe('/api/inquiries', () => {
  describe('GET /api/inquiries', () => {
    it('returns inquiries list successfully', async () => {
      const { req, res } = createMocks({
        method: 'GET',
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      
      const data = JSON.parse(res._getData());
      expect(data).toHaveProperty('inquiries');
      expect(Array.isArray(data.inquiries)).toBe(true);
      expect(data).toHaveProperty('total');
      expect(data).toHaveProperty('page');
      expect(data).toHaveProperty('limit');
    });

    it('filters inquiries by status', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: {
          status: 'new',
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      
      const data = JSON.parse(res._getData());
      expect(data.inquiries.every((inquiry: Inquiry) => 
        inquiry.status === 'new'
      )).toBe(true);
    });

    it('searches inquiries by company name', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: {
          search: 'Tech Corp',
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      
      const data = JSON.parse(res._getData());
      expect(data.inquiries.some((inquiry: Inquiry) => 
        inquiry.company.name.includes('Tech Corp')
      )).toBe(true);
    });

    it('filters inquiries by date range', async () => {
      const startDate = '2024-01-01';
      const endDate = '2024-12-31';

      const { req, res } = createMocks({
        method: 'GET',
        query: {
          startDate,
          endDate,
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      
      const data = JSON.parse(res._getData());
      data.inquiries.forEach((inquiry: Inquiry) => {
        const inquiryDate = new Date(inquiry.createdAt);
        expect(inquiryDate >= new Date(startDate)).toBe(true);
        expect(inquiryDate <= new Date(endDate)).toBe(true);
      });
    });
  });

  describe('POST /api/inquiries', () => {
    it('creates a new inquiry successfully', async () => {
      const inquiryData = {
        type: 'product_inquiry',
        contact: {
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+1234567890',
          position: 'Manager',
        },
        company: {
          name: 'Test Company',
          industry: 'Retail',
          website: 'https://testcompany.com',
          country: 'US',
          city: 'New York',
        },
        project: {
          name: 'Store Display Project',
          description: 'Need LED displays for retail store',
          budget: {
            min: 10000,
            max: 50000,
            currency: 'USD',
          },
          timeline: 'Q2 2024',
          requirements: {
            screenSize: '10-20 sqm',
            pixelPitch: 'P2.5-P4',
            installation: 'Indoor',
            quantity: 5,
          },
        },
        products: [
          {
            id: 'prod_001',
            name: 'P2.5 Indoor LED Display',
            quantity: 5,
            specifications: {
              size: '2x1m',
              pixelPitch: '2.5mm',
            },
          },
        ],
        message: 'Please provide a quote for this project.',
        source: 'website',
        utm: {
          source: 'google',
          medium: 'cpc',
          campaign: 'led-displays',
        },
      };

      const { req, res } = createMocks({
        method: 'POST',
        body: inquiryData,
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(201);
      
      const data = JSON.parse(res._getData());
      expect(data).toHaveProperty('inquiry');
      expect(data.inquiry.contact.name).toBe(inquiryData.contact.name);
      expect(data.inquiry.contact.email).toBe(inquiryData.contact.email);
      expect(data.inquiry).toHaveProperty('id');
      expect(data.inquiry).toHaveProperty('createdAt');
      expect(data.inquiry.status).toBe('new');
    });

    it('validates required contact fields', async () => {
      const invalidInquiryData = {
        type: 'product_inquiry',
        contact: {
          name: '', // Missing required field
          email: 'invalid-email', // Invalid email format
        },
        company: {
          name: 'Test Company',
        },
        message: 'Test message',
      };

      const { req, res } = createMocks({
        method: 'POST',
        body: invalidInquiryData,
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      
      const data = JSON.parse(res._getData());
      expect(data).toHaveProperty('error');
      expect(data).toHaveProperty('details');
      expect(data.details).toContain('name');
      expect(data.details).toContain('email');
    });

    it('validates email format', async () => {
      const inquiryData = {
        type: 'product_inquiry',
        contact: {
          name: 'John Doe',
          email: 'invalid-email-format',
        },
        company: {
          name: 'Test Company',
        },
        message: 'Test message',
      };

      const { req, res } = createMocks({
        method: 'POST',
        body: inquiryData,
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      
      const data = JSON.parse(res._getData());
      expect(data).toHaveProperty('error');
      expect(data.details).toContain('email');
    });

    it('handles spam detection', async () => {
      const spamInquiryData = {
        type: 'product_inquiry',
        contact: {
          name: 'SPAM SPAM SPAM',
          email: 'spam@spam.com',
        },
        company: {
          name: 'SPAM Company',
        },
        message: 'BUY NOW! CLICK HERE! FREE MONEY!',
      };

      const { req, res } = createMocks({
        method: 'POST',
        body: spamInquiryData,
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      
      const data = JSON.parse(res._getData());
      expect(data).toHaveProperty('error');
      expect(data.error).toContain('spam');
    });

    it('sends notification email after inquiry creation', async () => {
      const inquiryData = {
        type: 'product_inquiry',
        contact: {
          name: 'John Doe',
          email: 'john@example.com',
        },
        company: {
          name: 'Test Company',
        },
        message: 'Test inquiry message',
      };

      const { req, res } = createMocks({
        method: 'POST',
        body: inquiryData,
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(201);
      
      const data = JSON.parse(res._getData());
      expect(data).toHaveProperty('inquiry');
      expect(data).toHaveProperty('emailSent');
      expect(data.emailSent).toBe(true);
    });
  });

  describe('PUT /api/inquiries', () => {
    it('updates inquiry status successfully', async () => {
      const updateData = {
        id: 'inq_001',
        status: 'in_progress',
        assignedTo: 'sales@company.com',
        notes: 'Following up with customer',
      };

      const { req, res } = createMocks({
        method: 'PUT',
        body: updateData,
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      
      const data = JSON.parse(res._getData());
      expect(data).toHaveProperty('inquiry');
      expect(data.inquiry.status).toBe(updateData.status);
      expect(data.inquiry.assignedTo).toBe(updateData.assignedTo);
    });

    it('validates inquiry ID', async () => {
      const updateData = {
        id: 'invalid_id',
        status: 'in_progress',
      };

      const { req, res } = createMocks({
        method: 'PUT',
        body: updateData,
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(404);
      
      const data = JSON.parse(res._getData());
      expect(data).toHaveProperty('error');
      expect(data.error).toContain('not found');
    });

    it('validates status values', async () => {
      const updateData = {
        id: 'inq_001',
        status: 'invalid_status',
      };

      const { req, res } = createMocks({
        method: 'PUT',
        body: updateData,
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      
      const data = JSON.parse(res._getData());
      expect(data).toHaveProperty('error');
      expect(data.details).toContain('status');
    });
  });

  describe('Error handling', () => {
    it('handles server errors gracefully', async () => {
      // Mock a server error scenario
      const { req, res } = createMocks({
        method: 'GET',
        query: {
          // Trigger an error condition
          error: 'server_error',
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
      
      const data = JSON.parse(res._getData());
      expect(data).toHaveProperty('error');
      expect(data.error).toContain('Internal server error');
    });

    it('returns 405 for unsupported methods', async () => {
      const { req, res } = createMocks({
        method: 'DELETE',
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(405);
      
      const data = JSON.parse(res._getData());
      expect(data).toHaveProperty('error');
      expect(data.error).toContain('Method not allowed');
    });
  });
});