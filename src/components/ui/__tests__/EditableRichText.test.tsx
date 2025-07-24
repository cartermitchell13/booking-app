import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { EditableRichText } from '../EditableRichText';

describe('EditableRichText', () => {
  const defaultProps = {
    value: '<p>Test content</p>',
    onChange: vi.fn(),
  };

  it('renders display content correctly', () => {
    render(<EditableRichText {...defaultProps} />);
    
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('shows empty text when value is empty', () => {
    render(
      <EditableRichText 
        {...defaultProps} 
        value="" 
        emptyText="Click to add description" 
      />
    );
    
    expect(screen.getByText('Click to add description')).toBeInTheDocument();
  });

  it('enters edit mode when clicked', async () => {
    render(<EditableRichText {...defaultProps} />);
    
    const displayElement = screen.getByText('Test content');
    fireEvent.click(displayElement);
    
    // Should show contentEditable div
    await waitFor(() => {
      const editableDiv = document.querySelector('[contenteditable="true"]');
      expect(editableDiv).toBeInTheDocument();
    });
  });

  it('shows formatting toolbar when in edit mode', async () => {
    render(<EditableRichText {...defaultProps} />);
    
    const displayElement = screen.getByText('Test content');
    fireEvent.click(displayElement);
    
    // Should show toolbar with formatting buttons
    await waitFor(() => {
      expect(screen.getByTitle('Bold')).toBeInTheDocument();
      expect(screen.getByTitle('Italic')).toBeInTheDocument();
      expect(screen.getByTitle('Underline')).toBeInTheDocument();
    });
  });

  it('calls onChange when content is saved', async () => {
    const onChange = vi.fn();
    render(<EditableRichText {...defaultProps} onChange={onChange} />);
    
    const displayElement = screen.getByText('Test content');
    fireEvent.click(displayElement);
    
    await waitFor(() => {
      const editableDiv = document.querySelector('[contenteditable="true"]');
      expect(editableDiv).toBeInTheDocument();
    });

    // Simulate content change
    const editableDiv = document.querySelector('[contenteditable="true"]') as HTMLElement;
    if (editableDiv) {
      editableDiv.innerHTML = '<p>Modified content</p>';
      fireEvent.input(editableDiv);
      
      // Trigger save by clicking save button or pressing Ctrl+Enter
      fireEvent.keyDown(editableDiv, { key: 'Enter', ctrlKey: true });
    }

    await waitFor(() => {
      expect(onChange).toHaveBeenCalled();
    });
  });

  it('shows auto-save indicator when auto-save is enabled', async () => {
    render(
      <EditableRichText 
        {...defaultProps} 
        autoSave={true} 
        showSaveIndicator={true}
      />
    );
    
    const displayElement = screen.getByText('Test content');
    fireEvent.click(displayElement);
    
    await waitFor(() => {
      expect(screen.getByText('Auto-saving enabled • Press Escape to cancel')).toBeInTheDocument();
    });
  });

  it('handles escape key to cancel editing', async () => {
    render(<EditableRichText {...defaultProps} />);
    
    const displayElement = screen.getByText('Test content');
    fireEvent.click(displayElement);
    
    await waitFor(() => {
      const editableDiv = document.querySelector('[contenteditable="true"]');
      expect(editableDiv).toBeInTheDocument();
    });

    // Press escape
    const editableDiv = document.querySelector('[contenteditable="true"]') as HTMLElement;
    if (editableDiv) {
      fireEvent.keyDown(editableDiv, { key: 'Escape' });
    }

    // Should exit edit mode
    await waitFor(() => {
      expect(document.querySelector('[contenteditable="true"]')).not.toBeInTheDocument();
    });
  });
});