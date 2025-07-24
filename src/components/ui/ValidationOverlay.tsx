import React, { useState } from 'react';
import { AlertCircle, CheckCircle, AlertTriangle, X, ChevronDown, ChevronUp } from 'lucide-react';
import { ValidationError } from '@/lib/validation-utils';
import { ValidationIndicator, ValidationMessage, SectionValidationBadge } from './ValidationIndicator';

interface ValidationOverlayProps {
  isVisible: boolean;
  onClose: () => void;
  validation: {
    isValid: boolean;
    errors: ValidationError[];
    warnings: ValidationError[];
  };
  sectionStatus: Record<string, {
    completed: number;
    total: number;
    hasErrors: boolean;
    hasWarnings: boolean;
  }>;
  completionPercentage: number;
  onSectionClick?: (section: string) => void;
}

export const ValidationOverlay: React.FC<ValidationOverlayProps> = ({
  isVisible,
  onClose,
  validation,
  sectionStatus,
  completionPercentage,
  onSectionClick
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  if (!isVisible) return null;

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const getSectionErrors = (section: string) => {
    return [...validation.errors, ...validation.warnings].filter(e => e.section === section);
  };

  const totalErrors = validation.errors.length;
  const totalWarnings = validation.warnings.length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <ValidationIndicator 
              errors={[...validation.errors, ...validation.warnings]} 
              size="lg" 
            />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Validation Status
              </h2>
              <p className="text-sm text-gray-600">
                {completionPercentage}% complete
                {totalErrors > 0 && ` • ${totalErrors} error${totalErrors !== 1 ? 's' : ''}`}
                {totalWarnings > 0 && ` • ${totalWarnings} warning${totalWarnings !== 1 ? 's' : ''}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Overall Progress</span>
            <span className="text-sm text-gray-600">{completionPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                totalErrors > 0 ? 'bg-red-500' : 
                totalWarnings > 0 ? 'bg-yellow-500' : 
                'bg-green-500'
              }`}
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-96">
          {/* Summary */}
          {(totalErrors > 0 || totalWarnings > 0) && (
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Issues Summary</h3>
              <div className="space-y-2">
                {totalErrors > 0 && (
                  <div className="flex items-center text-red-600">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    <span className="text-sm font-medium">
                      {totalErrors} error{totalErrors !== 1 ? 's' : ''} must be fixed before publishing
                    </span>
                  </div>
                )}
                {totalWarnings > 0 && (
                  <div className="flex items-center text-yellow-600">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    <span className="text-sm font-medium">
                      {totalWarnings} warning{totalWarnings !== 1 ? 's' : ''} should be addressed
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Sections */}
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Sections</h3>
            <div className="space-y-3">
              {Object.entries(sectionStatus).map(([section, status]) => {
                const sectionErrors = getSectionErrors(section);
                const isExpanded = expandedSections.has(section);
                const hasIssues = sectionErrors.length > 0;

                return (
                  <div key={section} className="border border-gray-200 rounded-lg">
                    <button
                      onClick={() => toggleSection(section)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <ValidationIndicator errors={sectionErrors} size="sm" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{section}</h4>
                          <p className="text-sm text-gray-600">
                            {status.completed}/{status.total} required fields completed
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <SectionValidationBadge
                          sectionName={section}
                          errors={sectionErrors}
                          completed={status.completed}
                          total={status.total}
                        />
                        {hasIssues && (
                          isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </button>

                    {isExpanded && hasIssues && (
                      <div className="px-4 pb-4 border-t border-gray-100">
                        <ValidationMessage errors={sectionErrors} className="mt-3" />
                        {onSectionClick && (
                          <button
                            onClick={() => onSectionClick(section)}
                            className="mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Go to {section} →
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            {validation.isValid ? (
              <span className="flex items-center text-green-600">
                <CheckCircle className="w-4 h-4 mr-1" />
                Ready to publish
              </span>
            ) : (
              <span>Fix all errors to enable publishing</span>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

interface InlineValidationBannerProps {
  validation: {
    isValid: boolean;
    errors: ValidationError[];
    warnings: ValidationError[];
  };
  completionPercentage: number;
  onShowDetails: () => void;
  className?: string;
}

export const InlineValidationBanner: React.FC<InlineValidationBannerProps> = ({
  validation,
  completionPercentage,
  onShowDetails,
  className = ''
}) => {
  const totalErrors = validation.errors.length;
  const totalWarnings = validation.warnings.length;

  if (validation.isValid && completionPercentage === 100) {
    return (
      <div className={`bg-green-50 border border-green-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-green-800">Ready to Publish</h3>
              <p className="text-sm text-green-700">All required fields are complete and valid.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const bgColor = totalErrors > 0 ? 'bg-red-50 border-red-200' : 
                  totalWarnings > 0 ? 'bg-yellow-50 border-yellow-200' : 
                  'bg-blue-50 border-blue-200';

  const textColor = totalErrors > 0 ? 'text-red-800' : 
                    totalWarnings > 0 ? 'text-yellow-800' : 
                    'text-blue-800';

  const iconColor = totalErrors > 0 ? 'text-red-600' : 
                    totalWarnings > 0 ? 'text-yellow-600' : 
                    'text-blue-600';

  return (
    <div className={`${bgColor} border rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <ValidationIndicator 
            errors={[...validation.errors, ...validation.warnings]} 
            className={iconColor}
            size="md"
          />
          <div className="ml-3">
            <h3 className={`text-sm font-medium ${textColor}`}>
              {totalErrors > 0 ? 'Issues Found' : 
               totalWarnings > 0 ? 'Warnings' : 
               'In Progress'}
            </h3>
            <p className={`text-sm ${textColor.replace('800', '700')}`}>
              {completionPercentage}% complete
              {totalErrors > 0 && ` • ${totalErrors} error${totalErrors !== 1 ? 's' : ''} to fix`}
              {totalWarnings > 0 && ` • ${totalWarnings} warning${totalWarnings !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>
        <button
          onClick={onShowDetails}
          className={`text-sm font-medium ${textColor} hover:opacity-80 transition-opacity`}
        >
          View Details
        </button>
      </div>
    </div>
  );
};