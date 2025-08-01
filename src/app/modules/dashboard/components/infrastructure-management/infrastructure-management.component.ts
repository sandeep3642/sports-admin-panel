import { CommonModule, NgIf } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { NgApexchartsModule } from 'ng-apexcharts';
import { ThemeService } from 'src/app/core/services/theme.service';
import { NftHeaderComponent } from '../nft/nft-header/nft-header.component';
import { UserStatsCardComponent } from '../stakeholder-management/user-stats-card/user-stats-card.component';
import { ChartOptions } from '../../../../shared/models/chart-options';
import { CalendarComponent } from '../event-management/calendar/calendar.component';
import { AllcreateeventsComponent } from '../event-management/allcreateevents/allcreateevents.component';
import { EventHeatmapComponent } from '../event-management/event-heatmap/event-heatmap/event-heatmap.component';



@Component({
  selector: 'app-infrastructure-management',
  imports: [NftHeaderComponent,CalendarComponent,AllcreateeventsComponent, UserStatsCardComponent,EventHeatmapComponent,
    NgIf,
    NgApexchartsModule,
    AngularSvgIconModule,
    CommonModule
    ],
  templateUrl: './infrastructure-management.component.html',
  styleUrl: './infrastructure-management.component.css'
})


export class InfrastructureManagementComponent implements OnInit, OnDestroy {
  public chartOptions: Partial<ChartOptions>;
  analyticsdata = {
    total_users: {
      counts: 53,
      percentage: 27.2222222,
      direction: "up"
    },
    new_applicants: {
      counts: 122,
      percentage: 100,
      direction: "up"
    },
    verified_applications: {
      counts: 22,
      percentage: 100,
      direction: "up"
    },
    pending_verification: {
      counts: 122,
      percentage: 0,
      direction: "neutral"
    },
    rejected_applications: {
      counts: 14,
      percentage: 100,
      direction: "up"
    }
  }

  constructor(private themeService: ThemeService) {

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

  ngOnInit(): void { }

  ngOnDestroy(): void { }


  visible: boolean = false

  toggleDisplay() {
    this.visible = !this.visible
  }


}
