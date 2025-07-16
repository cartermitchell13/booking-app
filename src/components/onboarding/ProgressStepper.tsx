import { Check } from 'lucide-react';
import { OnboardingStep } from '@/types/onboarding';

interface ProgressStepperProps {
  steps: OnboardingStep[];
  currentStep: number;
}

export function ProgressStepper({ steps, currentStep }: ProgressStepperProps) {
  return (
    <div className="flex items-center justify-center mb-12">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep >= step.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-600'
            }`}
          >
            {currentStep > step.id ? (
              <Check className="w-5 h-5" />
            ) : (
              <step.icon className="w-5 h-5" />
            )}
          </div>
          <div className="ml-3 mr-6">
            <div className={`text-sm font-medium ${
              currentStep >= step.id ? 'text-gray-900' : 'text-gray-500'
            }`}>
              {step.title}
            </div>
          </div>
          {index < steps.length - 1 && (
            <div className={`w-12 h-0.5 ${
              currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'
            }`} />
          )}
        </div>
      ))}
    </div>
  );
} 