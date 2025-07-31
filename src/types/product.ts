/**
 * 产品相关数据类型定义
 */

// 产品分类
export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
  children?: ProductCategory[];
  sortOrder: number;
  isActive: boolean;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: Date;
  updatedAt: Date;
}

// 产品规格属性
export interface ProductSpecification {
  id: string;
  name: string;
  value: string;
  unit?: string;
  category: 'technical' | 'physical' | 'performance' | 'environmental' | 'other';
  sortOrder: number;
  isHighlight: boolean; // 是否为重点规格
}

// 产品图片
export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  title?: string;
  sortOrder: number;
  isMain: boolean; // 是否为主图
  width?: number;
  height?: number;
  size?: number; // 文件大小（字节）
}

// 产品文档
export interface ProductDocument {
  id: string;
  name: string;
  url: string;
  type: 'datasheet' | 'manual' | 'certificate' | 'brochure' | 'other';
  size: number; // 文件大小（字节）
  mimeType: string;
  language: 'en' | 'zh' | 'both';
  sortOrder: number;
  createdAt: Date;
}

// 产品应用场景
export interface ProductApplication {
  id: string;
  name: string;
  description: string;
  image?: string;
  examples?: string[];
}

// 产品价格信息
export interface ProductPricing {
  id: string;
  currency: 'USD' | 'CNY' | 'EUR';
  basePrice?: number; // 基础价格
  minQuantity: number; // 最小起订量
  maxQuantity?: number; // 最大数量
  unitPrice: number; // 单价
  discountTiers?: {
    minQuantity: number;
    maxQuantity?: number;
    discountPercent: number;
    unitPrice: number;
  }[];
  isNegotiable: boolean; // 是否可议价
  validFrom: Date;
  validTo?: Date;
}

// 产品库存信息
export interface ProductInventory {
  id: string;
  quantity: number;
  reservedQuantity: number; // 预留数量
  availableQuantity: number; // 可用数量
  reorderLevel: number; // 补货点
  maxStock: number; // 最大库存
  location?: string; // 仓库位置
  lastUpdated: Date;
}

// 产品SEO信息
export interface ProductSEO {
  title?: string;
  description?: string;
  keywords?: string[];
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  structuredData?: Record<string, any>;
}

// 产品状态枚举
export enum ProductStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DISCONTINUED = 'discontinued',
  OUT_OF_STOCK = 'out_of_stock',
}

// 产品类型枚举
export enum ProductType {
  INDOOR = 'indoor',
  OUTDOOR = 'outdoor',
  RENTAL = 'rental',
  TRANSPARENT = 'transparent',
  FLEXIBLE = 'flexible',
  INTERACTIVE = 'interactive',
}

// 像素间距枚举
export enum PixelPitch {
  P0_9 = 'P0.9',
  P1_25 = 'P1.25',
  P1_56 = 'P1.56',
  P1_86 = 'P1.86',
  P2 = 'P2',
  P2_5 = 'P2.5',
  P3 = 'P3',
  P4 = 'P4',
  P5 = 'P5',
  P6 = 'P6',
  P8 = 'P8',
  P10 = 'P10',
}

// 主要产品接口
export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string; // 产品编号
  shortDescription: string;
  fullDescription: string;
  
  // 分类和类型
  categoryId: string;
  category?: ProductCategory;
  type: ProductType;
  pixelPitch: PixelPitch;
  
  // 媒体资源
  images: ProductImage[];
  documents: ProductDocument[];
  videoUrl?: string;
  
  // 技术规格
  specifications: ProductSpecification[];
  
  // 应用场景
  applications: ProductApplication[];
  
  // 价格和库存
  pricing?: ProductPricing[];
  inventory?: ProductInventory;
  
  // 特性标签
  features: string[];
  tags: string[];
  
  // 状态和可见性
  status: ProductStatus;
  isActive: boolean;
  isFeatured: boolean; // 是否为推荐产品
  isNew: boolean; // 是否为新品
  
  // SEO
  seo?: ProductSEO;
  
  // 元数据
  weight?: number; // 重量（kg）
  dimensions?: {
    width: number;
    height: number;
    depth: number;
    unit: 'mm' | 'cm' | 'm';
  };
  
  // 认证信息
  certifications?: string[];
  warranty?: {
    period: number;
    unit: 'months' | 'years';
    description?: string;
  };
  
  // 时间戳
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  
  // 关联产品
  relatedProductIds?: string[];
  relatedProducts?: Product[];
  
  // 多语言支持
  translations?: {
    [locale: string]: {
      name: string;
      shortDescription: string;
      fullDescription: string;
      features: string[];
      seo?: ProductSEO;
    };
  };
}

