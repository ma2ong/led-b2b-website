/**
 * 解决方案详情页面组件
 */
import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckIcon,
  StarIcon,
  ArrowRightIcon,
  DocumentArrowDownIcon,
  ShareIcon,
  ChatBubbleLeftRightIcon,
  PlayIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Solution } from '@/types/solution';
import { Product } from '@/types/product';
import { CaseStudy } from '@/types/case-study';
import SEOHead from '@/components/seo/SEOHead';

interface SolutionDetailPageProps {
  solution: Solution;
  recommendedProducts?: Product[];
  relatedCaseStudies?: CaseStudy[];
  relatedSolutions?: Solution[];
  className?: string;
}

const SolutionDetailPage: React.FC<SolutionDetailPageProps> = ({
  solution,
  recommendedProducts = [],
  relatedCaseStudies = [],
  relatedSolutions = [],
  className
}) => {
  const { t } = useTranslation('solutions');
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'specs' | 'applications' | 'cases'>('overview');

  const tabs = [
    { id: 'overview', label: t('overview') },
    { id: 'specs', label: t('specifications') },
    { id: 'applications', label: t('applications') },
    { id: 'cases', label: t('casesStudies') },
  ];

  // 图片导航
  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % solution.gallery.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + solution.gallery.length) % solution.gallery.length);
  };

  // 分享功能
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: solution.title,
          text: solution.description,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      navigator.clipboard?.writeText(window.location.href);
    }
  };

  // 询盘功能
  const handleInquiry = () => {
    router.push(`/contact?solution=${solution.slug}`);
  };

  // 技术规格分组
  const groupedSpecs = solution.technicalSpecs.reduce((acc, spec) => {
    if (!acc[spec.category]) {
      acc[spec.category] = [];
    }
    acc[spec.category].push(spec);
    return acc;
  }, {} as Record<string, typeof solution.technicalSpecs>);

  return (
    <>
      <SEOHead
        title={solution.title}
        description={solution.description}
        keywords={solution.tags.join(', ')}
        image={solution.heroImage}
        type="article"
      />

      <div className={cn('min-h-screen bg-gray-50', className)}>
        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-gray-900 to-gray-800 text-white">
          <div className="absolute inset-0">
            <img
              src={solution.heroImage}
              alt={solution.title}
              className="w-full h-full object-cover opacity-30"
            />
          </div>
          
          <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-16">
            {/* Breadcrumb */}
            <nav className="flex items-center space-x-2 text-sm text-gray-300 mb-8">
              <button onClick={() => router.push('/')} className="hover:text-white">
                {t('home')}
              </button>
              <ChevronRightIcon className="w-4 h-4" />
              <button onClick={() => router.push('/solutions')} className="hover:text-white">
                {t('solutions')}
              </button>
              <ChevronRightIcon className="w-4 h-4" />
              <span className="text-white">{solution.title}</span>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="flex items-center space-x-4 mb-4">
                  <span className="bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {t(solution.industry)}
                  </span>
                  {solution.isFeatured && (
                    <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
                      <StarIcon className="w-4 h-4 mr-1" />
                      {t('featured')}
                    </span>
                  )}
                </div>
                
                <h1 className="text-4xl lg:text-5xl font-bold mb-6">
                  {solution.title}
                </h1>
                
                <p className="text-xl text-gray-300 mb-8">
                  {solution.description}
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    size="lg"
                    onClick={handleInquiry}
                    className="bg-primary-600 hover:bg-primary-700 text-white"
                    leftIcon={<ChatBubbleLeftRightIcon className="w-5 h-5" />}
                  >
                    {t('getQuote')}
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={handleShare}
                    className="border-white text-white hover:bg-white hover:text-gray-900"
                    leftIcon={<ShareIcon className="w-5 h-5" />}
                  >
                    {t('share')}
                  </Button>
                </div>
              </div>

              {/* Key Benefits */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <h3 className="text-xl font-semibold mb-4">{t('keyBenefits')}</h3>
                <div className="space-y-3">
                  {solution.benefits.slice(0, 4).map((benefit, index) => (
                    <div key={index} className="flex items-center">
                      <CheckIcon className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Left Column - Content */}
            <div className="lg:col-span-2">
              {/* Image Gallery */}
              {solution.gallery.length > 0 && (
                <div className="mb-12">
                  <div className="relative aspect-video bg-gray-100 rounded-xl overflow-hidden mb-4">
                    <img
                      src={solution.gallery[currentImageIndex]?.url}
                      alt={solution.gallery[currentImageIndex]?.alt}
                      className="w-full h-full object-cover"
                    />
                    
                    {solution.gallery.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                        >
                          <ChevronLeftIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                        >
                          <ChevronRightIcon className="w-5 h-5" />
                        </button>
                      </>
                    )}

                    {/* Play button for video */}
                    <button
                      onClick={() => setShowVideoModal(true)}
                      className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors group"
                    >
                      <div className="bg-white/90 rounded-full p-4 group-hover:bg-white transition-colors">
                        <PlayIcon className="w-8 h-8 text-gray-900" />
                      </div>
                    </button>
                  </div>

                  {/* Thumbnail Gallery */}
                  {solution.gallery.length > 1 && (
                    <div className="flex space-x-2 overflow-x-auto pb-2">
                      {solution.gallery.map((image, index) => (
                        <button
                          key={image.id}
                          onClick={() => setCurrentImageIndex(index)}
                          className={cn(
                            'flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors',
                            index === currentImageIndex
                              ? 'border-primary-500'
                              : 'border-gray-200 hover:border-gray-300'
                          )}
                        >
                          <img
                            src={image.url}
                            alt={image.alt}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tabs */}
              <div className="border-b border-gray-200 mb-8">
                <nav className="flex space-x-8">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
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
              <div className="mb-12">
                {activeTab === 'overview' && (
                  <div className="space-y-8">
                    {/* Features */}
                    <div>
                      <h3 className="text-2xl font-semibold text-gray-900 mb-6">
                        {t('keyFeatures')}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {solution.features.map((feature, index) => (
                          <div key={index} className="flex items-center bg-gray-50 p-4 rounded-lg">
                            <CheckIcon className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                            <span className="text-gray-900">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Benefits */}
                    <div>
                      <h3 className="text-2xl font-semibold text-gray-900 mb-6">
                        {t('businessBenefits')}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {solution.benefits.map((benefit, index) => (
                          <div key={index} className="flex items-start">
                            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-4 mt-1">
                              <span className="text-primary-600 font-semibold text-sm">
                                {index + 1}
                              </span>
                            </div>
                            <div>
                              <p className="text-gray-900 font-medium">{benefit}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'specs' && (
                  <div className="space-y-8">
                    {Object.entries(groupedSpecs).map(([category, specs]) => (
                      <div key={category}>
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">
                          {category}
                        </h3>
                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                          <table className="w-full">
                            <tbody>
                              {specs.map((spec, index) => (
                                <tr key={spec.id} className={cn(
                                  'border-b border-gray-100 last:border-b-0',
                                  index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                                )}>
                                  <td className="px-6 py-4 text-sm font-medium text-gray-900 w-1/3">
                                    {spec.name}
                                  </td>
                                  <td className="px-6 py-4 text-sm text-gray-700">
                                    {spec.value} {spec.unit}
                                  </td>
                                  {spec.description && (
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                      {spec.description}
                                    </td>
                                  )}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'applications' && (
                  <div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-6">
                      {t('idealApplications')}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {solution.applications.map((application, index) => (
                        <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                          <h4 className="font-semibold text-gray-900 mb-2">{application}</h4>
                          <p className="text-sm text-gray-600">
                            {t('applicationDescription', { application })}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'cases' && (
                  <div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-6">
                      {t('successfulCases')}
                    </h3>
                    {relatedCaseStudies.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {relatedCaseStudies.map((caseStudy) => (
                          <div
                            key={caseStudy.id}
                            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => router.push(`/case-studies/${caseStudy.slug}`)}
                          >
                            <div className="aspect-video">
                              <img
                                src={caseStudy.images.hero}
                                alt={caseStudy.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="p-6">
                              <h4 className="font-semibold text-gray-900 mb-2">
                                {caseStudy.title}
                              </h4>
                              <p className="text-sm text-gray-600 mb-3">
                                {caseStudy.description}
                              </p>
                              <div className="flex items-center text-primary-600 text-sm font-medium">
                                {t('viewCase')}
                                <ArrowRightIcon className="w-4 h-4 ml-1" />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600">{t('noCasesAvailable')}</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-8">
              {/* CTA Card */}
              <div className="bg-primary-600 text-white p-6 rounded-xl">
                <h3 className="text-xl font-semibold mb-4">
                  {t('readyToGetStarted')}
                </h3>
                <p className="text-primary-100 mb-6">
                  {t('contactUsForCustomSolution')}
                </p>
                <Button
                  onClick={handleInquiry}
                  className="w-full bg-white text-primary-600 hover:bg-gray-100"
                >
                  {t('getQuote')}
                </Button>
              </div>

              {/* Recommended Products */}
              {recommendedProducts.length > 0 && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {t('recommendedProducts')}
                  </h3>
                  <div className="space-y-4">
                    {recommendedProducts.slice(0, 3).map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                        onClick={() => router.push(`/products/${product.slug}`)}
                      >
                        <img
                          src={product.images.main}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 text-sm">
                            {product.name}
                          </h4>
                          <p className="text-xs text-gray-600">
                            {product.specifications.pixelPitch}
                          </p>
                        </div>
                        <ArrowRightIcon className="w-4 h-4 text-gray-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Downloads */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {t('downloads')}
                </h3>
                <div className="space-y-3">
                  <button className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                    <div className="flex items-center">
                      <DocumentArrowDownIcon className="w-5 h-5 text-gray-600 mr-3" />
                      <span className="text-sm font-medium text-gray-900">
                        {t('solutionBrochure')}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">PDF</span>
                  </button>
                  <button className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                    <div className="flex items-center">
                      <DocumentArrowDownIcon className="w-5 h-5 text-gray-600 mr-3" />
                      <span className="text-sm font-medium text-gray-900">
                        {t('technicalSpecs')}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">PDF</span>
                  </button>
                </div>
              </div>

              {/* Related Solutions */}
              {relatedSolutions.length > 0 && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {t('relatedSolutions')}
                  </h3>
                  <div className="space-y-4">
                    {relatedSolutions.slice(0, 3).map((relatedSolution) => (
                      <div
                        key={relatedSolution.id}
                        className="cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                        onClick={() => router.push(`/solutions/${relatedSolution.slug}`)}
                      >
                        <h4 className="font-medium text-gray-900 text-sm mb-1">
                          {relatedSolution.title}
                        </h4>
                        <p className="text-xs text-gray-600 line-clamp-2">
                          {relatedSolution.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Video Modal */}
        {showVideoModal && (
          <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
            <div className="relative max-w-4xl max-h-[90vh] w-full mx-4">
              <button
                onClick={() => setShowVideoModal(false)}
                className="absolute -top-12 right-0 text-white hover:text-gray-300 p-2"
              >
                <XMarkIcon className="w-8 h-8" />
              </button>
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                {/* Video player would go here */}
                <div className="w-full h-full flex items-center justify-center text-white">
                  <p>Video Player Placeholder</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default SolutionDetailPage;