// Product Adapters for Universal Product System

import { 
  Product, 
  ProductAdapter, 
  ProductBooking, 
  BookingRequirement,
  SeatProductData,
  CapacityProductData,
  OpenProductData,
  EquipmentProductData,
  PackageProductData,
  TimeslotProductData
} from '@/types/products';

// Base adapter class with common functionality
export abstract class BaseProductAdapter implements ProductAdapter {
  abstract validateBooking(product: Product, bookingData: any): boolean;
  abstract getBookingRequirements(product: Product): BookingRequirement[];
  
  calculatePrice(product: Product, quantity: number, bookingData?: any): number {
    let basePrice = product.base_price * quantity;
    
    // Apply group discounts if configured
    if (product.booking_rules.group_discount_threshold && 
        quantity >= product.booking_rules.group_discount_threshold &&
        product.booking_rules.group_discount_percent) {
      const discount = basePrice * (product.booking_rules.group_discount_percent / 100);
      basePrice -= discount;
    }
    
    return Math.round(basePrice);
  }
  
  async checkAvailability(product: Product, date: string, quantity: number): Promise<boolean> {
    // Basic availability check - can be overridden by specific adapters
    return true; // Simplified for demo
  }
  
  async processBooking(product: Product, bookingData: any): Promise<ProductBooking> {
    // Common booking processing logic
    const bookingReference = this.generateBookingReference();
    const totalAmount = this.calculatePrice(product, bookingData.quantity || 1, bookingData);
    
    // This would integrate with your booking database
    const booking: ProductBooking = {
      id: crypto.randomUUID(),
      tenant_id: product.tenant_id,
      product_id: product.id,
      customer_id: bookingData.customer_id || 'guest',
      booking_reference: bookingReference,
      quantity: bookingData.quantity || 1,
      unit_price: product.base_price,
      total_amount: totalAmount,
      booking_data: bookingData,
      special_requests: bookingData.special_requests,
      status: 'pending',
      payment_status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    return booking;
  }
  
  protected generateBookingReference(): string {
    return 'BK' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 4).toUpperCase();
  }
}

// Seat-based Product Adapter (buses, trains, planes)
export class SeatProductAdapter extends BaseProductAdapter {
  validateBooking(product: Product, bookingData: any): boolean {
    const productData = product.product_data as SeatProductData;
    
    // Validate seat selection if required
    if (bookingData.selected_seats) {
      if (bookingData.selected_seats.length !== bookingData.quantity) {
        return false;
      }
      // Check if seats are available (simplified)
      return bookingData.selected_seats.every((seat: string) => 
        this.isSeatAvailable(seat, productData)
      );
    }
    
    // Validate passenger details
    if (bookingData.passenger_details && 
        bookingData.passenger_details.length !== bookingData.quantity) {
      return false;
    }
    
    return true;
  }
  
  getBookingRequirements(product: Product): BookingRequirement[] {
    const productData = product.product_data as SeatProductData;
    
    const requirements: BookingRequirement[] = [
      {
        field: 'quantity',
        type: 'number',
        required: true,
        label: 'Number of Passengers',
        validation: `min:1,max:${productData.total_seats}`
      }
    ];
    
    // Add pickup location selection if multiple locations
    if (productData.pickup_locations && productData.pickup_locations.length > 1) {
      requirements.push({
        field: 'pickup_location_id',
        type: 'select',
        required: true,
        label: 'Pickup Location',
        options: productData.pickup_locations.map(loc => loc.name)
      });
    }
    
    // Add passenger details requirement
    requirements.push({
      field: 'passenger_details',
      type: 'text', // This would be a complex form in reality
      required: true,
      label: 'Passenger Information',
      description: 'Full name, age, and contact details for all passengers'
    });
    
    return requirements;
  }
  
  calculatePrice(product: Product, quantity: number, bookingData?: any): number {
    let basePrice = super.calculatePrice(product, quantity, bookingData);
    
    // Add pickup location surcharges if applicable
    if (bookingData?.pickup_location_id) {
      const productData = product.product_data as SeatProductData;
      const pickupLocation = productData.pickup_locations?.find(
        loc => loc.name === bookingData.pickup_location_id
      );
      // Could add surcharge logic here
    }
    
    return basePrice;
  }
  
  private isSeatAvailable(seat: string, productData: SeatProductData): boolean {
    // Simplified seat availability check
    return true; // In reality, check against booked seats
  }
}

