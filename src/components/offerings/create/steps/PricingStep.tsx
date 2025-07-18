import React from 'react';
import { StepComponentProps } from '../types/createOfferingTypes';

export const PricingStep: React.FC<StepComponentProps> = ({ formData, updateFormData }) => {
  const pricing = formData.pricing || {
    basePricing: { adult: 0 },
    currency: 'USD',
    cancellationPolicy: { freeCancellationHours: 24, refundPercentage: 100 },
    depositRequired: false,
    taxInclusive: false
  };
  const basePricing = pricing.basePricing || { adult: 0 };
  const cancellationPolicy = pricing.cancellationPolicy || { freeCancellationHours: 24, refundPercentage: 100 };

  const updatePricing = (field: string, value: any) => {
    updateFormData('pricing', { ...pricing, [field]: value });
  };

  const updateBasePricing = (field: string, value: any) => {
    updatePricing('basePricing', { ...basePricing, [field]: value });
  };

  const updateCancellationPolicy = (field: string, value: any) => {
    updatePricing('cancellationPolicy', { ...cancellationPolicy, [field]: value });
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Pricing & Policies
        </h2>
        <p className="text-gray-600">
          Set your pricing structure and define your booking policies.
        </p>
      </div>

      {/* Base Pricing */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Base Pricing</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adult Price *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">$</span>
              <input
                type="number"
                value={basePricing.adult || ''}
                onChange={(e) => updateBasePricing('adult', parseFloat(e.target.value) || 0)}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Child Price
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">$</span>
              <input
                type="number"
                value={basePricing.child || ''}
                onChange={(e) => updateBasePricing('child', parseFloat(e.target.value) || 0)}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Student Price
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">$</span>
              <input
                type="number"
                value={basePricing.student || ''}
                onChange={(e) => updateBasePricing('student', parseFloat(e.target.value) || 0)}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Senior Price
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">$</span>
              <input
                type="number"
                value={basePricing.senior || ''}
                onChange={(e) => updateBasePricing('senior', parseFloat(e.target.value) || 0)}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Currency
            </label>
            <select
              value={pricing.currency || 'USD'}
              onChange={(e) => updatePricing('currency', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="USD">USD - US Dollar</option>
              <option value="CAD">CAD - Canadian Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
            </select>
          </div>

          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={pricing.taxInclusive || false}
                onChange={(e) => updatePricing('taxInclusive', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Tax Inclusive Pricing</span>
            </label>
          </div>
        </div>
      </div>

      {/* Deposit Settings */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Deposit & Payment</h3>
        <div className="space-y-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={pricing.depositRequired || false}
              onChange={(e) => updatePricing('depositRequired', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Require Deposit</span>
          </label>

          {pricing.depositRequired && (
            <div className="ml-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deposit Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={pricing.depositAmount || ''}
                    onChange={(e) => updatePricing('depositAmount', parseFloat(e.target.value) || 0)}
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cancellation Policy */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Cancellation Policy</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Free Cancellation (hours before)
            </label>
            <input
              type="number"
              value={cancellationPolicy.freeCancellationHours || ''}
              onChange={(e) => updateCancellationPolicy('freeCancellationHours', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="24"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Refund Percentage
            </label>
            <div className="relative">
              <input
                type="number"
                value={cancellationPolicy.refundPercentage || ''}
                onChange={(e) => updateCancellationPolicy('refundPercentage', parseInt(e.target.value) || 0)}
                className="w-full pr-8 pl-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="100"
                min="0"
                max="100"
              />
              <span className="absolute right-3 top-2 text-gray-500">%</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Processing Fee
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">$</span>
              <input
                type="number"
                value={cancellationPolicy.processingFee || ''}
                onChange={(e) => updateCancellationPolicy('processingFee', parseFloat(e.target.value) || 0)}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-2">Pricing Summary</h4>
        <div className="space-y-1 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Adult Price:</span>
            <span>{pricing.currency || 'USD'} ${basePricing.adult || '0.00'}</span>
          </div>
          {basePricing.child && (
            <div className="flex justify-between">
              <span>Child Price:</span>
              <span>{pricing.currency || 'USD'} ${basePricing.child}</span>
            </div>
          )}
          {pricing.depositRequired && (
            <div className="flex justify-between">
              <span>Deposit Required:</span>
              <span>{pricing.currency || 'USD'} ${pricing.depositAmount || '0.00'}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Free Cancellation:</span>
            <span>{cancellationPolicy.freeCancellationHours || 0} hours before</span>
          </div>
        </div>
      </div>
    </div>
  );
}; 