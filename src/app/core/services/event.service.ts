import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class EventService {
  private baseUrl = environment.adminApiBaseUrl;

  constructor(private http: HttpClient) {}

  getEventList(payload: any) {
    return this.http.post<any>(`${this.baseUrl}/event/list`,payload);
  }

  getStats(payload) {
    return this.http.post<any>(`${this.baseUrl}/event/analytics`,payload);
  }

  addEvents(payload:any) {
    return this.http.post<any>(`${this.baseUrl}/event/add`,payload);
  }

  upload(payload:any) {
    return this.http.post<any>(`${this.baseUrl}/file/bulkUploadFiles`,payload);
  }

  uploadSingleFile(payload:any) {
    return this.http.post<any>(`${this.baseUrl}/file/upload`,payload);
  }


  dropDowns(payload:any) {
    return this.http.post<any>(`${this.baseUrl}/dropdown/list`,payload);
  }

  getVenue(payload:any) {
    return this.http.post<any>(`${this.baseUrl}/venue/getAll`,payload);
  }

  getDetails(payload:any) {
    return this.http.post<any>(`${this.baseUrl}/event/details`,payload);
  }

  publishEvent(payload:any) {
    return this.http.post<any>(`${this.baseUrl}/event/publish`,payload);
  }

  rejectEvent(payload:any) {
    return this.http.post<any>(`${this.baseUrl}/event/updateStatus`,payload);
  }

  approveEvent(payload:any) {
    return this.http.post<any>(`${this.baseUrl}/event/updateStatus`,payload);
  }

  // Get event donut chart data
  getDonutChart(payload: {
    donut_filter: {
      time_period: string;
    };
  }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/event/donutChart`, payload, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem("authToken")}`
      },
    });
  }

  // Get event pie chart data
  getPieChart(payload: {
    pie_chart_filter: {
      district: string;
      time_period: string;
    };
  }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/event/pieChart`, payload, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem("authToken")}`
      },
    });
  }

  // Get sports achievements data
  getSportsAchievements(payload: {}): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/event/sportsAchievements`, payload, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem("authToken")}`
      },
    });
  }

  // Get map locations data
  getMapLocations(payload: {
    map_filter: {
      district: string;
      sport: string;
      time_period: string;
    };
  }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/event/mapLocations`, payload, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem("authToken")}`
      },
    });
  }

  // Get venue map locations data
  getVenueMapLocations(payload: {
    map_filter: {
      district: string;
      sport_category: string;
    };
  }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/venue/mapLocations`, payload, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem("authToken")}`
      },
    });
  }

}
