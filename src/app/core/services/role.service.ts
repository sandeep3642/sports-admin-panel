import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private baseUrl = 'http://159.65.154.66:3000/api/admin';

  constructor(private http: HttpClient) {}


  getRoleList(payload: any) {
    return this.http.post<any>(`${this.baseUrl}/role/getAllRoles`,payload);
  }

  getStats() {
    return this.http.post<any>(`${this.baseUrl}/event/analytics`,{});
  }

  createRole(payload:any){
    return this.http.post(`${this.baseUrl}/role/create`,payload);
  }

  getCounts(){
    return this.http.post<any>(`${this.baseUrl}/event/analytics`,{});
  }

}
