import React, { useCallback, useRef, useEffect, useState } from 'react';
import { useInlineEdit } from '@/hooks/useInlineEdit';
import { useAutoSave } from '@/hooks/useAutoSave';
import { cn } from '@/lib/utils';
import { Bold, Italic, Underline, List, ListOrdered, Check, AlertCircle, Heading1, Heading2, Heading3 } from 'lucide-react';

export interface EditableRichTextProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  editClassName?: string;
  maxLength?: number;
  validator?: (value: string) => string | null;
  disabled?: boolean;
  autoSave?: boolean;
  saveDelay?: number;
  onEditStart?: () => void;
  onEditEnd?: () => void;
  onCancel?: () => void;
  
  // Auto-save integration
  onAutoSave?: (value: string) => Promise<void>;
  
  // Display customization
  displayAs?: 'div' | 'p';
  emptyText?: string;
  style?: React.CSSProperties;
  
  // Visual indicators
  showEditIcon?: boolean;
  showSaveIndicator?: boolean;
}

/**
 * Rich text editor component that provides inline editing with formatting toolbar
 * Supports basic formatting like bold, italic, underline, and lists
 */
export function EditableRichText({
  value,
  onChange,

  className = '',
  editClassName = '',
  maxLength,
  validator,
  disabled = false,
  autoSave = false,
  saveDelay = 500,
  onEditStart,
  onEditEnd,
  onCancel,
  onAutoSave,
  displayAs = 'div',
  emptyText = 'Click to add description',
  style,
  showEditIcon = false,
  showSaveIndicator = false
}: EditableRichTextProps) {
  const contentEditableRef = useRef<HTMLDivElement>(null);
  const [showToolbar, setShowToolbar] = useState(false);
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());
  
  // Auto-save hook for handling debounced saves
  const {
    save: triggerAutoSave,
    isLoading: isAutoSaving,
    lastSaved,
    error: autoSaveError
  } = useAutoSave({
    delay: saveDelay,
    onSave: async (data: string) => {
      if (onAutoSave) {
        await onAutoSave(data);
      } else {
        onChange(data);
      }
    },
    onError: (error) => {
      console.error('Auto-save failed:', error);
    }
  });
  
  const {
    value: editValue,
    isEditing,
    error,
    isDirty,
    startEdit,
    cancelEdit,
    saveEdit,
    setValue
  } = useInlineEdit({
    initialValue: value,
    onSave: (newValue) => {
      if (autoSave) {
        triggerAutoSave(newValue);
      } else {
        onChange(newValue);
      }
    },
    onCancel,
    validator,
    autoSave: false, // We handle auto-save manually with the useAutoSave hook
    saveDelay
  });

  // Handle edit start
  const handleEditStart = useCallback(() => {
    if (disabled) return;
    startEdit();
    setShowToolbar(true);
    onEditStart?.();
  }, [disabled, startEdit, onEditStart]);

  // Handle edit end
  const handleEditEnd = useCallback(() => {
    saveEdit();
    setShowToolbar(false);
    onEditEnd?.();
  }, [saveEdit, onEditEnd]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    cancelEdit();
    setShowToolbar(false);
    onCancel?.();
  }, [cancelEdit, onCancel]);



  // Check which formatting commands are currently active
  const updateActiveFormats = useCallback(() => {
    const newActiveFormats = new Set<string>();
    
    try {
      if (document.queryCommandState('bold')) {
        newActiveFormats.add('bold');
      }
      if (document.queryCommandState('italic')) {
        newActiveFormats.add('italic');
      }
      if (document.queryCommandState('underline')) {
        newActiveFormats.add('underline');
      }
      if (document.queryCommandState('insertUnorderedList')) {
        newActiveFormats.add('insertUnorderedList');
      }
      if (document.queryCommandState('insertOrderedList')) {
        newActiveFormats.add('insertOrderedList');
      }
      
      // Check for headings by examining the current selection
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        let element = range.commonAncestorContainer;
        
        // If it's a text node, get its parent element
        if (element.nodeType === Node.TEXT_NODE) {
          element = element.parentElement;
        }
        
        // Check if we're inside a heading element
        while (element && element !== contentEditableRef.current) {
          if (element.nodeName === 'H1') {
            newActiveFormats.add('h1');
            break;
          } else if (element.nodeName === 'H2') {
            newActiveFormats.add('h2');
            break;
          } else if (element.nodeName === 'H3') {
            newActiveFormats.add('h3');
            break;
          }
          element = element.parentElement;
        }
      }
    } catch (error) {
      // Some browsers may not support all queryCommandState calls
      console.warn('Error checking command state:', error);
    }
    
    setActiveFormats(newActiveFormats);
  }, []);

  // Handle content change in contentEditable
  const handleContentChange = useCallback(() => {
    if (contentEditableRef.current) {
      const newValue = contentEditableRef.current.innerHTML;
      setValue(newValue);
      
      // Update active formats after content change
      updateActiveFormats();
      
      // Trigger auto-save if enabled
      if (autoSave && newValue !== value) {
        triggerAutoSave(newValue);
      }
    }
  }, [setValue, autoSave, triggerAutoSave, value, updateActiveFormats]);

  // Handle keyboard events
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleEditEnd();
    }
  }, [handleCancel, handleEditEnd]);

  // Handle blur (save on focus loss)
  const handleBlur = useCallback((e: React.FocusEvent) => {
    // Don't save if focus moved to toolbar
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (relatedTarget && relatedTarget.closest('.rich-text-toolbar')) {
      return;
    }
    handleEditEnd();
  }, [handleEditEnd]);

  // Focus contentEditable when entering edit mode
  useEffect(() => {
    if (isEditing && contentEditableRef.current) {
      contentEditableRef.current.focus();
      // Place cursor at end
      const range = document.createRange();
      const selection = window.getSelection();
      range.selectNodeContents(contentEditableRef.current);
      range.collapse(false);
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  }, [isEditing]);

  // Only update contentEditable content when first entering edit mode
  useEffect(() => {
    if (isEditing && contentEditableRef.current) {
      // Only set initial content when entering edit mode, don't update during typing
      const currentContent = contentEditableRef.current.innerHTML;
      if (currentContent === '' || currentContent !== editValue) {
        contentEditableRef.current.innerHTML = editValue;
      }
    }
  }, [isEditing]); // Only depend on isEditing, not editValue

  // Custom list implementation for better browser compatibility
  const toggleList = useCallback((listType: 'ul' | 'ol') => {
    if (!contentEditableRef.current) return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    let element = range.commonAncestorContainer;

    // If it's a text node, get its parent element
    if (element.nodeType === Node.TEXT_NODE) {
      element = element.parentElement;
    }

    // Find if we're already in a list
    let listElement: HTMLElement | null = null;
    let currentElement = element as HTMLElement;
    
    while (currentElement && currentElement !== contentEditableRef.current) {
      if (currentElement.tagName === 'UL' || currentElement.tagName === 'OL') {
        listElement = currentElement;
        break;
      }
      currentElement = currentElement.parentElement;
    }

    if (listElement) {
      // We're in a list, remove it
      const listItems = Array.from(listElement.children);
      const fragment = document.createDocumentFragment();
      
      listItems.forEach(item => {
        const p = document.createElement('p');
        p.innerHTML = item.innerHTML;
        fragment.appendChild(p);
      });
      
      listElement.parentNode?.replaceChild(fragment, listElement);
    } else {
      // We're not in a list, create one
      const listTag = listType.toUpperCase();
      const newList = document.createElement(listTag);
      
      // Get the current line/paragraph
      let currentParagraph = element as HTMLElement;
      while (currentParagraph && currentParagraph !== contentEditableRef.current && 
             !['P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(currentParagraph.tagName)) {
        currentParagraph = currentParagraph.parentElement;
      }
      
      if (currentParagraph && currentParagraph !== contentEditableRef.current) {
        const listItem = document.createElement('li');
        listItem.innerHTML = currentParagraph.innerHTML || '&nbsp;';
        newList.appendChild(listItem);
        currentParagraph.parentNode?.replaceChild(newList, currentParagraph);
        
        // Place cursor in the list item
        const newRange = document.createRange();
        newRange.selectNodeContents(listItem);
        newRange.collapse(false);
        selection.removeAllRanges();
        selection.addRange(newRange);
      }
    }

    handleContentChange();
    contentEditableRef.current?.focus();
  }, [handleContentChange]);

  // Custom heading toggle implementation
  const toggleHeading = useCallback((headingLevel: 'h1' | 'h2' | 'h3') => {
    if (!contentEditableRef.current) return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    let element = range.commonAncestorContainer;

    // If it's a text node, get its parent element
    if (element.nodeType === Node.TEXT_NODE) {
      element = element.parentElement;
    }

    // Find the current block element (heading or paragraph)
    let currentBlock = element as HTMLElement;
    while (currentBlock && currentBlock !== contentEditableRef.current && 
           !['P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(currentBlock.tagName)) {
      currentBlock = currentBlock.parentElement;
    }

    if (currentBlock && currentBlock !== contentEditableRef.current) {
      const isCurrentlyHeading = currentBlock.tagName === headingLevel.toUpperCase();
      
      if (isCurrentlyHeading) {
        // Convert heading back to paragraph
        const newParagraph = document.createElement('p');
        newParagraph.innerHTML = currentBlock.innerHTML;
        currentBlock.parentNode?.replaceChild(newParagraph, currentBlock);
        
        // Restore cursor position
        const newRange = document.createRange();
        newRange.selectNodeContents(newParagraph);
        newRange.collapse(false);
        selection.removeAllRanges();
        selection.addRange(newRange);
      } else {
        // Convert to the requested heading level
        const newHeading = document.createElement(headingLevel);
        newHeading.innerHTML = currentBlock.innerHTML;
        currentBlock.parentNode?.replaceChild(newHeading, currentBlock);
        
        // Restore cursor position
        const newRange = document.createRange();
        newRange.selectNodeContents(newHeading);
        newRange.collapse(false);
        selection.removeAllRanges();
        selection.addRange(newRange);
      }
    }

    handleContentChange();
    contentEditableRef.current?.focus();
  }, [handleContentChange]);

  // Formatting functions
  const formatText = useCallback((command: string, value?: string) => {
    // Use custom list implementation for better compatibility
    if (command === 'insertUnorderedList') {
      toggleList('ul');
      return;
    }
    if (command === 'insertOrderedList') {
      toggleList('ol');
      return;
    }

    // Use custom heading implementation for toggle functionality
    if (command === 'formatBlock' && value) {
      if (value === 'h1' || value === 'h2' || value === 'h3') {
        toggleHeading(value as 'h1' | 'h2' | 'h3');
        return;
      }
    }

    document.execCommand(command, false, value);
    handleContentChange();
    contentEditableRef.current?.focus();
  }, [handleContentChange, toggleList, toggleHeading]);

  // Create display element
  const DisplayElement = displayAs;
  const isEmpty = !value;

  // Convert HTML to plain text for display when not editing
  const getPlainTextFromHTML = (html: string) => {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  };

  if (isEditing) {
    return (
      <div className="relative">
        {/* Formatting Toolbar */}
        {showToolbar && (
          <div className="rich-text-toolbar absolute -top-12 left-0 bg-white border border-gray-300 rounded-lg shadow-lg p-2 flex items-center space-x-1 z-20">
            <button
              type="button"
              onClick={() => formatText('bold')}
              className={cn(
                'p-1.5 rounded transition-colors',
                activeFormats.has('bold')
                  ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  : 'hover:bg-gray-100'
              )}
              title="Bold"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => formatText('italic')}
              className={cn(
                'p-1.5 rounded transition-colors',
                activeFormats.has('italic')
                  ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  : 'hover:bg-gray-100'
              )}
              title="Italic"
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => formatText('underline')}
              className={cn(
                'p-1.5 rounded transition-colors',
                activeFormats.has('underline')
                  ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  : 'hover:bg-gray-100'
              )}
              title="Underline"
            >
              <Underline className="w-4 h-4" />
            </button>
            <div className="w-px h-6 bg-gray-300 mx-1" />
            <button
              type="button"
              onClick={() => formatText('formatBlock', 'h1')}
              className={cn(
                'p-1.5 rounded transition-colors',
                activeFormats.has('h1')
                  ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  : 'hover:bg-gray-100'
              )}
              title="Heading 1"
            >
              <Heading1 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => formatText('formatBlock', 'h2')}
              className={cn(
                'p-1.5 rounded transition-colors',
                activeFormats.has('h2')
                  ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  : 'hover:bg-gray-100'
              )}
              title="Heading 2"
            >
              <Heading2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => formatText('formatBlock', 'h3')}
              className={cn(
                'p-1.5 rounded transition-colors',
                activeFormats.has('h3')
                  ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  : 'hover:bg-gray-100'
              )}
              title="Heading 3"
            >
              <Heading3 className="w-4 h-4" />
            </button>
            <div className="w-px h-6 bg-gray-300 mx-1" />
            <button
              type="button"
              onClick={() => formatText('insertUnorderedList')}
              className={cn(
                'p-1.5 rounded transition-colors',
                activeFormats.has('insertUnorderedList')
                  ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  : 'hover:bg-gray-100'
              )}
              title="Bullet List"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => formatText('insertOrderedList')}
              className={cn(
                'p-1.5 rounded transition-colors',
                activeFormats.has('insertOrderedList')
                  ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  : 'hover:bg-gray-100'
              )}
              title="Numbered List"
            >
              <ListOrdered className="w-4 h-4" />
            </button>
            <div className="w-px h-6 bg-gray-300 mx-1" />
            <button
              type="button"
              onClick={handleEditEnd}
              className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
            >
              Save
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Content Editable Area */}
        <div
          ref={contentEditableRef}
          contentEditable
          onInput={handleContentChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          onMouseUp={updateActiveFormats}
          onKeyUp={updateActiveFormats}
          onFocus={updateActiveFormats}
          className={cn(
            'w-full min-h-[100px] p-3 bg-white border border-gray-300 rounded-lg',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            'prose prose-sm max-w-none',
            // Explicit list styling to ensure lists are visible
            '[&_ul]:list-disc [&_ul]:ml-6 [&_ul]:my-2',
            '[&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:my-2',
            '[&_li]:mb-1',
            // Heading styles
            '[&_h1]:text-2xl [&_h1]:font-bold [&_h1]:my-4',
            '[&_h2]:text-xl [&_h2]:font-bold [&_h2]:my-3',
            '[&_h3]:text-lg [&_h3]:font-bold [&_h3]:my-2',
            error && 'border-red-500 focus:ring-red-500',
            editClassName
          )}
          style={{ 
            ...style,
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word'
          }}
          suppressContentEditableWarning={true}
        />
        
        {/* Error message */}
        {error && (
          <div className="absolute top-full left-0 mt-1 text-sm text-red-600 bg-white border border-red-200 rounded px-2 py-1 shadow-sm z-10">
            {error}
          </div>
        )}
        
        {/* Character count */}
        {maxLength && (
          <div className="absolute top-full right-0 mt-1 text-xs text-gray-500">
            {getPlainTextFromHTML(editValue).length}/{maxLength}
          </div>
        )}
        
        {/* Auto-save status indicator */}
        {showSaveIndicator && autoSave && (
          <div className="absolute top-full right-0 mt-1 flex items-center space-x-1 text-xs">
            {isAutoSaving && (
              <div className="flex items-center text-blue-600">
                <div className="animate-spin w-3 h-3 border border-blue-600 border-t-transparent rounded-full mr-1"></div>
                <span>Saving...</span>
              </div>
            )}
            {!isAutoSaving && lastSaved && (
              <div className="flex items-center text-green-600">
                <Check className="w-3 h-3 mr-1" />
                <span>Saved {lastSaved.toLocaleTimeString()}</span>
              </div>
            )}
            {autoSaveError && (
              <div className="flex items-center text-red-600">
                <AlertCircle className="w-3 h-3 mr-1" />
                <span>Save failed</span>
              </div>
            )}
          </div>
        )}

        {/* Save indicator for non-auto-save mode */}
        {showSaveIndicator && !autoSave && isDirty && (
          <div className="absolute -top-2 -right-2 w-2 h-2 bg-orange-500 rounded-full"></div>
        )}

        {/* Instructions */}
        <div className="absolute top-full left-0 mt-2 text-xs text-gray-500">
          {autoSave ? 'Auto-saving enabled • Press Escape to cancel' : 'Press Ctrl+Enter to save, Escape to cancel'}
        </div>
      </div>
    );
  }

  return (
    <DisplayElement
      onClick={handleEditStart}
      className={cn(
        'cursor-pointer transition-colors duration-200',
        'hover:bg-gray-50 rounded px-2 py-2 -mx-2 -my-2',
        isEmpty && 'text-gray-400 italic',
        disabled && 'cursor-not-allowed opacity-50',
        className
      )}
      style={style}
      title={disabled ? undefined : 'Click to edit'}
    >
      {isEmpty ? (
        emptyText
      ) : (
        <div dangerouslySetInnerHTML={{ __html: value }} />
      )}
      
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