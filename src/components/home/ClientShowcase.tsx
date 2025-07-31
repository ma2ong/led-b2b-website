/**
 * 客户展示和信任信号组件
 */
import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'next-i18next';
import { cn } from '@/lib/utils';

// 客户数据接口
interface Client {
  id: string;
  name: string;
  logo: string;
  logoWhite?: string; // 白色版本logo
  industry: string;
  country: string;
  website?: string;
  featured: boolean;
  testimonial?: {
    quote: string;
    author: string;
    position: string;
    rating: number;
  };
}

// 信任信号数据接口
interface TrustSignal {
  id: string;
  type: 'certification' | 'award' | 'partnership' | 'achievement';
  title: string;
  description: string;
  image: string;
  year?: string;
  organization?: string;
}

interface ClientShowcaseProps {
  clients?: Client[];
  trustSignals?: TrustSignal[];
  showTestimonials?: boolean;
  autoScroll?: boolean;
  scrollSpeed?: number;
  className?: string;
}

// 默认客户数据
const defaultClients: Client[] = [
  {
    id: 'apple',
    name: 'Apple Inc.',
    logo: '/images/clients/apple.png',
    logoWhite: '/images/clients/apple-white.png',
    industry: 'Technology',
    country: 'United States',
    website: 'https://apple.com',
    featured: true,
    testimonial: {
      quote: 'Lejin LED delivered exceptional quality displays for our retail stores worldwide. Their attention to detail and technical expertise exceeded our expectations.',
      author: 'Sarah Johnson',
      position: 'VP of Retail Operations',
      rating: 5
    }
  },
  {
    id: 'samsung',
    name: 'Samsung Electronics',
    logo: '/images/clients/samsung.png',
    logoWhite: '/images/clients/samsung-white.png',
    industry: 'Electronics',
    country: 'South Korea',
    website: 'https://samsung.com',
    featured: true,
    testimonial: {
      quote: 'Outstanding partnership in developing cutting-edge display solutions. Lejin LED\'s innovation and reliability make them our preferred partner.',
      author: 'Kim Min-jun',
      position: 'Director of Display Technology',
      rating: 5
    }
  },
  {
    id: 'coca-cola',
    name: 'The Coca-Cola Company',
    logo: '/images/clients/coca-cola.png',
    logoWhite: '/images/clients/coca-cola-white.png',
    industry: 'Beverage',
    country: 'United States',
    website: 'https://coca-cola.com',
    featured: true,
    testimonial: {
      quote: 'Lejin LED helped us create stunning advertising displays that capture attention and drive brand engagement across global markets.',
      author: 'Maria Rodriguez',
      position: 'Global Marketing Director',
      rating: 5
    }
  },
  {
    id: 'mercedes-benz',
    name: 'Mercedes-Benz',
    logo: '/images/clients/mercedes-benz.png',
    logoWhite: '/images/clients/mercedes-benz-white.png',
    industry: 'Automotive',
    country: 'Germany',
    website: 'https://mercedes-benz.com',
    featured: false
  },
  {
    id: 'nike',
    name: 'Nike Inc.',
    logo: '/images/clients/nike.png',
    logoWhite: '/images/clients/nike-white.png',
    industry: 'Sports & Apparel',
    country: 'United States',
    website: 'https://nike.com',
    featured: false
  },
  {
    id: 'alibaba',
    name: 'Alibaba Group',
    logo: '/images/clients/alibaba.png',
    logoWhite: '/images/clients/alibaba-white.png',
    industry: 'E-commerce',
    country: 'China',
    website: 'https://alibaba.com',
    featured: false
  },
  {
    id: 'google',
    name: 'Google LLC',
    logo: '/images/clients/google.png',
    logoWhite: '/images/clients/google-white.png',
    industry: 'Technology',
    country: 'United States',
    website: 'https://google.com',
    featured: false
  },
  {
    id: 'microsoft',
    name: 'Microsoft Corporation',
    logo: '/images/clients/microsoft.png',
    logoWhite: '/images/clients/microsoft-white.png',
    industry: 'Technology',
    country: 'United States',
    website: 'https://microsoft.com',
    featured: false
  },
  {
    id: 'bmw',
    name: 'BMW Group',
    logo: '/images/clients/bmw.png',
    logoWhite: '/images/clients/bmw-white.png',
    industry: 'Automotive',
    country: 'Germany',
    website: 'https://bmw.com',
    featured: false
  },
  {
    id: 'sony',
    name: 'Sony Corporation',
    logo: '/images/clients/sony.png',
    logoWhite: '/images/clients/sony-white.png',
    industry: 'Electronics',
    country: 'Japan',
    website: 'https://sony.com',
    featured: false
  }
];

