/**
 * SEO Head Component
 * SEO头部组件，包含meta标签、hreflang等SEO优化元素
 */
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';

export interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  noIndex?: boolean;
  noFollow?: boolean;
  canonical?: string;
}

export function SEOHead({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  publishedTime,
  modifiedTime,
  author,
  noIndex = false,
  noFollow = false,
  canonical,
}: SEOHeadProps) {
  const router = useRouter();
  const { t } = useTranslation('common');
  
  const currentLocale = router.locale || 'en';
  const defaultLocale = router.defaultLocale || 'en';
  
  // 构建完整的URL
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://lejin-led.com';
  const fullUrl = url || `${baseUrl}${router.asPath}`;
  const canonicalUrl = canonical || fullUrl;
  
  // 构建页面标题
  const siteTitle = t('seo.siteTitle', 'Lejin LED - Professional LED Display Solutions');
  const pageTitle = title 
    ? `${title} | ${siteTitle}`
    : siteTitle;
  
  // 默认描述和关键词
  const defaultDescription = t('seo.defaultDescription', 
    'Professional LED display manufacturer providing high-quality indoor and outdoor LED screens, digital signage solutions for global markets.'
  );
  const defaultKeywords = t('seo.defaultKeywords',
    'LED display, LED screen, digital signage, outdoor LED, indoor LED, LED wall, video wall, LED manufacturer'
  );
  
  const metaDescription = description || defaultDescription;
  const metaKeywords = keywords || defaultKeywords;
  const metaImage = image || `${baseUrl}/images/og-default.jpg`;
  
  // 构建robots指令
  const robotsContent = [];
  if (noIndex) robotsContent.push('noindex');
  if (noFollow) robotsContent.push('nofollow');
  if (robotsContent.length === 0) {
    robotsContent.push('index', 'follow');
  }
  
  return (
    <Head>
      {/* 基础meta标签 */}
      <title>{pageTitle}</title>
      <meta name="description" content={metaDescription} />
      <meta name="keywords" content={metaKeywords} />
      <meta name="robots" content={robotsContent.join(', ')} />
      
      {/* 语言和地区 */}
      <meta name="language" content={currentLocale} />
      <meta httpEquiv="content-language" content={currentLocale} />
      
      {/* 作者信息 */}
      {author && <meta name="author" content={author} />}
      <meta name="publisher" content="Shenzhen Lejin Optoelectronics Co., Ltd." />
      
      {/* 时间戳 */}
      {publishedTime && <meta name="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta name="article:modified_time" content={modifiedTime} />}
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Hreflang标签 */}
      <HrefLangTags />
      
      {/* Open Graph标签 */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={metaImage} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:site_name" content={siteTitle} />
      <meta property="og:locale" content={currentLocale === 'zh' ? 'zh_CN' : 'en_US'} />
      
      {/* Twitter Card标签 */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={metaImage} />
      <meta name="twitter:site" content="@lejinled" />
      
      {/* 移动端优化 */}
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      <meta name="format-detection" content="telephone=no" />
      
      {/* 品牌相关 */}
      <meta name="theme-color" content="#1f2937" />
      <meta name="msapplication-TileColor" content="#1f2937" />
      
      {/* 结构化数据 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Shenzhen Lejin Optoelectronics Co., Ltd.",
            "alternateName": "Lejin LED",
            "url": baseUrl,
            "logo": `${baseUrl}/images/logo.png`,
            "description": metaDescription,
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "Building A, Industrial Park",
              "addressLocality": "Shenzhen",
              "addressRegion": "Guangdong",
              "postalCode": "518000",
              "addressCountry": "CN"
            },
            "contactPoint": {
              "@type": "ContactPoint",
              "telephone": "+86-755-1234-5678",
              "contactType": "sales",
              "availableLanguage": ["English", "Chinese"]
            },
            "sameAs": [
              "https://www.linkedin.com/company/lejin-led",
              "https://www.facebook.com/lejinled",
              "https://twitter.com/lejinled"
            ]
          })
        }}
      />
    </Head>
  );
}

/**
 * Hreflang标签组件
 */
function HrefLangTags() {
  const router = useRouter();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://lejin-led.com';
  
  // 获取当前路径（不包含语言前缀）
  const getPathWithoutLocale = (asPath: string, locale: string) => {
    if (locale === router.defaultLocale) return asPath;
    return asPath.replace(`/${locale}`, '') || '/';
  };
  
  const currentPath = getPathWithoutLocale(router.asPath, router.locale || 'en');
  
  // 支持的语言列表
  const supportedLocales = [
    { code: 'en', hreflang: 'en' },
    { code: 'zh', hreflang: 'zh-CN' },
  ];
  
  return (
    <>
      {supportedLocales.map(({ code, hreflang }) => {
        const href = code === router.defaultLocale 
          ? `${baseUrl}${currentPath}`
          : `${baseUrl}/${code}${currentPath}`;
          
        return (
          <link
            key={code}
            rel="alternate"
            hrefLang={hreflang}
            href={href}
          />
        );
      })}
      
      {/* x-default for international users */}
      <link
        rel="alternate"
        hrefLang="x-default"
        href={`${baseUrl}${currentPath}`}
      />
    </>
  );
}

export default SEOHead;