/**
 * 首页Hero区域组件
 */
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import { ChevronRightIcon, PlayIcon } from '@heroicons/react/24/outline';
import { ChevronLeftIcon, ChevronRightIcon as ChevronRightSolid } from '@heroicons/react/24/solid';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  video?: string;
  cta: {
    primary: {
      text: string;
      href: string;
    };
    secondary?: {
      text: string;
      href: string;
    };
  };
}

interface HeroSectionProps {
  slides?: HeroSlide[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showVideoModal?: boolean;
  className?: string;
}

const defaultSlides: HeroSlide[] = [
  {
    id: 'slide-1',
    title: 'Leading LED Display Solutions',
    subtitle: 'Innovation in Every Pixel',
    description: 'Transform your space with our cutting-edge LED display technology. From indoor installations to outdoor billboards, we deliver exceptional visual experiences.',
    image: '/images/hero/hero-slide-1.jpg',
    video: 'https://www.youtube.com/watch?v=example1',
    cta: {
      primary: {
        text: 'Explore Products',
        href: '/products',
      },
      secondary: {
        text: 'Watch Demo',
        href: '#video',
      },
    },
  },
  {
    id: 'slide-2',
    title: 'Global Projects, Local Expertise',
    subtitle: 'Trusted Worldwide',
    description: 'With over 1000+ successful installations across 50+ countries, we bring world-class LED solutions to your doorstep.',
    image: '/images/hero/hero-slide-2.jpg',
    cta: {
      primary: {
        text: 'View Case Studies',
        href: '/cases',
      },
      secondary: {
        text: 'Get Quote',
        href: '/contact',
      },
    },
  },
  {
    id: 'slide-3',
    title: 'Custom Solutions for Every Need',
    subtitle: 'Tailored Excellence',
    description: 'From concept to completion, our expert team designs and delivers LED display solutions perfectly matched to your requirements.',
    image: '/images/hero/hero-slide-3.jpg',
    cta: {
      primary: {
        text: 'Start Your Project',
        href: '/contact',
      },
      secondary: {
        text: 'Learn More',
        href: '/about',
      },
    },
  },
];

const HeroSection: React.FC<HeroSectionProps> = ({
  slides = defaultSlides,
  autoPlay = true,
  autoPlayInterval = 5000,
  showVideoModal = true,
  className,
}) => {
  const { t } = useTranslation('home');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [showVideo, setShowVideo] = useState(false);

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying || slides.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [isPlaying, slides.length, autoPlayInterval]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsPlaying(false);
    // Resume auto-play after 10 seconds
    setTimeout(() => setIsPlaying(autoPlay), 10000);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleVideoPlay = (videoUrl?: string) => {
    if (videoUrl && showVideoModal) {
      setShowVideo(true);
    }
  };

  const currentSlideData = slides[currentSlide];

  return (
    <section className={cn('relative h-screen min-h-[600px] overflow-hidden', className)}>
      {/* Background Images */}
      <div className="absolute inset-0">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={cn(
              'absolute inset-0 transition-opacity duration-1000 ease-in-out',
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            )}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
              loading={index === 0 ? 'eager' : 'lazy'}
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/40" />
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            {/* Animated Content */}
            <div
              key={currentSlide}
              className="animate-fade-in-up"
            >
              {/* Subtitle */}
              <p className="text-primary-400 font-medium text-lg mb-4 animate-delay-100">
                {currentSlideData.subtitle}
              </p>

              {/* Title */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight animate-delay-200">
                {currentSlideData.title}
              </h1>

              {/* Description */}
              <p className="text-xl text-gray-200 mb-8 max-w-2xl leading-relaxed animate-delay-300">
                {currentSlideData.description}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 animate-delay-400">
                <Button
                  href={currentSlideData.cta.primary.href}
                  size="lg"
                  className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-4"
                  rightIcon={<ChevronRightIcon className="w-5 h-5" />}
                >
                  {currentSlideData.cta.primary.text}
                </Button>

                {currentSlideData.cta.secondary && (
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-white text-white hover:bg-white hover:text-gray-900 px-8 py-4"
                    leftIcon={
                      currentSlideData.video ? (
                        <PlayIcon className="w-5 h-5" />
                      ) : undefined
                    }
                    onClick={
                      currentSlideData.video
                        ? () => handleVideoPlay(currentSlideData.video)
                        : undefined
                    }
                    href={
                      !currentSlideData.video
                        ? currentSlideData.cta.secondary.href
                        : undefined
                    }
                  >
                    {currentSlideData.cta.secondary.text}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      {slides.length > 1 && (
        <>
          {/* Previous/Next Buttons */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/20 hover:bg-black/40 text-white transition-all duration-200 backdrop-blur-sm"
            aria-label="Previous slide"
          >
            <ChevronLeftIcon className="w-6 h-6" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/20 hover:bg-black/40 text-white transition-all duration-200 backdrop-blur-sm"
            aria-label="Next slide"
          >
            <ChevronRightSolid className="w-6 h-6" />
          </button>

          {/* Slide Indicators */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex space-x-3">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={cn(
                  'w-3 h-3 rounded-full transition-all duration-200',
                  index === currentSlide
                    ? 'bg-primary-500 scale-125'
                    : 'bg-white/50 hover:bg-white/75'
                )}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}

      {/* Play/Pause Button */}
      {slides.length > 1 && autoPlay && (
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="absolute top-8 right-8 z-20 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-all duration-200 backdrop-blur-sm"
          aria-label={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
        >
          {isPlaying ? (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          ) : (
            <PlayIcon className="w-5 h-5" />
          )}
        </button>
      )}

      {/* Video Modal */}
      {showVideo && currentSlideData.video && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl mx-4">
            <button
              onClick={() => setShowVideo(false)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
              aria-label="Close video"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              <iframe
                src={currentSlideData.video.replace('watch?v=', 'embed/')}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Video"
              />
            </div>
          </div>
        </div>
      )}

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-8 z-20 hidden lg:block">
        <div className="flex items-center space-x-3 text-white/70">
          <div className="w-px h-16 bg-white/30" />
          <span className="text-sm font-medium rotate-90 origin-left">Scroll</span>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;