import React from 'react';
import { AlertCircle } from 'lucide-react';
import { StepComponentProps } from '../types/createOfferingTypes';

export const BasicInfoStep: React.FC<StepComponentProps> = ({ formData, updateFormData, errors }) => {
  const getFieldError = (fieldName: string) => {
    return errors?.[fieldName];
  };

  const getFieldClassName = (fieldName: string) => {
    const baseClass = "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";
    const hasError = getFieldError(fieldName);
    
    if (hasError) {
      return `${baseClass} border-red-300 focus:ring-red-500`;
    }
    
    return `${baseClass} border-gray-300`;
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Tell us about your offering
        </h2>
        <p className="text-gray-600">
          Provide the essential details that will help customers understand what you're offering.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Offering Name *
          </label>
          <input
            type="text"
            value={formData.basicInfo?.name || ''}
            onChange={(e) => updateFormData('basicInfo', { ...formData.basicInfo, name: e.target.value })}
            className={getFieldClassName('name')}
            placeholder="e.g., Banff National Park Tour"
          />
          {getFieldError('name') && (
            <div className="mt-1 flex items-center text-red-600 text-sm">
              <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
              {getFieldError('name')}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location *
          </label>
          <input
            type="text"
            value={formData.basicInfo?.location || ''}
            onChange={(e) => updateFormData('basicInfo', { ...formData.basicInfo, location: e.target.value })}
            className={getFieldClassName('location')}
            placeholder="e.g., Calgary, AB"
          />
          {getFieldError('location') && (
            <div className="mt-1 flex items-center text-red-600 text-sm">
              <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
              {getFieldError('location')}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Duration (minutes) *
          </label>
          <input
            type="number"
            value={formData.basicInfo?.duration || ''}
            onChange={(e) => updateFormData('basicInfo', { ...formData.basicInfo, duration: parseInt(e.target.value) })}
            className={getFieldClassName('duration')}
            placeholder="e.g., 480"
          />
          {getFieldError('duration') && (
            <div className="mt-1 flex items-center text-red-600 text-sm">
              <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
              {getFieldError('duration')}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category *
          </label>
          <select
            value={formData.basicInfo?.category || ''}
            onChange={(e) => updateFormData('basicInfo', { ...formData.basicInfo, category: e.target.value })}
            className={getFieldClassName('category')}
          >
            <option value="">Select a category</option>
            <option value="tours">Tours & Sightseeing</option>
            <option value="activities">Activities & Experiences</option>
            <option value="transportation">Transportation</option>
            <option value="equipment">Equipment Rental</option>
            <option value="packages">Packages & Bundles</option>
          </select>
          {getFieldError('category') && (
            <div className="mt-1 flex items-center text-red-600 text-sm">
              <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
              {getFieldError('category')}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Difficulty Level
          </label>
          <select
            value={formData.basicInfo?.difficultyLevel || 'easy'}
            onChange={(e) => updateFormData('basicInfo', { ...formData.basicInfo, difficultyLevel: e.target.value })}
            className={getFieldClassName('difficultyLevel')}
          >
            <option value="easy">Easy</option>
            <option value="moderate">Moderate</option>
            <option value="challenging">Challenging</option>
            <option value="expert">Expert</option>
          </select>
          {getFieldError('difficultyLevel') && (
            <div className="mt-1 flex items-center text-red-600 text-sm">
              <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
              {getFieldError('difficultyLevel')}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Minimum Age
          </label>
          <input
            type="number"
            value={formData.basicInfo?.minAge || ''}
            onChange={(e) => updateFormData('basicInfo', { ...formData.basicInfo, minAge: parseInt(e.target.value) || 0 })}
            className={getFieldClassName('minAge')}
            placeholder="e.g., 12"
            min="0"
          />
          {getFieldError('minAge') && (
            <div className="mt-1 flex items-center text-red-600 text-sm">
              <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
              {getFieldError('minAge')}
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description *
        </label>
        <textarea
          value={formData.basicInfo?.description || ''}
          onChange={(e) => updateFormData('basicInfo', { ...formData.basicInfo, description: e.target.value })}
          rows={4}
          className={getFieldClassName('description')}
          placeholder="Describe your offering in detail..."
        />
        {getFieldError('description') && (
          <div className="mt-1 flex items-center text-red-600 text-sm">
            <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
            {getFieldError('description')}
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Maximum Group Size
        </label>
        <input
          type="number"
          value={formData.basicInfo?.maxGroupSize || ''}
          onChange={(e) => updateFormData('basicInfo', { ...formData.basicInfo, maxGroupSize: parseInt(e.target.value) || undefined })}
          className={getFieldClassName('maxGroupSize')}
          placeholder="e.g., 20"
          min="1"
        />
        {getFieldError('maxGroupSize') && (
          <div className="mt-1 flex items-center text-red-600 text-sm">
            <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
            {getFieldError('maxGroupSize')}
          </div>
        )}
      </div>
    </div>
  );
}; 