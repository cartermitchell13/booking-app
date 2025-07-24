'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Settings, 
  Eye, 
  CheckCircle, 
  Save,
  Loader2,
  Home,
  ChevronRight,
  AlertCircle,
  Clock,
  Publish
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useTenant } from '@/lib/tenant-context';
import { useOfferingForm } from '@/hooks/useOfferingForm';
import { useOfferingPublishing } from '@/hooks/useOfferingPublishing';
import { useRealTimeValidation } from '@/hooks/useRealTimeValidation';

// Import the enhanced ReviewStep as the core editable interface
import { ReviewStep } from './steps/ReviewStep';

// Import navigation and settings components
import { EditingModeNavigation } from './components/EditingModeNavigation';
import { SettingsPanel } from './components/SettingsPanel';
import { ValidationOverlay } from '@/components/ui/ValidationOverlay';

// Import modal components for advanced settings (to be created in next subtask)
// import { BusinessTypeModal } from './modals/BusinessTypeModal';
// import { SchedulingModal } from './modals/SchedulingModal';
// import { PricingModal } from './modals/PricingModal';
// import { SEOModal } from './modals/SEOModal';

import { OfferingFormData } from './types/createOfferingTypes';

interface EditableOfferingViewProps {
  initialData?: Partial<OfferingFormData>;
  mode: 'create' | 'edit';
  offeringId?: string;
}

interface EditingMode {
  type: 'preview' | 'validation' | 'settings';
  activeModal?: 'business-type' | 'scheduling' | 'pricing' | 'seo' | null;
}

export const EditableOfferingView: React.FC<EditableOfferingViewProps> = ({
  initialData,
  mode = 'create',
  offeringId
}) => {
  const router = useRouter();
  const { tenant } = useTenant();
  
  // Use the existing offering form hook for state management
  const { 
    formData, 
    updateFormData, 
    saveProgress,
    lastAutoSave,
    isLoading
  } = useOfferingForm(initialData);

  // Use the existing publishing hook
  const {
    isPublishing,
    publishingError,
    saveDraft,
    publishImmediately,
    schedulePublishing
  } = useOfferingPublishing();

  // Real-time validation
  const {
    validation,
    sectionStatus,
    completionPercentage,
    isValid,
    hasErrors,
    hasWarnings,
    getFieldErrors,
    getSectionErrors
  } = useRealTimeValidation(formData, { debounceMs: 500 });

  // Local state for editing modes and UI
  const [editingMode, setEditingMode] = useState<EditingMode>({ type: 'preview' });
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showValidationOverlay, setShowValidationOverlay] = useState(false);
  const [publishingMode, setPublishingMode] = useState<'draft' | 'immediate' | 'scheduled'>('immediate');
  const [scheduledDate, setScheduledDate] = useState('');

  // Auto-save effect with debouncing
  useEffect(() => {
    if (!isLoading && formData && Object.keys(formData).length > 0) {
      const timeoutId = setTimeout(async () => {
        setIsSaving(true);
        try {
          await saveProgress();
        } catch (error) {
          console.error('Auto-save failed:', error);
        } finally {
          setIsSaving(false);
        }
      }, 2000); // 2 second debounce

      return () => clearTimeout(timeoutId);
    }
  }, [formData, saveProgress, isLoading]);

  // Handle manual save
  const handleSaveDraft = async (draftName?: string) => {
    setIsSaving(true);
    try {
      const result = await saveDraft(formData as OfferingFormData, draftName);
      if (result.success) {
        setSuccessMessage('Draft saved successfully!');
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 3000);
      }
    } catch (error) {
      console.error('Save draft failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle publishing with validation
  const handlePublish = async () => {
    console.log('🔍 DEBUG: handlePublish called');
    console.log('🔍 DEBUG: publishingMode:', publishingMode);
    console.log('🔍 DEBUG: validation.errors.length:', validation.errors.length);
    console.log('🔍 DEBUG: isPublishing:', isPublishing);

    if (publishingMode === 'immediate' && validation.errors.length > 0) {
      console.log('🔍 DEBUG: Validation errors prevent publishing');
      setShowValidationOverlay(true);
      return;
    }

    // Ensure we have complete form data
    const completeFormData = formData as OfferingFormData;
    console.log('🔍 DEBUG: Form data keys:', Object.keys(completeFormData));

    setShowSuccessMessage(false);

    try {
      console.log('🔍 DEBUG: Starting publish process');
      let result;
      let message = '';

      switch (publishingMode) {
        case 'draft':
          result = await saveDraft(completeFormData, `Draft - ${new Date().toLocaleString()}`);
          message = 'Draft saved successfully!';
          break;

        case 'immediate':
          result = await publishImmediately(completeFormData);
          message = 'Offering published successfully!';
          break;

        case 'scheduled':
          if (!scheduledDate) {
            alert('Please select a scheduled date and time');
            return;
          }
          result = await schedulePublishing(completeFormData, scheduledDate);
          message = `Offering scheduled for publication on ${new Date(scheduledDate).toLocaleString()}`;
          break;
      }

      if (result.success) {
        setSuccessMessage(message);
        setShowSuccessMessage(true);

        // Redirect after successful publish (not draft)
        if (publishingMode !== 'draft') {
          setTimeout(() => {
            router.push('/dashboard/offerings');
          }, 2000);
        }
      } else {
        console.error('Publishing failed:', result);
      }
    } catch (error) {
      console.error('Error during publishing:', error);
    }
  };

  // Handle opening advanced settings modals
  const openModal = (modalType: 'business-type' | 'scheduling' | 'pricing' | 'seo') => {
    setEditingMode({ type: 'settings', activeModal: modalType });
  };

  const closeModal = () => {
    setEditingMode({ type: 'preview', activeModal: null });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between py-4">
            {/* Left side - Navigation */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard/offerings')}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Offerings
              </button>
              
              {/* Breadcrumb */}
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Home className="w-4 h-4" />
                <ChevronRight className="w-4 h-4" />
                <span>Dashboard</span>
                <ChevronRight className="w-4 h-4" />
                <span>Offerings</span>
                <ChevronRight className="w-4 h-4" />
                <span className="text-blue-600">
                  {mode === 'create' ? 'Create New Offering' : 'Edit Offering'}
                </span>
              </div>
            </div>

            {/* Center - Title */}
            <div className="text-center">
              <h1 className="text-xl font-semibold text-gray-900">
                {mode === 'create' ? 'Create New Offering' : 'Edit Offering'}
              </h1>
              <p className="text-sm text-gray-600">
                {formData.basicInfo?.name || 'Untitled Offering'}
              </p>
            </div>

            {/* Right side - Actions */}
            <div className="flex items-center space-x-3">
              {/* Success message */}
              {showSuccessMessage && (
                <div className="flex items-center text-sm text-green-600">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  {successMessage}
                </div>
              )}

              {/* Mode Navigation */}
              <EditingModeNavigation
                currentMode={editingMode}
                onModeChange={setEditingMode}
                validationErrors={validation.errors.length}
                hasWarnings={hasWarnings}
                isAutoSaving={isSaving}
                lastSaved={lastAutoSave}
              />

              {/* Publishing Actions */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleSaveDraft()}
                  disabled={isSaving || isPublishing}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Save Draft
                </button>
                
                <button
                  onClick={() => {
                    setPublishingMode('immediate');
                    handlePublish();
                  }}
                  disabled={isPublishing || hasErrors}
                  className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors
                    ${hasErrors 
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                >
                  {isPublishing ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Publish className="w-4 h-4 mr-2" />
                  )}
                  Publish
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        {/* Settings Panel - Quick Access to Advanced Settings */}
        {editingMode.type === 'settings' && (
          <div className="bg-white border-b border-gray-200 p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                onClick={() => openModal('business-type')}
                className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <h3 className="font-medium text-gray-900">Business Type</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {formData.businessType || 'Not set'}
                </p>
              </button>
              
              <button
                onClick={() => openModal('scheduling')}
                className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <h3 className="font-medium text-gray-900">Scheduling</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {formData.scheduling?.scheduleType || 'Not configured'}
                </p>
              </button>
              
              <button
                onClick={() => openModal('pricing')}
                className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <h3 className="font-medium text-gray-900">Advanced Pricing</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {formData.pricing?.currency || 'USD'} • {formData.pricing?.basePricing?.adult ? `$${formData.pricing.basePricing.adult}` : 'Not set'}
                </p>
              </button>
              
              <button
                onClick={() => openModal('seo')}
                className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <h3 className="font-medium text-gray-900">SEO & Metadata</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {formData.media?.seoData?.slug || 'Not configured'}
                </p>
              </button>
            </div>
          </div>
        )}

        {/* Enhanced ReviewStep as the main editable interface */}
        <ReviewStep 
          formData={formData}
          updateFormData={updateFormData}
        />
      </div>

      {/* Modal Placeholders - These will be implemented in the next subtask */}
      {editingMode.activeModal === 'business-type' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Business Type Settings</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                ×
              </button>
            </div>
            <p className="text-gray-600">Business type modal will be implemented in the next subtask.</p>
            <div className="mt-4 flex justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </Card>
        </div>
      )}

      {editingMode.activeModal === 'scheduling' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Scheduling Settings</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                ×
              </button>
            </div>
            <p className="text-gray-600">Scheduling modal will be implemented in the next subtask.</p>
            <div className="mt-4 flex justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </Card>
        </div>
      )}

      {editingMode.activeModal === 'pricing' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Advanced Pricing Settings</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                ×
              </button>
            </div>
            <p className="text-gray-600">Advanced pricing modal will be implemented in the next subtask.</p>
            <div className="mt-4 flex justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </Card>
        </div>
      )}

      {editingMode.activeModal === 'seo' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">SEO & Metadata Settings</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                ×
              </button>
            </div>
            <p className="text-gray-600">SEO & metadata modal will be implemented in the next subtask.</p>
            <div className="mt-4 flex justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default EditableOfferingView;