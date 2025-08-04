/**
 * 询盘相关数据类型定义
 */

// 询盘状态枚举
export enum InquiryStatus {
  NEW = 'new',
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'in_progress',
  CONTACTED = 'contacted',
  QUOTED = 'quoted',
  NEGOTIATING = 'negotiating',
  WON = 'won',
  LOST = 'lost',
  CANCELLED = 'cancelled',
  CLOSED = 'closed',
}

// 询盘优先级枚举
export enum InquiryPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

// 询盘来源枚举
export enum InquirySource {
  WEBSITE = 'website',
  EMAIL = 'email',
  PHONE = 'phone',
  TRADE_SHOW = 'trade_show',
  REFERRAL = 'referral',
  SOCIAL_MEDIA = 'social_media',
  ADVERTISEMENT = 'advertisement',
  OTHER = 'other',
}

// 询盘类型枚举
export enum InquiryType {
  PRODUCT_INFO = 'product_info',
  QUOTE_REQUEST = 'quote_request',
  TECHNICAL_SUPPORT = 'technical_support',
  PARTNERSHIP = 'partnership',
  GENERAL = 'general',
}

// 客户类型枚举
export enum CustomerType {
  END_USER = 'end_user',
  INTEGRATOR = 'integrator',
  DISTRIBUTOR = 'distributor',
  RESELLER = 'reseller',
  RENTAL_COMPANY = 'rental_company',
  OTHER = 'other',
}

// 项目预算范围枚举
export enum BudgetRange {
  UNDER_10K = 'under_10k',
  FROM_10K_TO_50K = '10k_to_50k',
  FROM_50K_TO_100K = '50k_to_100k',
  FROM_100K_TO_500K = '100k_to_500k',
  OVER_500K = 'over_500k',
  NOT_SPECIFIED = 'not_specified',
}

// 项目时间线枚举
export enum ProjectTimeline {
  IMMEDIATE = 'immediate',
  WITHIN_1_MONTH = 'within_1_month',
  WITHIN_3_MONTHS = 'within_3_months',
  WITHIN_6_MONTHS = 'within_6_months',
  OVER_6_MONTHS = 'over_6_months',
  NOT_SPECIFIED = 'not_specified',
}

// 联系人信息
export interface ContactInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  jobTitle?: string;
  department?: string;
}

// 公司信息
export interface CompanyInfo {
  name: string;
  website?: string;
  industry?: string;
  size?: string; // 公司规模
  country: string;
  state?: string;
  city?: string;
  address?: string;
  postalCode?: string;
}

// 产品需求信息
export interface ProductRequirement {
  productId?: string;
  productName?: string;
  pixelPitch?: string;
  screenSize?: {
    width: number;
    height: number;
    unit: 'mm' | 'cm' | 'm' | 'inch' | 'ft';
  };
  quantity?: number;
  application?: string;
  installationEnvironment?: 'indoor' | 'outdoor' | 'semi_outdoor';
  viewingDistance?: {
    min: number;
    max: number;
    unit: 'm' | 'ft';
  };
  specialRequirements?: string[];
}

// 项目信息
export interface ProjectInfo {
  name?: string;
  description?: string;
  budget?: {
    range: BudgetRange;
    currency?: string;
    exactAmount?: number;
  };
  timeline?: ProjectTimeline;
  decisionMakers?: string[];
  competitors?: string[];
  previousExperience?: boolean;
}

// 询盘附件
export interface InquiryAttachment {
  id: string;
  name: string;
  url: string;
  size: number;
  mimeType: string;
  uploadedAt: Date;
}

// 询盘跟进记录
export interface InquiryFollowUp {
  id: string;
  inquiryId: string;
  userId: string; // 跟进人员ID
  userName: string;
  type: 'call' | 'email' | 'meeting' | 'quote' | 'demo' | 'other';
  subject: string;
  content: string;
  nextAction?: string;
  nextActionDate?: Date;
  attachments?: InquiryAttachment[];
  createdAt: Date;
}

// 询盘评分
export interface InquiryScore {
  total: number; // 总分 0-100
  factors: {
    budget: number; // 预算匹配度
    timeline: number; // 时间紧迫性
    authority: number; // 决策权
    need: number; // 需求明确度
    fit: number; // 产品匹配度
  };
  lastUpdated: Date;
}

// 主要询盘接口
export interface Inquiry {
  id: string;
  inquiryNumber: string; // 询盘编号，如 INQ-2024-001
  
  // 基本信息
  type: InquiryType;
  source: InquirySource;
  status: InquiryStatus;
  priority: InquiryPriority;
  
  // 联系人和公司信息
  contact: ContactInfo;
  company: CompanyInfo;
  customerType: CustomerType;
  
  // 产品和项目需求
  productRequirements: ProductRequirement[];
  projectInfo?: ProjectInfo;
  
  // 询盘内容
  subject: string;
  message: string;
  attachments?: InquiryAttachment[];
  
  // 分配和跟进
  assignedTo?: string; // 分配给的销售人员ID
  assignedToName?: string;
  followUps: InquiryFollowUp[];
  
  // 评分和标签
  score?: InquiryScore;
  tags: string[];
  
  // 元数据
  ipAddress?: string;
  userAgent?: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  
  // 时间戳
  createdAt: Date;
  updatedAt: Date;
  lastContactedAt?: Date;
  closedAt?: Date;
  
  // 多语言支持
  language: 'en' | 'zh';
  
  // 关联数据
  relatedInquiries?: string[]; // 相关询盘ID
  quotations?: string[]; // 相关报价ID
}

