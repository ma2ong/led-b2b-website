/**
 * 产品数据验证逻辑
 */
import { 
  validationRules, 
  combineValidators, 
  ValidationRule 
} from './form-validation';
import { 
  Product, 
  ProductCreateData, 
  ProductUpdateData,
  ProductCategory,
  ProductSpecification,
  ProductImage,
  ProductDocument,
  ProductType,
  PixelPitch,
  ProductStatus,
  ProductFilters,
  ProductQuery
} from '@/types/product';

// 产品名称验证
export const validateProductName: ValidationRule = combineValidators(
  validationRules.required('Product name is required'),
  validationRules.minLength(2, 'Product name must be at least 2 characters'),
  validationRules.maxLength(100, 'Product name must not exceed 100 characters'),
  validationRules.pattern(
    /^[a-zA-Z0-9\s\-_.()]+$/,
    'Product name can only contain letters, numbers, spaces, and basic punctuation'
  )
);

// SKU验证
export const validateSKU: ValidationRule = combineValidators(
  validationRules.required('SKU is required'),
  validationRules.minLength(3, 'SKU must be at least 3 characters'),
  validationRules.maxLength(50, 'SKU must not exceed 50 characters'),
  validationRules.pattern(
    /^[A-Z0-9\-_]+$/,
    'SKU can only contain uppercase letters, numbers, hyphens, and underscores'
  )
);

// Slug验证
export const validateSlug: ValidationRule = combineValidators(
  validationRules.required('Slug is required'),
  validationRules.minLength(2, 'Slug must be at least 2 characters'),
  validationRules.maxLength(100, 'Slug must not exceed 100 characters'),
  validationRules.pattern(
    /^[a-z0-9\-]+$/,
    'Slug can only contain lowercase letters, numbers, and hyphens'
  )
);

// 产品描述验证
export const validateShortDescription: ValidationRule = combineValidators(
  validationRules.required('Short description is required'),
  validationRules.minLength(10, 'Short description must be at least 10 characters'),
  validationRules.maxLength(200, 'Short description must not exceed 200 characters')
);

export const validateFullDescription: ValidationRule = combineValidators(
  validationRules.required('Full description is required'),
  validationRules.minLength(50, 'Full description must be at least 50 characters'),
  validationRules.maxLength(5000, 'Full description must not exceed 5000 characters')
);

// 产品类型验证
export const validateProductType: ValidationRule = (value) => {
  if (!value) {
    return 'Product type is required';
  }
  if (!Object.values(ProductType).includes(value)) {
    return 'Invalid product type';
  }
  return undefined;
};

// 像素间距验证
export const validatePixelPitch: ValidationRule = (value) => {
  if (!value) {
    return 'Pixel pitch is required';
  }
  if (!Object.values(PixelPitch).includes(value)) {
    return 'Invalid pixel pitch';
  }
  return undefined;
};

// 产品状态验证
export const validateProductStatus: ValidationRule = (value) => {
  if (!value) {
    return 'Product status is required';
  }
  if (!Object.values(ProductStatus).includes(value)) {
    return 'Invalid product status';
  }
  return undefined;
};

// 分类ID验证
export const validateCategoryId: ValidationRule = combineValidators(
  validationRules.required('Category is required'),
  validationRules.pattern(
    /^[a-zA-Z0-9\-_]+$/,
    'Invalid category ID format'
  )
);

// 规格验证
export const validateSpecification = (spec: Partial<ProductSpecification>): string[] => {
  const errors: string[] = [];
  
  if (!spec.name || spec.name.trim().length === 0) {
    errors.push('Specification name is required');
  } else if (spec.name.length > 100) {
    errors.push('Specification name must not exceed 100 characters');
  }
  
  if (!spec.value || spec.value.trim().length === 0) {
    errors.push('Specification value is required');
  } else if (spec.value.length > 200) {
    errors.push('Specification value must not exceed 200 characters');
  }
  
  if (spec.category && !['technical', 'physical', 'performance', 'environmental', 'other'].includes(spec.category)) {
    errors.push('Invalid specification category');
  }
  
  if (spec.unit && spec.unit.length > 20) {
    errors.push('Specification unit must not exceed 20 characters');
  }
  
  return errors;
};

