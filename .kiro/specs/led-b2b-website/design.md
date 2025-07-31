# LED显示屏B2B网站设计文档

## 概述

本设计文档基于需求分析，为深圳联锦光电LED显示屏B2B网站提供完整的技术架构、用户界面设计和系统实现方案。网站将采用现代化的响应式设计，支持中英双语，实现从品牌展示到询盘转化的完整商业闭环。

## 架构设计

### 系统架构

```
┌─────────────────────────────────────────────────────────────┐
│                        前端层 (Frontend)                      │
├─────────────────────────────────────────────────────────────┤
│  • Next.js 14 (React 18) - 服务端渲染                        │
│  • Tailwind CSS + 自定义设计系统                              │
│  • TypeScript - 类型安全                                     │
│  • Framer Motion - 动画效果                                  │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                        API层 (API Layer)                     │
├─────────────────────────────────────────────────────────────┤
│  • RESTful API + GraphQL                                    │
│  • JWT认证 + OAuth 2.0                                      │
│  • Rate Limiting + 缓存策略                                  │
│  • OpenAPI 3.0文档                                          │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                       业务逻辑层 (Business)                   │
├─────────────────────────────────────────────────────────────┤
│  • Node.js + Express.js                                     │
│  • 产品管理服务                                               │
│  • 询盘处理服务                                               │
│  • 内容管理服务                                               │
│  • 用户认证服务                                               │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                        数据层 (Data)                         │
├─────────────────────────────────────────────────────────────┤
│  • PostgreSQL - 主数据库                                     │
│  • Redis - 缓存和会话存储                                     │
│  • Elasticsearch - 搜索引擎                                  │
│  • AWS S3 - 文件存储                                        │
└─────────────────────────────────────────────────────────────┘
```

### 技术栈选择

**前端技术栈：**
- **框架**: Next.js 14 - 提供SSR/SSG支持，优化SEO和性能
- **样式**: Tailwind CSS + 自定义CSS变量 - 快速开发和一致性设计
- **类型检查**: TypeScript - 提高代码质量和开发效率
- **动画**: Framer Motion - 流畅的交互动画
- **状态管理**: Zustand - 轻量级状态管理
- **表单处理**: React Hook Form + Zod - 类型安全的表单验证

**后端技术栈：**
- **运行时**: Node.js 18+
- **框架**: Express.js + Fastify
- **数据库**: PostgreSQL 15 + Prisma ORM
- **缓存**: Redis 7
- **搜索**: Elasticsearch 8
- **文件存储**: AWS S3 / 阿里云OSS

## 组件设计

### 设计系统

#### 颜色系统
```css
:root {
  /* 主色调 - 科技蓝 */
  --primary-blue: #1e40af;
  --primary-blue-light: #3b82f6;
  --primary-blue-dark: #1e3a8a;
  
  /* 辅助色 - 能量橙 */
  --accent-orange: #f97316;
  --accent-orange-light: #fb923c;
  --accent-orange-dark: #ea580c;
  
  /* 成功色 - 认证绿 */
  --success-green: #10b981;
  --success-green-light: #34d399;
  --success-green-dark: #059669;
  
  /* 中性色系 */
  --gray-900: #111827;
  --gray-800: #1f2937;
  --gray-700: #374151;
  --gray-600: #4b5563;
  --gray-500: #6b7280;
  --gray-400: #9ca3af;
  --gray-300: #d1d5db;
  --gray-200: #e5e7eb;
  --gray-100: #f3f4f6;
  --gray-50: #f9fafb;
  
  /* 背景色 */
  --bg-primary: #ffffff;
  --bg-secondary: #f8fafc;
  --bg-dark: #1f2937;
  
  /* 文字色 */
  --text-primary: #111827;
  --text-secondary: #6b7280;
  --text-inverse: #ffffff;
}
```

#### 字体系统
```css
:root {
  /* 英文字体 */
  --font-primary: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-display: 'Poppins', sans-serif;
  
  /* 中文字体 */
  --font-chinese: 'PingFang SC', 'Hiragino Sans GB', sans-serif;
  
  /* 字号层级 */
  --text-xs: 0.75rem;    /* 12px */
  --text-sm: 0.875rem;   /* 14px */
  --text-base: 1rem;     /* 16px */
  --text-lg: 1.125rem;   /* 18px */
  --text-xl: 1.25rem;    /* 20px */
  --text-2xl: 1.5rem;    /* 24px */
  --text-3xl: 1.875rem;  /* 30px */
  --text-4xl: 2.25rem;   /* 36px */
  --text-5xl: 3rem;      /* 48px */
  --text-6xl: 3.75rem;   /* 60px */
}
```

