import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class StackholderService {
  private baseUrl = environment.adminApiBaseUrl;

  constructor(private http: HttpClient) { }

  getStakeAnalytics(payload: {
    donut_filter: {
      status: string;
      time_period: string;
    };
    pie_chart_filter: {
      district: string;
      time_period: string;
    };
  }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/customer/analytics`, payload, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      },
    });
  }

  // Updated getListing method to handle proper filter structure
  getListing(payload: {
    page: number;
    limit: number;
    sort_by?: string;
    sort_order?: 'ASC' | 'DESC';
    filters: {
      search?: string;
      customer_type?: string ; // Can be single value or array
      sport_type?: string[];
      level?: string[];
      district?: string | string[]; // Can be single value or array  
      profile_status_key?: string | string[];
      experience_year?: {
        min: number | null;
        max: number | null;
      };
      age_group?: string[];
    };
  }): Observable<any> {
    // Clean up the payload to match API expectations
    const cleanedPayload = {
      page: payload.page,
      limit: payload.limit,
      ...(payload.sort_by && { sort_by: payload.sort_by }),
      ...(payload.sort_order && { sort_order: payload.sort_order }),
      filters: this.cleanFilters(payload.filters)
    };

    return this.http.post<any>(`${this.baseUrl}/customer/list`, cleanedPayload, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      },
    });
  }

  // Helper method to clean filters
  private cleanFilters(filters: any): any {
    const cleanedFilters: any = {};

    // Only add filters that have values
    if (filters.search?.trim()) {
      cleanedFilters.search = filters.search.trim();
    }

    if (filters.customer_type) {
      // Handle both array and single value
      if (Array.isArray(filters.customer_type) && filters.customer_type.length > 0) {
        cleanedFilters.customer_type = filters.customer_type;
      } else if (typeof filters.customer_type === 'string') {
        cleanedFilters.customer_type = filters.customer_type;
      }
    }

    if (filters.sport_type && Array.isArray(filters.sport_type) && filters.sport_type.length > 0) {
      cleanedFilters.sport_type = filters.sport_type;
    }

    if (filters.level && Array.isArray(filters.level) && filters.level.length > 0) {
      cleanedFilters.level = filters.level;
    }

    if (filters.district) {
      if (Array.isArray(filters.district) && filters.district.length > 0) {
        cleanedFilters.district = filters.district;
      } else if (typeof filters.district === 'string') {
        cleanedFilters.district = filters.district;
      }
    }

    if (filters.profile_status_key) {
      if (Array.isArray(filters.profile_status_key) && filters.profile_status_key.length > 0) {
        cleanedFilters.profile_status_key = filters.profile_status_key;
      } else if (typeof filters.profile_status_key === 'string') {
        cleanedFilters.profile_status_key = filters.profile_status_key;
      }
    }

    if (filters.age_group && Array.isArray(filters.age_group) && filters.age_group.length > 0) {
      cleanedFilters.age_group = filters.age_group;
    }

    if (filters.experience_year) {
      const { min, max } = filters.experience_year;
      if (min !== null || max !== null) {
        cleanedFilters.experience_year = {
          ...(min !== null && { min }),
          ...(max !== null && { max })
        };
      }
    }

    return cleanedFilters;
  }

  getDetails(payload): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/customer/getDetails`, payload, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      },
    });
  }

  getCounts(): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/customer/analytics`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      },
    });
  }

  getAthletes(payload: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/customer/getTotalUsersByDistrict`, payload, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      },
    });
  }

  exportCustomers(payload: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/customer/exportCustomers`, payload, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      },
      responseType: 'blob' as 'json',
    });
  }

  updateProfileStatus(payload: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/customer/updateProfileStatus`, payload, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      },
    });
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
    roles_ddl?: boolean;
    age_group?: boolean;
  }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/dropdown/list`, payload, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      },
    });
  }

  approveRejectDocument(payload: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/document/updateStatus`, payload, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      },
    });
  }
}
