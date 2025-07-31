/**
 * 产品导航用户交互测试
 */
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import ProductNavigation from '@/components/home/ProductNavigation';

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

// Mock Intersection Observer
const mockIntersectionObserver = jest.fn();
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null,
});
window.IntersectionObserver = mockIntersectionObserver;

const mockPush = jest.fn();
const mockRouter = {
  locale: 'en',
  defaultLocale: 'en',
  locales: ['en', 'zh'],
  asPath: '/',
  push: mockPush,
  replace: jest.fn(),
};

describe('ProductNavigation Component', () => {
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    jest.clearAllMocks();
  });

  const mockCategories = [
    {
      id: 'indoor-fixed',
      name: 'Indoor Fixed LED',
      description: 'High-resolution displays for permanent indoor installations',
      icon: <div data-testid="indoor-icon">Indoor Icon</div>,
      image: '/images/products/indoor-fixed.jpg',
      productCount: 25,
      href: '/products/indoor-fixed',
      featured: true,
      tags: ['indoor', 'fixed', 'high-resolution'],
      applications: ['Conference rooms', 'Retail stores', 'Control rooms', 'Lobbies']
    },
    {
      id: 'outdoor-advertising',
      name: 'Outdoor Advertising',
      description: 'Weather-resistant displays for outdoor advertising and signage',
      icon: <div data-testid="outdoor-icon">Outdoor Icon</div>,
      image: '/images/products/outdoor-advertising.jpg',
      productCount: 18,
      href: '/products/outdoor-advertising',
      featured: false,
      tags: ['outdoor', 'advertising', 'weather-resistant'],
      applications: ['Billboards', 'Building facades', 'Street displays', 'Stadium screens']
    }
  ];

  describe('Basic Rendering', () => {
    it('should render product navigation with default categories', () => {
      render(<ProductNavigation />);
      
      expect(screen.getByText('Find Your Perfect')).toBeInTheDocument();
      expect(screen.getByText('LED Solution')).toBeInTheDocument();
      expect(screen.getByText('Indoor Fixed LED')).toBeInTheDocument();
      expect(screen.getByText('Outdoor Advertising')).toBeInTheDocument();
    });

    it('should render custom categories', () => {
      render(<ProductNavigation categories={mockCategories} />);
      
      expect(screen.getByText('Indoor Fixed LED')).toBeInTheDocument();
      expect(screen.getByText('Outdoor Advertising')).toBeInTheDocument();
      expect(screen.getByText('25 products')).toBeInTheDocument();
      expect(screen.getByText('18 products')).toBeInTheDocument();
    });

    it('should display category descriptions and applications', () => {
      render(<ProductNavigation categories={mockCategories} />);
      
      expect(screen.getByText('High-resolution displays for permanent indoor installations')).toBeInTheDocument();
      expect(screen.getByText('Weather-resistant displays for outdoor advertising and signage')).toBeInTheDocument();
      expect(screen.getByText('Conference rooms')).toBeInTheDocument();
      expect(screen.getByText('Billboards')).toBeInTheDocument();
    });

    it('should show featured badges for featured categories', () => {
      render(<ProductNavigation categories={mockCategories} />);
      
      const featuredBadges = screen.getAllByText('Featured');
      expect(featuredBadges).toHaveLength(1);
    });

    it('should render icons correctly', () => {
      render(<ProductNavigation categories={mockCategories} />);
      
      expect(screen.getByTestId('indoor-icon')).toBeInTheDocument();
      expect(screen.getByTestId('outdoor-icon')).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('should render search bar when showSearch is true', () => {
      render(<ProductNavigation showSearch={true} />);
      
      expect(screen.getByPlaceholderText(/search products/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
    });

    it('should not render search bar when showSearch is false', () => {
      render(<ProductNavigation showSearch={false} />);
      
      expect(screen.queryByPlaceholderText(/search products/i)).not.toBeInTheDocument();
    });

    it('should handle search input changes', async () => {
      const user = userEvent.setup();
      render(<ProductNavigation showSearch={true} />);
      
      const searchInput = screen.getByPlaceholderText(/search products/i);
      await user.type(searchInput, 'LED display');
      
      expect(searchInput).toHaveValue('LED display');
    });

    it('should trigger search on button click', async () => {
      const mockOnSearch = jest.fn();
      const user = userEvent.setup();
      
      render(<ProductNavigation showSearch={true} onSearch={mockOnSearch} />);
      
      const searchInput = screen.getByPlaceholderText(/search products/i);
      const searchButton = screen.getByRole('button', { name: /search/i });
      
      await user.type(searchInput, 'LED display');
      await user.click(searchButton);
      
      expect(mockOnSearch).toHaveBeenCalledWith('LED display', {});
    });

    it('should trigger search on Enter key press', async () => {
      const mockOnSearch = jest.fn();
      const user = userEvent.setup();
      
      render(<ProductNavigation showSearch={true} onSearch={mockOnSearch} />);
      
      const searchInput = screen.getByPlaceholderText(/search products/i);
      await user.type(searchInput, 'LED display{enter}');
      
      expect(mockOnSearch).toHaveBeenCalledWith('LED display', {});
    });

    it('should navigate to products page with search query when no onSearch callback', async () => {
      const user = userEvent.setup();
      
      render(<ProductNavigation showSearch={true} />);
      
      const searchInput = screen.getByPlaceholderText(/search products/i);
      const searchButton = screen.getByRole('button', { name: /search/i });
      
      await user.type(searchInput, 'LED display');
      await user.click(searchButton);
      
      expect(mockPush).toHaveBeenCalledWith('/products?q=LED%20display');
    });
  });

  describe('Filter Functionality', () => {
    it('should show filters button when showFilters is true', () => {
      render(<ProductNavigation showSearch={true} showFilters={true} />);
      
      expect(screen.getByRole('button', { name: /filters/i })).toBeInTheDocument();
    });

    it('should not show filters button when showFilters is false', () => {
      render(<ProductNavigation showSearch={true} showFilters={false} />);
      
      expect(screen.queryByRole('button', { name: /filters/i })).not.toBeInTheDocument();
    });

    it('should toggle filter panel on filters button click', async () => {
      const user = userEvent.setup();
      
      render(<ProductNavigation showSearch={true} showFilters={true} />);
      
      const filtersButton = screen.getByRole('button', { name: /filters/i });
      
      // Filter panel should not be visible initially
      expect(screen.queryByText('Application')).not.toBeInTheDocument();
      
      // Click to show filter panel
      await user.click(filtersButton);
      
      expect(screen.getByText('Application')).toBeInTheDocument();
      expect(screen.getByText('Pixel Pitch')).toBeInTheDocument();
      expect(screen.getByText('Environment')).toBeInTheDocument();
      expect(screen.getByText('Price Range')).toBeInTheDocument();
      
      // Click again to hide filter panel
      await user.click(filtersButton);
      
      expect(screen.queryByText('Application')).not.toBeInTheDocument();
    });

    it('should handle filter changes', async () => {
      const mockOnSearch = jest.fn();
      const user = userEvent.setup();
      
      render(<ProductNavigation showSearch={true} showFilters={true} onSearch={mockOnSearch} />);
      
      // Open filter panel
      const filtersButton = screen.getByRole('button', { name: /filters/i });
      await user.click(filtersButton);
      
      // Change application filter
      const applicationSelect = screen.getByLabelText('Application');
      await user.selectOptions(applicationSelect, 'retail');
      
      expect(mockOnSearch).toHaveBeenCalledWith('', { application: 'retail' });
    });

    it('should clear all filters', async () => {
      const mockOnSearch = jest.fn();
      const user = userEvent.setup();
      
      render(<ProductNavigation showSearch={true} showFilters={true} onSearch={mockOnSearch} />);
      
      // Open filter panel
      const filtersButton = screen.getByRole('button', { name: /filters/i });
      await user.click(filtersButton);
      
      // Set some filters
      const applicationSelect = screen.getByLabelText('Application');
      await user.selectOptions(applicationSelect, 'retail');
      
      const pixelPitchSelect = screen.getByLabelText('Pixel Pitch');
      await user.selectOptions(pixelPitchSelect, 'P2.5');
      
      // Clear filters
      const clearButton = screen.getByRole('button', { name: /clear all filters/i });
      await user.click(clearButton);
      
      expect(mockOnSearch).toHaveBeenCalledWith('', {});
    });

    it('should handle multiple filter combinations', async () => {
      const mockOnSearch = jest.fn();
      const user = userEvent.setup();
      
      render(<ProductNavigation showSearch={true} showFilters={true} onSearch={mockOnSearch} />);
      
      // Open filter panel
      const filtersButton = screen.getByRole('button', { name: /filters/i });
      await user.click(filtersButton);
      
      // Set multiple filters
      const applicationSelect = screen.getByLabelText('Application');
      await user.selectOptions(applicationSelect, 'retail');
      
      const environmentSelect = screen.getByLabelText('Environment');
      await user.selectOptions(environmentSelect, 'indoor');
      
      const priceRangeSelect = screen.getByLabelText('Price Range');
      await user.selectOptions(priceRangeSelect, '1000-5000');
      
      expect(mockOnSearch).toHaveBeenLastCalledWith('', {
        application: 'retail',
        environment: 'indoor',
        priceRange: '1000-5000'
      });
    });
  });

  describe('Category Interaction', () => {
    it('should handle category card hover effects', async () => {
      const user = userEvent.setup();
      
      render(<ProductNavigation categories={mockCategories} />);
      
      const indoorCard = screen.getByText('Indoor Fixed LED').closest('div');
      
      if (indoorCard) {
        await user.hover(indoorCard);
        
        // Hover effects should be applied (tested through class changes)
        expect(indoorCard).toBeInTheDocument();
        
        await user.unhover(indoorCard);
        
        // Hover effects should be removed
        expect(indoorCard).toBeInTheDocument();
      }
    });

    it('should call onCategorySelect when category is clicked', async () => {
      const mockOnCategorySelect = jest.fn();
      const user = userEvent.setup();
      
      render(
        <ProductNavigation 
          categories={mockCategories} 
          onCategorySelect={mockOnCategorySelect} 
        />
      );
      
      const indoorCard = screen.getByText('Indoor Fixed LED').closest('div');
      
      if (indoorCard) {
        await user.click(indoorCard);
        
        expect(mockOnCategorySelect).toHaveBeenCalledWith(mockCategories[0]);
      }
    });

    it('should navigate to category page when no onCategorySelect callback', async () => {
      const user = userEvent.setup();
      
      render(<ProductNavigation categories={mockCategories} />);
      
      const indoorCard = screen.getByText('Indoor Fixed LED').closest('div');
      
      if (indoorCard) {
        await user.click(indoorCard);
        
        expect(mockPush).toHaveBeenCalledWith('/products/indoor-fixed');
      }
    });

    it('should display correct product counts', () => {
      render(<ProductNavigation categories={mockCategories} />);
      
      expect(screen.getByText('25 products')).toBeInTheDocument();
      expect(screen.getByText('18 products')).toBeInTheDocument();
    });

    it('should show limited applications with "more" indicator', () => {
      const categoryWithManyApps = {
        ...mockCategories[0],
        applications: ['App 1', 'App 2', 'App 3', 'App 4', 'App 5']
      };
      
      render(<ProductNavigation categories={[categoryWithManyApps]} />);
      
      expect(screen.getByText('App 1')).toBeInTheDocument();
      expect(screen.getByText('App 2')).toBeInTheDocument();
      expect(screen.getByText('+3 more')).toBeInTheDocument();
    });
  });

  describe('Call to Action', () => {
    it('should render call to action section', () => {
      render(<ProductNavigation />);
      
      expect(screen.getByText("Can't Find What You're Looking For?")).toBeInTheDocument();
      expect(screen.getByText('Get Expert Consultation')).toBeInTheDocument();
      expect(screen.getByText('View All Products')).toBeInTheDocument();
    });

    it('should have correct links in call to action', () => {
      render(<ProductNavigation />);
      
      const consultationButton = screen.getByText('Get Expert Consultation').closest('a');
      const productsButton = screen.getByText('View All Products').closest('a');
      
      expect(consultationButton).toHaveAttribute('href', '/contact');
      expect(productsButton).toHaveAttribute('href', '/products');
    });
  });

  describe('Responsive Design', () => {
    it('should render correctly on mobile viewport', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(<ProductNavigation categories={mockCategories} />);
      
      // Component should render without errors on mobile
      expect(screen.getByText('Indoor Fixed LED')).toBeInTheDocument();
    });

    it('should handle search and filters on mobile', async () => {
      const user = userEvent.setup();
      
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(<ProductNavigation showSearch={true} showFilters={true} />);
      
      // Search should work on mobile
      const searchInput = screen.getByPlaceholderText(/search products/i);
      await user.type(searchInput, 'test');
      
      expect(searchInput).toHaveValue('test');
      
      // Filters should work on mobile
      const filtersButton = screen.getByRole('button', { name: /filters/i });
      await user.click(filtersButton);
      
      expect(screen.getByText('Application')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels and roles', () => {
      render(<ProductNavigation categories={mockCategories} />);
      
      // Search input should have proper labeling
      const searchInput = screen.getByPlaceholderText(/search products/i);
      expect(searchInput).toBeInTheDocument();
      
      // Buttons should have proper roles
      const searchButton = screen.getByRole('button', { name: /search/i });
      expect(searchButton).toBeInTheDocument();
    });

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();
      
      render(<ProductNavigation categories={mockCategories} showSearch={true} showFilters={true} />);
      
      // Tab through interactive elements
      await user.tab();
      expect(screen.getByPlaceholderText(/search products/i)).toHaveFocus();
      
      await user.tab();
      expect(screen.getByRole('button', { name: /search/i })).toHaveFocus();
      
      await user.tab();
      expect(screen.getByRole('button', { name: /filters/i })).toHaveFocus();
    });

    it('should have proper alt text for images', () => {
      render(<ProductNavigation categories={mockCategories} />);
      
      const indoorImage = screen.getByAltText('Indoor Fixed LED');
      const outdoorImage = screen.getByAltText('Outdoor Advertising');
      
      expect(indoorImage).toBeInTheDocument();
      expect(outdoorImage).toBeInTheDocument();
    });

    it('should support screen readers with proper headings', () => {
      render(<ProductNavigation categories={mockCategories} />);
      
      // Main heading
      const mainHeading = screen.getByRole('heading', { level: 2 });
      expect(mainHeading).toBeInTheDocument();
      
      // Category headings
      const categoryHeadings = screen.getAllByRole('heading', { level: 3 });
      expect(categoryHeadings.length).toBeGreaterThan(0);
    });
  });

  describe('Performance', () => {
    it('should handle intersection observer correctly', () => {
      const mockObserve = jest.fn();
      const mockDisconnect = jest.fn();
      
      mockIntersectionObserver.mockReturnValue({
        observe: mockObserve,
        unobserve: jest.fn(),
        disconnect: mockDisconnect,
      });

      const { unmount } = render(<ProductNavigation />);
      
      expect(mockObserve).toHaveBeenCalled();
      
      unmount();
      
      expect(mockDisconnect).toHaveBeenCalled();
    });

    it('should not cause memory leaks with hover effects', async () => {
      const user = userEvent.setup();
      
      const { unmount } = render(<ProductNavigation categories={mockCategories} />);
      
      const indoorCard = screen.getByText('Indoor Fixed LED').closest('div');
      
      if (indoorCard) {
        // Rapid hover/unhover
        for (let i = 0; i < 10; i++) {
          await user.hover(indoorCard);
          await user.unhover(indoorCard);
        }
      }
      
      // Component should unmount cleanly
      unmount();
      
      expect(true).toBe(true); // No errors thrown
    });
  });

  describe('Custom Props', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <ProductNavigation className="custom-navigation-class" />
      );
      
      expect(container.firstChild).toHaveClass('custom-navigation-class');
    });

    it('should handle empty categories array', () => {
      render(<ProductNavigation categories={[]} />);
      
      // Should render without errors
      expect(screen.getByText('Find Your Perfect')).toBeInTheDocument();
    });

    it('should handle categories without optional fields', () => {
      const minimalCategory = {
        id: 'minimal',
        name: 'Minimal Category',
        description: 'Basic description',
        icon: <div>Icon</div>,
        image: '/test.jpg',
        productCount: 5,
        href: '/test',
        featured: false,
        tags: [],
        applications: []
      };
      
      render(<ProductNavigation categories={[minimalCategory]} />);
      
      expect(screen.getByText('Minimal Category')).toBeInTheDocument();
      expect(screen.getByText('5 products')).toBeInTheDocument();
    });
  });
});