#### 间距系统
```css
:root {
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-5: 1.25rem;   /* 20px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */
  --space-10: 2.5rem;   /* 40px */
  --space-12: 3rem;     /* 48px */
  --space-16: 4rem;     /* 64px */
  --space-20: 5rem;     /* 80px */
  --space-24: 6rem;     /* 96px */
}
```

### 核心组件设计

#### 1. 导航组件 (Navigation)
```typescript
interface NavigationProps {
  currentLanguage: 'zh' | 'en';
  onLanguageChange: (lang: 'zh' | 'en') => void;
  isScrolled: boolean;
}

// 特性：
// - 固定顶部导航，滚动时背景变化
// - 多级下拉菜单支持
// - 移动端汉堡菜单
// - 语言切换功能
// - 搜索框集成
```

#### 2. 产品卡片组件 (ProductCard)
```typescript
interface ProductCardProps {
  product: {
    id: string;
    name: string;
    category: string;
    pixelPitch: string;
    brightness: string;
    images: string[];
    specifications: Record<string, string>;
  };
  onCompare: (productId: string) => void;
  onInquiry: (productId: string) => void;
}

// 特性：
// - 悬停效果和动画
// - 快速规格预览
// - 对比功能集成
// - 询盘按钮
// - 图片懒加载
```

#### 3. 询盘表单组件 (InquiryForm)
```typescript
interface InquiryFormProps {
  productId?: string;
  isModal?: boolean;
  onSubmit: (data: InquiryData) => Promise<void>;
}

interface InquiryData {
  projectInfo: {
    type: string;
    displaySize: string;
    pixelPitch: string;
    budget: string;
  };
  technicalRequirements: {
    brightness: string;
    installation: string;
    environment: string;
    timeline: string;
  };
  contactDetails: {
    name: string;
    email: string;
    phone: string;
    company: string;
    position: string;
  };
}

// 特性：
// - 多步骤表单
// - 实时验证
// - 智能推荐
// - 文件上传支持
// - 自动保存草稿
```

#### 4. 产品对比组件 (ProductComparison)
```typescript
interface ProductComparisonProps {
  products: Product[];
  maxCompare: number;
  onRemove: (productId: string) => void;
  onClear: () => void;
}

// 特性：
// - 最多3个产品对比
// - 响应式表格设计
// - 差异高亮显示
// - 导出PDF功能
// - 直接询盘集成
```

## 数据模型

### 产品数据模型
```typescript
interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  subcategory: string;
  pixelPitch: string;
  specifications: {
    brightness: string;
    refreshRate: string;
    colorTemperature: string;
    viewingAngle: string;
    ipRating: string;
    lifespan: string;
    powerConsumption: string;
    resolution: string;
    cabinetSize: string;
    weight: string;
  };
  applications: string[];
  images: {
    main: string;
    gallery: string[];
    technical: string[];
  };
  videos: string[];
  documents: {
    datasheet: string;
    manual: string;
    certificate: string[];
  };
  pricing: {
    currency: string;
    priceRange: string;
    moq: number;
  };
  availability: boolean;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

enum ProductCategory {
  FINE_PITCH = 'fine-pitch',
  INDOOR = 'indoor',
  OUTDOOR = 'outdoor',
  TRANSPARENT = 'transparent',
  CREATIVE = 'creative',
  RENTAL = 'rental'
}
```

### 询盘数据模型
```typescript
interface Inquiry {
  id: string;
  inquiryNumber: string;
  status: InquiryStatus;
  projectInfo: {
    type: string;
    displaySize: string;
    pixelPitch: string;
    budget: string;
    timeline: string;
  };
  technicalRequirements: {
    brightness: string;
    installation: string;
    environment: string;
    specialRequirements: string;
  };
  contactDetails: {
    name: string;
    email: string;
    phone: string;
    company: string;
    position: string;
    country: string;
  };
  products: string[]; // Product IDs
  attachments: string[];
  notes: string;
  assignedTo: string; // Sales rep ID
  followUpDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

enum InquiryStatus {
  NEW = 'new',
  IN_PROGRESS = 'in_progress',
  QUOTED = 'quoted',
  NEGOTIATING = 'negotiating',
  CLOSED_WON = 'closed_won',
  CLOSED_LOST = 'closed_lost'
}
```

