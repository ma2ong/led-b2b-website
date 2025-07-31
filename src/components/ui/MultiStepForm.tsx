import React, { useState, useCallback, createContext, useContext } from 'react';
import { cn } from '@/lib/utils';
import { ChevronLeftIcon, ChevronRightIcon, CheckIcon } from '@heroicons/react/24/outline';
import Button from './Button';

// 多步骤表单上下文类型
interface MultiStepFormContextType {
  currentStep: number;
  totalSteps: number;
  isFirstStep: boolean;
  isLastStep: boolean;
  canGoNext: boolean;
  canGoPrevious: boolean;
  goToStep: (step: number) => void;
  nextStep: () => void;
  previousStep: () => void;
  setStepValid: (step: number, isValid: boolean) => void;
  getStepStatus: (step: number) => 'pending' | 'current' | 'completed' | 'error';
}

// 步骤配置类型
interface StepConfig {
  id: string;
  title: string;
  description?: string;
  optional?: boolean;
  validate?: () => boolean | Promise<boolean>;
}

// 多步骤表单属性
interface MultiStepFormProps {
  steps: StepConfig[];
  currentStep?: number;
  onStepChange?: (step: number) => void;
  onComplete?: () => void;
  showStepNumbers?: boolean;
  showProgressBar?: boolean;
  allowSkipSteps?: boolean;
  className?: string;
  children: React.ReactNode;
}

// 步骤组件属性
interface StepProps {
  stepId: string;
  children: React.ReactNode;
  className?: string;
}

// 步骤导航属性
interface StepNavigationProps {
  showPrevious?: boolean;
  showNext?: boolean;
  previousLabel?: string;
  nextLabel?: string;
  completeLabel?: string;
  onPrevious?: () => void;
  onNext?: () => void;
  onComplete?: () => void;
  className?: string;
}

const MultiStepFormContext = createContext<MultiStepFormContextType | null>(null);

export const useMultiStepForm = () => {
  const context = useContext(MultiStepFormContext);
  if (!context) {
    throw new Error('useMultiStepForm must be used within a MultiStepForm');
  }
  return context;
};

