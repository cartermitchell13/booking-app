import React, { useState, useRef, useEffect } from 'react';
import { CheckCircle, Plus, X, Edit3 } from 'lucide-react';

interface EditableAmenitiesProps {
  amenities: string[];
  onChange: (amenities: string[]) => void;
  branding: any;
  placeholder?: string;
  maxItems?: number;
  className?: string;
  showCheckboxStyle?: boolean;
}

export const EditableAmenities: React.FC<EditableAmenitiesProps> = ({
  amenities = [],
  onChange,
  branding,
  placeholder = "Click to add amenity",
  maxItems = 15,
  className = "",
  showCheckboxStyle = false
}) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newAmenity, setNewAmenity] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const addInputRef = useRef<HTMLInputElement>(null);

  // Focus input when editing starts
  useEffect(() => {
    if (editingIndex !== null && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingIndex]);

  useEffect(() => {
    if (isAddingNew && addInputRef.current) {
      addInputRef.current.focus();
    }
  }, [isAddingNew]);

  const handleEditStart = (index: number) => {
    setEditingIndex(index);
    setEditingValue(amenities[index] || '');
  };

  const handleEditSave = () => {
    if (editingIndex !== null && editingValue && editingValue.trim()) {
      const updatedAmenities = [...amenities];
      updatedAmenities[editingIndex] = editingValue.trim();
      onChange(updatedAmenities);
    }
    handleEditCancel();
  };

  const handleEditCancel = () => {
    setEditingIndex(null);
    setEditingValue('');
  };

  const handleAddNew = () => {
    if (amenities.length >= maxItems) return;
    setIsAddingNew(true);
    setNewAmenity('');
  };

  const handleAddSave = () => {
    if (newAmenity && newAmenity.trim()) {
      onChange([...amenities, newAmenity.trim()]);
    }
    setIsAddingNew(false);
    setNewAmenity('');
  };

  const handleAddCancel = () => {
    setIsAddingNew(false);
    setNewAmenity('');
  };

  const handleRemove = (index: number) => {
    const updatedAmenities = amenities.filter((_, i) => i !== index);
    onChange(updatedAmenities);
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

  // Format amenity text for display (convert camelCase to readable text)
  const formatAmenityText = (amenity: string) => {
    return amenity
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  };

  // Common amenities for suggestions when empty
  const defaultAmenities = [
    "Transportation",
    "Professional guide", 
    "All safety equipment",
    "Park entry fees",
    "Light refreshments",
    "Photo opportunities"
  ];

  const displayAmenities = amenities.length > 0 ? amenities : defaultAmenities;
  const isUsingDefaults = amenities.length === 0;

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {displayAmenities.map((amenity, index) => (
          <div key={index} className="group relative">
            {editingIndex === index ? (
              <div className="flex items-start gap-3">
                <CheckCircle
                  className="w-5 h-5 flex-shrink-0 mt-0.5"
                  style={{ color: branding.primary_color || '#10B981' }}
                />
                <div className="flex-1">
                  <input
                    ref={inputRef}
                    type="text"
                    value={editingValue}
                    onChange={(e) => setEditingValue(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, 'edit')}
                    onBlur={handleEditSave}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ color: branding.textOnForeground }}
                    maxLength={80}
                  />
                  <div className="flex items-center gap-1 mt-1">
                    <button
                      onClick={handleEditSave}
                      className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleEditCancel}
                      className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3 group cursor-pointer" onClick={() => handleEditStart(index)}>
                <CheckCircle
                  className="w-5 h-5 flex-shrink-0 mt-0.5"
                  style={{ color: branding.primary_color || '#10B981' }}
                />
                <span 
                  style={{ color: branding.textOnForeground }}
                  className={`flex-1 capitalize ${isUsingDefaults ? 'opacity-60' : ''}`}
                >
                  {formatAmenityText(amenity)}
                </span>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditStart(index);
                    }}
                    className="p-1 text-gray-400 hover:text-blue-500 rounded"
                    title="Edit amenity"
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>
                  {!isUsingDefaults && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(index);
                      }}
                      className="p-1 text-gray-400 hover:text-red-500 rounded"
                      title="Remove amenity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Add new amenity */}
        {isAddingNew ? (
          <div className="flex items-start gap-3">
            <CheckCircle
              className="w-5 h-5 flex-shrink-0 mt-0.5"
              style={{ color: branding.primary_color || '#10B981' }}
            />
            <div className="flex-1">
              <input
                ref={addInputRef}
                type="text"
                value={newAmenity}
                onChange={(e) => setNewAmenity(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, 'add')}
                onBlur={handleAddSave}
                placeholder={placeholder}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ color: branding.textOnForeground }}
                maxLength={80}
              />
              <div className="flex items-center gap-1 mt-1">
                <button
                  onClick={handleAddSave}
                  className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                >
                  Add
                </button>
                <button
                  onClick={handleAddCancel}
                  className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : (
          amenities.length < maxItems && (
            <button
              onClick={handleAddNew}
              className="flex items-start gap-3 p-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors group"
            >
              <Plus
                className="w-5 h-5 flex-shrink-0 mt-0.5 text-gray-400 group-hover:text-gray-600"
              />
              <span className="text-gray-500 group-hover:text-gray-700">
                Add amenity
              </span>
            </button>
          )
        )}
      </div>

      {isUsingDefaults && (
        <p className="text-xs text-gray-500 italic">
          Click on any amenity to customize, or add your own amenities above.
        </p>
      )}

      {/* Quick add suggestions */}
      {!isAddingNew && amenities.length < maxItems && (
        <div className="mt-4 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-500 mb-2">Quick add common amenities:</p>
          <div className="flex flex-wrap gap-2">
            {[
              "WiFi included",
              "Parking available", 
              "Restroom facilities",
              "First aid kit",
              "Insurance coverage",
              "Equipment rental"
            ].filter(suggestion => !amenities.includes(suggestion)).slice(0, 4).map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => onChange([...amenities, suggestion])}
                className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
              >
                + {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};