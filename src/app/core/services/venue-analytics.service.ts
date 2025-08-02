import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface VenueData {
  venueName: string;
  venueDescription?: string;
  contactPersonName: {
    // ✅ अब ये object है (name & phone के साथ)
    name: string;
    phone: string;
  };
  phoneNumber?: string; // (optional रखा है क्योंकि ऊपर वाला object है)
  streetAddress?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  openTime?: string;
  closeTime?: string;
  venueCapacity?: number;
  latitude?: number;
  longitude?: number;
  sportCategories: string[];
  availableServices: string[];
  images: { name: string; url: string }[];
  location?: {
    lat: number;
    lng: number;
    address: string;
  };
  address?: {
    line1: string;
    area: string;
    city: string;
    state: string;
    pincode: string;
    full: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class VenueAnalyticsService {
  private baseUrl = 'https://itop-admin.servebeer.com/api/admin';

  constructor(private http: HttpClient) {}

  /** 📊 Venue Analytics */
  getVenueAnalytics(filters: any): Observable<any> {
    const url = `${this.baseUrl}/venue/analytics`;
    return this.http.post<any>(url, filters, {
      headers: {
        Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiZW1haWwiOiJKb25kb2VAdGVzdC5jb20iLCJpYXQiOjE3NTQwMzE0MTcsImV4cCI6MTc1NDYzNjIxN30.2TN4cUgBnz3qWJascxWKDwEPNhNVlgNtESondTADil4`, // ✅ token env से manage कर
      },
    });
  }

  /** 🏟 Create Venue API */
  createVenue(venueData: VenueData): Observable<any> {
    console.log('✅ venueData (from component):', venueData);

    // 🚀 अब payload को component जैसा ही use करेंगे
    const payload = {
      name: venueData.venueName,
      descriptions: venueData.venueDescription,
      address: venueData.address, // ✅ Direct component से लिया
      capacity: venueData.venueCapacity,
      food_court: true, // फिलहाल true रख सकते हैं
      open_status: {
        is_open: true,
        open_time: venueData.openTime,
        close_time: venueData.closeTime,
      },
      location: venueData.location,
      contact_person: venueData.contactPersonName, // ✅ Direct लिया (name & phone)
      sport_type: venueData.sportCategories,
      available_services: venueData.availableServices,
      images: venueData.images.map((img, i) => ({
        id: i + 1,
        name: img.name,
        url: img.url,
      })),
    };

    console.log('📤 Final Payload:', payload);
    return this.http.post(`${this.baseUrl}/venue/create`, payload, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`, // ✅ token env से manage कर
      },
    });
  }

  /** 📤 Bulk Image Upload */
  bulkUploadImages(images: File[]): Observable<any> {
    const formData = new FormData();
    images.forEach((file) => {
      formData.append('files', file);
    });

    formData.append('category', 'grant');
    formData.append('title', 'abc-title');

    return this.http.post('https://itop-admin.servebeer.com/api/admin/file/bulkUploadFiles', formData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`, // ✅ token env से manage कर
      },
    });
  }

  getVenues(filters: any): Observable<any> {
    const url = `${this.baseUrl}/venue/getAll`;
    return this.http.post<any>(url, filters, {
      headers: {
        Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiZW1haWwiOiJKb25kb2VAdGVzdC5jb20iLCJpYXQiOjE3NTQwMzE0MTcsImV4cCI6MTc1NDYzNjIxN30.2TN4cUgBnz3qWJascxWKDwEPNhNVlgNtESondTADil4`, // ✅ token env से manage कर
      },
    });
  }
}
