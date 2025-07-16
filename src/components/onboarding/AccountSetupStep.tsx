import { StepComponentProps } from '@/types/onboarding';
import { PasswordInput } from './PasswordInput';

interface AccountSetupStepProps extends StepComponentProps {
  showPassword: boolean;
  showConfirmPassword: boolean;
  onTogglePassword: () => void;
  onToggleConfirmPassword: () => void;
}

export function AccountSetupStep({ 
  formData, 
  onInputChange, 
  showPassword,
  showConfirmPassword,
  onTogglePassword,
  onToggleConfirmPassword
}: AccountSetupStepProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            First Name *
          </label>
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => onInputChange('firstName', e.target.value)}
            className="w-full h-12 px-4 border-2 border-gray-200 rounded-xl text-lg focus:ring-2 focus:border-transparent focus:ring-blue-500"
            placeholder="Enter your first name"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            Last Name *
          </label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => onInputChange('lastName', e.target.value)}
            className="w-full h-12 px-4 border-2 border-gray-200 rounded-xl text-lg focus:ring-2 focus:border-transparent focus:ring-blue-500"
            placeholder="Enter your last name"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-2">
          Email Address *
        </label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => onInputChange('email', e.target.value)}
          className="w-full h-12 px-4 border-2 border-gray-200 rounded-xl text-lg focus:ring-2 focus:border-transparent focus:ring-blue-500"
          placeholder="Enter your email address"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-2">
          Phone Number
        </label>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => onInputChange('phone', e.target.value)}
          className="w-full h-12 px-4 border-2 border-gray-200 rounded-xl text-lg focus:ring-2 focus:border-transparent focus:ring-blue-500"
          placeholder="Enter your phone number"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PasswordInput
          value={formData.password}
          onChange={(value) => onInputChange('password', value)}
          placeholder="Create a password"
          label="Password"
          showPassword={showPassword}
          onTogglePassword={onTogglePassword}
          required
          helperText="Must be at least 6 characters"
        />
        <PasswordInput
          value={formData.confirmPassword}
          onChange={(value) => onInputChange('confirmPassword', value)}
          placeholder="Confirm your password"
          label="Confirm Password"
          showPassword={showConfirmPassword}
          onTogglePassword={onToggleConfirmPassword}
          required
        />
      </div>
    </div>
  );
} 