// 询盘筛选参数
export interface InquiryFilters {
  status?: InquiryStatus | InquiryStatus[];
  priority?: InquiryPriority | InquiryPriority[];
  type?: InquiryType | InquiryType[];
  source?: InquirySource | InquirySource[];
  customerType?: CustomerType | CustomerType[];
  assignedTo?: string | string[];
  country?: string | string[];
  industry?: string | string[];
  budgetRange?: BudgetRange | BudgetRange[];
  timeline?: ProjectTimeline | ProjectTimeline[];
  tags?: string | string[];
  dateRange?: {
    start: Date;
    end: Date;
    field: 'createdAt' | 'updatedAt' | 'lastContactedAt' | 'closedAt';
  };
  search?: string; // 搜索关键词
  hasAttachments?: boolean;
  isOverdue?: boolean; // 是否逾期跟进
  scoreRange?: {
    min: number;
    max: number;
  };
}

// 询盘排序选项
export enum InquirySortBy {
  CREATED_ASC = 'created_asc',
  CREATED_DESC = 'created_desc',
  UPDATED_ASC = 'updated_asc',
  UPDATED_DESC = 'updated_desc',
  PRIORITY_ASC = 'priority_asc',
  PRIORITY_DESC = 'priority_desc',
  SCORE_ASC = 'score_asc',
  SCORE_DESC = 'score_desc',
  COMPANY_NAME_ASC = 'company_name_asc',
  COMPANY_NAME_DESC = 'company_name_desc',
  LAST_CONTACTED_ASC = 'last_contacted_asc',
  LAST_CONTACTED_DESC = 'last_contacted_desc',
}

// 询盘查询参数
export interface InquiryQuery {
  filters?: InquiryFilters;
  sortBy?: InquirySortBy;
  page?: number;
  limit?: number;
  include?: ('followUps' | 'attachments' | 'score' | 'relatedInquiries')[];
}

// 询盘查询结果
export interface InquiryQueryResult {
  inquiries: Inquiry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  filters?: InquiryFilters;
  sortBy?: InquirySortBy;
}

// 询盘创建数据
export interface InquiryCreateData {
  type: InquiryType;
  source: InquirySource;
  contact: ContactInfo;
  company: CompanyInfo;
  customerType: CustomerType;
  productRequirements: Omit<ProductRequirement, 'id'>[];
  projectInfo?: Omit<ProjectInfo, 'id'>;
  subject: string;
  message: string;
  language: 'en' | 'zh';
  tags?: string[];
  
  // 可选的跟踪信息
  ipAddress?: string;
  userAgent?: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

// 询盘更新数据
export interface InquiryUpdateData {
  id: string;
  status?: InquiryStatus;
  priority?: InquiryPriority;
  assignedTo?: string;
  tags?: string[];
  contact?: Partial<ContactInfo>;
  company?: Partial<CompanyInfo>;
  productRequirements?: ProductRequirement[];
  projectInfo?: ProjectInfo;
  subject?: string;
  message?: string;
}

// 询盘统计信息
export interface InquiryStats {
  total: number;
  byStatus: {
    status: InquiryStatus;
    count: number;
    percentage: number;
  }[];
  byPriority: {
    priority: InquiryPriority;
    count: number;
  }[];
  bySource: {
    source: InquirySource;
    count: number;
  }[];
  byCustomerType: {
    customerType: CustomerType;
    count: number;
  }[];
  byCountry: {
    country: string;
    count: number;
  }[];
  conversionRate: {
    totalInquiries: number;
    wonInquiries: number;
    rate: number;
  };
  averageResponseTime: number; // 平均响应时间（小时）
  averageScore: number;
  trendsData: {
    date: string;
    newInquiries: number;
    closedInquiries: number;
    conversionRate: number;
  }[];
}

// 询盘批量操作
export interface InquiryBulkOperation {
  action: 'assign' | 'update_status' | 'update_priority' | 'add_tags' | 'remove_tags' | 'delete';
  inquiryIds: string[];
  data?: {
    assignedTo?: string;
    status?: InquiryStatus;
    priority?: InquiryPriority;
    tags?: string[];
  };
}

// 询盘导出配置
export interface InquiryExportConfig {
  format: 'csv' | 'excel' | 'pdf';
  filters?: InquiryFilters;
  fields: string[];
  includeFollowUps?: boolean;
  includeAttachments?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

// 询盘模板
export interface InquiryTemplate {
  id: string;
  name: string;
  type: InquiryType;
  subject: string;
  fields: {
    name: string;
    type: 'text' | 'textarea' | 'select' | 'checkbox' | 'number' | 'email' | 'phone';
    label: string;
    required: boolean;
    options?: string[];
    placeholder?: string;
    validation?: string;
  }[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// 自动回复配置
export interface AutoReplyConfig {
  id: string;
  name: string;
  isActive: boolean;
  triggers: {
    inquiryType?: InquiryType[];
    source?: InquirySource[];
    language?: ('en' | 'zh')[];
    keywords?: string[];
  };
  template: {
    subject: string;
    content: string;
    attachments?: string[];
  };
  delay: number; // 延迟发送时间（分钟）
  createdAt: Date;
  updatedAt: Date;
}

// 询盘通知配置
export interface InquiryNotificationConfig {
  id: string;
  name: string;
  isActive: boolean;
  triggers: {
    events: ('new_inquiry' | 'status_change' | 'assignment' | 'overdue')[];
    conditions?: {
      priority?: InquiryPriority[];
      source?: InquirySource[];
      customerType?: CustomerType[];
    };
  };
  recipients: {
    type: 'user' | 'role' | 'email';
    value: string;
  }[];
  template: {
    subject: string;
    content: string;
  };
  channels: ('email' | 'sms' | 'webhook')[];
  createdAt: Date;
  updatedAt: Date;
}

// API响应类型
export interface InquiryApiResponse<T = any> {
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

export default Inquiry;