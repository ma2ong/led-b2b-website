/**
 * 产品导航和快速选择组件
 */
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { MagnifyingGlassIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import Button from '@/components/ui/Button';

// 产品类别接口
interface ProductCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  image: string;
  productCount: number;
  href: string;
  featured: boolean;
  tags: string[];
  applications: string[];
}

// 搜索筛选接口
interface SearchFilters {
  category?: string;
  application?: string;
  pixelPitch?: string;
  priceRange?: string;
  environment?: 'indoor' | 'outdoor' | 'all';
}

interface ProductNavigationProps {
  categories?: ProductCategory[];
  showSearch?: boolean;
  showFilters?: boolean;
  onCategorySelect?: (category: ProductCategory) => void;
  onSearch?: (query: string, filters: SearchFilters) => void;
  className?: string;
}

// 默认产品类别数据
const defaultCategories: ProductCategory[] = [
  {
    id: 'indoor-fixed',
    name: 'Indoor Fixed LED',
    description: 'High-resolution displays for permanent indoor installations',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
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
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    image: '/images/products/outdoor-advertising.jpg',
    productCount: 18,
    href: '/products/outdoor-advertising',
    featured: true,
    tags: ['outdoor', 'advertising', 'weather-resistant'],
    applications: ['Billboards', 'Building facades', 'Street displays', 'Stadium screens']
  },
  {
    id: 'rental-events',
    name: 'Rental & Events',
    description: 'Portable and modular displays for events and temporary installations',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-9 0a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2M9 12h6m-6 4h6" />
      </svg>
    ),
    image: '/images/products/rental-events.jpg',
    productCount: 15,
    href: '/products/rental-events',
    featured: true,
    tags: ['rental', 'portable', 'modular'],
    applications: ['Concerts', 'Trade shows', 'Corporate events', 'Weddings']
  },
  {
    id: 'broadcast-studio',
    name: 'Broadcast & Studio',
    description: 'Professional displays for broadcasting and studio environments',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
    image: '/images/products/broadcast-studio.jpg',
    productCount: 12,
    href: '/products/broadcast-studio',
    featured: false,
    tags: ['broadcast', 'studio', 'professional'],
    applications: ['TV studios', 'News rooms', 'Virtual sets', 'Live streaming']
  },
  {
    id: 'sports-venues',
    name: 'Sports Venues',
    description: 'Large-scale displays for stadiums and sports facilities',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    image: '/images/products/sports-venues.jpg',
    productCount: 8,
    href: '/products/sports-venues',
    featured: false,
    tags: ['sports', 'stadium', 'large-scale'],
    applications: ['Stadium scoreboards', 'Perimeter displays', 'Concourse screens', 'Fan zones']
  },
  {
    id: 'transportation',
    name: 'Transportation',
    description: 'Information displays for airports, stations, and transit systems',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    ),
    image: '/images/products/transportation.jpg',
    productCount: 10,
    href: '/products/transportation',
    featured: false,
    tags: ['transportation', 'information', 'public'],
    applications: ['Airport terminals', 'Train stations', 'Bus stops', 'Metro systems']
  }
];

