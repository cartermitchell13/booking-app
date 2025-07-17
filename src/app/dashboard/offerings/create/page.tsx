'use client';

import { useOfferingForm } from '@/hooks/useOfferingForm';
import { Card } from '@/components/ui/card';
import { SchedulingStep as SchedulingStepComponent } from '@/components/offerings/SchedulingStep';
import { 
  ArrowLeft, 
  ArrowRight, 
  Save, 
  Eye, 
  CheckCircle,
  Clock,
  AlertCircle,
  Home,
  ChevronRight,
  Calendar,
  Users,
  MapPin,
  DollarSign,
  Image,
  FileText,
  Settings,
  Loader2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

// Define the 7-step wizard structure
const WIZARD_STEPS = [
  { id: 1, title: 'Business Type', description: 'Choose your offering type', icon: Settings, isRequired: true },
  { id: 2, title: 'Basic Info', description: 'Name and description', icon: FileText, isRequired: true },
  { id: 3, title: 'Configuration', description: 'Product-specific settings', icon: Settings, isRequired: true },
  { id: 4, title: 'Scheduling', description: 'Availability and dates', icon: Calendar, isRequired: true },
  { id: 5, title: 'Pricing', description: 'Pricing and policies', icon: DollarSign, isRequired: true },
  { id: 6, title: 'Media', description: 'Photos and marketing', icon: Image, isRequired: true },
  { id: 7, title: 'Review', description: 'Final review and publish', icon: CheckCircle, isRequired: true }
];

// Product types for Step 1
const PRODUCT_TYPES = [
  {
    category: 'Transportation & Tours',
    types: [
      { id: 'seat', name: 'Bus Tours', description: 'Fixed seating with pickup locations', icon: '🚌' },
      { id: 'capacity', name: 'Boat Cruises', description: 'Total capacity limits with group pricing', icon: '⛵' },
      { id: 'open', name: 'Walking Tours', description: 'Open capacity with per-person pricing', icon: '🚶' }
    ]
  },
  {
    category: 'Activities & Experiences',
    types: [
      { id: 'open', name: 'Adventure Activities', description: 'Outdoor experiences and activities', icon: '🏔️' },
      { id: 'timeslot', name: 'Classes & Workshops', description: 'Scheduled sessions with instructors', icon: '🎓' },
      { id: 'equipment', name: 'Equipment Rental', description: 'Gear and equipment rentals', icon: '🚴' }
    ]
  },
  {
    category: 'Packages & Bundles',
    types: [
      { id: 'package', name: 'Multi-Activity Packages', description: 'Combine multiple offerings', icon: '📦' }
    ]
  }
];

export default function CreateOfferingPage() {
  const router = useRouter();
  const { formData, updateFormData, currentStep, goToStep, nextStep, prevStep, validateStep, submitForm, isSubmitting, lastAutoSave, saveProgress } = useOfferingForm();
  const [isSaving, setIsSaving] = useState(false);

  const handleNext = () => {
    nextStep();
  };

  const handlePrevious = () => {
    prevStep();
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    await saveProgress();
    setIsSaving(false);
  };

  const handleSubmit = async () => {
    if (validateStep(currentStep)) {
      await submitForm();
    }
  };

  const currentStepData = WIZARD_STEPS[currentStep - 1];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
            <Home className="w-4 h-4" />
            <ChevronRight className="w-4 h-4" />
            <span>Dashboard</span>
            <ChevronRight className="w-4 h-4" />
            <span>Offerings</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-blue-600">Create New Offering</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Offering</h1>
          <p className="text-gray-600 mt-1">
            Step {currentStep} of {WIZARD_STEPS.length}: {currentStepData.title}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {lastAutoSave && (
            <div className="text-xs text-gray-500">
              Saved {lastAutoSave.toLocaleTimeString()}
            </div>
          )}
          <button
            onClick={handleSaveDraft}
            disabled={isSaving}
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
            onClick={() => router.push('/dashboard/offerings')}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Offerings
          </button>
        </div>
      </div>

      {/* Progress Steps */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          {WIZARD_STEPS.map((step, index) => {
            const Icon = step.icon;
            const isActive = step.id === currentStep;
            const isCompleted = step.id < currentStep;
            const isAccessible = step.id <= currentStep;

            return (
              <div key={step.id} className="flex items-center">
                <button
                  onClick={() => isAccessible && goToStep(step.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-800 border-2 border-blue-600'
                      : isCompleted
                      ? 'bg-green-100 text-green-800 hover:bg-green-200'
                      : isAccessible
                      ? 'text-gray-600 hover:bg-gray-100'
                      : 'text-gray-400 cursor-not-allowed'
                  }`}
                  disabled={!isAccessible}
                >
                  <Icon className="w-4 h-4" />
                  <div className="text-left">
                    <div className="text-sm font-medium">{step.title}</div>
                    <div className="text-xs">{step.description}</div>
                  </div>
                  {isCompleted && <CheckCircle className="w-4 h-4 text-green-600" />}
                </button>
                {index < WIZARD_STEPS.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-gray-400 mx-2" />
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Step Content */}
      <Card className="p-8">
        {currentStep === 1 && <BusinessTypeStep formData={formData} updateFormData={updateFormData} />}
        {currentStep === 2 && <BasicInfoStep formData={formData} updateFormData={updateFormData} />}
        {currentStep === 3 && <ConfigurationStep formData={formData} updateFormData={updateFormData} />}
        {currentStep === 4 && <SchedulingStep formData={formData} updateFormData={updateFormData} />}
        {currentStep === 5 && <PricingStep formData={formData} updateFormData={updateFormData} />}
        {currentStep === 6 && <MediaStep formData={formData} updateFormData={updateFormData} />}
        {currentStep === 7 && <ReviewStep formData={formData} updateFormData={updateFormData} />}
      </Card>

      {/* Navigation */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </button>

          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span>Step {currentStep} of {WIZARD_STEPS.length}</span>
            <div className="w-32 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${(currentStep / WIZARD_STEPS.length) * 100}%` }}
              />
            </div>
          </div>

          {currentStep < WIZARD_STEPS.length ? (
            <button
              onClick={handleNext}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-2" />
              )}
              Create Offering
            </button>
          )}
        </div>
      </Card>
    </div>
  );
}

// Step 1: Business Type Selection Component
const BusinessTypeStep = ({ formData, updateFormData }: any) => (
  <div className="space-y-6">
    <div className="text-center">
      <h2 className="text-xl font-bold text-gray-900 mb-2">
        What type of offering are you creating?
      </h2>
      <p className="text-gray-600">
        Choose the business model that best describes your offering. This helps us customize the setup process for your specific needs.
      </p>
    </div>

    <div className="space-y-6">
      {PRODUCT_TYPES.map((category) => (
        <div key={category.category} className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-800">{category.category}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {category.types.map((type) => (
              <button
                key={type.id}
                onClick={() => {
                  updateFormData('businessType', category.category);
                  updateFormData('productType', type.id);
                }}
                className={`p-4 rounded-lg border-2 transition-all duration-200 text-left hover:shadow-md ${
                  formData.productType === type.id
                    ? 'border-blue-600 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">{type.icon}</span>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">{type.name}</h4>
                    <p className="text-sm text-gray-600">{type.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Step 2: Basic Information Form
const BasicInfoStep = ({ formData, updateFormData }: any) => (
  <div className="space-y-6">
    <div className="text-center">
      <h2 className="text-xl font-bold text-gray-900 mb-2">
        Tell us about your offering
      </h2>
      <p className="text-gray-600">
        Provide the essential details that will help customers understand what you're offering.
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Offering Name *
        </label>
        <input
          type="text"
          value={formData.basicInfo?.name || ''}
          onChange={(e) => updateFormData('basicInfo', { ...formData.basicInfo, name: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="e.g., Banff National Park Tour"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Location *
        </label>
        <input
          type="text"
          value={formData.basicInfo?.location || ''}
          onChange={(e) => updateFormData('basicInfo', { ...formData.basicInfo, location: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="e.g., Calgary, AB"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Duration (minutes) *
        </label>
        <input
          type="number"
          value={formData.basicInfo?.duration || ''}
          onChange={(e) => updateFormData('basicInfo', { ...formData.basicInfo, duration: parseInt(e.target.value) })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="e.g., 480"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Category
        </label>
        <select
          value={formData.basicInfo?.category || ''}
          onChange={(e) => updateFormData('basicInfo', { ...formData.basicInfo, category: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Select a category</option>
          <option value="tours">Tours & Sightseeing</option>
          <option value="activities">Activities & Experiences</option>
          <option value="transportation">Transportation</option>
          <option value="equipment">Equipment Rental</option>
          <option value="packages">Packages & Bundles</option>
        </select>
      </div>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Description *
      </label>
      <textarea
        value={formData.basicInfo?.description || ''}
        onChange={(e) => updateFormData('basicInfo', { ...formData.basicInfo, description: e.target.value })}
        rows={4}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder="Describe your offering in detail..."
      />
    </div>
  </div>
);

// Step 3: Dynamic Product Configuration Component
const ConfigurationStep = ({ formData, updateFormData }: any) => {
  const productType = formData.productType;
  const config = formData.productConfig || {};

  const updateConfig = (field: string, value: any) => {
    updateFormData('productConfig', {
      ...config,
      [field]: value
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Product Configuration</h2>
        <p className="text-gray-600">Configure settings specific to your {getProductTypeName(productType)} offering</p>
      </div>

      {productType === 'seat' && <SeatBasedConfig config={config} updateConfig={updateConfig} />}
      {productType === 'capacity' && <CapacityBasedConfig config={config} updateConfig={updateConfig} />}
      {productType === 'open' && <OpenConfig config={config} updateConfig={updateConfig} />}
      {productType === 'equipment' && <EquipmentConfig config={config} updateConfig={updateConfig} />}
      {productType === 'package' && <PackageConfig config={config} updateConfig={updateConfig} />}
      {productType === 'timeslot' && <TimeslotConfig config={config} updateConfig={updateConfig} />}
      
      {!productType && (
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
          <p className="text-gray-600">Please select a product type in Step 1 to configure your offering.</p>
        </div>
      )}
    </div>
  );
};

// Helper function to get product type display name
const getProductTypeName = (productType: string) => {
  const typeNames = {
    seat: 'Bus Tour',
    capacity: 'Boat Cruise',
    open: 'Walking Tour',
    equipment: 'Equipment Rental',
    package: 'Multi-Activity Package',
    timeslot: 'Class/Workshop'
  };
  return typeNames[productType as keyof typeof typeNames] || 'Unknown';
};

// Seat-Based Product Configuration (Bus Tours)
const SeatBasedConfig = ({ config, updateConfig }: any) => {
  const addPickupLocation = () => {
    const locations = config.pickupLocations || [];
    updateConfig('pickupLocations', [...locations, { 
      id: Date.now(),
      name: '',
      address: '',
      coordinates: { lat: 0, lng: 0 },
      pickupTime: '',
      isMainLocation: false
    }]);
  };

  const removePickupLocation = (id: number) => {
    const locations = config.pickupLocations || [];
    updateConfig('pickupLocations', locations.filter((loc: any) => loc.id !== id));
  };

  const updatePickupLocation = (id: number, field: string, value: any) => {
    const locations = config.pickupLocations || [];
    updateConfig('pickupLocations', locations.map((loc: any) => 
      loc.id === id ? { ...loc, [field]: value } : loc
    ));
  };

  return (
    <div className="space-y-8">
      {/* Vehicle Configuration */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🚌 Vehicle Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Type</label>
            <select
              value={config.vehicleType || ''}
              onChange={(e) => updateConfig('vehicleType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select vehicle type</option>
              <option value="coach">Coach Bus</option>
              <option value="minibus">Mini Bus</option>
              <option value="shuttle">Shuttle Van</option>
              <option value="luxury">Luxury Coach</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Total Seats</label>
            <input
              type="number"
              value={config.totalSeats || ''}
              onChange={(e) => updateConfig('totalSeats', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Accessible Seats</label>
            <input
              type="number"
              value={config.accessibleSeats || ''}
              onChange={(e) => updateConfig('accessibleSeats', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
            <div className="space-y-2">
              {['wifi', 'ac', 'restroom', 'refreshments', 'audioSystem'].map((amenity) => (
                <label key={amenity} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.amenities?.includes(amenity) || false}
                    onChange={(e) => {
                      const amenities = config.amenities || [];
                      if (e.target.checked) {
                        updateConfig('amenities', [...amenities, amenity]);
                      } else {
                        updateConfig('amenities', amenities.filter((a: string) => a !== amenity));
                      }
                    }}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 capitalize">{amenity.replace(/([A-Z])/g, ' $1')}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Pickup Locations */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">📍 Pickup Locations</h3>
          <button
            onClick={addPickupLocation}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Add Location
          </button>
        </div>
        <div className="space-y-4">
          {(config.pickupLocations || []).map((location: any) => (
            <div key={location.id} className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location Name</label>
                  <input
                    type="text"
                    value={location.name}
                    onChange={(e) => updatePickupLocation(location.id, 'name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Downtown Calgary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <input
                    type="text"
                    value={location.address}
                    onChange={(e) => updatePickupLocation(location.id, 'address', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="123 Main St, Calgary, AB"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Time</label>
                  <input
                    type="time"
                    value={location.pickupTime}
                    onChange={(e) => updatePickupLocation(location.id, 'pickupTime', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={location.isMainLocation}
                    onChange={(e) => updatePickupLocation(location.id, 'isMainLocation', e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Main pickup location</span>
                </label>
                <button
                  onClick={() => removePickupLocation(location.id)}
                  className="text-red-600 hover:text-red-700 text-sm"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
          {(!config.pickupLocations || config.pickupLocations.length === 0) && (
            <div className="text-center py-8 text-gray-500">
              <MapPin className="w-8 h-8 mx-auto mb-2" />
              <p>No pickup locations added yet. Click "Add Location" to get started.</p>
            </div>
          )}
        </div>
      </div>

      {/* Route Planning */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🗺️ Route Planning</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Route Description</label>
            <textarea
              value={config.routeDescription || ''}
              onChange={(e) => updateConfig('routeDescription', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe the route, stops, and key attractions..."
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Travel Time</label>
              <input
                type="number"
                value={config.estimatedTravelTime || ''}
                onChange={(e) => updateConfig('estimatedTravelTime', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Minutes"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Number of Stops</label>
              <input
                type="number"
                value={config.numberOfStops || ''}
                onChange={(e) => updateConfig('numberOfStops', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 5"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Capacity-Based Product Configuration (Boat Cruises)
const CapacityBasedConfig = ({ config, updateConfig }: any) => (
  <div className="space-y-8">
    {/* Venue Details */}
    <div className="bg-gray-50 p-6 rounded-lg">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">⛵ Venue Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Capacity</label>
          <input
            type="number"
            value={config.maxCapacity || ''}
            onChange={(e) => updateConfig('maxCapacity', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., 100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Group Size</label>
          <input
            type="number"
            value={config.minGroupSize || ''}
            onChange={(e) => updateConfig('minGroupSize', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., 10"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Vessel Type</label>
          <select
            value={config.vesselType || ''}
            onChange={(e) => updateConfig('vesselType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select vessel type</option>
            <option value="catamaran">Catamaran</option>
            <option value="yacht">Yacht</option>
            <option value="sailboat">Sailboat</option>
            <option value="powerboat">Powerboat</option>
            <option value="ferry">Ferry</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Deck Levels</label>
          <input
            type="number"
            value={config.deckLevels || ''}
            onChange={(e) => updateConfig('deckLevels', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., 2"
          />
        </div>
      </div>
    </div>

    {/* Amenities & Features */}
    <div className="bg-gray-50 p-6 rounded-lg">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">🏖️ Amenities & Features</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {['bar', 'dining', 'restrooms', 'sunDeck', 'soundSystem', 'wifi', 'airConditioning', 'dancingArea'].map((amenity) => (
          <label key={amenity} className="flex items-center">
            <input
              type="checkbox"
              checked={config.amenities?.includes(amenity) || false}
              onChange={(e) => {
                const amenities = config.amenities || [];
                if (e.target.checked) {
                  updateConfig('amenities', [...amenities, amenity]);
                } else {
                  updateConfig('amenities', amenities.filter((a: string) => a !== amenity));
                }
              }}
              className="mr-2"
            />
            <span className="text-sm text-gray-700 capitalize">{amenity.replace(/([A-Z])/g, ' $1')}</span>
          </label>
        ))}
      </div>
    </div>

    {/* Group Pricing Configuration */}
    <div className="bg-gray-50 p-6 rounded-lg">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">💰 Group Pricing</h3>
      <div className="space-y-4">
        <div>
          <label className="flex items-center">
            <input
              type="radio"
              name="pricingType"
              value="perPerson"
              checked={config.pricingType === 'perPerson'}
              onChange={(e) => updateConfig('pricingType', e.target.value)}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">Per Person Pricing</span>
          </label>
        </div>
        <div>
          <label className="flex items-center">
            <input
              type="radio"
              name="pricingType"
              value="flatRate"
              checked={config.pricingType === 'flatRate'}
              onChange={(e) => updateConfig('pricingType', e.target.value)}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">Flat Rate for Group</span>
          </label>
        </div>
        {config.pricingType === 'flatRate' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Base Group Rate</label>
            <input
              type="number"
              value={config.baseGroupRate || ''}
              onChange={(e) => updateConfig('baseGroupRate', parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 1500"
            />
          </div>
        )}
      </div>
    </div>
  </div>
);

// Open Product Configuration (Walking Tours)
const OpenConfig = ({ config, updateConfig }: any) => (
  <div className="space-y-8">
    {/* Meeting Points */}
    <div className="bg-gray-50 p-6 rounded-lg">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">📍 Meeting Points</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Main Meeting Point</label>
          <input
            type="text"
            value={config.mainMeetingPoint || ''}
            onChange={(e) => updateConfig('mainMeetingPoint', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Central Park Entrance"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Meeting Point Description</label>
          <textarea
            value={config.meetingPointDescription || ''}
            onChange={(e) => updateConfig('meetingPointDescription', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Provide detailed instructions for finding the meeting point..."
          />
        </div>
      </div>
    </div>

    {/* Guide Configuration */}
    <div className="bg-gray-50 p-6 rounded-lg">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">👨‍🏫 Guide Configuration</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Guide Type</label>
          <select
            value={config.guideType || ''}
            onChange={(e) => updateConfig('guideType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select guide type</option>
            <option value="professional">Professional Guide</option>
            <option value="local">Local Expert</option>
            <option value="historian">Historian</option>
            <option value="naturalist">Naturalist</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Group Size</label>
          <input
            type="number"
            value={config.maxGroupSize || ''}
            onChange={(e) => updateConfig('maxGroupSize', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., 20"
          />
        </div>
      </div>
    </div>

    {/* Equipment & Accessibility */}
    <div className="bg-gray-50 p-6 rounded-lg">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">🎒 Equipment & Accessibility</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Equipment Provided</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {['headsets', 'umbrellas', 'water', 'maps', 'binoculars', 'firstAid'].map((item) => (
              <label key={item} className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.equipmentProvided?.includes(item) || false}
                  onChange={(e) => {
                    const equipment = config.equipmentProvided || [];
                    if (e.target.checked) {
                      updateConfig('equipmentProvided', [...equipment, item]);
                    } else {
                      updateConfig('equipmentProvided', equipment.filter((i: string) => i !== item));
                    }
                  }}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700 capitalize">{item.replace(/([A-Z])/g, ' $1')}</span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Accessibility Features</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {['wheelchairAccessible', 'hearingLoop', 'largeText', 'slowPaced', 'restStops'].map((feature) => (
              <label key={feature} className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.accessibilityFeatures?.includes(feature) || false}
                  onChange={(e) => {
                    const features = config.accessibilityFeatures || [];
                    if (e.target.checked) {
                      updateConfig('accessibilityFeatures', [...features, feature]);
                    } else {
                      updateConfig('accessibilityFeatures', features.filter((f: string) => f !== feature));
                    }
                  }}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700 capitalize">{feature.replace(/([A-Z])/g, ' $1')}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Equipment Product Configuration (Rentals)
const EquipmentConfig = ({ config, updateConfig }: any) => (
  <div className="space-y-8">
    {/* Equipment Catalog */}
    <div className="bg-gray-50 p-6 rounded-lg">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">🛠️ Equipment Catalog</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Equipment Category</label>
          <select
            value={config.equipmentCategory || ''}
            onChange={(e) => updateConfig('equipmentCategory', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select category</option>
            <option value="bikes">Bikes & Cycling</option>
            <option value="water">Water Sports</option>
            <option value="winter">Winter Sports</option>
            <option value="camping">Camping & Outdoor</option>
            <option value="fitness">Fitness Equipment</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Total Inventory</label>
          <input
            type="number"
            value={config.totalInventory || ''}
            onChange={(e) => updateConfig('totalInventory', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., 50"
          />
        </div>
      </div>
    </div>

    {/* Rental Periods */}
    <div className="bg-gray-50 p-6 rounded-lg">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">⏰ Rental Periods</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Available Rental Periods</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['hourly', 'halfDay', 'fullDay', 'weekly'].map((period) => (
              <label key={period} className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.rentalPeriods?.includes(period) || false}
                  onChange={(e) => {
                    const periods = config.rentalPeriods || [];
                    if (e.target.checked) {
                      updateConfig('rentalPeriods', [...periods, period]);
                    } else {
                      updateConfig('rentalPeriods', periods.filter((p: string) => p !== period));
                    }
                  }}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700 capitalize">{period.replace(/([A-Z])/g, ' $1')}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Rental Period</label>
            <select
              value={config.minimumRentalPeriod || ''}
              onChange={(e) => updateConfig('minimumRentalPeriod', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select minimum period</option>
              <option value="1hour">1 Hour</option>
              <option value="2hours">2 Hours</option>
              <option value="halfDay">Half Day</option>
              <option value="fullDay">Full Day</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Rental Period</label>
            <select
              value={config.maximumRentalPeriod || ''}
              onChange={(e) => updateConfig('maximumRentalPeriod', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select maximum period</option>
              <option value="1day">1 Day</option>
              <option value="3days">3 Days</option>
              <option value="1week">1 Week</option>
              <option value="1month">1 Month</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    {/* Deposit & Insurance */}
    <div className="bg-gray-50 p-6 rounded-lg">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">💳 Deposit & Insurance</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Security Deposit Amount</label>
          <input
            type="number"
            value={config.securityDeposit || ''}
            onChange={(e) => updateConfig('securityDeposit', parseFloat(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., 100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Insurance Required</label>
          <select
            value={config.insuranceRequired || ''}
            onChange={(e) => updateConfig('insuranceRequired', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select insurance requirement</option>
            <option value="none">No Insurance Required</option>
            <option value="basic">Basic Coverage</option>
            <option value="comprehensive">Comprehensive Coverage</option>
            <option value="customerProvided">Customer Provided</option>
          </select>
        </div>
      </div>
    </div>
  </div>
);

// Package Product Configuration (Multi-Activity)
const PackageConfig = ({ config, updateConfig }: any) => (
  <div className="space-y-8">
    {/* Package Components */}
    <div className="bg-gray-50 p-6 rounded-lg">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">📦 Package Components</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Package Type</label>
          <select
            value={config.packageType || ''}
            onChange={(e) => updateConfig('packageType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select package type</option>
            <option value="adventure">Adventure Package</option>
            <option value="cultural">Cultural Experience</option>
            <option value="family">Family Package</option>
            <option value="romantic">Romantic Getaway</option>
            <option value="corporate">Corporate Package</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Package Duration</label>
          <select
            value={config.packageDuration || ''}
            onChange={(e) => updateConfig('packageDuration', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select duration</option>
            <option value="halfDay">Half Day</option>
            <option value="fullDay">Full Day</option>
            <option value="weekend">Weekend</option>
            <option value="3days">3 Days</option>
            <option value="week">1 Week</option>
          </select>
        </div>
      </div>
    </div>

    {/* Bundle Configuration */}
    <div className="bg-gray-50 p-6 rounded-lg">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">🎁 Bundle Configuration</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Bundle Discount Percentage</label>
          <input
            type="number"
            value={config.bundleDiscountPercentage || ''}
            onChange={(e) => updateConfig('bundleDiscountPercentage', parseFloat(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., 15"
            min="0"
            max="100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Customization Options</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {['addActivities', 'removeActivities', 'changeSchedule', 'upgradeMeals', 'addAccommodation'].map((option) => (
              <label key={option} className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.customizationOptions?.includes(option) || false}
                  onChange={(e) => {
                    const options = config.customizationOptions || [];
                    if (e.target.checked) {
                      updateConfig('customizationOptions', [...options, option]);
                    } else {
                      updateConfig('customizationOptions', options.filter((o: string) => o !== option));
                    }
                  }}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700 capitalize">{option.replace(/([A-Z])/g, ' $1')}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>

    {/* Validity & Restrictions */}
    <div className="bg-gray-50 p-6 rounded-lg">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">📅 Validity & Restrictions</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Package Validity Period</label>
          <select
            value={config.validityPeriod || ''}
            onChange={(e) => updateConfig('validityPeriod', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select validity period</option>
            <option value="6months">6 Months</option>
            <option value="1year">1 Year</option>
            <option value="2years">2 Years</option>
            <option value="noExpiry">No Expiry</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Participants</label>
          <input
            type="number"
            value={config.minimumParticipants || ''}
            onChange={(e) => updateConfig('minimumParticipants', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., 2"
          />
        </div>
      </div>
    </div>
  </div>
);

// Timeslot Product Configuration (Classes)
const TimeslotConfig = ({ config, updateConfig }: any) => (
  <div className="space-y-8">
    {/* Session Structure */}
    <div className="bg-gray-50 p-6 rounded-lg">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">📚 Session Structure</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Class Type</label>
          <select
            value={config.classType || ''}
            onChange={(e) => updateConfig('classType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select class type</option>
            <option value="workshop">Workshop</option>
            <option value="seminar">Seminar</option>
            <option value="hands-on">Hands-on Training</option>
            <option value="lecture">Lecture</option>
            <option value="masterclass">Master Class</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Class Size</label>
          <input
            type="number"
            value={config.maxClassSize || ''}
            onChange={(e) => updateConfig('maxClassSize', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., 15"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Skill Level</label>
          <select
            value={config.skillLevel || ''}
            onChange={(e) => updateConfig('skillLevel', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select skill level</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
            <option value="allLevels">All Levels</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Session Duration</label>
          <input
            type="number"
            value={config.sessionDuration || ''}
            onChange={(e) => updateConfig('sessionDuration', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Minutes"
          />
        </div>
      </div>
    </div>

    {/* Instructor & Venue */}
    <div className="bg-gray-50 p-6 rounded-lg">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">👨‍🏫 Instructor & Venue</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Instructor Requirements</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {['certified', 'experienced', 'bilingual', 'specialized', 'firstAid'].map((req) => (
              <label key={req} className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.instructorRequirements?.includes(req) || false}
                  onChange={(e) => {
                    const requirements = config.instructorRequirements || [];
                    if (e.target.checked) {
                      updateConfig('instructorRequirements', [...requirements, req]);
                    } else {
                      updateConfig('instructorRequirements', requirements.filter((r: string) => r !== req));
                    }
                  }}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700 capitalize">{req.replace(/([A-Z])/g, ' $1')}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Venue Type</label>
            <select
              value={config.venueType || ''}
              onChange={(e) => updateConfig('venueType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select venue type</option>
              <option value="classroom">Classroom</option>
              <option value="studio">Studio</option>
              <option value="outdoor">Outdoor Space</option>
              <option value="virtual">Virtual/Online</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Equipment Needed</label>
            <div className="grid grid-cols-2 gap-2">
              {['projector', 'computer', 'materials', 'tools', 'safety'].map((equipment) => (
                <label key={equipment} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.equipmentNeeded?.includes(equipment) || false}
                    onChange={(e) => {
                      const equipment_list = config.equipmentNeeded || [];
                      if (e.target.checked) {
                        updateConfig('equipmentNeeded', [...equipment_list, equipment]);
                      } else {
                        updateConfig('equipmentNeeded', equipment_list.filter((e: string) => e !== equipment));
                      }
                    }}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 capitalize">{equipment}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Prerequisites & Materials */}
    <div className="bg-gray-50 p-6 rounded-lg">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Prerequisites & Materials</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Prerequisites</label>
          <textarea
            value={config.prerequisites || ''}
            onChange={(e) => updateConfig('prerequisites', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="List any prerequisites or requirements for participants..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Materials Provided</label>
          <textarea
            value={config.materialsProvided || ''}
            onChange={(e) => updateConfig('materialsProvided', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="List what materials, tools, or resources will be provided..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">What to Bring</label>
          <textarea
            value={config.whatToBring || ''}
            onChange={(e) => updateConfig('whatToBring', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="List what participants should bring..."
          />
        </div>
      </div>
    </div>
  </div>
);

const SchedulingStep = ({ formData, updateFormData }: any) => {
  // Convert field-based updates to section-based updates for the useOfferingForm hook
  const handleSchedulingUpdate = (field: string, value: any) => {
    if (field.startsWith('scheduling.')) {
      const fieldName = field.replace('scheduling.', '');
      updateFormData('scheduling', { [fieldName]: value });
    } else {
      // Handle direct field updates
      updateFormData('scheduling', { [field]: value });
    }
  };

  // Convert form validation errors to field-based errors for the component
  const getFieldErrors = () => {
    const fieldErrors: Record<string, string> = {};
    
    // Check for basic validation errors
    if (!formData.scheduling?.scheduleType) {
      fieldErrors['scheduling.scheduleType'] = 'Schedule type is required';
    }
    if (!formData.scheduling?.timezone) {
      fieldErrors['scheduling.timezone'] = 'Timezone is required';
    }
    
    return fieldErrors;
  };

  return (
    <SchedulingStepComponent
      formData={formData}
      onUpdate={handleSchedulingUpdate}
      errors={getFieldErrors()}
      isLoading={false}
    />
  );
};

const PricingStep = ({ formData, updateFormData }: any) => (
  <div className="space-y-6">
    <div className="text-center">
      <h2 className="text-xl font-bold text-gray-900 mb-2">Pricing</h2>
      <p className="text-gray-600">Set pricing and policies</p>
    </div>
    <div className="text-center py-12">
      <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <p className="text-gray-600">Pricing step content coming soon...</p>
    </div>
  </div>
);

const MediaStep = ({ formData, updateFormData }: any) => (
  <div className="space-y-6">
    <div className="text-center">
      <h2 className="text-xl font-bold text-gray-900 mb-2">Media</h2>
      <p className="text-gray-600">Add photos and marketing materials</p>
    </div>
    <div className="text-center py-12">
      <Image className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <p className="text-gray-600">Media step content coming soon...</p>
    </div>
  </div>
);

const ReviewStep = ({ formData, updateFormData }: any) => (
  <div className="space-y-6">
    <div className="text-center">
      <h2 className="text-xl font-bold text-gray-900 mb-2">Review & Publish</h2>
      <p className="text-gray-600">Review your offering and publish</p>
    </div>
    <div className="text-center py-12">
      <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <p className="text-gray-600">Review step content coming soon...</p>
    </div>
  </div>
); 