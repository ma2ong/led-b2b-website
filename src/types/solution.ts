/**
 * 解决方案类型定义
 */

export interface Solution {
  id: string;
  title: string;
  slug: string;
  description: string;
  industry: SolutionIndustry;
  category: SolutionCategory;
  heroImage: string;
  gallery: SolutionImage[];
  features: string[];
  benefits: string[];
  applications: string[];
  technicalSpecs: TechnicalSpec[];
  recommendedProducts: string[]; // Product IDs
  caseStudies: string[]; // Case study IDs
  tags: string[];
  isActive: boolean;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SolutionImage {
  id: string;
  url: string;
  alt: string;
  caption?: string;
  isMain: boolean;
  sortOrder: number;
}

export interface TechnicalSpec {
  id: string;
  category: string;
  name: string;
  value: string;
  unit?: string;
  description?: string;
  isHighlight: boolean;
  sortOrder: number;
}

export enum SolutionIndustry {
  RETAIL = 'retail',
  HOSPITALITY = 'hospitality',
  TRANSPORTATION = 'transportation',
  EDUCATION = 'education',
  HEALTHCARE = 'healthcare',
  ENTERTAINMENT = 'entertainment',
  CORPORATE = 'corporate',
  GOVERNMENT = 'government',
  SPORTS = 'sports',
  ADVERTISING = 'advertising',
  BROADCASTING = 'broadcasting',
  EVENTS = 'events',
}

export enum SolutionCategory {
  INDOOR_FIXED = 'indoor-fixed',
  OUTDOOR_ADVERTISING = 'outdoor-advertising',
  RENTAL_STAGING = 'rental-staging',
  FINE_PITCH = 'fine-pitch',
  TRANSPARENT = 'transparent',
  FLEXIBLE = 'flexible',
  INTERACTIVE = 'interactive',
  CREATIVE = 'creative',
}

export interface SolutionQuery {
  page?: number;
  limit?: number;
  industry?: SolutionIndustry | SolutionIndustry[];
  category?: SolutionCategory | SolutionCategory[];
  featured?: boolean;
  search?: string;
  sortBy?: 'created_desc' | 'created_asc' | 'title_asc' | 'title_desc' | 'featured';
}

export interface SolutionQueryResult {
  solutions: Solution[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  filters?: {
    industry?: SolutionIndustry | SolutionIndustry[];
    category?: SolutionCategory | SolutionCategory[];
    featured?: boolean;
    search?: string;
  };
  sortBy?: string;
}

export interface SolutionCreateData {
  title: string;
  description: string;
  industry: SolutionIndustry;
  category: SolutionCategory;
  heroImage: string;
  gallery?: Omit<SolutionImage, 'id'>[];
  features: string[];
  benefits: string[];
  applications: string[];
  technicalSpecs?: Omit<TechnicalSpec, 'id'>[];
  recommendedProducts?: string[];
  caseStudies?: string[];
  tags?: string[];
  isFeatured?: boolean;
}

export interface SolutionUpdateData extends Partial<SolutionCreateData> {
  isActive?: boolean;
}