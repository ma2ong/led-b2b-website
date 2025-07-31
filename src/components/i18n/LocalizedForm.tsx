import React from 'react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { SupportedLocale } from '@/lib/i18n';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';
import { Button } from '@/components/ui/Button';

interface LocalizedInputProps extends React.ComponentProps<typeof Input> {
  labelKey: string;
  placeholderKey?: string;
  helperTextKey?: string;
  errorKey?: string;
  namespace?: string;
}

export const LocalizedInput: React.FC<LocalizedInputProps> = ({
  labelKey,
  placeholderKey,
  helperTextKey,
  errorKey,
  namespace = 'forms',
  ...props
}) => {
  const { t } = useTranslation(namespace);

  return (
    <Input
      {...props}
      label={t(labelKey)}
      placeholder={placeholderKey ? t(placeholderKey) : undefined}
      helperText={helperTextKey ? t(helperTextKey) : undefined}
      error={errorKey ? t(errorKey) : undefined}
    />
  );
};

interface LocalizedTextareaProps extends React.ComponentProps<typeof Textarea> {
  labelKey: string;
  placeholderKey?: string;
  helperTextKey?: string;
  errorKey?: string;
  namespace?: string;
}

export const LocalizedTextarea: React.FC<LocalizedTextareaProps> = ({
  labelKey,
  placeholderKey,
  helperTextKey,
  errorKey,
  namespace = 'forms',
  ...props
}) => {
  const { t } = useTranslation(namespace);

  return (
    <Textarea
      {...props}
      label={t(labelKey)}
      placeholder={placeholderKey ? t(placeholderKey) : undefined}
      helperText={helperTextKey ? t(helperTextKey) : undefined}
      error={errorKey ? t(errorKey) : undefined}
    />
  );
};

interface LocalizedSelectProps extends React.ComponentProps<typeof Select> {
  labelKey: string;
  placeholderKey?: string;
  helperTextKey?: string;
  errorKey?: string;
  optionsKey?: string;
  namespace?: string;
}

export const LocalizedSelect: React.FC<LocalizedSelectProps> = ({
  labelKey,
  placeholderKey,
  helperTextKey,
  errorKey,
  optionsKey,
  namespace = 'forms',
  options,
  ...props
}) => {
  const { t } = useTranslation(namespace);

  // If optionsKey is provided, translate the options
  const translatedOptions = optionsKey 
    ? options?.map(option => ({
        ...option,
        label: t(`${optionsKey}.${option.value}`, option.label),
      }))
    : options;

  return (
    <Select
      {...props}
      options={translatedOptions || []}
      label={t(labelKey)}
      placeholder={placeholderKey ? t(placeholderKey) : undefined}
      helperText={helperTextKey ? t(helperTextKey) : undefined}
      error={errorKey ? t(errorKey) : undefined}
    />
  );
};

interface LocalizedCheckboxProps extends React.ComponentProps<typeof Checkbox> {
  labelKey: string;
  errorKey?: string;
  namespace?: string;
}

export const LocalizedCheckbox: React.FC<LocalizedCheckboxProps> = ({
  labelKey,
  errorKey,
  namespace = 'forms',
  ...props
}) => {
  const { t } = useTranslation(namespace);

  return (
    <Checkbox
      {...props}
      label={t(labelKey)}
      error={errorKey ? t(errorKey) : undefined}
    />
  );
};

interface LocalizedButtonProps extends React.ComponentProps<typeof Button> {
  textKey: string;
  namespace?: string;
}

export const LocalizedButton: React.FC<LocalizedButtonProps> = ({
  textKey,
  namespace = 'common',
  children,
  ...props
}) => {
  const { t } = useTranslation(namespace);

  return (
    <Button {...props}>
      {children || t(textKey)}
    </Button>
  );
};

// Country/Region selector with localized names
interface CountryOption {
  code: string;
  nameKey: string;
  flag?: string;
}

interface LocalizedCountrySelectProps extends Omit<LocalizedSelectProps, 'options'> {
  countries?: CountryOption[];
}

