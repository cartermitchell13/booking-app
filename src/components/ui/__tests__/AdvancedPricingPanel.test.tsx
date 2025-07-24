import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { AdvancedPricingPanel } from '../AdvancedPricingPanel'
import { PricingFormData } from '@/types/offering-form'

const mockPricing: PricingFormData = {
  basePricing: {
    adult: 89,
    child: 45
  },
  currency: 'USD',
  groupDiscounts: [],
  seasonalPricing: [],
  cancellationPolicy: {
    freeCancellationHours: 24,
    refundPercentage: 100,
    processingFee: 0
  },
  depositRequired: false,
  taxInclusive: false
}

describe('AdvancedPricingPanel', () => {
  const mockOnChange = vi.fn()
  const mockOnClose = vi.fn()

  beforeEach(() => {
    mockOnChange.mockClear()
    mockOnClose.mockClear()
  })

  it('renders when open', () => {
    render(
      <AdvancedPricingPanel 
        pricing={mockPricing} 
        onChange={mockOnChange}
        isOpen={true}
        onClose={mockOnClose}
      />
    )

    expect(screen.getByText('Advanced Pricing Configuration')).toBeInTheDocument()
    expect(screen.getByText('Tax & Fees')).toBeInTheDocument()
    expect(screen.getByText('Group Discounts')).toBeInTheDocument()
    expect(screen.getByText('Seasonal Pricing')).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    render(
      <AdvancedPricingPanel 
        pricing={mockPricing} 
        onChange={mockOnChange}
        isOpen={false}
        onClose={mockOnClose}
      />
    )

    expect(screen.queryByText('Advanced Pricing Configuration')).not.toBeInTheDocument()
  })

  it('allows toggling tax inclusive setting', async () => {
    render(
      <AdvancedPricingPanel 
        pricing={mockPricing} 
        onChange={mockOnChange}
        isOpen={true}
        onClose={mockOnClose}
      />
    )

    // Find the tax inclusive label and click on its associated checkbox
    const taxInclusiveLabel = screen.getByText('Tax Inclusive Pricing')
    const taxInclusiveSection = taxInclusiveLabel.closest('.flex')
    const taxInclusiveToggle = taxInclusiveSection?.querySelector('input[type="checkbox"]')
    
    expect(taxInclusiveToggle).toBeInTheDocument()
    fireEvent.click(taxInclusiveToggle!)

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith({
        ...mockPricing,
        taxInclusive: true
      })
    })
  })

  it('allows toggling deposit required setting', async () => {
    render(
      <AdvancedPricingPanel 
        pricing={mockPricing} 
        onChange={mockOnChange}
        isOpen={true}
        onClose={mockOnClose}
      />
    )

    // Find the deposit required label and click on its associated checkbox
    const depositLabel = screen.getByText('Deposit Required')
    const depositSection = depositLabel.closest('.flex')
    const depositToggle = depositSection?.querySelector('input[type="checkbox"]')
    
    expect(depositToggle).toBeInTheDocument()
    fireEvent.click(depositToggle!)

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith({
        ...mockPricing,
        depositRequired: true
      })
    })
  })

  it('shows deposit amount field when deposit is required', () => {
    const pricingWithDeposit = {
      ...mockPricing,
      depositRequired: true,
      depositAmount: 25
    }

    render(
      <AdvancedPricingPanel 
        pricing={pricingWithDeposit} 
        onChange={mockOnChange}
        isOpen={true}
        onClose={mockOnClose}
      />
    )

    expect(screen.getByDisplayValue('25')).toBeInTheDocument()
    expect(screen.getByText('Deposit Amount')).toBeInTheDocument()
  })

  it('allows switching to group discounts tab', () => {
    render(
      <AdvancedPricingPanel 
        pricing={mockPricing} 
        onChange={mockOnChange}
        isOpen={true}
        onClose={mockOnClose}
      />
    )

    const groupTab = screen.getByText('Group Discounts')
    fireEvent.click(groupTab)

    expect(screen.getByText('Add Discount')).toBeInTheDocument()
    expect(screen.getByText('No group discounts configured')).toBeInTheDocument()
  })

  it('allows adding group discounts', async () => {
    render(
      <AdvancedPricingPanel 
        pricing={mockPricing} 
        onChange={mockOnChange}
        isOpen={true}
        onClose={mockOnClose}
      />
    )

    // Switch to group discounts tab
    const groupTab = screen.getByText('Group Discounts')
    fireEvent.click(groupTab)

    // Add a discount
    const addButton = screen.getByText('Add Discount')
    fireEvent.click(addButton)

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith({
        ...mockPricing,
        groupDiscounts: [{
          minSize: 2,
          discount: 10,
          type: 'percentage'
        }]
      })
    })
  })

  it('allows switching to seasonal pricing tab', () => {
    render(
      <AdvancedPricingPanel 
        pricing={mockPricing} 
        onChange={mockOnChange}
        isOpen={true}
        onClose={mockOnClose}
      />
    )

    const seasonalTab = screen.getByText('Seasonal Pricing')
    fireEvent.click(seasonalTab)

    expect(screen.getByText('Add Season')).toBeInTheDocument()
    expect(screen.getByText('No seasonal pricing configured')).toBeInTheDocument()
  })

  it('allows adding seasonal pricing', async () => {
    render(
      <AdvancedPricingPanel 
        pricing={mockPricing} 
        onChange={mockOnChange}
        isOpen={true}
        onClose={mockOnClose}
      />
    )

    // Switch to seasonal pricing tab
    const seasonalTab = screen.getByText('Seasonal Pricing')
    fireEvent.click(seasonalTab)

    // Add a season
    const addButton = screen.getByText('Add Season')
    fireEvent.click(addButton)

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          ...mockPricing,
          seasonalPricing: expect.arrayContaining([
            expect.objectContaining({
              name: 'High Season',
              multiplier: 1.2
            })
          ])
        })
      )
    })
  })

  it('allows updating cancellation policy', async () => {
    render(
      <AdvancedPricingPanel 
        pricing={mockPricing} 
        onChange={mockOnChange}
        isOpen={true}
        onClose={mockOnClose}
      />
    )

    const freeCancellationInput = screen.getByDisplayValue('24')
    fireEvent.change(freeCancellationInput, { target: { value: '48' } })

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith({
        ...mockPricing,
        cancellationPolicy: {
          ...mockPricing.cancellationPolicy,
          freeCancellationHours: 48
        }
      })
    })
  })

  it('calls onClose when close button is clicked', () => {
    render(
      <AdvancedPricingPanel 
        pricing={mockPricing} 
        onChange={mockOnChange}
        isOpen={true}
        onClose={mockOnClose}
      />
    )

    const closeButton = screen.getByText('Close')
    fireEvent.click(closeButton)

    expect(mockOnClose).toHaveBeenCalled()
  })

  it('calls onClose when X button is clicked', () => {
    render(
      <AdvancedPricingPanel 
        pricing={mockPricing} 
        onChange={mockOnChange}
        isOpen={true}
        onClose={mockOnClose}
      />
    )

    // Find the X button in the header
    const xButton = screen.getByRole('button', { name: '' }) // X button has no text
    fireEvent.click(xButton)

    expect(mockOnClose).toHaveBeenCalled()
  })

  it('displays existing group discounts', () => {
    const pricingWithDiscounts = {
      ...mockPricing,
      groupDiscounts: [{
        minSize: 5,
        discount: 15,
        type: 'percentage' as const
      }]
    }

    render(
      <AdvancedPricingPanel 
        pricing={pricingWithDiscounts} 
        onChange={mockOnChange}
        isOpen={true}
        onClose={mockOnClose}
      />
    )

    // Switch to group discounts tab
    const groupTab = screen.getByText('Group Discounts')
    fireEvent.click(groupTab)

    expect(screen.getByText('Group Discount 1')).toBeInTheDocument()
    expect(screen.getByDisplayValue('5')).toBeInTheDocument()
    expect(screen.getByDisplayValue('15')).toBeInTheDocument()
  })

  it('displays existing seasonal pricing', () => {
    const pricingWithSeasonal = {
      ...mockPricing,
      seasonalPricing: [{
        name: 'Summer Peak',
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-08-31'),
        multiplier: 1.5
      }]
    }

    render(
      <AdvancedPricingPanel 
        pricing={pricingWithSeasonal} 
        onChange={mockOnChange}
        isOpen={true}
        onClose={mockOnClose}
      />
    )

    // Switch to seasonal pricing tab
    const seasonalTab = screen.getByText('Seasonal Pricing')
    fireEvent.click(seasonalTab)

    expect(screen.getByText('Summer Peak')).toBeInTheDocument()
    expect(screen.getByDisplayValue('1.5')).toBeInTheDocument()
    expect(screen.getByText('+50%')).toBeInTheDocument() // Price increase indicator
  })
})