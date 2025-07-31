/**
 * 案例研究数据验证工具
 */
import { z } from 'zod';
import { 
  CaseStudy,
  CaseCreateData,
  CaseUpdateData,
  ProjectType,
  IndustryType,
  CaseStatus,
  GeoLocation,
  CaseCustomer,
  ProjectScale,
  TechnicalSpecs,
  ProjectChallenge,
  ProjectOutcome,
  CaseImage,
  CaseVideo,
  CaseDocument,
  CustomerTestimonial,
  ProjectTimeline,
  RelatedProduct,
  ProjectTeam,
  CaseSEO
} from '@/types/case-study';

// 地理位置验证模式
const geoLocationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  address: z.string().min(1).max(500),
  city: z.string().min(1).max(100),
  state: z.string().max(100).optional(),
  country: z.string().min(1).max(100),
  postalCode: z.string().max(20).optional(),
  timezone: z.string().max(50).optional(),
});

// 客户信息验证模式
const caseCustomerSchema = z.object({
  name: z.string().min(1).max(200),
  logo: z.string().url().optional(),
  website: z.string().url().optional(),
  industry: z.nativeEnum(IndustryType),
  description: z.string().max(1000).optional(),
  size: z.enum(['startup', 'small', 'medium', 'large', 'enterprise']).optional(),
  location: geoLocationSchema,
});

// 项目规模验证模式
const projectScaleSchema = z.object({
  totalScreenArea: z.number().positive(),
  totalPixels: z.number().positive(),
  numberOfScreens: z.number().positive().int(),
  totalInvestment: z.number().positive().optional(),
  currency: z.string().length(3).optional(),
});

// 技术规格验证模式
const technicalSpecsSchema = z.object({
  pixelPitch: z.string().min(1).max(20),
  resolution: z.object({
    width: z.number().positive().int(),
    height: z.number().positive().int(),
  }),
  brightness: z.number().positive(),
  refreshRate: z.number().positive(),
  colorDepth: z.number().positive().int(),
  viewingAngle: z.string().min(1).max(50),
  powerConsumption: z.number().positive(),
  operatingTemperature: z.string().min(1).max(100),
  ipRating: z.string().max(10).optional(),
  cabinetSize: z.object({
    width: z.number().positive(),
    height: z.number().positive(),
    depth: z.number().positive(),
    unit: z.enum(['mm', 'cm', 'm']),
  }),
});

// 项目挑战验证模式
const projectChallengeSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(1000),
  solution: z.string().min(1).max(1000),
  impact: z.string().max(500).optional(),
});

// 项目成果验证模式
const projectOutcomeSchema = z.object({
  id: z.string().min(1),
  metric: z.string().min(1).max(100),
  value: z.string().min(1).max(50),
  description: z.string().max(500).optional(),
  improvement: z.string().max(200).optional(),
});

// 案例图片验证模式
const caseImageSchema = z.object({
  id: z.string().min(1),
  url: z.string().url(),
  alt: z.string().min(1).max(200),
  title: z.string().max(200).optional(),
  caption: z.string().max(500).optional(),
  type: z.enum(['hero', 'before', 'after', 'installation', 'detail', 'gallery']),
  sortOrder: z.number().int().min(0),
  width: z.number().positive().int().optional(),
  height: z.number().positive().int().optional(),
  size: z.number().positive().int().optional(),
});

// 案例视频验证模式
const caseVideoSchema = z.object({
  id: z.string().min(1),
  url: z.string().url(),
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  thumbnail: z.string().url().optional(),
  duration: z.number().positive().int().optional(),
  type: z.enum(['demo', 'installation', 'testimonial', 'overview']),
  sortOrder: z.number().int().min(0),
});

// 案例文档验证模式
const caseDocumentSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(200),
  url: z.string().url(),
  type: z.enum(['case_study', 'technical_spec', 'installation_guide', 'brochure', 'other']),
  size: z.number().positive().int(),
  mimeType: z.string().min(1).max(100),
  language: z.enum(['en', 'zh', 'both']),
  sortOrder: z.number().int().min(0),
  createdAt: z.date(),
});

