import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StackholderService {
  private baseUrl = 'https://itop-admin.servebeer.com/api/admin';

  constructor(private http: HttpClient) { }


  getListing(payload): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/customer/list`, payload, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("authToken")}`
      },
    });

  }

  getDetails(payload): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/customer/getDetails`, payload, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("authToken")}`
      },

    });

  }

  getCounts(): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/customer/analytics`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("authToken")}`
      },

    });
  }

  getAthletes(payload: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/customer/getTotalUsersByDistrict`, payload);
  }

  exportCustomers(payload: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/customer/exportCustomers`, payload, { responseType: 'blob' as 'json' });
  }

  updateProfileStatus(payload: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/customer/updateProfileStatus`, payload);
  }

}
