// Multi-step Form Wizard Component with navigation and progress tracking
'use client';

import React, { useState, useCallback, ReactNode, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Check, AlertCircle } from 'lucide-react';
import Button from '../ui/Button';

// Utility function for combining class names
function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

// Wizard step interface
export interface WizardStep {
  id: string;
  title: string;
  description?: string;
  component: ReactNode;
  validation?: () => Promise<boolean> | boolean;
  optional?: boolean;
}

// Wizard context interface
interface WizardContextType {
  currentStep: number;
  steps: WizardStep[];
  isFirstStep: boolean;
  isLastStep: boolean;
  canGoNext: boolean;
  canGoPrevious: boolean;
  goToStep: (step: number) => void;
  nextStep: () => Promise<void>;
  previousStep: () => void;
  data: Record<string, any>;
  updateData: (key: string, value: any) => void;
  setStepData: (stepId: string, data: any) => void;
  getStepData: (stepId: string) => any;
  isStepCompleted: (stepIndex: number) => boolean;
  setStepCompleted: (stepIndex: number, completed: boolean) => void;
  errors: Record<string, string>;
  setStepError: (stepId: string, error: string | null) => void;
}

// Create wizard context
const WizardContext = createContext<WizardContextType | null>(null);

// Hook to use wizard context
export const useWizard = (): WizardContextType => {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error('useWizard must be used within a FormWizard component');
  }
  return context;
};

// Step progress indicator component
interface StepProgressProps {
  steps: WizardStep[];
  currentStep: number;
  completedSteps: boolean[];
  errors: Record<string, string>;
  onStepClick?: (step: number) => void;
  variant?: 'horizontal' | 'vertical';
}

