/**
 * 案例研究工具函数测试
 */
import {
  GeoUtils,
  CaseFilterUtils,
  CaseMapUtils,
  CaseSearchUtils,
} from '@/lib/case-study-utils';
import {
  CaseStudy,
  ProjectType,
  IndustryType,
  CaseStatus,
  CaseSortBy,
  CaseFilters,
} from '@/types/case-study';
import { mockCaseStudies } from '@/lib/mock/case-studies';

describe('GeoUtils', () => {
  describe('calculateDistance', () => {
    it('should calculate distance between two points correctly', () => {
      // New York to London (approximately 5585 km)
      const distance = GeoUtils.calculateDistance(40.7128, -74.0060, 51.5074, -0.1278);
      expect(distance).toBeCloseTo(5585, -2); // Within 100km accuracy
    });

    it('should return 0 for same coordinates', () => {
      const distance = GeoUtils.calculateDistance(40.7128, -74.0060, 40.7128, -74.0060);
      expect(distance).toBe(0);
    });
  });

  describe('getLocationDisplayName', () => {
    it('should format location with state', () => {
      const location = {
        latitude: 40.7128,
        longitude: -74.0060,
        address: '123 Main St',
        city: 'New York',
        state: 'NY',
        country: 'United States',
      };
      
      const displayName = GeoUtils.getLocationDisplayName(location);
      expect(displayName).toBe('New York, NY, United States');
    });

    it('should format location without state', () => {
      const location = {
        latitude: 51.5074,
        longitude: -0.1278,
        address: '123 Oxford St',
        city: 'London',
        country: 'United Kingdom',
      };
      
      const displayName = GeoUtils.getLocationDisplayName(location);
      expect(displayName).toBe('London, United Kingdom');
    });
  });

  describe('groupCasesByLocation', () => {
    it('should group cases by country and city', () => {
      const grouped = GeoUtils.groupCasesByLocation(mockCaseStudies);
      
      expect(grouped).toHaveProperty('United States');
      expect(grouped).toHaveProperty('United Kingdom');
      expect(grouped).toHaveProperty('Japan');
      
      expect(grouped['United States']).toHaveProperty('New York');
      expect(grouped['United Kingdom']).toHaveProperty('London');
      expect(grouped['Japan']).toHaveProperty('Tokyo');
    });
  });

  describe('findCasesWithinRadius', () => {
    it('should find cases within specified radius', () => {
      // Center on New York, 100km radius
      const nearbyCase = GeoUtils.findCasesWithinRadius(
        mockCaseStudies,
        40.7128,
        -74.0060,
        100
      );
      
      expect(nearbyCase.length).toBeGreaterThan(0);
      expect(nearbyCase[0].location.city).toBe('New York');
    });

    it('should return empty array when no cases within radius', () => {
      // Center on middle of ocean
      const nearbyCase = GeoUtils.findCasesWithinRadius(
        mockCaseStudies,
        0,
        0,
        100
      );
      
      expect(nearbyCase).toHaveLength(0);
    });
  });

  describe('getCasesBounds', () => {
    it('should calculate correct bounds for cases', () => {
      const bounds = GeoUtils.getCasesBounds(mockCaseStudies);
      
      expect(bounds.north).toBeGreaterThan(bounds.south);
      expect(bounds.east).toBeGreaterThan(bounds.west);
      expect(bounds.north).toBeLessThanOrEqual(90);
      expect(bounds.south).toBeGreaterThanOrEqual(-90);
      expect(bounds.east).toBeLessThanOrEqual(180);
      expect(bounds.west).toBeGreaterThanOrEqual(-180);
    });

    it('should return zero bounds for empty array', () => {
      const bounds = GeoUtils.getCasesBounds([]);
      
      expect(bounds).toEqual({
        north: 0,
        south: 0,
        east: 0,
        west: 0,
      });
    });
  });
});