// 图片验证
export const validateProductImage = (image: Partial<ProductImage>): string[] => {
  const errors: string[] = [];
  
  if (!image.url || image.url.trim().length === 0) {
    errors.push('Image URL is required');
  } else if (!validationRules.url()(image.url)) {
    errors.push('Invalid image URL format');
  }
  
  if (!image.alt || image.alt.trim().length === 0) {
    errors.push('Image alt text is required');
  } else if (image.alt.length > 200) {
    errors.push('Image alt text must not exceed 200 characters');
  }
  
  if (image.title && image.title.length > 200) {
    errors.push('Image title must not exceed 200 characters');
  }
  
  if (image.width && (image.width < 1 || image.width > 10000)) {
    errors.push('Image width must be between 1 and 10000 pixels');
  }
  
  if (image.height && (image.height < 1 || image.height > 10000)) {
    errors.push('Image height must be between 1 and 10000 pixels');
  }
  
  return errors;
};

// 文档验证
export const validateProductDocument = (doc: Partial<ProductDocument>): string[] => {
  const errors: string[] = [];
  
  if (!doc.name || doc.name.trim().length === 0) {
    errors.push('Document name is required');
  } else if (doc.name.length > 200) {
    errors.push('Document name must not exceed 200 characters');
  }
  
  if (!doc.url || doc.url.trim().length === 0) {
    errors.push('Document URL is required');
  } else if (!validationRules.url()(doc.url)) {
    errors.push('Invalid document URL format');
  }
  
  if (!doc.type || !['datasheet', 'manual', 'certificate', 'brochure', 'other'].includes(doc.type)) {
    errors.push('Invalid document type');
  }
  
  if (!doc.mimeType || doc.mimeType.trim().length === 0) {
    errors.push('Document MIME type is required');
  }
  
  if (!doc.language || !['en', 'zh', 'both'].includes(doc.language)) {
    errors.push('Invalid document language');
  }
  
  if (doc.size && (doc.size < 1 || doc.size > 100 * 1024 * 1024)) { // 100MB max
    errors.push('Document size must be between 1 byte and 100MB');
  }
  
  return errors;
};

// 尺寸验证
export const validateDimensions = (dimensions: Product['dimensions']): string[] => {
  const errors: string[] = [];
  
  if (!dimensions) return errors;
  
  if (!dimensions.width || dimensions.width <= 0) {
    errors.push('Width must be greater than 0');
  }
  
  if (!dimensions.height || dimensions.height <= 0) {
    errors.push('Height must be greater than 0');
  }
  
  if (!dimensions.depth || dimensions.depth <= 0) {
    errors.push('Depth must be greater than 0');
  }
  
  if (!dimensions.unit || !['mm', 'cm', 'm'].includes(dimensions.unit)) {
    errors.push('Invalid dimension unit');
  }
  
  return errors;
};

// 保修信息验证
export const validateWarranty = (warranty: Product['warranty']): string[] => {
  const errors: string[] = [];
  
  if (!warranty) return errors;
  
  if (!warranty.period || warranty.period <= 0) {
    errors.push('Warranty period must be greater than 0');
  }
  
  if (!warranty.unit || !['months', 'years'].includes(warranty.unit)) {
    errors.push('Invalid warranty unit');
  }
  
  if (warranty.description && warranty.description.length > 500) {
    errors.push('Warranty description must not exceed 500 characters');
  }
  
  return errors;
};

// SEO信息验证
export const validateProductSEO = (seo: Product['seo']): string[] => {
  const errors: string[] = [];
  
  if (!seo) return errors;
  
  if (seo.title && seo.title.length > 60) {
    errors.push('SEO title must not exceed 60 characters');
  }
  
  if (seo.description && seo.description.length > 160) {
    errors.push('SEO description must not exceed 160 characters');
  }
  
  if (seo.keywords && seo.keywords.length > 20) {
    errors.push('SEO keywords must not exceed 20 items');
  }
  
  if (seo.canonicalUrl && !validationRules.url()(seo.canonicalUrl)) {
    errors.push('Invalid canonical URL format');
  }
  
  if (seo.ogImage && !validationRules.url()(seo.ogImage)) {
    errors.push('Invalid Open Graph image URL format');
  }
  
  return errors;
};

