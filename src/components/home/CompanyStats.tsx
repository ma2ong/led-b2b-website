/**
 * 企业实力数据展示组件
 */
import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'next-i18next';
import { cn } from '@/lib/utils';

interface StatItem {
  id: string;
  value: number;
  suffix?: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  color?: string;
}

interface CompanyStatsProps {
  stats?: StatItem[];
  animationDuration?: number;
  animationDelay?: number;
  className?: string;
}

const defaultStats: StatItem[] = [
  {
    id: 'projects',
    value: 1000,
    suffix: '+',
    label: 'Successful Projects',
    description: 'Completed installations worldwide',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    color: 'text-blue-500',
  },
  {
    id: 'countries',
    value: 50,
    suffix: '+',
    label: 'Countries Served',
    description: 'Global presence and expertise',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: 'text-green-500',
  },
  {
    id: 'experience',
    value: 15,
    suffix: '+',
    label: 'Years Experience',
    description: 'Industry leadership and innovation',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: 'text-purple-500',
  },
  {
    id: 'satisfaction',
    value: 99,
    suffix: '%',
    label: 'Customer Satisfaction',
    description: 'Proven track record of excellence',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
    color: 'text-red-500',
  },
];

// Custom hook for counting animation
const useCountUp = (
  end: number,
  duration: number = 2000,
  start: number = 0,
  shouldStart: boolean = false
) => {
  const [count, setCount] = useState(start);

  useEffect(() => {
    if (!shouldStart) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentCount = Math.floor(easeOutQuart * (end - start) + start);
      
      setCount(currentCount);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [end, duration, start, shouldStart]);

  return count;
};

// Individual stat item component
const StatItem: React.FC<{
  stat: StatItem;
  isVisible: boolean;
  animationDelay: number;
}> = ({ stat, isVisible, animationDelay }) => {
  const count = useCountUp(stat.value, 2000, 0, isVisible);

  return (
    <div
      className="text-center group"
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      {/* Icon */}
      {stat.icon && (
        <div className={cn(
          'inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4 transition-all duration-300 group-hover:scale-110',
          stat.color
        )}>
          {stat.icon}
        </div>
      )}

      {/* Value */}
      <div className="mb-2">
        <span className="text-4xl lg:text-5xl font-bold text-gray-900">
          {count.toLocaleString()}
        </span>
        {stat.suffix && (
          <span className="text-3xl lg:text-4xl font-bold text-primary-600">
            {stat.suffix}
          </span>
        )}
      </div>

      {/* Label */}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {stat.label}
      </h3>

      {/* Description */}
      {stat.description && (
        <p className="text-sm text-gray-600 max-w-xs mx-auto">
          {stat.description}
        </p>
      )}
    </div>
  );
};

const CompanyStats: React.FC<CompanyStatsProps> = ({
  stats = defaultStats,
  animationDuration = 2000,
  animationDelay = 200,
  className,
}) => {
  const { t } = useTranslation('home');
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  // Intersection Observer for triggering animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.3,
        rootMargin: '0px 0px -100px 0px',
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
        'py-16 lg:py-24 bg-gradient-to-br from-gray-50 to-white',
        className
      )}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Trusted by Industry Leaders Worldwide
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our commitment to excellence has earned us the trust of clients across the globe, 
            delivering innovative LED solutions that exceed expectations.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {stats.map((stat, index) => (
            <StatItem
              key={stat.id}
              stat={stat}
              isVisible={isVisible}
              animationDelay={index * animationDelay}
            />
          ))}
        </div>

        {/* Additional Content */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center space-x-2 text-sm text-gray-500">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Verified statistics updated monthly</span>
          </div>
        </div>
      </div>

      {/* Background Decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-100 rounded-full opacity-20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-100 rounded-full opacity-20 blur-3xl" />
      </div>
    </section>
  );
};

export default CompanyStats;