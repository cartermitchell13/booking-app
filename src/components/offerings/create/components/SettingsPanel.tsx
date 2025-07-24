'use client';

import React from 'react';
import { 
  Building2, 
  Calendar, 
  DollarSign, 
  Search,
  ChevronRight,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { OfferingFormData } from '../types/createOfferingTypes';

interface SettingsPanelProps {
  formData: Partial<OfferingFormData>;
  onOpenModal: (modalType: 'business-type' | 'scheduling' | 'pricing' | 'seo') => void;
  validationErrors: Array<{ field: string; section: string; severity: 'error' | 'warning' }>;
  className?: string;
}

interface SettingCard {
  id: 'business-type' | 'scheduling' | 'pricing' | 'seo';
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  getValue: (formData: Partial<OfferingFormData>) => string;
  getStatus: (formData: Partial<OfferingFormData>) => 'complete' | 'incomplete' | 'warning';
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  formData,
  onOpenModal,
  validationErrors,
  className = ''
}) => {
  const settingCards: SettingCard[] = [
    {
      id: 'business-type',
      title: 'Business Type',
      description: 'Configure your business model and product type',
      icon: Building2,
      getValue: (data) => {
        if (data.businessType && data.productType) {
          return `${data.businessType} • ${data.productType}`;
        }
        return 'Not configured';
      },
      getStatus: (data) => {
        if (!data.businessType || !data.productType) return 'incomplete';
        return 'complete';
      }
    },
    {
      id: 'scheduling',
      title: 'Scheduling',
      description: 'Set up availability and booking rules',
      icon: Calendar,
      getValue: (data) => {
        if (data.scheduling?.scheduleType) {
          const timezone = data.scheduling.timezone ? ` • ${data.scheduling.timezone}` : '';
          return `${data.scheduling.scheduleType}${timezone}`;
        }
        return 'Not configured';
      },
      getStatus: (data) => {
        if (!data.scheduling?.scheduleType || !data.scheduling?.timezone) return 'incomplete';
        const hasErrors = validationErrors.some(e => 
          e.section === 'Scheduling' && e.severity === 'error'
        );
        const hasWarnings = validationErrors.some(e => 
          e.section === 'Scheduling' && e.severity === 'warning'
        );
        if (hasErrors) return 'incomplete';
        if (hasWarnings) return 'warning';
        return 'complete';
      }
    },
    {
      id: 'pricing',
      title: 'Advanced Pricing',
      description: 'Configure pricing tiers, discounts, and policies',
      icon: DollarSign,
      getValue: (data) => {
        const currency = data.pricing?.currency || 'USD';
        const adultPrice = data.pricing?.basePricing?.adult;
        if (adultPrice) {
          const hasAdvanced = data.pricing?.groupDiscounts?.length || 
                            data.pricing?.seasonalPricing?.length;
          return `${currency} $${adultPrice}${hasAdvanced ? ' • Advanced' : ''}`;
        }
        return 'Not configured';
      },
      getStatus: (data) => {
        if (!data.pricing?.basePricing?.adult || !data.pricing?.currency) return 'incomplete';
        const hasErrors = validationErrors.some(e => 
          e.section === 'Pricing' && e.severity === 'error'
        );
        const hasWarnings = validationErrors.some(e => 
          e.section === 'Pricing' && e.severity === 'warning'
        );
        if (hasErrors) return 'incomplete';
        if (hasWarnings) return 'warning';
        return 'complete';
      }
    },
    {
      id: 'seo',
      title: 'SEO & Metadata',
      description: 'Optimize for search engines and social sharing',
      icon: Search,
      getValue: (data) => {
        const slug = data.media?.seoData?.slug;
        const hasMetaTitle = data.media?.seoData?.metaTitle;
        const hasMetaDescription = data.media?.seoData?.metaDescription;
        
        if (slug && hasMetaTitle && hasMetaDescription) {
          return `/${slug} • Optimized`;
        } else if (slug) {
          return `/${slug} • Partial`;
        }
        return 'Not configured';
      },
      getStatus: (data) => {
        const hasSlug = data.media?.seoData?.slug;
        const hasMetaTitle = data.media?.seoData?.metaTitle;
        const hasMetaDescription = data.media?.seoData?.metaDescription;
        
        if (!hasSlug) return 'incomplete';
        if (!hasMetaTitle || !hasMetaDescription) return 'warning';
        return 'complete';
      }
    }
  ];

  const getStatusIcon = (status: 'complete' | 'incomplete' | 'warning') => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'incomplete':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getStatusColor = (status: 'complete' | 'incomplete' | 'warning') => {
    switch (status) {
      case 'complete':
        return 'border-green-200 bg-green-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'incomplete':
        return 'border-red-200 bg-red-50';
    }
  };

  return (
    <div className={`bg-white border-b border-gray-200 p-6 ${className}`}>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Advanced Settings</h2>
        <p className="text-sm text-gray-600 mt-1">
          Configure advanced options for your offering
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {settingCards.map((card) => {
          const Icon = card.icon;
          const status = card.getStatus(formData);
          const value = card.getValue(formData);

          return (
            <button
              key={card.id}
              onClick={() => onOpenModal(card.id)}
              className={`
                p-4 border-2 rounded-lg hover:shadow-md transition-all duration-200 text-left
                group relative overflow-hidden
                ${getStatusColor(status)}
                hover:border-blue-300 hover:bg-blue-50
              `}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Icon className="w-5 h-5 text-gray-700 group-hover:text-blue-600" />
                  <h3 className="font-medium text-gray-900 group-hover:text-blue-900">
                    {card.title}
                  </h3>
                </div>
                <div className="flex items-center space-x-1">
                  {getStatusIcon(status)}
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 mb-3 group-hover:text-blue-700">
                {card.description}
              </p>

              {/* Current Value */}
              <div className="text-sm">
                <span className="text-gray-500">Current: </span>
                <span className={`font-medium ${
                  status === 'complete' 
                    ? 'text-green-700' 
                    : status === 'warning'
                    ? 'text-yellow-700'
                    : 'text-red-700'
                }`}>
                  {value}
                </span>
              </div>

              {/* Hover effect overlay */}
              <div className="absolute inset-0 bg-blue-600 opacity-0 group-hover:opacity-5 transition-opacity duration-200" />
            </button>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-gray-600">
                {settingCards.filter(card => card.getStatus(formData) === 'complete').length} Complete
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <AlertCircle className="w-4 h-4 text-yellow-500" />
              <span className="text-gray-600">
                {settingCards.filter(card => card.getStatus(formData) === 'warning').length} Warnings
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span className="text-gray-600">
                {settingCards.filter(card => card.getStatus(formData) === 'incomplete').length} Incomplete
              </span>
            </div>
          </div>
          
          <div className="text-gray-500">
            Click any card to configure advanced settings
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;