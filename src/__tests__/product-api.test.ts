/**
 * 产品API测试
 */
import { ProductApi, ProductCategoryApi, ProductApiError } from '@/lib/api/products';
import { 
  Product, 
  ProductCreateData, 
  ProductUpdateData,
  ProductType,
  PixelPitch,
  ProductStatus,
  ProductSortBy
} from '@/types/product';
import { mockProducts, mockCategories } from '@/lib/mock/products';

// Mock fetch
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('ProductApi', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe('getProducts', () => {
    it('should fetch products with default parameters', async () => {
      const mockResponse = {
        success: true,
        data: {
          products: mockProducts.slice(0, 10),
          total: mockProducts.length,
          page: 1,
          limit: 10,
          totalPages: Math.ceil(mockProducts.length / 10),
          hasNextPage: mockProducts.length > 10,
          hasPrevPage: false,
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await ProductApi.getProducts();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/products?'),
        expect.objectContaining({
          headers: { 'Content-Type': 'application/json' },
        })
      );
      expect(result.products).toHaveLength(10);
      expect(result.total).toBe(mockProducts.length);
    });

    it('should fetch products with filters', async () => {
      const filters = {
        type: ProductType.INDOOR,
        pixelPitch: PixelPitch.P2_5,
        categoryId: 'indoor',
      };

      const mockResponse = {
        success: true,
        data: {
          products: mockProducts.filter(p => p.type === ProductType.INDOOR),
          total: 2,
          page: 1,
          limit: 10,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
          filters,
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await ProductApi.getProducts({ filters });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('filters[type]=indoor'),
        expect.any(Object)
      );
      expect(result.filters).toEqual(filters);
    });

    it('should handle sorting and pagination', async () => {
      const query = {
        sortBy: ProductSortBy.NAME_ASC,
        page: 2,
        limit: 5,
      };

      const mockResponse = {
        success: true,
        data: {
          products: mockProducts.slice(5, 10),
          total: mockProducts.length,
          page: 2,
          limit: 5,
          totalPages: Math.ceil(mockProducts.length / 5),
          hasNextPage: true,
          hasPrevPage: true,
          sortBy: ProductSortBy.NAME_ASC,
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await ProductApi.getProducts(query);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('sortBy=name_asc&page=2&limit=5'),
        expect.any(Object)
      );
      expect(result.page).toBe(2);
      expect(result.limit).toBe(5);
    });

    it('should throw validation error for invalid query', async () => {
      const invalidQuery = {
        page: -1,
        limit: 200,
      };

      await expect(ProductApi.getProducts(invalidQuery)).rejects.toThrow(ProductApiError);
    });
  });

  describe('getProduct', () => {
    it('should fetch single product by ID', async () => {
      const productId = 'indoor-p1-25-hd';
      const mockProduct = mockProducts.find(p => p.id === productId)!;

      const mockResponse = {
        success: true,
        data: mockProduct,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await ProductApi.getProduct(productId);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(`/api/products/${productId}`),
        expect.any(Object)
      );
      expect(result.id).toBe(productId);
      expect(result.name).toBe(mockProduct.name);
    });

    it('should fetch product with includes', async () => {
      const productId = 'indoor-p1-25-hd';
      const include = ['category', 'images', 'specifications'];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockProducts.find(p => p.id === productId),
        }),
      } as Response);

      await ProductApi.getProduct(productId, include);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('include=category&include=images&include=specifications'),
        expect.any(Object)
      );
    });

    it('should throw error for missing product ID', async () => {
      await expect(ProductApi.getProduct('')).rejects.toThrow(ProductApiError);
    });

    it('should handle 404 error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({
          success: false,
          error: {
            code: 'PRODUCT_NOT_FOUND',
            message: 'Product not found',
          },
        }),
      } as Response);

      await expect(ProductApi.getProduct('non-existent')).rejects.toThrow(ProductApiError);
    });
  });

  describe('getProductBySlug', () => {
    it('should fetch product by slug', async () => {
      const slug = 'indoor-p1-25-hd-display';
      const mockProduct = mockProducts.find(p => p.slug === slug)!;

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockProduct,
        }),
      } as Response);

      const result = await ProductApi.getProductBySlug(slug);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(`/api/products/slug/${slug}`),
        expect.any(Object)
      );
      expect(result.slug).toBe(slug);
    });

    it('should throw error for missing slug', async () => {
      await expect(ProductApi.getProductBySlug('')).rejects.toThrow(ProductApiError);
    });
  });

  describe('createProduct', () => {
    it('should create new product', async () => {
      const productData: ProductCreateData = {
        name: 'Test Product',
        sku: 'TEST-001',
        shortDescription: 'Test product description',
        fullDescription: 'This is a test product with detailed description for testing purposes.',
        categoryId: 'indoor',
        type: ProductType.INDOOR,
        pixelPitch: PixelPitch.P2,
        specifications: [
          {
            name: 'Brightness',
            value: '1000',
            unit: 'nits',
            category: 'performance',
            sortOrder: 1,
            isHighlight: true,
          },
        ],
        applications: [
          {
            name: 'Retail',
            description: 'Perfect for retail environments',
            examples: ['Stores', 'Malls'],
          },
        ],
        features: ['High brightness', 'Energy efficient'],
        tags: ['indoor', 'test'],
        status: ProductStatus.ACTIVE,
        isActive: true,
        isFeatured: false,
        isNew: true,
      };

      const mockCreatedProduct: Product = {
        ...productData,
        id: 'test-product-id',
        slug: 'test-product',
        images: [],
        documents: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Product;

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockCreatedProduct,
        }),
      } as Response);

      const result = await ProductApi.createProduct(productData);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/products'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(productData),
        })
      );
      expect(result.id).toBe('test-product-id');
      expect(result.name).toBe(productData.name);
    });

    it('should throw validation error for invalid data', async () => {
      const invalidData = {
        name: '', // Invalid: empty name
        sku: 'TEST-001',
        shortDescription: 'Test',
        fullDescription: 'Test description',
        categoryId: 'indoor',
        type: ProductType.INDOOR,
        pixelPitch: PixelPitch.P2,
        specifications: [],
        applications: [],
        features: [],
        tags: [],
        status: ProductStatus.ACTIVE,
        isActive: true,
        isFeatured: false,
        isNew: false,
      } as ProductCreateData;

      await expect(ProductApi.createProduct(invalidData)).rejects.toThrow(ProductApiError);
    });
  });

  describe('updateProduct', () => {
    it('should update existing product', async () => {
      const updateData: ProductUpdateData = {
        id: 'indoor-p1-25-hd',
        name: 'Updated Product Name',
        shortDescription: 'Updated description',
        isFeatured: true,
      };

      const mockUpdatedProduct = {
        ...mockProducts[0],
        ...updateData,
        updatedAt: new Date(),
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockUpdatedProduct,
        }),
      } as Response);

      const result = await ProductApi.updateProduct(updateData);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(`/api/products/${updateData.id}`),
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({
            name: updateData.name,
            shortDescription: updateData.shortDescription,
            isFeatured: updateData.isFeatured,
          }),
        })
      );
      expect(result.name).toBe(updateData.name);
      expect(result.isFeatured).toBe(true);
    });

    it('should throw validation error for invalid update data', async () => {
      const invalidData = {
        id: '', // Invalid: empty ID
        name: 'Updated Name',
      } as ProductUpdateData;

      await expect(ProductApi.updateProduct(invalidData)).rejects.toThrow(ProductApiError);
    });
  });

  describe('deleteProduct', () => {
    it('should delete product', async () => {
      const productId = 'indoor-p1-25-hd';

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
        }),
      } as Response);

      await ProductApi.deleteProduct(productId);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(`/api/products/${productId}`),
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });

    it('should throw error for missing product ID', async () => {
      await expect(ProductApi.deleteProduct('')).rejects.toThrow(ProductApiError);
    });
  });

  describe('searchProducts', () => {
    it('should search products', async () => {
      const query = 'indoor';
      const mockSearchResults = mockProducts.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.tags.includes(query)
      );

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockSearchResults,
        }),
      } as Response);

      const result = await ProductApi.searchProducts(query);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(`/api/products/search?q=${query}`),
        expect.any(Object)
      );
      expect(result).toHaveLength(mockSearchResults.length);
    });

    it('should throw error for empty query', async () => {
      await expect(ProductApi.searchProducts('')).rejects.toThrow(ProductApiError);
    });
  });

  describe('getSearchSuggestions', () => {
    it('should get search suggestions', async () => {
      const query = 'ind';
      const mockSuggestions = [
        {
          type: 'product' as const,
          id: 'indoor-p1-25-hd',
          text: 'Indoor P1.25 HD Display',
          description: 'Ultra-high resolution indoor LED display',
          count: 1,
        },
        {
          type: 'category' as const,
          id: 'indoor',
          text: 'Indoor LED Displays',
          description: 'High-resolution indoor LED display solutions',
          count: 2,
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockSuggestions,
        }),
      } as Response);

      const result = await ProductApi.getSearchSuggestions(query);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(`/api/products/suggestions?q=${query}`),
        expect.any(Object)
      );
      expect(result).toHaveLength(2);
      expect(result[0].type).toBe('product');
    });

    it('should return empty array for short query', async () => {
      const result = await ProductApi.getSearchSuggestions('a');
      expect(result).toEqual([]);
    });
  });

  describe('compareProducts', () => {
    it('should compare products', async () => {
      const productIds = ['indoor-p1-25-hd', 'indoor-p2-5-standard'];
      const mockComparison = {
        products: mockProducts.filter(p => productIds.includes(p.id)),
        specifications: [
          {
            name: 'Pixel Pitch',
            category: 'technical',
            values: [
              { productId: 'indoor-p1-25-hd', value: 'P1.25', unit: 'mm' },
              { productId: 'indoor-p2-5-standard', value: 'P2.5', unit: 'mm' },
            ],
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockComparison,
        }),
      } as Response);

      const result = await ProductApi.compareProducts(productIds);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/products/compare'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ productIds }),
        })
      );
      expect(result.products).toHaveLength(2);
      expect(result.specifications).toHaveLength(1);
    });

    it('should throw error for insufficient products', async () => {
      await expect(ProductApi.compareProducts(['single-product'])).rejects.toThrow(ProductApiError);
    });

    it('should throw error for too many products', async () => {
      const tooManyIds = Array.from({ length: 6 }, (_, i) => `product-${i}`);
      await expect(ProductApi.compareProducts(tooManyIds)).rejects.toThrow(ProductApiError);
    });
  });

  describe('checkSkuAvailability', () => {
    it('should check SKU availability', async () => {
      const sku = 'NEW-SKU-001';

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { available: true },
        }),
      } as Response);

      const result = await ProductApi.checkSkuAvailability(sku);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(`/api/products/check-sku?sku=${sku}`),
        expect.any(Object)
      );
      expect(result).toBe(true);
    });

    it('should check SKU availability with exclusion', async () => {
      const sku = 'EXISTING-SKU';
      const excludeId = 'product-to-exclude';

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { available: false },
        }),
      } as Response);

      const result = await ProductApi.checkSkuAvailability(sku, excludeId);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(`sku=${sku}&exclude=${excludeId}`),
        expect.any(Object)
      );
      expect(result).toBe(false);
    });

    it('should throw error for missing SKU', async () => {
      await expect(ProductApi.checkSkuAvailability('')).rejects.toThrow(ProductApiError);
    });
  });
});

