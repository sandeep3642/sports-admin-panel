import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgxSonnerToaster } from 'ngx-sonner';
import { ThemeService } from './core/services/theme.service';
import { PermissionDeniedComponent } from './modules/dashboard/components/permission-denied.component';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  // ResponsiveHelperComponent
  imports: [RouterOutlet, NgxSonnerToaster,PermissionDeniedComponent],
})
export class AppComponent {
  title = 'SportsApp';

  constructor(public themeService: ThemeService) {}
}
