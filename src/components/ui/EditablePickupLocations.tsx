import React, { useState, useRef, useEffect } from 'react';
import { MapPin, Clock, Plus, X, Edit3, AlertCircle } from 'lucide-react';
import { PickupLocation } from '@/types/products';
import { LocationSelect } from '@/components/location-select';

interface EditablePickupLocationsProps {
  pickupLocations: PickupLocation[];
  onChange: (locations: PickupLocation[]) => void;
  branding: any;
  placeholder?: string;
  maxLocations?: number;
  className?: string;
}

interface ValidationError {
  field: string;
  message: string;
}

interface TimeOffsetPickerProps {
  value: number;
  onChange: (value: number) => void;
  className?: string;
}

const TimeOffsetPicker: React.FC<TimeOffsetPickerProps> = ({ value, onChange, className = "" }) => {
  const [hours, setHours] = useState(Math.floor(Math.abs(value) / 60));
  const [minutes, setMinutes] = useState(Math.abs(value) % 60);
  const [isNegative, setIsNegative] = useState(value < 0);

  useEffect(() => {
    const totalMinutes = hours * 60 + minutes;
    onChange(isNegative ? -totalMinutes : totalMinutes);
  }, [hours, minutes, isNegative, onChange]);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <select
        value={isNegative ? 'before' : 'after'}
        onChange={(e) => setIsNegative(e.target.value === 'before')}
        className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="after">After departure</option>
        <option value="before">Before departure</option>
      </select>
      <input
        type="number"
        min="0"
        max="23"
        value={hours}
        onChange={(e) => setHours(Math.max(0, Math.min(23, parseInt(e.target.value) || 0)))}
        className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="0"
      />
      <span className="text-sm text-gray-500">h</span>
      <input
        type="number"
        min="0"
        max="59"
        value={minutes}
        onChange={(e) => setMinutes(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
        className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="0"
      />
      <span className="text-sm text-gray-500">min</span>
    </div>
  );
};

const validatePickupLocation = (location: PickupLocation): ValidationError[] => {
  const errors: ValidationError[] = [];
  
  if (!location.name || location.name.trim().length === 0) {
    errors.push({ field: 'name', message: 'Location name is required' });
  } else if (location.name.trim().length > 100) {
    errors.push({ field: 'name', message: 'Location name must be 100 characters or less' });
  }
  
  if (!location.address || location.address.trim().length === 0) {
    errors.push({ field: 'address', message: 'Address is required' });
  } else if (location.address.trim().length > 200) {
    errors.push({ field: 'address', message: 'Address must be 200 characters or less' });
  }
  
  if (Math.abs(location.pickup_time_offset) > 1440) { // 24 hours in minutes
    errors.push({ field: 'pickup_time_offset', message: 'Time offset cannot exceed 24 hours' });
  }
  
  return errors;
};

export const EditablePickupLocations: React.FC<EditablePickupLocationsProps> = ({
  pickupLocations = [],
  onChange,
  branding,
  placeholder = "Click to add pickup location",
  maxLocations = 10,
  className = ""
}) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingLocation, setEditingLocation] = useState<PickupLocation>({
    name: '',
    address: '',
    pickup_time_offset: 0
  });
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newLocation, setNewLocation] = useState<PickupLocation>({
    name: '',
    address: '',
    pickup_time_offset: 0
  });
  const [editingErrors, setEditingErrors] = useState<ValidationError[]>([]);
  const [newLocationErrors, setNewLocationErrors] = useState<ValidationError[]>([]);
  const [useLocationPicker, setUseLocationPicker] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const addNameInputRef = useRef<HTMLInputElement>(null);

  // Focus input when editing starts
  useEffect(() => {
    if (editingIndex !== null && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [editingIndex]);

  useEffect(() => {
    if (isAddingNew && addNameInputRef.current) {
      addNameInputRef.current.focus();
    }
  }, [isAddingNew]);

  const handleEditStart = (index: number) => {
    setEditingIndex(index);
    setEditingLocation({ ...pickupLocations[index] });
    setEditingErrors([]);
    setUseLocationPicker(false);
  };

  const handleEditSave = () => {
    if (editingIndex === null) return;
    
    const trimmedLocation = {
      ...editingLocation,
      name: editingLocation.name.trim(),
      address: editingLocation.address.trim()
    };
    
    const errors = validatePickupLocation(trimmedLocation);
    setEditingErrors(errors);
    
    if (errors.length === 0) {
      const updatedLocations = [...pickupLocations];
      updatedLocations[editingIndex] = trimmedLocation;
      onChange(updatedLocations);
      handleEditCancel();
    }
  };

  const handleEditCancel = () => {
    setEditingIndex(null);
    setEditingLocation({ name: '', address: '', pickup_time_offset: 0 });
    setEditingErrors([]);
    setUseLocationPicker(false);
  };

  const handleAddNew = () => {
    if (pickupLocations.length >= maxLocations) return;
    setIsAddingNew(true);
    setNewLocation({ name: '', address: '', pickup_time_offset: 0 });
    setNewLocationErrors([]);
    setUseLocationPicker(false);
  };

  const handleAddSave = () => {
    const trimmedLocation = {
      ...newLocation,
      name: newLocation.name.trim(),
      address: newLocation.address.trim()
    };
    
    const errors = validatePickupLocation(trimmedLocation);
    setNewLocationErrors(errors);
    
    if (errors.length === 0) {
      onChange([...pickupLocations, trimmedLocation]);
      setIsAddingNew(false);
      setNewLocation({ name: '', address: '', pickup_time_offset: 0 });
      setNewLocationErrors([]);
      setUseLocationPicker(false);
    }
  };

  const handleAddCancel = () => {
    setIsAddingNew(false);
    setNewLocation({ name: '', address: '', pickup_time_offset: 0 });
    setNewLocationErrors([]);
    setUseLocationPicker(false);
  };

  const handleRemove = (index: number) => {
    const updatedLocations = pickupLocations.filter((_, i) => i !== index);
    onChange(updatedLocations);
  };

  const handleLocationSelect = (locationId: string, isEditing: boolean) => {
    // This would typically fetch location details from the database
    // For now, we'll just set the location ID as the address
    // In a real implementation, you'd fetch the full location details
    if (isEditing) {
      setEditingLocation(prev => ({
        ...prev,
        address: `Location ID: ${locationId}` // Placeholder - would be full address
      }));
    } else {
      setNewLocation(prev => ({
        ...prev,
        address: `Location ID: ${locationId}` // Placeholder - would be full address
      }));
    }
    setUseLocationPicker(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent, action: 'edit' | 'add') => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (action === 'edit') {
        handleEditSave();
      } else {
        handleAddSave();
      }
    } else if (e.key === 'Escape') {
      if (action === 'edit') {
        handleEditCancel();
      } else {
        handleAddCancel();
      }
    }
  };

  const getFieldError = (errors: ValidationError[], field: string): string | undefined => {
    return errors.find(error => error.field === field)?.message;
  };

  const formatTimeOffset = (offsetMinutes: number): string => {
    if (offsetMinutes === 0) return 'Departure time';
    const hours = Math.floor(Math.abs(offsetMinutes) / 60);
    const minutes = Math.abs(offsetMinutes) % 60;
    const sign = offsetMinutes < 0 ? '-' : '+';
    
    if (hours === 0) {
      return `${sign}${minutes}min`;
    } else if (minutes === 0) {
      return `${sign}${hours}h`;
    } else {
      return `${sign}${hours}h ${minutes}min`;
    }
  };

  // Default pickup locations if none exist
  const defaultLocations: PickupLocation[] = [
    {
      name: "Downtown Transit Station",
      address: "123 Main Street, Downtown",
      pickup_time_offset: 0
    },
    {
      name: "Airport Terminal",
      address: "456 Airport Road, Terminal 1",
      pickup_time_offset: -30
    }
  ];

  const displayLocations = pickupLocations.length > 0 ? pickupLocations : defaultLocations;
  const isUsingDefaults = pickupLocations.length === 0;

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="space-y-3">
        {displayLocations.map((location, index) => (
          <div key={index} className="group relative border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
            {editingIndex === index ? (
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin
                    className="w-5 h-5 flex-shrink-0 mt-0.5"
                    style={{ color: branding.primary_color || '#3B82F6' }}
                  />
                  <div className="flex-1 space-y-2">
                    <div>
                      <input
                        ref={nameInputRef}
                        type="text"
                        value={editingLocation.name}
                        onChange={(e) => setEditingLocation({ ...editingLocation, name: e.target.value })}
                        onKeyDown={(e) => handleKeyDown(e, 'edit')}
                        placeholder="Location name"
                        className={`w-full px-3 py-2 text-sm font-medium border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          getFieldError(editingErrors, 'name') ? 'border-red-300' : 'border-gray-300'
                        }`}
                        style={{ color: branding.textOnForeground }}
                        maxLength={100}
                      />
                      {getFieldError(editingErrors, 'name') && (
                        <div className="flex items-center gap-1 mt-1 text-red-600 text-xs">
                          <AlertCircle className="w-3 h-3" />
                          <span>{getFieldError(editingErrors, 'name')}</span>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={editingLocation.address}
                          onChange={(e) => setEditingLocation({ ...editingLocation, address: e.target.value })}
                          onKeyDown={(e) => handleKeyDown(e, 'edit')}
                          placeholder="Full address"
                          className={`flex-1 px-3 py-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            getFieldError(editingErrors, 'address') ? 'border-red-300' : 'border-gray-300'
                          }`}
                          style={{ color: branding.textOnForeground }}
                          maxLength={200}
                        />
                        <button
                          type="button"
                          onClick={() => setUseLocationPicker(!useLocationPicker)}
                          className="px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {useLocationPicker ? 'Manual' : 'Pick Location'}
                        </button>
                      </div>
                      
                      {useLocationPicker && (
                        <div className="mt-2">
                          <LocationSelect
                            value=""
                            onChange={(locationId) => handleLocationSelect(locationId, true)}
                            placeholder="Select from existing locations"
                          />
                        </div>
                      )}
                      
                      {getFieldError(editingErrors, 'address') && (
                        <div className="flex items-center gap-1 mt-1 text-red-600 text-xs">
                          <AlertCircle className="w-3 h-3" />
                          <span>{getFieldError(editingErrors, 'address')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 ml-8">
                  <Clock className="w-4 h-4 text-gray-500 mt-1" />
                  <div className="flex-1">
                    <label className="text-sm text-gray-600 block mb-2">Pickup time:</label>
                    <TimeOffsetPicker
                      value={editingLocation.pickup_time_offset}
                      onChange={(value) => setEditingLocation({ ...editingLocation, pickup_time_offset: value })}
                    />
                    {getFieldError(editingErrors, 'pickup_time_offset') && (
                      <div className="flex items-center gap-1 mt-1 text-red-600 text-xs">
                        <AlertCircle className="w-3 h-3" />
                        <span>{getFieldError(editingErrors, 'pickup_time_offset')}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-8">
                  <button
                    onClick={handleEditSave}
                    className="text-sm px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleEditCancel}
                    className="text-sm px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="cursor-pointer" onClick={() => handleEditStart(index)}>
                <div className="flex items-start gap-3">
                  <MapPin
                    className="w-5 h-5 flex-shrink-0 mt-0.5"
                    style={{ color: branding.primary_color || '#3B82F6' }}
                  />
                  <div className="flex-1">
                    <h4 
                      className={`font-medium ${isUsingDefaults ? 'opacity-60' : ''}`}
                      style={{ color: branding.textOnForeground }}
                    >
                      {location.name}
                    </h4>
                    <p 
                      className={`text-sm text-gray-600 mt-1 ${isUsingDefaults ? 'opacity-60' : ''}`}
                    >
                      {location.address}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        {formatTimeOffset(location.pickup_time_offset)}
                      </span>
                    </div>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditStart(index);
                      }}
                      className="p-1 text-gray-400 hover:text-blue-500 rounded"
                      title="Edit pickup location"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    {!isUsingDefaults && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemove(index);
                        }}
                        className="p-1 text-gray-400 hover:text-red-500 rounded"
                        title="Remove pickup location"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Add new pickup location */}
        {isAddingNew ? (
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin
                  className="w-5 h-5 flex-shrink-0 mt-0.5"
                  style={{ color: branding.primary_color || '#3B82F6' }}
                />
                <div className="flex-1 space-y-2">
                  <div>
                    <input
                      ref={addNameInputRef}
                      type="text"
                      value={newLocation.name}
                      onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
                      onKeyDown={(e) => handleKeyDown(e, 'add')}
                      placeholder="Location name"
                      className={`w-full px-3 py-2 text-sm font-medium border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        getFieldError(newLocationErrors, 'name') ? 'border-red-300' : 'border-gray-300'
                      }`}
                      style={{ color: branding.textOnForeground }}
                      maxLength={100}
                    />
                    {getFieldError(newLocationErrors, 'name') && (
                      <div className="flex items-center gap-1 mt-1 text-red-600 text-xs">
                        <AlertCircle className="w-3 h-3" />
                        <span>{getFieldError(newLocationErrors, 'name')}</span>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newLocation.address}
                        onChange={(e) => setNewLocation({ ...newLocation, address: e.target.value })}
                        onKeyDown={(e) => handleKeyDown(e, 'add')}
                        placeholder="Full address"
                        className={`flex-1 px-3 py-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          getFieldError(newLocationErrors, 'address') ? 'border-red-300' : 'border-gray-300'
                        }`}
                        style={{ color: branding.textOnForeground }}
                        maxLength={200}
                      />
                      <button
                        type="button"
                        onClick={() => setUseLocationPicker(!useLocationPicker)}
                        className="px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {useLocationPicker ? 'Manual' : 'Pick Location'}
                      </button>
                    </div>
                    
                    {useLocationPicker && (
                      <div className="mt-2">
                        <LocationSelect
                          value=""
                          onChange={(locationId) => handleLocationSelect(locationId, false)}
                          placeholder="Select from existing locations"
                        />
                      </div>
                    )}
                    
                    {getFieldError(newLocationErrors, 'address') && (
                      <div className="flex items-center gap-1 mt-1 text-red-600 text-xs">
                        <AlertCircle className="w-3 h-3" />
                        <span>{getFieldError(newLocationErrors, 'address')}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-start gap-3 ml-8">
                <Clock className="w-4 h-4 text-gray-500 mt-1" />
                <div className="flex-1">
                  <label className="text-sm text-gray-600 block mb-2">Pickup time:</label>
                  <TimeOffsetPicker
                    value={newLocation.pickup_time_offset}
                    onChange={(value) => setNewLocation({ ...newLocation, pickup_time_offset: value })}
                  />
                  {getFieldError(newLocationErrors, 'pickup_time_offset') && (
                    <div className="flex items-center gap-1 mt-1 text-red-600 text-xs">
                      <AlertCircle className="w-3 h-3" />
                      <span>{getFieldError(newLocationErrors, 'pickup_time_offset')}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 ml-8">
                <button
                  onClick={handleAddSave}
                  className="text-sm px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                >
                  Add Location
                </button>
                <button
                  onClick={handleAddCancel}
                  className="text-sm px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : (
          pickupLocations.length < maxLocations && (
            <button
              onClick={handleAddNew}
              className="w-full flex items-center justify-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors group"
            >
              <Plus className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
              <span className="text-gray-500 group-hover:text-gray-700">
                Add pickup location
              </span>
            </button>
          )
        )}
      </div>

      {isUsingDefaults && (
        <p className="text-xs text-gray-500 italic">
          Click on any pickup location to customize, or add your own locations above.
        </p>
      )}
    </div>
  );
};