describe('CaseFilterUtils', () => {
  describe('applyCaseFilters', () => {
    it('should filter by project type', () => {
      const filters: CaseFilters = {
        projectType: ProjectType.OUTDOOR_ADVERTISING,
      };
      
      const filtered = CaseFilterUtils.applyCaseFilters(mockCaseStudies, filters);
      
      expect(filtered.length).toBeGreaterThan(0);
      filtered.forEach(caseStudy => {
        expect(caseStudy.projectType).toBe(ProjectType.OUTDOOR_ADVERTISING);
      });
    });

    it('should filter by multiple project types', () => {
      const filters: CaseFilters = {
        projectType: [ProjectType.OUTDOOR_ADVERTISING, ProjectType.RETAIL_DISPLAY],
      };
      
      const filtered = CaseFilterUtils.applyCaseFilters(mockCaseStudies, filters);
      
      filtered.forEach(caseStudy => {
        expect([ProjectType.OUTDOOR_ADVERTISING, ProjectType.RETAIL_DISPLAY])
          .toContain(caseStudy.projectType);
      });
    });

    it('should filter by industry', () => {
      const filters: CaseFilters = {
        industry: IndustryType.ADVERTISING,
      };
      
      const filtered = CaseFilterUtils.applyCaseFilters(mockCaseStudies, filters);
      
      filtered.forEach(caseStudy => {
        expect(caseStudy.industry).toBe(IndustryType.ADVERTISING);
      });
    });

    it('should filter by country', () => {
      const filters: CaseFilters = {
        country: 'United States',
      };
      
      const filtered = CaseFilterUtils.applyCaseFilters(mockCaseStudies, filters);
      
      filtered.forEach(caseStudy => {
        expect(caseStudy.location.country).toBe('United States');
      });
    });

    it('should filter by tags', () => {
      const filters: CaseFilters = {
        tags: 'outdoor',
      };
      
      const filtered = CaseFilterUtils.applyCaseFilters(mockCaseStudies, filters);
      
      filtered.forEach(caseStudy => {
        expect(caseStudy.tags).toContain('outdoor');
      });
    });

    it('should filter by featured status', () => {
      const filters: CaseFilters = {
        isFeatured: true,
      };
      
      const filtered = CaseFilterUtils.applyCaseFilters(mockCaseStudies, filters);
      
      filtered.forEach(caseStudy => {
        expect(caseStudy.isFeatured).toBe(true);
      });
    });

    it('should filter by project scale area range', () => {
      const filters: CaseFilters = {
        projectScale: {
          minArea: 200,
          maxArea: 500,
        },
      };
      
      const filtered = CaseFilterUtils.applyCaseFilters(mockCaseStudies, filters);
      
      filtered.forEach(caseStudy => {
        expect(caseStudy.projectScale.totalScreenArea).toBeGreaterThanOrEqual(200);
        expect(caseStudy.projectScale.totalScreenArea).toBeLessThanOrEqual(500);
      });
    });

    it('should filter by search term', () => {
      const filters: CaseFilters = {
        search: 'Times Square',
      };
      
      const filtered = CaseFilterUtils.applyCaseFilters(mockCaseStudies, filters);
      
      expect(filtered.length).toBeGreaterThan(0);
      filtered.forEach(caseStudy => {
        const searchableText = [
          caseStudy.title,
          caseStudy.summary,
          caseStudy.fullDescription,
          caseStudy.customer.name,
          ...caseStudy.tags,
          ...caseStudy.features,
          ...caseStudy.solutions,
        ].join(' ').toLowerCase();
        
        expect(searchableText).toContain('times square'.toLowerCase());
      });
    });

    it('should combine multiple filters', () => {
      const filters: CaseFilters = {
        projectType: ProjectType.OUTDOOR_ADVERTISING,
        industry: IndustryType.ADVERTISING,
        isFeatured: true,
      };
      
      const filtered = CaseFilterUtils.applyCaseFilters(mockCaseStudies, filters);
      
      filtered.forEach(caseStudy => {
        expect(caseStudy.projectType).toBe(ProjectType.OUTDOOR_ADVERTISING);
        expect(caseStudy.industry).toBe(IndustryType.ADVERTISING);
        expect(caseStudy.isFeatured).toBe(true);
      });
    });
  });

  describe('sortCases', () => {
    it('should sort by title ascending', () => {
      const sorted = CaseFilterUtils.sortCases(mockCaseStudies, CaseSortBy.TITLE_ASC);
      
      for (let i = 1; i < sorted.length; i++) {
        expect(sorted[i - 1].title.localeCompare(sorted[i].title)).toBeLessThanOrEqual(0);
      }
    });

    it('should sort by title descending', () => {
      const sorted = CaseFilterUtils.sortCases(mockCaseStudies, CaseSortBy.TITLE_DESC);
      
      for (let i = 1; i < sorted.length; i++) {
        expect(sorted[i - 1].title.localeCompare(sorted[i].title)).toBeGreaterThanOrEqual(0);
      }
    });

    it('should sort by project date descending', () => {
      const sorted = CaseFilterUtils.sortCases(mockCaseStudies, CaseSortBy.PROJECT_DATE_DESC);
      
      for (let i = 1; i < sorted.length; i++) {
        expect(sorted[i - 1].projectStartDate.getTime())
          .toBeGreaterThanOrEqual(sorted[i].projectStartDate.getTime());
      }
    });

    it('should sort by view count descending', () => {
      const sorted = CaseFilterUtils.sortCases(mockCaseStudies, CaseSortBy.VIEW_COUNT_DESC);
      
      for (let i = 1; i < sorted.length; i++) {
        expect(sorted[i - 1].viewCount).toBeGreaterThanOrEqual(sorted[i].viewCount);
      }
    });

    it('should sort by area descending', () => {
      const sorted = CaseFilterUtils.sortCases(mockCaseStudies, CaseSortBy.AREA_DESC);
      
      for (let i = 1; i < sorted.length; i++) {
        expect(sorted[i - 1].projectScale.totalScreenArea)
          .toBeGreaterThanOrEqual(sorted[i].projectScale.totalScreenArea);
      }
    });

    it('should sort featured cases first', () => {
      const sorted = CaseFilterUtils.sortCases(mockCaseStudies, CaseSortBy.FEATURED);
      
      let foundNonFeatured = false;
      sorted.forEach(caseStudy => {
        if (!caseStudy.isFeatured) {
          foundNonFeatured = true;
        } else if (foundNonFeatured) {
          // If we found a featured case after a non-featured one, the sort is wrong
          fail('Featured cases should come before non-featured cases');
        }
      });
    });
  });

  describe('paginateCases', () => {
    it('should paginate cases correctly', () => {
      const result = CaseFilterUtils.paginateCases(mockCaseStudies, 1, 2);
      
      expect(result.cases).toHaveLength(2);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(2);
      expect(result.pagination.total).toBe(mockCaseStudies.length);
      expect(result.pagination.totalPages).toBe(Math.ceil(mockCaseStudies.length / 2));
      expect(result.pagination.hasNextPage).toBe(true);
      expect(result.pagination.hasPrevPage).toBe(false);
    });

    it('should handle last page correctly', () => {
      const totalPages = Math.ceil(mockCaseStudies.length / 2);
      const result = CaseFilterUtils.paginateCases(mockCaseStudies, totalPages, 2);
      
      expect(result.pagination.hasNextPage).toBe(false);
      expect(result.pagination.hasPrevPage).toBe(true);
    });

    it('should handle empty array', () => {
      const result = CaseFilterUtils.paginateCases([], 1, 10);
      
      expect(result.cases).toHaveLength(0);
      expect(result.pagination.total).toBe(0);
      expect(result.pagination.totalPages).toBe(0);
      expect(result.pagination.hasNextPage).toBe(false);
      expect(result.pagination.hasPrevPage).toBe(false);
    });
  });

  describe('getFilterStats', () => {
    it('should generate correct filter statistics', () => {
      const stats = CaseFilterUtils.getFilterStats(mockCaseStudies);
      
      expect(stats.projectTypes).toBeInstanceOf(Array);
      expect(stats.industries).toBeInstanceOf(Array);
      expect(stats.countries).toBeInstanceOf(Array);
      expect(stats.tags).toBeInstanceOf(Array);
      expect(stats.features).toBeInstanceOf(Array);
      
      expect(stats.yearRange.min).toBeLessThanOrEqual(stats.yearRange.max);
      expect(stats.investmentRange.min).toBeLessThanOrEqual(stats.investmentRange.max);
      expect(stats.areaRange.min).toBeLessThanOrEqual(stats.areaRange.max);
      
      // Check that counts are correct
      const totalProjectTypeCounts = stats.projectTypes.reduce((sum, pt) => sum + pt.count, 0);
      expect(totalProjectTypeCounts).toBe(mockCaseStudies.length);
    });
  });
});

