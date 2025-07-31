/**
 * 产品模拟数据
 */
import { 
  Product, 
  ProductCategory,
  ProductType,
  PixelPitch,
  ProductStatus,
  ProductSpecification,
  ProductImage,
  ProductDocument,
  ProductApplication
} from '@/types/product';

// 模拟产品分类数据
export const mockCategories: ProductCategory[] = [
  {
    id: 'indoor',
    name: 'Indoor LED Displays',
    slug: 'indoor',
    description: 'High-resolution indoor LED display solutions for various applications',
    image: '/images/categories/indoor.jpg',
    sortOrder: 1,
    isActive: true,
    seoTitle: 'Indoor LED Displays - High Quality Digital Signage',
    seoDescription: 'Professional indoor LED displays for retail, corporate, and entertainment venues. High resolution, vibrant colors, and reliable performance.',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2024-01-01'),
    children: [
      {
        id: 'indoor-fixed',
        name: 'Fixed Installation',
        slug: 'indoor-fixed',
        description: 'Permanent indoor LED installations',
        parentId: 'indoor',
        sortOrder: 1,
        isActive: true,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
      {
        id: 'indoor-rental',
        name: 'Rental & Events',
        slug: 'indoor-rental',
        description: 'Portable indoor LED displays for events',
        parentId: 'indoor',
        sortOrder: 2,
        isActive: true,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
    ],
  },
  {
    id: 'outdoor',
    name: 'Outdoor LED Displays',
    slug: 'outdoor',
    description: 'Weather-resistant outdoor LED displays with high brightness',
    image: '/images/categories/outdoor.jpg',
    sortOrder: 2,
    isActive: true,
    seoTitle: 'Outdoor LED Displays - Weather Resistant Digital Billboards',
    seoDescription: 'Durable outdoor LED displays designed to withstand harsh weather conditions. Perfect for advertising and public information.',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'rental',
    name: 'Rental LED Displays',
    slug: 'rental',
    description: 'Lightweight and portable LED displays for events and rentals',
    image: '/images/categories/rental.jpg',
    sortOrder: 3,
    isActive: true,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'transparent',
    name: 'Transparent LED Displays',
    slug: 'transparent',
    description: 'See-through LED displays for creative installations',
    image: '/images/categories/transparent.jpg',
    sortOrder: 4,
    isActive: true,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
];

// 模拟产品规格数据
const createSpecifications = (type: ProductType, pixelPitch: PixelPitch): ProductSpecification[] => {
  const baseSpecs: ProductSpecification[] = [
    {
      id: 'pixel-pitch',
      name: 'Pixel Pitch',
      value: pixelPitch,
      unit: 'mm',
      category: 'technical',
      sortOrder: 1,
      isHighlight: true,
    },
    {
      id: 'led-type',
      name: 'LED Type',
      value: 'SMD2121',
      category: 'technical',
      sortOrder: 2,
      isHighlight: true,
    },
    {
      id: 'refresh-rate',
      name: 'Refresh Rate',
      value: '3840',
      unit: 'Hz',
      category: 'performance',
      sortOrder: 3,
      isHighlight: true,
    },
    {
      id: 'brightness',
      name: 'Brightness',
      value: type === ProductType.OUTDOOR ? '6000' : '1200',
      unit: 'nits',
      category: 'performance',
      sortOrder: 4,
      isHighlight: true,
    },
    {
      id: 'viewing-angle',
      name: 'Viewing Angle',
      value: '160°/160°',
      category: 'performance',
      sortOrder: 5,
      isHighlight: false,
    },
    {
      id: 'color-depth',
      name: 'Color Depth',
      value: '16',
      unit: 'bit',
      category: 'technical',
      sortOrder: 6,
      isHighlight: false,
    },
    {
      id: 'power-consumption',
      name: 'Power Consumption',
      value: '800',
      unit: 'W/m²',
      category: 'environmental',
      sortOrder: 7,
      isHighlight: false,
    },
    {
      id: 'operating-temp',
      name: 'Operating Temperature',
      value: type === ProductType.OUTDOOR ? '-40°C to +60°C' : '0°C to +45°C',
      category: 'environmental',
      sortOrder: 8,
      isHighlight: false,
    },
    {
      id: 'ip-rating',
      name: 'IP Rating',
      value: type === ProductType.OUTDOOR ? 'IP65' : 'IP40',
      category: 'environmental',
      sortOrder: 9,
      isHighlight: type === ProductType.OUTDOOR,
    },
    {
      id: 'cabinet-size',
      name: 'Cabinet Size',
      value: '500×500×80',
      unit: 'mm',
      category: 'physical',
      sortOrder: 10,
      isHighlight: false,
    },
  ];

  return baseSpecs;
};

// 模拟产品图片数据
const createProductImages = (productId: string): ProductImage[] => [
  {
    id: `${productId}-img-1`,
    url: `/images/products/${productId}/main.jpg`,
    alt: 'Product main image',
    title: 'Main product view',
    sortOrder: 1,
    isMain: true,
    width: 800,
    height: 600,
    size: 150000,
  },
  {
    id: `${productId}-img-2`,
    url: `/images/products/${productId}/detail-1.jpg`,
    alt: 'Product detail view',
    title: 'Close-up detail',
    sortOrder: 2,
    isMain: false,
    width: 800,
    height: 600,
    size: 120000,
  },
  {
    id: `${productId}-img-3`,
    url: `/images/products/${productId}/installation.jpg`,
    alt: 'Product installation example',
    title: 'Installation example',
    sortOrder: 3,
    isMain: false,
    width: 800,
    height: 600,
    size: 180000,
  },
];

// 模拟产品文档数据
const createProductDocuments = (productId: string): ProductDocument[] => [
  {
    id: `${productId}-doc-1`,
    name: 'Product Datasheet',
    url: `/documents/products/${productId}/datasheet.pdf`,
    type: 'datasheet',
    size: 2048000,
    mimeType: 'application/pdf',
    language: 'both',
    sortOrder: 1,
    createdAt: new Date('2024-01-01'),
  },
  {
    id: `${productId}-doc-2`,
    name: 'Installation Manual',
    url: `/documents/products/${productId}/manual.pdf`,
    type: 'manual',
    size: 5120000,
    mimeType: 'application/pdf',
    language: 'both',
    sortOrder: 2,
    createdAt: new Date('2024-01-01'),
  },
  {
    id: `${productId}-doc-3`,
    name: 'CE Certificate',
    url: `/documents/products/${productId}/ce-cert.pdf`,
    type: 'certificate',
    size: 1024000,
    mimeType: 'application/pdf',
    language: 'en',
    sortOrder: 3,
    createdAt: new Date('2024-01-01'),
  },
];

// 模拟应用场景数据
const createApplications = (type: ProductType): ProductApplication[] => {
  const commonApps = [
    {
      id: 'retail',
      name: 'Retail Stores',
      description: 'Digital signage for product promotion and brand advertising',
      image: '/images/applications/retail.jpg',
      examples: ['Shopping malls', 'Brand stores', 'Supermarkets'],
    },
    {
      id: 'corporate',
      name: 'Corporate',
      description: 'Information displays for offices and meeting rooms',
      image: '/images/applications/corporate.jpg',
      examples: ['Conference rooms', 'Lobbies', 'Reception areas'],
    },
  ];

  if (type === ProductType.OUTDOOR) {
    return [
      ...commonApps,
      {
        id: 'advertising',
        name: 'Outdoor Advertising',
        description: 'Large-scale digital billboards for advertising',
        image: '/images/applications/advertising.jpg',
        examples: ['Highway billboards', 'Building facades', 'Transit stations'],
      },
      {
        id: 'sports',
        name: 'Sports Venues',
        description: 'Stadium displays and scoreboards',
        image: '/images/applications/sports.jpg',
        examples: ['Football stadiums', 'Basketball arenas', 'Racing tracks'],
      },
    ];
  }

  if (type === ProductType.RENTAL) {
    return [
      ...commonApps,
      {
        id: 'events',
        name: 'Events & Concerts',
        description: 'Portable displays for live events',
        image: '/images/applications/events.jpg',
        examples: ['Concerts', 'Trade shows', 'Conferences'],
      },
      {
        id: 'broadcast',
        name: 'Broadcast Studios',
        description: 'Background displays for TV and streaming',
        image: '/images/applications/broadcast.jpg',
        examples: ['TV studios', 'Live streaming', 'Virtual sets'],
      },
    ];
  }

  return commonApps;
};

// 模拟产品数据
export const mockProducts: Product[] = [
  // Indoor Products
  {
    id: 'indoor-p1-25-hd',
    name: 'Indoor P1.25 HD Display',
    slug: 'indoor-p1-25-hd-display',
    sku: 'LED-IN-P125-HD',
    shortDescription: 'Ultra-high resolution indoor LED display with P1.25 pixel pitch, perfect for close viewing applications.',
    fullDescription: 'Our Indoor P1.25 HD Display delivers exceptional image quality with ultra-fine pixel pitch technology. Designed for applications requiring close viewing distances, this display offers superior color reproduction, high refresh rates, and seamless modular design. Perfect for control rooms, broadcast studios, and high-end retail environments.',
    categoryId: 'indoor',
    type: ProductType.INDOOR,
    pixelPitch: PixelPitch.P1_25,
    images: createProductImages('indoor-p1-25-hd'),
    documents: createProductDocuments('indoor-p1-25-hd'),
    videoUrl: 'https://www.youtube.com/watch?v=example1',
    specifications: createSpecifications(ProductType.INDOOR, PixelPitch.P1_25),
    applications: createApplications(ProductType.INDOOR),
    features: [
      'Ultra-fine P1.25 pixel pitch',
      'High refresh rate 3840Hz',
      'Seamless splicing',
      '16-bit color depth',
      'Front maintenance',
      'Fanless design',
    ],
    tags: ['indoor', 'high-resolution', 'premium', 'control-room'],
    status: ProductStatus.ACTIVE,
    isActive: true,
    isFeatured: true,
    isNew: false,
    weight: 45,
    dimensions: {
      width: 500,
      height: 500,
      depth: 80,
      unit: 'mm',
    },
    certifications: ['CE', 'FCC', 'RoHS'],
    warranty: {
      period: 3,
      unit: 'years',
      description: 'Comprehensive warranty covering all components',
    },
    createdAt: new Date('2023-06-01'),
    updatedAt: new Date('2024-01-15'),
    publishedAt: new Date('2023-06-15'),
    seo: {
      title: 'Indoor P1.25 HD LED Display - Ultra High Resolution',
      description: 'Professional indoor P1.25 LED display with exceptional image quality. Perfect for control rooms, studios, and premium installations.',
      keywords: ['indoor LED display', 'P1.25', 'high resolution', 'control room', 'broadcast'],
    },
    translations: {
      zh: {
        name: '室内P1.25高清显示屏',
        shortDescription: '超高分辨率室内LED显示屏，P1.25像素间距，适合近距离观看应用。',
        fullDescription: '我们的室内P1.25高清显示屏采用超精细像素间距技术，提供卓越的图像质量。专为需要近距离观看的应用而设计，具有出色的色彩还原、高刷新率和无缝模块化设计。',
        features: [
          '超精细P1.25像素间距',
          '高刷新率3840Hz',
          '无缝拼接',
          '16位色深',
          '前维护',
          '无风扇设计',
        ],
        seo: {
          title: '室内P1.25高清LED显示屏 - 超高分辨率',
          description: '专业室内P1.25 LED显示屏，图像质量卓越。适用于控制室、演播室和高端安装。',
          keywords: ['室内LED显示屏', 'P1.25', '高分辨率', '控制室', '广播'],
        },
      },
    },
  },
  {
    id: 'indoor-p2-5-standard',
    name: 'Indoor P2.5 Standard Display',
    slug: 'indoor-p2-5-standard-display',
    sku: 'LED-IN-P25-STD',
    shortDescription: 'Cost-effective indoor LED display with P2.5 pixel pitch, ideal for general indoor applications.',
    fullDescription: 'The Indoor P2.5 Standard Display offers excellent value for money while maintaining high image quality. With P2.5 pixel pitch, it provides clear and vibrant visuals suitable for most indoor applications including retail, corporate, and educational environments.',
    categoryId: 'indoor',
    type: ProductType.INDOOR,
    pixelPitch: PixelPitch.P2_5,
    images: createProductImages('indoor-p2-5-standard'),
    documents: createProductDocuments('indoor-p2-5-standard'),
    specifications: createSpecifications(ProductType.INDOOR, PixelPitch.P2_5),
    applications: createApplications(ProductType.INDOOR),
    features: [
      'P2.5 pixel pitch',
      'High brightness 1200 nits',
      'Wide viewing angle',
      'Energy efficient',
      'Easy installation',
      'Reliable performance',
    ],
    tags: ['indoor', 'standard', 'cost-effective', 'retail'],
    status: ProductStatus.ACTIVE,
    isActive: true,
    isFeatured: false,
    isNew: false,
    weight: 38,
    dimensions: {
      width: 500,
      height: 500,
      depth: 75,
      unit: 'mm',
    },
    certifications: ['CE', 'FCC', 'RoHS'],
    warranty: {
      period: 2,
      unit: 'years',
      description: 'Standard warranty covering manufacturing defects',
    },
    createdAt: new Date('2023-03-01'),
    updatedAt: new Date('2024-01-10'),
    publishedAt: new Date('2023-03-15'),
    seo: {
      title: 'Indoor P2.5 LED Display - Standard Quality',
      description: 'Cost-effective indoor P2.5 LED display for retail, corporate, and educational applications. Reliable performance and easy installation.',
      keywords: ['indoor LED display', 'P2.5', 'standard', 'retail', 'corporate'],
    },
  },
  // Outdoor Products
  {
    id: 'outdoor-p4-weatherproof',
    name: 'Outdoor P4 Weatherproof Display',
    slug: 'outdoor-p4-weatherproof-display',
    sku: 'LED-OUT-P4-WP',
    shortDescription: 'Robust outdoor LED display with P4 pixel pitch, designed to withstand harsh weather conditions.',
    fullDescription: 'Our Outdoor P4 Weatherproof Display is engineered for demanding outdoor environments. With IP65 protection rating and high brightness output, it delivers excellent visibility even in direct sunlight. The robust construction ensures reliable operation in extreme weather conditions.',
    categoryId: 'outdoor',
    type: ProductType.OUTDOOR,
    pixelPitch: PixelPitch.P4,
    images: createProductImages('outdoor-p4-weatherproof'),
    documents: createProductDocuments('outdoor-p4-weatherproof'),
    specifications: createSpecifications(ProductType.OUTDOOR, PixelPitch.P4),
    applications: createApplications(ProductType.OUTDOOR),
    features: [
      'P4 pixel pitch',
      'High brightness 6000 nits',
      'IP65 waterproof rating',
      'Wide temperature range',
      'Anti-UV coating',
      'Lightning protection',
    ],
    tags: ['outdoor', 'weatherproof', 'high-brightness', 'advertising'],
    status: ProductStatus.ACTIVE,
    isActive: true,
    isFeatured: true,
    isNew: true,
    weight: 65,
    dimensions: {
      width: 500,
      height: 500,
      depth: 120,
      unit: 'mm',
    },
    certifications: ['CE', 'FCC', 'RoHS', 'IP65'],
    warranty: {
      period: 3,
      unit: 'years',
      description: 'Extended warranty for outdoor harsh conditions',
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-20'),
    publishedAt: new Date('2024-01-15'),
    seo: {
      title: 'Outdoor P4 LED Display - Weatherproof Digital Billboard',
      description: 'Durable outdoor P4 LED display with IP65 protection. High brightness 6000 nits for excellent visibility in sunlight.',
      keywords: ['outdoor LED display', 'P4', 'weatherproof', 'digital billboard', 'advertising'],
    },
  },
  // Rental Products
  {
    id: 'rental-p3-9-lightweight',
    name: 'Rental P3.9 Lightweight Display',
    slug: 'rental-p3-9-lightweight-display',
    sku: 'LED-RNT-P39-LW',
    shortDescription: 'Ultra-lightweight rental LED display with P3.9 pixel pitch, perfect for events and temporary installations.',
    fullDescription: 'The Rental P3.9 Lightweight Display is specifically designed for the rental and events industry. Its lightweight construction, quick setup system, and reliable performance make it the ideal choice for concerts, trade shows, and temporary installations.',
    categoryId: 'rental',
    type: ProductType.RENTAL,
    pixelPitch: PixelPitch.P3,
    images: createProductImages('rental-p3-9-lightweight'),
    documents: createProductDocuments('rental-p3-9-lightweight'),
    specifications: createSpecifications(ProductType.RENTAL, PixelPitch.P3),
    applications: createApplications(ProductType.RENTAL),
    features: [
      'P3.9 pixel pitch',
      'Ultra-lightweight design',
      'Quick lock system',
      'High refresh rate',
      'Curved installation capable',
      'Flight case compatible',
    ],
    tags: ['rental', 'lightweight', 'events', 'portable'],
    status: ProductStatus.ACTIVE,
    isActive: true,
    isFeatured: false,
    isNew: true,
    weight: 28,
    dimensions: {
      width: 500,
      height: 500,
      depth: 65,
      unit: 'mm',
    },
    certifications: ['CE', 'FCC', 'RoHS'],
    warranty: {
      period: 2,
      unit: 'years',
      description: 'Rental industry standard warranty',
    },
    createdAt: new Date('2023-12-01'),
    updatedAt: new Date('2024-01-18'),
    publishedAt: new Date('2023-12-15'),
    seo: {
      title: 'Rental P3.9 LED Display - Lightweight Event Screen',
      description: 'Professional rental P3.9 LED display for events and concerts. Ultra-lightweight with quick setup system.',
      keywords: ['rental LED display', 'P3.9', 'lightweight', 'events', 'concerts'],
    },
  },
  // Transparent Products
  {
    id: 'transparent-p7-8-glass',
    name: 'Transparent P7.8 Glass Display',
    slug: 'transparent-p7-8-glass-display',
    sku: 'LED-TRP-P78-GL',
    shortDescription: 'Innovative transparent LED display with P7.8 pixel pitch, perfect for creative installations and storefronts.',
    fullDescription: 'The Transparent P7.8 Glass Display revolutionizes digital signage with its see-through design. Maintaining 70% transparency while delivering vibrant visuals, it\'s perfect for retail storefronts, museums, and architectural installations where content needs to blend with the environment.',
    categoryId: 'transparent',
    type: ProductType.TRANSPARENT,
    pixelPitch: PixelPitch.P8,
    images: createProductImages('transparent-p7-8-glass'),
    documents: createProductDocuments('transparent-p7-8-glass'),
    specifications: [
      ...createSpecifications(ProductType.TRANSPARENT, PixelPitch.P8),
      {
        id: 'transparency',
        name: 'Transparency Rate',
        value: '70',
        unit: '%',
        category: 'technical',
        sortOrder: 11,
        isHighlight: true,
      },
    ],
    applications: [
      {
        id: 'storefront',
        name: 'Retail Storefronts',
        description: 'Transparent displays for shop windows and retail environments',
        image: '/images/applications/storefront.jpg',
        examples: ['Shop windows', 'Mall displays', 'Showrooms'],
      },
      {
        id: 'museum',
        name: 'Museums & Exhibitions',
        description: 'Interactive displays that don\'t obstruct exhibits',
        image: '/images/applications/museum.jpg',
        examples: ['Museum displays', 'Art galleries', 'Exhibition halls'],
      },
      {
        id: 'architecture',
        name: 'Architectural Integration',
        description: 'Building-integrated displays for modern architecture',
        image: '/images/applications/architecture.jpg',
        examples: ['Building facades', 'Atriums', 'Glass walls'],
      },
    ],
    features: [
      'P7.8 pixel pitch',
      '70% transparency rate',
      'See-through design',
      'High contrast ratio',
      'Lightweight structure',
      'Easy maintenance',
    ],
    tags: ['transparent', 'innovative', 'storefront', 'creative'],
    status: ProductStatus.ACTIVE,
    isActive: true,
    isFeatured: true,
    isNew: true,
    weight: 32,
    dimensions: {
      width: 500,
      height: 1000,
      depth: 25,
      unit: 'mm',
    },
    certifications: ['CE', 'FCC', 'RoHS'],
    warranty: {
      period: 2,
      unit: 'years',
      description: 'Specialized warranty for transparent LED technology',
    },
    createdAt: new Date('2023-11-01'),
    updatedAt: new Date('2024-01-22'),
    publishedAt: new Date('2023-11-15'),
    seo: {
      title: 'Transparent P7.8 LED Display - See-Through Digital Signage',
      description: 'Innovative transparent LED display with 70% transparency. Perfect for storefronts, museums, and creative installations.',
      keywords: ['transparent LED display', 'P7.8', 'see-through', 'storefront', 'creative'],
    },
  },
];

// 模拟产品统计数据
export const mockProductStats = {
  total: mockProducts.length,
  active: mockProducts.filter(p => p.status === ProductStatus.ACTIVE).length,
  inactive: mockProducts.filter(p => p.status === ProductStatus.INACTIVE).length,
  featured: mockProducts.filter(p => p.isFeatured).length,
  new: mockProducts.filter(p => p.isNew).length,
  outOfStock: mockProducts.filter(p => p.status === ProductStatus.OUT_OF_STOCK).length,
  byCategory: mockCategories.map(cat => ({
    categoryId: cat.id,
    categoryName: cat.name,
    count: mockProducts.filter(p => p.categoryId === cat.id).length,
  })),
  byType: Object.values(ProductType).map(type => ({
    type,
    count: mockProducts.filter(p => p.type === type).length,
  })),
  byStatus: Object.values(ProductStatus).map(status => ({
    status,
    count: mockProducts.filter(p => p.status === status).length,
  })),
};

// 导出函数
export const getProductById = (id: string): Product | undefined => {
  return mockProducts.find(p => p.id === id);
};

export const getProductBySlug = (slug: string): Product | undefined => {
  return mockProducts.find(p => p.slug === slug);
};

export const getProductsByCategoryId = (categoryId: string): Product[] => {
  return mockProducts.filter(p => p.categoryId === categoryId);
};

export const getFeaturedProducts = (limit = 8): Product[] => {
  return mockProducts.filter(p => p.isFeatured).slice(0, limit);
};

export const getNewProducts = (limit = 8): Product[] => {
  return mockProducts.filter(p => p.isNew).slice(0, limit);
};

export const searchProducts = (query: string): Product[] => {
  const searchTerm = query.toLowerCase();
  return mockProducts.filter(p => 
    p.name.toLowerCase().includes(searchTerm) ||
    p.shortDescription.toLowerCase().includes(searchTerm) ||
    p.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
    p.features.some(feature => feature.toLowerCase().includes(searchTerm))
  );
};

export default {
  mockProducts,
  mockCategories,
  mockProductStats,
  getProductById,
  getProductBySlug,
  getProductsByCategoryId,
  getFeaturedProducts,
  getNewProducts,
  searchProducts,
};