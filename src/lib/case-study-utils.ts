/**
 * 案例研究工具函数
 */
import { 
  CaseStudy,
  CaseFilters,
  CaseSortBy,
  CaseQueryResult,
  CaseMapData,
  ProjectType,
  IndustryType,
  CaseStatus,
  GeoLocation
} from '@/types/case-study';

// 地理位置工具函数
export class GeoUtils {
  /**
   * 计算两个地理位置之间的距离（公里）
   */
  static calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // 地球半径（公里）
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * 将角度转换为弧度
   */
  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * 获取地理位置的显示名称
   */
  static getLocationDisplayName(location: GeoLocation): string {
    const parts = [location.city];
    if (location.state) {
      parts.push(location.state);
    }
    parts.push(location.country);
    return parts.join(', ');
  }

  /**
   * 根据地理位置分组案例
   */
  static groupCasesByLocation(cases: CaseStudy[]): {
    [country: string]: {
      [city: string]: CaseStudy[];
    };
  } {
    const grouped: { [country: string]: { [city: string]: CaseStudy[] } } = {};

    cases.forEach(caseStudy => {
      const country = caseStudy.location.country;
      const city = caseStudy.location.city;

      if (!grouped[country]) {
        grouped[country] = {};
      }
      if (!grouped[country][city]) {
        grouped[country][city] = [];
      }
      grouped[country][city].push(caseStudy);
    });

    return grouped;
  }

  /**
   * 在指定半径内查找案例
   */
  static findCasesWithinRadius(
    cases: CaseStudy[],
    centerLat: number,
    centerLon: number,
    radiusKm: number
  ): CaseStudy[] {
    return cases.filter(caseStudy => {
      const distance = this.calculateDistance(
        centerLat,
        centerLon,
        caseStudy.location.latitude,
        caseStudy.location.longitude
      );
      return distance <= radiusKm;
    });
  }

  /**
   * 获取案例的边界框
   */
  static getCasesBounds(cases: CaseStudy[]): {
    north: number;
    south: number;
    east: number;
    west: number;
  } {
    if (cases.length === 0) {
      return { north: 0, south: 0, east: 0, west: 0 };
    }

    let north = cases[0].location.latitude;
    let south = cases[0].location.latitude;
    let east = cases[0].location.longitude;
    let west = cases[0].location.longitude;

    cases.forEach(caseStudy => {
      const { latitude, longitude } = caseStudy.location;
      north = Math.max(north, latitude);
      south = Math.min(south, latitude);
      east = Math.max(east, longitude);
      west = Math.min(west, longitude);
    });

    return { north, south, east, west };
  }
}

