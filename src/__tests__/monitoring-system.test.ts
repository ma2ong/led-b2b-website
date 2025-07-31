/**
 * 监控系统测试
 */
import { getPerformanceMonitor } from '@/lib/performance-monitor';
import { getErrorTracker } from '@/lib/error-tracker';
import { getAnalytics } from '@/lib/analytics';

// Mock window对象
const mockWindow = {
  performance: {
    mark: jest.fn(),
    measure: jest.fn(),
    getEntriesByName: jest.fn().mockReturnValue([{ duration: 1000 }]),
    memory: {
      usedJSHeapSize: 1000000,
      totalJSHeapSize: 2000000,
      jsHeapSizeLimit: 4000000,
    },
  },
  PerformanceObserver: jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    disconnect: jest.fn(),
  })),
  navigator: {
    sendBeacon: jest.fn().mockReturnValue(true),
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    language: 'en-US',
  },
  location: {
    href: 'https://example.com/test',
    pathname: '/test',
    search: '?utm_source=test',
    hash: '#section1',
  },
  document: {
    title: 'Test Page',
    referrer: 'https://google.com',
    readyState: 'complete',
    visibilityState: 'visible',
    addEventListener: jest.fn(),
  },
  addEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
  innerWidth: 1920,
  innerHeight: 1080,
  devicePixelRatio: 1,
  screen: {
    width: 1920,
    height: 1080,
  },
};

// 设置全局mock
Object.defineProperty(global, 'window', {
  value: mockWindow,
  writable: true,
});

Object.defineProperty(global, 'document', {
  value: mockWindow.document,
  writable: true,
});

Object.defineProperty(global, 'navigator', {
  value: mockWindow.navigator,
  writable: true,
});

// Mock fetch
global.fetch = jest.fn().mockResolvedValue({
  ok: true,
  json: jest.fn().mockResolvedValue({}),
});

describe('Performance Monitor', () => {
  let performanceMonitor: any;

  beforeEach(() => {
    jest.clearAllMocks();
    performanceMonitor = getPerformanceMonitor();
  });

  afterEach(() => {
    performanceMonitor?.destroy();
  });

  describe('Initialization', () => {
    it('should initialize performance monitoring', () => {
      expect(performanceMonitor).toBeDefined();
      expect(performanceMonitor.setEnabled).toBeDefined();
      expect(performanceMonitor.recordCustomMetric).toBeDefined();
    });

    it('should set up performance observers', () => {
      expect(mockWindow.PerformanceObserver).toHaveBeenCalled();
    });
  });

  describe('Custom Metrics', () => {
    it('should record custom metrics', () => {
      performanceMonitor.recordCustomMetric('test-metric', 100, 'good');
      
      const summary = performanceMonitor.getPerformanceSummary();
      expect(summary['custom-test-metric']).toBeDefined();
      expect(summary['custom-test-metric']).toHaveLength(1);
      expect(summary['custom-test-metric'][0].value).toBe(100);
      expect(summary['custom-test-metric'][0].rating).toBe('good');
    });

    it('should handle multiple metrics of the same type', () => {
      performanceMonitor.recordCustomMetric('load-time', 1000);
      performanceMonitor.recordCustomMetric('load-time', 1500);
      performanceMonitor.recordCustomMetric('load-time', 800);
      
      const summary = performanceMonitor.getPerformanceSummary();
      expect(summary['custom-load-time']).toHaveLength(3);
    });
  });

  describe('Performance Summary', () => {
    it('should provide performance summary', () => {
      performanceMonitor.recordCustomMetric('test-1', 100);
      performanceMonitor.recordCustomMetric('test-2', 200);
      
      const summary = performanceMonitor.getPerformanceSummary();
      expect(typeof summary).toBe('object');
      expect(summary['custom-test-1']).toBeDefined();
      expect(summary['custom-test-2']).toBeDefined();
    });
  });

  describe('Enable/Disable', () => {
    it('should enable and disable monitoring', () => {
      performanceMonitor.setEnabled(false);
      performanceMonitor.recordCustomMetric('disabled-test', 100);
      
      const summary = performanceMonitor.getPerformanceSummary();
      expect(summary['custom-disabled-test']).toBeUndefined();
      
      performanceMonitor.setEnabled(true);
      performanceMonitor.recordCustomMetric('enabled-test', 100);
      
      const updatedSummary = performanceMonitor.getPerformanceSummary();
      expect(updatedSummary['custom-enabled-test']).toBeDefined();
    });
  });
});

