/**
 * 产品筛选功能集成测试
 */
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import ProductListPage from '@/components/products/ProductListPage';
import ProductFilters from '@/components/products/ProductFilters';
import ProductGrid from '@/components/products/ProductGrid';
import { ProductApi } from '@/lib/api/products';
import { Product, ProductSortBy, ProductFilters as ProductFiltersType } from '@/types/product';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

// Mock next-i18next
jest.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue?: string) => defaultValue || key,
  }),
}));

// Mock Product API
jest.mock('@/lib/api/products', () => ({
  ProductApi: {
    getProducts: jest.fn(),
  },
}));

const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockRouter = {
  locale: 'en',
  defaultLocale: 'en',
  locales: ['en', 'zh'],
  asPath: '/products',
  pathname: '/products',
  query: {},
  push: mockPush,
  replace: mockReplace,
};

const mockProducts: Product[] = [
  {
    id: 'product-1',
    name: 'P2.5 Indoor LED Display',
    slug: 'p2-5-indoor-led-display',
    model: 'LJ-P2.5-IN',
    description: 'High-resolution indoor LED display perfect for retail and corporate environments.',
    category: 'indoor-fixed',
    subcategory: 'fine-pitch',
    specifications: {
      pixelPitch: 'P2.5',
      resolution: { width: 1920, height: 1080 },
      brightness: 1000,
      refreshRate: 3840,
      colorDepth: 16,
      environment: 'indoor',
      viewingAngle: '160°H/160°V',
      powerConsumption: 300,
      operatingTemperature: '0°C to +40°C',
      dimensions: { width: 500, height: 500, depth: 80, unit: 'mm' },
      weight: 8.5,
      ipRating: 'IP40'
    },
    price: {
      current: 2500,
      original: 3000,
      currency: 'USD',
      unit: 'per sqm'
    },
    images: {
      main: '/images/products/p2-5-indoor/main.jpg',
      gallery: ['/images/products/p2-5-indoor/gallery-1.jpg']
    },
    applications: ['Retail', 'Corporate', 'Conference Rooms'],
    tags: ['indoor', 'high-resolution', 'retail'],
    features: ['High Refresh Rate', 'Energy Efficient'],
    availability: {
      inStock: true,
      leadTime: '2-3 weeks',
      moq: 10
    },
    rating: 4.8,
    reviewCount: 24,
    featured: true,
    isNew: false,
    onSale: true,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'product-2',
    name: 'P6 Outdoor LED Billboard',
    slug: 'p6-outdoor-led-billboard',
    model: 'LJ-P6-OUT',
    description: 'Weather-resistant outdoor LED display for advertising and digital signage.',
    category: 'outdoor-advertising',
    subcategory: 'billboard',
    specifications: {
      pixelPitch: 'P6',
      resolution: { width: 1280, height: 720 },
      brightness: 8000,
      refreshRate: 1920,
      colorDepth: 16,
      environment: 'outdoor',
      viewingAngle: '160°H/160°V',
      powerConsumption: 800,
      operatingTemperature: '-20°C to +60°C',
      dimensions: { width: 500, height: 500, depth: 120, unit: 'mm' },
      weight: 12.5,
      ipRating: 'IP65'
    },
    price: {
      current: 1800,
      currency: 'USD',
      unit: 'per sqm'
    },
    images: {
      main: '/images/products/p6-outdoor/main.jpg',
      gallery: ['/images/products/p6-outdoor/gallery-1.jpg']
    },
    applications: ['Advertising', 'Digital Signage', 'Outdoor Events'],
    tags: ['outdoor', 'weather-resistant', 'advertising'],
    features: ['Weatherproof', 'High Brightness'],
    availability: {
      inStock: true,
      leadTime: '3-4 weeks',
      moq: 20
    },
    rating: 4.6,
    reviewCount: 18,
    featured: false,
    isNew: true,
    onSale: false,
    createdAt: new Date('2023-06-01'),
    updatedAt: new Date('2024-01-01')
  }
];

