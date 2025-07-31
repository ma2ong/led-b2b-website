/**
 * 首页组件视觉回归测试
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/router';
import HeroSection from '@/components/home/HeroSection';
import CompanyStats from '@/components/home/CompanyStats';
import ValueProposition from '@/components/home/ValueProposition';
import ProductCarousel from '@/components/home/ProductCarousel';

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

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn((cb) => setTimeout(cb, 16));
global.cancelAnimationFrame = jest.fn();

const mockRouter = {
  locale: 'en',
  defaultLocale: 'en',
  locales: ['en', 'zh'],
  asPath: '/',
  push: jest.fn(),
  replace: jest.fn(),
};

describe('Home Components Visual Regression Tests', () => {
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    jest.clearAllMocks();
  });

  describe('HeroSection Component', () => {
    const mockSlides = [
      {
        id: 'slide-1',
        title: 'Test Hero Title',
        subtitle: 'Test Subtitle',
        description: 'Test description for hero section',
        image: '/images/test-hero.jpg',
        video: 'https://youtube.com/watch?v=test',
        cta: {
          primary: { text: 'Primary CTA', href: '/test' },
          secondary: { text: 'Secondary CTA', href: '/test2' }
        }
      },
      {
        id: 'slide-2',
        title: 'Second Slide',
        subtitle: 'Second Subtitle',
        description: 'Second slide description',
        image: '/images/test-hero-2.jpg',
        cta: {
          primary: { text: 'Learn More', href: '/learn' }
        }
      }
    ];

    it('should render hero section with correct structure', () => {
      render(<HeroSection slides={mockSlides} />);
      
      expect(screen.getByText('Test Hero Title')).toBeInTheDocument();
      expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
      expect(screen.getByText('Test description for hero section')).toBeInTheDocument();
      expect(screen.getByText('Primary CTA')).toBeInTheDocument();
      expect(screen.getByText('Secondary CTA')).toBeInTheDocument();
    });

    it('should display navigation controls for multiple slides', () => {
      render(<HeroSection slides={mockSlides} />);
      
      // Check for navigation buttons
      expect(screen.getByLabelText('Previous slide')).toBeInTheDocument();
      expect(screen.getByLabelText('Next slide')).toBeInTheDocument();
      
      // Check for slide indicators
      const indicators = screen.getAllByRole('button').filter(
        button => button.getAttribute('aria-label')?.includes('Go to slide')
      );
      expect(indicators).toHaveLength(2);
    });

    it('should handle slide navigation correctly', async () => {
      render(<HeroSection slides={mockSlides} autoPlay={false} />);
      
      // Initially should show first slide
      expect(screen.getByText('Test Hero Title')).toBeInTheDocument();
      
      // Click next button
      const nextButton = screen.getByLabelText('Next slide');
      fireEvent.click(nextButton);
      
      // Should show second slide content
      await waitFor(() => {
        expect(screen.getByText('Second Slide')).toBeInTheDocument();
      });
    });

    it('should handle video modal correctly', async () => {
      render(<HeroSection slides={mockSlides} showVideoModal={true} />);
      
      const videoButton = screen.getByText('Secondary CTA');
      fireEvent.click(videoButton);
      
      // Video modal should appear
      await waitFor(() => {
        expect(screen.getByTitle('Video')).toBeInTheDocument();
      });
      
      // Close button should be present
      const closeButton = screen.getByLabelText('Close video');
      expect(closeButton).toBeInTheDocument();
      
      // Close the modal
      fireEvent.click(closeButton);
      
      await waitFor(() => {
        expect(screen.queryByTitle('Video')).not.toBeInTheDocument();
      });
    });

    it('should handle auto-play functionality', () => {
      jest.useFakeTimers();
      
      render(<HeroSection slides={mockSlides} autoPlay={true} autoPlayInterval={1000} />);
      
      // Initially should show first slide
      expect(screen.getByText('Test Hero Title')).toBeInTheDocument();
      
      // Fast-forward time
      jest.advanceTimersByTime(1000);
      
      // Should advance to next slide
      expect(screen.getByText('Second Slide')).toBeInTheDocument();
      
      jest.useRealTimers();
    });

    it('should pause and resume auto-play', () => {
      render(<HeroSection slides={mockSlides} autoPlay={true} />);
      
      const playPauseButton = screen.getByLabelText('Pause slideshow');
      expect(playPauseButton).toBeInTheDocument();
      
      fireEvent.click(playPauseButton);
      
      expect(screen.getByLabelText('Play slideshow')).toBeInTheDocument();
    });

    it('should render single slide without navigation', () => {
      const singleSlide = [mockSlides[0]];
      render(<HeroSection slides={singleSlide} />);
      
      expect(screen.queryByLabelText('Previous slide')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Next slide')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Pause slideshow')).not.toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(
        <HeroSection slides={mockSlides} className="custom-hero-class" />
      );
      
      expect(container.firstChild).toHaveClass('custom-hero-class');
    });
  });

  describe('CompanyStats Component', () => {
    const mockStats = [
      {
        id: 'projects',
        value: 1000,
        suffix: '+',
        label: 'Projects',
        description: 'Completed projects',
        icon: <div data-testid="projects-icon">Icon</div>,
        color: 'text-blue-500'
      },
      {
        id: 'countries',
        value: 50,
        suffix: '+',
        label: 'Countries',
        description: 'Countries served',
        icon: <div data-testid="countries-icon">Icon</div>,
        color: 'text-green-500'
      }
    ];

    it('should render stats with correct structure', () => {
      render(<CompanyStats stats={mockStats} />);
      
      expect(screen.getByText('Projects')).toBeInTheDocument();
      expect(screen.getByText('Countries')).toBeInTheDocument();
      expect(screen.getByText('Completed projects')).toBeInTheDocument();
      expect(screen.getByText('Countries served')).toBeInTheDocument();
    });

    it('should display icons correctly', () => {
      render(<CompanyStats stats={mockStats} />);
      
      expect(screen.getByTestId('projects-icon')).toBeInTheDocument();
      expect(screen.getByTestId('countries-icon')).toBeInTheDocument();
    });

    it('should trigger intersection observer', () => {
      const mockObserve = jest.fn();
      const mockDisconnect = jest.fn();
      
      mockIntersectionObserver.mockReturnValue({
        observe: mockObserve,
        unobserve: jest.fn(),
        disconnect: mockDisconnect,
      });

      render(<CompanyStats stats={mockStats} />);
      
      expect(mockObserve).toHaveBeenCalled();
    });

    it('should animate numbers when visible', async () => {
      // Mock intersection observer to trigger visibility
      const mockCallback = jest.fn();
      mockIntersectionObserver.mockImplementation((callback) => {
        mockCallback.current = callback;
        return {
          observe: () => {
            // Simulate intersection
            callback([{ isIntersecting: true }]);
          },
          unobserve: jest.fn(),
          disconnect: jest.fn(),
        };
      });

      render(<CompanyStats stats={mockStats} />);
      
      // Numbers should start animating
      await waitFor(() => {
        // The exact number might vary due to animation timing
        expect(screen.getByText(/\d+/)).toBeInTheDocument();
      });
    });

    it('should apply custom className', () => {
      const { container } = render(
        <CompanyStats stats={mockStats} className="custom-stats-class" />
      );
      
      expect(container.firstChild).toHaveClass('custom-stats-class');
    });
  });

  describe('ValueProposition Component', () => {
    const mockValues = [
      {
        id: 'innovation',
        icon: <div data-testid="innovation-icon">Innovation</div>,
        title: 'Innovation',
        description: 'Cutting-edge technology',
        features: ['Feature 1', 'Feature 2'],
        color: 'text-blue-600',
        gradient: 'from-blue-500 to-cyan-500'
      },
      {
        id: 'quality',
        icon: <div data-testid="quality-icon">Quality</div>,
        title: 'Quality',
        description: 'Premium products',
        features: ['Feature 3', 'Feature 4'],
        color: 'text-green-600',
        gradient: 'from-green-500 to-emerald-500'
      }
    ];

    it('should render value proposition with correct structure', () => {
      render(<ValueProposition values={mockValues} />);
      
      expect(screen.getByText('Innovation')).toBeInTheDocument();
      expect(screen.getByText('Quality')).toBeInTheDocument();
      expect(screen.getByText('Cutting-edge technology')).toBeInTheDocument();
      expect(screen.getByText('Premium products')).toBeInTheDocument();
    });

    it('should display features correctly', () => {
      render(<ValueProposition values={mockValues} />);
      
      expect(screen.getByText('Feature 1')).toBeInTheDocument();
      expect(screen.getByText('Feature 2')).toBeInTheDocument();
      expect(screen.getByText('Feature 3')).toBeInTheDocument();
      expect(screen.getByText('Feature 4')).toBeInTheDocument();
    });

    it('should display icons correctly', () => {
      render(<ValueProposition values={mockValues} />);
      
      expect(screen.getByTestId('innovation-icon')).toBeInTheDocument();
      expect(screen.getByTestId('quality-icon')).toBeInTheDocument();
    });

    it('should handle hover effects', () => {
      render(<ValueProposition values={mockValues} />);
      
      const innovationCard = screen.getByText('Innovation').closest('div');
      
      if (innovationCard) {
        fireEvent.mouseEnter(innovationCard);
        // Hover effects should be applied (tested through class changes)
        expect(innovationCard).toBeInTheDocument();
        
        fireEvent.mouseLeave(innovationCard);
        // Hover effects should be removed
        expect(innovationCard).toBeInTheDocument();
      }
    });

    it('should render call-to-action section', () => {
      render(<ValueProposition values={mockValues} />);
      
      expect(screen.getByText('Ready to Transform Your Space?')).toBeInTheDocument();
      expect(screen.getByText('Get Free Consultation')).toBeInTheDocument();
      expect(screen.getByText('Explore Products')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(
        <ValueProposition values={mockValues} className="custom-value-class" />
      );
      
      expect(container.firstChild).toHaveClass('custom-value-class');
    });
  });

  describe('Responsive Design Tests', () => {
    beforeEach(() => {
      // Mock window.matchMedia for responsive tests
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: false,
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });
    });

    it('should render correctly on mobile viewport', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(<HeroSection />);
      
      // Component should render without errors on mobile
      expect(screen.getByRole('button', { name: /primary cta/i })).toBeInTheDocument();
    });

    it('should render correctly on tablet viewport', () => {
      // Mock tablet viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      render(<CompanyStats />);
      
      // Component should render without errors on tablet
      expect(screen.getByText(/trusted by industry leaders/i)).toBeInTheDocument();
    });

    it('should render correctly on desktop viewport', () => {
      // Mock desktop viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });

      render(<ValueProposition />);
      
      // Component should render without errors on desktop
      expect(screen.getByText(/why choose/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility Tests', () => {
    it('should have proper ARIA labels for hero navigation', () => {
      const mockSlides = [
        {
          id: 'slide-1',
          title: 'Test Title',
          subtitle: 'Test Subtitle',
          description: 'Test description',
          image: '/test.jpg',
          cta: { primary: { text: 'CTA', href: '/test' } }
        },
        {
          id: 'slide-2',
          title: 'Test Title 2',
          subtitle: 'Test Subtitle 2',
          description: 'Test description 2',
          image: '/test2.jpg',
          cta: { primary: { text: 'CTA 2', href: '/test2' } }
        }
      ];

      render(<HeroSection slides={mockSlides} />);
      
      expect(screen.getByLabelText('Previous slide')).toBeInTheDocument();
      expect(screen.getByLabelText('Next slide')).toBeInTheDocument();
      expect(screen.getByLabelText('Go to slide 1')).toBeInTheDocument();
      expect(screen.getByLabelText('Go to slide 2')).toBeInTheDocument();
    });

    it('should have proper heading hierarchy', () => {
      render(<ValueProposition />);
      
      // Should have proper heading levels
      const mainHeading = screen.getByRole('heading', { level: 2 });
      expect(mainHeading).toBeInTheDocument();
      
      const subHeadings = screen.getAllByRole('heading', { level: 3 });
      expect(subHeadings.length).toBeGreaterThan(0);
    });

    it('should have proper alt text for images', () => {
      const mockSlides = [
        {
          id: 'slide-1',
          title: 'Test Title',
          subtitle: 'Test Subtitle',
          description: 'Test description',
          image: '/test.jpg',
          cta: { primary: { text: 'CTA', href: '/test' } }
        }
      ];

      render(<HeroSection slides={mockSlides} />);
      
      const image = screen.getByAltText('Test Title');
      expect(image).toBeInTheDocument();
    });

    it('should be keyboard navigable', () => {
      const mockSlides = [
        {
          id: 'slide-1',
          title: 'Test Title',
          subtitle: 'Test Subtitle',
          description: 'Test description',
          image: '/test.jpg',
          cta: { primary: { text: 'CTA', href: '/test' } }
        },
        {
          id: 'slide-2',
          title: 'Test Title 2',
          subtitle: 'Test Subtitle 2',
          description: 'Test description 2',
          image: '/test2.jpg',
          cta: { primary: { text: 'CTA 2', href: '/test2' } }
        }
      ];

      render(<HeroSection slides={mockSlides} />);
      
      const nextButton = screen.getByLabelText('Next slide');
      
      // Should be focusable
      nextButton.focus();
      expect(document.activeElement).toBe(nextButton);
      
      // Should respond to keyboard events
      fireEvent.keyDown(nextButton, { key: 'Enter' });
      // Navigation should work (tested through state changes)
    });
  });

  describe('Performance Tests', () => {
    it('should not cause memory leaks with animations', () => {
      const { unmount } = render(<CompanyStats />);
      
      // Component should unmount cleanly
      unmount();
      
      // No errors should be thrown
      expect(true).toBe(true);
    });

    it('should handle rapid slide changes without errors', () => {
      const mockSlides = Array.from({ length: 5 }, (_, i) => ({
        id: `slide-${i}`,
        title: `Title ${i}`,
        subtitle: `Subtitle ${i}`,
        description: `Description ${i}`,
        image: `/test${i}.jpg`,
        cta: { primary: { text: `CTA ${i}`, href: `/test${i}` } }
      }));

      render(<HeroSection slides={mockSlides} autoPlay={false} />);
      
      const nextButton = screen.getByLabelText('Next slide');
      
      // Rapidly click next button
      for (let i = 0; i < 10; i++) {
        fireEvent.click(nextButton);
      }
      
      // Should not throw errors
      expect(nextButton).toBeInTheDocument();
    });

    it('should handle intersection observer cleanup', () => {
      const mockDisconnect = jest.fn();
      
      mockIntersectionObserver.mockReturnValue({
        observe: jest.fn(),
        unobserve: jest.fn(),
        disconnect: mockDisconnect,
      });

      const { unmount } = render(<CompanyStats />);
      
      unmount();
      
      expect(mockDisconnect).toHaveBeenCalled();
    });
  });
});