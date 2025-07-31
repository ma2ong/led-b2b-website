/**
 * 案例研究相关数据类型定义
 */

// 案例状态枚举
export enum CaseStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
  FEATURED = 'featured',
}

// 项目类型枚举
export enum ProjectType {
  INDOOR_FIXED = 'indoor_fixed',
  OUTDOOR_ADVERTISING = 'outdoor_advertising',
  RENTAL_EVENT = 'rental_event',
  BROADCAST_STUDIO = 'broadcast_studio',
  RETAIL_DISPLAY = 'retail_display',
  SPORTS_VENUE = 'sports_venue',
  TRANSPORTATION = 'transportation',
  CORPORATE = 'corporate',
  EDUCATION = 'education',
  HEALTHCARE = 'healthcare',
  GOVERNMENT = 'government',
  ENTERTAINMENT = 'entertainment',
  OTHER = 'other',
}

// 行业类型枚举
export enum IndustryType {
  ADVERTISING = 'advertising',
  RETAIL = 'retail',
  SPORTS = 'sports',
  ENTERTAINMENT = 'entertainment',
  EDUCATION = 'education',
  HEALTHCARE = 'healthcare',
  GOVERNMENT = 'government',
  TRANSPORTATION = 'transportation',
  HOSPITALITY = 'hospitality',
  CORPORATE = 'corporate',
  BROADCAST = 'broadcast',
  EVENTS = 'events',
  RELIGIOUS = 'religious',
  OTHER = 'other',
}

// 地理位置信息
export interface GeoLocation {
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  state?: string;
  country: string;
  postalCode?: string;
  timezone?: string;
}

// 客户信息
export interface CaseCustomer {
  name: string;
  logo?: string;
  website?: string;
  industry: IndustryType;
  description?: string;
  size?: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  location: GeoLocation;
}

// 项目规模信息
export interface ProjectScale {
  totalScreenArea: number; // 总屏幕面积（平方米）
  totalPixels: number; // 总像素数
  numberOfScreens: number; // 屏幕数量
  totalInvestment?: number; // 总投资金额
  currency?: string; // 货币单位
}

// 技术规格
export interface TechnicalSpecs {
  pixelPitch: string;
  resolution: {
    width: number;
    height: number;
  };
  brightness: number; // nits
  refreshRate: number; // Hz
  colorDepth: number; // bit
  viewingAngle: string;
  powerConsumption: number; // W/m²
  operatingTemperature: string;
  ipRating?: string;
  cabinetSize: {
    width: number;
    height: number;
    depth: number;
    unit: 'mm' | 'cm' | 'm';
  };
}

// 项目挑战
export interface ProjectChallenge {
  id: string;
  title: string;
  description: string;
  solution: string;
  impact?: string;
}

// 项目成果
export interface ProjectOutcome {
  id: string;
  metric: string;
  value: string;
  description?: string;
  improvement?: string; // 改善百分比或描述
}

// 案例图片
export interface CaseImage {
  id: string;
  url: string;
  alt: string;
  title?: string;
  caption?: string;
  type: 'hero' | 'before' | 'after' | 'installation' | 'detail' | 'gallery';
  sortOrder: number;
  width?: number;
  height?: number;
  size?: number;
}

// 案例视频
export interface CaseVideo {
  id: string;
  url: string;
  title: string;
  description?: string;
  thumbnail?: string;
  duration?: number; // 秒
  type: 'demo' | 'installation' | 'testimonial' | 'overview';
  sortOrder: number;
}

// 案例文档
export interface CaseDocument {
  id: string;
  name: string;
  url: string;
  type: 'case_study' | 'technical_spec' | 'installation_guide' | 'brochure' | 'other';
  size: number;
  mimeType: string;
  language: 'en' | 'zh' | 'both';
  sortOrder: number;
  createdAt: Date;
}

// 客户证言
export interface CustomerTestimonial {
  id: string;
  customerName: string;
  customerTitle: string;
  customerPhoto?: string;
  quote: string;
  rating?: number; // 1-5 星级评分
  date: Date;
}

// 项目时间线
export interface ProjectTimeline {
  phase: string;
  startDate: Date;
  endDate: Date;
  description: string;
  milestones?: string[];
}

