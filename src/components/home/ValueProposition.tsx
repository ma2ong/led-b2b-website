/**
 * 企业价值主张展示组件
 */
import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'next-i18next';
import { cn } from '@/lib/utils';
import Button from '@/components/ui/Button';

interface ValuePoint {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  features: string[];
  color: string;
  gradient: string;
}

interface ValuePropositionProps {
  values?: ValuePoint[];
  className?: string;
}

const defaultValues: ValuePoint[] = [
  {
    id: 'innovation',
    icon: (
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    title: 'Cutting-Edge Innovation',
    description: 'Leading the industry with breakthrough LED technology and smart display solutions.',
    features: [
      'Latest pixel pitch technology',
      'AI-powered content management',
      'Energy-efficient designs',
      'Smart monitoring systems'
    ],
    color: 'text-blue-600',
    gradient: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'quality',
    icon: (
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: 'Uncompromising Quality',
    description: 'Every product undergoes rigorous testing to ensure exceptional performance and longevity.',
    features: [
      'ISO 9001 certified manufacturing',
      '50,000+ hour lifespan',
      'IP65 weather protection',
      '5-year comprehensive warranty'
    ],
    color: 'text-green-600',
    gradient: 'from-green-500 to-emerald-500'
  },
  {
    id: 'service',
    icon: (
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    title: '24/7 Global Support',
    description: 'Comprehensive support from consultation to installation and beyond.',
    features: [
      'Expert consultation team',
      'On-site installation service',
      'Remote monitoring & maintenance',
      'Multilingual support'
    ],
    color: 'text-purple-600',
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    id: 'customization',
    icon: (
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
      </svg>
    ),
    title: 'Tailored Solutions',
    description: 'Custom-designed LED displays perfectly matched to your specific requirements.',
    features: [
      'Flexible size configurations',
      'Custom content management',
      'Brand-specific designs',
      'Scalable architectures'
    ],
    color: 'text-orange-600',
    gradient: 'from-orange-500 to-red-500'
  }
];

const ValueCard: React.FC<{
  value: ValuePoint;
  index: number;
  isVisible: boolean;
}> = ({ value, index, isVisible }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={cn(
        'group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden',
        isVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'
      )}
      style={{ animationDelay: `${index * 150}ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background Gradient */}
      <div className={cn(
        'absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-500',
        value.gradient
      )} />

      {/* Content */}
      <div className="relative p-8">
        {/* Icon */}
        <div className={cn(
          'inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 transition-all duration-300',
          'bg-gradient-to-br shadow-lg group-hover:scale-110 group-hover:shadow-xl',
          value.gradient,
          value.color
        )}>
          <div className="text-white">
            {value.icon}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-gray-800 transition-colors">
          {value.title}
        </h3>

        {/* Description */}
        <p className="text-gray-600 mb-6 leading-relaxed">
          {value.description}
        </p>

        {/* Features */}
        <ul className="space-y-3">
          {value.features.map((feature, featureIndex) => (
            <li
              key={featureIndex}
              className={cn(
                'flex items-center text-sm text-gray-700 transition-all duration-300',
                isHovered ? 'translate-x-2' : ''
              )}
              style={{ transitionDelay: `${featureIndex * 50}ms` }}
            >
              <div className={cn(
                'w-2 h-2 rounded-full mr-3 transition-all duration-300',
                'bg-gradient-to-r',
                value.gradient,
                isHovered ? 'scale-125' : ''
              )} />
              {feature}
            </li>
          ))}
        </ul>

        {/* Hover Effect Border */}
        <div className={cn(
          'absolute inset-0 rounded-2xl border-2 border-transparent transition-all duration-300',
          isHovered ? `border-gradient-to-r ${value.gradient}` : ''
        )} />
      </div>
    </div>
  );
};

const ValueProposition: React.FC<ValuePropositionProps> = ({
  values = defaultValues,
  className
}) => {
  const { t } = useTranslation('home');
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      {
        threshold: 0.2,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className={cn(
        'py-20 lg:py-32 bg-gradient-to-br from-gray-50 via-white to-gray-50 relative overflow-hidden',
        className
      )}
    >
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-64 h-64 bg-blue-200 rounded-full opacity-20 blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-purple-200 rounded-full opacity-20 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-cyan-200 to-blue-200 rounded-full opacity-10 blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <div className={cn(
          'text-center mb-16 lg:mb-20',
          isVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'
        )}>
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary-500 to-blue-500 rounded-2xl mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Why Choose{' '}
            <span className="bg-gradient-to-r from-primary-600 to-blue-600 bg-clip-text text-transparent">
              Lejin LED
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            We don't just manufacture LED displays – we create visual experiences that transform spaces, 
            engage audiences, and drive business success through innovative technology and exceptional service.
          </p>
        </div>

        {/* Value Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10 mb-16">
          {values.map((value, index) => (
            <ValueCard
              key={value.id}
              value={value}
              index={index}
              isVisible={isVisible}
            />
          ))}
        </div>

        {/* Call to Action */}
        <div className={cn(
          'text-center',
          isVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'
        )} style={{ animationDelay: '800ms' }}>
          <div className="bg-white rounded-3xl shadow-xl p-8 lg:p-12 max-w-4xl mx-auto border border-gray-100">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to Transform Your Space?
            </h3>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Join thousands of satisfied customers worldwide who trust Lejin LED for their display solutions. 
              Let's discuss how we can bring your vision to life.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-primary-600 to-blue-600 hover:from-primary-700 hover:to-blue-700 text-white px-8 py-4 shadow-lg hover:shadow-xl transition-all duration-300"
                href="/contact"
              >
                Get Free Consultation
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-gray-300 text-gray-700 hover:border-primary-500 hover:text-primary-600 px-8 py-4 transition-all duration-300"
                href="/products"
              >
                Explore Products
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ValueProposition;