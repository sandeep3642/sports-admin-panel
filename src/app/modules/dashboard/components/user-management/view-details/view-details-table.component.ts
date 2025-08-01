import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { ButtonComponent } from "../../../../../shared/components/button/button.component";
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { StackholderService } from 'src/app/core/services/stackholder.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

interface Stakeholder {
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
  name: string;
  email: string;
  details: string;
}

@Component({
  selector: 'app-view-details-table',
  templateUrl: './view-details-table.component.html',
  styleUrl: './view-details-table.component.css',
  imports: [AngularSvgIconModule, MatButtonModule,ReactiveFormsModule, MatDialogModule, NgIf, NgFor, CommonModule, ButtonComponent, RouterLink, FormsModule],
})
export class ViewDetailsTableComponent implements OnInit {
  stakelist: any[] = [];         // The full, unfiltered data from the API
  filteredStakeList: any[] = []; // The data shown in the table (filtered)
  stakeholders: Stakeholder[] = [
  ];
  isSortDropdownOpen = false;
  sort_by = '';
  stakeDetails: any;
  currentPage: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;
  filterSearch = '';
  isModalOpen = false;
  isRoleOpen = false;

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


  constructor(private fb: FormBuilder,private eRef: ElementRef,private toastr: ToastrService, private router: Router,public stackholderService: StackholderService) { 
    this.roleForm = this.fb.group({
      roleName: ['', Validators.required],
      status: ['active', Validators.required]
    });
  }

  ngOnInit(): void {
    this.getStakeList();
    this.editUserForm = this.fb.group({
      fullName: ['Vijay Kumar Singh', [Validators.required]],
      userName: ['vijay@123', [Validators.required]],
      email: ['vijaysingh123@gmail.com', [Validators.required, Validators.email]],
      role: ['Approve', [Validators.required]],
      password: ['vijaysingh@123', [Validators.required, Validators.minLength(6)]],
      status: ['active', [Validators.required]]
    });
  }


  getStakeList(): void {
    const payload = {
      page: 1,
      limit: 10,
      filters: {}
    };
  
    this.stackholderService.getListing(payload).subscribe({
      next: (res) => {
        this.stakelist = res.data.customers;
      },
      error: (err) => {
        console.error('Failed to fetch list:', err);
      }
    });
  }

  onPageChange(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.getStakeList();
  }

  toggleDropdown(index: number) {
    this.activeDropdown = this.activeDropdown === index ? null : index;
  }

  onEdit(index: number) {
    console.log('Edit clicked for row', index);
    this.activeDropdown = null;
  }



  @HostListener('document:click', ['$event'])
  handleOutsideClick(event: MouseEvent) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.activeDropdown = null;
    }
  }

  onSelect(index: number) {
    console.log('Select clicked for row', index);
    this.activeDropdown = null;
  }


  get totalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize);
  }


  onPageSizeChange(): void {
    this.getStakeList();
  }

  getSortedSteps(statusObj: any): any[] {
    return Object.values(statusObj || {}).sort((a: any, b: any) => (a.order_num || 0) - (b.order_num || 0));
  }

  getTotalStepCount(statusObj: any): number {
    return this.getSortedSteps(statusObj).length;
  }

  openChooseTemplateModal() {
    this.isModalOpen = true;
  }
  closeChooseTemplateModal() {
    this.isModalOpen = false;
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
    Object.values(formGroup.controls).forEach(control => {
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



}
