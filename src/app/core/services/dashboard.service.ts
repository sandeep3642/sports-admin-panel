import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private baseUrl = environment.adminApiBaseUrl;

  constructor(private http: HttpClient) {}

  // Get dashboard KPIs
  getDashboardKPIs(): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/dashboard/kpis`, {});
  }

  // Get dashboard analytics (if needed for charts)
  getDashboardAnalytics(payload: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/dashboard/analytics`, payload);
  }

  // Get user registration chart data
  getUserRegistrationChart(district: string, timePeriod: string): Observable<any> {
    const payload = {
      district: district,
      time_period: timePeriod
    };
    return this.http.post<any>(`${this.baseUrl}/dashboard/userRegistrationChart`, payload);
  }

  // Get active/inactive users chart data
  getActiveInactiveUsersChart(statusFilter: string, timePeriod: string): Observable<any> {
    const payload = {
      status_filter: statusFilter,
      time_period: timePeriod
    };
    return this.http.post<any>(`${this.baseUrl}/dashboard/activeInactiveUsersChart`, payload);
  }

  // Get athlete distribution chart data
  getAthleteDistribution(payload: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/dashboard/athleteDistribution`, payload);
  }

  // Get total players by district data
  getTotalPlayersByDistrict(payload: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/dashboard/totalPlayersByDistrict`, payload);
  }

  // Get financial aid applications chart data
  getFinancialAidApplications(payload: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/dashboard/financialAidApplications`, payload);
  }

  // Get venue data by district and time period
  getVenuesByDistrict(payload: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/dashboard/getTotalVenuesForMap`, payload);
  }
}