// 案例筛选工具函数
export class CaseFilterUtils {
  /**
   * 应用筛选条件到案例列表
   */
  static applyCaseFilters(cases: CaseStudy[], filters: CaseFilters): CaseStudy[] {
    let filteredCases = [...cases];

    // 项目类型筛选
    if (filters.projectType) {
      const types = Array.isArray(filters.projectType) 
        ? filters.projectType 
        : [filters.projectType];
      filteredCases = filteredCases.filter(c => types.includes(c.projectType));
    }

    // 行业筛选
    if (filters.industry) {
      const industries = Array.isArray(filters.industry) 
        ? filters.industry 
        : [filters.industry];
      filteredCases = filteredCases.filter(c => industries.includes(c.industry));
    }

    // 状态筛选
    if (filters.status) {
      const statuses = Array.isArray(filters.status) 
        ? filters.status 
        : [filters.status];
      filteredCases = filteredCases.filter(c => statuses.includes(c.status));
    }

    // 国家筛选
    if (filters.country) {
      const countries = Array.isArray(filters.country) 
        ? filters.country 
        : [filters.country];
      filteredCases = filteredCases.filter(c => 
        countries.includes(c.location.country)
      );
    }

    // 地区筛选
    if (filters.region) {
      const regions = Array.isArray(filters.region) 
        ? filters.region 
        : [filters.region];
      filteredCases = filteredCases.filter(c => 
        c.location.state && regions.includes(c.location.state)
      );
    }

    // 城市筛选
    if (filters.city) {
      const cities = Array.isArray(filters.city) 
        ? filters.city 
        : [filters.city];
      filteredCases = filteredCases.filter(c => 
        cities.includes(c.location.city)
      );
    }

    // 标签筛选
    if (filters.tags) {
      const tags = Array.isArray(filters.tags) 
        ? filters.tags 
        : [filters.tags];
      filteredCases = filteredCases.filter(c => 
        tags.some(tag => c.tags.includes(tag))
      );
    }

    // 特性筛选
    if (filters.features) {
      const features = Array.isArray(filters.features) 
        ? filters.features 
        : [filters.features];
      filteredCases = filteredCases.filter(c => 
        features.some(feature => c.features.includes(feature))
      );
    }

    // 推荐案例筛选
    if (filters.isFeatured !== undefined) {
      filteredCases = filteredCases.filter(c => c.isFeatured === filters.isFeatured);
    }

    // 展示案例筛选
    if (filters.isShowcase !== undefined) {
      filteredCases = filteredCases.filter(c => c.isShowcase === filters.isShowcase);
    }

    // 项目规模筛选
    if (filters.projectScale) {
      const { minArea, maxArea, minInvestment, maxInvestment } = filters.projectScale;
      
      if (minArea !== undefined) {
        filteredCases = filteredCases.filter(c => 
          c.projectScale.totalScreenArea >= minArea
        );
      }
      
      if (maxArea !== undefined) {
        filteredCases = filteredCases.filter(c => 
          c.projectScale.totalScreenArea <= maxArea
        );
      }
      
      if (minInvestment !== undefined) {
        filteredCases = filteredCases.filter(c => 
          c.projectScale.totalInvestment && 
          c.projectScale.totalInvestment >= minInvestment
        );
      }
      
      if (maxInvestment !== undefined) {
        filteredCases = filteredCases.filter(c => 
          c.projectScale.totalInvestment && 
          c.projectScale.totalInvestment <= maxInvestment
        );
      }
    }

    // 日期范围筛选
    if (filters.dateRange) {
      const { start, end, field } = filters.dateRange;
      filteredCases = filteredCases.filter(c => {
        let dateToCheck: Date;
        switch (field) {
          case 'projectStartDate':
            dateToCheck = c.projectStartDate;
            break;
          case 'projectEndDate':
            dateToCheck = c.projectEndDate;
            break;
          case 'createdAt':
            dateToCheck = c.createdAt;
            break;
          case 'publishedAt':
            dateToCheck = c.publishedAt || c.createdAt;
            break;
          default:
            dateToCheck = c.createdAt;
        }
        return dateToCheck >= start && dateToCheck <= end;
      });
    }

    // 搜索关键词筛选
    if (filters.search && filters.search.trim()) {
      const searchTerm = filters.search.toLowerCase().trim();
      filteredCases = filteredCases.filter(c => 
        c.title.toLowerCase().includes(searchTerm) ||
        c.summary.toLowerCase().includes(searchTerm) ||
        c.fullDescription.toLowerCase().includes(searchTerm) ||
        c.customer.name.toLowerCase().includes(searchTerm) ||
        c.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
        c.features.some(feature => feature.toLowerCase().includes(searchTerm)) ||
        c.solutions.some(solution => solution.toLowerCase().includes(searchTerm))
      );
    }

    // 视频筛选
    if (filters.hasVideo !== undefined) {
      filteredCases = filteredCases.filter(c => 
        filters.hasVideo ? c.videos.length > 0 : c.videos.length === 0
      );
    }

    // 客户证言筛选
    if (filters.hasTestimonial !== undefined) {
      filteredCases = filteredCases.filter(c => 
        filters.hasTestimonial ? c.testimonials.length > 0 : c.testimonials.length === 0
      );
    }

    // 最低评分筛选
    if (filters.minRating !== undefined) {
      filteredCases = filteredCases.filter(c => {
        const avgRating = c.testimonials.length > 0
          ? c.testimonials.reduce((sum, t) => sum + (t.rating || 0), 0) / c.testimonials.length
          : 0;
        return avgRating >= filters.minRating!;
      });
    }

    return filteredCases;
  }