// 默认信任信号数据
const defaultTrustSignals: TrustSignal[] = [
  {
    id: 'iso-9001',
    type: 'certification',
    title: 'ISO 9001:2015',
    description: 'Quality Management System Certification',
    image: '/images/certifications/iso-9001.png',
    year: '2023',
    organization: 'ISO'
  },
  {
    id: 'ce-marking',
    type: 'certification',
    title: 'CE Marking',
    description: 'European Conformity Certification',
    image: '/images/certifications/ce-marking.png',
    organization: 'European Union'
  },
  {
    id: 'fcc-certification',
    type: 'certification',
    title: 'FCC Certification',
    description: 'Federal Communications Commission Approval',
    image: '/images/certifications/fcc.png',
    organization: 'FCC'
  },
  {
    id: 'led-industry-award',
    type: 'award',
    title: 'LED Industry Excellence Award',
    description: 'Outstanding Innovation in LED Display Technology',
    image: '/images/awards/led-excellence.png',
    year: '2023',
    organization: 'LED Industry Association'
  },
  {
    id: 'green-technology',
    type: 'certification',
    title: 'Green Technology Certification',
    description: 'Environmentally Sustainable Manufacturing',
    image: '/images/certifications/green-tech.png',
    year: '2023',
    organization: 'Green Tech Alliance'
  },
  {
    id: 'global-partner',
    type: 'partnership',
    title: 'Global Technology Partner',
    description: 'Certified Technology Integration Partner',
    image: '/images/partnerships/global-tech.png',
    organization: 'Global Tech Alliance'
  }
];

// 客户logo组件
const ClientLogo: React.FC<{
  client: Client;
  variant?: 'default' | 'white';
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
}> = ({ client, variant = 'default', size = 'md', showTooltip = true }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-12',
    lg: 'h-16'
  };

  const logoSrc = variant === 'white' && client.logoWhite ? client.logoWhite : client.logo;

  return (
    <div
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <img
        src={logoSrc}
        alt={client.name}
        className={cn(
          'w-auto object-contain transition-all duration-300 filter grayscale hover:grayscale-0 hover:scale-110',
          sizeClasses[size]
        )}
      />
      
      {/* Tooltip */}
      {showTooltip && isHovered && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap z-10">
          <div className="font-medium">{client.name}</div>
          <div className="text-xs text-gray-300">{client.industry} • {client.country}</div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );
};

// 信任信号组件
const TrustSignalBadge: React.FC<{
  signal: TrustSignal;
  size?: 'sm' | 'md' | 'lg';
}> = ({ signal, size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-12',
    md: 'h-16',
    lg: 'h-20'
  };

  return (
    <div className="group relative bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
      <div className="flex flex-col items-center text-center">
        <img
          src={signal.image}
          alt={signal.title}
          className={cn('w-auto object-contain mb-2', sizeClasses[size])}
        />
        <h4 className="font-semibold text-gray-900 text-sm mb-1">{signal.title}</h4>
        <p className="text-xs text-gray-600 line-clamp-2">{signal.description}</p>
        {signal.year && (
          <span className="text-xs text-primary-600 font-medium mt-1">{signal.year}</span>
        )}
      </div>
      
      {/* Hover Details */}
      <div className="absolute inset-0 bg-primary-600 text-white rounded-xl p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center text-center">
        <h4 className="font-semibold mb-2">{signal.title}</h4>
        <p className="text-sm mb-2">{signal.description}</p>
        {signal.organization && (
          <p className="text-xs opacity-90">Issued by {signal.organization}</p>
        )}
        {signal.year && (
          <p className="text-xs opacity-90 mt-1">Year: {signal.year}</p>
        )}
      </div>
    </div>
  );
};

