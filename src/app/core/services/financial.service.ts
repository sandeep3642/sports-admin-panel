import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class FinancialService {
  private baseUrl = environment.adminApiBaseUrl;

  constructor(private http: HttpClient) {}

  getGrants(payload: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/grant/getGrantLists`, payload);
  }

  getStats(payload: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/grant/getGrantAnalytics`, payload);
  }

  getDetails(payload: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/grant/getDetails`, payload);
  }

  updateProfileStatus(payload: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/grant/changeGrantStatus`, payload, {
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
