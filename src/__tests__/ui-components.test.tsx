import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HeartIcon, ShareIcon } from '@heroicons/react/24/outline';
import Button from '@/components/ui/Button';
import IconButton from '@/components/ui/IconButton';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import Checkbox from '@/components/ui/Checkbox';
import Radio, { RadioGroup } from '@/components/ui/Radio';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ButtonGroup from '@/components/ui/ButtonGroup';

describe('UI Components', () => {
  describe('Button', () => {
    it('renders button with text', () => {
      render(<Button>Click me</Button>);
      expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
    });

    it('applies variant classes correctly', () => {
      render(<Button variant="primary">Primary</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('btn-primary');
    });

    it('applies size classes correctly', () => {
      render(<Button size="lg">Large</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('btn-lg');
    });

    it('shows loading state', () => {
      render(<Button loading>Loading</Button>);
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('is disabled when disabled prop is true', () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('renders with left and right icons', () => {
      render(
        <Button 
          leftIcon={<HeartIcon data-testid="left-icon" />}
          rightIcon={<ShareIcon data-testid="right-icon" />}
        >
          With Icons
        </Button>
      );
      
      expect(screen.getByTestId('left-icon')).toBeInTheDocument();
      expect(screen.getByTestId('right-icon')).toBeInTheDocument();
    });

    it('calls onClick handler when clicked', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Click me</Button>);
      
      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('IconButton', () => {
    it('renders icon button', () => {
      render(<IconButton icon={<HeartIcon data-testid="heart-icon" />} />);
      expect(screen.getByTestId('heart-icon')).toBeInTheDocument();
    });

    it('applies size classes correctly', () => {
      render(<IconButton icon={<HeartIcon />} size="lg" />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('w-12', 'h-12');
    });

    it('shows loading state', () => {
      render(<IconButton icon={<HeartIcon />} loading />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });
  });

  describe('Input', () => {
    it('renders input with label', () => {
      render(<Input label="Name" />);
      expect(screen.getByLabelText('Name')).toBeInTheDocument();
    });

    it('shows required indicator', () => {
      render(<Input label="Name" required />);
      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('shows error message', () => {
      render(<Input label="Name" error="This field is required" />);
      expect(screen.getByText('This field is required')).toBeInTheDocument();
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('shows helper text', () => {
      render(<Input label="Name" helperText="Enter your full name" />);
      expect(screen.getByText('Enter your full name')).toBeInTheDocument();
    });

    it('handles value changes', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();
      
      render(<Input onChange={handleChange} />);
      const input = screen.getByRole('textbox');
      
      await user.type(input, 'test');
      expect(handleChange).toHaveBeenCalled();
    });
  });

  describe('Textarea', () => {
    it('renders textarea with label', () => {
      render(<Textarea label="Description" />);
      expect(screen.getByLabelText('Description')).toBeInTheDocument();
    });

    it('applies resize classes correctly', () => {
      render(<Textarea resize="none" />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveClass('resize-none');
    });

    it('shows error message', () => {
      render(<Textarea error="This field is required" />);
      expect(screen.getByText('This field is required')).toBeInTheDocument();
    });
  });

  describe('Select', () => {
    const options = [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
      { value: 'option3', label: 'Option 3', group: 'Group A' },
    ];

    it('renders select with options', () => {
      render(<Select options={options} />);
      const select = screen.getByRole('combobox');
      expect(select).toBeInTheDocument();
      
      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.getByText('Option 2')).toBeInTheDocument();
      expect(screen.getByText('Option 3')).toBeInTheDocument();
    });

    it('renders placeholder', () => {
      render(<Select options={options} placeholder="Choose an option" />);
      expect(screen.getByText('Choose an option')).toBeInTheDocument();
    });

    it('groups options correctly', () => {
      render(<Select options={options} />);
      expect(screen.getByText('Group A')).toBeInTheDocument();
    });
  });

  describe('Checkbox', () => {
    it('renders checkbox with label', () => {
      render(<Checkbox label="Accept terms" />);
      expect(screen.getByLabelText('Accept terms')).toBeInTheDocument();
    });

    it('handles checked state', () => {
      const handleChange = jest.fn();
      render(<Checkbox label="Accept terms" onChange={handleChange} />);
      
      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);
      
      expect(handleChange).toHaveBeenCalled();
    });

    it('shows error message', () => {
      render(<Checkbox label="Accept terms" error="This field is required" />);
      expect(screen.getByText('This field is required')).toBeInTheDocument();
    });
  });

  describe('RadioGroup', () => {
    const options = [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2', description: 'Description for option 2' },
    ];

    it('renders radio group with options', () => {
      render(<RadioGroup name="test" options={options} />);
      
      expect(screen.getByLabelText('Option 1')).toBeInTheDocument();
      expect(screen.getByLabelText('Option 2')).toBeInTheDocument();
      expect(screen.getByText('Description for option 2')).toBeInTheDocument();
    });

    it('handles value changes', () => {
      const handleChange = jest.fn();
      render(<RadioGroup name="test" options={options} onChange={handleChange} />);
      
      const radio = screen.getByLabelText('Option 1');
      fireEvent.click(radio);
      
      expect(handleChange).toHaveBeenCalledWith('option1');
    });

    it('renders horizontally when specified', () => {
      const { container } = render(
        <RadioGroup name="test" options={options} direction="horizontal" />
      );
      
      const group = container.querySelector('[role="radiogroup"]');
      expect(group).toHaveClass('flex', 'space-x-6');
    });
  });

  describe('LoadingSpinner', () => {
    it('renders loading spinner', () => {
      render(<LoadingSpinner />);
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('applies size classes correctly', () => {
      render(<LoadingSpinner size="lg" />);
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('w-6', 'h-6');
    });

    it('applies color classes correctly', () => {
      render(<LoadingSpinner color="primary" />);
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('text-primary-600');
    });
  });

  describe('ButtonGroup', () => {
    it('renders button group', () => {
      render(
        <ButtonGroup>
          <Button>Button 1</Button>
          <Button>Button 2</Button>
          <Button>Button 3</Button>
        </ButtonGroup>
      );
      
      expect(screen.getByText('Button 1')).toBeInTheDocument();
      expect(screen.getByText('Button 2')).toBeInTheDocument();
      expect(screen.getByText('Button 3')).toBeInTheDocument();
    });

    it('applies group styles to buttons', () => {
      render(
        <ButtonGroup>
          <Button>First</Button>
          <Button>Last</Button>
        </ButtonGroup>
      );
      
      const firstButton = screen.getByText('First').closest('button');
      const lastButton = screen.getByText('Last').closest('button');
      
      expect(firstButton).toHaveClass('rounded-l-lg', 'rounded-r-none');
      expect(lastButton).toHaveClass('rounded-r-lg', 'rounded-l-none');
    });

    it('renders vertically when specified', () => {
      const { container } = render(
        <ButtonGroup orientation="vertical">
          <Button>Top</Button>
          <Button>Bottom</Button>
        </ButtonGroup>
      );
      
      const group = container.querySelector('[role="group"]');
      expect(group).toHaveClass('flex-col');
    });
  });
});