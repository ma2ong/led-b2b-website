/**
 * 增强的SEO组件，包含完整的meta标签、结构化数据和社交媒体标签
 */
import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import StructuredData from './StructuredData';
import HrefLangTags from './HrefLangTags';

export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  imageAlt?: string;
  type?: 'website' | 'article' | 'product' | 'profile';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
  tags?: string[];
  noIndex?: boolean;
  noFollow?: boolean;
  canonical?: string;
  alternateLanguages?: { [key: string]: string };
  structuredData?: any;
  breadcrumbs?: Array<{
    name: string;
    url: string;
  }>;
  product?: {
    name: string;
    description: string;
    image: string;
    price?: number;
    currency?: string;
    availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
    brand?: string;
    model?: string;
    sku?: string;
    gtin?: string;
    reviews?: {
      rating: number;
      reviewCount: number;
    };
  };
  organization?: {
    name: string;
    logo: string;
    url: string;
    sameAs?: string[];
    contactPoint?: {
      telephone: string;
      contactType: string;
      email?: string;
    };
  };
}

const EnhancedSEO: React.FC<SEOProps> = ({
  title,
  description,
  keywords = [],
  image,
  imageAlt,
  type = 'website',
  publishedTime,
  modifiedTime,
  author,
  section,
  tags = [],
  noIndex = false,
  noFollow = false,
  canonical,
  alternateLanguages,
  structuredData,
  breadcrumbs,
  product,
  organization,
}) => {
  const router = useRouter();
  const { i18n } = useTranslation();
  
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://example.com';
  const currentUrl = `${baseUrl}${router.asPath}`;
  const currentLanguage = i18n.language || 'en';
  
  // 默认值
  const defaultTitle = 'LED Display Solutions | Professional LED Screens & Digital Signage';
  const defaultDescription = 'Leading provider of high-quality LED display solutions for indoor and outdoor applications. Custom LED screens, digital signage, and professional installation services worldwide.';
  const defaultImage = `${baseUrl}/images/og-default.jpg`;
  const defaultKeywords = [
    'LED display',
    'LED screen',
    'digital signage',
    'LED wall',
    'outdoor LED',
    'indoor LED',
    'LED billboard',
    'video wall',
    'LED panel',
    'display solutions'
  ];

  const seoTitle = title || defaultTitle;
  const seoDescription = description || defaultDescription;
  const seoImage = image || defaultImage;
  const seoKeywords = [...defaultKeywords, ...keywords];
  const robotsContent = `${noIndex ? 'noindex' : 'index'},${noFollow ? 'nofollow' : 'follow'}`;

  // 生成结构化数据
  const generateStructuredData = () => {
    const baseStructuredData = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: seoTitle,
      description: seoDescription,
      url: currentUrl,
      image: seoImage,
      inLanguage: currentLanguage,
      isPartOf: {
        '@type': 'WebSite',
        name: 'LED Display Solutions',
        url: baseUrl,
      },
    };

    // 添加面包屑导航
    if (breadcrumbs && breadcrumbs.length > 0) {
      baseStructuredData['breadcrumb'] = {
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs.map((crumb, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: crumb.name,
          item: `${baseUrl}${crumb.url}`,
        })),
      };
    }

    // 添加产品信息
    if (product) {
      return {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description: product.description,
        image: product.image,
        brand: product.brand ? {
          '@type': 'Brand',
          name: product.brand,
        } : undefined,
        model: product.model,
        sku: product.sku,
        gtin: product.gtin,
        offers: product.price ? {
          '@type': 'Offer',
          price: product.price,
          priceCurrency: product.currency || 'USD',
          availability: `https://schema.org/${product.availability || 'InStock'}`,
          url: currentUrl,
        } : undefined,
        aggregateRating: product.reviews ? {
          '@type': 'AggregateRating',
          ratingValue: product.reviews.rating,
          reviewCount: product.reviews.reviewCount,
        } : undefined,
      };
    }

    // 添加组织信息
    if (organization) {
      baseStructuredData['publisher'] = {
        '@type': 'Organization',
        name: organization.name,
        logo: {
          '@type': 'ImageObject',
          url: organization.logo,
        },
        url: organization.url,
        sameAs: organization.sameAs,
        contactPoint: organization.contactPoint ? {
          '@type': 'ContactPoint',
          telephone: organization.contactPoint.telephone,
          contactType: organization.contactPoint.contactType,
          email: organization.contactPoint.email,
        } : undefined,
      };
    }

    return structuredData || baseStructuredData;
  };

  return (
    <>
      <Head>
        {/* 基础meta标签 */}
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <meta name="keywords" content={seoKeywords.join(', ')} />
        <meta name="robots" content={robotsContent} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="language" content={currentLanguage} />
        
        {/* Canonical URL */}
        <link rel="canonical" href={canonical || currentUrl} />
        
        {/* Open Graph标签 */}
        <meta property="og:type" content={type} />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:image" content={seoImage} />
        <meta property="og:image:alt" content={imageAlt || seoTitle} />
        <meta property="og:url" content={currentUrl} />
        <meta property="og:site_name" content="LED Display Solutions" />
        <meta property="og:locale" content={currentLanguage === 'zh' ? 'zh_CN' : 'en_US'} />
        
        {/* 文章特定的Open Graph标签 */}
        {type === 'article' && (
          <>
            {publishedTime && <meta property="article:published_time" content={publishedTime} />}
            {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
            {author && <meta property="article:author" content={author} />}
            {section && <meta property="article:section" content={section} />}
            {tags.map((tag, index) => (
              <meta key={index} property="article:tag" content={tag} />
            ))}
          </>
        )}
        
        {/* Twitter Card标签 */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDescription} />
        <meta name="twitter:image" content={seoImage} />
        <meta name="twitter:image:alt" content={imageAlt || seoTitle} />
        <meta name="twitter:site" content="@LEDDisplaySolutions" />
        <meta name="twitter:creator" content="@LEDDisplaySolutions" />
        
        {/* 其他重要的meta标签 */}
        <meta name="theme-color" content="#1f2937" />
        <meta name="msapplication-TileColor" content="#1f2937" />
        <meta name="application-name" content="LED Display Solutions" />
        <meta name="apple-mobile-web-app-title" content="LED Display Solutions" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        
        {/* Favicon和图标 */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        
        {/* DNS预取和预连接 */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//www.google-analytics.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* 安全相关的meta标签 */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />
        
        {/* 性能相关的资源提示 */}
        <link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        
        {/* 地理位置和联系信息 */}
        <meta name="geo.region" content="US" />
        <meta name="geo.placename" content="United States" />
        <meta name="geo.position" content="40.7128;-74.0060" />
        <meta name="ICBM" content="40.7128, -74.0060" />
        
        {/* 商业信息 */}
        <meta name="rating" content="general" />
        <meta name="distribution" content="global" />
        <meta name="revisit-after" content="7 days" />
        
        {/* 版权信息 */}
        <meta name="copyright" content="© 2024 LED Display Solutions. All rights reserved." />
        <meta name="author" content="LED Display Solutions" />
        
        {/* 移动端优化 */}
        <meta name="format-detection" content="telephone=yes" />
        <meta name="format-detection" content="address=yes" />
        <meta name="format-detection" content="email=yes" />
      </Head>
      
      {/* 多语言标签 */}
      <HrefLangTags alternateLanguages={alternateLanguages} />
      
      {/* 结构化数据 */}
      <StructuredData data={generateStructuredData()} />
    </>
  );
};

export default EnhancedSEO;