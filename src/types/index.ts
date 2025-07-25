// Legacy/existing types (keep for backward compatibility)
export interface Trip {
  id: string;
  name: string;
  slug: string;
  origin_id: string;
  destination_id: string;
  departure_time: string;
  arrival_time: string;
  duration_minutes: number;
  price_adult: number;
  price_student: number;
  price_child: number;
  available_seats: number;
  total_seats: number;
  description?: string;
  image_url?: string;
  rating?: number;
  rating_count?: number;
  created_at: string;
  updated_at: string;
}

export interface Location {
  id: string;
  name: string;
  slug: string;
  city: string;
  province: string;
  latitude: number;
  longitude: number;
  address?: string;
  created_at: string;
}

export interface SearchParams {
  destinationId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface PassengerCounts {
  adults: number;
  students: number;
  children: number;
}

// Search filters interface matching what the search page expects
export interface SearchFilters {
  origin?: string;
  destination?: string;
  priceMin?: number;
  priceMax?: number;
  dateFrom?: string;
  dateTo?: string;
  availableSeats?: number;
  sortBy: 'price_low' | 'price_high' | 'departure_time' | 'popularity';
}

export interface SearchContextType extends SearchParams {
  setDestinationId: (id: string) => void;
  setDateFrom: (date: string | undefined) => void;
  setDateTo: (date: string | undefined) => void;
  setDateRange: (dateFrom: string | undefined, dateTo: string | undefined) => void;
  reset: () => void;
}

export interface BookingStep {
  id: 'search' | 'results' | 'passengers' | 'review' | 'success';
  title: string;
  completed: boolean;
}

// API Response types
export interface SearchTripResult {
  outbound_trips: Trip[];
  inbound_trips?: Trip[];
  total_count: number;
}

export interface TripWithLocation extends Trip {
  origin: Location;
  destination: Location;
}

// ===== MULTI-TENANT TYPES =====

export interface Tenant {
  id: string;
  slug: string;
  name: string;
  domain?: string;
  domain_verified?: boolean;
  domain_verified_at?: string;
  branding: BrandingConfig;
  settings: TenantSettings;
  subscription_plan: 'starter' | 'professional' | 'enterprise';
  subscription_status: 'active' | 'trial' | 'suspended' | 'cancelled';
  trial_ends_at?: string;
  created_at: string;
  updated_at: string;
}

export interface BrandingConfig {
  primary_color?: string;      // Main buttons, links, key interactions
  accent_color?: string;       // Secondary buttons, highlights
  background_color?: string;   // Page/card backgrounds  
  foreground_color?: string;   // Text color, dark elements
  secondary_color?: string;    // Legacy support
  logo_url?: string;
  favicon_url?: string;
  font_family?: string;
  custom_font_url?: string;    // URL to uploaded custom font file
  custom_font_name?: string;   // Original filename of uploaded font
  custom_font_family?: string; // Generated CSS font-family name
  custom_css?: string;
  // Font weight preferences for headings
  heading_font_weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  prefer_light_headings?: boolean; // Legacy boolean support
}

export interface TenantSettings {
  timezone?: string;
  currency?: string;
  email_from?: string;
  booking_confirmation_email?: boolean;
  require_passenger_details?: boolean;
  allow_group_bookings?: boolean;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price_monthly: number;
  max_bookings_per_month?: number;
  transaction_fee_percent: number;
  features: {
    custom_domain?: boolean;
    advanced_branding?: boolean;
    api_access?: boolean;
    dedicated_support?: boolean;
  };
}

export type UserRole = 'super_admin' | 'tenant_admin' | 'tenant_staff' | 'customer';

export interface User {
  id: string;
  tenant_id?: string;
  email: string;
  role: UserRole;
  first_name?: string;
  last_name?: string;
  phone?: string;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
}

// Multi-tenant trip type (different from legacy Trip)
export interface TenantTrip {
  id: string;
  tenant_id: string;
  title: string;
  description?: string;
  location?: string;
  destination: string;
  departure_location: string;
  departure_time: string;
  return_time?: string;
  price_adult: number;
  price_child?: number;
  max_passengers: number;
  available_seats: number;
  image_url?: string;
  highlights?: string[];
  included_items?: string[];
  // Geographic coordinates for map display
  destination_lat?: number;
  destination_lng?: number;
  departure_lat?: number;
  departure_lng?: number;
  status: 'active' | 'inactive' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  tenant_id: string;
  trip_id: string;
  user_id?: string;
  booking_reference: string;
  passenger_count_adult: number;
  passenger_count_child: number;
  passenger_details: PassengerDetail[];
  total_amount: number;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_intent_id?: string;
  status: 'confirmed' | 'cancelled' | 'completed';
  special_requests?: string;
  created_at: string;
  updated_at: string;
}

export interface PassengerDetail {
  type: 'adult' | 'child';
  first_name: string;
  last_name: string;
  age?: number;
  dietary_requirements?: string;
  emergency_contact?: string;
}

// Context types
export interface TenantContextType {
  tenant: Tenant | null;
  isLoading: boolean;
  error?: string;
  switchTenant?: (tenantId: string) => Promise<void>;
  refreshTenant?: () => Promise<void>;
}

// API response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// Booking flow types (use TenantTrip for multi-tenant)
export interface BookingState {
  tripId: string;
  trip?: TenantTrip;
  passengerCountAdult: number;
  passengerCountChild: number;
  passengerDetails: PassengerDetail[];
  specialRequests?: string;
  totalAmount: number;
  currentStep: number;
}

// Search and filter types for multi-tenant trips
export interface TenantTripFilters {
  destination?: string;
  departure_date?: string;
  return_date?: string;
  passenger_count?: number;
  price_min?: number;
  price_max?: number;
}

// URL search params for booking flow
export interface BookingSearchParams {
  destination?: string;
  date?: string;
  passengers?: string;
  tripId?: string;
}

// Re-export calendar types
export type {
  DateRange,
  CalendarDate,
  CalendarTheme,
  CalendarConfig,
  CalendarNavigation,
  DateRangeSelectionState
} from './calendar';

// ===== ROUTE CLASSIFICATION TYPES =====

export type RouteType = 'customer' | 'admin' | 'platform';

export interface RouteClassification {
  type: RouteType;
  requiresAuth: boolean;
  tenantDetectionMethod: 'domain' | 'auth' | 'none';
}

export type TenantDetectionMethod = 'domain' | 'auth';

export interface TenantDetectionConfig {
  method: TenantDetectionMethod;
  fallback?: TenantDetectionMethod;
}

// Enhanced TenantContextType with detection method info
export interface EnhancedTenantContextType extends TenantContextType {
  detectionMethod?: TenantDetectionMethod;
  routeType?: RouteType;
}

// Route classification helper types
export interface RouteClassificationHelpers {
  isCustomerRoute: (pathname: string) => boolean;
  isAdminRoute: (pathname: string) => boolean;
  isPlatformRoute: (pathname: string) => boolean;
  getRouteClassification: (pathname: string) => RouteClassification;
  getTenantDetectionMethod: (pathname: string) => TenantDetectionMethod;
} 