### 案例数据模型
```typescript
interface CaseStudy {
  id: string;
  title: string;
  client: {
    name: string;
    industry: string;
    country: string;
    logo?: string;
  };
  project: {
    description: string;
    challenge: string;
    solution: string;
    results: string;
    timeline: string;
    budget?: string;
  };
  products: string[]; // Product IDs
  images: {
    before: string[];
    after: string[];
    installation: string[];
  };
  video?: string;
  testimonial?: {
    quote: string;
    author: string;
    position: string;
  };
  location: {
    country: string;
    city: string;
    coordinates: [number, number];
  };
  featured: boolean;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

## 用户界面设计

### 页面布局设计

#### 1. 首页布局
```
┌─────────────────────────────────────────────────────────────┐
│                      导航栏 (Navigation)                      │
├─────────────────────────────────────────────────────────────┤
│                    Hero区域 (Hero Section)                   │
│  • 企业价值主张                                               │
│  • 核心产品轮播                                               │
│  • CTA按钮                                                  │
├─────────────────────────────────────────────────────────────┤
│                  产品导航 (Product Navigation)                │
│  • 5个主要产品类别                                            │
│  • 图标式快速选择                                             │
├─────────────────────────────────────────────────────────────┤
│                  企业实力 (Company Strength)                  │
│  • 数据可视化展示                                             │
│  • 认证资质                                                  │
├─────────────────────────────────────────────────────────────┤
│                  成功案例 (Success Cases)                     │
│  • 案例轮播                                                  │
│  • 客户logo墙                                               │
├─────────────────────────────────────────────────────────────┤
│                  新闻资讯 (News & Updates)                    │
│  • 最新动态                                                  │
│  • 行业资讯                                                  │
├─────────────────────────────────────────────────────────────┤
│                     页脚 (Footer)                           │
│  • 联系信息                                                  │
│  • 快速链接                                                  │
│  • 社交媒体                                                  │
└─────────────────────────────────────────────────────────────┘
```

#### 2. 产品页面布局
```
┌─────────────────────────────────────────────────────────────┐
│                      导航栏 + 面包屑                          │
├─────────────────────────────────────────────────────────────┤
│  筛选侧边栏    │              产品网格                        │
│  • 产品类别    │  ┌─────────┐ ┌─────────┐ ┌─────────┐        │
│  • 像素间距    │  │ 产品卡片 │ │ 产品卡片 │ │ 产品卡片 │        │
│  • 应用场景    │  └─────────┘ └─────────┘ └─────────┘        │
│  • 亮度范围    │  ┌─────────┐ ┌─────────┐ ┌─────────┐        │
│  • 价格区间    │  │ 产品卡片 │ │ 产品卡片 │ │ 产品卡片 │        │
│               │  └─────────┘ └─────────┘ └─────────┘        │
├─────────────────────────────────────────────────────────────┤
│                    产品对比栏 (固定底部)                       │
│  • 已选产品预览                                               │
│  • 对比按钮                                                  │
└─────────────────────────────────────────────────────────────┘
```

#### 3. 产品详情页布局
```
┌─────────────────────────────────────────────────────────────┐
│                    导航栏 + 面包屑                            │
├─────────────────────────────────────────────────────────────┤
│  产品图片展示      │           产品基本信息                    │
│  • 主图片         │  • 产品名称                              │
│  • 图片画廊       │  • 核心规格                              │
│  • 360度展示      │  • 应用场景                              │
│  • 视频播放       │  • 询盘按钮                              │
│                  │  • 对比按钮                              │
├─────────────────────────────────────────────────────────────┤
│                    详细技术参数表格                           │
├─────────────────────────────────────────────────────────────┤
│                    应用案例展示                               │
├─────────────────────────────────────────────────────────────┤
│                    相关产品推荐                               │
├─────────────────────────────────────────────────────────────┤
│                    下载中心                                   │
│  • 产品手册                                                  │
│  • 技术规格书                                                │
│  • 安装指南                                                  │
└─────────────────────────────────────────────────────────────┘
```

### 响应式设计策略

#### 断点设置
```css
/* 移动端优先设计 */
@media (min-width: 640px) { /* sm - 小屏幕 */ }
@media (min-width: 768px) { /* md - 平板 */ }
@media (min-width: 1024px) { /* lg - 笔记本 */ }
@media (min-width: 1280px) { /* xl - 桌面 */ }
@media (min-width: 1536px) { /* 2xl - 大屏幕 */ }
```

#### 移动端优化
- **导航**: 汉堡菜单，全屏覆盖
- **产品网格**: 3列→2列→1列自适应
- **表格**: 横向滚动 + 卡片式重组
- **表单**: 单列布局，大按钮设计
- **图片**: 懒加载 + WebP格式优化

## 错误处理

### 前端错误处理
```typescript
// 全局错误边界
class ErrorBoundary extends React.Component {
  // 捕获组件错误
  // 显示友好错误页面
  // 错误上报
}

