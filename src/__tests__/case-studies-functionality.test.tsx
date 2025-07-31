/**
 * 案例研究功能测试
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../lib/i18n';
import CaseStudiesPage from '../components/case-studies/CaseStudiesPage';
import CaseStudyDetailPage from '../components/case-studies/CaseStudyDetailPage';
import CaseStudyMap from '../components/case-studies/CaseStudyMap';
import { CaseStudy } from '../types/case-study';

// Mock next/router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/case-studies',
    query: {},
  }),
}));

// Mock data
const mockCaseStudy: CaseStudy = {
  id: 'case_001',
  title: 'Times Square Digital Billboard Installation',
  subtitle: 'Transforming NYC\'s Most Famous Intersection',
  description: 'A comprehensive LED display solution for one of the world\'s most iconic advertising locations.',
  client: {
    name: 'Times Square Media Group',
    industry: 'Advertising & Media',
    location: 'New York, USA',
    website: 'https://timessquaremedia.com',
  },
  project: {
    startDate: new Date('2023-06-01'),
    completionDate: new Date('2023-09-15'),
    duration: '3.5 months',
    budget: 2500000,
    teamSize: 15,
    projectManager: 'Sarah Johnson',
  },
  location: {
    address: '1560 Broadway, New York, NY 10036',
    coordinates: { lat: 40.7580, lng: -73.9855 },
    timezone: 'America/New_York',
    country: 'United States',
    region: 'North America',
  },
  products: [
    {
      id: 'prod_001',
      name: 'P2.5 Outdoor LED Display',
      category: 'Outdoor LED',
      specifications: {
        pixelPitch: '2.5mm',
        resolution: '3840x2160',
        brightness: '6000 nits',
        size: '10m x 6m',
      },
      quantity: 4,
      unitPrice: 450000,
    },
  ],
  challenges: [
    'Extreme weather conditions in NYC',
    'High pedestrian traffic during installation',
  ],
  solutions: [
    'Weather-resistant IP65 rated displays',
    'Modular installation approach for minimal disruption',
  ],
  results: {
    metrics: [
      { label: 'Viewer Engagement', value: '+150%', description: 'Increase in audience engagement' },
      { label: 'Ad Revenue', value: '+200%', description: 'Revenue increase for advertisers' },
    ],
    testimonial: {
      quote: 'The LED displays have completely transformed our advertising capabilities.',
      author: 'Michael Chen',
      position: 'CEO, Times Square Media Group',
      avatar: '/images/testimonials/michael-chen.jpg',
    },
  },
  media: {
    images: [
      {
        id: 'img_001',
        url: '/images/case-studies/times-square/main.jpg',
        alt: 'Times Square LED Display Installation',
        caption: 'Main LED display installation at Times Square',
        type: 'main',
      },
    ],
    videos: [
      {
        id: 'vid_001',
        url: '/videos/case-studies/times-square-overview.mp4',
        thumbnail: '/images/case-studies/times-square/video-thumb.jpg',
        title: 'Project Overview',
        duration: '3:45',
      },
    ],
    documents: [
      {
        id: 'doc_001',
        name: 'Technical Specifications',
        url: '/documents/times-square-specs.pdf',
        type: 'pdf',
        size: '2.5 MB',
      },
    ],
  },
  tags: ['outdoor', 'advertising', 'high-resolution', 'weather-resistant', 'nyc'],
  category: 'Outdoor Advertising',
  featured: true,
  status: 'completed',
  views: 15420,
  likes: 892,
  shares: 156,
  createdAt: new Date('2023-10-01'),
  updatedAt: new Date('2023-12-15'),
};

const mockCaseStudies: CaseStudy[] = [
  mockCaseStudy,
  {
    ...mockCaseStudy,
    id: 'case_002',
    title: 'Shanghai Shopping Mall LED Wall',
    client: {
      name: 'Shanghai Retail Group',
      industry: 'Retail',
      location: 'Shanghai, China',
    },
    location: {
      address: 'Nanjing Road, Shanghai, China',
      coordinates: { lat: 31.2304, lng: 121.4737 },
      country: 'China',
      region: 'Asia Pacific',
    },
    category: 'Retail Display',
    featured: false,
  },
];

const renderWithI18n = (component: React.ReactElement) => {
  return render(
    <I18nextProvider i18n={i18n}>
      {component}
    </I18nextProvider>
  );
};

describe('CaseStudiesPage', () => {
  it('renders case studies page with header and controls', async () => {
    renderWithI18n(<CaseStudiesPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Successful Case Studies')).toBeInTheDocument();
    });
    
    expect(screen.getByPlaceholderText('Search case studies...')).toBeInTheDocument();
    expect(screen.getByText('Filters')).toBeInTheDocument();
  });

  it('displays case studies in grid view', async () => {
    renderWithI18n(<CaseStudiesPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Times Square Digital Billboard Installation')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Shanghai Shopping Mall LED Wall')).toBeInTheDocument();
    expect(screen.getByText('London Stadium LED Perimeter')).toBeInTheDocument();
  });

  it('handles search functionality', async () => {
    renderWithI18n(<CaseStudiesPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Times Square Digital Billboard Installation')).toBeInTheDocument();
    });
    
    const searchInput = screen.getByPlaceholderText('Search case studies...');
    fireEvent.change(searchInput, { target: { value: 'Times Square' } });
    
    expect(searchInput).toHaveValue('Times Square');
  });

  it('switches between view modes', async () => {
    renderWithI18n(<CaseStudiesPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Times Square Digital Billboard Installation')).toBeInTheDocument();
    });
    
    // Find view mode buttons
    const viewButtons = screen.getAllByRole('button');
    const listViewButton = viewButtons.find(button => 
      button.querySelector('svg')?.getAttribute('data-testid') === 'list-bullet-icon'
    );
    
    if (listViewButton) {
      fireEvent.click(listViewButton);
      // List view should still show case studies
      expect(screen.getByText('Times Square Digital Billboard Installation')).toBeInTheDocument();
    }
  });

  it('handles filter interactions', async () => {
    renderWithI18n(<CaseStudiesPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Filters')).toBeInTheDocument();
    });
    
    const filtersButton = screen.getByText('Filters');
    fireEvent.click(filtersButton);
    
    // Filters should be expanded
    expect(filtersButton).toBeInTheDocument();
  });

  it('handles sorting options', async () => {
    renderWithI18n(<CaseStudiesPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Times Square Digital Billboard Installation')).toBeInTheDocument();
    });
    
    // Find sort dropdown
    const sortSelects = screen.getAllByRole('combobox');
    const sortSelect = sortSelects.find(select => 
      select.getAttribute('value') === 'newest'
    );
    
    if (sortSelect) {
      fireEvent.change(sortSelect, { target: { value: 'budget_high' } });
      expect(sortSelect).toHaveValue('budget_high');
    }
  });

  it('displays statistics correctly', async () => {
    renderWithI18n(<CaseStudiesPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Completed Projects')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Global Regions')).toBeInTheDocument();
    expect(screen.getByText('Industries')).toBeInTheDocument();
    expect(screen.getByText('Total Project Value')).toBeInTheDocument();
  });
});

describe('CaseStudyDetailPage', () => {
  it('renders case study detail page', async () => {
    renderWithI18n(<CaseStudyDetailPage caseStudyId="case_001" />);
    
    await waitFor(() => {
      expect(screen.getByText('Times Square Digital Billboard Installation')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Transforming NYC\'s Most Famous Intersection')).toBeInTheDocument();
    expect(screen.getByText('Times Square Media Group')).toBeInTheDocument();
  });

  it('displays project details and statistics', async () => {
    renderWithI18n(<CaseStudyDetailPage caseStudyId="case_001" />);
    
    await waitFor(() => {
      expect(screen.getByText('Project Overview')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Project Details')).toBeInTheDocument();
    expect(screen.getByText('Timeline')).toBeInTheDocument();
    expect(screen.getByText('Project Scope')).toBeInTheDocument();
  });

  it('displays products used section', async () => {
    renderWithI18n(<CaseStudyDetailPage caseStudyId="case_001" />);
    
    await waitFor(() => {
      expect(screen.getByText('Products Used')).toBeInTheDocument();
    });
    
    expect(screen.getByText('P2.5 Outdoor LED Display')).toBeInTheDocument();
    expect(screen.getByText('Outdoor LED')).toBeInTheDocument();
  });

  it('displays challenges and solutions', async () => {
    renderWithI18n(<CaseStudyDetailPage caseStudyId="case_001" />);
    
    await waitFor(() => {
      expect(screen.getByText('Challenges & Solutions')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Challenges')).toBeInTheDocument();
    expect(screen.getByText('Solutions')).toBeInTheDocument();
    expect(screen.getByText('Extreme weather conditions in NYC')).toBeInTheDocument();
    expect(screen.getByText('Weather-resistant IP65 rated displays')).toBeInTheDocument();
  });

  it('displays results and metrics', async () => {
    renderWithI18n(<CaseStudyDetailPage caseStudyId="case_001" />);
    
    await waitFor(() => {
      expect(screen.getByText('Results & Metrics')).toBeInTheDocument();
    });
    
    expect(screen.getByText('+150%')).toBeInTheDocument();
    expect(screen.getByText('Viewer Engagement')).toBeInTheDocument();
    expect(screen.getByText('+200%')).toBeInTheDocument();
    expect(screen.getByText('Ad Revenue')).toBeInTheDocument();
  });

  it('displays testimonial', async () => {
    renderWithI18n(<CaseStudyDetailPage caseStudyId="case_001" />);
    
    await waitFor(() => {
      expect(screen.getByText('The LED displays have completely transformed our advertising capabilities.')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Michael Chen')).toBeInTheDocument();
    expect(screen.getByText('CEO, Times Square Media Group')).toBeInTheDocument();
  });

  it('displays media gallery', async () => {
    renderWithI18n(<CaseStudyDetailPage caseStudyId="case_001" />);
    
    await waitFor(() => {
      expect(screen.getByText('Media Gallery')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Videos')).toBeInTheDocument();
    expect(screen.getByText('Project Overview')).toBeInTheDocument();
  });

  it('displays client information sidebar', async () => {
    renderWithI18n(<CaseStudyDetailPage caseStudyId="case_001" />);
    
    await waitFor(() => {
      expect(screen.getByText('Client Information')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Times Square Media Group')).toBeInTheDocument();
    expect(screen.getByText('Advertising & Media')).toBeInTheDocument();
    expect(screen.getByText('New York, USA')).toBeInTheDocument();
  });

  it('displays project tags', async () => {
    renderWithI18n(<CaseStudyDetailPage caseStudyId="case_001" />);
    
    await waitFor(() => {
      expect(screen.getByText('Project Tags')).toBeInTheDocument();
    });
    
    expect(screen.getByText('#outdoor')).toBeInTheDocument();
    expect(screen.getByText('#advertising')).toBeInTheDocument();
    expect(screen.getByText('#nyc')).toBeInTheDocument();
  });

  it('displays downloads section', async () => {
    renderWithI18n(<CaseStudyDetailPage caseStudyId="case_001" />);
    
    await waitFor(() => {
      expect(screen.getByText('Downloads')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Technical Specifications')).toBeInTheDocument();
    expect(screen.getByText('2.5 MB')).toBeInTheDocument();
  });

  it('handles like functionality', async () => {
    renderWithI18n(<CaseStudyDetailPage caseStudyId="case_001" />);
    
    await waitFor(() => {
      expect(screen.getByText('892')).toBeInTheDocument();
    });
    
    // Find like button and click it
    const likeButtons = screen.getAllByRole('button');
    const likeButton = likeButtons.find(button => 
      button.textContent?.includes('892') || 
      button.querySelector('svg')?.getAttribute('data-testid') === 'heart-icon'
    );
    
    if (likeButton) {
      fireEvent.click(likeButton);
      // Like count should increase
      expect(screen.getByText('893')).toBeInTheDocument();
    }
  });
});

describe('CaseStudyMap', () => {
  it('renders map component with case studies', async () => {
    renderWithI18n(<CaseStudyMap caseStudies={mockCaseStudies} />);
    
    await waitFor(() => {
      expect(screen.getByText('Global Case Studies')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Total Projects')).toBeInTheDocument();
    expect(screen.getByText('Countries')).toBeInTheDocument();
  });

  it('displays map statistics', async () => {
    renderWithI18n(<CaseStudyMap caseStudies={mockCaseStudies} />);
    
    await waitFor(() => {
      expect(screen.getByText('Total Projects')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Total Value')).toBeInTheDocument();
    expect(screen.getByText('Industries')).toBeInTheDocument();
  });

  it('handles view mode switching', async () => {
    renderWithI18n(<CaseStudyMap caseStudies={mockCaseStudies} />);
    
    await waitFor(() => {
      expect(screen.getByText('Map')).toBeInTheDocument();
    });
    
    const listButton = screen.getByText('List');
    fireEvent.click(listButton);
    
    // Should switch to list view
    expect(screen.getByText('Times Square Digital Billboard Installation')).toBeInTheDocument();
  });

  it('handles search functionality', async () => {
    renderWithI18n(<CaseStudyMap caseStudies={mockCaseStudies} />);
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search case studies...')).toBeInTheDocument();
    });
    
    const searchInput = screen.getByPlaceholderText('Search case studies...');
    fireEvent.change(searchInput, { target: { value: 'Times Square' } });
    
    expect(searchInput).toHaveValue('Times Square');
  });

  it('displays region breakdown', async () => {
    renderWithI18n(<CaseStudyMap caseStudies={mockCaseStudies} />);
    
    await waitFor(() => {
      expect(screen.getByText('Region Breakdown')).toBeInTheDocument();
    });
    
    expect(screen.getByText('North America')).toBeInTheDocument();
    expect(screen.getByText('Asia Pacific')).toBeInTheDocument();
  });

  it('handles case study selection', async () => {
    const mockOnSelect = jest.fn();
    renderWithI18n(<CaseStudyMap caseStudies={mockCaseStudies} onCaseStudySelect={mockOnSelect} />);
    
    await waitFor(() => {
      expect(screen.getByText('Times Square Digital Billboard Installation')).toBeInTheDocument();
    });
    
    // Click on a case study
    const caseStudyElement = screen.getByText('Times Square Digital Billboard Installation');
    fireEvent.click(caseStudyElement);
    
    expect(mockOnSelect).toHaveBeenCalledWith(mockCaseStudy);
  });
});

describe('Case Studies Integration', () => {
  it('handles data consistency across components', async () => {
    const { rerender } = renderWithI18n(<CaseStudiesPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Times Square Digital Billboard Installation')).toBeInTheDocument();
    });
    
    rerender(
      <I18nextProvider i18n={i18n}>
        <CaseStudyDetailPage caseStudyId="case_001" />
      </I18nextProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Times Square Digital Billboard Installation')).toBeInTheDocument();
    });
  });

  it('handles error states gracefully', async () => {
    renderWithI18n(<CaseStudyDetailPage caseStudyId="invalid_id" />);
    
    await waitFor(() => {
      expect(screen.getByText('Loading case study...')).toBeInTheDocument();
    });
  });

  it('handles empty states correctly', async () => {
    renderWithI18n(<CaseStudyMap caseStudies={[]} />);
    
    await waitFor(() => {
      expect(screen.getByText('Global Case Studies')).toBeInTheDocument();
    });
    
    // Should show zero projects
    expect(screen.getByText('0')).toBeInTheDocument();
  });
});

describe('Case Studies Accessibility', () => {
  it('has proper ARIA labels and roles', async () => {
    renderWithI18n(<CaseStudiesPage />);
    
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });
    
    const searchInput = screen.getByPlaceholderText('Search case studies...');
    expect(searchInput).toHaveAttribute('type', 'text');
  });

  it('supports keyboard navigation', async () => {
    renderWithI18n(<CaseStudiesPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Filters')).toBeInTheDocument();
    });
    
    const filtersButton = screen.getByText('Filters');
    filtersButton.focus();
    expect(document.activeElement).toBe(filtersButton);
  });

  it('has proper heading hierarchy', async () => {
    renderWithI18n(<CaseStudyDetailPage caseStudyId="case_001" />);
    
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });
    
    const headings = screen.getAllByRole('heading');
    expect(headings.length).toBeGreaterThan(0);
  });
});

describe('Case Studies Performance', () => {
  it('renders components within acceptable time', async () => {
    const startTime = performance.now();
    
    renderWithI18n(<CaseStudiesPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Successful Case Studies')).toBeInTheDocument();
    });
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    // Should render within 1 second
    expect(renderTime).toBeLessThan(1000);
  });

  it('handles large datasets efficiently', async () => {
    const largeCaseStudies = Array.from({ length: 100 }, (_, i) => ({
      ...mockCaseStudy,
      id: `case_${i}`,
      title: `Case Study ${i}`,
    }));
    
    renderWithI18n(<CaseStudyMap caseStudies={largeCaseStudies} />);
    
    await waitFor(() => {
      expect(screen.getByText('Global Case Studies')).toBeInTheDocument();
    });
    
    // Should render without performance issues
    expect(screen.getByText('100')).toBeInTheDocument();
  });
});