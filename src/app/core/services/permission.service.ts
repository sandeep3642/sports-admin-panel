import { Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  private permissions: any = {};

  showPopup = false;
  popupModule = '';
  popupAction = '';
  setPermissions(permissions: any) {
    console.log("permissions", permissions);

    this.permissions = permissions || {};
  }

 
  hasPermission(module: string, action: string): boolean {
    console.log("action", action);
    console.log("module", module);
    console.log("this.permissions", this.permissions);

    return this.permissions?.[module]?.[action] === true;
  }

  checkAndProceed(module: string, action: string, onSuccess: () => void) {
    if (this.hasPermission(module, action)) {
      onSuccess();
    } else {
      console.warn(`Permission denied for ${module}:${action}`);
      this.popupModule = module.replace('_', ' ');
      this.popupAction = action;
      this.showPopup = true;  
    }
  }

  closePopup() {
    this.showPopup = false;
  }
}
