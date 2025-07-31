/**
 * 案例研究模拟数据
 */
import { 
  CaseStudy,
  ProjectType,
  IndustryType,
  CaseStatus,
  GeoLocation,
  CaseCustomer,
  ProjectScale,
  TechnicalSpecs,
  ProjectChallenge,
  ProjectOutcome,
  CaseImage,
  CaseVideo,
  CustomerTestimonial,
  ProjectTimeline,
  RelatedProduct,
  ProjectTeam
} from '@/types/case-study';

// 模拟地理位置数据
const mockLocations: GeoLocation[] = [
  {
    latitude: 40.7128,
    longitude: -74.0060,
    address: '1234 Broadway',
    city: 'New York',
    state: 'NY',
    country: 'United States',
    postalCode: '10001',
    timezone: 'America/New_York',
  },
  {
    latitude: 51.5074,
    longitude: -0.1278,
    address: '123 Oxford Street',
    city: 'London',
    country: 'United Kingdom',
    postalCode: 'W1C 1DE',
    timezone: 'Europe/London',
  },
  {
    latitude: 35.6762,
    longitude: 139.6503,
    address: '1-1-1 Shibuya',
    city: 'Tokyo',
    country: 'Japan',
    postalCode: '150-0002',
    timezone: 'Asia/Tokyo',
  },
  {
    latitude: 39.9042,
    longitude: 116.4074,
    address: '1 Wangfujing Street',
    city: 'Beijing',
    country: 'China',
    postalCode: '100006',
    timezone: 'Asia/Shanghai',
  },
  {
    latitude: 25.2048,
    longitude: 55.2708,
    address: 'Sheikh Zayed Road',
    city: 'Dubai',
    country: 'United Arab Emirates',
    postalCode: '00000',
    timezone: 'Asia/Dubai',
  },
];

// 模拟客户数据
const mockCustomers: CaseCustomer[] = [
  {
    name: 'Times Square Media',
    logo: '/images/customers/times-square-media.png',
    website: 'https://timessquaremedia.com',
    industry: IndustryType.ADVERTISING,
    description: 'Leading outdoor advertising company in New York',
    size: 'large',
    location: mockLocations[0],
  },
  {
    name: 'Westfield Shopping Centre',
    logo: '/images/customers/westfield.png',
    website: 'https://westfield.com',
    industry: IndustryType.RETAIL,
    description: 'Premium shopping destination in London',
    size: 'enterprise',
    location: mockLocations[1],
  },
  {
    name: 'Tokyo Broadcasting System',
    logo: '/images/customers/tbs.png',
    website: 'https://tbs.co.jp',
    industry: IndustryType.BROADCAST,
    description: 'Major television network in Japan',
    size: 'large',
    location: mockLocations[2],
  },
  {
    name: 'Beijing National Stadium',
    logo: '/images/customers/birds-nest.png',
    industry: IndustryType.SPORTS,
    description: 'Iconic Olympic stadium in Beijing',
    size: 'large',
    location: mockLocations[3],
  },
  {
    name: 'Dubai Mall',
    logo: '/images/customers/dubai-mall.png',
    website: 'https://thedubaimall.com',
    industry: IndustryType.RETAIL,
    description: 'World\'s largest shopping mall by total area',
    size: 'enterprise',
    location: mockLocations[4],
  },
];

