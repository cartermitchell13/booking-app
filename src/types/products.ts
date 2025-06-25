// Universal Product System Types

export type ProductType = 'seat' | 'capacity' | 'open' | 'equipment' | 'package' | 'timeslot';
export type ProductStatus = 'active' | 'inactive' | 'archived';
export type ProductCategory = 'tour' | 'rental' | 'activity' | 'transport' | 'experience';

// Base product interface
export interface Product {
  id: string;
  tenant_id: string;
  name: string;
  description?: string;
  product_type: ProductType;
  status: ProductStatus;
  base_price: number; // in cents
  currency: string;
  image_url?: string;
  category: ProductCategory;
  tags?: string[];
  product_data: ProductData;
  availability_data: AvailabilityData;
  booking_rules: BookingRules;
  seo_data?: SEOData;
  created_at: string;
  updated_at: string;
}

export interface ProductInstance {
  id: string;
  tenant_id: string;
  product_id: string;
  start_time: string;
  end_time?: string;
  timezone: string;
  max_quantity?: number;
  available_quantity?: number;
  price_override?: number; // in cents
  instance_data: Record<string, any>;
  status: 'active' | 'cancelled' | 'full';
  created_at: string;
  updated_at: string;
}

// Product Type Specific Data Structures

// Seat-based products (buses, trains, etc.)
export interface SeatProductData {
  vehicle_type: string;
  total_seats: number;
  seat_configuration?: string;
  amenities?: string[];
  pickup_locations?: PickupLocation[];
  route_highlights?: string[];
  vehicle_features?: VehicleFeature[];
}

