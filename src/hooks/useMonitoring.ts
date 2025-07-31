/**
 * 监控系统React Hook
 * 提供性能监控、错误追踪和用户行为分析的便捷接口
 */
import { useEffect, useCallback, useRef } from 'react';
import { getPerformanceMonitor } from '@/lib/performance-monitor';
import { getErrorTracker } from '@/lib/error-tracker';
import { getAnalytics } from '@/lib/analytics';

interface MonitoringHookReturn {
  // 性能监控
  recordPerformanceMetric: (name: string, value: number, rating?: 'good' | 'needs-improvement' | 'poor') => void;
  
  // 错误追踪
  recordError: (message: string, severity?: 'low' | 'medium' | 'high' | 'critical', context?: Record<string, any>) => void;
  addBreadcrumb: (message: string, data?: Record<string, any>) => void;
  
  // 用户行为分析
  trackEvent: (type: string, name: string, properties?: Record<string, any>) => void;
  trackPageView: (title?: string, url?: string) => void;
  trackProductView: (productId: string, productName: string, category: string) => void;
  trackInquiryStart: (source?: string) => void;
  trackInquiryComplete: (inquiryId: string, productIds?: string[]) => void;
  
  // 用户标识
  setUserId: (userId: string) => void;
  
  // 监控控制
  setMonitoringEnabled: (enabled: boolean) => void;
}

export const useMonitoring = (): MonitoringHookReturn => {
  const performanceMonitor = useRef(getPerformanceMonitor());
  const errorTracker = useRef(getErrorTracker());
  const analytics = useRef(getAnalytics());

  // 性能监控方法
  const recordPerformanceMetric = useCallback((
    name: string, 
    value: number, 
    rating: 'good' | 'needs-improvement' | 'poor' = 'good'
  ) => {
    performanceMonitor.current.recordCustomMetric(name, value, rating);
  }, []);

  // 错误追踪方法
  const recordError = useCallback((
    message: string, 
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium',
    context?: Record<string, any>
  ) => {
    errorTracker.current.recordCustomError(message, severity, context);
  }, []);

  const addBreadcrumb = useCallback((message: string, data?: Record<string, any>) => {
    errorTracker.current.addCustomBreadcrumb(message, data);
  }, []);

  // 用户行为分析方法
  const trackEvent = useCallback((type: string, name: string, properties: Record<string, any> = {}) => {
    analytics.current.track(type as any, name, properties);
  }, []);

  const trackPageView = useCallback((title?: string, url?: string) => {
    analytics.current.track('page_view', 'Page View', {
      title: title || document.title,
      url: url || window.location.href,
    });
  }, []);

  const trackProductView = useCallback((productId: string, productName: string, category: string) => {
    analytics.current.trackProductView(productId, productName, category);
  }, []);

  const trackInquiryStart = useCallback((source: string = 'unknown') => {
    analytics.current.trackInquiryStart(source);
  }, []);

  const trackInquiryComplete = useCallback((inquiryId: string, productIds: string[] = []) => {
    analytics.current.trackInquiryComplete(inquiryId, productIds);
  }, []);

  // 用户标识方法
  const setUserId = useCallback((userId: string) => {
    errorTracker.current.setUserId(userId);
    analytics.current.setUserId(userId);
  }, []);

  // 监控控制方法
  const setMonitoringEnabled = useCallback((enabled: boolean) => {
    performanceMonitor.current.setEnabled(enabled);
    errorTracker.current.setEnabled(enabled);
    analytics.current.setEnabled(enabled);
  }, []);

  return {
    recordPerformanceMetric,
    recordError,
    addBreadcrumb,
    trackEvent,
    trackPageView,
    trackProductView,
    trackInquiryStart,
    trackInquiryComplete,
    setUserId,
    setMonitoringEnabled,
  };
};

/**
 * 页面性能监控Hook
 * 自动监控页面加载性能
 */
export const usePagePerformance = (pageName?: string) => {
  const { recordPerformanceMetric } = useMonitoring();
  const startTime = useRef<number>(Date.now());

  useEffect(() => {
    const measurePageLoad = () => {
      // 测量页面加载时间
      const loadTime = Date.now() - startTime.current;
      recordPerformanceMetric(
        `page-load-${pageName || 'unknown'}`,
        loadTime,
        loadTime < 2000 ? 'good' : loadTime < 4000 ? 'needs-improvement' : 'poor'
      );

      // 测量DOM内容加载时间
      if (document.readyState === 'complete') {
        const domContentLoadedTime = performance.timing?.domContentLoadedEventEnd - performance.timing?.navigationStart;
        if (domContentLoadedTime) {
          recordPerformanceMetric(
            `dom-content-loaded-${pageName || 'unknown'}`,
            domContentLoadedTime,
            domContentLoadedTime < 1500 ? 'good' : domContentLoadedTime < 3000 ? 'needs-improvement' : 'poor'
          );
        }
      }
    };

    if (document.readyState === 'complete') {
      measurePageLoad();
    } else {
      window.addEventListener('load', measurePageLoad);
      return () => window.removeEventListener('load', measurePageLoad);
    }
  }, [pageName, recordPerformanceMetric]);

  return { recordPerformanceMetric };
};

/**
 * 组件错误边界Hook
 * 用于捕获和报告React组件错误
 */
