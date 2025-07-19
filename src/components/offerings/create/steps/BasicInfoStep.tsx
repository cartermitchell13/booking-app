import React, { useState } from 'react';
import { AlertCircle, Plus, X, Check, Minus } from 'lucide-react';
import { StepComponentProps } from '../types/createOfferingTypes';
import { RichContentEditor } from '../components/RichContentEditor';
import { ContentTemplate } from '../components/ContentTemplate';

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
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Description *
        </label>
        
        {/* Content Templates */}
        <ContentTemplate 
          onUseTemplate={(template) => {
            updateFormData('basicInfo', { 
              ...formData.basicInfo, 
              rich_content: template 
            });
          }}
        />
        
        {/* Rich Content Editor */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <RichContentEditor
            content={formData.basicInfo?.rich_content || ''}
            onChange={(content) => {
              updateFormData('basicInfo', { 
                ...formData.basicInfo, 
                rich_content: content 
              });
            }}
            placeholder="Describe your offering in detail... Use formatting, headers, and lists to make it engaging!"
          />
        </div>
        
        {getFieldError('description') && (
          <div className="mt-3 flex items-center text-red-600 text-sm">
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

      {/* Tags Section */}
      <div className="mt-8">

        {/* Tags Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-purple-600 text-lg">#</span>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Tags</h4>
              <p className="text-sm text-gray-500">Help customers discover your experience</p>
            </div>
          </div>
          
          <div className="space-y-4">
            {/* Current Tags */}
            {(formData.basicInfo?.tags || []).length > 0 && (
              <div className="flex flex-wrap gap-2">
                {(formData.basicInfo?.tags || []).map((tag, index) => (
                  <span
                    key={index}
                    className="group inline-flex items-center gap-2 px-3 py-2 bg-purple-100 text-purple-800 text-sm rounded-full font-medium hover:bg-purple-200 transition-colors"
                  >
                    <span className="text-purple-600">#</span>
                    {tag}
                    <button
                      type="button"
                      onClick={() => {
                        const newTags = [...(formData.basicInfo?.tags || [])];
                        newTags.splice(index, 1);
                        updateFormData('basicInfo', { ...formData.basicInfo, tags: newTags });
                      }}
                      className="text-purple-600 hover:text-purple-800 opacity-70 group-hover:opacity-100 transition-all"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            
            {/* Empty State */}
            {(formData.basicInfo?.tags || []).length === 0 && (
              <div className="text-center py-6 text-gray-500">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-gray-400 text-lg">#</span>
                </div>
                <p className="text-sm text-gray-400">No tags added yet</p>
              </div>
            )}
            
            {/* Add Tag Input */}
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-500 font-medium">#</span>
                <input
                  type="text"
                  placeholder="adventure, family-friendly, photography..."
                  className="w-full pl-8 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50 focus:bg-white transition-colors"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const input = e.target as HTMLInputElement;
                      const tag = input.value.trim().toLowerCase();
                      if (tag && !(formData.basicInfo?.tags || []).includes(tag)) {
                        const newTags = [...(formData.basicInfo?.tags || []), tag];
                        updateFormData('basicInfo', { ...formData.basicInfo, tags: newTags });
                        input.value = '';
                      }
                    }
                  }}
                />
              </div>
              <button
                type="button"
                onClick={(e) => {
                  const input = (e.target as HTMLButtonElement).previousElementSibling?.querySelector('input') as HTMLInputElement;
                  const tag = input.value.trim().toLowerCase();
                  if (tag && !(formData.basicInfo?.tags || []).includes(tag)) {
                    const newTags = [...(formData.basicInfo?.tags || []), tag];
                    updateFormData('basicInfo', { ...formData.basicInfo, tags: newTags });
                    input.value = '';
                  }
                }}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                Add Tag
              </button>
            </div>
            
            {/* Popular Tags Suggestions */}
            <div className="border-t pt-4">
              <p className="text-xs text-gray-500 mb-3">Popular tags:</p>
              <div className="flex flex-wrap gap-2">
                {['adventure', 'family-friendly', 'photography', 'nature', 'cultural', 'food', 'wildlife', 'scenic'].map((suggestedTag) => (
                  <button
                    key={suggestedTag}
                    type="button"
                    onClick={() => {
                      if (!(formData.basicInfo?.tags || []).includes(suggestedTag)) {
                        const newTags = [...(formData.basicInfo?.tags || []), suggestedTag];
                        updateFormData('basicInfo', { ...formData.basicInfo, tags: newTags });
                      }
                    }}
                    disabled={(formData.basicInfo?.tags || []).includes(suggestedTag)}
                    className="px-3 py-1 text-xs border border-gray-300 rounded-full text-gray-600 hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    #{suggestedTag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 