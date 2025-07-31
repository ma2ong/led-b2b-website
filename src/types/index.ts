// 基础类型定义

export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// 产品相关类型
export enum ProductCategory {
  FINE_PITCH = 'fine-pitch',
  INDOOR = 'indoor',
  OUTDOOR = 'outdoor',
  TRANSPARENT = 'transparent',
  CREATIVE = 'creative',
  RENTAL = 'rental',
}

export interface ProductSpecifications {
  pixelPitch: string;
  brightness: string;
  refreshRate: string;
  colorTemperature: string;
  viewingAngle: string;
  ipRating: string;
  lifespan: string;
  powerConsumption: string;
  resolution: string;
  cabinetSize: string;
  weight: string;
}

export interface ProductImages {
  main: string;
  gallery: string[];
  technical: string[];
}

export interface ProductDocuments {
  datasheet: string;
  manual: string;
  certificate: string[];
}

export interface ProductPricing {
  currency: string;
  priceRange: string;
  moq: number;
}

export interface Product extends BaseEntity {
  name: string;
  category: ProductCategory;
  subcategory: string;
  specifications: ProductSpecifications;
  applications: string[];
  images: ProductImages;
  videos: string[];
  documents: ProductDocuments;
  pricing: ProductPricing;
  availability: boolean;
  featured: boolean;
}

// 询盘相关类型
export enum InquiryStatus {
  NEW = 'new',
  IN_PROGRESS = 'in_progress',
  QUOTED = 'quoted',
  NEGOTIATING = 'negotiating',
  CLOSED_WON = 'closed_won',
  CLOSED_LOST = 'closed_lost',
}

export interface InquiryProjectInfo {
  type: string;
  displaySize: string;
  pixelPitch: string;
  budget: string;
  timeline: string;
}

export interface InquiryTechnicalRequirements {
  brightness: string;
  installation: string;
  environment: string;
  specialRequirements: string;
}

export interface InquiryContactDetails {
  name: string;
  email: string;
  phone: string;
  company: string;
  position: string;
  country: string;
}

export interface Inquiry extends BaseEntity {
  inquiryNumber: string;
  status: InquiryStatus;
  projectInfo: InquiryProjectInfo;
  technicalRequirements: InquiryTechnicalRequirements;
  contactDetails: InquiryContactDetails;
  products: string[]; // Product IDs
  attachments: string[];
  notes: string;
  assignedTo: string; // Sales rep ID
  followUpDate: Date;
}

// 案例研究相关类型
export interface CaseClient {
  name: string;
  industry: string;
  country: string;
  logo?: string;
}

export interface CaseProject {
  description: string;
  challenge: string;
  solution: string;
  results: string;
  timeline: string;
  budget?: string;
}

export interface CaseImages {
  before: string[];
  after: string[];
  installation: string[];
}

export interface CaseTestimonial {
  quote: string;
  author: string;
  position: string;
}

export interface CaseLocation {
  country: string;
  city: string;
  coordinates: [number, number];
}

export interface CaseStudy extends BaseEntity {
  title: string;
  client: CaseClient;
  project: CaseProject;
  products: string[]; // Product IDs
  images: CaseImages;
  video?: string;
  testimonial?: CaseTestimonial;
  location: CaseLocation;
  featured: boolean;
  published: boolean;
}

// API响应类型
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
  path: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// 表单相关类型
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'select' | 'textarea' | 'file';
  required: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  validation?: {
    pattern?: RegExp;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
  };
}

// 导航相关类型
export interface NavigationItem {
  label: string;
  href: string;
  children?: NavigationItem[];
  icon?: string;
}

// 语言相关类型
export type Locale = 'en' | 'zh';

export interface LocalizedContent {
  en: string;
  zh: string;
}

// SEO相关类型
export interface SEOData {
  title: string;
  description: string;
  keywords: string[];
  ogImage?: string;
  canonicalUrl?: string;
  structuredData?: Record<string, any>;
}

// 组件Props类型
export interface ComponentProps {
  className?: string;
  children?: React.ReactNode;
}

// 错误类型
export interface AppError {
  code: string;
  message: string;
  statusCode: number;
  details?: any;
}