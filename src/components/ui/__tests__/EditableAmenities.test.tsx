import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EditableAmenities } from '../EditableAmenities';

// No mocking needed since we're not using useInlineEdit

const mockBranding = {
  primary_color: '#10B981',
  textOnForeground: '#1F2937'
};

describe('EditableAmenities', () => {
  const defaultProps = {
    amenities: [],
    onChange: vi.fn(),
    branding: mockBranding
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders default amenities when no amenities provided', () => {
    render(<EditableAmenities {...defaultProps} />);
    
    expect(screen.getByText('Transportation')).toBeInTheDocument();
    expect(screen.getByText('Professional guide')).toBeInTheDocument();
    expect(screen.getByText('All safety equipment')).toBeInTheDocument();
    expect(screen.getByText('Park entry fees')).toBeInTheDocument();
    expect(screen.getByText('Light refreshments')).toBeInTheDocument();
    expect(screen.getByText('Photo opportunities')).toBeInTheDocument();
  });

  it('renders custom amenities when provided', () => {
    const customAmenities = ['customAmenity1', 'customAmenity2'];
    render(<EditableAmenities {...defaultProps} amenities={customAmenities} />);
    
    expect(screen.getByText('Custom Amenity1')).toBeInTheDocument();
    expect(screen.getByText('Custom Amenity2')).toBeInTheDocument();
    expect(screen.queryByText('Transportation')).not.toBeInTheDocument();
  });

  it('formats camelCase amenities correctly', () => {
    const camelCaseAmenities = ['wifiIncluded', 'parkingAvailable'];
    render(<EditableAmenities {...defaultProps} amenities={camelCaseAmenities} />);
    
    expect(screen.getByText('Wifi Included')).toBeInTheDocument();
    expect(screen.getByText('Parking Available')).toBeInTheDocument();
  });

  it('shows add amenity button', () => {
    render(<EditableAmenities {...defaultProps} />);
    
    expect(screen.getByText('Add amenity')).toBeInTheDocument();
  });

  it('enters edit mode when clicking on an amenity', async () => {
    const customAmenities = ['editableAmenity'];
    render(<EditableAmenities {...defaultProps} amenities={customAmenities} />);
    
    fireEvent.click(screen.getByText('Editable Amenity'));
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('editableAmenity')).toBeInTheDocument();
    });
  });

  it('saves edited amenity on blur', async () => {
    const onChange = vi.fn();
    const customAmenities = ['originalAmenity'];
    render(<EditableAmenities {...defaultProps} amenities={customAmenities} onChange={onChange} />);
    
    fireEvent.click(screen.getByText('Original Amenity'));
    
    await waitFor(() => {
      const input = screen.getByDisplayValue('originalAmenity');
      fireEvent.change(input, { target: { value: 'updatedAmenity' } });
      fireEvent.blur(input);
    });
    
    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith(['updatedAmenity']);
    });
  });

  it('saves edited amenity on Enter key', async () => {
    const onChange = vi.fn();
    const customAmenities = ['originalAmenity'];
    render(<EditableAmenities {...defaultProps} amenities={customAmenities} onChange={onChange} />);
    
    fireEvent.click(screen.getByText('Original Amenity'));
    
    await waitFor(() => {
      const input = screen.getByDisplayValue('originalAmenity');
      fireEvent.change(input, { target: { value: 'updatedAmenity' } });
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    });
    
    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith(['updatedAmenity']);
    });
  });

  it('cancels edit on Escape key', async () => {
    const onChange = vi.fn();
    const customAmenities = ['originalAmenity'];
    render(<EditableAmenities {...defaultProps} amenities={customAmenities} onChange={onChange} />);
    
    fireEvent.click(screen.getByText('Original Amenity'));
    
    await waitFor(() => {
      const input = screen.getByDisplayValue('originalAmenity');
      fireEvent.change(input, { target: { value: 'updatedAmenity' } });
      fireEvent.keyDown(input, { key: 'Escape', code: 'Escape' });
    });
    
    await waitFor(() => {
      expect(screen.getByText('Original Amenity')).toBeInTheDocument();
    });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('adds new amenity', async () => {
    const onChange = vi.fn();
    const customAmenities = ['existingAmenity'];
    render(<EditableAmenities {...defaultProps} amenities={customAmenities} onChange={onChange} />);
    
    fireEvent.click(screen.getByText('Add amenity'));
    
    await waitFor(() => {
      const input = screen.getByPlaceholderText('Click to add amenity');
      fireEvent.change(input, { target: { value: 'newAmenity' } });
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    });
    
    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith(['existingAmenity', 'newAmenity']);
    });
  });

  it('removes amenity when clicking remove button', async () => {
    const onChange = vi.fn();
    const customAmenities = ['amenity1', 'amenity2'];
    render(<EditableAmenities {...defaultProps} amenities={customAmenities} onChange={onChange} />);
    
    // Hover over the first amenity to show the remove button
    const firstAmenity = screen.getByText('Amenity1').closest('.group');
    fireEvent.mouseEnter(firstAmenity!);
    
    await waitFor(() => {
      const removeButtons = screen.getAllByTitle('Remove amenity');
      fireEvent.click(removeButtons[0]); // Click the first remove button
    });
    
    expect(onChange).toHaveBeenCalledWith(['amenity2']);
  });

  it('respects maxItems limit', () => {
    const manyAmenities = Array.from({ length: 5 }, (_, i) => `amenity${i + 1}`);
    render(<EditableAmenities {...defaultProps} amenities={manyAmenities} maxItems={5} />);
    
    expect(screen.queryByText('Add amenity')).not.toBeInTheDocument();
  });

  it('shows quick add suggestions', () => {
    render(<EditableAmenities {...defaultProps} />);
    
    expect(screen.getByText('Quick add common amenities:')).toBeInTheDocument();
    expect(screen.getByText('+ WiFi included')).toBeInTheDocument();
    expect(screen.getByText('+ Parking available')).toBeInTheDocument();
  });

  it('adds amenity from quick suggestions', async () => {
    const onChange = vi.fn();
    render(<EditableAmenities {...defaultProps} onChange={onChange} />);
    
    fireEvent.click(screen.getByText('+ WiFi included'));
    
    expect(onChange).toHaveBeenCalledWith(['WiFi included']);
  });

  it('filters out existing amenities from quick suggestions', () => {
    const customAmenities = ['WiFi included'];
    render(<EditableAmenities {...defaultProps} amenities={customAmenities} />);
    
    expect(screen.queryByText('+ WiFi included')).not.toBeInTheDocument();
    expect(screen.getByText('+ Parking available')).toBeInTheDocument();
  });

  it('shows edit and remove buttons on hover for custom amenities', async () => {
    const customAmenities = ['customAmenity'];
    render(<EditableAmenities {...defaultProps} amenities={customAmenities} />);
    
    const amenityElement = screen.getByText('Custom Amenity').closest('.group');
    fireEvent.mouseEnter(amenityElement!);
    
    await waitFor(() => {
      expect(screen.getByTitle('Edit amenity')).toBeInTheDocument();
      expect(screen.getByTitle('Remove amenity')).toBeInTheDocument();
    });
  });

  it('does not show remove buttons for default amenities', async () => {
    render(<EditableAmenities {...defaultProps} />);
    
    const amenityElement = screen.getByText('Transportation').closest('.group');
    fireEvent.mouseEnter(amenityElement!);
    
    await waitFor(() => {
      const editButtons = screen.getAllByTitle('Edit amenity');
      expect(editButtons.length).toBeGreaterThan(0);
      expect(screen.queryByTitle('Remove amenity')).not.toBeInTheDocument();
    });
  });

  it('shows helper text for default amenities', () => {
    render(<EditableAmenities {...defaultProps} />);
    
    expect(screen.getByText(/Click on any amenity to customize/)).toBeInTheDocument();
  });

  it('does not show helper text for custom amenities', () => {
    const customAmenities = ['customAmenity'];
    render(<EditableAmenities {...defaultProps} amenities={customAmenities} />);
    
    expect(screen.queryByText(/Click on any amenity to customize/)).not.toBeInTheDocument();
  });
});