// 创建案例图片
const createCaseImages = (caseId: string): CaseImage[] => [
  {
    id: `${caseId}-img-hero`,
    url: `/images/cases/${caseId}/hero.jpg`,
    alt: 'Project hero image',
    title: 'Main installation view',
    caption: 'The completed LED display installation',
    type: 'hero',
    sortOrder: 1,
    width: 1200,
    height: 800,
    size: 250000,
  },
  {
    id: `${caseId}-img-before`,
    url: `/images/cases/${caseId}/before.jpg`,
    alt: 'Before installation',
    title: 'Before installation',
    caption: 'The space before LED display installation',
    type: 'before',
    sortOrder: 2,
    width: 800,
    height: 600,
    size: 180000,
  },
  {
    id: `${caseId}-img-after`,
    url: `/images/cases/${caseId}/after.jpg`,
    alt: 'After installation',
    title: 'After installation',
    caption: 'The transformed space with LED display',
    type: 'after',
    sortOrder: 3,
    width: 800,
    height: 600,
    size: 200000,
  },
  {
    id: `${caseId}-img-detail-1`,
    url: `/images/cases/${caseId}/detail-1.jpg`,
    alt: 'Installation detail',
    title: 'Close-up detail',
    caption: 'Detailed view of the LED modules',
    type: 'detail',
    sortOrder: 4,
    width: 800,
    height: 600,
    size: 160000,
  },
  {
    id: `${caseId}-img-gallery-1`,
    url: `/images/cases/${caseId}/gallery-1.jpg`,
    alt: 'Gallery image 1',
    title: 'Gallery view 1',
    type: 'gallery',
    sortOrder: 5,
    width: 800,
    height: 600,
    size: 170000,
  },
];

// 创建案例视频
const createCaseVideos = (caseId: string): CaseVideo[] => [
  {
    id: `${caseId}-video-demo`,
    url: `https://www.youtube.com/watch?v=${caseId}-demo`,
    title: 'Project Demo Video',
    description: 'Demonstration of the LED display in action',
    thumbnail: `/images/cases/${caseId}/video-thumb-demo.jpg`,
    duration: 120,
    type: 'demo',
    sortOrder: 1,
  },
  {
    id: `${caseId}-video-install`,
    url: `https://www.youtube.com/watch?v=${caseId}-install`,
    title: 'Installation Process',
    description: 'Time-lapse of the installation process',
    thumbnail: `/images/cases/${caseId}/video-thumb-install.jpg`,
    duration: 180,
    type: 'installation',
    sortOrder: 2,
  },
];

// 创建客户证言
const createTestimonials = (caseId: string): CustomerTestimonial[] => [
  {
    id: `${caseId}-testimonial-1`,
    customerName: 'John Smith',
    customerTitle: 'Marketing Director',
    customerPhoto: `/images/testimonials/${caseId}-john-smith.jpg`,
    quote: 'The LED display has transformed our space and significantly increased customer engagement. The image quality is outstanding and the installation was seamless.',
    rating: 5,
    date: new Date('2024-01-15'),
  },
];

// 创建项目时间线
const createTimeline = (): ProjectTimeline[] => [
  {
    phase: 'Planning & Design',
    startDate: new Date('2023-08-01'),
    endDate: new Date('2023-09-15'),
    description: 'Initial consultation, site survey, and design development',
    milestones: ['Site survey completed', 'Design approved', 'Permits obtained'],
  },
  {
    phase: 'Manufacturing',
    startDate: new Date('2023-09-16'),
    endDate: new Date('2023-11-30'),
    description: 'LED modules manufacturing and quality testing',
    milestones: ['Production started', 'Quality testing passed', 'Shipping prepared'],
  },
  {
    phase: 'Installation',
    startDate: new Date('2023-12-01'),
    endDate: new Date('2023-12-20'),
    description: 'On-site installation and system integration',
    milestones: ['Structure installed', 'Modules mounted', 'System testing completed'],
  },
  {
    phase: 'Commissioning',
    startDate: new Date('2023-12-21'),
    endDate: new Date('2024-01-05'),
    description: 'Final testing, calibration, and handover',
    milestones: ['Calibration completed', 'Training provided', 'Project handover'],
  },
];

// 创建项目团队
const createTeam = (): ProjectTeam[] => [
  {
    role: 'Project Manager',
    name: 'Sarah Johnson',
    company: 'LED Solutions Inc.',
    description: 'Oversaw the entire project from planning to completion',
  },
  {
    role: 'Technical Lead',
    name: 'Mike Chen',
    company: 'LED Solutions Inc.',
    description: 'Led the technical design and installation process',
  },
  {
    role: 'Installation Supervisor',
    name: 'David Wilson',
    company: 'Installation Partners Ltd.',
    description: 'Supervised the on-site installation team',
  },
];

