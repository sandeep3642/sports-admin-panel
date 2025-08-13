import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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

}
