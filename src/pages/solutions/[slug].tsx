/**
 * 解决方案详情页面
 */
import React from 'react';
import { GetStaticProps, GetStaticPaths } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import SolutionDetailPage from '@/components/solutions/SolutionDetailPage';
import { Solution, SolutionIndustry, SolutionCategory } from '@/types/solution';
import { Product } from '@/types/product';
import { CaseStudy } from '@/types/case-study';

interface SolutionDetailProps {
  solution: Solution;
  recommendedProducts: Product[];
  relatedCaseStudies: CaseStudy[];
  relatedSolutions: Solution[];
}

const SolutionDetail: React.FC<SolutionDetailProps> = ({
  solution,
  recommendedProducts,
  relatedCaseStudies,
  relatedSolutions
}) => {
  const router = useRouter();

  if (router.isFallback) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-3 text-gray-600">Loading solution...</span>
      </div>
    );
  }

  return (
    <SolutionDetailPage
      solution={solution}
      recommendedProducts={recommendedProducts}
      relatedCaseStudies={relatedCaseStudies}
      relatedSolutions={relatedSolutions}
    />
  );
};

export const getStaticPaths: GetStaticPaths = async ({ locales }) => {
  // 生成所有解决方案的路径
  const solutionSlugs = [
    'retail-digital-signage',
    'outdoor-advertising',
    'conference-room-displays',
    'transportation-displays',
    'hospitality-solutions',
    'education-displays',
    'healthcare-signage',
    'entertainment-venues',
    'corporate-communications',
    'government-displays',
    'sports-venues',
    'broadcasting-studios',
    'event-displays',
  ];

  const paths = [];
  for (const locale of locales || ['en']) {
    for (const slug of solutionSlugs) {
      paths.push({
        params: { slug },
        locale,
      });
    }
  }

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params, locale }) => {
  const slug = params?.slug as string;

  // 模拟获取解决方案数据
  const solution = await getMockSolution(slug);
  
  if (!solution) {
    return {
      notFound: true,
    };
  }

  // 获取推荐产品
  const recommendedProducts = await getMockRecommendedProducts(solution.recommendedProducts);
  
  // 获取相关案例研究
  const relatedCaseStudies = await getMockRelatedCaseStudies(solution.caseStudies);
  
  // 获取相关解决方案
  const relatedSolutions = await getMockRelatedSolutions(solution.industry, solution.id);

  return {
    props: {
      solution,
      recommendedProducts,
      relatedCaseStudies,
      relatedSolutions,
      ...(await serverSideTranslations(locale ?? 'en', [
        'common',
        'solutions',
        'products',
        'forms'
      ])),
    },
    revalidate: 3600, // 1 hour
  };
};