// 产品类别卡片组件
const CategoryCard: React.FC<{
  category: ProductCategory;
  isHovered: boolean;
  onHover: (hovered: boolean) => void;
  onClick: () => void;
}> = ({ category, isHovered, onHover, onClick }) => {
  return (
    <div
      className={cn(
        'group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer overflow-hidden',
        'transform hover:scale-105 hover:-translate-y-2',
        isHovered ? 'scale-105 -translate-y-2 shadow-2xl' : ''
      )}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      onClick={onClick}
    >
      {/* Background Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={category.image}
          alt={category.name}
          className={cn(
            'w-full h-full object-cover transition-transform duration-700',
            isHovered ? 'scale-110' : 'scale-100'
          )}
        />
        <div className={cn(
          'absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent transition-opacity duration-300',
          isHovered ? 'opacity-80' : 'opacity-60'
        )} />
        
        {/* Featured Badge */}
        {category.featured && (
          <div className="absolute top-4 right-4 bg-primary-500 text-white px-3 py-1 rounded-full text-sm font-medium">
            Featured
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Icon and Title */}
        <div className="flex items-center mb-4">
          <div className={cn(
            'flex items-center justify-center w-12 h-12 rounded-xl bg-primary-100 text-primary-600 transition-all duration-300',
            isHovered ? 'bg-primary-500 text-white scale-110' : ''
          )}>
            {category.icon}
          </div>
          <div className="ml-4">
            <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
              {category.name}
            </h3>
            <p className="text-sm text-gray-500">
              {category.productCount} products
            </p>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 mb-4 leading-relaxed">
          {category.description}
        </p>

        {/* Applications */}
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Applications:</h4>
          <div className="flex flex-wrap gap-2">
            {category.applications.slice(0, 2).map((app, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md"
              >
                {app}
              </span>
            ))}
            {category.applications.length > 2 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                +{category.applications.length - 2} more
              </span>
            )}
          </div>
        </div>

        {/* CTA */}
        <div className={cn(
          'flex items-center justify-between transition-all duration-300',
          isHovered ? 'transform translate-x-2' : ''
        )}>
          <span className="text-primary-600 font-medium">Explore Products</span>
          <svg
            className={cn(
              'w-5 h-5 text-primary-600 transition-transform duration-300',
              isHovered ? 'translate-x-2' : ''
            )}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>

      {/* Hover Effect Border */}
      <div className={cn(
        'absolute inset-0 rounded-2xl border-2 border-transparent transition-all duration-300',
        isHovered ? 'border-primary-500' : ''
      )} />
    </div>
  );
};

