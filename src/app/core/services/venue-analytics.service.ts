import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface VenueData {
  id?: string;
  venueName: string;
  venueDescription?: string;
  contactPersonName: {
    // ✅ अब ये object है (name & phone के साथ)
    name: string;
    phone: string;
  };
  phoneNumber?: string; // (optional रखा है क्योंकि ऊपर वाला object है)
  venueCapacity?: number;
  open_status: {
    is_open: boolean;
    open_time: string | null;
    close_time: string | null;
  };
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
    district: string;
  };
  alt_phone?: string;
  email?: string;
}

@Injectable({
  providedIn: 'root',
})
export class VenueAnalyticsService {
  private baseUrl = environment.adminApiBaseUrl;

  constructor(private http: HttpClient) {}

  /** 📊 Venue Analytics */
  getVenueAnalytics(filters: any): Observable<any> {
    const url = `${this.baseUrl}/venue/analytics`;
    return this.http.post<any>(url, filters, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
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
        is_open: venueData.open_status.is_open,
        open_time: venueData.open_status.open_time,
        close_time: venueData.open_status.close_time,
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
      alt_phone: venueData.alt_phone,
      email: venueData.email,
    };

    return this.http.post(`${this.baseUrl}/venue/create`, payload, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
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

    return this.http.post(`${this.baseUrl}/file/bulkUploadFiles`, formData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      },
    });
  }

  getVenues(filters: any): Observable<any> {
    const url = `${this.baseUrl}/venue/getAll`;
    return this.http.post<any>(url, filters, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      },
    });
  }

  getVenueById(id: number): Observable<any> {
    const url = `${this.baseUrl}/venue/getDetails`;
    return this.http.post<any>(
      url,
      {
        venue_id: id,
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
      },
    );
  }
  // Get dropdown lists for admin
  getDropdownLists(payload: {
    districts?: boolean;
    sports?: boolean;
    qualifications?: boolean;
    levels?: boolean;
    certificates?: boolean;
    available_services?: boolean;
    guardian_types?: boolean;
    grant_purpose?: boolean;
    training_frequency?: boolean;
    role_management?: boolean;
    admin_months_filter?: boolean;
    delete_account_reasons?: boolean;
    event_type?: boolean;
    event_template_id?: boolean;
    role_management_options?: boolean;
  }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/dropdown/list`, payload, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      },
    });
  }

  updateVenue(venueData: VenueData): Observable<any> {
    console.log('venueData', venueData);
    const payload = {
      venue_id: venueData.id,
      name: venueData.venueName,
      descriptions: venueData.venueDescription,
      address: venueData.address, // ✅ Direct component से लिया
      capacity: venueData.venueCapacity,
      food_court: true, // फिलहाल true रख सकते हैं

      open_status: {
        is_open: venueData.open_status.is_open,
        open_time: venueData.open_status.open_time,
        close_time: venueData.open_status.close_time,
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
      alt_phone: venueData.alt_phone,
      email: venueData.email,
    };

    console.log('payload', payload);

    return this.http.post(`${this.baseUrl}/venue/update`, payload, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      },
    });
  }

  updateStatus(payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/venue/updateStatus`, payload, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      },
    });
  }

  donwloadReport(payload: any): Observable<any> {
    // venue/download
    return this.http.post(`${this.baseUrl}/venue/download`, payload, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      },
      responseType: 'blob',
    });
  }
}
