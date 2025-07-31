/**
 * 多步骤询盘表单组件
 */
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { 
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  UserIcon,
  BuildingOfficeIcon,
  CubeIcon,
  DocumentTextIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { 
  InquiryCreateData,
  InquiryType,
  InquirySource,
  CustomerType,
  BudgetRange,
  ProjectTimeline
} from '@/types/inquiry';
import { validateInquiryCreateData } from '@/lib/inquiry-validation';
import ContactStep from './inquiry-steps/ContactStep';
import CompanyStep from './inquiry-steps/CompanyStep';
import ProductStep from './inquiry-steps/ProductStep';
import ProjectStep from './inquiry-steps/ProjectStep';
import SummaryStep from './inquiry-steps/SummaryStep';

// 步骤定义
interface FormStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  isCompleted: boolean;
  isActive: boolean;
}

// 表单数据接口
interface FormData {
  // 联系人信息
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  jobTitle: string;
  department: string;
  
  // 公司信息
  companyName: string;
  website: string;
  industry: string;
  companySize: string;
  country: string;
  state: string;
  city: string;
  address: string;
  postalCode: string;
  
  // 产品需求
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
  
  // 项目信息
  projectName: string;
  projectDescription: string;
  budgetRange: string;
  budgetCurrency: string;
  exactBudget: string;
  timeline: string;
  decisionMakers: string[];
  competitors: string[];
  previousExperience: boolean;
  
  // 询盘详情
  subject: string;
  message: string;
  customerType: string;
  urgency: string;
  preferredContactMethod: string;
  bestTimeToContact: string;
}

