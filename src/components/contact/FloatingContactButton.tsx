/**
 * 浮动联系按钮组件
 */
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import {
  ChatBubbleLeftRightIcon,
  PhoneIcon,
  EnvelopeIcon,
  XMarkIcon,
  PlusIcon,
  DevicePhoneMobileIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

interface ContactOption {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  color: string;
  href?: string;
}

interface FloatingContactButtonProps {
  className?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  showOnScroll?: boolean;
  onInquiryClick?: () => void;
}

const FloatingContactButton: React.FC<FloatingContactButtonProps> = ({
  className,
  position = 'bottom-right',
  showOnScroll = true,
  onInquiryClick
}) => {
  const { t } = useTranslation('contact');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(!showOnScroll);

  // 监听滚动显示/隐藏按钮
  useEffect(() => {
    if (!showOnScroll) return;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsVisible(scrollY > 200);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [showOnScroll]);

  // 联系方式配置
  const contactOptions: ContactOption[] = [
    {
      id: 'inquiry',
      label: t('getQuote'),
      icon: ChatBubbleLeftRightIcon,
      action: () => {
        setIsExpanded(false);
        onInquiryClick?.();
      },
      color: 'bg-primary-600 hover:bg-primary-700',
    },
    {
      id: 'phone',
      label: t('callUs'),
      icon: PhoneIcon,
      action: () => {
        window.location.href = 'tel:+86-755-12345678';
        setIsExpanded(false);
      },
      color: 'bg-green-600 hover:bg-green-700',
      href: 'tel:+86-755-12345678',
    },
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      icon: DevicePhoneMobileIcon,
      action: () => {
        window.open('https://wa.me/8617512345678?text=Hello, I am interested in your LED display products', '_blank');
        setIsExpanded(false);
      },
      color: 'bg-green-500 hover:bg-green-600',
    },
    {
      id: 'wechat',
      label: t('wechat'),
      icon: ChatBubbleLeftRightIcon,
      action: () => {
        // 显示微信二维码或复制微信号
        navigator.clipboard?.writeText('lejin-led-official');
        alert(t('wechatCopied'));
        setIsExpanded(false);
      },
      color: 'bg-green-600 hover:bg-green-700',
    },
    {
      id: 'email',
      label: t('emailUs'),
      icon: EnvelopeIcon,
      action: () => {
        window.location.href = 'mailto:sales@lejin-led.com?subject=LED Display Inquiry';
        setIsExpanded(false);
      },
      color: 'bg-blue-600 hover:bg-blue-700',
      href: 'mailto:sales@lejin-led.com',
    },
  ];

  // 获取位置样式
  const getPositionStyles = () => {
    const baseStyles = 'fixed z-50';
    switch (position) {
      case 'bottom-right':
        return `${baseStyles} bottom-6 right-6`;
      case 'bottom-left':
        return `${baseStyles} bottom-6 left-6`;
      case 'top-right':
        return `${baseStyles} top-6 right-6`;
      case 'top-left':
        return `${baseStyles} top-6 left-6`;
      default:
        return `${baseStyles} bottom-6 right-6`;
    }
  };

  // 获取展开方向
  const getExpandDirection = () => {
    if (position.includes('bottom')) {
      return 'flex-col-reverse';
    }
    return 'flex-col';
  };

  if (!isVisible) return null;

  return (
    <div className={cn(getPositionStyles(), className)}>
      <div className={cn('flex items-end space-y-3', getExpandDirection())}>
        {/* 联系选项 */}
        {isExpanded && (
          <div className={cn(
            'flex space-y-3 transition-all duration-300 ease-in-out',
            getExpandDirection()
          )}>
            {contactOptions.map((option, index) => (
              <div
                key={option.id}
                className="transform transition-all duration-300 ease-in-out"
                style={{
                  transitionDelay: `${index * 50}ms`,
                  transform: isExpanded ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.8)',
                  opacity: isExpanded ? 1 : 0,
                }}
              >
                <button
                  onClick={option.action}
                  className={cn(
                    'flex items-center justify-center w-12 h-12 rounded-full text-white shadow-lg transition-all duration-200 hover:scale-110 hover:shadow-xl',
                    option.color
                  )}
                  title={option.label}
                  aria-label={option.label}
                >
                  <option.icon className="w-6 h-6" />
                </button>
                
                {/* 标签提示 */}
                <div className={cn(
                  'absolute whitespace-nowrap bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg pointer-events-none transition-opacity duration-200',
                  position.includes('right') ? 'right-14 top-1/2 -translate-y-1/2' : 'left-14 top-1/2 -translate-y-1/2',
                  'opacity-0 group-hover:opacity-100'
                )}>
                  {option.label}
                  <div className={cn(
                    'absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45',
                    position.includes('right') ? '-right-1' : '-left-1'
                  )} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 主按钮 */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            'flex items-center justify-center w-14 h-14 rounded-full text-white shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl',
            isExpanded 
              ? 'bg-red-600 hover:bg-red-700 rotate-45' 
              : 'bg-primary-600 hover:bg-primary-700'
          )}
          aria-label={isExpanded ? t('closeMenu') : t('openContactMenu')}
        >
          {isExpanded ? (
            <XMarkIcon className="w-7 h-7" />
          ) : (
            <PlusIcon className="w-7 h-7" />
          )}
        </button>
      </div>

      {/* 背景遮罩 */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black bg-opacity-20 -z-10"
          onClick={() => setIsExpanded(false)}
        />
      )}

      {/* 脉冲动画 */}
      {!isExpanded && (
        <div className="absolute inset-0 rounded-full bg-primary-600 animate-ping opacity-20" />
      )}
    </div>
  );
};

export default FloatingContactButton;