// Capacity-based Product Adapter (boats, venues)
export class CapacityProductAdapter extends BaseProductAdapter {
  validateBooking(product: Product, bookingData: any): boolean {
    const productData = product.product_data as CapacityProductData;
    
    // Check if requested quantity doesn't exceed capacity
    if (bookingData.quantity > productData.total_capacity) {
      return false;
    }
    
    // Validate minimum passenger requirement
    if (product.availability_data.minimum_passengers && 
        bookingData.quantity < product.availability_data.minimum_passengers) {
      return false;
    }
    
    return true;
  }
  
  getBookingRequirements(product: Product): BookingRequirement[] {
    const productData = product.product_data as CapacityProductData;
    
    return [
      {
        field: 'quantity',
        type: 'number',
        required: true,
        label: 'Number of Guests',
        validation: `min:${product.availability_data.minimum_passengers || 1},max:${productData.total_capacity}`
      },
      {
        field: 'passenger_details',
        type: 'text',
        required: false,
        label: 'Guest Information',
        description: 'Contact person details'
      },
      {
        field: 'special_dietary_requests',
        type: 'multiselect',
        required: false,
        label: 'Dietary Requirements',
        options: ['Vegetarian', 'Vegan', 'Gluten-Free', 'Nut Allergy', 'Other']
      }
    ];
  }
}

// Open Product Adapter (walking tours, events)
export class OpenProductAdapter extends BaseProductAdapter {
  validateBooking(product: Product, bookingData: any): boolean {
    const productData = product.product_data as OpenProductData;
    
    // For open products, usually just need to validate quantity is reasonable
    if (bookingData.quantity <= 0) {
      return false;
    }
    
    return true;
  }
  
  getBookingRequirements(product: Product): BookingRequirement[] {
    const productData = product.product_data as OpenProductData;
    
    const requirements: BookingRequirement[] = [
      {
        field: 'quantity',
        type: 'number',
        required: true,
        label: 'Number of Participants',
        validation: 'min:1'
      }
    ];
    
    // Add dietary accommodations if tour provides food
    if (productData.dietary_accommodations) {
      requirements.push({
        field: 'dietary_restrictions',
        type: 'multiselect',
        required: false,
        label: 'Dietary Restrictions',
        options: productData.dietary_accommodations
      });
    }
    
    // Add mobility requirements for accessibility
    requirements.push({
      field: 'mobility_requirements',
      type: 'text',
      required: false,
      label: 'Accessibility Needs',
      description: 'Any mobility or accessibility requirements'
    });
    
    return requirements;
  }
  
  async checkAvailability(product: Product, date: string, quantity: number): Promise<boolean> {
    // Open products typically don't have capacity limits
    return true;
  }
}

// Equipment Rental Adapter
export class EquipmentProductAdapter extends BaseProductAdapter {
  validateBooking(product: Product, bookingData: any): boolean {
    const productData = product.product_data as EquipmentProductData;
    
    // Validate rental period
    if (!bookingData.rental_period) {
      return false;
    }
    
    // Validate pickup and return times
    if (!bookingData.pickup_time || !bookingData.return_time) {
      return false;
    }
    
    // Validate return time is after pickup time
    if (new Date(bookingData.return_time) <= new Date(bookingData.pickup_time)) {
      return false;
    }
    
    return true;
  }
  
  getBookingRequirements(product: Product): BookingRequirement[] {
    const productData = product.product_data as EquipmentProductData;
    
    const requirements: BookingRequirement[] = [
      {
        field: 'rental_period',
        type: 'select',
        required: true,
        label: 'Rental Period',
        options: product.availability_data.rental_periods?.map(p => p.name) || ['Full Day']
      },
      {
        field: 'pickup_time',
        type: 'date',
        required: true,
        label: 'Pickup Date & Time'
      },
      {
        field: 'return_time',
        type: 'date',
        required: true,
        label: 'Return Date & Time'
      }
    ];
    
    // Add equipment size if specifications include sizes
    if (productData.equipment_specifications.sizes_available) {
      requirements.push({
        field: 'equipment_size',
        type: 'select',
        required: true,
        label: 'Equipment Size',
        options: productData.equipment_specifications.sizes_available
      });
    }
    
    // Add optional gear selection
    if (productData.optional_gear && productData.optional_gear.length > 0) {
      requirements.push({
        field: 'optional_gear_selected',
        type: 'multiselect',
        required: false,
        label: 'Optional Equipment',
        options: productData.optional_gear.map(gear => `${gear.item} (+$${gear.price / 100})`)
      });
    }
    
    return requirements;
  }
  
