import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useOfferingPublishing } from '@/hooks/useOfferingPublishing';
import { useTenantBranding } from '@/lib/tenant-context';
import { 
  Edit3, 
  Trash2, 
  Calendar, 
  FileText,
  Plus,
  Loader2,
  AlertCircle,
  Eye,
  Send,
  CheckCircle,
  Clock,
  X,
  MapPin,
  Star,
  DollarSign,
  Users
} from 'lucide-react';
import { OfferingFormData } from '@/types/offering-form';
import Image from 'next/image';

interface Draft {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

interface DraftManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateNew: () => void;
}

export const DraftManager: React.FC<DraftManagerProps> = ({ isOpen, onClose, onCreateNew }) => {
  const router = useRouter();
  const branding = useTenantBranding();
  const { listDrafts, deleteDraft, loadDraft, publishImmediately, schedulePublishing } = useOfferingPublishing();
  
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [previewDraft, setPreviewDraft] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [selectedDraftId, setSelectedDraftId] = useState<string | null>(null);
  const [publishMode, setPublishMode] = useState<'immediate' | 'scheduled'>('immediate');
  const [scheduledDate, setScheduledDate] = useState('');
  const [publishSuccess, setPublishSuccess] = useState<string | null>(null);

  // Load drafts when component opens
  useEffect(() => {
    if (isOpen) {
      loadDraftsList();
    }
  }, [isOpen]);

  const loadDraftsList = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const draftsList = await listDrafts();
      setDrafts(draftsList);
    } catch (err) {
      setError('Failed to load drafts');
      console.error('Error loading drafts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditDraft = async (draftId: string) => {
    console.log('DEBUG-DRAFT-MANAGER: Edit draft clicked for ID:', draftId);
    try {
      console.log('DEBUG-DRAFT-MANAGER: Loading draft data from server...');
      const draftData = await loadDraft(draftId);
      console.log('DEBUG-DRAFT-MANAGER: Draft data loaded:', draftData ? 'success' : 'failed');
      
      if (draftData) {
        // First clear any existing data in sessionStorage
        sessionStorage.removeItem('loadDraft');
        console.log('DEBUG-DRAFT-MANAGER: Cleared existing sessionStorage data');
        
        const sessionData = {
          draftId,
          formData: draftData
        };
        
        // Log details about the draft data being stored
        console.log('DEBUG-DRAFT-MANAGER: Draft data fields:', Object.keys(draftData));
        
        // Store draft data in sessionStorage to be loaded by the create page
        const dataString = JSON.stringify(sessionData);
        console.log('DEBUG-DRAFT-MANAGER: Data size to store in sessionStorage:', dataString.length, 'bytes');
        sessionStorage.setItem('loadDraft', dataString);
        console.log('DEBUG-DRAFT-MANAGER: Saved draft data to sessionStorage');
        
        // Double-check the data was stored correctly
        const storedData = sessionStorage.getItem('loadDraft');
        console.log('DEBUG-DRAFT-MANAGER: Verified sessionStorage data exists:', !!storedData);
        if (storedData) {
          try {
            const parsed = JSON.parse(storedData);
            console.log('DEBUG-DRAFT-MANAGER: Parsed sessionStorage data successfully, draft ID:', parsed.draftId);
          } catch (e) {
            console.error('DEBUG-DRAFT-MANAGER: Error parsing stored data:', e);
          }
        }
        
        // Navigate to create page with draft parameter
        const url = `/dashboard/offerings/create?draft=${draftId}`;
        console.log('DEBUG-DRAFT-MANAGER: Navigating to:', url);
        router.push(url);
        onClose();
      } else {
        console.error('DEBUG-DRAFT-MANAGER: Failed to load draft data, draft data is null or undefined');
        setError('Failed to load draft data');
      }
    } catch (err) {
      console.error('DEBUG-DRAFT-MANAGER: Error loading draft:', err);
      setError('Failed to load draft');
    }
  };

  const handleViewDraft = async (draftId: string) => {
    try {
      const draftData = await loadDraft(draftId);
      if (draftData) {
        setPreviewDraft(draftData);
        setShowPreview(true);
      } else {
        setError('Failed to load draft data');
      }
    } catch (err) {
      setError('Failed to load draft');
      console.error('Error loading draft:', err);
    }
  };

  const handlePublishDraft = async (draftId: string) => {
    setSelectedDraftId(draftId);
    setShowPublishModal(true);
  };

  const executePublish = async () => {
    if (!selectedDraftId) return;
    
    try {
      const draftData = await loadDraft(selectedDraftId);
      if (!draftData) {
        setError('Failed to load draft data for publishing');
        return;
      }

      setPublishingId(selectedDraftId);
      let result;
      
      if (publishMode === 'immediate') {
        result = await publishImmediately(draftData);
      } else {
        if (!scheduledDate) {
          setError('Please select a scheduled date and time');
          return;
        }
        result = await schedulePublishing(draftData, scheduledDate);
      }

      if (result.success) {
        setPublishSuccess(
          publishMode === 'immediate' 
            ? 'Offering published successfully!' 
            : `Offering scheduled for publication on ${new Date(scheduledDate).toLocaleString()}`
        );
        setShowPublishModal(false);
        
        // Remove the published draft from the list
        setDrafts(prev => prev.filter(draft => draft.id !== selectedDraftId));
        
        // Auto-close success message after 3 seconds
        setTimeout(() => {
          setPublishSuccess(null);
        }, 3000);
      } else {
        setError('Failed to publish offering');
      }
    } catch (err) {
      setError('Failed to publish offering');
      console.error('Error publishing offering:', err);
    } finally {
      setPublishingId(null);
    }
  };

  const handleDeleteDraft = async (draftId: string) => {
    if (!window.confirm('Are you sure you want to delete this draft? This action cannot be undone.')) {
      return;
    }

    setDeletingId(draftId);
    try {
      const success = await deleteDraft(draftId);
      if (success) {
        setDrafts(prev => prev.filter(draft => draft.id !== draftId));
      } else {
        setError('Failed to delete draft');
      }
    } catch (err) {
      setError('Failed to delete draft');
      console.error('Error deleting draft:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const closePreview = () => {
    setShowPreview(false);
    setPreviewDraft(null);
  };

  const closePublishModal = () => {
    setShowPublishModal(false);
    setSelectedDraftId(null);
    setPublishMode('immediate');
    setScheduledDate('');
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div 
          className="rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden"
          style={{ backgroundColor: branding.foreground_color || '#FFFFFF' }}
        >
          {/* Header */}
          <div 
            className="px-6 py-4 border-b"
            style={{ borderColor: branding.accent_color || '#E5E7EB' }}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold" style={{ color: branding.textOnForeground }}>
                Manage Drafts
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {/* Success Message */}
            {publishSuccess && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  <span className="text-green-700 text-sm">{publishSuccess}</span>
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                  <span className="text-red-700 text-sm">{error}</span>
                </div>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin mr-2" style={{ color: branding.primary_color }} />
                <span style={{ color: branding.textOnForeground }}>Loading drafts...</span>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && drafts.length === 0 && (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <h4 className="text-lg font-medium mb-2" style={{ color: branding.textOnForeground }}>
                  No drafts found
                </h4>
                <p className="text-sm mb-4" style={{ color: branding.textOnForeground, opacity: 0.7 }}>
                  Create your first offering to save it as a draft
                </p>
                <button
                  onClick={() => {
                    onCreateNew();
                    onClose();
                  }}
                  className="px-4 py-2 rounded-lg font-medium transition-colors"
                  style={{ 
                    backgroundColor: branding.primary_color || '#10B981',
                    color: branding.textOnPrimary 
                  }}
                >
                  <Plus className="w-4 h-4 inline mr-2" />
                  Create New Offering
                </button>
              </div>
            )}

            {/* Drafts List */}
            {!isLoading && drafts.length > 0 && (
              <div className="space-y-3">
                {drafts.map((draft) => (
                  <div
                    key={draft.id}
                    className="p-4 border rounded-lg hover:shadow-sm transition-shadow"
                    style={{ 
                      borderColor: branding.accent_color || '#E5E7EB',
                      backgroundColor: branding.background_color || '#FFFFFF'
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium mb-1" style={{ color: branding.textOnBackground }}>
                          {draft.name}
                        </h4>
                        <div className="flex items-center text-sm" style={{ color: branding.textOnBackground, opacity: 0.7 }}>
                          <Calendar className="w-4 h-4 mr-1" />
                          <span>Updated {formatDate(draft.updated_at)}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewDraft(draft.id)}
                          className="p-2 rounded-lg transition-colors hover:bg-blue-50"
                          title="View draft"
                        >
                          <Eye className="w-4 h-4 text-blue-600" />
                        </button>
                        <button
                          onClick={() => handleEditDraft(draft.id)}
                          className="p-2 rounded-lg transition-colors hover:bg-gray-100"
                          title="Edit draft"
                        >
                          <Edit3 className="w-4 h-4" style={{ color: branding.primary_color }} />
                        </button>
                        <button
                          onClick={() => handlePublishDraft(draft.id)}
                          disabled={publishingId === draft.id}
                          className="p-2 rounded-lg transition-colors hover:bg-green-50 disabled:opacity-50"
                          title="Publish draft"
                        >
                          {publishingId === draft.id ? (
                            <Loader2 className="w-4 h-4 animate-spin text-green-600" />
                          ) : (
                            <Send className="w-4 h-4 text-green-600" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteDraft(draft.id)}
                          disabled={deletingId === draft.id}
                          className="p-2 rounded-lg transition-colors hover:bg-red-50 disabled:opacity-50"
                          title="Delete draft"
                        >
                          {deletingId === draft.id ? (
                            <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                          ) : (
                            <Trash2 className="w-4 h-4 text-red-500" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div 
            className="px-6 py-4 border-t bg-gray-50"
            style={{ borderColor: branding.accent_color || '#E5E7EB' }}
          >
            <div className="flex justify-between">
              <button
                onClick={onClose}
                className="px-4 py-2 border rounded-lg transition-colors hover:bg-gray-100"
                style={{ 
                  borderColor: branding.accent_color || '#E5E7EB',
                  color: branding.textOnForeground 
                }}
              >
                Close
              </button>
              <button
                onClick={() => {
                  onCreateNew();
                  onClose();
                }}
                className="px-4 py-2 rounded-lg font-medium transition-colors"
                style={{ 
                  backgroundColor: branding.primary_color || '#10B981',
                  color: branding.textOnPrimary 
                }}
              >
                <Plus className="w-4 h-4 inline mr-2" />
                Create New Offering
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && previewDraft && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div 
            className="rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden"
            style={{ backgroundColor: branding.foreground_color || '#FFFFFF' }}
          >
            {/* Preview Header */}
            <div 
              className="px-6 py-4 border-b flex items-center justify-between"
              style={{ borderColor: branding.accent_color || '#E5E7EB' }}
            >
              <h3 className="text-lg font-semibold" style={{ color: branding.textOnForeground }}>
                Preview: {previewDraft.basicInfo?.name || 'Draft Offering'}
              </h3>
              <button
                onClick={closePreview}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Preview Content */}
            <div className="p-6 overflow-y-auto max-h-[80vh]">
              <div className="space-y-6">
                {/* Basic Info */}
                <div 
                  className="p-4 rounded-lg border"
                  style={{ borderColor: branding.accent_color || '#E5E7EB' }}
                >
                  <h4 className="font-medium mb-3" style={{ color: branding.textOnForeground }}>
                    Basic Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium" style={{ color: branding.textOnForeground }}>Name:</span>
                      <p className="text-sm" style={{ color: branding.textOnForeground, opacity: 0.8 }}>
                        {previewDraft.basicInfo?.name || 'Not set'}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium" style={{ color: branding.textOnForeground }}>Location:</span>
                      <p className="text-sm" style={{ color: branding.textOnForeground, opacity: 0.8 }}>
                        {previewDraft.basicInfo?.location || 'Not set'}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium" style={{ color: branding.textOnForeground }}>Duration:</span>
                      <p className="text-sm" style={{ color: branding.textOnForeground, opacity: 0.8 }}>
                        {previewDraft.basicInfo?.duration || 0} minutes
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium" style={{ color: branding.textOnForeground }}>Category:</span>
                      <p className="text-sm" style={{ color: branding.textOnForeground, opacity: 0.8 }}>
                        {previewDraft.basicInfo?.category || 'Not set'}
                      </p>
                    </div>
                  </div>
                  {previewDraft.basicInfo?.description && (
                    <div className="mt-4">
                      <span className="text-sm font-medium" style={{ color: branding.textOnForeground }}>Description:</span>
                      <p className="text-sm mt-1" style={{ color: branding.textOnForeground, opacity: 0.8 }}>
                        {previewDraft.basicInfo.description}
                      </p>
                    </div>
                  )}
                </div>

                {/* Pricing */}
                {previewDraft.pricing && (
                  <div 
                    className="p-4 rounded-lg border"
                    style={{ borderColor: branding.accent_color || '#E5E7EB' }}
                  >
                    <h4 className="font-medium mb-3" style={{ color: branding.textOnForeground }}>
                      Pricing
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <span className="text-sm font-medium" style={{ color: branding.textOnForeground }}>Adult:</span>
                        <p className="text-sm" style={{ color: branding.textOnForeground, opacity: 0.8 }}>
                          {previewDraft.pricing.currency || 'CAD'} {previewDraft.pricing.basePricing?.adult || '0.00'}
                        </p>
                      </div>
                      {previewDraft.pricing.basePricing?.child && (
                        <div>
                          <span className="text-sm font-medium" style={{ color: branding.textOnForeground }}>Child:</span>
                          <p className="text-sm" style={{ color: branding.textOnForeground, opacity: 0.8 }}>
                            {previewDraft.pricing.currency || 'CAD'} {previewDraft.pricing.basePricing.child}
                          </p>
                        </div>
                      )}
                      {previewDraft.pricing.basePricing?.student && (
                        <div>
                          <span className="text-sm font-medium" style={{ color: branding.textOnForeground }}>Student:</span>
                          <p className="text-sm" style={{ color: branding.textOnForeground, opacity: 0.8 }}>
                            {previewDraft.pricing.currency || 'CAD'} {previewDraft.pricing.basePricing.student}
                          </p>
                        </div>
                      )}
                      {previewDraft.pricing.basePricing?.senior && (
                        <div>
                          <span className="text-sm font-medium" style={{ color: branding.textOnForeground }}>Senior:</span>
                          <p className="text-sm" style={{ color: branding.textOnForeground, opacity: 0.8 }}>
                            {previewDraft.pricing.currency || 'CAD'} {previewDraft.pricing.basePricing.senior}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Images */}
                {previewDraft.media?.images && previewDraft.media.images.length > 0 && (
                  <div 
                    className="p-4 rounded-lg border"
                    style={{ borderColor: branding.accent_color || '#E5E7EB' }}
                  >
                    <h4 className="font-medium mb-3" style={{ color: branding.textOnForeground }}>
                      Images ({previewDraft.media.images.length})
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {previewDraft.media.images.slice(0, 4).map((image: any, index: number) => (
                        <div key={index} className="relative aspect-video rounded-lg overflow-hidden">
                          <Image
                            src={image.url}
                            alt={image.alt || `Image ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                          {image.isPrimary && (
                            <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                              Primary
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Scheduling */}
                {previewDraft.scheduling && (
                  <div 
                    className="p-4 rounded-lg border"
                    style={{ borderColor: branding.accent_color || '#E5E7EB' }}
                  >
                    <h4 className="font-medium mb-3" style={{ color: branding.textOnForeground }}>
                      Scheduling
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm font-medium" style={{ color: branding.textOnForeground }}>Type:</span>
                        <p className="text-sm" style={{ color: branding.textOnForeground, opacity: 0.8 }}>
                          {previewDraft.scheduling.scheduleType || 'Not set'}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium" style={{ color: branding.textOnForeground }}>Timezone:</span>
                        <p className="text-sm" style={{ color: branding.textOnForeground, opacity: 0.8 }}>
                          {previewDraft.scheduling.timezone || 'Not set'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Publish Modal */}
      {showPublishModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div 
            className="rounded-lg shadow-xl max-w-md w-full mx-4"
            style={{ backgroundColor: branding.foreground_color || '#FFFFFF' }}
          >
            {/* Publish Header */}
            <div 
              className="px-6 py-4 border-b flex items-center justify-between"
              style={{ borderColor: branding.accent_color || '#E5E7EB' }}
            >
              <h3 className="text-lg font-semibold" style={{ color: branding.textOnForeground }}>
                Publish Draft
              </h3>
              <button
                onClick={closePublishModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Publish Content */}
            <div className="p-6">
              <div className="space-y-4">
                {/* Publish Options */}
                <div className="space-y-3">
                  <button
                    onClick={() => setPublishMode('immediate')}
                    className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                      publishMode === 'immediate'
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 mr-3 text-green-600" />
                      <div>
                        <div className="font-medium" style={{ color: branding.textOnForeground }}>
                          Publish Now
                        </div>
                        <div className="text-sm opacity-75" style={{ color: branding.textOnForeground }}>
                          Make the offering available immediately
                        </div>
                      </div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => setPublishMode('scheduled')}
                    className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                      publishMode === 'scheduled'
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <Clock className="w-5 h-5 mr-3 text-purple-600" />
                      <div>
                        <div className="font-medium" style={{ color: branding.textOnForeground }}>
                          Schedule Publishing
                        </div>
                        <div className="text-sm opacity-75" style={{ color: branding.textOnForeground }}>
                          Set a future date and time
                        </div>
                      </div>
                    </div>
                  </button>
                </div>

                {/* Scheduled Date Input */}
                {publishMode === 'scheduled' && (
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: branding.textOnForeground }}>
                      Publish Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min={new Date().toISOString().slice(0, 16)}
                    />
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={closePublishModal}
                    className="px-4 py-2 border rounded-lg transition-colors hover:bg-gray-100"
                    style={{ 
                      borderColor: branding.accent_color || '#E5E7EB',
                      color: branding.textOnForeground 
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={executePublish}
                    disabled={publishMode === 'scheduled' && !scheduledDate}
                    className="px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ 
                      backgroundColor: publishMode === 'immediate' ? '#10B981' : '#8B5CF6',
                      color: '#FFFFFF'
                    }}
                  >
                    {publishMode === 'immediate' ? 'Publish Now' : 'Schedule Publishing'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}; 