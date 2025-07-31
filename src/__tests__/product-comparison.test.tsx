/**
 * 产品对比功能测试
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { renderHook, act } from '@testing-library/react';
import ProductComparison from '@/components/products/ProductComparison';
import ComparisonFloatingButton from '@/components/products/ComparisonFloatingButton';
import ProductSelectorModal from '@/components/products/ProductSelectorModal';
import { useProductComparison } from '@/hooks/useProductComparison';
import { Product, ProductCategory } from '@/types/product';

// Mock dependencies
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('next-i18next', () => ({
  useTranslation: jest.fn(),
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock products
const mockProducts: Product[] = [
  {
    id: 'product-1',
    name: 'LED Display P2.5',
    slug: 'led-display-p2-5',
    model: 'LED-P25-001',
    description: 'High-resolution indoor LED display',
    category: 'indoor-fixed',
    specifications: {
      pixelPitch: 'P2.5',
      resolution: { width: 1920, height: 1080 },
      brightness: 1200,
      refreshRate: 3840,
      colorDepth: 16,
      viewingAngle: '160°/160°',
      powerConsumption: 600,
      operatingTemperature: '0°C to +45°C',
      dimensions: { width: 500, height: 500, depth: 75, unit: 'mm' },
      weight: 8.5,
      ipRating: 'IP40',
      environment: 'indoor',
    },
    price: {
      current: 1500,
      original: 1800,
      currency: 'USD',
      unit: 'per panel',
    },
    images: {
      main: '/images/products/led-p25-001.jpg',
      gallery: ['/images/products/led-p25-001-1.jpg'],
    },
    availability: {
      inStock: true,
      leadTime: '2-3 weeks',
      moq: 10,
    },
    features: ['High Resolution', 'Energy Efficient'],
    applications: ['Retail', 'Corporate'],
    tags: ['indoor', 'high-resolution'],
    featured: true,
    isNew: false,
    onSale: true,
    rating: 4.5,
    reviewCount: 24,
  },
  {
    id: 'product-2',
    name: 'LED Display P4',
    slug: 'led-display-p4',
    model: 'LED-P4-002',
    description: 'Outdoor LED display with high brightness',
    category: 'outdoor-advertising',
    specifications: {
      pixelPitch: 'P4',
      resolution: { width: 1920, height: 1080 },
      brightness: 6000,
      refreshRate: 3840,
      colorDepth: 16,
      viewingAngle: '160°/160°',
      powerConsumption: 800,
      operatingTemperature: '-20°C to +60°C',
      dimensions: { width: 500, height: 500, depth: 120, unit: 'mm' },
      weight: 12.0,
      ipRating: 'IP65',
      environment: 'outdoor',
    },
    price: {
      current: 2500,
      currency: 'USD',
      unit: 'per panel',
    },
    images: {
      main: '/images/products/led-p4-002.jpg',
      gallery: ['/images/products/led-p4-002-1.jpg'],
    },
    availability: {
      inStock: true,
      leadTime: '3-4 weeks',
      moq: 5,
    },
    features: ['Weather Resistant', 'High Brightness'],
    applications: ['Advertising', 'Sports'],
    tags: ['outdoor', 'weather-resistant'],
    featured: false,
    isNew: true,
    onSale: false,
    rating: 4.8,
    reviewCount: 18,
  },
];

const mockCategories: ProductCategory[] = [
  {
    id: 'indoor-fixed',
    name: 'Indoor Fixed',
    slug: 'indoor-fixed',
    description: 'Indoor fixed installation displays',
    image: '/images/categories/indoor-fixed.jpg',
    productCount: 15,
    featured: true,
    parentId: null,
    children: [],
    seo: {
      title: 'Indoor Fixed LED Displays',
      description: 'Professional indoor LED display solutions',
    },
  },
];

const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  query: {},
};

const mockT = (key: string, options?: any) => {
  const translations: { [key: string]: string } = {
    'compareProducts': 'Compare Products',
    'addToComparison': 'Add to Comparison',
    'removeFromComparison': 'Remove from Comparison',
    'clearAll': 'Clear All',
    'compare': 'Compare',
    'viewComparison': 'View Comparison',
    'comparisonFull': 'Comparison Full',
    'noProductsFound': 'No products found',
    'searchProducts': 'Search products',
    'allCategories': 'All Categories',
    'sortByName': 'Sort by Name',
    'sortByPrice': 'Sort by Price',
    'sortByRating': 'Sort by Rating',
    'clearFilters': 'Clear Filters',
    'cancel': 'Cancel',
    'done': 'Done',
    'close': 'Close',
    'pixelPitch': 'Pixel Pitch',
    'brightness': 'Brightness',
    'featured': 'Featured',
    'new': 'New',
    'comparisonCount': 'Comparison ({{current}}/{{max}})',
    'showingProducts': 'Showing {{count}} products',
  };
  
  let result = translations[key] || key;
  if (options) {
    Object.keys(options).forEach(optionKey => {
      result = result.replace(`{{${optionKey}}}`, options[optionKey]);
    });
  }
  return result;
};

describe('useProductComparison Hook', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it('should initialize with empty comparison list', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => useProductComparison());
    
    expect(result.current.comparisonProducts).toEqual([]);
    expect(result.current.comparisonCount).toBe(0);
    expect(result.current.canAddMore).toBe(true);
    expect(result.current.isComparisonEmpty).toBe(true);
  });

  it('should load products from localStorage', () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify([mockProducts[0]]));
    
    const { result } = renderHook(() => useProductComparison());
    
    expect(result.current.comparisonProducts).toEqual([mockProducts[0]]);
    expect(result.current.comparisonCount).toBe(1);
  });

  it('should add product to comparison', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => useProductComparison());
    
    act(() => {
      const success = result.current.addToComparison(mockProducts[0]);
      expect(success).toBe(true);
    });
    
    expect(result.current.comparisonProducts).toContain(mockProducts[0]);
    expect(result.current.comparisonCount).toBe(1);
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'product-comparison',
      JSON.stringify([mockProducts[0]])
    );
  });

  it('should not add duplicate product', () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify([mockProducts[0]]));
    
    const { result } = renderHook(() => useProductComparison());
    
    act(() => {
      const success = result.current.addToComparison(mockProducts[0]);
      expect(success).toBe(false);
    });
    
    expect(result.current.comparisonCount).toBe(1);
  });

  it('should not add more than 3 products', () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockProducts.concat([{
      ...mockProducts[0],
      id: 'product-3',
    }])));
    
    const { result } = renderHook(() => useProductComparison());
    
    act(() => {
      const success = result.current.addToComparison({
        ...mockProducts[0],
        id: 'product-4',
      });
      expect(success).toBe(false);
    });
    
    expect(result.current.canAddMore).toBe(false);
  });

  it('should remove product from comparison', () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockProducts));
    
    const { result } = renderHook(() => useProductComparison());
    
    act(() => {
      result.current.removeFromComparison('product-1');
    });
    
    expect(result.current.comparisonProducts).not.toContain(mockProducts[0]);
    expect(result.current.comparisonCount).toBe(1);
  });

  it('should clear all products', () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockProducts));
    
    const { result } = renderHook(() => useProductComparison());
    
    act(() => {
      result.current.clearComparison();
    });
    
    expect(result.current.comparisonProducts).toEqual([]);
    expect(result.current.comparisonCount).toBe(0);
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('product-comparison');
  });

  it('should toggle product in comparison', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => useProductComparison());
    
    // Add product
    act(() => {
      const added = result.current.toggleComparison(mockProducts[0]);
      expect(added).toBe(true);
    });
    
    expect(result.current.isInComparison('product-1')).toBe(true);
    
    // Remove product
    act(() => {
      const added = result.current.toggleComparison(mockProducts[0]);
      expect(added).toBe(false);
    });
    
    expect(result.current.isInComparison('product-1')).toBe(false);
  });
});

describe('ProductComparison Component', () => {
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useTranslation as jest.Mock).mockReturnValue({ t: mockT });
  });

  it('should render empty state when no products', () => {
    render(<ProductComparison products={[]} />);
    
    expect(screen.getByText('No Products to Compare')).toBeInTheDocument();
    expect(screen.getByText('Browse Products')).toBeInTheDocument();
  });

  it('should render product comparison table', () => {
    render(<ProductComparison products={mockProducts} />);
    
    expect(screen.getByText('Product Comparison')).toBeInTheDocument();
    expect(screen.getByText('LED Display P2.5')).toBeInTheDocument();
    expect(screen.getByText('LED Display P4')).toBeInTheDocument();
  });

  it('should handle product removal', () => {
    const onRemoveProduct = jest.fn();
    
    render(
      <ProductComparison 
        products={mockProducts} 
        onRemoveProduct={onRemoveProduct}
      />
    );
    
    const removeButtons = screen.getAllByLabelText('Remove product');
    fireEvent.click(removeButtons[0]);
    
    expect(onRemoveProduct).toHaveBeenCalledWith('product-1');
  });

  it('should handle add product', () => {
    const onAddProduct = jest.fn();
    
    render(
      <ProductComparison 
        products={[mockProducts[0]]} 
        onAddProduct={onAddProduct}
      />
    );
    
    const addButton = screen.getByText('Add Product');
    fireEvent.click(addButton);
    
    expect(onAddProduct).toHaveBeenCalled();
  });

  it('should toggle highlight differences', () => {
    render(<ProductComparison products={mockProducts} />);
    
    const checkbox = screen.getByLabelText('Highlight best values');
    fireEvent.click(checkbox);
    
    expect(checkbox).toBeChecked();
  });

  it('should handle share functionality', async () => {
    // Mock navigator.share
    const mockShare = jest.fn();
    Object.defineProperty(navigator, 'share', {
      value: mockShare,
      configurable: true,
    });
    
    render(<ProductComparison products={mockProducts} />);
    
    const shareButton = screen.getByText('Share');
    fireEvent.click(shareButton);
    
    await waitFor(() => {
      expect(mockShare).toHaveBeenCalledWith({
        title: expect.stringContaining('Product Comparison'),
        text: expect.any(String),
        url: expect.any(String),
      });
    });
  });

  it('should handle export functionality', () => {
    // Mock URL.createObjectURL and document.createElement
    const mockCreateObjectURL = jest.fn(() => 'blob:url');
    const mockClick = jest.fn();
    const mockAppendChild = jest.fn();
    const mockRemoveChild = jest.fn();
    
    Object.defineProperty(URL, 'createObjectURL', {
      value: mockCreateObjectURL,
    });
    
    const mockAnchor = {
      href: '',
      download: '',
      click: mockClick,
    };
    
    jest.spyOn(document, 'createElement').mockReturnValue(mockAnchor as any);
    
    render(<ProductComparison products={mockProducts} />);
    
    const exportButton = screen.getByText('Export CSV');
    fireEvent.click(exportButton);
    
    expect(mockCreateObjectURL).toHaveBeenCalled();
    expect(mockClick).toHaveBeenCalled();
  });
});

describe('ComparisonFloatingButton Component', () => {
  beforeEach(() => {
    (useTranslation as jest.Mock).mockReturnValue({ t: mockT });
    localStorageMock.getItem.mockReturnValue(JSON.stringify([mockProducts[0]]));
  });

  it('should not render when comparison is empty', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const { container } = render(<ComparisonFloatingButton />);
    
    expect(container.firstChild).toBeNull();
  });

  it('should render floating button with product count', () => {
    render(<ComparisonFloatingButton />);
    
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByTitle('View Comparison')).toBeInTheDocument();
  });

  it('should expand to show product list', () => {
    render(<ComparisonFloatingButton />);
    
    const button = screen.getByTitle('View Comparison');
    fireEvent.click(button);
    
    expect(screen.getByText('Compare Products (1)')).toBeInTheDocument();
    expect(screen.getByText('LED Display P2.5')).toBeInTheDocument();
  });

  it('should handle product removal from expanded view', () => {
    render(<ComparisonFloatingButton />);
    
    // Expand the button
    const button = screen.getByTitle('View Comparison');
    fireEvent.click(button);
    
    // Remove product
    const removeButton = screen.getByTitle('Remove from Comparison');
    fireEvent.click(removeButton);
    
    // Should collapse after removal
    expect(screen.queryByText('Compare Products (1)')).not.toBeInTheDocument();
  });
});

describe('ProductSelectorModal Component', () => {
  beforeEach(() => {
    (useTranslation as jest.Mock).mockReturnValue({ t: mockT });
    localStorageMock.getItem.mockReturnValue(null);
  });

  it('should not render when closed', () => {
    const { container } = render(
      <ProductSelectorModal
        isOpen={false}
        onClose={jest.fn()}
        products={mockProducts}
        categories={mockCategories}
      />
    );
    
    expect(container.firstChild).toBeNull();
  });

  it('should render modal when open', () => {
    render(
      <ProductSelectorModal
        isOpen={true}
        onClose={jest.fn()}
        products={mockProducts}
        categories={mockCategories}
      />
    );
    
    expect(screen.getByText('Add Product to Comparison')).toBeInTheDocument();
    expect(screen.getByText('LED Display P2.5')).toBeInTheDocument();
    expect(screen.getByText('LED Display P4')).toBeInTheDocument();
  });

  it('should filter products by search query', () => {
    render(
      <ProductSelectorModal
        isOpen={true}
        onClose={jest.fn()}
        products={mockProducts}
        categories={mockCategories}
      />
    );
    
    const searchInput = screen.getByPlaceholderText('Search products');
    fireEvent.change(searchInput, { target: { value: 'P2.5' } });
    
    expect(screen.getByText('LED Display P2.5')).toBeInTheDocument();
    expect(screen.queryByText('LED Display P4')).not.toBeInTheDocument();
  });

  it('should filter products by category', () => {
    render(
      <ProductSelectorModal
        isOpen={true}
        onClose={jest.fn()}
        products={mockProducts}
        categories={mockCategories}
      />
    );
    
    const categorySelect = screen.getByDisplayValue('All Categories');
    fireEvent.change(categorySelect, { target: { value: 'indoor-fixed' } });
    
    expect(screen.getByText('LED Display P2.5')).toBeInTheDocument();
    expect(screen.queryByText('LED Display P4')).not.toBeInTheDocument();
  });

  it('should handle product addition', () => {
    const onProductAdd = jest.fn();
    
    render(
      <ProductSelectorModal
        isOpen={true}
        onClose={jest.fn()}
        products={mockProducts}
        categories={mockCategories}
        onProductAdd={onProductAdd}
      />
    );
    
    const addButtons = screen.getAllByText('Add to Comparison');
    fireEvent.click(addButtons[0]);
    
    expect(onProductAdd).toHaveBeenCalledWith(mockProducts[0]);
  });

  it('should clear filters', () => {
    render(
      <ProductSelectorModal
        isOpen={true}
        onClose={jest.fn()}
        products={mockProducts}
        categories={mockCategories}
      />
    );
    
    // Set filters
    const searchInput = screen.getByPlaceholderText('Search products');
    fireEvent.change(searchInput, { target: { value: 'P2.5' } });
    
    const categorySelect = screen.getByDisplayValue('All Categories');
    fireEvent.change(categorySelect, { target: { value: 'indoor-fixed' } });
    
    // Clear filters
    const clearButton = screen.getByText('Clear Filters');
    fireEvent.click(clearButton);
    
    expect(searchInput).toHaveValue('');
    expect(categorySelect).toHaveValue('');
  });

  it('should handle modal close', () => {
    const onClose = jest.fn();
    
    render(
      <ProductSelectorModal
        isOpen={true}
        onClose={onClose}
        products={mockProducts}
        categories={mockCategories}
      />
    );
    
    const closeButton = screen.getByText('Cancel');
    fireEvent.click(closeButton);
    
    expect(onClose).toHaveBeenCalled();
  });
});