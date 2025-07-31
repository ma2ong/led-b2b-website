/**
 * 产品需求步骤
 */
import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Input, Select, Textarea, Checkbox } from '@/components/ui/FormComponents';
import { Button } from '@/components/ui/Button';

interface ProductStepProps {
  formData: {
    productName: string;
    pixelPitch: string;
    screenWidth: string;
    screenHeight: string;
    screenUnit: string;
    quantity: string;
    application: string;
    installationEnvironment: string;
    viewingDistanceMin: string;
    viewingDistanceMax: string;
    viewingDistanceUnit: string;
    specialRequirements: string[];
  };
  errors: Record<string, string>;
  onChange: (field: string, value: any) => void;
}

const ProductStep: React.FC<ProductStepProps> = ({
  formData,
  errors,
  onChange
}) => {
  const { t } = useTranslation('forms');
  const [newRequirement, setNewRequirement] = useState('');

  const pixelPitchOptions = [
    { value: '', label: t('selectPixelPitch') },
    { value: 'P0.9', label: 'P0.9' },
    { value: 'P1.25', label: 'P1.25' },
    { value: 'P1.56', label: 'P1.56' },
    { value: 'P1.86', label: 'P1.86' },
    { value: 'P2', label: 'P2' },
    { value: 'P2.5', label: 'P2.5' },
    { value: 'P3', label: 'P3' },
    { value: 'P4', label: 'P4' },
    { value: 'P5', label: 'P5' },
    { value: 'P6', label: 'P6' },
    { value: 'P8', label: 'P8' },
    { value: 'P10', label: 'P10' },
    { value: 'Other', label: t('other') },
  ];

  const screenUnitOptions = [
    { value: 'mm', label: 'mm' },
    { value: 'cm', label: 'cm' },
    { value: 'm', label: 'm' },
    { value: 'inch', label: 'inch' },
    { value: 'ft', label: 'ft' },
  ];

  const installationOptions = [
    { value: 'indoor', label: t('indoor') },
    { value: 'outdoor', label: t('outdoor') },
    { value: 'semi_outdoor', label: t('semiOutdoor') },
  ];

  const viewingDistanceUnitOptions = [
    { value: 'm', label: t('meters') },
    { value: 'ft', label: t('feet') },
  ];

  const applicationOptions = [
    { value: '', label: t('selectApplication') },
    { value: 'Conference Room', label: t('conferenceRoom') },
    { value: 'Retail Store', label: t('retailStore') },
    { value: 'Shopping Mall', label: t('shoppingMall') },
    { value: 'Outdoor Advertising', label: t('outdoorAdvertising') },
    { value: 'Sports Stadium', label: t('sportsStadium') },
    { value: 'Concert Hall', label: t('concertHall') },
    { value: 'Broadcast Studio', label: t('broadcastStudio') },
    { value: 'Control Room', label: t('controlRoom') },
    { value: 'Airport', label: t('airport') },
    { value: 'Train Station', label: t('trainStation') },
    { value: 'Hotel Lobby', label: t('hotelLobby') },
    { value: 'Restaurant', label: t('restaurant') },
    { value: 'Church', label: t('church') },
    { value: 'School', label: t('school') },
    { value: 'Hospital', label: t('hospital') },
    { value: 'Other', label: t('other') },
  ];

  const addSpecialRequirement = () => {
    if (newRequirement.trim()) {
      const updatedRequirements = [...formData.specialRequirements, newRequirement.trim()];
      onChange('specialRequirements', updatedRequirements);
      setNewRequirement('');
    }
  };

  const removeSpecialRequirement = (index: number) => {
    const updatedRequirements = formData.specialRequirements.filter((_, i) => i !== index);
    onChange('specialRequirements', updatedRequirements);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label={t('productName')}
          value={formData.productName}
          onChange={(e) => onChange('productName', e.target.value)}
          error={errors.productName}
          placeholder={t('enterProductName')}
          helperText={t('productNameOptional')}
        />
        <Select
          label={t('pixelPitch')}
          options={pixelPitchOptions}
          value={formData.pixelPitch}
          onChange={(e) => onChange('pixelPitch', e.target.value)}
          error={errors.pixelPitch}
        />
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">
          {t('screenSize')}
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label={t('width')}
            type="number"
            value={formData.screenWidth}
            onChange={(e) => onChange('screenWidth', e.target.value)}
            error={errors.screenWidth}
            placeholder="1920"
            min="1"
          />
          <Input
            label={t('height')}
            type="number"
            value={formData.screenHeight}
            onChange={(e) => onChange('screenHeight', e.target.value)}
            error={errors.screenHeight}
            placeholder="1080"
            min="1"
          />
          <Select
            label={t('unit')}
            options={screenUnitOptions}
            value={formData.screenUnit}
            onChange={(e) => onChange('screenUnit', e.target.value)}
            error={errors.screenUnit}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label={t('quantity')}
          type="number"
          value={formData.quantity}
          onChange={(e) => onChange('quantity', e.target.value)}
          error={errors.quantity}
          placeholder="1"
          min="1"
        />
        <Select
          label={t('installationEnvironment')}
          options={installationOptions}
          value={formData.installationEnvironment}
          onChange={(e) => onChange('installationEnvironment', e.target.value)}
          error={errors.installationEnvironment}
        />
      </div>

      <Select
        label={t('application')}
        options={applicationOptions}
        value={formData.application}
        onChange={(e) => onChange('application', e.target.value)}
        error={errors.application}
        required
      />

      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">
          {t('viewingDistance')}
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label={t('minimum')}
            type="number"
            value={formData.viewingDistanceMin}
            onChange={(e) => onChange('viewingDistanceMin', e.target.value)}
            error={errors.viewingDistanceMin}
            placeholder="2"
            min="0.1"
            step="0.1"
          />
          <Input
            label={t('maximum')}
            type="number"
            value={formData.viewingDistanceMax}
            onChange={(e) => onChange('viewingDistanceMax', e.target.value)}
            error={errors.viewingDistanceMax}
            placeholder="10"
            min="0.1"
            step="0.1"
          />
          <Select
            label={t('unit')}
            options={viewingDistanceUnitOptions}
            value={formData.viewingDistanceUnit}
            onChange={(e) => onChange('viewingDistanceUnit', e.target.value)}
            error={errors.viewingDistanceUnit}
          />
        </div>
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">
          {t('specialRequirements')}
        </label>
        
        {formData.specialRequirements.length > 0 && (
          <div className="space-y-2">
            {formData.specialRequirements.map((requirement, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                <span className="text-sm text-gray-700">{requirement}</span>
                <button
                  type="button"
                  onClick={() => removeSpecialRequirement(index)}
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
            value={newRequirement}
            onChange={(e) => setNewRequirement(e.target.value)}
            placeholder={t('enterSpecialRequirement')}
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            onClick={addSpecialRequirement}
            disabled={!newRequirement.trim()}
          >
            <PlusIcon className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductStep;