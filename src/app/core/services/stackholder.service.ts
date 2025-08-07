import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StackholderService {
  private baseUrl = 'https://itop-admin.servebeer.com/api/admin';

  constructor(private http: HttpClient) {}

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

  getListing(payload): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/customer/list`, payload, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      },
    });
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
    roles_ddl: boolean;
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
