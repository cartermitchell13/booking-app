import { Eye, EyeOff } from 'lucide-react';
import { PasswordInputProps } from '@/types/onboarding';

export function PasswordInput({
  value,
  onChange,
  placeholder,
  label,
  showPassword,
  onTogglePassword,
  required = false,
  helperText
}: PasswordInputProps) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-800 mb-2">
        {label} {required && '*'}
      </label>
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-12 px-4 pr-12 border-2 border-gray-200 rounded-xl text-lg focus:ring-2 focus:border-transparent focus:ring-blue-500"
          placeholder={placeholder}
        />
        <button
          type="button"
          className="absolute inset-y-0 right-0 pr-4 flex items-center"
          onClick={onTogglePassword}
        >
          {showPassword ? (
            <EyeOff className="h-5 w-5 text-gray-400" />
          ) : (
            <Eye className="h-5 w-5 text-gray-400" />
          )}
        </button>
      </div>
      {helperText && (
        <p className="text-sm text-gray-500 mt-1">{helperText}</p>
      )}
    </div>
  );
} 