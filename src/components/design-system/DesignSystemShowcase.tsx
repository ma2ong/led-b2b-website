import React from 'react';
import { useTranslation } from 'next-i18next';

interface ColorSwatchProps {
  name: string;
  value: string;
  className: string;
}

const ColorSwatch: React.FC<ColorSwatchProps> = ({ name, value, className }) => (
  <div className="flex flex-col items-center space-y-2">
    <div className={`w-16 h-16 rounded-lg shadow-md ${className}`} />
    <div className="text-center">
      <div className="text-xs font-medium text-gray-900">{name}</div>
      <div className="text-xs text-gray-500">{value}</div>
    </div>
  </div>
);

interface ButtonShowcaseProps {
  variant: string;
  className: string;
  children: React.ReactNode;
}

const ButtonShowcase: React.FC<ButtonShowcaseProps> = ({ variant, className, children }) => (
  <div className="flex flex-col items-center space-y-2">
    <button className={className}>{children}</button>
    <span className="text-xs text-gray-500">{variant}</span>
  </div>
);

const DesignSystemShowcase: React.FC = () => {
  const { t } = useTranslation('common');

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            LED Display Design System
          </h1>
          <p className="text-xl text-gray-600">
            Complete design system for LED display B2B website
          </p>
        </div>

        {/* 颜色系统 */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-gray-900 mb-8">Color System</h2>
          
          {/* 主色调 */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Primary Colors (Tech Blue)</h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-9 gap-4">
              <ColorSwatch name="50" value="#eff6ff" className="bg-primary-50" />
              <ColorSwatch name="100" value="#dbeafe" className="bg-primary-100" />
              <ColorSwatch name="200" value="#bfdbfe" className="bg-primary-200" />
              <ColorSwatch name="300" value="#93c5fd" className="bg-primary-300" />
              <ColorSwatch name="400" value="#60a5fa" className="bg-primary-400" />
              <ColorSwatch name="500" value="#3b82f6" className="bg-primary-500" />
              <ColorSwatch name="600" value="#1e40af" className="bg-primary-600" />
              <ColorSwatch name="700" value="#1e3a8a" className="bg-primary-700" />
              <ColorSwatch name="800" value="#1e3a8a" className="bg-primary-800" />
            </div>
          </div>

          {/* 辅助色 */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Accent Colors (Energy Orange)</h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-9 gap-4">
              <ColorSwatch name="50" value="#fff7ed" className="bg-accent-50" />
              <ColorSwatch name="100" value="#ffedd5" className="bg-accent-100" />
              <ColorSwatch name="200" value="#fed7aa" className="bg-accent-200" />
              <ColorSwatch name="300" value="#fdba74" className="bg-accent-300" />
              <ColorSwatch name="400" value="#fb923c" className="bg-accent-400" />
              <ColorSwatch name="500" value="#f97316" className="bg-accent-500" />
              <ColorSwatch name="600" value="#ea580c" className="bg-accent-600" />
              <ColorSwatch name="700" value="#c2410c" className="bg-accent-700" />
              <ColorSwatch name="800" value="#9a3412" className="bg-accent-800" />
            </div>
          </div>

          {/* 成功色 */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Success Colors (Certification Green)</h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-9 gap-4">
              <ColorSwatch name="50" value="#ecfdf5" className="bg-success-50" />
              <ColorSwatch name="100" value="#d1fae5" className="bg-success-100" />
              <ColorSwatch name="200" value="#a7f3d0" className="bg-success-200" />
              <ColorSwatch name="300" value="#6ee7b7" className="bg-success-300" />
              <ColorSwatch name="400" value="#34d399" className="bg-success-400" />
              <ColorSwatch name="500" value="#10b981" className="bg-success-500" />
              <ColorSwatch name="600" value="#059669" className="bg-success-600" />
              <ColorSwatch name="700" value="#047857" className="bg-success-700" />
              <ColorSwatch name="800" value="#065f46" className="bg-success-800" />
            </div>
          </div>
        </section>

        {/* 按钮系统 */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-gray-900 mb-8">Button System</h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8">
            <ButtonShowcase variant="Primary" className="btn-primary">
              Get Quote
            </ButtonShowcase>
            <ButtonShowcase variant="Secondary" className="btn-secondary">
              Learn More
            </ButtonShowcase>
            <ButtonShowcase variant="Accent" className="btn-accent">
              Contact Us
            </ButtonShowcase>
            <ButtonShowcase variant="Success" className="btn-success">
              Certified
            </ButtonShowcase>
            <ButtonShowcase variant="Ghost" className="btn-ghost">
              View Details
            </ButtonShowcase>
          </div>

          {/* 按钮尺寸 */}
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Button Sizes</h3>
            <div className="flex flex-wrap items-center gap-4">
              <button className="btn-primary btn-xs">Extra Small</button>
              <button className="btn-primary btn-sm">Small</button>
              <button className="btn-primary">Default</button>
              <button className="btn-primary btn-lg">Large</button>
              <button className="btn-primary btn-xl">Extra Large</button>
            </div>
          </div>
        </section>

        {/* 卡片系统 */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-gray-900 mb-8">Card System</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Default Card</h3>
              <p className="text-gray-600">Basic card with soft shadow and hover effects.</p>
            </div>
            
            <div className="card card-interactive p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Interactive Card</h3>
              <p className="text-gray-600">Card with enhanced hover effects and cursor pointer.</p>
            </div>
            
            <div className="product-card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Product Card</h3>
              <p className="text-gray-600">Special card for product display with gradient overlay.</p>
            </div>
          </div>
        </section>

        {/* 表单组件 */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-gray-900 mb-8">Form Components</h2>
          
          <div className="max-w-md">
            <div className="mb-4">
              <label className="form-label">Text Input</label>
              <input type="text" className="form-input" placeholder="Enter your name" />
            </div>
            
            <div className="mb-4">
              <label className="form-label">Email Input</label>
              <input type="email" className="form-input" placeholder="your@email.com" />
            </div>
            
            <div className="mb-4">
              <label className="form-label">Select Dropdown</label>
              <select className="form-select">
                <option>Choose an option</option>
                <option>Indoor LED Display</option>
                <option>Outdoor LED Display</option>
                <option>Rental LED Display</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="form-label">Textarea</label>
              <textarea className="form-textarea" placeholder="Enter your message"></textarea>
            </div>
            
            <div className="mb-4">
              <label className="form-label">Input with Error</label>
              <input type="text" className="form-input error" placeholder="Invalid input" />
              <div className="form-error">This field is required</div>
            </div>
          </div>
        </section>

        {/* LED行业特定组件 */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-gray-900 mb-8">LED Industry Components</h2>
          
          {/* 规格徽章 */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Specification Badges</h3>
            <div className="flex flex-wrap gap-2">
              <span className="spec-badge spec-badge-indoor">Indoor</span>
              <span className="spec-badge spec-badge-outdoor">Outdoor</span>
              <span className="spec-badge spec-badge-rental">Rental</span>
              <span className="spec-badge spec-badge-creative">Creative</span>
              <span className="spec-badge spec-badge-transparent">Transparent</span>
            </div>
          </div>

          {/* 认证徽章 */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Certification Badges</h3>
            <div className="flex flex-wrap gap-2">
              <span className="cert-badge cert-badge-ce">CE</span>
              <span className="cert-badge cert-badge-fcc">FCC</span>
              <span className="cert-badge cert-badge-rohs">RoHS</span>
              <span className="cert-badge cert-badge-iso">ISO</span>
            </div>
          </div>

          {/* 像素间距颜色指示器 */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Pixel Pitch Indicators</h3>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <span className="pixel-pitch-color font-medium" data-pitch="0.9">P0.9</span>
                <span className="text-sm text-gray-500">Fine Pitch</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="pixel-pitch-color font-medium" data-pitch="1.25">P1.25</span>
                <span className="text-sm text-gray-500">Fine Pitch</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="pixel-pitch-color font-medium" data-pitch="2.5">P2.5</span>
                <span className="text-sm text-gray-500">Standard</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="pixel-pitch-color font-medium" data-pitch="5">P5</span>
                <span className="text-sm text-gray-500">Large Pitch</span>
              </div>
            </div>
          </div>

          {/* 亮度指示器 */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Brightness Indicators</h3>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <span className="brightness-indicator" data-level="low"></span>
                <span className="text-sm">800-1200 nits (Indoor)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="brightness-indicator" data-level="medium"></span>
                <span className="text-sm">2500-4000 nits (Semi-outdoor)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="brightness-indicator" data-level="high"></span>
                <span className="text-sm">5000-8000 nits (Outdoor)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="brightness-indicator" data-level="ultra"></span>
                <span className="text-sm">8000+ nits (High brightness)</span>
              </div>
            </div>
          </div>
        </section>

        {/* 动画效果 */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-gray-900 mb-8">Animation Effects</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="card p-4 text-center animate-fade-in">
              <div className="text-sm font-medium">Fade In</div>
            </div>
            <div className="card p-4 text-center animate-slide-up">
              <div className="text-sm font-medium">Slide Up</div>
            </div>
            <div className="card p-4 text-center animate-scale-in">
              <div className="text-sm font-medium">Scale In</div>
            </div>
            <div className="card p-4 text-center animate-bounce-in">
              <div className="text-sm font-medium">Bounce In</div>
            </div>
          </div>
        </section>

        {/* 规格表格 */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-gray-900 mb-8">Specification Table</h2>
          
          <div className="overflow-x-auto">
            <table className="spec-table">
              <thead>
                <tr>
                  <th>Specification</th>
                  <th>P1.25</th>
                  <th>P1.56</th>
                  <th>P2.5</th>
                  <th>P3</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="font-medium">Pixel Pitch</td>
                  <td>1.25mm</td>
                  <td>1.56mm</td>
                  <td>2.5mm</td>
                  <td>3mm</td>
                </tr>
                <tr>
                  <td className="font-medium">Brightness</td>
                  <td>800 nits</td>
                  <td>1000 nits</td>
                  <td>1200 nits</td>
                  <td>1200 nits</td>
                </tr>
                <tr>
                  <td className="font-medium">Refresh Rate</td>
                  <td>3840Hz</td>
                  <td>3840Hz</td>
                  <td>1920Hz</td>
                  <td>1920Hz</td>
                </tr>
                <tr>
                  <td className="font-medium">Viewing Angle</td>
                  <td>H:140° V:140°</td>
                  <td>H:140° V:140°</td>
                  <td>H:140° V:140°</td>
                  <td>H:140° V:140°</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};

export default DesignSystemShowcase;