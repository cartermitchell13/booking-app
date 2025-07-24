import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EditableHighlights } from '../EditableHighlights';

// No mocking needed since we're not using useInlineEdit

const mockBranding = {
  primary_color: '#10B981',
  textOnForeground: '#1F2937'
};

describe('EditableHighlights', () => {
  const defaultProps = {
    highlights: [],
    onChange: vi.fn(),
    branding: mockBranding
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders default highlights when no highlights provided', () => {
    render(<EditableHighlights {...defaultProps} />);
    
    expect(screen.getByText('Guided experience with expert staff')).toBeInTheDocument();
    expect(screen.getByText('Scenic views and photo opportunities')).toBeInTheDocument();
    expect(screen.getByText('Small group experience')).toBeInTheDocument();
    expect(screen.getByText('All safety equipment provided')).toBeInTheDocument();
    expect(screen.getByText('Professional service')).toBeInTheDocument();
    expect(screen.getByText('Memorable adventure')).toBeInTheDocument();
  });

  it('renders custom highlights when provided', () => {
    const customHighlights = ['Custom highlight 1', 'Custom highlight 2'];
    render(<EditableHighlights {...defaultProps} highlights={customHighlights} />);
    
    expect(screen.getByText('Custom highlight 1')).toBeInTheDocument();
    expect(screen.getByText('Custom highlight 2')).toBeInTheDocument();
    expect(screen.queryByText('Guided experience with expert staff')).not.toBeInTheDocument();
  });

  it('shows add highlight button', () => {
    render(<EditableHighlights {...defaultProps} />);
    
    expect(screen.getByText('Add highlight')).toBeInTheDocument();
  });

  it('enters edit mode when clicking on a highlight', async () => {
    const customHighlights = ['Editable highlight'];
    render(<EditableHighlights {...defaultProps} highlights={customHighlights} />);
    
    fireEvent.click(screen.getByText('Editable highlight'));
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('Editable highlight')).toBeInTheDocument();
    });
  });

  it('saves edited highlight on blur', async () => {
    const onChange = vi.fn();
    const customHighlights = ['Original highlight'];
    render(<EditableHighlights {...defaultProps} highlights={customHighlights} onChange={onChange} />);
    
    fireEvent.click(screen.getByText('Original highlight'));
    
    await waitFor(() => {
      const input = screen.getByDisplayValue('Original highlight');
      fireEvent.change(input, { target: { value: 'Updated highlight' } });
      fireEvent.blur(input);
    });
    
    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith(['Updated highlight']);
    });
  });

  it('saves edited highlight on Enter key', async () => {
    const onChange = vi.fn();
    const customHighlights = ['Original highlight'];
    render(<EditableHighlights {...defaultProps} highlights={customHighlights} onChange={onChange} />);
    
    fireEvent.click(screen.getByText('Original highlight'));
    
    await waitFor(() => {
      const input = screen.getByDisplayValue('Original highlight');
      fireEvent.change(input, { target: { value: 'Updated highlight' } });
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    });
    
    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith(['Updated highlight']);
    });
  });

  it('cancels edit on Escape key', async () => {
    const onChange = vi.fn();
    const customHighlights = ['Original highlight'];
    render(<EditableHighlights {...defaultProps} highlights={customHighlights} onChange={onChange} />);
    
    fireEvent.click(screen.getByText('Original highlight'));
    
    await waitFor(() => {
      const input = screen.getByDisplayValue('Original highlight');
      fireEvent.change(input, { target: { value: 'Updated highlight' } });
      fireEvent.keyDown(input, { key: 'Escape', code: 'Escape' });
    });
    
    await waitFor(() => {
      expect(screen.getByText('Original highlight')).toBeInTheDocument();
    });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('adds new highlight', async () => {
    const onChange = vi.fn();
    const customHighlights = ['Existing highlight'];
    render(<EditableHighlights {...defaultProps} highlights={customHighlights} onChange={onChange} />);
    
    fireEvent.click(screen.getByText('Add highlight'));
    
    await waitFor(() => {
      const input = screen.getByPlaceholderText('Click to add highlight');
      fireEvent.change(input, { target: { value: 'New highlight' } });
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    });
    
    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith(['Existing highlight', 'New highlight']);
    });
  });

  it('removes highlight when clicking remove button', async () => {
    const onChange = vi.fn();
    const customHighlights = ['Highlight 1', 'Highlight 2'];
    render(<EditableHighlights {...defaultProps} highlights={customHighlights} onChange={onChange} />);
    
    // Hover over the first highlight to show the remove button
    const firstHighlight = screen.getByText('Highlight 1').closest('.group');
    fireEvent.mouseEnter(firstHighlight!);
    
    await waitFor(() => {
      const removeButtons = screen.getAllByTitle('Remove highlight');
      fireEvent.click(removeButtons[0]); // Click the first remove button
    });
    
    expect(onChange).toHaveBeenCalledWith(['Highlight 2']);
  });

  it('respects maxItems limit', () => {
    const manyHighlights = Array.from({ length: 5 }, (_, i) => `Highlight ${i + 1}`);
    render(<EditableHighlights {...defaultProps} highlights={manyHighlights} maxItems={5} />);
    
    expect(screen.queryByText('Add highlight')).not.toBeInTheDocument();
  });

  it('shows edit and remove buttons on hover for custom highlights', async () => {
    const customHighlights = ['Custom highlight'];
    render(<EditableHighlights {...defaultProps} highlights={customHighlights} />);
    
    const highlightElement = screen.getByText('Custom highlight').closest('.group');
    fireEvent.mouseEnter(highlightElement!);
    
    await waitFor(() => {
      expect(screen.getByTitle('Edit highlight')).toBeInTheDocument();
      expect(screen.getByTitle('Remove highlight')).toBeInTheDocument();
    });
  });

  it('does not show remove buttons for default highlights', async () => {
    render(<EditableHighlights {...defaultProps} />);
    
    const highlightElement = screen.getByText('Guided experience with expert staff').closest('.group');
    fireEvent.mouseEnter(highlightElement!);
    
    await waitFor(() => {
      const editButtons = screen.getAllByTitle('Edit highlight');
      expect(editButtons.length).toBeGreaterThan(0);
      expect(screen.queryByTitle('Remove highlight')).not.toBeInTheDocument();
    });
  });

  it('shows helper text for default highlights', () => {
    render(<EditableHighlights {...defaultProps} />);
    
    expect(screen.getByText(/Click on any highlight to customize/)).toBeInTheDocument();
  });

  it('does not show helper text for custom highlights', () => {
    const customHighlights = ['Custom highlight'];
    render(<EditableHighlights {...defaultProps} highlights={customHighlights} />);
    
    expect(screen.queryByText(/Click on any highlight to customize/)).not.toBeInTheDocument();
  });
});