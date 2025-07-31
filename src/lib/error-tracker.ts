/**
 * 错误追踪系统
 * 收集和报告JavaScript错误、网络错误和用户行为
 */

interface ErrorInfo {
  id: string;
  type: 'javascript' | 'network' | 'resource' | 'unhandled-rejection' | 'custom';
  message: string;
  stack?: string;
  url: string;
  line?: number;
  column?: number;
  timestamp: number;
  userAgent: string;
  userId?: string;
  sessionId: string;
  pageUrl: string;
  referrer: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  context?: Record<string, any>;
  breadcrumbs: Breadcrumb[];
}

interface Breadcrumb {
  timestamp: number;
  type: 'navigation' | 'click' | 'input' | 'api' | 'console' | 'custom';
  message: string;
  data?: Record<string, any>;
}

interface NetworkError {
  url: string;
  method: string;
  status: number;
  statusText: string;
  responseTime: number;
  requestHeaders?: Record<string, string>;
  responseHeaders?: Record<string, string>;
}

class ErrorTracker {
  private errors: ErrorInfo[] = [];
  private breadcrumbs: Breadcrumb[] = [];
  private sessionId: string;
  private userId?: string;
  private isEnabled: boolean = true;
  private apiEndpoint: string = '/api/analytics/errors';
  private maxBreadcrumbs: number = 50;
  private maxErrors: number = 100;

  constructor() {
    this.sessionId = this.generateSessionId();
    
    if (typeof window !== 'undefined') {
      this.initializeErrorTracking();
    }
  }

  /**
   * 生成会话ID
   */
  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 初始化错误追踪
   */
  private initializeErrorTracking(): void {
    // JavaScript错误监听
    this.initJavaScriptErrorTracking();
    
    // 未处理的Promise拒绝
    this.initUnhandledRejectionTracking();
    
    // 资源加载错误
    this.initResourceErrorTracking();
    
    // 网络请求错误
    this.initNetworkErrorTracking();
    
    // 用户行为追踪
    this.initBreadcrumbTracking();
    
    // 页面卸载时发送错误
    this.initErrorSending();
  }

  /**
   * 初始化JavaScript错误追踪
   */
  private initJavaScriptErrorTracking(): void {
    window.addEventListener('error', (event) => {
      const error: ErrorInfo = {
        id: this.generateErrorId(),
        type: 'javascript',
        message: event.message,
        stack: event.error?.stack,
        url: event.filename,
        line: event.lineno,
        column: event.colno,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        userId: this.userId,
        sessionId: this.sessionId,
        pageUrl: window.location.href,
        referrer: document.referrer,
        severity: this.getSeverityFromError(event.error),
        breadcrumbs: [...this.breadcrumbs],
      };

      this.recordError(error);
    });
  }

  /**
   * 初始化未处理的Promise拒绝追踪
   */
  private initUnhandledRejectionTracking(): void {
    window.addEventListener('unhandledrejection', (event) => {
      const error: ErrorInfo = {
        id: this.generateErrorId(),
        type: 'unhandled-rejection',
        message: event.reason?.message || String(event.reason),
        stack: event.reason?.stack,
        url: window.location.href,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        userId: this.userId,
        sessionId: this.sessionId,
        pageUrl: window.location.href,
        referrer: document.referrer,
        severity: 'high',
        breadcrumbs: [...this.breadcrumbs],
      };

      this.recordError(error);
    });
  }

  /**
   * 初始化资源加载错误追踪
   */
  private initResourceErrorTracking(): void {
    window.addEventListener('error', (event) => {
      const target = event.target as HTMLElement;
      
      if (target && target !== window) {
        const error: ErrorInfo = {
          id: this.generateErrorId(),
          type: 'resource',
          message: `Failed to load resource: ${target.tagName}`,
          url: (target as any).src || (target as any).href || '',
          timestamp: Date.now(),
          userAgent: navigator.userAgent,
          userId: this.userId,
          sessionId: this.sessionId,
          pageUrl: window.location.href,
          referrer: document.referrer,
          severity: 'medium',
          context: {
            tagName: target.tagName,
            outerHTML: target.outerHTML.substring(0, 200),
          },
          breadcrumbs: [...this.breadcrumbs],
        };

        this.recordError(error);
      }
    }, true);
  }