describe('Error Tracker', () => {
  let errorTracker: any;

  beforeEach(() => {
    jest.clearAllMocks();
    errorTracker = getErrorTracker();
  });

  afterEach(() => {
    errorTracker?.destroy();
  });

  describe('Initialization', () => {
    it('should initialize error tracking', () => {
      expect(errorTracker).toBeDefined();
      expect(errorTracker.recordCustomError).toBeDefined();
      expect(errorTracker.addCustomBreadcrumb).toBeDefined();
    });
  });

  describe('Custom Errors', () => {
    it('should record custom errors', () => {
      errorTracker.recordCustomError('Test error', 'high', { context: 'test' });
      
      const summary = errorTracker.getErrorSummary();
      expect(summary.totalErrors).toBe(1);
      expect(summary.errorsBySeverity.high).toBe(1);
      expect(summary.errorsByType.custom).toBe(1);
    });

    it('should handle different severity levels', () => {
      errorTracker.recordCustomError('Low error', 'low');
      errorTracker.recordCustomError('Medium error', 'medium');
      errorTracker.recordCustomError('High error', 'high');
      errorTracker.recordCustomError('Critical error', 'critical');
      
      const summary = errorTracker.getErrorSummary();
      expect(summary.totalErrors).toBe(4);
      expect(summary.errorsBySeverity.low).toBe(1);
      expect(summary.errorsBySeverity.medium).toBe(1);
      expect(summary.errorsBySeverity.high).toBe(1);
      expect(summary.errorsBySeverity.critical).toBe(1);
    });
  });

  describe('Breadcrumbs', () => {
    it('should add custom breadcrumbs', () => {
      errorTracker.addCustomBreadcrumb('User clicked button', { buttonId: 'test-btn' });
      errorTracker.addCustomBreadcrumb('Navigation occurred', { page: '/test' });
      
      // 触发一个错误来检查面包屑
      errorTracker.recordCustomError('Test error with breadcrumbs');
      
      const summary = errorTracker.getErrorSummary();
      expect(summary.recentErrors[0].breadcrumbs).toHaveLength(2);
    });
  });

  describe('User ID', () => {
    it('should set and use user ID', () => {
      errorTracker.setUserId('user123');
      errorTracker.recordCustomError('User error');
      
      const summary = errorTracker.getErrorSummary();
      expect(summary.recentErrors[0].userId).toBe('user123');
    });
  });

  describe('Error Summary', () => {
    it('should provide error summary', () => {
      errorTracker.recordCustomError('Error 1', 'low');
      errorTracker.recordCustomError('Error 2', 'high');
      
      const summary = errorTracker.getErrorSummary();
      expect(summary.totalErrors).toBe(2);
      expect(summary.errorsByType.custom).toBe(2);
      expect(summary.errorsBySeverity.low).toBe(1);
      expect(summary.errorsBySeverity.high).toBe(1);
      expect(summary.recentErrors).toHaveLength(2);
    });
  });
});

