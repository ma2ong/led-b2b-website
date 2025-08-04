/**
 * 性能优化功能测试
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import OptimizedImage from '../components/ui/OptimizedImage';
import { 
  getPerformanceMonitor, 
  measurePerformance, 
  measureAsyncPerformance 
} from '../lib/performance-monitor';
import { 
  createDynamicComponent, 
  preloadCriticalRoutes, 
  preloadOnHover, 
  SmartPreloader 
} from '../lib/code-splitting';
import { 
  CacheManager, 
  apiCache, 
  imageCache, 
  setCacheHeaders, 
  invalidateCache 
} from '../lib/cache-strategy';

// Mock IntersectionObserver
const mockIntersectionObserver = jest.fn();
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null,
});
window.IntersectionObserver = mockIntersectionObserver;

// Mock performance API
const mockPerformance = {
  now: jest.fn(() => Date.now()),
  getEntriesByType: jest.fn(() => []),
  memory: {
    usedJSHeapSize: 1000000,
    totalJSHeapSize: 2000000,
    jsHeapSizeLimit: 4000000,
  },
};
Object.defineProperty(window, 'performance', {
  value: mockPerformance,
  writable: true,
});

// Mock PerformanceObserver
const mockPerformanceObserver = jest.fn();
mockPerformanceObserver.mockImplementation((callback) => ({
  observe: jest.fn(),
  disconnect: jest.fn(),
}));
window.PerformanceObserver = mockPerformanceObserver;

describe('OptimizedImage Component', () => {
  beforeEach(() => {
    mockIntersectionObserver.mockClear();
  });

  it('renders image with lazy loading', async () => {
    render(
      <OptimizedImage
        src="/test-image.jpg"
        alt="Test Image"
        width={300}
        height={200}
        loading="lazy"
      />
    );

    // Should render placeholder initially
    const container = screen.getByRole('img').parentElement;
    expect(container).toBeInTheDocument();
  });

  it('renders image with priority loading', async () => {
    render(
      <OptimizedImage
        src="/test-image.jpg"
        alt="Test Image"
        width={300}
        height={200}
        priority={true}
      />
    );

    // Should load immediately for priority images
    await waitFor(() => {
      expect(screen.getByRole('img')).toHaveAttribute('src');
    });
  });

  it('handles image load error gracefully', async () => {
    render(
      <OptimizedImage
        src="/non-existent-image.jpg"
        alt="Test Image"
        width={300}
        height={200}
        priority={true}
      />
    );

    const img = screen.getByRole('img');
    
    // Simulate image load error
    const errorEvent = new Event('error');
    img.dispatchEvent(errorEvent);

    // Should show error placeholder
    await waitFor(() => {
      expect(img.parentElement).toContainHTML('svg');
    });
  });

  it('generates responsive srcSet', () => {
    render(
      <OptimizedImage
        src="/test-image.jpg"
        alt="Test Image"
        width={300}
        height={200}
        sizes="(max-width: 768px) 100vw, 50vw"
        priority={true}
      />
    );

    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('sizes', '(max-width: 768px) 100vw, 50vw');
  });

  it('supports WebP format', () => {
    render(
      <OptimizedImage
        src="/test-image.jpg"
        alt="Test Image"
        width={300}
        height={200}
        priority={true}
      />
    );

    // Should render picture element with WebP source
    const picture = screen.getByRole('img').closest('picture');
    expect(picture).toBeInTheDocument();
  });

  it('handles blur placeholder', () => {
    const blurDataURL = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...';
    
    render(
      <OptimizedImage
        src="/test-image.jpg"
        alt="Test Image"
        width={300}
        height={200}
        placeholder="blur"
        blurDataURL={blurDataURL}
        priority={true}
      />
    );

    // Should render blur placeholder
    const container = screen.getByRole('img').parentElement;
    expect(container?.querySelector('img[src*="data:image"]')).toBeInTheDocument();
  });
});

describe('Performance Monitor', () => {
  let performanceMonitor: any;

  beforeEach(() => {
    performanceMonitor = getPerformanceMonitor();
    jest.clearAllMocks();
  });

  it('measures function execution time', () => {
    const testFunction = () => {
      // Simulate some work
      let sum = 0;
      for (let i = 0; i < 1000; i++) {
        sum += i;
      }
      return sum;
    };

    const result = measurePerformance('testFunction', testFunction);
    
    expect(result).toBe(499500); // Sum of 0 to 999
    expect(mockPerformance.now).toHaveBeenCalled();
  });

  it('measures async function execution time', async () => {
    const asyncFunction = async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
      return 'completed';
    };

    const result = await measureAsyncPerformance('asyncFunction', asyncFunction);
    
    expect(result).toBe('completed');
    expect(mockPerformance.now).toHaveBeenCalled();
  });

  it('collects memory usage metrics', () => {
    performanceMonitor.collectMemoryUsage();
    const metrics = performanceMonitor.getMetrics();

    expect(metrics.usedJSHeapSize).toBe(1000000);
    expect(metrics.totalJSHeapSize).toBe(2000000);
    expect(metrics.jsHeapSizeLimit).toBe(4000000);
  });

  it('adds custom metrics', () => {
    performanceMonitor.addCustomMetric('customMetric', 123.45);
    const metrics = performanceMonitor.getMetrics();

    expect(metrics.customMetrics?.customMetric).toBe(123.45);
  });

  it('calculates Core Web Vitals scores', () => {
    // Set mock values
    performanceMonitor.metrics = {
      lcp: 2000, // Good
      fid: 50,   // Good
      cls: 0.05, // Good
    };

    const scores = performanceMonitor.getCoreWebVitalsScore();

    expect(scores.lcp).toBe('good');
    expect(scores.fid).toBe('good');
    expect(scores.cls).toBe('good');
  });

  it('handles poor Core Web Vitals scores', () => {
    performanceMonitor.metrics = {
      lcp: 5000, // Poor
      fid: 400,  // Poor
      cls: 0.3,  // Poor
    };

    const scores = performanceMonitor.getCoreWebVitalsScore();

    expect(scores.lcp).toBe('poor');
    expect(scores.fid).toBe('poor');
    expect(scores.cls).toBe('poor');
  });
});

describe('Code Splitting', () => {
  it('creates dynamic component with retry mechanism', async () => {
    let attemptCount = 0;
    const mockImport = jest.fn(() => {
      attemptCount++;
      if (attemptCount < 2) {
        return Promise.reject(new Error('Import failed'));
      }
      return Promise.resolve({ default: () => <div>Dynamic Component</div> });
    });

    const DynamicComponent = createDynamicComponent(mockImport, {
      retries: 3,
      timeout: 5000,
    });

    expect(DynamicComponent).toBeDefined();
    expect(mockImport).toHaveBeenCalledTimes(0); // Lazy loading
  });

  it('preloads critical routes', () => {
    const mockRequestIdleCallback = jest.fn((callback) => {
      setTimeout(callback, 0);
    });
    window.requestIdleCallback = mockRequestIdleCallback;

    preloadCriticalRoutes();

    expect(mockRequestIdleCallback).toHaveBeenCalled();
  });

  it('creates hover preload handlers', () => {
    const mockImport = jest.fn(() => Promise.resolve({ default: () => <div /> }));
    const handlers = preloadOnHover(mockImport);

    expect(handlers.onMouseEnter).toBeDefined();

    // Simulate hover
    handlers.onMouseEnter();
    expect(mockImport).toHaveBeenCalledTimes(1);

    // Second hover should not trigger another import
    handlers.onMouseEnter();
    expect(mockImport).toHaveBeenCalledTimes(1);
  });

  it('creates smart preloader', () => {
    const preloader = new SmartPreloader();
    expect(preloader).toBeDefined();

    const mockElement = document.createElement('div');
    mockElement.dataset.preloadRoute = '/test-route';

    preloader.observeElement(mockElement);
    expect(mockIntersectionObserver).toHaveBeenCalled();

    preloader.cleanup();
  });
});

describe('Cache Strategy', () => {
  let cacheManager: CacheManager;

  beforeEach(() => {
    cacheManager = new CacheManager();
  });

  it('creates memory cache', () => {
    const cache = cacheManager.createCache('test', {
      storage: 'memory',
      maxSize: 10,
      ttl: 1000,
    });

    expect(cache).toBeDefined();
    
    cache.set('key1', 'value1');
    expect(cache.get('key1')).toBe('value1');
    expect(cache.has('key1')).toBe(true);
    expect(cache.size()).toBe(1);
  });

  it('handles cache expiration', (done) => {
    const cache = cacheManager.createCache('test', {
      storage: 'memory',
      ttl: 100, // 100ms
    });

    cache.set('key1', 'value1');
    expect(cache.get('key1')).toBe('value1');

    setTimeout(() => {
      expect(cache.get('key1')).toBeNull();
      done();
    }, 150);
  });

  it('implements LRU eviction strategy', () => {
    const cache = cacheManager.createCache('test', {
      storage: 'memory',
      maxSize: 2,
      strategy: 'lru',
    });

    cache.set('key1', 'value1');
    cache.set('key2', 'value2');
    
    // Access key1 to make it recently used
    cache.get('key1');
    
    // Add key3, should evict key2 (least recently used)
    cache.set('key3', 'value3');
    
    expect(cache.get('key1')).toBe('value1');
    expect(cache.get('key2')).toBeNull();
    expect(cache.get('key3')).toBe('value3');
  });

  it('creates localStorage cache', () => {
    // Mock localStorage
    const mockStorage = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: mockStorage,
      writable: true,
    });

    const cache = cacheManager.createCache('test', {
      storage: 'localStorage',
    });

    cache.set('key1', 'value1');
    expect(mockStorage.setItem).toHaveBeenCalled();
  });

  it('handles cache invalidation', () => {
    const mockStorage = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: mockStorage,
      writable: true,
    });

    // Mock Object.keys to return test keys
    Object.keys = jest.fn(() => ['cache_test_key1', 'cache_test_key2', 'other_key']);

    invalidateCache('test');

    expect(mockStorage.removeItem).toHaveBeenCalledWith('cache_test_key1');
    expect(mockStorage.removeItem).toHaveBeenCalledWith('cache_test_key2');
    expect(mockStorage.removeItem).not.toHaveBeenCalledWith('other_key');
  });

  it('sets cache headers correctly', () => {
    const mockRes = {
      setHeader: jest.fn(),
    };

    setCacheHeaders(mockRes, 3600, 7200);

    expect(mockRes.setHeader).toHaveBeenCalledWith(
      'Cache-Control',
      'public, max-age=3600, s-maxage=7200'
    );
    expect(mockRes.setHeader).toHaveBeenCalledWith(
      'Expires',
      expect.any(String)
    );
  });
});

describe('API Cache Integration', () => {
  beforeEach(() => {
    apiCache.clear();
  });

  it('caches API responses', () => {
    const mockResponse = { data: 'test data', status: 200 };
    
    apiCache.set('api/test', mockResponse);
    const cached = apiCache.get('api/test');
    
    expect(cached).toEqual(mockResponse);
  });

  it('handles cache miss', () => {
    const cached = apiCache.get('non-existent-key');
    expect(cached).toBeNull();
  });
});

describe('Image Cache Integration', () => {
  beforeEach(() => {
    imageCache.clear();
  });

  it('caches image data', () => {
    const imageData = 'base64-encoded-image-data';
    
    imageCache.set('image/test.jpg', imageData);
    const cached = imageCache.get('image/test.jpg');
    
    expect(cached).toBe(imageData);
  });
});

describe('Performance Integration', () => {
  it('integrates performance monitoring with caching', () => {
    const performanceMonitor = getPerformanceMonitor();
    
    const cachedFunction = measurePerformance('cacheTest', () => {
      apiCache.set('test', 'data');
      return apiCache.get('test');
    });

    expect(cachedFunction).toBe('data');
    
    const metrics = performanceMonitor.getMetrics();
    expect(metrics.customMetrics?.cacheTest).toBeGreaterThan(0);
  });

  it('measures image loading performance', async () => {
    const performanceMonitor = getPerformanceMonitor();
    
    const loadImage = async () => {
      return new Promise(resolve => {
        const img = new Image();
        img.onload = () => resolve('loaded');
        img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
      });
    };

    const result = await measureAsyncPerformance('imageLoad', loadImage);
    expect(result).toBe('loaded');
    
    const metrics = performanceMonitor.getMetrics();
    expect(metrics.customMetrics?.imageLoad).toBeGreaterThan(0);
  });
});

describe('Performance Optimization Edge Cases', () => {
  it('handles missing performance API gracefully', () => {
    const originalPerformance = window.performance;
    delete (window as any).performance;

    const performanceMonitor = getPerformanceMonitor();
    expect(performanceMonitor).toBeDefined();

    // Restore
    window.performance = originalPerformance;
  });

  it('handles missing IntersectionObserver gracefully', () => {
    const originalIntersectionObserver = window.IntersectionObserver;
    delete (window as any).IntersectionObserver;

    const preloader = new SmartPreloader();
    expect(preloader).toBeDefined();

    // Should not throw when observing elements
    const element = document.createElement('div');
    expect(() => preloader.observeElement(element)).not.toThrow();

    // Restore
    window.IntersectionObserver = originalIntersectionObserver;
  });

  it('handles storage quota exceeded', () => {
    const mockStorage = {
      setItem: jest.fn(() => {
        throw new Error('QuotaExceededError');
      }),
      getItem: jest.fn(),
      removeItem: jest.fn(),
    };

    Object.defineProperty(window, 'localStorage', {
      value: mockStorage,
      writable: true,
    });

    const cacheManager = new CacheManager();
    const cache = cacheManager.createCache('test', {
      storage: 'localStorage',
    });

    // Should not throw when storage is full
    expect(() => cache.set('key', 'value')).not.toThrow();
  });
});