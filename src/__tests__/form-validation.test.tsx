import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Form, { FormField } from '@/components/ui/Form';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { required, email, minLength, combine } from '@/lib/validation';

// Mock next-i18next
jest.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('Form Validation', () => {
  it('should validate required fields', async () => {
    const mockSubmit = jest.fn();
    
    render(
      <Form
        initialValues={{ name: '', email: '' }}
        validationSchema={{
          name: required('Name is required'),
          email: combine(required('Email is required'), email('Invalid email')),
        }}
        onSubmit={mockSubmit}
      >
        <FormField name="name">
          {({ value, error, onChange, onBlur }) => (
            <Input
              label="Name"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onBlur={onBlur}
              error={error}
            />
          )}
        </FormField>
        
        <FormField name="email">
          {({ value, error, onChange, onBlur }) => (
            <Input
              label="Email"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onBlur={onBlur}
              error={error}
            />
          )}
        </FormField>
        
        <Button type="submit">Submit</Button>
      </Form>
    );

    // 尝试提交空表单
    fireEvent.click(screen.getByText('Submit'));

    // 应该显示验证错误
    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument();
      expect(screen.getByText('Email is required')).toBeInTheDocument();
    });

    // 不应该调用提交函数
    expect(mockSubmit).not.toHaveBeenCalled();
  });

  it('should validate email format', async () => {
    const mockSubmit = jest.fn();
    
    render(
      <Form
        initialValues={{ email: '' }}
        validationSchema={{
          email: combine(required('Email is required'), email('Invalid email')),
        }}
        onSubmit={mockSubmit}
      >
        <FormField name="email">
          {({ value, error, onChange, onBlur }) => (
            <Input
              label="Email"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onBlur={onBlur}
              error={error}
            />
          )}
        </FormField>
        
        <Button type="submit">Submit</Button>
      </Form>
    );

    const emailInput = screen.getByLabelText('Email');
    
    // 输入无效邮箱
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.blur(emailInput);

    // 应该显示邮箱格式错误
    await waitFor(() => {
      expect(screen.getByText('Invalid email')).toBeInTheDocument();
    });
  });

  it('should submit form with valid data', async () => {
    const mockSubmit = jest.fn().mockResolvedValue(undefined);
    
    render(
      <Form
        initialValues={{ name: '', email: '' }}
        validationSchema={{
          name: required('Name is required'),
          email: combine(required('Email is required'), email('Invalid email')),
        }}
        onSubmit={mockSubmit}
      >
        <FormField name="name">
          {({ value, error, onChange, onBlur }) => (
            <Input
              label="Name"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onBlur={onBlur}
              error={error}
            />
          )}
        </FormField>
        
        <FormField name="email">
          {({ value, error, onChange, onBlur }) => (
            <Input
              label="Email"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onBlur={onBlur}
              error={error}
            />
          )}
        </FormField>
        
        <Button type="submit">Submit</Button>
      </Form>
    );

    // 填写有效数据
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'john@example.com' } });

    // 提交表单
    fireEvent.click(screen.getByText('Submit'));

    // 应该调用提交函数
    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
      });
    });
  });

  it('should clear errors when field becomes valid', async () => {
    render(
      <Form
        initialValues={{ email: '' }}
        validationSchema={{
          email: combine(required('Email is required'), email('Invalid email')),
        }}
        onSubmit={() => {}}
      >
        <FormField name="email">
          {({ value, error, onChange, onBlur }) => (
            <Input
              label="Email"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onBlur={onBlur}
              error={error}
            />
          )}
        </FormField>
      </Form>
    );

    const emailInput = screen.getByLabelText('Email');
    
    // 输入无效邮箱
    fireEvent.change(emailInput, { target: { value: 'invalid' } });
    fireEvent.blur(emailInput);

    // 应该显示错误
    await waitFor(() => {
      expect(screen.getByText('Invalid email')).toBeInTheDocument();
    });

    // 输入有效邮箱
    fireEvent.change(emailInput, { target: { value: 'valid@example.com' } });

    // 错误应该消失
    await waitFor(() => {
      expect(screen.queryByText('Invalid email')).not.toBeInTheDocument();
    });
  });
});