/**
 * Cookie同意组件 - GDPR合规
 */
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import {
  XMarkIcon,
  CogIcon,
  InformationCircleIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

// Cookie类型定义
export enum CookieType {
  NECESSARY = 'necessary',
  ANALYTICS = 'analytics',
  MARKETING = 'marketing',
  FUNCTIONAL = 'functional',
}

// Cookie配置
interface CookieConfig {
  type: CookieType;
  name: string;
  description: string;
  required: boolean;
  enabled: boolean;
}

interface CookieConsentProps {
  className?: string;
  onConsentChange?: (consent: Record<CookieType, boolean>) => void;
}

const CookieConsent: React.FC<CookieConsentProps> = ({
  className,
  onConsentChange,
}) => {
  const { t } = useTranslation('privacy');
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [cookieConfig, setCookieConfig] = useState<CookieConfig[]>([
    {
      type: CookieType.NECESSARY,
      name: t('necessaryCookies'),
      description: t('necessaryCookiesDesc'),
      required: true,
      enabled: true,
    },
    {
      type: CookieType.ANALYTICS,
      name: t('analyticsCookies'),
      description: t('analyticsCookiesDesc'),
      required: false,
      enabled: false,
    },
    {
      type: CookieType.MARKETING,
      name: t('marketingCookies'),
      description: t('marketingCookiesDesc'),
      required: false,
      enabled: false,
    },
    {
      type: CookieType.FUNCTIONAL,
      name: t('functionalCookies'),
      description: t('functionalCookiesDesc'),
      required: false,
      enabled: false,
    },
  ]);

  // 检查是否已经有Cookie同意记录
  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setIsVisible(true);
    } else {
      try {
        const consentData = JSON.parse(consent);
        // 更新Cookie配置状态
        setCookieConfig(prev => prev.map(config => ({
          ...config,
          enabled: config.required || consentData[config.type] || false,
        })));
      } catch (error) {
        console.error('Error parsing cookie consent:', error);
        setIsVisible(true);
      }
    }
  }, []);

  // 处理Cookie类型切换
  const handleCookieToggle = (type: CookieType, enabled: boolean) => {
    setCookieConfig(prev => prev.map(config =>
      config.type === type ? { ...config, enabled } : config
    ));
  };

  // 接受所有Cookie
  const handleAcceptAll = () => {
    const updatedConfig = cookieConfig.map(config => ({
      ...config,
      enabled: true,
    }));
    setCookieConfig(updatedConfig);
    saveConsent(updatedConfig);
  };

  // 拒绝非必要Cookie
  const handleRejectAll = () => {
    const updatedConfig = cookieConfig.map(config => ({
      ...config,
      enabled: config.required,
    }));
    setCookieConfig(updatedConfig);
    saveConsent(updatedConfig);
  };

  // 保存自定义设置
  const handleSavePreferences = () => {
    saveConsent(cookieConfig);
  };

  // 保存同意设置
  const saveConsent = (config: CookieConfig[]) => {
    const consent: Record<CookieType, boolean> = {} as any;
    config.forEach(item => {
      consent[item.type] = item.enabled;
    });

    // 保存到localStorage
    localStorage.setItem('cookie-consent', JSON.stringify(consent));
    localStorage.setItem('cookie-consent-date', new Date().toISOString());

    // 设置Cookie过期时间（1年）
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    document.cookie = `cookie-consent=${JSON.stringify(consent)}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Strict`;

    // 通知父组件
    if (onConsentChange) {
      onConsentChange(consent);
    }

    // 隐藏同意框
    setIsVisible(false);
    setShowDetails(false);

    // 根据用户选择加载相应的脚本
    loadConsentBasedScripts(consent);
  };

  // 根据同意设置加载脚本
  const loadConsentBasedScripts = (consent: Record<CookieType, boolean>) => {
    // Google Analytics
    if (consent[CookieType.ANALYTICS]) {
      loadGoogleAnalytics();
    }

    // 营销相关脚本
    if (consent[CookieType.MARKETING]) {
      loadMarketingScripts();
    }

    // 功能性脚本
    if (consent[CookieType.FUNCTIONAL]) {
      loadFunctionalScripts();
    }
  };

  // 加载Google Analytics
  const loadGoogleAnalytics = () => {
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_GA_ID) {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`;
      document.head.appendChild(script);

      script.onload = () => {
        (window as any).dataLayer = (window as any).dataLayer || [];
        function gtag(...args: any[]) {
          (window as any).dataLayer.push(args);
        }
        gtag('js', new Date());
        gtag('config', process.env.NEXT_PUBLIC_GA_ID);
      };
    }
  };

  // 加载营销脚本
  const loadMarketingScripts = () => {
    // 这里可以加载Facebook Pixel、Google Ads等营销脚本
    console.log('Loading marketing scripts...');
  };

  // 加载功能性脚本
  const loadFunctionalScripts = () => {
    // 这里可以加载聊天工具、地图等功能性脚本
    console.log('Loading functional scripts...');
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className={cn(
      'fixed inset-x-0 bottom-0 z-50 bg-white border-t border-gray-200 shadow-lg',
      className
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {!showDetails ? (
          // 简化视图
          <div className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <InformationCircleIcon className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-gray-700">
                    {t('cookieNotice')}
                    <button
                      onClick={() => setShowDetails(true)}
                      className="text-blue-600 hover:text-blue-700 underline ml-1"
                    >
                      {t('learnMore')}
                    </button>
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3 ml-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleRejectAll}
                >
                  {t('rejectAll')}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowDetails(true)}
                  leftIcon={<CogIcon className="w-4 h-4" />}
                >
                  {t('customize')}
                </Button>
                <Button
                  size="sm"
                  onClick={handleAcceptAll}
                >
                  {t('acceptAll')}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          // 详细设置视图
          <div className="py-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {t('cookiePreferences')}
              </h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-6">
              {t('cookiePreferencesDesc')}
            </p>

            <div className="space-y-4 mb-6">
              {cookieConfig.map((config) => (
                <div
                  key={config.type}
                  className="flex items-start justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-medium text-gray-900">
                        {config.name}
                      </h4>
                      {config.required && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {t('required')}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {config.description}
                    </p>
                  </div>
                  <div className="ml-4">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.enabled}
                        onChange={(e) => handleCookieToggle(config.type, e.target.checked)}
                        disabled={config.required}
                        className="sr-only peer"
                      />
                      <div className={cn(
                        'w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer',
                        'peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[""] after:absolute after:top-[2px] after:left-[2px]',
                        'after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all',
                        config.enabled ? 'bg-blue-600' : 'bg-gray-200',
                        config.required ? 'opacity-50 cursor-not-allowed' : ''
                      )}>
                      </div>
                    </label>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                <a
                  href="/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 underline"
                >
                  {t('privacyPolicy')}
                </a>
                {' | '}
                <a
                  href="/cookie-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 underline"
                >
                  {t('cookiePolicy')}
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  onClick={handleRejectAll}
                >
                  {t('rejectAll')}
                </Button>
                <Button
                  onClick={handleSavePreferences}
                  leftIcon={<CheckIcon className="w-4 h-4" />}
                >
                  {t('savePreferences')}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CookieConsent;