import { Check, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { SubscriptionPlan } from '@/types/onboarding';

interface PlanCardProps {
  plan: SubscriptionPlan;
  isSelected: boolean;
  onSelect: () => void;
  disabled?: boolean;
  disabledReason?: string;
}

export function PlanCard({ plan, isSelected, onSelect, disabled = false, disabledReason }: PlanCardProps) {
  return (
    <div
      className={`relative p-6 border-2 rounded-xl transition-all ${
        disabled
          ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
          : isSelected
          ? 'border-blue-500 bg-blue-50 cursor-pointer'
          : 'border-gray-200 hover:border-gray-300 cursor-pointer'
      }`}
      onClick={disabled ? undefined : onSelect}
    >
      {plan.recommended && (
        <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500">
          Recommended
        </Badge>
      )}
      
      <div className="text-center">
        <h3 
          className="text-xl font-bold text-gray-900 mb-2"
          style={{ fontFamily: 'Geist, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontWeight: 600, letterSpacing: '-0.03em' }}
        >
          {plan.displayName}
        </h3>
        <div className="text-3xl font-bold text-gray-900 mb-1">
          ${plan.price}
          <span className="text-lg font-normal text-gray-600">/month</span>
        </div>
        <p className="text-gray-600 text-sm mb-6">{plan.description}</p>
        
        <ul className="space-y-3 text-sm text-gray-600">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-center">
              <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
              {feature}
            </li>
          ))}
        </ul>
      </div>
      
      {isSelected && !disabled && (
        <div className="absolute top-6 right-6">
          <CheckCircle className="w-6 h-6 text-blue-500" />
        </div>
      )}
      
      {disabled && disabledReason && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-90 rounded-xl">
          <div className="text-center p-4">
            <p className="text-sm font-medium text-gray-600 mb-1">Not Available</p>
            <p className="text-xs text-gray-500">{disabledReason}</p>
          </div>
        </div>
      )}
    </div>
  );
} 