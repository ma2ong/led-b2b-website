/**
 * 快速联系栏组件
 */
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import {
  PhoneIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  ClockIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

interface QuickContactBarProps {
  className?: string;
  position?: 'top' | 'bottom';
  showOnLoad?: boolean;
  autoHide?: boolean;
  autoHideDelay?: number;
}

const QuickContactBar: React.FC<QuickContactBarProps> = ({
  className,
  position = 'top',
  showOnLoad = true,
  autoHide = false,
  autoHideDelay = 10000
}) => {
  const { t } = useTranslation('contact');
  const [isVisible, setIsVisible] = useState(showOnLoad);
  const [isClosing, setIsClosing] = useState(false);

  // 自动隐藏
  useEffect(() => {
    if (autoHide && isVisible) {
      const timer = setTimeout(() => {
        handleClose();
      }, autoHideDelay);
      return () => clearTimeout(timer);
    }
  }, [autoHide, autoHideDelay, isVisible]);

  // 关闭动画
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsClosing(false);
    }, 300);
  };

  // 获取当前时间状态
  const getBusinessHoursStatus = () => {
    const now = new Date();
    const hour = now.getHours();
    const isBusinessHours = hour >= 9 && hour < 18;
    
    return {
      isOpen: isBusinessHours,
      message: isBusinessHours ? t('businessHoursOpen') : t('businessHoursClosed'),
      nextOpen: isBusinessHours ? null : t('opensAt9AM'),
    };
  };

  const businessStatus = getBusinessHoursStatus();

  if (!isVisible) return null;

  return (
    <div className={cn(
      'fixed left-0 right-0 z-40 bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg transition-all duration-300 ease-in-out',
      position === 'top' ? 'top-0' : 'bottom-0',
      isClosing ? 'transform -translate-y-full opacity-0' : 'transform translate-y-0 opacity-100',
      className
    )}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* 左侧信息 */}
          <div className="flex items-center space-x-6">
            {/* 营业时间状态 */}
            <div className="flex items-center space-x-2">
              <div className={cn(
                'w-2 h-2 rounded-full',
                businessStatus.isOpen ? 'bg-green-400' : 'bg-yellow-400'
              )} />
              <div className="hidden sm:block">
                <span className="text-sm font-medium">{businessStatus.message}</span>
                {businessStatus.nextOpen && (
                  <span className="text-xs text-primary-200 ml-2">
                    {businessStatus.nextOpen}
                  </span>
                )}
              </div>
            </div>

            {/* 联系信息 */}
            <div className="hidden md:flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <PhoneIcon className="w-4 h-4" />
                <span>+86-755-12345678</span>
              </div>
              <div className="flex items-center space-x-2">
                <EnvelopeIcon className="w-4 h-4" />
                <span>sales@lejin-led.com</span>
              </div>
            </div>
          </div>

          {/* 右侧操作按钮 */}
          <div className="flex items-center space-x-4">
            {/* 快速联系按钮 */}
            <div className="flex items-center space-x-2">
              {/* 电话 */}
              <a
                href="tel:+86-755-12345678"
                className="flex items-center space-x-1 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full transition-colors text-sm"
                title={t('callUs')}
              >
                <PhoneIcon className="w-4 h-4" />
                <span className="hidden sm:inline">{t('call')}</span>
              </a>

              {/* WhatsApp */}
              <a
                href="https://wa.me/8617512345678?text=Hello, I am interested in your LED display products"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1 bg-green-500 hover:bg-green-600 px-3 py-1.5 rounded-full transition-colors text-sm"
                title="WhatsApp"
              >
                <ChatBubbleLeftRightIcon className="w-4 h-4" />
                <span className="hidden sm:inline">WhatsApp</span>
              </a>

              {/* 邮件 */}
              <a
                href="mailto:sales@lejin-led.com?subject=LED Display Inquiry"
                className="flex items-center space-x-1 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full transition-colors text-sm"
                title={t('emailUs')}
              >
                <EnvelopeIcon className="w-4 h-4" />
                <span className="hidden sm:inline">{t('email')}</span>
              </a>
            </div>

            {/* 关闭按钮 */}
            <button
              onClick={handleClose}
              className="text-white/80 hover:text-white transition-colors p-1"
              aria-label={t('close')}
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 移动端额外信息 */}
        <div className="md:hidden mt-2 pt-2 border-t border-white/20">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <PhoneIcon className="w-3 h-3" />
                <span>+86-755-12345678</span>
              </div>
              <div className="flex items-center space-x-1">
                <ClockIcon className="w-3 h-3" />
                <span>{t('businessHours')}: 9:00-18:00</span>
              </div>
            </div>
            <div className="flex items-center space-x-1 text-primary-200">
              <GlobeAltIcon className="w-3 h-3" />
              <span>{t('globalService')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 装饰性渐变 */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none" />
    </div>
  );
};

export default QuickContactBar;