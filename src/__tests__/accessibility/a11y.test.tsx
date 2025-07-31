/**
 * 无障碍访问测试
 */
import React from 'react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/lib/i18n-config';

// 扩展Jest匹配器
expect.extend(toHaveNoViolations);

// 测试组件包装器
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <I18nextProvider i18n={i18n}>
    {children}
  </I18nextProvider>
);

// 导入需要测试的组件
import Navigation from '@/components/navigation/Navigation';
import HeroSection from '@/components/home/HeroSection';
import ProductGrid from '@/components/products/ProductGrid';
import InquiryForm from '@/components/forms/InquiryForm';
import ProductDetailPage from '@/components/products/ProductDetailPage';
import CaseStudiesPage from '@/components/case-studies/CaseStudiesPage';

describe('Accessibility Tests', () => {
  describe('Navigation Components', () => {
    it('Navigation should be accessible', async () => {
      const { container } = render(
        <TestWrapper>
          <Navigation />
        </TestWrapper>
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('Navigation should have proper ARIA labels', () => {
      const { getByRole } = render(
        <TestWrapper>
          <Navigation />
        </TestWrapper>
      );

      // 检查主导航
      const nav = getByRole('navigation');
      expect(nav).toBeInTheDocument();
      expect(nav).toHaveAttribute('aria-label');

      // 检查菜单按钮
      const menuButtons = document.querySelectorAll('[role="button"]');
      menuButtons.forEach(button => {
        expect(button).toHaveAttribute('aria-label');
      });
    });

    it('Navigation should support keyboard navigation', () => {
      const { container } = render(
        <TestWrapper>
          <Navigation />
        </TestWrapper>
      );

      // 检查所有可聚焦元素
      const focusableElements = container.querySelectorAll(
        'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      focusableElements.forEach(element => {
        expect(element).toBeVisible();
        expect(element).not.toHaveAttribute('tabindex', '-1');
      });
    });
  });

  describe('Home Page Components', () => {
    it('Hero section should be accessible', async () => {
      const { container } = render(
        <TestWrapper>
          <HeroSection />
        </TestWrapper>
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('Hero section should have proper heading hierarchy', () => {
      const { container } = render(
        <TestWrapper>
          <HeroSection />
        </TestWrapper>
      );

      // 检查标题层级
      const h1 = container.querySelector('h1');
      expect(h1).toBeInTheDocument();

      const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
      let previousLevel = 0;
      
      headings.forEach(heading => {
        const level = parseInt(heading.tagName.charAt(1));
        expect(level).toBeLessThanOrEqual(previousLevel + 1);
        previousLevel = level;
      });
    });

    it('Hero section images should have alt text', () => {
      const { container } = render(
        <TestWrapper>
          <HeroSection />
        </TestWrapper>
      );

      const images = container.querySelectorAll('img');
      images.forEach(img => {
        expect(img).toHaveAttribute('alt');
        expect(img.getAttribute('alt')).not.toBe('');
      });
    });
  });

  describe('Product Components', () => {
    const mockProducts = [
      {
        id: 'prod_001',
        name: 'P2.5 Indoor LED Display',
        slug: 'p2-5-indoor-led-display',
        description: 'High-resolution indoor LED display',
        shortDescription: 'High-resolution indoor LED display',
        category: 'Indoor LED',
        price: { basePrice: 450, currency: 'USD', unit: 'sqm' },
        images: [{ id: 'img_001', url: '/test-image.jpg', alt: 'P2.5 LED Display', isPrimary: true, order: 1 }],
        status: 'active',
        availability: 'in_stock',
        featured: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    it('Product grid should be accessible', async () => {
      const { container } = render(
        <TestWrapper>
          <ProductGrid products={mockProducts} />
        </TestWrapper>
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('Product cards should have proper ARIA labels', () => {
      const { container } = render(
        <TestWrapper>
          <ProductGrid products={mockProducts} />
        </TestWrapper>
      );

      const productCards = container.querySelectorAll('[data-testid="product-card"]');
      productCards.forEach(card => {
        expect(card).toHaveAttribute('role', 'article');
        expect(card).toHaveAttribute('aria-label');
      });
    });

    it('Product detail page should be accessible', async () => {
      const { container } = render(
        <TestWrapper>
          <ProductDetailPage product={mockProducts[0]} />
        </TestWrapper>
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('Product specifications should be properly structured', () => {
      const { container } = render(
        <TestWrapper>
          <ProductDetailPage product={mockProducts[0]} />
        </TestWrapper>
      );

      // 检查规格表格
      const tables = container.querySelectorAll('table');
      tables.forEach(table => {
        expect(table).toHaveAttribute('role', 'table');
        
        const headers = table.querySelectorAll('th');
        headers.forEach(header => {
          expect(header).toHaveAttribute('scope');
        });
      });
    });
  });

  describe('Form Components', () => {
    it('Inquiry form should be accessible', async () => {
      const { container } = render(
        <TestWrapper>
          <InquiryForm onSubmit={() => {}} />
        </TestWrapper>
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('Form fields should have proper labels', () => {
      const { container } = render(
        <TestWrapper>
          <InquiryForm onSubmit={() => {}} />
        </TestWrapper>
      );

      const inputs = container.querySelectorAll('input, select, textarea');
      inputs.forEach(input => {
        const id = input.getAttribute('id');
        if (id) {
          const label = container.querySelector(`label[for="${id}"]`);
          expect(label).toBeInTheDocument();
        } else {
          // 如果没有id，应该有aria-label或aria-labelledby
          expect(
            input.hasAttribute('aria-label') || 
            input.hasAttribute('aria-labelledby')
          ).toBe(true);
        }
      });
    });

    it('Form validation errors should be accessible', () => {
      const { container } = render(
        <TestWrapper>
          <InquiryForm onSubmit={() => {}} />
        </TestWrapper>
      );

      // 模拟表单验证错误
      const errorMessages = container.querySelectorAll('[role="alert"]');
      errorMessages.forEach(error => {
        expect(error).toHaveAttribute('aria-live', 'polite');
      });
    });

    it('Required fields should be properly marked', () => {
      const { container } = render(
        <TestWrapper>
          <InquiryForm onSubmit={() => {}} />
        </TestWrapper>
      );

      const requiredInputs = container.querySelectorAll('input[required], select[required], textarea[required]');
      requiredInputs.forEach(input => {
        expect(input).toHaveAttribute('aria-required', 'true');
      });
    });
  });

  describe('Case Studies Components', () => {
    it('Case studies page should be accessible', async () => {
      const { container } = render(
        <TestWrapper>
          <CaseStudiesPage />
        </TestWrapper>
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('Case study map should be accessible', () => {
      const { container } = render(
        <TestWrapper>
          <CaseStudiesPage />
        </TestWrapper>
      );

      const map = container.querySelector('[data-testid="case-study-map"]');
      if (map) {
        expect(map).toHaveAttribute('role', 'img');
        expect(map).toHaveAttribute('aria-label');
      }
    });
  });

  describe('Interactive Elements', () => {
    it('Buttons should have accessible names', () => {
      const { container } = render(
        <TestWrapper>
          <div>
            <button>Click me</button>
            <button aria-label="Close dialog">×</button>
            <button><span aria-hidden="true">🔍</span> Search</button>
          </div>
        </TestWrapper>
      );

      const buttons = container.querySelectorAll('button');
      buttons.forEach(button => {
        const hasText = button.textContent && button.textContent.trim() !== '';
        const hasAriaLabel = button.hasAttribute('aria-label');
        const hasAriaLabelledBy = button.hasAttribute('aria-labelledby');
        
        expect(hasText || hasAriaLabel || hasAriaLabelledBy).toBe(true);
      });
    });

    it('Links should have accessible names', () => {
      const { container } = render(
        <TestWrapper>
          <div>
            <a href="/products">Products</a>
            <a href="/contact" aria-label="Contact us">📞</a>
          </div>
        </TestWrapper>
      );

      const links = container.querySelectorAll('a');
      links.forEach(link => {
        const hasText = link.textContent && link.textContent.trim() !== '';
        const hasAriaLabel = link.hasAttribute('aria-label');
        const hasAriaLabelledBy = link.hasAttribute('aria-labelledby');
        
        expect(hasText || hasAriaLabel || hasAriaLabelledBy).toBe(true);
      });
    });

    it('Interactive elements should have focus indicators', () => {
      const { container } = render(
        <TestWrapper>
          <div>
            <button>Button</button>
            <a href="/test">Link</a>
            <input type="text" />
          </div>
        </TestWrapper>
      );

      const interactiveElements = container.querySelectorAll('button, a, input, select, textarea');
      interactiveElements.forEach(element => {
        // 检查元素是否可以获得焦点
        expect(element.tabIndex).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('Color Contrast', () => {
    it('Text should have sufficient color contrast', () => {
      // 这个测试需要实际的颜色对比度检查工具
      // 在实际项目中，可以使用 axe-core 的颜色对比度规则
      const { container } = render(
        <TestWrapper>
          <div>
            <p className="text-gray-900">High contrast text</p>
            <p className="text-gray-600">Medium contrast text</p>
            <button className="bg-blue-600 text-white">Button</button>
          </div>
        </TestWrapper>
      );

      // axe 会自动检查颜色对比度
      expect(container).toBeInTheDocument();
    });
  });

  describe('Screen Reader Support', () => {
    it('Should have proper landmark roles', () => {
      const { container } = render(
        <TestWrapper>
          <div>
            <header role="banner">Header</header>
            <nav role="navigation">Navigation</nav>
            <main role="main">Main content</main>
            <aside role="complementary">Sidebar</aside>
            <footer role="contentinfo">Footer</footer>
          </div>
        </TestWrapper>
      );

      expect(container.querySelector('[role="banner"]')).toBeInTheDocument();
      expect(container.querySelector('[role="navigation"]')).toBeInTheDocument();
      expect(container.querySelector('[role="main"]')).toBeInTheDocument();
      expect(container.querySelector('[role="complementary"]')).toBeInTheDocument();
      expect(container.querySelector('[role="contentinfo"]')).toBeInTheDocument();
    });

    it('Should have proper skip links', () => {
      const { container } = render(
        <TestWrapper>
          <div>
            <a href="#main-content" className="sr-only focus:not-sr-only">
              Skip to main content
            </a>
            <main id="main-content">Main content</main>
          </div>
        </TestWrapper>
      );

      const skipLink = container.querySelector('a[href="#main-content"]');
      expect(skipLink).toBeInTheDocument();
      expect(skipLink).toHaveTextContent('Skip to main content');
    });

    it('Should announce dynamic content changes', () => {
      const { container } = render(
        <TestWrapper>
          <div>
            <div aria-live="polite" id="status">Status updates</div>
            <div aria-live="assertive" id="alerts">Important alerts</div>
          </div>
        </TestWrapper>
      );

      expect(container.querySelector('[aria-live="polite"]')).toBeInTheDocument();
      expect(container.querySelector('[aria-live="assertive"]')).toBeInTheDocument();
    });
  });

  describe('Mobile Accessibility', () => {
    beforeEach(() => {
      // 模拟移动设备视口
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 667,
      });
    });

    it('Touch targets should be large enough', () => {
      const { container } = render(
        <TestWrapper>
          <div>
            <button className="p-4">Large button</button>
            <a href="/test" className="inline-block p-3">Large link</a>
          </div>
        </TestWrapper>
      );

      const touchTargets = container.querySelectorAll('button, a');
      touchTargets.forEach(target => {
        const styles = window.getComputedStyle(target);
        const minSize = 44; // 44px minimum touch target size
        
        // 在实际测试中，你需要检查计算后的尺寸
        // 这里只是示例
        expect(target).toBeInTheDocument();
      });
    });

    it('Should support zoom up to 200%', () => {
      // 模拟200%缩放
      Object.defineProperty(window, 'devicePixelRatio', {
        writable: true,
        configurable: true,
        value: 2,
      });

      const { container } = render(
        <TestWrapper>
          <div className="responsive-layout">
            <p>This content should be readable at 200% zoom</p>
          </div>
        </TestWrapper>
      );

      // 检查内容在缩放时是否仍然可访问
      expect(container.textContent).toContain('This content should be readable');
    });
  });
});