// 创建相关产品
const createRelatedProducts = (): RelatedProduct[] => [
  {
    id: 'indoor-p2-5-standard',
    name: 'Indoor P2.5 Standard Display',
    model: 'LED-IN-P25-STD',
    quantity: 48,
    specifications: ['P2.5 pixel pitch', '500x500mm cabinet', '1200 nits brightness'],
  },
  {
    id: 'control-system-pro',
    name: 'Professional Control System',
    model: 'CTRL-PRO-4K',
    quantity: 2,
    specifications: ['4K input support', 'Real-time processing', 'Redundant backup'],
  },
];

// 模拟案例研究数据
export const mockCaseStudies: CaseStudy[] = [
  {
    id: 'times-square-billboard',
    title: 'Times Square Digital Billboard Revolution',
    slug: 'times-square-digital-billboard-revolution',
    subtitle: 'Transforming Iconic Advertising Space with Ultra-High Resolution LED',
    summary: 'A groundbreaking outdoor LED display installation in the heart of Times Square, featuring cutting-edge P4 technology and weather-resistant design.',
    fullDescription: 'This project represents a milestone in outdoor digital advertising, transforming one of Times Square\'s most prominent advertising spaces with state-of-the-art LED technology. The installation features ultra-high resolution P4 LED displays capable of delivering stunning visuals even in direct sunlight. The project overcame significant challenges including extreme weather conditions, complex structural requirements, and the need for 24/7 operation in one of the world\'s busiest locations.',
    
    projectType: ProjectType.OUTDOOR_ADVERTISING,
    industry: IndustryType.ADVERTISING,
    status: CaseStatus.PUBLISHED,
    
    customer: mockCustomers[0],
    location: mockLocations[0],
    
    projectScale: {
      totalScreenArea: 450, // 450 square meters
      totalPixels: 4608000, // 4.6M pixels
      numberOfScreens: 1,
      totalInvestment: 2500000,
      currency: 'USD',
    },
    
    technicalSpecs: {
      pixelPitch: 'P4',
      resolution: { width: 1920, height: 1080 },
      brightness: 6000,
      refreshRate: 3840,
      colorDepth: 16,
      viewingAngle: '160°/160°',
      powerConsumption: 800,
      operatingTemperature: '-40°C to +60°C',
      ipRating: 'IP65',
      cabinetSize: { width: 500, height: 500, depth: 120, unit: 'mm' },
    },
    
    challenges: [
      {
        id: 'weather-resistance',
        title: 'Extreme Weather Resistance',
        description: 'The display needed to withstand harsh New York weather including snow, rain, and extreme temperatures.',
        solution: 'Implemented IP65-rated enclosures with advanced thermal management and anti-corrosion coatings.',
        impact: 'Achieved 99.9% uptime even during severe weather conditions.',
      },
      {
        id: 'brightness-requirements',
        title: 'High Brightness in Sunlight',
        description: 'Maintaining visibility and color accuracy in direct sunlight was crucial for advertising effectiveness.',
        solution: 'Deployed high-brightness LEDs with 6000 nits output and advanced color calibration technology.',
        impact: 'Delivered exceptional visibility and color reproduction throughout the day.',
      },
    ],
    
    solutions: [
      'Custom-engineered weather-resistant enclosures',
      'High-brightness LED modules with advanced thermal management',
      'Redundant power and control systems for 24/7 operation',
      'Remote monitoring and maintenance capabilities',
    ],
    
    outcomes: [
      {
        id: 'engagement-increase',
        metric: 'Viewer Engagement',
        value: '300%',
        description: 'Increase in viewer engagement compared to static billboards',
        improvement: '300% increase',
      },
      {
        id: 'revenue-growth',
        metric: 'Advertising Revenue',
        value: '$5.2M',
        description: 'Annual advertising revenue generated',
        improvement: '250% increase',
      },
      {
        id: 'uptime-achievement',
        metric: 'System Uptime',
        value: '99.9%',
        description: 'Operational uptime achieved in first year',
      },
    ],
    
    images: createCaseImages('times-square-billboard'),
    videos: createCaseVideos('times-square-billboard'),
    documents: [],
    testimonials: createTestimonials('times-square-billboard'),
    timeline: createTimeline(),
    team: createTeam(),
    relatedProducts: createRelatedProducts(),
    
    tags: ['outdoor', 'advertising', 'high-brightness', 'weather-resistant', 'times-square'],
    features: ['IP65 Weather Protection', '6000 Nits Brightness', '24/7 Operation', 'Remote Monitoring'],
    
    isPublished: true,
    isFeatured: true,
    isShowcase: true,
    
    seo: {
      title: 'Times Square LED Billboard Case Study - Outdoor Digital Advertising',
      description: 'Discover how our P4 outdoor LED display transformed Times Square advertising with 6000 nits brightness and weather-resistant design.',
      keywords: ['times square', 'outdoor led display', 'digital billboard', 'advertising', 'P4 led'],
    },
    
    viewCount: 15420,
    shareCount: 234,
    downloadCount: 89,
    
    projectStartDate: new Date('2023-08-01'),
    projectEndDate: new Date('2024-01-05'),
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-20'),
    publishedAt: new Date('2024-01-15'),
    
    translations: {
      zh: {
        title: '时代广场数字广告牌革命',
        subtitle: '用超高分辨率LED改造标志性广告空间',
        summary: '在时代广场中心的突破性户外LED显示屏安装，采用尖端P4技术和防风雨设计。',
        fullDescription: '该项目代表了户外数字广告的里程碑，用最先进的LED技术改造了时代广场最突出的广告空间之一。',
        solutions: [
          '定制工程防风雨外壳',
          '具有先进热管理的高亮度LED模块',
          '24/7运行的冗余电源和控制系统',
          '远程监控和维护功能',
        ],
        features: ['IP65防风雨保护', '6000尼特亮度', '24/7运行', '远程监控'],
        seo: {
          title: '时代广场LED广告牌案例研究 - 户外数字广告',
          description: '了解我们的P4户外LED显示屏如何通过6000尼特亮度和防风雨设计改造时代广场广告。',
          keywords: ['时代广场', '户外LED显示屏', '数字广告牌', '广告', 'P4 LED'],
        },
      },
    },
  },
  
  {
    id: 'westfield-retail-display',
    title: 'Westfield Shopping Centre Digital Transformation',
    slug: 'westfield-shopping-centre-digital-transformation',
    subtitle: 'Enhancing Retail Experience with Interactive LED Displays',
    summary: 'A comprehensive digital signage solution for Westfield Shopping Centre, featuring interactive displays and dynamic content management.',
    fullDescription: 'This project transformed the shopping experience at Westfield London through strategically placed interactive LED displays throughout the mall. The installation includes wayfinding systems, promotional displays, and interactive directories that enhance customer engagement and drive retail sales.',
    
    projectType: ProjectType.RETAIL_DISPLAY,
    industry: IndustryType.RETAIL,
    status: CaseStatus.PUBLISHED,
    
    customer: mockCustomers[1],
    location: mockLocations[1],
    
    projectScale: {
      totalScreenArea: 280,
      totalPixels: 8294400,
      numberOfScreens: 24,
      totalInvestment: 1800000,
      currency: 'GBP',
    },
    
    technicalSpecs: {
      pixelPitch: 'P2.5',
      resolution: { width: 1920, height: 1080 },
      brightness: 1200,
      refreshRate: 3840,
      colorDepth: 16,
      viewingAngle: '160°/160°',
      powerConsumption: 600,
      operatingTemperature: '0°C to +45°C',
      ipRating: 'IP40',
      cabinetSize: { width: 500, height: 500, depth: 75, unit: 'mm' },
    },
    
    challenges: [
      {
        id: 'integration-challenge',
        title: 'System Integration',
        description: 'Integrating multiple display types with existing mall infrastructure and management systems.',
        solution: 'Developed custom API integrations and centralized content management system.',
        impact: 'Achieved seamless operation across all displays with unified management.',
      },
    ],
    
    solutions: [
      'Interactive touch-enabled displays for wayfinding',
      'Centralized content management system',
      'Real-time promotional content updates',
      'Integration with mall management systems',
    ],
    
    outcomes: [
      {
        id: 'footfall-increase',
        metric: 'Foot Traffic',
        value: '25%',
        description: 'Increase in overall mall foot traffic',
        improvement: '25% increase',
      },
      {
        id: 'dwell-time',
        metric: 'Average Dwell Time',
        value: '18 min',
        description: 'Average time customers spend in the mall',
        improvement: '15% increase',
      },
    ],
    
    images: createCaseImages('westfield-retail-display'),
    videos: createCaseVideos('westfield-retail-display'),
    documents: [],
    testimonials: createTestimonials('westfield-retail-display'),
    timeline: createTimeline(),
    team: createTeam(),
    relatedProducts: createRelatedProducts(),
    
    tags: ['retail', 'interactive', 'wayfinding', 'shopping-mall', 'digital-signage'],
    features: ['Touch Interaction', 'Wayfinding System', 'Content Management', 'Real-time Updates'],
    
    isPublished: true,
    isFeatured: true,
    isShowcase: false,
    
    viewCount: 8750,
    shareCount: 156,
    downloadCount: 43,
    
    projectStartDate: new Date('2023-06-01'),
    projectEndDate: new Date('2023-10-15'),
    createdAt: new Date('2023-10-20'),
    updatedAt: new Date('2024-01-18'),
    publishedAt: new Date('2023-10-25'),
  },
  
  {
    id: 'tokyo-broadcast-studio',
    title: 'Tokyo Broadcasting Studio LED Wall',
    slug: 'tokyo-broadcasting-studio-led-wall',
    subtitle: 'Professional Broadcast Environment with Ultra-Fine Pixel Pitch',
    summary: 'A state-of-the-art LED wall installation for Tokyo Broadcasting System, featuring P1.25 ultra-fine pixel pitch for broadcast applications.',
    fullDescription: 'This project delivered a cutting-edge LED wall solution for TBS\'s main broadcast studio, enabling dynamic backgrounds and immersive virtual sets. The ultra-fine P1.25 pixel pitch ensures perfect image quality for 4K broadcast production.',
    
    projectType: ProjectType.BROADCAST_STUDIO,
    industry: IndustryType.BROADCAST,
    status: CaseStatus.PUBLISHED,
    
    customer: mockCustomers[2],
    location: mockLocations[2],
    
    projectScale: {
      totalScreenArea: 120,
      totalPixels: 7680000,
      numberOfScreens: 1,
      totalInvestment: 3200000,
      currency: 'JPY',
    },
    
    technicalSpecs: {
      pixelPitch: 'P1.25',
      resolution: { width: 3840, height: 2160 },
      brightness: 800,
      refreshRate: 3840,
      colorDepth: 16,
      viewingAngle: '160°/160°',
      powerConsumption: 400,
      operatingTemperature: '0°C to +45°C',
      ipRating: 'IP40',
      cabinetSize: { width: 500, height: 500, depth: 80, unit: 'mm' },
    },
    
    challenges: [
      {
        id: 'broadcast-quality',
        title: 'Broadcast Quality Requirements',
        description: 'Meeting strict broadcast industry standards for color accuracy and refresh rates.',
        solution: 'Implemented professional-grade color calibration and high refresh rate technology.',
        impact: 'Achieved broadcast-quality output suitable for 4K production.',
      },
    ],
    
    solutions: [
      'Ultra-fine P1.25 pixel pitch for close viewing',
      'Professional color calibration system',
      'High refresh rate for camera compatibility',
      'Seamless modular design for curved installation',
    ],
    
    outcomes: [
      {
        id: 'production-efficiency',
        metric: 'Production Efficiency',
        value: '40%',
        description: 'Improvement in studio production efficiency',
        improvement: '40% increase',
      },
    ],
    
    images: createCaseImages('tokyo-broadcast-studio'),
    videos: createCaseVideos('tokyo-broadcast-studio'),
    documents: [],
    testimonials: createTestimonials('tokyo-broadcast-studio'),
    timeline: createTimeline(),
    team: createTeam(),
    relatedProducts: createRelatedProducts(),
    
    tags: ['broadcast', 'studio', 'ultra-fine-pitch', 'professional', 'television'],
    features: ['P1.25 Ultra-Fine Pitch', 'Broadcast Quality', 'Color Calibration', 'High Refresh Rate'],
    
    isPublished: true,
    isFeatured: false,
    isShowcase: true,
    
    viewCount: 12300,
    shareCount: 89,
    downloadCount: 67,
    
    projectStartDate: new Date('2023-04-01'),
    projectEndDate: new Date('2023-08-30'),
    createdAt: new Date('2023-09-05'),
    updatedAt: new Date('2024-01-12'),
    publishedAt: new Date('2023-09-10'),
  },
];

