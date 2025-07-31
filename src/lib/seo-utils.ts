/**
 * SEO工具函数库
 */

// 生成页面标题
export const generatePageTitle = (title: string, siteName: string = 'LED Display Solutions'): string => {
  if (!title) return siteName;
  return `${title} | ${siteName}`;
};

// 生成meta描述
export const generateMetaDescription = (description: string, maxLength: number = 160): string => {
  if (!description) return '';
  if (description.length <= maxLength) return description;
  return description.substring(0, maxLength - 3).trim() + '...';
};

// 生成关键词
export const generateKeywords = (keywords: string[], defaultKeywords: string[] = []): string => {
  const allKeywords = [...new Set([...defaultKeywords, ...keywords])];
  return allKeywords.join(', ');
};

// 生成规范URL
export const generateCanonicalUrl = (path: string, baseUrl: string): string => {
  const cleanPath = path.replace(/\/$/, '') || '/';
  return `${baseUrl}${cleanPath}`;
};

// 生成Open Graph图片URL
export const generateOGImageUrl = (
  title: string,
  description?: string,
  baseUrl: string = process.env.NEXT_PUBLIC_BASE_URL || ''
): string => {
  const params = new URLSearchParams();
  params.set('title', title);
  if (description) params.set('description', description);
  
  return `${baseUrl}/api/og?${params.toString()}`;
};

// 验证和清理URL
export const cleanUrl = (url: string): string => {
  try {
    const urlObj = new URL(url);
    return urlObj.toString();
  } catch {
    return url;
  }
};

// 生成面包屑导航
export const generateBreadcrumbs = (
  path: string,
  baseUrl: string,
  customLabels: { [key: string]: string } = {}
): Array<{ name: string; url: string }> => {
  const segments = path.split('/').filter(Boolean);
  const breadcrumbs = [{ name: 'Home', url: baseUrl }];
  
  let currentPath = '';
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const label = customLabels[segment] || segment.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    breadcrumbs.push({
      name: label,
      url: `${baseUrl}${currentPath}`,
    });
  });
  
  return breadcrumbs;
};

// 生成hreflang标签数据
export const generateHrefLangData = (
  path: string,
  baseUrl: string,
  supportedLocales: string[] = ['en', 'zh']
): { [key: string]: string } => {
  const hrefLangs: { [key: string]: string } = {};
  
  supportedLocales.forEach(locale => {
    const localePath = locale === 'en' ? path : `/${locale}${path}`;
    hrefLangs[locale] = `${baseUrl}${localePath}`;
  });
  
  // 添加x-default
  hrefLangs['x-default'] = `${baseUrl}${path}`;
  
  return hrefLangs;
};

// 提取文本内容用于描述
export const extractTextContent = (html: string, maxLength: number = 160): string => {
  const text = html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  return text.length > maxLength ? text.substring(0, maxLength - 3) + '...' : text;
};

// 生成robots meta内容
export const generateRobotsContent = (
  index: boolean = true,
  follow: boolean = true,
  additional: string[] = []
): string => {
  const robots = [
    index ? 'index' : 'noindex',
    follow ? 'follow' : 'nofollow',
    ...additional
  ];
  return robots.join(',');
};

// 验证结构化数据
export const validateStructuredData = (data: any): boolean => {
  try {
    if (!data || typeof data !== 'object') return false;
    if (!data['@context'] || !data['@type']) return false;
    JSON.stringify(data); // 检查是否可序列化
    return true;
  } catch {
    return false;
  }
};