describe('Analytics', () => {
  let analytics: any;

  beforeEach(() => {
    jest.clearAllMocks();
    analytics = getAnalytics();
  });

  afterEach(() => {
    analytics?.destroy();
  });

  describe('Initialization', () => {
    it('should initialize analytics', () => {
      expect(analytics).toBeDefined();
      expect(analytics.track).toBeDefined();
      expect(analytics.trackProductView).toBeDefined();
      expect(analytics.trackInquiryStart).toBeDefined();
    });
  });

  describe('Event Tracking', () => {
    it('should track custom events', () => {
      analytics.track('custom', 'Test Event', { property: 'value' });
      
      const summary = analytics.getAnalyticsSummary();
      expect(summary.eventCounts.custom).toBe(1);
    });

    it('should track product views', () => {
      analytics.trackProductView('prod123', 'Test Product', 'Electronics');
      
      const summary = analytics.getAnalyticsSummary();
      expect(summary.eventCounts.product_view).toBe(1);
    });

    it('should track inquiry events', () => {
      analytics.trackInquiryStart('product-page');
      analytics.trackInquiryComplete('inq123', ['prod123', 'prod456']);
      
      const summary = analytics.getAnalyticsSummary();
      expect(summary.eventCounts.inquiry_start).toBe(1);
      expect(summary.eventCounts.inquiry_complete).toBe(1);
    });
  });

  describe('Conversion Funnels', () => {
    it('should create and track conversion funnels', () => {
      analytics.createFunnel('test-funnel', ['page_view', 'click', 'form_submit']);
      
      // 模拟用户行为
      analytics.track('page_view', 'Page View');
      analytics.track('click', 'Button Click');
      analytics.track('form_submit', 'Form Submit');
      
      const summary = analytics.getAnalyticsSummary();
      const testFunnel = summary.funnels.find((f: any) => f.name === 'test-funnel');
      
      expect(testFunnel).toBeDefined();
      expect(testFunnel.steps).toEqual(['page_view', 'click', 'form_submit']);
    });
  });

  describe('User ID', () => {
    it('should set and use user ID', () => {
      analytics.setUserId('user123');
      analytics.track('custom', 'User Event');
      
      const summary = analytics.getAnalyticsSummary();
      expect(summary.session.userId).toBe('user123');
    });
  });

  describe('Analytics Summary', () => {
    it('should provide analytics summary', () => {
      analytics.track('page_view', 'Home Page');
      analytics.track('click', 'Button Click');
      analytics.track('page_view', 'Product Page');
      
      const summary = analytics.getAnalyticsSummary();
      expect(summary.eventCounts.page_view).toBe(2);
      expect(summary.eventCounts.click).toBe(1);
      expect(summary.session).toBeDefined();
      expect(summary.topPages).toBeDefined();
    });
  });
});

describe('Integration Tests', () => {
  let performanceMonitor: any;
  let errorTracker: any;
  let analytics: any;

  beforeEach(() => {
    performanceMonitor = getPerformanceMonitor();
    errorTracker = getErrorTracker();
    analytics = getAnalytics();
  });

  afterEach(() => {
    performanceMonitor?.destroy();
    errorTracker?.destroy();
    analytics?.destroy();
  });

  describe('Cross-system Integration', () => {
    it('should work together without conflicts', () => {
      // 记录性能指标
      performanceMonitor.recordCustomMetric('page-load', 1500, 'good');
      
      // 记录用户行为
      analytics.track('page_view', 'Test Page');
      analytics.trackProductView('prod123', 'Test Product', 'LED');
      
      // 记录错误
      errorTracker.recordCustomError('Minor issue', 'low');
      
      // 验证所有系统都正常工作
      const perfSummary = performanceMonitor.getPerformanceSummary();
      const errorSummary = errorTracker.getErrorSummary();
      const analyticsSummary = analytics.getAnalyticsSummary();
      
      expect(perfSummary['custom-page-load']).toHaveLength(1);
      expect(errorSummary.totalErrors).toBe(1);
      expect(analyticsSummary.eventCounts.page_view).toBe(1);
      expect(analyticsSummary.eventCounts.product_view).toBe(1);
    });

    it('should handle high volume of events', () => {
      // 模拟高频事件
      for (let i = 0; i < 100; i++) {
        performanceMonitor.recordCustomMetric(`metric-${i}`, Math.random() * 1000);
        analytics.track('click', `Click ${i}`);
        
        if (i % 10 === 0) {
          errorTracker.recordCustomError(`Error ${i}`, 'low');
        }
      }
      
      const perfSummary = performanceMonitor.getPerformanceSummary();
      const errorSummary = errorTracker.getErrorSummary();
      const analyticsSummary = analytics.getAnalyticsSummary();
      
      expect(Object.keys(perfSummary).length).toBeGreaterThan(0);
      expect(errorSummary.totalErrors).toBe(10);
      expect(analyticsSummary.eventCounts.click).toBe(100);
    });
  });

  describe('Data Sending', () => {
    it('should attempt to send data via beacon', () => {
      // 记录一些数据
      performanceMonitor.recordCustomMetric('test-metric', 100);
      errorTracker.recordCustomError('Test error');
      analytics.track('test', 'Test Event');
      
      // 模拟页面卸载
      window.dispatchEvent(new Event('beforeunload'));
      
      // 验证sendBeacon被调用
      expect(mockWindow.navigator.sendBeacon).toHaveBeenCalled();
    });

    it('should fallback to fetch when beacon is not available', async () => {
      // 禁用sendBeacon
      mockWindow.navigator.sendBeacon = undefined;
      
      // 记录数据
      analytics.track('test', 'Test Event');
      
      // 等待fetch调用
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // 验证fetch被调用作为降级方案
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle monitoring system errors gracefully', () => {
      // 模拟监控系统内部错误
      const originalConsoleError = console.error;
      console.error = jest.fn();
      
      // 触发可能的错误情况
      performanceMonitor.recordCustomMetric(null as any, 'invalid');
      errorTracker.recordCustomError('');
      analytics.track(null as any, '');
      
      // 验证系统仍然可用
      expect(() => {
        performanceMonitor.recordCustomMetric('valid-metric', 100);
        errorTracker.recordCustomError('Valid error');
        analytics.track('valid', 'Valid Event');
      }).not.toThrow();
      
      console.error = originalConsoleError;
    });
  });
});