// API错误处理
const apiErrorHandler = {
  400: '请求参数错误',
  401: '未授权访问',
  403: '权限不足',
  404: '资源不存在',
  500: '服务器内部错误',
  503: '服务暂不可用'
};
```

### 后端错误处理
```typescript
// 统一错误响应格式
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
  path: string;
}

// 错误中间件
const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  // 日志记录
  // 错误分类
  // 响应格式化
};
```

## 测试策略

### 前端测试
- **单元测试**: Jest + React Testing Library
- **集成测试**: Cypress E2E测试
- **视觉回归测试**: Chromatic
- **性能测试**: Lighthouse CI
- **可访问性测试**: axe-core

### 后端测试
- **单元测试**: Jest + Supertest
- **API测试**: Postman + Newman
- **负载测试**: Artillery.js
- **安全测试**: OWASP ZAP

### 测试覆盖率目标
- 单元测试覆盖率: >80%
- 集成测试覆盖率: >70%
- E2E测试覆盖率: >60%

## 性能优化策略

### 前端性能优化
1. **代码分割**: 路由级别和组件级别分割
2. **图片优化**: WebP/AVIF格式，响应式图片
3. **缓存策略**: 浏览器缓存 + CDN缓存
4. **预加载**: 关键资源预加载
5. **懒加载**: 图片和组件懒加载
6. **Bundle优化**: Tree shaking + 压缩

### 后端性能优化
1. **数据库优化**: 索引优化 + 查询优化
2. **缓存策略**: Redis缓存热点数据
3. **CDN配置**: 静态资源全球分发
4. **负载均衡**: 多服务器负载分配
5. **压缩**: Gzip/Brotli压缩
6. **连接池**: 数据库连接管理

### 性能指标目标
- **LCP (Largest Contentful Paint)**: <2.5秒
- **FID (First Input Delay)**: <100毫秒
- **CLS (Cumulative Layout Shift)**: <0.1
- **TTFB (Time to First Byte)**: <600毫秒
- **页面加载时间**: <3秒 (3G网络)

## 安全设计

### 安全措施
1. **HTTPS**: 全站SSL加密
2. **输入验证**: 防止SQL注入、XSS攻击
3. **CSRF保护**: Token验证
4. **身份认证**: JWT + OAuth 2.0
5. **权限控制**: RBAC权限模型
6. **数据加密**: 敏感数据加密存储
7. **安全头**: CSP、HSTS等安全头配置
8. **日志监控**: 安全事件监控和告警

### 合规要求
- **GDPR**: 欧盟数据保护条例合规
- **隐私政策**: 明确的数据使用说明
- **Cookie政策**: Cookie使用同意管理
- **数据最小化**: 只收集必要的用户数据

## 国际化设计

### 多语言支持
```typescript
// i18n配置
const i18nConfig = {
  locales: ['zh', 'en'],
  defaultLocale: 'zh',
  domains: [
    {
      domain: 'lejin-led.com',
      defaultLocale: 'en'
    },
    {
      domain: 'lejin-led.cn',
      defaultLocale: 'zh'
    }
  ]
};

// 语言切换组件
interface LanguageSwitcherProps {
  currentLocale: string;
  onLocaleChange: (locale: string) => void;
}
```

### 本地化策略
- **URL结构**: 子域名方式 (en.lejin-led.com)
- **内容本地化**: 不同地区的商务表达习惯
- **货币显示**: 多货币支持 (USD, EUR, CNY)
- **日期格式**: 本地化日期时间格式
- **SEO优化**: hreflang标签配置

这个设计文档为LED显示屏B2B网站提供了完整的技术架构和实现方案，确保网站能够满足所有需求并提供优秀的用户体验。