// 模拟数据获取函数
async function getMockSolution(slug: string): Promise<Solution | null> {
  const solutions: Record<string, Solution> = {
    'retail-digital-signage': {
      id: 'retail-digital-signage',
      title: 'Retail Digital Signage Solutions',
      slug: 'retail-digital-signage',
      description: 'Transform your retail space with dynamic digital displays that engage customers and drive sales.',
      industry: SolutionIndustry.RETAIL,
      category: SolutionCategory.INDOOR_FIXED,
      heroImage: '/images/solutions/retail-signage-hero.jpg',
      gallery: [
        {
          id: 'img1',
          url: '/images/solutions/retail-1.jpg',
          alt: 'Retail Digital Signage Display',
          isMain: true,
          sortOrder: 1,
        },
        {
          id: 'img2',
          url: '/images/solutions/retail-2.jpg',
          alt: 'Shopping Mall Digital Display',
          isMain: false,
          sortOrder: 2,
        },
        {
          id: 'img3',
          url: '/images/solutions/retail-3.jpg',
          alt: 'Store Window Display',
          isMain: false,
          sortOrder: 3,
        },
      ],
      features: [
        'High brightness for window displays',
        'Energy-efficient LED technology',
        'Remote content management',
        'Easy installation and maintenance',
        'Multiple size options',
        'Weather-resistant options',
      ],
      benefits: [
        'Increase sales by up to 30%',
        'Enhance customer experience',
        'Reduce printing costs',
        'Real-time content updates',
        'Attract more foot traffic',
        'Improve brand visibility',
      ],
      applications: [
        'Shopping malls',
        'Retail stores',
        'Supermarkets',
        'Fashion boutiques',
        'Electronics stores',
        'Restaurant chains',
      ],
      technicalSpecs: [
        {
          id: 'spec1',
          category: 'Display',
          name: 'Pixel Pitch',
          value: '2.5',
          unit: 'mm',
          isHighlight: true,
          sortOrder: 1,
        },
        {
          id: 'spec2',
          category: 'Display',
          name: 'Brightness',
          value: '1000',
          unit: 'nits',
          isHighlight: true,
          sortOrder: 2,
        },
        {
          id: 'spec3',
          category: 'Display',
          name: 'Viewing Angle',
          value: '160',
          unit: '°',
          isHighlight: false,
          sortOrder: 3,
        },
        {
          id: 'spec4',
          category: 'Power',
          name: 'Power Consumption',
          value: '150',
          unit: 'W/m²',
          isHighlight: false,
          sortOrder: 4,
        },
        {
          id: 'spec5',
          category: 'Environment',
          name: 'Operating Temperature',
          value: '-20 to +60',
          unit: '°C',
          isHighlight: false,
          sortOrder: 5,
        },
      ],
      recommendedProducts: ['product-1', 'product-2', 'product-3'],
      caseStudies: ['case-1', 'case-2'],
      tags: ['retail', 'indoor', 'digital-signage', 'shopping'],
      isActive: true,
      isFeatured: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-15'),
    },
    'outdoor-advertising': {
      id: 'outdoor-advertising',
      title: 'Outdoor Advertising Displays',
      slug: 'outdoor-advertising',
      description: 'High-impact outdoor LED displays for maximum visibility and advertising effectiveness.',
      industry: SolutionIndustry.ADVERTISING,
      category: SolutionCategory.OUTDOOR_ADVERTISING,
      heroImage: '/images/solutions/outdoor-advertising-hero.jpg',
      gallery: [
        {
          id: 'img1',
          url: '/images/solutions/outdoor-1.jpg',
          alt: 'Outdoor LED Billboard',
          isMain: true,
          sortOrder: 1,
        },
      ],
      features: [
        'Ultra-high brightness (6000+ nits)',
        'Weather-resistant IP65 rating',
        'Wide viewing angles',
        'Energy-efficient design',
        'Remote monitoring',
        'Modular construction',
      ],
      benefits: [
        'Maximum visibility day and night',
        'Cost-effective advertising',
        'Dynamic content capabilities',
        'Long-term durability',
        'Easy content management',
        'High return on investment',
      ],
      applications: [
        'Highway billboards',
        'Building facades',
        'Transportation hubs',
        'Sports stadiums',
        'Shopping centers',
        'City centers',
      ],
      technicalSpecs: [
        {
          id: 'spec1',
          category: 'Display',
          name: 'Pixel Pitch',
          value: '6',
          unit: 'mm',
          isHighlight: true,
          sortOrder: 1,
        },
        {
          id: 'spec2',
          category: 'Display',
          name: 'Brightness',
          value: '6000',
          unit: 'nits',
          isHighlight: true,
          sortOrder: 2,
        },
      ],
      recommendedProducts: ['product-4', 'product-5'],
      caseStudies: ['case-3'],
      tags: ['outdoor', 'advertising', 'billboard', 'high-brightness'],
      isActive: true,
      isFeatured: true,
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-16'),
    },
  };

  return solutions[slug] || null;
}

