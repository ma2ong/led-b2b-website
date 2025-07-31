/**
 * 产品对比功能组件
 */
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { 
  XMarkIcon,
  ArrowsRightLeftIcon,
  DocumentArrowDownIcon,
  ShareIcon,
  PrinterIcon,
  PlusIcon,
  CheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import Button from '@/components/ui/Button';
import { Product } from '@/types/product';
import { LocalizedPrice } from '@/components/i18n/LocalizedNumber';
import SEOHead from '@/components/seo/SEOHead';

interface ProductComparisonProps {
  products: Product[];
  onRemoveProduct?: (productId: string) => void;
  onAddProduct?: () => void;
  className?: string;
}

interface ComparisonRow {
  category: string;
  items: {
    key: string;
    label: string;
    getValue: (product: Product) => string | number | boolean;
    format?: (value: any) => string;
    highlight?: boolean;
  }[];
}

// 对比数据结构定义
const comparisonRows: ComparisonRow[] = [
  {
    category: 'Basic Information',
    items: [
      {
        key: 'name',
        label: 'Product Name',
        getValue: (product) => product.name
      },
      {
        key: 'model',
        label: 'Model',
        getValue: (product) => product.model
      },
      {
        key: 'category',
        label: 'Category',
        getValue: (product) => product.category,
        format: (value) => value.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
      },
      {
        key: 'environment',
        label: 'Environment',
        getValue: (product) => product.specifications.environment,
        format: (value) => value.charAt(0).toUpperCase() + value.slice(1)
      }
    ]
  },
  {
    category: 'Display Specifications',
    items: [
      {
        key: 'pixelPitch',
        label: 'Pixel Pitch',
        getValue: (product) => product.specifications.pixelPitch,
        highlight: true
      },
      {
        key: 'resolution',
        label: 'Resolution',
        getValue: (product) => `${product.specifications.resolution.width} × ${product.specifications.resolution.height}`,
        highlight: true
      },
      {
        key: 'brightness',
        label: 'Brightness',
        getValue: (product) => product.specifications.brightness,
        format: (value) => `${value} nits`,
        highlight: true
      },
      {
        key: 'refreshRate',
        label: 'Refresh Rate',
        getValue: (product) => product.specifications.refreshRate,
        format: (value) => `${value} Hz`,
        highlight: true
      },
      {
        key: 'colorDepth',
        label: 'Color Depth',
        getValue: (product) => product.specifications.colorDepth,
        format: (value) => `${value} bit`
      },
      {
        key: 'viewingAngle',
        label: 'Viewing Angle',
        getValue: (product) => product.specifications.viewingAngle
      }
    ]
  },
  {
    category: 'Physical Specifications',
    items: [
      {
        key: 'dimensions',
        label: 'Dimensions (W×H×D)',
        getValue: (product) => `${product.specifications.dimensions.width} × ${product.specifications.dimensions.height} × ${product.specifications.dimensions.depth} ${product.specifications.dimensions.unit}`
      },
      {
        key: 'weight',
        label: 'Weight',
        getValue: (product) => product.specifications.weight,
        format: (value) => `${value} kg`
      },
      {
        key: 'ipRating',
        label: 'IP Rating',
        getValue: (product) => product.specifications.ipRating
      },
      {
        key: 'operatingTemperature',
        label: 'Operating Temperature',
        getValue: (product) => product.specifications.operatingTemperature
      }
    ]
  },
  {
    category: 'Performance',
    items: [
      {
        key: 'powerConsumption',
        label: 'Power Consumption',
        getValue: (product) => product.specifications.powerConsumption,
        format: (value) => `${value} W/m²`,
        highlight: true
      }
    ]
  },
  {
    category: 'Pricing & Availability',
    items: [
      {
        key: 'price',
        label: 'Price',
        getValue: (product) => product.price.current,
        format: (value, product) => `$${value.toLocaleString()} ${product?.price.unit || ''}`,
        highlight: true
      },
      {
        key: 'originalPrice',
        label: 'Original Price',
        getValue: (product) => product.price.original || product.price.current,
        format: (value, product) => product?.price.original ? `$${value.toLocaleString()} ${product.price.unit || ''}` : 'N/A'
      },
      {
        key: 'availability',
        label: 'Availability',
        getValue: (product) => product.availability.inStock,
        format: (value) => value ? 'In Stock' : 'Out of Stock'
      },
      {
        key: 'leadTime',
        label: 'Lead Time',
        getValue: (product) => product.availability.leadTime
      },
      {
        key: 'moq',
        label: 'MOQ',
        getValue: (product) => product.availability.moq,
        format: (value) => `${value} units`
      }
    ]
  },
  {
    category: 'Features & Applications',
    items: [
      {
        key: 'features',
        label: 'Key Features',
        getValue: (product) => product.features.join(', ')
      },
      {
        key: 'applications',
        label: 'Applications',
        getValue: (product) => product.applications.join(', ')
      },
      {
        key: 'tags',
        label: 'Tags',
        getValue: (product) => product.tags.join(', ')
      }
    ]
  },
  {
    category: 'Ratings & Reviews',
    items: [
      {
        key: 'rating',
        label: 'Rating',
        getValue: (product) => product.rating || 0,
        format: (value) => value ? `${value}/5` : 'No rating'
      },
      {
        key: 'reviewCount',
        label: 'Reviews',
        getValue: (product) => product.reviewCount || 0,
        format: (value) => `${value} reviews`
      }
    ]
  }
];

// 产品卡片组件
const ProductCard: React.FC<{
  product: Product;
  onRemove: () => void;
  showRemove: boolean;
}> = ({ product, onRemove, showRemove }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Product Image */}
      <div className="relative aspect-square">
        <img
          src={product.images.main}
          alt={product.name}
          className="w-full h-full object-cover"
        />
        {showRemove && (
          <button
            onClick={onRemove}
            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full transition-colors"
            aria-label="Remove product"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        )}
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.featured && (
            <span className="bg-primary-500 text-white px-2 py-1 rounded text-xs font-medium">
              Featured
            </span>
          )}
          {product.isNew && (
            <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
              New
            </span>
          )}
          {product.onSale && (
            <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
              Sale
            </span>
          )}
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="font-bold text-gray-900 mb-1 line-clamp-2">{product.name}</h3>
        <p className="text-sm text-gray-600 mb-2">{product.model}</p>
        <div className="text-lg font-bold text-primary-600">
          <LocalizedPrice value={product.price.current} currency={product.price.currency} />
        </div>
        {product.price.original && product.price.original > product.price.current && (
          <div className="text-sm text-gray-500 line-through">
            <LocalizedPrice value={product.price.original} currency={product.price.currency} />
          </div>
        )}
      </div>
    </div>
  );
};

