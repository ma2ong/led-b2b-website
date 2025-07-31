/**
 * 案例研究验证工具测试
 */
import { CaseValidationUtils } from '@/lib/case-study-validation';
import { ProjectType, IndustryType, CaseStatus } from '@/types/case-study';

describe('CaseValidationUtils', () => {
  const validCaseCreateData = {
    title: 'Test Case Study',
    summary: 'This is a test case study summary with enough content.',
    fullDescription: 'This is a detailed description of the test case study with sufficient content to meet validation requirements.',
    projectType: ProjectType.OUTDOOR_ADVERTISING,
    industry: IndustryType.ADVERTISING,
    customer: {
      name: 'Test Customer',
      industry: IndustryType.ADVERTISING,
      location: {
        latitude: 40.7128,
        longitude: -74.0060,
        address: '123 Test Street',
        city: 'New York',
        state: 'NY',
        country: 'United States',
      },
    },
    location: {
      latitude: 40.7128,
      longitude: -74.0060,
      address: '123 Test Street',
      city: 'New York',
      state: 'NY',
      country: 'United States',
    },
    projectScale: {
      totalScreenArea: 100,
      totalPixels: 2073600,
      numberOfScreens: 1,
      totalInvestment: 500000,
      currency: 'USD',
    },
    technicalSpecs: {
      pixelPitch: 'P4',
      resolution: { width: 1920, height: 1080 },
      brightness: 5000,
      refreshRate: 3840,
      colorDepth: 16,
      viewingAngle: '160°/160°',
      powerConsumption: 800,
      operatingTemperature: '-20°C to +60°C',
      ipRating: 'IP65',
      cabinetSize: { width: 500, height: 500, depth: 100, unit: 'mm' as const },
    },
    challenges: [
      {
        id: 'challenge-1',
        title: 'Test Challenge',
        description: 'This is a test challenge description.',
        solution: 'This is the solution to the test challenge.',
      },
    ],
    solutions: ['Solution 1', 'Solution 2'],
    outcomes: [
      {
        id: 'outcome-1',
        metric: 'Test Metric',
        value: '100%',
        description: 'Test outcome description',
      },
    ],
    timeline: [
      {
        phase: 'Planning',
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-02-01'),
        description: 'Planning phase description',
      },
    ],
    team: [],
    relatedProducts: [],
    tags: ['test', 'outdoor'],
    features: ['High Brightness', 'Weather Resistant'],
    status: CaseStatus.PUBLISHED,
    isPublished: true,
    isFeatured: false,
    isShowcase: false,
    projectStartDate: new Date('2023-01-01'),
    projectEndDate: new Date('2023-12-31'),
  };

  describe('validateCaseCreateData', () => {
    it('should validate correct case create data', () => {
      const result = CaseValidationUtils.validateCaseCreateData(validCaseCreateData);
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.errors).toBeUndefined();
    });

    it('should reject data with missing required fields', () => {
      const invalidData = { ...validCaseCreateData };
      delete (invalidData as any).title;
      
      const result = CaseValidationUtils.validateCaseCreateData(invalidData);
      
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.data).toBeUndefined();
    });

    it('should reject data with invalid title length', () => {
      const invalidData = {
        ...validCaseCreateData,
        title: '', // Empty title
      };
      
      const result = CaseValidationUtils.validateCaseCreateData(invalidData);
      
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it('should reject data with invalid coordinates', () => {
      const invalidData = {
        ...validCaseCreateData,
        location: {
          ...validCaseCreateData.location,
          latitude: 100, // Invalid latitude
        },
      };
      
      const result = CaseValidationUtils.validateCaseCreateData(invalidData);
      
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it('should reject data with invalid project dates', () => {
      const invalidData = {
        ...validCaseCreateData,
        projectStartDate: new Date('2023-12-31'),
        projectEndDate: new Date('2023-01-01'), // End before start
      };
      
      const result = CaseValidationUtils.validateCaseCreateData(invalidData);
      
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it('should reject data with invalid technical specs', () => {
      const invalidData = {
        ...validCaseCreateData,
        technicalSpecs: {
          ...validCaseCreateData.technicalSpecs,
          brightness: -100, // Negative brightness
        },
      };
      
      const result = CaseValidationUtils.validateCaseCreateData(invalidData);
      
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it('should reject data with empty challenges array', () => {
      const invalidData = {
        ...validCaseCreateData,
        challenges: [], // Empty challenges
      };
      
      const result = CaseValidationUtils.validateCaseCreateData(invalidData);
      
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it('should reject data with empty solutions array', () => {
      const invalidData = {
        ...validCaseCreateData,
        solutions: [], // Empty solutions
      };
      
      const result = CaseValidationUtils.validateCaseCreateData(invalidData);
      
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it('should reject data with empty tags array', () => {
      const invalidData = {
        ...validCaseCreateData,
        tags: [], // Empty tags
      };
      
      const result = CaseValidationUtils.validateCaseCreateData(invalidData);
      
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });
  });

  describe('validateCaseUpdateData', () => {
    it('should validate correct case update data', () => {
      const updateData = {
        id: 'test-case-id',
        title: 'Updated Title',
        summary: 'Updated summary with sufficient content.',
      };
      
      const result = CaseValidationUtils.validateCaseUpdateData(updateData);
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.errors).toBeUndefined();
    });

    it('should reject update data without id', () => {
      const updateData = {
        title: 'Updated Title',
      };
      
      const result = CaseValidationUtils.validateCaseUpdateData(updateData);
      
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });
  });

  describe('validateSlug', () => {
    it('should validate correct slug', () => {
      const result = CaseValidationUtils.validateSlug('test-case-study');
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject empty slug', () => {
      const result = CaseValidationUtils.validateSlug('');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Slug is required');
    });

    it('should reject slug with uppercase letters', () => {
      const result = CaseValidationUtils.validateSlug('Test-Case-Study');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Slug must contain only lowercase letters, numbers, and hyphens');
    });

    it('should reject slug with special characters', () => {
      const result = CaseValidationUtils.validateSlug('test-case_study!');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Slug must contain only lowercase letters, numbers, and hyphens');
    });

    it('should reject slug starting with hyphen', () => {
      const result = CaseValidationUtils.validateSlug('-test-case-study');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Slug cannot start or end with a hyphen');
    });

    it('should reject slug ending with hyphen', () => {
      const result = CaseValidationUtils.validateSlug('test-case-study-');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Slug cannot start or end with a hyphen');
    });

    it('should reject slug with consecutive hyphens', () => {
      const result = CaseValidationUtils.validateSlug('test--case-study');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Slug cannot contain consecutive hyphens');
    });

    it('should reject slug that already exists', () => {
      const existingSlugs = ['existing-slug', 'another-slug'];
      const result = CaseValidationUtils.validateSlug('existing-slug', existingSlugs);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Slug already exists');
    });

    it('should reject slug that is too short', () => {
      const result = CaseValidationUtils.validateSlug('ab');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Slug must be at least 3 characters long');
    });
  });

  describe('generateSlug', () => {
    it('should generate slug from title', () => {
      const slug = CaseValidationUtils.generateSlug('Test Case Study Title');
      
      expect(slug).toBe('test-case-study-title');
    });

    it('should handle special characters in title', () => {
      const slug = CaseValidationUtils.generateSlug('Test Case Study: Special Characters!');
      
      expect(slug).toBe('test-case-study-special-characters');
    });

    it('should handle multiple spaces', () => {
      const slug = CaseValidationUtils.generateSlug('Test   Case    Study');
      
      expect(slug).toBe('test-case-study');
    });

    it('should handle empty title', () => {
      const slug = CaseValidationUtils.generateSlug('');
      
      expect(slug).toBe('case-study');
    });

    it('should ensure uniqueness', () => {
      const existingSlugs = ['test-case-study', 'test-case-study-1'];
      const slug = CaseValidationUtils.generateSlug('Test Case Study', existingSlugs);
      
      expect(slug).toBe('test-case-study-2');
    });

    it('should handle title with only special characters', () => {
      const slug = CaseValidationUtils.generateSlug('!@#$%^&*()');
      
      expect(slug).toBe('case-study');
    });
  });

  describe('validateImageFile', () => {
    it('should validate correct image file', () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const result = CaseValidationUtils.validateImageFile(file);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject non-image file', () => {
      const file = new File(['test'], 'test.txt', { type: 'text/plain' });
      const result = CaseValidationUtils.validateImageFile(file);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('File must be a JPEG, PNG, or WebP image');
    });

    it('should reject file that is too large', () => {
      // Create a mock file that appears to be larger than 10MB
      const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.jpg', { 
        type: 'image/jpeg' 
      });
      
      const result = CaseValidationUtils.validateImageFile(largeFile);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('File size must be less than 10MB');
    });

    it('should reject empty file', () => {
      const emptyFile = new File([], 'empty.jpg', { type: 'image/jpeg' });
      const result = CaseValidationUtils.validateImageFile(emptyFile);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('File cannot be empty');
    });
  });

  describe('validateDocumentFile', () => {
    it('should validate correct PDF file', () => {
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
      const result = CaseValidationUtils.validateDocumentFile(file);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate correct Word document', () => {
      const file = new File(['test'], 'test.docx', { 
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
      });
      const result = CaseValidationUtils.validateDocumentFile(file);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject unsupported file type', () => {
      const file = new File(['test'], 'test.exe', { type: 'application/x-msdownload' });
      const result = CaseValidationUtils.validateDocumentFile(file);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('File type not supported');
    });

    it('should reject file that is too large', () => {
      // Create a mock file that appears to be larger than 50MB
      const largeFile = new File(['x'.repeat(51 * 1024 * 1024)], 'large.pdf', { 
        type: 'application/pdf' 
      });
      
      const result = CaseValidationUtils.validateDocumentFile(largeFile);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('File size must be less than 50MB');
    });
  });

  describe('validateVideoUrl', () => {
    it('should validate YouTube URL', () => {
      const result = CaseValidationUtils.validateVideoUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
      
      expect(result.isValid).toBe(true);
      expect(result.platform).toBe('youtube');
      expect(result.errors).toHaveLength(0);
    });

    it('should validate YouTube short URL', () => {
      const result = CaseValidationUtils.validateVideoUrl('https://youtu.be/dQw4w9WgXcQ');
      
      expect(result.isValid).toBe(true);
      expect(result.platform).toBe('youtube');
      expect(result.errors).toHaveLength(0);
    });

    it('should validate Vimeo URL', () => {
      const result = CaseValidationUtils.validateVideoUrl('https://vimeo.com/123456789');
      
      expect(result.isValid).toBe(true);
      expect(result.platform).toBe('vimeo');
      expect(result.errors).toHaveLength(0);
    });

    it('should validate other video URLs', () => {
      const result = CaseValidationUtils.validateVideoUrl('https://example.com/video.mp4');
      
      expect(result.isValid).toBe(true);
      expect(result.platform).toBe('other');
      expect(result.errors).toHaveLength(0);
    });

    it('should reject empty URL', () => {
      const result = CaseValidationUtils.validateVideoUrl('');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Video URL is required');
    });

    it('should reject invalid URL format', () => {
      const result = CaseValidationUtils.validateVideoUrl('not-a-url');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid URL format');
    });

    it('should reject invalid YouTube URL', () => {
      const result = CaseValidationUtils.validateVideoUrl('https://www.youtube.com/invalid');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid YouTube URL');
    });

    it('should reject invalid Vimeo URL', () => {
      const result = CaseValidationUtils.validateVideoUrl('https://vimeo.com/invalid');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid Vimeo URL');
    });
  });

  describe('validateCoordinates', () => {
    it('should validate correct coordinates', () => {
      const result = CaseValidationUtils.validateCoordinates(40.7128, -74.0060);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid latitude', () => {
      const result = CaseValidationUtils.validateCoordinates(100, -74.0060);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Latitude must be between -90 and 90 degrees');
    });

    it('should reject invalid longitude', () => {
      const result = CaseValidationUtils.validateCoordinates(40.7128, 200);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Longitude must be between -180 and 180 degrees');
    });

    it('should reject non-numeric coordinates', () => {
      const result = CaseValidationUtils.validateCoordinates(NaN, -74.0060);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Latitude must be a valid number');
    });
  });

  describe('validateDateRange', () => {
    it('should validate correct date range', () => {
      const startDate = new Date('2023-01-01');
      const endDate = new Date('2023-12-31');
      const result = CaseValidationUtils.validateDateRange(startDate, endDate);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject end date before start date', () => {
      const startDate = new Date('2023-12-31');
      const endDate = new Date('2023-01-01');
      const result = CaseValidationUtils.validateDateRange(startDate, endDate);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('End date must be after start date');
    });

    it('should reject invalid dates', () => {
      const startDate = new Date('invalid');
      const endDate = new Date('2023-12-31');
      const result = CaseValidationUtils.validateDateRange(startDate, endDate);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Start date must be a valid date');
    });
  });

  describe('checkRequiredFields', () => {
    it('should pass when all required fields are present', () => {
      const result = CaseValidationUtils.checkRequiredFields(validCaseCreateData);
      
      expect(result.isValid).toBe(true);
      expect(result.missingFields).toHaveLength(0);
    });

    it('should identify missing required fields', () => {
      const incompleteData = {
        title: 'Test Title',
        // Missing other required fields
      };
      
      const result = CaseValidationUtils.checkRequiredFields(incompleteData);
      
      expect(result.isValid).toBe(false);
      expect(result.missingFields.length).toBeGreaterThan(0);
      expect(result.missingFields).toContain('summary');
      expect(result.missingFields).toContain('fullDescription');
    });
  });

  describe('formatValidationErrors', () => {
    it('should format validation errors correctly', () => {
      const invalidData = { title: '' }; // Invalid data to trigger errors
      const validationResult = CaseValidationUtils.validateCaseCreateData(invalidData);
      
      if (!validationResult.success && validationResult.errors) {
        const formattedErrors = CaseValidationUtils.formatValidationErrors(validationResult.errors);
        
        expect(formattedErrors).toBeInstanceOf(Array);
        formattedErrors.forEach(error => {
          expect(error).toHaveProperty('field');
          expect(error).toHaveProperty('message');
          expect(typeof error.field).toBe('string');
          expect(typeof error.message).toBe('string');
        });
      }
    });
  });
});