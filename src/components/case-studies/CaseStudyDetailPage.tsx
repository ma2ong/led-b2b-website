/**
 * 成功案例详情页面组件
 */
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import {
  MapPinIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ClockIcon,
  TagIcon,
  ShareIcon,
  HeartIcon,
  EyeIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlayIcon,
  DocumentTextIcon,
  PhotoIcon,
  VideoCameraIcon,
  ArrowTopRightOnSquareIcon,
  CheckCircleIcon,
  StarIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { CaseStudy } from '@/types/case-study';

interface CaseStudyDetailPageProps {
  caseStudyId: string;
  className?: string;
}

const CaseStudyDetailPage: React.FC<CaseStudyDetailPageProps> = ({ caseStudyId, className }) => {
  const { t } = useTranslation('case-studies');
  const [caseStudy, setCaseStudy] = useState<CaseStudy | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [relatedCaseStudies, setRelatedCaseStudies] = useState<CaseStudy[]>([]);

  // 模拟数据加载
  useEffect(() => {
    const mockCaseStudy: CaseStudy = {
      id: caseStudyId,
      title: 'Times Square Digital Billboard Installation',
      subtitle: 'Transforming NYC\'s Most Famous Intersection with Cutting-Edge LED Technology',
      description: 'A comprehensive LED display solution for one of the world\'s most iconic advertising locations, featuring ultra-high resolution displays and advanced content management systems.',
      client: {
        name: 'Times Square Media Group',
        industry: 'Advertising & Media',
        location: 'New York, USA',
        website: 'https://timessquaremedia.com',
        logo: '/images/clients/times-square-media.png',
      },
      project: {
        startDate: new Date('2023-06-01'),
        completionDate: new Date('2023-09-15'),
        duration: '3.5 months',
        budget: 2500000,
        teamSize: 15,
        projectManager: 'Sarah Johnson',
      },
      location: {
        address: '1560 Broadway, New York, NY 10036',
        coordinates: { lat: 40.7580, lng: -73.9855 },
        timezone: 'America/New_York',
        country: 'United States',
        region: 'North America',
      },
      products: [
        {
          id: 'prod_001',
          name: 'P2.5 Outdoor LED Display',
          category: 'Outdoor LED',
          specifications: {
            pixelPitch: '2.5mm',
            resolution: '3840x2160',
            brightness: '6000 nits',
            size: '10m x 6m',
          },
          quantity: 4,
          unitPrice: 450000,
        },
        {
          id: 'prod_002',
          name: 'Advanced Control System',
          category: 'Control Systems',
          specifications: {
            inputSources: '16 HDMI, 8 DVI',
            processingPower: '4K@60Hz',
            redundancy: 'Hot backup',
          },
          quantity: 2,
          unitPrice: 150000,
        },
      ],
      challenges: [
        'Extreme weather conditions in NYC',
        'High pedestrian traffic during installation',
        'Strict city regulations and permits',
        'Integration with existing infrastructure',
        ' 24/7 operation requirements',
      ],
      solutions: [
        'Weather-resistant IP65 rated displays',
        'Modular installation approach for minimal disruption',
        'Comprehensive permit management and compliance',
        'Custom mounting systems for existing structures',
        'Redundant power and control systems',
      ],
      results: {
        metrics: [
          { label: 'Viewer Engagement', value: '+150%', description: 'Increase in audience engagement' },
          { label: 'Ad Revenue', value: '+200%', description: 'Revenue increase for advertisers' },
          { label: 'Uptime', value: '99.9%', description: 'System availability' },
          { label: 'Energy Efficiency', value: '-30%', description: 'Power consumption reduction' },
        ],
        testimonial: {
          quote: 'The LED displays have completely transformed our advertising capabilities. The image quality is stunning and the reliability is exceptional.',
          author: 'Michael Chen',
          position: 'CEO, Times Square Media Group',
          avatar: '/images/testimonials/michael-chen.jpg',
        },
      },
      media: {
        images: [
          {
            id: 'img_001',
            url: '/images/case-studies/times-square/main.jpg',
            alt: 'Times Square LED Display Installation',
            caption: 'Main LED display installation at Times Square',
            type: 'main',
          },
          {
            id: 'img_002',
            url: '/images/case-studies/times-square/installation.jpg',
            alt: 'Installation Process',
            caption: 'Professional installation team at work',
            type: 'process',
          },
          {
            id: 'img_003',
            url: '/images/case-studies/times-square/night-view.jpg',
            alt: 'Night View',
            caption: 'Stunning night view of the LED displays',
            type: 'result',
          },
          {
            id: 'img_004',
            url: '/images/case-studies/times-square/control-room.jpg',
            alt: 'Control Room',
            caption: 'Advanced control room setup',
            type: 'technical',
          },
        ],
        videos: [
          {
            id: 'vid_001',
            url: '/videos/case-studies/times-square-overview.mp4',
            thumbnail: '/images/case-studies/times-square/video-thumb.jpg',
            title: 'Project Overview',
            duration: '3:45',
          },
          {
            id: 'vid_002',
            url: '/videos/case-studies/times-square-installation.mp4',
            thumbnail: '/images/case-studies/times-square/install-thumb.jpg',
            title: 'Installation Process',
            duration: '5:20',
          },
        ],
        documents: [
          {
            id: 'doc_001',
            name: 'Technical Specifications',
            url: '/documents/times-square-specs.pdf',
            type: 'pdf',
            size: '2.5 MB',
          },
          {
            id: 'doc_002',
            name: 'Installation Guide',
            url: '/documents/times-square-install.pdf',
            type: 'pdf',
            size: '4.1 MB',
          },
        ],
      },
      tags: ['outdoor', 'advertising', 'high-resolution', 'weather-resistant', 'nyc'],
      category: 'Outdoor Advertising',
      featured: true,
      status: 'completed',
      views: 15420,
      likes: 892,
      shares: 156,
      createdAt: new Date('2023-10-01'),
      updatedAt: new Date('2023-12-15'),
    };

    // 模拟相关案例
    const mockRelatedCases: CaseStudy[] = [
      {
        id: 'case_002',
        title: 'Las Vegas Strip LED Installation',
        subtitle: 'Entertainment district transformation',
        description: 'Large-scale LED display project for Las Vegas entertainment venues',
        client: {
          name: 'Vegas Entertainment Corp',
          industry: 'Entertainment',
          location: 'Las Vegas, USA',
        },
        project: {
          startDate: new Date('2023-03-01'),
          completionDate: new Date('2023-07-30'),
          duration: '5 months',
          budget: 3200000,
          teamSize: 20,
        },
        location: {
          address: 'Las Vegas Strip, NV',
          coordinates: { lat: 36.1147, lng: -115.1728 },
          country: 'United States',
          region: 'North America',
        },
        products: [],
        challenges: [],
        solutions: [],
        results: {
          metrics: [],
        },
        media: {
          images: [
            {
              id: 'img_001',
              url: '/images/case-studies/vegas/main.jpg',
              alt: 'Vegas LED Installation',
              type: 'main',
            },
          ],
          videos: [],
          documents: [],
        },
        tags: ['outdoor', 'entertainment', 'vegas'],
        category: 'Entertainment',
        featured: true,
        status: 'completed',
        views: 8750,
        likes: 445,
        shares: 89,
        createdAt: new Date('2023-08-15'),
        updatedAt: new Date('2023-12-10'),
      },
    ];

    setCaseStudy(mockCaseStudy);
    setRelatedCaseStudies(mockRelatedCases);
    setLoading(false);
  }, [caseStudyId]);

  if (loading || !caseStudy) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-3 text-gray-600">{t('loadingCaseStudy')}</span>
      </div>
    );
  }

  // 格式化货币
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // 格式化日期
  const formatDate = (date: Date) => {
    return date.toLocaleDateString();
  };

  // 处理图片导航
  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === caseStudy.media.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? caseStudy.media.images.length - 1 : prev - 1
    );
  };

  // 处理点赞
  const handleLike = () => {
    setIsLiked(!isLiked);
    // 这里可以调用API更新点赞状态
  };

  // 处理分享
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: caseStudy.title,
        text: caseStudy.description,
        url: window.location.href,
      });
    } else {
      // 复制链接到剪贴板
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className={cn('bg-white', className)}>
      {/* Hero Section */}
      <div className="relative h-96 bg-gray-900 overflow-hidden">
        <img
          src={caseStudy.media.images[currentImageIndex]?.url}
          alt={caseStudy.media.images[currentImageIndex]?.alt}
          className="w-full h-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        {/* Image Navigation */}
        {caseStudy.media.images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
            >
              <ChevronLeftIcon className="w-6 h-6" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
            >
              <ChevronRightIcon className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Hero Content */}
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-4xl">
            <div className="flex items-center space-x-4 mb-4">
              <span className="inline-flex px-3 py-1 text-sm font-medium bg-primary-600 text-white rounded-full">
                {t(caseStudy.category)}
              </span>
              {caseStudy.featured && (
                <span className="inline-flex items-center px-3 py-1 text-sm font-medium bg-yellow-500 text-white rounded-full">
                  <TrophyIcon className="w-4 h-4 mr-1" />
                  {t('featured')}
                </span>
              )}
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">
              {caseStudy.title}
            </h1>
            <p className="text-xl text-gray-200 mb-4">
              {caseStudy.subtitle}
            </p>
            <div className="flex items-center space-x-6 text-gray-300">
              <div className="flex items-center">
                <MapPinIcon className="w-5 h-5 mr-2" />
                <span>{caseStudy.location.address}</span>
              </div>
              <div className="flex items-center">
                <CalendarIcon className="w-5 h-5 mr-2" />
                <span>{formatDate(caseStudy.project.completionDate)}</span>
              </div>
              <div className="flex items-center">
                <CurrencyDollarIcon className="w-5 h-5 mr-2" />
                <span>{formatCurrency(caseStudy.project.budget)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Image Indicators */}
        {caseStudy.media.images.length > 1 && (
          <div className="absolute bottom-4 right-8 flex space-x-2">
            {caseStudy.media.images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={cn(
                  'w-2 h-2 rounded-full transition-colors',
                  index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* Action Bar */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2 text-gray-600">
                <EyeIcon className="w-5 h-5" />
                <span>{caseStudy.views.toLocaleString()} {t('views')}</span>
              </div>
              <button
                onClick={handleLike}
                className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors"
              >
                {isLiked ? (
                  <HeartSolidIcon className="w-5 h-5 text-red-600" />
                ) : (
                  <HeartIcon className="w-5 h-5" />
                )}
                <span>{(caseStudy.likes + (isLiked ? 1 : 0)).toLocaleString()}</span>
              </button>
              <button
                onClick={handleShare}
                className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <ShareIcon className="w-5 h-5" />
                <span>{t('share')}</span>
              </button>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                {t('downloadSpecs')}
              </Button>
              <Button size="sm">
                {t('requestQuote')}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Project Overview */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {t('projectOverview')}
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                {caseStudy.description}
              </p>
            </section>

            {/* Project Details */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {t('projectDetails')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {t('timeline')}
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('startDate')}</span>
                      <span className="font-medium">{formatDate(caseStudy.project.startDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('completionDate')}</span>
                      <span className="font-medium">{formatDate(caseStudy.project.completionDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('duration')}</span>
                      <span className="font-medium">{caseStudy.project.duration}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {t('projectScope')}
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('budget')}</span>
                      <span className="font-medium">{formatCurrency(caseStudy.project.budget)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('teamSize')}</span>
                      <span className="font-medium">{caseStudy.project.teamSize} {t('members')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('projectManager')}</span>
                      <span className="font-medium">{caseStudy.project.projectManager}</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Products Used */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {t('productsUsed')}
              </h2>
              <div className="space-y-4">
                {caseStudy.products.map((product) => (
                  <div key={product.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {product.name}
                        </h3>
                        <p className="text-gray-600">{product.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-gray-900">
                          {formatCurrency(product.unitPrice)}
                        </p>
                        <p className="text-gray-600">{t('quantity')}: {product.quantity}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Object.entries(product.specifications).map(([key, value]) => (
                        <div key={key}>
                          <p className="text-sm text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                          <p className="font-medium text-gray-900">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Challenges & Solutions */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {t('challengesAndSolutions')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <ExclamationTriangleIcon className="w-5 h-5 text-orange-500 mr-2" />
                    {t('challenges')}
                  </h3>
                  <ul className="space-y-3">
                    {caseStudy.challenges.map((challenge, index) => (
                      <li key={index} className="flex items-start">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                        <span className="text-gray-600">{challenge}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
                    {t('solutions')}
                  </h3>
                  <ul className="space-y-3">
                    {caseStudy.solutions.map((solution, index) => (
                      <li key={index} className="flex items-start">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                        <span className="text-gray-600">{solution}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            {/* Results & Metrics */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {t('resultsAndMetrics')}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {caseStudy.results.metrics.map((metric, index) => (
                  <div key={index} className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg p-6 text-center">
                    <div className="text-3xl font-bold text-primary-600 mb-2">
                      {metric.value}
                    </div>
                    <div className="text-sm font-medium text-gray-900 mb-1">
                      {metric.label}
                    </div>
                    <div className="text-xs text-gray-600">
                      {metric.description}
                    </div>
                  </div>
                ))}
              </div>

              {/* Testimonial */}
              {caseStudy.results.testimonial && (
                <div className="bg-gray-50 rounded-lg p-8">
                  <div className="flex items-start space-x-4">
                    <img
                      src={caseStudy.results.testimonial.avatar}
                      alt={caseStudy.results.testimonial.author}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <blockquote className="text-lg text-gray-900 italic mb-4">
                        "{caseStudy.results.testimonial.quote}"
                      </blockquote>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {caseStudy.results.testimonial.author}
                        </div>
                        <div className="text-gray-600">
                          {caseStudy.results.testimonial.position}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* Media Gallery */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {t('mediaGallery')}
              </h2>
              
              {/* Videos */}
              {caseStudy.media.videos.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {t('videos')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {caseStudy.media.videos.map((video) => (
                      <div key={video.id} className="relative group cursor-pointer">
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                          <PlayIcon className="w-12 h-12 text-white" />
                        </div>
                        <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
                          {video.duration}
                        </div>
                        <div className="mt-2">
                          <h4 className="font-medium text-gray-900">{video.title}</h4>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Images */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {caseStudy.media.images.slice(1).map((image, index) => (
                  <div key={image.id} className="group cursor-pointer">
                    <img
                      src={image.url}
                      alt={image.alt}
                      className="w-full h-48 object-cover rounded-lg group-hover:opacity-90 transition-opacity"
                    />
                    <p className="mt-2 text-sm text-gray-600">{image.caption}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Client Information */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {t('clientInformation')}
              </h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <BuildingOfficeIcon className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">{caseStudy.client.name}</p>
                    <p className="text-sm text-gray-600">{caseStudy.client.industry}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPinIcon className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-600">{caseStudy.client.location}</span>
                </div>
                {caseStudy.client.website && (
                  <div className="flex items-center space-x-3">
                    <ArrowTopRightOnSquareIcon className="w-5 h-5 text-gray-400" />
                    <a
                      href={caseStudy.client.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-500"
                    >
                      {t('visitWebsite')}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Project Tags */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {t('projectTags')}
              </h3>
              <div className="flex flex-wrap gap-2">
                {caseStudy.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex px-3 py-1 text-sm font-medium bg-gray-100 text-gray-800 rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Downloads */}
            {caseStudy.media.documents.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {t('downloads')}
                </h3>
                <div className="space-y-3">
                  {caseStudy.media.documents.map((doc) => (
                    <a
                      key={doc.id}
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <DocumentTextIcon className="w-5 h-5 text-gray-400" />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{doc.name}</p>
                        <p className="text-sm text-gray-600">{doc.size}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Related Case Studies */}
            {relatedCaseStudies.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {t('relatedCaseStudies')}
                </h3>
                <div className="space-y-4">
                  {relatedCaseStudies.map((relatedCase) => (
                    <div key={relatedCase.id} className="group cursor-pointer">
                      <img
                        src={relatedCase.media.images[0]?.url}
                        alt={relatedCase.title}
                        className="w-full h-32 object-cover rounded-lg group-hover:opacity-90 transition-opacity"
                      />
                      <div className="mt-2">
                        <h4 className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors">
                          {relatedCase.title}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {relatedCase.client.location}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaseStudyDetailPage;