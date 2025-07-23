import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseAutoSaveOptions<T> {
  delay?: number; // Debounce delay in milliseconds
  onSave: (data: T) => Promise<void>;
  onError?: (error: Error) => void;
  onSuccess?: () => void;
}

export interface UseAutoSaveReturn {
  save: (data: any) => void;
  isLoading: boolean;
  lastSaved: Date | null;
  error: Error | null;
  clearError: () => void;
}

/**
 * Hook for auto-saving data with debouncing functionality
 * Automatically saves changes after a specified delay to prevent excessive API calls
 */
export function useAutoSave<T>({
  delay = 2000,
  onSave,
  onError,
  onSuccess
}: UseAutoSaveOptions<T>): UseAutoSaveReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<Error | null>(null);
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingDataRef = useRef<T | null>(null);
  const isUnmountedRef = useRef(false);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      isUnmountedRef.current = true;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const performSave = useCallback(async (data: T) => {
    if (isUnmountedRef.current) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await onSave(data);
      
      if (!isUnmountedRef.current) {
        setLastSaved(new Date());
        onSuccess?.();
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Save failed');
      
      if (!isUnmountedRef.current) {
        setError(error);
        onError?.(error);
      }
    } finally {
      if (!isUnmountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [onSave, onError, onSuccess]);

  const save = useCallback((data: T) => {
    // Store the latest data
    pendingDataRef.current = data;
    
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Set new timeout for debounced save
    timeoutRef.current = setTimeout(() => {
      if (pendingDataRef.current && !isUnmountedRef.current) {
        performSave(pendingDataRef.current);
        pendingDataRef.current = null;
      }
    }, delay);
  }, [delay, performSave]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    save,
    isLoading,
    lastSaved,
    error,
    clearError
  };
}