import React from 'react';
import { useRouter } from 'next/router';
import { SupportedLocale } from '@/lib/i18n';
import { i18nUtils } from '@/lib/i18n-config';

interface LocalizedDateTimeProps {
  date: Date | string;
  format?: 'short' | 'medium' | 'long' | 'full';
  timeStyle?: 'short' | 'medium' | 'long' | 'full';
  relative?: boolean;
  className?: string;
}

export const LocalizedDateTime: React.FC<LocalizedDateTimeProps> = ({
  date,
  format = 'medium',
  timeStyle,
  relative = false,
  className,
}) => {
  const router = useRouter();
  const locale = (router.locale || 'en') as SupportedLocale;
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (relative) {
    const formattedDate = i18nUtils.formatRelativeTime(dateObj, locale);
    return <time className={className} dateTime={dateObj.toISOString()}>{formattedDate}</time>;
  }

  const options: Intl.DateTimeFormatOptions = {
    dateStyle: format,
    timeStyle,
  };

  const formattedDate = i18nUtils.formatDate(dateObj, locale, options);

  return (
    <time className={className} dateTime={dateObj.toISOString()}>
      {formattedDate}
    </time>
  );
};

interface LocalizedNumberProps {
  value: number;
  style?: 'decimal' | 'currency' | 'percent';
  currency?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  className?: string;
}

export const LocalizedNumber: React.FC<LocalizedNumberProps> = ({
  value,
  style = 'decimal',
  currency,
  minimumFractionDigits,
  maximumFractionDigits,
  className,
}) => {
  const router = useRouter();
  const locale = (router.locale || 'en') as SupportedLocale;

  let formattedNumber: string;

  if (style === 'currency') {
    formattedNumber = i18nUtils.formatCurrency(value, locale);
  } else {
    const options: Intl.NumberFormatOptions = {
      style,
      minimumFractionDigits,
      maximumFractionDigits,
    };
    
    if (style === 'currency' && currency) {
      options.currency = currency;
    }

    formattedNumber = i18nUtils.formatNumber(value, locale, options);
  }

  return <span className={className}>{formattedNumber}</span>;
};

interface LocalizedCurrencyProps {
  amount: number;
  currency?: string;
  className?: string;
}

export const LocalizedCurrency: React.FC<LocalizedCurrencyProps> = ({
  amount,
  currency,
  className,
}) => {
  const router = useRouter();
  const locale = (router.locale || 'en') as SupportedLocale;

  const formattedAmount = currency 
    ? i18nUtils.formatNumber(amount, locale, { style: 'currency', currency })
    : i18nUtils.formatCurrency(amount, locale);

  return <span className={className}>{formattedAmount}</span>;
};

interface LocalizedPercentageProps {
  value: number;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  className?: string;
}

export const LocalizedPercentage: React.FC<LocalizedPercentageProps> = ({
  value,
  minimumFractionDigits = 0,
  maximumFractionDigits = 2,
  className,
}) => {
  const router = useRouter();
  const locale = (router.locale || 'en') as SupportedLocale;

  const formattedPercentage = i18nUtils.formatNumber(value / 100, locale, {
    style: 'percent',
    minimumFractionDigits,
    maximumFractionDigits,
  });

  return <span className={className}>{formattedPercentage}</span>;
};

export default LocalizedDateTime;