// 添加产品占位符
const AddProductPlaceholder: React.FC<{
  onAdd: () => void;
}> = ({ onAdd }) => {
  return (
    <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center aspect-square hover:border-primary-300 hover:bg-primary-50 transition-colors cursor-pointer">
      <button
        onClick={onAdd}
        className="flex flex-col items-center justify-center p-8 text-gray-500 hover:text-primary-600 transition-colors"
      >
        <PlusIcon className="w-12 h-12 mb-2" />
        <span className="text-sm font-medium">Add Product</span>
        <span className="text-xs text-gray-400">Compare up to 3 products</span>
      </button>
    </div>
  );
};

const ProductComparison: React.FC<ProductComparisonProps> = ({
  products,
  onRemoveProduct,
  onAddProduct,
  className
}) => {
  const { t } = useTranslation('products');
  const router = useRouter();
  const [stickyHeader, setStickyHeader] = useState(false);
  const [highlightDifferences, setHighlightDifferences] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);

  // Handle sticky header
  useEffect(() => {
    const handleScroll = () => {
      if (tableRef.current) {
        const rect = tableRef.current.getBoundingClientRect();
        setStickyHeader(rect.top <= 0);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 获取对比值并检查差异
  const getComparisonValue = (item: ComparisonRow['items'][0], product: Product) => {
    const value = item.getValue(product);
    if (item.format) {
      return item.format(value, product);
    }
    return String(value);
  };

  const hasDifferences = (item: ComparisonRow['items'][0]) => {
    if (products.length < 2) return false;
    const values = products.map(product => getComparisonValue(item, product));
    return new Set(values).size > 1;
  };

  const getBestValue = (item: ComparisonRow['items'][0]) => {
    if (!item.highlight || products.length < 2) return null;
    
    const values = products.map(product => {
      const rawValue = item.getValue(product);
      return { product, value: rawValue };
    });

    // 根据不同的指标确定最佳值
    switch (item.key) {
      case 'brightness':
      case 'refreshRate':
        return Math.max(...values.map(v => Number(v.value)));
      case 'price':
      case 'powerConsumption':
        return Math.min(...values.map(v => Number(v.value)));
      default:
        return null;
    }
  };

  const isHighlightedValue = (item: ComparisonRow['items'][0], product: Product) => {
    if (!item.highlight || !highlightDifferences) return false;
    const bestValue = getBestValue(item);
    if (bestValue === null) return false;
    return Number(item.getValue(product)) === bestValue;
  };

  const handleShare = async () => {
    const productNames = products.map(p => p.name).join(' vs ');
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Product Comparison: ${productNames}`,
          text: `Compare ${productNames} specifications and features`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    // 生成CSV格式的对比数据
    const csvData = [];
    csvData.push(['Specification', ...products.map(p => p.name)]);
    
    comparisonRows.forEach(category => {
      csvData.push([category.category, ...Array(products.length).fill('')]);
      category.items.forEach(item => {
        csvData.push([
          item.label,
          ...products.map(product => getComparisonValue(item, product))
        ]);
      });
    });

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `product-comparison-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (products.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ArrowsRightLeftIcon className="w-24 h-24 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Products to Compare</h2>
          <p className="text-gray-600 mb-6">Add products to start comparing their features and specifications.</p>
          <Button
            onClick={() => router.push('/products')}
            className="bg-primary-600 hover:bg-primary-700 text-white"
          >
            Browse Products
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title={`Product Comparison: ${products.map(p => p.name).join(' vs ')}`}
        description={`Compare ${products.map(p => p.name).join(', ')} specifications, features, and pricing`}
        keywords={products.flatMap(p => p.tags).join(', ')}
      />
      
      <div className={cn('min-h-screen bg-gray-50', className)}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Product Comparison</h1>
              <p className="text-gray-600">
                Comparing {products.length} product{products.length > 1 ? 's' : ''}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="highlight-differences"
                  checked={highlightDifferences}
                  onChange={(e) => setHighlightDifferences(e.target.checked)}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <label htmlFor="highlight-differences" className="ml-2 text-sm text-gray-700">
                  Highlight best values
                </label>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  leftIcon={<ShareIcon className="w-4 h-4" />}
                  className="border-gray-300"
                >
                  Share
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrint}
                  leftIcon={<PrinterIcon className="w-4 h-4" />}
                  className="border-gray-300"
                >
                  Print
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExport}
                  leftIcon={<DocumentArrowDownIcon className="w-4 h-4" />}
                  className="border-gray-300"
                >
                  Export CSV
                </Button>
              </div>
            </div>
          </div>

          {/* Product Cards Header */}
          <div className={cn(
            'grid gap-6 mb-8 transition-all duration-200',
            products.length === 1 ? 'grid-cols-1 max-w-md' :
            products.length === 2 ? 'grid-cols-2' : 'grid-cols-3'
          )}>
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onRemove={() => onRemoveProduct?.(product.id)}
                showRemove={products.length > 1}
              />
            ))}
            
            {products.length < 3 && onAddProduct && (
              <AddProductPlaceholder onAdd={onAddProduct} />
            )}
          </div>

          {/* Comparison Table */}
          <div ref={tableRef} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Sticky Header */}
            <div className={cn(
              'transition-all duration-200',
              stickyHeader ? 'fixed top-0 left-0 right-0 z-40 shadow-lg' : ''
            )}>
              {stickyHeader && (
                <div className="bg-white border-b border-gray-200 px-6 py-4">
                  <div className="container mx-auto flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Product Comparison</h2>
                    <div className="flex items-center gap-2">
                      {products.map((product, index) => (
                        <div key={product.id} className="flex items-center">
                          <img
                            src={product.images.main}
                            alt={product.name}
                            className="w-8 h-8 rounded object-cover"
                          />
                          <span className="ml-2 text-sm font-medium text-gray-700 truncate max-w-32">
                            {product.name}
                          </span>
                          {index < products.length - 1 && (
                            <span className="mx-2 text-gray-400">vs</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Table Content */}
            <div className={cn(stickyHeader ? 'mt-20' : '')}>
              {comparisonRows.map((category, categoryIndex) => (
                <div key={category.category}>
                  {/* Category Header */}
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">{category.category}</h3>
                  </div>

                  {/* Category Rows */}
                  {category.items.map((item, itemIndex) => (
                    <div
                      key={item.key}
                      className={cn(
                        'grid gap-6 px-6 py-4 border-b border-gray-100 last:border-b-0',
                        products.length === 1 ? 'grid-cols-2' :
                        products.length === 2 ? 'grid-cols-3' : 'grid-cols-4',
                        itemIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      )}
                    >
                      {/* Specification Label */}
                      <div className="flex items-center">
                        <span className="font-medium text-gray-900">{item.label}</span>
                        {hasDifferences(item) && highlightDifferences && (
                          <ExclamationTriangleIcon className="w-4 h-4 text-amber-500 ml-2" />
                        )}
                      </div>

                      {/* Product Values */}
                      {products.map((product) => (
                        <div
                          key={product.id}
                          className={cn(
                            'flex items-center',
                            isHighlightedValue(item, product) && 'bg-green-100 px-2 py-1 rounded'
                          )}
                        >
                          <span className={cn(
                            'text-gray-700',
                            isHighlightedValue(item, product) && 'font-semibold text-green-800'
                          )}>
                            {getComparisonValue(item, product)}
                          </span>
                          {isHighlightedValue(item, product) && (
                            <CheckIcon className="w-4 h-4 text-green-600 ml-2" />
                          )}
                        </div>
                      ))}

                      {/* Add Product Placeholder Column */}
                      {products.length < 3 && (
                        <div className="flex items-center text-gray-400">
                          <span className="text-sm">-</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            {products.map((product) => (
              <Button
                key={product.id}
                href={`/products/${product.slug}`}
                className="bg-primary-600 hover:bg-primary-700 text-white"
              >
                View {product.name}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductComparison;