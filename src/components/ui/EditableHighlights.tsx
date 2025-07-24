import React, { useState, useRef, useEffect } from 'react';
import { CheckCircle, Plus, X, Edit3 } from 'lucide-react';

interface EditableHighlightsProps {
  highlights: string[];
  onChange: (highlights: string[]) => void;
  branding: any;
  placeholder?: string;
  maxItems?: number;
  className?: string;
}

export const EditableHighlights: React.FC<EditableHighlightsProps> = ({
  highlights = [],
  onChange,
  branding,
  placeholder = "Click to add highlight",
  maxItems = 10,
  className = ""
}) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newHighlight, setNewHighlight] = useState('');
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
    setEditingValue(highlights[index] || '');
  };

  const handleEditSave = () => {
    if (editingIndex !== null && editingValue && editingValue.trim()) {
      const updatedHighlights = [...highlights];
      updatedHighlights[editingIndex] = editingValue.trim();
      onChange(updatedHighlights);
    }
    handleEditCancel();
  };

  const handleEditCancel = () => {
    setEditingIndex(null);
    setEditingValue('');
  };

  const handleAddNew = () => {
    if (highlights.length >= maxItems) return;
    setIsAddingNew(true);
    setNewHighlight('');
  };

  const handleAddSave = () => {
    if (newHighlight && newHighlight.trim()) {
      onChange([...highlights, newHighlight.trim()]);
    }
    setIsAddingNew(false);
    setNewHighlight('');
  };

  const handleAddCancel = () => {
    setIsAddingNew(false);
    setNewHighlight('');
  };

  const handleRemove = (index: number) => {
    const updatedHighlights = highlights.filter((_, i) => i !== index);
    onChange(updatedHighlights);
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

  // Default highlights if none exist
  const defaultHighlights = [
    "Guided experience with expert staff",
    "Scenic views and photo opportunities", 
    "Small group experience",
    "All safety equipment provided",
    "Professional service",
    "Memorable adventure"
  ];

  const displayHighlights = highlights.length > 0 ? highlights : defaultHighlights;
  const isUsingDefaults = highlights.length === 0;

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {displayHighlights.map((highlight, index) => (
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
                    maxLength={100}
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
                  className={`flex-1 ${isUsingDefaults ? 'opacity-60' : ''}`}
                >
                  {highlight}
                </span>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditStart(index);
                    }}
                    className="p-1 text-gray-400 hover:text-blue-500 rounded"
                    title="Edit highlight"
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
                      title="Remove highlight"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Add new highlight */}
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
                value={newHighlight}
                onChange={(e) => setNewHighlight(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, 'add')}
                onBlur={handleAddSave}
                placeholder={placeholder}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ color: branding.textOnForeground }}
                maxLength={100}
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
          highlights.length < maxItems && (
            <button
              onClick={handleAddNew}
              className="flex items-start gap-3 p-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors group"
            >
              <Plus
                className="w-5 h-5 flex-shrink-0 mt-0.5 text-gray-400 group-hover:text-gray-600"
              />
              <span className="text-gray-500 group-hover:text-gray-700">
                Add highlight
              </span>
            </button>
          )
        )}
      </div>

      {isUsingDefaults && (
        <p className="text-xs text-gray-500 italic">
          Click on any highlight to customize, or add your own highlights above.
        </p>
      )}
    </div>
  );
};