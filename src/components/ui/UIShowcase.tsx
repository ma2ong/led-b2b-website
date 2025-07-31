import React, { useState } from 'react';
import { 
  MagnifyingGlassIcon, 
  EnvelopeIcon, 
  PhoneIcon,
  HeartIcon,
  ShareIcon,
  PlusIcon,
  MinusIcon,
} from '@heroicons/react/24/outline';
import Button from './Button';
import IconButton from './IconButton';
import Input from './Input';
import Textarea from './Textarea';
import Select from './Select';
import Checkbox from './Checkbox';
import Radio, { RadioGroup } from './Radio';
import FileUpload from './FileUpload';
import ButtonGroup from './ButtonGroup';
import LoadingSpinner from './LoadingSpinner';
import Form, { FormField } from './Form';
import { required, email, minLength, combine } from '@/lib/validation';

const UIShowcase: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [textareaValue, setTextareaValue] = useState('');
  const [selectValue, setSelectValue] = useState('');
  const [checkboxValue, setCheckboxValue] = useState(false);
  const [radioValue, setRadioValue] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const selectOptions = [
    { value: 'fine-pitch', label: 'Fine Pitch LED Display' },
    { value: 'outdoor', label: 'Outdoor LED Display' },
    { value: 'indoor', label: 'Indoor LED Display' },
    { value: 'rental', label: 'Rental LED Display' },
    { value: 'creative', label: 'Creative LED Display', group: 'Special' },
    { value: 'transparent', label: 'Transparent LED Display', group: 'Special' },
  ];

  const radioOptions = [
    { value: 'urgent', label: 'Urgent (1-2 days)', description: 'For immediate project needs' },
    { value: 'normal', label: 'Normal (3-5 days)', description: 'Standard processing time' },
    { value: 'flexible', label: 'Flexible (1-2 weeks)', description: 'No rush, best price' },
  ];

  const handleLoadingDemo = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            UI Components Showcase
          </h1>
          <p className="text-xl text-gray-600">
            Complete set of reusable UI components for LED display B2B website
          </p>
        </div>

        {/* 按钮组件 */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-gray-900 mb-8">Buttons</h2>
          
          {/* 按钮变体 */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Button Variants</h3>
            <div className="flex flex-wrap gap-4">
              <Button variant="primary">Primary Button</Button>
              <Button variant="secondary">Secondary Button</Button>
              <Button variant="accent">Accent Button</Button>
              <Button variant="success">Success Button</Button>
              <Button variant="warning">Warning Button</Button>
              <Button variant="error">Error Button</Button>
              <Button variant="ghost">Ghost Button</Button>
              <Button variant="outline">Outline Button</Button>
            </div>
          </div>

          {/* 按钮尺寸 */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Button Sizes</h3>
            <div className="flex flex-wrap items-center gap-4">
              <Button size="xs">Extra Small</Button>
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
              <Button size="xl">Extra Large</Button>
            </div>
          </div>

          {/* 按钮状态 */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Button States</h3>
            <div className="flex flex-wrap gap-4">
              <Button>Normal</Button>
              <Button loading={loading} onClick={handleLoadingDemo}>
                {loading ? 'Loading...' : 'Click to Load'}
              </Button>
              <Button disabled>Disabled</Button>
              <Button leftIcon={<EnvelopeIcon className="w-4 h-4" />}>With Left Icon</Button>
              <Button rightIcon={<ShareIcon className="w-4 h-4" />}>With Right Icon</Button>
            </div>
          </div>

          {/* 图标按钮 */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Icon Buttons</h3>
            <div className="flex flex-wrap items-center gap-4">
              <IconButton icon={<HeartIcon />} size="xs" />
              <IconButton icon={<ShareIcon />} size="sm" />
              <IconButton icon={<PlusIcon />} size="md" variant="primary" />
              <IconButton icon={<MinusIcon />} size="lg" variant="secondary" />
              <IconButton icon={<MagnifyingGlassIcon />} size="xl" rounded={false} />
            </div>
          </div>

          {/* 按钮组 */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Button Groups</h3>
            <div className="space-y-4">
              <ButtonGroup>
                <Button>Left</Button>
                <Button>Center</Button>
                <Button>Right</Button>
              </ButtonGroup>
              
              <ButtonGroup orientation="vertical">
                <Button>Top</Button>
                <Button>Middle</Button>
                <Button>Bottom</Button>
              </ButtonGroup>
              
              <ButtonGroup variant="primary" fullWidth>
                <Button>Option 1</Button>
                <Button>Option 2</Button>
                <Button>Option 3</Button>
              </ButtonGroup>
            </div>
          </div>
        </section>

        {/* 表单组件 */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-gray-900 mb-8">Form Components</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 左列 */}
            <div className="space-y-6">
              {/* 输入框 */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Input Fields</h3>
                <div className="space-y-4">
                  <Input
                    label="Company Name"
                    placeholder="Enter your company name"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    required
                  />
                  
                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="your@email.com"
                    leftIcon={<EnvelopeIcon />}
                    helperText="We'll never share your email"
                  />
                  
                  <Input
                    label="Phone Number"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    leftIcon={<PhoneIcon />}
                    rightIcon={<MagnifyingGlassIcon />}
                  />
                  
                  <Input
                    label="Error Example"
                    placeholder="This field has an error"
                    error="This field is required"
                  />
                </div>
              </div>

              {/* 文本域 */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Textarea</h3>
                <Textarea
                  label="Project Description"
                  placeholder="Describe your LED display project requirements..."
                  value={textareaValue}
                  onChange={(e) => setTextareaValue(e.target.value)}
                  rows={4}
                  helperText="Please provide as much detail as possible"
                />
              </div>

              {/* 选择框 */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Select Dropdown</h3>
                <Select
                  label="Product Type"
                  placeholder="Choose a product type"
                  options={selectOptions}
                  value={selectValue}
                  onChange={(e) => setSelectValue(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* 右列 */}
            <div className="space-y-6">
              {/* 复选框 */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Checkboxes</h3>
                <div className="space-y-3">
                  <Checkbox
                    label="I agree to the terms and conditions"
                    checked={checkboxValue}
                    onChange={(e) => setCheckboxValue(e.target.checked)}
                  />
                  
                  <Checkbox
                    label="Subscribe to newsletter"
                    helperText="Get updates about new products and offers"
                  />
                  
                  <Checkbox
                    label="Checkbox with error"
                    error="Please check this box to continue"
                  />
                </div>
              </div>

              {/* 单选框 */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Radio Buttons</h3>
                <RadioGroup
                  name="timeline"
                  label="Project Timeline"
                  options={radioOptions}
                  value={radioValue}
                  onChange={setRadioValue}
                  helperText="Select your preferred timeline for the project"
                />
              </div>

              {/* 文件上传 */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">File Upload</h3>
                <FileUpload
                  label="Project Files"
                  accept=".pdf,.doc,.docx,.jpg,.png"
                  maxSize={5 * 1024 * 1024} // 5MB
                  maxFiles={3}
                  onFilesChange={setFiles}
                  preview
                  helperText="Upload project specifications, drawings, or reference images"
                />
              </div>
            </div>
          </div>
        </section>

        {/* 加载指示器 */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-gray-900 mb-8">Loading Spinners</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <LoadingSpinner size="xs" />
              <p className="text-sm text-gray-500 mt-2">Extra Small</p>
            </div>
            <div className="text-center">
              <LoadingSpinner size="sm" />
              <p className="text-sm text-gray-500 mt-2">Small</p>
            </div>
            <div className="text-center">
              <LoadingSpinner size="md" />
              <p className="text-sm text-gray-500 mt-2">Medium</p>
            </div>
            <div className="text-center">
              <LoadingSpinner size="lg" />
              <p className="text-sm text-gray-500 mt-2">Large</p>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <LoadingSpinner color="primary" />
              <p className="text-sm text-gray-500 mt-2">Primary</p>
            </div>
            <div className="text-center">
              <LoadingSpinner color="secondary" />
              <p className="text-sm text-gray-500 mt-2">Secondary</p>
            </div>
            <div className="text-center bg-gray-800 p-4 rounded">
              <LoadingSpinner color="white" />
              <p className="text-sm text-gray-300 mt-2">White</p>
            </div>
            <div className="text-center">
              <LoadingSpinner color="gray" />
              <p className="text-sm text-gray-500 mt-2">Gray</p>
            </div>
          </div>
        </section>

        {/* 完整表单示例 */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-gray-900 mb-8">Complete Form Example</h2>
          
          <div className="card p-8 max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">LED Display Inquiry Form</h3>
            
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Full Name"
                  placeholder="John Doe"
                  required
                />
                <Input
                  label="Company"
                  placeholder="Your Company Ltd."
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Email"
                  type="email"
                  placeholder="john@company.com"
                  leftIcon={<EnvelopeIcon />}
                  required
                />
                <Input
                  label="Phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  leftIcon={<PhoneIcon />}
                />
              </div>

              <Select
                label="Product Interest"
                placeholder="Select product type"
                options={selectOptions}
                required
              />

              <Textarea
                label="Project Requirements"
                placeholder="Please describe your LED display project requirements, including size, location, budget, and timeline..."
                rows={4}
                required
              />

              <RadioGroup
                name="budget"
                label="Budget Range"
                options={[
                  { value: 'under-10k', label: 'Under $10,000' },
                  { value: '10k-50k', label: '$10,000 - $50,000' },
                  { value: '50k-100k', label: '$50,000 - $100,000' },
                  { value: 'over-100k', label: 'Over $100,000' },
                ]}
                direction="horizontal"
              />

              <FileUpload
                label="Project Files (Optional)"
                accept=".pdf,.doc,.docx,.jpg,.png,.dwg"
                maxFiles={5}
                maxSize={10 * 1024 * 1024}
                preview
              />

              <div className="space-y-3">
                <Checkbox
                  label="I agree to the terms and conditions"
                  required
                />
                <Checkbox
                  label="I would like to receive updates about new products and offers"
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit" className="flex-1">
                  Submit Inquiry
                </Button>
                <Button type="button" variant="secondary">
                  Save Draft
                </Button>
              </div>
            </form>
          </div>
        </section>

        {/* 表单验证示例 */}
        <section className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Form Validation</h2>
          
          <Form
            initialValues={{
              name: '',
              email: '',
              message: '',
              terms: false,
            }}
            validationSchema={{
              name: combine(required('Name is required'), minLength(2, 'Name must be at least 2 characters')),
              email: combine(required('Email is required'), email('Please enter a valid email')),
              message: required('Message is required'),
              terms: (value) => !value ? 'You must accept the terms' : undefined,
            }}
            onSubmit={async (values) => {
              console.log('Form submitted:', values);
              // 模拟API调用
              await new Promise(resolve => setTimeout(resolve, 1000));
              alert('Form submitted successfully!');
            }}
          >
            <FormField name="name">
              {({ value, error, onChange, onBlur }) => (
                <Input
                  label="Full Name"
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  onBlur={onBlur}
                  error={error}
                  required
                />
              )}
            </FormField>

            <FormField name="email">
              {({ value, error, onChange, onBlur }) => (
                <Input
                  type="email"
                  label="Email Address"
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  onBlur={onBlur}
                  error={error}
                  required
                />
              )}
            </FormField>

            <FormField name="message">
              {({ value, error, onChange, onBlur }) => (
                <Textarea
                  label="Message"
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  onBlur={onBlur}
                  error={error}
                  rows={4}
                  required
                />
              )}
            </FormField>

            <FormField name="terms">
              {({ value, error, onChange }) => (
                <Checkbox
                  label="I accept the terms and conditions"
                  checked={value}
                  onChange={(e) => onChange(e.target.checked)}
                  error={error}
                />
              )}
            </FormField>

            <div className="flex gap-4">
              <Button type="submit" variant="primary">
                Submit Form
              </Button>
              <Button type="button" variant="secondary">
                Reset
              </Button>
            </div>
          </Form>
        </section>
      </div>
    </div>
  );
};

export default UIShowcase;