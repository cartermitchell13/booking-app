import { useEffect } from 'react';
import { plans } from '@/lib/onboarding-constants';
import { StepComponentProps } from '@/types/onboarding';
import { PlanCard } from './PlanCard';

export function PlanSelectionStep({ formData, onInputChange }: StepComponentProps) {
  // Auto-upgrade from starter to professional if custom domain is selected
  useEffect(() => {
    if (formData.useCustomDomain && formData.selectedPlan === 'starter') {
      onInputChange('selectedPlan', 'professional');
    }
  }, [formData.useCustomDomain, formData.selectedPlan, onInputChange]);

  const isStarterDisabled = formData.useCustomDomain;

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 
          className="text-2xl font-bold text-gray-900 mb-2"
          style={{ fontFamily: 'Geist, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontWeight: 600, letterSpacing: '-0.03em' }}
        >
          Choose Your Plan
        </h3>
        <p className="text-gray-600">Start with a 30-day free trial. No credit card required.</p>
        {formData.useCustomDomain && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Custom domain selected:</strong> Professional or Enterprise plan required for custom domain features.
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <PlanCard
            key={plan.name}
            plan={plan}
            isSelected={formData.selectedPlan === plan.name}
            onSelect={() => onInputChange('selectedPlan', plan.name)}
            disabled={plan.name === 'starter' && isStarterDisabled}
            disabledReason={plan.name === 'starter' && isStarterDisabled ? 'Custom domain requires Professional plan or higher' : undefined}
          />
        ))}
      </div>
    </div>
  );
} 