// 客户证言验证模式
const customerTestimonialSchema = z.object({
  id: z.string().min(1),
  customerName: z.string().min(1).max(100),
  customerTitle: z.string().min(1).max(100),
  customerPhoto: z.string().url().optional(),
  quote: z.string().min(10).max(2000),
  rating: z.number().int().min(1).max(5).optional(),
  date: z.date(),
});

// 项目时间线验证模式
const projectTimelineSchema = z.object({
  phase: z.string().min(1).max(100),
  startDate: z.date(),
  endDate: z.date(),
  description: z.string().min(1).max(1000),
  milestones: z.array(z.string().max(200)).optional(),
}).refine(data => data.endDate >= data.startDate, {
  message: "End date must be after start date",
  path: ["endDate"],
});

// 相关产品验证模式
const relatedProductSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(200),
  model: z.string().min(1).max(100),
  quantity: z.number().positive().int(),
  specifications: z.array(z.string().max(200)).optional(),
});

// 项目团队验证模式
const projectTeamSchema = z.object({
  role: z.string().min(1).max(100),
  name: z.string().min(1).max(100),
  company: z.string().min(1).max(200),
  description: z.string().max(500).optional(),
});

// SEO信息验证模式
const caseSEOSchema = z.object({
  title: z.string().max(60).optional(),
  description: z.string().max(160).optional(),
  keywords: z.array(z.string().max(50)).optional(),
  canonicalUrl: z.string().url().optional(),
  ogTitle: z.string().max(60).optional(),
  ogDescription: z.string().max(160).optional(),
  ogImage: z.string().url().optional(),
  structuredData: z.record(z.any()).optional(),
});

// 案例创建数据验证模式
export const caseCreateDataSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens").optional(),
  subtitle: z.string().max(300).optional(),
  summary: z.string().min(10).max(500),
  fullDescription: z.string().min(50).max(5000),
  projectType: z.nativeEnum(ProjectType),
  industry: z.nativeEnum(IndustryType),
  customer: caseCustomerSchema,
  location: geoLocationSchema,
  projectScale: projectScaleSchema,
  technicalSpecs: technicalSpecsSchema,
  challenges: z.array(projectChallengeSchema).min(1).max(10),
  solutions: z.array(z.string().min(1).max(500)).min(1).max(20),
  outcomes: z.array(projectOutcomeSchema).min(1).max(10),
  timeline: z.array(projectTimelineSchema).min(1).max(20),
  team: z.array(projectTeamSchema).max(20),
  relatedProducts: z.array(relatedProductSchema).max(50),
  tags: z.array(z.string().min(1).max(50)).min(1).max(20),
  features: z.array(z.string().min(1).max(100)).min(1).max(10),
  status: z.nativeEnum(CaseStatus),
  isPublished: z.boolean(),
  isFeatured: z.boolean(),
  isShowcase: z.boolean(),
  projectStartDate: z.date(),
  projectEndDate: z.date(),
  seo: caseSEOSchema.optional(),
  translations: z.record(z.object({
    title: z.string().min(1).max(200),
    subtitle: z.string().max(300).optional(),
    summary: z.string().min(10).max(500),
    fullDescription: z.string().min(50).max(5000),
    solutions: z.array(z.string().min(1).max(500)),
    features: z.array(z.string().min(1).max(100)),
    seo: caseSEOSchema.optional(),
  })).optional(),
}).refine(data => data.projectEndDate >= data.projectStartDate, {
  message: "Project end date must be after start date",
  path: ["projectEndDate"],
});

// 案例更新数据验证模式
export const caseUpdateDataSchema = caseCreateDataSchema.partial().extend({
  id: z.string().min(1),
});

// 完整案例验证模式
export const caseStudySchema = caseCreateDataSchema.extend({
  id: z.string().min(1),
  images: z.array(caseImageSchema),
  videos: z.array(caseVideoSchema),
  documents: z.array(caseDocumentSchema),
  testimonials: z.array(customerTestimonialSchema),
  viewCount: z.number().int().min(0),
  shareCount: z.number().int().min(0),
  downloadCount: z.number().int().min(0),
  createdAt: z.date(),
  updatedAt: z.date(),
  publishedAt: z.date().optional(),
  relatedCaseIds: z.array(z.string()).optional(),
  relatedCases: z.array(z.lazy(() => caseStudySchema)).optional(),
});

