import { NftHeaderComponent } from '../../components/nft/nft-header/nft-header.component';
import { CommonModule, NgIf } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ThemeService } from 'src/app/core/services/theme.service';
import { ChartOptions } from '../../../../shared/models/chart-options';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { ButtonComponent } from 'src/app/shared/components/button/button.component';
import { UserService } from 'src/app/core/services/user.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { PiechartComponent } from './charts/piechart/piechart.component';
import { DonutchartComponent } from './charts/donutchart/donutchart.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { UserStatsCardComponent } from './user-stats-card/user-stats-card.component';
import { ViewDetailsTableComponent } from './view-details/view-details-table.component';
import { lastValueFrom } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-user-management',
  imports: [
    NftHeaderComponent,
    UserStatsCardComponent,
    ViewDetailsTableComponent,
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
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.css'
})
export class UserManagementComponent implements OnInit, OnDestroy {
  totalUserPeriod: string | null = "";
  totalUserDistrict: string | null = "";
  public chartOptions: Partial<ChartOptions>;
  Math = Math;
  userList: any[] = [];
  countsData: any = {};
  athletesData: any = {};
  selectedStatus = 'active';
  selectedTime = 'last_6_months';
  selectedDistrict = 'kolkata';
  donut_chart: any = {};
  pie_chart: any = {};
  isModalOpen = false;
  editUserForm!: FormGroup;
  showPassword: boolean = false;
  dropdownData: any = {};
  visible: boolean = false;
  sports: any[] = [];
  months: any[] = [];
  districts: any[] = [];
  roles: any[] = [];
  // Pagination
  donutFilter = {
    status: 'active',
    time_period: ''
  };

  pieChartFilter = {
    district: '',
    time_period: ''
  };

  onDonutFilterChange(value: string, type: string) {
    // Call API or update donut_chart input data
    this.donutFilter[type] = value
    this.getUserAnalytics();
  }

  onPieChartFilterChange(value: string, type: string) {

    this.pieChartFilter[type] = value
    this.getUserAnalytics();
  }
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  searchTerm = '';
  filters = {
    donut_filter: { status: 'active', time_period: null },
    pie_chart_filter: { time_period: null },
  };
  constructor(
    private themeService: ThemeService,
    private toastr: ToastrService,
    private fb: FormBuilder,
    public userService: UserService
  ) {
    this.chartOptions = {
      series: [
        {
          name: "Athletes",
          data: [144, 195, 177, 200, 211, 259]
        },
        {
          name: "Coaches",
          data: [96, 105, 141, 168, 187, 169]
        }
      ],
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '10%',
          borderRadius: 10,
        }
      },
      dataLabels: {
        enabled: false
      },
      chart: {
        fontFamily: 'inherit',
        type: 'bar',
        height: 350,
        toolbar: {
          show: false,
        },
        sparkline: {
          enabled: false,
        },
      },
      fill: {
        opacity: 1
      },
      stroke: {
        show: false,
      },
      xaxis: {
        categories: [
          "Jan", "Feb", "Mar", "Apr", "May", "Jun"
        ]
      },
      tooltip: {
        y: {
          formatter: function (val) {
            return "" + val;
          }
        }
      },
      colors: ['#A7C7E7', '#FFC78E'],
    };

    // Initialize safe default values
    this.initializeDefaults();
  }

  ngOnInit(): void {
    try {
      this.initializeForm();
      this.getUserList();
      this.getUserAnalytics();
      this.getDropdownData();
    } catch (error) {
      console.error('Error in component initialization:', error);
      this.handleError(error);
    }
  }

  ngOnDestroy(): void {
    // Cleanup any listeners
    window.removeEventListener('error', this.handleGlobalError);
  }

  private initializeDefaults(): void {
    this.athletesData = {
      total_users: { counts: 0, percentage: 0, direction: 'neutral' },
      admin_users: { counts: 0, percentage: 0, direction: 'neutral' },
      venue_managers: { counts: 0, percentage: 0, direction: 'neutral' },
      active_users: { counts: 0, percentage: 0, direction: 'neutral' },
      inactive_users: { counts: 0, percentage: 0, direction: 'neutral' }
    };

    this.donut_chart = {
      series: [0, 0],
      labels: ['Active Users', 'Inactive Users'],
      colors: ['#A7C7E7', '#FFC78E'],
      chart: { type: 'donut', height: 350 }
    };

    this.pie_chart = {
      series: [{ name: 'Mobile Application', data: [0] }, { name: 'Web Application', data: [0] }],
      xaxis: { categories: ['Aug'] }
    };
  }


  private handleGlobalError = (event: ErrorEvent) => {
    if (event.error && event.error.message &&
      (event.error.message.includes('lsB_matchId') ||
        event.error.message.includes('chrome-extension'))) {
      event.preventDefault();
      console.warn('Extension error suppressed:', event.error);
      return false;
    }
    return true;
  }

  private handleError(error: any): void {
    console.error('Component error:', error);
    this.initializeDefaults();
  }

  initializeForm(): void {
    this.editUserForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.maxLength(15)]],
      userName: ['', [Validators.required, Validators.maxLength(15)]],
      email: ['', [Validators.required, Validators.email]],
      role: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      status: ['active', [Validators.required]]
    });
  }

  getUserList(): void {
    try {
      const payload = {
        page: this.currentPage,
        limit: this.itemsPerPage,
        search: this.searchTerm
      };

      this.userService.getUserList(payload).subscribe({
        next: (res) => {
          console.log("User List Response", res);
          if (res?.status?.success) {
            this.userList = res?.data || [];
            this.totalItems = res?.total || 0;
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

  getUserAnalytics(): void {
    try {
      const payload = {
        donut_filter: {
          status: this.donutFilter.status,
          time_period: this.donutFilter.time_period
        },
        pie_chart_filter: {
          district: this.pieChartFilter.district,
          time_period: this.pieChartFilter.time_period
        }
      };

      this.userService.getUserAnalytics(payload).subscribe({
        next: (res) => {
          console.log('Analytics Response:', res);
          if (res?.status?.success && res?.data) {
            this.processAnalyticsResponse(res.data);
          } else {
            this.handleError('Invalid analytics response');
          }
        },
        error: (err) => {
          console.error('Failed to fetch user analytics:', err);
          this.handleError(err);
        }
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  private processAnalyticsResponse(data: any): void {
    try {
      // Process dashboard analytics safely
      if (data.dashboard_analytics) {
        this.athletesData = {
          total_users: this.safelyGetData(data.dashboard_analytics.total_users),
          admin_users: this.safelyGetData(data.dashboard_analytics.admin_users),
          venue_managers: this.safelyGetData(data.dashboard_analytics.venue_managers),
          active_users: this.safelyGetData(data.dashboard_analytics.active_users),
          inactive_users: this.safelyGetData(data.dashboard_analytics.inactive_users)
        };
      }

      // Process donut chart data safely
      if (data.donut_chart) {
        this.donut_chart = {
          series: data.donut_chart.series || [0, 0],
          labels: data.donut_chart.labels || ['Active Users', 'Inactive Users'],
          colors: data.donut_chart.colors || ['#A7C7E7', '#FFC78E'],
          chart: data.donut_chart.chart || { type: 'donut', height: 350 },
          responsive: data.donut_chart.responsive || []
        };
      }

      // Process pie chart data safely
      if (data.pie_chart) {
        this.pie_chart = {
          series: data.pie_chart.series || [],
          xaxis: data.pie_chart.xaxis || { categories: ['Aug'] }
        };
      }
    } catch (error) {
      console.error('Error processing analytics response:', error);
      this.handleError(error);
    }
  }

  private safelyGetData(data: any): any {
    return {
      counts: data?.counts || 0,
      percentage: data?.percentage || 0,
      direction: data?.direction || 'neutral'
    };
  }

  getDropdownData(): void {
    try {
      const payload = {
        sports: true,
        roles_ddl: true,
        districts: true,
        admin_months_filter: true
      };

      this.userService.getDropdownLists(payload).subscribe({
        next: (res) => {
          console.log('Dropdown Response:', res);
          if (res?.status?.success) {
            this.dropdownData = res.data || {};
            this.months = res.data.admin_months_filter;
            this.sports = res.data.sports;
            this.districts = res.data.districts;
            this.roles = res.data.roles
          }
        },
        error: (err) => {
          console.error('Failed to fetch dropdown data:', err);
          this.dropdownData = {};
        }
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  addNewUser(): void {
    try {
      if (this.editUserForm.valid) {
        const userData = {
          full_name: this.editUserForm.value.fullName,
          user_name: this.editUserForm.value.userName,
          email: this.editUserForm.value.email,
          password: this.editUserForm.value.password,
          role_id: parseInt(this.editUserForm.value.role),
          status: this.editUserForm.value.status
        };

        this.userService.addUser(userData).subscribe({
          next: (res) => {
            this.toastr.success('User added successfully');
            if (res?.status?.success) {
              this.closeChooseTemplateModal();
              this.getUserList();
              this.getUserAnalytics(); // Refresh analytics too
              this.editUserForm.reset();
            }
          },
          error: (err) => {
            this.toastr.error('Failed to add user:', err);
          }
        });
      } else {
        this.markFormGroupTouched(this.editUserForm);
      }
    } catch (error) {
      this.handleError(error);
    }
  }

  onPageChange(page: number): void {
    try {
      this.currentPage = page;
      this.getUserList();
    } catch (error) {
      this.handleError(error);
    }
  }

  onStatusFilterChange(event: Event): void {
    try {
      const target = event.target as HTMLSelectElement;
      this.selectedStatus = target.value;
      this.getUserAnalytics();
    } catch (error) {
      this.handleError(error);
    }
  }

  onTimeFilterChange(event: Event): void {
    try {
      const target = event.target as HTMLSelectElement;
      this.selectedTime = target.value;
      this.getUserAnalytics();
    } catch (error) {
      this.handleError(error);
    }
  }

  onDistrictFilterChange(event: Event): void {
    try {
      const target = event.target as HTMLSelectElement;
      this.selectedDistrict = target.value;
      this.getUserAnalytics();
    } catch (error) {
      this.handleError(error);
    }
  }

  togglePassword(): void {
    try {
      this.showPassword = !this.showPassword;
      const passwordInput = document.querySelector('input[formControlName="password"]') as HTMLInputElement;
      if (passwordInput) {
        passwordInput.type = this.showPassword ? 'text' : 'password';
      }
    } catch (error) {
      console.error('Error toggling password:', error);
    }
  }

  onSearch(event: any): void {
    try {
      this.searchTerm = event.target.value;
      this.currentPage = 1;
      this.getUserList();
    } catch (error) {
      this.handleError(error);
    }
  }

  onSubmit(): void {
    this.addNewUser();
  }

  markFormGroupTouched(formGroup: FormGroup): void {
    try {
      Object.values(formGroup.controls).forEach(control => {
        control.markAsTouched();
        if ((control as FormGroup).controls) {
          this.markFormGroupTouched(control as FormGroup);
        }
      });
    } catch (error) {
      console.error('Error marking form touched:', error);
    }
  }

  get f() {
    return this.editUserForm.controls;
  }

  toggleDisplay(): void {
    try {
      this.visible = !this.visible;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Status helper methods
  getSortedSteps(statusObj: any): any[] {
    try {
      if (!statusObj) return [];
      return Object.values(statusObj).sort((a: any, b: any) => (a?.order_num || 0) - (b?.order_num || 0));
    } catch (error) {
      return [];
    }
  }

  getActiveStepCount(statusObj: any): number {
    try {
      return this.getSortedSteps(statusObj).filter((step: any) => step?.is_active).length;
    } catch (error) {
      return 0;
    }
  }

  getTotalStepCount(statusObj: any): number {
    try {
      return this.getSortedSteps(statusObj).length;
    } catch (error) {
      return 0;
    }
  }

  getProgressPercent(status: any): string {
    try {
      if (status?.approved?.is_active) {
        return '100%';
      }
      const total = this.getTotalStepCount(status);
      const active = this.getActiveStepCount(status);
      const percent = total ? Math.round((active / total) * 100) : 0;
      return `${percent}%`;
    } catch (error) {
      return '0%';
    }
  }

  isFinalStatus(statusObj: any): boolean {
    try {
      if (!statusObj) return false;
      const finalKeys = ['approved', 'rejected'];
      return finalKeys.some(key => statusObj[key]?.is_active);
    } catch (error) {
      return false;
    }
  }

  getFinalStatus(statusObj: any): string {
    try {
      if (statusObj?.approved?.is_active) {
        return 'Approved';
      } else if (statusObj?.rejected?.is_active) {
        return 'Rejected';
      }
      return 'Active';
    } catch (error) {
      return 'Unknown';
    }
  }

  // ✅ jab district dropdown change ho

  getUserStatus(user: any): string {
    try {
      return user?.status ? user.status.charAt(0).toUpperCase() + user.status.slice(1) : 'Active';
    } catch (error) {
      return 'Unknown';
    }
  }

  getUserRole(user: any): string {
    try {
      return user?.role?.name || user?.role || 'User';
    } catch (error) {
      return 'User';
    }
  }

  openChooseTemplateModal(): void {
    try {
      this.isModalOpen = true;
      this.editUserForm.reset();
      this.editUserForm.patchValue({ status: 'active' });
    } catch (error) {
      this.handleError(error);
    }
  }

  closeChooseTemplateModal(): void {
    try {
      this.isModalOpen = false;
      this.editUserForm.reset();
    } catch (error) {
      this.handleError(error);
    }
  }

  // Helper method to safely access nested properties
  safeAccess(obj: any, path: string, defaultValue: any = null): any {
    try {
      return path.split('.').reduce((current, key) => current?.[key], obj) ?? defaultValue;
    } catch (error) {
      return defaultValue;
    }
  }

  onFilterUpdate(event: { key: string; value: any }) {
    this.filters[event.key] = event.value;
    this.getUserAnalytics();
  }
  // Method to refresh all data
  refreshData(): void {
    try {
      this.getUserList();
      this.getUserAnalytics();
    } catch (error) {
      this.handleError(error);
    }
  }
  handleChangeSelectValue(value: string, type: string) {
    // this[type] = value
    console.log(value, "handleChangeSelectValue")
  }
}