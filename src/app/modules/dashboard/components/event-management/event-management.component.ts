import { NgIf } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { NgApexchartsModule } from 'ng-apexcharts';
import { ThemeService } from 'src/app/core/services/theme.service';
import { NftHeaderComponent } from '../nft/nft-header/nft-header.component';
import { UserStatsCardComponent } from '../stakeholder-management/user-stats-card/user-stats-card.component';
import { ChartOptions } from '../../../../shared/models/chart-options';
import { EventHeatmapComponent } from './event-heatmap/event-heatmap/event-heatmap.component';
import { AllcreateeventsComponent } from './allcreateevents/allcreateevents.component';
import { CalendarComponent } from './calendar/calendar.component';
import { ChoosetemplateComponent } from './choosetemplate/choosetemplate.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { EventsdetailsComponent } from './eventsdetails/eventsdetails.component';
import { EventService } from 'src/app/core/services/event.service';
import { StatsComponent } from './stats/stats.component';
import { PiechartComponent } from '../stakeholder-management/charts/piechart/piechart.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-event-management',
  imports: [NftHeaderComponent,StatsComponent,PiechartComponent, EventsdetailsComponent, MatDialogModule, ChoosetemplateComponent, CalendarComponent, AllcreateeventsComponent, UserStatsCardComponent, EventHeatmapComponent,
    NgIf,
    NgApexchartsModule,
    AngularSvgIconModule,
  ],
  templateUrl: './event-management.component.html',
  styleUrl: './event-management.component.css'
})


export class EventManagementComponent implements OnInit, OnDestroy {
  public chartOptions!: Partial<ChartOptions>;
  isModalOpen = false;
  events:any;
  statsCount:any;
  certificateRepository:any;
  sportsAchievement:any;
  pie_chart:any;
  donut_chart:any;
  analyticsdata = {
    total_users: {
      counts: 51,
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


  constructor(private eventService: EventService, private router: Router,private themeService: ThemeService, private dialog: MatDialog) {
    // Initialize with default chart options
    this.initializeChartOptions();
  }

  private initializeChartOptions() {
    this.chartOptions = {
      series: [
        {
          name: "Upcoming",
          data: [144, 195, 177, 200, 211, 259]
        },
        {
          name: "Past",
          data: [96, 105, 141, 168, 187, 169]
        },
        {
          name: "Cancelled",
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
      colors: ['#A7C7E7', '#FFC78E','#EC111112'], 
    };
  }

  private updateChartOptions() {
    if (this.pie_chart) {
      this.chartOptions = {
        series: this.pie_chart.series || this.chartOptions.series,
        plotOptions: this.pie_chart.plotOptions || this.chartOptions.plotOptions,
        dataLabels: this.pie_chart.dataLabels || this.chartOptions.dataLabels,
        chart: this.pie_chart.chart || this.chartOptions.chart,
        fill: this.pie_chart.fill || this.chartOptions.fill,
        stroke: this.pie_chart.stroke || this.chartOptions.stroke,
        xaxis: this.pie_chart.xaxis || this.chartOptions.xaxis,
        yaxis: this.pie_chart.yaxis || this.chartOptions.yaxis,
        tooltip: this.pie_chart.tooltip || this.chartOptions.tooltip,
        colors: this.pie_chart.colors || this.chartOptions.colors,
        legend: this.pie_chart.legend || this.chartOptions.legend,
        grid: this.pie_chart.grid || this.chartOptions.grid,
        title: this.pie_chart.title || this.chartOptions.title,
        states: this.pie_chart.states || this.chartOptions.states,
        responsive: this.pie_chart.responsive || this.chartOptions.responsive,
      };
    }
  }

  ngOnInit(): void {
    this.getEventList();
    this.getstats();
   }

   previewTemplate(template: any) {
    this.router.navigate(['/event-preview', template.title]);
  }

  ngOnDestroy(): void { }


  visible: boolean = false

  toggleDisplay() {
    this.visible = !this.visible
  }

  openChooseTemplateModal() {
    this.isModalOpen = true;
  }
  closeChooseTemplateModal() {
    this.isModalOpen = false;
  }


  getEventList() {
    const payload = {
      page: 1,
      limit: 6,
    };
    this.eventService.getEventList(payload).subscribe({
      next: (res) => {
        this.events = res.details.events; // Adjust according to your API response
        console.log("events coming...",this.events);
      },
      error: (err) => {
        console.error('Failed to fetch events:', err);
      }
    });
  }

  getstats() {
    this.eventService.getStats().subscribe({
      next: (res) => {
        console.log("events res...",res);

        this.statsCount = res?.details?.dashboard_analytics; 
        this.certificateRepository = res?.details?.certificate_repository;
        this.sportsAchievement  = res?.details?.sports_achievements;
        this.pie_chart = res?.details?.pie_chart;
        this.donut_chart = res?.details?.donut_chart;
        // Update chart options with dynamic pie_chart data
        this.updateChartOptions();

        console.log("certificateRepository",this.certificateRepository);
        console.log("pie_chart data:", this.pie_chart);
      },
      error: (err) => {
        console.error('Failed to fetch events:', err);
      }
    });
  }
  
  
  selectTemplate(template: any) {
    // Handle template selection logic
    alert('Selected: ' + template.title);
  }

  goToPreview(id:number) {
    this.router.navigate(['dashboard/preview-template/',id]);
  }
  

}
