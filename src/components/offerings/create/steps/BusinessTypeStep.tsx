import React from 'react';
import { AlertCircle } from 'lucide-react';
import { StepComponentProps } from '../types/createOfferingTypes';
import { PRODUCT_TYPES } from '../constants';

export const BusinessTypeStep: React.FC<StepComponentProps> = ({ formData, updateFormData, errors }) => {
  const getFieldError = (fieldName: string) => {
    return errors?.[fieldName];
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          What type of offering are you creating?
        </h2>
        <p className="text-gray-600">
          Choose the business model that best describes your offering. This helps us customize the setup process for your specific needs.
        </p>
      </div>

      {/* Show validation errors at the top */}
      {(getFieldError('businessType') || getFieldError('productType')) && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Please make your selections to continue:
              </h3>
              <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                {getFieldError('businessType') && <li>{getFieldError('businessType')}</li>}
                {getFieldError('productType') && <li>{getFieldError('productType')}</li>}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {PRODUCT_TYPES.map((category) => (
          <div key={category.category} className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-800">{category.category}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {category.types.map((type) => (
                <button
                  key={type.id}
                  onClick={() => {
                    updateFormData('businessType', category.category);
                    updateFormData('productType', type.id);
                  }}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 text-left hover:shadow-md ${
                    formData.productType === type.id
                      ? 'border-blue-600 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">{type.icon}</span>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">{type.name}</h4>
                      <p className="text-sm text-gray-600">{type.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 