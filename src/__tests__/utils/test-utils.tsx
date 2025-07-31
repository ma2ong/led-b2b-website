/**
 * 测试工具函数
 */
import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import i18n from '@/lib/i18n-config';

// 创建测试用的QueryClient
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

// 所有Provider的包装器
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = createTestQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <BrowserRouter>
          {children}
        </BrowserRouter>
      </I18nextProvider>
    </QueryClientProvider>
  );
};

// 自定义render函数
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// 模拟IntersectionObserver
export const mockIntersectionObserver = () => {
  const mockIntersectionObserver = jest.fn();
  mockIntersectionObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null,
  });
  window.IntersectionObserver = mockIntersectionObserver;
};

// 模拟ResizeObserver
export const mockResizeObserver = () => {
  const mockResizeObserver = jest.fn();
  mockResizeObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null,
  });
  window.ResizeObserver = mockResizeObserver;
};

// 模拟matchMedia
export const mockMatchMedia = (matches: boolean = false) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches,
      media: query,
      onchange: null,
      addListener: jest.fn(), // deprecated
      removeListener: jest.fn(), // deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
};

// 模拟localStorage
export const mockLocalStorage = () => {
  const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  };
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
  });
  return localStorageMock;
};

// 模拟sessionStorage
export const mockSessionStorage = () => {
  const sessionStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  };
  Object.defineProperty(window, 'sessionStorage', {
    value: sessionStorageMock,
  });
  return sessionStorageMock;
};

// 模拟fetch
export const mockFetch = (response: any, ok: boolean = true) => {
  global.fetch = jest.fn().mockResolvedValue({
    ok,
    status: ok ? 200 : 400,
    json: jest.fn().mockResolvedValue(response),
    text: jest.fn().mockResolvedValue(JSON.stringify(response)),
  });
};

// 模拟URL.createObjectURL
export const mockCreateObjectURL = () => {
  global.URL.createObjectURL = jest.fn().mockReturnValue('mock-url');
  global.URL.revokeObjectURL = jest.fn();
};

// 模拟File和FileReader
export const mockFileReader = () => {
  const mockFileReader = {
    readAsDataURL: jest.fn(),
    readAsText: jest.fn(),
    result: 'mock-file-content',
    onload: null,
    onerror: null,
  };
  
  global.FileReader = jest.fn().mockImplementation(() => mockFileReader);
  return mockFileReader;
};

// 创建模拟文件
export const createMockFile = (
  name: string = 'test.jpg',
  size: number = 1024,
  type: string = 'image/jpeg'
): File => {
  const file = new File(['mock content'], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
};

// 等待异步操作完成
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0));

// 模拟用户交互延迟
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// 创建模拟产品数据
export const createMockProduct = (overrides = {}) => ({
  id: 'prod_001',
  name: 'Test Product',
  slug: 'test-product',
  description: 'Test product description',
  shortDescription: 'Test product',
  category: 'Indoor LED',
  subcategory: 'Fine Pitch',
  tags: ['test', 'indoor'],
  status: 'active',
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
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

// 创建模拟询盘数据
export const createMockInquiry = (overrides = {}) => ({
  id: 'inq_001',
  type: 'product_inquiry',
  status: 'new',
  priority: 'medium',
  contact: {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    position: 'Manager',
  },
  company: {
    name: 'Test Company',
    industry: 'Retail',
    website: 'https://testcompany.com',
    country: 'US',
    city: 'New York',
  },
  project: {
    name: 'Test Project',
    description: 'Test project description',
    budget: {
      min: 10000,
      max: 50000,
      currency: 'USD',
    },
    timeline: 'Q2 2024',
  },
  products: [],
  message: 'Test inquiry message',
  source: 'website',
  assignedTo: null,
  tags: [],
  notes: [],
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

// 创建模拟案例研究数据
export const createMockCaseStudy = (overrides = {}) => ({
  id: 'case_001',
  title: 'Test Case Study',
  slug: 'test-case-study',
  description: 'Test case study description',
  client: {
    name: 'Test Client',
    industry: 'Retail',
    location: 'New York, US',
  },
  project: {
    name: 'Test Project',
    description: 'Test project description',
    challenges: ['Challenge 1', 'Challenge 2'],
    solutions: ['Solution 1', 'Solution 2'],
    results: ['Result 1', 'Result 2'],
  },
  products: [],
  images: [],
  location: {
    country: 'US',
    city: 'New York',
    coordinates: {
      lat: 40.7128,
      lng: -74.0060,
    },
  },
  tags: ['retail', 'indoor'],
  featured: false,
  publishedAt: new Date('2024-01-01'),
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

// 模拟API响应
export const mockApiResponse = (data: any, status: number = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: () => Promise.resolve(data),
  text: () => Promise.resolve(JSON.stringify(data)),
});

// 模拟错误响应
export const mockApiError = (message: string, status: number = 400) => ({
  ok: false,
  status,
  json: () => Promise.resolve({ error: message }),
  text: () => Promise.resolve(JSON.stringify({ error: message })),
});

// 清理所有模拟
export const cleanupMocks = () => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
};

// 重新导出所有testing-library的工具
export * from '@testing-library/react';
export { customRender as render };