/**
 * 产品API接口集成测试
 */
import { createMocks } from 'node-mocks-http';
import handler from '@/pages/api/products/index';
import { Product } from '@/types/product';

describe('/api/products', () => {
  describe('GET /api/products', () => {
    it('returns products list successfully', async () => {
      const { req, res } = createMocks({
        method: 'GET',
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      
      const data = JSON.parse(res._getData());
      expect(data).toHaveProperty('products');
      expect(Array.isArray(data.products)).toBe(true);
      expect(data).toHaveProperty('total');
      expect(data).toHaveProperty('page');
      expect(data).toHaveProperty('limit');
    });

    it('filters products by category', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: {
          category: 'Indoor LED',
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      
      const data = JSON.parse(res._getData());
      expect(data.products.every((product: Product) => 
        product.category === 'Indoor LED'
      )).toBe(true);
    });

    it('searches products by name', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: {
          search: 'P2.5',
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      
      const data = JSON.parse(res._getData());
      expect(data.products.some((product: Product) => 
        product.name.includes('P2.5')
      )).toBe(true);
    });

    it('paginates products correctly', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: {
          page: '2',
          limit: '5',
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      
      const data = JSON.parse(res._getData());
      expect(data.page).toBe(2);
      expect(data.limit).toBe(5);
      expect(data.products.length).toBeLessThanOrEqual(5);
    });

    it('sorts products by price', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: {
          sortBy: 'price',
          sortOrder: 'asc',
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      
      const data = JSON.parse(res._getData());
      const prices = data.products.map((product: Product) => product.price.basePrice);
      const sortedPrices = [...prices].sort((a, b) => a - b);
      expect(prices).toEqual(sortedPrices);
    });

    it('handles invalid query parameters', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: {
          page: 'invalid',
          limit: 'invalid',
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      
      const data = JSON.parse(res._getData());
      expect(data.page).toBe(1); // Should default to 1
      expect(data.limit).toBe(10); // Should default to 10
    });
  });

  describe('POST /api/products', () => {
    it('creates a new product successfully', async () => {
      const productData = {
        name: 'Test Product',
        slug: 'test-product',
        description: 'Test product description',
        shortDescription: 'Test product',
        category: 'Indoor LED',
        subcategory: 'Fine Pitch',
        tags: ['test', 'indoor'],
        status: 'draft',
        featured: false,
        availability: 'in_stock',
        price: {
          basePrice: 100,
          currency: 'USD',
          unit: 'sqm',
          priceRanges: [],
        },
        specifications: {
          pixelPitch: '2.5mm',
          brightness: '800 nits',
        },
        images: [],
        documents: [],
        seo: {
          metaTitle: 'Test Product',
          metaDescription: 'Test product description',
          keywords: ['test'],
        },
        inventory: {
          stock: 100,
          reserved: 0,
          available: 100,
          reorderLevel: 10,
          supplier: 'Test Supplier',
        },
      };

      const { req, res } = createMocks({
        method: 'POST',
        body: productData,
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(201);
      
      const data = JSON.parse(res._getData());
      expect(data).toHaveProperty('product');
      expect(data.product.name).toBe(productData.name);
      expect(data.product).toHaveProperty('id');
      expect(data.product).toHaveProperty('createdAt');
      expect(data.product).toHaveProperty('updatedAt');
    });

    it('validates required fields', async () => {
      const invalidProductData = {
        name: '', // Missing required field
        description: '', // Missing required field
      };

      const { req, res } = createMocks({
        method: 'POST',
        body: invalidProductData,
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      
      const data = JSON.parse(res._getData());
      expect(data).toHaveProperty('error');
      expect(data).toHaveProperty('details');
    });

    it('handles duplicate slug', async () => {
      const productData = {
        name: 'Test Product',
        slug: 'p2-5-indoor-led-display', // Existing slug
        description: 'Test product description',
        category: 'Indoor LED',
        price: {
          basePrice: 100,
          currency: 'USD',
          unit: 'sqm',
        },
      };

      const { req, res } = createMocks({
        method: 'POST',
        body: productData,
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(409);
      
      const data = JSON.parse(res._getData());
      expect(data).toHaveProperty('error');
      expect(data.error).toContain('slug');
    });
  });

  describe('Unsupported methods', () => {
    it('returns 405 for unsupported methods', async () => {
      const { req, res } = createMocks({
        method: 'DELETE',
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(405);
      
      const data = JSON.parse(res._getData());
      expect(data).toHaveProperty('error');
      expect(data.error).toContain('Method not allowed');
    });
  });
});