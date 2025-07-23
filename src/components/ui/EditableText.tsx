import React, { KeyboardEvent, useCallback } from 'react';
import { useInlineEdit } from '@/hooks/useInlineEdit';
import { cn } from '@/lib/utils';

export interface EditableTextProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  editClassName?: string;
  multiline?: boolean;
  maxLength?: number;
  validator?: (value: string) => string | null;
  disabled?: boolean;
  autoSave?: boolean;
  saveDelay?: number;
  onEditStart?: () => void;
  onEditEnd?: () => void;
  onCancel?: () => void;
  
  // Display customization
  displayAs?: 'span' | 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p';
  emptyText?: string;
  style?: React.CSSProperties;
  
  // Input customization
  inputType?: 'text' | 'email' | 'tel' | 'url';
  
  // Visual indicators
  showEditIcon?: boolean;
  showSaveIndicator?: boolean;
}

/**
 * Generic editable text component that provides inline editing functionality
 * Supports both single-line and multiline text editing with validation
 */
export function EditableText({
  value,
  onChange,
  placeholder = 'Click to edit...',
  className = '',
  editClassName = '',
  multiline = false,
  maxLength,
  validator,
  disabled = false,
  autoSave = false,
  saveDelay = 500,
  onEditStart,
  onEditEnd,
  onCancel,
  displayAs = 'span',
  emptyText = 'Click to add text',
  style,
  inputType = 'text',
  showEditIcon = false,
  showSaveIndicator = false
}: EditableTextProps) {
  const {
    value: editValue,
    isEditing,
    error,
    isDirty,
    startEdit,
    cancelEdit,
    saveEdit,
    setValue,
    inputRef
  } = useInlineEdit({
    initialValue: value,
    onSave: onChange,
    onCancel,
    validator,
    autoSave,
    saveDelay
  });

  // Handle edit start
  const handleEditStart = useCallback(() => {
    if (disabled) return;
    startEdit();
    onEditStart?.();
  }, [disabled, startEdit, onEditStart]);

  // Handle edit end
  const handleEditEnd = useCallback(() => {
    saveEdit();
    onEditEnd?.();
  }, [saveEdit, onEditEnd]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    cancelEdit();
    onCancel?.();
  }, [cancelEdit, onCancel]);

  // Handle keyboard events
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      handleEditEnd();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  }, [multiline, handleEditEnd, handleCancel]);

  // Handle blur (save on focus loss)
  const handleBlur = useCallback(() => {
    // Always save on blur, regardless of autoSave setting
    handleEditEnd();
  }, [handleEditEnd]);

  // Create display element
  const DisplayElement = displayAs;
  const displayText = value || emptyText;
  const isEmpty = !value;

  if (isEditing) {
    const InputComponent = multiline ? 'textarea' : 'input';
    
    return (
      <div className="relative">
        <InputComponent
          ref={inputRef as any}
          type={multiline ? undefined : inputType}
          value={editValue}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder={placeholder}
          maxLength={maxLength}
          className={cn(
            'w-full bg-white border border-gray-300 rounded px-2 py-1',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            multiline && 'resize-none min-h-[2.5rem]',
            error && 'border-red-500 focus:ring-red-500',
            editClassName
          )}
          rows={multiline ? 3 : undefined}
        />
        
        {/* Error message */}
        {error && (
          <div className="absolute top-full left-0 mt-1 text-sm text-red-600 bg-white border border-red-200 rounded px-2 py-1 shadow-sm z-10">
            {error}
          </div>
        )}
        
        {/* Character count for multiline */}
        {multiline && maxLength && (
          <div className="absolute top-full right-0 mt-1 text-xs text-gray-500">
            {editValue.length}/{maxLength}
          </div>
        )}
        
        {/* Save indicator */}
        {showSaveIndicator && isDirty && (
          <div className="absolute -top-2 -right-2 w-2 h-2 bg-orange-500 rounded-full"></div>
        )}
      </div>
    );
  }

  return (
    <DisplayElement
      onClick={handleEditStart}
      className={cn(
        'cursor-pointer transition-colors duration-200',
        'hover:bg-gray-50 rounded px-1 py-0.5 -mx-1 -my-0.5',
        isEmpty && 'text-gray-400 italic',
        disabled && 'cursor-not-allowed opacity-50',
        className
      )}
      style={style}
      title={disabled ? undefined : 'Click to edit'}
    >
      {displayText}
      
      {/* Edit icon */}
      {showEditIcon && !disabled && (
        <span className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <svg
            className="w-3 h-3 inline-block text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
        </span>
      )}
    </DisplayElement>
  );
}