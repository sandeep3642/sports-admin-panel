import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SigninService {
  private baseUrl = 'https://itop-admin.servebeer.com/api/user';

  constructor(private http: HttpClient) { }

  login(credentials: { user_name: string; password: string }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/login`, credentials);
  }

  signup(credentials: { full_name: string; user_name: string; password: string; email: string }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/signup`, credentials);  // ✅ Changed endpoint
  }

  forgotPassword(payload: { email: string }): Observable<any> {
    return this.http.post<any>( `${this.baseUrl}/forgetPassword`,payload);
  }

  verifyCode(payload: { email:string,otp: string }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/verifyEmail`, payload);
  }

  verifyCodePassword(payload: { email:string,otp: string }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/verifyPasswordOtp`, payload);
  }

  resetPassword(payload): Observable<any> {
    const token = localStorage.getItem('resetToken'); // or any other key
    console.log("token",token);
    
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}` // or use 'x-reset-token': token if backend expects it
    });
  
    return this.http.post<any>(`${this.baseUrl}/setPassword`, payload, { headers });
  }

  
  
}
