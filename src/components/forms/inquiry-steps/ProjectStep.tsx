/**
 * 项目详情步骤
 */
import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Input, Select, Textarea, Checkbox, Radio } from '@/components/ui/FormComponents';
import { Button } from '@/components/ui/Button';
import { BudgetRange, ProjectTimeline, CustomerType } from '@/types/inquiry';

interface ProjectStepProps {
  formData: {
    projectName: string;
    projectDescription: string;
    budgetRange: string;
    budgetCurrency: string;
    exactBudget: string;
    timeline: string;
    decisionMakers: string[];
    competitors: string[];
    previousExperience: boolean;
    subject: string;
    message: string;
    customerType: string;
    urgency: string;
    preferredContactMethod: string;
    bestTimeToContact: string;
  };
  errors: Record<string, string>;
  onChange: (field: string, value: any) => void;
}

const ProjectStep: React.FC<ProjectStepProps> = ({
  formData,
  errors,
  onChange
}) => {
  const { t } = useTranslation('forms');
  const [newDecisionMaker, setNewDecisionMaker] = useState('');
  const [newCompetitor, setNewCompetitor] = useState('');

  const budgetRangeOptions = [
    { value: '', label: t('selectBudgetRange') },
    { value: BudgetRange.UNDER_10K, label: t('under10k') },
    { value: BudgetRange.FROM_10K_TO_50K, label: t('10kTo50k') },
    { value: BudgetRange.FROM_50K_TO_100K, label: t('50kTo100k') },
    { value: BudgetRange.FROM_100K_TO_500K, label: t('100kTo500k') },
    { value: BudgetRange.OVER_500K, label: t('over500k') },
    { value: BudgetRange.NOT_SPECIFIED, label: t('notSpecified') },
  ];

  const currencyOptions = [
    { value: 'USD', label: 'USD ($)' },
    { value: 'EUR', label: 'EUR (€)' },
    { value: 'GBP', label: 'GBP (£)' },
    { value: 'CNY', label: 'CNY (¥)' },
    { value: 'JPY', label: 'JPY (¥)' },
    { value: 'KRW', label: 'KRW (₩)' },
    { value: 'AUD', label: 'AUD (A$)' },
    { value: 'CAD', label: 'CAD (C$)' },
  ];

  const timelineOptions = [
    { value: '', label: t('selectTimeline') },
    { value: ProjectTimeline.IMMEDIATE, label: t('immediate') },
    { value: ProjectTimeline.WITHIN_1_MONTH, label: t('within1Month') },
    { value: ProjectTimeline.WITHIN_3_MONTHS, label: t('within3Months') },
    { value: ProjectTimeline.WITHIN_6_MONTHS, label: t('within6Months') },
    { value: ProjectTimeline.OVER_6_MONTHS, label: t('over6Months') },
    { value: ProjectTimeline.NOT_SPECIFIED, label: t('notSpecified') },
  ];

  const customerTypeOptions = [
    { value: CustomerType.END_USER, label: t('endUser') },
    { value: CustomerType.INTEGRATOR, label: t('integrator') },
    { value: CustomerType.DISTRIBUTOR, label: t('distributor') },
    { value: CustomerType.RESELLER, label: t('reseller') },
    { value: CustomerType.RENTAL_COMPANY, label: t('rentalCompany') },
    { value: CustomerType.OTHER, label: t('other') },
  ];

  const urgencyOptions = [
    { value: 'low', label: t('lowUrgency') },
    { value: 'medium', label: t('mediumUrgency') },
    { value: 'high', label: t('highUrgency') },
    { value: 'urgent', label: t('urgent') },
  ];

  const contactMethodOptions = [
    { value: 'email', label: t('email') },
    { value: 'phone', label: t('phone') },
    { value: 'whatsapp', label: 'WhatsApp' },
    { value: 'wechat', label: t('wechat') },
    { value: 'video_call', label: t('videoCall') },
  ];

  const contactTimeOptions = [
    { value: 'business_hours', label: t('businessHours') },
    { value: 'morning', label: t('morning') },
    { value: 'afternoon', label: t('afternoon') },
    { value: 'evening', label: t('evening') },
    { value: 'anytime', label: t('anytime') },
  ];

  const addDecisionMaker = () => {
    if (newDecisionMaker.trim()) {
      const updated = [...formData.decisionMakers, newDecisionMaker.trim()];
      onChange('decisionMakers', updated);
      setNewDecisionMaker('');
    }
  };

  const removeDecisionMaker = (index: number) => {
    const updated = formData.decisionMakers.filter((_, i) => i !== index);
    onChange('decisionMakers', updated);
  };

  const addCompetitor = () => {
    if (newCompetitor.trim()) {
      const updated = [...formData.competitors, newCompetitor.trim()];
      onChange('competitors', updated);
      setNewCompetitor('');
    }
  };

  const removeCompetitor = (index: number) => {
    const updated = formData.competitors.filter((_, i) => i !== index);
    onChange('competitors', updated);
  };

  return (
    <div className="space-y-6">
      <Input
        label={t('projectName')}
        value={formData.projectName}
        onChange={(e) => onChange('projectName', e.target.value)}
        error={errors.projectName}
        placeholder={t('enterProjectName')}
        helperText={t('projectNameOptional')}
      />

      <Textarea
        label={t('projectDescription')}
        value={formData.projectDescription}
        onChange={(e) => onChange('projectDescription', e.target.value)}
        error={errors.projectDescription}
        rows={3}
        placeholder={t('enterProjectDescription')}
        helperText={t('projectDescriptionOptional')}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label={t('budgetRange')}
          options={budgetRangeOptions}
          value={formData.budgetRange}
          onChange={(e) => onChange('budgetRange', e.target.value)}
          error={errors.budgetRange}
        />
        <Select
          label={t('currency')}
          options={currencyOptions}
          value={formData.budgetCurrency}
          onChange={(e) => onChange('budgetCurrency', e.target.value)}
          error={errors.budgetCurrency}
        />
      </div>

      <Input
        label={t('exactBudget')}
        type="number"
        value={formData.exactBudget}
        onChange={(e) => onChange('exactBudget', e.target.value)}
        error={errors.exactBudget}
        placeholder={t('enterExactBudget')}
        helperText={t('exactBudgetOptional')}
        min="0"
      />

      <Select
        label={t('projectTimeline')}
        options={timelineOptions}
        value={formData.timeline}
        onChange={(e) => onChange('timeline', e.target.value)}
        error={errors.timeline}
      />

      <Select
        label={t('customerType')}
        options={customerTypeOptions}
        value={formData.customerType}
        onChange={(e) => onChange('customerType', e.target.value)}
        error={errors.customerType}
      />

      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">
          {t('decisionMakers')}
        </label>
        
        {formData.decisionMakers.length > 0 && (
          <div className="space-y-2">
            {formData.decisionMakers.map((maker, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                <span className="text-sm text-gray-700">{maker}</span>
                <button
                  type="button"
                  onClick={() => removeDecisionMaker(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
        
        <div className="flex gap-2">
          <Input
            value={newDecisionMaker}
            onChange={(e) => setNewDecisionMaker(e.target.value)}
            placeholder={t('enterDecisionMaker')}
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            onClick={addDecisionMaker}
            disabled={!newDecisionMaker.trim()}
          >
            <PlusIcon className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">
          {t('competitors')}
        </label>
        
        {formData.competitors.length > 0 && (
          <div className="space-y-2">
            {formData.competitors.map((competitor, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                <span className="text-sm text-gray-700">{competitor}</span>
                <button
                  type="button"
                  onClick={() => removeCompetitor(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
        
        <div className="flex gap-2">
          <Input
            value={newCompetitor}
            onChange={(e) => setNewCompetitor(e.target.value)}
            placeholder={t('enterCompetitor')}
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            onClick={addCompetitor}
            disabled={!newCompetitor.trim()}
          >
            <PlusIcon className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <Checkbox
        label={t('previousExperience')}
        checked={formData.previousExperience}
        onChange={(e) => onChange('previousExperience', e.target.checked)}
        helperText={t('previousExperienceHelp')}
      />

      <Input
        label={t('subject')}
        value={formData.subject}
        onChange={(e) => onChange('subject', e.target.value)}
        error={errors.subject}
        required
        placeholder={t('enterSubject')}
      />

      <Textarea
        label={t('message')}
        value={formData.message}
        onChange={(e) => onChange('message', e.target.value)}
        error={errors.message}
        required
        rows={6}
        placeholder={t('enterMessage')}
        helperText={t('messageHelp')}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('urgency')}
          </label>
          <div className="space-y-2">
            {urgencyOptions.map((option) => (
              <Radio
                key={option.value}
                name="urgency"
                value={option.value}
                checked={formData.urgency === option.value}
                onChange={(e) => onChange('urgency', e.target.value)}
                label={option.label}
              />
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('preferredContactMethod')}
          </label>
          <div className="space-y-2">
            {contactMethodOptions.map((option) => (
              <Radio
                key={option.value}
                name="contactMethod"
                value={option.value}
                checked={formData.preferredContactMethod === option.value}
                onChange={(e) => onChange('preferredContactMethod', e.target.value)}
                label={option.label}
              />
            ))}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('bestTimeToContact')}
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {contactTimeOptions.map((option) => (
            <Radio
              key={option.value}
              name="contactTime"
              value={option.value}
              checked={formData.bestTimeToContact === option.value}
              onChange={(e) => onChange('bestTimeToContact', e.target.value)}
              label={option.label}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectStep;