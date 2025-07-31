import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Checkbox } from '@/components/ui/Checkbox';

describe('Form Components Accessibility', () => {
  describe('Button Accessibility', () => {
    it('has proper button role', () => {
      render(<Button>Click me</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('supports disabled state', () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('has proper focus management', () => {
      render(<Button>Focusable</Button>);
      const button = screen.getByRole('button');
      button.focus();
      expect(button).toHaveFocus();
    });
  });

  describe('Input Accessibility', () => {
    it('has proper label association', () => {
      render(<Input label="Email Address" />);
      const input = screen.getByLabelText(/email address/i);
      expect(input).toBeInTheDocument();
    });

    it('shows required indicator', () => {
      render(<Input label="Required Field" required />);
      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('has proper error announcement', () => {
      render(<Input label="Email" error="Invalid email format" />);
      const errorMessage = screen.getByText(/invalid email format/i);
      expect(errorMessage).toHaveAttribute('role', 'alert');
    });

    it('supports different input types', () => {
      const { rerender } = render(<Input type="email" />);
      expect(screen.getByDisplayValue('')).toHaveAttribute('type', 'email');

      rerender(<Input type="password" />);
      expect(screen.getByDisplayValue('')).toHaveAttribute('type', 'password');
    });
  });

  describe('Textarea Accessibility', () => {
    it('has proper label association', () => {
      render(<Textarea label="Message" />);
      const textarea = screen.getByLabelText(/message/i);
      expect(textarea).toBeInTheDocument();
    });

    it('has proper error announcement', () => {
      render(<Textarea label="Message" error="Message is required" />);
      const errorMessage = screen.getByText(/message is required/i);
      expect(errorMessage).toHaveAttribute('role', 'alert');
    });
  });

  describe('Checkbox Accessibility', () => {
    it('has proper label association', () => {
      render(<Checkbox label="Accept terms" />);
      const checkbox = screen.getByLabelText(/accept terms/i);
      expect(checkbox).toBeInTheDocument();
      expect(checkbox).toHaveAttribute('type', 'checkbox');
    });

    it('has proper error announcement', () => {
      render(<Checkbox label="Terms" error="You must accept terms" />);
      const errorMessage = screen.getByText(/you must accept terms/i);
      expect(errorMessage).toHaveAttribute('role', 'alert');
    });
  });

  describe('Form Structure', () => {
    it('maintains proper heading hierarchy', () => {
      render(
        <div>
          <h1>Main Form</h1>
          <form>
            <fieldset>
              <legend>Personal Information</legend>
              <Input label="Name" />
              <Input label="Email" />
            </fieldset>
          </form>
        </div>
      );

      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
      expect(screen.getByRole('group', { name: /personal information/i })).toBeInTheDocument();
    });

    it('supports keyboard navigation', () => {
      render(
        <form>
          <Input label="First Name" />
          <Input label="Last Name" />
          <Button type="submit">Submit</Button>
        </form>
      );

      const firstInput = screen.getByLabelText(/first name/i);
      const lastInput = screen.getByLabelText(/last name/i);
      const submitButton = screen.getByRole('button', { name: /submit/i });

      // All elements should be focusable
      expect(firstInput).not.toHaveAttribute('tabindex', '-1');
      expect(lastInput).not.toHaveAttribute('tabindex', '-1');
      expect(submitButton).not.toHaveAttribute('tabindex', '-1');
    });
  });

  describe('Color Contrast and Visual Indicators', () => {
    it('provides non-color error indicators', () => {
      render(<Input label="Email" error="Invalid format" />);
      
      // Error should be announced via text, not just color
      expect(screen.getByText(/invalid format/i)).toBeInTheDocument();
      
      // Required fields should have text indicator
      render(<Input label="Required Field" required />);
      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('maintains focus visibility', () => {
      render(<Button>Focus Test</Button>);
      const button = screen.getByRole('button');
      
      // Button should have focus-visible styles
      expect(button).toHaveClass('focus-visible:outline-none');
      expect(button).toHaveClass('focus-visible:ring-2');
    });
  });

  describe('Screen Reader Support', () => {
    it('provides proper form field descriptions', () => {
      render(
        <Input 
          label="Password" 
          helperText="Must be at least 8 characters"
          type="password"
        />
      );

      expect(screen.getByText(/must be at least 8 characters/i)).toBeInTheDocument();
    });

    it('announces form validation errors', () => {
      render(
        <div>
          <Input label="Email" error="Please enter a valid email address" />
          <Checkbox label="Terms" error="You must accept the terms" />
        </div>
      );

      const emailError = screen.getByText(/please enter a valid email address/i);
      const termsError = screen.getByText(/you must accept the terms/i);

      expect(emailError).toHaveAttribute('role', 'alert');
      expect(termsError).toHaveAttribute('role', 'alert');
    });
  });
});