const StepProgress: React.FC<StepProgressProps> = ({
  steps,
  currentStep,
  completedSteps,
  errors,
  onStepClick,
  variant = 'horizontal'
}) => {
  if (variant === 'vertical') {
    return (
      <div className="space-y-4">
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = completedSteps[index];
          const hasError = errors[step.id];
          const canClick = onStepClick && (isCompleted || index <= currentStep);

          return (
            <div
              key={step.id}
              className={cn(
                "flex items-start space-x-3 p-3 rounded-lg transition-all duration-200",
                isActive && "bg-green-50 border border-green-200",
                canClick && "cursor-pointer hover:bg-gray-50"
              )}
              onClick={canClick ? () => onStepClick(index) : undefined}
            >
              {/* Step number/icon */}
              <div className={cn(
                "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                isCompleted 
                  ? "bg-green-600 text-white" 
                  : isActive 
                    ? "bg-green-100 text-green-600 border-2 border-green-600"
                    : hasError
                      ? "bg-red-100 text-red-600 border-2 border-red-600"
                      : "bg-gray-100 text-gray-500"
              )}>
                {isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : hasError ? (
                  <AlertCircle className="h-4 w-4" />
                ) : (
                  index + 1
                )}
              </div>

              {/* Step content */}
              <div className="flex-1 min-w-0">
                <h3 className={cn(
                  "text-sm font-medium",
                  isActive ? "text-green-600" : "text-gray-900"
                )}>
                  {step.title}
                </h3>
                {step.description && (
                  <p className="text-xs text-gray-500 mt-1">
                    {step.description}
                  </p>
                )}
                {hasError && (
                  <p className="text-xs text-red-600 mt-1">
                    {hasError}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Horizontal layout
  return (
    <nav aria-label="Progress">
      <ol className="flex items-center">
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = completedSteps[index];
          const hasError = errors[step.id];
          const canClick = onStepClick && (isCompleted || index <= currentStep);

          return (
            <li key={step.id} className={cn("relative", index !== steps.length - 1 && "pr-8 sm:pr-20")}>
              {/* Progress line */}
              {index !== steps.length - 1 && (
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className={cn(
                    "h-0.5 w-full",
                    isCompleted ? "bg-green-600" : "bg-gray-200"
                  )} />
                </div>
              )}

              <div
                className={cn(
                  "relative flex items-center justify-center",
                  canClick && "cursor-pointer"
                )}
                onClick={canClick ? () => onStepClick(index) : undefined}
              >
                {/* Step circle */}
                <div className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200",
                  isCompleted 
                    ? "bg-green-600 text-white" 
                    : isActive 
                      ? "bg-green-100 text-green-600 border-2 border-green-600"
                      : hasError
                        ? "bg-red-100 text-red-600 border-2 border-red-600"
                        : "bg-gray-100 text-gray-500"
                )}>
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : hasError ? (
                    <AlertCircle className="h-4 w-4" />
                  ) : (
                    index + 1
                  )}
                </div>

                {/* Step label */}
                <div className="absolute top-10 left-1/2 transform -translate-x-1/2">
                  <span className={cn(
                    "text-xs font-medium whitespace-nowrap",
                    isActive ? "text-green-600" : "text-gray-500"
                  )}>
                    {step.title}
                  </span>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

// Form wizard component
interface FormWizardProps {
  steps: WizardStep[];
  onComplete: (data: Record<string, any>) => void | Promise<void>;
  onStepChange?: (currentStep: number, direction: 'next' | 'previous') => void;
  allowStepNavigation?: boolean;
  className?: string;
  progressVariant?: 'horizontal' | 'vertical';
  showStepNavigation?: boolean;
  loading?: boolean;
  initialData?: Record<string, any>;
}

export const FormWizard: React.FC<FormWizardProps> = ({
  steps,
  onComplete,
  onStepChange,
  allowStepNavigation = false,
  className,
  progressVariant = 'horizontal',
  showStepNavigation = true,
  loading = false,
  initialData = {}
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<Record<string, any>>(initialData);
  const [completedSteps, setCompletedSteps] = useState<boolean[]>(new Array(steps.length).fill(false));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isValidating, setIsValidating] = useState(false);

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;
  const canGoNext = currentStep < steps.length - 1;
  const canGoPrevious = currentStep > 0;

  const updateData = useCallback((key: string, value: any) => {
    setData(prev => ({ ...prev, [key]: value }));
  }, []);

  const setStepData = useCallback((stepId: string, stepData: any) => {
    setData(prev => ({ ...prev, [stepId]: stepData }));
  }, []);

  const getStepData = useCallback((stepId: string) => {
    return data[stepId];
  }, [data]);

  const isStepCompleted = useCallback((stepIndex: number) => {
    return completedSteps[stepIndex];
  }, [completedSteps]);

  const setStepCompleted = useCallback((stepIndex: number, completed: boolean) => {
    setCompletedSteps(prev => {
      const newCompleted = [...prev];
      newCompleted[stepIndex] = completed;
      return newCompleted;
    });
  }, []);

  const setStepError = useCallback((stepId: string, error: string | null) => {
    setErrors(prev => {
      if (error === null) {
        const { [stepId]: removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, [stepId]: error };
    });
  }, []);

  const goToStep = useCallback(async (step: number) => {
    if (step < 0 || step >= steps.length) return;
    
    // If going forward, validate current step
    if (step > currentStep) {
      const currentStepData = steps[currentStep];
      if (currentStepData.validation) {
        setIsValidating(true);
        try {
          const isValid = await currentStepData.validation();
          if (!isValid) {
            setIsValidating(false);
            return;
          }
        } catch (error) {
          setStepError(currentStepData.id, error instanceof Error ? error.message : 'Validation failed');
          setIsValidating(false);
          return;
        }
        setIsValidating(false);
      }
      
      // Mark current step as completed
      setStepCompleted(currentStep, true);
      setStepError(steps[currentStep].id, null);
    }

    setCurrentStep(step);
    onStepChange?.(step, step > currentStep ? 'next' : 'previous');
  }, [currentStep, steps, onStepChange, setStepCompleted, setStepError]);

  const nextStep = useCallback(async () => {
    if (canGoNext) {
      await goToStep(currentStep + 1);
    } else if (isLastStep) {
      // Complete the wizard
      const currentStepData = steps[currentStep];
      if (currentStepData.validation) {
        setIsValidating(true);
        try {
          const isValid = await currentStepData.validation();
          if (!isValid) {
            setIsValidating(false);
            return;
          }
        } catch (error) {
          setStepError(currentStepData.id, error instanceof Error ? error.message : 'Validation failed');
          setIsValidating(false);
          return;
        }
        setIsValidating(false);
      }
      
      setStepCompleted(currentStep, true);
      await onComplete(data);
    }
  }, [canGoNext, isLastStep, currentStep, steps, goToStep, onComplete, data, setStepCompleted, setStepError]);

  const previousStep = useCallback(() => {
    if (canGoPrevious) {
      setCurrentStep(currentStep - 1);
      onStepChange?.(currentStep - 1, 'previous');
    }
  }, [canGoPrevious, currentStep, onStepChange]);

  const contextValue: WizardContextType = {
    currentStep,
    steps,
    isFirstStep,
    isLastStep,
    canGoNext,
    canGoPrevious,
    goToStep,
    nextStep,
    previousStep,
    data,
    updateData,
    setStepData,
    getStepData,
    isStepCompleted,
    setStepCompleted,
    errors,
    setStepError
  };

  return (
    <WizardContext.Provider value={contextValue}>
      <div className={cn("space-y-6", className)}>
        {/* Progress indicator */}
        {showStepNavigation && (
          <div className="mb-8">
            <StepProgress
              steps={steps}
              currentStep={currentStep}
              completedSteps={completedSteps}
              errors={errors}
              onStepClick={allowStepNavigation ? goToStep : undefined}
              variant={progressVariant}
            />
          </div>
        )}

        {/* Step content */}
        <div className="min-h-[400px]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Step header */}
              <div className="text-center pb-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">
                  {steps[currentStep].title}
                </h2>
                {steps[currentStep].description && (
                  <p className="mt-2 text-gray-600">
                    {steps[currentStep].description}
                  </p>
                )}
              </div>

              {/* Step component */}
              <div className="py-6">
                {steps[currentStep].component}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between items-center pt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={previousStep}
            disabled={!canGoPrevious || isValidating || loading}
            className="flex items-center space-x-2"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Previous</span>
          </Button>

          <div className="flex items-center space-x-2">
            {/* Step indicator */}
            <span className="text-sm text-gray-500">
              Step {currentStep + 1} of {steps.length}
            </span>
          </div>

          <Button
            type="button"
            variant="primary"
            onClick={nextStep}
            disabled={isValidating || loading}
            loading={isValidating || loading}
            className="flex items-center space-x-2"
          >
            <span>{isLastStep ? 'Complete' : 'Next'}</span>
            {!isLastStep && <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </WizardContext.Provider>
  );
};

// Step wrapper component for better organization
interface WizardStepProps {
  children: ReactNode;
  className?: string;
}

export const WizardStep: React.FC<WizardStepProps> = ({ children, className }) => {
  return (
    <div className={cn("space-y-6", className)}>
      {children}
    </div>
  );
};

export default FormWizard;
