import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { ButtonComponent } from 'src/app/shared/components/button/button.component';

@Component({
  selector: 'app-error404',
  imports: [AngularSvgIconModule, ButtonComponent],
  templateUrl: './error404.component.html',
  styleUrl: './error404.component.css',
})
export class Error404Component {
  constructor(private router: Router) { }



  goToHomePage() {
    let redirectTo = localStorage.getItem('redirectTo');
    if (redirectTo === '/errors/404') {
      this.router.navigate(['/auth/sign-in']);
      localStorage.clear();
    } else {
      this.router.navigate([redirectTo]);
    }
  }
}
