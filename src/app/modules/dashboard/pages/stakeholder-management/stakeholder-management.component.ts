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
  selectedTime = '6';
  selectedUser = 'Athletes';
  donut_chart:any;
  pie_chart:any;
  constructor(private themeService: ThemeService, public stackholderService: StackholderService) {


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
      //  grid: {
      //   row: {
      //     colors: ["#f3f3f3", "transparent"], // takes an array which will be repeated on columns
      //     opacity: 0.5
      //   }
      // },
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
      // fill: {
      //   type: 'gradient',
      //   gradient: {
      //     shadeIntensity: 1,
      //     opacityFrom: 0.4,
      //     opacityTo: 0.2,
      //     stops: [15, 120, 100],
      //   },
      // },
      fill: {
        opacity: 1
      },
      // stroke: {
      //   curve: 'smooth',
      //   show: true,
      //   width: 3,
      //   colors: [baseColor], // line color
      // },
      stroke: {
        // curve: 'smooth',
        show: false,
        // width: 2,
        // colors: ['#000'], // line color
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
      colors: ['#A7C7E7', '#FFC78E'], //line colors
    };

  }

  ngOnInit(): void {
    this.getStakeList();
    this.getCount();
    this.getAthletes();
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
  

  getCount(): void {
    this.stackholderService.getCounts().subscribe({
      next: (res) => {
        this.countsData = res.data?.dashboard_analytics;
        this.donut_chart = res.data?.donut_chart;
        this.pie_chart = res.data?.pie_chart;
        console.log("pie_chart",JSON.stringify(this.pie_chart));
        
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
      district:'Kolkata'
    };
  
    this.stackholderService.getAthletes(payload).subscribe({
      next: (res) => {
        this.athletesData = res.data;
        console.log("this.athletesData ",this.athletesData );
        
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

}