// 搜索和筛选组件
const SearchAndFilters: React.FC<{
  onSearch: (query: string, filters: SearchFilters) => void;
  showFilters: boolean;
}> = ({ onSearch, showFilters }) => {
  const { t } = useTranslation('products');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  const handleSearch = () => {
    onSearch(searchQuery, filters);
  };

  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onSearch(searchQuery, newFilters);
  };

  const clearFilters = () => {
    setFilters({});
    onSearch(searchQuery, {});
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
      {/* Search Bar */}
      <div className="flex gap-4 mb-4">
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search products by name, model, or specifications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        
        <Button
          onClick={handleSearch}
          className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl"
        >
          Search
        </Button>
        
        {showFilters && (
          <Button
            variant="outline"
            onClick={() => setShowFilterPanel(!showFilterPanel)}
            className="px-6 py-3 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl"
            leftIcon={<FunnelIcon className="w-5 h-5" />}
          >
            Filters
          </Button>
        )}
      </div>

      {/* Filter Panel */}
      {showFilterPanel && (
        <div className="border-t border-gray-200 pt-4 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Application Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Application
              </label>
              <select
                value={filters.application || ''}
                onChange={(e) => handleFilterChange('application', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Applications</option>
                <option value="retail">Retail</option>
                <option value="advertising">Advertising</option>
                <option value="events">Events</option>
                <option value="broadcast">Broadcast</option>
                <option value="sports">Sports</option>
                <option value="transportation">Transportation</option>
              </select>
            </div>

            {/* Pixel Pitch Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pixel Pitch
              </label>
              <select
                value={filters.pixelPitch || ''}
                onChange={(e) => handleFilterChange('pixelPitch', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Pixel Pitches</option>
                <option value="P1.25">P1.25</option>
                <option value="P1.5">P1.5</option>
                <option value="P1.8">P1.8</option>
                <option value="P2">P2</option>
                <option value="P2.5">P2.5</option>
                <option value="P3">P3</option>
                <option value="P4">P4</option>
                <option value="P5">P5</option>
                <option value="P6">P6</option>
                <option value="P8">P8</option>
                <option value="P10">P10</option>
              </select>
            </div>

            {/* Environment Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Environment
              </label>
              <select
                value={filters.environment || 'all'}
                onChange={(e) => handleFilterChange('environment', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Environments</option>
                <option value="indoor">Indoor</option>
                <option value="outdoor">Outdoor</option>
              </select>
            </div>

            {/* Price Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price Range
              </label>
              <select
                value={filters.priceRange || ''}
                onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Prices</option>
                <option value="0-1000">$0 - $1,000</option>
                <option value="1000-5000">$1,000 - $5,000</option>
                <option value="5000-10000">$5,000 - $10,000</option>
                <option value="10000+">$10,000+</option>
              </select>
            </div>
          </div>

          {/* Clear Filters */}
          <div className="flex justify-end mt-4">
            <Button
              variant="ghost"
              onClick={clearFilters}
              className="text-gray-600 hover:text-gray-800"
              leftIcon={<XMarkIcon className="w-4 h-4" />}
            >
              Clear All Filters
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

const ProductNavigation: React.FC<ProductNavigationProps> = ({
  categories = defaultCategories,
  showSearch = true,
  showFilters = true,
  onCategorySelect,
  onSearch,
  className
}) => {
  const { t } = useTranslation('products');
  const router = useRouter();
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  // Intersection Observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleCategoryClick = (category: ProductCategory) => {
    if (onCategorySelect) {
      onCategorySelect(category);
    } else {
      router.push(category.href);
    }
  };

  const handleSearch = (query: string, filters: SearchFilters) => {
    if (onSearch) {
      onSearch(query, filters);
    } else {
      // Default search behavior - navigate to products page with query
      const searchParams = new URLSearchParams();
      if (query) searchParams.set('q', query);
      Object.entries(filters).forEach(([key, value]) => {
        if (value) searchParams.set(key, value);
      });
      
      router.push(`/products?${searchParams.toString()}`);
    }
  };

  return (
    <section
      ref={sectionRef}
      className={cn(
        'py-16 lg:py-24 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden',
        className
      )}
    >
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-64 h-64 bg-primary-200 rounded-full opacity-20 blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-blue-200 rounded-full opacity-20 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <div className={cn(
          'text-center mb-12',
          isVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'
        )}>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Find Your Perfect{' '}
            <span className="bg-gradient-to-r from-primary-600 to-blue-600 bg-clip-text text-transparent">
              LED Solution
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Explore our comprehensive range of LED display solutions, each designed for specific 
            applications and environments. From indoor installations to outdoor advertising, 
            we have the perfect display for your needs.
          </p>
        </div>

        {/* Search and Filters */}
        {showSearch && (
          <div className={cn(
            isVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'
          )} style={{ animationDelay: '200ms' }}>
            <SearchAndFilters onSearch={handleSearch} showFilters={showFilters} />
          </div>
        )}

        {/* Product Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category, index) => (
            <div
              key={category.id}
              className={cn(
                isVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'
              )}
              style={{ animationDelay: `${300 + index * 100}ms` }}
            >
              <CategoryCard
                category={category}
                isHovered={hoveredCategory === category.id}
                onHover={(hovered) => setHoveredCategory(hovered ? category.id : null)}
                onClick={() => handleCategoryClick(category)}
              />
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className={cn(
          'text-center mt-16',
          isVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'
        )} style={{ animationDelay: '800ms' }}>
          <div className="bg-white rounded-3xl shadow-xl p-8 lg:p-12 max-w-4xl mx-auto border border-gray-100">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Can't Find What You're Looking For?
            </h3>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Our expert team can help you find the perfect LED solution for your specific requirements. 
              Get personalized recommendations and custom quotes.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-primary-600 to-blue-600 hover:from-primary-700 hover:to-blue-700 text-white px-8 py-4 shadow-lg hover:shadow-xl transition-all duration-300"
                href="/contact"
              >
                Get Expert Consultation
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-gray-300 text-gray-700 hover:border-primary-500 hover:text-primary-600 px-8 py-4 transition-all duration-300"
                href="/products"
              >
                View All Products
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductNavigation;