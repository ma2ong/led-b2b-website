import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { 
  InquiryCreateData,
  InquiryType,
  InquirySource,
  CustomerType
} from '@/types/inquiry';
import { validateInquiryCreateData } from '@/lib/inquiry-validation';
import { 
  Form,
  FormSection,
  FormFieldGroup,
  FormActions,
  Button,
  Input,
  Textarea,
  Select
} from '@/components/ui/FormComponents';

const InquiryForm: React.FC = () => {
  const { t } = useTranslation('forms');
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    jobTitle: '',
    company: '',
    website: '',
    industry: '',
    country: '',
    city: '',
    subject: '',
    message: '',
    productName: '',
    pixelPitch: '',
    screenWidth: '',
    screenHeight: '',
    screenUnit: 'mm',
    quantity: '',
    application: '',
    installationEnvironment: 'indoor',
    budget: '',
    timeline: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const countryOptions = [
    { value: '', label: 'Select Country' },
    { value: 'United States', label: 'United States' },
    { value: 'China', label: 'China' },
    { value: 'United Kingdom', label: 'United Kingdom' },
    { value: 'Germany', label: 'Germany' },
    { value: 'France', label: 'France' },
    { value: 'Japan', label: 'Japan' },
    { value: 'South Korea', label: 'South Korea' },
    { value: 'Australia', label: 'Australia' },
    { value: 'Canada', label: 'Canada' },
    { value: 'India', label: 'India' },
  ];

  const industryOptions = [
    { value: '', label: 'Select Industry' },
    { value: 'Retail', label: 'Retail' },
    { value: 'Hospitality', label: 'Hospitality' },
    { value: 'Transportation', label: 'Transportation' },
    { value: 'Education', label: 'Education' },
    { value: 'Healthcare', label: 'Healthcare' },
    { value: 'Entertainment', label: 'Entertainment' },
    { value: 'Corporate', label: 'Corporate' },
    { value: 'Government', label: 'Government' },
    { value: 'Other', label: 'Other' },
  ];

  const screenUnitOptions = [
    { value: 'mm', label: 'mm' },
    { value: 'cm', label: 'cm' },
    { value: 'm', label: 'm' },
    { value: 'inch', label: 'inch' },
    { value: 'ft', label: 'ft' },
  ];

  const installationOptions = [
    { value: 'indoor', label: 'Indoor' },
    { value: 'outdoor', label: 'Outdoor' },
    { value: 'semi_outdoor', label: 'Semi-Outdoor' },
  ];

  const budgetOptions = [
    { value: 'under_10k', label: 'Under $10,000' },
    { value: '10k_to_50k', label: '$10,000 - $50,000' },
    { value: '50k_to_100k', label: '$50,000 - $100,000' },
    { value: '100k_to_500k', label: '$100,000 - $500,000' },
    { value: 'over_500k', label: 'Over $500,000' },
    { value: 'not_specified', label: 'Not Specified' },
  ];

  const timelineOptions = [
    { value: 'immediate', label: 'Immediate' },
    { value: 'within_1_month', label: 'Within 1 Month' },
    { value: 'within_3_months', label: 'Within 3 Months' },
    { value: 'within_6_months', label: 'Within 6 Months' },
    { value: 'over_6_months', label: 'Over 6 Months' },
    { value: 'not_specified', label: 'Not Specified' },
  ];

  const handleInputChange = (field: string) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Prepare inquiry data
    const inquiryData: InquiryCreateData = {
      type: InquiryType.QUOTE_REQUEST,
      source: InquirySource.WEBSITE,
      contact: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone || undefined,
        jobTitle: formData.jobTitle || undefined,
      },
      company: {
        name: formData.company,
        website: formData.website || undefined,
        industry: formData.industry || undefined,
        country: formData.country,
        city: formData.city || undefined,
      },
      customerType: CustomerType.END_USER,
      productRequirements: [{
        productName: formData.productName || undefined,
        pixelPitch: formData.pixelPitch || undefined,
        screenSize: formData.screenWidth && formData.screenHeight ? {
          width: parseFloat(formData.screenWidth),
          height: parseFloat(formData.screenHeight),
          unit: formData.screenUnit as any,
        } : undefined,
        quantity: formData.quantity ? parseInt(formData.quantity) : undefined,
        application: formData.application || undefined,
        installationEnvironment: formData.installationEnvironment as any,
      }],
      projectInfo: {
        budget: formData.budget ? {
          range: formData.budget as any,
        } : undefined,
        timeline: formData.timeline as any || undefined,
      },
      subject: formData.subject,
      message: formData.message,
      language: (router.locale || 'en') as 'en' | 'zh',
    };

    // Validate data
    const validationErrors = validateInquiryCreateData(inquiryData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      // Submit inquiry
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(inquiryData),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Redirect to thank you page
          router.push('/thank-you');
        } else {
          throw new Error(result.error?.message || 'Failed to submit inquiry');
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to submit inquiry');
      }
    } catch (error) {
      console.error('Submission error:', error);
      setErrors({ submit: error instanceof Error ? error.message : 'Failed to submit inquiry' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            LED Display Inquiry
          </h1>
          <p className="text-gray-600">
            Tell us about your LED display requirements and we'll get back to you with a customized solution.
          </p>
        </div>

        <Form onSubmit={handleSubmit}>
          <FormSection
            title="Contact Information"
            description="Your contact details"
          >
            <FormFieldGroup>
              <Input
                label="First Name"
                value={formData.firstName}
                onChange={handleInputChange('firstName')}
                error={errors['contact.firstName']}
                required
              />
              <Input
                label="Last Name"
                value={formData.lastName}
                onChange={handleInputChange('lastName')}
                error={errors['contact.lastName']}
                required
              />
            </FormFieldGroup>

            <FormFieldGroup>
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleInputChange('email')}
                error={errors['contact.email']}
                required
              />
              <Input
                label="Phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange('phone')}
                error={errors['contact.phone']}
                helperText="Include country code for international numbers"
              />
            </FormFieldGroup>

            <Input
              label="Job Title"
              value={formData.jobTitle}
              onChange={handleInputChange('jobTitle')}
              error={errors['contact.jobTitle']}
            />
          </FormSection>

          <FormSection
            title="Company Information"
            description="Details about your organization"
          >
            <Input
              label="Company Name"
              value={formData.company}
              onChange={handleInputChange('company')}
              error={errors['company.name']}
              required
            />

            <FormFieldGroup>
              <Input
                label="Website"
                type="url"
                value={formData.website}
                onChange={handleInputChange('website')}
                error={errors['company.website']}
                placeholder="https://example.com"
              />
              <Select
                label="Industry"
                options={industryOptions}
                value={formData.industry}
                onChange={handleInputChange('industry')}
                error={errors['company.industry']}
              />
            </FormFieldGroup>

            <FormFieldGroup>
              <Select
                label="Country"
                options={countryOptions}
                value={formData.country}
                onChange={handleInputChange('country')}
                error={errors['company.country']}
                required
              />
              <Input
                label="City"
                value={formData.city}
                onChange={handleInputChange('city')}
                error={errors['company.city']}
              />
            </FormFieldGroup>
          </FormSection>

          <FormSection
            title="Project Details"
            description="Information about your LED display requirements"
          >
            <Input
              label="Subject"
              value={formData.subject}
              onChange={handleInputChange('subject')}
              error={errors.subject}
              required
            />

            <FormFieldGroup>
              <Input
                label="Product Name"
                value={formData.productName}
                onChange={handleInputChange('productName')}
                error={errors['productRequirements[0].productName']}
                placeholder="P2.5 Indoor LED Display"
              />
              <Input
                label="Pixel Pitch"
                value={formData.pixelPitch}
                onChange={handleInputChange('pixelPitch')}
                error={errors['productRequirements[0].pixelPitch']}
                placeholder="P2.5"
              />
            </FormFieldGroup>

            <div className="space-y-4">
              <label className="text-sm font-medium text-gray-700">
                Screen Size
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Width"
                  type="number"
                  value={formData.screenWidth}
                  onChange={handleInputChange('screenWidth')}
                  error={errors['productRequirements[0].screenWidth']}
                />
                <Input
                  label="Height"
                  type="number"
                  value={formData.screenHeight}
                  onChange={handleInputChange('screenHeight')}
                  error={errors['productRequirements[0].screenHeight']}
                />
                <Select
                  label="Unit"
                  options={screenUnitOptions}
                  value={formData.screenUnit}
                  onChange={handleInputChange('screenUnit')}
                  error={errors['productRequirements[0].screenUnit']}
                />
              </div>
            </div>

            <FormFieldGroup>
              <Input
                label="Quantity"
                type="number"
                value={formData.quantity}
                onChange={handleInputChange('quantity')}
                error={errors['productRequirements[0].quantity']}
                min="1"
              />
              <Select
                label="Installation Environment"
                options={installationOptions}
                value={formData.installationEnvironment}
                onChange={handleInputChange('installationEnvironment')}
                error={errors['productRequirements[0].installationEnvironment']}
              />
            </FormFieldGroup>

            <Input
              label="Application"
              value={formData.application}
              onChange={handleInputChange('application')}
              error={errors['productRequirements[0].application']}
              placeholder="Conference room, retail store, outdoor advertising, etc."
            />

            <FormFieldGroup>
              <Select
                label="Budget Range"
                options={budgetOptions}
                value={formData.budget}
                onChange={handleInputChange('budget')}
                error={errors['projectInfo.budgetRange']}
              />
              <Select
                label="Timeline"
                options={timelineOptions}
                value={formData.timeline}
                onChange={handleInputChange('timeline')}
                error={errors['projectInfo.timeline']}
              />
            </FormFieldGroup>

            <Textarea
              label="Message"
              value={formData.message}
              onChange={handleInputChange('message')}
              error={errors.message}
              rows={6}
              helperText="Please provide detailed information about your requirements"
              required
            />
          </FormSection>

          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-600">{errors.submit}</p>
            </div>
          )}

          <FormActions>
            <Button type="button" variant="outline">
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Inquiry'}
            </Button>
          </FormActions>
        </Form>
      </div>
    </div>
  );
};

export default InquiryForm;