// 产品筛选参数
export interface ProductFilters {
  categoryId?: string;
  type?: ProductType | ProductType[];
  pixelPitch?: PixelPitch | PixelPitch[];
  priceRange?: {
    min?: number;
    max?: number;
    currency?: string;
  };
  features?: string[];
  tags?: string[];
  applications?: string[];
  status?: ProductStatus | ProductStatus[];
  isActive?: boolean;
  isFeatured?: boolean;
  isNew?: boolean;
  search?: string; // 搜索关键词
  inStock?: boolean;
}

// 产品排序选项
export enum ProductSortBy {
  NAME_ASC = 'name_asc',
  NAME_DESC = 'name_desc',
  PRICE_ASC = 'price_asc',
  PRICE_DESC = 'price_desc',
  CREATED_ASC = 'created_asc',
  CREATED_DESC = 'created_desc',
  UPDATED_ASC = 'updated_asc',
  UPDATED_DESC = 'updated_desc',
  POPULARITY = 'popularity',
  FEATURED = 'featured',
}

// 产品查询参数
export interface ProductQuery {
  filters?: ProductFilters;
  sortBy?: ProductSortBy;
  page?: number;
  limit?: number;
  include?: ('category' | 'images' | 'specifications' | 'pricing' | 'inventory' | 'relatedProducts')[];
}

// 产品查询结果
export interface ProductQueryResult {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  filters?: ProductFilters;
  sortBy?: ProductSortBy;
}

// 产品创建/更新数据
export interface ProductCreateData {
  name: string;
  slug?: string;
  sku: string;
  shortDescription: string;
  fullDescription: string;
  categoryId: string;
  type: ProductType;
  pixelPitch: PixelPitch;
  specifications: Omit<ProductSpecification, 'id'>[];
  applications: Omit<ProductApplication, 'id'>[];
  features: string[];
  tags: string[];
  status: ProductStatus;
  isActive: boolean;
  isFeatured: boolean;
  isNew: boolean;
  weight?: number;
  dimensions?: Product['dimensions'];
  certifications?: string[];
  warranty?: Product['warranty'];
  seo?: ProductSEO;
  translations?: Product['translations'];
}

export interface ProductUpdateData extends Partial<ProductCreateData> {
  id: string;
}

// 产品批量操作
export interface ProductBulkOperation {
  action: 'activate' | 'deactivate' | 'delete' | 'update_category' | 'update_status';
  productIds: string[];
  data?: {
    categoryId?: string;
    status?: ProductStatus;
    isActive?: boolean;
    isFeatured?: boolean;
    tags?: string[];
  };
}

// 产品统计信息
export interface ProductStats {
  total: number;
  active: number;
  inactive: number;
  featured: number;
  new: number;
  outOfStock: number;
  byCategory: {
    categoryId: string;
    categoryName: string;
    count: number;
  }[];
  byType: {
    type: ProductType;
    count: number;
  }[];
  byStatus: {
    status: ProductStatus;
    count: number;
  }[];
}

// 产品比较数据
export interface ProductComparison {
  products: Product[];
  specifications: {
    name: string;
    category: string;
    values: {
      productId: string;
      value: string;
      unit?: string;
    }[];
  }[];
}

// API响应类型
export interface ProductApiResponse<T = any> {
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

// 产品搜索建议
export interface ProductSearchSuggestion {
  type: 'product' | 'category' | 'feature' | 'application';
  id: string;
  text: string;
  description?: string;
  image?: string;
  count?: number; // 相关产品数量
}

export default Product;