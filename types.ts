
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
  vehicleType: VehicleType;
  maxPassengers?: number; // NEW: Custom capacity set by driver
  languages: string[]; 
  rating: number;
  reviewCount: number;
  reviews: Review[]; 
  pricePerKm: number;
  basePrice: number;
  features: string[];
  phoneNumber?: string; 
  status: 'ACTIVE' | 'INACTIVE';
  blockedDates: string[]; // Synchronization for availability
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
  basePrice?: number; // Cost for Car + Driver
  extraPersonFee?: number; // Cost per passenger
  // End Smart Pricing
  pricePerPerson: number; 
  priceOptions: PriceOption[]; 
  duration: string;
  image: string;
  rating: number;
  category: string; 
  reviews: Review[];
  highlightsEn: string[];
  highlightsRu: string[];
  itineraryEn?: string[];
  itineraryRu?: string[];
  routeStops?: string[]; 
}

export interface Booking {
  id: string;
  tourId: string;
  tourTitle: string;
  customerName: string;
  contactInfo: string;
  date: string;
  guests: number;
  vehicle: VehicleType;
  driverName?: string;
  driverId?: string;
  totalPrice: string;
  numericPrice: number; 
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  createdAt: number;
  commission: number; 
}

export interface Transaction {
  id: string;
  date: string;
  type: 'COMMISSION' | 'DEPOSIT' | 'WITHDRAWAL' | 'PENALTY';
  amount: number;
  description: string;
  bookingId?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
}

export enum ToolType {
  NONE = 'NONE',
  IMAGE_GEN = 'IMAGE_GEN',
  IMAGE_EDIT = 'IMAGE_EDIT',
  VIDEO_GEN = 'VIDEO_GEN',
  SEARCH = 'SEARCH',
  ANALYZE = 'ANALYZE'
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
  relatedRoute?: {
      from: string;
      to: string;
  };
}

export interface SystemSettings {
  id: string;
  smsApiKey: string;
  adminPhoneNumber: string;
  commissionRate: number;
}

export interface SmsLog {
  id: string;
  recipient: string;
  content: string;
  status: 'SENT' | 'FAILED' | 'TRYING';
  timestamp: number;
  type: 'ADMIN_NOTIFY' | 'DRIVER_NOTIFY';
}