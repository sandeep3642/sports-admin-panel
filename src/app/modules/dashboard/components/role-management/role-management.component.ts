import { NftHeaderComponent } from '../../components/nft/nft-header/nft-header.component';
import { CommonModule, NgIf } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';
import { Component, HostListener, OnInit } from '@angular/core';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { ButtonComponent } from 'src/app/shared/components/button/button.component';
import { StackholderService } from 'src/app/core/services/stackholder.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { PiechartComponent } from '../../components/stakeholder-management/charts/piechart/piechart.component';
import { DonutchartComponent } from '../../components/stakeholder-management/charts/donutchart/donutchart.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterLink } from '@angular/router';
import { UserStatsCardComponent } from '../stakeholder-management/user-stats-card/user-stats-card.component';
import { ViewDetailsTableComponent } from '../user-management/view-details/view-details-table.component';
import { RoleStatsCardComponent } from './role-stats-card/role-stats-card.component';
import { RoleService } from 'src/app/core/services/role.service';
import { ToastrService } from 'ngx-toastr';
import { PermissionService } from 'src/app/core/services/permission.service';

@Component({
  imports: [
    RoleStatsCardComponent,
    CommonModule,
    NgApexchartsModule,
    AngularSvgIconModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    ReactiveFormsModule,
    ButtonComponent,
  ],
  selector: 'app-role-management',
  templateUrl: './role-management.component.html',
  styleUrl: './role-management.component.css',
})
export class RoleManagementComponent implements OnInit {
  showFilter = false;
  stakelist: any;
  countsData: any = {
    total_assigned_roles: { counts: 0, percentage: 0 },
    active_roles: { counts: 0, percentage: 0 },
    inactive_roles: { counts: 0, percentage: 0 },
  };
  roleTitle:any;
  athletesData: any;
  selectedStatus: string = 'all';
  selectedTime = '6';
  selectedUser = 'Athletes';
  isModalOpen = false;
  isRoleOpen = false;
  editUserForm!: FormGroup;
  showPassword: boolean = false;
  currentPage: number = 1;
  pageSize: number = 10;
  isEditRole:any;
  totalItems: number = 0;
  activeDropdown: number | null = null;
  roleForm: FormGroup;
  rolelist: any;
  searchTerm: string = '';
  selectedFilter: string = 'Status';
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private toastr: ToastrService,
    public roleService: RoleService,
    public permissionService: PermissionService
  ) {
    this.roleForm = this.fb.group({
      roleName: ['', Validators.required],
      status: ['active', Validators.required],
    });
  }

  ngOnInit(): void {
    this.getRoleList();
    this.getCount();
    // this.getAthletes();
    this.editUserForm = this.fb.group({
      fullName: ['Vijay Kumar Singh', [Validators.required]],
      userName: ['vijay@123', [Validators.required]],
      email: ['vijaysingh123@gmail.com', [Validators.required, Validators.email]],
      role: ['Approve', [Validators.required]],
      password: ['vijaysingh@123', [Validators.required, Validators.minLength(6)]],
      status: ['active', [Validators.required]],
    });

    this.roleForm = this.fb.group({
      roleName: ['', Validators.required],
      status: ['active', Validators.required],
    });
  }

  getCount(): void {
    this.roleService.getCounts().subscribe({
      next: (res) => {
        this.countsData = res.data?.dashboard_analytics;
      },
      error: (err) => {
        console.error('Failed to fetch list:', err);
      },
    });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.editUserForm.valid) {
      const userData = this.editUserForm.value;
      console.log('Form submitted:', userData);
      // Call your API or service to save changes
    } else {
      this.markFormGroupTouched(this.editUserForm);
      console.warn('Form is invalid');
    }
  }

  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();
      if ((control as FormGroup).controls) {
        this.markFormGroupTouched(control as FormGroup);
      }
    });
  }

  // Optional: helper for template if needed
  get f() {
    return this.editUserForm.controls;
  }

  visible: boolean = false;

  toggleDisplay() {
    this.visible = !this.visible;
  }
  // total pages getter
  get totalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize) || 1;
  }

  // array of page numbers
  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  getRoleList(): void {
    const filters: any = { search: this.searchTerm };
    if (this.selectedStatus !== 'all') {
      filters.status = this.selectedStatus;
    }

    const payload = {
      page: this.currentPage,
      limit: this.pageSize,
      filter: filters,
    };

    this.roleService.getRoleList(payload).subscribe({
      next: (res) => {
        this.rolelist = res.data?.roles || [];
        this.totalItems = res.data.pagination?.total;
        console.log('totalItems', this.totalItems);
        this.showFilter = false;
      },
      error: (err) => {
        console.error('Failed to fetch role list:', err);
        this.rolelist = [];
        this.totalItems = 0;
      },
    });
  }

  applyFilter(status: string): void {
    this.selectedStatus = status;
    this.currentPage = 1; // reset to first page
    this.getRoleList();
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
    this.getRoleList();
  }

  onPageChange(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.getRoleList();
  }
  // Add this method to your role component
  isLastOrSecondLastRow(index: number): boolean {
    return index >= this.rolelist.length - 3;
  }
  
  applyFilters(status: string): void {
    this.selectedStatus = status;
    this.selectedFilter = status === 'active' ? 'Active' : status == 'inactive' ? 'Inactive' : 'Status';
    console.log('ascjslksjdk', this.selectedFilter);
    this.currentPage = 1;
    this.getRoleList();
  }

  toggleDropdown(index: number): void {
    this.activeDropdown = this.activeDropdown === index ? null : index;
  }

  roleCreate(): void {
    if (this.roleForm.invalid) {
      this.roleForm.markAllAsTouched();
      return;
    }
  
    const payload: any = {
      name: this.roleForm.value.roleName,
      status: this.roleForm.value.status,
    };
  
    let apiCall;
    let successMsg;
  
    if (this.isEditRole) {
      payload.id = this.isEditRole;
      apiCall = this.roleService.updateRole(payload); // ✅ only update here
      successMsg = 'Role updated successfully!';
    } else {
      apiCall = this.roleService.createRole(payload); // ✅ only create here
      successMsg = 'Role created successfully!';
    }
  
    apiCall.subscribe({
      next: (res) => {
        this.toastr.success(successMsg);
        this.closeRole();
        this.roleForm.reset();
        this.getRoleList?.(); // refresh list if provided
      },
      error: (err) => {
        if (err?.status === 401) {
          this.toastr.error('Unauthorized access. Please login again.', 'Error');
        } else if (err?.status === 403) {
          this.toastr.error('Access denied. You do not have permission.', 'Error');
        } else if (err?.status === 404) {
          this.toastr.error('Resource not found.', 'Error');
        } else {
          this.toastr.error('Error saving role');
        }
        console.error('Save role failed:', err);
      },
    });
    
  }
  

  openChooseTemplateModal() {
    this.isModalOpen = true;
  }
  closeChooseTemplateModal() {
    this.isModalOpen = false;
  }

  createNewRole() {
    this.permissionService.checkAndProceed('role_management', 'create', () => {
      this.isRoleOpen = true;
      this.roleTitle = 'Create'
    })
  }

  editRole(role) {
    this.permissionService.checkAndProceed('role_management', 'edit', () => {
      this.isRoleOpen = true;
      this.roleTitle = 'Edit';
      this.isEditRole = role.id;
      this.roleForm.patchValue({
        roleName: role.name,
        status: role.status,
      });
    })
  }

  closeRole() {
    this.isRoleOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown-wrapper')) {
      this.activeDropdown = null;
    }
  }

  managePermission() {
    this.router.navigate(['dashboard/manage-permission', 'configuration']);
  }

  editmanagePermission(role) {
    this.permissionService.checkAndProceed('role_management', 'edit', () => {
      this.router.navigate(['dashboard/manage-permission', role?.id]);
    })
  }

  viewmanagePermission(role) {
    this.permissionService.checkAndProceed('role_management', 'read', () => {
      this.router.navigate(['dashboard/manage-permission', role?.id, 'view']);
    })
  }

  removeRole(event) {
    this.permissionService.checkAndProceed('role_management', 'delete', () => {
      this.roleService.deleteRole(event?.id).subscribe({
        next: (res) => {
          this.toastr.success(res.status?.message, 'Success');
          this.activeDropdown = null;
          this.getRoleList();
          this.getCount();
        },
        error: (err) => {
          this.toastr.error('Failed to create event', 'Error');
          console.error('Save failed:', err);
          // Show error
        },
      });
    })
  }
}
