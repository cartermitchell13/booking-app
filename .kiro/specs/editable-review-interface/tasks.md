# Implementation Plan

- [x] 1. Create core inline editing infrastructure





  - Set up auto-save hook with debouncing functionality
  - Create generic EditableText component for simple text fields
  - Implement useInlineEdit hook for managing edit states
  - _Requirements: 1.2, 1.3, 3.1, 3.2_

- [x] 2. Transform existing customer preview header section





  - [x] 2.1 Make offering title directly editable



    - Wrap the h1 title element with EditableText component
    - Add click handler to enter edit mode
    - Implement auto-save on blur/enter
    - _Requirements: 1.1, 2.1_



  - [x] 2.2 Make location and duration editable inline


    - Convert location text to editable field with location picker
    - Make duration field directly editable with number input
    - Add visual indicators for editable areas
    - _Requirements: 1.4, 2.6_

- [x] 3. Implement editable description section





  - [x] 3.1 Create rich text editor for description


    - Replace static description paragraph with rich text editor
    - Implement click-to-edit functionality
    - Add formatting toolbar that appears on edit
    - _Requirements: 2.2_

  - [x] 3.2 Add auto-save for description changes


    - Integrate description editor with auto-save hook
    - Handle rich text content serialization
    - Provide visual feedback for save status
    - _Requirements: 3.1, 3.4_

- [x] 4. Transform image gallery to be editable






  - [x] 4.1 Add image upload functionality to gallery






    - Convert existing image display to editable gallery
    - Add click-to-upload functionality for new images
    - Implement drag-and-drop image reordering
    - _Requirements: 2.4_

  - [x] 4.2 Implement image management controls







    - Add delete/replace options for existing images
    - Implement primary image selection
    - Add image alt text editing
    - _Requirements: 2.4_

- [x] 5. Make trip highlights section editable





  - [x] 5.1 Create editable highlights list


    - Convert static highlights to editable list items
    - Add click-to-edit functionality for each highlight
    - Implement add/remove highlight functionality
    - _Requirements: 2.2, 4.3_

  - [x] 5.2 Make amenities section editable

    - Transform "What's Included" section to editable list
    - Add ability to add/remove amenities
    - Implement checkbox-style amenity selection
    - _Requirements: 4.3_

- [x] 6. Transform pricing sidebar to be editable





  - [x] 6.1 Make pricing values directly editable




    - Convert price displays to inline editable fields
    - Add currency selection functionality
    - Implement pricing tier management
    - _Requirements: 2.3, 4.4_

  - [x] 6.2 Add advanced pricing configuration


    - Create contextual panel for complex pricing settings
    - Add tax rate configuration
    - Implement group pricing and discounts
    - _Requirements: 4.1, 4.2_

- [x] 7. Implement pickup locations editing





  - [x] 7.1 Make pickup locations directly editable



    - Convert static pickup location display to editable format
    - Add click-to-edit for location names and times
    - Implement add/remove pickup location functionality
    - _Requirements: 4.3_

  - [x] 7.2 Add location selection and mapping





    - Integrate location picker for pickup addresses
    - Add time picker for pickup times
    - Validate pickup location data
    - _Requirements: 2.6_

- [-] 8. Add validation and publishing integration





  - [x] 8.1 Implement real-time validation indicators





    - Add visual indicators for required fields
    - Show validation errors inline within preview
    - Highlight incomplete sections with clear visual cues
    - _Requirements: 5.1, 5.2_

  - [ ] 8.2 Integrate publishing controls
    - Add publishing options directly within the editable interface
    - Implement validation checks before publishing
    - Create seamless publish workflow from editable view
    - _Requirements: 5.3, 5.4_

- [ ] 9. Add mobile responsiveness and touch support
  - [ ] 9.1 Optimize editing controls for mobile
    - Adapt inline editing for touch interactions
    - Implement mobile-friendly editing panels
    - Add touch-appropriate target sizes
    - _Requirements: 6.1, 6.4_

  - [ ] 9.2 Ensure cross-device state persistence
    - Maintain editing state across device switches
    - Implement responsive layout for editing controls
    - Test editing functionality on various screen sizes
    - _Requirements: 6.2, 6.3_

- [ ] 10. Replace existing ReviewStep with editable version
  - [ ] 10.1 Update component integration
    - Replace current ReviewStep component with EditableCustomerPreview
    - Update parent component to handle new editing interface
    - Migrate existing form data structure to new format
    - _Requirements: 1.1, 1.2_

  - [ ] 10.2 Add comprehensive testing
    - Write unit tests for all editable components
    - Add integration tests for auto-save functionality
    - Test validation and publishing workflows
    - _Requirements: 3.3, 5.1_

- [-] 11. Restructure offering creation from wizard to single editable interface










  - [x] 11.1 Create new main EditableOfferingView component






    - Build primary component that uses enhanced ReviewStep as core interface
    - Implement single-page editing experience with real-time preview
    - Add navigation structure for different editing modes (preview, validation, etc.)
    - _Requirements: 1.1, 1.2, 2.1_

  - [ ] 11.2 Convert wizard steps into modal components for advanced settings






    - Transform BusinessTypeStep into initial setup modal
    - Convert SchedulingStep into advanced scheduling modal
    - Transform complex pricing configurations into modal panels
    - Create SEO/metadata settings modal
    - _Requirements: 4.1, 4.2, 5.3_

  - [ ] 11.3 Update routing and navigation to use editable interface as primary
    - Replace wizard routing with single editable interface route
    - Update navigation to support modal-based advanced settings
    - Implement proper state management for modal interactions
    - Ensure proper URL handling and deep linking
    - _Requirements: 1.3, 3.1, 5.4_