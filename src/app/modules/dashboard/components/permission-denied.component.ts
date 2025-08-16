import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PermissionService } from 'src/app/core/services/permission.service';

@Component({
    selector: 'app-permission-denied',
    imports: [CommonModule, FormsModule],
    template: `
  <div *ngIf="permissionService.showPopup"
  class="fixed inset-0 flex items-center justify-center 
         bg-black/30 backdrop-blur-sm z-50">
<div class="bg-white p-6 rounded-2xl shadow-xl w-96 text-center">
 <h2 class="text-xl font-bold text-red-600 mb-4">Permission Denied</h2>
 <p class="text-gray-700">
   You do not have permission to perform 
   <b>{{permissionService.popupAction}}</b> on 
   <b>{{permissionService.popupModule}}</b>.
 </p>
 <div class="mt-6">
   <button 
     class="bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600"
     (click)="permissionService.closePopup()">
     OK
   </button>
 </div>
</div>
</div>

  `
})
export class PermissionDeniedComponent {
    constructor(public permissionService: PermissionService) { }
}
