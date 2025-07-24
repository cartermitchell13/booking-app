import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, beforeEach } from 'vitest';
import { EditablePickupLocations } from '../EditablePickupLocations';
import { PickupLocation } from '@/types/products';

// Mock the LocationSelect component
vi.mock('@/components/location-select', () => ({
  LocationSelect: ({ onChange, placeholder }: any) => (
    <div data-testid="location-select">
      <button onClick={() => onChange('test-location-id')}>
        {placeholder}
      </button>
    </div>
  )
}));

const mockBranding = {
  primary_color: '#3B82F6',
  textOnForeground: '#1F2937'
};

const mockPickupLocations: PickupLocation[] = [
  {
    name: 'Downtown Station',
    address: '123 Main St, Downtown',
    pickup_time_offset: 0
  },
  {
    name: 'Airport Terminal',
    address: '456 Airport Rd, Terminal 1',
    pickup_time_offset: -30
  }
];

describe('EditablePickupLocations', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders pickup locations correctly', () => {
    render(
      <EditablePickupLocations
        pickupLocations={mockPickupLocations}
        onChange={mockOnChange}
        branding={mockBranding}
      />
    );

    expect(screen.getByText('Downtown Station')).toBeInTheDocument();
    expect(screen.getByText('123 Main St, Downtown')).toBeInTheDocument();
    expect(screen.getByText('Airport Terminal')).toBeInTheDocument();
    expect(screen.getByText('456 Airport Rd, Terminal 1')).toBeInTheDocument();
  });

  it('displays time offsets correctly', () => {
    render(
      <EditablePickupLocations
        pickupLocations={mockPickupLocations}
        onChange={mockOnChange}
        branding={mockBranding}
      />
    );

    expect(screen.getByText('Departure time')).toBeInTheDocument();
    expect(screen.getByText('-30min')).toBeInTheDocument();
  });

  it('shows default locations when no locations provided', () => {
    render(
      <EditablePickupLocations
        pickupLocations={[]}
        onChange={mockOnChange}
        branding={mockBranding}
      />
    );

    expect(screen.getByText('Downtown Transit Station')).toBeInTheDocument();
    expect(screen.getByText('Airport Terminal')).toBeInTheDocument();
    expect(screen.getByText('Click on any pickup location to customize, or add your own locations above.')).toBeInTheDocument();
  });

  it('enters edit mode when clicking on a location', async () => {
    const user = userEvent.setup();
    
    render(
      <EditablePickupLocations
        pickupLocations={mockPickupLocations}
        onChange={mockOnChange}
        branding={mockBranding}
      />
    );

    await user.click(screen.getByText('Downtown Station'));

    expect(screen.getByDisplayValue('Downtown Station')).toBeInTheDocument();
    expect(screen.getByDisplayValue('123 Main St, Downtown')).toBeInTheDocument();
    // Time picker shows hours and minutes separately
    expect(screen.getByDisplayValue('0')).toBeInTheDocument(); // hours
  });

  it('saves edited location', async () => {
    const user = userEvent.setup();
    
    render(
      <EditablePickupLocations
        pickupLocations={mockPickupLocations}
        onChange={mockOnChange}
        branding={mockBranding}
      />
    );

    await user.click(screen.getByText('Downtown Station'));
    
    const nameInput = screen.getByDisplayValue('Downtown Station');
    await user.clear(nameInput);
    await user.type(nameInput, 'Updated Station');
    
    await user.click(screen.getByText('Save'));

    expect(mockOnChange).toHaveBeenCalledWith([
      {
        name: 'Updated Station',
        address: '123 Main St, Downtown',
        pickup_time_offset: 0
      },
      mockPickupLocations[1]
    ]);
  });

  it('cancels edit mode', async () => {
    const user = userEvent.setup();
    
    render(
      <EditablePickupLocations
        pickupLocations={mockPickupLocations}
        onChange={mockOnChange}
        branding={mockBranding}
      />
    );

    await user.click(screen.getByText('Downtown Station'));
    
    const nameInput = screen.getByDisplayValue('Downtown Station');
    await user.clear(nameInput);
    await user.type(nameInput, 'Updated Station');
    
    await user.click(screen.getByText('Cancel'));

    expect(screen.getByText('Downtown Station')).toBeInTheDocument();
    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it('adds new pickup location', async () => {
    const user = userEvent.setup();
    
    render(
      <EditablePickupLocations
        pickupLocations={mockPickupLocations}
        onChange={mockOnChange}
        branding={mockBranding}
      />
    );

    await user.click(screen.getByText('Add pickup location'));

    const nameInput = screen.getByPlaceholderText('Location name');
    const addressInput = screen.getByPlaceholderText('Full address');
    
    await user.type(nameInput, 'New Station');
    await user.type(addressInput, '789 New St, City');
    
    // Find the minutes input in the time picker and set it to 15
    const minutesInputs = screen.getAllByDisplayValue('0');
    const minutesInput = minutesInputs[1]; // Second input should be minutes
    await user.clear(minutesInput);
    await user.type(minutesInput, '15');

    await user.click(screen.getByText('Add Location'));

    expect(mockOnChange).toHaveBeenCalledWith([
      ...mockPickupLocations,
      {
        name: 'New Station',
        address: '789 New St, City',
        pickup_time_offset: 15
      }
    ]);
  });

  it('removes pickup location', async () => {
    const user = userEvent.setup();
    
    render(
      <EditablePickupLocations
        pickupLocations={mockPickupLocations}
        onChange={mockOnChange}
        branding={mockBranding}
      />
    );

    // Hover to show remove button
    const locationDiv = screen.getByText('Downtown Station').closest('.group');
    await user.hover(locationDiv!);

    const removeButtons = screen.getAllByTitle('Remove pickup location');
    await user.click(removeButtons[0]);

    expect(mockOnChange).toHaveBeenCalledWith([mockPickupLocations[1]]);
  });

  it('handles keyboard navigation', async () => {
    const user = userEvent.setup();
    
    render(
      <EditablePickupLocations
        pickupLocations={mockPickupLocations}
        onChange={mockOnChange}
        branding={mockBranding}
      />
    );

    await user.click(screen.getByText('Downtown Station'));
    
    const nameInput = screen.getByDisplayValue('Downtown Station');
    await user.clear(nameInput);
    await user.type(nameInput, 'Updated Station');
    
    await user.keyboard('{Enter}');

    expect(mockOnChange).toHaveBeenCalledWith([
      {
        name: 'Updated Station',
        address: '123 Main St, Downtown',
        pickup_time_offset: 0
      },
      mockPickupLocations[1]
    ]);
  });

  it('handles escape key to cancel', async () => {
    const user = userEvent.setup();
    
    render(
      <EditablePickupLocations
        pickupLocations={mockPickupLocations}
        onChange={mockOnChange}
        branding={mockBranding}
      />
    );

    await user.click(screen.getByText('Downtown Station'));
    
    const nameInput = screen.getByDisplayValue('Downtown Station');
    await user.clear(nameInput);
    await user.type(nameInput, 'Updated Station');
    
    await user.keyboard('{Escape}');

    expect(screen.getByText('Downtown Station')).toBeInTheDocument();
    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it('formats time offsets correctly', () => {
    const locationsWithVariousOffsets: PickupLocation[] = [
      { name: 'Location 1', address: 'Address 1', pickup_time_offset: 0 },
      { name: 'Location 2', address: 'Address 2', pickup_time_offset: 30 },
      { name: 'Location 3', address: 'Address 3', pickup_time_offset: -45 },
      { name: 'Location 4', address: 'Address 4', pickup_time_offset: 90 },
      { name: 'Location 5', address: 'Address 5', pickup_time_offset: -120 }
    ];

    render(
      <EditablePickupLocations
        pickupLocations={locationsWithVariousOffsets}
        onChange={mockOnChange}
        branding={mockBranding}
      />
    );

    expect(screen.getByText('Departure time')).toBeInTheDocument();
    expect(screen.getByText('+30min')).toBeInTheDocument();
    expect(screen.getByText('-45min')).toBeInTheDocument();
    expect(screen.getByText('+1h 30min')).toBeInTheDocument();
    expect(screen.getByText('-2h')).toBeInTheDocument();
  });

  it('respects maxLocations limit', async () => {
    const user = userEvent.setup();
    
    render(
      <EditablePickupLocations
        pickupLocations={mockPickupLocations}
        onChange={mockOnChange}
        branding={mockBranding}
        maxLocations={2}
      />
    );

    expect(screen.queryByText('Add pickup location')).not.toBeInTheDocument();
  });

  it('validates required fields when saving', async () => {
    const user = userEvent.setup();
    
    render(
      <EditablePickupLocations
        pickupLocations={mockPickupLocations}
        onChange={mockOnChange}
        branding={mockBranding}
      />
    );

    await user.click(screen.getByText('Add pickup location'));

    // Try to save without filling required fields
    await user.click(screen.getByText('Add Location'));

    // Should show validation errors
    expect(screen.getByText('Location name is required')).toBeInTheDocument();
    expect(screen.getByText('Address is required')).toBeInTheDocument();
    
    // Should not call onChange if required fields are empty
    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it('shows location picker when toggle button is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <EditablePickupLocations
        pickupLocations={mockPickupLocations}
        onChange={mockOnChange}
        branding={mockBranding}
      />
    );

    await user.click(screen.getByText('Add pickup location'));
    await user.click(screen.getByText('Pick Location'));

    expect(screen.getByTestId('location-select')).toBeInTheDocument();
  });

  it('validates field length limits', async () => {
    const user = userEvent.setup();
    
    render(
      <EditablePickupLocations
        pickupLocations={mockPickupLocations}
        onChange={mockOnChange}
        branding={mockBranding}
      />
    );

    await user.click(screen.getByText('Add pickup location'));

    const nameInput = screen.getByPlaceholderText('Location name');
    const addressInput = screen.getByPlaceholderText('Full address');
    
    // Test name length validation (over 100 chars)
    await user.type(nameInput, 'a'.repeat(101));
    await user.type(addressInput, 'Valid address');
    
    await user.click(screen.getByText('Add Location'));

    expect(screen.getByText('Location name must be 100 characters or less')).toBeInTheDocument();
    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it('validates time offset limits', async () => {
    const user = userEvent.setup();
    
    render(
      <EditablePickupLocations
        pickupLocations={mockPickupLocations}
        onChange={mockOnChange}
        branding={mockBranding}
      />
    );

    await user.click(screen.getByText('Add pickup location'));

    const nameInput = screen.getByPlaceholderText('Location name');
    const addressInput = screen.getByPlaceholderText('Full address');
    
    await user.type(nameInput, 'Valid Name');
    await user.type(addressInput, 'Valid Address');
    
    // Set time offset to over 24 hours (1440 minutes)
    const hoursInputs = screen.getAllByDisplayValue('0');
    const hoursInput = hoursInputs[0]; // First input should be hours
    await user.clear(hoursInput);
    await user.type(hoursInput, '25'); // 25 hours = 1500 minutes > 1440
    
    await user.click(screen.getByText('Add Location'));

    expect(screen.getByText('Time offset cannot exceed 24 hours')).toBeInTheDocument();
    expect(mockOnChange).not.toHaveBeenCalled();
  });
});