  /**
   * 初始化网络错误追踪
   */
  private initNetworkErrorTracking(): void {
    // 拦截fetch请求
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const startTime = Date.now();
      const url = typeof args[0] === 'string' ? args[0] : args[0].url;
      const method = args[1]?.method || 'GET';

      try {
        const response = await originalFetch(...args);
        const responseTime = Date.now() - startTime;

        // 记录慢请求
        if (responseTime > 5000) {
          this.addBreadcrumb({
            type: 'api',
            message: `Slow API request: ${method} ${url}`,
            data: {
              url,
              method,
              responseTime,
              status: response.status,
            },
          });
        }

        // 记录错误响应
        if (!response.ok) {
          const networkError: NetworkError = {
            url,
            method,
            status: response.status,
            statusText: response.statusText,
            responseTime,
          };

          const error: ErrorInfo = {
            id: this.generateErrorId(),
            type: 'network',
            message: `Network error: ${response.status} ${response.statusText}`,
            url,
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            userId: this.userId,
            sessionId: this.sessionId,
            pageUrl: window.location.href,
            referrer: document.referrer,
            severity: response.status >= 500 ? 'high' : 'medium',
            context: { networkError },
            breadcrumbs: [...this.breadcrumbs],
          };

          this.recordError(error);
        }

        return response;
      } catch (fetchError) {
        const responseTime = Date.now() - startTime;
        
        const error: ErrorInfo = {
          id: this.generateErrorId(),
          type: 'network',
          message: `Network request failed: ${fetchError}`,
          url,
          timestamp: Date.now(),
          userAgent: navigator.userAgent,
          userId: this.userId,
          sessionId: this.sessionId,
          pageUrl: window.location.href,
          referrer: document.referrer,
          severity: 'high',
          context: {
            networkError: {
              url,
              method,
              responseTime,
              error: String(fetchError),
            },
          },
          breadcrumbs: [...this.breadcrumbs],
        };

        this.recordError(error);
        throw fetchError;
      }
    };

    // 拦截XMLHttpRequest
    const originalXHROpen = XMLHttpRequest.prototype.open;
    const originalXHRSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function(method, url, ...args) {
      (this as any)._errorTracker = { method, url, startTime: Date.now() };
      return originalXHROpen.call(this, method, url, ...args);
    };

