import { NftHeaderComponent } from '../../components/nft/nft-header/nft-header.component';
import { UserStatsCardComponent } from '../../components/stakeholder-management/user-stats-card/user-stats-card.component';
import { StakeholderTableComponent } from '../../components/stakeholder-management/stakeholder-table/stakeholder-table.component';
import { CommonModule, NgIf } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';
import { Component, OnDestroy, OnInit, effect } from '@angular/core';
import { ThemeService } from 'src/app/core/services/theme.service';
import { ChartOptions } from '../../../../shared/models/chart-options';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { ButtonComponent } from 'src/app/shared/components/button/button.component';
import { StackholderService } from 'src/app/core/services/stackholder.service';
import { FormsModule } from '@angular/forms';
import { PiechartComponent } from '../../components/stakeholder-management/charts/piechart/piechart.component';
import { DonutchartComponent } from '../../components/stakeholder-management/charts/donutchart/donutchart.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-stakeholder-management',
  imports: [
    NftHeaderComponent,
    UserStatsCardComponent,
    StakeholderTableComponent,
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
    RouterLink
  ],
  templateUrl: './stakeholder-management.component.html',
  styleUrl: './stakeholder-management.component.css'
})
export class StakeholderManagementComponent implements OnInit, OnDestroy {

  public chartOptions: Partial<ChartOptions>;
  stakelist: any;
  countsData: any;
  athletesData: any;
  selectedStatus = 'active';
  selectedTime :any
  selectedUser = 'Athletes';
  donut_chart: any;
  pie_chart: any;
  months: any[] = [];
  districts: any[] = [];
  constructor(
    private themeService: ThemeService,
    public stackholderService: StackholderService
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

  }

  ngOnInit(): void {
    this.getStakeList();
    this.getCount();
    this.getAthletes();
    this.getDropdownData();
    this.getStakeAnalytics();
  }

  ngOnDestroy(): void { }


  visible: boolean = false

  toggleDisplay() {
    this.visible = !this.visible
  }

  getStakeList(): void {
    const payload = {
      page: 1,
      limit: 5,
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
  private handleError(error: any): void {
    console.error('Component error:', error);
  }
  donutFilter = {
    status: 'active',
    time_period: ''
  };

  pieChartFilter = {
    district: '',
    time_period: ''
  };


  onPieChartFilterChange(value: string, type: string) {
    this.pieChartFilter[type] = value
    this.getStakeAnalytics();
  }
  onDonutFilterChange(value: string, type: string) {
    this.donutFilter[type] = value
    this.getStakeAnalytics();
  }

  getStakeAnalytics(): void {
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

      this.stackholderService.getStakeAnalytics(payload).subscribe({
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
    console.log("selected ",this.selectedTime)
    const payload = {
      status: this.selectedStatus,
      time_period: this.selectedTime,
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
  getDropdownData(): void {
    try {
      const payload = {
        sports: true,
        roles_ddl: true,
        districts: true,
        admin_months_filter: true
      };

      this.stackholderService.getDropdownLists(payload).subscribe({
        next: (res) => {
          console.log('Dropdown Response:', res);
          if (res?.status?.success) {
            this.months = res.data.admin_months_filter;
            this.districts = res.data.districts;
          }
        },
        error: (err) => {
          console.error('Failed to fetch dropdown data:', err);
        }
      });
    } catch (error) {
      console.error('Failed to fetch dropdown data:', error);
    }
  }

}
