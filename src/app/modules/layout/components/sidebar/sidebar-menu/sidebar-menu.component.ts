import { NgClass, NgFor, NgIf, NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { SubMenuItem } from 'src/app/core/models/menu.model';
import { SigninService } from 'src/app/core/services/signin.service';
import { MenuService } from '../../../services/menu.service';
import { SidebarSubmenuComponent } from '../sidebar-submenu/sidebar-submenu.component';

@Component({
  selector: 'app-sidebar-menu',
  templateUrl: './sidebar-menu.component.html',
  styleUrls: ['./sidebar-menu.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgFor,
    NgClass,
    AngularSvgIconModule,
    NgTemplateOutlet,
    RouterLink,
    RouterLinkActive,
    NgIf,
    SidebarSubmenuComponent,
  ],
})
export class SidebarMenuComponent implements OnInit {
  accessLevel: any = {};
  isAccessReady = false;
  constructor(public menuService: MenuService ,public signinService:SigninService) { }

  public toggleMenu(subMenu: SubMenuItem, index: number) {
    this.menuService.toggleMenu(subMenu);

  }

  ngOnInit(): void {
    this.signinService.accessLevel$.subscribe(level => {
      this.accessLevel = level;
      this.isAccessReady = Object.keys(level).length > 0;
    });
  }
  
  hasAccess(module: string): boolean {
    if (!this.isAccessReady) return false;
    return this.accessLevel[module] && this.accessLevel[module] !== 'na';
  }
}
