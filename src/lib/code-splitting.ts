/**
 * 代码分割和动态导入工具
 */
import { ComponentType, lazy, LazyExoticComponent } from 'react';

// 动态导入组件的配置
interface DynamicImportOptions {
  loading?: ComponentType;
  error?: ComponentType<{ error: Error; retry: () => void }>;
  delay?: number;
  timeout?: number;
  retries?: number;
}

// 创建带有错误处理和重试机制的动态组件
export const createDynamicComponent = <T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: DynamicImportOptions = {}
): LazyExoticComponent<T> => {
  const {
    delay = 200,
    timeout = 10000,
    retries = 3,
  } = options;

  let retryCount = 0;

  const importWithRetry = async (): Promise<{ default: T }> => {
    try {
      // 添加超时处理
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Import timeout')), timeout);
      });

      const result = await Promise.race([importFn(), timeoutPromise]);
      retryCount = 0; // 重置重试计数
      return result;
    } catch (error) {
      if (retryCount < retries) {
        retryCount++;
        console.warn(`Import failed, retrying (${retryCount}/${retries}):`, error);
        // 指数退避重试
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
        return importWithRetry();
      }
      throw error;
    }
  };

  return lazy(importWithRetry);
};

// 预定义的动态组件
export const DynamicComponents = {
  // 产品相关组件
  ProductDetailPage: createDynamicComponent(
    () => import('../components/products/ProductDetailPage'),
    { delay: 100 }
  ),
  ProductComparison: createDynamicComponent(
    () => import('../components/products/ProductComparison'),
    { delay: 150 }
  ),
  Product360Viewer: createDynamicComponent(
    () => import('../components/products/Product360Viewer'),
    { delay: 200 }
  ),

  // 案例研究组件
  CaseStudiesPage: createDynamicComponent(
    () => import('../components/case-studies/CaseStudiesPage'),
    { delay: 100 }
  ),
  CaseStudyDetailPage: createDynamicComponent(
    () => import('../components/case-studies/CaseStudyDetailPage'),
    { delay: 150 }
  ),
  CaseStudyMap: createDynamicComponent(
    () => import('../components/case-studies/CaseStudyMap'),
    { delay: 200 }
  ),

  // 解决方案组件
  SolutionsPage: createDynamicComponent(
    () => import('../components/solutions/SolutionsPage'),
    { delay: 100 }
  ),
  SolutionDetailPage: createDynamicComponent(
    () => import('../components/solutions/SolutionDetailPage'),
    { delay: 150 }
  ),

  // CRM组件
  CustomerManagement: createDynamicComponent(
    () => import('../components/crm/CustomerManagement'),
    { delay: 200 }
  ),
  CustomerDetailPage: createDynamicComponent(
    () => import('../components/crm/CustomerDetailPage'),
    { delay: 200 }
  ),
  OpportunityTracker: createDynamicComponent(
    () => import('../components/crm/OpportunityTracker'),
    { delay: 200 }
  ),

  // 表单组件
  MultiStepInquiryForm: createDynamicComponent(
    () => import('../components/forms/MultiStepInquiryForm'),
    { delay: 150 }
  ),
  InquiryManagement: createDynamicComponent(
    () => import('../components/admin/InquiryManagement'),
    { delay: 200 }
  ),

  // 联系组件
  LiveChat: createDynamicComponent(
    () => import('../components/contact/LiveChat'),
    { delay: 100 }
  ),
};

// 路由级别的代码分割
export const RouteComponents = {
  HomePage: createDynamicComponent(() => import('../pages/index')),
  ProductsPage: createDynamicComponent(() => import('../pages/products')),
  SolutionsPage: createDynamicComponent(() => import('../pages/solutions')),
  CaseStudiesPage: createDynamicComponent(() => import('../pages/case-studies')),
  AboutPage: createDynamicComponent(() => import('../pages/about')),
  ContactPage: createDynamicComponent(() => import('../pages/contact')),
};