async function getMockRecommendedProducts(productIds: string[]): Promise<Product[]> {
  // 模拟产品数据
  const mockProducts: Product[] = [
    {
      id: 'product-1',
      name: 'P2.5 Indoor LED Display',
      slug: 'p2-5-indoor-led-display',
      description: 'High-resolution indoor LED display perfect for retail environments',
      category: 'indoor-fixed',
      specifications: {
        pixelPitch: '2.5mm',
        brightness: '1000 nits',
        resolution: '1920x1080',
        refreshRate: '60Hz',
        viewingAngle: '160°',
        powerConsumption: '150W/m²',
        operatingTemp: '-20°C to +60°C',
        protection: 'IP40',
        lifespan: '100,000 hours',
        weight: '12 kg/m²',
      },
      images: {
        main: '/images/products/p2-5-indoor-main.jpg',
        gallery: ['/images/products/p2-5-indoor-1.jpg'],
        thumbnail: '/images/products/p2-5-indoor-thumb.jpg',
      },
      features: ['High Resolution', 'Energy Efficient', 'Easy Maintenance'],
      applications: ['Retail', 'Corporate', 'Education'],
      certifications: ['CE', 'FCC', 'RoHS'],
      warranty: '2 years',
      isActive: true,
      isFeatured: true,
      tags: ['indoor', 'retail', 'high-resolution'],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-15'),
    },
  ];

  return mockProducts.filter(product => productIds.includes(product.id));
}

async function getMockRelatedCaseStudies(caseStudyIds: string[]): Promise<CaseStudy[]> {
  // 模拟案例研究数据
  const mockCaseStudies: CaseStudy[] = [
    {
      id: 'case-1',
      title: 'Shopping Mall Digital Transformation',
      slug: 'shopping-mall-digital-transformation',
      description: 'How a major shopping mall increased foot traffic by 40% with digital signage',
      client: {
        name: 'Metro Shopping Center',
        industry: 'Retail',
        location: 'New York, USA',
        size: 'Large',
      },
      challenge: 'Low foot traffic and outdated advertising methods',
      solution: 'Comprehensive digital signage network with interactive displays',
      results: [
        '40% increase in foot traffic',
        '25% boost in tenant satisfaction',
        '60% reduction in advertising costs',
      ],
      images: {
        hero: '/images/case-studies/shopping-mall-hero.jpg',
        gallery: ['/images/case-studies/shopping-mall-1.jpg'],
        before: '/images/case-studies/shopping-mall-before.jpg',
        after: '/images/case-studies/shopping-mall-after.jpg',
      },
      products: ['P2.5 Indoor LED Display', 'Control System'],
      timeline: '3 months',
      budget: '$500,000 - $1,000,000',
      tags: ['retail', 'shopping-mall', 'digital-signage'],
      isActive: true,
      isFeatured: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-15'),
    },
  ];

  return mockCaseStudies.filter(caseStudy => caseStudyIds.includes(caseStudy.id));
}

async function getMockRelatedSolutions(industry: SolutionIndustry, excludeId: string): Promise<Solution[]> {
  // 返回同行业的其他解决方案
  const allSolutions = [
    {
      id: 'conference-room-displays',
      title: 'Conference Room Displays',
      slug: 'conference-room-displays',
      description: 'Professional displays for modern meeting rooms and conference facilities',
      industry: SolutionIndustry.CORPORATE,
      category: SolutionCategory.INDOOR_FIXED,
      heroImage: '/images/solutions/conference-room-hero.jpg',
      gallery: [],
      features: [],
      benefits: [],
      applications: [],
      technicalSpecs: [],
      recommendedProducts: [],
      caseStudies: [],
      tags: ['corporate', 'meeting-room'],
      isActive: true,
      isFeatured: false,
      createdAt: new Date('2024-01-03'),
      updatedAt: new Date('2024-01-17'),
    },
  ];

  return allSolutions
    .filter(solution => solution.industry === industry && solution.id !== excludeId)
    .slice(0, 3);
}

export default SolutionDetail;