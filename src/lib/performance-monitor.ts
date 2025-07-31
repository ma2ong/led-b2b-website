/**
 * 性能监控工具
 * 监控Core Web Vitals和其他性能指标
 */

interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
  url: string;
  userAgent: string;
}

interface WebVitalsMetric {
  id: string;
  name: 'CLS' | 'FID' | 'FCP' | 'LCP' | 'TTFB';
  value: number;
  delta: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  entries: PerformanceEntry[];
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private observers: PerformanceObserver[] = [];
  private isEnabled: boolean = true;
  private apiEndpoint: string = '/api/analytics/performance';

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeMonitoring();
    }
  }

  /**
   * 初始化性能监控
   */
  private initializeMonitoring(): void {
    // 监控Core Web Vitals
    this.initWebVitals();
    
    // 监控资源加载性能
    this.initResourceTiming();
    
    // 监控导航性能
    this.initNavigationTiming();
    
    // 监控长任务
    this.initLongTaskTiming();
    
    // 监控内存使用
    this.initMemoryMonitoring();
    
    // 页面卸载时发送数据
    this.initBeaconSending();
  }

  /**
   * 初始化Web Vitals监控
   */
  private initWebVitals(): void {
    if ('web-vitals' in window) {
      // 如果已经加载了web-vitals库
      this.setupWebVitalsListeners();
    } else {
      // 动态加载web-vitals库
      import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
        getCLS(this.onWebVital.bind(this));
        getFID(this.onWebVital.bind(this));
        getFCP(this.onWebVital.bind(this));
        getLCP(this.onWebVital.bind(this));
        getTTFB(this.onWebVital.bind(this));
      }).catch(error => {
        console.warn('Failed to load web-vitals:', error);
      });
    }
  }

  /**
   * Web Vitals回调函数
   */
  private onWebVital(metric: WebVitalsMetric): void {
    const performanceMetric: PerformanceMetric = {
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    this.recordMetric(performanceMetric);
    
    // 实时发送关键指标
    if (metric.name === 'LCP' || metric.name === 'FID' || metric.name === 'CLS') {
      this.sendMetricImmediately(performanceMetric);
    }
  }

  /**
   * 初始化资源加载时间监控
   */
  private initResourceTiming(): void {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'resource') {
            this.analyzeResourceTiming(entry as PerformanceResourceTiming);
          }
        });
      });

      observer.observe({ entryTypes: ['resource'] });
      this.observers.push(observer);
    }
  }

  /**
   * 分析资源加载性能
   */
  private analyzeResourceTiming(entry: PerformanceResourceTiming): void {
    const duration = entry.responseEnd - entry.startTime;
    const size = entry.transferSize || 0;
    
    // 记录慢资源
    if (duration > 1000) { // 超过1秒的资源
      this.recordMetric({
        name: 'slow-resource',
        value: duration,
        rating: duration > 3000 ? 'poor' : 'needs-improvement',
        timestamp: Date.now(),
        url: entry.name,
        userAgent: navigator.userAgent,
      });
    }

    // 记录大文件
    if (size > 1024 * 1024) { // 超过1MB的文件
      this.recordMetric({
        name: 'large-resource',
        value: size,
        rating: size > 5 * 1024 * 1024 ? 'poor' : 'needs-improvement',
        timestamp: Date.now(),
        url: entry.name,
        userAgent: navigator.userAgent,
      });
    }
  }

  /**
   * 初始化导航时间监控
   */
  private initNavigationTiming(): void {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'navigation') {
            this.analyzeNavigationTiming(entry as PerformanceNavigationTiming);
          }
        });
      });

      observer.observe({ entryTypes: ['navigation'] });
      this.observers.push(observer);
    }
  }

  /**
   * 分析导航性能
   */
  private analyzeNavigationTiming(entry: PerformanceNavigationTiming): void {
    const metrics = {
      'dns-lookup': entry.domainLookupEnd - entry.domainLookupStart,
      'tcp-connect': entry.connectEnd - entry.connectStart,
      'ssl-handshake': entry.connectEnd - entry.secureConnectionStart,
      'ttfb': entry.responseStart - entry.requestStart,
      'dom-content-loaded': entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
      'load-complete': entry.loadEventEnd - entry.loadEventStart,
    };

    Object.entries(metrics).forEach(([name, value]) => {
      if (value > 0) {
        this.recordMetric({
          name,
          value,
          rating: this.getRatingForNavigationMetric(name, value),
          timestamp: Date.now(),
          url: window.location.href,
          userAgent: navigator.userAgent,
        });
      }
    });
  }

  /**
   * 获取导航指标的评级
   */
  private getRatingForNavigationMetric(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
    const thresholds: { [key: string]: { good: number; poor: number } } = {
      'dns-lookup': { good: 100, poor: 300 },
      'tcp-connect': { good: 100, poor: 300 },
      'ssl-handshake': { good: 100, poor: 300 },
      'ttfb': { good: 200, poor: 600 },
      'dom-content-loaded': { good: 1000, poor: 3000 },
      'load-complete': { good: 2000, poor: 5000 },
    };

    const threshold = thresholds[name];
    if (!threshold) return 'good';

    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  }

  /**
   * 初始化长任务监控
   */
  private initLongTaskTiming(): void {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'longtask') {
            this.recordMetric({
              name: 'long-task',
              value: entry.duration,
              rating: entry.duration > 100 ? 'poor' : 'needs-improvement',
              timestamp: Date.now(),
              url: window.location.href,
              userAgent: navigator.userAgent,
            });
          }
        });
      });

      try {
        observer.observe({ entryTypes: ['longtask'] });
        this.observers.push(observer);
      } catch (error) {
        console.warn('Long task monitoring not supported:', error);
      }
    }
  }

  /**
   * 初始化内存监控
   */
  private initMemoryMonitoring(): void {
    if ('memory' in performance) {
      const checkMemory = () => {
        const memory = (performance as any).memory;
        const usedMemory = memory.usedJSHeapSize;
        const totalMemory = memory.totalJSHeapSize;
        const memoryLimit = memory.jsHeapSizeLimit;

        const memoryUsageRatio = usedMemory / memoryLimit;

        this.recordMetric({
          name: 'memory-usage',
          value: memoryUsageRatio * 100,
          rating: memoryUsageRatio > 0.9 ? 'poor' : memoryUsageRatio > 0.7 ? 'needs-improvement' : 'good',
          timestamp: Date.now(),
          url: window.location.href,
          userAgent: navigator.userAgent,
        });
      };

      // 每30秒检查一次内存使用情况
      setInterval(checkMemory, 30000);
      
      // 页面加载完成后立即检查一次
      if (document.readyState === 'complete') {
        checkMemory();
      } else {
        window.addEventListener('load', checkMemory);
      }
    }
  }

  /**
   * 初始化Beacon发送
   */
  private initBeaconSending(): void {
    // 页面卸载时发送数据
    window.addEventListener('beforeunload', () => {
      this.sendMetricsBeacon();
    });

    // 页面隐藏时发送数据
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.sendMetricsBeacon();
      }
    });

    // 定期发送数据（每5分钟）
    setInterval(() => {
      this.sendMetricsBatch();
    }, 5 * 60 * 1000);
  }

  /**
   * 记录性能指标
   */
  private recordMetric(metric: PerformanceMetric): void {
    if (!this.isEnabled) return;

    this.metrics.push(metric);

    // 限制内存中保存的指标数量
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-500);
    }

    // 触发自定义事件
    window.dispatchEvent(new CustomEvent('performance-metric', {
      detail: metric
    }));
  }

  /**
   * 立即发送单个指标
   */
  private sendMetricImmediately(metric: PerformanceMetric): void {
    if (navigator.sendBeacon) {
      const data = JSON.stringify([metric]);
      navigator.sendBeacon(this.apiEndpoint, data);
    }
  }

  /**
   * 批量发送指标
   */
  private sendMetricsBatch(): void {
    if (this.metrics.length === 0) return;

    const data = JSON.stringify(this.metrics);
    
    if (navigator.sendBeacon) {
      navigator.sendBeacon(this.apiEndpoint, data);
    } else {
      // 降级到fetch
      fetch(this.apiEndpoint, {
        method: 'POST',
        body: data,
        headers: {
          'Content-Type': 'application/json',
        },
        keepalive: true,
      }).catch(error => {
        console.warn('Failed to send performance metrics:', error);
      });
    }

    this.metrics = [];
  }

  /**
   * 使用Beacon发送指标
   */
  private sendMetricsBeacon(): void {
    if (this.metrics.length === 0) return;

    const data = JSON.stringify(this.metrics);
    
    if (navigator.sendBeacon) {
      navigator.sendBeacon(this.apiEndpoint, data);
      this.metrics = [];
    }
  }

  /**
   * 手动记录自定义指标
   */
  public recordCustomMetric(name: string, value: number, rating?: 'good' | 'needs-improvement' | 'poor'): void {
    this.recordMetric({
      name: `custom-${name}`,
      value,
      rating: rating || 'good',
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    });
  }

  /**
   * 获取当前性能摘要
   */
  public getPerformanceSummary(): { [key: string]: PerformanceMetric[] } {
    const summary: { [key: string]: PerformanceMetric[] } = {};
    
    this.metrics.forEach(metric => {
      if (!summary[metric.name]) {
        summary[metric.name] = [];
      }
      summary[metric.name].push(metric);
    });

    return summary;
  }

  /**
   * 启用/禁用监控
   */
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    
    if (!enabled) {
      // 清理观察者
      this.observers.forEach(observer => observer.disconnect());
      this.observers = [];
    } else if (this.observers.length === 0) {
      // 重新初始化监控
      this.initializeMonitoring();
    }
  }

  /**
   * 清理资源
   */
  public destroy(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.metrics = [];
    this.isEnabled = false;
  }
}

// 创建全局实例
let performanceMonitor: PerformanceMonitor | null = null;

export const getPerformanceMonitor = (): PerformanceMonitor => {
  if (!performanceMonitor) {
    performanceMonitor = new PerformanceMonitor();
  }
  return performanceMonitor;
};

export default PerformanceMonitor;