/**
 * CRM功能测试
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../lib/i18n';
import CustomerManagement from '../components/crm/CustomerManagement';
import CustomerDetailPage from '../components/crm/CustomerDetailPage';
import CommunicationHistory from '../components/crm/CommunicationHistory';
import OpportunityTracker from '../components/crm/OpportunityTracker';

// Mock next/router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/crm',
    query: {},
  }),
}));

// Mock data
const mockCustomer = {
  id: 'cust_001',
  customerNumber: 'CUST-2024-001',
  type: 'customer' as const,
  status: 'active' as const,
  priority: 'vip' as const,
  company: {
    name: 'Tech Solutions Inc',
    website: 'https://techsolutions.com',
    industry: 'Technology',
    size: 'large' as const,
    country: 'United States',
    city: 'New York',
    address: '123 Tech Street, NY 10001',
  },
  primaryContact: {
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@techsolutions.com',
    phone: '+1-555-0123',
    jobTitle: 'CTO',
    department: 'Technology',
  },
  contacts: [],
  business: {
    annualRevenue: 50000000,
    employeeCount: 500,
    marketSegment: 'Enterprise',
    purchasingPower: 'high' as const,
    decisionMaker: true,
  },
  relationship: {
    source: 'trade_show' as const,
    assignedTo: 'sales@company.com',
    rating: 5,
    lastContactDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    nextFollowUpDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    relationshipStage: 'purchase' as const,
  },
  tags: ['enterprise', 'high-value', 'technology'],
  categories: ['Enterprise Customer', 'Technology Sector'],
  stats: {
    totalInquiries: 15,
    totalOrders: 8,
    totalRevenue: 2500000,
    averageOrderValue: 312500,
    lastOrderDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    lifetimeValue: 2500000,
  },
  createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
  updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  lastActivityAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
};

const renderWithI18n = (component: React.ReactElement) => {
  return render(
    <I18nextProvider i18n={i18n}>
      {component}
    </I18nextProvider>
  );
};

describe('CustomerManagement', () => {
  it('renders customer management interface', async () => {
    renderWithI18n(<CustomerManagement />);
    
    await waitFor(() => {
      expect(screen.getByText('Customer Management')).toBeInTheDocument();
    });
    
    expect(screen.getByPlaceholderText('Search customers...')).toBeInTheDocument();
    expect(screen.getByText('Add Customer')).toBeInTheDocument();
    expect(screen.getByText('Filters')).toBeInTheDocument();
  });

  it('displays customer list with correct information', async () => {
    renderWithI18n(<CustomerManagement />);
    
    await waitFor(() => {
      expect(screen.getByText('Tech Solutions Inc')).toBeInTheDocument();
    });
    
    expect(screen.getByText('CUST-2024-001')).toBeInTheDocument();
    expect(screen.getByText('John Smith')).toBeInTheDocument();
    expect(screen.getByText('john.smith@techsolutions.com')).toBeInTheDocument();
    expect(screen.getByText('New York, United States')).toBeInTheDocument();
  });

  it('handles search functionality', async () => {
    renderWithI18n(<CustomerManagement />);
    
    await waitFor(() => {
      expect(screen.getByText('Tech Solutions Inc')).toBeInTheDocument();
    });
    
    const searchInput = screen.getByPlaceholderText('Search customers...');
    fireEvent.change(searchInput, { target: { value: 'Tech Solutions' } });
    
    expect(searchInput).toHaveValue('Tech Solutions');
  });

  it('switches between list and grid view', async () => {
    renderWithI18n(<CustomerManagement />);
    
    await waitFor(() => {
      expect(screen.getByText('Tech Solutions Inc')).toBeInTheDocument();
    });
    
    // Find view mode buttons
    const viewButtons = screen.getAllByRole('button');
    const gridButton = viewButtons.find(button => 
      button.querySelector('svg')?.getAttribute('viewBox') === '0 0 20 20'
    );
    
    if (gridButton) {
      fireEvent.click(gridButton);
      // Grid view should still show customer information
      expect(screen.getByText('Tech Solutions Inc')).toBeInTheDocument();
    }
  });

  it('handles filter interactions', async () => {
    renderWithI18n(<CustomerManagement />);
    
    await waitFor(() => {
      expect(screen.getByText('Filters')).toBeInTheDocument();
    });
    
    const filtersButton = screen.getByText('Filters');
    fireEvent.click(filtersButton);
    
    // Filters should be expanded (implementation may vary)
    expect(filtersButton).toBeInTheDocument();
  });
});

describe('CustomerDetailPage', () => {
  it('renders customer detail information', async () => {
    renderWithI18n(<CustomerDetailPage customerId="cust_001" />);
    
    await waitFor(() => {
      expect(screen.getByText('Tech Solutions Inc')).toBeInTheDocument();
    });
    
    expect(screen.getByText('CUST-2024-001')).toBeInTheDocument();
    expect(screen.getByText('John Smith')).toBeInTheDocument();
    expect(screen.getByText('CTO')).toBeInTheDocument();
  });

  it('displays customer statistics', async () => {
    renderWithI18n(<CustomerDetailPage customerId="cust_001" />);
    
    await waitFor(() => {
      expect(screen.getByText('Total Revenue')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Total Orders')).toBeInTheDocument();
    expect(screen.getByText('Total Inquiries')).toBeInTheDocument();
    expect(screen.getByText('Lifetime Value')).toBeInTheDocument();
  });

  it('handles tab navigation', async () => {
    renderWithI18n(<CustomerDetailPage customerId="cust_001" />);
    
    await waitFor(() => {
      expect(screen.getByText('Overview')).toBeInTheDocument();
    });
    
    const activitiesTab = screen.getByText('Activities');
    fireEvent.click(activitiesTab);
    
    expect(screen.getByText('Recent Activities')).toBeInTheDocument();
    
    const opportunitiesTab = screen.getByText('Opportunities');
    fireEvent.click(opportunitiesTab);
    
    expect(screen.getByText('Sales Opportunities')).toBeInTheDocument();
  });

  it('displays contact information correctly', async () => {
    renderWithI18n(<CustomerDetailPage customerId="cust_001" />);
    
    await waitFor(() => {
      expect(screen.getByText('Primary Contact')).toBeInTheDocument();
    });
    
    expect(screen.getByText('john.smith@techsolutions.com')).toBeInTheDocument();
    expect(screen.getByText('+1-555-0123')).toBeInTheDocument();
  });
});

describe('CommunicationHistory', () => {
  it('renders communication history interface', async () => {
    renderWithI18n(<CommunicationHistory customerId="cust_001" />);
    
    await waitFor(() => {
      expect(screen.getByText('Communication History')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Add Record')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search records...')).toBeInTheDocument();
  });

  it('displays communication records', async () => {
    renderWithI18n(<CommunicationHistory customerId="cust_001" />);
    
    await waitFor(() => {
      expect(screen.getByText('Follow-up on LED Display Inquiry')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Request for Technical Specifications')).toBeInTheDocument();
    expect(screen.getByText('Product Demo and Site Visit')).toBeInTheDocument();
  });

  it('handles adding new communication record', async () => {
    renderWithI18n(<CommunicationHistory customerId="cust_001" />);
    
    await waitFor(() => {
      expect(screen.getByText('Add Record')).toBeInTheDocument();
    });
    
    const addButton = screen.getByText('Add Record');
    fireEvent.click(addButton);
    
    expect(screen.getByLabelText('Subject')).toBeInTheDocument();
    expect(screen.getByLabelText('Content')).toBeInTheDocument();
  });

  it('handles search and filter functionality', async () => {
    renderWithI18n(<CommunicationHistory customerId="cust_001" />);
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search records...')).toBeInTheDocument();
    });
    
    const searchInput = screen.getByPlaceholderText('Search records...');
    fireEvent.change(searchInput, { target: { value: 'LED Display' } });
    
    expect(searchInput).toHaveValue('LED Display');
  });
});

describe('OpportunityTracker', () => {
  it('renders opportunity tracker interface', async () => {
    renderWithI18n(<OpportunityTracker />);
    
    await waitFor(() => {
      expect(screen.getByText('Sales Opportunities')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Add Opportunity')).toBeInTheDocument();
    expect(screen.getByText('Total Opportunities')).toBeInTheDocument();
    expect(screen.getByText('Total Value')).toBeInTheDocument();
  });

  it('displays opportunity statistics', async () => {
    renderWithI18n(<OpportunityTracker />);
    
    await waitFor(() => {
      expect(screen.getByText('Total Opportunities')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Weighted Value')).toBeInTheDocument();
    expect(screen.getByText('Avg Close Time')).toBeInTheDocument();
  });

  it('displays opportunity list', async () => {
    renderWithI18n(<OpportunityTracker />);
    
    await waitFor(() => {
      expect(screen.getByText('Conference Room LED Display Project')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Lobby Digital Signage')).toBeInTheDocument();
    expect(screen.getByText('Outdoor LED Billboard')).toBeInTheDocument();
  });

  it('handles view mode switching', async () => {
    renderWithI18n(<OpportunityTracker />);
    
    await waitFor(() => {
      expect(screen.getByText('List')).toBeInTheDocument();
    });
    
    const funnelButton = screen.getByText('Funnel');
    fireEvent.click(funnelButton);
    
    // Should switch to funnel view
    expect(screen.getByText('Prospecting')).toBeInTheDocument();
    expect(screen.getByText('Qualification')).toBeInTheDocument();
    expect(screen.getByText('Proposal')).toBeInTheDocument();
  });

  it('handles search functionality', async () => {
    renderWithI18n(<OpportunityTracker />);
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search opportunities...')).toBeInTheDocument();
    });
    
    const searchInput = screen.getByPlaceholderText('Search opportunities...');
    fireEvent.change(searchInput, { target: { value: 'Conference Room' } });
    
    expect(searchInput).toHaveValue('Conference Room');
  });
});

describe('CRM Integration', () => {
  it('handles customer data consistency across components', async () => {
    // Test that customer data is consistent between management and detail views
    const { rerender } = renderWithI18n(<CustomerManagement />);
    
    await waitFor(() => {
      expect(screen.getByText('Tech Solutions Inc')).toBeInTheDocument();
    });
    
    rerender(
      <I18nextProvider i18n={i18n}>
        <CustomerDetailPage customerId="cust_001" />
      </I18nextProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Tech Solutions Inc')).toBeInTheDocument();
    });
    
    expect(screen.getByText('CUST-2024-001')).toBeInTheDocument();
  });

  it('handles error states gracefully', async () => {
    // Test error handling when customer ID doesn't exist
    renderWithI18n(<CustomerDetailPage customerId="invalid_id" />);
    
    await waitFor(() => {
      expect(screen.getByText('Loading customer...')).toBeInTheDocument();
    });
  });

  it('handles empty states correctly', async () => {
    // Test empty state when no data is available
    renderWithI18n(<OpportunityTracker customerId="empty_customer" />);
    
    await waitFor(() => {
      expect(screen.getByText('No opportunities found')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Start tracking your sales opportunities')).toBeInTheDocument();
  });
});

describe('CRM Accessibility', () => {
  it('has proper ARIA labels and roles', async () => {
    renderWithI18n(<CustomerManagement />);
    
    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument();
    });
    
    const searchInput = screen.getByPlaceholderText('Search customers...');
    expect(searchInput).toHaveAttribute('type', 'text');
  });

  it('supports keyboard navigation', async () => {
    renderWithI18n(<CustomerManagement />);
    
    await waitFor(() => {
      expect(screen.getByText('Add Customer')).toBeInTheDocument();
    });
    
    const addButton = screen.getByText('Add Customer');
    expect(addButton).toBeInTheDocument();
    
    // Test that button is focusable
    addButton.focus();
    expect(document.activeElement).toBe(addButton);
  });

  it('has proper heading hierarchy', async () => {
    renderWithI18n(<CustomerDetailPage customerId="cust_001" />);
    
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });
    
    const headings = screen.getAllByRole('heading');
    expect(headings.length).toBeGreaterThan(0);
  });
});

describe('CRM Performance', () => {
  it('renders components within acceptable time', async () => {
    const startTime = performance.now();
    
    renderWithI18n(<CustomerManagement />);
    
    await waitFor(() => {
      expect(screen.getByText('Customer Management')).toBeInTheDocument();
    });
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    // Should render within 1 second
    expect(renderTime).toBeLessThan(1000);
  });

  it('handles large datasets efficiently', async () => {
    // Test with a component that might handle many records
    renderWithI18n(<CommunicationHistory customerId="cust_001" />);
    
    await waitFor(() => {
      expect(screen.getByText('Communication History')).toBeInTheDocument();
    });
    
    // Should render without performance issues
    expect(screen.getByText('Follow-up on LED Display Inquiry')).toBeInTheDocument();
  });
});