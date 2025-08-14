import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { MenuService } from '../../services/menu.service';
import { NavbarMobileComponent } from './navbar-mobile/navbar-mobilecomponent';
import { ProfileMenuComponent } from './profile-menu/profile-menu.component';
import { NgClass, NgIf } from '@angular/common';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter, takeUntil } from 'rxjs/operators';
import { Location } from '@angular/common';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  imports: [AngularSvgIconModule, ProfileMenuComponent, NavbarMobileComponent, NgClass, NgIf],
})
export class NavbarComponent implements OnInit, OnDestroy {
  currentTitle = '';
  showBack = false;
  private destroyed$ = new Subject<void>();
  currentDateDisplay = '';
  currentTimeDisplay = '';
  private clockIntervalId: any;
  private clockTimeoutId: any;

  // Org card toggle
  showOrgCard = false;
  orgName: string = '';
  orgEmail: string = '';
  daysInMonth: number = 0;
  constructor(
    public menuService: MenuService,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location
  ) {}
  ngOnInit(): void {
    // Set once on init + on navigation
    this.setTitleFromRoute();
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd), takeUntil(this.destroyed$)).subscribe(() => {
      this.setTitleFromRoute();
    });

    // Start live clock aligned to system minute
    this.updateDateTime();
    const now = new Date();
    const msToNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();
    this.clockTimeoutId = setTimeout(() => {
      this.updateDateTime();
      this.clockIntervalId = setInterval(() => this.updateDateTime(), 60 * 1000);
    }, Math.max(msToNextMinute, 0));
  }
  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
    if (this.clockIntervalId) {
      clearInterval(this.clockIntervalId);
    }
    if (this.clockTimeoutId) {
      clearTimeout(this.clockTimeoutId);
    }
  }

  private setTitleFromRoute(): void {
    let route: ActivatedRoute | null = this.router.routerState.root;
    while (route?.firstChild) {
      route = route.firstChild;
    }
    const dataTitle = route?.snapshot?.data?.['title'] || '';
    const identification = route?.snapshot?.paramMap?.get('identification');
    const showBackInNavbar = !!route?.snapshot?.data?.['showBackInNavbar'];

    // Dynamically set title for Settings page based on tab query param
    const qpTab = route?.snapshot?.queryParamMap?.get('tab');
    const routePath = route?.snapshot?.routeConfig?.path || '';
    
    if (routePath.includes('settings') || dataTitle.toLowerCase().includes('setting')) {
      this.currentTitle = qpTab === 'details' ? 'Details' : 'Settings';
    } else if (identification === 'view') {
      // Show specific titles for view pages
      if (routePath.includes('venue-details')) {
        this.currentTitle = 'Venue Details';
      } else if (routePath.includes('user-management')) {
        this.currentTitle = 'User Details';
      } else if (routePath.includes('role-management')) {
        this.currentTitle = 'Role Details';
      } else {
        this.currentTitle = dataTitle;
      }
    } else {
      this.currentTitle = dataTitle;
    }

        // Show back only if explicitly set in route data (not for view pages)
    this.showBack = showBackInNavbar;
  }

  private updateDateTime(): void {
    const now = new Date();
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dayName = days[now.getDay()];
    const dayNum = now.getDate().toString().padStart(2, '0');
    const monthName = months[now.getMonth()];
    const year = now.getFullYear();

    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    if (hours === 0) hours = 12;

    this.currentDateDisplay = `${dayName} ${dayNum} ${monthName}, ${year}`;
    this.currentTimeDisplay = `${hours}:${minutes} ${ampm}`;
    this.daysInMonth = new Date(year, now.getMonth() + 1, 0).getDate();
  }

  public toggleMobileMenu(): void {
    this.menuService.showMobileMenu = true;
  }
  public toggleSidebar() {
    this.menuService.toggleSidebar();
  }
    public goBack(): void {
    console.log('Go Back clicked. History length:', window.history.length);
    console.log('Current URL:', window.location.href);
    
    // Get current route information
    let route: ActivatedRoute | null = this.router.routerState.root;
    while (route?.firstChild) {
      route = route.firstChild;
    }
    const routePath = route?.snapshot?.routeConfig?.path || '';
    const identification = route?.snapshot?.paramMap?.get('identification');
    
    // Handle specific route navigation
    if (routePath.includes('add-new-venue')) {
      // Go back to infrastructure management
      this.router.navigate(['/dashboard/infrastructure-management']);
    } else {
      // Default behavior - check if there's a previous page in history
      if (window.history.length > 1) {
        console.log('Navigating back in history...');
        this.location.back();
      } else {
        console.log('No previous page, navigating to dashboard...');
        // If no previous page, navigate to dashboard as fallback
        this.router.navigate(['/dashboard/dashboard']);
      }
    }
  }
}
