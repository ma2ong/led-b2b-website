/**
 * 成功案例轮播组件
 */
import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'next-i18next';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  PlayIcon, 
  PauseIcon,
  EyeIcon,
  MapPinIcon,
  CalendarIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import Button from '@/components/ui/Button';

// 案例数据接口
interface CaseStudyItem {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  customer: {
    name: string;
    logo: string;
    industry: string;
  };
  location: {
    city: string;
    country: string;
  };
  projectDate: string;
  images: {
    hero: string;
    thumbnail: string;
    gallery?: string[];
  };
  stats: {
    label: string;
    value: string;
  }[];
  tags: string[];
  featured: boolean;
  href: string;
}

interface CaseStudyCarouselProps {
  cases?: CaseStudyItem[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showModal?: boolean;
  slidesToShow?: number;
  className?: string;
}

// 默认案例数据
const defaultCases: CaseStudyItem[] = [
  {
    id: 'times-square-billboard',
    title: 'Times Square Digital Billboard',
    subtitle: 'Iconic LED Display Installation',
    description: 'A massive 500㎡ LED billboard installation in the heart of Times Square, featuring ultra-high brightness and weather-resistant design for 24/7 operation.',
    customer: {
      name: 'Times Square Media',
      logo: '/images/customers/times-square-media.png',
      industry: 'Advertising'
    },
    location: {
      city: 'New York',
      country: 'United States'
    },
    projectDate: '2023-09',
    images: {
      hero: '/images/cases/times-square/hero.jpg',
      thumbnail: '/images/cases/times-square/thumb.jpg',
      gallery: [
        '/images/cases/times-square/gallery-1.jpg',
        '/images/cases/times-square/gallery-2.jpg',
        '/images/cases/times-square/gallery-3.jpg'
      ]
    },
    stats: [
      { label: 'Screen Area', value: '500㎡' },
      { label: 'Pixel Pitch', value: 'P6' },
      { label: 'Brightness', value: '8000 nits' },
      { label: 'Investment', value: '$2.5M' }
    ],
    tags: ['Outdoor', 'Advertising', 'High Brightness', 'Weather Resistant'],
    featured: true,
    href: '/cases/times-square-billboard'
  },
  {
    id: 'beijing-shopping-mall',
    title: 'Beijing Luxury Mall LED Wall',
    subtitle: 'Premium Indoor Display Solution',
    description: 'A stunning curved LED wall installation in Beijing\'s premier shopping destination, creating immersive brand experiences for luxury retailers.',
    customer: {
      name: 'Golden Mall Beijing',
      logo: '/images/customers/golden-mall.png',
      industry: 'Retail'
    },
    location: {
      city: 'Beijing',
      country: 'China'
    },
    projectDate: '2023-11',
    images: {
      hero: '/images/cases/beijing-mall/hero.jpg',
      thumbnail: '/images/cases/beijing-mall/thumb.jpg',
      gallery: [
        '/images/cases/beijing-mall/gallery-1.jpg',
        '/images/cases/beijing-mall/gallery-2.jpg'
      ]
    },
    stats: [
      { label: 'Screen Area', value: '200㎡' },
      { label: 'Pixel Pitch', value: 'P2.5' },
      { label: 'Resolution', value: '4K' },
      { label: 'Curve Radius', value: '15m' }
    ],
    tags: ['Indoor', 'Retail', 'Curved', 'High Resolution'],
    featured: true,
    href: '/cases/beijing-shopping-mall'
  },
  {
    id: 'london-stadium',
    title: 'London Stadium Perimeter Display',
    subtitle: 'Sports Venue LED Solution',
    description: 'Dynamic perimeter LED displays for London\'s premier football stadium, enhancing fan experience and providing advertising opportunities.',
    customer: {
      name: 'London Stadium',
      logo: '/images/customers/london-stadium.png',
      industry: 'Sports'
    },
    location: {
      city: 'London',
      country: 'United Kingdom'
    },
    projectDate: '2023-08',
    images: {
      hero: '/images/cases/london-stadium/hero.jpg',
      thumbnail: '/images/cases/london-stadium/thumb.jpg',
      gallery: [
        '/images/cases/london-stadium/gallery-1.jpg',
        '/images/cases/london-stadium/gallery-2.jpg',
        '/images/cases/london-stadium/gallery-3.jpg',
        '/images/cases/london-stadium/gallery-4.jpg'
      ]
    },
    stats: [
      { label: 'Total Length', value: '400m' },
      { label: 'Pixel Pitch', value: 'P10' },
      { label: 'Viewing Distance', value: '50-200m' },
      { label: 'Refresh Rate', value: '3840Hz' }
    ],
    tags: ['Sports', 'Perimeter', 'Dynamic', 'High Refresh'],
    featured: false,
    href: '/cases/london-stadium'
  },
  {
    id: 'dubai-airport',
    title: 'Dubai Airport Information Displays',
    subtitle: 'Transportation Hub Solution',
    description: 'Comprehensive LED display system for Dubai International Airport, providing flight information and wayfinding across multiple terminals.',
    customer: {
      name: 'Dubai Airports',
      logo: '/images/customers/dubai-airports.png',
      industry: 'Transportation'
    },
    location: {
      city: 'Dubai',
      country: 'UAE'
    },
    projectDate: '2023-10',
    images: {
      hero: '/images/cases/dubai-airport/hero.jpg',
      thumbnail: '/images/cases/dubai-airport/thumb.jpg',
      gallery: [
        '/images/cases/dubai-airport/gallery-1.jpg',
        '/images/cases/dubai-airport/gallery-2.jpg'
      ]
    },
    stats: [
      { label: 'Total Displays', value: '150+' },
      { label: 'Pixel Pitch', value: 'P3' },
      { label: 'Operating Hours', value: '24/7' },
      { label: 'Terminals', value: '3' }
    ],
    tags: ['Transportation', 'Information', '24/7', 'Multi-Terminal'],
    featured: false,
    href: '/cases/dubai-airport'
  }
];

// 案例卡片组件
const CaseCard: React.FC<{
  case: CaseStudyItem;
  isActive: boolean;
  onClick: () => void;
  onViewDetails: () => void;
}> = ({ case: caseItem, isActive, onClick, onViewDetails }) => {
  return (
    <div
      className={cn(
        'relative bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer transition-all duration-500',
        'transform hover:scale-105 hover:shadow-2xl',
        isActive ? 'ring-2 ring-primary-500 scale-105 shadow-2xl' : ''
      )}
      onClick={onClick}
    >
      {/* Hero Image */}
      <div className="relative h-64 overflow-hidden">
        <img
          src={caseItem.images.hero}
          alt={caseItem.title}
          className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        
        {/* Featured Badge */}
        {caseItem.featured && (
          <div className="absolute top-4 left-4 bg-primary-500 text-white px-3 py-1 rounded-full text-sm font-medium">
            Featured
          </div>
        )}
        
        {/* View Details Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails();
          }}
          className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-200 backdrop-blur-sm"
          aria-label="View case details"
        >
          <EyeIcon className="w-5 h-5" />
        </button>
        
        {/* Location */}
        <div className="absolute bottom-4 left-4 flex items-center text-white text-sm">
          <MapPinIcon className="w-4 h-4 mr-1" />
          {caseItem.location.city}, {caseItem.location.country}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Customer Logo */}
        <div className="flex items-center mb-4">
          <img
            src={caseItem.customer.logo}
            alt={caseItem.customer.name}
            className="h-8 w-auto mr-3"
          />
          <div>
            <p className="font-medium text-gray-900">{caseItem.customer.name}</p>
            <p className="text-sm text-gray-500">{caseItem.customer.industry}</p>
          </div>
        </div>

        {/* Title and Subtitle */}
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
          {caseItem.title}
        </h3>
        {caseItem.subtitle && (
          <p className="text-primary-600 font-medium mb-3">
            {caseItem.subtitle}
          </p>
        )}

        {/* Description */}
        <p className="text-gray-600 mb-4 line-clamp-3">
          {caseItem.description}
        </p>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {caseItem.stats.slice(0, 4).map((stat, index) => (
            <div key={index} className="text-center">
              <p className="text-lg font-bold text-primary-600">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {caseItem.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md"
            >
              {tag}
            </span>
          ))}
          {caseItem.tags.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
              +{caseItem.tags.length - 3}
            </span>
          )}
        </div>

        {/* Project Date */}
        <div className="flex items-center text-sm text-gray-500">
          <CalendarIcon className="w-4 h-4 mr-1" />
          {new Date(caseItem.projectDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long'
          })}
        </div>
      </div>
    </div>
  );
};

