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
import { useState, useEffect } from 'react';

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
    if (validateStep(currentStep)) {
      nextStep();
    }
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

const PricingStep = ({ formData, updateFormData }: any) => {
  const pricing = formData.pricing || {};
  
  const updatePricing = (field: string, value: any) => {
    // Handle nested basePricing structure
    if (['adultPrice', 'childPrice', 'studentPrice', 'seniorPrice'].includes(field)) {
      const baseField = field.replace('Price', ''); // adultPrice -> adult
      updateFormData('pricing', {
        ...pricing,
        basePricing: {
          ...pricing.basePricing,
          [baseField]: value
        }
      });
    } else {
      updateFormData('pricing', {
        ...pricing,
        [field]: value
      });
    }
  };

  const addGroupTier = () => {
    const tiers = pricing.groupTiers || [];
    updatePricing('groupTiers', [...tiers, {
      id: Date.now(),
      minSize: '',
      maxSize: '',
      discountType: 'percentage',
      discountValue: ''
    }]);
  };

  const removeGroupTier = (id: number) => {
    const tiers = pricing.groupTiers || [];
    updatePricing('groupTiers', tiers.filter((tier: any) => tier.id !== id));
  };

  const updateGroupTier = (id: number, field: string, value: any) => {
    const tiers = pricing.groupTiers || [];
    updatePricing('groupTiers', tiers.map((tier: any) => 
      tier.id === id ? { ...tier, [field]: value } : tier
    ));
  };

  const addSeasonalRate = () => {
    const rates = pricing.seasonalRates || [];
    updatePricing('seasonalRates', [...rates, {
      id: Date.now(),
      name: '',
      startDate: '',
      endDate: '',
      priceMultiplier: 1,
      isActive: true
    }]);
  };

  const removeSeasonalRate = (id: number) => {
    const rates = pricing.seasonalRates || [];
    updatePricing('seasonalRates', rates.filter((rate: any) => rate.id !== id));
  };

  const updateSeasonalRate = (id: number, field: string, value: any) => {
    const rates = pricing.seasonalRates || [];
    updatePricing('seasonalRates', rates.map((rate: any) => 
      rate.id === id ? { ...rate, [field]: value } : rate
    ));
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Pricing & Policies</h2>
        <p className="text-gray-600">Define your pricing structure and business policies</p>
      </div>

      {/* Base Pricing */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">💰 Base Pricing</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adult Price *
              <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">$</span>
              <input
                type="number"
                value={pricing.basePricing?.adult || ''}
                onChange={(e) => updatePricing('adultPrice', parseFloat(e.target.value) || 0)}
                className={`w-full pl-8 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  !pricing.basePricing?.adult ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="0.00"
                step="0.01"
                min="0"
                required
              />
            </div>
            {!pricing.basePricing?.adult && (
              <p className="mt-1 text-sm text-red-600">Adult price is required</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Child Price</label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">$</span>
              <input
                type="number"
                value={pricing.basePricing?.child || ''}
                onChange={(e) => updatePricing('childPrice', parseFloat(e.target.value) || 0)}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Student Price</label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">$</span>
              <input
                type="number"
                value={pricing.basePricing?.student || ''}
                onChange={(e) => updatePricing('studentPrice', parseFloat(e.target.value) || 0)}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Senior Price</label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">$</span>
              <input
                type="number"
                value={pricing.basePricing?.senior || ''}
                onChange={(e) => updatePricing('seniorPrice', parseFloat(e.target.value) || 0)}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Child Age Range</label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                value={pricing.childAgeMin || ''}
                onChange={(e) => updatePricing('childAgeMin', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
                min="0"
              />
              <span className="text-gray-500">to</span>
              <input
                type="number"
                value={pricing.childAgeMax || ''}
                onChange={(e) => updatePricing('childAgeMax', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="12"
                min="0"
              />
              <span className="text-gray-500">years</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Senior Age Minimum</label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                value={pricing.seniorAgeMin || ''}
                onChange={(e) => updatePricing('seniorAgeMin', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="65"
                min="0"
              />
              <span className="text-gray-500">years and older</span>
            </div>
          </div>
        </div>
      </div>

      {/* Group Discounts */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">👥 Group Discounts</h3>
          <button
            onClick={addGroupTier}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Add Tier
          </button>
        </div>
        <div className="space-y-4">
          {(pricing.groupTiers || []).map((tier: any) => (
            <div key={tier.id} className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Min Size</label>
                  <input
                    type="number"
                    value={tier.minSize}
                    onChange={(e) => updateGroupTier(tier.id, 'minSize', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="10"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Size</label>
                  <input
                    type="number"
                    value={tier.maxSize}
                    onChange={(e) => updateGroupTier(tier.id, 'maxSize', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="25"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Discount Type</label>
                  <select
                    value={tier.discountType}
                    onChange={(e) => updateGroupTier(tier.id, 'discountType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Discount Value</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500">
                      {tier.discountType === 'percentage' ? '%' : '$'}
                    </span>
                    <input
                      type="number"
                      value={tier.discountValue}
                      onChange={(e) => updateGroupTier(tier.id, 'discountValue', parseFloat(e.target.value) || 0)}
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={tier.discountType === 'percentage' ? '10' : '5.00'}
                      step={tier.discountType === 'percentage' ? '1' : '0.01'}
                      min="0"
                    />
                  </div>
                </div>
                <div>
                  <button
                    onClick={() => removeGroupTier(tier.id)}
                    className="w-full px-3 py-2 text-red-600 hover:text-red-700 text-sm border border-red-300 rounded-md hover:bg-red-50"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
          {(!pricing.groupTiers || pricing.groupTiers.length === 0) && (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-8 h-8 mx-auto mb-2" />
              <p>No group discount tiers added yet. Click "Add Tier" to create bulk pricing.</p>
            </div>
          )}
        </div>
      </div>

      {/* Seasonal Pricing */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">🌤️ Seasonal Pricing</h3>
          <button
            onClick={addSeasonalRate}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Add Season
          </button>
        </div>
        <div className="space-y-4">
          {(pricing.seasonalRates || []).map((rate: any) => (
            <div key={rate.id} className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Season Name</label>
                  <input
                    type="text"
                    value={rate.name}
                    onChange={(e) => updateSeasonalRate(rate.id, 'name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Peak Season"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={rate.startDate}
                    onChange={(e) => updateSeasonalRate(rate.id, 'startDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                  <input
                    type="date"
                    value={rate.endDate}
                    onChange={(e) => updateSeasonalRate(rate.id, 'endDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price Multiplier</label>
                  <input
                    type="number"
                    value={rate.priceMultiplier}
                    onChange={(e) => updateSeasonalRate(rate.id, 'priceMultiplier', parseFloat(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="1.25"
                    step="0.01"
                    min="0.1"
                  />
                  <p className="text-xs text-gray-500 mt-1">1.0 = Base price, 1.25 = 25% increase</p>
                </div>
                <div>
                  <button
                    onClick={() => removeSeasonalRate(rate.id)}
                    className="w-full px-3 py-2 text-red-600 hover:text-red-700 text-sm border border-red-300 rounded-md hover:bg-red-50"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
          {(!pricing.seasonalRates || pricing.seasonalRates.length === 0) && (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-8 h-8 mx-auto mb-2" />
              <p>No seasonal rates added yet. Click "Add Season" to create peak/off-peak pricing.</p>
            </div>
          )}
        </div>
      </div>

      {/* Currency & Tax Settings */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">💱 Currency & Tax Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Primary Currency</label>
            <select
              value={pricing.currency || 'CAD'}
              onChange={(e) => updatePricing('currency', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="CAD">CAD - Canadian Dollar</option>
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="AUD">AUD - Australian Dollar</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tax Rate (%)</label>
            <input
              type="number"
              value={pricing.taxRate || ''}
              onChange={(e) => updatePricing('taxRate', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="13.00"
              step="0.01"
              min="0"
              max="100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tax Display</label>
            <select
              value={pricing.taxDisplay || 'exclusive'}
              onChange={(e) => updatePricing('taxDisplay', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="exclusive">Exclusive (Added at checkout)</option>
              <option value="inclusive">Inclusive (Included in price)</option>
            </select>
          </div>
        </div>
        <div className="mt-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={pricing.enableMultiCurrency || false}
              onChange={(e) => updatePricing('enableMultiCurrency', e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">Enable multi-currency support</span>
          </label>
        </div>
      </div>

      {/* Cancellation Policy */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Cancellation Policy</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Free Cancellation Window</label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={pricing.freeCancellationHours || ''}
                  onChange={(e) => updatePricing('freeCancellationHours', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="24"
                  min="0"
                />
                <span className="text-gray-500">hours before</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cancellation Fee</label>
              <div className="flex items-center space-x-2">
                <select
                  value={pricing.cancellationFeeType || 'percentage'}
                  onChange={(e) => updatePricing('cancellationFeeType', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="percentage">%</option>
                  <option value="fixed">$</option>
                </select>
                <input
                  type="number"
                  value={pricing.cancellationFeeValue || ''}
                  onChange={(e) => updatePricing('cancellationFeeValue', parseFloat(e.target.value) || 0)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="10"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Refund Policy Details</label>
            <textarea
              value={pricing.refundPolicy || ''}
              onChange={(e) => updatePricing('refundPolicy', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe your refund policy in detail..."
            />
          </div>
        </div>
      </div>

      {/* Deposit & Payment Terms */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">💳 Deposit & Payment Terms</h3>
        <div className="space-y-4">
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={pricing.requireDeposit || false}
                onChange={(e) => updatePricing('requireDeposit', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Require deposit</span>
            </label>
          </div>
          {pricing.requireDeposit && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Deposit Amount</label>
                <div className="flex items-center space-x-2">
                  <select
                    value={pricing.depositType || 'percentage'}
                    onChange={(e) => updatePricing('depositType', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="percentage">%</option>
                    <option value="fixed">$</option>
                  </select>
                  <input
                    type="number"
                    value={pricing.depositValue || ''}
                    onChange={(e) => updatePricing('depositValue', parseFloat(e.target.value) || 0)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="20"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Due</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={pricing.paymentDueDays || ''}
                    onChange={(e) => updatePricing('paymentDueDays', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="7"
                    min="0"
                  />
                  <span className="text-gray-500">days before</span>
                </div>
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Methods</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['creditCard', 'debitCard', 'paypal', 'bankTransfer', 'cash', 'cheque'].map((method) => (
                <label key={method} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={pricing.paymentMethods?.includes(method) || false}
                    onChange={(e) => {
                      const methods = pricing.paymentMethods || [];
                      if (e.target.checked) {
                        updatePricing('paymentMethods', [...methods, method]);
                      } else {
                        updatePricing('paymentMethods', methods.filter((m: string) => m !== method));
                      }
                    }}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 capitalize">{method.replace(/([A-Z])/g, ' $1')}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Processing Fees */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">💼 Processing Fees</h3>
        <div className="space-y-4">
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={pricing.chargeProcessingFees || false}
                onChange={(e) => updatePricing('chargeProcessingFees', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Charge processing fees to customers</span>
            </label>
          </div>
          {pricing.chargeProcessingFees && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Credit Card Fee</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={pricing.creditCardFee || ''}
                    onChange={(e) => updatePricing('creditCardFee', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="2.9"
                    step="0.01"
                    min="0"
                  />
                  <span className="text-gray-500">%</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Administrative Fee</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={pricing.administrativeFee || ''}
                    onChange={(e) => updatePricing('administrativeFee', parseFloat(e.target.value) || 0)}
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="5.00"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dynamic Pricing Preview */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">🎯 Pricing Preview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-3">Base Pricing</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Adult:</span>
                <span className="font-medium">{pricing.currency || 'CAD'} {pricing.basePricing?.adult || '0.00'}</span>
              </div>
              <div className="flex justify-between">
                <span>Child:</span>
                <span className="font-medium">{pricing.currency || 'CAD'} {pricing.basePricing?.child || '0.00'}</span>
              </div>
              <div className="flex justify-between">
                <span>Student:</span>
                <span className="font-medium">{pricing.currency || 'CAD'} {pricing.basePricing?.student || '0.00'}</span>
              </div>
              <div className="flex justify-between">
                <span>Senior:</span>
                <span className="font-medium">{pricing.currency || 'CAD'} {pricing.basePricing?.senior || '0.00'}</span>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-3">Sample Calculation</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>2 Adults × {pricing.basePricing?.adult || '0.00'}:</span>
                <span>{pricing.currency || 'CAD'} {((pricing.basePricing?.adult || 0) * 2).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>1 Child × {pricing.basePricing?.child || '0.00'}:</span>
                <span>{pricing.currency || 'CAD'} {(pricing.basePricing?.child || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span>{pricing.currency || 'CAD'} {(((pricing.basePricing?.adult || 0) * 2) + (pricing.basePricing?.child || 0)).toFixed(2)}</span>
              </div>
              {pricing.taxDisplay === 'exclusive' && (
                <div className="flex justify-between text-gray-600">
                  <span>Tax ({pricing.taxRate || 0}%):</span>
                  <span>{pricing.currency || 'CAD'} {((((pricing.basePricing?.adult || 0) * 2) + (pricing.basePricing?.child || 0)) * (pricing.taxRate || 0) / 100).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-medium border-t pt-2">
                <span>Total:</span>
                <span>{pricing.currency || 'CAD'} {
                  pricing.taxDisplay === 'exclusive' 
                    ? ((((pricing.basePricing?.adult || 0) * 2) + (pricing.basePricing?.child || 0)) * (1 + (pricing.taxRate || 0) / 100)).toFixed(2)
                    : (((pricing.basePricing?.adult || 0) * 2) + (pricing.basePricing?.child || 0)).toFixed(2)
                }</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MediaStep = ({ formData, updateFormData }: any) => {
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
      updatedMedia[field] = value;
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
                  value={media.ogTitle || media.seoData?.metaTitle || ''}
                  onChange={(e) => updateMedia('ogTitle', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Facebook-optimized title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">OG Description</label>
                <textarea
                  value={media.ogDescription || media.seoData?.metaDescription || ''}
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
                  value={media.twitterTitle || media.seoData?.metaTitle || ''}
                  onChange={(e) => updateMedia('twitterTitle', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Twitter-optimized title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Twitter Description</label>
                <textarea
                  value={media.twitterDescription || media.seoData?.metaDescription || ''}
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
                value={(media.suggestedHashtags || []).join(' ')}
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

${(media.suggestedHashtags || []).slice(0, 5).join(' ')}`;
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
        {(media.socialMediaTemplate || media.emailTemplate) && (
          <div className="mt-6 space-y-4">
            {media.socialMediaTemplate && (
              <div>
                <h5 className="font-medium text-gray-900 mb-2">Social Media Template</h5>
                <textarea
                  value={media.socialMediaTemplate}
                  onChange={(e) => updateMedia('socialMediaTemplate', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            )}
            {media.emailTemplate && (
              <div>
                <h5 className="font-medium text-gray-900 mb-2">Email Template</h5>
                <textarea
                  value={media.emailTemplate}
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
                  {media.ogTitle || media.seoData?.metaTitle || formData.basicInfo?.name || 'Offering Title'}
                </div>
                <div className="text-xs text-gray-600 mb-2">
                  {media.ogDescription || media.seoData?.metaDescription || 'Description will appear here...'}
                </div>
                <div className="text-xs text-gray-500">
                  {window.location.hostname}
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
                  {media.twitterTitle || media.seoData?.metaTitle || formData.basicInfo?.name || 'Offering Title'}
                </div>
                <div className="text-xs text-gray-600 mb-2">
                  {media.twitterDescription || media.seoData?.metaDescription || 'Description will appear here...'}
                </div>
                <div className="text-xs text-gray-500">
                  {window.location.hostname}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ReviewStep = ({ formData, updateFormData }: any) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'validation' | 'pricing'>('preview');
  const [publishingMode, setPublishingMode] = useState<'draft' | 'immediate' | 'scheduled'>('draft');
  const [scheduledDate, setScheduledDate] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [validationErrors, setValidationErrors] = useState<any[]>([]);
  const [testPricing, setTestPricing] = useState({
    adults: 2,
    children: 1,
    students: 0,
    seniors: 0,
    groupSize: 0
  });

  // Validation logic
  const validateForm = () => {
    const errors: any[] = [];
    
    // Basic Info validation
    if (!formData.basicInfo?.name) errors.push({ field: 'basicInfo.name', message: 'Offering name is required', section: 'Basic Info' });
    if (!formData.basicInfo?.description) errors.push({ field: 'basicInfo.description', message: 'Description is required', section: 'Basic Info' });
    if (!formData.basicInfo?.location) errors.push({ field: 'basicInfo.location', message: 'Location is required', section: 'Basic Info' });
    if (!formData.basicInfo?.duration) errors.push({ field: 'basicInfo.duration', message: 'Duration is required', section: 'Basic Info' });
    
    // Product Type validation
    if (!formData.productType) errors.push({ field: 'productType', message: 'Product type is required', section: 'Business Type' });
    
    // Scheduling validation
    if (!formData.scheduling?.scheduleType) errors.push({ field: 'scheduling.scheduleType', message: 'Schedule type is required', section: 'Scheduling' });
    if (!formData.scheduling?.timezone) errors.push({ field: 'scheduling.timezone', message: 'Timezone is required', section: 'Scheduling' });
    
    // Pricing validation
    if (!formData.pricing?.basePricing?.adult || formData.pricing?.basePricing?.adult <= 0) {
      errors.push({ field: 'pricing.basePricing.adult', message: 'Adult price is required and must be greater than 0', section: 'Pricing' });
    }
    if (!formData.pricing?.currency) errors.push({ field: 'pricing.currency', message: 'Currency is required', section: 'Pricing' });
    
    // Media validation
    if (!formData.media?.images || formData.media?.images.length === 0) {
      errors.push({ field: 'media.images', message: 'At least one image is required', section: 'Media' });
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  // Generate preview URL
  const generatePreviewUrl = () => {
    const slug = formData.media?.seoData?.slug || formData.basicInfo?.name?.toLowerCase().replace(/\s+/g, '-') || 'preview';
    const url = `${window.location.origin}/preview/${slug}?token=${Date.now()}`;
    setPreviewUrl(url);
  };

  // Calculate pricing
  const calculateTotalPrice = () => {
    const basePricing = formData.pricing?.basePricing || {};
    const adults = testPricing.adults * (basePricing.adult || 0);
    const children = testPricing.children * (basePricing.child || 0);
    const students = testPricing.students * (basePricing.student || 0);
    const seniors = testPricing.seniors * (basePricing.senior || 0);
    
    let subtotal = adults + children + students + seniors;
    
    // Apply group discounts
    const totalParticipants = testPricing.adults + testPricing.children + testPricing.students + testPricing.seniors;
    const groupTiers = formData.pricing?.groupTiers || [];
    
    for (const tier of groupTiers) {
      if (totalParticipants >= tier.minSize && totalParticipants <= tier.maxSize) {
        if (tier.discountType === 'percentage') {
          subtotal = subtotal * (1 - tier.discountValue / 100);
        } else {
          subtotal = subtotal - tier.discountValue;
        }
        break;
      }
    }
    
    // Apply taxes
    const taxRate = formData.pricing?.taxRate || 0;
    const taxes = formData.pricing?.taxDisplay === 'exclusive' ? subtotal * (taxRate / 100) : 0;
    const total = subtotal + taxes;
    
    return {
      subtotal: subtotal.toFixed(2),
      taxes: taxes.toFixed(2),
      total: total.toFixed(2),
      currency: formData.pricing?.currency || 'CAD'
    };
  };

  // Run validation when component mounts
  useEffect(() => {
    validateForm();
  }, [formData]);

  const primaryImage = formData.media?.images?.find((img: any) => img.isPrimary) || formData.media?.images?.[0];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">✅ Review & Publish</h2>
        <p className="text-gray-600">Final validation and publishing options</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('preview')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'preview'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Eye className="w-4 h-4 inline mr-2" />
          Preview
        </button>
        <button
          onClick={() => setActiveTab('validation')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'validation'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <AlertCircle className="w-4 h-4 inline mr-2" />
          Validation
          {validationErrors.length > 0 && (
            <span className="ml-1 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {validationErrors.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('pricing')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'pricing'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <DollarSign className="w-4 h-4 inline mr-2" />
          Pricing Test
        </button>
      </div>

      {/* Preview Tab */}
      {activeTab === 'preview' && (
        <div className="space-y-6">
          {/* Customer-Facing Preview */}
          <div className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold mb-2">
                    {formData.basicInfo?.name || 'Offering Name'}
                  </h1>
                  <div className="flex items-center space-x-4 text-blue-100">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {formData.basicInfo?.location || 'Location'}
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {formData.basicInfo?.duration || 0} minutes
                    </div>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {getProductTypeName(formData.productType)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">
                    {formData.pricing?.currency || 'CAD'} {formData.pricing?.basePricing?.adult || '0.00'}
                  </div>
                  <div className="text-sm text-blue-100">per adult</div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column */}
                <div>
                  {/* Images */}
                  <div className="mb-6">
                    {primaryImage ? (
                      <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={primaryImage.url}
                          alt={primaryImage.altText || 'Offering image'}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                        <Image className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                    
                    {/* Image Gallery */}
                    {formData.media?.images && formData.media.images.length > 1 && (
                      <div className="grid grid-cols-4 gap-2 mt-2">
                        {formData.media.images.slice(0, 4).map((image: any, index: number) => (
                          <div key={index} className="aspect-square bg-gray-100 rounded overflow-hidden">
                            <img
                              src={image.url}
                              alt={image.altText || ''}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">About This Experience</h3>
                    <p className="text-gray-600 leading-relaxed">
                      {formData.basicInfo?.description || 'Description will appear here...'}
                    </p>
                  </div>

                  {/* Product-Specific Info */}
                  {formData.productType === 'seat' && formData.productConfig?.pickupLocations && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Pickup Locations</h3>
                      <div className="space-y-2">
                        {formData.productConfig.pickupLocations.map((location: any, index: number) => (
                          <div key={index} className="flex items-center text-sm text-gray-600">
                            <MapPin className="w-4 h-4 mr-2" />
                            <span>{location.name} - {location.pickupTime}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Amenities */}
                  {formData.productConfig?.amenities && formData.productConfig.amenities.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">What's Included</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {formData.productConfig.amenities.map((amenity: string, index: number) => (
                          <div key={index} className="flex items-center text-sm text-gray-600">
                            <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                            <span className="capitalize">{amenity.replace(/([A-Z])/g, ' $1')}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column */}
                <div>
                  {/* Pricing Card */}
                  <div className="bg-gray-50 p-6 rounded-lg mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Adult</span>
                        <span className="font-medium">{formData.pricing?.currency || 'CAD'} {formData.pricing?.basePricing?.adult || '0.00'}</span>
                      </div>
                      {formData.pricing?.basePricing?.child > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Child ({formData.pricing?.childAgeMin || 0}-{formData.pricing?.childAgeMax || 12})</span>
                          <span className="font-medium">{formData.pricing?.currency || 'CAD'} {formData.pricing?.basePricing?.child || '0.00'}</span>
                        </div>
                      )}
                      {formData.pricing?.basePricing?.student > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Student</span>
                          <span className="font-medium">{formData.pricing?.currency || 'CAD'} {formData.pricing?.basePricing?.student || '0.00'}</span>
                        </div>
                      )}
                      {formData.pricing?.basePricing?.senior > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Senior ({formData.pricing?.seniorAgeMin || 65}+)</span>
                          <span className="font-medium">{formData.pricing?.currency || 'CAD'} {formData.pricing?.basePricing?.senior || '0.00'}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Group Discounts */}
                    {formData.pricing?.groupTiers && formData.pricing.groupTiers.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h4 className="font-medium text-gray-900 mb-2">Group Discounts</h4>
                        <div className="text-sm text-gray-600 space-y-1">
                          {formData.pricing.groupTiers.map((tier: any, index: number) => (
                            <div key={index}>
                              {tier.minSize}-{tier.maxSize} people: {tier.discountValue}{tier.discountType === 'percentage' ? '%' : ` ${formData.pricing?.currency || 'CAD'}`} off
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Cancellation Policy */}
                  {formData.pricing?.freeCancellationHours && (
                    <div className="bg-green-50 p-4 rounded-lg mb-6">
                      <div className="flex items-center mb-2">
                        <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                        <span className="font-medium text-green-800">Free Cancellation</span>
                      </div>
                      <p className="text-sm text-green-700">
                        Cancel up to {formData.pricing.freeCancellationHours} hours before your experience for a full refund.
                      </p>
                    </div>
                  )}

                  {/* Booking Button */}
                  <button className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium text-lg hover:bg-blue-700 transition-colors">
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Validation Tab */}
      {activeTab === 'validation' && (
        <div className="space-y-6">
          {/* Validation Summary */}
          <div className={`p-6 rounded-lg ${validationErrors.length === 0 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <div className="flex items-center mb-4">
              {validationErrors.length === 0 ? (
                <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
              ) : (
                <AlertCircle className="w-6 h-6 text-red-600 mr-2" />
              )}
              <h3 className={`text-lg font-semibold ${validationErrors.length === 0 ? 'text-green-800' : 'text-red-800'}`}>
                {validationErrors.length === 0 ? 'All Required Fields Complete' : `${validationErrors.length} Issues Found`}
              </h3>
            </div>
            
            {validationErrors.length === 0 ? (
              <p className="text-green-700">Your offering is ready to publish! All required fields have been completed.</p>
            ) : (
              <div className="space-y-3">
                <p className="text-red-700">Please address the following issues before publishing:</p>
                {validationErrors.map((error, index) => (
                  <div key={index} className="flex items-start">
                    <AlertCircle className="w-4 h-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium text-red-800">{error.section}:</span>
                      <span className="text-red-700 ml-1">{error.message}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Completion Checklist */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Completion Checklist</h3>
            <div className="space-y-3">
              {[
                { label: 'Business type selected', completed: !!formData.productType },
                { label: 'Basic information provided', completed: !!(formData.basicInfo?.name && formData.basicInfo?.description && formData.basicInfo?.location && formData.basicInfo?.duration) },
                { label: 'Product configured', completed: !!formData.productConfig },
                { label: 'Schedule set up', completed: !!(formData.scheduling?.scheduleType && formData.scheduling?.timezone) },
                { label: 'Pricing configured', completed: !!(formData.pricing?.basePricing?.adult && formData.pricing?.currency) },
                { label: 'Images uploaded', completed: !!(formData.media?.images && formData.media?.images.length > 0) },
                { label: 'SEO optimized', completed: !!(formData.media?.metaTitle && formData.media?.metaDescription) }
              ].map((item, index) => (
                <div key={index} className="flex items-center">
                  {item.completed ? (
                    <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                  ) : (
                    <div className="w-5 h-5 border-2 border-gray-300 rounded-full mr-3"></div>
                  )}
                  <span className={`${item.completed ? 'text-gray-900' : 'text-gray-500'}`}>
                    {item.label}
                  </span>
                </div>
              ))}
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
                      onChange={(e) => setTestPricing({...testPricing, adults: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Children</label>
                    <input
                      type="number"
                      value={testPricing.children}
                      onChange={(e) => setTestPricing({...testPricing, children: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Students</label>
                    <input
                      type="number"
                      value={testPricing.students}
                      onChange={(e) => setTestPricing({...testPricing, students: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Seniors</label>
                    <input
                      type="number"
                      value={testPricing.seniors}
                      onChange={(e) => setTestPricing({...testPricing, seniors: parseInt(e.target.value) || 0})}
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
                      onClick={() => setTestPricing({adults: 1, children: 0, students: 0, seniors: 0, groupSize: 1})}
                      className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      Solo Traveler
                    </button>
                    <button
                      onClick={() => setTestPricing({adults: 2, children: 0, students: 0, seniors: 0, groupSize: 2})}
                      className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      Couple
                    </button>
                    <button
                      onClick={() => setTestPricing({adults: 2, children: 2, students: 0, seniors: 0, groupSize: 4})}
                      className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      Family
                    </button>
                    <button
                      onClick={() => setTestPricing({adults: 8, children: 0, students: 0, seniors: 0, groupSize: 8})}
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
                        <span>Taxes ({formData.pricing?.taxRate || 0}%)</span>
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
            className={`p-4 rounded-lg border-2 transition-all ${
              publishingMode === 'draft'
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
            className={`p-4 rounded-lg border-2 transition-all ${
              publishingMode === 'immediate'
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
            className={`p-4 rounded-lg border-2 transition-all ${
              publishingMode === 'scheduled'
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Calendar className="w-6 h-6 mx-auto mb-2 text-gray-600" />
            <div className="text-sm font-medium text-gray-900">Schedule</div>
            <div className="text-xs text-gray-500">Set future publish date</div>
          </button>
        </div>

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
              onClick={() => {
                if (publishingMode === 'immediate' && validationErrors.length > 0) {
                  alert('Please fix validation errors before publishing');
                  return;
                }
                // Handle publishing logic here
                console.log('Publishing with mode:', publishingMode);
              }}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                publishingMode === 'immediate' && validationErrors.length > 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : publishingMode === 'draft'
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {publishingMode === 'draft' && 'Save Draft'}
              {publishingMode === 'immediate' && 'Publish Now'}
              {publishingMode === 'scheduled' && 'Schedule Publication'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 