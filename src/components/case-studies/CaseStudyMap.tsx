/**
 * 成功案例地图展示组件
 */
import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'next-i18next';
import {
  MapPinIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  GlobeAltIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  XMarkIcon,
  ChevronDownIcon,
  ViewColumnsIcon,
  MapIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/FormComponents';
import { CaseStudy } from '@/types/case-study';

// 地图标记类型
interface MapMarker {
  id: string;
  position: { lat: number; lng: number };
  caseStudy: CaseStudy;
  isActive: boolean;
}

// 地区统计
interface RegionStats {
  region: string;
  count: number;
  totalValue: number;
  countries: string[];
}

interface CaseStudyMapProps {
  caseStudies: CaseStudy[];
  onCaseStudySelect?: (caseStudy: CaseStudy) => void;
  className?: string;
}

const CaseStudyMap: React.FC<CaseStudyMapProps> = ({ 
  caseStudies, 
  onCaseStudySelect,
  className 
}) => {
  const { t } = useTranslation('case-studies');
  const mapRef = useRef<HTMLDivElement>(null);
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    region: '',
    industry: '',
    category: '',
    budget: '',
    year: '',
  });
  const [regionStats, setRegionStats] = useState<RegionStats[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);

  // 模拟地图数据
  const mockCaseStudies: CaseStudy[] = [
    {
      id: 'case_001',
      title: 'Times Square Digital Billboard',
      subtitle: 'NYC\'s iconic LED installation',
      description: 'Large-scale LED display project in Times Square',
      client: {
        name: 'Times Square Media',
        industry: 'Advertising',
        location: 'New York, USA',
      },
      project: {
        startDate: new Date('2023-06-01'),
        completionDate: new Date('2023-09-15'),
        duration: '3.5 months',
        budget: 2500000,
        teamSize: 15,
      },
      location: {
        address: '1560 Broadway, New York, NY 10036',
        coordinates: { lat: 40.7580, lng: -73.9855 },
        country: 'United States',
        region: 'North America',
      },
      products: [],
      challenges: [],
      solutions: [],
      results: { metrics: [] },
      media: {
        images: [
          {
            id: 'img_001',
            url: '/images/case-studies/times-square/main.jpg',
            alt: 'Times Square LED Display',
            type: 'main',
          },
        ],
        videos: [],
        documents: [],
      },
      tags: ['outdoor', 'advertising', 'nyc'],
      category: 'Outdoor Advertising',
      featured: true,
      status: 'completed',
      views: 15420,
      likes: 892,
      shares: 156,
      createdAt: new Date('2023-10-01'),
      updatedAt: new Date('2023-12-15'),
    },
    {
      id: 'case_002',
      title: 'Shanghai Shopping Mall LED Wall',
      subtitle: 'Interactive retail experience',
      description: 'Indoor LED wall installation for premium shopping experience',
      client: {
        name: 'Shanghai Retail Group',
        industry: 'Retail',
        location: 'Shanghai, China',
      },
      project: {
        startDate: new Date('2023-04-01'),
        completionDate: new Date('2023-07-30'),
        duration: '4 months',
        budget: 1800000,
        teamSize: 12,
      },
      location: {
        address: 'Nanjing Road, Shanghai, China',
        coordinates: { lat: 31.2304, lng: 121.4737 },
        country: 'China',
        region: 'Asia Pacific',
      },
      products: [],
      challenges: [],
      solutions: [],
      results: { metrics: [] },
      media: {
        images: [
          {
            id: 'img_001',
            url: '/images/case-studies/shanghai/main.jpg',
            alt: 'Shanghai LED Wall',
            type: 'main',
          },
        ],
        videos: [],
        documents: [],
      },
      tags: ['indoor', 'retail', 'interactive'],
      category: 'Retail Display',
      featured: false,
      status: 'completed',
      views: 8750,
      likes: 445,
      shares: 89,
      createdAt: new Date('2023-08-15'),
      updatedAt: new Date('2023-12-10'),
    },
    {
      id: 'case_003',
      title: 'London Stadium LED Perimeter',
      subtitle: 'Sports venue enhancement',
      description: 'LED perimeter displays for enhanced fan experience',
      client: {
        name: 'London Stadium Ltd',
        industry: 'Sports & Entertainment',
        location: 'London, UK',
      },
      project: {
        startDate: new Date('2023-02-01'),
        completionDate: new Date('2023-05-15'),
        duration: '3.5 months',
        budget: 3200000,
        teamSize: 18,
      },
      location: {
        address: 'Queen Elizabeth Olympic Park, London, UK',
        coordinates: { lat: 51.5388, lng: -0.0166 },
        country: 'United Kingdom',
        region: 'Europe',
      },
      products: [],
      challenges: [],
      solutions: [],
      results: { metrics: [] },
      media: {
        images: [
          {
            id: 'img_001',
            url: '/images/case-studies/london/main.jpg',
            alt: 'London Stadium LED',
            type: 'main',
          },
        ],
        videos: [],
        documents: [],
      },
      tags: ['sports', 'perimeter', 'stadium'],
      category: 'Sports Venue',
      featured: true,
      status: 'completed',
      views: 12300,
      likes: 678,
      shares: 134,
      createdAt: new Date('2023-06-01'),
      updatedAt: new Date('2023-11-20'),
    },
  ];

  // 使用传入的案例或模拟数据
  const displayCaseStudies = caseStudies.length > 0 ? caseStudies : mockCaseStudies;

  // 创建地图标记
  const markers: MapMarker[] = displayCaseStudies.map(caseStudy => ({
    id: caseStudy.id,
    position: caseStudy.location.coordinates,
    caseStudy,
    isActive: selectedMarker?.id === caseStudy.id,
  }));

  // 计算地区统计
  useEffect(() => {
    const stats: { [key: string]: RegionStats } = {};
    
    displayCaseStudies.forEach(caseStudy => {
      const region = caseStudy.location.region;
      if (!stats[region]) {
        stats[region] = {
          region,
          count: 0,
          totalValue: 0,
          countries: [],
        };
      }
      
      stats[region].count += 1;
      stats[region].totalValue += caseStudy.project.budget;
      
      if (!stats[region].countries.includes(caseStudy.location.country)) {
        stats[region].countries.push(caseStudy.location.country);
      }
    });
    
    setRegionStats(Object.values(stats));
  }, [displayCaseStudies]);

  // 模拟地图加载
  useEffect(() => {
    const timer = setTimeout(() => {
      setMapLoaded(true);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // 格式化货币
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // 处理标记点击
  const handleMarkerClick = (marker: MapMarker) => {
    setSelectedMarker(marker);
    if (onCaseStudySelect) {
      onCaseStudySelect(marker.caseStudy);
    }
  };

  // 处理案例选择
  const handleCaseStudyClick = (caseStudy: CaseStudy) => {
    const marker = markers.find(m => m.id === caseStudy.id);
    if (marker) {
      setSelectedMarker(marker);
    }
    if (onCaseStudySelect) {
      onCaseStudySelect(caseStudy);
    }
  };

  // 筛选案例
  const filteredCaseStudies = displayCaseStudies.filter(caseStudy => {
    const matchesSearch = !searchTerm || 
      caseStudy.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      caseStudy.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      caseStudy.location.country.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRegion = !filters.region || caseStudy.location.region === filters.region;
    const matchesIndustry = !filters.industry || caseStudy.client.industry === filters.industry;
    const matchesCategory = !filters.category || caseStudy.category === filters.category;
    
    return matchesSearch && matchesRegion && matchesIndustry && matchesCategory;
  });

  return (
    <div className={cn('bg-white rounded-lg shadow-lg overflow-hidden', className)}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {t('globalCaseStudies')}
          </h2>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('map')}
                className={cn(
                  'px-3 py-1 text-sm font-medium rounded-md flex items-center',
                  viewMode === 'map' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                )}
              >
                <MapIcon className="w-4 h-4 mr-1" />
                {t('map')}
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  'px-3 py-1 text-sm font-medium rounded-md flex items-center',
                  viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                )}
              >
                <ViewColumnsIcon className="w-4 h-4 mr-1" />
                {t('list')}
              </button>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mt-4 flex items-center space-x-4">
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder={t('searchCaseStudies')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select
            options={[
              { value: '', label: t('allRegions') },
              ...regionStats.map(stat => ({ value: stat.region, label: stat.region }))
            ]}
            value={filters.region}
            onChange={(e) => setFilters(prev => ({ ...prev, region: e.target.value }))}
            className="w-40"
          />
          <Button
            variant="outline"
            size="sm"
            leftIcon={<FunnelIcon className="w-4 h-4" />}
          >
            {t('moreFilters')}
          </Button>
        </div>

        {/* Statistics */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center">
              <GlobeAltIcon className="w-8 h-8 text-blue-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-900">{t('totalProjects')}</p>
                <p className="text-2xl font-bold text-blue-900">{displayCaseStudies.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center">
              <MapPinIcon className="w-8 h-8 text-green-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-green-900">{t('countries')}</p>
                <p className="text-2xl font-bold text-green-900">
                  {new Set(displayCaseStudies.map(cs => cs.location.country)).size}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center">
              <CurrencyDollarIcon className="w-8 h-8 text-purple-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-purple-900">{t('totalValue')}</p>
                <p className="text-2xl font-bold text-purple-900">
                  {formatCurrency(displayCaseStudies.reduce((sum, cs) => sum + cs.project.budget, 0))}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center">
              <BuildingOfficeIcon className="w-8 h-8 text-orange-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-orange-900">{t('industries')}</p>
                <p className="text-2xl font-bold text-orange-900">
                  {new Set(displayCaseStudies.map(cs => cs.client.industry)).size}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex h-96">
        {viewMode === 'map' ? (
          <>
            {/* Map Container */}
            <div className="flex-1 relative">
              <div ref={mapRef} className="w-full h-full bg-gray-100 relative overflow-hidden">
                {!mapLoaded ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    <span className="ml-3 text-gray-600">{t('loadingMap')}</span>
                  </div>
                ) : (
                  <>
                    {/* 简化的世界地图背景 */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100">
                      <svg
                        viewBox="0 0 1000 500"
                        className="w-full h-full opacity-20"
                        fill="currentColor"
                      >
                        {/* 简化的大陆轮廓 */}
                        <path d="M100,200 Q200,150 300,200 Q400,250 500,200 Q600,150 700,200 Q800,250 900,200 L900,400 L100,400 Z" className="text-gray-400" />
                        <path d="M150,100 Q250,50 350,100 Q450,150 550,100 Q650,50 750,100 L750,180 L150,180 Z" className="text-gray-400" />
                        <path d="M200,300 Q300,250 400,300 Q500,350 600,300 L600,450 L200,450 Z" className="text-gray-400" />
                      </svg>
                    </div>

                    {/* 地图标记 */}
                    {markers.map((marker) => (
                      <div
                        key={marker.id}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10"
                        style={{
                          left: `${((marker.position.lng + 180) / 360) * 100}%`,
                          top: `${((90 - marker.position.lat) / 180) * 100}%`,
                        }}
                        onClick={() => handleMarkerClick(marker)}
                      >
                        <div
                          className={cn(
                            'w-6 h-6 rounded-full border-2 border-white shadow-lg transition-all duration-200 hover:scale-110',
                            marker.isActive
                              ? 'bg-primary-600 scale-125'
                              : marker.caseStudy.featured
                              ? 'bg-yellow-500'
                              : 'bg-blue-500'
                          )}
                        />
                        {marker.isActive && (
                          <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg p-3 min-w-64 z-20">
                            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white rotate-45 border-l border-t border-gray-200"></div>
                            <div className="relative">
                              <h4 className="font-semibold text-gray-900 mb-1">
                                {marker.caseStudy.title}
                              </h4>
                              <p className="text-sm text-gray-600 mb-2">
                                {marker.caseStudy.client.name}
                              </p>
                              <div className="flex items-center justify-between text-xs text-gray-500">
                                <span>{marker.caseStudy.location.country}</span>
                                <span>{formatCurrency(marker.caseStudy.project.budget)}</span>
                              </div>
                              <Button
                                size="sm"
                                className="w-full mt-3"
                                onClick={() => handleCaseStudyClick(marker.caseStudy)}
                              >
                                {t('viewDetails')}
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="w-80 border-l border-gray-200 bg-gray-50 overflow-y-auto">
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {t('regionBreakdown')}
                </h3>
                <div className="space-y-3">
                  {regionStats.map((stat) => (
                    <div key={stat.region} className="bg-white rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{stat.region}</h4>
                        <span className="text-sm text-gray-500">{stat.count} {t('projects')}</span>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        {stat.countries.join(', ')}
                      </div>
                      <div className="text-lg font-semibold text-primary-600">
                        {formatCurrency(stat.totalValue)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : (
          /* List View */
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCaseStudies.map((caseStudy) => (
                  <div
                    key={caseStudy.id}
                    className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleCaseStudyClick(caseStudy)}
                  >
                    <img
                      src={caseStudy.media.images[0]?.url}
                      alt={caseStudy.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="inline-flex px-2 py-1 text-xs font-medium bg-primary-100 text-primary-800 rounded-full">
                          {caseStudy.category}
                        </span>
                        {caseStudy.featured && (
                          <span className="inline-flex px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                            {t('featured')}
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {caseStudy.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">
                        {caseStudy.client.name}
                      </p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center">
                          <MapPinIcon className="w-4 h-4 mr-1" />
                          <span>{caseStudy.location.country}</span>
                        </div>
                        <div className="flex items-center">
                          <CurrencyDollarIcon className="w-4 h-4 mr-1" />
                          <span>{formatCurrency(caseStudy.project.budget)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6 text-sm text-gray-600">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              <span>{t('standardProject')}</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
              <span>{t('featuredProject')}</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-primary-600 rounded-full mr-2"></div>
              <span>{t('selectedProject')}</span>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            {t('showingResults', { count: filteredCaseStudies.length, total: displayCaseStudies.length })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaseStudyMap;