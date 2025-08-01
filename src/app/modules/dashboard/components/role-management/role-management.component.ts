import { NftHeaderComponent } from '../../components/nft/nft-header/nft-header.component';
import { CommonModule, NgIf } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';
import { Component, OnInit } from '@angular/core';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { ButtonComponent } from 'src/app/shared/components/button/button.component';
import { StackholderService } from 'src/app/core/services/stackholder.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { PiechartComponent } from '../../components/stakeholder-management/charts/piechart/piechart.component';
import { DonutchartComponent } from '../../components/stakeholder-management/charts/donutchart/donutchart.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { UserStatsCardComponent } from '../stakeholder-management/user-stats-card/user-stats-card.component';
import { ViewDetailsTableComponent } from '../user-management/view-details/view-details-table.component';
import { RoleStatsCardComponent } from './role-stats-card/role-stats-card.component';


@Component({
  imports: [
    NftHeaderComponent,
    UserStatsCardComponent,
    ViewDetailsTableComponent,
    RoleStatsCardComponent,
    NgIf,
    CommonModule,
    NgApexchartsModule,
    AngularSvgIconModule,
    PiechartComponent,
    ButtonComponent,
    FormsModule,
    DonutchartComponent,
    MatDialogModule,
    MatButtonModule,
    ReactiveFormsModule,
    RouterLink
  ],
  selector: 'app-role-management',
  templateUrl: './role-management.component.html',
  styleUrl: './role-management.component.css'
})
export class RoleManagementComponent implements OnInit {

  stakelist: any;
  countsData: any;
  athletesData: any;
  selectedStatus = 'active';
  selectedTime = '6';
  selectedUser = 'Athletes';
  isModalOpen = false;
  isRoleOpen = false;
  editUserForm!: FormGroup;
  showPassword: boolean = false;
  currentPage: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;
  activeDropdown: number | null = null;
  roleForm: FormGroup;

  constructor(private fb: FormBuilder, public stackholderService: StackholderService) { 
    this.roleForm = this.fb.group({
      roleName: ['', Validators.required],
      status: ['active', Validators.required]
    });
   }

  ngOnInit(): void {
    this.getStakeList();
    this.getCount();
    this.getAthletes();
    this.editUserForm = this.fb.group({
      fullName: ['Vijay Kumar Singh', [Validators.required]],
      userName: ['vijay@123', [Validators.required]],
      email: ['vijaysingh123@gmail.com', [Validators.required, Validators.email]],
      role: ['Approve', [Validators.required]],
      password: ['vijaysingh@123', [Validators.required, Validators.minLength(6)]],
      status: ['active', [Validators.required]]
    });

  

  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleDropdown(index: number) {
    this.activeDropdown = this.activeDropdown === index ? null : index;
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



  visible: boolean = false

  toggleDisplay() {
    this.visible = !this.visible
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


  onPageSizeChange(): void {
    this.getStakeList();
  }


  getCount(): void {
    this.stackholderService.getCounts().subscribe({
      next: (res) => {
        this.countsData = res.data?.dashboard_analytics;
    

      },
      error: (err) => {
        console.error('Failed to fetch list:', err);
      }
    });
  }

  getAthletes(): void {
    const payload = {
      status: this.selectedStatus,
      time_period: +this.selectedTime,
      user_type: this.selectedUser,
      district: 'Kolkata'
    };

    this.stackholderService.getAthletes(payload).subscribe({
      next: (res) => {
        this.athletesData = res.data;
        console.log("this.athletesData ", this.athletesData);

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


  get totalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize);
  }





  openChooseTemplateModal() {
    this.isModalOpen = true;
  }
  closeChooseTemplateModal() {
    this.isModalOpen = false;
  }

  createNewRole() {
    this.isRoleOpen = true;
  }
  closeRole() {
    this.isRoleOpen = false;
  }

  roleCreate() {
    if (this.roleForm.valid) {
      console.log('Form Data:', this.roleForm.value);
    }
  }


}
