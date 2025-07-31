/**
 * 产品列表页面组件
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { 
  Squares2X2Icon, 
  ListBulletIcon,
  EyeIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import Button from '@/components/ui/Button';
import ProductGrid from './ProductGrid';
import ProductFilters from './ProductFilters';
import { 
  Product, 
  ProductFilters as ProductFiltersType, 
  ProductSortBy,
  ProductQuery,
  ProductQueryResult 
} from '@/types/product';
import { ProductApi } from '@/lib/api/products';

interface ProductListPageProps {
  initialProducts?: Product[];
  initialTotal?: number;
  initialFilters?: ProductFiltersType;
  initialSortBy?: ProductSortBy;
  className?: string;
}

// 快速查看模态框组件
const QuickViewModal: React.FC<{
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}> = ({ product, isOpen, onClose }) => {
  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto bg-white rounded-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-200"
          aria-label="Close quick view"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square overflow-hidden rounded-xl">
              <img
                src={product.images.main}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {product.images.gallery && product.images.gallery.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.gallery.slice(0, 4).map((image, index) => (
                  <div key={index} className="aspect-square overflow-hidden rounded-lg">
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-300 cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h2>
              <p className="text-lg text-gray-600">{product.model}</p>
            </div>

            <div className="text-3xl font-bold text-primary-600">
              ${product.price.current.toLocaleString()}
              {product.price.original && product.price.original > product.price.current && (
                <span className="text-lg text-gray-500 line-through ml-2">
                  ${product.price.original.toLocaleString()}
                </span>
              )}
            </div>

            <p className="text-gray-700 leading-relaxed">{product.description}</p>

            {/* Key Specifications */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="font-bold text-gray-900 mb-4">Key Specifications</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-500">Pixel Pitch:</span>
                  <p className="font-medium">{product.specifications.pixelPitch}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Brightness:</span>
                  <p className="font-medium">{product.specifications.brightness} nits</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Environment:</span>
                  <p className="font-medium capitalize">{product.specifications.environment}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Refresh Rate:</span>
                  <p className="font-medium">{product.specifications.refreshRate} Hz</p>
                </div>
              </div>
            </div>

            {/* Applications */}
            <div>
              <h3 className="font-bold text-gray-900 mb-3">Applications</h3>
              <div className="flex flex-wrap gap-2">
                {product.applications.map((app, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-primary-100 text-primary-700 text-sm rounded-full"
                  >
                    {app}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <Button
                size="lg"
                className="flex-1 bg-primary-600 hover:bg-primary-700 text-white"
                href={`/products/${product.slug}`}
              >
                View Details
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                href="/contact"
              >
                Get Quote
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProductListPage: React.FC<ProductListPageProps> = ({
  initialProducts = [],
  initialTotal = 0,
  initialFilters = {},
  initialSortBy = ProductSortBy.RELEVANCE,
  className
}) => {
  const { t } = useTranslation('products');
  const router = useRouter();
  
  // State
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [total, setTotal] = useState(initialTotal);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState<ProductFiltersType>(initialFilters);
  const [sortBy, setSortBy] = useState<ProductSortBy>(initialSortBy);
  const [page, setPage] = useState(1);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [showQuickView, setShowQuickView] = useState(false);

  // Fetch products
  const fetchProducts = useCallback(async (
    newFilters: ProductFiltersType = filters,
    newSortBy: ProductSortBy = sortBy,
    newPage: number = page
  ) => {
    try {
      setLoading(true);
      
      const query: ProductQuery = {
        filters: newFilters,
        sortBy: newSortBy,
        page: newPage,
        limit: 20
      };

      const result = await ProductApi.getProducts(query);
      
      if (newPage === 1) {
        setProducts(result.products);
      } else {
        setProducts(prev => [...prev, ...result.products]);
      }
      
      setTotal(result.total);
      
      // Update URL
      const searchParams = new URLSearchParams();
      if (Object.keys(newFilters).length > 0) {
        searchParams.set('filters', JSON.stringify(newFilters));
      }
      if (newSortBy !== ProductSortBy.RELEVANCE) {
        searchParams.set('sort', newSortBy);
      }
      if (newPage > 1) {
        searchParams.set('page', newPage.toString());
      }
      
      const newUrl = searchParams.toString() 
        ? `${router.pathname}?${searchParams.toString()}`
        : router.pathname;
      
      router.replace(newUrl, undefined, { shallow: true });
      
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  }, [filters, sortBy, page, router]);

  // Handle filter changes
  const handleFiltersChange = useCallback((newFilters: ProductFiltersType) => {
    setFilters(newFilters);
    setPage(1);
    fetchProducts(newFilters, sortBy, 1);
  }, [sortBy, fetchProducts]);

  // Handle sort changes
  const handleSortChange = useCallback((newSortBy: ProductSortBy) => {
    setSortBy(newSortBy);
    setPage(1);
    fetchProducts(filters, newSortBy, 1);
  }, [filters, fetchProducts]);

  // Handle load more
  const handleLoadMore = useCallback(() => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchProducts(filters, sortBy, nextPage);
  }, [page, filters, sortBy, fetchProducts]);

  // Handle wishlist toggle
  const handleWishlistToggle = useCallback((productId: string) => {
    // Implement wishlist logic
    console.log('Toggle wishlist for product:', productId);
  }, []);

  // Handle compare toggle
  const handleCompareToggle = useCallback((productId: string) => {
    setSelectedForCompare(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else if (prev.length < 3) {
        return [...prev, productId];
      } else {
        // Replace the first item if already at max
        return [prev[1], prev[2], productId];
      }
    });
  }, []);

  // Handle quick view
  const handleQuickView = useCallback((product: Product) => {
    setQuickViewProduct(product);
    setShowQuickView(true);
  }, []);

  // Initialize from URL params
  useEffect(() => {
    const { filters: urlFilters, sort, page: urlPage } = router.query;
    
    if (urlFilters && typeof urlFilters === 'string') {
      try {
        const parsedFilters = JSON.parse(urlFilters);
        setFilters(parsedFilters);
      } catch (error) {
        console.error('Failed to parse filters from URL:', error);
      }
    }
    
    if (sort && typeof sort === 'string') {
      setSortBy(sort as ProductSortBy);
    }
    
    if (urlPage && typeof urlPage === 'string') {
      setPage(parseInt(urlPage));
    }
  }, [router.query]);

  const hasMoreProducts = products.length < total;

  return (
    <div className={cn('min-h-screen bg-gray-50', className)}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <div className="w-80 flex-shrink-0">
            <ProductFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onSortChange={handleSortChange}
              sortBy={sortBy}
              totalResults={total}
              loading={loading}
              showMobileFilters={showMobileFilters}
              onToggleMobileFilters={() => setShowMobileFilters(!showMobileFilters)}
            />
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">LED Display Products</h1>
                <p className="text-gray-600">
                  Showing {products.length} of {total} products
                </p>
              </div>

              {/* View Mode Toggle */}
              <div className="hidden lg:flex items-center gap-2 bg-white rounded-lg p-1 shadow-sm">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    'p-2 rounded-md transition-colors',
                    viewMode === 'grid'
                      ? 'bg-primary-100 text-primary-600'
                      : 'text-gray-500 hover:text-gray-700'
                  )}
                  aria-label="Grid view"
                >
                  <Squares2X2Icon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    'p-2 rounded-md transition-colors',
                    viewMode === 'list'
                      ? 'bg-primary-100 text-primary-600'
                      : 'text-gray-500 hover:text-gray-700'
                  )}
                  aria-label="List view"
                >
                  <ListBulletIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Compare Bar */}
            {selectedForCompare.length > 0 && (
              <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="font-medium text-primary-900">
                      {selectedForCompare.length} product{selectedForCompare.length > 1 ? 's' : ''} selected for comparison
                    </span>
                    <Button
                      size="sm"
                      className="bg-primary-600 hover:bg-primary-700 text-white"
                      href={`/products/compare?ids=${selectedForCompare.join(',')}`}
                    >
                      Compare Now
                    </Button>
                  </div>
                  <button
                    onClick={() => setSelectedForCompare([])}
                    className="text-primary-600 hover:text-primary-800"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}

            {/* Products Grid */}
            <ProductGrid
              products={products}
              loading={loading && page === 1}
              viewMode={viewMode}
              selectedForCompare={selectedForCompare}
              onWishlistToggle={handleWishlistToggle}
              onCompareToggle={handleCompareToggle}
              onQuickView={handleQuickView}
            />

            {/* Load More */}
            {hasMoreProducts && (
              <div className="text-center mt-12">
                <Button
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3"
                >
                  {loading ? 'Loading...' : 'Load More Products'}
                </Button>
              </div>
            )}

            {/* No Results */}
            {!loading && products.length === 0 && (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <EyeIcon className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your filters or search terms to find what you're looking for.
                </p>
                <Button
                  onClick={() => handleFiltersChange({})}
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Clear All Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        isOpen={showQuickView}
        onClose={() => {
          setShowQuickView(false);
          setQuickViewProduct(null);
        }}
      />
    </div>
  );
};

export default ProductListPage;