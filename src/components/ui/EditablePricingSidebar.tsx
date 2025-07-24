'use client'

import React, { useState } from 'react'
import { Edit3, Check, X, Plus, Trash2, DollarSign, Settings } from 'lucide-react'
import { PricingFormData } from '@/types/offering-form'
import { AdvancedPricingPanel } from './AdvancedPricingPanel'

interface EditablePricingSidebarProps {
  pricing: PricingFormData
  onChange: (pricing: PricingFormData) => void
  className?: string
  branding?: any
}

interface PricingTier {
  type: 'adult' | 'child' | 'student' | 'senior'
  label: string
  price: number
}

const CURRENCY_OPTIONS = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' }
]

export function EditablePricingSidebar({ pricing, onChange, className = '', branding }: EditablePricingSidebarProps) {
  const [editingField, setEditingField] = useState<string | null>(null)
  const [tempValue, setTempValue] = useState<string>('')
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false)
  const [showAdvancedPanel, setShowAdvancedPanel] = useState(false)

  const currentCurrency = CURRENCY_OPTIONS.find(c => c.code === pricing.currency) || CURRENCY_OPTIONS[0]

  // Convert pricing data to tiers for easier management
  const pricingTiers: PricingTier[] = [
    { type: 'adult', label: 'Adult', price: pricing.basePricing.adult },
    ...(pricing.basePricing.child ? [{ type: 'child' as const, label: 'Child', price: pricing.basePricing.child }] : []),
    ...(pricing.basePricing.student ? [{ type: 'student' as const, label: 'Student', price: pricing.basePricing.student }] : []),
    ...(pricing.basePricing.senior ? [{ type: 'senior' as const, label: 'Senior', price: pricing.basePricing.senior }] : [])
  ]

  const handleStartEdit = (field: string, currentValue: string) => {
    setEditingField(field)
    setTempValue(currentValue)
  }

  const handleSaveEdit = (field: string) => {
    if (field.startsWith('price-')) {
      const tierType = field.replace('price-', '') as keyof typeof pricing.basePricing
      const numericValue = parseFloat(tempValue) || 0
      
      onChange({
        ...pricing,
        basePricing: {
          ...pricing.basePricing,
          [tierType]: numericValue
        }
      })
    }
    
    setEditingField(null)
    setTempValue('')
  }

  const handleCancelEdit = () => {
    setEditingField(null)
    setTempValue('')
  }

  const handleCurrencyChange = (currencyCode: string) => {
    onChange({
      ...pricing,
      currency: currencyCode
    })
    setShowCurrencyDropdown(false)
  }

  const addPricingTier = (type: 'child' | 'student' | 'senior') => {
    onChange({
      ...pricing,
      basePricing: {
        ...pricing.basePricing,
        [type]: 0
      }
    })
  }

  const removePricingTier = (type: 'child' | 'student' | 'senior') => {
    const newBasePricing = { ...pricing.basePricing }
    delete newBasePricing[type]
    
    onChange({
      ...pricing,
      basePricing: newBasePricing
    })
  }

  const formatPrice = (price: number) => {
    return `${currentCurrency.symbol}${price.toFixed(0)}`
  }

  return (
    <div 
      className={`rounded-2xl p-6 border-2 shadow-lg ${className}`}
      style={{
        backgroundColor: branding?.foreground_color || '#FFFFFF',
        borderColor: branding?.accent_color || '#637752'
      }}
    >
      {/* Currency Selection */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium" style={{ color: branding?.textOnForeground || '#374151' }}>Currency</label>
          <div className="relative">
            <button
              onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
              className="flex items-center gap-2 px-3 py-1 border rounded-lg hover:opacity-80 transition-colors"
              style={{ 
                borderColor: branding?.accent_color || '#637752',
                backgroundColor: 'transparent',
                color: branding?.textOnForeground || '#374151'
              }}
            >
              <DollarSign className="w-4 h-4" />
              <span className="text-sm font-medium" style={{ color: branding?.textOnForeground || '#374151' }}>{currentCurrency.code}</span>
            </button>
            
            {showCurrencyDropdown && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[160px]">
                {CURRENCY_OPTIONS.map((currency) => (
                  <button
                    key={currency.code}
                    onClick={() => handleCurrencyChange(currency.code)}
                    className="w-full px-3 py-2 text-left hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{currency.symbol} {currency.code}</span>
                      <span className="text-xs text-gray-500">{currency.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pricing Tiers */}
      <div className="space-y-4 mb-6">
        <h3 className="text-lg font-semibold" style={{ 
          color: branding?.textOnForeground || '#111827',
          fontFamily: `var(--tenant-font, 'Inter')`
        }}>Pricing</h3>
        
        {pricingTiers.map((tier) => (
          <div key={tier.type} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: branding?.background_color || '#F9FAFB' }}>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium" style={{ color: branding?.textOnBackground || '#374151' }}>{tier.label}</span>
              {tier.type !== 'adult' && (
                <button
                  onClick={() => removePricingTier(tier.type as 'child' | 'student' | 'senior')}
                  className="text-red-500 hover:text-red-700 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {editingField === `price-${tier.type}` ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    <span className="text-sm mr-1" style={{ color: branding?.textOnBackground || '#6B7280' }}>{currentCurrency.symbol}</span>
                    <input
                      type="number"
                      value={tempValue}
                      onChange={(e) => setTempValue(e.target.value)}
                      className="w-20 px-2 py-1 text-sm border rounded focus:ring-2 focus:outline-none"
                      style={{
                        borderColor: branding?.accent_color || '#D1D5DB',
                        '--tw-ring-color': branding?.primary_color || '#3B82F6'
                      } as any}
                      min="0"
                      step="1"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveEdit(`price-${tier.type}`)
                        if (e.key === 'Escape') handleCancelEdit()
                      }}
                    />
                  </div>
                  <button
                    onClick={() => handleSaveEdit(`price-${tier.type}`)}
                    className="text-green-600 hover:text-green-800 transition-colors"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="text-red-600 hover:text-red-800 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold" style={{ color: branding?.textOnBackground || '#111827' }}>
                    {formatPrice(tier.price)}
                  </span>
                  <button
                    onClick={() => handleStartEdit(`price-${tier.type}`, tier.price.toString())}
                    className="hover:opacity-70 transition-colors"
                    style={{ color: branding?.primary_color || '#10B981' }}
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Add Pricing Tier Buttons */}
        <div className="flex flex-wrap gap-2">
          {!pricing.basePricing.child && (
            <button
              onClick={() => addPricingTier('child')}
              className="flex items-center gap-1 px-3 py-1 text-sm border rounded-lg hover:opacity-80 transition-colors"
              style={{
                color: branding?.primary_color || '#3B82F6',
                borderColor: branding?.primary_color || '#BFDBFE',
                backgroundColor: 'transparent'
              }}
            >
              <Plus className="w-3 h-3" />
              Add Child Price
            </button>
          )}
          {!pricing.basePricing.student && (
            <button
              onClick={() => addPricingTier('student')}
              className="flex items-center gap-1 px-3 py-1 text-sm border rounded-lg hover:opacity-80 transition-colors"
              style={{
                color: branding?.primary_color || '#3B82F6',
                borderColor: branding?.primary_color || '#BFDBFE',
                backgroundColor: 'transparent'
              }}
            >
              <Plus className="w-3 h-3" />
              Add Student Price
            </button>
          )}
          {!pricing.basePricing.senior && (
            <button
              onClick={() => addPricingTier('senior')}
              className="flex items-center gap-1 px-3 py-1 text-sm border rounded-lg hover:opacity-80 transition-colors"
              style={{
                color: branding?.primary_color || '#3B82F6',
                borderColor: branding?.primary_color || '#BFDBFE',
                backgroundColor: 'transparent'
              }}
            >
              <Plus className="w-3 h-3" />
              Add Senior Price
            </button>
          )}
        </div>
      </div>

      {/* Pricing Summary */}
      <div className="border-t pt-4" style={{ borderColor: branding?.accent_color || '#E5E7EB' }}>
        <div className="text-center">
          <div className="text-sm mb-1" style={{ color: branding?.textOnForeground || '#6B7280' }}>Starting from</div>
          <div className="text-3xl font-bold" style={{ color: branding?.textOnForeground || '#111827' }}>
            {formatPrice(Math.min(...pricingTiers.map(t => t.price)))}
          </div>
          <div className="text-sm" style={{ color: branding?.textOnForeground || '#6B7280' }}>per person</div>
        </div>
      </div>

      {/* Advanced Settings */}
      <div className="mt-6 pt-4 border-t" style={{ borderColor: branding?.accent_color || '#E5E7EB' }}>
        <button
          onClick={() => setShowAdvancedPanel(true)}
          className="w-full flex items-center justify-center gap-2 py-2 px-4 text-sm border rounded-lg hover:opacity-80 transition-colors mb-4"
          style={{
            color: branding?.textOnForeground || '#6B7280',
            borderColor: branding?.accent_color || '#E5E7EB',
            backgroundColor: 'transparent'
          }}
        >
          <Settings className="w-4 h-4" />
          Advanced Pricing Settings
        </button>
        
        <div className="text-center text-sm" style={{ color: branding?.textOnForeground || '#6B7280' }}>
          <p>Free cancellation up to {pricing.cancellationPolicy.freeCancellationHours}h</p>
          <p>No booking fees • Secure payment</p>
        </div>
      </div>

      {/* Advanced Pricing Panel */}
      <AdvancedPricingPanel
        pricing={pricing}
        onChange={onChange}
        isOpen={showAdvancedPanel}
        onClose={() => setShowAdvancedPanel(false)}
      />
    </div>
  )
}