describe('ProductCategoryApi', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe('getCategories', () => {
    it('should fetch active categories by default', async () => {
      const activeCategories = mockCategories.filter(c => c.isActive);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: activeCategories,
        }),
      } as Response);

      const result = await ProductCategoryApi.getCategories();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/categories?'),
        expect.any(Object)
      );
      expect(result).toHaveLength(activeCategories.length);
    });

    it('should fetch all categories including inactive', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockCategories,
        }),
      } as Response);

      const result = await ProductCategoryApi.getCategories(true);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('includeInactive=true'),
        expect.any(Object)
      );
      expect(result).toHaveLength(mockCategories.length);
    });
  });

  describe('getCategoryTree', () => {
    it('should fetch category tree', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockCategories,
        }),
      } as Response);

      const result = await ProductCategoryApi.getCategoryTree();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/categories/tree'),
        expect.any(Object)
      );
      expect(result).toEqual(mockCategories);
    });
  });

  describe('getCategory', () => {
    it('should fetch single category', async () => {
      const categoryId = 'indoor';
      const mockCategory = mockCategories.find(c => c.id === categoryId)!;

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockCategory,
        }),
      } as Response);

      const result = await ProductCategoryApi.getCategory(categoryId);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(`/api/categories/${categoryId}`),
        expect.any(Object)
      );
      expect(result.id).toBe(categoryId);
    });

    it('should throw error for missing category ID', async () => {
      await expect(ProductCategoryApi.getCategory('')).rejects.toThrow(ProductApiError);
    });
  });

  describe('getCategoryBySlug', () => {
    it('should fetch category by slug', async () => {
      const slug = 'indoor';
      const mockCategory = mockCategories.find(c => c.slug === slug)!;

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockCategory,
        }),
      } as Response);

      const result = await ProductCategoryApi.getCategoryBySlug(slug);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(`/api/categories/slug/${slug}`),
        expect.any(Object)
      );
      expect(result.slug).toBe(slug);
    });

    it('should throw error for missing slug', async () => {
      await expect(ProductCategoryApi.getCategoryBySlug('')).rejects.toThrow(ProductApiError);
    });
  });
});

describe('ProductApiError', () => {
  it('should create error with all properties', () => {
    const error = new ProductApiError('Test error', 400, 'TEST_ERROR', { field: 'test' });
    
    expect(error.message).toBe('Test error');
    expect(error.statusCode).toBe(400);
    expect(error.code).toBe('TEST_ERROR');
    expect(error.details).toEqual({ field: 'test' });
    expect(error.name).toBe('ProductApiError');
  });

  it('should be instance of Error', () => {
    const error = new ProductApiError('Test error', 400, 'TEST_ERROR');
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ProductApiError);
  });
});