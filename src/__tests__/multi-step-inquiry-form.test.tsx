/**
 * 多步骤询盘表单测试
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import MultiStepInquiryForm from '@/components/forms/MultiStepInquiryForm';

// Mock dependencies
jest.mock('next/router');
jest.mock('next-i18next');

const mockRouter = {
  push: jest.fn(),
  locale: 'en',
};

const mockT = (key: string, options?: any) => {
  const translations: Record<string, string> = {
    'contactInformation': 'Contact Information',
    'contactInformationDesc': 'Please provide your contact details',
    'companyInformation': 'Company Information',
    'companyInformationDesc': 'Tell us about your company',
    'productRequirements': 'Product Requirements',
    'productRequirementsDesc': 'Specify your product needs',
    'projectDetails': 'Project Details',
    'projectDetailsDesc': 'Provide project information',
    'reviewSubmit': 'Review & Submit',
    'reviewSubmitDesc': 'Review your information before submitting',
    'firstName': 'First Name',
    'lastName': 'Last Name',
    'email': 'Email',
    'phone': 'Phone',
    'companyName': 'Company Name',
    'country': 'Country',
    'application': 'Application',
    'subject': 'Subject',
    'message': 'Message',
    'previous': 'Previous',
    'next': 'Next',
    'submitInquiry': 'Submit Inquiry',
    'submitting': 'Submitting...',
    'firstNameRequired': 'First name is required',
    'lastNameRequired': 'Last name is required',
    'emailRequired': 'Email is required',
    'emailInvalid': 'Email is invalid',
    'companyNameRequired': 'Company name is required',
    'countryRequired': 'Country is required',
    'applicationRequired': 'Application is required',
    'subjectRequired': 'Subject is required',
    'messageRequired': 'Message is required',
  };
  return translations[key] || key;
};

(useRouter as jest.Mock).mockReturnValue(mockRouter);
(useTranslation as jest.Mock).mockReturnValue({ t: mockT });

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock fetch
global.fetch = jest.fn();

describe('MultiStepInquiryForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  it('renders the first step correctly', () => {
    render(<MultiStepInquiryForm />);

    expect(screen.getByText('Contact Information')).toBeInTheDocument();
    expect(screen.getByText('Please provide your contact details')).toBeInTheDocument();
    expect(screen.getByLabelText('First Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Last Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('shows step indicators correctly', () => {
    render(<MultiStepInquiryForm />);

    // Check that all steps are shown in the indicator
    expect(screen.getByText('Contact Information')).toBeInTheDocument();
    expect(screen.getByText('Company Information')).toBeInTheDocument();
    expect(screen.getByText('Product Requirements')).toBeInTheDocument();
    expect(screen.getByText('Project Details')).toBeInTheDocument();
    expect(screen.getByText('Review & Submit')).toBeInTheDocument();
  });

  it('validates required fields on first step', async () => {
    const user = userEvent.setup();
    render(<MultiStepInquiryForm />);

    const nextButton = screen.getByText('Next');
    await user.click(nextButton);

    expect(screen.getByText('First name is required')).toBeInTheDocument();
    expect(screen.getByText('Last name is required')).toBeInTheDocument();
    expect(screen.getByText('Email is required')).toBeInTheDocument();
  });

  it('validates email format', async () => {
    const user = userEvent.setup();
    render(<MultiStepInquiryForm />);

    const emailInput = screen.getByLabelText('Email');
    await user.type(emailInput, 'invalid-email');

    const nextButton = screen.getByText('Next');
    await user.click(nextButton);

    expect(screen.getByText('Email is invalid')).toBeInTheDocument();
  });

  it('progresses to next step when validation passes', async () => {
    const user = userEvent.setup();
    render(<MultiStepInquiryForm />);

    // Fill in required fields
    await user.type(screen.getByLabelText('First Name'), 'John');
    await user.type(screen.getByLabelText('Last Name'), 'Doe');
    await user.type(screen.getByLabelText('Email'), 'john@example.com');

    const nextButton = screen.getByText('Next');
    await user.click(nextButton);

    // Should now be on company information step
    expect(screen.getByText('Tell us about your company')).toBeInTheDocument();
    expect(screen.getByLabelText('Company Name')).toBeInTheDocument();
  });

  it('allows going back to previous step', async () => {
    const user = userEvent.setup();
    render(<MultiStepInquiryForm />);

    // Fill first step and go to second
    await user.type(screen.getByLabelText('First Name'), 'John');
    await user.type(screen.getByLabelText('Last Name'), 'Doe');
    await user.type(screen.getByLabelText('Email'), 'john@example.com');
    await user.click(screen.getByText('Next'));

    // Now on second step
    expect(screen.getByText('Tell us about your company')).toBeInTheDocument();

    // Go back to first step
    const previousButton = screen.getByText('Previous');
    await user.click(previousButton);

    // Should be back on first step
    expect(screen.getByText('Please provide your contact details')).toBeInTheDocument();
    expect(screen.getByDisplayValue('John')).toBeInTheDocument();
  });

  it('saves form data to localStorage', async () => {
    const user = userEvent.setup();
    render(<MultiStepInquiryForm />);

    await user.type(screen.getByLabelText('First Name'), 'John');
    await user.type(screen.getByLabelText('Last Name'), 'Doe');

    // Wait for auto-save
    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'inquiry-form-data',
        expect.stringContaining('John')
      );
    }, { timeout: 2000 });
  });

  it('loads saved form data from localStorage', () => {
    const savedData = {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
    };
    localStorageMock.getItem.mockReturnValue(JSON.stringify(savedData));

    render(<MultiStepInquiryForm />);

    expect(screen.getByDisplayValue('Jane')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Smith')).toBeInTheDocument();
    expect(screen.getByDisplayValue('jane@example.com')).toBeInTheDocument();
  });

  it('completes all steps and shows summary', async () => {
    const user = userEvent.setup();
    render(<MultiStepInquiryForm />);

    // Step 1: Contact Information
    await user.type(screen.getByLabelText('First Name'), 'John');
    await user.type(screen.getByLabelText('Last Name'), 'Doe');
    await user.type(screen.getByLabelText('Email'), 'john@example.com');
    await user.click(screen.getByText('Next'));

    // Step 2: Company Information
    await user.type(screen.getByLabelText('Company Name'), 'Test Company');
    await user.selectOptions(screen.getByLabelText('Country'), 'United States');
    await user.click(screen.getByText('Next'));

    // Step 3: Product Requirements
    await user.selectOptions(screen.getByLabelText('Application'), 'Conference Room');
    await user.click(screen.getByText('Next'));

    // Step 4: Project Details
    await user.type(screen.getByLabelText('Subject'), 'Test Inquiry');
    await user.type(screen.getByLabelText('Message'), 'This is a test message');
    await user.click(screen.getByText('Next'));

    // Step 5: Summary
    expect(screen.getByText('Review & Submit')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Test Company')).toBeInTheDocument();
    expect(screen.getByText('Test Inquiry')).toBeInTheDocument();
  });

  it('allows editing from summary step', async () => {
    const user = userEvent.setup();
    render(<MultiStepInquiryForm />);

    // Complete all steps to reach summary
    await user.type(screen.getByLabelText('First Name'), 'John');
    await user.type(screen.getByLabelText('Last Name'), 'Doe');
    await user.type(screen.getByLabelText('Email'), 'john@example.com');
    await user.click(screen.getByText('Next'));

    await user.type(screen.getByLabelText('Company Name'), 'Test Company');
    await user.selectOptions(screen.getByLabelText('Country'), 'United States');
    await user.click(screen.getByText('Next'));

    await user.selectOptions(screen.getByLabelText('Application'), 'Conference Room');
    await user.click(screen.getByText('Next'));

    await user.type(screen.getByLabelText('Subject'), 'Test Inquiry');
    await user.type(screen.getByLabelText('Message'), 'This is a test message');
    await user.click(screen.getByText('Next'));

    // Now on summary step, click edit for contact information
    const editButtons = screen.getAllByText('Edit');
    await user.click(editButtons[0]);

    // Should be back on contact information step
    expect(screen.getByText('Please provide your contact details')).toBeInTheDocument();
  });

  it('submits form successfully', async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    render(<MultiStepInquiryForm />);

    // Complete all steps
    await user.type(screen.getByLabelText('First Name'), 'John');
    await user.type(screen.getByLabelText('Last Name'), 'Doe');
    await user.type(screen.getByLabelText('Email'), 'john@example.com');
    await user.click(screen.getByText('Next'));

    await user.type(screen.getByLabelText('Company Name'), 'Test Company');
    await user.selectOptions(screen.getByLabelText('Country'), 'United States');
    await user.click(screen.getByText('Next'));

    await user.selectOptions(screen.getByLabelText('Application'), 'Conference Room');
    await user.click(screen.getByText('Next'));

    await user.type(screen.getByLabelText('Subject'), 'Test Inquiry');
    await user.type(screen.getByLabelText('Message'), 'This is a test message');
    await user.click(screen.getByText('Next'));

    // Submit form
    const submitButton = screen.getByText('Submit Inquiry');
    await user.click(submitButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/inquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: expect.stringContaining('john@example.com'),
      });
    });

    expect(mockRouter.push).toHaveBeenCalledWith('/thank-you');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('inquiry-form-data');
  });

  it('handles submission errors', async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: { message: 'Submission failed' } }),
    });

    render(<MultiStepInquiryForm />);

    // Complete all steps and submit
    await user.type(screen.getByLabelText('First Name'), 'John');
    await user.type(screen.getByLabelText('Last Name'), 'Doe');
    await user.type(screen.getByLabelText('Email'), 'john@example.com');
    await user.click(screen.getByText('Next'));

    await user.type(screen.getByLabelText('Company Name'), 'Test Company');
    await user.selectOptions(screen.getByLabelText('Country'), 'United States');
    await user.click(screen.getByText('Next'));

    await user.selectOptions(screen.getByLabelText('Application'), 'Conference Room');
    await user.click(screen.getByText('Next'));

    await user.type(screen.getByLabelText('Subject'), 'Test Inquiry');
    await user.type(screen.getByLabelText('Message'), 'This is a test message');
    await user.click(screen.getByText('Next'));

    const submitButton = screen.getByText('Submit Inquiry');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Submission failed')).toBeInTheDocument();
    });
  });

  it('shows loading state during submission', async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock).mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: async () => ({ success: true }),
      }), 1000))
    );

    render(<MultiStepInquiryForm />);

    // Complete all steps
    await user.type(screen.getByLabelText('First Name'), 'John');
    await user.type(screen.getByLabelText('Last Name'), 'Doe');
    await user.type(screen.getByLabelText('Email'), 'john@example.com');
    await user.click(screen.getByText('Next'));

    await user.type(screen.getByLabelText('Company Name'), 'Test Company');
    await user.selectOptions(screen.getByLabelText('Country'), 'United States');
    await user.click(screen.getByText('Next'));

    await user.selectOptions(screen.getByLabelText('Application'), 'Conference Room');
    await user.click(screen.getByText('Next'));

    await user.type(screen.getByLabelText('Subject'), 'Test Inquiry');
    await user.type(screen.getByLabelText('Message'), 'This is a test message');
    await user.click(screen.getByText('Next'));

    const submitButton = screen.getByText('Submit Inquiry');
    await user.click(submitButton);

    expect(screen.getByText('Submitting...')).toBeInTheDocument();
  });

  it('prevents navigation to future steps', async () => {
    const user = userEvent.setup();
    render(<MultiStepInquiryForm />);

    // Try to click on a future step (should be disabled)
    const companyStepButton = screen.getByText('Company Information');
    await user.click(companyStepButton);

    // Should still be on the first step
    expect(screen.getByText('Please provide your contact details')).toBeInTheDocument();
  });

  it('handles localStorage errors gracefully', () => {
    localStorageMock.getItem.mockImplementation(() => {
      throw new Error('localStorage error');
    });

    // Should not crash
    expect(() => render(<MultiStepInquiryForm />)).not.toThrow();
  });
});