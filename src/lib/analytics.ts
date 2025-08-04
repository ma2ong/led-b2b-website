/**
 * 用户行为分析系统
 * 追踪用户行为、转化率和业务指标
 */

interface UserEvent {
  id: string;
  type: 'page_view' | 'click' | 'form_submit' | 'scroll' | 'search' | 'product_view' | 'inquiry_start' | 'inquiry_complete' | 'custom';
  name: string;
  timestamp: number;
  sessionId: string;
  userId?: string;
  url: string;
  referrer: string;
  userAgent: string;
  properties: Record<string, any>;
  context: {
    page: {
      title: string;
      url: string;
      path: string;
      search: string;
      hash: string;
    };
    screen: {
      width: number;
      height: number;
      density: number;
    };
    viewport: {
      width: number;
      height: number;
    };
    locale: string;
    timezone: string;
  };
}

interface ConversionFunnel {
  name: string;
  steps: string[];
  events: UserEvent[];
  conversionRates: number[];
  dropOffPoints: { step: string; rate: number }[];
}

interface UserSession {
  id: string;
  userId?: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  pageViews: number;
  events: UserEvent[];
  entryPage: string;
  exitPage?: string;
  referrer: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  device: {
    type: 'desktop' | 'mobile' | 'tablet';
    os: string;
    browser: string;
  };
  location?: {
    country: string;
    city: string;
    timezone: string;
  };
}

class Analytics {
  private events: UserEvent[] = [];
  private session: UserSession;
  private isEnabled: boolean = true;
  private apiEndpoint: string = '/api/analytics/events';
  private maxEvents: number = 500;
  private funnels: Map<string, ConversionFunnel> = new Map();

  constructor() {
    this.session = this.createSession();
    
    if (typeof window !== 'undefined') {
      this.initializeTracking();
    }
  }

  /**
   * 创建用户会话
   */
  private createSession(): UserSession {
    const sessionId = this.generateSessionId();
    const urlParams = new URLSearchParams(window.location.search);
    
    return {
      id: sessionId,
      startTime: Date.now(),
      pageViews: 0,
      events: [],
      entryPage: window.location.href,
      referrer: document.referrer,
      utmSource: urlParams.get('utm_source') || undefined,
      utmMedium: urlParams.get('utm_medium') || undefined,
      utmCampaign: urlParams.get('utm_campaign') || undefined,
      device: this.getDeviceInfo(),
    };
  }

  /**
   * 生成会话ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 获取设备信息
   */
  private getDeviceInfo(): UserSession['device'] {
    const userAgent = navigator.userAgent;
    
    // 检测设备类型
    let deviceType: 'desktop' | 'mobile' | 'tablet' = 'desktop';
    if (/Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
      deviceType = /iPad|Android(?=.*Tablet)|Tablet/i.test(userAgent) ? 'tablet' : 'mobile';
    }

    // 检测操作系统
    let os = 'Unknown';
    if (userAgent.includes('Windows')) os = 'Windows';
    else if (userAgent.includes('Mac')) os = 'macOS';
    else if (userAgent.includes('Linux')) os = 'Linux';
    else if (userAgent.includes('Android')) os = 'Android';
    else if (userAgent.includes('iOS')) os = 'iOS';

    // 检测浏览器
    let browser = 'Unknown';
    if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari')) browser = 'Safari';
    else if (userAgent.includes('Edge')) browser = 'Edge';

    return { type: deviceType, os, browser };
  }

