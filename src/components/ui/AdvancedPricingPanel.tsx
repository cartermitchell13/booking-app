'use client'

import React, { useState } from 'react'
import { Settings, Plus, Trash2, Percent, DollarSign, Calendar, Users, X } from 'lucide-react'
import { PricingFormData } from '@/types/offering-form'

interface AdvancedPricingPanelProps {
  pricing: PricingFormData
  onChange: (pricing: PricingFormData) => void
  isOpen: boolean
  onClose: () => void
}

interface GroupDiscount {
  minSize: number
  discount: number
  type: 'percentage' | 'fixed'
}

interface SeasonalPricing {
  name: string
  startDate: Date
  endDate: Date
  multiplier: number
}

export function AdvancedPricingPanel({ pricing, onChange, isOpen, onClose }: AdvancedPricingPanelProps) {
  const [activeTab, setActiveTab] = useState<'tax' | 'groups' | 'seasonal'>('tax')

  if (!isOpen) return null

  const addGroupDiscount = () => {
    const newDiscount: GroupDiscount = {
      minSize: 2,
      discount: 10,
      type: 'percentage'
    }
    
    onChange({
      ...pricing,
      groupDiscounts: [...(pricing.groupDiscounts || []), newDiscount]
    })
  }

  const updateGroupDiscount = (index: number, discount: GroupDiscount) => {
    const newDiscounts = [...(pricing.groupDiscounts || [])]
    newDiscounts[index] = discount
    
    onChange({
      ...pricing,
      groupDiscounts: newDiscounts
    })
  }

  const removeGroupDiscount = (index: number) => {
    const newDiscounts = [...(pricing.groupDiscounts || [])]
    newDiscounts.splice(index, 1)
    
    onChange({
      ...pricing,
      groupDiscounts: newDiscounts
    })
  }

  const addSeasonalPricing = () => {
    const newSeasonal: SeasonalPricing = {
      name: 'High Season',
      startDate: new Date(),
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
      multiplier: 1.2
    }
    
    onChange({
      ...pricing,
      seasonalPricing: [...(pricing.seasonalPricing || []), newSeasonal]
    })
  }

  const updateSeasonalPricing = (index: number, seasonal: SeasonalPricing) => {
    const newSeasonal = [...(pricing.seasonalPricing || [])]
    newSeasonal[index] = seasonal
    
    onChange({
      ...pricing,
      seasonalPricing: newSeasonal
    })
  }

  const removeSeasonalPricing = (index: number) => {
    const newSeasonal = [...(pricing.seasonalPricing || [])]
    newSeasonal.splice(index, 1)
    
    onChange({
      ...pricing,
      seasonalPricing: newSeasonal
    })
  }

  const updateTaxSettings = (field: keyof typeof pricing, value: any) => {
    onChange({
      ...pricing,
      [field]: value
    })
  }

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0]
  }

  const parseDate = (dateString: string) => {
    return new Date(dateString)
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Settings className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Advanced Pricing Configuration</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('tax')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'tax'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Tax & Fees
          </button>
          <button
            onClick={() => setActiveTab('groups')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'groups'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Group Discounts
          </button>
          <button
            onClick={() => setActiveTab('seasonal')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'seasonal'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Seasonal Pricing
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'tax' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tax Configuration</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Tax Inclusive Pricing</label>
                      <p className="text-sm text-gray-500">Prices include all applicable taxes</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={pricing.taxInclusive}
                        onChange={(e) => updateTaxSettings('taxInclusive', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Deposit Required</label>
                      <p className="text-sm text-gray-500">Require a deposit for bookings</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={pricing.depositRequired}
                        onChange={(e) => updateTaxSettings('depositRequired', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {pricing.depositRequired && (
                    <div className="ml-4 p-4 bg-blue-50 rounded-lg">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Deposit Amount
                      </label>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-gray-500" />
                        <input
                          type="number"
                          value={pricing.depositAmount || 0}
                          onChange={(e) => updateTaxSettings('depositAmount', parseFloat(e.target.value) || 0)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          min="0"
                          step="1"
                          placeholder="Enter deposit amount"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Cancellation Policy</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Free Cancellation (hours before)
                    </label>
                    <input
                      type="number"
                      value={pricing.cancellationPolicy.freeCancellationHours}
                      onChange={(e) => onChange({
                        ...pricing,
                        cancellationPolicy: {
                          ...pricing.cancellationPolicy,
                          freeCancellationHours: parseInt(e.target.value) || 0
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="0"
                      placeholder="24"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Refund Percentage (%)
                    </label>
                    <input
                      type="number"
                      value={pricing.cancellationPolicy.refundPercentage}
                      onChange={(e) => onChange({
                        ...pricing,
                        cancellationPolicy: {
                          ...pricing.cancellationPolicy,
                          refundPercentage: parseInt(e.target.value) || 0
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="0"
                      max="100"
                      placeholder="100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Processing Fee
                    </label>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gray-500" />
                      <input
                        type="number"
                        value={pricing.cancellationPolicy.processingFee || 0}
                        onChange={(e) => onChange({
                          ...pricing,
                          cancellationPolicy: {
                            ...pricing.cancellationPolicy,
                            processingFee: parseFloat(e.target.value) || 0
                          }
                        })}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'groups' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Group Discounts</h3>
                <button
                  onClick={addGroupDiscount}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Discount
                </button>
              </div>

              <div className="space-y-4">
                {(pricing.groupDiscounts || []).map((discount, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-900">Group Discount {index + 1}</h4>
                      <button
                        onClick={() => removeGroupDiscount(index)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Minimum Group Size
                        </label>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-500" />
                          <input
                            type="number"
                            value={discount.minSize}
                            onChange={(e) => updateGroupDiscount(index, {
                              ...discount,
                              minSize: parseInt(e.target.value) || 2
                            })}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            min="2"
                            placeholder="2"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Discount Value
                        </label>
                        <div className="flex items-center gap-2">
                          {discount.type === 'percentage' ? (
                            <Percent className="w-4 h-4 text-gray-500" />
                          ) : (
                            <DollarSign className="w-4 h-4 text-gray-500" />
                          )}
                          <input
                            type="number"
                            value={discount.discount}
                            onChange={(e) => updateGroupDiscount(index, {
                              ...discount,
                              discount: parseFloat(e.target.value) || 0
                            })}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            min="0"
                            step={discount.type === 'percentage' ? '1' : '0.01'}
                            placeholder={discount.type === 'percentage' ? '10' : '5.00'}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Discount Type
                        </label>
                        <select
                          value={discount.type}
                          onChange={(e) => updateGroupDiscount(index, {
                            ...discount,
                            type: e.target.value as 'percentage' | 'fixed'
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="percentage">Percentage (%)</option>
                          <option value="fixed">Fixed Amount ($)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}

                {(!pricing.groupDiscounts || pricing.groupDiscounts.length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No group discounts configured</p>
                    <p className="text-sm">Add discounts for larger groups to encourage bookings</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'seasonal' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Seasonal Pricing</h3>
                <button
                  onClick={addSeasonalPricing}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Season
                </button>
              </div>

              <div className="space-y-4">
                {(pricing.seasonalPricing || []).map((season, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-900">{season.name}</h4>
                      <button
                        onClick={() => removeSeasonalPricing(index)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Season Name
                        </label>
                        <input
                          type="text"
                          value={season.name}
                          onChange={(e) => updateSeasonalPricing(index, {
                            ...season,
                            name: e.target.value
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="High Season"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Start Date
                        </label>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <input
                            type="date"
                            value={formatDate(season.startDate)}
                            onChange={(e) => updateSeasonalPricing(index, {
                              ...season,
                              startDate: parseDate(e.target.value)
                            })}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          End Date
                        </label>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <input
                            type="date"
                            value={formatDate(season.endDate)}
                            onChange={(e) => updateSeasonalPricing(index, {
                              ...season,
                              endDate: parseDate(e.target.value)
                            })}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Price Multiplier
                        </label>
                        <input
                          type="number"
                          value={season.multiplier}
                          onChange={(e) => updateSeasonalPricing(index, {
                            ...season,
                            multiplier: parseFloat(e.target.value) || 1
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          min="0.1"
                          max="10"
                          step="0.1"
                          placeholder="1.2"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {season.multiplier > 1 ? `+${((season.multiplier - 1) * 100).toFixed(0)}%` : 
                           season.multiplier < 1 ? `-${((1 - season.multiplier) * 100).toFixed(0)}%` : 'No change'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {(!pricing.seasonalPricing || pricing.seasonalPricing.length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No seasonal pricing configured</p>
                    <p className="text-sm">Add seasonal rates to optimize pricing throughout the year</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}