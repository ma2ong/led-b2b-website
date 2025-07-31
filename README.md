# LED Display B2B Website

Professional LED Display B2B website for Shenzhen Lejin Optoelectronics Co., Ltd.

## 🚀 Project Overview

This is a modern, responsive B2B website built for LED display manufacturing company, featuring:

- **Modern Tech Stack**: Next.js 14, TypeScript, Tailwind CSS
- **Internationalization**: Chinese and English support
- **Responsive Design**: Mobile-first approach
- **SEO Optimized**: Built-in SEO best practices
- **Performance Focused**: Optimized for Core Web Vitals
- **Accessibility**: WCAG 2.1 AA compliant

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 14 (React 18)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Custom CSS Variables
- **Animation**: Framer Motion
- **State Management**: Zustand
- **Form Handling**: React Hook Form + Zod
- **Internationalization**: next-i18next

### Development Tools
- **Code Quality**: ESLint + Prettier
- **Testing**: Jest + React Testing Library + Cypress
- **Git Hooks**: Husky + lint-staged
- **Package Manager**: npm

## 📁 Project Structure

```
led-b2b-website/
├── public/
│   ├── locales/           # Translation files
│   │   ├── en/
│   │   └── zh/
│   └── images/            # Static images
├── src/
│   ├── components/        # Reusable components
│   ├── pages/            # Next.js pages
│   ├── styles/           # Global styles
│   ├── lib/              # Utility functions
│   ├── hooks/            # Custom React hooks
│   ├── types/            # TypeScript type definitions
│   └── utils/            # Helper utilities
├── .kiro/
│   └── specs/            # Project specifications
└── cypress/              # E2E tests
```

## 🚦 Getting Started

### Prerequisites

- Node.js 18+ 
- npm 8+

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd led-b2b-website
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:3000
   ```

## 📜 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run type-check` - Run TypeScript type checking
- `npm run test` - Run unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage
- `npm run test:e2e` - Run E2E tests (interactive)
- `npm run test:e2e:headless` - Run E2E tests (headless)

## 🌍 Internationalization

The website supports Chinese (zh) and English (en) languages:

- Translation files are located in `public/locales/`
- Use `useTranslation` hook for translations
- Language switching is handled automatically
- SEO-friendly URLs with language prefixes

## 🎨 Design System

### Colors
- **Primary**: Blue tones (#1e40af, #3b82f6, #1e3a8a)
- **Accent**: Orange tones (#f97316, #fb923c, #ea580c)
- **Success**: Green tones (#10b981, #34d399, #059669)
- **Neutral**: Gray scale (#111827 to #f9fafb)

### Typography
- **Primary Font**: Inter (English), PingFang SC (Chinese)
- **Display Font**: Poppins
- **Font Sizes**: 12px to 60px (responsive scale)

### Components
- Consistent button styles (primary, secondary, accent)
- Card components with hover effects
- Responsive grid layouts
- Form components with validation

## 🧪 Testing

### Unit Tests
```bash
npm run test
```

### E2E Tests
```bash
npm run test:e2e
```

### Coverage Report
```bash
npm run test:coverage
```

## 📈 Performance

Target metrics:
- **LCP**: < 2.5s
- **FID**: < 100ms
- **CLS**: < 0.1
- **Page Load**: < 3s (3G network)

Optimization features:
- Image optimization with WebP/AVIF
- Code splitting and lazy loading
- CDN integration ready
- Critical CSS inlining
- Service Worker support

## 🔒 Security

Security measures implemented:
- HTTPS enforcement
- Security headers (CSP, HSTS, etc.)
- Input validation and sanitization
- XSS and CSRF protection
- Secure authentication (JWT)

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Environment Variables
Create `.env.local` file:
```env
NEXT_PUBLIC_SITE_URL=https://lejin-led.com
NEXT_PUBLIC_GA_ID=GA_MEASUREMENT_ID
```

### Deployment Platforms
- **Vercel**: Recommended (zero-config)
- **Netlify**: Static site deployment
- **AWS**: Full control deployment
- **Docker**: Containerized deployment

## 📊 Analytics & Monitoring

- Google Analytics 4 integration
- Core Web Vitals monitoring
- Error tracking with Sentry (optional)
- Performance monitoring

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Code Standards
- Follow TypeScript best practices
- Use Prettier for code formatting
- Write tests for new features
- Follow conventional commit messages

## 📝 License

This project is proprietary software of Shenzhen Lejin Optoelectronics Co., Ltd.

## 📞 Support

For technical support or questions:
- Email: dev@lejin-led.com
- Documentation: [Project Wiki]
- Issues: [GitHub Issues]

---

**Built with ❤️ for Shenzhen Lejin Optoelectronics Co., Ltd.**