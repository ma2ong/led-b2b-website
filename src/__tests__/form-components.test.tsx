/**
 * 表单组件测试
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { 
  validationRules, 
  combineValidators, 
  conditionalValidator,
  commonValidations,
  validateForm,
  validateField 
} from '@/lib/form-validation';
import { useForm } from '@/hooks/useForm';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import Checkbox from '@/components/ui/Checkbox';
import Radio, { RadioGroup } from '@/components/ui/Radio';
import FileUpload from '@/components/ui/FileUpload';
import MultiStepForm, { Step, StepNavigation } from '@/components/ui/MultiStepForm';

describe('Validation Rules', () => {
  describe('required', () => {
    const requiredValidator = validationRules.required();

    test('should return error for empty string', () => {
      expect(requiredValidator('')).toBe('This field is required');
    });

    test('should return error for null', () => {
      expect(requiredValidator(null)).toBe('This field is required');
    });

    test('should return undefined for valid string', () => {
      expect(requiredValidator('test')).toBeUndefined();
    });
  });

  describe('email', () => {
    const emailValidator = validationRules.email();

    test('should return error for invalid email', () => {
      expect(emailValidator('invalid-email')).toBe('Please enter a valid email address');
    });

    test('should return undefined for valid email', () => {
      expect(emailValidator('test@example.com')).toBeUndefined();
    });
  });

  describe('combineValidators', () => {
    const combinedValidator = combineValidators(
      validationRules.required(),
      validationRules.minLength(3),
      validationRules.email()
    );

    test('should return first error encountered', () => {
      expect(combinedValidator('')).toBe('This field is required');
      expect(combinedValidator('ab')).toBe('Must be at least 3 characters');
      expect(combinedValidator('abc')).toBe('Please enter a valid email address');
    });

    test('should return undefined when all validators pass', () => {
      expect(combinedValidator('test@example.com')).toBeUndefined();
    });
  });
});

describe('Button Component', () => {
  test('should render button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  test('should handle click events', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    
    render(<Button onClick={handleClick}>Click me</Button>);
    
    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('should be disabled when loading', () => {
    render(<Button loading>Loading</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  test('should show loading spinner when loading', () => {
    render(<Button loading>Loading</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  test('should render different variants', () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>);
    expect(screen.getByRole('button')).toHaveClass('btn-primary');
    
    rerender(<Button variant="secondary">Secondary</Button>);
    expect(screen.getByRole('button')).toHaveClass('btn-secondary');
  });

  test('should render as link when href is provided', () => {
    render(<Button href="/test">Link Button</Button>);
    expect(screen.getByRole('link')).toHaveAttribute('href', '/test');
  });
});

describe('Input Component', () => {
  test('should render input field', () => {
    render(<Input label="Name" />);
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
  });

  test('should show error message', () => {
    render(<Input label="Email" error="Invalid email" />);
    expect(screen.getByText('Invalid email')).toBeInTheDocument();
  });

  test('should show helper text', () => {
    render(<Input label="Password" helperText="Must be at least 8 characters" />);
    expect(screen.getByText('Must be at least 8 characters')).toBeInTheDocument();
  });

  test('should handle input changes', async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();
    
    render(<Input label="Name" onChange={handleChange} />);
    
    const input = screen.getByLabelText('Name');
    await user.type(input, 'John');
    
    expect(handleChange).toHaveBeenCalled();
  });

  test('should show required indicator', () => {
    render(<Input label="Name" required />);
    expect(screen.getByText('*')).toBeInTheDocument();
  });
});

describe('Textarea Component', () => {
  test('should render textarea field', () => {
    render(<Textarea label="Message" />);
    expect(screen.getByLabelText('Message')).toBeInTheDocument();
  });

  test('should handle textarea changes', async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();
    
    render(<Textarea label="Message" onChange={handleChange} />);
    
    const textarea = screen.getByLabelText('Message');
    await user.type(textarea, 'Hello world');
    
    expect(handleChange).toHaveBeenCalled();
  });
});

describe('Select Component', () => {
  const options = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ];

  test('should render select field', () => {
    render(<Select label="Choose option" options={options} />);
    expect(screen.getByLabelText('Choose option')).toBeInTheDocument();
  });

  test('should render options', () => {
    render(<Select label="Choose option" options={options} />);
    
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
    expect(screen.getByText('Option 3')).toBeInTheDocument();
  });

  test('should handle selection changes', async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();
    
    render(<Select label="Choose option" options={options} onChange={handleChange} />);
    
    const select = screen.getByLabelText('Choose option');
    await user.selectOptions(select, 'option2');
    
    expect(handleChange).toHaveBeenCalled();
  });

  test('should show placeholder', () => {
    render(<Select label="Choose option" options={options} placeholder="Select an option" />);
    expect(screen.getByText('Select an option')).toBeInTheDocument();
  });
});

describe('Checkbox Component', () => {
  test('should render checkbox', () => {
    render(<Checkbox label="Accept terms" />);
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
    expect(screen.getByText('Accept terms')).toBeInTheDocument();
  });

  test('should handle checkbox changes', async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();
    
    render(<Checkbox label="Accept terms" onChange={handleChange} />);
    
    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);
    
    expect(handleChange).toHaveBeenCalled();
  });

  test('should support indeterminate state', () => {
    render(<Checkbox label="Partial selection" indeterminate />);
    const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
    expect(checkbox.indeterminate).toBe(true);
  });
});

describe('RadioGroup Component', () => {
  const options = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ];

  test('should render radio group', () => {
    render(<RadioGroup name="test" options={options} label="Choose one" />);
    
    expect(screen.getByText('Choose one')).toBeInTheDocument();
    expect(screen.getAllByRole('radio')).toHaveLength(3);
  });

  test('should handle radio selection', async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();
    
    render(<RadioGroup name="test" options={options} onChange={handleChange} />);
    
    const radio = screen.getByLabelText('Option 2');
    await user.click(radio);
    
    expect(handleChange).toHaveBeenCalledWith('option2');
  });

  test('should show selected value', () => {
    render(<RadioGroup name="test" options={options} value="option2" />);
    
    const radio = screen.getByLabelText('Option 2') as HTMLInputElement;
    expect(radio.checked).toBe(true);
  });
});

describe('FileUpload Component', () => {
  test('should render file upload area', () => {
    render(<FileUpload label="Upload files" />);
    expect(screen.getByText('Upload files')).toBeInTheDocument();
    expect(screen.getByText(/click to upload/i)).toBeInTheDocument();
  });

  test('should handle file selection', async () => {
    const user = userEvent.setup();
    const handleFilesChange = jest.fn();
    
    render(<FileUpload label="Upload files" onFilesChange={handleFilesChange} />);
    
    const file = new File(['hello'], 'hello.txt', { type: 'text/plain' });
    const input = screen.getByRole('textbox', { hidden: true }) as HTMLInputElement;
    
    await user.upload(input, file);
    
    expect(handleFilesChange).toHaveBeenCalledWith([file]);
  });

  test('should show file size limit', () => {
    render(<FileUpload label="Upload files" maxSize={5 * 1024 * 1024} />);
    expect(screen.getByText(/max size: 5mb/i)).toBeInTheDocument();
  });

  test('should show accepted file types', () => {
    render(<FileUpload label="Upload files" accept="image/*" />);
    expect(screen.getByText(/accepted formats: image\/\*/i)).toBeInTheDocument();
  });
});