  /**
   * 对案例列表进行排序
   */
  static sortCases(cases: CaseStudy[], sortBy: CaseSortBy): CaseStudy[] {
    const sortedCases = [...cases];

    switch (sortBy) {
      case CaseSortBy.TITLE_ASC:
        return sortedCases.sort((a, b) => a.title.localeCompare(b.title));
      
      case CaseSortBy.TITLE_DESC:
        return sortedCases.sort((a, b) => b.title.localeCompare(a.title));
      
      case CaseSortBy.PROJECT_DATE_ASC:
        return sortedCases.sort((a, b) => 
          a.projectStartDate.getTime() - b.projectStartDate.getTime()
        );
      
      case CaseSortBy.PROJECT_DATE_DESC:
        return sortedCases.sort((a, b) => 
          b.projectStartDate.getTime() - a.projectStartDate.getTime()
        );
      
      case CaseSortBy.CREATED_ASC:
        return sortedCases.sort((a, b) => 
          a.createdAt.getTime() - b.createdAt.getTime()
        );
      
      case CaseSortBy.CREATED_DESC:
        return sortedCases.sort((a, b) => 
          b.createdAt.getTime() - a.createdAt.getTime()
        );
      
      case CaseSortBy.UPDATED_ASC:
        return sortedCases.sort((a, b) => 
          a.updatedAt.getTime() - b.updatedAt.getTime()
        );
      
      case CaseSortBy.UPDATED_DESC:
        return sortedCases.sort((a, b) => 
          b.updatedAt.getTime() - a.updatedAt.getTime()
        );
      
      case CaseSortBy.VIEW_COUNT_ASC:
        return sortedCases.sort((a, b) => a.viewCount - b.viewCount);
      
      case CaseSortBy.VIEW_COUNT_DESC:
        return sortedCases.sort((a, b) => b.viewCount - a.viewCount);
      
      case CaseSortBy.INVESTMENT_ASC:
        return sortedCases.sort((a, b) => {
          const aInvestment = a.projectScale.totalInvestment || 0;
          const bInvestment = b.projectScale.totalInvestment || 0;
          return aInvestment - bInvestment;
        });
      
      case CaseSortBy.INVESTMENT_DESC:
        return sortedCases.sort((a, b) => {
          const aInvestment = a.projectScale.totalInvestment || 0;
          const bInvestment = b.projectScale.totalInvestment || 0;
          return bInvestment - aInvestment;
        });
      
      case CaseSortBy.AREA_ASC:
        return sortedCases.sort((a, b) => 
          a.projectScale.totalScreenArea - b.projectScale.totalScreenArea
        );
      
      case CaseSortBy.AREA_DESC:
        return sortedCases.sort((a, b) => 
          b.projectScale.totalScreenArea - a.projectScale.totalScreenArea
        );
      
      case CaseSortBy.FEATURED:
        return sortedCases.sort((a, b) => {
          if (a.isFeatured && !b.isFeatured) return -1;
          if (!a.isFeatured && b.isFeatured) return 1;
          return b.createdAt.getTime() - a.createdAt.getTime();
        });
      
      case CaseSortBy.SHOWCASE:
        return sortedCases.sort((a, b) => {
          if (a.isShowcase && !b.isShowcase) return -1;
          if (!a.isShowcase && b.isShowcase) return 1;
          return b.createdAt.getTime() - a.createdAt.getTime();
        });
      
      default:
        return sortedCases.sort((a, b) => 
          b.createdAt.getTime() - a.createdAt.getTime()
        );
    }
  }

