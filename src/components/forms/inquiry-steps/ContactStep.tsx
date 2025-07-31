/**
 * 联系人信息步骤
 */
import React from 'react';
import { useTranslation } from 'next-i18next';
import { Input, Select } from '@/components/ui/FormComponents';

interface ContactStepProps {
  formData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    jobTitle: string;
    department: string;
  };
  errors: Record<string, string>;
  onChange: (field: string, value: string) => void;
}

const ContactStep: React.FC<ContactStepProps> = ({
  formData,
  errors,
  onChange
}) => {
  const { t } = useTranslation('forms');

  const jobTitleOptions = [
    { value: '', label: t('selectJobTitle') },
    { value: 'CEO', label: 'CEO' },
    { value: 'CTO', label: 'CTO' },
    { value: 'Marketing Manager', label: t('marketingManager') },
    { value: 'Project Manager', label: t('projectManager') },
    { value: 'Technical Manager', label: t('technicalManager') },
    { value: 'Procurement Manager', label: t('procurementManager') },
    { value: 'Sales Manager', label: t('salesManager') },
    { value: 'Engineer', label: t('engineer') },
    { value: 'Designer', label: t('designer') },
    { value: 'Other', label: t('other') },
  ];

  const departmentOptions = [
    { value: '', label: t('selectDepartment') },
    { value: 'Marketing', label: t('marketing') },
    { value: 'Sales', label: t('sales') },
    { value: 'Engineering', label: t('engineering') },
    { value: 'IT', label: 'IT' },
    { value: 'Procurement', label: t('procurement') },
    { value: 'Operations', label: t('operations') },
    { value: 'Management', label: t('management') },
    { value: 'Other', label: t('other') },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label={t('firstName')}
          value={formData.firstName}
          onChange={(e) => onChange('firstName', e.target.value)}
          error={errors.firstName}
          required
          placeholder={t('enterFirstName')}
        />
        <Input
          label={t('lastName')}
          value={formData.lastName}
          onChange={(e) => onChange('lastName', e.target.value)}
          error={errors.lastName}
          required
          placeholder={t('enterLastName')}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label={t('email')}
          type="email"
          value={formData.email}
          onChange={(e) => onChange('email', e.target.value)}
          error={errors.email}
          required
          placeholder={t('enterEmail')}
        />
        <Input
          label={t('phone')}
          type="tel"
          value={formData.phone}
          onChange={(e) => onChange('phone', e.target.value)}
          error={errors.phone}
          placeholder={t('enterPhone')}
          helperText={t('includeCountryCode')}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label={t('jobTitle')}
          options={jobTitleOptions}
          value={formData.jobTitle}
          onChange={(e) => onChange('jobTitle', e.target.value)}
          error={errors.jobTitle}
        />
        <Select
          label={t('department')}
          options={departmentOptions}
          value={formData.department}
          onChange={(e) => onChange('department', e.target.value)}
          error={errors.department}
        />
      </div>
    </div>
  );
};

export default ContactStep;