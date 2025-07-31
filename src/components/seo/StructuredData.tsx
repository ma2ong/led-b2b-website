/**
 * 结构化数据组件，用于生成JSON-LD格式的结构化数据
 */
import React from 'react';
import Head from 'next/head';

interface StructuredDataProps {
  data: any;
}

const StructuredData: React.FC<StructuredDataProps> = ({ data }) => {
  if (!data) return null;

  // 清理和验证数据
  const cleanData = (obj: any): any => {
    if (obj === null || obj === undefined) return null;
    
    if (Array.isArray(obj)) {
      return obj.map(cleanData).filter(item => item !== null);
    }
    
    if (typeof obj === 'object') {
      const cleaned: any = {};
      for (const [key, value] of Object.entries(obj)) {
        const cleanedValue = cleanData(value);
        if (cleanedValue !== null && cleanedValue !== undefined) {
          cleaned[key] = cleanedValue;
        }
      }
      return Object.keys(cleaned).length > 0 ? cleaned : null;
    }
    
    return obj;
  };

  const cleanedData = cleanData(data);
  
  if (!cleanedData) return null;

  return (
    <Head>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(cleanedData, null, 2),
        }}
      />
    </Head>
  );
};

// 预定义的结构化数据模板
export const createOrganizationSchema = (organization: {
  name: string;
  url: string;
  logo: string;
  description?: string;
  address?: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  contactPoint?: {
    telephone: string;
    contactType: string;
    email?: string;
    availableLanguage?: string[];
  };
  sameAs?: string[];
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: organization.name,
  url: organization.url,
  logo: {
    '@type': 'ImageObject',
    url: organization.logo,
  },
  description: organization.description,
  address: organization.address ? {
    '@type': 'PostalAddress',
    streetAddress: organization.address.streetAddress,
    addressLocality: organization.address.addressLocality,
    addressRegion: organization.address.addressRegion,
    postalCode: organization.address.postalCode,
    addressCountry: organization.address.addressCountry,
  } : undefined,
  contactPoint: organization.contactPoint ? {
    '@type': 'ContactPoint',
    telephone: organization.contactPoint.telephone,
    contactType: organization.contactPoint.contactType,
    email: organization.contactPoint.email,
    availableLanguage: organization.contactPoint.availableLanguage,
  } : undefined,
  sameAs: organization.sameAs,
});

export const createProductSchema = (product: {
  name: string;
  description: string;
  image: string;
  brand?: string;
  model?: string;
  sku?: string;
  gtin?: string;
  category?: string;
  offers?: {
    price: number;
    currency: string;
    availability: 'InStock' | 'OutOfStock' | 'PreOrder';
    validFrom?: string;
    validThrough?: string;
    seller?: string;
  };
  aggregateRating?: {
    ratingValue: number;
    reviewCount: number;
    bestRating?: number;
    worstRating?: number;
  };
  reviews?: Array<{
    author: string;
    datePublished: string;
    reviewBody: string;
    reviewRating: number;
  }>;
}) => ({
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
  category: product.category,
  offers: product.offers ? {
    '@type': 'Offer',
    price: product.offers.price,
    priceCurrency: product.offers.currency,
    availability: `https://schema.org/${product.offers.availability}`,
    validFrom: product.offers.validFrom,
    validThrough: product.offers.validThrough,
    seller: product.offers.seller ? {
      '@type': 'Organization',
      name: product.offers.seller,
    } : undefined,
  } : undefined,
  aggregateRating: product.aggregateRating ? {
    '@type': 'AggregateRating',
    ratingValue: product.aggregateRating.ratingValue,
    reviewCount: product.aggregateRating.reviewCount,
    bestRating: product.aggregateRating.bestRating || 5,
    worstRating: product.aggregateRating.worstRating || 1,
  } : undefined,
  review: product.reviews?.map(review => ({
    '@type': 'Review',
    author: {
      '@type': 'Person',
      name: review.author,
    },
    datePublished: review.datePublished,
    reviewBody: review.reviewBody,
    reviewRating: {
      '@type': 'Rating',
      ratingValue: review.reviewRating,
      bestRating: 5,
      worstRating: 1,
    },
  })),
});

export const createArticleSchema = (article: {
  headline: string;
  description: string;
  image: string;
  author: string;
  datePublished: string;
  dateModified?: string;
  publisher: {
    name: string;
    logo: string;
  };
  mainEntityOfPage?: string;
  articleSection?: string;
  keywords?: string[];
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: article.headline,
  description: article.description,
  image: {
    '@type': 'ImageObject',
    url: article.image,
  },
  author: {
    '@type': 'Person',
    name: article.author,
  },
  datePublished: article.datePublished,
  dateModified: article.dateModified || article.datePublished,
  publisher: {
    '@type': 'Organization',
    name: article.publisher.name,
    logo: {
      '@type': 'ImageObject',
      url: article.publisher.logo,
    },
  },
  mainEntityOfPage: article.mainEntityOfPage,
  articleSection: article.articleSection,
  keywords: article.keywords,
});

export const createBreadcrumbSchema = (breadcrumbs: Array<{
  name: string;
  url: string;
}>) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: breadcrumbs.map((crumb, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: crumb.name,
    item: crumb.url,
  })),
});

export const createFAQSchema = (faqs: Array<{
  question: string;
  answer: string;
}>) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(faq => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  })),
});

export const createLocalBusinessSchema = (business: {
  name: string;
  description: string;
  url: string;
  telephone: string;
  email?: string;
  address: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  geo?: {
    latitude: number;
    longitude: number;
  };
  openingHours?: string[];
  priceRange?: string;
  image?: string;
  aggregateRating?: {
    ratingValue: number;
    reviewCount: number;
  };
}) => ({
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: business.name,
  description: business.description,
  url: business.url,
  telephone: business.telephone,
  email: business.email,
  address: {
    '@type': 'PostalAddress',
    streetAddress: business.address.streetAddress,
    addressLocality: business.address.addressLocality,
    addressRegion: business.address.addressRegion,
    postalCode: business.address.postalCode,
    addressCountry: business.address.addressCountry,
  },
  geo: business.geo ? {
    '@type': 'GeoCoordinates',
    latitude: business.geo.latitude,
    longitude: business.geo.longitude,
  } : undefined,
  openingHoursSpecification: business.openingHours?.map(hours => ({
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: hours.split(' ')[0],
    opens: hours.split(' ')[1],
    closes: hours.split(' ')[2],
  })),
  priceRange: business.priceRange,
  image: business.image,
  aggregateRating: business.aggregateRating ? {
    '@type': 'AggregateRating',
    ratingValue: business.aggregateRating.ratingValue,
    reviewCount: business.aggregateRating.reviewCount,
  } : undefined,
});

export const createWebsiteSchema = (website: {
  name: string;
  url: string;
  description?: string;
  publisher?: {
    name: string;
    logo: string;
  };
  potentialAction?: {
    target: string;
    queryInput: string;
  };
}) => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: website.name,
  url: website.url,
  description: website.description,
  publisher: website.publisher ? {
    '@type': 'Organization',
    name: website.publisher.name,
    logo: {
      '@type': 'ImageObject',
      url: website.publisher.logo,
    },
  } : undefined,
  potentialAction: website.potentialAction ? {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: website.potentialAction.target,
    },
    'query-input': website.potentialAction.queryInput,
  } : undefined,
});

export default StructuredData;