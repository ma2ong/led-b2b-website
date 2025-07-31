/**
 * 智能产品推荐组件
 */
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import { 
  SparklesIcon,
  CheckIcon,
  XMarkIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Product } from '@/types/product';
import { LocalizedPrice } from '@/components/i18n/LocalizedNumber';

interface ProductRecommendationProps {
  requirements: {
    application?: string;
    pixelPitch?: string;
    screenSize?: {
      width: number;
      height: number;
      unit: string;
    };
    installationEnvironment?: string;
    budgetRange?: string;
    viewingDistance?: {
      min: number;
      max: number;
      unit: string;
    };
  };
  onProductSelect?: (product: Product) => void;
  onClose?: () => void;
  className?: string;
}

interface RecommendationScore {
  product: Product;
  score: number;
  reasons: string[];
  matchedCriteria: string[];
}

const ProductRecommendation: React.FC<ProductRecommendationProps> = ({
  requirements,
  onProductSelect,
  onClose,
  className
}) => {
  const { t } = useTranslation('forms');
  const [recommendations, setRecommendations] = useState<RecommendationScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    generateRecommendations();
  }, [requirements]);

  const generateRecommendations = async () => {
    setLoading(true);
    
    try {
      // 模拟API调用获取产品推荐
      const response = await fetch('/api/products/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requirements),
      });

      if (response.ok) {
        const data = await response.json();
        setRecommendations(data.recommendations || []);
      } else {
        // 如果API不可用，使用模拟推荐逻辑
        const mockRecommendations = generateMockRecommendations();
        setRecommendations(mockRecommendations);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      // 使用模拟推荐逻辑
      const mockRecommendations = generateMockRecommendations();
      setRecommendations(mockRecommendations);
    } finally {
      setLoading(false);
    }
  };

  const generateMockRecommendations = (): RecommendationScore[] => {
    // 模拟产品数据
    const mockProducts: Product[] = [
      {
        id: 'led-p2-5-indoor',
        name: 'LED Display P2.5 Indoor',
        slug: 'led-display-p2-5-indoor',
        description: 'High-resolution indoor LED display perfect for conference rooms and retail spaces',
        category: 'indoor-fixed',
        specifications: [
          { name: 'Pixel Pitch', value: 'P2.5', unit: '' },
          { name: 'Brightness', value: '1200', unit: 'nits' },
          { name: 'Refresh Rate', value: '3840', unit: 'Hz' },
          { name: 'Viewing Angle', value: '160°/160°', unit: '' },
        ],
        pricing: {
          basePrice: 1500,
          currency: 'USD',
          unit: 'per panel',
          showPrice: true,
        },
        images: [
          { url: '/images/products/led-p2-5-indoor.jpg', alt: 'LED P2.5 Indoor Display' }
        ],
        features: ['High Resolution', 'Energy Efficient', 'Easy Installation'],
        applications: ['Conference Room', 'Retail Store', 'Corporate Lobby'],
        tags: ['indoor', 'high-resolution', 'commercial'],
        isNew: false,
        isFeatured: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'led-p4-outdoor',
        name: 'LED Display P4 Outdoor',
        slug: 'led-display-p4-outdoor',
        description: 'Weather-resistant outdoor LED display with high brightness',
        category: 'outdoor-advertising',
        specifications: [
          { name: 'Pixel Pitch', value: 'P4', unit: '' },
          { name: 'Brightness', value: '6000', unit: 'nits' },
          { name: 'Refresh Rate', value: '3840', unit: 'Hz' },
          { name: 'IP Rating', value: 'IP65', unit: '' },
        ],
        pricing: {
          basePrice: 2500,
          currency: 'USD',
          unit: 'per panel',
          showPrice: true,
        },
        images: [
          { url: '/images/products/led-p4-outdoor.jpg', alt: 'LED P4 Outdoor Display' }
        ],
        features: ['Weather Resistant', 'High Brightness', 'Durable'],
        applications: ['Outdoor Advertising', 'Sports Stadium', 'Transportation'],
        tags: ['outdoor', 'weather-resistant', 'high-brightness'],
        isNew: true,
        isFeatured: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    // 计算推荐分数
    return mockProducts.map(product => {
      let score = 0;
      const reasons: string[] = [];
      const matchedCriteria: string[] = [];

      // 应用场景匹配
      if (requirements.application && product.applications.some(app => 
        app.toLowerCase().includes(requirements.application!.toLowerCase())
      )) {
        score += 30;
        reasons.push(t('matchesApplication', { application: requirements.application }));
        matchedCriteria.push(t('application'));
      }

      // 像素间距匹配
      if (requirements.pixelPitch) {
        const productPitch = product.specifications.find(spec => spec.name === 'Pixel Pitch')?.value;
        if (productPitch === requirements.pixelPitch) {
          score += 25;
          reasons.push(t('exactPixelPitchMatch'));
          matchedCriteria.push(t('pixelPitch'));
        }
      }

      // 安装环境匹配
      if (requirements.installationEnvironment) {
        const isIndoor = requirements.installationEnvironment === 'indoor';
        const isOutdoor = requirements.installationEnvironment === 'outdoor';
        
        if ((isIndoor && product.category === 'indoor-fixed') ||
            (isOutdoor && product.category === 'outdoor-advertising')) {
          score += 20;
          reasons.push(t('suitableForEnvironment', { environment: requirements.installationEnvironment }));
          matchedCriteria.push(t('environment'));
        }
      }

      // 预算匹配（简化逻辑）
      if (requirements.budgetRange) {
        const budgetScore = calculateBudgetScore(requirements.budgetRange, product.pricing.basePrice);
        score += budgetScore;
        if (budgetScore > 0) {
          reasons.push(t('fitsWithinBudget'));
          matchedCriteria.push(t('budget'));
        }
      }

      // 观看距离匹配（简化逻辑）
      if (requirements.viewingDistance) {
        const distanceScore = calculateViewingDistanceScore(requirements.viewingDistance, product);
        score += distanceScore;
        if (distanceScore > 0) {
          reasons.push(t('optimalViewingDistance'));
          matchedCriteria.push(t('viewingDistance'));
        }
      }

      return {
        product,
        score: Math.min(score, 100),
        reasons,
        matchedCriteria,
      };
    }).sort((a, b) => b.score - a.score);
  };

  const calculateBudgetScore = (budgetRange: string, productPrice: number): number => {
    const budgetRanges: { [key: string]: { min: number; max: number } } = {
      'under_10k': { min: 0, max: 10000 },
      '10k_to_50k': { min: 10000, max: 50000 },
      '50k_to_100k': { min: 50000, max: 100000 },
      '100k_to_500k': { min: 100000, max: 500000 },
      'over_500k': { min: 500000, max: Infinity },
    };

    const range = budgetRanges[budgetRange];
    if (range && productPrice >= range.min && productPrice <= range.max) {
      return 15;
    }
    return 0;
  };

  const calculateViewingDistanceScore = (
    viewingDistance: { min: number; max: number; unit: string },
    product: Product
  ): number => {
    // 简化的观看距离计算逻辑
    const pixelPitchSpec = product.specifications.find(spec => spec.name === 'Pixel Pitch');
    if (!pixelPitchSpec) return 0;

    const pitch = parseFloat(pixelPitchSpec.value.replace('P', ''));
    const optimalDistance = pitch * 1000; // 简化计算

    const avgDistance = (viewingDistance.min + viewingDistance.max) / 2;
    const distanceInMm = viewingDistance.unit === 'm' ? avgDistance * 1000 : avgDistance * 304.8;

    if (Math.abs(distanceInMm - optimalDistance) < optimalDistance * 0.5) {
      return 10;
    }
    return 0;
  };

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    onProductSelect?.(product);
  };

  if (loading) {
    return (
      <div className={cn('bg-white rounded-lg shadow-lg p-6', className)}>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <span className="ml-3 text-gray-600">{t('generatingRecommendations')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('bg-white rounded-lg shadow-lg overflow-hidden', className)}>
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <SparklesIcon className="w-6 h-6 text-white mr-2" />
            <h3 className="text-lg font-semibold text-white">
              {t('smartProductRecommendations')}
            </h3>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          )}
        </div>
        <p className="text-primary-100 text-sm mt-1">
          {t('recommendationsBasedOnRequirements')}
        </p>
      </div>

      {/* Recommendations */}
      <div className="p-6">
        {recommendations.length === 0 ? (
          <div className="text-center py-8">
            <InformationCircleIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              {t('noRecommendationsFound')}
            </h4>
            <p className="text-gray-600">
              {t('noRecommendationsDesc')}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {recommendations.slice(0, 3).map((recommendation, index) => (
              <div
                key={recommendation.product.id}
                className={cn(
                  'border rounded-lg p-4 transition-all duration-200',
                  selectedProduct?.id === recommendation.product.id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300',
                  index === 0 && 'ring-2 ring-primary-500 ring-opacity-20'
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h4 className="text-lg font-semibold text-gray-900">
                        {recommendation.product.name}
                      </h4>
                      {index === 0 && (
                        <span className="ml-2 bg-primary-100 text-primary-800 text-xs font-medium px-2 py-1 rounded-full">
                          {t('bestMatch')}
                        </span>
                      )}
                      <div className="ml-auto flex items-center">
                        <span className="text-sm font-medium text-gray-600 mr-2">
                          {t('matchScore')}:
                        </span>
                        <span className="text-lg font-bold text-primary-600">
                          {recommendation.score}%
                        </span>
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm mb-3">
                      {recommendation.product.description}
                    </p>

                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <span className="text-sm font-medium text-gray-700">
                          {t('price')}:
                        </span>
                        <div className="text-lg font-semibold text-primary-600">
                          <LocalizedPrice
                            value={recommendation.product.pricing.basePrice}
                            currency={recommendation.product.pricing.currency}
                          />
                          <span className="text-sm text-gray-500 ml-1">
                            {recommendation.product.pricing.unit}
                          </span>
                        </div>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">
                          {t('keyFeatures')}:
                        </span>
                        <div className="text-sm text-gray-600">
                          {recommendation.product.features.slice(0, 2).join(', ')}
                        </div>
                      </div>
                    </div>

                    {recommendation.matchedCriteria.length > 0 && (
                      <div className="mb-3">
                        <span className="text-sm font-medium text-gray-700 mb-1 block">
                          {t('matchedCriteria')}:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {recommendation.matchedCriteria.map((criteria, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full"
                            >
                              <CheckIcon className="w-3 h-3 mr-1" />
                              {criteria}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {recommendation.reasons.length > 0 && (
                      <div className="mb-4">
                        <span className="text-sm font-medium text-gray-700 mb-1 block">
                          {t('whyRecommended')}:
                        </span>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {recommendation.reasons.map((reason, idx) => (
                            <li key={idx} className="flex items-start">
                              <span className="text-primary-500 mr-2">•</span>
                              {reason}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleProductSelect(recommendation.product)}
                        className={cn(
                          selectedProduct?.id === recommendation.product.id
                            ? 'bg-primary-600 text-white'
                            : 'bg-primary-600 hover:bg-primary-700 text-white'
                        )}
                      >
                        {selectedProduct?.id === recommendation.product.id
                          ? t('selected')
                          : t('selectProduct')
                        }
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        href={`/products/${recommendation.product.slug}`}
                        target="_blank"
                      >
                        {t('viewDetails')}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductRecommendation;