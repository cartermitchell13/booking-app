import React, { useState } from 'react';
import {
  Check,
  Edit,
  AlertCircle,
  MapPin,
  Clock,
  DollarSign,
  Image as ImageIcon,
  Users,
  Calendar,
  Eye,
  Share,
  Send,
  Save,
  CheckCircle,
  Star,
  Heart,
  ArrowLeft,
  Camera,
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
  X
} from 'lucide-react';
import { StepComponentProps } from '../types/createOfferingTypes';
import { getProductTypeName } from '../constants';
import { useTenant, useTenantBranding } from '@/lib/tenant-context';
import { useOfferingPublishing } from '@/hooks/useOfferingPublishing';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { EditableText } from '@/components/ui/EditableText';
import { EditableRichText } from '@/components/ui/EditableRichText';
import { EditableImageGallery } from '@/components/ui/EditableImageGallery';
import { EditableHighlights } from '@/components/ui/EditableHighlights';
import { EditableAmenities } from '@/components/ui/EditableAmenities';
import { EditablePricingSidebar } from '@/components/ui/EditablePricingSidebar';
import { EditablePickupLocations } from '@/components/ui/EditablePickupLocations';
import { ValidationIndicator, ValidationMessage, FieldValidationWrapper, SectionValidationBadge } from '@/components/ui/ValidationIndicator';
import { ValidationOverlay, InlineValidationBanner } from '@/components/ui/ValidationOverlay';
import { useRealTimeValidation } from '@/hooks/useRealTimeValidation';

export const ReviewStep: React.FC<StepComponentProps> = ({ formData, updateFormData }) => {
  const router = useRouter();
  const { tenant } = useTenant();
  const branding = useTenantBranding();
  const {
    isPublishing,
    publishingError,
    saveDraft,
    publishImmediately,
    schedulePublishing
  } = useOfferingPublishing();

  const [activeTab, setActiveTab] = useState<'preview' | 'validation' | 'pricing'>('preview');
  const [publishingMode, setPublishingMode] = useState<'draft' | 'immediate' | 'scheduled'>('immediate');
  const [scheduledDate, setScheduledDate] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [draftName, setDraftName] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showValidationOverlay, setShowValidationOverlay] = useState(false);
  const [testPricing, setTestPricing] = useState({
    adults: 2,
    children: 0,
    students: 0,
    seniors: 0,
    groupSize: 2
  });

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

  const goToStep = (stepNumber: number) => {
    // This would typically be handled by the parent component
    console.log(`Navigate to step ${stepNumber}`);
  };

  // Format functions
  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(0)}`;
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return 'TBD';
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };



  // Use the new validation system
  const validationErrors = validation.errors;

  const primaryImage = formData.media?.images?.find(img => img.isPrimary) || formData.media?.images?.[0];

  const calculateTotalPrice = () => {
    const basePricing = formData.pricing?.basePricing;
    const currency = formData.pricing?.currency || 'CAD';

    const subtotal =
      (testPricing.adults * (basePricing?.adult || 0)) +
      (testPricing.children * (basePricing?.child || 0)) +
      (testPricing.students * (basePricing?.student || 0)) +
      (testPricing.seniors * (basePricing?.senior || 0));

    const taxRate = (formData.pricing as any)?.taxRate || 0;
    const taxes = subtotal * (taxRate / 100);
    const total = subtotal + taxes;

    return {
      currency,
      subtotal: subtotal.toFixed(2),
      taxes: taxes.toFixed(2),
      total: total.toFixed(2)
    };
  };

  const generatePreviewUrl = () => {
    const slug = formData.media?.seoData?.slug || 'preview-offering';
    const previewId = Date.now().toString(36);
    const url = `${window.location.origin}/preview/${slug}?preview=${previewId}`;
    setPreviewUrl(url);
  };

  // Handle publishing actions
  const handlePublish = async () => {
    console.log('🔍 DEBUG: handlePublish called');
    console.log('🔍 DEBUG: publishingMode:', publishingMode);
    console.log('🔍 DEBUG: validationErrors.length:', validationErrors.length);
    console.log('🔍 DEBUG: isPublishing:', isPublishing);

    if (publishingMode === 'immediate' && validationErrors.length > 0) {
      console.log('🔍 DEBUG: Validation errors prevent publishing');
      alert('Please fix validation errors before publishing');
      return;
    }

    // Ensure we have complete form data
    const completeFormData = formData as any; // Type assertion since we know it's complete at this step
    console.log('🔍 DEBUG: Form data keys:', Object.keys(completeFormData));

    setShowSuccessMessage(false);

    try {
      console.log('🔍 DEBUG: Starting publish process');
      let result;
      let message = '';

      switch (publishingMode) {
        case 'draft':
          result = await saveDraft(completeFormData, draftName || undefined);
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

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Review Your Offering
        </h2>
        <p className="text-gray-600">
          Review all the details before publishing your offering.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('preview')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'preview'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            <Eye className="w-4 h-4 inline mr-2" />
            Customer Preview
          </button>
          <button
            onClick={() => setActiveTab('validation')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'validation'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            <CheckCircle className="w-4 h-4 inline mr-2" />
            Validation
            {validationErrors.length > 0 && (
              <span className="ml-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                {validationErrors.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('pricing')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'pricing'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            <DollarSign className="w-4 h-4 inline mr-2" />
            Pricing Test
          </button>
        </nav>
      </div>

      {/* Preview Tab */}
      {activeTab === 'preview' && (
        <div className="space-y-6">
          {/* Validation Banner */}
          <InlineValidationBanner
            validation={validation}
            completionPercentage={completionPercentage}
            onShowDetails={() => setShowValidationOverlay(true)}
          />

          {/* Customer-Facing Preview */}
          <div className="min-h-screen" style={{ backgroundColor: branding.background_color || '#FFFFFF' }}>
            {/* Header */}
            <header className="relative z-10 border-b border-gray-100">
              <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="flex justify-between items-center py-4">
                  <div className="flex items-center space-x-3">
                    <ArrowLeft className="w-5 h-5" style={{ color: branding.textOnBackground }} />
                    <Image
                      src={branding.logo_url || "/images/black-pb-logo.png"}
                      alt={tenant?.name || "Logo"}
                      width={160}
                      height={42}
                      className="h-10 w-auto"
                    />
                  </div>
                  <nav className="hidden md:flex space-x-8">
                    <a href="#" className="transition-colors hover:opacity-70" style={{ color: branding.textOnBackground }}>
                      Trips
                    </a>
                    <a href="#" className="transition-colors hover:opacity-70" style={{ color: branding.textOnBackground }}>
                      About
                    </a>
                    <a href="#" className="transition-colors hover:opacity-70" style={{ color: branding.textOnBackground }}>
                      Support
                    </a>
                  </nav>
                </div>
              </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">

                  {/* Image Gallery */}
                  <EditableImageGallery
                    images={formData.media?.images || []}
                    onChange={(images) => {
                      updateFormData('media', {
                        ...formData.media,
                        images
                      });
                    }}
                    selectedImageIndex={selectedImageIndex}
                    onSelectedImageChange={setSelectedImageIndex}
                    branding={branding}
                  />

                  {/* Trip Info */}
                  <div
                    className="rounded-2xl p-6 border-2"
                    style={{
                      backgroundColor: branding.foreground_color || '#FFFFFF',
                      borderColor: branding.accent_color || '#E5E7EB'
                    }}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <FieldValidationWrapper
                        fieldPath="basicInfo.name"
                        errors={[...validation.errors, ...validation.warnings]}
                        showInlineError={false}
                        className="flex-1 mr-4"
                      >
                        <EditableText
                          value={formData.basicInfo?.name || ''}
                          onChange={(value) => {
                            updateFormData('basicInfo', {
                              ...formData.basicInfo,
                              name: value
                            });
                          }}
                          placeholder="Click to add offering name"
                          displayAs="h1"
                          className="text-4xl font-extrabold"
                          style={{ color: branding.textOnForeground }}
                          autoSave={false}
                          emptyText="Click to add offering name"
                          showEditIcon={true}
                        />
                      </FieldValidationWrapper>
                      <div className="flex items-center space-x-4">
                        <button className="p-2 rounded-full hover:bg-gray-100">
                          <Heart className="w-6 h-6" style={{ color: branding.textOnForeground }} />
                        </button>
                        <button className="p-2 rounded-full hover:bg-gray-100">
                          <Share className="w-6 h-6" style={{ color: branding.textOnForeground }} />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 mb-6">
                      <div className="flex items-center gap-4 text-sm" style={{ color: branding.textOnForeground }}>
                        <div className="flex items-center">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                          <span>4.9 (127 reviews)</span>
                        </div>
                        <FieldValidationWrapper
                          fieldPath="basicInfo.location"
                          errors={[...validation.errors, ...validation.warnings]}
                          showInlineError={false}
                          className="flex items-center"
                        >
                          <MapPin className="w-4 h-4 mr-1" />
                          <EditableText
                            value={formData.basicInfo?.location || ''}
                            onChange={(value) => {
                              updateFormData('basicInfo', {
                                ...formData.basicInfo,
                                location: value
                              });
                            }}
                            placeholder="Click to add location"
                            displayAs="span"
                            autoSave={false}
                            emptyText="Click to add location"
                            style={{ color: branding.textOnForeground }}
                          />
                        </FieldValidationWrapper>
                        <FieldValidationWrapper
                          fieldPath="basicInfo.duration"
                          errors={[...validation.errors, ...validation.warnings]}
                          showInlineError={false}
                          className="flex items-center"
                        >
                          <Clock className="w-4 h-4 mr-1" />
                          <EditableText
                            value={formData.basicInfo?.duration?.toString() || ''}
                            onChange={(value) => {
                              const numValue = parseInt(value) || 0;
                              updateFormData('basicInfo', {
                                ...formData.basicInfo,
                                duration: numValue
                              });
                            }}
                            placeholder="Click to add duration"
                            displayAs="span"
                            inputType="text"
                            autoSave={false}
                            emptyText="0"
                            style={{ color: branding.textOnForeground }}
                            validator={(value) => {
                              const num = parseInt(value);
                              if (isNaN(num) || num < 0) {
                                return "Duration must be a positive number";
                              }
                              return null;
                            }}
                          />
                          <span style={{ color: branding.textOnForeground }}> min duration</span>
                        </FieldValidationWrapper>
                      </div>
                    </div>

                    <FieldValidationWrapper
                      fieldPath="basicInfo.description"
                      errors={[...validation.errors, ...validation.warnings]}
                      showInlineError={false}
                    >
                      <EditableRichText
                        value={formData.basicInfo?.description || ''}
                        onChange={(value) => {
                          updateFormData('basicInfo', {
                            ...formData.basicInfo,
                            description: value
                          });
                        }}
                        placeholder="Click to add description..."
                        displayAs="div"
                        className="text-lg leading-relaxed"
                        style={{ color: branding.textOnForeground }}
                        autoSave={true}
                        saveDelay={2000}
                        emptyText="Experience the beauty of nature with our expertly guided adventure tour. Discover breathtaking landscapes, learn about local wildlife, and create memories that will last a lifetime."
                        showEditIcon={true}
                        showSaveIndicator={true}
                      />
                    </FieldValidationWrapper>
                  </div>

                  {/* Highlights */}
                  <div
                    className="rounded-2xl p-6 border-2"
                    style={{
                      backgroundColor: branding.foreground_color || '#FFFFFF',
                      borderColor: branding.accent_color || '#637752'
                    }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-2xl font-bold" style={{
                        color: branding.textOnForeground,
                        fontFamily: `var(--tenant-font, 'Inter')`
                      }}>Trip Highlights</h2>
                      <ValidationIndicator 
                        errors={getSectionErrors('Basic Info').filter(e => e.field.includes('highlights'))} 
                        size="sm"
                      />
                    </div>
                    <EditableHighlights
                      highlights={formData.productConfig?.highlights || []}
                      onChange={(highlights) => {
                        updateFormData('productConfig', {
                          ...formData.productConfig,
                          highlights
                        });
                      }}
                      branding={branding}
                      placeholder="Add a trip highlight..."
                      maxItems={8}
                    />
                  </div>

                  {/* What's Included */}
                  <div
                    className="rounded-2xl p-6 border-2"
                    style={{
                      backgroundColor: branding.foreground_color || '#FFFFFF',
                      borderColor: branding.accent_color || '#637752'
                    }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-2xl font-bold" style={{
                        color: branding.textOnForeground,
                        fontFamily: `var(--tenant-font, 'Inter')`
                      }}>What's Included</h2>
                      <ValidationIndicator 
                        errors={getSectionErrors('Basic Info').filter(e => e.field.includes('amenities'))} 
                        size="sm"
                      />
                    </div>
                    <EditableAmenities
                      amenities={formData.productConfig?.amenities || []}
                      onChange={(amenities) => {
                        updateFormData('productConfig', {
                          ...formData.productConfig,
                          amenities
                        });
                      }}
                      branding={branding}
                      placeholder="Add an included amenity..."
                      maxItems={12}
                    />
                  </div>

                  {/* Pickup Locations */}
                  <div
                    className="rounded-2xl p-6 border-2"
                    style={{
                      backgroundColor: branding.foreground_color || '#FFFFFF',
                      borderColor: branding.accent_color || '#637752'
                    }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-2xl font-bold" style={{
                        color: branding.textOnForeground,
                        fontFamily: `var(--tenant-font, 'Inter')`
                      }}>Pickup Locations</h2>
                      <ValidationIndicator 
                        errors={getSectionErrors('Basic Info').filter(e => e.field.includes('pickup'))} 
                        size="sm"
                      />
                    </div>
                    <EditablePickupLocations
                      pickupLocations={formData.productConfig?.pickupLocations || []}
                      onChange={(pickupLocations) => {
                        updateFormData('productConfig', {
                          ...formData.productConfig,
                          pickupLocations
                        });
                      }}
                      branding={branding}
                      placeholder="Click to add pickup location"
                      maxLocations={10}
                    />
                  </div>


                </div>

                {/* Editable Pricing Sidebar */}
                <div className="lg:col-span-1">
                  <div className="sticky top-8 space-y-6">
                    <EditablePricingSidebar
                      pricing={formData.pricing || {
                        basePricing: { adult: 0 },
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
                      }}
                      onChange={(pricing) => {
                        updateFormData('pricing', pricing);
                      }}
                      branding={branding}
                    />

                    {/* Contact Info */}
                    <div
                      className="rounded-2xl p-6 border-2"
                      style={{
                        backgroundColor: branding.foreground_color || '#FFFFFF',
                        borderColor: branding.accent_color || '#637752'
                      }}
                    >
                      <h3 className="font-semibold mb-4" style={{ color: branding.textOnForeground }}>Need Help?</h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex items-center gap-3">
                          <Phone className="w-4 h-4" style={{ color: branding.primary_color || '#10B981' }} />
                          <span style={{ color: branding.textOnForeground }}>1-800-PARKBUS</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Mail className="w-4 h-4" style={{ color: branding.primary_color || '#10B981' }} />
                          <span style={{ color: branding.textOnForeground }}>support@{tenant?.slug || 'company'}.com</span>
                        </div>
                      </div>
                      <button
                        className="w-full mt-4 py-2 px-4 border rounded-lg hover:opacity-90 transition-colors text-sm"
                        style={{
                          borderColor: branding.accent_color || '#E5E7EB',
                          color: branding.textOnForeground
                        }}
                      >
                        Contact Support
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      )}

      {/* Validation Tab */}
      {activeTab === 'validation' && (
        <div className="space-y-6">
          {/* Validation Summary */}
          <div className={`p-6 rounded-lg ${validation.isValid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <div className="flex items-center mb-4">
              <ValidationIndicator errors={[...validation.errors, ...validation.warnings]} size="lg" />
              <div className="ml-3">
                <h3 className={`text-lg font-semibold ${validation.isValid ? 'text-green-800' : 'text-red-800'}`}>
                  {validation.isValid ? 'All Required Fields Complete' : `${validation.errors.length} Issues Found`}
                </h3>
                <p className="text-sm text-gray-600">
                  {completionPercentage}% complete
                  {validation.warnings.length > 0 && ` • ${validation.warnings.length} warning${validation.warnings.length !== 1 ? 's' : ''}`}
                </p>
              </div>
            </div>

            {validation.isValid ? (
              <p className="text-green-700">Your offering is ready to publish! All required fields have been completed.</p>
            ) : (
              <div className="space-y-3">
                <p className="text-red-700">Please address the following issues before publishing:</p>
                <ValidationMessage errors={validation.errors} />
              </div>
            )}

            {validation.warnings.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-yellow-700 font-medium mb-2">Suggestions for improvement:</p>
                <ValidationMessage errors={validation.warnings} />
              </div>
            )}
          </div>

          {/* Section Status */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Section Status</h3>
            <div className="space-y-3">
              {Object.entries(sectionStatus).map(([section, status]) => {
                const sectionErrors = getSectionErrors(section);
                return (
                  <div key={section} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                    <div className="flex items-center space-x-3">
                      <ValidationIndicator errors={sectionErrors} size="sm" />
                      <div>
                        <h4 className="font-medium text-gray-900">{section}</h4>
                        <p className="text-sm text-gray-600">
                          {status.completed}/{status.total} required fields completed
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <SectionValidationBadge
                        sectionName={section}
                        errors={sectionErrors}
                        completed={status.completed}
                        total={status.total}
                      />
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            status.hasErrors ? 'bg-red-500' : 
                            status.hasWarnings ? 'bg-yellow-500' : 
                            'bg-green-500'
                          }`}
                          style={{ width: `${(status.completed / status.total) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Pricing Test Tab */}
      {activeTab === 'pricing' && (
        <div className="space-y-6">
          {/* Pricing Calculator */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Pricing Scenarios</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Input Panel */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Adults</label>
                    <input
                      type="number"
                      value={testPricing.adults}
                      onChange={(e) => setTestPricing({ ...testPricing, adults: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Children</label>
                    <input
                      type="number"
                      value={testPricing.children}
                      onChange={(e) => setTestPricing({ ...testPricing, children: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Students</label>
                    <input
                      type="number"
                      value={testPricing.students}
                      onChange={(e) => setTestPricing({ ...testPricing, students: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Seniors</label>
                    <input
                      type="number"
                      value={testPricing.seniors}
                      onChange={(e) => setTestPricing({ ...testPricing, seniors: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                  </div>
                </div>

                {/* Quick Presets */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quick Presets</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setTestPricing({ adults: 1, children: 0, students: 0, seniors: 0, groupSize: 1 })}
                      className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      Solo Traveler
                    </button>
                    <button
                      onClick={() => setTestPricing({ adults: 2, children: 0, students: 0, seniors: 0, groupSize: 2 })}
                      className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      Couple
                    </button>
                    <button
                      onClick={() => setTestPricing({ adults: 2, children: 2, students: 0, seniors: 0, groupSize: 4 })}
                      className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      Family
                    </button>
                    <button
                      onClick={() => setTestPricing({ adults: 8, children: 0, students: 0, seniors: 0, groupSize: 8 })}
                      className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      Group
                    </button>
                  </div>
                </div>
              </div>

              {/* Calculation Results */}
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h4 className="font-medium text-gray-900 mb-4">Price Breakdown</h4>
                <div className="space-y-3">
                  {testPricing.adults > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">{testPricing.adults} Adults × {formData.pricing?.currency || 'CAD'} {formData.pricing?.basePricing?.adult || '0.00'}</span>
                      <span className="font-medium">{formData.pricing?.currency || 'CAD'} {(testPricing.adults * (formData.pricing?.basePricing?.adult || 0)).toFixed(2)}</span>
                    </div>
                  )}
                  {testPricing.children > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">{testPricing.children} Children × {formData.pricing?.currency || 'CAD'} {formData.pricing?.basePricing?.child || '0.00'}</span>
                      <span className="font-medium">{formData.pricing?.currency || 'CAD'} {(testPricing.children * (formData.pricing?.basePricing?.child || 0)).toFixed(2)}</span>
                    </div>
                  )}
                  {testPricing.students > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">{testPricing.students} Students × {formData.pricing?.currency || 'CAD'} {formData.pricing?.basePricing?.student || '0.00'}</span>
                      <span className="font-medium">{formData.pricing?.currency || 'CAD'} {(testPricing.students * (formData.pricing?.basePricing?.student || 0)).toFixed(2)}</span>
                    </div>
                  )}
                  {testPricing.seniors > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">{testPricing.seniors} Seniors × {formData.pricing?.currency || 'CAD'} {formData.pricing?.basePricing?.senior || '0.00'}</span>
                      <span className="font-medium">{formData.pricing?.currency || 'CAD'} {(testPricing.seniors * (formData.pricing?.basePricing?.senior || 0)).toFixed(2)}</span>
                    </div>
                  )}

                  <div className="border-t pt-3">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Subtotal</span>
                      <span>{calculateTotalPrice().currency} {calculateTotalPrice().subtotal}</span>
                    </div>
                    {parseFloat(calculateTotalPrice().taxes) > 0 && (
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Taxes ({(formData.pricing as any)?.taxRate || 0}%)</span>
                        <span>{calculateTotalPrice().currency} {calculateTotalPrice().taxes}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-bold text-gray-900 mt-2">
                      <span>Total</span>
                      <span>{calculateTotalPrice().currency} {calculateTotalPrice().total}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Publishing Options */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Publishing Options</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <button
            onClick={() => setPublishingMode('draft')}
            className={`p-4 rounded-lg border-2 transition-all ${publishingMode === 'draft'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
              }`}
          >
            <Save className="w-6 h-6 mx-auto mb-2 text-gray-600" />
            <div className="text-sm font-medium text-gray-900">Save as Draft</div>
            <div className="text-xs text-gray-500">Continue editing later</div>
          </button>

          <button
            onClick={() => setPublishingMode('immediate')}
            className={`p-4 rounded-lg border-2 transition-all ${publishingMode === 'immediate'
              ? 'border-green-500 bg-green-50'
              : 'border-gray-200 hover:border-gray-300'
              }`}
          >
            <CheckCircle className="w-6 h-6 mx-auto mb-2 text-gray-600" />
            <div className="text-sm font-medium text-gray-900">Publish Now</div>
            <div className="text-xs text-gray-500">Go live immediately</div>
          </button>

          <button
            onClick={() => setPublishingMode('scheduled')}
            className={`p-4 rounded-lg border-2 transition-all ${publishingMode === 'scheduled'
              ? 'border-purple-500 bg-purple-50'
              : 'border-gray-200 hover:border-gray-300'
              }`}
          >
            <Calendar className="w-6 h-6 mx-auto mb-2 text-gray-600" />
            <div className="text-sm font-medium text-gray-900">Schedule</div>
            <div className="text-xs text-gray-500">Set future publish date</div>
          </button>
        </div>

        {publishingMode === 'draft' && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Draft Name (Optional)
            </label>
            <input
              type="text"
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              placeholder={`Draft - ${formData.basicInfo?.name || 'Untitled'} - ${new Date().toLocaleDateString()}`}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {publishingMode === 'scheduled' && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
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

        {/* Preview Link */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">
              Preview Link
            </label>
            <button
              onClick={generatePreviewUrl}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Generate Link
            </button>
          </div>
          {previewUrl && (
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={previewUrl}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
              />
              <button
                onClick={() => navigator.clipboard.writeText(previewUrl)}
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                Copy
              </button>
            </div>
          )}
        </div>

        {/* Error Message */}
        {publishingError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <X className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">
                  Publishing Failed
                </p>
                <p className="text-sm text-red-700 mt-1">
                  {publishingError}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {showSuccessMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-5 w-5 text-green-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">
                  {successMessage}
                </p>
                {publishingMode !== 'draft' && (
                  <p className="text-sm text-green-700 mt-1">
                    Redirecting to offerings page...
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {publishingMode === 'draft' && 'Draft will be saved to your account'}
            {publishingMode === 'immediate' && validationErrors.length === 0 && 'Offering will be published immediately'}
            {publishingMode === 'immediate' && validationErrors.length > 0 && 'Please fix validation errors before publishing'}
            {publishingMode === 'scheduled' && scheduledDate && `Will publish on ${new Date(scheduledDate).toLocaleString()}`}
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => window.open(previewUrl, '_blank')}
              disabled={!previewUrl}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Eye className="w-4 h-4 mr-2 inline" />
              Preview
            </button>
            <button
              onClick={handlePublish}
              disabled={isPublishing || (publishingMode === 'immediate' && validationErrors.length > 0)}
              className={`px-6 py-2 rounded-md font-medium transition-colors flex items-center ${isPublishing
                ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                : publishingMode === 'immediate' && validationErrors.length > 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : publishingMode === 'draft'
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
            >
              {isPublishing && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              )}
              {isPublishing ? 'Processing...' : ''}
              {!isPublishing && publishingMode === 'draft' && 'Save Draft'}
              {!isPublishing && publishingMode === 'immediate' && 'Publish Now'}
              {!isPublishing && publishingMode === 'scheduled' && 'Schedule Publication'}
            </button>
          </div>
        </div>
      </div>

      {/* Validation Overlay */}
      <ValidationOverlay
        isVisible={showValidationOverlay}
        onClose={() => setShowValidationOverlay(false)}
        validation={validation}
        sectionStatus={sectionStatus}
        completionPercentage={completionPercentage}
        onSectionClick={(section) => {
          // Navigate to the appropriate tab or section
          setShowValidationOverlay(false);
          // Could add logic here to scroll to specific sections
        }}
      />
    </div>
  );
}; 