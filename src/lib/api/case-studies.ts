/**
 * 案例研究API接口
 */
import { 
  CaseStudy,
  CaseCreateData,
  CaseUpdateData,
  CaseQuery,
  CaseQueryResult,
  CaseFilters,
  CaseSortBy,
  CaseStats,
  CaseMapData,
  CaseComparison,
  CaseSearchSuggestion,
  CaseBulkOperation,
  CaseExportConfig,
  CaseTemplate,
  CaseApiResponse,
  CaseImage,
  CaseVideo,
  CaseDocument
} from '@/types/case-study';

// API基础配置
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
const CASES_ENDPOINT = `${API_BASE_URL}/case-studies`;

// HTTP客户端配置
const defaultHeaders = {
  'Content-Type': 'application/json',
};

// 错误处理
class CaseApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'CaseApiError';
  }
}

// HTTP请求工具
const apiRequest = async <T>(
  url: string,
  options: RequestInit = {}
): Promise<CaseApiResponse<T>> => {
  try {
    const response = await fetch(url, {
      headers: { ...defaultHeaders, ...options.headers },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new CaseApiError(
        data.error?.message || 'API request failed',
        response.status,
        data.error?.code || 'API_ERROR',
        data.error?.details
      );
    }

    return data;
  } catch (error) {
    if (error instanceof CaseApiError) {
      throw error;
    }
    throw new CaseApiError(
      'Network error occurred',
      0,
      'NETWORK_ERROR',
      error
    );
  }
};

// 案例研究API类
export class CaseStudyApi {
  // 获取案例列表
  static async getCases(query: CaseQuery = {}): Promise<CaseQueryResult> {
    const searchParams = new URLSearchParams();
    
    // 构建查询参数
    if (query.filters) {
      Object.entries(query.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => searchParams.append(`filters[${key}]`, v.toString()));
          } else if (key === 'dateRange') {
            const dateRange = value as any;
            searchParams.set(`filters[${key}][start]`, dateRange.start.toISOString());
            searchParams.set(`filters[${key}][end]`, dateRange.end.toISOString());
            searchParams.set(`filters[${key}][field]`, dateRange.field);
          } else if (key === 'projectScale') {
            const scale = value as any;
            Object.entries(scale).forEach(([scaleKey, scaleValue]) => {
              if (scaleValue !== undefined) {
                searchParams.set(`filters[${key}][${scaleKey}]`, scaleValue.toString());
              }
            });
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

    const url = `${CASES_ENDPOINT}?${searchParams.toString()}`;
    const response = await apiRequest<CaseQueryResult>(url);
    
    return response.data!;
  }

  // 获取单个案例
  static async getCase(
    id: string, 
    include?: CaseQuery['include']
  ): Promise<CaseStudy> {
    if (!id) {
      throw new CaseApiError('Case ID is required', 400, 'MISSING_ID');
    }

    const searchParams = new URLSearchParams();
    if (include) {
      include.forEach(inc => searchParams.append('include', inc));
    }

    const url = `${CASES_ENDPOINT}/${id}?${searchParams.toString()}`;
    const response = await apiRequest<CaseStudy>(url);
    
    return response.data!;
  }

  // 通过slug获取案例
  static async getCaseBySlug(
    slug: string,
    include?: CaseQuery['include']
  ): Promise<CaseStudy> {
    if (!slug) {
      throw new CaseApiError('Case slug is required', 400, 'MISSING_SLUG');
    }

    const searchParams = new URLSearchParams();
    if (include) {
      include.forEach(inc => searchParams.append('include', inc));
    }

    const url = `${CASES_ENDPOINT}/slug/${slug}?${searchParams.toString()}`;
    const response = await apiRequest<CaseStudy>(url);
    
    return response.data!;
  }

  // 创建案例
  static async createCase(data: CaseCreateData): Promise<CaseStudy> {
    const response = await apiRequest<CaseStudy>(CASES_ENDPOINT, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    return response.data!;
  }

  // 更新案例
  static async updateCase(data: CaseUpdateData): Promise<CaseStudy> {
    const { id, ...updateData } = data;
    const response = await apiRequest<CaseStudy>(`${CASES_ENDPOINT}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
    
    return response.data!;
  }

  // 删除案例
  static async deleteCase(id: string): Promise<void> {
    if (!id) {
      throw new CaseApiError('Case ID is required', 400, 'MISSING_ID');
    }

    await apiRequest(`${CASES_ENDPOINT}/${id}`, {
      method: 'DELETE',
    });
  }

  // 批量操作
  static async bulkOperation(operation: CaseBulkOperation): Promise<{ success: number; failed: number; errors?: any[] }> {
    const response = await apiRequest<{ success: number; failed: number; errors?: any[] }>(
      `${CASES_ENDPOINT}/bulk`,
      {
        method: 'POST',
        body: JSON.stringify(operation),
      }
    );
    
    return response.data!;
  }

  // 获取案例统计
  static async getCaseStats(
    dateRange?: { start: Date; end: Date }
  ): Promise<CaseStats> {
    const searchParams = new URLSearchParams();
    if (dateRange) {
      searchParams.set('startDate', dateRange.start.toISOString());
      searchParams.set('endDate', dateRange.end.toISOString());
    }

    const url = `${CASES_ENDPOINT}/stats?${searchParams.toString()}`;
    const response = await apiRequest<CaseStats>(url);
    
    return response.data!;
  }

  // 搜索案例
  static async searchCases(
    query: string,
    filters?: CaseFilters,
    limit = 10
  ): Promise<CaseStudy[]> {
    if (!query || query.trim().length === 0) {
      throw new CaseApiError('Search query is required', 400, 'MISSING_QUERY');
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

    const url = `${CASES_ENDPOINT}/search?${searchParams.toString()}`;
    const response = await apiRequest<CaseStudy[]>(url);
    
    return response.data!;
  }

  // 获取搜索建议
  static async getSearchSuggestions(
    query: string,
    limit = 5
  ): Promise<CaseSearchSuggestion[]> {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const searchParams = new URLSearchParams();
    searchParams.set('q', query.trim());
    searchParams.set('limit', limit.toString());

    const url = `${CASES_ENDPOINT}/suggestions?${searchParams.toString()}`;
    const response = await apiRequest<CaseSearchSuggestion[]>(url);
    
    return response.data!;
  }

  // 获取推荐案例
  static async getFeaturedCases(limit = 6): Promise<CaseStudy[]> {
    const searchParams = new URLSearchParams();
    searchParams.set('limit', limit.toString());

    const url = `${CASES_ENDPOINT}/featured?${searchParams.toString()}`;
    const response = await apiRequest<CaseStudy[]>(url);
    
    return response.data!;
  }

  // 获取展示案例
  static async getShowcaseCases(limit = 8): Promise<CaseStudy[]> {
    const searchParams = new URLSearchParams();
    searchParams.set('limit', limit.toString());

    const url = `${CASES_ENDPOINT}/showcase?${searchParams.toString()}`;
    const response = await apiRequest<CaseStudy[]>(url);
    
    return response.data!;
  }

  // 获取最新案例
  static async getLatestCases(limit = 6): Promise<CaseStudy[]> {
    const searchParams = new URLSearchParams();
    searchParams.set('limit', limit.toString());

    const url = `${CASES_ENDPOINT}/latest?${searchParams.toString()}`;
    const response = await apiRequest<CaseStudy[]>(url);
    
    return response.data!;
  }

  // 获取相关案例
  static async getRelatedCases(
    caseId: string,
    limit = 4
  ): Promise<CaseStudy[]> {
    if (!caseId) {
      throw new CaseApiError('Case ID is required', 400, 'MISSING_ID');
    }

    const searchParams = new URLSearchParams();
    searchParams.set('limit', limit.toString());

    const url = `${CASES_ENDPOINT}/${caseId}/related?${searchParams.toString()}`;
    const response = await apiRequest<CaseStudy[]>(url);
    
    return response.data!;
  }

  // 比较案例
  static async compareCases(caseIds: string[]): Promise<CaseComparison> {
    if (!caseIds || caseIds.length < 2) {
      throw new CaseApiError(
        'At least 2 cases are required for comparison',
        400,
        'INSUFFICIENT_CASES'
      );
    }

    if (caseIds.length > 4) {
      throw new CaseApiError(
        'Cannot compare more than 4 cases',
        400,
        'TOO_MANY_CASES'
      );
    }

    const response = await apiRequest<CaseComparison>(`${CASES_ENDPOINT}/compare`, {
      method: 'POST',
      body: JSON.stringify({ caseIds }),
    });
    
    return response.data!;
  }

  // 获取地图数据
  static async getMapData(filters?: CaseFilters): Promise<CaseMapData[]> {
    const searchParams = new URLSearchParams();
    
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

    const url = `${CASES_ENDPOINT}/map?${searchParams.toString()}`;
    const response = await apiRequest<CaseMapData[]>(url);
    
    return response.data!;
  }

  // 按行业获取案例
  static async getCasesByIndustry(
    industry: string,
    limit = 10
  ): Promise<CaseStudy[]> {
    if (!industry) {
      throw new CaseApiError('Industry is required', 400, 'MISSING_INDUSTRY');
    }

    const searchParams = new URLSearchParams();
    searchParams.set('industry', industry);
    searchParams.set('limit', limit.toString());

    const url = `${CASES_ENDPOINT}/by-industry?${searchParams.toString()}`;
    const response = await apiRequest<CaseStudy[]>(url);
    
    return response.data!;
  }

  // 按项目类型获取案例
  static async getCasesByProjectType(
    projectType: string,
    limit = 10
  ): Promise<CaseStudy[]> {
    if (!projectType) {
      throw new CaseApiError('Project type is required', 400, 'MISSING_PROJECT_TYPE');
    }

    const searchParams = new URLSearchParams();
    searchParams.set('projectType', projectType);
    searchParams.set('limit', limit.toString());

    const url = `${CASES_ENDPOINT}/by-project-type?${searchParams.toString()}`;
    const response = await apiRequest<CaseStudy[]>(url);
    
    return response.data!;
  }

  // 按地区获取案例
  static async getCasesByRegion(
    country: string,
    state?: string,
    limit = 10
  ): Promise<CaseStudy[]> {
    if (!country) {
      throw new CaseApiError('Country is required', 400, 'MISSING_COUNTRY');
    }

    const searchParams = new URLSearchParams();
    searchParams.set('country', country);
    if (state) searchParams.set('state', state);
    searchParams.set('limit', limit.toString());

    const url = `${CASES_ENDPOINT}/by-region?${searchParams.toString()}`;
    const response = await apiRequest<CaseStudy[]>(url);
    
    return response.data!;
  }

  // 增加浏览次数
  static async incrementViewCount(caseId: string): Promise<void> {
    if (!caseId) {
      throw new CaseApiError('Case ID is required', 400, 'MISSING_ID');
    }

    await apiRequest(`${CASES_ENDPOINT}/${caseId}/view`, {
      method: 'POST',
    });
  }

  // 检查slug是否可用
  static async checkSlugAvailability(slug: string, excludeId?: string): Promise<boolean> {
    if (!slug) {
      throw new CaseApiError('Slug is required', 400, 'MISSING_SLUG');
    }

    const searchParams = new URLSearchParams();
    searchParams.set('slug', slug);
    if (excludeId) {
      searchParams.set('exclude', excludeId);
    }

    const url = `${CASES_ENDPOINT}/check-slug?${searchParams.toString()}`;
    const response = await apiRequest<{ available: boolean }>(url);
    
    return response.data!.available;
  }

  // 上传案例图片
  static async uploadCaseImage(
    caseId: string,
    file: File,
    type: CaseImage['type'] = 'gallery'
  ): Promise<{ url: string; id: string }> {
    if (!caseId) {
      throw new CaseApiError('Case ID is required', 400, 'MISSING_ID');
    }

    if (!file) {
      throw new CaseApiError('File is required', 400, 'MISSING_FILE');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const response = await fetch(`${CASES_ENDPOINT}/${caseId}/images`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new CaseApiError(
        errorData.error?.message || 'Image upload failed',
        response.status,
        errorData.error?.code || 'UPLOAD_ERROR',
        errorData.error?.details
      );
    }

    const data = await response.json();
    return data.data;
  }

  // 删除案例图片
  static async deleteCaseImage(caseId: string, imageId: string): Promise<void> {
    if (!caseId || !imageId) {
      throw new CaseApiError('Case ID and Image ID are required', 400, 'MISSING_IDS');
    }

    await apiRequest(`${CASES_ENDPOINT}/${caseId}/images/${imageId}`, {
      method: 'DELETE',
    });
  }

  // 上传案例视频
  static async uploadCaseVideo(
    caseId: string,
    videoData: {
      url: string;
      title: string;
      description?: string;
      thumbnail?: string;
      type: CaseVideo['type'];
    }
  ): Promise<{ id: string }> {
    if (!caseId) {
      throw new CaseApiError('Case ID is required', 400, 'MISSING_ID');
    }

    const response = await apiRequest<{ id: string }>(`${CASES_ENDPOINT}/${caseId}/videos`, {
      method: 'POST',
      body: JSON.stringify(videoData),
    });
    
    return response.data!;
  }

  // 删除案例视频
  static async deleteCaseVideo(caseId: string, videoId: string): Promise<void> {
    if (!caseId || !videoId) {
      throw new CaseApiError('Case ID and Video ID are required', 400, 'MISSING_IDS');
    }

    await apiRequest(`${CASES_ENDPOINT}/${caseId}/videos/${videoId}`, {
      method: 'DELETE',
    });
  }

  // 上传案例文档
  static async uploadCaseDocument(
    caseId: string,
    file: File,
    type: CaseDocument['type'] = 'other',
    language: CaseDocument['language'] = 'both'
  ): Promise<{ url: string; id: string }> {
    if (!caseId) {
      throw new CaseApiError('Case ID is required', 400, 'MISSING_ID');
    }

    if (!file) {
      throw new CaseApiError('File is required', 400, 'MISSING_FILE');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    formData.append('language', language);

    const response = await fetch(`${CASES_ENDPOINT}/${caseId}/documents`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new CaseApiError(
        errorData.error?.message || 'Document upload failed',
        response.status,
        errorData.error?.code || 'UPLOAD_ERROR',
        errorData.error?.details
      );
    }

    const data = await response.json();
    return data.data;
  }

  // 删除案例文档
  static async deleteCaseDocument(caseId: string, documentId: string): Promise<void> {
    if (!caseId || !documentId) {
      throw new CaseApiError('Case ID and Document ID are required', 400, 'MISSING_IDS');
    }

    await apiRequest(`${CASES_ENDPOINT}/${caseId}/documents/${documentId}`, {
      method: 'DELETE',
    });
  }

  // 导出案例
  static async exportCases(config: CaseExportConfig): Promise<Blob> {
    const response = await fetch(`${CASES_ENDPOINT}/export`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify(config),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new CaseApiError(
        errorData.error?.message || 'Export failed',
        response.status,
        errorData.error?.code || 'EXPORT_ERROR',
        errorData.error?.details
      );
    }

    return response.blob();
  }
}

// 案例模板API
export class CaseTemplateApi {
  private static readonly ENDPOINT = `${API_BASE_URL}/case-templates`;

  // 获取模板列表
  static async getTemplates(): Promise<CaseTemplate[]> {
    const response = await apiRequest<CaseTemplate[]>(this.ENDPOINT);
    return response.data!;
  }

  // 获取单个模板
  static async getTemplate(id: string): Promise<CaseTemplate> {
    if (!id) {
      throw new CaseApiError('Template ID is required', 400, 'MISSING_ID');
    }

    const response = await apiRequest<CaseTemplate>(`${this.ENDPOINT}/${id}`);
    return response.data!;
  }

  // 创建模板
  static async createTemplate(data: Omit<CaseTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<CaseTemplate> {
    const response = await apiRequest<CaseTemplate>(this.ENDPOINT, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    return response.data!;
  }

  // 更新模板
  static async updateTemplate(id: string, data: Partial<CaseTemplate>): Promise<CaseTemplate> {
    if (!id) {
      throw new CaseApiError('Template ID is required', 400, 'MISSING_ID');
    }

    const response = await apiRequest<CaseTemplate>(`${this.ENDPOINT}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    
    return response.data!;
  }

  // 删除模板
  static async deleteTemplate(id: string): Promise<void> {
    if (!id) {
      throw new CaseApiError('Template ID is required', 400, 'MISSING_ID');
    }

    await apiRequest(`${this.ENDPOINT}/${id}`, {
      method: 'DELETE',
    });
  }
}

// 导出默认API实例
export default CaseStudyApi;

// 导出错误类
export { CaseApiError };