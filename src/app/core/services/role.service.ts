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
    return this.http.post<any>(`${this.baseUrl}/role/analytics`,{});
  }

  getModule(){
    return this.http.post<any>(`${this.baseUrl}/role/getModulesAndPermissions`,{});
  }

  dropDowns(payload:any) {
    return this.http.post<any>(`${this.baseUrl}/dropdown/list`,payload);
  }

  saveRole(payload:any){
    return this.http.post<any>(`${this.baseUrl}/role/updatePermissions`,payload);
  }

  updateRole(payload:any){
    return this.http.post<any>(`${this.baseUrl}/role/update`,payload);
  }

  deleteRole(payload:any){
    return this.http.post<any>(`${this.baseUrl}/role/delete`,payload);
  }

  getDetails(payload:any){
    return this.http.post<any>(`${this.baseUrl}/role/getDetails`,payload);
  }

  getLevel(payload:any){
    return this.http.post<any>(`${this.baseUrl}/role/getDropdownByKey`,payload);
  }
}
