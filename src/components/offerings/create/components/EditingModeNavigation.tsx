'use client';

import React from 'react';
import { 
  Eye, 
  CheckCircle, 
  Settings, 
  AlertCircle,
  Clock,
  Save
} from 'lucide-react';

interface EditingMode {
  type: 'preview' | 'validation' | 'settings';
  activeModal?: string | null;
}

interface EditingModeNavigationProps {
  currentMode: EditingMode;
  onModeChange: (mode: EditingMode) => void;
  validationErrors: number;
  hasWarnings: boolean;
  isAutoSaving: boolean;
  lastSaved?: Date | null;
  className?: string;
}

export const EditingModeNavigation: React.FC<EditingModeNavigationProps> = ({
  currentMode,
  onModeChange,
  validationErrors,
  hasWarnings,
  isAutoSaving,
  lastSaved,
  className = ''
}) => {
  const modes = [
    {
      type: 'preview' as const,
      label: 'Preview',
      icon: Eye,
      description: 'See how customers will view your offering'
    },
    {
      type: 'validation' as const,
      label: 'Validation',
      icon: CheckCircle,
      description: 'Check for errors and missing information',
      badge: validationErrors > 0 ? validationErrors : undefined,
      badgeColor: validationErrors > 0 ? 'red' : hasWarnings ? 'yellow' : 'green'
    },
    {
      type: 'settings' as const,
      label: 'Settings',
      icon: Settings,
      description: 'Configure advanced options'
    }
  ];

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      {/* Mode Navigation */}
      <div className="flex items-center border border-gray-300 rounded-lg bg-white">
        {modes.map((mode, index) => {
          const Icon = mode.icon;
          const isActive = currentMode.type === mode.type;
          
          return (
            <button
              key={mode.type}
              onClick={() => onModeChange({ type: mode.type })}
              className={`
                relative px-3 py-2 text-sm font-medium transition-all duration-200
                ${index === 0 ? 'rounded-l-lg' : ''}
                ${index === modes.length - 1 ? 'rounded-r-lg' : ''}
                ${isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }
              `}
              title={mode.description}
            >
              <div className="flex items-center space-x-2">
                <Icon className="w-4 h-4" />
                <span>{mode.label}</span>
                
                {/* Badge for validation errors/warnings */}
                {mode.badge !== undefined && (
                  <span className={`
                    inline-flex items-center justify-center w-5 h-5 text-xs font-bold rounded-full
                    ${mode.badgeColor === 'red' 
                      ? 'bg-red-500 text-white' 
                      : mode.badgeColor === 'yellow'
                      ? 'bg-yellow-500 text-white'
                      : 'bg-green-500 text-white'
                    }
                  `}>
                    {mode.badge}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Auto-save Status */}
      <div className="flex items-center space-x-2 text-sm text-gray-500 ml-4">
        {isAutoSaving ? (
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4 animate-pulse" />
            <span>Saving...</span>
          </div>
        ) : lastSaved ? (
          <div className="flex items-center space-x-1">
            <Save className="w-4 h-4 text-green-500" />
            <span>Saved {lastSaved.toLocaleTimeString()}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default EditingModeNavigation;