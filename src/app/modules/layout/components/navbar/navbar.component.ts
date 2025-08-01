import { Component, OnInit } from '@angular/core';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { MenuService } from '../../services/menu.service';
import { NavbarMenuComponent } from './navbar-menu/navbar-menu.component';
import { NavbarMobileComponent } from './navbar-mobile/navbar-mobilecomponent';
import { ProfileMenuComponent } from './profile-menu/profile-menu.component';
import { SidebarMenuComponent } from '../sidebar/sidebar-menu/sidebar-menu.component';
import { NgClass, NgIf } from '@angular/common';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  imports: [AngularSvgIconModule, ProfileMenuComponent, NavbarMobileComponent,NgClass,NavbarMenuComponent],
})
export class NavbarComponent implements OnInit {
constructor(public menuService: MenuService) {}
  ngOnInit(): void {
    
  }

  public toggleMobileMenu(): void {
    this.menuService.showMobileMenu = true;
  }
  public toggleSidebar() {
    this.menuService.toggleSidebar();
  }
}
