/**
 * 产品网格布局和卡片组件
 */
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { 
  HeartIcon, 
  ShareIcon, 
  EyeIcon,
  ShoppingCartIcon,
  StarIcon,
  MapPinIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { cn } from '@/lib/utils';
import Button from '@/components/ui/Button';
import { Product } from '@/types/product';
import { LocalizedPrice } from '@/components/i18n/LocalizedNumber';

interface ProductCardProps {
  product: Product;
  viewMode: 'grid' | 'list';
  showWishlist?: boolean;
  showCompare?: boolean;
  onWishlistToggle?: (productId: string) => void;
  onCompareToggle?: (productId: string) => void;
  onQuickView?: (product: Product) => void;
  className?: string;
}

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
  viewMode?: 'grid' | 'list';
  showWishlist?: boolean;
  showCompare?: boolean;
  selectedForCompare?: string[];
  onWishlistToggle?: (productId: string) => void;
  onCompareToggle?: (productId: string) => void;
  onQuickView?: (product: Product) => void;
  className?: string;
}

// 产品卡片组件
const ProductCard: React.FC<ProductCardProps> = ({
  product,
  viewMode,
  showWishlist = true,
  showCompare = true,
  onWishlistToggle,
  onCompareToggle,
  onQuickView,
  className
}) => {
  const { t } = useTranslation('products');
  const router = useRouter();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    onWishlistToggle?.(product.id);
  };

  const handleCompareClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onCompareToggle?.(product.id);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onQuickView?.(product);
  };

  const handleCardClick = () => {
    router.push(`/products/${product.slug}`);
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: `${window.location.origin}/products/${product.slug}`,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${window.location.origin}/products/${product.slug}`);
    }
  };

  if (viewMode === 'list') {
    return (
      <div
        className={cn(
          'bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden',
          className
        )}
        onClick={handleCardClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex">
          {/* Image */}
          <div className="relative w-64 h-48 flex-shrink-0">
            <img
              src={product.images.main}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            
            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              {product.featured && (
                <span className="bg-primary-500 text-white px-2 py-1 rounded-md text-xs font-medium">
                  Featured
                </span>
              )}
              {product.isNew && (
                <span className="bg-green-500 text-white px-2 py-1 rounded-md text-xs font-medium">
                  New
                </span>
              )}
              {product.onSale && (
                <span className="bg-red-500 text-white px-2 py-1 rounded-md text-xs font-medium">
                  Sale
                </span>
              )}
            </div>

            {/* Action Buttons */}
            <div className={cn(
              'absolute top-3 right-3 flex flex-col gap-2 transition-opacity duration-200',
              isHovered ? 'opacity-100' : 'opacity-0'
            )}>
              {showWishlist && (
                <button
                  onClick={handleWishlistClick}
                  className="bg-white/90 hover:bg-white p-2 rounded-full shadow-md transition-all duration-200"
                  aria-label="Add to wishlist"
                >
                  {isWishlisted ? (
                    <HeartSolidIcon className="w-4 h-4 text-red-500" />
                  ) : (
                    <HeartIcon className="w-4 h-4 text-gray-600" />
                  )}
                </button>
              )}
              
              <button
                onClick={handleShare}
                className="bg-white/90 hover:bg-white p-2 rounded-full shadow-md transition-all duration-200"
                aria-label="Share product"
              >
                <ShareIcon className="w-4 h-4 text-gray-600" />
              </button>
              
              <button
                onClick={handleQuickView}
                className="bg-white/90 hover:bg-white p-2 rounded-full shadow-md transition-all duration-200"
                aria-label="Quick view"
              >
                <EyeIcon className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2 hover:text-primary-600 transition-colors">
                  {product.name}
                </h3>
                <p className="text-sm text-gray-500 mb-2">{product.model}</p>
                
                {/* Rating */}
                {product.rating && (
                  <div className="flex items-center mb-2">
                    <div className="flex items-center">
                      {Array.from({ length: 5 }, (_, i) => (
                        <StarIcon
                          key={i}
                          className={cn(
                            'w-4 h-4',
                            i < Math.floor(product.rating!) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          )}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600 ml-2">
                      ({product.reviewCount || 0})
                    </span>
                  </div>
                )}
              </div>

              {/* Price */}
              <div className="text-right">
                <div className="text-2xl font-bold text-primary-600">
                  <LocalizedPrice value={product.price.current} currency={product.price.currency} />
                </div>
                {product.price.original && product.price.original > product.price.current && (
                  <div className="text-sm text-gray-500 line-through">
                    <LocalizedPrice value={product.price.original} currency={product.price.currency} />
                  </div>
                )}
              </div>
            </div>

            <p className="text-gray-600 mb-4 line-clamp-2">{product.description}</p>

            {/* Specifications */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <span className="text-sm text-gray-500">Pixel Pitch:</span>
                <span className="text-sm font-medium ml-2">{product.specifications.pixelPitch}</span>
              </div>
              <div>
                <span className="text-sm text-gray-500">Brightness:</span>
                <span className="text-sm font-medium ml-2">{product.specifications.brightness} nits</span>
              </div>
              <div>
                <span className="text-sm text-gray-500">Environment:</span>
                <span className="text-sm font-medium ml-2 capitalize">{product.specifications.environment}</span>
              </div>
              <div>
                <span className="text-sm text-gray-500">Application:</span>
                <span className="text-sm font-medium ml-2">{product.applications[0]}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="bg-primary-600 hover:bg-primary-700 text-white"
                  leftIcon={<ShoppingCartIcon className="w-4 h-4" />}
                >
                  Get Quote
                </Button>
                
                {showCompare && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCompareClick}
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Compare
                  </Button>
                )}
              </div>

              {/* Tags */}
              <div className="flex items-center gap-1">
                {product.tags.slice(0, 2).map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div
      className={cn(
        'bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden group',
        'transform hover:scale-105',
        className
      )}
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={product.images.main}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.featured && (
            <span className="bg-primary-500 text-white px-2 py-1 rounded-md text-xs font-medium">
              Featured
            </span>
          )}
          {product.isNew && (
            <span className="bg-green-500 text-white px-2 py-1 rounded-md text-xs font-medium">
              New
            </span>
          )}
          {product.onSale && (
            <span className="bg-red-500 text-white px-2 py-1 rounded-md text-xs font-medium">
              Sale
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className={cn(
          'absolute top-3 right-3 flex flex-col gap-2 transition-all duration-300',
          isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
        )}>
          {showWishlist && (
            <button
              onClick={handleWishlistClick}
              className="bg-white/90 hover:bg-white p-2 rounded-full shadow-md transition-all duration-200"
              aria-label="Add to wishlist"
            >
              {isWishlisted ? (
                <HeartSolidIcon className="w-4 h-4 text-red-500" />
              ) : (
                <HeartIcon className="w-4 h-4 text-gray-600" />
              )}
            </button>
          )}
          
          <button
            onClick={handleShare}
            className="bg-white/90 hover:bg-white p-2 rounded-full shadow-md transition-all duration-200"
            aria-label="Share product"
          >
            <ShareIcon className="w-4 h-4 text-gray-600" />
          </button>
          
          <button
            onClick={handleQuickView}
            className="bg-white/90 hover:bg-white p-2 rounded-full shadow-md transition-all duration-200"
            aria-label="Quick view"
          >
            <EyeIcon className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Quick Actions Overlay */}
        <div className={cn(
          'absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent transition-all duration-300',
          isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        )}>
          <div className="flex gap-2">
            <Button
              size="sm"
              className="bg-white/90 hover:bg-white text-gray-900 flex-1"
              leftIcon={<ShoppingCartIcon className="w-4 h-4" />}
            >
              Get Quote
            </Button>
            
            {showCompare && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCompareClick}
                className="bg-white/90 hover:bg-white border-white/90 text-gray-900"
              >
                Compare
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="mb-3">
          <h3 className="text-lg font-bold text-gray-900 mb-1 hover:text-primary-600 transition-colors line-clamp-1">
            {product.name}
          </h3>
          <p className="text-sm text-gray-500">{product.model}</p>
        </div>

        {/* Rating */}
        {product.rating && (
          <div className="flex items-center mb-3">
            <div className="flex items-center">
              {Array.from({ length: 5 }, (_, i) => (
                <StarIcon
                  key={i}
                  className={cn(
                    'w-4 h-4',
                    i < Math.floor(product.rating!) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                  )}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600 ml-2">
              ({product.reviewCount || 0})
            </span>
          </div>
        )}

        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>

        {/* Key Specs */}
        <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
          <div>
            <span className="text-gray-500">Pixel:</span>
            <span className="font-medium ml-1">{product.specifications.pixelPitch}</span>
          </div>
          <div>
            <span className="text-gray-500">Brightness:</span>
            <span className="font-medium ml-1">{product.specifications.brightness}</span>
          </div>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-lg font-bold text-primary-600">
              <LocalizedPrice value={product.price.current} currency={product.price.currency} />
            </div>
            {product.price.original && product.price.original > product.price.current && (
              <div className="text-sm text-gray-500 line-through">
                <LocalizedPrice value={product.price.original} currency={product.price.currency} />
              </div>
            )}
          </div>
          
          {/* Environment Badge */}
          <span className={cn(
            'px-2 py-1 rounded-full text-xs font-medium',
            product.specifications.environment === 'indoor' 
              ? 'bg-blue-100 text-blue-700'
              : 'bg-green-100 text-green-700'
          )}>
            {product.specifications.environment}
          </span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {product.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md"
            >
              {tag}
            </span>
          ))}
          {product.tags.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
              +{product.tags.length - 3}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// 产品网格组件
const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  loading = false,
  viewMode = 'grid',
  showWishlist = true,
  showCompare = true,
  selectedForCompare = [],
  onWishlistToggle,
  onCompareToggle,
  onQuickView,
  className
}) => {
  const { t } = useTranslation('products');

  if (loading) {
    return (
      <div className={cn('grid gap-6', className)}>
        {Array.from({ length: 12 }, (_, i) => (
          <div
            key={i}
            className={cn(
              'bg-white rounded-xl shadow-md overflow-hidden animate-pulse',
              viewMode === 'grid' ? 'aspect-[3/4]' : 'h-48'
            )}
          >
            <div className={cn(
              'bg-gray-200',
              viewMode === 'grid' ? 'h-2/3' : 'h-full w-64'
            )} />
            <div className="p-4 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
              <div className="h-3 bg-gray-200 rounded w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <TagIcon className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
        <p className="text-gray-600">
          Try adjusting your filters or search terms to find what you're looking for.
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'grid gap-6',
        viewMode === 'grid' 
          ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
          : 'grid-cols-1',
        className
      )}
    >
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          viewMode={viewMode}
          showWishlist={showWishlist}
          showCompare={showCompare}
          onWishlistToggle={onWishlistToggle}
          onCompareToggle={onCompareToggle}
          onQuickView={onQuickView}
        />
      ))}
    </div>
  );
};

export default ProductGrid;
export { ProductCard };