export const useErrorBoundary = (componentName: string) => {
  const { recordError, addBreadcrumb } = useMonitoring();

  const reportError = useCallback((error: Error, errorInfo?: any) => {
    addBreadcrumb(`Error in component: ${componentName}`, {
      componentName,
      errorInfo,
    });

    recordError(
      `Component Error: ${error.message}`,
      'high',
      {
        componentName,
        stack: error.stack,
        errorInfo,
      }
    );
  }, [componentName, recordError, addBreadcrumb]);

  return { reportError };
};

/**
 * 表单监控Hook
 * 监控表单交互和提交
 */
export const useFormMonitoring = (formName: string) => {
  const { trackEvent, recordError, addBreadcrumb } = useMonitoring();
  const formStartTime = useRef<number | null>(null);

  const trackFormStart = useCallback(() => {
    formStartTime.current = Date.now();
    addBreadcrumb(`Form started: ${formName}`);
    trackEvent('form_start', 'Form Start', { formName });
  }, [formName, trackEvent, addBreadcrumb]);

  const trackFormSubmit = useCallback((success: boolean, errorMessage?: string) => {
    const completionTime = formStartTime.current ? Date.now() - formStartTime.current : 0;
    
    if (success) {
      trackEvent('form_submit', 'Form Submit Success', {
        formName,
        completionTime,
      });
      addBreadcrumb(`Form submitted successfully: ${formName}`, { completionTime });
    } else {
      trackEvent('form_submit', 'Form Submit Error', {
        formName,
        completionTime,
        errorMessage,
      });
      recordError(
        `Form submission failed: ${formName}`,
        'medium',
        { formName, errorMessage, completionTime }
      );
    }
  }, [formName, trackEvent, recordError, addBreadcrumb]);

  const trackFieldError = useCallback((fieldName: string, errorMessage: string) => {
    addBreadcrumb(`Form field error: ${fieldName}`, { errorMessage });
    trackEvent('form_error', 'Form Field Error', {
      formName,
      fieldName,
      errorMessage,
    });
  }, [formName, trackEvent, addBreadcrumb]);

  return {
    trackFormStart,
    trackFormSubmit,
    trackFieldError,
  };
};

/**
 * API请求监控Hook
 * 监控API请求性能和错误
 */
export const useApiMonitoring = () => {
  const { recordPerformanceMetric, recordError, addBreadcrumb } = useMonitoring();

  const trackApiRequest = useCallback(async <T>(
    url: string,
    requestFn: () => Promise<T>,
    options: {
      method?: string;
      timeout?: number;
      retries?: number;
    } = {}
  ): Promise<T> => {
    const { method = 'GET', timeout = 10000, retries = 0 } = options;
    const startTime = Date.now();

    addBreadcrumb(`API request started: ${method} ${url}`);

    try {
      // 设置超时
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), timeout);
      });

      const result = await Promise.race([requestFn(), timeoutPromise]);
      const duration = Date.now() - startTime;

      // 记录成功的API请求性能
      recordPerformanceMetric(
        'api-request-duration',
        duration,
        duration < 1000 ? 'good' : duration < 3000 ? 'needs-improvement' : 'poor'
      );

      addBreadcrumb(`API request completed: ${method} ${url}`, {
        duration,
        status: 'success',
      });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);

      // 记录API错误
      recordError(
        `API request failed: ${method} ${url}`,
        'high',
        {
          url,
          method,
          duration,
          errorMessage,
          retries,
        }
      );

      addBreadcrumb(`API request failed: ${method} ${url}`, {
        duration,
        errorMessage,
        status: 'error',
      });

      // 重试逻辑
      if (retries > 0) {
        addBreadcrumb(`Retrying API request: ${method} ${url}`, { retriesLeft: retries - 1 });
        return trackApiRequest(url, requestFn, { ...options, retries: retries - 1 });
      }

      throw error;
    }
  }, [recordPerformanceMetric, recordError, addBreadcrumb]);

  return { trackApiRequest };
};

/**
 * 用户会话监控Hook
 * 监控用户会话活动
 */
export const useSessionMonitoring = () => {
  const { trackEvent, addBreadcrumb } = useMonitoring();
  const sessionStartTime = useRef<number>(Date.now());
  const lastActivityTime = useRef<number>(Date.now());

  useEffect(() => {
    const trackActivity = () => {
      lastActivityTime.current = Date.now();
    };

    const trackSessionEnd = () => {
      const sessionDuration = Date.now() - sessionStartTime.current;
      trackEvent('session_end', 'Session End', {
        duration: sessionDuration,
        lastActivity: lastActivityTime.current,
      });
    };

    // 监听用户活动
    const events = ['click', 'keydown', 'scroll', 'mousemove'];
    events.forEach(event => {
      document.addEventListener(event, trackActivity, { passive: true });
    });

    // 监听页面卸载
    window.addEventListener('beforeunload', trackSessionEnd);

    // 定期检查会话状态
    const sessionCheckInterval = setInterval(() => {
      const inactiveTime = Date.now() - lastActivityTime.current;
      
      if (inactiveTime > 30 * 60 * 1000) { // 30分钟无活动
        addBreadcrumb('User session inactive', { inactiveTime });
        trackEvent('session_inactive', 'Session Inactive', { inactiveTime });
      }
    }, 5 * 60 * 1000); // 每5分钟检查一次

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, trackActivity);
      });
      window.removeEventListener('beforeunload', trackSessionEnd);
      clearInterval(sessionCheckInterval);
    };
  }, [trackEvent, addBreadcrumb]);

  return {
    getSessionDuration: () => Date.now() - sessionStartTime.current,
    getLastActivityTime: () => lastActivityTime.current,
  };
};