// 产品创建数据验证
export const validateProductCreateData = (data: ProductCreateData): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  // 基本信息验证
  const nameError = validateProductName(data.name);
  if (nameError) errors.name = nameError;
  
  const skuError = validateSKU(data.sku);
  if (skuError) errors.sku = skuError;
  
  if (data.slug) {
    const slugError = validateSlug(data.slug);
    if (slugError) errors.slug = slugError;
  }
  
  const shortDescError = validateShortDescription(data.shortDescription);
  if (shortDescError) errors.shortDescription = shortDescError;
  
  const fullDescError = validateFullDescription(data.fullDescription);
  if (fullDescError) errors.fullDescription = fullDescError;
  
  const categoryError = validateCategoryId(data.categoryId);
  if (categoryError) errors.categoryId = categoryError;
  
  const typeError = validateProductType(data.type);
  if (typeError) errors.type = typeError;
  
  const pitchError = validatePixelPitch(data.pixelPitch);
  if (pitchError) errors.pixelPitch = pitchError;
  
  const statusError = validateProductStatus(data.status);
  if (statusError) errors.status = statusError;
  
  // 规格验证
  if (data.specifications && data.specifications.length > 0) {
    const specErrors: string[] = [];
    data.specifications.forEach((spec, index) => {
      const specValidationErrors = validateSpecification(spec);
      if (specValidationErrors.length > 0) {
        specErrors.push(`Specification ${index + 1}: ${specValidationErrors.join(', ')}`);
      }
    });
    if (specErrors.length > 0) {
      errors.specifications = specErrors.join('; ');
    }
  }
  
  // 特性验证
  if (data.features && data.features.length > 50) {
    errors.features = 'Too many features (maximum 50)';
  }
  
  // 标签验证
  if (data.tags && data.tags.length > 20) {
    errors.tags = 'Too many tags (maximum 20)';
  }
  
  // 尺寸验证
  if (data.dimensions) {
    const dimensionErrors = validateDimensions(data.dimensions);
    if (dimensionErrors.length > 0) {
      errors.dimensions = dimensionErrors.join(', ');
    }
  }
  
  // 保修验证
  if (data.warranty) {
    const warrantyErrors = validateWarranty(data.warranty);
    if (warrantyErrors.length > 0) {
      errors.warranty = warrantyErrors.join(', ');
    }
  }
  
  // SEO验证
  if (data.seo) {
    const seoErrors = validateProductSEO(data.seo);
    if (seoErrors.length > 0) {
      errors.seo = seoErrors.join(', ');
    }
  }
  
  return errors;
};

// 产品更新数据验证
export const validateProductUpdateData = (data: ProductUpdateData): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  if (!data.id) {
    errors.id = 'Product ID is required';
  }
  
  // 只验证提供的字段
  if (data.name !== undefined) {
    const nameError = validateProductName(data.name);
    if (nameError) errors.name = nameError;
  }
  
  if (data.sku !== undefined) {
    const skuError = validateSKU(data.sku);
    if (skuError) errors.sku = skuError;
  }
  
  if (data.slug !== undefined) {
    const slugError = validateSlug(data.slug);
    if (slugError) errors.slug = slugError;
  }
  
  if (data.shortDescription !== undefined) {
    const shortDescError = validateShortDescription(data.shortDescription);
    if (shortDescError) errors.shortDescription = shortDescError;
  }
  
  if (data.fullDescription !== undefined) {
    const fullDescError = validateFullDescription(data.fullDescription);
    if (fullDescError) errors.fullDescription = fullDescError;
  }
  
  if (data.categoryId !== undefined) {
    const categoryError = validateCategoryId(data.categoryId);
    if (categoryError) errors.categoryId = categoryError;
  }
  
  if (data.type !== undefined) {
    const typeError = validateProductType(data.type);
    if (typeError) errors.type = typeError;
  }
  
  if (data.pixelPitch !== undefined) {
    const pitchError = validatePixelPitch(data.pixelPitch);
    if (pitchError) errors.pixelPitch = pitchError;
  }
  
  if (data.status !== undefined) {
    const statusError = validateProductStatus(data.status);
    if (statusError) errors.status = statusError;
  }
  
  return errors;
};

