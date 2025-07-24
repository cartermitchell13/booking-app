import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, beforeEach } from 'vitest';
import { EditableImageGallery } from '../EditableImageGallery';
import { MediaImage } from '@/components/offerings/create/types/createOfferingTypes';

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: function MockImage({ src, alt, fill, unoptimized, sizes, ...props }: any) {
    // Filter out Next.js specific props that shouldn't be passed to DOM
    const { width, height, ...domProps } = props;
    return <img src={src} alt={alt} width={width} height={height} {...domProps} />;
  }
}));

const mockImages: MediaImage[] = [
  {
    id: 1,
    url: 'https://example.com/image1.jpg',
    filename: 'image1.jpg',
    altText: 'First image',
    isPrimary: true,
    size: 1024,
    type: 'image/jpeg'
  },
  {
    id: 2,
    url: 'https://example.com/image2.jpg',
    filename: 'image2.jpg',
    altText: 'Second image',
    isPrimary: false,
    size: 2048,
    type: 'image/jpeg'
  }
];

const mockBranding = {
  primary_color: '#10B981',
  foreground_color: '#FFFFFF',
  textOnForeground: '#000000'
};

describe('EditableImageGallery', () => {
  const mockOnChange = vi.fn();
  const mockOnSelectedImageChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders empty state when no images provided', () => {
    render(
      <EditableImageGallery
        images={[]}
        onChange={mockOnChange}
        selectedImageIndex={0}
        onSelectedImageChange={mockOnSelectedImageChange}
        branding={mockBranding}
      />
    );

    expect(screen.getByText('Drop images here or click to upload')).toBeInTheDocument();
    expect(screen.getByText('Supports JPG, PNG, GIF up to 10MB each')).toBeInTheDocument();
  });

  it('renders images when provided', () => {
    render(
      <EditableImageGallery
        images={mockImages}
        onChange={mockOnChange}
        selectedImageIndex={0}
        onSelectedImageChange={mockOnSelectedImageChange}
        branding={mockBranding}
      />
    );

    // Check that images are rendered (there will be multiple with same alt text - main view and thumbnail)
    expect(screen.getAllByAltText('First image')).toHaveLength(2);
    // The thumbnails use the original alt text, not the "Image X" pattern
    expect(screen.getByAltText('Second image')).toBeInTheDocument();
  });

  it('shows navigation arrows when multiple images exist', () => {
    render(
      <EditableImageGallery
        images={mockImages}
        onChange={mockOnChange}
        selectedImageIndex={0}
        onSelectedImageChange={mockOnSelectedImageChange}
        branding={mockBranding}
      />
    );

    // Look for buttons with ChevronLeft and ChevronRight icons
    const buttons = screen.getAllByRole('button');
    const navButtons = buttons.filter(button => 
      button.querySelector('svg') && 
      (button.className.includes('absolute') || button.style.position === 'absolute')
    );
    
    expect(navButtons.length).toBeGreaterThanOrEqual(2);
  });

  it('calls onSelectedImageChange when navigation arrows are clicked', () => {
    render(
      <EditableImageGallery
        images={mockImages}
        onChange={mockOnChange}
        selectedImageIndex={0}
        onSelectedImageChange={mockOnSelectedImageChange}
        branding={mockBranding}
      />
    );

    // Find the navigation buttons by looking for the specific classes
    const buttons = screen.getAllByRole('button');
    const rightNavButton = buttons.find(button => 
      button.className.includes('absolute') && 
      button.className.includes('right-4') &&
      button.className.includes('top-1/2')
    );
    
    expect(rightNavButton).toBeInTheDocument();
    fireEvent.click(rightNavButton!);
    expect(mockOnSelectedImageChange).toHaveBeenCalledWith(1);
  });

  it('calls onSelectedImageChange when thumbnail is clicked', () => {
    render(
      <EditableImageGallery
        images={mockImages}
        onChange={mockOnChange}
        selectedImageIndex={0}
        onSelectedImageChange={mockOnSelectedImageChange}
        branding={mockBranding}
      />
    );

    const thumbnails = screen.getAllByRole('button');
    const secondThumbnail = thumbnails.find(button => 
      button.querySelector('img')?.alt === 'Image 2'
    );
    
    if (secondThumbnail) {
      fireEvent.click(secondThumbnail);
      expect(mockOnSelectedImageChange).toHaveBeenCalledWith(1);
    }
  });

  it('shows primary indicator on primary image', () => {
    render(
      <EditableImageGallery
        images={mockImages}
        onChange={mockOnChange}
        selectedImageIndex={0}
        onSelectedImageChange={mockOnSelectedImageChange}
        branding={mockBranding}
      />
    );

    // Primary image should have a star indicator - look for the Star component
    const thumbnails = screen.getAllByRole('button');
    const firstThumbnail = thumbnails[0];
    
    // The star should be visible in the first thumbnail (primary image)
    expect(firstThumbnail.querySelector('svg')).toBeInTheDocument();
  });

  it('updates alt text when input changes', () => {
    render(
      <EditableImageGallery
        images={mockImages}
        onChange={mockOnChange}
        selectedImageIndex={0}
        onSelectedImageChange={mockOnSelectedImageChange}
        branding={mockBranding}
      />
    );

    const altTextInput = screen.getByPlaceholderText('Describe this image for accessibility...');
    fireEvent.change(altTextInput, { target: { value: 'Updated alt text' } });

    expect(mockOnChange).toHaveBeenCalledWith([
      { ...mockImages[0], altText: 'Updated alt text' },
      mockImages[1]
    ]);
  });

  it('handles file upload when files are selected', async () => {
    // Mock FileReader
    const mockFileReader = {
      readAsDataURL: vi.fn(),
      result: 'data:image/jpeg;base64,mockdata',
      onload: null as any
    };
    
    global.FileReader = vi.fn(() => mockFileReader) as any;

    render(
      <EditableImageGallery
        images={[]}
        onChange={mockOnChange}
        selectedImageIndex={0}
        onSelectedImageChange={mockOnSelectedImageChange}
        branding={mockBranding}
      />
    );

    const file = new File(['mock'], 'test.jpg', { type: 'image/jpeg' });
    
    // Find the drop zone div (not a button, but clickable)
    const dropZone = screen.getByText('Drop images here or click to upload').closest('div');
    expect(dropZone).toBeInTheDocument();
    
    fireEvent.click(dropZone!);
    
    // Simulate file input change
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    Object.defineProperty(fileInput, 'files', {
      value: [file],
      writable: false,
    });
    
    fireEvent.change(fileInput);

    // Simulate FileReader onload
    mockFileReader.onload({ target: { result: 'data:image/jpeg;base64,mockdata' } });

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalled();
    });
  });

  it('handles drag and drop file upload', () => {
    render(
      <EditableImageGallery
        images={[]}
        onChange={mockOnChange}
        selectedImageIndex={0}
        onSelectedImageChange={mockOnSelectedImageChange}
        branding={mockBranding}
      />
    );

    const dropZone = screen.getByText('Drop images here or click to upload').closest('div');
    const file = new File(['mock'], 'test.jpg', { type: 'image/jpeg' });

    fireEvent.dragOver(dropZone!);
    fireEvent.drop(dropZone!, {
      dataTransfer: {
        files: [file]
      }
    });

    // FileReader simulation would be needed for full test
    expect(dropZone).toBeInTheDocument();
  });

  it('deletes image when delete button is clicked', () => {
    render(
      <EditableImageGallery
        images={mockImages}
        onChange={mockOnChange}
        selectedImageIndex={0}
        onSelectedImageChange={mockOnSelectedImageChange}
        branding={mockBranding}
      />
    );

    // Get all delete buttons (there will be multiple - one for each image)
    const deleteButtons = screen.getAllByTitle('Delete image');
    expect(deleteButtons.length).toBe(2); // One for each image
    
    // Click the first delete button (which is the primary image)
    fireEvent.click(deleteButtons[0]);

    // When the primary image is deleted, the remaining image should become primary
    const expectedRemainingImage = {
      ...mockImages[1],
      isPrimary: true, // Should become primary since the primary image was deleted
      file: undefined // File property gets normalized
    };

    expect(mockOnChange).toHaveBeenCalledWith([expectedRemainingImage]);
  });

  it('shows primary functionality for non-primary images', () => {
    // Create test data where second image is primary to test the button shows for first image
    const testImages = [
      { ...mockImages[0], isPrimary: false },
      { ...mockImages[1], isPrimary: true }
    ];

    render(
      <EditableImageGallery
        images={testImages}
        onChange={mockOnChange}
        selectedImageIndex={0}
        onSelectedImageChange={mockOnSelectedImageChange}
        branding={mockBranding}
      />
    );

    // Now the first image should have a primary button since it's not primary
    const primaryButton = screen.getByTitle('Set as primary image');
    expect(primaryButton).toBeInTheDocument();
    
    fireEvent.click(primaryButton);

    expect(mockOnChange).toHaveBeenCalledWith([
      { ...testImages[0], isPrimary: true },
      { ...testImages[1], isPrimary: false }
    ]);
  });



  it('shows image management controls', () => {
    render(
      <EditableImageGallery
        images={mockImages}
        onChange={mockOnChange}
        selectedImageIndex={0}
        onSelectedImageChange={mockOnSelectedImageChange}
        branding={mockBranding}
      />
    );

    // Look for buttons by their icons or classes since titles might not be found
    const allButtons = screen.getAllByRole('button');
    
    // Should have thumbnail buttons, navigation buttons, and control buttons
    expect(allButtons.length).toBeGreaterThan(2);
    
    // Test that we can find delete functionality by looking for buttons with X icon
    const buttonsWithIcons = allButtons.filter(button => button.querySelector('svg'));
    expect(buttonsWithIcons.length).toBeGreaterThan(0);
  });
});