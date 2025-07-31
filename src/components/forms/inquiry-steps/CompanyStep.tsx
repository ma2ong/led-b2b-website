/**
 * 公司信息步骤
 */
import React from 'react';
import { useTranslation } from 'next-i18next';
import { Input, Select } from '@/components/ui/FormComponents';

interface CompanyStepProps {
  formData: {
    companyName: string;
    website: string;
    industry: string;
    companySize: string;
    country: string;
    state: string;
    city: string;
    address: string;
    postalCode: string;
  };
  errors: Record<string, string>;
  onChange: (field: string, value: string) => void;
}

const CompanyStep: React.FC<CompanyStepProps> = ({
  formData,
  errors,
  onChange
}) => {
  const { t } = useTranslation('forms');

  const industryOptions = [
    { value: '', label: t('selectIndustry') },
    { value: 'Retail', label: t('retail') },
    { value: 'Hospitality', label: t('hospitality') },
    { value: 'Transportation', label: t('transportation') },
    { value: 'Education', label: t('education') },
    { value: 'Healthcare', label: t('healthcare') },
    { value: 'Entertainment', label: t('entertainment') },
    { value: 'Corporate', label: t('corporate') },
    { value: 'Government', label: t('government') },
    { value: 'Sports', label: t('sports') },
    { value: 'Advertising', label: t('advertising') },
    { value: 'Broadcasting', label: t('broadcasting') },
    { value: 'Events', label: t('events') },
    { value: 'Other', label: t('other') },
  ];

  const companySizeOptions = [
    { value: '', label: t('selectCompanySize') },
    { value: '1-10', label: '1-10 ' + t('employees') },
    { value: '11-50', label: '11-50 ' + t('employees') },
    { value: '51-200', label: '51-200 ' + t('employees') },
    { value: '201-500', label: '201-500 ' + t('employees') },
    { value: '501-1000', label: '501-1000 ' + t('employees') },
    { value: '1000+', label: '1000+ ' + t('employees') },
  ];

  const countryOptions = [
    { value: '', label: t('selectCountry') },
    { value: 'United States', label: t('unitedStates') },
    { value: 'China', label: t('china') },
    { value: 'United Kingdom', label: t('unitedKingdom') },
    { value: 'Germany', label: t('germany') },
    { value: 'France', label: t('france') },
    { value: 'Japan', label: t('japan') },
    { value: 'South Korea', label: t('southKorea') },
    { value: 'Australia', label: t('australia') },
    { value: 'Canada', label: t('canada') },
    { value: 'India', label: t('india') },
    { value: 'Brazil', label: t('brazil') },
    { value: 'Mexico', label: t('mexico') },
    { value: 'Italy', label: t('italy') },
    { value: 'Spain', label: t('spain') },
    { value: 'Netherlands', label: t('netherlands') },
    { value: 'Other', label: t('other') },
  ];

  return (
    <div className="space-y-6">
      <Input
        label={t('companyName')}
        value={formData.companyName}
        onChange={(e) => onChange('companyName', e.target.value)}
        error={errors.companyName}
        required
        placeholder={t('enterCompanyName')}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label={t('website')}
          type="url"
          value={formData.website}
          onChange={(e) => onChange('website', e.target.value)}
          error={errors.website}
          placeholder="https://example.com"
        />
        <Select
          label={t('industry')}
          options={industryOptions}
          value={formData.industry}
          onChange={(e) => onChange('industry', e.target.value)}
          error={errors.industry}
        />
      </div>

      <Select
        label={t('companySize')}
        options={companySizeOptions}
        value={formData.companySize}
        onChange={(e) => onChange('companySize', e.target.value)}
        error={errors.companySize}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label={t('country')}
          options={countryOptions}
          value={formData.country}
          onChange={(e) => onChange('country', e.target.value)}
          error={errors.country}
          required
        />
        <Input
          label={t('state')}
          value={formData.state}
          onChange={(e) => onChange('state', e.target.value)}
          error={errors.state}
          placeholder={t('enterState')}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label={t('city')}
          value={formData.city}
          onChange={(e) => onChange('city', e.target.value)}
          error={errors.city}
          placeholder={t('enterCity')}
        />
        <Input
          label={t('postalCode')}
          value={formData.postalCode}
          onChange={(e) => onChange('postalCode', e.target.value)}
          error={errors.postalCode}
          placeholder={t('enterPostalCode')}
        />
      </div>

      <Input
        label={t('address')}
        value={formData.address}
        onChange={(e) => onChange('address', e.target.value)}
        error={errors.address}
        placeholder={t('enterAddress')}
        helperText={t('addressOptional')}
      />
    </div>
  );
};

export default CompanyStep;