import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { EditablePricingSidebar } from '../EditablePricingSidebar'
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

describe('EditablePricingSidebar', () => {
  const mockOnChange = vi.fn()

  beforeEach(() => {
    mockOnChange.mockClear()
  })

  it('renders pricing tiers correctly', () => {
    render(
      <EditablePricingSidebar 
        pricing={mockPricing} 
        onChange={mockOnChange} 
      />
    )

    expect(screen.getByText('Adult')).toBeInTheDocument()
    expect(screen.getByText('Child')).toBeInTheDocument()
    expect(screen.getByText('$89')).toBeInTheDocument()
    expect(screen.getAllByText('$45')).toHaveLength(2) // One in tier, one in summary
  })

  it('displays current currency correctly', () => {
    render(
      <EditablePricingSidebar 
        pricing={mockPricing} 
        onChange={mockOnChange} 
      />
    )

    expect(screen.getByText('USD')).toBeInTheDocument()
  })

  it('allows editing adult price', async () => {
    render(
      <EditablePricingSidebar 
        pricing={mockPricing} 
        onChange={mockOnChange} 
      />
    )

    // Find and click the edit button for adult price
    const adultPriceText = screen.getByText('$89')
    const editButton = adultPriceText.parentElement?.querySelector('button')
    
    expect(editButton).toBeInTheDocument()
    fireEvent.click(editButton!)

    // Should show input field
    const input = screen.getByDisplayValue('89')
    expect(input).toBeInTheDocument()

    // Change the value
    fireEvent.change(input, { target: { value: '99' } })
    
    // Save the change by pressing Enter
    fireEvent.keyDown(input, { key: 'Enter' })

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith({
        ...mockPricing,
        basePricing: {
          ...mockPricing.basePricing,
          adult: 99
        }
      })
    })
  })

  it('allows changing currency', async () => {
    render(
      <EditablePricingSidebar 
        pricing={mockPricing} 
        onChange={mockOnChange} 
      />
    )

    // Click currency dropdown
    const currencyButton = screen.getByText('USD')
    fireEvent.click(currencyButton)

    // Select CAD
    const cadOption = screen.getByText('C$ CAD')
    fireEvent.click(cadOption)

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith({
        ...mockPricing,
        currency: 'CAD'
      })
    })
  })

  it('allows adding student pricing tier', async () => {
    render(
      <EditablePricingSidebar 
        pricing={mockPricing} 
        onChange={mockOnChange} 
      />
    )

    const addStudentButton = screen.getByText('Add Student Price')
    fireEvent.click(addStudentButton)

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith({
        ...mockPricing,
        basePricing: {
          ...mockPricing.basePricing,
          student: 0
        }
      })
    })
  })

  it('allows removing child pricing tier', async () => {
    render(
      <EditablePricingSidebar 
        pricing={mockPricing} 
        onChange={mockOnChange} 
      />
    )

    // Find the child section and its remove button
    const childText = screen.getByText('Child')
    const childSection = childText.closest('.flex')
    const removeButton = childSection?.querySelector('button')
    
    expect(removeButton).toBeInTheDocument()
    fireEvent.click(removeButton!)

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith({
        ...mockPricing,
        basePricing: {
          adult: 89
        }
      })
    })
  })

  it('cannot remove adult pricing tier', () => {
    render(
      <EditablePricingSidebar 
        pricing={mockPricing} 
        onChange={mockOnChange} 
      />
    )

    // Adult section should not have a trash/remove button
    const adultText = screen.getByText('Adult')
    const adultLeftSection = adultText.parentElement
    const trashButton = adultLeftSection?.querySelector('button')
    
    // Adult tier should not have a remove button in its left section
    expect(trashButton).toBeNull()
  })

  it('displays pricing summary with minimum price', () => {
    render(
      <EditablePricingSidebar 
        pricing={mockPricing} 
        onChange={mockOnChange} 
      />
    )

    // Should show the minimum price (child: $45) in summary section
    expect(screen.getByText('Starting from')).toBeInTheDocument()
    expect(screen.getAllByText('$45')).toHaveLength(2) // One in tier, one in summary
    expect(screen.getByText('per person')).toBeInTheDocument()
  })

  it('handles keyboard shortcuts in edit mode', async () => {
    render(
      <EditablePricingSidebar 
        pricing={mockPricing} 
        onChange={mockOnChange} 
      />
    )

    // Start editing adult price
    const adultPriceText = screen.getByText('$89')
    const editButton = adultPriceText.parentElement?.querySelector('button')
    
    expect(editButton).toBeInTheDocument()
    fireEvent.click(editButton!)

    const input = screen.getByDisplayValue('89')
    
    // Test Enter key to save
    fireEvent.change(input, { target: { value: '99' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith({
        ...mockPricing,
        basePricing: {
          ...mockPricing.basePricing,
          adult: 99
        }
      })
    })
  })

  it('handles escape key to cancel edit', () => {
    render(
      <EditablePricingSidebar 
        pricing={mockPricing} 
        onChange={mockOnChange} 
      />
    )

    // Start editing adult price
    const adultPriceText = screen.getByText('$89')
    const editButton = adultPriceText.parentElement?.querySelector('button')
    
    expect(editButton).toBeInTheDocument()
    fireEvent.click(editButton!)

    const input = screen.getByDisplayValue('89')
    
    // Test Escape key to cancel
    fireEvent.change(input, { target: { value: '99' } })
    fireEvent.keyDown(input, { key: 'Escape' })

    // Should not call onChange and should exit edit mode
    expect(mockOnChange).not.toHaveBeenCalled()
    expect(screen.queryByDisplayValue('99')).not.toBeInTheDocument()
  })

  it('displays cancellation policy information', () => {
    render(
      <EditablePricingSidebar 
        pricing={mockPricing} 
        onChange={mockOnChange} 
      />
    )

    expect(screen.getByText('Free cancellation up to 24h')).toBeInTheDocument()
    expect(screen.getByText('No booking fees • Secure payment')).toBeInTheDocument()
  })
})