// 案例详情模态框组件
const CaseModal: React.FC<{
  case: CaseStudyItem;
  isOpen: boolean;
  onClose: () => void;
}> = ({ case: caseItem, isOpen, onClose }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = [caseItem.images.hero, ...(caseItem.images.gallery || [])];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto bg-white rounded-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-200"
          aria-label="Close modal"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>

        {/* Image Gallery */}
        <div className="relative h-96 overflow-hidden rounded-t-2xl">
          <img
            src={images[currentImageIndex]}
            alt={caseItem.title}
            className="w-full h-full object-cover"
          />
          
          {/* Image Navigation */}
          {images.length > 1 && (
            <>
              <button
                onClick={() => setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full"
              >
                <ChevronLeftIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCurrentImageIndex((prev) => (prev + 1) % images.length)}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full"
              >
                <ChevronRightIcon className="w-5 h-5" />
              </button>
              
              {/* Image Indicators */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={cn(
                      'w-2 h-2 rounded-full transition-all duration-200',
                      index === currentImageIndex ? 'bg-white scale-125' : 'bg-white/50'
                    )}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="flex items-center mb-6">
                <img
                  src={caseItem.customer.logo}
                  alt={caseItem.customer.name}
                  className="h-12 w-auto mr-4"
                />
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">{caseItem.title}</h2>
                  {caseItem.subtitle && (
                    <p className="text-primary-600 font-medium text-lg">{caseItem.subtitle}</p>
                  )}
                </div>
              </div>

              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                {caseItem.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {caseItem.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-primary-100 text-primary-700 text-sm rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* CTA */}
              <div className="flex gap-4">
                <Button
                  href={caseItem.href}
                  className="bg-primary-600 hover:bg-primary-700 text-white"
                >
                  View Full Case Study
                </Button>
                <Button
                  variant="outline"
                  href="/contact"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Get Similar Solution
                </Button>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Project Info */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="font-bold text-gray-900 mb-4">Project Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <MapPinIcon className="w-4 h-4 mr-2 text-gray-500" />
                    <span>{caseItem.location.city}, {caseItem.location.country}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <CalendarIcon className="w-4 h-4 mr-2 text-gray-500" />
                    <span>{new Date(caseItem.projectDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long'
                    })}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-500">Industry: </span>
                    <span className="font-medium">{caseItem.customer.industry}</span>
                  </div>
                </div>
              </div>

              {/* Project Stats */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="font-bold text-gray-900 mb-4">Key Specifications</h3>
                <div className="grid grid-cols-1 gap-4">
                  {caseItem.stats.map((stat, index) => (
                    <div key={index} className="text-center">
                      <p className="text-2xl font-bold text-primary-600">{stat.value}</p>
                      <p className="text-sm text-gray-500">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CaseStudyCarousel: React.FC<CaseStudyCarouselProps> = ({
  cases = defaultCases,
  autoPlay = true,
  autoPlayInterval = 5000,
  showModal = true,
  slidesToShow = 3,
  className
}) => {
  const { t } = useTranslation('home');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [selectedCase, setSelectedCase] = useState<CaseStudyItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying || cases.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % Math.max(1, cases.length - slidesToShow + 1));
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [isPlaying, cases.length, autoPlayInterval, slidesToShow]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % Math.max(1, cases.length - slidesToShow + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + Math.max(1, cases.length - slidesToShow + 1)) % Math.max(1, cases.length - slidesToShow + 1));
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsPlaying(false);
    // Resume auto-play after 10 seconds
    setTimeout(() => setIsPlaying(autoPlay), 10000);
  };

  const openModal = (caseItem: CaseStudyItem) => {
    if (showModal) {
      setSelectedCase(caseItem);
      setIsModalOpen(true);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCase(null);
  };

  if (cases.length === 0) {
    return null;
  }

  const maxIndex = Math.max(0, cases.length - slidesToShow);

  return (
    <section
      ref={sectionRef}
      className={cn(
        'py-16 lg:py-24 bg-gradient-to-br from-white to-gray-50 relative overflow-hidden',
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
            Success Stories from{' '}
            <span className="bg-gradient-to-r from-primary-600 to-blue-600 bg-clip-text text-transparent">
              Around the World
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Discover how our LED display solutions have transformed spaces and exceeded expectations 
            for clients across diverse industries and locations worldwide.
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Navigation Controls */}
          {cases.length > slidesToShow && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg hover:shadow-xl p-3 rounded-full transition-all duration-200"
                aria-label="Previous cases"
              >
                <ChevronLeftIcon className="w-6 h-6 text-gray-600" />
              </button>

              <button
                onClick={nextSlide}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg hover:shadow-xl p-3 rounded-full transition-all duration-200"
                aria-label="Next cases"
              >
                <ChevronRightIcon className="w-6 h-6 text-gray-600" />
              </button>
            </>
          )}

          {/* Cases Grid */}
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{
                transform: `translateX(-${currentIndex * (100 / slidesToShow)}%)`,
                width: `${(cases.length / slidesToShow) * 100}%`
              }}
            >
              {cases.map((caseItem, index) => (
                <div
                  key={caseItem.id}
                  className="px-4"
                  style={{ width: `${100 / cases.length}%` }}
                >
                  <CaseCard
                    case={caseItem}
                    isActive={index >= currentIndex && index < currentIndex + slidesToShow}
                    onClick={() => goToSlide(Math.max(0, Math.min(index, maxIndex)))}
                    onViewDetails={() => openModal(caseItem)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Slide Indicators */}
          {cases.length > slidesToShow && (
            <div className="flex justify-center mt-8 space-x-2">
              {Array.from({ length: maxIndex + 1 }, (_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={cn(
                    'w-3 h-3 rounded-full transition-all duration-200',
                    index === currentIndex
                      ? 'bg-primary-500 scale-125'
                      : 'bg-gray-300 hover:bg-gray-400'
                  )}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}

          {/* Play/Pause Button */}
          {cases.length > slidesToShow && autoPlay && (
            <div className="flex justify-center mt-4">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex items-center space-x-2 bg-white shadow-lg hover:shadow-xl px-4 py-2 rounded-full transition-all duration-200"
                aria-label={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
              >
                {isPlaying ? (
                  <PauseIcon className="w-5 h-5 text-gray-600" />
                ) : (
                  <PlayIcon className="w-5 h-5 text-gray-600" />
                )}
                <span className="text-sm text-gray-600">
                  {isPlaying ? 'Pause' : 'Play'}
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Call to Action */}
        <div className={cn(
          'text-center mt-16',
          isVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'
        )} style={{ animationDelay: '600ms' }}>
          <Button
            size="lg"
            href="/cases"
            className="bg-gradient-to-r from-primary-600 to-blue-600 hover:from-primary-700 hover:to-blue-700 text-white px-8 py-4 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            View All Case Studies
          </Button>
        </div>
      </div>

      {/* Case Modal */}
      {selectedCase && (
        <CaseModal
          case={selectedCase}
          isOpen={isModalOpen}
          onClose={closeModal}
        />
      )}
    </section>
  );
};

export default CaseStudyCarousel;