// 相关产品
export interface RelatedProduct {
  id: string;
  name: string;
  model: string;
  quantity: number;
  specifications?: string[];
}

// 项目团队
export interface ProjectTeam {
  role: string;
  name: string;
  company: string;
  description?: string;
}

// SEO信息
export interface CaseSEO {
  title?: string;
  description?: string;
  keywords?: string[];
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  structuredData?: Record<string, any>;
}

// 主要案例研究接口
export interface CaseStudy {
  id: string;
  title: string;
  slug: string;
  subtitle?: string;
  summary: string; // 简短摘要
  fullDescription: string; // 详细描述
  
  // 分类和状态
  projectType: ProjectType;
  industry: IndustryType;
  status: CaseStatus;
  
  // 客户和位置信息
  customer: CaseCustomer;
  location: GeoLocation;
  
  // 项目信息
  projectScale: ProjectScale;
  technicalSpecs: TechnicalSpecs;
  
  // 项目详情
  challenges: ProjectChallenge[];
  solutions: string[];
  outcomes: ProjectOutcome[];
  
  // 媒体资源
  images: CaseImage[];
  videos: CaseVideo[];
  documents: CaseDocument[];
  
  // 客户反馈
  testimonials: CustomerTestimonial[];
  
  // 项目管理
  timeline: ProjectTimeline[];
  team: ProjectTeam[];
  
  // 相关产品
  relatedProducts: RelatedProduct[];
  
  // 标签和分类
  tags: string[];
  features: string[]; // 突出特性
  
  // 可见性和推荐
  isPublished: boolean;
  isFeatured: boolean;
  isShowcase: boolean; // 是否为展示案例
  
  // SEO
  seo?: CaseSEO;
  
  // 统计信息
  viewCount: number;
  shareCount: number;
  downloadCount: number;
  
  // 时间戳
  projectStartDate: Date;
  projectEndDate: Date;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  
  // 多语言支持
  translations?: {
    [locale: string]: {
      title: string;
      subtitle?: string;
      summary: string;
      fullDescription: string;
      solutions: string[];
      features: string[];
      seo?: CaseSEO;
    };
  };
  
  // 关联案例
  relatedCaseIds?: string[];
  relatedCases?: CaseStudy[];
}

// 案例筛选参数
export interface CaseFilters {
  projectType?: ProjectType | ProjectType[];
  industry?: IndustryType | IndustryType[];
  status?: CaseStatus | CaseStatus[];
  country?: string | string[];
  region?: string | string[];
  city?: string | string[];
  tags?: string | string[];
  features?: string | string[];
  isFeatured?: boolean;
  isShowcase?: boolean;
  projectScale?: {
    minArea?: number;
    maxArea?: number;
    minInvestment?: number;
    maxInvestment?: number;
  };
  dateRange?: {
    start: Date;
    end: Date;
    field: 'projectStartDate' | 'projectEndDate' | 'createdAt' | 'publishedAt';
  };
  search?: string; // 搜索关键词
  hasVideo?: boolean;
  hasTestimonial?: boolean;
  minRating?: number;
}

// 案例排序选项
export enum CaseSortBy {
  TITLE_ASC = 'title_asc',
  TITLE_DESC = 'title_desc',
  PROJECT_DATE_ASC = 'project_date_asc',
  PROJECT_DATE_DESC = 'project_date_desc',
  CREATED_ASC = 'created_asc',
  CREATED_DESC = 'created_desc',
  UPDATED_ASC = 'updated_asc',
  UPDATED_DESC = 'updated_desc',
  VIEW_COUNT_ASC = 'view_count_asc',
  VIEW_COUNT_DESC = 'view_count_desc',
  INVESTMENT_ASC = 'investment_asc',
  INVESTMENT_DESC = 'investment_desc',
  AREA_ASC = 'area_asc',
  AREA_DESC = 'area_desc',
  FEATURED = 'featured',
  SHOWCASE = 'showcase',
}

// 案例查询参数
export interface CaseQuery {
  filters?: CaseFilters;
  sortBy?: CaseSortBy;
  page?: number;
  limit?: number;
  include?: ('customer' | 'images' | 'videos' | 'testimonials' | 'relatedProducts' | 'relatedCases')[];
}