  calculatePrice(product: Product, quantity: number, bookingData?: any): number {
    let basePrice = super.calculatePrice(product, quantity, bookingData);
    
    // Apply rental period multiplier
    if (bookingData?.rental_period && product.availability_data.rental_periods) {
      const period = product.availability_data.rental_periods.find(
        p => p.name === bookingData.rental_period
      );
      if (period) {
        basePrice = Math.round(basePrice * period.price_multiplier);
      }
    }
    
    // Add optional gear costs
    if (bookingData?.optional_gear_selected) {
      const productData = product.product_data as EquipmentProductData;
      const optionalGearCost = bookingData.optional_gear_selected.reduce((total: number, gearName: string) => {
        const gear = productData.optional_gear?.find(g => gearName.includes(g.item));
        return total + (gear ? gear.price * quantity : 0);
      }, 0);
      basePrice += optionalGearCost;
    }
    
    return basePrice;
  }
}

// Package Product Adapter (multi-activity bundles)
export class PackageProductAdapter extends BaseProductAdapter {
  validateBooking(product: Product, bookingData: any): boolean {
    const productData = product.product_data as PackageProductData;
    
    // Validate all required components are selected
    const requiredComponents = productData.included_products.filter(c => !c.optional);
    const selectedComponents = bookingData.package_components || [];
    
    for (const required of requiredComponents) {
      const isSelected = selectedComponents.some((selected: any) => 
        selected.component_id === required.product_id
      );
      if (!isSelected) {
        return false;
      }
    }
    
    return true;
  }
  
  getBookingRequirements(product: Product): BookingRequirement[] {
    const productData = product.product_data as PackageProductData;
    
    return [
      {
        field: 'quantity',
        type: 'number',
        required: true,
        label: 'Number of Participants',
        validation: 'min:1'
      },
      {
        field: 'package_components',
        type: 'text', // Would be a complex component selector in reality
        required: true,
        label: 'Package Components',
        description: 'Select dates and times for package activities'
      },
      {
        field: 'accommodation_preferences',
        type: 'text',
        required: false,
        label: 'Accommodation Preferences',
        description: 'Special requests for accommodation'
      },
      {
        field: 'meal_preferences',
        type: 'multiselect',
        required: false,
        label: 'Meal Preferences',
        options: productData.meal_plan?.dietary_options || []
      }
    ];
  }
}

// Timeslot Product Adapter (classes, workshops)
export class TimeslotProductAdapter extends BaseProductAdapter {
  validateBooking(product: Product, bookingData: any): boolean {
    const productData = product.product_data as TimeslotProductData;
    
    // Validate participant count doesn't exceed maximum
    if (bookingData.quantity > productData.max_participants) {
      return false;
    }
    
    // Validate session date and time are provided
    if (!bookingData.session_date || !bookingData.session_time) {
      return false;
    }
    
    return true;
  }
  
  getBookingRequirements(product: Product): BookingRequirement[] {
    const productData = product.product_data as TimeslotProductData;
    
    return [
      {
        field: 'session_date',
        type: 'date',
        required: true,
        label: 'Session Date'
      },
      {
        field: 'session_time',
        type: 'select',
        required: true,
        label: 'Session Time',
        options: product.availability_data.start_times || ['10:00', '14:00', '18:00']
      },
      {
        field: 'quantity',
        type: 'number',
        required: true,
        label: 'Number of Participants',
        validation: `min:1,max:${productData.max_participants}`
      },
      {
        field: 'skill_level',
        type: 'select',
        required: false,
        label: 'Current Skill Level',
        options: ['Beginner', 'Intermediate', 'Advanced']
      },
      {
        field: 'special_requirements',
        type: 'multiselect',
        required: false,
        label: 'Special Requirements',
        options: ['Left-handed tools', 'Large print materials', 'Interpreter needed', 'Other']
      }
    ];
  }
}

// Factory function to get the appropriate adapter
export function getProductAdapter(productType: string): ProductAdapter {
  switch (productType) {
    case 'seat':
      return new SeatProductAdapter();
    case 'capacity':
      return new CapacityProductAdapter();
    case 'open':
      return new OpenProductAdapter();
    case 'equipment':
      return new EquipmentProductAdapter();
    case 'package':
      return new PackageProductAdapter();
    case 'timeslot':
      return new TimeslotProductAdapter();
    default:
      throw new Error(`Unknown product type: ${productType}`);
  }
}

// Helper function to validate a booking using the appropriate adapter
export function validateBooking(product: Product, bookingData: any): boolean {
  const adapter = getProductAdapter(product.product_type);
  return adapter.validateBooking(product, bookingData);
}

// Helper function to calculate price using the appropriate adapter
export function calculateProductPrice(product: Product, quantity: number, bookingData?: any): number {
  const adapter = getProductAdapter(product.product_type);
  return adapter.calculatePrice(product, quantity, bookingData);
}

// Helper function to get booking requirements
export function getProductBookingRequirements(product: Product): BookingRequirement[] {
  const adapter = getProductAdapter(product.product_type);
  return adapter.getBookingRequirements(product);
} 