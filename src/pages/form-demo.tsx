import React, { useState } from 'react';
import { NextPage } from 'next';
import {
  Form,
  FormSection,
  FormFieldGroup,
  FormActions,
  Button,
  Input,
  Textarea,
  Checkbox,
  Select,
  FileUpload
} from '@/components/ui/FormComponents';
import { validateForm, commonRules } from '@/lib/form-utils';

const FormDemo: NextPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    industry: '',
    message: '',
    newsletter: false,
    terms: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const industryOptions = [
    { value: '', label: 'Select an industry' },
    { value: 'retail', label: 'Retail' },
    { value: 'hospitality', label: 'Hospitality' },
    { value: 'transportation', label: 'Transportation' },
    { value: 'education', label: 'Education' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'other', label: 'Other' }
  ];

  const validationRules = {
    firstName: { required: true, minLength: 2 },
    lastName: { required: true, minLength: 2 },
    email: commonRules.email,
    phone: commonRules.phone,
    company: { required: true },
    industry: { required: true },
    message: { required: true, minLength: 10 },
    terms: { 
      required: true,
      custom: (value: boolean) => value ? null : 'You must accept the terms and conditions'
    }
  };

  const handleInputChange = (field: string) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const value = e.target.type === 'checkbox' 
      ? (e.target as HTMLInputElement).checked 
      : e.target.value;
    
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFileSelect = (files: File[]) => {
    console.log('Selected files:', files);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const validation = validateForm(formData, validationRules);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      setIsSubmitting(false);
      return;
    }

    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert('Form submitted successfully!');
      console.log('Form data:', formData);
    } catch (error) {
      alert('Error submitting form');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Form Components Demo</h1>
            <p className="mt-2 text-gray-600">
              Demonstration of all form components with validation
            </p>
          </div>

          <Form onSubmit={handleSubmit}>
            <FormSection
              title="Personal Information"
              description="Please provide your contact details"
            >
              <FormFieldGroup>
                <Input
                  label="First Name"
                  value={formData.firstName}
                  onChange={handleInputChange('firstName')}
                  error={errors.firstName}
                  required
                />
                <Input
                  label="Last Name"
                  value={formData.lastName}
                  onChange={handleInputChange('lastName')}
                  error={errors.lastName}
                  required
                />
              </FormFieldGroup>

              <FormFieldGroup>
                <Input
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  error={errors.email}
                  helperText="We'll never share your email"
                  required
                />
                <Input
                  label="Phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange('phone')}
                  error={errors.phone}
                  helperText="Include country code if international"
                />
              </FormFieldGroup>
            </FormSection>

            <FormSection
              title="Company Information"
              description="Tell us about your business"
            >
              <Input
                label="Company Name"
                value={formData.company}
                onChange={handleInputChange('company')}
                error={errors.company}
                required
              />

              <Select
                label="Industry"
                options={industryOptions}
                value={formData.industry}
                onChange={handleInputChange('industry')}
                error={errors.industry}
                placeholder="Select your industry"
                required
              />

              <Textarea
                label="Project Description"
                value={formData.message}
                onChange={handleInputChange('message')}
                error={errors.message}
                helperText="Describe your LED display requirements (minimum 10 characters)"
                rows={4}
                required
              />
            </FormSection>

            <FormSection title="File Upload">
              <FileUpload
                label="Project Documents"
                accept=".pdf,.doc,.docx,.jpg,.png"
                maxSize={5 * 1024 * 1024} // 5MB
                onFileSelect={handleFileSelect}
                helperText="Upload project documents, images, or specifications (max 5MB)"
                multiple
              />
            </FormSection>

            <FormSection title="Preferences">
              <div className="space-y-4">
                <Checkbox
                  label="Subscribe to newsletter"
                  checked={formData.newsletter}
                  onChange={handleInputChange('newsletter')}
                />
                
                <Checkbox
                  label="I agree to the terms and conditions"
                  checked={formData.terms}
                  onChange={handleInputChange('terms')}
                  error={errors.terms}
                  required
                />
              </div>
            </FormSection>

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

        {/* Component Showcase */}
        <div className="mt-12 bg-white shadow rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Component Variants</h2>
          
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-medium mb-4">Button Variants</h3>
              <div className="flex flex-wrap gap-4">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Button Sizes</h3>
              <div className="flex items-center gap-4">
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Button States</h3>
              <div className="flex gap-4">
                <Button loading>Loading</Button>
                <Button disabled>Disabled</Button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Input States</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Normal Input" placeholder="Enter text" />
                <Input label="Input with Error" error="This field is required" />
                <Input label="Input with Helper" helperText="This is helper text" />
                <Input label="Disabled Input" disabled value="Disabled" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormDemo;