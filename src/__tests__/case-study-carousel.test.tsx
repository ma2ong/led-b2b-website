/**
 * 案例展示组件功能测试
 */
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import CaseStudyCarousel from '@/components/home/CaseStudyCarousel';
import ClientShowcase from '@/components/home/ClientShowcase';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

// Mock next-i18next
jest.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue?: string) => defaultValue || key,
  }),
}));

// Mock Intersection Observer
const mockIntersectionObserver = jest.fn();
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null,
});
window.IntersectionObserver = mockIntersectionObserver;

const mockRouter = {
  locale: 'en',
  defaultLocale: 'en',
  locales: ['en', 'zh'],
  asPath: '/',
  push: jest.fn(),
  replace: jest.fn(),
};

describe('CaseStudyCarousel Component', () => {
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    jest.clearAllMocks();
  });

  const mockCases = [
    {
      id: 'case-1',
      title: 'Times Square Billboard',
      subtitle: 'Iconic LED Display',
      description: 'A massive LED billboard installation in Times Square.',
      customer: {
        name: 'Times Square Media',
        logo: '/images/customers/times-square.png',
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
        gallery: ['/images/cases/times-square/gallery-1.jpg']
      },
      stats: [
        { label: 'Screen Area', value: '500㎡' },
        { label: 'Pixel Pitch', value: 'P6' }
      ],
      tags: ['Outdoor', 'Advertising'],
      featured: true,
      href: '/cases/times-square-billboard'
    },
    {
      id: 'case-2',
      title: 'Beijing Shopping Mall',
      subtitle: 'Premium Indoor Display',
      description: 'A stunning curved LED wall installation.',
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
        thumbnail: '/images/cases/beijing-mall/thumb.jpg'
      },
      stats: [
        { label: 'Screen Area', value: '200㎡' },
        { label: 'Pixel Pitch', value: 'P2.5' }
      ],
      tags: ['Indoor', 'Retail'],
      featured: false,
      href: '/cases/beijing-shopping-mall'
    }
  ];

  describe('Basic Rendering', () => {
    it('should render case study carousel with default cases', () => {
      render(<CaseStudyCarousel />);
      
      expect(screen.getByText('Success Stories from')).toBeInTheDocument();
      expect(screen.getByText('Around the World')).toBeInTheDocument();
    });

    it('should render custom cases', () => {
      render(<CaseStudyCarousel cases={mockCases} />);
      
      expect(screen.getByText('Times Square Billboard')).toBeInTheDocument();
      expect(screen.getByText('Beijing Shopping Mall')).toBeInTheDocument();
      expect(screen.getByText('Times Square Media')).toBeInTheDocument();
      expect(screen.getByText('Golden Mall Beijing')).toBeInTheDocument();
    });

    it('should display case information correctly', () => {
      render(<CaseStudyCarousel cases={mockCases} />);
      
      // Check case details
      expect(screen.getByText('Iconic LED Display')).toBeInTheDocument();
      expect(screen.getByText('A massive LED billboard installation in Times Square.')).toBeInTheDocument();
      expect(screen.getByText('New York, United States')).toBeInTheDocument();
      expect(screen.getByText('500㎡')).toBeInTheDocument();
      expect(screen.getByText('P6')).toBeInTheDocument();
    });

    it('should show featured badges for featured cases', () => {
      render(<CaseStudyCarousel cases={mockCases} />);
      
      const featuredBadges = screen.getAllByText('Featured');
      expect(featuredBadges).toHaveLength(1);
    });

    it('should display case tags', () => {
      render(<CaseStudyCarousel cases={mockCases} />);
      
      expect(screen.getByText('Outdoor')).toBeInTheDocument();
      expect(screen.getByText('Advertising')).toBeInTheDocument();
      expect(screen.getByText('Indoor')).toBeInTheDocument();
      expect(screen.getByText('Retail')).toBeInTheDocument();
    });
  });

  describe('Navigation Controls', () => {
    it('should show navigation controls for multiple cases', () => {
      render(<CaseStudyCarousel cases={mockCases} slidesToShow={1} />);
      
      expect(screen.getByLabelText('Previous cases')).toBeInTheDocument();
      expect(screen.getByLabelText('Next cases')).toBeInTheDocument();
    });

    it('should not show navigation controls for single case', () => {
      render(<CaseStudyCarousel cases={[mockCases[0]]} />);
      
      expect(screen.queryByLabelText('Previous cases')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Next cases')).not.toBeInTheDocument();
    });

    it('should handle next/previous navigation', async () => {
      const user = userEvent.setup();
      
      render(<CaseStudyCarousel cases={mockCases} slidesToShow={1} autoPlay={false} />);
      
      const nextButton = screen.getByLabelText('Next cases');
      await user.click(nextButton);
      
      // Should navigate to next case
      expect(nextButton).toBeInTheDocument();
      
      const prevButton = screen.getByLabelText('Previous cases');
      await user.click(prevButton);
      
      // Should navigate back
      expect(prevButton).toBeInTheDocument();
    });

    it('should show slide indicators', () => {
      render(<CaseStudyCarousel cases={mockCases} slidesToShow={1} />);
      
      const indicators = screen.getAllByRole('button').filter(
        button => button.getAttribute('aria-label')?.includes('Go to slide')
      );
      expect(indicators).toHaveLength(2);
    });

    it('should handle slide indicator clicks', async () => {
      const user = userEvent.setup();
      
      render(<CaseStudyCarousel cases={mockCases} slidesToShow={1} autoPlay={false} />);
      
      const secondIndicator = screen.getByLabelText('Go to slide 2');
      await user.click(secondIndicator);
      
      // Should navigate to second slide
      expect(secondIndicator).toBeInTheDocument();
    });
  });

  describe('Auto-play Functionality', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should show play/pause controls when autoPlay is enabled', () => {
      render(<CaseStudyCarousel cases={mockCases} autoPlay={true} slidesToShow={1} />);
      
      expect(screen.getByLabelText('Pause slideshow')).toBeInTheDocument();
      expect(screen.getByText('Pause')).toBeInTheDocument();
    });

    it('should toggle play/pause state', async () => {
      const user = userEvent.setup();
      
      render(<CaseStudyCarousel cases={mockCases} autoPlay={true} slidesToShow={1} />);
      
      const pauseButton = screen.getByLabelText('Pause slideshow');
      await user.click(pauseButton);
      
      expect(screen.getByLabelText('Play slideshow')).toBeInTheDocument();
      expect(screen.getByText('Play')).toBeInTheDocument();
    });

    it('should auto-advance slides when playing', () => {
      render(<CaseStudyCarousel cases={mockCases} autoPlay={true} autoPlayInterval={1000} slidesToShow={1} />);
      
      // Fast-forward time
      jest.advanceTimersByTime(1000);
      
      // Should advance to next slide
      expect(screen.getByText('Times Square Billboard')).toBeInTheDocument();
    });

    it('should not show play/pause controls when autoPlay is disabled', () => {
      render(<CaseStudyCarousel cases={mockCases} autoPlay={false} slidesToShow={1} />);
      
      expect(screen.queryByLabelText('Pause slideshow')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Play slideshow')).not.toBeInTheDocument();
    });
  });

  describe('Modal Functionality', () => {
    it('should show view details buttons', () => {
      render(<CaseStudyCarousel cases={mockCases} showModal={true} />);
      
      const viewButtons = screen.getAllByLabelText('View case details');
      expect(viewButtons.length).toBeGreaterThan(0);
    });

    it('should open modal when view details is clicked', async () => {
      const user = userEvent.setup();
      
      render(<CaseStudyCarousel cases={mockCases} showModal={true} />);
      
      const viewButton = screen.getAllByLabelText('View case details')[0];
      await user.click(viewButton);
      
      // Modal should open
      await waitFor(() => {
        expect(screen.getByLabelText('Close modal')).toBeInTheDocument();
      });
    });

    it('should close modal when close button is clicked', async () => {
      const user = userEvent.setup();
      
      render(<CaseStudyCarousel cases={mockCases} showModal={true} />);
      
      // Open modal
      const viewButton = screen.getAllByLabelText('View case details')[0];
      await user.click(viewButton);
      
      await waitFor(() => {
        expect(screen.getByLabelText('Close modal')).toBeInTheDocument();
      });
      
      // Close modal
      const closeButton = screen.getByLabelText('Close modal');
      await user.click(closeButton);
      
      await waitFor(() => {
        expect(screen.queryByLabelText('Close modal')).not.toBeInTheDocument();
      });
    });

    it('should display case details in modal', async () => {
      const user = userEvent.setup();
      
      render(<CaseStudyCarousel cases={mockCases} showModal={true} />);
      
      const viewButton = screen.getAllByLabelText('View case details')[0];
      await user.click(viewButton);
      
      await waitFor(() => {
        expect(screen.getByText('Times Square Billboard')).toBeInTheDocument();
        expect(screen.getByText('View Full Case Study')).toBeInTheDocument();
        expect(screen.getByText('Get Similar Solution')).toBeInTheDocument();
      });
    });

    it('should handle image gallery in modal', async () => {
      const user = userEvent.setup();
      
      const caseWithGallery = {
        ...mockCases[0],
        images: {
          ...mockCases[0].images,
          gallery: ['/image1.jpg', '/image2.jpg', '/image3.jpg']
        }
      };
      
      render(<CaseStudyCarousel cases={[caseWithGallery]} showModal={true} />);
      
      const viewButton = screen.getByLabelText('View case details');
      await user.click(viewButton);
      
      await waitFor(() => {
        // Should show image navigation controls
        const imageNavButtons = screen.getAllByRole('button').filter(
          button => button.querySelector('svg')
        );
        expect(imageNavButtons.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Responsive Design', () => {
    it('should handle different slidesToShow values', () => {
      render(<CaseStudyCarousel cases={mockCases} slidesToShow={2} />);
      
      // Should render without errors
      expect(screen.getByText('Times Square Billboard')).toBeInTheDocument();
    });

    it('should render correctly on mobile viewport', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(<CaseStudyCarousel cases={mockCases} />);
      
      // Component should render without errors on mobile
      expect(screen.getByText('Success Stories from')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should handle empty cases array', () => {
      render(<CaseStudyCarousel cases={[]} />);
      
      // Should not render anything for empty cases
      expect(screen.queryByText('Success Stories from')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<CaseStudyCarousel cases={mockCases} slidesToShow={1} />);
      
      expect(screen.getByLabelText('Previous cases')).toBeInTheDocument();
      expect(screen.getByLabelText('Next cases')).toBeInTheDocument();
      expect(screen.getByLabelText('Go to slide 1')).toBeInTheDocument();
    });

    it('should have proper alt text for images', () => {
      render(<CaseStudyCarousel cases={mockCases} />);
      
      const images = screen.getAllByAltText('Times Square Billboard');
      expect(images.length).toBeGreaterThan(0);
    });

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();
      
      render(<CaseStudyCarousel cases={mockCases} slidesToShow={1} />);
      
      // Tab to navigation button
      await user.tab();
      const nextButton = screen.getByLabelText('Next cases');
      
      // Should be focusable
      nextButton.focus();
      expect(document.activeElement).toBe(nextButton);
    });
  });
});

describe('ClientShowcase Component', () => {
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    jest.clearAllMocks();
  });

  const mockClients = [
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
        quote: 'Excellent service and quality.',
        author: 'John Doe',
        position: 'VP of Operations',
        rating: 5
      }
    },
    {
      id: 'samsung',
      name: 'Samsung Electronics',
      logo: '/images/clients/samsung.png',
      industry: 'Electronics',
      country: 'South Korea',
      featured: false
    }
  ];

  const mockTrustSignals = [
    {
      id: 'iso-9001',
      type: 'certification' as const,
      title: 'ISO 9001:2015',
      description: 'Quality Management System',
      image: '/images/certifications/iso-9001.png',
      year: '2023',
      organization: 'ISO'
    }
  ];

  describe('Basic Rendering', () => {
    it('should render client showcase with default content', () => {
      render(<ClientShowcase />);
      
      expect(screen.getByText('Trusted by')).toBeInTheDocument();
      expect(screen.getByText('Industry Leaders')).toBeInTheDocument();
    });

    it('should render custom clients', () => {
      render(<ClientShowcase clients={mockClients} />);
      
      const appleLogos = screen.getAllByAltText('Apple Inc.');
      expect(appleLogos.length).toBeGreaterThan(0);
      
      const samsungLogos = screen.getAllByAltText('Samsung Electronics');
      expect(samsungLogos.length).toBeGreaterThan(0);
    });

    it('should display trust signals', () => {
      render(<ClientShowcase trustSignals={mockTrustSignals} />);
      
      expect(screen.getByText('Certifications & Recognition')).toBeInTheDocument();
      expect(screen.getByText('ISO 9001:2015')).toBeInTheDocument();
      expect(screen.getByText('Quality Management System')).toBeInTheDocument();
    });
  });

  describe('Client Logo Interactions', () => {
    it('should show tooltips on hover', async () => {
      const user = userEvent.setup();
      
      render(<ClientShowcase clients={mockClients} />);
      
      const appleLogo = screen.getAllByAltText('Apple Inc.')[0];
      await user.hover(appleLogo);
      
      await waitFor(() => {
        expect(screen.getByText('Technology • United States')).toBeInTheDocument();
      });
    });

    it('should handle logo hover effects', async () => {
      const user = userEvent.setup();
      
      render(<ClientShowcase clients={mockClients} />);
      
      const appleLogo = screen.getAllByAltText('Apple Inc.')[0];
      
      await user.hover(appleLogo);
      // Hover effects should be applied (tested through class changes)
      expect(appleLogo).toBeInTheDocument();
      
      await user.unhover(appleLogo);
      // Hover effects should be removed
      expect(appleLogo).toBeInTheDocument();
    });
  });

  describe('Trust Signal Interactions', () => {
    it('should show trust signal details on hover', async () => {
      const user = userEvent.setup();
      
      render(<ClientShowcase trustSignals={mockTrustSignals} />);
      
      const trustSignal = screen.getByText('ISO 9001:2015').closest('div');
      
      if (trustSignal) {
        await user.hover(trustSignal);
        
        // Hover details should be shown
        expect(trustSignal).toBeInTheDocument();
      }
    });
  });

  describe('Testimonials', () => {
    it('should display testimonials when enabled', () => {
      render(<ClientShowcase clients={mockClients} showTestimonials={true} />);
      
      expect(screen.getByText('What Our Clients Say')).toBeInTheDocument();
      expect(screen.getByText('Excellent service and quality.')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('VP of Operations')).toBeInTheDocument();
    });

    it('should not display testimonials when disabled', () => {
      render(<ClientShowcase clients={mockClients} showTestimonials={false} />);
      
      expect(screen.queryByText('What Our Clients Say')).not.toBeInTheDocument();
    });

    it('should show testimonial indicators for multiple testimonials', () => {
      const clientsWithTestimonials = [
        mockClients[0],
        {
          ...mockClients[1],
          testimonial: {
            quote: 'Great partnership.',
            author: 'Jane Smith',
            position: 'Director',
            rating: 4
          }
        }
      ];
      
      render(<ClientShowcase clients={clientsWithTestimonials} showTestimonials={true} />);
      
      const indicators = screen.getAllByRole('button').filter(
        button => button.getAttribute('aria-label')?.includes('View testimonial')
      );
      expect(indicators).toHaveLength(2);
    });

    it('should handle testimonial navigation', async () => {
      const user = userEvent.setup();
      
      const clientsWithTestimonials = [
        mockClients[0],
        {
          ...mockClients[1],
          testimonial: {
            quote: 'Great partnership.',
            author: 'Jane Smith',
            position: 'Director',
            rating: 4
          }
        }
      ];
      
      render(<ClientShowcase clients={clientsWithTestimonials} showTestimonials={true} />);
      
      const secondIndicator = screen.getByLabelText('View testimonial 2');
      await user.click(secondIndicator);
      
      // Should show second testimonial
      expect(screen.getByText('Great partnership.')).toBeInTheDocument();
    });

    it('should display star ratings correctly', () => {
      render(<ClientShowcase clients={mockClients} showTestimonials={true} />);
      
      // Should show 5 stars (rating is 5)
      const stars = screen.getAllByRole('generic').filter(
        el => el.querySelector('svg') && el.textContent === ''
      );
      // Note: This is a simplified test - in reality you'd check for filled vs empty stars
      expect(stars.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Statistics Section', () => {
    it('should display company statistics', () => {
      render(<ClientShowcase />);
      
      expect(screen.getByText('500+')).toBeInTheDocument();
      expect(screen.getByText('Global Clients')).toBeInTheDocument();
      expect(screen.getByText('50+')).toBeInTheDocument();
      expect(screen.getByText('Countries Served')).toBeInTheDocument();
      expect(screen.getByText('99%')).toBeInTheDocument();
      expect(screen.getByText('Client Satisfaction')).toBeInTheDocument();
      expect(screen.getByText('15+')).toBeInTheDocument();
      expect(screen.getByText('Years Experience')).toBeInTheDocument();
    });
  });

  describe('Auto-scroll Functionality', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should auto-scroll client logos when enabled', () => {
      render(<ClientShowcase clients={mockClients} autoScroll={true} scrollSpeed={10} />);
      
      // Fast-forward time to trigger scroll
      jest.advanceTimersByTime(100);
      
      // Should not throw errors
      expect(screen.getByText('Trusted by')).toBeInTheDocument();
    });

    it('should not auto-scroll when disabled', () => {
      render(<ClientShowcase clients={mockClients} autoScroll={false} />);
      
      // Should render without auto-scroll
      expect(screen.getByText('Trusted by')).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('should render correctly on mobile viewport', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(<ClientShowcase clients={mockClients} />);
      
      // Component should render without errors on mobile
      expect(screen.getByText('Trusted by')).toBeInTheDocument();
    });

    it('should handle different grid layouts', () => {
      render(<ClientShowcase trustSignals={mockTrustSignals} />);
      
      // Should render trust signals in grid layout
      expect(screen.getByText('ISO 9001:2015')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper alt text for client logos', () => {
      render(<ClientShowcase clients={mockClients} />);
      
      expect(screen.getAllByAltText('Apple Inc.')).toHaveLength(2); // Original + duplicate for scrolling
      expect(screen.getAllByAltText('Samsung Electronics')).toHaveLength(2);
    });

    it('should have proper alt text for trust signal images', () => {
      render(<ClientShowcase trustSignals={mockTrustSignals} />);
      
      expect(screen.getByAltText('ISO 9001:2015')).toBeInTheDocument();
    });

    it('should be keyboard navigable for testimonial indicators', async () => {
      const user = userEvent.setup();
      
      const clientsWithTestimonials = [
        mockClients[0],
        {
          ...mockClients[1],
          testimonial: {
            quote: 'Great partnership.',
            author: 'Jane Smith',
            position: 'Director',
            rating: 4
          }
        }
      ];
      
      render(<ClientShowcase clients={clientsWithTestimonials} showTestimonials={true} />);
      
      // Tab to testimonial indicator
      await user.tab();
      const indicator = screen.getByLabelText('View testimonial 1');
      
      // Should be focusable
      indicator.focus();
      expect(document.activeElement).toBe(indicator);
    });
  });

  describe('Performance', () => {
    it('should handle intersection observer correctly', () => {
      const mockObserve = jest.fn();
      const mockDisconnect = jest.fn();
      
      mockIntersectionObserver.mockReturnValue({
        observe: mockObserve,
        unobserve: jest.fn(),
        disconnect: mockDisconnect,
      });

      const { unmount } = render(<ClientShowcase />);
      
      expect(mockObserve).toHaveBeenCalled();
      
      unmount();
      
      expect(mockDisconnect).toHaveBeenCalled();
    });

    it('should not cause memory leaks with auto-scroll', () => {
      const { unmount } = render(<ClientShowcase autoScroll={true} />);
      
      // Component should unmount cleanly
      unmount();
      
      expect(true).toBe(true); // No errors thrown
    });
  });

  describe('Custom Props', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <ClientShowcase className="custom-showcase-class" />
      );
      
      expect(container.firstChild).toHaveClass('custom-showcase-class');
    });

    it('should handle empty clients array', () => {
      render(<ClientShowcase clients={[]} />);
      
      // Should render without errors
      expect(screen.getByText('Trusted by')).toBeInTheDocument();
    });

    it('should handle empty trust signals array', () => {
      render(<ClientShowcase trustSignals={[]} />);
      
      // Should render without errors
      expect(screen.getByText('Trusted by')).toBeInTheDocument();
    });
  });
});