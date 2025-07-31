import React from 'react';
import { render, screen } from '@testing-library/react';
import DesignSystemShowcase from '@/components/design-system/DesignSystemShowcase';

// Mock next-i18next
jest.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('DesignSystemShowcase', () => {
  it('renders the design system showcase', () => {
    render(<DesignSystemShowcase />);
    
    // 检查主标题
    expect(screen.getByText('LED Display Design System')).toBeInTheDocument();
    expect(screen.getByText('Complete design system for LED display B2B website')).toBeInTheDocument();
  });

  it('displays color system section', () => {
    render(<DesignSystemShowcase />);
    
    expect(screen.getByText('Color System')).toBeInTheDocument();
    expect(screen.getByText('Primary Colors (Tech Blue)')).toBeInTheDocument();
    expect(screen.getByText('Accent Colors (Energy Orange)')).toBeInTheDocument();
    expect(screen.getByText('Success Colors (Certification Green)')).toBeInTheDocument();
  });

  it('displays button system section', () => {
    render(<DesignSystemShowcase />);
    
    expect(screen.getByText('Button System')).toBeInTheDocument();
    expect(screen.getByText('Button Sizes')).toBeInTheDocument();
    
    // 检查按钮变体
    expect(screen.getByText('Get Quote')).toBeInTheDocument();
    expect(screen.getByText('Learn More')).toBeInTheDocument();
    expect(screen.getByText('Contact Us')).toBeInTheDocument();
  });

  it('displays card system section', () => {
    render(<DesignSystemShowcase />);
    
    expect(screen.getByText('Card System')).toBeInTheDocument();
    expect(screen.getByText('Default Card')).toBeInTheDocument();
    expect(screen.getByText('Interactive Card')).toBeInTheDocument();
    expect(screen.getByText('Product Card')).toBeInTheDocument();
  });

  it('displays form components section', () => {
    render(<DesignSystemShowcase />);
    
    expect(screen.getByText('Form Components')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('your@email.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your message')).toBeInTheDocument();
  });

  it('displays LED industry specific components', () => {
    render(<DesignSystemShowcase />);
    
    expect(screen.getByText('LED Industry Components')).toBeInTheDocument();
    expect(screen.getByText('Specification Badges')).toBeInTheDocument();
    expect(screen.getByText('Certification Badges')).toBeInTheDocument();
    expect(screen.getByText('Pixel Pitch Indicators')).toBeInTheDocument();
    expect(screen.getByText('Brightness Indicators')).toBeInTheDocument();
  });

  it('displays specification badges correctly', () => {
    render(<DesignSystemShowcase />);
    
    expect(screen.getByText('Indoor')).toBeInTheDocument();
    expect(screen.getByText('Outdoor')).toBeInTheDocument();
    expect(screen.getByText('Rental')).toBeInTheDocument();
    expect(screen.getByText('Creative')).toBeInTheDocument();
    expect(screen.getByText('Transparent')).toBeInTheDocument();
  });

  it('displays certification badges correctly', () => {
    render(<DesignSystemShowcase />);
    
    expect(screen.getByText('CE')).toBeInTheDocument();
    expect(screen.getByText('FCC')).toBeInTheDocument();
    expect(screen.getByText('RoHS')).toBeInTheDocument();
    expect(screen.getByText('ISO')).toBeInTheDocument();
  });

  it('displays animation effects section', () => {
    render(<DesignSystemShowcase />);
    
    expect(screen.getByText('Animation Effects')).toBeInTheDocument();
    expect(screen.getByText('Fade In')).toBeInTheDocument();
    expect(screen.getByText('Slide Up')).toBeInTheDocument();
    expect(screen.getByText('Scale In')).toBeInTheDocument();
    expect(screen.getByText('Bounce In')).toBeInTheDocument();
  });

  it('displays specification table', () => {
    render(<DesignSystemShowcase />);
    
    expect(screen.getByText('Specification Table')).toBeInTheDocument();
    
    // 检查表格头部
    expect(screen.getByText('Specification')).toBeInTheDocument();
    expect(screen.getByText('P1.25')).toBeInTheDocument();
    expect(screen.getByText('P1.56')).toBeInTheDocument();
    expect(screen.getByText('P2.5')).toBeInTheDocument();
    expect(screen.getByText('P3')).toBeInTheDocument();
    
    // 检查表格内容
    expect(screen.getByText('Pixel Pitch')).toBeInTheDocument();
    expect(screen.getByText('Brightness')).toBeInTheDocument();
    expect(screen.getByText('Refresh Rate')).toBeInTheDocument();
    expect(screen.getByText('Viewing Angle')).toBeInTheDocument();
  });

  it('has proper CSS classes applied', () => {
    const { container } = render(<DesignSystemShowcase />);
    
    // 检查主容器类
    expect(container.querySelector('.container-custom')).toBeInTheDocument();
    
    // 检查按钮类
    expect(container.querySelector('.btn-primary')).toBeInTheDocument();
    expect(container.querySelector('.btn-secondary')).toBeInTheDocument();
    expect(container.querySelector('.btn-accent')).toBeInTheDocument();
    
    // 检查卡片类
    expect(container.querySelector('.card')).toBeInTheDocument();
    expect(container.querySelector('.product-card')).toBeInTheDocument();
    
    // 检查表单类
    expect(container.querySelector('.form-input')).toBeInTheDocument();
    expect(container.querySelector('.form-select')).toBeInTheDocument();
    expect(container.querySelector('.form-textarea')).toBeInTheDocument();
  });
});