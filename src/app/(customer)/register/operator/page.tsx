'use client';

import { useOnboardingForm } from '@/hooks/useOnboardingForm';
import { useOnboardingSubmission } from '@/hooks/useOnboardingSubmission';
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { BusinessInfoStep } from '@/components/onboarding/BusinessInfoStep';
import { AccountSetupStep } from '@/components/onboarding/AccountSetupStep';
import { LocationStep } from '@/components/onboarding/LocationStep';
import { BrandingStep } from '@/components/onboarding/BrandingStep';
import { PlanSelectionStep } from '@/components/onboarding/PlanSelectionStep';
import { CompletionStep } from '@/components/onboarding/CompletionStep';

export default function OperatorRegisterPage() {
  const {
    currentStep,
    isLoading,
    error,
    showPassword,
    showConfirmPassword,
    formData,
    handleInputChange,
    validateStep,
    nextStep,
    prevStep,
    setIsLoading,
    setError,
    setShowPassword,
    setShowConfirmPassword,
    setCurrentStep
  } = useOnboardingForm();

  const { handleSubmit } = useOnboardingSubmission();

  const onSubmit = () => {
    handleSubmit(
      formData,
      validateStep,
      setIsLoading,
      setError,
      setCurrentStep
    );
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <BusinessInfoStep
            formData={formData}
            onInputChange={handleInputChange}
            error={error}
          />
        );
      case 2:
        return (
          <AccountSetupStep
            formData={formData}
            onInputChange={handleInputChange}
            error={error}
            showPassword={showPassword}
            showConfirmPassword={showConfirmPassword}
            onTogglePassword={() => setShowPassword(!showPassword)}
            onToggleConfirmPassword={() => setShowConfirmPassword(!showConfirmPassword)}
          />
        );
      case 3:
        return (
          <LocationStep
            formData={formData}
            onInputChange={handleInputChange}
            error={error}
          />
        );
      case 4:
        return (
          <BrandingStep
            formData={formData}
            onInputChange={handleInputChange}
            error={error}
          />
        );
      case 5:
        return (
          <PlanSelectionStep
            formData={formData}
            onInputChange={handleInputChange}
            error={error}
          />
        );
      case 6:
        return <CompletionStep />;
      default:
        return null;
    }
  };

  return (
    <OnboardingLayout
      currentStep={currentStep}
      error={error}
      isLoading={isLoading}
      onPrevStep={prevStep}
      onNextStep={nextStep}
      onSubmit={onSubmit}
    >
      {renderStep()}
    </OnboardingLayout>
  );
} 