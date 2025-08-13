import { Injectable } from '@angular/core';

export interface UserPermissions {
  dashboard?: {
    read: boolean;
    display: boolean;
  };
  role_management?: {
    edit: boolean;
    read: boolean;
    create: boolean;
    delete: boolean;
    display: boolean;
  };
  user_management?: {
    edit: boolean;
    read: boolean;
    create: boolean;
    delete: boolean;
    display: boolean;
  };
  event_management?: {
    edit: boolean;
    read: boolean;
    create: boolean;
    delete: boolean;
    display: boolean;
    publish: boolean;
    verification: boolean;
  };
  grant_management?: {
    edit: boolean;
    read: boolean;
    create: boolean;
    delete: boolean;
    display: boolean;
    verification: boolean;
  };
  venue_management?: {
    edit: boolean;
    read: boolean;
    create: boolean;
    delete: boolean;
    display: boolean;
    verification: boolean;
  };
  customer_management?: {
    edit: boolean;
    read: boolean;
    delete: boolean;
    display: boolean;
    verification: boolean;
    'document management': boolean;
  };
  enrollment_management?: {
    edit: boolean;
    read: boolean;
    create: boolean;
    delete: boolean;
    display: boolean;
    verification: boolean;
  };
}

@Injectable({
  providedIn: 'root'
})
export class UserPermissionsService {
  private userPermissions: UserPermissions | null = null;

  constructor() {
    this.loadPermissionsFromStorage();
  }

  setUserPermissions(permissions: UserPermissions): void {
    this.userPermissions = permissions;
    localStorage.setItem('userPermissions', JSON.stringify(permissions));
  }

  getUserPermissions(): UserPermissions | null {
    return this.userPermissions;
  }

  private loadPermissionsFromStorage(): void {
    const stored = localStorage.getItem('userPermissions');
    if (stored) {
      try {
        this.userPermissions = JSON.parse(stored);
      } catch (error) {
        console.error('Error parsing user permissions from storage:', error);
        this.userPermissions = null;
      }
    }
  }

  canDisplayMenu(menuKey: string): boolean {
    if (!this.userPermissions) {
      return false;
    }

    const permission = this.userPermissions[menuKey as keyof UserPermissions];
    if (!permission) {
      return false;
    }

    // Check if the permission object has a display property
    if ('display' in permission) {
      // If display is explicitly true, show the menu
      if (permission.display === true) {
        return true;
      }
      
      // If display is false but user has read access, still show the menu
      if (permission.display === false && 'read' in permission && permission.read === true) {
        return true;
      }
      
      return false;
    }

    return false;
  }

  // Map menu labels to permission keys
  getMenuPermissionKey(menuLabel: string): string {
    const menuMapping: { [key: string]: string } = {
      'Dashboard': 'dashboard',
      'User Management': 'user_management',
      'Role Management ': 'role_management', // Note the trailing space to match menu.ts
      'Stakeholder Management': 'customer_management', // Based on your API response
      'Event Management': 'event_management',
      'Sports Infrastructure Management': 'venue_management', // Based on your API response
      'Coach Allocation': 'enrollment_management' // Based on your API response
    };

    const permissionKey = menuMapping[menuLabel] || '';
    console.log(`Menu label: "${menuLabel}" -> Permission key: "${permissionKey}"`);
    return permissionKey;
  }

  clearPermissions(): void {
    this.userPermissions = null;
    localStorage.removeItem('userPermissions');
  }
} 