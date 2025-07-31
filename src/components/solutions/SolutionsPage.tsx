/**
 * 解决方案展示页面组件
 */
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ViewColumnsIcon,
  Squares2X2Icon,
  ChevronRightIcon,
  StarIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/FormComponents';
import { 
  Solution,
  SolutionIndustry,
  SolutionCategory,
  SolutionQuery,
  SolutionQueryResult
} from '@/types/solution';

interface SolutionsPageProps {
  className?: string;
}

const SolutionsPage: React.FC<SolutionsPageProps> = ({ className }) => {
  const { t } = useTranslation('solutions');
  const router = useRouter();
  const [solutions, setSolutions] = useState<SolutionQueryResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    industry: '',
    category: '',
    featured: '',
  });
  const [sortBy, setSortBy] = useState('featured');
  const [currentPage, setCurrentPage] = useState(1);

  // 行业选项
  const industryOptions = [
    { value: '', label: t('allIndustries') },
    { value: SolutionIndustry.RETAIL, label: t('retail') },
    { value: SolutionIndustry.HOSPITALITY, label: t('hospitality') },
    { value: SolutionIndustry.TRANSPORTATION, label: t('transportation') },
    { value: SolutionIndustry.EDUCATION, label: t('education') },
    { value: SolutionIndustry.HEALTHCARE, label: t('healthcare') },
    { value: SolutionIndustry.ENTERTAINMENT, label: t('entertainment') },
    { value: SolutionIndustry.CORPORATE, label: t('corporate') },
    { value: SolutionIndustry.GOVERNMENT, label: t('government') },
    { value: SolutionIndustry.SPORTS, label: t('sports') },
    { value: SolutionIndustry.ADVERTISING, label: t('advertising') },
    { value: SolutionIndustry.BROADCASTING, label: t('broadcasting') },
    { value: SolutionIndustry.EVENTS, label: t('events') },
  ];

  const categoryOptions = [
    { value: '', label: t('allCategories') },
    { value: SolutionCategory.INDOOR_FIXED, label: t('indoorFixed') },
    { value: SolutionCategory.OUTDOOR_ADVERTISING, label: t('outdoorAdvertising') },
    { value: SolutionCategory.RENTAL_STAGING, label: t('rentalStaging') },
    { value: SolutionCategory.FINE_PITCH, label: t('finePitch') },
    { value: SolutionCategory.TRANSPARENT, label: t('transparent') },
    { value: SolutionCategory.FLEXIBLE, label: t('flexible') },
    { value: SolutionCategory.INTERACTIVE, label: t('interactive') },
    { value: SolutionCategory.CREATIVE, label: t('creative') },
  ];

  const sortOptions = [
    { value: 'featured', label: t('featured') },
    { value: 'created_desc', label: t('newest') },
    { value: 'title_asc', label: t('titleAZ') },
    { value: 'title_desc', label: t('titleZA') },
  ];

  // 获取解决方案列表
  const fetchSolutions = async () => {
    setLoading(true);
    try {
      const query: SolutionQuery = {
        page: currentPage,
        limit: 12,
        sortBy: sortBy as any,
        search: searchTerm || undefined,
        industry: filters.industry || undefined,
        category: filters.category || undefined,
        featured: filters.featured === 'true' ? true : undefined,
      };

      // 模拟API调用
      const mockSolutions = generateMockSolutions();
      const filteredSolutions = filterSolutions(mockSolutions, query);
      setSolutions(filteredSolutions);
    } catch (error) {
      console.error('Error fetching solutions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSolutions();
  }, [currentPage, sortBy, searchTerm, filters]);

  // 生成模拟解决方案数据
  const generateMockSolutions = (): Solution[] => {
    return [
      {
        id: 'retail-digital-signage',
        title: t('retailDigitalSignage'),
        slug: 'retail-digital-signage',
        description: t('retailDigitalSignageDesc'),
        industry: SolutionIndustry.RETAIL,
        category: SolutionCategory.INDOOR_FIXED,
        heroImage: '/images/solutions/retail-signage-hero.jpg',
        gallery: [
          {
            id: 'img1',
            url: '/images/solutions/retail-1.jpg',
            alt: 'Retail Digital Signage',
            isMain: true,
            sortOrder: 1,
          }
        ],
        features: [
          t('highBrightness'),
          t('energyEfficient'),
          t('easyMaintenance'),
          t('remoteControl'),
        ],
        benefits: [
          t('increaseSales'),
          t('enhanceCustomerExperience'),
          t('reduceOperatingCosts'),
          t('improveEfficiency'),
        ],
        applications: [
          t('shoppingMalls'),
          t('retailStores'),
          t('supermarkets'),
          t('fashionStores'),
        ],
        technicalSpecs: [
          {
            id: 'spec1',
            category: 'Display',
            name: 'Pixel Pitch',
            value: 'P2.5',
            unit: 'mm',
            isHighlight: true,
            sortOrder: 1,
          }
        ],
        recommendedProducts: ['product-1', 'product-2'],
        caseStudies: ['case-1', 'case-2'],
        tags: ['retail', 'indoor', 'digital-signage'],
        isActive: true,
        isFeatured: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-15'),
      },
      {
        id: 'outdoor-advertising',
        title: t('outdoorAdvertising'),
        slug: 'outdoor-advertising',
        description: t('outdoorAdvertisingDesc'),
        industry: SolutionIndustry.ADVERTISING,
        category: SolutionCategory.OUTDOOR_ADVERTISING,
        heroImage: '/images/solutions/outdoor-advertising-hero.jpg',
        gallery: [
          {
            id: 'img2',
            url: '/images/solutions/outdoor-1.jpg',
            alt: 'Outdoor Advertising',
            isMain: true,
            sortOrder: 1,
          }
        ],
        features: [
          t('weatherResistant'),
          t('highBrightness'),
          t('wideViewingAngle'),
          t('durableDesign'),
        ],
        benefits: [
          t('maximizeVisibility'),
          t('attractMoreCustomers'),
          t('costEffectiveAdvertising'),
          t('flexibleContent'),
        ],
        applications: [
          t('billboards'),
          t('buildingFacades'),
          t('transportationHubs'),
          t('stadiums'),
        ],
        technicalSpecs: [
          {
            id: 'spec2',
            category: 'Display',
            name: 'Brightness',
            value: '6000',
            unit: 'nits',
            isHighlight: true,
            sortOrder: 1,
          }
        ],
        recommendedProducts: ['product-3', 'product-4'],
        caseStudies: ['case-3', 'case-4'],
        tags: ['outdoor', 'advertising', 'high-brightness'],
        isActive: true,
        isFeatured: true,
        createdAt: new Date('2024-01-02'),
        updatedAt: new Date('2024-01-16'),
      },
      // 更多模拟数据...
    ];
  };

  // 筛选解决方案
  const filterSolutions = (solutions: Solution[], query: SolutionQuery): SolutionQueryResult => {
    let filtered = [...solutions];

    // 应用筛选条件
    if (query.search) {
      const searchLower = query.search.toLowerCase();
      filtered = filtered.filter(solution =>
        solution.title.toLowerCase().includes(searchLower) ||
        solution.description.toLowerCase().includes(searchLower) ||
        solution.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    if (query.industry) {
      filtered = filtered.filter(solution => solution.industry === query.industry);
    }

    if (query.category) {
      filtered = filtered.filter(solution => solution.category === query.category);
    }

    if (query.featured) {
      filtered = filtered.filter(solution => solution.isFeatured);
    }

    // 排序
    if (query.sortBy) {
      filtered.sort((a, b) => {
        switch (query.sortBy) {
          case 'featured':
            if (a.isFeatured && !b.isFeatured) return -1;
            if (!a.isFeatured && b.isFeatured) return 1;
            return b.createdAt.getTime() - a.createdAt.getTime();
          case 'created_desc':
            return b.createdAt.getTime() - a.createdAt.getTime();
          case 'created_asc':
            return a.createdAt.getTime() - b.createdAt.getTime();
          case 'title_asc':
            return a.title.localeCompare(b.title);
          case 'title_desc':
            return b.title.localeCompare(a.title);
          default:
            return 0;
        }
      });
    }

    // 分页
    const page = query.page || 1;
    const limit = query.limit || 12;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedSolutions = filtered.slice(startIndex, endIndex);

    return {
      solutions: paginatedSolutions,
      total: filtered.length,
      page,
      limit,
      totalPages: Math.ceil(filtered.length / limit),
      hasNextPage: endIndex < filtered.length,
      hasPrevPage: page > 1,
      filters: {
        industry: query.industry,
        category: query.category,
        featured: query.featured,
        search: query.search,
      },
      sortBy: query.sortBy,
    };
  };

  // 处理搜索
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  // 处理筛选
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  // 解决方案卡片组件
  const SolutionCard: React.FC<{ solution: Solution }> = ({ solution }) => (
    <div
      className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer group"
      onClick={() => router.push(`/solutions/${solution.slug}`)}
    >
      <div className="relative aspect-video overflow-hidden">
        <img
          src={solution.heroImage}
          alt={solution.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        {solution.isFeatured && (
          <div className="absolute top-4 left-4 bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
            <StarIcon className="w-4 h-4 mr-1" />
            {t('featured')}
          </div>
        )}
        <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
          {t(solution.industry)}
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
          {solution.title}
        </h3>
        <p className="text-gray-600 mb-4 line-clamp-3">
          {solution.description}
        </p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {solution.features.slice(0, 3).map((feature, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
            >
              {feature}
            </span>
          ))}
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">
            {solution.applications.length} {t('applications')}
          </span>
          <div className="flex items-center text-primary-600 font-medium">
            {t('learnMore')}
            <ArrowRightIcon className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-3 text-gray-600">{t('loadingSolutions')}</span>
      </div>
    );
  }

  return (
    <div className={cn('max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8', className)}>
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {t('ledDisplaySolutions')}
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          {t('solutionsPageDescription')}
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder={t('searchSolutions')}
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              leftIcon={<FunnelIcon className="w-4 h-4" />}
            >
              {t('filters')}
            </Button>

            <Select
              options={sortOptions}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-40"
            />

            <div className="flex items-center border border-gray-300 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  'p-2 transition-colors',
                  viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-gray-600 hover:text-gray-900'
                )}
              >
                <Squares2X2Icon className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  'p-2 transition-colors',
                  viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'text-gray-600 hover:text-gray-900'
                )}
              >
                <ViewColumnsIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                label={t('industry')}
                options={industryOptions}
                value={filters.industry}
                onChange={(e) => handleFilterChange('industry', e.target.value)}
              />
              <Select
                label={t('category')}
                options={categoryOptions}
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              />
              <Select
                label={t('featured')}
                options={[
                  { value: '', label: t('all') },
                  { value: 'true', label: t('featuredOnly') },
                ]}
                value={filters.featured}
                onChange={(e) => handleFilterChange('featured', e.target.value)}
              />
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {solutions && (
        <>
          <div className="flex items-center justify-between mb-6">
            <p className="text-gray-600">
              {t('showingResults', {
                start: (solutions.page - 1) * solutions.limit + 1,
                end: Math.min(solutions.page * solutions.limit, solutions.total),
                total: solutions.total,
              })}
            </p>
          </div>

          {/* Solutions Grid */}
          {solutions.solutions.length > 0 ? (
            <div className={cn(
              'grid gap-8 mb-12',
              viewMode === 'grid' 
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                : 'grid-cols-1'
            )}>
              {solutions.solutions.map((solution) => (
                <SolutionCard key={solution.id} solution={solution} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <MagnifyingGlassIcon className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {t('noSolutionsFound')}
              </h3>
              <p className="text-gray-600">
                {t('noSolutionsFoundDesc')}
              </p>
            </div>
          )}

          {/* Pagination */}
          {solutions.totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2">
              <Button
                variant="outline"
                disabled={!solutions.hasPrevPage}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                {t('previous')}
              </Button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: solutions.totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={cn(
                      'px-3 py-2 text-sm rounded-md transition-colors',
                      page === solutions.page
                        ? 'bg-primary-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    )}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <Button
                variant="outline"
                disabled={!solutions.hasNextPage}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                {t('next')}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SolutionsPage;