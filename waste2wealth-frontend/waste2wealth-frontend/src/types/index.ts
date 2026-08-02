export type UserRole = 'admin' | 'generator' | 'buyer';

export interface User {
  _id: string;
  companyName: string;
  email: string;
  gstNumber?: string;
  industryType: string;
  address?: string;
  state?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  role: UserRole;
  phone?: string;
  avatar?: string;
  isEmailVerified: boolean;
  rating: number;
  ratingCount: number;
  createdAt: string;
}

export type WasteCategory =
  | 'Metal' | 'Plastic' | 'Paper' | 'Textile' | 'Chemical' | 'Wood'
  | 'Glass' | 'Rubber' | 'E-Waste' | 'Organic' | 'Construction' | 'Other';

export type Unit = 'kg' | 'ton' | 'litre' | 'piece' | 'cubic_meter';

export interface WasteListing {
  _id: string;
  user: User | string;
  wasteName: string;
  category: WasteCategory;
  materialType: string;
  description: string;
  quantity: number;
  unit: Unit;
  qualityGrade: 'A' | 'B' | 'C' | 'Unrated';
  moisturePercentage: number;
  hazardous: boolean;
  images: string[];
  price: number;
  negotiable: boolean;
  availability: boolean;
  pickupLocation?: {
    address?: string;
    city?: string;
    state?: string;
    location?: { coordinates: [number, number] };
  };
  status: 'pending_review' | 'active' | 'sold' | 'inactive' | 'rejected';
  aiClassification?: {
    predictedCategory?: string;
    recyclability?: string;
    hazardLevel?: string;
    confidence?: number;
  };
  aiPricePrediction?: {
    suggestedPrice?: number;
    priceRangeLow?: number;
    priceRangeHigh?: number;
    reasoning?: string;
  };
  carbonImpact?: {
    co2SavedKg?: number;
    treesEquivalent?: number;
    landfillReductionKg?: number;
    energySavedKwh?: number;
  };
  views: number;
  createdAt: string;
}

export interface Transaction {
  _id: string;
  waste: WasteListing | string;
  seller: User | string;
  buyer: User | string;
  quantity: number;
  unit: Unit;
  pricePerUnit: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'in_transit' | 'delivered' | 'completed' | 'cancelled' | 'disputed';
  paymentStatus: 'unpaid' | 'paid' | 'refunded';
  createdAt: string;
}

export interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface Message {
  _id: string;
  conversationId: string;
  sender: string;
  receiver: string;
  text: string;
  isRead: boolean;
  createdAt: string;
}

export interface BuyerRecommendation {
  buyer: { _id: string; companyName: string; industryType: string; city?: string; state?: string; rating: number };
  distanceKm: number | null;
  matchScore: number;
  aiExplanation: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  results: number;
  total: number;
  page: number;
  totalPages: number;
  data: { waste?: T[]; users?: T[] };
}