export const LocalizedCountrySelect: React.FC<LocalizedCountrySelectProps> = ({
  countries = [],
  namespace = 'common',
  ...props
}) => {
  const { t } = useTranslation(namespace);
  const router = useRouter();
  const locale = (router.locale || 'en') as SupportedLocale;

  // Default countries if none provided
  const defaultCountries: CountryOption[] = [
    { code: 'US', nameKey: 'countries.us', flag: '🇺🇸' },
    { code: 'CN', nameKey: 'countries.cn', flag: '🇨🇳' },
    { code: 'GB', nameKey: 'countries.gb', flag: '🇬🇧' },
    { code: 'DE', nameKey: 'countries.de', flag: '🇩🇪' },
    { code: 'FR', nameKey: 'countries.fr', flag: '🇫🇷' },
    { code: 'JP', nameKey: 'countries.jp', flag: '🇯🇵' },
    { code: 'KR', nameKey: 'countries.kr', flag: '🇰🇷' },
    { code: 'AU', nameKey: 'countries.au', flag: '🇦🇺' },
    { code: 'CA', nameKey: 'countries.ca', flag: '🇨🇦' },
    { code: 'IN', nameKey: 'countries.in', flag: '🇮🇳' },
  ];

  const countryList = countries.length > 0 ? countries : defaultCountries;

  const options = countryList.map(country => ({
    value: country.code,
    label: `${country.flag || ''} ${t(country.nameKey, country.code)}`.trim(),
  }));

  return (
    <LocalizedSelect
      {...props}
      options={options}
      namespace={namespace}
    />
  );
};

// Language selector component
interface LocalizedLanguageSelectProps extends Omit<LocalizedSelectProps, 'options'> {
  showFlags?: boolean;
}

export const LocalizedLanguageSelect: React.FC<LocalizedLanguageSelectProps> = ({
  showFlags = true,
  namespace = 'common',
  ...props
}) => {
  const { t } = useTranslation(namespace);

  const options = [
    {
      value: 'en',
      label: showFlags ? '🇺🇸 English' : 'English',
    },
    {
      value: 'zh',
      label: showFlags ? '🇨🇳 中文' : '中文',
    },
  ];

  return (
    <LocalizedSelect
      {...props}
      options={options}
      namespace={namespace}
    />
  );
};

// Time zone selector
interface LocalizedTimezoneSelectProps extends Omit<LocalizedSelectProps, 'options'> {
  regions?: string[];
}

export const LocalizedTimezoneSelect: React.FC<LocalizedTimezoneSelectProps> = ({
  regions = ['America', 'Europe', 'Asia', 'Australia'],
  namespace = 'common',
  ...props
}) => {
  const { t } = useTranslation(namespace);

  // Get timezone options based on Intl.supportedValuesOf if available
  const getTimezoneOptions = () => {
    const timezones: string[] = [];
    
    // Fallback list of common timezones
    const commonTimezones = [
      'America/New_York',
      'America/Los_Angeles',
      'America/Chicago',
      'Europe/London',
      'Europe/Paris',
      'Europe/Berlin',
      'Asia/Shanghai',
      'Asia/Tokyo',
      'Asia/Seoul',
      'Australia/Sydney',
    ];

    try {
      // Use Intl.supportedValuesOf if available (newer browsers)
      if ('supportedValuesOf' in Intl) {
        const allTimezones = (Intl as any).supportedValuesOf('timeZone');
        timezones.push(...allTimezones.filter((tz: string) => 
          regions.some(region => tz.startsWith(region))
        ));
      } else {
        timezones.push(...commonTimezones);
      }
    } catch {
      timezones.push(...commonTimezones);
    }

    return timezones.map(tz => ({
      value: tz,
      label: tz.replace(/_/g, ' '),
    }));
  };

  const options = getTimezoneOptions();

  return (
    <LocalizedSelect
      {...props}
      options={options}
      namespace={namespace}
    />
  );
};

export default {
  LocalizedInput,
  LocalizedTextarea,
  LocalizedSelect,
  LocalizedCheckbox,
  LocalizedButton,
  LocalizedCountrySelect,
  LocalizedLanguageSelect,
  LocalizedTimezoneSelect,
};