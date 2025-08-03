import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private baseUrl = 'https://itop-admin.servebeer.com/api';

  constructor(private http: HttpClient) { }

  // Get user list with pagination and search
  getUserList(payload: {
    page: number;
    limit: number;
    search: string;
  }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/user/list`, payload, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem("authToken")}`
      },
    });
  }

  // Add new user
  addUser(payload: {
    full_name: string;
    user_name: string;
    email: string;
    password: string;
    role_id: number;
    status: string;
  }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/user/addUser`, payload, {
      headers: {
        'Content-Type': 'application/json'
      },
    });
  }

  // Update existing user
  updateUser(userId: number, payload: any): Observable<any> {
    // Use the correct endpoint from your curl example
    return this.http.post<any>(`${this.baseUrl}/user/updateUser`, payload, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem("authToken")}`
      },
    });
  }
  // Delete user
  deleteUser(userId: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/user/deleteUser/${userId}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem("authToken")}`
      },
    });
  }

  // Get user analytics
  getUserAnalytics(payload: {
    donut_filter: {
      status: string;
      time_period: string;
    };
    pie_chart_filter: {
      district: string;
      time_period: string;
    };
  }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/user/analytics`, payload, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem("authToken")}`
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
    roles_ddl: boolean,
  }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/admin/dropdown/list`, payload, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem("authToken")}`
      },
    });
  }
}