// 案例查询结果
export interface CaseQueryResult {
  cases: CaseStudy[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  filters?: CaseFilters;
  sortBy?: CaseSortBy;
}

// 案例创建数据
export interface CaseCreateData {
  title: string;
  slug?: string;
  subtitle?: string;
  summary: string;
  fullDescription: string;
  projectType: ProjectType;
  industry: IndustryType;
  customer: Omit<CaseCustomer, 'id'>;
  location: GeoLocation;
  projectScale: ProjectScale;
  technicalSpecs: TechnicalSpecs;
  challenges: Omit<ProjectChallenge, 'id'>[];
  solutions: string[];
  outcomes: Omit<ProjectOutcome, 'id'>[];
  timeline: ProjectTimeline[];
  team: ProjectTeam[];
  relatedProducts: RelatedProduct[];
  tags: string[];
  features: string[];
  status: CaseStatus;
  isPublished: boolean;
  isFeatured: boolean;
  isShowcase: boolean;
  projectStartDate: Date;
  projectEndDate: Date;
  seo?: CaseSEO;
  translations?: CaseStudy['translations'];
}

// 案例更新数据
export interface CaseUpdateData extends Partial<CaseCreateData> {
  id: string;
}

// 案例统计信息
export interface CaseStats {
  total: number;
  published: number;
  featured: number;
  showcase: number;
  byProjectType: {
    projectType: ProjectType;
    count: number;
  }[];
  byIndustry: {
    industry: IndustryType;
    count: number;
  }[];
  byCountry: {
    country: string;
    count: number;
  }[];
  byYear: {
    year: number;
    count: number;
  }[];
  totalInvestment: {
    amount: number;
    currency: string;
  }[];
  totalArea: number;
  averageProjectDuration: number; // 天数
  topTags: {
    tag: string;
    count: number;
  }[];
  viewStats: {
    totalViews: number;
    averageViews: number;
    topViewed: {
      id: string;
      title: string;
      views: number;
    }[];
  };
}

// 地图数据
export interface CaseMapData {
  id: string;
  title: string;
  customer: string;
  location: GeoLocation;
  projectType: ProjectType;
  industry: IndustryType;
  projectScale: {
    totalScreenArea: number;
    totalInvestment?: number;
    currency?: string;
  };
  images: {
    thumbnail: string;
    hero: string;
  };
  isFeatured: boolean;
  isShowcase: boolean;
}

// 案例比较数据
export interface CaseComparison {
  cases: CaseStudy[];
  comparison: {
    category: string;
    items: {
      name: string;
      values: {
        caseId: string;
        value: string;
        unit?: string;
      }[];
    }[];
  }[];
}

// 案例搜索建议
export interface CaseSearchSuggestion {
  type: 'case' | 'customer' | 'location' | 'industry' | 'tag';
  id: string;
  text: string;
  description?: string;
  image?: string;
  count?: number;
}

// API响应类型
export interface CaseApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    timestamp: string;
    requestId: string;
    version: string;
  };
}

// 案例批量操作
export interface CaseBulkOperation {
  action: 'publish' | 'unpublish' | 'feature' | 'unfeature' | 'archive' | 'delete' | 'update_tags';
  caseIds: string[];
  data?: {
    status?: CaseStatus;
    isFeatured?: boolean;
    isShowcase?: boolean;
    tags?: string[];
  };
}

// 案例导出配置
export interface CaseExportConfig {
  format: 'csv' | 'excel' | 'pdf' | 'json';
  filters?: CaseFilters;
  fields: string[];
  includeImages?: boolean;
  includeTestimonials?: boolean;
  includeTimeline?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

// 案例模板
export interface CaseTemplate {
  id: string;
  name: string;
  description: string;
  projectType: ProjectType;
  industry: IndustryType;
  sections: {
    name: string;
    fields: {
      name: string;
      type: 'text' | 'textarea' | 'number' | 'date' | 'select' | 'multiselect' | 'image' | 'file';
      label: string;
      required: boolean;
      options?: string[];
      placeholder?: string;
      validation?: string;
    }[];
  }[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export default CaseStudy;