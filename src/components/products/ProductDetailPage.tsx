/**
 * 产品详情页面组件
 */
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { 
  HeartIcon, 
  ShareIcon, 
  ShoppingCartIcon,
  StarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  PlayIcon,
  DocumentArrowDownIcon,
  PrinterIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { cn } from '@/lib/utils';
import Button from '@/components/ui/Button';
import { Product } from '@/types/product';
import { LocalizedPrice } from '@/components/i18n/LocalizedNumber';
import SEOHead from '@/components/seo/SEOHead';

interface ProductDetailPageProps {
  product: Product;
  relatedProducts?: Product[];
  className?: string;
}

// 图片画廊组件
const ImageGallery: React.FC<{
  images: { main: string; gallery?: string[] };
  productName: string;
}> = ({ images, productName }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  
  const allImages = [images.main, ...(images.gallery || [])];
  
  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };
  
  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-100">
        <img
          src={allImages[currentImageIndex]}
          alt={`${productName} - Image ${currentImageIndex + 1}`}
          className={cn(
            'w-full h-full object-cover transition-transform duration-300 cursor-pointer',
            isZoomed ? 'scale-150' : 'scale-100'
          )}
          onClick={() => setShowLightbox(true)}
          onMouseEnter={() => setIsZoomed(true)}
          onMouseLeave={() => setIsZoomed(false)}
        />
        
        {/* Navigation Arrows */}
        {allImages.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-200"
              aria-label="Previous image"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-200"
              aria-label="Next image"
            >
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </>
        )}
        
        {/* Zoom Indicator */}
        <div className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full">
          <MagnifyingGlassIcon className="w-4 h-4" />
        </div>
      </div>

      {/* Thumbnail Gallery */}
      {allImages.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {allImages.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={cn(
                'aspect-square overflow-hidden rounded-lg border-2 transition-all duration-200',
                index === currentImageIndex
                  ? 'border-primary-500 ring-2 ring-primary-200'
                  : 'border-gray-200 hover:border-gray-300'
              )}
            >
              <img
                src={image}
                alt={`${productName} thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {showLightbox && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
          <button
            onClick={() => setShowLightbox(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 p-2"
            aria-label="Close lightbox"
          >
            <XMarkIcon className="w-8 h-8" />
          </button>
          
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={allImages[currentImageIndex]}
              alt={`${productName} - Image ${currentImageIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />
            
            {allImages.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full"
                >
                  <ChevronLeftIcon className="w-6 h-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full"
                >
                  <ChevronRightIcon className="w-6 h-6" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};//
 规格表格组件
const SpecificationTable: React.FC<{
  specifications: Product['specifications'];
}> = ({ specifications }) => {
  const { t } = useTranslation('products');

  const specGroups = [
    {
      title: 'Display Specifications',
      specs: [
        { label: 'Pixel Pitch', value: specifications.pixelPitch },
        { label: 'Resolution', value: `${specifications.resolution.width} × ${specifications.resolution.height}` },
        { label: 'Brightness', value: `${specifications.brightness} nits` },
        { label: 'Refresh Rate', value: `${specifications.refreshRate} Hz` },
        { label: 'Color Depth', value: `${specifications.colorDepth} bit` },
        { label: 'Viewing Angle', value: specifications.viewingAngle }
      ]
    },
    {
      title: 'Physical Specifications',
      specs: [
        { label: 'Dimensions', value: `${specifications.dimensions.width} × ${specifications.dimensions.height} × ${specifications.dimensions.depth} ${specifications.dimensions.unit}` },
        { label: 'Weight', value: `${specifications.weight} kg` },
        { label: 'Environment', value: specifications.environment },
        { label: 'IP Rating', value: specifications.ipRating }
      ]
    },
    {
      title: 'Performance',
      specs: [
        { label: 'Power Consumption', value: `${specifications.powerConsumption} W/m²` },
        { label: 'Operating Temperature', value: specifications.operatingTemperature }
      ]
    }
  ];

  return (
    <div className="space-y-8">
      {specGroups.map((group, groupIndex) => (
        <div key={groupIndex}>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{group.title}</h3>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full">
              <tbody>
                {group.specs.map((spec, index) => (
                  <tr key={index} className={cn(
                    'border-b border-gray-100 last:border-b-0',
                    index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                  )}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 w-1/3">
                      {spec.label}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {spec.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
};

// 相关产品组件
const RelatedProducts: React.FC<{
  products: Product[];
}> = ({ products }) => {
  const { t } = useTranslation('products');
  const router = useRouter();

  if (!products || products.length === 0) return null;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Related Products</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.slice(0, 4).map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden group"
            onClick={() => router.push(`/products/${product.slug}`)}
          >
            <div className="relative aspect-square overflow-hidden">
              <img
                src={product.images.main}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                {product.name}
              </h3>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {product.description}
              </p>
              <div className="flex items-center justify-between">
                <div className="text-lg font-bold text-primary-600">
                  <LocalizedPrice value={product.price.current} currency={product.price.currency} />
                </div>
                <span className="text-xs text-gray-500">
                  {product.specifications.pixelPitch}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  relatedProducts = [],
  className
}) => {
  const { t } = useTranslation('products');
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(0);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'specifications', label: 'Specifications' },
    { id: 'applications', label: 'Applications' },
    { id: 'downloads', label: 'Downloads' }
  ];

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadBrochure = () => {
    // Implement brochure download
    console.log('Download brochure for:', product.id);
  };

  const handleGetQuote = () => {
    router.push(`/contact?product=${product.slug}&quantity=${quantity}`);
  };

  return (
    <>
      <SEOHead
        title={product.name}
        description={product.description}
        keywords={product.tags.join(', ')}
        image={product.images.main}
        type="product"
      />
      
      <div className={cn('min-h-screen bg-gray-50', className)}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
            <button onClick={() => router.push('/')} className="hover:text-primary-600">
              Home
            </button>
            <span>/</span>
            <button onClick={() => router.push('/products')} className="hover:text-primary-600">
              Products
            </button>
            <span>/</span>
            <button onClick={() => router.push(`/products?category=${product.category}`)} className="hover:text-primary-600">
              {product.category}
            </button>
            <span>/</span>
            <span className="text-gray-900">{product.name}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            {/* Left Column - Images */}
            <div>
              <ImageGallery images={product.images} productName={product.name} />
            </div>

            {/* Right Column - Product Info */}
            <div className="space-y-6">
              {/* Product Header */}
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                    <p className="text-lg text-gray-600">{product.model}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsWishlisted(!isWishlisted)}
                      className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                      aria-label="Add to wishlist"
                    >
                      {isWishlisted ? (
                        <HeartSolidIcon className="w-6 h-6 text-red-500" />
                      ) : (
                        <HeartIcon className="w-6 h-6 text-gray-600" />
                      )}
                    </button>
                    <button
                      onClick={handleShare}
                      className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                      aria-label="Share product"
                    >
                      <ShareIcon className="w-6 h-6 text-gray-600" />
                    </button>
                    <button
                      onClick={handlePrint}
                      className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                      aria-label="Print page"
                    >
                      <PrinterIcon className="w-6 h-6 text-gray-600" />
                    </button>
                  </div>
                </div>

                {/* Rating */}
                {product.rating && (
                  <div className="flex items-center mb-4">
                    <div className="flex items-center">
                      {Array.from({ length: 5 }, (_, i) => (
                        <StarIcon
                          key={i}
                          className={cn(
                            'w-5 h-5',
                            i < Math.floor(product.rating!) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          )}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600 ml-2">
                      {product.rating} ({product.reviewCount} reviews)
                    </span>
                  </div>
                )}

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {product.featured && (
                    <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-medium">
                      Featured
                    </span>
                  )}
                  {product.isNew && (
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                      New
                    </span>
                  )}
                  {product.onSale && (
                    <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium">
                      On Sale
                    </span>
                  )}
                  <span className={cn(
                    'px-3 py-1 rounded-full text-sm font-medium',
                    product.specifications.environment === 'indoor' 
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-green-100 text-green-700'
                  )}>
                    {product.specifications.environment}
                  </span>
                </div>
              </div>

              {/* Price */}
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-baseline gap-4 mb-4">
                  <div className="text-3xl font-bold text-primary-600">
                    <LocalizedPrice value={product.price.current} currency={product.price.currency} />
                  </div>
                  {product.price.original && product.price.original > product.price.current && (
                    <div className="text-xl text-gray-500 line-through">
                      <LocalizedPrice value={product.price.original} currency={product.price.currency} />
                    </div>
                  )}
                  <span className="text-sm text-gray-600">{product.price.unit}</span>
                </div>

                {/* Availability */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center">
                    <div className={cn(
                      'w-3 h-3 rounded-full mr-2',
                      product.availability.inStock ? 'bg-green-500' : 'bg-red-500'
                    )} />
                    <span className="text-sm font-medium">
                      {product.availability.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                  <span className="text-sm text-gray-600">
                    Lead Time: {product.availability.leadTime}
                  </span>
                  <span className="text-sm text-gray-600">
                    MOQ: {product.availability.moq} units
                  </span>
                </div>

                {/* Quantity */}
                <div className="flex items-center gap-4 mb-6">
                  <label className="text-sm font-medium text-gray-700">Quantity:</label>
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 hover:bg-gray-100 transition-colors"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-16 text-center border-0 focus:ring-0"
                      min="1"
                    />
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-2 hover:bg-gray-100 transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-sm text-gray-600">m² (minimum {product.availability.moq})</span>
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                  <Button
                    onClick={handleGetQuote}
                    size="lg"
                    className="flex-1 bg-primary-600 hover:bg-primary-700 text-white"
                    leftIcon={<ShoppingCartIcon className="w-5 h-5" />}
                  >
                    Get Quote
                  </Button>
                  <Button
                    onClick={handleDownloadBrochure}
                    variant="outline"
                    size="lg"
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                    leftIcon={<DocumentArrowDownIcon className="w-5 h-5" />}
                  >
                    Brochure
                  </Button>
                  <Button
                    href="/contact"
                    variant="outline"
                    size="lg"
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                    leftIcon={<EnvelopeIcon className="w-5 h-5" />}
                  >
                    Contact
                  </Button>
                </div>
              </div>

              {/* Key Features */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Features</h3>
                <div className="grid grid-cols-2 gap-3">
                  {product.features.map((feature, index) => (
                    <div key={index} className="flex items-center">
                      <div className="w-2 h-2 bg-primary-500 rounded-full mr-3" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Applications */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Applications</h3>
                <div className="flex flex-wrap gap-2">
                  {product.applications.map((app, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-primary-100 text-primary-700 text-sm rounded-full"
                    >
                      {app}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Tabs Section */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-16">
            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                      activeTab === tab.id
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'overview' && (
                <div className="prose max-w-none">
                  <p className="text-lg text-gray-700 leading-relaxed mb-6">
                    {product.description}
                  </p>
                  
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Product Highlights</h3>
                  <ul className="space-y-2">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {activeTab === 'specifications' && (
                <SpecificationTable specifications={product.specifications} />
              )}

              {activeTab === 'applications' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-900">Ideal Applications</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {product.applications.map((app, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-6">
                        <h4 className="font-semibold text-gray-900 mb-2">{app}</h4>
                        <p className="text-sm text-gray-600">
                          Perfect for {app.toLowerCase()} environments with high-quality display requirements.
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'downloads' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-900">Available Downloads</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">Product Brochure</h4>
                          <p className="text-sm text-gray-600">Detailed product information and specifications</p>
                        </div>
                        <DocumentArrowDownIcon className="w-6 h-6 text-gray-400" />
                      </div>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">Technical Datasheet</h4>
                          <p className="text-sm text-gray-600">Complete technical specifications</p>
                        </div>
                        <DocumentArrowDownIcon className="w-6 h-6 text-gray-400" />
                      </div>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">Installation Guide</h4>
                          <p className="text-sm text-gray-600">Step-by-step installation instructions</p>
                        </div>
                        <DocumentArrowDownIcon className="w-6 h-6 text-gray-400" />
                      </div>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">CAD Files</h4>
                          <p className="text-sm text-gray-600">3D models and technical drawings</p>
                        </div>
                        <DocumentArrowDownIcon className="w-6 h-6 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <RelatedProducts products={relatedProducts} />
          )}
        </div>
      </div>
    </>
  );
};

export default ProductDetailPage;