// 产品筛选参数验证
export const validateProductFilters = (filters: ProductFilters): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  if (filters.type) {
    const types = Array.isArray(filters.type) ? filters.type : [filters.type];
    const invalidTypes = types.filter(type => !Object.values(ProductType).includes(type));
    if (invalidTypes.length > 0) {
      errors.type = `Invalid product types: ${invalidTypes.join(', ')}`;
    }
  }
  
  if (filters.pixelPitch) {
    const pitches = Array.isArray(filters.pixelPitch) ? filters.pixelPitch : [filters.pixelPitch];
    const invalidPitches = pitches.filter(pitch => !Object.values(PixelPitch).includes(pitch));
    if (invalidPitches.length > 0) {
      errors.pixelPitch = `Invalid pixel pitches: ${invalidPitches.join(', ')}`;
    }
  }
  
  if (filters.status) {
    const statuses = Array.isArray(filters.status) ? filters.status : [filters.status];
    const invalidStatuses = statuses.filter(status => !Object.values(ProductStatus).includes(status));
    if (invalidStatuses.length > 0) {
      errors.status = `Invalid product statuses: ${invalidStatuses.join(', ')}`;
    }
  }
  
  if (filters.priceRange) {
    if (filters.priceRange.min !== undefined && filters.priceRange.min < 0) {
      errors.priceRange = 'Minimum price cannot be negative';
    }
    if (filters.priceRange.max !== undefined && filters.priceRange.max < 0) {
      errors.priceRange = 'Maximum price cannot be negative';
    }
    if (filters.priceRange.min !== undefined && 
        filters.priceRange.max !== undefined && 
        filters.priceRange.min > filters.priceRange.max) {
      errors.priceRange = 'Minimum price cannot be greater than maximum price';
    }
  }
  
  if (filters.search && filters.search.length > 100) {
    errors.search = 'Search query must not exceed 100 characters';
  }
  
  return errors;
};

// 产品查询参数验证
export const validateProductQuery = (query: ProductQuery): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  if (query.filters) {
    const filterErrors = validateProductFilters(query.filters);
    Object.assign(errors, filterErrors);
  }
  
  if (query.page !== undefined && (query.page < 1 || query.page > 1000)) {
    errors.page = 'Page must be between 1 and 1000';
  }
  
  if (query.limit !== undefined && (query.limit < 1 || query.limit > 100)) {
    errors.limit = 'Limit must be between 1 and 100';
  }
  
  if (query.sortBy && !Object.values(ProductSortBy).includes(query.sortBy)) {
    errors.sortBy = 'Invalid sort option';
  }
  
  return errors;
};

// 批量操作验证
export const validateBulkOperation = (operation: any): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  if (!operation.action) {
    errors.action = 'Action is required';
  } else if (!['activate', 'deactivate', 'delete', 'update_category', 'update_status'].includes(operation.action)) {
    errors.action = 'Invalid action';
  }
  
  if (!operation.productIds || !Array.isArray(operation.productIds) || operation.productIds.length === 0) {
    errors.productIds = 'Product IDs are required';
  } else if (operation.productIds.length > 100) {
    errors.productIds = 'Cannot process more than 100 products at once';
  }
  
  if (operation.action === 'update_category' && !operation.data?.categoryId) {
    errors.data = 'Category ID is required for category update';
  }
  
  if (operation.action === 'update_status' && !operation.data?.status) {
    errors.data = 'Status is required for status update';
  }
  
  return errors;
};

export default {
  validateProductName,
  validateSKU,
  validateSlug,
  validateShortDescription,
  validateFullDescription,
  validateProductType,
  validatePixelPitch,
  validateProductStatus,
  validateCategoryId,
  validateSpecification,
  validateProductImage,
  validateProductDocument,
  validateDimensions,
  validateWarranty,
  validateProductSEO,
  validateProductCreateData,
  validateProductUpdateData,
  validateProductFilters,
  validateProductQuery,
  validateBulkOperation,
};