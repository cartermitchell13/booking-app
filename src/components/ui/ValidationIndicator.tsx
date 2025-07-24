import React from 'react';
import { AlertCircle, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { ValidationError } from '@/lib/validation-utils';

interface ValidationIndicatorProps {
  errors: ValidationError[];
  className?: string;
  showIcon?: boolean;
  showCount?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const ValidationIndicator: React.FC<ValidationIndicatorProps> = ({
  errors,
  className = '',
  showIcon = true,
  showCount = false,
  size = 'md'
}) => {
  const errorCount = errors.filter(e => e.severity === 'error').length;
  const warningCount = errors.filter(e => e.severity === 'warning').length;
  
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const iconSize = sizeClasses[size];

  if (errorCount > 0) {
    return (
      <div className={`flex items-center text-red-600 ${className}`}>
        {showIcon && <AlertCircle className={`${iconSize} mr-1`} />}
        {showCount && (
          <span className="text-xs font-medium">
            {errorCount} error{errorCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>
    );
  }

  if (warningCount > 0) {
    return (
      <div className={`flex items-center text-yellow-600 ${className}`}>
        {showIcon && <AlertTriangle className={`${iconSize} mr-1`} />}
        {showCount && (
          <span className="text-xs font-medium">
            {warningCount} warning{warningCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center text-green-600 ${className}`}>
      {showIcon && <CheckCircle className={`${iconSize} mr-1`} />}
      {showCount && <span className="text-xs font-medium">Valid</span>}
    </div>
  );
};

interface ValidationMessageProps {
  errors: ValidationError[];
  className?: string;
  maxMessages?: number;
}

export const ValidationMessage: React.FC<ValidationMessageProps> = ({
  errors,
  className = '',
  maxMessages = 3
}) => {
  if (errors.length === 0) return null;

  const displayErrors = errors.slice(0, maxMessages);
  const remainingCount = errors.length - maxMessages;

  return (
    <div className={`space-y-1 ${className}`}>
      {displayErrors.map((error, index) => (
        <div
          key={`${error.field}-${index}`}
          className={`flex items-start text-sm ${
            error.severity === 'error' ? 'text-red-600' : 'text-yellow-600'
          }`}
        >
          {error.severity === 'error' ? (
            <AlertCircle className="w-3 h-3 mr-1 mt-0.5 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-3 h-3 mr-1 mt-0.5 flex-shrink-0" />
          )}
          <span>{error.message}</span>
        </div>
      ))}
      {remainingCount > 0 && (
        <div className="text-xs text-gray-500 ml-4">
          +{remainingCount} more issue{remainingCount !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
};

interface SectionValidationBadgeProps {
  sectionName: string;
  errors: ValidationError[];
  completed: number;
  total: number;
  className?: string;
}

export const SectionValidationBadge: React.FC<SectionValidationBadgeProps> = ({
  sectionName,
  errors,
  completed,
  total,
  className = ''
}) => {
  const errorCount = errors.filter(e => e.severity === 'error').length;
  const warningCount = errors.filter(e => e.severity === 'warning').length;
  const isComplete = completed === total && errorCount === 0;

  let badgeColor = 'bg-gray-100 text-gray-600';
  let icon = <Info className="w-3 h-3" />;

  if (errorCount > 0) {
    badgeColor = 'bg-red-100 text-red-700';
    icon = <AlertCircle className="w-3 h-3" />;
  } else if (warningCount > 0) {
    badgeColor = 'bg-yellow-100 text-yellow-700';
    icon = <AlertTriangle className="w-3 h-3" />;
  } else if (isComplete) {
    badgeColor = 'bg-green-100 text-green-700';
    icon = <CheckCircle className="w-3 h-3" />;
  }

  return (
    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badgeColor} ${className}`}>
      {icon}
      <span className="ml-1">
        {errorCount > 0 && `${errorCount} error${errorCount !== 1 ? 's' : ''}`}
        {warningCount > 0 && errorCount === 0 && `${warningCount} warning${warningCount !== 1 ? 's' : ''}`}
        {isComplete && 'Complete'}
        {!isComplete && errorCount === 0 && warningCount === 0 && `${completed}/${total}`}
      </span>
    </div>
  );
};

interface FieldValidationWrapperProps {
  fieldPath: string;
  errors: ValidationError[];
  children: React.ReactNode;
  showInlineError?: boolean;
  className?: string;
}

export const FieldValidationWrapper: React.FC<FieldValidationWrapperProps> = ({
  fieldPath,
  errors,
  children,
  showInlineError = true,
  className = ''
}) => {
  const fieldErrors = errors.filter(e => e.field === fieldPath);
  const hasError = fieldErrors.some(e => e.severity === 'error');
  const hasWarning = fieldErrors.some(e => e.severity === 'warning') && !hasError;

  let borderColor = '';
  if (hasError) {
    borderColor = 'border-red-300 focus-within:border-red-500 focus-within:ring-red-500';
  } else if (hasWarning) {
    borderColor = 'border-yellow-300 focus-within:border-yellow-500 focus-within:ring-yellow-500';
  }

  return (
    <div className={className}>
      <div className={`relative ${borderColor}`}>
        {children}
        {(hasError || hasWarning) && (
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <ValidationIndicator errors={fieldErrors} showCount={false} size="sm" />
          </div>
        )}
      </div>
      {showInlineError && fieldErrors.length > 0 && (
        <ValidationMessage errors={fieldErrors} className="mt-1" maxMessages={1} />
      )}
    </div>
  );
};