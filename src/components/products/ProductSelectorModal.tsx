/**
 * 产品选择器模态框组件
 */
import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'next-i18next';
import { 
  XMarkIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CheckIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import Button from '@/components/ui/Button';
import { Product, ProductCategory } from '@/types/product';
import { useProductComparison } from '@/hooks/useProductComparison';
import { LocalizedPrice } from '@/components/i18n/LocalizedNumber';

interface ProductSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  categories: ProductCategory[];
  onProductAdd?: (product: Product) => void;
  className?: string;
}

const ProductSelectorModal: React.FC<ProductSelectorModalProps> = ({
  isOpen,
  onClose,
  products,
  categories,
  onProductAdd,
  className
}) => {
  const { t } = useTranslation('products');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'rating'>('name');
  
  const {
    comparisonProducts,
    isInComparison,
    addToComparison,
    canAddMore
  } = useProductComparison();

  // 重置状态当模态框关闭时
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setSelectedCategory('');
      setShowFilters(false);
    }
  }, [isOpen]);

  // 过滤和排序产品
  const filteredProducts = useMemo(() => {
    let filtered = products.filter(product => {
      // 排除已在对比列表中的产品
      if (isInComparison(product.id)) {
        return false;
      }

      // 搜索过滤
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          product.name.toLowerCase().includes(query) ||
          product.model.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query) ||
          product.tags.some(tag => tag.toLowerCase().includes(query));
        
        if (!matchesSearch) return false;
      }

      // 分类过滤
      if (selectedCategory && product.category !== selectedCategory) {
        return false;
      }

      return true;
    });

    // 排序
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price':
          return a.price.current - b.price.current;
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [products, searchQuery, selectedCategory, sortBy, isInComparison]);

  const handleProductAdd = (product: Product) => {
    const success = addToComparison(product);
    if (success) {
      onProductAdd?.(product);
      // 如果已达到最大数量，关闭模态框
      if (!canAddMore) {
        onClose();
      }
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className={cn(
          'relative bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden',
          className
        )}>
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {t('addProductToComparison')}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {t('comparisonCount', { 
                  current: comparisonProducts.length, 
                  max: 3 
                })}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Search and Filters */}
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('searchProducts')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">{t('allCategories')}</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'price' | 'rating')}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="name">{t('sortByName')}</option>
                <option value="price">{t('sortByPrice')}</option>
                <option value="rating">{t('sortByRating')}</option>
              </select>

              {/* Clear Filters */}
              {(searchQuery || selectedCategory) && (
                <Button
                  variant="outline"
                  onClick={handleClearFilters}
                  className="border-gray-300"
                >
                  {t('clearFilters')}
                </Button>
              )}
            </div>
          </div>

          {/* Product List */}
          <div className="flex-1 overflow-y-auto max-h-96">
            {filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <MagnifyingGlassIcon className="w-12 h-12 mb-4" />
                <h3 className="text-lg font-medium mb-2">{t('noProductsFound')}</h3>
                <p className="text-sm">{t('tryAdjustingFilters')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                  >
                    {/* Product Image */}
                    <div className="aspect-square relative">
                      <img
                        src={product.images.main}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Badges */}
                      <div className="absolute top-2 left-2 flex flex-col gap-1">
                        {product.featured && (
                          <span className="bg-primary-500 text-white px-2 py-1 rounded text-xs font-medium">
                            {t('featured')}
                          </span>
                        )}
                        {product.isNew && (
                          <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
                            {t('new')}
                          </span>
                        )}
                      </div>

                      {/* Add Button */}
                      <button
                        onClick={() => handleProductAdd(product)}
                        disabled={!canAddMore}
                        className={cn(
                          'absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-colors',
                          canAddMore
                            ? 'bg-primary-600 hover:bg-primary-700 text-white'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        )}
                        title={canAddMore ? t('addToComparison') : t('comparisonFull')}
                      >
                        <PlusIcon className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Product Info */}
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">{product.model}</p>
                      
                      {/* Key Specs */}
                      <div className="text-xs text-gray-500 mb-3">
                        <div className="flex justify-between">
                          <span>{t('pixelPitch')}</span>
                          <span>{product.specifications.pixelPitch}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{t('brightness')}</span>
                          <span>{product.specifications.brightness} nits</span>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-lg font-bold text-primary-600">
                            <LocalizedPrice 
                              value={product.price.current} 
                              currency={product.price.currency}
                            />
                          </div>
                          {product.price.original && product.price.original > product.price.current && (
                            <div className="text-sm text-gray-500 line-through">
                              <LocalizedPrice 
                                value={product.price.original} 
                                currency={product.price.currency}
                              />
                            </div>
                          )}
                        </div>

                        {/* Rating */}
                        {product.rating && (
                          <div className="flex items-center text-sm text-gray-600">
                            <span className="text-yellow-400 mr-1">★</span>
                            <span>{product.rating}</span>
                          </div>
                        )}
                      </div>

                      {/* Add Button */}
                      <Button
                        onClick={() => handleProductAdd(product)}
                        disabled={!canAddMore}
                        className={cn(
                          'w-full mt-3',
                          canAddMore
                            ? 'bg-primary-600 hover:bg-primary-700 text-white'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        )}
                        leftIcon={<PlusIcon className="w-4 h-4" />}
                      >
                        {canAddMore ? t('addToComparison') : t('comparisonFull')}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-600">
              {t('showingProducts', { count: filteredProducts.length })}
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="border-gray-300"
              >
                {t('cancel')}
              </Button>
              <Button
                onClick={onClose}
                className="bg-primary-600 hover:bg-primary-700 text-white"
                disabled={comparisonProducts.length === 0}
              >
                {t('done')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductSelectorModal;