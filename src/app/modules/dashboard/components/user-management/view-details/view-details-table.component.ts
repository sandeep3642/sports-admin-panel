import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { ButtonComponent } from "../../../../../shared/components/button/button.component";
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { UserService } from 'src/app/core/services/user.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

interface UserTable {
  sl: string;
  name: string;
  sportsCategory: string;
  role: string;
  district: string;
  status: {
    progress: number;
    label: string;
  };
  registrationDate: string;
  deadline: string;
}

interface User {
  id: number;
  full_name: string;
  user_name: string;
  email: string;
  role_id: number;
  role?: any;
  status: string;
  created_at?: string;
}

interface Role {
  id: number;
  name: string;
  status: string;
}

@Component({
  selector: 'app-view-details-table',
  templateUrl: './view-details-table.component.html',
  styleUrl: './view-details-table.component.css',
  imports: [AngularSvgIconModule, MatButtonModule, ReactiveFormsModule, MatDialogModule, NgIf, NgFor, CommonModule, ButtonComponent, RouterLink, FormsModule],
})
export class ViewDetailsTableComponent implements OnInit {
  userList: User[] = []; // Main user list from API
  rolesList: Role[] = []; // Roles list for dropdown

  isSortDropdownOpen = false;
  sort_by = '';
  stakeDetails: any;
  currentPage: number = 1;
  pageSize: number = 10;
  itemsPerPage: number = 10;
  totalItems: number = 0;
  filterSearch = '';
  searchTerm = '';
  isModalOpen = false;
  isRoleOpen = false;
  isEditMode = false;
  selectedUserId: number | null = null;

  activeDropdown: number | null = null;
  editUserForm!: FormGroup;
  filterCategories = [
    'User Type', 'New Applicants', 'Sports Category', 'Level', 'District',
    'Age Group', 'Status', 'Performance Rating', 'Year of Experience'
  ];
  showPassword: boolean = false;
  selectedCategory = 'District';
  roleForm: FormGroup;
  userTypes: string[] = [];
  countsData: any = {};

  // Add Math object for template access
  Math = Math;

  constructor(
    private fb: FormBuilder,
    private eRef: ElementRef,
    private toastr: ToastrService,
    private router: Router,
    public userService: UserService // Changed to UserService
  ) {
    this.roleForm = this.fb.group({
      roleName: ['', Validators.required],
      status: ['active', Validators.required]
    });
  }

  ngOnInit(): void {
    this.getUserList();
    this.getRolesList();
    this.initializeForm();
  }

  // 1. Fix the form initialization for edit mode
  initializeForm(): void {
    this.editUserForm = this.fb.group({
      fullName: ['', [Validators.required]],
      userName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      role: ['', [Validators.required]],
      password: [''], // Remove required validator - will be added conditionally
      status: ['active', [Validators.required]]
    });

    // Add password validation only for new users
    this.updatePasswordValidation();
  }

  // 2. Add method to update password validation based on mode
  updatePasswordValidation(): void {
    const passwordControl = this.editUserForm.get('password');
    if (passwordControl) {
      if (this.isEditMode) {
        // For edit mode, password is optional
        passwordControl.setValidators([Validators.minLength(6)]);
      } else {
        // For add mode, password is required
        passwordControl.setValidators([Validators.required, Validators.minLength(6)]);
      }
      passwordControl.updateValueAndValidity();
    }
  }

  // 3. Fix the onEdit method
  onEdit(user: User, index: number) {
    console.log('Edit clicked for user', user);
    this.isEditMode = true;
    this.selectedUserId = user.id;

    // Populate form with user data
    this.editUserForm.patchValue({
      fullName: user.full_name,
      userName: user.user_name,
      email: user.email,
      role: user.role_id,
      password: '', // Don't populate password for security
      status: user.status
    });

    // Update password validation for edit mode
    this.updatePasswordValidation();

    this.openChooseTemplateModal();
    this.activeDropdown = null;
  }

  // Fixed getUserList method using UserService
  getUserList(): void {
    try {
      const payload = {
        page: this.currentPage,
        limit: this.pageSize,
        search: this.searchTerm
      };

      this.userService.getUserList(payload).subscribe({
        next: (res) => {
          console.log("User List Response", res);
          if (res?.status?.success) {
            this.userList = res?.data?.users || res?.data || [];
            this.totalItems = res?.total || res?.data?.total || 0;
            this.countsData = res?.counts || {};
          } else {
            this.userList = [];
          }
        },
        error: (err) => {
          console.error('Failed to fetch user list:', err);
          this.userList = [];
          this.handleError(err);
        }
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  // Get roles list for dropdown using UserService
  getRolesList(): void {
    const payload = {
      roles_ddl: true,
    };

    this.userService.getDropdownLists(payload).subscribe({
      next: (res) => {
        if (res?.status?.success) {
          this.rolesList = res?.data?.roles || [];
        }
        console.log(this.rolesList, "this.rolesList")
      },
      error: (err) => {
        console.error('Failed to fetch roles:', err);
      }
    });
  }

  onPageChange(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.getUserList();
  }

  toggleDropdown(index: number) {
    this.activeDropdown = this.activeDropdown === index ? null : index;
  }


  @HostListener('document:click', ['$event'])
  handleOutsideClick(event: MouseEvent) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.activeDropdown = null;
    }
  }

  onSelect(index: number) {
    const user = this.userList[index];
    if (user && confirm('Are you sure you want to remove this user?')) {
      this.deleteUser(user.id);
    }
    this.activeDropdown = null;
  }

  deleteUser(userId: number): void {
    this.userService.deleteUser(userId).subscribe({
      next: (res) => {
        if (res?.status?.success) {
          this.toastr.success('User removed successfully');
          this.getUserList(); // Refresh the list
        } else {
          this.toastr.error(res?.message || 'Failed to remove user');
        }
      },
      error: (err) => {
        console.error('Error removing user:', err);
        this.toastr.error('Failed to remove user');
      }
    });
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize);
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
    this.getUserList();
  }

  getSortedSteps(statusObj: any): any[] {
    return Object.values(statusObj || {}).sort((a: any, b: any) => (a.order_num || 0) - (b.order_num || 0));
  }

  getTotalStepCount(statusObj: any): number {
    return this.getSortedSteps(statusObj).length;
  }

  // 6. Fix the openChooseTemplateModal method
  openChooseTemplateModal() {
    this.isModalOpen = true;
    // If not in edit mode, ensure password validation is set for new user
    if (!this.isEditMode) {
      this.updatePasswordValidation();
    }
  }

  // 5. Fix the closeChooseTemplateModal method
  closeChooseTemplateModal() {
    this.isModalOpen = false;
    this.isEditMode = false;
    this.selectedUserId = null;
    this.editUserForm.reset();
    this.initializeForm(); // This will reset password validation
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  // 4. Fix the onSubmit method to handle optional password

  onSubmit(): void {
    if (this.editUserForm.valid) {
      const formData = this.editUserForm.value;
      const userData: any = {
        full_name: formData.fullName,
        user_name: formData.userName,
        email: formData.email,
        role_id: parseInt(formData.role),
        status: formData.status
      };

      // Only include password if it's provided (for both add and edit)
      if (formData.password && formData.password.trim() !== '') {
        userData.password = formData.password;
      }

      console.log('Form submitted:', userData);

      if (this.isEditMode && this.selectedUserId) {
        // Update user - add user_id to match API
        userData.user_id = this.selectedUserId;
        this.updateUser(this.selectedUserId, userData);
      } else {
        // Add new user - password is required for new users
        if (!userData.password) {
          this.toastr.error('Password is required for new users');
          return;
        }
        this.addNewUser(userData);
      }
    } else {
      this.markFormGroupTouched(this.editUserForm);
      console.warn('Form is invalid');
      this.toastr.error('Please fill all required fields correctly');
    }
  }


  addNewUser(userData: any): void {
    this.userService.addUser(userData).subscribe({
      next: (res) => {
        if (res?.status?.success) {
          this.toastr.success('User added successfully');
          this.closeChooseTemplateModal();
          this.getUserList(); // Refresh the list
        } else {
          this.toastr.error(res?.message || 'Failed to add user');
        }
      },
      error: (err) => {
        console.error('Error adding user:', err);
        this.toastr.error('Failed to add user');
      }
    });
  }

  updateUser(userId: number, userData: any): void {
    this.userService.updateUser(userId, userData).subscribe({
      next: (res) => {
        if (res?.status?.success) {
          this.toastr.success('User updated successfully');
          this.closeChooseTemplateModal();
          this.getUserList(); // Refresh the list
        } else {
          this.toastr.error(res?.message || 'Failed to update user');
        }
      },
      error: (err) => {
        console.error('Error updating user:', err);
        this.toastr.error('Failed to update user');
      }
    });
  }

  handleError(error: any): void {
    console.error('Error:', error);
    this.toastr.error('An error occurred. Please try again.');
  }

  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if ((control as FormGroup).controls) {
        this.markFormGroupTouched(control as FormGroup);
      }
    });
  }

  // Helper for template
  get f() {
    return this.editUserForm.controls;
  }

  // Search functionality
  onSearch(): void {
    this.currentPage = 1;
    this.getUserList();
  }

  // Clear search
  clearSearch(): void {
    this.searchTerm = '';
    this.currentPage = 1;
    this.getUserList();
  }

  // Helper methods for pagination display
  getStartEntry(): number {
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  getEndEntry(): number {
    return this.Math.min(this.currentPage * this.pageSize, this.totalItems);
  }
}