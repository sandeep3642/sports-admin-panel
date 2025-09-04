import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EnrollService {
  private baseUrl = environment.adminApiBaseUrl;

  constructor(private http: HttpClient) { }

  // Get all enrollments for coach allocation
  getAllEnroll(payload: {
    page: number;
    limit: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    search?: string;
    filters?: any;
  }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/enroll/getAllEnroll`, payload, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('authToken')}`
      },
    });
  }

  // Get enrollment statistics/analytics
  getEnrollStats(): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/enroll/getCoachAnalytics`, {}, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('authToken')}`
      },
    });
  }

  // Allocate coach to an enrollment
  allocateCoach(payload: {
    enroll_id: number;
    coach_id: number;
    sport: string;
    date: string;
    remarks: string;
  }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/enroll/assignCoach`, payload, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('authToken')}`
      },
    });
  }

  // Remove coach allocation
  removeAllocation(payload: {
    enrollment_id: number;
    reason?: string;
  }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/enroll/removeAllocation`, payload, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('authToken')}`
      },
    });
  }

  // Get enrollment details
  getEnrollmentDetails(enrollmentId: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/enroll/getEnrollDetails`, { enroll_id: enrollmentId }, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('authToken')}`
      },
    });
  }

  // Reject coach enrollment
  rejectCoachEnrollment(payload: {
    enroll_id: number;
    reason: string;
  }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/enroll/rejectCoachEnrollment`, payload, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('authToken')}`
      },
    });
  }

  getDetails(payload: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/enroll/getEnrollDetails`, payload);
  }

} 