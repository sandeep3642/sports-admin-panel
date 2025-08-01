import { Component, OnDestroy, OnInit } from '@angular/core';
import { ThemeService } from 'src/app/core/services/theme.service';
import { NftHeaderComponent } from '../../components/nft/nft-header/nft-header.component';
import { UserStatsCardComponent } from '../../components/stakeholder-management/user-stats-card/user-stats-card.component';
import { NgIf } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';
import { ChartOptions } from '../../../../shared/models/chart-options';

import { AngularSvgIconModule } from 'angular-svg-icon';
@Component({
  selector: 'app-dashbaord',
  imports: [NftHeaderComponent, UserStatsCardComponent,
    NgIf,
    NgApexchartsModule,
    AngularSvgIconModule,
    ],
  templateUrl: './dashbaord.component.html',
  styleUrl: './dashbaord.component.css'
})

export class DashbaordComponent implements OnInit, OnDestroy {
  public chartOptions: Partial<ChartOptions>;
  analyticsdata = {
    total_users: {
      counts: 53,
      percentage: 47.22222222222222,
      direction: "up"
    },
    new_applicants: {
      counts: 52,
      percentage: 100,
      direction: "up"
    },
    verified_applications: {
      counts: 22,
      percentage: 100,
      direction: "up"
    },
    pending_verification: {
      counts: 1,
      percentage: 0,
      direction: "neutral"
    },
    rejected_applications: {
      counts: 1,
      percentage: 100,
      direction: "up"
    }
  }

  constructor(private themeService: ThemeService) {

    this.chartOptions = {
      series: [
        {
          name: "Athletes",
          data: [144, 195, 177, 200, 211, 259,2]
        },
        {
          name: "Coaches",
          data: [96, 105, 141, 168, 187, 169,3]
        }
      ],
      xaxis: {
        categories: [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul"
        ]
      },
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