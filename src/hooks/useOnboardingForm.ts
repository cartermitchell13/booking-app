import { useState, useCallback } from 'react';
import { FormData } from '@/types/onboarding';
import { defaultFormData } from '@/lib/onboarding-constants';

export function useOnboardingForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState<FormData>(defaultFormData);

  const handleInputChange = useCallback((field: keyof FormData, value: string | boolean | object | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(null);
  }, [error]);

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.businessName.trim() || !formData.businessType || !formData.description.trim()) {
          setError('Please fill in all required business information fields.');
          return false;
        }
        break;
      case 2:
        if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim() || !formData.password) {
          setError('Please fill in all required account fields.');
          return false;
        }
        if (formData.password.length < 6) {
          setError('Password must be at least 6 characters long.');
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match.');
          return false;
        }
        break;
      case 3:
        if (!formData.address.trim() || !formData.city.trim() || !formData.state.trim() || !formData.country.trim()) {
          setError('Please fill in all required location fields.');
          return false;
        }
        break;
      case 4:
        if (formData.useCustomDomain) {
          // Custom domain validation
          if (!formData.customDomain.trim()) {
            setError('Please enter your custom domain.');
            return false;
          }
          // Basic domain validation
          const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
          if (!domainRegex.test(formData.customDomain)) {
            setError('Please enter a valid domain (e.g., yourcompany.com).');
            return false;
          }
          if (formData.customDomain.startsWith('www.')) {
            setError('Please enter your domain without "www." (e.g., yourcompany.com).');
            return false;
          }
          if (formData.customDomain.includes('booking.')) {
            setError('Please enter your main domain only (e.g., yourcompany.com). We\'ll create booking.yourcompany.com for you.');
            return false;
          }
        } else {
          // Platform subdomain validation (only required when NOT using custom domain)
          if (!formData.subdomain.trim()) {
            setError('Please choose a subdomain for your booking platform.');
            return false;
          }
          // Basic subdomain validation
          if (!/^[a-z0-9-]+$/.test(formData.subdomain)) {
            setError('Subdomain can only contain lowercase letters, numbers, and hyphens.');
            return false;
          }
        }
        break;
      case 5:
        if (!formData.selectedPlan) {
          setError('Please select a subscription plan.');
          return false;
        }
        // Prevent starter plan selection with custom domain
        if (formData.useCustomDomain && formData.selectedPlan === 'starter') {
          setError('Custom domain requires Professional plan or higher. Please select Professional or Enterprise plan.');
          return false;
        }
        break;
    }
    setError(null);
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 6));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setError(null);
  };

  const goToStep = (step: number) => {
    setCurrentStep(step);
    setError(null);
  };

  return {
    // State
    currentStep,
    isLoading,
    error,
    showPassword,
    showConfirmPassword,
    formData,
    
    // Actions
    handleInputChange,
    validateStep,
    nextStep,
    prevStep,
    goToStep,
    setIsLoading,
    setError,
    setShowPassword,
    setShowConfirmPassword,
    setCurrentStep
  };
} 