// 模拟案例统计数据
export const mockCaseStats = {
  total: mockCaseStudies.length,
  published: mockCaseStudies.filter(c => c.status === CaseStatus.PUBLISHED).length,
  featured: mockCaseStudies.filter(c => c.isFeatured).length,
  showcase: mockCaseStudies.filter(c => c.isShowcase).length,
  byProjectType: Object.values(ProjectType).map(type => ({
    projectType: type,
    count: mockCaseStudies.filter(c => c.projectType === type).length,
  })),
  byIndustry: Object.values(IndustryType).map(industry => ({
    industry,
    count: mockCaseStudies.filter(c => c.industry === industry).length,
  })),
  byCountry: [
    { country: 'United States', count: 1 },
    { country: 'United Kingdom', count: 1 },
    { country: 'Japan', count: 1 },
  ],
  byYear: [
    { year: 2023, count: 2 },
    { year: 2024, count: 1 },
  ],
  totalInvestment: [
    { amount: 2500000, currency: 'USD' },
    { amount: 1800000, currency: 'GBP' },
    { amount: 3200000, currency: 'JPY' },
  ],
  totalArea: mockCaseStudies.reduce((sum, c) => sum + c.projectScale.totalScreenArea, 0),
  averageProjectDuration: 120, // days
  topTags: [
    { tag: 'outdoor', count: 1 },
    { tag: 'retail', count: 1 },
    { tag: 'broadcast', count: 1 },
    { tag: 'interactive', count: 1 },
    { tag: 'high-brightness', count: 1 },
  ],
  viewStats: {
    totalViews: mockCaseStudies.reduce((sum, c) => sum + c.viewCount, 0),
    averageViews: Math.round(mockCaseStudies.reduce((sum, c) => sum + c.viewCount, 0) / mockCaseStudies.length),
    topViewed: mockCaseStudies
      .sort((a, b) => b.viewCount - a.viewCount)
      .slice(0, 3)
      .map(c => ({ id: c.id, title: c.title, views: c.viewCount })),
  },
};