export interface PickupLocation {
  name: string;
  address: string;
  pickup_time_offset: number; // minutes from main departure
  gps_coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface VehicleFeature {
  name: string;
  description?: string;
  icon?: string;
}

// Capacity-based products (boats, venues, etc.)
export interface CapacityProductData {
  vessel_type?: string;
  venue_type?: string;
  total_capacity: number;
  amenities?: string[];
  departure_location?: Location;
  cruise_highlights?: string[];
  included_services?: string[];
  capacity_breakdown?: CapacityBreakdown[];
}

export interface CapacityBreakdown {
  type: string; // 'adults', 'children', 'tables'
  max_count: number;
  price_modifier?: number;
}

// Open products (walking tours, events, etc.)
export interface OpenProductData {
  tour_type: 'guided' | 'self_guided' | 'audio_guided';
  duration_hours: number;
  difficulty_level: 'easy' | 'moderate' | 'difficult';
  included_items?: string[];
  meeting_point?: Location;
  tour_stops?: TourStop[];
  dietary_accommodations?: string[];
  equipment_provided?: string[];
}

export interface TourStop {
  name: string;
  type: string;
  recommended_time: number; // minutes
  description?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

// Equipment rental products
export interface EquipmentProductData {
  equipment_type: string;
  equipment_specifications: Record<string, any>;
  included_gear?: string[];
  optional_gear?: OptionalGear[];
  pickup_location?: Location;
  recommended_usage?: RecommendedUsage[];
  maintenance_schedule?: string;
}

export interface OptionalGear {
  item: string;
  price: number; // in cents
  description?: string;
}

export interface RecommendedUsage {
  name: string;
  difficulty: string;
  distance?: string;
  description?: string;
}

// Package products (multi-activity bundles)
export interface PackageProductData {
  included_products: PackageComponent[];
  package_type: 'adventure' | 'cultural' | 'wellness' | 'family';
  total_duration_days: number;
  accommodation_included?: boolean;
  meal_plan?: MealPlan;
  transportation_included?: boolean;
}

export interface PackageComponent {
  product_id: string;
  product_name: string;
  day_number: number;
  time_slot?: string;
  optional: boolean;
}

export interface MealPlan {
  breakfast: boolean;
  lunch: boolean;
  dinner: boolean;
  dietary_options: string[];
}

// Timeslot products (workshops, classes, etc.)
export interface TimeslotProductData {
  session_type: 'class' | 'workshop' | 'consultation' | 'appointment';
  duration_minutes: number;
  max_participants: number;
  skill_level_required?: string;
  materials_provided?: string[];
  materials_to_bring?: string[];
  instructor_info?: InstructorInfo;
  location_type: 'indoor' | 'outdoor' | 'virtual';
}

export interface InstructorInfo {
  name: string;
  bio?: string;
  credentials?: string[];
  photo_url?: string;
}

// Unified product data type
export type ProductData = 
  | SeatProductData 
  | CapacityProductData 
  | OpenProductData 
  | EquipmentProductData 
  | PackageProductData 
  | TimeslotProductData 
  | Record<string, any>; // Fallback for custom types

// Availability configuration
export interface AvailabilityData {
  schedule_type: 'recurring' | 'seasonal' | 'daily' | 'custom' | 'on_demand';
  days_of_week?: number[]; // 0=Sunday, 1=Monday, etc.
  start_date?: string;
  end_date?: string;
  blackout_dates?: string[];
  start_times?: string[]; // ['10:00', '14:00']
  advance_booking_days?: number;
  max_advance_booking_days?: number;
  weather_dependent?: boolean;
  minimum_passengers?: number;
  no_reservation_required?: boolean;
  seasonal_availability?: 'year_round' | 'seasonal';
  season_start?: string;
  season_end?: string;
  rental_periods?: RentalPeriod[];
}

export interface RentalPeriod {
  name: string;
  duration_hours: number;
  price_multiplier: number;
}

// Booking rules and policies
export interface BookingRules {
  cancellation_policy: '24_hours' | '48_hours' | '7_days' | 'non_refundable' | 'custom';
  modification_policy?: string;
  weather_policy?: 'rain_or_shine' | 'weather_dependent' | 'full_refund';
  weather_cancellation?: 'full_refund' | 'reschedule' | 'partial_refund';
  group_discount_threshold?: number;
  group_discount_percent?: number;
  child_age_limit?: number;
  senior_age_threshold?: number;
  minimum_age?: number;
  maximum_age?: number;
  age_restrictions?: string;
  guardian_consent_required?: boolean;
  damage_policy?: string;
  security_deposit?: number; // in cents
  late_return_fee?: number; // in cents
  damage_assessment?: string;
  age_requirement?: number;
  alcohol_service_age?: number;
  max_group_size?: number;
}

// Common location interface
export interface Location {
  name: string;
  address: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  gps_coordinates?: {
    latitude: number;
    longitude: number;
  };
  contact_info?: {
    phone?: string;
    email?: string;
  };
}

// SEO and marketing data
export interface SEOData {
  slug?: string;
  meta_title?: string;
  meta_description?: string;
  keywords?: string[];
  og_image?: string;
}

// Product pricing with dynamic rules
export interface ProductPricing {
  base_price: number;
  currency: string;
  price_rules?: PriceRule[];
  seasonal_pricing?: SeasonalPricing[];
  group_pricing?: GroupPricing[];
}

export interface PriceRule {
  id: string;
  name: string;
  type: 'early_bird' | 'last_minute' | 'seasonal' | 'group' | 'loyalty';
  discount_type: 'percent' | 'fixed_amount';
  discount_value: number;
  conditions: Record<string, any>;
  valid_from?: string;
  valid_until?: string;
}

export interface SeasonalPricing {
  season_name: string;
  start_date: string;
  end_date: string;
  price_multiplier: number;
}

export interface GroupPricing {
  min_quantity: number;
  max_quantity?: number;
  discount_percent: number;
}

// Booking and customer interfaces
export interface ProductBooking {
  id: string;
  tenant_id: string;
  product_id: string;
  product_instance_id?: string;
  customer_id: string;
  booking_reference: string;
  quantity: number;
  unit_price: number; // in cents
  total_amount: number; // in cents
  booking_data: BookingData;
  special_requests?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
  payment_status: 'pending' | 'paid' | 'partially_paid' | 'refunded';
  created_at: string;
  updated_at: string;
}

export type BookingData = 
  | SeatBookingData 
  | CapacityBookingData 
  | OpenBookingData 
  | EquipmentBookingData 
  | PackageBookingData 
  | TimeslotBookingData 
  | Record<string, any>;

export interface SeatBookingData {
  selected_seats?: string[];
  pickup_location_id?: string;
  passenger_details: PassengerDetail[];
}

export interface CapacityBookingData {
  passenger_count: number;
  passenger_details?: PassengerDetail[];
  special_dietary_requests?: string[];
}

export interface OpenBookingData {
  participant_count: number;
  participant_details?: PassengerDetail[];
  dietary_restrictions?: string[];
  mobility_requirements?: string[];
}

export interface EquipmentBookingData {
  rental_period: string;
  equipment_size?: string;
  optional_gear_selected?: string[];
  pickup_time: string;
  return_time: string;
  security_deposit_paid?: number;
}

export interface PackageBookingData {
  package_components: SelectedPackageComponent[];
  accommodation_preferences?: string;
  meal_preferences?: string[];
  special_occasions?: string;
}

export interface SelectedPackageComponent {
  component_id: string;
  selected_date?: string;
  selected_time?: string;
  participant_count: number;
}

export interface TimeslotBookingData {
  session_date: string;
  session_time: string;
  participant_count: number;
  skill_level?: string;
  special_requirements?: string[];
}

export interface PassengerDetail {
  first_name: string;
  last_name: string;
  age?: number;
  date_of_birth?: string;
  email?: string;
  phone?: string;
  emergency_contact?: EmergencyContact;
  dietary_restrictions?: string[];
  mobility_requirements?: string[];
  special_requests?: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

// Product adapter interface for handling different product types
export interface ProductAdapter {
  validateBooking(product: Product, bookingData: any): boolean;
  calculatePrice(product: Product, quantity: number, bookingData?: any): number;
  checkAvailability(product: Product, date: string, quantity: number): Promise<boolean>;
  processBooking(product: Product, bookingData: any): Promise<ProductBooking>;
  getBookingRequirements(product: Product): BookingRequirement[];
}

export interface BookingRequirement {
  field: string;
  type: 'text' | 'number' | 'date' | 'select' | 'multiselect' | 'boolean';
  required: boolean;
  label: string;
  options?: string[];
  validation?: string;
  description?: string;
} 