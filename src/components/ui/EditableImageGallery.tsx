import React, { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import {
  Camera,
  ChevronLeft,
  ChevronRight,
  Upload,
  X,
  Star,
  Edit3,
  GripVertical
} from 'lucide-react';
import { MediaImage } from '@/components/offerings/create/types/createOfferingTypes';

interface EditableImageGalleryProps {
  images: MediaImage[];
  onChange: (images: MediaImage[]) => void;
  selectedImageIndex: number;
  onSelectedImageChange: (index: number) => void;
  className?: string;
  style?: React.CSSProperties;
  branding?: {
    primary_color?: string;
    foreground_color?: string;
    textOnForeground?: string;
  };
}

// Helper function to normalize image data
const normalizeImage = (image: any, index: number): MediaImage => {
  return {
    id: image.id ?? Date.now() + index,
    url: image.url || '',
    file: image.file,
    filename: image.filename || image.name || `image-${index + 1}`,
    altText: image.altText || image.alt || '',
    isPrimary: image.isPrimary || false,
    size: image.size ?? 0,
    type: image.type || 'image/jpeg'
  };
};

export const EditableImageGallery: React.FC<EditableImageGalleryProps> = ({
  images: rawImages,
  onChange,
  selectedImageIndex,
  onSelectedImageChange,
  className = '',
  style,
  branding = {}
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Normalize images to ensure consistent data structure
  const images = rawImages.map((img, index) => normalizeImage(img, index));

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files) return;

    const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
    if (imageFiles.length === 0) return;

    const newImages: MediaImage[] = [];
    let processedCount = 0;
    
    imageFiles.forEach((file, index) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const url = e.target?.result as string;
        
        const newImage: MediaImage = {
          id: Date.now() + index,
          url,
          file,
          filename: file.name,
          altText: '',
          isPrimary: images.length === 0 && index === 0, // First image is primary if no images exist
          size: file.size,
          type: file.type
        };
        newImages.push(newImage);
        processedCount++;
        
        // Update images when all image files are processed
        if (processedCount === imageFiles.length) {
          onChange([...images, ...newImages]);
        }
      };
      reader.readAsDataURL(file);
    });
  }, [images, onChange]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDeleteImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    
    // If we deleted the primary image, make the first remaining image primary
    if (images[index]?.isPrimary && newImages.length > 0) {
      newImages[0].isPrimary = true;
    }
    
    // Adjust selected index if necessary
    if (selectedImageIndex >= newImages.length) {
      onSelectedImageChange(Math.max(0, newImages.length - 1));
    } else if (selectedImageIndex > index) {
      onSelectedImageChange(selectedImageIndex - 1);
    }
    
    onChange(newImages);
  };

  const handleReplaceImage = (index: number) => {
    // Create a temporary file input for replacing a specific image
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const url = e.target?.result as string;
          const newImage: MediaImage = {
            ...images[index],
            url,
            file,
            filename: file.name,
            size: file.size,
            type: file.type
          };
          
          const newImages = [...images];
          newImages[index] = newImage;
          onChange(newImages);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleSetPrimary = (index: number) => {
    const newImages = images.map((img, i) => ({
      ...img,
      isPrimary: i === index
    }));
    onChange(newImages);
  };

  const handleAltTextChange = (index: number, altText: string) => {
    const newImages = images.map((img, i) => 
      i === index ? { ...img, altText } : img
    );
    onChange(newImages);
  };

  const handleThumbnailDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleThumbnailDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleThumbnailDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    const newImages = [...images];
    const draggedImage = newImages[draggedIndex];
    
    // Remove dragged image
    newImages.splice(draggedIndex, 1);
    
    // Insert at new position
    newImages.splice(dropIndex, 0, draggedImage);
    
    // Update selected index if necessary
    if (selectedImageIndex === draggedIndex) {
      onSelectedImageChange(dropIndex);
    } else if (selectedImageIndex > draggedIndex && selectedImageIndex <= dropIndex) {
      onSelectedImageChange(selectedImageIndex - 1);
    } else if (selectedImageIndex < draggedIndex && selectedImageIndex >= dropIndex) {
      onSelectedImageChange(selectedImageIndex + 1);
    }
    
    onChange(newImages);
    setDraggedIndex(null);
  };

  const nextImage = () => {
    if (images.length > 1) {
      onSelectedImageChange((selectedImageIndex + 1) % images.length);
    }
  };

  const prevImage = () => {
    if (images.length > 1) {
      onSelectedImageChange((selectedImageIndex - 1 + images.length) % images.length);
    }
  };

  // Ensure selectedImageIndex is within bounds
  const safeSelectedIndex = Math.max(0, Math.min(selectedImageIndex, images.length - 1));
  const selectedImage = images[safeSelectedIndex];

  return (
    <div className={`space-y-4 ${className}`} style={style}>
      {/* Main Image Display */}
      <div className="relative aspect-video rounded-2xl overflow-hidden group">
        {images.length > 0 && selectedImage ? (
          <>
            <Image
              src={selectedImage.url}
              alt={selectedImage.altText || 'Offering image'}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw"
              className="object-cover"
              unoptimized={selectedImage.url.startsWith('data:')}
            />
            
            {/* Upload overlay button */}
            <button
              onClick={handleUploadClick}
              className="absolute top-4 right-4 backdrop-blur-sm rounded-lg px-3 py-2 text-sm font-medium hover:opacity-90 transition-all opacity-0 group-hover:opacity-100"
              style={{
                backgroundColor: `${branding.foreground_color || '#FFFFFF'}CC`,
                color: branding.textOnForeground
              }}
            >
              <Camera className="w-4 h-4 inline mr-2" />
              Add Images
            </button>

            {/* Navigation arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 backdrop-blur-sm rounded-full p-2 hover:opacity-90 transition-colors"
                  style={{
                    backgroundColor: `${branding.foreground_color || '#FFFFFF'}CC`,
                    color: branding.textOnForeground
                  }}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 backdrop-blur-sm rounded-full p-2 hover:opacity-90 transition-colors"
                  style={{
                    backgroundColor: `${branding.foreground_color || '#FFFFFF'}CC`,
                    color: branding.textOnForeground
                  }}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </>
        ) : (
          /* Empty state with drag and drop */
          <div
            className={`w-full h-full border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-colors cursor-pointer ${
              isDragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300 bg-gray-50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleUploadClick}
          >
            <Upload className="w-12 h-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-600 mb-2">
              Drop images here or click to upload
            </p>
            <p className="text-sm text-gray-500">
              Supports JPG, PNG, GIF up to 10MB each
            </p>
          </div>
        )}
      </div>

      {/* Thumbnails with drag and drop reordering */}
      {images.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2 pt-2">
          {images.map((image, index) => (
            <div
              key={image.id}
              className="relative flex-shrink-0 group p-2"
              draggable
              onDragStart={(e) => handleThumbnailDragStart(e, index)}
              onDragOver={handleThumbnailDragOver}
              onDrop={(e) => handleThumbnailDrop(e, index)}
            >
              <button
                onClick={() => onSelectedImageChange(index)}
                className="w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors relative"
                style={{
                  borderColor: safeSelectedIndex === index
                    ? branding.primary_color || '#10B981'
                    : '#E5E7EB'
                }}
              >
                <Image
                  src={image.url}
                  alt={image.altText || `Image ${index + 1}`}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                  unoptimized={image.url.startsWith('data:')}
                />
                
                {/* Primary indicator */}
                {image.isPrimary && (
                  <div className="absolute top-1 left-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  </div>
                )}
                
                {/* Drag handle */}
                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <GripVertical className="w-3 h-3 text-white drop-shadow-sm" />
                </div>
              </button>
              
              {/* Image controls */}
              <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                {!image.isPrimary && (
                  <button
                    onClick={() => handleSetPrimary(index)}
                    className="w-6 h-6 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full flex items-center justify-center text-xs transition-colors"
                    title="Set as primary image"
                  >
                    <Star className="w-3 h-3" />
                  </button>
                )}
                <button
                  onClick={() => handleReplaceImage(index)}
                  className="w-6 h-6 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center text-xs transition-colors"
                  title="Replace image"
                >
                  <Edit3 className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleDeleteImage(index)}
                  className="w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs transition-colors"
                  title="Delete image"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
          
          {/* Add more images button */}
          <button
            onClick={handleUploadClick}
            className="flex-shrink-0 w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-gray-400 transition-colors"
          >
            <Upload className="w-6 h-6 text-gray-400" />
          </button>
        </div>
      )}

      {/* Alt text editing for selected image */}
      {images.length > 0 && selectedImage && (
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Alt text for selected image:
          </label>
          <input
            type="text"
            value={selectedImage.altText || ''}
            onChange={(e) => handleAltTextChange(safeSelectedIndex, e.target.value)}
            placeholder="Describe this image for accessibility..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />
    </div>
  );
};