// 客户证言组件
const TestimonialCard: React.FC<{
  client: Client;
  isActive: boolean;
}> = ({ client, isActive }) => {
  if (!client.testimonial) return null;

  return (
    <div className={cn(
      'bg-white rounded-2xl p-8 shadow-lg transition-all duration-500',
      isActive ? 'opacity-100 scale-100' : 'opacity-50 scale-95'
    )}>
      {/* Quote */}
      <div className="mb-6">
        <svg className="w-8 h-8 text-primary-500 mb-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-10zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z" />
        </svg>
        <p className="text-lg text-gray-700 leading-relaxed italic">
          "{client.testimonial.quote}"
        </p>
      </div>

      {/* Author */}
      <div className="flex items-center">
        <div className="flex-1">
          <p className="font-semibold text-gray-900">{client.testimonial.author}</p>
          <p className="text-sm text-gray-600">{client.testimonial.position}</p>
          <p className="text-sm text-primary-600 font-medium">{client.name}</p>
        </div>
        
        {/* Rating */}
        <div className="flex space-x-1">
          {Array.from({ length: 5 }, (_, i) => (
            <svg
              key={i}
              className={cn(
                'w-5 h-5',
                i < client.testimonial!.rating ? 'text-yellow-400' : 'text-gray-300'
              )}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
      </div>
    </div>
  );
};

const ClientShowcase: React.FC<ClientShowcaseProps> = ({
  clients = defaultClients,
  trustSignals = defaultTrustSignals,
  showTestimonials = true,
  autoScroll = true,
  scrollSpeed = 30,
  className
}) => {
  const { t } = useTranslation('home');
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

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

  // Auto-scroll for client logos
  useEffect(() => {
    if (!autoScroll || !scrollRef.current) return;

    const scrollContainer = scrollRef.current;
    let scrollPosition = 0;
    const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;

    const scroll = () => {
      scrollPosition += 1;
      if (scrollPosition >= maxScroll) {
        scrollPosition = 0;
      }
      scrollContainer.scrollLeft = scrollPosition;
    };

    const interval = setInterval(scroll, scrollSpeed);
    return () => clearInterval(interval);
  }, [autoScroll, scrollSpeed]);

  // Testimonial rotation
  useEffect(() => {
    if (!showTestimonials) return;

    const testimonialsWithQuotes = clients.filter(client => client.testimonial);
    if (testimonialsWithQuotes.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonialsWithQuotes.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [clients, showTestimonials]);

  const testimonialsWithQuotes = clients.filter(client => client.testimonial);

  return (
    <section
      ref={sectionRef}
      className={cn(
        'py-16 lg:py-24 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden',
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
          'text-center mb-16',
          isVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'
        )}>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Trusted by{' '}
            <span className="bg-gradient-to-r from-primary-600 to-blue-600 bg-clip-text text-transparent">
              Industry Leaders
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Join thousands of satisfied customers worldwide who trust Lejin LED for their 
            display solutions. From Fortune 500 companies to innovative startups, 
            we deliver excellence across all industries.
          </p>
        </div>

        {/* Client Logos */}
        <div className={cn(
          'mb-16',
          isVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'
        )} style={{ animationDelay: '200ms' }}>
          <div
            ref={scrollRef}
            className="flex space-x-12 overflow-x-hidden"
            style={{ scrollBehavior: 'smooth' }}
          >
            {/* Duplicate clients for seamless scrolling */}
            {[...clients, ...clients].map((client, index) => (
              <div key={`${client.id}-${index}`} className="flex-shrink-0">
                <ClientLogo client={client} size="lg" />
              </div>
            ))}
          </div>
        </div>

        {/* Trust Signals */}
        <div className={cn(
          'mb-16',
          isVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'
        )} style={{ animationDelay: '400ms' }}>
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Certifications & Recognition
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {trustSignals.map((signal) => (
              <TrustSignalBadge key={signal.id} signal={signal} />
            ))}
          </div>
        </div>

        {/* Testimonials */}
        {showTestimonials && testimonialsWithQuotes.length > 0 && (
          <div className={cn(
            'mb-16',
            isVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'
          )} style={{ animationDelay: '600ms' }}>
            <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
              What Our Clients Say
            </h3>
            
            <div className="max-w-4xl mx-auto">
              <div className="relative">
                {testimonialsWithQuotes.map((client, index) => (
                  <div
                    key={client.id}
                    className={cn(
                      'transition-all duration-500',
                      index === currentTestimonial ? 'block' : 'hidden'
                    )}
                  >
                    <TestimonialCard
                      client={client}
                      isActive={index === currentTestimonial}
                    />
                  </div>
                ))}
              </div>

              {/* Testimonial Indicators */}
              {testimonialsWithQuotes.length > 1 && (
                <div className="flex justify-center mt-8 space-x-2">
                  {testimonialsWithQuotes.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentTestimonial(index)}
                      className={cn(
                        'w-3 h-3 rounded-full transition-all duration-200',
                        index === currentTestimonial
                          ? 'bg-primary-500 scale-125'
                          : 'bg-gray-300 hover:bg-gray-400'
                      )}
                      aria-label={`View testimonial ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Statistics */}
        <div className={cn(
          'text-center',
          isVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'
        )} style={{ animationDelay: '800ms' }}>
          <div className="bg-white rounded-3xl shadow-xl p-8 lg:p-12 max-w-4xl mx-auto border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <p className="text-4xl font-bold text-primary-600 mb-2">500+</p>
                <p className="text-gray-600">Global Clients</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-primary-600 mb-2">50+</p>
                <p className="text-gray-600">Countries Served</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-primary-600 mb-2">99%</p>
                <p className="text-gray-600">Client Satisfaction</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-primary-600 mb-2">15+</p>
                <p className="text-gray-600">Years Experience</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ClientShowcase;