describe('MultiStepForm Component', () => {
  const steps = [
    { id: '0', title: 'Step 1', description: 'First step' },
    { id: '1', title: 'Step 2', description: 'Second step' },
    { id: '2', title: 'Step 3', description: 'Third step' },
  ];

  const TestMultiStepForm = () => (
    <MultiStepForm steps={steps}>
      <Step stepId="0">
        <div>Step 1 Content</div>
        <StepNavigation />
      </Step>
      <Step stepId="1">
        <div>Step 2 Content</div>
        <StepNavigation />
      </Step>
      <Step stepId="2">
        <div>Step 3 Content</div>
        <StepNavigation />
      </Step>
    </MultiStepForm>
  );

  test('should render step indicators', () => {
    render(<TestMultiStepForm />);
    
    expect(screen.getByText('Step 1')).toBeInTheDocument();
    expect(screen.getByText('Step 2')).toBeInTheDocument();
    expect(screen.getByText('Step 3')).toBeInTheDocument();
  });

  test('should show current step content', () => {
    render(<TestMultiStepForm />);
    expect(screen.getByText('Step 1 Content')).toBeInTheDocument();
    expect(screen.queryByText('Step 2 Content')).not.toBeInTheDocument();
  });

  test('should navigate between steps', async () => {
    const user = userEvent.setup();
    render(<TestMultiStepForm />);
    
    // Should start at step 1
    expect(screen.getByText('Step 1 Content')).toBeInTheDocument();
    
    // Click next to go to step 2
    const nextButton = screen.getByRole('button', { name: /next/i });
    await user.click(nextButton);
    
    expect(screen.getByText('Step 2 Content')).toBeInTheDocument();
    expect(screen.queryByText('Step 1 Content')).not.toBeInTheDocument();
  });

  test('should show progress bar', () => {
    render(<TestMultiStepForm />);
    const progressBar = screen.getByRole('progressbar', { hidden: true });
    expect(progressBar).toBeInTheDocument();
  });

  test('should disable previous button on first step', () => {
    render(<TestMultiStepForm />);
    expect(screen.queryByRole('button', { name: /previous/i })).not.toBeInTheDocument();
  });

  test('should show complete button on last step', async () => {
    const user = userEvent.setup();
    render(<TestMultiStepForm />);
    
    // Navigate to last step
    const nextButton = screen.getByRole('button', { name: /next/i });
    await user.click(nextButton);
    await user.click(nextButton);
    
    expect(screen.getByRole('button', { name: /complete/i })).toBeInTheDocument();
  });
});

