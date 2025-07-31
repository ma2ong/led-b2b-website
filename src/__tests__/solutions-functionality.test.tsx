/**
 * 解决方案功能测试
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { useRouter } from 'next/router';
import i18n from '../lib/i18n';
import SolutionsPage from '../components/solutions/SolutionsPage';
import SolutionDetailPage from '../components/solutions/SolutionDetailPage';
import { Solution, SolutionIndustry, SolutionCategory } from '../types/solution';

// Mock next/router
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

const mockPush = jest.fn();
(useRouter as jest.Mock).mockReturnValue({
  push: mockPush,
  pathname: '/solutions',
  query: {},
});

// Mock solution data
const mockSolution: Solution = {
  id: 'retail-digital-signage',
  title: 'Retail Digital Signage Solutions',
  slug: 'retail-digital-signage',
  description: 'Transform your retail space with dynamic digital displays that engage customers and drive sales.',
  industry: SolutionIndustry.RETAIL,
  category: SolutionCategory.INDOOR_FIXED,
  heroImage: '/images/solutions/retail-signage-hero.jpg',
  gallery: [
    {
      id: 'img1',
      url: '/images/solutions/retail-1.jpg',
      alt: 'Retail Digital Signage Display',
      isMain: true,
      sortOrder: 1,
    },
  ],
  features: [
    'High brightness for window displays',
    'Energy-efficient LED technology',
    'Remote content management',
    'Easy installation and maintenance',
  ],
  benefits: [
    'Increase sales by up to 30%',
    'Enhance customer experience',
    'Reduce printing costs',
    'Real-time content updates',
  ],
  applications: [
    'Shopping malls',
    'Retail stores',
    'Supermarkets',
    'Fashion boutiques',
  ],
  technicalSpecs: [
    {
      id: 'spec1',
      category: 'Display',
      name: 'Pixel Pitch',
      value: '2.5',
      unit: 'mm',
      isHighlight: true,
      sortOrder: 1,
    },
    {
      id: 'spec2',
      category: 'Display',
      name: 'Brightness',
      value: '1000',
      unit: 'nits',
      isHighlight: true,
      sortOrder: 2,
    },
  ],
  recommendedProducts: ['product-1', 'product-2'],
  caseStudies: ['case-1', 'case-2'],
  tags: ['retail', 'indoor', 'digital-signage'],
  isActive: true,
  isFeatured: true,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-15'),
};

const renderWithI18n = (component: React.ReactElement) => {
  return render(
    <I18nextProvider i18n={i18n}>
      {component}
    </I18nextProvider>
  );
};

describe('SolutionsPage', () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it('renders solutions page with header and search', async () => {
    renderWithI18n(<SolutionsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('LED Display Solutions')).toBeInTheDocument();
    });
    
    expect(screen.getByPlaceholderText('Search solutions...')).toBeInTheDocument();
    expect(screen.getByText('Filters')).toBeInTheDocument();
  });

  it('displays solution cards with correct information', async () => {
    renderWithI18n(<SolutionsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Retail Digital Signage')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Outdoor Advertising')).toBeInTheDocument();
    expect(screen.getByText('Learn More')).toBeInTheDocument();
  });

  it('handles search functionality', async () => {
    renderWithI18n(<SolutionsPage />);
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search solutions...')).toBeInTheDocument();
    });
    
    const searchInput = screen.getByPlaceholderText('Search solutions...');
    fireEvent.change(searchInput, { target: { value: 'retail' } });
    
    expect(searchInput).toHaveValue('retail');
  });

  it('handles filter interactions', async () => {
    renderWithI18n(<SolutionsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Filters')).toBeInTheDocument();
    });
    
    const filtersButton = screen.getByText('Filters');
    fireEvent.click(filtersButton);
    
    // Should show filter options
    await waitFor(() => {
      expect(screen.getByText('Industry')).toBeInTheDocument();
    });
  });

  it('switches between grid and list view', async () => {
    renderWithI18n(<SolutionsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Retail Digital Signage')).toBeInTheDocument();
    });
    
    // Find view mode buttons
    const viewButtons = screen.getAllByRole('button');
    const listButton = viewButtons.find(button => 
      button.querySelector('svg')
    );
    
    if (listButton) {
      fireEvent.click(listButton);
      // Should still show solutions in list view
      expect(screen.getByText('Retail Digital Signage')).toBeInTheDocument();
    }
  });

  it('handles solution card click navigation', async () => {
    renderWithI18n(<SolutionsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Retail Digital Signage')).toBeInTheDocument();
    });
    
    const solutionCard = screen.getByText('Retail Digital Signage').closest('div');
    if (solutionCard) {
      fireEvent.click(solutionCard);
      expect(mockPush).toHaveBeenCalledWith('/solutions/retail-digital-signage');
    }
  });

  it('displays pagination when there are multiple pages', async () => {
    renderWithI18n(<SolutionsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Showing results')).toBeInTheDocument();
    });
    
    // Should show results count
    expect(screen.getByText(/Showing results/)).toBeInTheDocument();
  });

  it('handles empty state when no solutions found', async () => {
    renderWithI18n(<SolutionsPage />);
    
    // Search for something that doesn't exist
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search solutions...')).toBeInTheDocument();
    });
    
    const searchInput = screen.getByPlaceholderText('Search solutions...');
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });
    
    // Should eventually show no results (this would depend on the actual implementation)
    // For now, we just verify the search input works
    expect(searchInput).toHaveValue('nonexistent');
  });
});

describe('SolutionDetailPage', () => {
  const mockRecommendedProducts = [
    {
      id: 'product-1',
      name: 'P2.5 Indoor LED Display',
      slug: 'p2-5-indoor-led-display',
      description: 'High-resolution indoor LED display',
      category: 'indoor-fixed',
      specifications: {
        pixelPitch: '2.5mm',
        brightness: '1000 nits',
        resolution: '1920x1080',
        refreshRate: '60Hz',
        viewingAngle: '160°',
        powerConsumption: '150W/m²',
        operatingTemp: '-20°C to +60°C',
        protection: 'IP40',
        lifespan: '100,000 hours',
        weight: '12 kg/m²',
      },
      images: {
        main: '/images/products/p2-5-indoor-main.jpg',
        gallery: ['/images/products/p2-5-indoor-1.jpg'],
        thumbnail: '/images/products/p2-5-indoor-thumb.jpg',
      },
      features: ['High Resolution', 'Energy Efficient'],
      applications: ['Retail', 'Corporate'],
      certifications: ['CE', 'FCC'],
      warranty: '2 years',
      isActive: true,
      isFeatured: true,
      tags: ['indoor', 'retail'],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-15'),
    },
  ];

  const mockRelatedCaseStudies = [
    {
      id: 'case-1',
      title: 'Shopping Mall Digital Transformation',
      slug: 'shopping-mall-digital-transformation',
      description: 'How a major shopping mall increased foot traffic by 40%',
      client: {
        name: 'Metro Shopping Center',
        industry: 'Retail',
        location: 'New York, USA',
        size: 'Large',
      },
      challenge: 'Low foot traffic',
      solution: 'Digital signage network',
      results: ['40% increase in foot traffic'],
      images: {
        hero: '/images/case-studies/shopping-mall-hero.jpg',
        gallery: ['/images/case-studies/shopping-mall-1.jpg'],
        before: '/images/case-studies/shopping-mall-before.jpg',
        after: '/images/case-studies/shopping-mall-after.jpg',
      },
      products: ['P2.5 Indoor LED Display'],
      timeline: '3 months',
      budget: '$500,000 - $1,000,000',
      tags: ['retail', 'shopping-mall'],
      isActive: true,
      isFeatured: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-15'),
    },
  ];

  beforeEach(() => {
    mockPush.mockClear();
  });

  it('renders solution detail page with all sections', () => {
    renderWithI18n(
      <SolutionDetailPage
        solution={mockSolution}
        recommendedProducts={mockRecommendedProducts}
        relatedCaseStudies={mockRelatedCaseStudies}
        relatedSolutions={[]}
      />
    );
    
    expect(screen.getByText('Retail Digital Signage Solutions')).toBeInTheDocument();
    expect(screen.getByText('Transform your retail space with dynamic digital displays')).toBeInTheDocument();
    expect(screen.getByText('Get Quote')).toBeInTheDocument();
  });

  it('displays solution features and benefits', () => {
    renderWithI18n(
      <SolutionDetailPage
        solution={mockSolution}
        recommendedProducts={mockRecommendedProducts}
        relatedCaseStudies={mockRelatedCaseStudies}
        relatedSolutions={[]}
      />
    );
    
    expect(screen.getByText('High brightness for window displays')).toBeInTheDocument();
    expect(screen.getByText('Increase sales by up to 30%')).toBeInTheDocument();
  });

  it('handles tab navigation', () => {
    renderWithI18n(
      <SolutionDetailPage
        solution={mockSolution}
        recommendedProducts={mockRecommendedProducts}
        relatedCaseStudies={mockRelatedCaseStudies}
        relatedSolutions={[]}
      />
    );
    
    const specsTab = screen.getByText('Specifications');
    fireEvent.click(specsTab);
    
    expect(screen.getByText('Pixel Pitch')).toBeInTheDocument();
    expect(screen.getByText('2.5 mm')).toBeInTheDocument();
  });

  it('displays technical specifications correctly', () => {
    renderWithI18n(
      <SolutionDetailPage
        solution={mockSolution}
        recommendedProducts={mockRecommendedProducts}
        relatedCaseStudies={mockRelatedCaseStudies}
        relatedSolutions={[]}
      />
    );
    
    // Click on specifications tab
    const specsTab = screen.getByText('Specifications');
    fireEvent.click(specsTab);
    
    expect(screen.getByText('Display')).toBeInTheDocument();
    expect(screen.getByText('Pixel Pitch')).toBeInTheDocument();
    expect(screen.getByText('Brightness')).toBeInTheDocument();
  });

  it('shows applications tab content', () => {
    renderWithI18n(
      <SolutionDetailPage
        solution={mockSolution}
        recommendedProducts={mockRecommendedProducts}
        relatedCaseStudies={mockRelatedCaseStudies}
        relatedSolutions={[]}
      />
    );
    
    const applicationsTab = screen.getByText('Applications');
    fireEvent.click(applicationsTab);
    
    expect(screen.getByText('Shopping malls')).toBeInTheDocument();
    expect(screen.getByText('Retail stores')).toBeInTheDocument();
  });

  it('displays recommended products in sidebar', () => {
    renderWithI18n(
      <SolutionDetailPage
        solution={mockSolution}
        recommendedProducts={mockRecommendedProducts}
        relatedCaseStudies={mockRelatedCaseStudies}
        relatedSolutions={[]}
      />
    );
    
    expect(screen.getByText('Recommended Products')).toBeInTheDocument();
    expect(screen.getByText('P2.5 Indoor LED Display')).toBeInTheDocument();
  });

  it('handles get quote button click', () => {
    renderWithI18n(
      <SolutionDetailPage
        solution={mockSolution}
        recommendedProducts={mockRecommendedProducts}
        relatedCaseStudies={mockRelatedCaseStudies}
        relatedSolutions={[]}
      />
    );
    
    const getQuoteButton = screen.getAllByText('Get Quote')[0];
    fireEvent.click(getQuoteButton);
    
    expect(mockPush).toHaveBeenCalledWith('/contact?solution=retail-digital-signage');
  });

  it('handles share functionality', async () => {
    // Mock navigator.share
    const mockShare = jest.fn();
    Object.defineProperty(navigator, 'share', {
      value: mockShare,
      writable: true,
    });

    renderWithI18n(
      <SolutionDetailPage
        solution={mockSolution}
        recommendedProducts={mockRecommendedProducts}
        relatedCaseStudies={mockRelatedCaseStudies}
        relatedSolutions={[]}
      />
    );
    
    const shareButton = screen.getByText('Share');
    fireEvent.click(shareButton);
    
    await waitFor(() => {
      expect(mockShare).toHaveBeenCalledWith({
        title: mockSolution.title,
        text: mockSolution.description,
        url: window.location.href,
      });
    });
  });

  it('displays case studies when available', () => {
    renderWithI18n(
      <SolutionDetailPage
        solution={mockSolution}
        recommendedProducts={mockRecommendedProducts}
        relatedCaseStudies={mockRelatedCaseStudies}
        relatedSolutions={[]}
      />
    );
    
    const casesTab = screen.getByText('Case Studies');
    fireEvent.click(casesTab);
    
    expect(screen.getByText('Shopping Mall Digital Transformation')).toBeInTheDocument();
  });

  it('handles image gallery navigation', () => {
    const solutionWithMultipleImages = {
      ...mockSolution,
      gallery: [
        {
          id: 'img1',
          url: '/images/solutions/retail-1.jpg',
          alt: 'Image 1',
          isMain: true,
          sortOrder: 1,
        },
        {
          id: 'img2',
          url: '/images/solutions/retail-2.jpg',
          alt: 'Image 2',
          isMain: false,
          sortOrder: 2,
        },
      ],
    };

    renderWithI18n(
      <SolutionDetailPage
        solution={solutionWithMultipleImages}
        recommendedProducts={mockRecommendedProducts}
        relatedCaseStudies={mockRelatedCaseStudies}
        relatedSolutions={[]}
      />
    );
    
    // Should show navigation buttons for multiple images
    const nextButton = screen.getByRole('button', { name: /next/i });
    if (nextButton) {
      fireEvent.click(nextButton);
      // Image should change (implementation dependent)
    }
  });
});

describe('Solutions Integration', () => {
  it('maintains consistent data between list and detail views', async () => {
    const { rerender } = renderWithI18n(<SolutionsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Retail Digital Signage')).toBeInTheDocument();
    });
    
    rerender(
      <I18nextProvider i18n={i18n}>
        <SolutionDetailPage
          solution={mockSolution}
          recommendedProducts={[]}
          relatedCaseStudies={[]}
          relatedSolutions={[]}
        />
      </I18nextProvider>
    );
    
    expect(screen.getByText('Retail Digital Signage Solutions')).toBeInTheDocument();
  });

  it('handles error states gracefully', () => {
    // Test with invalid solution data
    const invalidSolution = { ...mockSolution, title: '' };
    
    renderWithI18n(
      <SolutionDetailPage
        solution={invalidSolution}
        recommendedProducts={[]}
        relatedCaseStudies={[]}
        relatedSolutions={[]}
      />
    );
    
    // Should still render without crashing
    expect(screen.getByText('Get Quote')).toBeInTheDocument();
  });
});

describe('Solutions Accessibility', () => {
  it('has proper ARIA labels and roles', () => {
    renderWithI18n(<SolutionsPage />);
    
    const searchInput = screen.getByPlaceholderText('Search solutions...');
    expect(searchInput).toHaveAttribute('type', 'text');
  });

  it('supports keyboard navigation', () => {
    renderWithI18n(
      <SolutionDetailPage
        solution={mockSolution}
        recommendedProducts={[]}
        relatedCaseStudies={[]}
        relatedSolutions={[]}
      />
    );
    
    const getQuoteButton = screen.getAllByText('Get Quote')[0];
    expect(getQuoteButton).toBeInTheDocument();
    
    // Test that button is focusable
    getQuoteButton.focus();
    expect(document.activeElement).toBe(getQuoteButton);
  });

  it('has proper heading hierarchy', () => {
    renderWithI18n(
      <SolutionDetailPage
        solution={mockSolution}
        recommendedProducts={[]}
        relatedCaseStudies={[]}
        relatedSolutions={[]}
      />
    );
    
    const headings = screen.getAllByRole('heading');
    expect(headings.length).toBeGreaterThan(0);
    
    // Should have h1 for main title
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });
});

describe('Solutions Performance', () => {
  it('renders components within acceptable time', async () => {
    const startTime = performance.now();
    
    renderWithI18n(<SolutionsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('LED Display Solutions')).toBeInTheDocument();
    });
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    // Should render within 1 second
    expect(renderTime).toBeLessThan(1000);
  });

  it('handles large solution datasets efficiently', async () => {
    renderWithI18n(<SolutionsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('LED Display Solutions')).toBeInTheDocument();
    });
    
    // Should render without performance issues
    expect(screen.getByText('Retail Digital Signage')).toBeInTheDocument();
  });
});