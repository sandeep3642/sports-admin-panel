import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StackholderService {
  private baseUrl = 'http://159.65.154.66:3000/api/admin';

  constructor(private http: HttpClient) { }


  getListing(payload): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/customer/list`,payload);

  }

  getDetails(payload): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/customer/getDetails`,payload);

  }

  getCounts(): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/customer/analytics`,{});
  }

  getAthletes(payload: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/customer/getTotalUsersByDistrict`,payload);
  }

  exportCustomers(payload: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/customer/exportCustomers`, payload, { responseType: 'blob' as 'json' });
  }

  updateProfileStatus(payload: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/customer/updateProfileStatus`, payload);
  }

}
