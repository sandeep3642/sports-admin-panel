import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const token = localStorage.getItem('authToken');
    const access = JSON.parse(localStorage.getItem('access_level') || '{}');

    if (!token) {
      // 👇 Fix spelling
      this.router.navigate(['/auth/sign-in']); 
      return false;
    }

    const requiredModule = route.data['module'];

    console.log("Required Module:", requiredModule);
    console.log("Access:", access);
    console.log("User Access for this module:", access[requiredModule]);

    if (requiredModule && access[requiredModule] === 'na') {
      this.router.navigate(['/errors/404']); 
      return false;
    }

    return true;
  }
}
