/**
 * 产品API接口
 */
import { 
  Product, 
  ProductCreateData, 
  ProductUpdateData,
  ProductQuery,
  ProductQueryResult,
  ProductFilters,
  ProductSortBy,
  ProductBulkOperation,
  ProductStats,
  ProductComparison,
  ProductApiResponse,
  ProductSearchSuggestion,
  ProductCategory
} from '@/types/product';
import { 
  validateProductCreateData, 
  validateProductUpdateData,
  validateProductQuery,
  validateBulkOperation 
} from '@/lib/product-validation';

// API基础配置
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
const PRODUCTS_ENDPOINT = `${API_BASE_URL}/products`;

// HTTP客户端配置
const defaultHeaders = {
  'Content-Type': 'application/json',
};

// 错误处理
class ProductApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ProductApiError';
  }
}

// HTTP请求工具
const apiRequest = async <T>(
  url: string,
  options: RequestInit = {}
): Promise<ProductApiResponse<T>> => {
  try {
    const response = await fetch(url, {
      headers: { ...defaultHeaders, ...options.headers },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new ProductApiError(
        data.error?.message || 'API request failed',
        response.status,
        data.error?.code || 'API_ERROR',
        data.error?.details
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ProductApiError) {
      throw error;
    }
    throw new ProductApiError(
      'Network error occurred',
      0,
      'NETWORK_ERROR',
      error
    );
  }
};

// 产品API类
export class ProductApi {
  // 获取产品列表
  static async getProducts(query: ProductQuery = {}): Promise<ProductQueryResult> {
    // 验证查询参数
    const validationErrors = validateProductQuery(query);
    if (Object.keys(validationErrors).length > 0) {
      throw new ProductApiError(
        'Invalid query parameters',
        400,
        'VALIDATION_ERROR',
        validationErrors
      );
    }

    const searchParams = new URLSearchParams();
    
    // 构建查询参数
    if (query.filters) {
      Object.entries(query.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => searchParams.append(`filters[${key}]`, v.toString()));
          } else {
            searchParams.set(`filters[${key}]`, value.toString());
          }
        }
      });
    }

    if (query.sortBy) searchParams.set('sortBy', query.sortBy);
    if (query.page) searchParams.set('page', query.page.toString());
    if (query.limit) searchParams.set('limit', query.limit.toString());
    if (query.include) {
      query.include.forEach(inc => searchParams.append('include', inc));
    }

    const url = `${PRODUCTS_ENDPOINT}?${searchParams.toString()}`;
    const response = await apiRequest<ProductQueryResult>(url);
    
    return response.data!;
  }

  // 获取单个产品
  static async getProduct(
    id: string, 
    include?: ProductQuery['include']
  ): Promise<Product> {
    if (!id) {
      throw new ProductApiError('Product ID is required', 400, 'MISSING_ID');
    }

    const searchParams = new URLSearchParams();
    if (include) {
      include.forEach(inc => searchParams.append('include', inc));
    }

    const url = `${PRODUCTS_ENDPOINT}/${id}?${searchParams.toString()}`;
    const response = await apiRequest<Product>(url);
    
    return response.data!;
  }

  // 通过slug获取产品
  static async getProductBySlug(
    slug: string,
    include?: ProductQuery['include']
  ): Promise<Product> {
    if (!slug) {
      throw new ProductApiError('Product slug is required', 400, 'MISSING_SLUG');
    }

    const searchParams = new URLSearchParams();
    if (include) {
      include.forEach(inc => searchParams.append('include', inc));
    }

    const url = `${PRODUCTS_ENDPOINT}/slug/${slug}?${searchParams.toString()}`;
    const response = await apiRequest<Product>(url);
    
    return response.data!;
  }

  // 创建产品
  static async createProduct(data: ProductCreateData): Promise<Product> {
    // 验证数据
    const validationErrors = validateProductCreateData(data);
    if (Object.keys(validationErrors).length > 0) {
      throw new ProductApiError(
        'Invalid product data',
        400,
        'VALIDATION_ERROR',
        validationErrors
      );
    }

    const response = await apiRequest<Product>(PRODUCTS_ENDPOINT, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    return response.data!;
  }

  // 更新产品
  static async updateProduct(data: ProductUpdateData): Promise<Product> {
    // 验证数据
    const validationErrors = validateProductUpdateData(data);
    if (Object.keys(validationErrors).length > 0) {
      throw new ProductApiError(
        'Invalid product data',
        400,
        'VALIDATION_ERROR',
        validationErrors
      );
    }

    const { id, ...updateData } = data;
    const response = await apiRequest<Product>(`${PRODUCTS_ENDPOINT}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
    
    return response.data!;
  }

  // 删除产品
  static async deleteProduct(id: string): Promise<void> {
    if (!id) {
      throw new ProductApiError('Product ID is required', 400, 'MISSING_ID');
    }

    await apiRequest(`${PRODUCTS_ENDPOINT}/${id}`, {
      method: 'DELETE',
    });
  }

  // 批量操作
  static async bulkOperation(operation: ProductBulkOperation): Promise<{ success: number; failed: number; errors?: any[] }> {
    // 验证操作数据
    const validationErrors = validateBulkOperation(operation);
    if (Object.keys(validationErrors).length > 0) {
      throw new ProductApiError(
        'Invalid bulk operation data',
        400,
        'VALIDATION_ERROR',
        validationErrors
      );
    }

    const response = await apiRequest<{ success: number; failed: number; errors?: any[] }>(
      `${PRODUCTS_ENDPOINT}/bulk`,
      {
        method: 'POST',
        body: JSON.stringify(operation),
      }
    );
    
    return response.data!;
  }

  // 获取产品统计
  static async getProductStats(): Promise<ProductStats> {
    const response = await apiRequest<ProductStats>(`${PRODUCTS_ENDPOINT}/stats`);
    return response.data!;
  }

  // 搜索产品
  static async searchProducts(
    query: string,
    filters?: ProductFilters,
    limit = 10
  ): Promise<Product[]> {
    if (!query || query.trim().length === 0) {
      throw new ProductApiError('Search query is required', 400, 'MISSING_QUERY');
    }

    const searchParams = new URLSearchParams();
    searchParams.set('q', query.trim());
    searchParams.set('limit', limit.toString());

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => searchParams.append(`filters[${key}]`, v.toString()));
          } else {
            searchParams.set(`filters[${key}]`, value.toString());
          }
        }
      });
    }

    const url = `${PRODUCTS_ENDPOINT}/search?${searchParams.toString()}`;
    const response = await apiRequest<Product[]>(url);
    
    return response.data!;
  }

  // 获取搜索建议
  static async getSearchSuggestions(
    query: string,
    limit = 5
  ): Promise<ProductSearchSuggestion[]> {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const searchParams = new URLSearchParams();
    searchParams.set('q', query.trim());
    searchParams.set('limit', limit.toString());

    const url = `${PRODUCTS_ENDPOINT}/suggestions?${searchParams.toString()}`;
    const response = await apiRequest<ProductSearchSuggestion[]>(url);
    
    return response.data!;
  }

  // 获取相关产品
  static async getRelatedProducts(
    productId: string,
    limit = 4
  ): Promise<Product[]> {
    if (!productId) {
      throw new ProductApiError('Product ID is required', 400, 'MISSING_ID');
    }

    const searchParams = new URLSearchParams();
    searchParams.set('limit', limit.toString());

    const url = `${PRODUCTS_ENDPOINT}/${productId}/related?${searchParams.toString()}`;
    const response = await apiRequest<Product[]>(url);
    
    return response.data!;
  }

  // 比较产品
  static async compareProducts(productIds: string[]): Promise<ProductComparison> {
    if (!productIds || productIds.length < 2) {
      throw new ProductApiError(
        'At least 2 products are required for comparison',
        400,
        'INSUFFICIENT_PRODUCTS'
      );
    }

    if (productIds.length > 5) {
      throw new ProductApiError(
        'Cannot compare more than 5 products',
        400,
        'TOO_MANY_PRODUCTS'
      );
    }

    const response = await apiRequest<ProductComparison>(`${PRODUCTS_ENDPOINT}/compare`, {
      method: 'POST',
      body: JSON.stringify({ productIds }),
    });
    
    return response.data!;
  }

  // 获取推荐产品
  static async getFeaturedProducts(limit = 8): Promise<Product[]> {
    const searchParams = new URLSearchParams();
    searchParams.set('limit', limit.toString());

    const url = `${PRODUCTS_ENDPOINT}/featured?${searchParams.toString()}`;
    const response = await apiRequest<Product[]>(url);
    
    return response.data!;
  }

  // 获取新品
  static async getNewProducts(limit = 8): Promise<Product[]> {
    const searchParams = new URLSearchParams();
    searchParams.set('limit', limit.toString());

    const url = `${PRODUCTS_ENDPOINT}/new?${searchParams.toString()}`;
    const response = await apiRequest<Product[]>(url);
    
    return response.data!;
  }

  // 获取热门产品
  static async getPopularProducts(limit = 8): Promise<Product[]> {
    const searchParams = new URLSearchParams();
    searchParams.set('limit', limit.toString());

    const url = `${PRODUCTS_ENDPOINT}/popular?${searchParams.toString()}`;
    const response = await apiRequest<Product[]>(url);
    
    return response.data!;
  }

  // 检查SKU是否可用
  static async checkSkuAvailability(sku: string, excludeId?: string): Promise<boolean> {
    if (!sku) {
      throw new ProductApiError('SKU is required', 400, 'MISSING_SKU');
    }

    const searchParams = new URLSearchParams();
    searchParams.set('sku', sku);
    if (excludeId) {
      searchParams.set('exclude', excludeId);
    }

    const url = `${PRODUCTS_ENDPOINT}/check-sku?${searchParams.toString()}`;
    const response = await apiRequest<{ available: boolean }>(url);
    
    return response.data!.available;
  }

  // 检查slug是否可用
  static async checkSlugAvailability(slug: string, excludeId?: string): Promise<boolean> {
    if (!slug) {
      throw new ProductApiError('Slug is required', 400, 'MISSING_SLUG');
    }

    const searchParams = new URLSearchParams();
    searchParams.set('slug', slug);
    if (excludeId) {
      searchParams.set('exclude', excludeId);
    }

    const url = `${PRODUCTS_ENDPOINT}/check-slug?${searchParams.toString()}`;
    const response = await apiRequest<{ available: boolean }>(url);
    
    return response.data!.available;
  }

  // 上传产品图片
  static async uploadProductImage(
    productId: string,
    file: File,
    isMain = false
  ): Promise<{ url: string; id: string }> {
    if (!productId) {
      throw new ProductApiError('Product ID is required', 400, 'MISSING_ID');
    }

    if (!file) {
      throw new ProductApiError('File is required', 400, 'MISSING_FILE');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('isMain', isMain.toString());

    const response = await fetch(`${PRODUCTS_ENDPOINT}/${productId}/images`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new ProductApiError(
        errorData.error?.message || 'Image upload failed',
        response.status,
        errorData.error?.code || 'UPLOAD_ERROR',
        errorData.error?.details
      );
    }

    const data = await response.json();
    return data.data;
  }

  // 删除产品图片
  static async deleteProductImage(productId: string, imageId: string): Promise<void> {
    if (!productId || !imageId) {
      throw new ProductApiError('Product ID and Image ID are required', 400, 'MISSING_IDS');
    }

    await apiRequest(`${PRODUCTS_ENDPOINT}/${productId}/images/${imageId}`, {
      method: 'DELETE',
    });
  }

  // 上传产品文档
  static async uploadProductDocument(
    productId: string,
    file: File,
    type: 'datasheet' | 'manual' | 'certificate' | 'brochure' | 'other',
    language: 'en' | 'zh' | 'both' = 'both'
  ): Promise<{ url: string; id: string }> {
    if (!productId) {
      throw new ProductApiError('Product ID is required', 400, 'MISSING_ID');
    }

    if (!file) {
      throw new ProductApiError('File is required', 400, 'MISSING_FILE');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    formData.append('language', language);

    const response = await fetch(`${PRODUCTS_ENDPOINT}/${productId}/documents`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new ProductApiError(
        errorData.error?.message || 'Document upload failed',
        response.status,
        errorData.error?.code || 'UPLOAD_ERROR',
        errorData.error?.details
      );
    }

    const data = await response.json();
    return data.data;
  }

  // 删除产品文档
  static async deleteProductDocument(productId: string, documentId: string): Promise<void> {
    if (!productId || !documentId) {
      throw new ProductApiError('Product ID and Document ID are required', 400, 'MISSING_IDS');
    }

    await apiRequest(`${PRODUCTS_ENDPOINT}/${productId}/documents/${documentId}`, {
      method: 'DELETE',
    });
  }
}

// 产品分类API
export class ProductCategoryApi {
  private static readonly ENDPOINT = `${API_BASE_URL}/categories`;

  // 获取分类列表
  static async getCategories(includeInactive = false): Promise<ProductCategory[]> {
    const searchParams = new URLSearchParams();
    if (includeInactive) {
      searchParams.set('includeInactive', 'true');
    }

    const url = `${this.ENDPOINT}?${searchParams.toString()}`;
    const response = await apiRequest<ProductCategory[]>(url);
    
    return response.data!;
  }

  // 获取分类树
  static async getCategoryTree(): Promise<ProductCategory[]> {
    const response = await apiRequest<ProductCategory[]>(`${this.ENDPOINT}/tree`);
    return response.data!;
  }

  // 获取单个分类
  static async getCategory(id: string): Promise<ProductCategory> {
    if (!id) {
      throw new ProductApiError('Category ID is required', 400, 'MISSING_ID');
    }

    const response = await apiRequest<ProductCategory>(`${this.ENDPOINT}/${id}`);
    return response.data!;
  }

  // 通过slug获取分类
  static async getCategoryBySlug(slug: string): Promise<ProductCategory> {
    if (!slug) {
      throw new ProductApiError('Category slug is required', 400, 'MISSING_SLUG');
    }

    const response = await apiRequest<ProductCategory>(`${this.ENDPOINT}/slug/${slug}`);
    return response.data!;
  }
}

// 导出默认API实例
export default ProductApi;

// 导出错误类
export { ProductApiError };