import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private baseUrl = environment.adminApiBaseUrl;
  private userUrl = environment.userApiBaseUrl

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
    return this.http.post<any>(`${this.baseUrl}/role/delete`,{role_id:payload});
  }

  getDetails(payload:any){
    return this.http.post<any>(`${this.baseUrl}/role/getDetails`,payload);
  }

  getLevel(payload:any){
    return this.http.post<any>(`${this.baseUrl}/role/getDropdownByKey`,payload);
  }

  getAllLevels(){
    return this.http.post<any>(`${this.baseUrl}/role/getDropdownByKey`,{});
  }


  getAllRoles(body){
    return this.http.post<any>(`${this.userUrl}/getDetails`,{});
  }

  
}
