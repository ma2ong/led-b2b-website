/**
 * 产品360度展示组件
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'next-i18next';
import { 
  PlayIcon,
  PauseIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  ArrowsPointingOutIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

interface Product360ViewerProps {
  images: string[]; // 360度图片序列
  productName: string;
  autoRotate?: boolean;
  rotationSpeed?: number; // 毫秒
  className?: string;
}

const Product360Viewer: React.FC<Product360ViewerProps> = ({
  images,
  productName,
  autoRotate = false,
  rotationSpeed = 100,
  className
}) => {
  const { t } = useTranslation('products');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoRotate);
  const [isDragging, setIsDragging] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());

  const containerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastMouseX = useRef<number>(0);
  const startImageIndex = useRef<number>(0);

  // 预加载图片
  useEffect(() => {
    const preloadImages = async () => {
      const promises = images.map((src, index) => {
        return new Promise<number>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(index);
          img.onerror = reject;
          img.src = src;
        });
      });

      try {
        const loadedIndices = await Promise.all(promises);
        setLoadedImages(new Set(loadedIndices));
        setIsLoading(false);
      } catch (error) {
        console.error('Error preloading 360 images:', error);
        setIsLoading(false);
      }
    };

    if (images.length > 0) {
      preloadImages();
    }
  }, [images]);

  // 自动旋转
  useEffect(() => {
    if (isPlaying && !isDragging && images.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
      }, rotationSpeed);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, isDragging, images.length, rotationSpeed]);

  // 处理鼠标拖拽
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (isZoomed) return;
    setIsDragging(true);
    setIsPlaying(false);
    lastMouseX.current = e.clientX;
    startImageIndex.current = currentImageIndex;
  }, [isZoomed, currentImageIndex]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isZoomed) {
      // 处理缩放状态下的平移
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setZoomPosition({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
      }
      return;
    }

    if (isDragging && containerRef.current) {
      const deltaX = e.clientX - lastMouseX.current;
      const sensitivity = 2; // 调整灵敏度
      const imageStep = Math.floor(Math.abs(deltaX) / sensitivity);
      
      if (imageStep > 0) {
        const direction = deltaX > 0 ? 1 : -1;
        const newIndex = (startImageIndex.current + (direction * imageStep)) % images.length;
        setCurrentImageIndex(newIndex < 0 ? images.length + newIndex : newIndex);
      }
    }
  }, [isDragging, isZoomed, images.length]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // 触摸事件处理
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (isZoomed) return;
    setIsDragging(true);
    setIsPlaying(false);
    lastMouseX.current = e.touches[0].clientX;
    startImageIndex.current = currentImageIndex;
  }, [isZoomed, currentImageIndex]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (isZoomed) return;
    if (isDragging) {
      const deltaX = e.touches[0].clientX - lastMouseX.current;
      const sensitivity = 3;
      const imageStep = Math.floor(Math.abs(deltaX) / sensitivity);
      
      if (imageStep > 0) {
        const direction = deltaX > 0 ? 1 : -1;
        const newIndex = (startImageIndex.current + (direction * imageStep)) % images.length;
        setCurrentImageIndex(newIndex < 0 ? images.length + newIndex : newIndex);
      }
    }
  }, [isDragging, isZoomed, images.length]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // 播放/暂停切换
  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  // 重置到第一帧
  const resetToStart = () => {
    setCurrentImageIndex(0);
    setIsPlaying(false);
  };

  // 缩放切换
  const toggleZoom = () => {
    setIsZoomed(!isZoomed);
    setZoomLevel(isZoomed ? 1 : 2);
    setZoomPosition({ x: 50, y: 50 });
  };

  // 全屏切换
  const toggleFullscreen = () => {
    setShowFullscreen(!showFullscreen);
  };

  if (images.length === 0) {
    return (
      <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">{t('no360ImagesAvailable')}</p>
      </div>
    );
  }

  const ViewerContent = ({ isFullscreen = false }: { isFullscreen?: boolean }) => (
    <div className={cn(
      'relative bg-gray-100 rounded-lg overflow-hidden',
      isFullscreen ? 'w-full h-full' : 'aspect-square',
      className
    )}>
      {/* Loading Indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
          <div className="flex flex-col items-center space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <p className="text-sm text-gray-600">{t('loading360View')}</p>
          </div>
        </div>
      )}

      {/* 360度图片容器 */}
      <div
        ref={containerRef}
        className={cn(
          'relative w-full h-full cursor-grab select-none',
          isDragging && 'cursor-grabbing',
          isZoomed && 'cursor-zoom-out'
        )}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <img
          src={images[currentImageIndex]}
          alt={`${productName} - 360° View ${currentImageIndex + 1}`}
          className={cn(
            'w-full h-full object-cover transition-transform duration-200',
            isZoomed && 'scale-200'
          )}
          style={
            isZoomed
              ? {
                  transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                  transform: `scale(${zoomLevel})`,
                }
              : {}
          }
          draggable={false}
        />

        {/* 360度指示器 */}
        <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium">
          360°
        </div>

        {/* 进度指示器 */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-black/50 rounded-full p-2">
            <div className="flex items-center space-x-2 text-white text-sm">
              <span>{currentImageIndex + 1}</span>
              <div className="flex-1 bg-white/30 rounded-full h-1">
                <div
                  className="bg-white rounded-full h-1 transition-all duration-200"
                  style={{ width: `${((currentImageIndex + 1) / images.length) * 100}%` }}
                />
              </div>
              <span>{images.length}</span>
            </div>
          </div>
        </div>

        {/* 拖拽提示 */}
        {!isDragging && !isPlaying && !isZoomed && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-black/70 text-white px-4 py-2 rounded-lg text-sm animate-pulse">
              {t('dragToRotate')}
            </div>
          </div>
        )}
      </div>

      {/* 控制按钮 */}
      <div className="absolute top-4 right-4 flex flex-col space-y-2">
        <button
          onClick={togglePlayback}
          className="bg-black/70 text-white p-2 rounded-full hover:bg-black/80 transition-colors"
          title={isPlaying ? t('pause') : t('play')}
        >
          {isPlaying ? (
            <PauseIcon className="w-5 h-5" />
          ) : (
            <PlayIcon className="w-5 h-5" />
          )}
        </button>

        <button
          onClick={resetToStart}
          className="bg-black/70 text-white p-2 rounded-full hover:bg-black/80 transition-colors"
          title={t('resetView')}
        >
          <ArrowPathIcon className="w-5 h-5" />
        </button>

        <button
          onClick={toggleZoom}
          className="bg-black/70 text-white p-2 rounded-full hover:bg-black/80 transition-colors"
          title={isZoomed ? t('zoomOut') : t('zoomIn')}
        >
          <MagnifyingGlassIcon className="w-5 h-5" />
        </button>

        {!isFullscreen && (
          <button
            onClick={toggleFullscreen}
            className="bg-black/70 text-white p-2 rounded-full hover:bg-black/80 transition-colors"
            title={t('fullscreen')}
          >
            <ArrowsPointingOutIcon className="w-5 h-5" />
          </button>
        )}

        {isFullscreen && (
          <button
            onClick={toggleFullscreen}
            className="bg-black/70 text-white p-2 rounded-full hover:bg-black/80 transition-colors"
            title={t('exitFullscreen')}
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* 使用说明 */}
      {!isFullscreen && (
        <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded text-xs">
          {t('360ViewInstructions')}
        </div>
      )}
    </div>
  );

  return (
    <>
      <ViewerContent />
      
      {/* 全屏模态框 */}
      {showFullscreen && (
        <div className="fixed inset-0 z-50 bg-black">
          <ViewerContent isFullscreen />
        </div>
      )}
    </>
  );
};

export default Product360Viewer;