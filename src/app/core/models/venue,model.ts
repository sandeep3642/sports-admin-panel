export interface Address {
    area: string;
    city: string;
    full: string;
    line1: string;
    state: string;
    pincode: string;
  }
  
  export interface ContactPerson {
    name: string;
    phone: string;
    email?: string;
    alt_phone?: string;
  }
  
  export interface VenueImage {
    id: number;
    url: string;
    name: string;
  }
  
  export interface VenueStatusItem {
    key: string;
    date: string;
    label: string;
    is_active: boolean;
    description: string;
  }
  
  export interface VenueStatus {
    created: VenueStatusItem;
    rejected?: VenueStatusItem;
    approved?: VenueStatusItem;
  }
  
  export interface BaseVenue {
    id: number;
    user_id: number | null;
    customer_id: number | null;
    name: string;
    descriptions: string;
    district?: string | null;
    address: Address;
    capacity: number;
    food_court?: boolean | null;
    contact_person: ContactPerson;
    sport_type: string[];
    available_services: string[];
    is_approved: boolean;
    is_rejected: boolean;
    venue_status: VenueStatus | any;
    rating: number;
    created_at: string;
    updated_at: string;
  }
  