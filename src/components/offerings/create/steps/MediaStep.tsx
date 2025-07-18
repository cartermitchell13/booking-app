import React, { useState } from 'react';
import { 
  Upload, 
  X, 
  Image, 
  Video, 
  Globe, 
  Share2, 
  FileText,
  Loader2
} from 'lucide-react';
import { StepComponentProps } from '../types/createOfferingTypes';

export const MediaStep: React.FC<StepComponentProps> = ({ formData, updateFormData }) => {
  // Initialize media with proper structure
  const media = formData.media || {
    images: [],
    videos: [],
    seoData: {
      metaTitle: '',
      metaDescription: '',
      keywords: [],
      slug: ''
    },
    socialMedia: {
      shareTitle: '',
      shareDescription: '',
      shareImage: ''
    }
  };
  
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [seoScore, setSeoScore] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState<Record<number, boolean>>({});

  const updateMedia = (field: string, value: any) => {
    const updatedMedia = { 
      ...media,
      // Ensure seoData exists
      seoData: media.seoData || {
        metaTitle: '',
        metaDescription: '',
        keywords: [],
        slug: ''
      }
    };
    
    // Handle nested seoData fields
    if (['metaTitle', 'metaDescription', 'keywords', 'urlSlug'].includes(field)) {
      updatedMedia.seoData = {
        ...updatedMedia.seoData,
        [field === 'urlSlug' ? 'slug' : field]: value
      };
    } else {
      // Use type assertion for new fields that might not be in interface yet
      (updatedMedia as any)[field] = value;
    }
    
    updateFormData('media', updatedMedia);
    
    // Recalculate SEO score when relevant fields change
    if (['metaTitle', 'metaDescription', 'keywords', 'urlSlug'].includes(field)) {
      calculateSeoScore(updatedMedia);
    }
  };

  const calculateSeoScore = (mediaData: any) => {
    let score = 0;
    const maxScore = 100;
    const seoData = mediaData.seoData || {};

    // Meta title (20 points)
    if (seoData.metaTitle) {
      if (seoData.metaTitle.length >= 30 && seoData.metaTitle.length <= 60) {
        score += 20;
      } else if (seoData.metaTitle.length > 0) {
        score += 10;
      }
    }

    // Meta description (25 points)
    if (seoData.metaDescription) {
      if (seoData.metaDescription.length >= 120 && seoData.metaDescription.length <= 160) {
        score += 25;
      } else if (seoData.metaDescription.length > 0) {
        score += 15;
      }
    }

    // Keywords (15 points)
    if (seoData.keywords && seoData.keywords.length > 0) {
      score += 15;
    }

    // URL slug (15 points)
    if (seoData.slug && seoData.slug.length > 0) {
      score += 15;
    }

    // Images (25 points)
    const images = mediaData.images || [];
    if (images.length > 0) {
      score += 15;
      // Bonus for alt text
      const imagesWithAlt = images.filter((img: any) => img.altText);
      if (imagesWithAlt.length === images.length) {
        score += 10;
      }
    }

    setSeoScore(score);
  };

  const generateUrlSlug = () => {
    const title = formData.basicInfo?.name || '';
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    updateMedia('urlSlug', slug);
  };

  // File upload helpers
  const handleFileUpload = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB limit
      return isValidType && isValidSize;
    });

    for (const file of validFiles) {
      const id = Date.now() + Math.random();
      setUploading(prev => ({ ...prev, [id]: true }));

      try {
        // Convert file to data URL for preview
        const dataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(file);
        });

        const images = media.images || [];
        const newImage = {
          id,
          url: dataUrl,
          file: file,
          filename: file.name,
          altText: '',
          isPrimary: images.length === 0,
          size: file.size,
          type: file.type
        };

        updateMedia('images', [...images, newImage]);
      } catch (error) {
        console.error('Error processing file:', error);
      } finally {
        setUploading(prev => ({ ...prev, [id]: false }));
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const addImage = () => {
    // Trigger file input
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files) {
        handleFileUpload(files);
      }
    };
    input.click();
  };

  const removeImage = (id: number) => {
    const images = media.images || [];
    const updatedImages = images.filter((img: any) => img.id !== id);
    // If removed image was primary, make first image primary
    if (updatedImages.length > 0 && !updatedImages.some((img: any) => img.isPrimary)) {
      updatedImages[0].isPrimary = true;
    }
    updateMedia('images', updatedImages);
  };

  const updateImage = (id: number, field: string, value: any) => {
    const images = media.images || [];
    updateMedia('images', images.map((img: any) => 
      img.id === id ? { ...img, [field]: value } : img
    ));
  };

  const setPrimaryImage = (id: number) => {
    const images = media.images || [];
    updateMedia('images', images.map((img: any) => ({
      ...img,
      isPrimary: img.id === id
    })));
  };

  const reorderImages = (startIndex: number, endIndex: number) => {
    const images = [...(media.images || [])];
    const [removed] = images.splice(startIndex, 1);
    images.splice(endIndex, 0, removed);
    updateMedia('images', images);
  };

  const addVideo = () => {
    const videos = media.videos || [];
    const newVideo = {
      id: Date.now(),
      url: '',
      platform: 'youtube',
      title: '',
      description: ''
    };
    updateMedia('videos', [...videos, newVideo]);
  };

  const removeVideo = (id: number) => {
    const videos = media.videos || [];
    updateMedia('videos', videos.filter((video: any) => video.id !== id));
  };

  const updateVideo = (id: number, field: string, value: any) => {
    const videos = media.videos || [];
    updateMedia('videos', videos.map((video: any) => 
      video.id === id ? { ...video, [field]: value } : video
    ));
  };

  const generateHashtags = () => {
    const category = formData.basicInfo?.category || '';
    const location = formData.basicInfo?.location || '';
    const productType = formData.productType || '';
    
    const suggestions = [
      `#${category.toLowerCase()}`,
      `#${location.toLowerCase().replace(/\s+/g, '')}`,
      `#${productType.toLowerCase()}`,
      '#travel',
      '#experience',
      '#adventure',
      '#tourism',
      '#booking',
      '#canada'
    ].filter(tag => tag !== '#');
    
    updateMedia('suggestedHashtags', suggestions);
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">📸 Media & Marketing</h2>
        <p className="text-gray-600">Add visual content and optimize for search engines</p>
      </div>

      {/* Image Gallery Section */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            🖼️ Image Gallery
            <span className="text-red-500 ml-1">*</span>
          </h3>
          <button
            onClick={addImage}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Upload Images
          </button>
        </div>
        
        {/* Show required message if no images */}
        {(!media.images || media.images.length === 0) && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-700">
              At least one image is required to proceed to the next step.
            </p>
          </div>
        )}
        
        {/* Drag and Drop Zone */}
        {(!media.images || media.images.length === 0) && (
          <div
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
              dragOver 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Image className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              Drag and drop your images here
            </h4>
            <p className="text-gray-600 mb-4">
              or click the "Upload Images" button to browse files
            </p>
            <p className="text-sm text-gray-500">
              Supports JPG, PNG, GIF, WebP up to 10MB each
            </p>
          </div>
        )}
        
        {/* Image Grid */}
        {media.images && media.images.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              {media.images.map((image: any, index: number) => (
                <div
                  key={image.id}
                  className={`relative bg-white border-2 rounded-lg overflow-hidden transition-all ${
                    image.isPrimary ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
                  } ${uploading[image.id] ? 'opacity-50' : ''}`}
                  draggable={!uploading[image.id]}
                  onDragStart={() => setDraggedIndex(index)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => {
                    if (draggedIndex !== null && draggedIndex !== index) {
                      reorderImages(draggedIndex, index);
                    }
                    setDraggedIndex(null);
                  }}
                >
                  {image.isPrimary && (
                    <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full z-10">
                      Primary
                    </div>
                  )}
                  
                  {uploading[image.id] && (
                    <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                    </div>
                  )}
                  
                  {/* Image Preview */}
                  <div className="aspect-video bg-gray-100 relative">
                    {image.url && (
                      <img
                        src={image.url}
                        alt={image.altText || 'Preview'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    )}
                    {!image.url && (
                      <div className="w-full h-full flex items-center justify-center">
                        <Image className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  {/* Image Details */}
                  <div className="p-3 space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Filename: {image.filename}
                      </label>
                      {image.size && (
                        <p className="text-xs text-gray-500">{formatFileSize(image.size)}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Alt Text</label>
                      <input
                        type="text"
                        value={image.altText}
                        onChange={(e) => updateImage(image.id, 'altText', e.target.value)}
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Descriptive text for accessibility"
                      />
                    </div>
                    
                    <div className="flex space-x-2">
                      {!image.isPrimary && (
                        <button
                          onClick={() => setPrimaryImage(image.id)}
                          className="flex-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                        >
                          Set Primary
                        </button>
                      )}
                      <button
                        onClick={() => removeImage(image.id)}
                        className="px-2 py-1 text-xs text-red-600 hover:text-red-700 border border-red-300 rounded hover:bg-red-50"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Additional Upload Zone */}
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragOver 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <p className="text-gray-600 mb-2">
                Drag more images here or 
                <button
                  onClick={addImage}
                  className="text-blue-600 hover:text-blue-700 ml-1 underline"
                >
                  browse files
                </button>
              </p>
              <p className="text-xs text-gray-500">
                You can reorder images by dragging them
              </p>
            </div>
          </>
        )}
      </div>

      {/* Video Integration Section */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">🎥 Video Integration</h3>
          <button
            onClick={addVideo}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Add Video
          </button>
        </div>
        
        <div className="space-y-4">
          {(media.videos || []).map((video: any) => (
            <div key={video.id} className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Platform</label>
                  <select
                    value={video.platform}
                    onChange={(e) => updateVideo(video.id, 'platform', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="youtube">YouTube</option>
                    <option value="vimeo">Vimeo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Video URL</label>
                  <input
                    type="url"
                    value={video.url}
                    onChange={(e) => updateVideo(video.id, 'url', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Video Title</label>
                  <input
                    type="text"
                    value={video.title}
                    onChange={(e) => updateVideo(video.id, 'title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Descriptive video title"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => removeVideo(video.id)}
                    className="w-full px-3 py-2 text-red-600 hover:text-red-700 border border-red-300 rounded-md hover:bg-red-50"
                  >
                    Remove Video
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {(!media.videos || media.videos.length === 0) && (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-8 h-8 mx-auto mb-2" />
              <p>No videos added yet. Click "Add Video" to embed YouTube or Vimeo content.</p>
            </div>
          )}
        </div>
      </div>

      {/* SEO Optimization Section */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">🔍 SEO Optimization</h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">SEO Score:</span>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              seoScore >= 80 ? 'bg-green-100 text-green-800' :
              seoScore >= 60 ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {seoScore}/100
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          {/* Meta Tags */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meta Title
                <span className="text-xs text-gray-500 ml-2">(30-60 characters, optional)</span>
              </label>
              <input
                type="text"
                value={media.seoData?.metaTitle || ''}
                onChange={(e) => updateMedia('metaTitle', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="SEO-optimized title for search engines"
                maxLength={60}
              />
              <div className="text-xs text-gray-500 mt-1">
                {(media.seoData?.metaTitle || '').length}/60 characters
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL Slug
                <button
                  onClick={generateUrlSlug}
                  className="ml-2 text-xs text-blue-600 hover:text-blue-700"
                >
                  Generate
                </button>
              </label>
              <input
                type="text"
                value={media.seoData?.slug || ''}
                onChange={(e) => updateMedia('urlSlug', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="seo-friendly-url-slug"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meta Description
              <span className="text-xs text-gray-500 ml-2">(120-160 characters, optional)</span>
            </label>
            <textarea
              value={media.seoData?.metaDescription || ''}
              onChange={(e) => updateMedia('metaDescription', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Compelling description that appears in search results"
              maxLength={160}
            />
            <div className="text-xs text-gray-500 mt-1">
              {(media.seoData?.metaDescription || '').length}/160 characters
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Keywords</label>
            <input
              type="text"
              value={(media.seoData?.keywords || []).join(', ')}
              onChange={(e) => updateMedia('keywords', e.target.value.split(',').map(k => k.trim()).filter(k => k))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="tourism, banff, tours, adventure (comma-separated)"
            />
          </div>
        </div>
      </div>

      {/* Social Media Optimization */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📱 Social Media Optimization</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Open Graph */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Open Graph (Facebook)</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">OG Title</label>
                <input
                  type="text"
                  value={(media as any).ogTitle || media.seoData?.metaTitle || ''}
                  onChange={(e) => updateMedia('ogTitle', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Facebook-optimized title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">OG Description</label>
                <textarea
                  value={(media as any).ogDescription || media.seoData?.metaDescription || ''}
                  onChange={(e) => updateMedia('ogDescription', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Facebook-optimized description"
                />
              </div>
            </div>
          </div>
          
          {/* Twitter Cards */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Twitter Cards</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Twitter Title</label>
                <input
                  type="text"
                  value={(media as any).twitterTitle || media.seoData?.metaTitle || ''}
                  onChange={(e) => updateMedia('twitterTitle', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Twitter-optimized title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Twitter Description</label>
                <textarea
                  value={(media as any).twitterDescription || media.seoData?.metaDescription || ''}
                  onChange={(e) => updateMedia('twitterDescription', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Twitter-optimized description"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Marketing Tools */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🎯 Marketing Tools</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Hashtag Generator */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">Hashtag Suggestions</h4>
              <button
                onClick={generateHashtags}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Generate
              </button>
            </div>
            <div className="space-y-2">
              <textarea
                value={((media as any).suggestedHashtags || []).join(' ')}
                onChange={(e) => updateMedia('suggestedHashtags', e.target.value.split(' ').filter(h => h.trim()))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Click Generate to get hashtag suggestions"
              />
              <p className="text-xs text-gray-500">
                Space-separated hashtags for social media posts
              </p>
            </div>
          </div>
          
          {/* Content Templates */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Content Templates</h4>
            <div className="space-y-2">
              <button
                onClick={() => {
                  const template = `🌟 Discover ${formData.basicInfo?.name || 'our amazing offering'} in ${formData.basicInfo?.location || 'beautiful location'}! 
                  
${formData.basicInfo?.description || 'An unforgettable experience awaits you.'} 

Book now and create memories that last a lifetime! 

${((media as any).suggestedHashtags || []).slice(0, 5).join(' ')}`;
                  updateMedia('socialMediaTemplate', template);
                }}
                className="w-full px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-left"
              >
                📱 Social Media Post Template
              </button>
              <button
                onClick={() => {
                  const template = `Subject: Experience ${formData.basicInfo?.name || 'Amazing Adventures'} - Book Your Spot Today!

Dear [Customer Name],

${formData.basicInfo?.description || 'We have an incredible experience waiting for you!'}

Duration: ${formData.basicInfo?.duration || 'N/A'} minutes
Location: ${formData.basicInfo?.location || 'Beautiful destination'}

Book now and save your spot for this unforgettable adventure!

Best regards,
[Your Company Name]`;
                  updateMedia('emailTemplate', template);
                }}
                className="w-full px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-left"
              >
                📧 Email Marketing Template
              </button>
            </div>
          </div>
        </div>
        
        {/* Generated Templates Display */}
        {((media as any).socialMediaTemplate || (media as any).emailTemplate) && (
          <div className="mt-6 space-y-4">
            {(media as any).socialMediaTemplate && (
              <div>
                <h5 className="font-medium text-gray-900 mb-2">Social Media Template</h5>
                <textarea
                  value={(media as any).socialMediaTemplate}
                  onChange={(e) => updateMedia('socialMediaTemplate', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            )}
            {(media as any).emailTemplate && (
              <div>
                <h5 className="font-medium text-gray-900 mb-2">Email Template</h5>
                <textarea
                  value={(media as any).emailTemplate}
                  onChange={(e) => updateMedia('emailTemplate', e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Preview Section */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-200">
        <h3 className="text-lg font-semibold text-purple-900 mb-4">👀 Social Media Preview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Facebook Preview */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h4 className="font-medium text-gray-900 mb-3">Facebook Preview</h4>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              {(media.images && media.images.length > 0) && (
                <div className="h-32 bg-gray-100 flex items-center justify-center">
                  <span className="text-gray-500 text-sm">Image Preview</span>
                </div>
              )}
              <div className="p-3">
                <div className="font-semibold text-sm text-gray-900 mb-1">
                  {(media as any).ogTitle || media.seoData?.metaTitle || formData.basicInfo?.name || 'Offering Title'}
                </div>
                <div className="text-xs text-gray-600 mb-2">
                  {(media as any).ogDescription || media.seoData?.metaDescription || 'Description will appear here...'}
                </div>
                <div className="text-xs text-gray-500">
                  {typeof window !== 'undefined' ? window.location.hostname : 'yoursite.com'}
                </div>
              </div>
            </div>
          </div>
          
          {/* Twitter Preview */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h4 className="font-medium text-gray-900 mb-3">Twitter Preview</h4>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              {(media.images && media.images.length > 0) && (
                <div className="h-32 bg-gray-100 flex items-center justify-center">
                  <span className="text-gray-500 text-sm">Image Preview</span>
                </div>
              )}
              <div className="p-3">
                <div className="font-semibold text-sm text-gray-900 mb-1">
                  {(media as any).twitterTitle || media.seoData?.metaTitle || formData.basicInfo?.name || 'Offering Title'}
                </div>
                <div className="text-xs text-gray-600 mb-2">
                  {(media as any).twitterDescription || media.seoData?.metaDescription || 'Description will appear here...'}
                </div>
                <div className="text-xs text-gray-500">
                  {typeof window !== 'undefined' ? window.location.hostname : 'yoursite.com'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 