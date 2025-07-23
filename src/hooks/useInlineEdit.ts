import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseInlineEditOptions<T> {
  initialValue: T;
  onSave?: (value: T) => void;
  onCancel?: () => void;
  validator?: (value: T) => string | null;
  autoSave?: boolean;
  saveDelay?: number;
}

export interface UseInlineEditReturn<T> {
  value: T;
  isEditing: boolean;
  error: string | null;
  isDirty: boolean;
  
  // Actions
  startEdit: () => void;
  cancelEdit: () => void;
  saveEdit: () => void;
  setValue: (value: T) => void;
  setError: (error: string | null) => void;
  
  // Refs for managing focus
  inputRef: React.RefObject<HTMLInputElement | HTMLTextAreaElement | null>;
}

/**
 * Hook for managing inline editing state and behavior
 * Handles edit mode, validation, save/cancel actions, and focus management
 */
export function useInlineEdit<T>({
  initialValue,
  onSave,
  onCancel,
  validator,
  autoSave = false,
  saveDelay = 500
}: UseInlineEditOptions<T>): UseInlineEditReturn<T> {
  const [value, setValue] = useState<T>(initialValue);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  
  const originalValueRef = useRef<T>(initialValue);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Update original value when initialValue changes
  useEffect(() => {
    if (!isEditing) {
      setValue(initialValue);
      originalValueRef.current = initialValue;
      setIsDirty(false);
      setError(null);
    }
  }, [initialValue, isEditing]);

  const currentValueRef = useRef<T>(value);
  
  // Keep current value ref updated
  useEffect(() => {
    currentValueRef.current = value;
  }, [value]);

  const saveEdit = useCallback(() => {
    const currentValue = currentValueRef.current;
    
    // Validate if validator is provided
    if (validator) {
      const validationError = validator(currentValue);
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    // Save the value
    setIsEditing(false);
    setIsDirty(false);
    setError(null);
    originalValueRef.current = currentValue;
    onSave?.(currentValue);
  }, [validator, onSave]);

  // Auto-save functionality - debounced save when user stops typing
  useEffect(() => {
    if (autoSave && isDirty && !error && isEditing) {
      // Clear existing timeout
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      
      // Set new timeout - this will be reset every time the user types
      autoSaveTimeoutRef.current = setTimeout(() => {
        saveEdit();
      }, saveDelay);
    }
    
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [value, isDirty, error, isEditing, autoSave, saveDelay, saveEdit]);

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      
      // Select all text for text inputs
      if (inputRef.current.type === 'text' || inputRef.current.tagName === 'TEXTAREA') {
        inputRef.current.select();
      }
    }
  }, [isEditing]);

  const startEdit = useCallback(() => {
    setIsEditing(true);
    setError(null);
    originalValueRef.current = value;
  }, [value]);

  const cancelEdit = useCallback(() => {
    setValue(originalValueRef.current);
    setIsEditing(false);
    setIsDirty(false);
    setError(null);
    onCancel?.();
  }, [onCancel]);

  const handleSetValue = useCallback((newValue: T) => {
    setValue(newValue);
    currentValueRef.current = newValue; // Update ref immediately
    setIsDirty(newValue !== originalValueRef.current);
    setError(null);
  }, []);

  const handleSetError = useCallback((newError: string | null) => {
    setError(newError);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  return {
    value,
    isEditing,
    error,
    isDirty,
    startEdit,
    cancelEdit,
    saveEdit,
    setValue: handleSetValue,
    setError: handleSetError,
    inputRef
  };
}