  /**
   * 分页处理
   */
  static paginateCases(
    cases: CaseStudy[],
    page: number = 1,
    limit: number = 12
  ): {
    cases: CaseStudy[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  } {
    const total = cases.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedCases = cases.slice(startIndex, endIndex);

    return {
      cases: paginatedCases,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  /**
   * 获取筛选选项统计
   */
  static getFilterStats(cases: CaseStudy[]): {
    projectTypes: { type: ProjectType; count: number; label: string }[];
    industries: { industry: IndustryType; count: number; label: string }[];
    countries: { country: string; count: number }[];
    tags: { tag: string; count: number }[];
    features: { feature: string; count: number }[];
    yearRange: { min: number; max: number };
    investmentRange: { min: number; max: number; currencies: string[] };
    areaRange: { min: number; max: number };
  } {
    // 项目类型统计
    const projectTypeMap = new Map<ProjectType, number>();
    const industryMap = new Map<IndustryType, number>();
    const countryMap = new Map<string, number>();
    const tagMap = new Map<string, number>();
    const featureMap = new Map<string, number>();
    
    let minYear = new Date().getFullYear();
    let maxYear = 1900;
    let minInvestment = Infinity;
    let maxInvestment = 0;
    let minArea = Infinity;
    let maxArea = 0;
    const currencies = new Set<string>();

    cases.forEach(caseStudy => {
      // 项目类型
      projectTypeMap.set(
        caseStudy.projectType,
        (projectTypeMap.get(caseStudy.projectType) || 0) + 1
      );

      // 行业
      industryMap.set(
        caseStudy.industry,
        (industryMap.get(caseStudy.industry) || 0) + 1
      );

      // 国家
      countryMap.set(
        caseStudy.location.country,
        (countryMap.get(caseStudy.location.country) || 0) + 1
      );

      // 标签
      caseStudy.tags.forEach(tag => {
        tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
      });

      // 特性
      caseStudy.features.forEach(feature => {
        featureMap.set(feature, (featureMap.get(feature) || 0) + 1);
      });

      // 年份范围
      const year = caseStudy.projectStartDate.getFullYear();
      minYear = Math.min(minYear, year);
      maxYear = Math.max(maxYear, year);

      // 投资范围
      if (caseStudy.projectScale.totalInvestment) {
        minInvestment = Math.min(minInvestment, caseStudy.projectScale.totalInvestment);
        maxInvestment = Math.max(maxInvestment, caseStudy.projectScale.totalInvestment);
        if (caseStudy.projectScale.currency) {
          currencies.add(caseStudy.projectScale.currency);
        }
      }

      // 面积范围
      minArea = Math.min(minArea, caseStudy.projectScale.totalScreenArea);
      maxArea = Math.max(maxArea, caseStudy.projectScale.totalScreenArea);
    });

    // 项目类型标签映射
    const projectTypeLabels: { [key in ProjectType]: string } = {
      [ProjectType.INDOOR_FIXED]: 'Indoor Fixed',
      [ProjectType.OUTDOOR_ADVERTISING]: 'Outdoor Advertising',
      [ProjectType.RENTAL_EVENT]: 'Rental & Event',
      [ProjectType.BROADCAST_STUDIO]: 'Broadcast Studio',
      [ProjectType.RETAIL_DISPLAY]: 'Retail Display',
      [ProjectType.SPORTS_VENUE]: 'Sports Venue',
      [ProjectType.TRANSPORTATION]: 'Transportation',
      [ProjectType.CORPORATE]: 'Corporate',
      [ProjectType.EDUCATION]: 'Education',
      [ProjectType.HEALTHCARE]: 'Healthcare',
      [ProjectType.GOVERNMENT]: 'Government',
      [ProjectType.ENTERTAINMENT]: 'Entertainment',
      [ProjectType.OTHER]: 'Other',
    };

    // 行业标签映射
    const industryLabels: { [key in IndustryType]: string } = {
      [IndustryType.ADVERTISING]: 'Advertising',
      [IndustryType.RETAIL]: 'Retail',
      [IndustryType.SPORTS]: 'Sports',
      [IndustryType.ENTERTAINMENT]: 'Entertainment',
      [IndustryType.EDUCATION]: 'Education',
      [IndustryType.HEALTHCARE]: 'Healthcare',
      [IndustryType.GOVERNMENT]: 'Government',
      [IndustryType.TRANSPORTATION]: 'Transportation',
      [IndustryType.HOSPITALITY]: 'Hospitality',
      [IndustryType.CORPORATE]: 'Corporate',
      [IndustryType.BROADCAST]: 'Broadcast',
      [IndustryType.EVENTS]: 'Events',
      [IndustryType.RELIGIOUS]: 'Religious',
      [IndustryType.OTHER]: 'Other',
    };

    return {
      projectTypes: Array.from(projectTypeMap.entries()).map(([type, count]) => ({
        type,
        count,
        label: projectTypeLabels[type],
      })),
      industries: Array.from(industryMap.entries()).map(([industry, count]) => ({
        industry,
        count,
        label: industryLabels[industry],
      })),
      countries: Array.from(countryMap.entries()).map(([country, count]) => ({
        country,
        count,
      })),
      tags: Array.from(tagMap.entries())
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count),
      features: Array.from(featureMap.entries())
        .map(([feature, count]) => ({ feature, count }))
        .sort((a, b) => b.count - a.count),
      yearRange: { min: minYear, max: maxYear },
      investmentRange: {
        min: minInvestment === Infinity ? 0 : minInvestment,
        max: maxInvestment,
        currencies: Array.from(currencies),
      },
      areaRange: {
        min: minArea === Infinity ? 0 : minArea,
        max: maxArea,
      },
    };
  }
}

// 案例地图数据工具函数
export class CaseMapUtils {
  /**
   * 将案例转换为地图数据
   */
  static convertCasesToMapData(cases: CaseStudy[]): CaseMapData[] {
    return cases.map(caseStudy => ({
      id: caseStudy.id,
      title: caseStudy.title,
      customer: caseStudy.customer.name,
      location: caseStudy.location,
      projectType: caseStudy.projectType,
      industry: caseStudy.industry,
      projectScale: {
        totalScreenArea: caseStudy.projectScale.totalScreenArea,
        totalInvestment: caseStudy.projectScale.totalInvestment,
        currency: caseStudy.projectScale.currency,
      },
      images: {
        thumbnail: caseStudy.images.find(img => img.type === 'hero')?.url || 
                  caseStudy.images[0]?.url || 
                  '/images/placeholder-case.jpg',
        hero: caseStudy.images.find(img => img.type === 'hero')?.url || 
              caseStudy.images[0]?.url || 
              '/images/placeholder-case.jpg',
      },
      isFeatured: caseStudy.isFeatured,
      isShowcase: caseStudy.isShowcase,
    }));
  }

  /**
   * 按地理位置聚类案例
   */
  static clusterCasesByLocation(
    mapData: CaseMapData[],
    zoomLevel: number = 10
  ): {
    clusters: {
      id: string;
      latitude: number;
      longitude: number;
      count: number;
      cases: CaseMapData[];
    }[];
    singleCases: CaseMapData[];
  } {
    const clusters: {
      id: string;
      latitude: number;
      longitude: number;
      count: number;
      cases: CaseMapData[];
    }[] = [];
    const singleCases: CaseMapData[] = [];
    const processed = new Set<string>();

    // 根据缩放级别确定聚类距离
    const clusterDistance = Math.max(1, 20 - zoomLevel); // km

    mapData.forEach(caseData => {
      if (processed.has(caseData.id)) return;

      const nearbyCases = mapData.filter(other => {
        if (other.id === caseData.id || processed.has(other.id)) return false;
        
        const distance = GeoUtils.calculateDistance(
          caseData.location.latitude,
          caseData.location.longitude,
          other.location.latitude,
          other.location.longitude
        );
        
        return distance <= clusterDistance;
      });

      if (nearbyCases.length > 0) {
        // 创建聚类
        const allCases = [caseData, ...nearbyCases];
        const centerLat = allCases.reduce((sum, c) => sum + c.location.latitude, 0) / allCases.length;
        const centerLon = allCases.reduce((sum, c) => sum + c.location.longitude, 0) / allCases.length;

        clusters.push({
          id: `cluster-${caseData.id}`,
          latitude: centerLat,
          longitude: centerLon,
          count: allCases.length,
          cases: allCases,
        });

        // 标记为已处理
        allCases.forEach(c => processed.add(c.id));
      } else {
        // 单独的案例
        singleCases.push(caseData);
        processed.add(caseData.id);
      }
    });

    return { clusters, singleCases };
  }

  /**
   * 获取地图边界
   */
  static getMapBounds(mapData: CaseMapData[]): {
    north: number;
    south: number;
    east: number;
    west: number;
    center: { latitude: number; longitude: number };
  } {
    if (mapData.length === 0) {
      return {
        north: 90,
        south: -90,
        east: 180,
        west: -180,
        center: { latitude: 0, longitude: 0 },
      };
    }

    let north = mapData[0].location.latitude;
    let south = mapData[0].location.latitude;
    let east = mapData[0].location.longitude;
    let west = mapData[0].location.longitude;

    mapData.forEach(caseData => {
      const { latitude, longitude } = caseData.location;
      north = Math.max(north, latitude);
      south = Math.min(south, latitude);
      east = Math.max(east, longitude);
      west = Math.min(west, longitude);
    });

    return {
      north,
      south,
      east,
      west,
      center: {
        latitude: (north + south) / 2,
        longitude: (east + west) / 2,
      },
    };
  }
}

// 案例搜索工具函数
export class CaseSearchUtils {
  /**
   * 高级搜索案例
   */
  static advancedSearch(
    cases: CaseStudy[],
    query: string,
    options: {
      searchFields?: ('title' | 'summary' | 'description' | 'customer' | 'tags' | 'features' | 'solutions')[];
      fuzzyMatch?: boolean;
      minScore?: number;
    } = {}
  ): { case: CaseStudy; score: number }[] {
    const {
      searchFields = ['title', 'summary', 'description', 'customer', 'tags', 'features'],
      fuzzyMatch = true,
      minScore = 0.1,
    } = options;

    const searchTerm = query.toLowerCase().trim();
    if (!searchTerm) return [];

    const results: { case: CaseStudy; score: number }[] = [];

    cases.forEach(caseStudy => {
      let score = 0;
      let maxFieldScore = 0;

      // 标题搜索（权重最高）
      if (searchFields.includes('title')) {
        const titleScore = this.calculateFieldScore(caseStudy.title, searchTerm, fuzzyMatch);
        score += titleScore * 3;
        maxFieldScore = Math.max(maxFieldScore, titleScore);
      }

      // 摘要搜索
      if (searchFields.includes('summary')) {
        const summaryScore = this.calculateFieldScore(caseStudy.summary, searchTerm, fuzzyMatch);
        score += summaryScore * 2;
        maxFieldScore = Math.max(maxFieldScore, summaryScore);
      }

      // 详细描述搜索
      if (searchFields.includes('description')) {
        const descScore = this.calculateFieldScore(caseStudy.fullDescription, searchTerm, fuzzyMatch);
        score += descScore * 1.5;
        maxFieldScore = Math.max(maxFieldScore, descScore);
      }

      // 客户名称搜索
      if (searchFields.includes('customer')) {
        const customerScore = this.calculateFieldScore(caseStudy.customer.name, searchTerm, fuzzyMatch);
        score += customerScore * 2;
        maxFieldScore = Math.max(maxFieldScore, customerScore);
      }

      // 标签搜索
      if (searchFields.includes('tags')) {
        const tagScore = this.calculateArrayFieldScore(caseStudy.tags, searchTerm, fuzzyMatch);
        score += tagScore * 1.5;
        maxFieldScore = Math.max(maxFieldScore, tagScore);
      }

      // 特性搜索
      if (searchFields.includes('features')) {
        const featureScore = this.calculateArrayFieldScore(caseStudy.features, searchTerm, fuzzyMatch);
        score += featureScore * 1.5;
        maxFieldScore = Math.max(maxFieldScore, featureScore);
      }

      // 解决方案搜索
      if (searchFields.includes('solutions')) {
        const solutionScore = this.calculateArrayFieldScore(caseStudy.solutions, searchTerm, fuzzyMatch);
        score += solutionScore;
        maxFieldScore = Math.max(maxFieldScore, solutionScore);
      }

      // 归一化分数
      const normalizedScore = Math.min(score / searchFields.length, 1);

      if (normalizedScore >= minScore) {
        results.push({ case: caseStudy, score: normalizedScore });
      }
    });

    // 按分数排序
    return results.sort((a, b) => b.score - a.score);
  }

  /**
   * 计算单个字段的匹配分数
   */
  private static calculateFieldScore(
    fieldValue: string,
    searchTerm: string,
    fuzzyMatch: boolean
  ): number {
    const field = fieldValue.toLowerCase();
    
    // 完全匹配
    if (field === searchTerm) return 1;
    
    // 包含匹配
    if (field.includes(searchTerm)) {
      return 0.8 * (searchTerm.length / field.length);
    }
    
    // 模糊匹配
    if (fuzzyMatch) {
      const similarity = this.calculateStringSimilarity(field, searchTerm);
      return similarity > 0.6 ? similarity * 0.6 : 0;
    }
    
    return 0;
  }

  /**
   * 计算数组字段的匹配分数
   */
  private static calculateArrayFieldScore(
    arrayField: string[],
    searchTerm: string,
    fuzzyMatch: boolean
  ): number {
    let maxScore = 0;
    
    arrayField.forEach(item => {
      const score = this.calculateFieldScore(item, searchTerm, fuzzyMatch);
      maxScore = Math.max(maxScore, score);
    });
    
    return maxScore;
  }

  /**
   * 计算字符串相似度
   */
  private static calculateStringSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1;
    
    const editDistance = this.calculateEditDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  /**
   * 计算编辑距离
   */
  private static calculateEditDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1, // deletion
          matrix[j - 1][i] + 1, // insertion
          matrix[j - 1][i - 1] + indicator // substitution
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  /**
   * 生成搜索建议
   */
  static generateSearchSuggestions(
    cases: CaseStudy[],
    query: string,
    limit: number = 5
  ): {
    type: 'case' | 'customer' | 'location' | 'industry' | 'tag';
    id: string;
    text: string;
    description?: string;
    count?: number;
  }[] {
    const suggestions: {
      type: 'case' | 'customer' | 'location' | 'industry' | 'tag';
      id: string;
      text: string;
      description?: string;
      count?: number;
    }[] = [];

    const searchTerm = query.toLowerCase().trim();
    if (!searchTerm || searchTerm.length < 2) return [];

    // 案例标题建议
    cases.forEach(caseStudy => {
      if (caseStudy.title.toLowerCase().includes(searchTerm)) {
        suggestions.push({
          type: 'case',
          id: caseStudy.id,
          text: caseStudy.title,
          description: caseStudy.customer.name,
        });
      }
    });

    // 客户名称建议
    const customerMap = new Map<string, number>();
    cases.forEach(caseStudy => {
      const customerName = caseStudy.customer.name;
      if (customerName.toLowerCase().includes(searchTerm)) {
        customerMap.set(customerName, (customerMap.get(customerName) || 0) + 1);
      }
    });

    customerMap.forEach((count, customer) => {
      suggestions.push({
        type: 'customer',
        id: customer.toLowerCase().replace(/\s+/g, '-'),
        text: customer,
        count,
      });
    });

    // 位置建议
    const locationMap = new Map<string, number>();
    cases.forEach(caseStudy => {
      const location = `${caseStudy.location.city}, ${caseStudy.location.country}`;
      if (location.toLowerCase().includes(searchTerm)) {
        locationMap.set(location, (locationMap.get(location) || 0) + 1);
      }
    });

    locationMap.forEach((count, location) => {
      suggestions.push({
        type: 'location',
        id: location.toLowerCase().replace(/\s+/g, '-'),
        text: location,
        count,
      });
    });

    // 标签建议
    const tagMap = new Map<string, number>();
    cases.forEach(caseStudy => {
      caseStudy.tags.forEach(tag => {
        if (tag.toLowerCase().includes(searchTerm)) {
          tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
        }
      });
    });

    tagMap.forEach((count, tag) => {
      suggestions.push({
        type: 'tag',
        id: tag,
        text: tag,
        count,
      });
    });

    // 按相关性排序并限制数量
    return suggestions
      .sort((a, b) => {
        // 优先显示完全匹配
        const aExact = a.text.toLowerCase() === searchTerm;
        const bExact = b.text.toLowerCase() === searchTerm;
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;
        
        // 然后按类型优先级排序
        const typeOrder = { case: 1, customer: 2, location: 3, industry: 4, tag: 5 };
        const aOrder = typeOrder[a.type];
        const bOrder = typeOrder[b.type];
        if (aOrder !== bOrder) return aOrder - bOrder;
        
        // 最后按计数排序
        return (b.count || 0) - (a.count || 0);
      })
      .slice(0, limit);
  }
}

// 导出所有工具类
export {
  GeoUtils,
  CaseFilterUtils,
  CaseMapUtils,
  CaseSearchUtils,
};