  /**
   * 获取页面上下文
   */
  private getPageContext(): UserEvent['context'] {
    return {
      page: {
        title: document.title,
        url: window.location.href,
        path: window.location.pathname,
        search: window.location.search,
        hash: window.location.hash,
      },
      screen: {
        width: screen.width,
        height: screen.height,
        density: window.devicePixelRatio || 1,
      },
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      locale: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
  }

  /**
   * 初始化追踪
   */
  private initializeTracking(): void {
    // 页面浏览追踪
    this.trackPageView();
    
    // 点击事件追踪
    this.initClickTracking();
    
    // 滚动追踪
    this.initScrollTracking();
    
    // 表单追踪
    this.initFormTracking();
    
    // 搜索追踪
    this.initSearchTracking();
    
    // 会话管理
    this.initSessionManagement();
    
    // 数据发送
    this.initDataSending();
    
    // 转化漏斗初始化
    this.initConversionFunnels();
  }

  /**
   * 页面浏览追踪
   */
  private trackPageView(): void {
    this.session.pageViews++;
    
    this.track('page_view', 'Page View', {
      title: document.title,
      url: window.location.href,
      referrer: document.referrer,
    });
  }

  /**
   * 初始化点击追踪
   */
  private initClickTracking(): void {
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (!target) return;

      // 追踪重要元素的点击
      const trackableSelectors = [
        'a[href]',
        'button',
        '[data-track]',
        '.cta-button',
        '.product-card',
        '.inquiry-button',
        '.contact-button',
      ];

      const isTrackable = trackableSelectors.some(selector => 
        target.matches(selector) || target.closest(selector)
      );

      if (isTrackable) {
        const element = trackableSelectors.reduce((found, selector) => 
          found || target.closest(selector), null as Element | null
        ) || target;

        this.track('click', 'Element Click', {
          element: element.tagName.toLowerCase(),
          text: element.textContent?.trim().substring(0, 100),
          href: (element as HTMLAnchorElement).href,
          className: element.className,
          id: element.id,
          dataTrack: element.getAttribute('data-track'),
        });
      }
    });
  }

  /**
   * 初始化滚动追踪
   */
  private initScrollTracking(): void {
    let maxScroll = 0;
    const scrollMilestones = [25, 50, 75, 90, 100];
    const trackedMilestones = new Set<number>();

    const trackScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = Math.round((scrollTop / documentHeight) * 100);

      if (scrollPercent > maxScroll) {
        maxScroll = scrollPercent;

        // 追踪滚动里程碑
        scrollMilestones.forEach(milestone => {
          if (scrollPercent >= milestone && !trackedMilestones.has(milestone)) {
            trackedMilestones.add(milestone);
            this.track('scroll', 'Scroll Milestone', {
              percentage: milestone,
              depth: scrollTop,
            });
          }
        });
      }
    };

    let scrollTimeout: NodeJS.Timeout;
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(trackScroll, 100);
    });
  }

  /**
   * 初始化表单追踪
   */
  private initFormTracking(): void {
    // 表单开始填写
    document.addEventListener('focusin', (event) => {
      const target = event.target as HTMLElement;
      const form = target.closest('form');
      
      if (form && target.matches('input, select, textarea')) {
        const formName = form.getAttribute('name') || form.className || 'unnamed-form';
        
        this.track('form_start', 'Form Start', {
          formName,
          fieldName: (target as HTMLInputElement).name,
          fieldType: (target as HTMLInputElement).type,
        });
      }
    });

    // 表单提交
    document.addEventListener('submit', (event) => {
      const form = event.target as HTMLFormElement;
      const formName = form.getAttribute('name') || form.className || 'unnamed-form';
      
      this.track('form_submit', 'Form Submit', {
        formName,
        action: form.action,
        method: form.method,
      });
    });
  }

  /**
   * 初始化搜索追踪
   */
  private initSearchTracking(): void {
    // 监听搜索输入框
    document.addEventListener('input', (event) => {
      const target = event.target as HTMLInputElement;
      
      if (target.type === 'search' || target.name?.includes('search') || target.placeholder?.toLowerCase().includes('search')) {
        const query = target.value.trim();
        
        if (query.length >= 3) {
          this.track('search', 'Search Query', {
            query,
            inputName: target.name,
            resultsCount: this.getSearchResultsCount(),
          });
        }
      }
    });
  }

  /**
   * 获取搜索结果数量（需要根据实际页面结构调整）
   */
  private getSearchResultsCount(): number {
    const resultElements = document.querySelectorAll('[data-search-result], .search-result, .product-card');
    return resultElements.length;
  }

  /**
   * 初始化会话管理
   */
  private initSessionManagement(): void {
    // 页面卸载时结束会话
    window.addEventListener('beforeunload', () => {
      this.endSession();
    });

    // 页面隐藏时更新会话
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.updateSession();
      }
    });

    // 定期更新会话（每30秒）
    setInterval(() => {
      this.updateSession();
    }, 30000);
  }

  /**
   * 初始化数据发送
   */
  private initDataSending(): void {
    // 定期发送事件（每2分钟）
    setInterval(() => {
      this.sendEventsBatch();
    }, 2 * 60 * 1000);

    // 页面卸载时发送数据
    window.addEventListener('beforeunload', () => {
      this.sendEventsBeacon();
    });
  }

  /**
   * 初始化转化漏斗
   */
  private initConversionFunnels(): void {
    // 产品浏览到询盘的转化漏斗
    this.createFunnel('product-to-inquiry', [
      'product_view',
      'inquiry_start',
      'inquiry_complete'
    ]);

    // 首页到产品页的转化漏斗
    this.createFunnel('homepage-to-product', [
      'page_view', // 首页
      'product_view', // 产品页
      'inquiry_start' // 开始询盘
    ]);
  }

  /**
   * 创建转化漏斗
   */
  public createFunnel(name: string, steps: string[]): void {
    this.funnels.set(name, {
      name,
      steps,
      events: [],
      conversionRates: [],
      dropOffPoints: [],
    });
  }

  /**
   * 追踪事件
   */
  public track(type: UserEvent['type'], name: string, properties: Record<string, any> = {}): void {
    if (!this.isEnabled) return;

    const event: UserEvent = {
      id: this.generateEventId(),
      type,
      name,
      timestamp: Date.now(),
      sessionId: this.session.id,
      userId: this.session.userId,
      url: window.location.href,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      properties,
      context: this.getPageContext(),
    };

    this.events.push(event);
    this.session.events.push(event);

    // 更新转化漏斗
    this.updateFunnels(event);

    // 限制内存中保存的事件数量
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents / 2);
    }

    // 触发自定义事件
    window.dispatchEvent(new CustomEvent('analytics-event', {
      detail: event
    }));

    // 开发环境日志
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Analytics Event:', { type, name, properties });
    }
  }

  /**
   * 更新转化漏斗
   */
  private updateFunnels(event: UserEvent): void {
    this.funnels.forEach(funnel => {
      if (funnel.steps.includes(event.type)) {
        funnel.events.push(event);
        this.calculateConversionRates(funnel);
      }
    });
  }

  /**
   * 计算转化率
   */
  private calculateConversionRates(funnel: ConversionFunnel): void {
    const stepCounts = funnel.steps.map(step => 
      funnel.events.filter(event => event.type === step).length
    );

    funnel.conversionRates = stepCounts.map((count, index) => {
      if (index === 0) return 100; // 第一步转化率为100%
      return stepCounts[0] > 0 ? (count / stepCounts[0]) * 100 : 0;
    });

    funnel.dropOffPoints = funnel.steps.map((step, index) => ({
      step,
      rate: index > 0 ? 100 - funnel.conversionRates[index] : 0,
    }));
  }

  /**
   * 生成事件ID
   */
  private generateEventId(): string {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 更新会话
   */
  private updateSession(): void {
    this.session.endTime = Date.now();
    this.session.duration = this.session.endTime - this.session.startTime;
    this.session.exitPage = window.location.href;
  }

  /**
   * 结束会话
   */
  private endSession(): void {
    this.updateSession();
    this.sendSessionData();
  }

  /**
   * 发送会话数据
   */
  private sendSessionData(): void {
    const sessionData = {
      session: this.session,
      funnels: Array.from(this.funnels.values()),
    };

    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/analytics/session', JSON.stringify(sessionData));
    }
  }

  /**
   * 批量发送事件
   */
  private sendEventsBatch(): void {
    if (this.events.length === 0) return;

    const data = JSON.stringify(this.events);
    
    fetch(this.apiEndpoint, {
      method: 'POST',
      body: data,
      headers: {
        'Content-Type': 'application/json',
      },
      keepalive: true,
    }).then(() => {
      this.events = [];
    }).catch(error => {
      console.warn('Failed to send analytics events:', error);
    });
  }

  /**
   * 使用Beacon发送事件
   */
  private sendEventsBeacon(): void {
    if (this.events.length === 0) return;

    const data = JSON.stringify(this.events);
    
    if (navigator.sendBeacon) {
      navigator.sendBeacon(this.apiEndpoint, data);
      this.events = [];
    }
  }

  /**
   * 设置用户ID
   */
  public setUserId(userId: string): void {
    this.session.userId = userId;
  }

  /**
   * 追踪产品浏览
   */
  public trackProductView(productId: string, productName: string, category: string): void {
    this.track('product_view', 'Product View', {
      productId,
      productName,
      category,
    });
  }

  /**
   * 追踪询盘开始
   */
  public trackInquiryStart(source: string = 'unknown'): void {
    this.track('inquiry_start', 'Inquiry Start', {
      source,
      url: window.location.href,
    });
  }

  /**
   * 追踪询盘完成
   */
  public trackInquiryComplete(inquiryId: string, productIds: string[] = []): void {
    this.track('inquiry_complete', 'Inquiry Complete', {
      inquiryId,
      productIds,
      productCount: productIds.length,
    });
  }

  /**
   * 获取分析摘要
   */
  public getAnalyticsSummary(): {
    session: UserSession;
    eventCounts: Record<string, number>;
    funnels: ConversionFunnel[];
    topPages: { url: string; views: number }[];
  } {
    const eventCounts: Record<string, number> = {};
    const pageViews: Record<string, number> = {};

    this.events.forEach(event => {
      eventCounts[event.type] = (eventCounts[event.type] || 0) + 1;
      
      if (event.type === 'page_view') {
        pageViews[event.url] = (pageViews[event.url] || 0) + 1;
      }
    });

    const topPages = Object.entries(pageViews)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([url, views]) => ({ url, views }));

    return {
      session: this.session,
      eventCounts,
      funnels: Array.from(this.funnels.values()),
      topPages,
    };
  }

  /**
   * 启用/禁用分析
   */
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * 清理资源
   */
  public destroy(): void {
    this.endSession();
    this.events = [];
    this.funnels.clear();
    this.isEnabled = false;
  }
}

// 创建全局实例
let analytics: Analytics | null = null;

export const getAnalytics = (): Analytics => {
  if (!analytics) {
    analytics = new Analytics();
  }
  return analytics;
};

export default Analytics;