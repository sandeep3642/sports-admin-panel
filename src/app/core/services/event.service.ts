import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class EventService {
  private baseUrl = 'http://159.65.154.66:3000/api/admin';

  constructor(private http: HttpClient) {}

  getEventList(payload: any) {
    return this.http.post<any>(`${this.baseUrl}/event/list`,payload);
  }

  getStats() {
    return this.http.post<any>(`${this.baseUrl}/event/analytics`,{});
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
}
