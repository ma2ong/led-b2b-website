/**
 * 产品详情页面测试
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import ProductDetailPage from '@/components/products/ProductDetailPage';
import { Product } from '@/types/product';

// Mock dependencies
jest.mock('next/router');
jest.mock('next-i18next');

const mockRouter = {
  push: jest.fn(),
  pathname: '/products/test-product',
  query: { slug: 'test-product' },
};

const mockT = (key: string, options?: any) => {
  const translations: Record<string, string> = {
    'overview': 'Overview',
    'specifications': 'Specifications',
    'reviews': 'Reviews',
    'downloads': 'Downloads',
    'keyFeatures': 'Key Features',
    'applications': 'Applications',
    'availability': 'Availability',
    'inStock': 'In Stock',
    'outOfStock': 'Out of Stock',
    'leadTime': 'Lead Time',
    'moq': 'MOQ',
    'units': 'units',
    'quantity': 'Quantity',
    'requestQuote': 'Request Quote',
    'relatedProducts': 'Related Products',
    'requestQuoteFor': 'Request Quote for',
    'displaySpecs': 'Display Specifications',
    'physicalSpecs': 'Physical Specifications',
    'powerSpecs': 'Power Specifications',
    'pixelPitch': 'Pixel Pitch',
    'resolution': 'Resolution',
    'brightness': 'Brightness',
    'refreshRate': 'Refresh Rate',
    'colorDepth': 'Color Depth',
    'viewingAngle': 'Viewing Angle',
    'dimensions': 'Dimensions',
    'weight': 'Weight',
    'ipRating': 'IP Rating',
    'operatingTemperature': 'Operating Temperature',
    'powerConsumption': 'Power Consumption',
    'environment': 'Environment',
    'indoor': 'Indoor',
    'outdoor': 'Outdoor',
    'noReviewsYet': 'No reviews yet',
    'reviewCount': `${options?.count || 0} reviews`,
    'downloadableResources': 'Downloadable Resources',
    'productDatasheet': 'Product Datasheet',
    'installationGuide': 'Installation Guide',
    'technicalDrawings': 'Technical Drawings',
    'productBrochure': 'Product Brochure',
  };
  return translations[key] || key;
};

(useRouter as jest.Mock).mockReturnValue(mockRouter);
(useTranslation as jest.Mock).mockReturnValue({ t: mockT });

// Mock product data
const mockProduct: Product = {
  id: 'test-product-1',
  name: 'Test LED Display P2.5',
  model: 'TLD-P2.5-Indoor',
  slug: 'test-led-display-p25',
  description: 'High-quality indoor LED display with excellent color reproduction and brightness.',
  category: 'Indoor LED Display',
  subcategory: 'Fine Pitch',
  tags: ['indoor', 'fine-pitch', 'high-resolution'],
  images: {
    main: '/images/products/test-product-main.jpg',
    gallery: [
      '/images/products/test-product-1.jpg',
      '/images/products/test-product-2.jpg',
      '/images/products/test-product-3.jpg',
    ],
    thumbnail: '/images/products/test-product-thumb.jpg',
  },
  price: {
    current: 299.99,
    original: 349.99,
    currency: 'USD',
    unit: 'per sqm',
  },
  specifications: {
    pixelPitch: '2.5mm',
    resolution: {
      width: 1920,
      height: 1080,
    },
    brightness: 1200,
    refreshRate: 3840,
    colorDepth: 16,
    viewingAngle: '160°/160°',
    dimensions: {
      width: 320,
      height: 160,
      depth: 85,
      unit: 'mm',
    },
    weight: 6.5,
    powerConsumption: 180,
    ipRating: 'IP40',
    operatingTemperature: '-20°C to +60°C',
    environment: 'indoor',
  },
  features: [
    'High refresh rate for smooth video playback',
    'Excellent color uniformity',
    'Easy maintenance with front access',
    'Energy efficient design',
  ],
  applications: [
    'Conference Rooms',
    'Retail Stores',
    'Control Centers',
    'Broadcasting Studios',
  ],
  availability: {
    inStock: true,
    leadTime: '7-14 days',
    moq: 10,
  },
  rating: 4.5,
  reviewCount: 23,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-15T00:00:00Z',
};

const mockRelatedProducts: Product[] = [
  {
    ...mockProduct,
    id: 'related-1',
    name: 'Related Product 1',
    slug: 'related-product-1',
  },
  {
    ...mockProduct,
    id: 'related-2',
    name: 'Related Product 2',
    slug: 'related-product-2',
  },
];

describe('ProductDetailPage', () => {
  const defaultProps = {
    product: mockProduct,
    relatedProducts: mockRelatedProducts,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders product information correctly', () => {
    render(<ProductDetailPage {...defaultProps} />);

    expect(screen.getByText(mockProduct.name)).toBeInTheDocument();
    expect(screen.getByText(mockProduct.model)).toBeInTheDocument();
    expect(screen.getByText(mockProduct.description)).toBeInTheDocument();
    expect(screen.getByText('$299.99')).toBeInTheDocument();
    expect(screen.getByText('$349.99')).toBeInTheDocument();
  });

  it('displays product images with gallery functionality', () => {
    render(<ProductDetailPage {...defaultProps} />);

    const mainImage = screen.getByAltText(`${mockProduct.name} - Image 1`);
    expect(mainImage).toBeInTheDocument();
    expect(mainImage).toHaveAttribute('src', mockProduct.images.main);

    // Check thumbnail gallery
    const thumbnails = screen.getAllByRole('button');
    const imageThumbnails = thumbnails.filter(btn => 
      btn.querySelector('img')?.alt?.includes('thumbnail')
    );
    expect(imageThumbnails).toHaveLength(mockProduct.images.gallery.length + 1); // +1 for main image
  });

  it('shows product features and applications', () => {
    render(<ProductDetailPage {...defaultProps} />);

    mockProduct.features.forEach(feature => {
      expect(screen.getByText(feature)).toBeInTheDocument();
    });

    mockProduct.applications.forEach(application => {
      expect(screen.getByText(application)).toBeInTheDocument();
    });
  });

  it('displays availability information', () => {
    render(<ProductDetailPage {...defaultProps} />);

    expect(screen.getByText('In Stock')).toBeInTheDocument();
    expect(screen.getByText('7-14 days')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('handles quantity changes', async () => {
    const user = userEvent.setup();
    render(<ProductDetailPage {...defaultProps} />);

    const quantityInput = screen.getByDisplayValue('1');
    expect(quantityInput).toBeInTheDocument();

    // Test increment button
    const incrementButton = screen.getByText('+');
    await user.click(incrementButton);
    expect(quantityInput).toHaveValue(2);

    // Test decrement button
    const decrementButton = screen.getByText('-');
    await user.click(decrementButton);
    expect(quantityInput).toHaveValue(1);

    // Test direct input
    await user.clear(quantityInput);
    await user.type(quantityInput, '5');
    expect(quantityInput).toHaveValue(5);
  });

  it('switches between tabs correctly', async () => {
    const user = userEvent.setup();
    render(<ProductDetailPage {...defaultProps} />);

    // Check default tab (overview)
    expect(screen.getByText(mockProduct.description)).toBeInTheDocument();

    // Switch to specifications tab
    const specsTab = screen.getByText('Specifications');
    await user.click(specsTab);
    expect(screen.getByText('Display Specifications')).toBeInTheDocument();
    expect(screen.getByText('2.5mm')).toBeInTheDocument();

    // Switch to reviews tab
    const reviewsTab = screen.getByText('Reviews');
    await user.click(reviewsTab);
    expect(screen.getByText('4.5')).toBeInTheDocument();

    // Switch to downloads tab
    const downloadsTab = screen.getByText('Downloads');
    await user.click(downloadsTab);
    expect(screen.getByText('Downloadable Resources')).toBeInTheDocument();
  });

  it('displays technical specifications correctly', async () => {
    const user = userEvent.setup();
    render(<ProductDetailPage {...defaultProps} />);

    const specsTab = screen.getByText('Specifications');
    await user.click(specsTab);

    expect(screen.getByText('2.5mm')).toBeInTheDocument();
    expect(screen.getByText('1920 × 1080')).toBeInTheDocument();
    expect(screen.getByText('1200 nits')).toBeInTheDocument();
    expect(screen.getByText('3840 Hz')).toBeInTheDocument();
    expect(screen.getByText('320 × 160 × 85 mm')).toBeInTheDocument();
    expect(screen.getByText('6.5 kg')).toBeInTheDocument();
  });

  it('opens inquiry form modal when request quote is clicked', async () => {
    const user = userEvent.setup();
    render(<ProductDetailPage {...defaultProps} />);

    const requestQuoteButton = screen.getByText('Request Quote');
    await user.click(requestQuoteButton);

    await waitFor(() => {
      expect(screen.getByText(`Request Quote for ${mockProduct.name}`)).toBeInTheDocument();
    });
  });

  it('handles wishlist functionality', async () => {
    const mockOnAddToWishlist = jest.fn();
    const user = userEvent.setup();
    
    render(
      <ProductDetailPage 
        {...defaultProps} 
        onAddToWishlist={mockOnAddToWishlist}
      />
    );

    const wishlistButton = screen.getByRole('button', { name: /heart/i });
    await user.click(wishlistButton);

    expect(mockOnAddToWishlist).toHaveBeenCalledWith(mockProduct);
  });

  it('displays related products', () => {
    render(<ProductDetailPage {...defaultProps} />);

    expect(screen.getByText('Related Products')).toBeInTheDocument();
    expect(screen.getByText('Related Product 1')).toBeInTheDocument();
    expect(screen.getByText('Related Product 2')).toBeInTheDocument();
  });

  it('handles related product clicks', async () => {
    const user = userEvent.setup();
    render(<ProductDetailPage {...defaultProps} />);

    const relatedProduct = screen.getByText('Related Product 1');
    await user.click(relatedProduct);

    expect(mockRouter.push).toHaveBeenCalledWith('/products/related-product-1');
  });

  it('displays product rating and reviews', () => {
    render(<ProductDetailPage {...defaultProps} />);

    expect(screen.getByText('4.5')).toBeInTheDocument();
    expect(screen.getByText('(23 reviews)')).toBeInTheDocument();
  });

  it('handles share functionality', async () => {
    const mockOnShare = jest.fn();
    const user = userEvent.setup();
    
    // Mock navigator.share
    Object.assign(navigator, {
      share: jest.fn().mockResolvedValue(undefined),
    });

    render(
      <ProductDetailPage 
        {...defaultProps} 
        onShare={mockOnShare}
      />
    );

    const shareButton = screen.getByRole('button', { name: /share/i });
    await user.click(shareButton);

    expect(navigator.share).toHaveBeenCalledWith({
      title: mockProduct.name,
      text: mockProduct.description,
      url: window.location.href,
    });
  });

  it('handles image gallery navigation', async () => {
    const user = userEvent.setup();
    render(<ProductDetailPage {...defaultProps} />);

    // Click on a thumbnail to change main image
    const thumbnails = screen.getAllByRole('button');
    const secondThumbnail = thumbnails.find(btn => 
      btn.querySelector('img')?.alt?.includes('thumbnail 2')
    );

    if (secondThumbnail) {
      await user.click(secondThumbnail);
      
      const mainImage = screen.getByAltText(`${mockProduct.name} - Image 2`);
      expect(mainImage).toHaveAttribute('src', mockProduct.images.gallery[0]);
    }
  });

  it('displays download resources', async () => {
    const user = userEvent.setup();
    render(<ProductDetailPage {...defaultProps} />);

    const downloadsTab = screen.getByText('Downloads');
    await user.click(downloadsTab);

    expect(screen.getByText('Product Datasheet')).toBeInTheDocument();
    expect(screen.getByText('Installation Guide')).toBeInTheDocument();
    expect(screen.getByText('Technical Drawings')).toBeInTheDocument();
    expect(screen.getByText('Product Brochure')).toBeInTheDocument();
  });

  it('handles out of stock products', () => {
    const outOfStockProduct = {
      ...mockProduct,
      availability: {
        ...mockProduct.availability,
        inStock: false,
      },
    };

    render(<ProductDetailPage product={outOfStockProduct} />);

    expect(screen.getByText('Out of Stock')).toBeInTheDocument();
  });

  it('handles products without reviews', () => {
    const noReviewProduct = {
      ...mockProduct,
      rating: undefined,
      reviewCount: undefined,
    };

    render(<ProductDetailPage product={noReviewProduct} />);

    // Switch to reviews tab
    const reviewsTab = screen.getByText('Reviews');
    fireEvent.click(reviewsTab);

    expect(screen.getByText('No reviews yet')).toBeInTheDocument();
  });
});