const MultiStepInquiryForm: React.FC = () => {
  const { t } = useTranslation('forms');
  const router = useRouter();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    jobTitle: '',
    department: '',
    companyName: '',
    website: '',
    industry: '',
    companySize: '',
    country: '',
    state: '',
    city: '',
    address: '',
    postalCode: '',
    productName: '',
    pixelPitch: '',
    screenWidth: '',
    screenHeight: '',
    screenUnit: 'mm',
    quantity: '',
    application: '',
    installationEnvironment: 'indoor',
    viewingDistanceMin: '',
    viewingDistanceMax: '',
    viewingDistanceUnit: 'm',
    specialRequirements: [],
    projectName: '',
    projectDescription: '',
    budgetRange: '',
    budgetCurrency: 'USD',
    exactBudget: '',
    timeline: '',
    decisionMakers: [],
    competitors: [],
    previousExperience: false,
    subject: '',
    message: '',
    customerType: CustomerType.END_USER,
    urgency: 'medium',
    preferredContactMethod: 'email',
    bestTimeToContact: 'business_hours',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  // 步骤配置
  const steps: FormStep[] = [
    {
      id: 'contact',
      title: t('contactInformation'),
      description: t('contactInformationDesc'),
      icon: UserIcon,
      isCompleted: completedSteps.has(0),
      isActive: currentStep === 0,
    },
    {
      id: 'company',
      title: t('companyInformation'),
      description: t('companyInformationDesc'),
      icon: BuildingOfficeIcon,
      isCompleted: completedSteps.has(1),
      isActive: currentStep === 1,
    },
    {
      id: 'product',
      title: t('productRequirements'),
      description: t('productRequirementsDesc'),
      icon: CubeIcon,
      isCompleted: completedSteps.has(2),
      isActive: currentStep === 2,
    },
    {
      id: 'project',
      title: t('projectDetails'),
      description: t('projectDetailsDesc'),
      icon: DocumentTextIcon,
      isCompleted: completedSteps.has(3),
      isActive: currentStep === 3,
    },
    {
      id: 'summary',
      title: t('reviewSubmit'),
      description: t('reviewSubmitDesc'),
      icon: SparklesIcon,
      isCompleted: completedSteps.has(4),
      isActive: currentStep === 4,
    },
  ];

  // 保存到localStorage
  useEffect(() => {
    const savedData = localStorage.getItem('inquiry-form-data');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setFormData(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Error loading saved form data:', error);
      }
    }
  }, []);

  // 自动保存
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      localStorage.setItem('inquiry-form-data', JSON.stringify(formData));
    }, 1000);
    
    return () => clearTimeout(timeoutId);
  }, [formData]);

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // 清除相关错误
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateCurrentStep = (): boolean => {
    const stepErrors: Record<string, string> = {};
    
    switch (currentStep) {
      case 0: // 联系人信息
        if (!formData.firstName.trim()) stepErrors.firstName = t('firstNameRequired');
        if (!formData.lastName.trim()) stepErrors.lastName = t('lastNameRequired');
        if (!formData.email.trim()) stepErrors.email = t('emailRequired');
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          stepErrors.email = t('emailInvalid');
        }
        break;
        
      case 1: // 公司信息
        if (!formData.companyName.trim()) stepErrors.companyName = t('companyNameRequired');
        if (!formData.country.trim()) stepErrors.country = t('countryRequired');
        break;
        
      case 2: // 产品需求
        if (!formData.application.trim()) stepErrors.application = t('applicationRequired');
        break;
        
      case 3: // 项目信息
        if (!formData.subject.trim()) stepErrors.subject = t('subjectRequired');
        if (!formData.message.trim()) stepErrors.message = t('messageRequired');
        break;
    }
    
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const nextStep = () => {
    if (validateCurrentStep()) {
      setCompletedSteps(prev => new Set([...prev, currentStep]));
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (stepIndex: number) => {
    if (stepIndex <= Math.max(...completedSteps) + 1) {
      setCurrentStep(stepIndex);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* 步骤指示器 */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <nav aria-label="Progress">
            <ol className="flex items-center justify-between">
              {steps.map((step, index) => (
                <li key={step.id} className="relative flex-1">
                  <button
                    onClick={() => goToStep(index)}
                    disabled={index > Math.max(...completedSteps) + 1}
                    className={cn(
                      'group flex flex-col items-center p-2 rounded-lg transition-colors',
                      step.isActive && 'bg-primary-50',
                      step.isCompleted && 'text-primary-600',
                      index > Math.max(...completedSteps) + 1 && 'cursor-not-allowed opacity-50'
                    )}
                  >
                    <div className={cn(
                      'flex items-center justify-center w-10 h-10 rounded-full border-2 mb-2',
                      step.isCompleted 
                        ? 'bg-primary-600 border-primary-600 text-white'
                        : step.isActive
                        ? 'border-primary-600 text-primary-600'
                        : 'border-gray-300 text-gray-500'
                    )}>
                      {step.isCompleted ? (
                        <CheckIcon className="w-5 h-5" />
                      ) : (
                        <step.icon className="w-5 h-5" />
                      )}
                    </div>
                    <span className={cn(
                      'text-xs font-medium text-center',
                      step.isActive ? 'text-primary-600' : 'text-gray-500'
                    )}>
                      {step.title}
                    </span>
                  </button>
                  
                  {/* 连接线 */}
                  {index < steps.length - 1 && (
                    <div className={cn(
                      'absolute top-5 left-full w-full h-0.5 -translate-y-1/2',
                      step.isCompleted ? 'bg-primary-600' : 'bg-gray-300'
                    )} />
                  )}
                </li>
              ))}
            </ol>
          </nav>
        </div>

        {/* 表单内容 */}
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {steps[currentStep].title}
            </h2>
            <p className="text-gray-600">
              {steps[currentStep].description}
            </p>
          </div>

          {/* 步骤内容 */}
          <form onSubmit={handleSubmit}>
            {currentStep === 0 && (
              <ContactStep
                formData={formData}
                errors={errors}
                onChange={updateFormData}
              />
            )}
            
            {currentStep === 1 && (
              <CompanyStep
                formData={formData}
                errors={errors}
                onChange={updateFormData}
              />
            )}
            
            {currentStep === 2 && (
              <ProductStep
                formData={formData}
                errors={errors}
                onChange={updateFormData}
              />
            )}
            
            {currentStep === 3 && (
              <ProjectStep
                formData={formData}
                errors={errors}
                onChange={updateFormData}
              />
            )}
            
            {currentStep === 4 && (
              <SummaryStep
                formData={formData}
                onEdit={goToStep}
              />
            )}

            {/* 表单操作按钮 */}
            <div className="flex items-center justify-between pt-8 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 0}
                leftIcon={<ChevronLeftIcon className="w-4 h-4" />}
              >
                {t('previous')}
              </Button>

              <div className="flex items-center space-x-4">
                {currentStep < steps.length - 1 ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    rightIcon={<ChevronRightIcon className="w-4 h-4" />}
                  >
                    {t('next')}
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    loading={isSubmitting}
                    className="bg-primary-600 hover:bg-primary-700"
                  >
                    {isSubmitting ? t('submitting') : t('submitInquiry')}
                  </Button>
                )}
              </div>
            </div>

            {/* 错误提示 */}
            {errors.submit && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-600">{errors.submit}</p>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );

  // 提交处理函数
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentStep < steps.length - 1) {
      nextStep();
      return;
    }

    setIsSubmitting(true);

    // 准备询盘数据
    const inquiryData: InquiryCreateData = {
      type: InquiryType.QUOTE_REQUEST,
      source: InquirySource.WEBSITE,
      contact: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone || undefined,
        jobTitle: formData.jobTitle || undefined,
        department: formData.department || undefined,
      },
      company: {
        name: formData.companyName,
        website: formData.website || undefined,
        industry: formData.industry || undefined,
        size: formData.companySize || undefined,
        country: formData.country,
        state: formData.state || undefined,
        city: formData.city || undefined,
        address: formData.address || undefined,
        postalCode: formData.postalCode || undefined,
      },
      customerType: formData.customerType as CustomerType,
      productRequirements: [{
        productName: formData.productName || undefined,
        pixelPitch: formData.pixelPitch || undefined,
        screenSize: formData.screenWidth && formData.screenHeight ? {
          width: parseFloat(formData.screenWidth),
          height: parseFloat(formData.screenHeight),
          unit: formData.screenUnit as any,
        } : undefined,
        quantity: formData.quantity ? parseInt(formData.quantity) : undefined,
        application: formData.application || undefined,
        installationEnvironment: formData.installationEnvironment as any,
        viewingDistance: formData.viewingDistanceMin && formData.viewingDistanceMax ? {
          min: parseFloat(formData.viewingDistanceMin),
          max: parseFloat(formData.viewingDistanceMax),
          unit: formData.viewingDistanceUnit as any,
        } : undefined,
        specialRequirements: formData.specialRequirements.length > 0 ? formData.specialRequirements : undefined,
      }],
      projectInfo: {
        name: formData.projectName || undefined,
        description: formData.projectDescription || undefined,
        budget: formData.budgetRange ? {
          range: formData.budgetRange as BudgetRange,
          currency: formData.budgetCurrency || undefined,
          exactAmount: formData.exactBudget ? parseFloat(formData.exactBudget) : undefined,
        } : undefined,
        timeline: formData.timeline as ProjectTimeline || undefined,
        decisionMakers: formData.decisionMakers.length > 0 ? formData.decisionMakers : undefined,
        competitors: formData.competitors.length > 0 ? formData.competitors : undefined,
        previousExperience: formData.previousExperience,
      },
      subject: formData.subject,
      message: formData.message,
      language: (router.locale || 'en') as 'en' | 'zh',
      tags: [
        formData.urgency,
        formData.preferredContactMethod,
        formData.bestTimeToContact,
      ].filter(Boolean),
    };

    // 验证数据
    const validationErrors = validateInquiryCreateData(inquiryData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      // 提交询盘
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(inquiryData),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // 清除保存的表单数据
          localStorage.removeItem('inquiry-form-data');
          // 跳转到感谢页面
          router.push('/thank-you');
        } else {
          throw new Error(result.error?.message || 'Failed to submit inquiry');
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to submit inquiry');
      }
    } catch (error) {
      console.error('Submission error:', error);
      setErrors({ submit: error instanceof Error ? error.message : 'Failed to submit inquiry' });
    } finally {
      setIsSubmitting(false);
    }
  };
};

export default MultiStepInquiryForm;