describe('Product Filters Integration Tests', () => {
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (ProductApi.getProducts as jest.Mock).mockResolvedValue({
      products: mockProducts,
      total: 2,
      page: 1,
      limit: 20,
      totalPages: 1,
      hasNextPage: false,
      hasPrevPage: false
    });
    jest.clearAllMocks();
  });

  describe('ProductFilters Component', () => {
    const mockFilters: ProductFiltersType = {};
    const mockOnFiltersChange = jest.fn();
    const mockOnSortChange = jest.fn();

    it('should render filter groups correctly', () => {
      render(
        <ProductFilters
          filters={mockFilters}
          onFiltersChange={mockOnFiltersChange}
          onSortChange={mockOnSortChange}
          sortBy={ProductSortBy.RELEVANCE}
          totalResults={100}
        />
      );

      expect(screen.getByText('Category')).toBeInTheDocument();
      expect(screen.getByText('Pixel Pitch')).toBeInTheDocument();
      expect(screen.getByText('Application')).toBeInTheDocument();
      expect(screen.getByText('Environment')).toBeInTheDocument();
      expect(screen.getByText('Features')).toBeInTheDocument();
    });

    it('should handle filter group expansion', async () => {
      const user = userEvent.setup();
      
      render(
        <ProductFilters
          filters={mockFilters}
          onFiltersChange={mockOnFiltersChange}
          onSortChange={mockOnSortChange}
          sortBy={ProductSortBy.RELEVANCE}
          totalResults={100}
        />
      );

      // Category should be expanded by default
      expect(screen.getByText('Indoor Fixed')).toBeInTheDocument();

      // Click to collapse category
      const categoryButton = screen.getByRole('button', { name: /category/i });
      await user.click(categoryButton);

      // Should still be visible (expanded by default)
      expect(screen.getByText('Indoor Fixed')).toBeInTheDocument();

      // Click on Environment to expand it
      const environmentButton = screen.getByRole('button', { name: /environment/i });
      await user.click(environmentButton);

      expect(screen.getByText('Indoor')).toBeInTheDocument();
      expect(screen.getByText('Outdoor')).toBeInTheDocument();
    });

    it('should handle single select filters', async () => {
      const user = userEvent.setup();
      
      render(
        <ProductFilters
          filters={mockFilters}
          onFiltersChange={mockOnFiltersChange}
          onSortChange={mockOnSortChange}
          sortBy={ProductSortBy.RELEVANCE}
          totalResults={100}
        />
      );

      // Expand environment filter
      const environmentButton = screen.getByRole('button', { name: /environment/i });
      await user.click(environmentButton);

      // Select indoor option
      const indoorOption = screen.getByLabelText('Indoor');
      await user.click(indoorOption);

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        environment: 'indoor'
      });
    });

    it('should handle multi-select filters', async () => {
      const user = userEvent.setup();
      
      render(
        <ProductFilters
          filters={mockFilters}
          onFiltersChange={mockOnFiltersChange}
          onSortChange={mockOnSortChange}
          sortBy={ProductSortBy.RELEVANCE}
          totalResults={100}
        />
      );

      // Category should be expanded by default
      const indoorFixedOption = screen.getByLabelText('Indoor Fixed');
      await user.click(indoorFixedOption);

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        category: ['indoor-fixed']
      });

      // Select another category
      const outdoorOption = screen.getByLabelText('Outdoor Advertising');
      await user.click(outdoorOption);

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        category: ['indoor-fixed', 'outdoor-advertising']
      });
    });

    it('should handle sort changes', async () => {
      const user = userEvent.setup();
      
      render(
        <ProductFilters
          filters={mockFilters}
          onFiltersChange={mockOnFiltersChange}
          onSortChange={mockOnSortChange}
          sortBy={ProductSortBy.RELEVANCE}
          totalResults={100}
        />
      );

      const sortSelect = screen.getByDisplayValue('Most Relevant');
      await user.selectOptions(sortSelect, ProductSortBy.PRICE_ASC);

      expect(mockOnSortChange).toHaveBeenCalledWith(ProductSortBy.PRICE_ASC);
    });

    it('should display active filters', () => {
      const filtersWithValues: ProductFiltersType = {
        category: ['indoor-fixed'],
        environment: 'indoor',
        pixelPitch: ['P2.5', 'P3']
      };

      render(
        <ProductFilters
          filters={filtersWithValues}
          onFiltersChange={mockOnFiltersChange}
          onSortChange={mockOnSortChange}
          sortBy={ProductSortBy.RELEVANCE}
          totalResults={100}
        />
      );

      expect(screen.getByText('Active filters:')).toBeInTheDocument();
      expect(screen.getByText('Indoor Fixed')).toBeInTheDocument();
      expect(screen.getByText('Indoor')).toBeInTheDocument();
      expect(screen.getByText('P2.5')).toBeInTheDocument();
      expect(screen.getByText('P3')).toBeInTheDocument();
    });

    it('should handle removing active filters', async () => {
      const user = userEvent.setup();
      const filtersWithValues: ProductFiltersType = {
        category: ['indoor-fixed', 'outdoor-advertising'],
        environment: 'indoor'
      };

      render(
        <ProductFilters
          filters={filtersWithValues}
          onFiltersChange={mockOnFiltersChange}
          onSortChange={mockOnSortChange}
          sortBy={ProductSortBy.RELEVANCE}
          totalResults={100}
        />
      );

      // Remove indoor-fixed category
      const removeButtons = screen.getAllByRole('button');
      const indoorFixedRemoveButton = removeButtons.find(button => 
        button.textContent?.includes('Indoor Fixed')
      );
      
      if (indoorFixedRemoveButton) {
        await user.click(indoorFixedRemoveButton);
        
        expect(mockOnFiltersChange).toHaveBeenCalledWith({
          category: ['outdoor-advertising'],
          environment: 'indoor'
        });
      }
    });

    it('should handle clearing all filters', async () => {
      const user = userEvent.setup();
      const filtersWithValues: ProductFiltersType = {
        category: ['indoor-fixed'],
        environment: 'indoor'
      };

      render(
        <ProductFilters
          filters={filtersWithValues}
          onFiltersChange={mockOnFiltersChange}
          onSortChange={mockOnSortChange}
          sortBy={ProductSortBy.RELEVANCE}
          totalResults={100}
        />
      );

      const clearAllButton = screen.getByText('Clear all');
      await user.click(clearAllButton);

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        category: [],
        environment: ''
      });
    });

    it('should handle search functionality', async () => {
      const user = userEvent.setup();
      
      render(
        <ProductFilters
          filters={mockFilters}
          onFiltersChange={mockOnFiltersChange}
          onSortChange={mockOnSortChange}
          sortBy={ProductSortBy.RELEVANCE}
          totalResults={100}
        />
      );

      const searchInput = screen.getByPlaceholderText('Search products...');
      await user.type(searchInput, 'LED display');

      const searchButton = screen.getByRole('button', { name: /search/i });
      await user.click(searchButton);

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        search: 'LED display'
      });
    });

    it('should handle search on Enter key', async () => {
      const user = userEvent.setup();
      
      render(
        <ProductFilters
          filters={mockFilters}
          onFiltersChange={mockOnFiltersChange}
          onSortChange={mockOnSortChange}
          sortBy={ProductSortBy.RELEVANCE}
          totalResults={100}
        />
      );

      const searchInput = screen.getByPlaceholderText('Search products...');
      await user.type(searchInput, 'LED display{enter}');

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        search: 'LED display'
      });
    });
  });

  describe('ProductGrid Component', () => {
    it('should render products in grid view', () => {
      render(
        <ProductGrid
          products={mockProducts}
          viewMode="grid"
        />
      );

      expect(screen.getByText('P2.5 Indoor LED Display')).toBeInTheDocument();
      expect(screen.getByText('P6 Outdoor LED Billboard')).toBeInTheDocument();
    });

    it('should render products in list view', () => {
      render(
        <ProductGrid
          products={mockProducts}
          viewMode="list"
        />
      );

      expect(screen.getByText('P2.5 Indoor LED Display')).toBeInTheDocument();
      expect(screen.getByText('P6 Outdoor LED Billboard')).toBeInTheDocument();
      
      // List view should show more details
      expect(screen.getByText('High-resolution indoor LED display perfect for retail and corporate environments.')).toBeInTheDocument();
    });

    it('should handle wishlist toggle', async () => {
      const user = userEvent.setup();
      const mockOnWishlistToggle = jest.fn();
      
      render(
        <ProductGrid
          products={mockProducts}
          viewMode="grid"
          onWishlistToggle={mockOnWishlistToggle}
        />
      );

      // Hover over product to show action buttons
      const productCard = screen.getByText('P2.5 Indoor LED Display').closest('div');
      if (productCard) {
        await user.hover(productCard);
        
        const wishlistButtons = screen.getAllByLabelText('Add to wishlist');
        if (wishlistButtons.length > 0) {
          await user.click(wishlistButtons[0]);
          expect(mockOnWishlistToggle).toHaveBeenCalledWith('product-1');
        }
      }
    });

    it('should handle compare toggle', async () => {
      const user = userEvent.setup();
      const mockOnCompareToggle = jest.fn();
      
      render(
        <ProductGrid
          products={mockProducts}
          viewMode="grid"
          onCompareToggle={mockOnCompareToggle}
        />
      );

      const compareButtons = screen.getAllByText('Compare');
      if (compareButtons.length > 0) {
        await user.click(compareButtons[0]);
        expect(mockOnCompareToggle).toHaveBeenCalledWith('product-1');
      }
    });

    it('should handle quick view', async () => {
      const user = userEvent.setup();
      const mockOnQuickView = jest.fn();
      
      render(
        <ProductGrid
          products={mockProducts}
          viewMode="grid"
          onQuickView={mockOnQuickView}
        />
      );

      // Hover over product to show action buttons
      const productCard = screen.getByText('P2.5 Indoor LED Display').closest('div');
      if (productCard) {
        await user.hover(productCard);
        
        const quickViewButtons = screen.getAllByLabelText('Quick view');
        if (quickViewButtons.length > 0) {
          await user.click(quickViewButtons[0]);
          expect(mockOnQuickView).toHaveBeenCalledWith(mockProducts[0]);
        }
      }
    });

    it('should show loading state', () => {
      render(
        <ProductGrid
          products={[]}
          loading={true}
          viewMode="grid"
        />
      );

      const loadingElements = screen.getAllByRole('generic');
      const animatedElements = loadingElements.filter(el => 
        el.className.includes('animate-pulse')
      );
      expect(animatedElements.length).toBeGreaterThan(0);
    });

    it('should show empty state', () => {
      render(
        <ProductGrid
          products={[]}
          loading={false}
          viewMode="grid"
        />
      );

      expect(screen.getByText('No products found')).toBeInTheDocument();
      expect(screen.getByText('Try adjusting your filters or search terms to find what you\'re looking for.')).toBeInTheDocument();
    });
  });

  describe('ProductListPage Integration', () => {
    it('should render complete product list page', async () => {
      render(<ProductListPage initialProducts={mockProducts} initialTotal={2} />);

      expect(screen.getByText('LED Display Products')).toBeInTheDocument();
      expect(screen.getByText('Showing 2 of 2 products')).toBeInTheDocument();
      expect(screen.getByText('P2.5 Indoor LED Display')).toBeInTheDocument();
      expect(screen.getByText('P6 Outdoor LED Billboard')).toBeInTheDocument();
    });

    it('should handle view mode toggle', async () => {
      const user = userEvent.setup();
      
      render(<ProductListPage initialProducts={mockProducts} initialTotal={2} />);

      // Should start in grid view
      const gridButton = screen.getByLabelText('Grid view');
      const listButton = screen.getByLabelText('List view');

      expect(gridButton).toHaveClass('bg-primary-100');

      // Switch to list view
      await user.click(listButton);

      expect(listButton).toHaveClass('bg-primary-100');
    });

    it('should handle filter changes and API calls', async () => {
      const user = userEvent.setup();
      
      render(<ProductListPage initialProducts={mockProducts} initialTotal={2} />);

      // Expand environment filter and select indoor
      const environmentButton = screen.getByRole('button', { name: /environment/i });
      await user.click(environmentButton);

      const indoorOption = screen.getByLabelText('Indoor');
      await user.click(indoorOption);

      await waitFor(() => {
        expect(ProductApi.getProducts).toHaveBeenCalledWith({
          filters: { environment: 'indoor' },
          sortBy: ProductSortBy.RELEVANCE,
          page: 1,
          limit: 20
        });
      });
    });

    it('should handle sort changes', async () => {
      const user = userEvent.setup();
      
      render(<ProductListPage initialProducts={mockProducts} initialTotal={2} />);

      const sortSelect = screen.getByDisplayValue('Most Relevant');
      await user.selectOptions(sortSelect, ProductSortBy.PRICE_ASC);

      await waitFor(() => {
        expect(ProductApi.getProducts).toHaveBeenCalledWith({
          filters: {},
          sortBy: ProductSortBy.PRICE_ASC,
          page: 1,
          limit: 20
        });
      });
    });

    it('should handle product comparison', async () => {
      const user = userEvent.setup();
      
      render(<ProductListPage initialProducts={mockProducts} initialTotal={2} />);

      // Select products for comparison
      const compareButtons = screen.getAllByText('Compare');
      await user.click(compareButtons[0]);
      await user.click(compareButtons[1]);

      expect(screen.getByText('2 products selected for comparison')).toBeInTheDocument();
      expect(screen.getByText('Compare Now')).toBeInTheDocument();
    });

    it('should handle load more functionality', async () => {
      const user = userEvent.setup();
      
      // Mock API to return more products on second call
      (ProductApi.getProducts as jest.Mock)
        .mockResolvedValueOnce({
          products: mockProducts,
          total: 25,
          page: 1,
          limit: 20,
          totalPages: 2,
          hasNextPage: true,
          hasPrevPage: false
        })
        .mockResolvedValueOnce({
          products: [mockProducts[0]], // Additional products
          total: 25,
          page: 2,
          limit: 20,
          totalPages: 2,
          hasNextPage: false,
          hasPrevPage: true
        });

      render(<ProductListPage initialProducts={mockProducts} initialTotal={25} />);

      expect(screen.getByText('Showing 2 of 25 products')).toBeInTheDocument();

      const loadMoreButton = screen.getByText('Load More Products');
      await user.click(loadMoreButton);

      await waitFor(() => {
        expect(ProductApi.getProducts).toHaveBeenCalledWith({
          filters: {},
          sortBy: ProductSortBy.RELEVANCE,
          page: 2,
          limit: 20
        });
      });
    });

    it('should handle mobile filters', async () => {
      const user = userEvent.setup();
      
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(<ProductListPage initialProducts={mockProducts} initialTotal={2} />);

      // Mobile filter button should be visible
      const filtersButton = screen.getByText('Filters');
      await user.click(filtersButton);

      // Mobile filter modal should open
      expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
    });
  });

  describe('Performance Tests', () => {
    it('should handle large product lists efficiently', () => {
      const largeProductList = Array.from({ length: 100 }, (_, i) => ({
        ...mockProducts[0],
        id: `product-${i}`,
        name: `Product ${i}`
      }));

      const startTime = performance.now();
      
      render(
        <ProductGrid
          products={largeProductList}
          viewMode="grid"
        />
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render within reasonable time (less than 100ms)
      expect(renderTime).toBeLessThan(100);
    });

    it('should handle rapid filter changes without issues', async () => {
      const user = userEvent.setup();
      const mockOnFiltersChange = jest.fn();
      
      render(
        <ProductFilters
          filters={{}}
          onFiltersChange={mockOnFiltersChange}
          onSortChange={jest.fn()}
          sortBy={ProductSortBy.RELEVANCE}
          totalResults={100}
        />
      );

      // Rapidly toggle multiple filters
      const environmentButton = screen.getByRole('button', { name: /environment/i });
      await user.click(environmentButton);

      const indoorOption = screen.getByLabelText('Indoor');
      
      // Rapid clicks
      for (let i = 0; i < 5; i++) {
        await user.click(indoorOption);
      }

      // Should handle rapid changes gracefully
      expect(mockOnFiltersChange).toHaveBeenCalled();
    });
  });

  describe('Accessibility Tests', () => {
    it('should have proper ARIA labels and roles', () => {
      render(
        <ProductFilters
          filters={{}}
          onFiltersChange={jest.fn()}
          onSortChange={jest.fn()}
          sortBy={ProductSortBy.RELEVANCE}
          totalResults={100}
        />
      );

      // Filter groups should have proper button roles
      expect(screen.getByRole('button', { name: /category/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /pixel pitch/i })).toBeInTheDocument();

      // Form controls should have proper labels
      expect(screen.getByLabelText(/most relevant/i)).toBeInTheDocument();
    });

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();
      
      render(
        <ProductFilters
          filters={{}}
          onFiltersChange={jest.fn()}
          onSortChange={jest.fn()}
          sortBy={ProductSortBy.RELEVANCE}
          totalResults={100}
        />
      );

      // Tab through interactive elements
      await user.tab();
      expect(screen.getByPlaceholderText('Search products...')).toHaveFocus();

      await user.tab();
      expect(screen.getByDisplayValue('Most Relevant')).toHaveFocus();
    });

    it('should support screen readers', () => {
      render(
        <ProductGrid
          products={mockProducts}
          viewMode="grid"
        />
      );

      // Images should have proper alt text
      expect(screen.getByAltText('P2.5 Indoor LED Display')).toBeInTheDocument();
      expect(screen.getByAltText('P6 Outdoor LED Billboard')).toBeInTheDocument();

      // Action buttons should have proper labels
      expect(screen.getAllByLabelText('Add to wishlist')).toHaveLength(2);
      expect(screen.getAllByLabelText('Share product')).toHaveLength(2);
    });
  });
});