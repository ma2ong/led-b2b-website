/**
 * 案例研究API测试
 */
import { CaseStudyApi, CaseApiError } from '@/lib/api/case-studies';
import { 
  CaseQuery,
  CaseSortBy,
  ProjectType,
  IndustryType,
  CaseStatus,
  CaseCreateData,
  CaseUpdateData,
  CaseBulkOperation
} from '@/types/case-study';

// Mock fetch globally
global.fetch = jest.fn();

const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('CaseStudyApi', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  const mockCaseStudy = {
    id: 'test-case-1',
    title: 'Test Case Study',
    slug: 'test-case-study',
    summary: 'Test summary',
    fullDescription: 'Test description',
    projectType: ProjectType.OUTDOOR_ADVERTISING,
    industry: IndustryType.ADVERTISING,
    status: CaseStatus.PUBLISHED,
    customer: {
      name: 'Test Customer',
      industry: IndustryType.ADVERTISING,
      location: {
        latitude: 40.7128,
        longitude: -74.0060,
        address: '123 Test St',
        city: 'New York',
        country: 'United States',
      },
    },
    location: {
      latitude: 40.7128,
      longitude: -74.0060,
      address: '123 Test St',
      city: 'New York',
      country: 'United States',
    },
    projectScale: {
      totalScreenArea: 100,
      totalPixels: 2073600,
      numberOfScreens: 1,
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
      cabinetSize: { width: 500, height: 500, depth: 100, unit: 'mm' },
    },
    challenges: [],
    solutions: [],
    outcomes: [],
    images: [],
    videos: [],
    documents: [],
    testimonials: [],
    timeline: [],
    team: [],
    relatedProducts: [],
    tags: ['test'],
    features: ['test-feature'],
    isPublished: true,
    isFeatured: false,
    isShowcase: false,
    viewCount: 0,
    shareCount: 0,
    downloadCount: 0,
    projectStartDate: new Date('2023-01-01'),
    projectEndDate: new Date('2023-12-31'),
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  };

  const mockApiResponse = {
    success: true,
    data: mockCaseStudy,
    meta: {
      timestamp: new Date().toISOString(),
      requestId: 'test-request-id',
      version: '1.0.0',
    },
  };

  describe('getCases', () => {
    it('should fetch cases with default parameters', async () => {
      const mockQueryResult = {
        cases: [mockCaseStudy],
        total: 1,
        page: 1,
        limit: 12,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockQueryResult }),
      } as Response);

      const result = await CaseStudyApi.getCases();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/case-studies?'),
        expect.objectContaining({
          headers: { 'Content-Type': 'application/json' },
        })
      );
      expect(result).toEqual(mockQueryResult);
    });

    it('should fetch cases with query parameters', async () => {
      const query: CaseQuery = {
        filters: {
          projectType: ProjectType.OUTDOOR_ADVERTISING,
          industry: IndustryType.ADVERTISING,
          isFeatured: true,
        },
        sortBy: CaseSortBy.CREATED_DESC,
        page: 2,
        limit: 6,
        include: ['images', 'testimonials'],
      };

      const mockQueryResult = {
        cases: [mockCaseStudy],
        total: 1,
        page: 2,
        limit: 6,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: true,
        filters: query.filters,
        sortBy: query.sortBy,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockQueryResult }),
      } as Response);

      const result = await CaseStudyApi.getCases(query);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('filters[projectType]=outdoor_advertising'),
        expect.any(Object)
      );
      expect(result).toEqual(mockQueryResult);
    });

    it('should handle API errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Internal server error',
          },
        }),
      } as Response);

      await expect(CaseStudyApi.getCases()).rejects.toThrow(CaseApiError);
    });
  });

  describe('getCase', () => {
    it('should fetch a single case by ID', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse,
      } as Response);

      const result = await CaseStudyApi.getCase('test-case-1');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/case-studies/test-case-1'),
        expect.any(Object)
      );
      expect(result).toEqual(mockCaseStudy);
    });

    it('should throw error for missing ID', async () => {
      await expect(CaseStudyApi.getCase('')).rejects.toThrow(CaseApiError);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should include related data when requested', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse,
      } as Response);

      await CaseStudyApi.getCase('test-case-1', ['images', 'videos']);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('include=images&include=videos'),
        expect.any(Object)
      );
    });
  });

  describe('getCaseBySlug', () => {
    it('should fetch a case by slug', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse,
      } as Response);

      const result = await CaseStudyApi.getCaseBySlug('test-case-study');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/case-studies/slug/test-case-study'),
        expect.any(Object)
      );
      expect(result).toEqual(mockCaseStudy);
    });

    it('should throw error for missing slug', async () => {
      await expect(CaseStudyApi.getCaseBySlug('')).rejects.toThrow(CaseApiError);
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe('createCase', () => {
    const mockCreateData: CaseCreateData = {
      title: 'New Case Study',
      summary: 'New case summary',
      fullDescription: 'New case description',
      projectType: ProjectType.RETAIL_DISPLAY,
      industry: IndustryType.RETAIL,
      customer: mockCaseStudy.customer,
      location: mockCaseStudy.location,
      projectScale: mockCaseStudy.projectScale,
      technicalSpecs: mockCaseStudy.technicalSpecs,
      challenges: [],
      solutions: ['Solution 1'],
      outcomes: [],
      timeline: [],
      team: [],
      relatedProducts: [],
      tags: ['new'],
      features: ['new-feature'],
      status: CaseStatus.DRAFT,
      isPublished: false,
      isFeatured: false,
      isShowcase: false,
      projectStartDate: new Date('2024-01-01'),
      projectEndDate: new Date('2024-12-31'),
    };

    it('should create a new case', async () => {
      const newCase = { ...mockCaseStudy, ...mockCreateData, id: 'new-case-id' };
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: newCase }),
      } as Response);

      const result = await CaseStudyApi.createCase(mockCreateData);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/case-studies'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(mockCreateData),
        })
      );
      expect(result).toEqual(newCase);
    });
  });

  describe('updateCase', () => {
    const mockUpdateData: CaseUpdateData = {
      id: 'test-case-1',
      title: 'Updated Case Study',
      summary: 'Updated summary',
    };

    it('should update an existing case', async () => {
      const updatedCase = { ...mockCaseStudy, ...mockUpdateData };
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: updatedCase }),
      } as Response);

      const result = await CaseStudyApi.updateCase(mockUpdateData);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/case-studies/test-case-1'),
        expect.objectContaining({
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: 'Updated Case Study', summary: 'Updated summary' }),
        })
      );
      expect(result).toEqual(updatedCase);
    });
  });

  describe('deleteCase', () => {
    it('should delete a case', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

      await CaseStudyApi.deleteCase('test-case-1');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/case-studies/test-case-1'),
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });

    it('should throw error for missing ID', async () => {
      await expect(CaseStudyApi.deleteCase('')).rejects.toThrow(CaseApiError);
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe('bulkOperation', () => {
    it('should perform bulk operations', async () => {
      const operation: CaseBulkOperation = {
        action: 'publish',
        caseIds: ['case-1', 'case-2'],
        data: { status: CaseStatus.PUBLISHED },
      };

      const mockResult = { success: 2, failed: 0 };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockResult }),
      } as Response);

      const result = await CaseStudyApi.bulkOperation(operation);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/case-studies/bulk'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(operation),
        })
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('searchCases', () => {
    it('should search cases', async () => {
      const searchResults = [mockCaseStudy];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: searchResults }),
      } as Response);

      const result = await CaseStudyApi.searchCases('test query');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/case-studies/search?q=test%20query'),
        expect.any(Object)
      );
      expect(result).toEqual(searchResults);
    });

    it('should throw error for empty query', async () => {
      await expect(CaseStudyApi.searchCases('')).rejects.toThrow(CaseApiError);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should include filters in search', async () => {
      const filters = { projectType: ProjectType.OUTDOOR_ADVERTISING };
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: [] }),
      } as Response);

      await CaseStudyApi.searchCases('test', filters, 5);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('filters[projectType]=outdoor_advertising'),
        expect.any(Object)
      );
    });
  });

  describe('getSearchSuggestions', () => {
    it('should get search suggestions', async () => {
      const suggestions = [
        { type: 'case' as const, id: 'case-1', text: 'Test Case' },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: suggestions }),
      } as Response);

      const result = await CaseStudyApi.getSearchSuggestions('test');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/case-studies/suggestions?q=test'),
        expect.any(Object)
      );
      expect(result).toEqual(suggestions);
    });

    it('should return empty array for short query', async () => {
      const result = await CaseStudyApi.getSearchSuggestions('a');
      
      expect(result).toEqual([]);
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe('getFeaturedCases', () => {
    it('should get featured cases', async () => {
      const featuredCases = [mockCaseStudy];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: featuredCases }),
      } as Response);

      const result = await CaseStudyApi.getFeaturedCases(6);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/case-studies/featured?limit=6'),
        expect.any(Object)
      );
      expect(result).toEqual(featuredCases);
    });
  });

  describe('getRelatedCases', () => {
    it('should get related cases', async () => {
      const relatedCases = [mockCaseStudy];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: relatedCases }),
      } as Response);

      const result = await CaseStudyApi.getRelatedCases('test-case-1', 4);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/case-studies/test-case-1/related?limit=4'),
        expect.any(Object)
      );
      expect(result).toEqual(relatedCases);
    });

    it('should throw error for missing case ID', async () => {
      await expect(CaseStudyApi.getRelatedCases('')).rejects.toThrow(CaseApiError);
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe('compareCases', () => {
    it('should compare cases', async () => {
      const comparison = {
        cases: [mockCaseStudy],
        comparison: [],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: comparison }),
      } as Response);

      const result = await CaseStudyApi.compareCases(['case-1', 'case-2']);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/case-studies/compare'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ caseIds: ['case-1', 'case-2'] }),
        })
      );
      expect(result).toEqual(comparison);
    });

    it('should throw error for insufficient cases', async () => {
      await expect(CaseStudyApi.compareCases(['case-1'])).rejects.toThrow(CaseApiError);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should throw error for too many cases', async () => {
      const tooManyCases = ['case-1', 'case-2', 'case-3', 'case-4', 'case-5'];
      await expect(CaseStudyApi.compareCases(tooManyCases)).rejects.toThrow(CaseApiError);
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe('incrementViewCount', () => {
    it('should increment view count', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

      await CaseStudyApi.incrementViewCount('test-case-1');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/case-studies/test-case-1/view'),
        expect.objectContaining({
          method: 'POST',
        })
      );
    });

    it('should throw error for missing case ID', async () => {
      await expect(CaseStudyApi.incrementViewCount('')).rejects.toThrow(CaseApiError);
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe('checkSlugAvailability', () => {
    it('should check slug availability', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: { available: true } }),
      } as Response);

      const result = await CaseStudyApi.checkSlugAvailability('test-slug');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/case-studies/check-slug?slug=test-slug'),
        expect.any(Object)
      );
      expect(result).toBe(true);
    });

    it('should throw error for missing slug', async () => {
      await expect(CaseStudyApi.checkSlugAvailability('')).rejects.toThrow(CaseApiError);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should include exclude parameter', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: { available: true } }),
      } as Response);

      await CaseStudyApi.checkSlugAvailability('test-slug', 'exclude-id');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('exclude=exclude-id'),
        expect.any(Object)
      );
    });
  });

  describe('uploadCaseImage', () => {
    it('should upload case image', async () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const uploadResult = { url: 'https://example.com/image.jpg', id: 'image-id' };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: uploadResult }),
      } as Response);

      const result = await CaseStudyApi.uploadCaseImage('test-case-1', file, 'hero');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/case-studies/test-case-1/images'),
        expect.objectContaining({
          method: 'POST',
          body: expect.any(FormData),
        })
      );
      expect(result).toEqual(uploadResult);
    });

    it('should throw error for missing case ID', async () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      
      await expect(CaseStudyApi.uploadCaseImage('', file)).rejects.toThrow(CaseApiError);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should throw error for missing file', async () => {
      await expect(CaseStudyApi.uploadCaseImage('test-case-1', null as any)).rejects.toThrow(CaseApiError);
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(CaseStudyApi.getCases()).rejects.toThrow(CaseApiError);
    });

    it('should handle JSON parsing errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      } as Response);

      await expect(CaseStudyApi.getCases()).rejects.toThrow(CaseApiError);
    });

    it('should preserve API error details', async () => {
      const apiError = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: { field: 'title', message: 'Title is required' },
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => apiError,
      } as Response);

      try {
        await CaseStudyApi.getCases();
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(CaseApiError);
        const caseError = error as CaseApiError;
        expect(caseError.statusCode).toBe(400);
        expect(caseError.code).toBe('VALIDATION_ERROR');
        expect(caseError.message).toBe('Validation failed');
        expect(caseError.details).toEqual({ field: 'title', message: 'Title is required' });
      }
    });
  });
});