    XMLHttpRequest.prototype.send = function(...args) {
      const tracker = (this as any)._errorTracker;
      
      this.addEventListener('error', () => {
        if (tracker) {
          const error: ErrorInfo = {
            id: ErrorTracker.prototype.generateErrorId(),
            type: 'network',
            message: `XMLHttpRequest failed: ${tracker.method} ${tracker.url}`,
            url: tracker.url,
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            sessionId: ErrorTracker.prototype.sessionId,
            pageUrl: window.location.href,
            referrer: document.referrer,
            severity: 'high',
            context: {
              networkError: {
                url: tracker.url,
                method: tracker.method,
                responseTime: Date.now() - tracker.startTime,
              },
            },
            breadcrumbs: [...ErrorTracker.prototype.breadcrumbs],
          };

          ErrorTracker.prototype.recordError(error);
        }
      });

      return originalXHRSend.call(this, ...args);
    };
  }

  /**
   * 初始化面包屑追踪
   */
  private initBreadcrumbTracking(): void {
    // 页面导航
    window.addEventListener('popstate', () => {
      this.addBreadcrumb({
        type: 'navigation',
        message: `Navigated to ${window.location.href}`,
        data: { url: window.location.href },
      });
    });

    // 点击事件
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (target) {
        this.addBreadcrumb({
          type: 'click',
          message: `Clicked ${target.tagName}`,
          data: {
            tagName: target.tagName,
            className: target.className,
            id: target.id,
            text: target.textContent?.substring(0, 50),
          },
        });
      }
    });

    // 输入事件
    document.addEventListener('input', (event) => {
      const target = event.target as HTMLInputElement;
      if (target && target.type !== 'password') {
        this.addBreadcrumb({
          type: 'input',
          message: `Input in ${target.tagName}`,
          data: {
            tagName: target.tagName,
            type: target.type,
            name: target.name,
            id: target.id,
          },
        });
      }
    });

    // 控制台错误
    const originalConsoleError = console.error;
    console.error = (...args) => {
      this.addBreadcrumb({
        type: 'console',
        message: `Console error: ${args.join(' ')}`,
        data: { level: 'error', args },
      });
      originalConsoleError.apply(console, args);
    };

    const originalConsoleWarn = console.warn;
    console.warn = (...args) => {
      this.addBreadcrumb({
        type: 'console',
        message: `Console warning: ${args.join(' ')}`,
        data: { level: 'warn', args },
      });
      originalConsoleWarn.apply(console, args);
    };
  }

  /**
   * 初始化错误发送
   */
  private initErrorSending(): void {
    // 页面卸载时发送错误
    window.addEventListener('beforeunload', () => {
      this.sendErrorsBeacon();
    });

    // 页面隐藏时发送错误
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.sendErrorsBeacon();
      }
    });

    // 定期发送错误（每2分钟）
    setInterval(() => {
      this.sendErrorsBatch();
    }, 2 * 60 * 1000);
  }

  /**
   * 生成错误ID
   */
  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 从错误对象获取严重程度
   */
  private getSeverityFromError(error: Error): 'low' | 'medium' | 'high' | 'critical' {
    if (!error) return 'low';

    const message = error.message?.toLowerCase() || '';
    const stack = error.stack?.toLowerCase() || '';

    // 关键错误
    if (message.includes('network') || message.includes('fetch')) {
      return 'critical';
    }

    // 高严重性错误
    if (message.includes('typeerror') || message.includes('referenceerror')) {
      return 'high';
    }

    // 中等严重性错误
    if (message.includes('syntaxerror') || stack.includes('node_modules')) {
      return 'medium';
    }

    return 'low';
  }

  /**
   * 记录错误
   */
  private recordError(error: ErrorInfo): void {
    if (!this.isEnabled) return;

    this.errors.push(error);

    // 限制内存中保存的错误数量
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-50);
    }

    // 立即发送关键错误
    if (error.severity === 'critical') {
      this.sendErrorImmediately(error);
    }

    // 触发自定义事件
    window.dispatchEvent(new CustomEvent('error-tracked', {
      detail: error
    }));

    // 控制台输出（开发环境）
    if (process.env.NODE_ENV === 'development') {
      console.group(`🚨 Error Tracked: ${error.type}`);
      console.error('Message:', error.message);
      console.error('Stack:', error.stack);
      console.error('Context:', error.context);
      console.error('Breadcrumbs:', error.breadcrumbs);
      console.groupEnd();
    }
  }

  /**
   * 添加面包屑
   */
  private addBreadcrumb(breadcrumb: Omit<Breadcrumb, 'timestamp'>): void {
    if (!this.isEnabled) return;

    const fullBreadcrumb: Breadcrumb = {
      ...breadcrumb,
      timestamp: Date.now(),
    };

    this.breadcrumbs.push(fullBreadcrumb);

    // 限制面包屑数量
    if (this.breadcrumbs.length > this.maxBreadcrumbs) {
      this.breadcrumbs = this.breadcrumbs.slice(-this.maxBreadcrumbs);
    }
  }

  /**
   * 立即发送单个错误
   */
  private sendErrorImmediately(error: ErrorInfo): void {
    if (navigator.sendBeacon) {
      const data = JSON.stringify([error]);
      navigator.sendBeacon(this.apiEndpoint, data);
    }
  }

  /**
   * 批量发送错误
   */
  private sendErrorsBatch(): void {
    if (this.errors.length === 0) return;

    const data = JSON.stringify(this.errors);
    
    fetch(this.apiEndpoint, {
      method: 'POST',
      body: data,
      headers: {
        'Content-Type': 'application/json',
      },
      keepalive: true,
    }).then(() => {
      this.errors = [];
    }).catch(error => {
      console.warn('Failed to send error batch:', error);
    });
  }

  /**
   * 使用Beacon发送错误
   */
  private sendErrorsBeacon(): void {
    if (this.errors.length === 0) return;

    const data = JSON.stringify(this.errors);
    
    if (navigator.sendBeacon) {
      navigator.sendBeacon(this.apiEndpoint, data);
      this.errors = [];
    }
  }

  /**
   * 手动记录自定义错误
   */
  public recordCustomError(
    message: string,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium',
    context?: Record<string, any>
  ): void {
    const error: ErrorInfo = {
      id: this.generateErrorId(),
      type: 'custom',
      message,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      userId: this.userId,
      sessionId: this.sessionId,
      pageUrl: window.location.href,
      referrer: document.referrer,
      severity,
      context,
      breadcrumbs: [...this.breadcrumbs],
    };

    this.recordError(error);
  }

  /**
   * 添加自定义面包屑
   */
  public addCustomBreadcrumb(message: string, data?: Record<string, any>): void {
    this.addBreadcrumb({
      type: 'custom',
      message,
      data,
    });
  }

  /**
   * 设置用户ID
   */
  public setUserId(userId: string): void {
    this.userId = userId;
  }

  /**
   * 获取错误摘要
   */
  public getErrorSummary(): {
    totalErrors: number;
    errorsByType: Record<string, number>;
    errorsBySeverity: Record<string, number>;
    recentErrors: ErrorInfo[];
  } {
    const errorsByType: Record<string, number> = {};
    const errorsBySeverity: Record<string, number> = {};

    this.errors.forEach(error => {
      errorsByType[error.type] = (errorsByType[error.type] || 0) + 1;
      errorsBySeverity[error.severity] = (errorsBySeverity[error.severity] || 0) + 1;
    });

    return {
      totalErrors: this.errors.length,
      errorsByType,
      errorsBySeverity,
      recentErrors: this.errors.slice(-10),
    };
  }

  /**
   * 启用/禁用错误追踪
   */
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * 清理资源
   */
  public destroy(): void {
    this.errors = [];
    this.breadcrumbs = [];
    this.isEnabled = false;
  }
}

// 创建全局实例
let errorTracker: ErrorTracker | null = null;

export const getErrorTracker = (): ErrorTracker => {
  if (!errorTracker) {
    errorTracker = new ErrorTracker();
  }
  return errorTracker;
};

export default ErrorTracker;