// 预加载关键路由
export const preloadCriticalRoutes = () => {
  if (typeof window === 'undefined') return;

  // 预加载首页关键组件
  const criticalImports = [
    () => import('../components/home/HeroSection'),
    () => import('../components/home/ProductNavigation'),
    () => import('../components/navigation/Navigation'),
  ];

  criticalImports.forEach(importFn => {
    // 使用 requestIdleCallback 在浏览器空闲时预加载
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => importFn().catch(console.warn));
    } else {
      setTimeout(() => importFn().catch(console.warn), 100);
    }
  });
};

// 基于用户交互预加载组件
export const preloadOnHover = (importFn: () => Promise<any>) => {
  let isPreloaded = false;

  return {
    onMouseEnter: () => {
      if (!isPreloaded) {
        isPreloaded = true;
        importFn().catch(console.warn);
      }
    },
  };
};

// 基于路由预加载
export const preloadRoute = (route: string) => {
  if (typeof window === 'undefined') return;

  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = route;
  document.head.appendChild(link);
};

// 预加载图片
export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
};

// 预加载多个图片
export const preloadImages = (srcs: string[]): Promise<void[]> => {
  return Promise.all(srcs.map(preloadImage));
};

// 智能预加载策略
export class SmartPreloader {
  private preloadedRoutes = new Set<string>();
  private preloadedComponents = new Set<string>();
  private observer?: IntersectionObserver;

  constructor() {
    this.initIntersectionObserver();
  }

  private initIntersectionObserver() {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const element = entry.target as HTMLElement;
            const preloadRoute = element.dataset.preloadRoute;
            const preloadComponent = element.dataset.preloadComponent;

            if (preloadRoute && !this.preloadedRoutes.has(preloadRoute)) {
              this.preloadRoute(preloadRoute);
            }

            if (preloadComponent && !this.preloadedComponents.has(preloadComponent)) {
              this.preloadComponent(preloadComponent);
            }
          }
        });
      },
      {
        rootMargin: '100px',
        threshold: 0.1,
      }
    );
  }

  public observeElement(element: HTMLElement) {
    if (this.observer) {
      this.observer.observe(element);
    }
  }

  public unobserveElement(element: HTMLElement) {
    if (this.observer) {
      this.observer.unobserve(element);
    }
  }

  private preloadRoute(route: string) {
    if (this.preloadedRoutes.has(route)) return;

    this.preloadedRoutes.add(route);
    preloadRoute(route);
  }

  private preloadComponent(componentName: string) {
    if (this.preloadedComponents.has(componentName)) return;

    this.preloadedComponents.add(componentName);
    
    // 根据组件名称动态预加载
    const componentMap: { [key: string]: () => Promise<any> } = {
      ProductDetailPage: () => import('../components/products/ProductDetailPage'),
      CaseStudyDetailPage: () => import('../components/case-studies/CaseStudyDetailPage'),
      SolutionDetailPage: () => import('../components/solutions/SolutionDetailPage'),
      MultiStepInquiryForm: () => import('../components/forms/MultiStepInquiryForm'),
    };

    const importFn = componentMap[componentName];
    if (importFn) {
      importFn().catch(console.warn);
    }
  }

  public cleanup() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

// 单例预加载器
let smartPreloader: SmartPreloader | null = null;

export const getSmartPreloader = (): SmartPreloader => {
  if (!smartPreloader) {
    smartPreloader = new SmartPreloader();
  }
  return smartPreloader;
};

// 基于网络状态的预加载策略
export const adaptivePreload = (importFn: () => Promise<any>) => {
  if (typeof window === 'undefined') return;

  const connection = (navigator as any).connection;
  
  // 如果是慢速网络，延迟预加载
  if (connection) {
    const { effectiveType, saveData } = connection;
    
    if (saveData || effectiveType === 'slow-2g' || effectiveType === '2g') {
      // 不预加载或延迟预加载
      return;
    }
    
    if (effectiveType === '3g') {
      // 延迟预加载
      setTimeout(() => importFn().catch(console.warn), 2000);
      return;
    }
  }

  // 4G或更快网络，立即预加载
  importFn().catch(console.warn);
};