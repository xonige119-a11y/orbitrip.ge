
export enum Language {
  EN = 'EN',
  RU = 'RU'
}

export type VehicleType = 'Sedan' | 'Minivan' | 'SUV' | 'Bus';

export interface TripSearch {
  stops: string[]; // Array of locations: [Start, Stop1, Stop2, End]
  date: string;
  totalDistance: number; // in km (simulated)
}

export interface Review {
  author: string;
  rating: number;
  textEn: string;
  textRu: string;
  date: string;
}

export interface DriverDocument {
  type: 'LICENSE' | 'TECH_PASSPORT' | 'POLICE_CLEARANCE';
  url: string;
  uploadedAt: number;
}

export interface Driver {
  id: string;
  email: string; 
  password?: string;
  name: string;
  city: string; // Driver's Residence City ID
  photoUrl: string;
  carModel: string;
  carPhotoUrl: string; // Main thumbnail
  carPhotos?: string[]; // Gallery photos
  documents?: DriverDocument[]; // Secure documents (JSONB in SQL)
  vehicleType: VehicleType;
  maxPassengers?: number; 
  languages: string[]; 
  rating: number;
  reviewCount: number;
  reviews: Review[]; // JSONB in SQL
  pricePerKm: number;
  basePrice: number;
  features: string[];
  phoneNumber?: string; 
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING'; 
  blockedDates: string[]; // Synchronization for availability
  debt?: number; // Financial debt or penalty for the driver (GEL)
}

export interface PriceOption {
  vehicle: VehicleType;
  price: string;
  guests: string;
}

export interface Tour {
  id: string;
  titleEn: string;
  titleRu: string;
  descriptionEn: string;
  descriptionRu: string;
  price: string; 
  // Smart Pricing Fields
  basePrice?: number; 
  extraPersonFee?: number; 
  pricePerPerson: number; 
  priceOptions: PriceOption[];
  // Media
  duration: string;
  image: string;
  category?: string; // 'CULTURE', 'NATURE', 'WINE', 'SEA', 'MOUNTAINS'
  rating?: number;
  reviews?: any[];
  // Detail Fields
  highlightsEn?: string[];
  highlightsRu?: string[];
  itineraryEn?: string[];
  itineraryRu?: string[];
  routeStops?: string[]; // For Map Visualization
}

export interface Booking {
  id: string;
  tourId: string;
  tourTitle: string;
  customerName: string;
  contactInfo: string;
  date: string;
  vehicle: string;
  guests: number;
  driverId?: string; // Assigned Driver ID
  driverName?: string;
  totalPrice: string; // Display String "150 GEL"
  numericPrice: number; // For analytics
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  createdAt: number;
  commission?: number; // Calculated commission
  promoCode?: string;
  flightNumber?: string;
  paymentMethod?: 'CASH' | 'CARD';
}

export interface SystemSettings {
  id: string;
  // Communication
  smsApiKey: string;
  smsEnabled: boolean;
  adminPhoneNumber: string;
  
  // Finance
  commissionRate: number;
  minTripPrice?: number; // NEW: Minimum price floor
  
  // Email Integration
  emailServiceId: string;
  emailTemplateId: string;
  emailPublicKey: string;
  
  // Branding & Appearance
  backgroundImageUrl?: string; 
  siteTitle?: string; // NEW: SEO Title
  siteDescription?: string; // NEW: Meta Description
  
  // Social Media (NEW)
  socialFacebook?: string;
  socialInstagram?: string;
  
  // System Control (NEW)
  maintenanceMode?: boolean; // Stops new bookings

  // Core Infrastructure (Local Overrides)
  supabaseUrl?: string;
  supabaseKey?: string;
  geminiApiKey?: string;
}

export interface SmsLog {
  id: string;
  recipient: string;
  content: string;
  status: 'SENT' | 'FAILED' | 'TRYING' | 'SKIPPED';
  type: 'ADMIN_NOTIFY' | 'DRIVER_NOTIFY';
  timestamp: number;
}

export enum ToolType {
  SEARCH = 'SEARCH',
  IMAGE_GEN = 'IMAGE_GEN',
  IMAGE_EDIT = 'IMAGE_EDIT',
  ANALYZE = 'ANALYZE',
  VIDEO_GEN = 'VIDEO_GEN'
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
  groundingMetadata?: any;
}

export interface BlogPost {
  id: string;
  titleEn: string;
  titleRu: string;
  excerptEn: string;
  excerptRu: string;
  image: string;
  date: string;
  category: string;
  authorEn?: string;
  authorRu?: string;
  tags?: string[];
  relatedRoute?: { from: string, to: string };
}

export interface RichRoute {
  stops: RouteStop[];
  totalDistance: number;
  totalDuration: string;
  summary: string;
}

export interface RouteStop {
  name: string;
  coordinates: { lat: number; lng: number };
  type: string;
  description: string;
  driveTimeFromPrev: string;
}

export interface PromoCode {
  id: string;
  code: string;
  discountPercent: number;
  usageLimit: number;
  usageCount: number;
  status: 'ACTIVE' | 'EXPIRED' | 'USED';
  createdAt: string;
}