// 导出函数
export const getCaseById = (id: string): CaseStudy | undefined => {
  return mockCaseStudies.find(c => c.id === id);
};

export const getCaseBySlug = (slug: string): CaseStudy | undefined => {
  return mockCaseStudies.find(c => c.slug === slug);
};

export const getCasesByIndustry = (industry: IndustryType): CaseStudy[] => {
  return mockCaseStudies.filter(c => c.industry === industry);
};

export const getCasesByProjectType = (projectType: ProjectType): CaseStudy[] => {
  return mockCaseStudies.filter(c => c.projectType === projectType);
};

export const getFeaturedCases = (limit = 6): CaseStudy[] => {
  return mockCaseStudies.filter(c => c.isFeatured).slice(0, limit);
};

export const getShowcaseCases = (limit = 8): CaseStudy[] => {
  return mockCaseStudies.filter(c => c.isShowcase).slice(0, limit);
};

export const getLatestCases = (limit = 6): CaseStudy[] => {
  return mockCaseStudies
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, limit);
};

export const searchCases = (query: string): CaseStudy[] => {
  const searchTerm = query.toLowerCase();
  return mockCaseStudies.filter(c => 
    c.title.toLowerCase().includes(searchTerm) ||
    c.summary.toLowerCase().includes(searchTerm) ||
    c.customer.name.toLowerCase().includes(searchTerm) ||
    c.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
    c.features.some(feature => feature.toLowerCase().includes(searchTerm))
  );
};

export default {
  mockCaseStudies,
  mockCaseStats,
  getCaseById,
  getCaseBySlug,
  getCasesByIndustry,
  getCasesByProjectType,
  getFeaturedCases,
  getShowcaseCases,
  getLatestCases,
  searchCases,
};