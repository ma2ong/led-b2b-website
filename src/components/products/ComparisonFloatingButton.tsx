/**
 * 产品对比浮动按钮组件
 */
import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { 
  ArrowsRightLeftIcon,
  XMarkIcon,
  EyeIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import Button from '@/components/ui/Button';
import { useProductComparison } from '@/hooks/useProductComparison';
import { LocalizedPrice } from '@/components/i18n/LocalizedNumber';

interface ComparisonFloatingButtonProps {
  className?: string;
}

const ComparisonFloatingButton: React.FC<ComparisonFloatingButtonProps> = ({
  className
}) => {
  const { t } = useTranslation('products');
  const [isExpanded, setIsExpanded] = useState(false);
  const {
    comparisonProducts,
    comparisonCount,
    removeFromComparison,
    clearComparison,
    goToComparison,
    isComparisonEmpty
  } = useProductComparison();

  if (isComparisonEmpty) {
    return null;
  }

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const handleCompare = () => {
    goToComparison();
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    clearComparison();
    setIsExpanded(false);
  };

  const handleRemoveProduct = (e: React.MouseEvent, productId: string) => {
    e.stopPropagation();
    removeFromComparison(productId);
  };

  return (
    <div className={cn(
      'fixed bottom-6 right-6 z-50 transition-all duration-300',
      className
    )}>
      {/* Expanded Panel */}
      {isExpanded && (
        <div className="mb-4 bg-white rounded-lg shadow-xl border border-gray-200 w-80 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
            <h3 className="font-semibold text-gray-900">
              {t('compareProducts')} ({comparisonCount})
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={handleClear}
                className="text-gray-400 hover:text-red-500 transition-colors"
                title={t('clearAll')}
              >
                <TrashIcon className="w-4 h-4" />
              </button>
              <button
                onClick={toggleExpanded}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                title={t('close')}
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Product List */}
          <div className="max-h-64 overflow-y-auto">
            {comparisonProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center p-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
              >
                {/* Product Image */}
                <div className="w-12 h-12 flex-shrink-0 mr-3">
                  <img
                    src={product.images.main}
                    alt={product.name}
                    className="w-full h-full object-cover rounded"
                  />
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 truncate">
                    {product.name}
                  </h4>
                  <p className="text-xs text-gray-500 truncate">
                    {product.model}
                  </p>
                  <div className="text-sm font-semibold text-primary-600">
                    <LocalizedPrice 
                      value={product.price.current} 
                      currency={product.price.currency}
                    />
                  </div>
                </div>

                {/* Remove Button */}
                <button
                  onClick={(e) => handleRemoveProduct(e, product.id)}
                  className="ml-2 text-gray-400 hover:text-red-500 transition-colors"
                  title={t('removeFromComparison')}
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex gap-2">
              <Button
                onClick={handleCompare}
                className="flex-1 bg-primary-600 hover:bg-primary-700 text-white"
                leftIcon={<EyeIcon className="w-4 h-4" />}
              >
                {t('compare')}
              </Button>
              <Button
                onClick={handleClear}
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
                leftIcon={<TrashIcon className="w-4 h-4" />}
              >
                {t('clear')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={toggleExpanded}
        className={cn(
          'bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center',
          isExpanded ? 'px-4 py-3' : 'w-14 h-14 justify-center'
        )}
        title={t('viewComparison')}
      >
        <ArrowsRightLeftIcon className="w-6 h-6" />
        
        {!isExpanded && (
          <>
            {/* Badge */}
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
              {comparisonCount}
            </div>
            
            {/* Pulse Animation */}
            <div className="absolute inset-0 rounded-full bg-primary-600 animate-ping opacity-20"></div>
          </>
        )}
        
        {isExpanded && (
          <span className="ml-2 font-medium">
            {t('compare')} ({comparisonCount})
          </span>
        )}
      </button>
    </div>
  );
};

export default ComparisonFloatingButton;