describe('CaseMapUtils', () => {
  describe('convertCasesToMapData', () => {
    it('should convert cases to map data correctly', () => {
      const mapData = CaseMapUtils.convertCasesToMapData(mockCaseStudies);
      
      expect(mapData).toHaveLength(mockCaseStudies.length);
      
      mapData.forEach((data, index) => {
        const originalCase = mockCaseStudies[index];
        expect(data.id).toBe(originalCase.id);
        expect(data.title).toBe(originalCase.title);
        expect(data.customer).toBe(originalCase.customer.name);
        expect(data.location).toEqual(originalCase.location);
        expect(data.projectType).toBe(originalCase.projectType);
        expect(data.industry).toBe(originalCase.industry);
        expect(data.isFeatured).toBe(originalCase.isFeatured);
        expect(data.isShowcase).toBe(originalCase.isShowcase);
      });
    });
  });

  describe('getMapBounds', () => {
    it('should calculate map bounds correctly', () => {
      const mapData = CaseMapUtils.convertCasesToMapData(mockCaseStudies);
      const bounds = CaseMapUtils.getMapBounds(mapData);
      
      expect(bounds.north).toBeGreaterThan(bounds.south);
      expect(bounds.east).toBeGreaterThan(bounds.west);
      expect(bounds.center.latitude).toBeGreaterThanOrEqual(bounds.south);
      expect(bounds.center.latitude).toBeLessThanOrEqual(bounds.north);
      expect(bounds.center.longitude).toBeGreaterThanOrEqual(bounds.west);
      expect(bounds.center.longitude).toBeLessThanOrEqual(bounds.east);
    });

    it('should handle empty map data', () => {
      const bounds = CaseMapUtils.getMapBounds([]);
      
      expect(bounds).toEqual({
        north: 90,
        south: -90,
        east: 180,
        west: -180,
        center: { latitude: 0, longitude: 0 },
      });
    });
  });

  describe('clusterCasesByLocation', () => {
    it('should cluster nearby cases', () => {
      const mapData = CaseMapUtils.convertCasesToMapData(mockCaseStudies);
      const { clusters, singleCases } = CaseMapUtils.clusterCasesByLocation(mapData, 5);
      
      expect(clusters.length + singleCases.length).toBeGreaterThan(0);
      
      clusters.forEach(cluster => {
        expect(cluster.count).toBeGreaterThan(1);
        expect(cluster.cases).toHaveLength(cluster.count);
        expect(cluster.latitude).toBeGreaterThanOrEqual(-90);
        expect(cluster.latitude).toBeLessThanOrEqual(90);
        expect(cluster.longitude).toBeGreaterThanOrEqual(-180);
        expect(cluster.longitude).toBeLessThanOrEqual(180);
      });
    });
  });
});

