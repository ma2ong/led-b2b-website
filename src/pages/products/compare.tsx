/**
 * 产品对比页面
 */
import React, { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { Product, ProductCategory } from '@/types/product';
import { ProductApi } from '@/lib/api/products';
import { useProductComparison } from '@/hooks/useProductComparison';
import ProductComparison from '@/components/products/ProductComparison';
import ProductSelectorModal from '@/components/products/ProductSelectorModal';
import ComparisonFloatingButton from '@/components/products/ComparisonFloatingButton';
import Button from '@/components/ui/Button';
import { PlusIcon } from '@heroicons/react/24/outline';

interface ComparePageProps {
  initialProducts: Product[];
  allProducts: Product[];
  categories: ProductCategory[];
}

const ComparePage: React.FC<ComparePageProps> = ({
  initialProducts,
  allProducts,
  categories
}) => {
  const { t } = useTranslation('products');
  const router = useRouter();
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [comparisonProducts, setComparisonProducts] = useState<Product[]>(initialProducts);
  
  const {
    addToComparison,
    removeFromComparison,
    clearComparison,
    canAddMore
  } = useProductComparison();

  // 同步URL参数和对比产品
  useEffect(() => {
    const { products: productIds } = router.query;
    if (typeof productIds === 'string' && productIds) {
      const ids = productIds.split(',');
      const matchedProducts = allProducts.filter(product => 
        ids.includes(product.id)
      );
      setComparisonProducts(matchedProducts);
    }
  }, [router.query, allProducts]);

  // 更新URL当产品列表变化时
  const updateUrl = (products: Product[]) => {
    if (products.length === 0) {
      router.replace('/products/compare', undefined, { shallow: true });
    } else {
      const productIds = products.map(p => p.id).join(',');
      router.replace(`/products/compare?products=${productIds}`, undefined, { shallow: true });
    }
  };

  const handleRemoveProduct = (productId: string) => {
    const newProducts = comparisonProducts.filter(p => p.id !== productId);
    setComparisonProducts(newProducts);
    removeFromComparison(productId);
    updateUrl(newProducts);
  };

  const handleAddProduct = () => {
    setShowProductSelector(true);
  };

  const handleProductAdded = (product: Product) => {
    const newProducts = [...comparisonProducts, product];
    setComparisonProducts(newProducts);
    updateUrl(newProducts);
  };

  const handleClearAll = () => {
    setComparisonProducts([]);
    clearComparison();
    updateUrl([]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <ProductComparison
        products={comparisonProducts}
        onRemoveProduct={handleRemoveProduct}
        onAddProduct={canAddMore ? handleAddProduct : undefined}
      />

      {/* Product Selector Modal */}
      <ProductSelectorModal
        isOpen={showProductSelector}
        onClose={() => setShowProductSelector(false)}
        products={allProducts}
        categories={categories}
        onProductAdd={handleProductAdded}
      />

      {/* Floating Comparison Button (hidden on comparison page) */}
      {comparisonProducts.length === 0 && (
        <ComparisonFloatingButton />
      )}

      {/* Empty State Actions */}
      {comparisonProducts.length === 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2">
          <Button
            onClick={() => router.push('/products')}
            className="bg-primary-600 hover:bg-primary-700 text-white shadow-lg"
            leftIcon={<PlusIcon className="w-5 h-5" />}
          >
            {t('browseProducts')}
          </Button>
        </div>
      )}
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ 
  locale, 
  query 
}) => {
  try {
    // 获取所有产品和分类
    const [allProducts, categories] = await Promise.all([
      ProductApi.getProducts({ limit: 1000 }), // 获取所有产品用于选择器
      ProductApi.getCategories()
    ]);

    // 解析URL中的产品ID
    let initialProducts: Product[] = [];
    if (query.products && typeof query.products === 'string') {
      const productIds = query.products.split(',');
      initialProducts = allProducts.filter(product => 
        productIds.includes(product.id)
      ).slice(0, 3); // 最多3个产品
    }

    return {
      props: {
        initialProducts,
        allProducts,
        categories,
        ...(await serverSideTranslations(locale ?? 'en', [
          'common',
          'products',
          'forms'
        ])),
      },
    };
  } catch (error) {
    console.error('Error fetching comparison data:', error);
    
    return {
      props: {
        initialProducts: [],
        allProducts: [],
        categories: [],
        ...(await serverSideTranslations(locale ?? 'en', [
          'common',
          'products',
          'forms'
        ])),
      },
    };
  }
};

export default ComparePage;