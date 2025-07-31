import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Checkbox } from '@/components/ui/Checkbox';
import { Form, FormSection, FormFieldGroup, FormActions } from '@/components/ui/FormComponents';

describe('Button Component', () => {
  it('renders with default props', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('bg-primary');
  });

  it('renders different variants', () => {
    const { rerender } = render(<Button variant="secondary">Secondary</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-secondary');

    rerender(<Button variant="outline">Outline</Button>);
    expect(screen.getByRole('button')).toHaveClass('border');

    rerender(<Button variant="ghost">Ghost</Button>);
    expect(screen.getByRole('button')).toHaveClass('hover:bg-accent');
  });

  it('renders different sizes', () => {
    const { rerender } = render(<Button size="sm">Small</Button>);
    expect(screen.getByRole('button')).toHaveClass('h-9');

    rerender(<Button size="lg">Large</Button>);
    expect(screen.getByRole('button')).toHaveClass('h-11');
  });

  it('shows loading state', () => {
    render(<Button loading>Loading</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(screen.getByRole('button')).toContainHTML('animate-spin');
  });

  it('handles click events', async () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});

describe('Input Component', () => {
  it('renders with label', () => {
    render(<Input label="Email" />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });

  it('shows required indicator', () => {
    render(<Input label="Email" required />);
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('displays error message', () => {
    render(<Input label="Email" error="Invalid email" />);
    expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveClass('border-red-500');
  });

  it('displays helper text', () => {
    render(<Input label="Email" helperText="Enter your email address" />);
    expect(screen.getByText(/enter your email address/i)).toBeInTheDocument();
  });

  it('handles input changes', async () => {
    const handleChange = jest.fn();
    render(<Input onChange={handleChange} />);
    
    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'test@example.com');
    
    expect(handleChange).toHaveBeenCalled();
    expect(input).toHaveValue('test@example.com');
  });

  it('supports different input types', () => {
    const { rerender } = render(<Input type="password" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'password');

    rerender(<Input type="email" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email');
  });
});

describe('Textarea Component', () => {
  it('renders with label', () => {
    render(<Textarea label="Message" />);
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
  });

  it('shows required indicator', () => {
    render(<Textarea label="Message" required />);
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('displays error message', () => {
    render(<Textarea label="Message" error="Message is required" />);
    expect(screen.getByText(/message is required/i)).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveClass('border-red-500');
  });

  it('handles input changes', async () => {
    const handleChange = jest.fn();
    render(<Textarea onChange={handleChange} />);
    
    const textarea = screen.getByRole('textbox');
    await userEvent.type(textarea, 'Hello world');
    
    expect(handleChange).toHaveBeenCalled();
    expect(textarea).toHaveValue('Hello world');
  });
});

describe('Checkbox Component', () => {
  it('renders with label', () => {
    render(<Checkbox label="Accept terms" />);
    expect(screen.getByLabelText(/accept terms/i)).toBeInTheDocument();
  });

  it('shows required indicator', () => {
    render(<Checkbox label="Accept terms" required />);
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('displays error message', () => {
    render(<Checkbox label="Accept terms" error="You must accept terms" />);
    expect(screen.getByText(/you must accept terms/i)).toBeInTheDocument();
  });

  it('handles check/uncheck', async () => {
    const handleChange = jest.fn();
    render(<Checkbox label="Accept terms" onChange={handleChange} />);
    
    const checkbox = screen.getByRole('checkbox');
    await userEvent.click(checkbox);
    
    expect(handleChange).toHaveBeenCalled();
    expect(checkbox).toBeChecked();
  });
});

describe('Form Components', () => {
  it('renders Form component', () => {
    render(
      <Form>
        <Input label="Name" />
        <Button type="submit">Submit</Button>
      </Form>
    );
    
    expect(screen.getByRole('form')).toBeInTheDocument();
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });

  it('renders FormSection with title and description', () => {
    render(
      <FormSection title="Personal Information" description="Enter your details">
        <Input label="Name" />
      </FormSection>
    );
    
    expect(screen.getByText(/personal information/i)).toBeInTheDocument();
    expect(screen.getByText(/enter your details/i)).toBeInTheDocument();
  });

  it('renders FormFieldGroup with grid layout', () => {
    render(
      <FormFieldGroup>
        <Input label="First Name" />
        <Input label="Last Name" />
      </FormFieldGroup>
    );
    
    const group = screen.getByLabelText(/first name/i).closest('.grid');
    expect(group).toHaveClass('grid-cols-1', 'sm:grid-cols-2');
  });

  it('renders FormActions with different alignments', () => {
    const { rerender } = render(
      <FormActions align="left">
        <Button>Cancel</Button>
        <Button>Submit</Button>
      </FormActions>
    );
    
    let actions = screen.getByRole('button', { name: /cancel/i }).parentElement;
    expect(actions).toHaveClass('justify-start');

    rerender(
      <FormActions align="center">
        <Button>Cancel</Button>
        <Button>Submit</Button>
      </FormActions>
    );
    
    actions = screen.getByRole('button', { name: /cancel/i }).parentElement;
    expect(actions).toHaveClass('justify-center');

    rerender(
      <FormActions align="right">
        <Button>Cancel</Button>
        <Button>Submit</Button>
      </FormActions>
    );
    
    actions = screen.getByRole('button', { name: /cancel/i }).parentElement;
    expect(actions).toHaveClass('justify-end');
  });
});

describe('Form Integration', () => {
  it('handles form submission', async () => {
    const handleSubmit = jest.fn((e) => e.preventDefault());
    
    render(
      <Form onSubmit={handleSubmit}>
        <Input label="Email" type="email" required />
        <Textarea label="Message" required />
        <Checkbox label="Accept terms" required />
        <FormActions>
          <Button type="submit">Submit</Button>
        </FormActions>
      </Form>
    );
    
    // Fill out the form
    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/message/i), 'Hello world');
    await userEvent.click(screen.getByLabelText(/accept terms/i));
    
    // Submit the form
    await userEvent.click(screen.getByRole('button', { name: /submit/i }));
    
    expect(handleSubmit).toHaveBeenCalledTimes(1);
  });
});

describe('Accessibility', () => {
  it('has proper ARIA attributes', () => {
    render(
      <Form>
        <Input label="Email" error="Invalid email" required />
        <Checkbox label="Accept terms" error="Required" />
      </Form>
    );
    
    const emailInput = screen.getByLabelText(/email/i);
    expect(emailInput).toHaveAttribute('aria-required', 'true');
    
    const errorMessage = screen.getByText(/invalid email/i);
    expect(errorMessage).toHaveAttribute('role', 'alert');
  });

  it('supports keyboard navigation', async () => {
    render(
      <Form>
        <Input label="First Name" />
        <Input label="Last Name" />
        <Button type="submit">Submit</Button>
      </Form>
    );
    
    const firstInput = screen.getByLabelText(/first name/i);
    const lastInput = screen.getByLabelText(/last name/i);
    const submitButton = screen.getByRole('button', { name: /submit/i });
    
    // Tab through form elements
    firstInput.focus();
    expect(firstInput).toHaveFocus();
    
    await userEvent.tab();
    expect(lastInput).toHaveFocus();
    
    await userEvent.tab();
    expect(submitButton).toHaveFocus();
  });
});