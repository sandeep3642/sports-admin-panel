import { NftHeaderComponent } from '../../components/nft/nft-header/nft-header.component';
import { CommonModule, NgIf } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ThemeService } from 'src/app/core/services/theme.service';
import { ChartOptions } from '../../../../shared/models/chart-options';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { ButtonComponent } from 'src/app/shared/components/button/button.component';
import { StackholderService } from 'src/app/core/services/stackholder.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { PiechartComponent } from '../../components/stakeholder-management/charts/piechart/piechart.component';
import { DonutchartComponent } from '../../components/stakeholder-management/charts/donutchart/donutchart.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { UserStatsCardComponent } from './user-stats-card/user-stats-card.component';
import { ViewDetailsTableComponent } from './view-details/view-details-table.component';

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

  public chartOptions: Partial<ChartOptions>;
  stakelist: any;
  countsData: any;
  athletesData: any;
  selectedStatus = 'active';
  selectedTime = '6';
  selectedUser = 'Athletes';
  donut_chart: any;
  pie_chart: any;
  isModalOpen = false;
  editUserForm!: FormGroup;
  showPassword: boolean = false;
  constructor(private themeService: ThemeService, private fb: FormBuilder, public stackholderService: StackholderService) {


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
        enabled: false // inside chart counter
      },
      chart: {
        fontFamily: 'inherit',
        type: 'bar',
        height: 350,
        //width: 800, // Optional: Adjust container width for visual precision
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
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun"
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

  ngOnDestroy(): void { }


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


  getCount(): void {
    this.stackholderService.getCounts().subscribe({
      next: (res) => {
        this.countsData = res.data?.dashboard_analytics;
        this.donut_chart = res.data?.donut_chart;
        this.pie_chart = res.data?.pie_chart;
        console.log("pie_chart", JSON.stringify(this.pie_chart));

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

  // --- Status/Progress Helper Methods ---
  getSortedSteps(statusObj: any): any[] {
    return Object.values(statusObj || {}).sort((a: any, b: any) => (a.order_num || 0) - (b.order_num || 0));
  }

  getActiveStepCount(statusObj: any): number {
    return this.getSortedSteps(statusObj).filter((step: any) => step.is_active).length;
  }

  getTotalStepCount(statusObj: any): number {
    return this.getSortedSteps(statusObj).length;
  }

  getProgressPercent(status: any): string {
    if (status?.approved?.is_active) {
      return '100%';
    }
    const total = this.getTotalStepCount(status);
    const active = this.getActiveStepCount(status);
    const percent = total ? Math.round((active / total) * 100) : 0;
    return `${percent}%`;
  }

  isFinalStatus(statusObj: any): boolean {
    if (!statusObj) return false;
    const finalKeys = ['approved', 'rejected'];
    return finalKeys.some(key => statusObj[key]?.is_active);
  }

  getFinalStatus(statusObj: any): string {
    if (statusObj?.approved?.is_active) {
      return 'Approved';
    } else if (statusObj?.rejected?.is_active) {
      return 'Rejected';
    }
    return '';
  }


  openChooseTemplateModal() {
    this.isModalOpen = true;
  }
  closeChooseTemplateModal() {
    this.isModalOpen = false;
  }

}