// 验证工具类
export class CaseValidationUtils {
  /**
   * 验证案例创建数据
   */
  static validateCaseCreateData(data: unknown): {
    success: boolean;
    data?: CaseCreateData;
    errors?: z.ZodError;
  } {
    try {
      const validatedData = caseCreateDataSchema.parse(data);
      return { success: true, data: validatedData };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { success: false, errors: error };
      }
      throw error;
    }
  }

  /**
   * 验证案例更新数据
   */
  static validateCaseUpdateData(data: unknown): {
    success: boolean;
    data?: CaseUpdateData;
    errors?: z.ZodError;
  } {
    try {
      const validatedData = caseUpdateDataSchema.parse(data);
      return { success: true, data: validatedData };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { success: false, errors: error };
      }
      throw error;
    }
  }

  /**
   * 验证完整案例数据
   */
  static validateCaseStudy(data: unknown): {
    success: boolean;
    data?: CaseStudy;
    errors?: z.ZodError;
  } {
    try {
      const validatedData = caseStudySchema.parse(data);
      return { success: true, data: validatedData };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { success: false, errors: error };
      }
      throw error;
    }
  }

  /**
   * 验证slug的唯一性和格式
   */
  static validateSlug(slug: string, existingSlugs: string[] = []): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // 格式验证
    if (!slug || slug.trim().length === 0) {
      errors.push('Slug is required');
    } else {
      const trimmedSlug = slug.trim();
      
      if (trimmedSlug.length < 3) {
        errors.push('Slug must be at least 3 characters long');
      }
      
      if (trimmedSlug.length > 200) {
        errors.push('Slug must be no more than 200 characters long');
      }
      
      if (!/^[a-z0-9-]+$/.test(trimmedSlug)) {
        errors.push('Slug must contain only lowercase letters, numbers, and hyphens');
      }
      
      if (trimmedSlug.startsWith('-') || trimmedSlug.endsWith('-')) {
        errors.push('Slug cannot start or end with a hyphen');
      }
      
      if (trimmedSlug.includes('--')) {
        errors.push('Slug cannot contain consecutive hyphens');
      }
      
      // 唯一性验证
      if (existingSlugs.includes(trimmedSlug)) {
        errors.push('Slug already exists');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * 生成slug
   */
  static generateSlug(title: string, existingSlugs: string[] = []): string {
    let baseSlug = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // 移除特殊字符
      .replace(/\s+/g, '-') // 空格替换为连字符
      .replace(/-+/g, '-') // 多个连字符合并为一个
      .replace(/^-|-$/g, ''); // 移除开头和结尾的连字符

    // 确保slug不为空
    if (!baseSlug) {
      baseSlug = 'case-study';
    }

    // 检查唯一性
    let slug = baseSlug;
    let counter = 1;
    
    while (existingSlugs.includes(slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }

  /**
   * 验证图片文件
   */
  static validateImageFile(file: File): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (!file) {
      errors.push('File is required');
      return { isValid: false, errors };
    }

    if (!allowedTypes.includes(file.type)) {
      errors.push('File must be a JPEG, PNG, or WebP image');
    }

    if (file.size > maxSize) {
      errors.push('File size must be less than 10MB');
    }

    if (file.size === 0) {
      errors.push('File cannot be empty');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * 验证文档文件
   */
  static validateDocumentFile(file: File): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    const maxSize = 50 * 1024 * 1024; // 50MB
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'application/zip',
      'application/x-zip-compressed',
    ];

    if (!file) {
      errors.push('File is required');
      return { isValid: false, errors };
    }

    if (!allowedTypes.includes(file.type)) {
      errors.push('File type not supported');
    }

    if (file.size > maxSize) {
      errors.push('File size must be less than 50MB');
    }

    if (file.size === 0) {
      errors.push('File cannot be empty');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * 验证视频URL
   */
  static validateVideoUrl(url: string): {
    isValid: boolean;
    errors: string[];
    platform?: 'youtube' | 'vimeo' | 'other';
  } {
    const errors: string[] = [];
    let platform: 'youtube' | 'vimeo' | 'other' = 'other';

    if (!url || url.trim().length === 0) {
      errors.push('Video URL is required');
      return { isValid: false, errors };
    }

    try {
      const urlObj = new URL(url);
      
      // YouTube URL validation
      if (urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be')) {
        platform = 'youtube';
        const videoId = this.extractYouTubeVideoId(url);
        if (!videoId) {
          errors.push('Invalid YouTube URL');
        }
      }
      // Vimeo URL validation
      else if (urlObj.hostname.includes('vimeo.com')) {
        platform = 'vimeo';
        const videoId = this.extractVimeoVideoId(url);
        if (!videoId) {
          errors.push('Invalid Vimeo URL');
        }
      }
      // Other video platforms
      else if (!urlObj.protocol.startsWith('http')) {
        errors.push('URL must use HTTP or HTTPS protocol');
      }
    } catch (error) {
      errors.push('Invalid URL format');
    }

    return {
      isValid: errors.length === 0,
      errors,
      platform,
    };
  }

  /**
   * 提取YouTube视频ID
   */
  private static extractYouTubeVideoId(url: string): string | null {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return null;
  }

  /**
   * 提取Vimeo视频ID
   */
  private static extractVimeoVideoId(url: string): string | null {
    const pattern = /vimeo\.com\/(?:video\/)?(\d+)/;
    const match = url.match(pattern);
    return match && match[1] ? match[1] : null;
  }

  /**
   * 验证地理坐标
   */
  static validateCoordinates(latitude: number, longitude: number): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (typeof latitude !== 'number' || isNaN(latitude)) {
      errors.push('Latitude must be a valid number');
    } else if (latitude < -90 || latitude > 90) {
      errors.push('Latitude must be between -90 and 90 degrees');
    }

    if (typeof longitude !== 'number' || isNaN(longitude)) {
      errors.push('Longitude must be a valid number');
    } else if (longitude < -180 || longitude > 180) {
      errors.push('Longitude must be between -180 and 180 degrees');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * 验证日期范围
   */
  static validateDateRange(startDate: Date, endDate: Date): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!(startDate instanceof Date) || isNaN(startDate.getTime())) {
      errors.push('Start date must be a valid date');
    }

    if (!(endDate instanceof Date) || isNaN(endDate.getTime())) {
      errors.push('End date must be a valid date');
    }

    if (startDate instanceof Date && endDate instanceof Date && 
        !isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
      if (endDate < startDate) {
        errors.push('End date must be after start date');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * 格式化验证错误信息
   */
  static formatValidationErrors(errors: z.ZodError): {
    field: string;
    message: string;
  }[] {
    return errors.errors.map(error => ({
      field: error.path.join('.'),
      message: error.message,
    }));
  }

  /**
   * 检查必填字段
   */
  static checkRequiredFields(data: Partial<CaseCreateData>): {
    isValid: boolean;
    missingFields: string[];
  } {
    const requiredFields = [
      'title',
      'summary',
      'fullDescription',
      'projectType',
      'industry',
      'customer',
      'location',
      'projectScale',
      'technicalSpecs',
      'challenges',
      'solutions',
      'outcomes',
      'timeline',
      'tags',
      'features',
      'projectStartDate',
      'projectEndDate',
    ];

    const missingFields: string[] = [];

    requiredFields.forEach(field => {
      if (!data[field as keyof CaseCreateData]) {
        missingFields.push(field);
      }
    });

    return {
      isValid: missingFields.length === 0,
      missingFields,
    };
  }
}

// 导出验证模式和工具
export {
  geoLocationSchema,
  caseCustomerSchema,
  projectScaleSchema,
  technicalSpecsSchema,
  projectChallengeSchema,
  projectOutcomeSchema,
  caseImageSchema,
  caseVideoSchema,
  caseDocumentSchema,
  customerTestimonialSchema,
  projectTimelineSchema,
  relatedProductSchema,
  projectTeamSchema,
  caseSEOSchema,
  caseStudySchema,
};

export default CaseValidationUtils;