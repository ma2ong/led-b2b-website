/**
 * 总结和提交步骤
 */
import React from 'react';
import { useTranslation } from 'next-i18next';
import { 
  UserIcon,
  BuildingOfficeIcon,
  CubeIcon,
  DocumentTextIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface SummaryStepProps {
  formData: any;
  onEdit: (step: number) => void;
}

const SummaryStep: React.FC<SummaryStepProps> = ({
  formData,
  onEdit
}) => {
  const { t } = useTranslation('forms');

  const sections = [
    {
      title: t('contactInformation'),
      icon: UserIcon,
      stepIndex: 0,
      items: [
        { label: t('name'), value: `${formData.firstName} ${formData.lastName}` },
        { label: t('email'), value: formData.email },
        { label: t('phone'), value: formData.phone || t('notProvided') },
        { label: t('jobTitle'), value: formData.jobTitle || t('notProvided') },
        { label: t('department'), value: formData.department || t('notProvided') },
      ],
    },
    {
      title: t('companyInformation'),
      icon: BuildingOfficeIcon,
      stepIndex: 1,
      items: [
        { label: t('companyName'), value: formData.companyName },
        { label: t('website'), value: formData.website || t('notProvided') },
        { label: t('industry'), value: formData.industry || t('notProvided') },
        { label: t('companySize'), value: formData.companySize || t('notProvided') },
        { label: t('location'), value: `${formData.city || ''} ${formData.state || ''} ${formData.country}`.trim() },
      ],
    },
    {
      title: t('productRequirements'),
      icon: CubeIcon,
      stepIndex: 2,
      items: [
        { label: t('productName'), value: formData.productName || t('notSpecified') },
        { label: t('pixelPitch'), value: formData.pixelPitch || t('notSpecified') },
        { 
          label: t('screenSize'), 
          value: formData.screenWidth && formData.screenHeight 
            ? `${formData.screenWidth} × ${formData.screenHeight} ${formData.screenUnit}`
            : t('notSpecified')
        },
        { label: t('quantity'), value: formData.quantity || t('notSpecified') },
        { label: t('application'), value: formData.application },
        { label: t('installationEnvironment'), value: formData.installationEnvironment },
        { 
          label: t('viewingDistance'), 
          value: formData.viewingDistanceMin && formData.viewingDistanceMax
            ? `${formData.viewingDistanceMin} - ${formData.viewingDistanceMax} ${formData.viewingDistanceUnit}`
            : t('notSpecified')
        },
        { 
          label: t('specialRequirements'), 
          value: formData.specialRequirements.length > 0 
            ? formData.specialRequirements.join(', ')
            : t('none')
        },
      ],
    },
    {
      title: t('projectDetails'),
      icon: DocumentTextIcon,
      stepIndex: 3,
      items: [
        { label: t('projectName'), value: formData.projectName || t('notProvided') },
        { label: t('budgetRange'), value: formData.budgetRange || t('notSpecified') },
        { label: t('timeline'), value: formData.timeline || t('notSpecified') },
        { label: t('customerType'), value: formData.customerType },
        { label: t('urgency'), value: formData.urgency },
        { label: t('preferredContactMethod'), value: formData.preferredContactMethod },
        { label: t('bestTimeToContact'), value: formData.bestTimeToContact },
        { 
          label: t('decisionMakers'), 
          value: formData.decisionMakers.length > 0 
            ? formData.decisionMakers.join(', ')
            : t('notProvided')
        },
        { 
          label: t('competitors'), 
          value: formData.competitors.length > 0 
            ? formData.competitors.join(', ')
            : t('notProvided')
        },
        { label: t('previousExperience'), value: formData.previousExperience ? t('yes') : t('no') },
      ],
    },
  ];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {t('reviewYourInformation')}
        </h3>
        <p className="text-gray-600">
          {t('reviewInformationDesc')}
        </p>
      </div>

      {sections.map((section) => (
        <div key={section.title} className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <section.icon className="w-5 h-5 text-primary-600 mr-2" />
              <h4 className="text-lg font-semibold text-gray-900">
                {section.title}
              </h4>
            </div>
            <button
              type="button"
              onClick={() => onEdit(section.stepIndex)}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              {t('edit')}
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {section.items.map((item) => (
              <div key={item.label}>
                <dt className="text-sm font-medium text-gray-500">
                  {item.label}
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {item.value}
                </dd>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-blue-900 mb-2">
          {t('inquiryMessage')}
        </h4>
        <div className="space-y-2">
          <div>
            <span className="text-sm font-medium text-blue-700">{t('subject')}:</span>
            <span className="ml-2 text-sm text-blue-900">{formData.subject}</span>
          </div>
          <div>
            <span className="text-sm font-medium text-blue-700">{t('message')}:</span>
            <p className="mt-1 text-sm text-blue-900 whitespace-pre-wrap">
              {formData.message}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <CheckCircleIcon className="h-5 w-5 text-yellow-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              {t('beforeSubmitting')}
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <ul className="list-disc list-inside space-y-1">
                <li>{t('reviewAllInformation')}</li>
                <li>{t('ensureContactDetails')}</li>
                <li>{t('checkRequirements')}</li>
                <li>{t('expectResponse')}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryStep;