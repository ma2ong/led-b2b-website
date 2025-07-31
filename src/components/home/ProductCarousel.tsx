/**
 * 产品轮播展示组件
 */
import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'next-i18next';
import { ChevronLeftIcon, ChevronRightIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { Product, ProductType } from '@/types/product';

interface ProductCarouselProps {
  products?: Product[];
  title?: string;
  subtitle?: string;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  slidesToShow?: number;
  showDots?: boolean;
  showArrows?: boolean;
  className?: string;
}

// Mock product data for demonstration
const mockProducts: Partial<Product>[] = [
  {
    id: 'indoor-p1-25-hd',
    name: 'Indoor P1.25 HD Display',
    shortDescription: 'Ultra-high resolution indoor LED display with P1.25 pixel pitch',
    type: ProductType.INDOOR,
    pixelPitch: 'P1.25' as any,
    images: [
      {
        id: '1',
        url: '/images/products/indoor-p1-25-hd/main.jpg',
        alt: 'Indoor P1.25 HD Display',
        isMain: true,
        sortOrder: 1,
      },
    ],
    features: ['Ultra-fine P1.25 pixel pitch', 'High refresh rate 3840Hz', 'Seamless splicing'],
    isFeatured: true,
    isNew: false,
  },
  {
    id: 'outdoor-p4-weatherproof',
    name: 'Outdoor P4 Weatherproof Display',
    shortDescription: 'Robust outdoor LED display designed to withstand harsh weather conditions',
    type: ProductType.OUTDOOR,
    pixelPitch: 'P4' as any,
    images: [
      {
        id: '2',
        url: '/images/products/outdoor-p4-weatherproof/main.jpg',
        alt: 'Outdoor P4 Weatherproof Display',
        isMain: true,
        sortOrder: 1,
      },
    ],
    features: ['IP65 waterproof rating', 'High brightness 6000 nits', 'Wide temperature range'],
    isFeatured: true,
    isNew: true,
  },
  {
    id: 'rental-p3-9-lightweight',
    name: 'Rental P3.9 Lightweight Display',
    shortDescription: 'Ultra-lightweight rental LED display perfect for events and temporary installations',
    type: ProductType.RENTAL,
    pixelPitch: 'P3.9' as any,
    images: [
      {
        id: '3',
        url: '/images/products/rental-p3-9-lightweight/main.jpg',
        alt: 'Rental P3.9 Lightweight Display',
        isMain: true,
        sortOrder: 1,
      },
    ],
    features: ['Ultra-lightweight design', 'Quick lock system', 'Flight case compatible'],
    isFeatured: false,
    isNew: true,
  },
  {
    id: 'transparent-p7-8-glass',
    name: 'Transparent P7.8 Glass Display',
    shortDescription: 'Innovative transparent LED display perfect for creative installations',
    type: ProductType.TRANSPARENT,
    pixelPitch: 'P7.8' as any,
    images: [
      {
        id: '4',
        url: '/images/products/transparent-p7-8-glass/main.jpg',
        alt: 'Transparent P7.8 Glass Display',
        isMain: true,
        sortOrder: 1,
      },
    ],
    features: ['70% transparency rate', 'See-through design', 'Lightweight structure'],
    isFeatured: true,
    isNew: true,
  },
];

// Product card component
const ProductCard: React.FC<{
  product: Partial<Product>;
  isActive: boolean;
}> = ({ product, isActive }) => {
  const { t } = useTranslation('home');
  const mainImage = product.images?.find(img => img.isMain) || product.images?.[0];

  return (
    <div
      className={cn(
        'relative bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-500 group',
        isActive ? 'scale-105 shadow-2xl' : 'scale-100 hover:scale-102 hover:shadow-xl'
      )}
    >
      {/* Product Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={mainImage?.url || '/images/placeholder-product.jpg'}
          alt={mainImage?.alt || product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col space-y-2">
          {product.isNew && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              New
            </span>
          )}
          {product.isFeatured && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              <StarIcon className="w-3 h-3 mr-1" />
              Featured
            </span>
          )}
        </div>

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Quick Actions */}
        <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
          <Button
            href={`/products/${product.id}`}
            variant="primary"
            size="sm"
            className="w-full bg-white text-gray-900 hover:bg-gray-100"
            rightIcon={<ArrowRightIcon className="w-4 h-4" />}
          >
            View Details
          </Button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-6">
        {/* Product Type & Pixel Pitch */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-primary-600 uppercase tracking-wide">
            {product.type?.replace('_', ' ')}
          </span>
          <span className="text-sm font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded">
            {product.pixelPitch}
          </span>
        </div>

        {/* Product Name */}
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
          {product.name}
        </h3>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {product.shortDescription}
        </p>

        {/* Features */}
        <div className="space-y-2 mb-4">
          {product.features?.slice(0, 3).map((feature, index) => (
            <div key={index} className="flex items-center text-sm text-gray-600">
              <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="line-clamp-1">{feature}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="flex space-x-3">
          <Button
            href={`/products/${product.id}`}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            Learn More
          </Button>
          <Button
            href="/contact"
            variant="primary"
            size="sm"
            className="flex-1"
          >
            Get Quote
          </Button>
        </div>
      </div>
    </div>
  );
};

const ProductCarousel: React.FC<ProductCarouselProps> = ({
  products = mockProducts as Product[],
  title = 'Featured Products',
  subtitle = 'Discover our latest LED display solutions',
  autoPlay = true,
  autoPlayInterval = 4000,
  slidesToShow = 3,
  showDots = true,
  showArrows = true,
  className,
}) => {
  const { t } = useTranslation('home');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const carouselRef = useRef<HTMLDivElement>(null);

  const totalSlides = Math.ceil(products.length / slidesToShow);

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying || totalSlides <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalSlides);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [isPlaying, totalSlides, autoPlayInterval]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsPlaying(false);
    // Resume auto-play after 10 seconds
    setTimeout(() => setIsPlaying(autoPlay), 10000);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const getVisibleProducts = () => {
    const startIndex = currentIndex * slidesToShow;
    return products.slice(startIndex, startIndex + slidesToShow);
  };

  return (
    <section className={cn('py-16 lg:py-24 bg-gray-50', className)}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            {title}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {subtitle}
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Products Grid */}
          <div
            ref={carouselRef}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 transition-all duration-500"
          >
            {getVisibleProducts().map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                isActive={index === Math.floor(slidesToShow / 2)}
              />
            ))}
          </div>

          {/* Navigation Arrows */}
          {showArrows && totalSlides > 1 && (
            <>
              <button
                onClick={prevSlide}
                disabled={currentIndex === 0}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 p-3 rounded-full bg-white shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 z-10"
                aria-label="Previous products"
              >
                <ChevronLeftIcon className="w-6 h-6 text-gray-600" />
              </button>

              <button
                onClick={nextSlide}
                disabled={currentIndex === totalSlides - 1}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 p-3 rounded-full bg-white shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 z-10"
                aria-label="Next products"
              >
                <ChevronRightIcon className="w-6 h-6 text-gray-600" />
              </button>
            </>
          )}
        </div>

        {/* Dots Indicator */}
        {showDots && totalSlides > 1 && (
          <div className="flex justify-center space-x-2 mt-8">
            {Array.from({ length: totalSlides }).map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={cn(
                  'w-3 h-3 rounded-full transition-all duration-200',
                  index === currentIndex
                    ? 'bg-primary-600 scale-125'
                    : 'bg-gray-300 hover:bg-gray-400'
                )}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* View All Products CTA */}
        <div className="text-center mt-12">
          <Button
            href="/products"
            variant="outline"
            size="lg"
            rightIcon={<ArrowRightIcon className="w-5 h-5" />}
          >
            View All Products
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ProductCarousel;