describe('CaseSearchUtils', () => {
  describe('advancedSearch', () => {
    it('should search cases and return scored results', () => {
      const results = CaseSearchUtils.advancedSearch(mockCaseStudies, 'Times Square');
      
      expect(results).toBeInstanceOf(Array);
      results.forEach(result => {
        expect(result).toHaveProperty('case');
        expect(result).toHaveProperty('score');
        expect(result.score).toBeGreaterThan(0);
        expect(result.score).toBeLessThanOrEqual(1);
      });
      
      // Results should be sorted by score descending
      for (let i = 1; i < results.length; i++) {
        expect(results[i - 1].score).toBeGreaterThanOrEqual(results[i].score);
      }
    });

    it('should return empty array for empty query', () => {
      const results = CaseSearchUtils.advancedSearch(mockCaseStudies, '');
      expect(results).toHaveLength(0);
    });

    it('should respect minimum score threshold', () => {
      const results = CaseSearchUtils.advancedSearch(
        mockCaseStudies,
        'nonexistent term',
        { minScore: 0.5 }
      );
      
      results.forEach(result => {
        expect(result.score).toBeGreaterThanOrEqual(0.5);
      });
    });

    it('should search specific fields only', () => {
      const results = CaseSearchUtils.advancedSearch(
        mockCaseStudies,
        'Times Square',
        { searchFields: ['title'] }
      );
      
      results.forEach(result => {
        expect(result.case.title.toLowerCase()).toContain('times square');
      });
    });
  });

  describe('generateSearchSuggestions', () => {
    it('should generate search suggestions', () => {
      const suggestions = CaseSearchUtils.generateSearchSuggestions(
        mockCaseStudies,
        'Times',
        5
      );
      
      expect(suggestions).toBeInstanceOf(Array);
      expect(suggestions.length).toBeLessThanOrEqual(5);
      
      suggestions.forEach(suggestion => {
        expect(suggestion).toHaveProperty('type');
        expect(suggestion).toHaveProperty('id');
        expect(suggestion).toHaveProperty('text');
        expect(['case', 'customer', 'location', 'industry', 'tag']).toContain(suggestion.type);
        expect(suggestion.text.toLowerCase()).toContain('times');
      });
    });

    it('should return empty array for short query', () => {
      const suggestions = CaseSearchUtils.generateSearchSuggestions(mockCaseStudies, 'a');
      expect(suggestions).toHaveLength(0);
    });

    it('should limit suggestions correctly', () => {
      const suggestions = CaseSearchUtils.generateSearchSuggestions(
        mockCaseStudies,
        'e',
        3
      );
      
      expect(suggestions.length).toBeLessThanOrEqual(3);
    });
  });
});