// Mock component for testing useForm hook
const TestFormComponent: React.FC<{ onSubmit: (values: any) => void }> = ({ onSubmit }) => {
  const form = useForm({
    initialValues: { name: '', email: '' },
    validationSchema: {
      name: validationRules.required(),
      email: combineValidators(validationRules.required(), validationRules.email()),
    },
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Input
        label="Name"
        value={form.values.name}
        onChange={(e) => form.setValue('name', e.target.value)}
        onBlur={() => form.setTouched('name', true)}
        error={form.touched.name ? form.errors.name : undefined}
      />
      
      <Input
        label="Email"
        type="email"
        value={form.values.email}
        onChange={(e) => form.setValue('email', e.target.value)}
        onBlur={() => form.setTouched('email', true)}
        error={form.touched.email ? form.errors.email : undefined}
      />
      
      <Button type="submit" loading={form.isSubmitting}>
        {form.isSubmitting ? 'Submitting...' : 'Submit'}
      </Button>
    </form>
  );
};

describe('useForm Hook Integration', () => {
  test('should handle form state and validation', async () => {
    const user = userEvent.setup();
    const mockSubmit = jest.fn();
    
    render(<TestFormComponent onSubmit={mockSubmit} />);
    
    const nameInput = screen.getByLabelText('Name');
    const emailInput = screen.getByLabelText('Email');
    const submitButton = screen.getByRole('button', { name: /submit/i });
    
    // Submit empty form
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('This field is required')).toBeInTheDocument();
    });
    
    // Fill form with valid data
    await user.type(nameInput, 'John Doe');
    await user.type(emailInput, 'john@example.com');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
      });
    });
  });

  test('should validate email format', async () => {
    const user = userEvent.setup();
    const mockSubmit = jest.fn();
    
    render(<TestFormComponent onSubmit={mockSubmit} />);
    
    const emailInput = screen.getByLabelText('Email');
    
    await user.type(emailInput, 'invalid-email');
    await user.tab(); // Trigger blur
    
    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
    });
  });
});