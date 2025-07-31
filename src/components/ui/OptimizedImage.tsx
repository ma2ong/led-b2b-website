/**
 * 优化的图片组件，支持懒加载、WebP格式和响应式图片
 */
import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  quality?: number;
  sizes?: string;
  fill?: boolean;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: () => void;
  loading?: 'lazy' | 'eager';
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  objectPosition?: string;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  quality = 75,
  sizes,
  fill = false,
  placeholder = 'empty',
  blurDataURL,
  onLoad,
  onError,
  loading = 'lazy',
  objectFit = 'cover',
  objectPosition = 'center',
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);
  const [currentSrc, setCurrentSrc] = useState<string>('');

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || isInView) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px',
        threshold: 0.1,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority, isInView]);

  // Generate optimized image URLs
  const generateImageUrl = (originalSrc: string, width?: number, quality?: number) => {
    if (originalSrc.startsWith('data:') || originalSrc.startsWith('blob:')) {
      return originalSrc;
    }

    // For external URLs, return as-is
    if (originalSrc.startsWith('http')) {
      return originalSrc;
    }

    // For internal images, we can add optimization parameters
    const params = new URLSearchParams();
    if (width) params.set('w', width.toString());
    if (quality) params.set('q', quality.toString());
    
    const queryString = params.toString();
    return queryString ? `${originalSrc}?${queryString}` : originalSrc;
  };

  // Generate WebP source
  const generateWebPUrl = (originalSrc: string) => {
    if (originalSrc.startsWith('data:') || originalSrc.startsWith('blob:') || originalSrc.startsWith('http')) {
      return null;
    }
    
    // Convert extension to WebP
    const webpSrc = originalSrc.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    return generateImageUrl(webpSrc, width, quality);
  };

  // Generate srcSet for responsive images
  const generateSrcSet = (originalSrc: string) => {
    if (!width || originalSrc.startsWith('data:') || originalSrc.startsWith('blob:')) {
      return undefined;
    }

    const breakpoints = [0.5, 1, 1.5, 2];
    return breakpoints
      .map(multiplier => {
        const scaledWidth = Math.round(width * multiplier);
        const url = generateImageUrl(originalSrc, scaledWidth, quality);
        return `${url} ${scaledWidth}w`;
      })
      .join(', ');
  };

  // Handle image load
  const handleLoad = () => {
    setIsLoaded(true);
    setHasError(false);
    onLoad?.();
  };

  // Handle image error
  const handleError = () => {
    setHasError(true);
    setIsLoaded(false);
    onError?.();
  };

  // Update current src when in view
  useEffect(() => {
    if (isInView && !currentSrc) {
      setCurrentSrc(generateImageUrl(src, width, quality));
    }
  }, [isInView, src, width, quality, currentSrc]);

  // Placeholder component
  const renderPlaceholder = () => {
    if (placeholder === 'blur' && blurDataURL) {
      return (
        <img
          src={blurDataURL}
          alt=""
          className={cn(
            'absolute inset-0 w-full h-full transition-opacity duration-300',
            isLoaded ? 'opacity-0' : 'opacity-100',
            className
          )}
          style={{
            objectFit,
            objectPosition,
          }}
        />
      );
    }

    return (
      <div
        className={cn(
          'absolute inset-0 bg-gray-200 animate-pulse transition-opacity duration-300',
          isLoaded ? 'opacity-0' : 'opacity-100'
        )}
      />
    );
  };

  // Error fallback
  const renderError = () => (
    <div
      className={cn(
        'absolute inset-0 bg-gray-100 flex items-center justify-center text-gray-400',
        className
      )}
    >
      <svg
        className="w-8 h-8"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    </div>
  );

  const containerStyle = fill
    ? { position: 'relative' as const }
    : { width, height };

  const imageStyle = fill
    ? {
        position: 'absolute' as const,
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        objectFit,
        objectPosition,
      }
    : {
        width: width || 'auto',
        height: height || 'auto',
        objectFit,
        objectPosition,
      };

  const webpSrc = generateWebPUrl(src);
  const srcSet = generateSrcSet(src);

  return (
    <div
      ref={imgRef}
      className={cn('relative overflow-hidden', fill && 'w-full h-full', className)}
      style={containerStyle}
    >
      {hasError ? (
        renderError()
      ) : (
        <>
          {!isLoaded && renderPlaceholder()}
          
          {isInView && (
            <picture>
              {webpSrc && (
                <source
                  srcSet={webpSrc}
                  type="image/webp"
                  sizes={sizes}
                />
              )}
              <img
                src={currentSrc}
                srcSet={srcSet}
                sizes={sizes}
                alt={alt}
                loading={loading}
                decoding="async"
                onLoad={handleLoad}
                onError={handleError}
                className={cn(
                  'transition-opacity duration-300',
                  isLoaded ? 'opacity-100' : 'opacity-0',
                  fill && 'absolute inset-0 w-full h-full'
                )}
                style={imageStyle}
              />
            </picture>
          )}
        </>
      )}
    </div>
  );
};

export default OptimizedImage;