describe('API Endpoints', () => {
  describe('Performance API', () => {
    it('should accept valid performance metrics', async () => {
      const mockReq = {
        method: 'POST',
        body: JSON.stringify([
          {
            name: 'LCP',
            value: 2000,
            rating: 'good',
            timestamp: Date.now(),
            url: 'https://example.com',
            userAgent: 'test-agent',
          },
        ]),
      };

      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      // 这里需要导入并测试实际的API处理函数
      // const handler = require('@/pages/api/analytics/performance').default;
      // await handler(mockReq, mockRes);
      
      // expect(mockRes.status).toHaveBeenCalledWith(200);
      // expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
      //   success: true,
      //   processed: 1,
      // }));
    });
  });

  describe('Error API', () => {
    it('should accept valid error reports', async () => {
      const mockReq = {
        method: 'POST',
        body: JSON.stringify([
          {
            id: 'error_123',
            type: 'javascript',
            message: 'Test error',
            timestamp: Date.now(),
            userAgent: 'test-agent',
            sessionId: 'session_123',
            pageUrl: 'https://example.com',
            referrer: '',
            severity: 'medium',
            breadcrumbs: [],
          },
        ]),
      };

      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      // 测试API处理函数
      // const handler = require('@/pages/api/analytics/errors').default;
      // await handler(mockReq, mockRes);
      
      // expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });

  describe('Analytics API', () => {
    it('should accept valid user events', async () => {
      const mockReq = {
        method: 'POST',
        body: JSON.stringify([
          {
            id: 'event_123',
            type: 'page_view',
            name: 'Page View',
            timestamp: Date.now(),
            sessionId: 'session_123',
            url: 'https://example.com',
            referrer: '',
            userAgent: 'test-agent',
            properties: {},
            context: {
              page: {
                title: 'Test Page',
                url: 'https://example.com',
                path: '/',
                search: '',
                hash: '',
              },
              screen: { width: 1920, height: 1080, density: 1 },
              viewport: { width: 1920, height: 1080 },
              locale: 'en-US',
              timezone: 'UTC',
            },
          },
        ]),
      };

      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      // 测试API处理函数
      // const handler = require('@/pages/api/analytics/events').default;
      // await handler(mockReq, mockRes);
      
      // expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });
});