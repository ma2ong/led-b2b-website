/**
 * 动态sitemap生成器
 */
import { Product } from '@/types/product';
import { CaseStudy } from '@/types/case-study';
import { Solution } from '@/types/solution';

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
  alternates?: { [key: string]: string };
}

export const generateSitemap = async (): Promise<string> => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://example.com';
  const currentDate = new Date().toISOString();
  
  const urls: SitemapUrl[] = [];
  
  // 静态页面
  const staticPages = [
    { path: '/', priority: 1.0, changefreq: 'daily' as const },
    { path: '/about', priority: 0.8, changefreq: 'monthly' as const },
    { path: '/products', priority: 0.9, changefreq: 'weekly' as const },
    { path: '/solutions', priority: 0.9, changefreq: 'weekly' as const },
    { path: '/case-studies', priority: 0.9, changefreq: 'weekly' as const },
    { path: '/contact', priority: 0.8, changefreq: 'monthly' as const },
    { path: '/news', priority: 0.7, changefreq: 'daily' as const },
  ];
  
  staticPages.forEach(page => {
    urls.push({
      loc: `${baseUrl}${page.path}`,
      lastmod: currentDate,
      changefreq: page.changefreq,
      priority: page.priority,
      alternates: {
        'en': `${baseUrl}${page.path}`,
        'zh': `${baseUrl}/zh${page.path}`,
      },
    });
  });
  
  try {
    // 动态获取产品页面
    const products = await getProducts();
    products.forEach(product => {
      urls.push({
        loc: `${baseUrl}/products/${product.slug}`,
        lastmod: product.updatedAt?.toISOString() || currentDate,
        changefreq: 'weekly',
        priority: 0.8,
        alternates: {
          'en': `${baseUrl}/products/${product.slug}`,
          'zh': `${baseUrl}/zh/products/${product.slug}`,
        },
      });
    });
    
    // 动态获取解决方案页面
    const solutions = await getSolutions();
    solutions.forEach(solution => {
      urls.push({
        loc: `${baseUrl}/solutions/${solution.slug}`,
        lastmod: solution.updatedAt?.toISOString() || currentDate,
        changefreq: 'weekly',
        priority: 0.8,
        alternates: {
          'en': `${baseUrl}/solutions/${solution.slug}`,
          'zh': `${baseUrl}/zh/solutions/${solution.slug}`,
        },
      });
    });
    
    // 动态获取案例研究页面
    const caseStudies = await getCaseStudies();
    caseStudies.forEach(caseStudy => {
      urls.push({
        loc: `${baseUrl}/case-studies/${caseStudy.id}`,
        lastmod: caseStudy.updatedAt?.toISOString() || currentDate,
        changefreq: 'monthly',
        priority: 0.7,
        alternates: {
          'en': `${baseUrl}/case-studies/${caseStudy.id}`,
          'zh': `${baseUrl}/zh/case-studies/${caseStudy.id}`,
        },
      });
    });
    
  } catch (error) {
    console.error('Error fetching dynamic content for sitemap:', error);
  }
  
  return generateSitemapXML(urls);
};

const generateSitemapXML = (urls: SitemapUrl[]): string => {
  const urlElements = urls.map(url => {
    let urlXML = `  <url>
    <loc>${escapeXML(url.loc)}</loc>`;
    
    if (url.lastmod) {
      urlXML += `
    <lastmod>${url.lastmod}</lastmod>`;
    }
    
    if (url.changefreq) {
      urlXML += `
    <changefreq>${url.changefreq}</changefreq>`;
    }
    
    if (url.priority !== undefined) {
      urlXML += `
    <priority>${url.priority}</priority>`;
    }
    
    // 添加多语言链接
    if (url.alternates) {
      Object.entries(url.alternates).forEach(([lang, href]) => {
        urlXML += `
    <xhtml:link rel="alternate" hreflang="${lang}" href="${escapeXML(href)}" />`;
      });
    }
    
    urlXML += `
  </url>`;
    
    return urlXML;
  }).join('\n');
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urlElements}
</urlset>`;
};

const escapeXML = (str: string): string => {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

// 模拟数据获取函数（实际项目中应该从数据库或API获取）
const getProducts = async (): Promise<Product[]> => {
  // 这里应该从数据库或API获取产品数据
  return [
    {
      id: 'p001',
      slug: 'p2-5-indoor-led-display',
      name: 'P2.5 Indoor LED Display',
      updatedAt: new Date('2024-01-15'),
    } as Product,
    {
      id: 'p002',
      slug: 'p3-outdoor-led-screen',
      name: 'P3 Outdoor LED Screen',
      updatedAt: new Date('2024-01-10'),
    } as Product,
  ];
};

const getSolutions = async (): Promise<Solution[]> => {
  return [
    {
      id: 's001',
      slug: 'retail-digital-signage',
      title: 'Retail Digital Signage',
      updatedAt: new Date('2024-01-12'),
    } as Solution,
    {
      id: 's002',
      slug: 'outdoor-advertising-displays',
      title: 'Outdoor Advertising Displays',
      updatedAt: new Date('2024-01-08'),
    } as Solution,
  ];
};

const getCaseStudies = async (): Promise<CaseStudy[]> => {
  return [
    {
      id: 'case_001',
      title: 'Times Square Digital Billboard',
      updatedAt: new Date('2024-01-05'),
    } as CaseStudy,
    {
      id: 'case_002',
      title: 'Shanghai Shopping Mall LED Wall',
      updatedAt: new Date('2024-01-03'),
    } as CaseStudy,
  ];
};