const MultiStepForm: React.FC<MultiStepFormProps> = ({
  steps,
  currentStep: initialStep = 0,
  onStepChange,
  onComplete,
  showStepNumbers = true,
  showProgressBar = true,
  allowSkipSteps = false,
  className,
  children,
}) => {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [stepValidation, setStepValidation] = useState<Record<number, boolean>>({});
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const totalSteps = steps.length;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  const goToStep = useCallback((step: number) => {
    if (step >= 0 && step < totalSteps) {
      // 如果不允许跳过步骤，检查前面的步骤是否都已完成
      if (!allowSkipSteps && step > currentStep) {
        for (let i = currentStep; i < step; i++) {
          if (!completedSteps.has(i) && !steps[i].optional) {
            return; // 不能跳过未完成的必需步骤
          }
        }
      }
      
      setCurrentStep(step);
      onStepChange?.(step);
    }
  }, [totalSteps, allowSkipSteps, currentStep, completedSteps, steps, onStepChange]);

  const nextStep = useCallback(async () => {
    if (isLastStep) {
      onComplete?.();
      return;
    }

    // 验证当前步骤
    const currentStepConfig = steps[currentStep];
    if (currentStepConfig.validate) {
      const isValid = await currentStepConfig.validate();
      if (!isValid) {
        return;
      }
    }

    // 标记当前步骤为已完成
    setCompletedSteps(prev => new Set([...prev, currentStep]));
    
    goToStep(currentStep + 1);
  }, [isLastStep, currentStep, steps, onComplete, goToStep]);

  const previousStep = useCallback(() => {
    if (!isFirstStep) {
      goToStep(currentStep - 1);
    }
  }, [isFirstStep, currentStep, goToStep]);

  const setStepValid = useCallback((step: number, isValid: boolean) => {
    setStepValidation(prev => ({ ...prev, [step]: isValid }));
  }, []);

  const getStepStatus = useCallback((step: number): 'pending' | 'current' | 'completed' | 'error' => {
    if (step === currentStep) return 'current';
    if (completedSteps.has(step)) return 'completed';
    if (stepValidation[step] === false) return 'error';
    return 'pending';
  }, [currentStep, completedSteps, stepValidation]);

  const canGoNext = stepValidation[currentStep] !== false;
  const canGoPrevious = !isFirstStep;

  const contextValue: MultiStepFormContextType = {
    currentStep,
    totalSteps,
    isFirstStep,
    isLastStep,
    canGoNext,
    canGoPrevious,
    goToStep,
    nextStep,
    previousStep,
    setStepValid,
    getStepStatus,
  };

  const progressPercentage = ((currentStep + 1) / totalSteps) * 100;

  return (
    <MultiStepFormContext.Provider value={contextValue}>
      <div className={cn('space-y-6', className)}>
        {/* 步骤指示器 */}
        <div className="space-y-4">
          {showProgressBar && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          )}
          
          <nav aria-label="Progress">
            <ol className="flex items-center justify-between">
              {steps.map((step, index) => {
                const status = getStepStatus(index);
                const isCurrent = index === currentStep;
                const isCompleted = status === 'completed';
                const hasError = status === 'error';
                
                return (
                  <li key={step.id} className="flex items-center">
                    <button
                      onClick={() => goToStep(index)}
                      disabled={!allowSkipSteps && index > currentStep && !completedSteps.has(index - 1)}
                      className={cn(
                        'flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all',
                        isCurrent && 'border-primary-600 bg-primary-600 text-white',
                        isCompleted && 'border-green-600 bg-green-600 text-white',
                        hasError && 'border-red-600 bg-red-600 text-white',
                        !isCurrent && !isCompleted && !hasError && 'border-gray-300 bg-white text-gray-500',
                        'hover:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2'
                      )}
                      aria-current={isCurrent ? 'step' : undefined}
                    >
                      {isCompleted ? (
                        <CheckIcon className="w-5 h-5" />
                      ) : showStepNumbers ? (
                        <span className="text-sm font-medium">{index + 1}</span>
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-current" />
                      )}
                    </button>
                    
                    <div className="ml-3 min-w-0 flex-1">
                      <p className={cn(
                        'text-sm font-medium',
                        isCurrent && 'text-primary-600',
                        isCompleted && 'text-green-600',
                        hasError && 'text-red-600',
                        !isCurrent && !isCompleted && !hasError && 'text-gray-500'
                      )}>
                        {step.title}
                        {step.optional && (
                          <span className="ml-1 text-xs text-gray-400">(Optional)</span>
                        )}
                      </p>
                      {step.description && (
                        <p className="text-xs text-gray-500">{step.description}</p>
                      )}
                    </div>
                    
                    {index < steps.length - 1 && (
                      <div className="hidden sm:block w-5 h-px bg-gray-300 mx-4" />
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>
        </div>

        {/* 步骤内容 */}
        <div className="min-h-[400px]">
          {children}
        </div>
      </div>
    </MultiStepFormContext.Provider>
  );
};

// 步骤组件
export const Step: React.FC<StepProps> = ({ stepId, children, className }) => {
  const { currentStep } = useMultiStepForm();
  const stepIndex = parseInt(stepId) || 0;
  
  if (stepIndex !== currentStep) {
    return null;
  }

  return (
    <div className={cn('space-y-6', className)} role="tabpanel" aria-labelledby={`step-${stepId}`}>
      {children}
    </div>
  );
};

// 步骤导航组件
export const StepNavigation: React.FC<StepNavigationProps> = ({
  showPrevious = true,
  showNext = true,
  previousLabel = 'Previous',
  nextLabel = 'Next',
  completeLabel = 'Complete',
  onPrevious,
  onNext,
  onComplete,
  className,
}) => {
  const {
    isFirstStep,
    isLastStep,
    canGoNext,
    canGoPrevious,
    previousStep,
    nextStep,
  } = useMultiStepForm();

  const handlePrevious = () => {
    onPrevious?.();
    previousStep();
  };

  const handleNext = () => {
    onNext?.();
    nextStep();
  };

  const handleComplete = () => {
    onComplete?.();
    nextStep();
  };

  return (
    <div className={cn('flex justify-between pt-6 border-t border-gray-200', className)}>
      <div>
        {showPrevious && !isFirstStep && (
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={!canGoPrevious}
            leftIcon={<ChevronLeftIcon className="w-4 h-4" />}
          >
            {previousLabel}
          </Button>
        )}
      </div>
      
      <div>
        {showNext && (
          <Button
            variant="primary"
            onClick={isLastStep ? handleComplete : handleNext}
            disabled={!canGoNext}
            rightIcon={!isLastStep ? <ChevronRightIcon className="w-4 h-4" /> : undefined}
          >
            {isLastStep ? completeLabel : nextLabel}
          </Button>
        )}
      </div>
    </div>
  );
};

export default MultiStepForm;