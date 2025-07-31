/**
 * 产品管理后台测试
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useTranslation } from 'next-i18next';
import ProductManagement from '@/components/admin/ProductManagement';
import { Product } from '@/types/product';

// Mock next-i18next
jest.mock('next-i18next', () => ({
  useTranslation: jest.fn(),
}));

// Mock ProductEditForm component
jest.mock('@/components/admin/ProductEditForm', () => {
  return function MockProductEditForm({ isOpen, onClose, product }: any) {
    if (!isOpen) return null;
    return (
      <div data-testid="product-edit-form">
        <h3>{product ? 'Edit Product' : 'Add Product'}</h3>
        <button onClick={onClose}>Close</button>
      </div>
    );
  };
});

const mockT = (key: string, options?: any) => {
  const translations: { [key: string]: string } = {
    productManagement: 'Product Management',
    addProduct: 'Add Product',
    editProduct: 'Edit Product',
    searchProducts: 'Search products...',
    filters: 'Filters',
    product: 'Product',
    category: 'Category',
    price: 'Price',
    stock: 'Stock',
    status: 'Status',
    actions: 'Actions',
    featured: 'Featured',
    published: 'Published',
    draft: 'Draft',
    archived: 'Archived',
    inStock: 'In Stock',
    outOfStock: 'Out of Stock',
    available: 'Available',
    unavailable: 'Unavailable',
    loadingProducts: 'Loading products...',
    noProductsFound: 'No products found',
    noProductsMatchFilters: 'No products match your filters',
    noProductsYet: 'No products yet',
    addFirstProduct: 'Add First Product',
    confirmDeleteProduct: 'Are you sure you want to delete this product?',
    selectedProducts: `${options?.count || 0} products selected`,
    allCategories: 'All Categories',
    allStatuses: 'All Statuses',
    allAvailability: 'All Availability',
    allProducts: 'All Products',
    featuredOnly: 'Featured Only',
    notFeatured: 'Not Featured',
    clearFilters: 'Clear Filters',
    publish: 'Publish',
    archive: 'Archive',
    delete: 'Delete',
    newestFirst: 'Newest First',
    nameAZ: 'Name A-Z',
    nameZA: 'Name Z-A',
    priceLowHigh: 'Price: Low to High',
    priceHighLow: 'Price: High to Low',
    updated: 'Updated',
  };
  return translations[key] || key;
};

describe('ProductManagement', () => {
  beforeEach(() => {
    (useTranslation as jest.Mock).mockReturnValue({
      t: mockT,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders product management interface', async () => {
    render(<ProductManagement />);
    
    expect(screen.getByText('Product Management')).toBeInTheDocument();
    expect(screen.getByText('Add Product')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search products...')).toBeInTheDocument();
    expect(screen.getByText('Filters')).toBeInTheDocument();
  });

  it('displays loading state initially', () => {
    render(<ProductManagement />);
    
    expect(screen.getByText('Loading products...')).toBeInTheDocument();
  });

  it('displays products in list view after loading', async () => {
    render(<ProductManagement />);
    
    // Wait for products to load
    await waitFor(() => {
      expect(screen.queryByText('Loading products...')).not.toBeInTheDocument();
    });

    // Check if products are displayed
    expect(screen.getByText('P2.5 Indoor LED Display')).toBeInTheDocument();
    expect(screen.getByText('P6 Outdoor LED Screen')).toBeInTheDocument();
    expect(screen.getByText('Indoor LED')).toBeInTheDocument();
    expect(screen.getByText('Outdoor LED')).toBeInTheDocument();
  });

  it('switches between list and grid view', async () => {
    render(<ProductManagement />);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading products...')).not.toBeInTheDocument();
    });

    // Find view mode buttons by their icons
    const viewButtons = screen.getAllByRole('button');
    const gridButton = viewButtons.find(btn => 
      btn.querySelector('svg') && btn.className.includes('text-gray-400')
    );
    
    expect(gridButton).toBeInTheDocument();
    
    if (gridButton) {
      fireEvent.click(gridButton);
      // Grid view should be active now
      expect(gridButton).toHaveClass('bg-primary-100');
    }
  });

  it('filters products by search term', async () => {
    const user = userEvent.setup();
    render(<ProductManagement />);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading products...')).not.toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search products...');
    
    // Search for a specific product
    await user.type(searchInput, 'P2.5');
    
    // P2.5 product should still be visible
    expect(screen.getByText('P2.5 Indoor LED Display')).toBeInTheDocument();
    
    // P6 product should not be visible
    expect(screen.queryByText('P6 Outdoor LED Screen')).not.toBeInTheDocument();
    
    // Search for non-existent product
    await user.clear(searchInput);
    await user.type(searchInput, 'NonExistent');
    
    // Should show no products found
    await waitFor(() => {
      expect(screen.getByText('No products found')).toBeInTheDocument();
    });
  });

  it('shows and hides filters panel', async () => {
    render(<ProductManagement />);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading products...')).not.toBeInTheDocument();
    });
    
    const filtersButton = screen.getByText('Filters');
    
    // Initially filters should be hidden
    expect(screen.queryByText('All Categories')).not.toBeInTheDocument();
    
    // Show filters
    fireEvent.click(filtersButton);
    expect(screen.getByText('All Categories')).toBeInTheDocument();
    
    // Hide filters
    fireEvent.click(filtersButton);
    expect(screen.queryByText('All Categories')).not.toBeInTheDocument();
  });

  it('selects and deselects products', async () => {
    render(<ProductManagement />);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading products...')).not.toBeInTheDocument();
    });

    // Find product checkboxes (skip the select all checkbox)
    const checkboxes = screen.getAllByRole('checkbox');
    const productCheckbox = checkboxes[1]; // First product checkbox

    expect(productCheckbox).toBeInTheDocument();
    
    // Select product
    fireEvent.click(productCheckbox);
    
    // Should show bulk actions
    await waitFor(() => {
      expect(screen.getByText('1 products selected')).toBeInTheDocument();
    });
  });

  it('handles select all functionality', async () => {
    render(<ProductManagement />);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading products...')).not.toBeInTheDocument();
    });

    const selectAllCheckbox = screen.getAllByRole('checkbox')[0]; // First checkbox is select all
    
    // Select all
    fireEvent.click(selectAllCheckbox);
    
    // Should show bulk actions for all products
    await waitFor(() => {
      expect(screen.getByText('2 products selected')).toBeInTheDocument();
    });
  });

  it('opens add product modal', async () => {
    render(<ProductManagement />);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading products...')).not.toBeInTheDocument();
    });
    
    const addButton = screen.getByText('Add Product');
    fireEvent.click(addButton);
    
    // Modal should open
    await waitFor(() => {
      expect(screen.getByTestId('product-edit-form')).toBeInTheDocument();
      expect(screen.getByText('Add Product')).toBeInTheDocument();
    });
  });

  it('opens edit product modal', async () => {
    render(<ProductManagement />);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading products...')).not.toBeInTheDocument();
    });

    // Find edit buttons (pencil icons)
    const editButtons = screen.getAllByRole('button');
    const editButton = editButtons.find(button => 
      button.querySelector('svg') && !button.textContent
    );

    if (editButton) {
      fireEvent.click(editButton);
      
      // Modal should open with edit mode
      await waitFor(() => {
        expect(screen.getByTestId('product-edit-form')).toBeInTheDocument();
        expect(screen.getByText('Edit Product')).toBeInTheDocument();
      });
    }
  });

  it('handles product deletion with confirmation', async () => {
    // Mock window.confirm
    const originalConfirm = window.confirm;
    window.confirm = jest.fn(() => true);
    
    render(<ProductManagement />);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading products...')).not.toBeInTheDocument();
    });

    // Find delete button (should be red colored)
    const deleteButtons = screen.getAllByRole('button');
    const deleteButton = deleteButtons.find(button => 
      button.className.includes('text-red-600')
    );

    expect(deleteButton).toBeInTheDocument();
    
    if (deleteButton) {
      // Click delete
      fireEvent.click(deleteButton);
      
      // Confirm should be called
      expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this product?');
    }
    
    // Restore original confirm
    window.confirm = originalConfirm;
  });

  it('sorts products correctly', async () => {
    render(<ProductManagement />);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading products...')).not.toBeInTheDocument();
    });

    // Find sort dropdown
    const sortSelects = screen.getAllByRole('combobox');
    const sortSelect = sortSelects.find(select => 
      select.getAttribute('value') === 'created_desc'
    );
    
    expect(sortSelect).toBeInTheDocument();
    
    if (sortSelect) {
      // Change sort to name A-Z
      fireEvent.change(sortSelect, { target: { value: 'name_asc' } });
      
      // Sort value should be updated
      expect(sortSelect).toHaveValue('name_asc');
    }
  });

  it('handles bulk actions', async () => {
    render(<ProductManagement />);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading products...')).not.toBeInTheDocument();
    });

    // Select a product first
    const checkboxes = screen.getAllByRole('checkbox');
    const productCheckbox = checkboxes[1]; // Skip select all checkbox
    
    fireEvent.click(productCheckbox);
    
    // Wait for bulk actions to appear
    await waitFor(() => {
      expect(screen.getByText('Publish')).toBeInTheDocument();
    });

    // Test bulk publish
    const publishButton = screen.getByText('Publish');
    fireEvent.click(publishButton);
    
    // Selection should be cleared after bulk action
    await waitFor(() => {
      expect(screen.queryByText(/products selected/)).not.toBeInTheDocument();
    });
  });

  it('filters products by category', async () => {
    render(<ProductManagement />);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading products...')).not.toBeInTheDocument();
    });

    // Show filters
    const filtersButton = screen.getByText('Filters');
    fireEvent.click(filtersButton);
    
    // Find category filter
    const categorySelects = screen.getAllByRole('combobox');
    const categorySelect = categorySelects.find(select => 
      select.closest('div')?.querySelector('label')?.textContent === 'Category'
    );
    
    if (categorySelect) {
      // Filter by Indoor LED
      fireEvent.change(categorySelect, { target: { value: 'Indoor LED' } });
      
      // Only Indoor LED products should be visible
      expect(screen.getByText('P2.5 Indoor LED Display')).toBeInTheDocument();
      expect(screen.queryByText('P6 Outdoor LED Screen')).not.toBeInTheDocument();
    }
  });

  it('clears filters', async () => {
    render(<ProductManagement />);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading products...')).not.toBeInTheDocument();
    });

    // Show filters
    const filtersButton = screen.getByText('Filters');
    fireEvent.click(filtersButton);
    
    // Set a filter
    const categorySelects = screen.getAllByRole('combobox');
    const categorySelect = categorySelects.find(select => 
      select.closest('div')?.querySelector('label')?.textContent === 'Category'
    );
    
    if (categorySelect) {
      fireEvent.change(categorySelect, { target: { value: 'Indoor LED' } });
      
      // Clear filters
      const clearButton = screen.getByText('Clear Filters');
      fireEvent.click(clearButton);
      
      // All products should be visible again
      expect(screen.getByText('P2.5 Indoor LED Display')).toBeInTheDocument();
      expect(screen.getByText('P6 Outdoor LED Screen')).toBeInTheDocument();
    }
  });

  it('shows empty state when no products exist', async () => {
    // This would require mocking the products to be empty
    // For now, we test the search empty state
    render(<ProductManagement />);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading products...')).not.toBeInTheDocument();
    });

    // Search for non-existent product
    const searchInput = screen.getByPlaceholderText('Search products...');
    fireEvent.change(searchInput, { target: { value: 'NonExistentProduct' } });
    
    await waitFor(() => {
      expect(screen.getByText('No products found')).toBeInTheDocument();
      expect(screen.getByText('No products match your filters')).toBeInTheDocument();
    });
  });
});