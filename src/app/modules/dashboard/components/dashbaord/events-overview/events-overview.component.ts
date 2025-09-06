import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ApexAxisChartSeries, ApexChart, ApexXAxis, ApexYAxis, ApexStroke, ApexMarkers, ApexLegend, ApexTooltip, ApexDataLabels } from 'ng-apexcharts';
import { NgApexchartsModule } from 'ng-apexcharts';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardService } from 'src/app/core/services/dashboard.service';
import { ToastrService } from 'ngx-toastr';
export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  stroke: ApexStroke;
  markers: ApexMarkers;
  legend: ApexLegend;
  tooltip: ApexTooltip;
  dataLabels: ApexDataLabels;
  colors: string[];
};

interface ChartDataItem {
  year: number;
  past: number;
  ongoing: number;
  upcoming: number;
  total: number;
}


@Component({
  selector: 'app-events-overview',
  standalone: true,   // 👈 this should already be here
  templateUrl: './events-overview.component.html',
  styleUrls: ['./events-overview.component.css'],
  imports: [
    CommonModule,
    FormsModule,

    NgApexchartsModule   // 👈 add this
  ]
})
export class EventsOverviewComponent implements OnInit {
  @ViewChild('chart') chart!: ElementRef;

  public chartOptions: Partial<ChartOptions>;
  public selectedTimeframe: string = 'Past 6 years';
  public currentYear: number = 2023;
  public ongoingEvents: number = 120;
  public percentageChange: number = 12.5;
  public totalGrowthPercentage: number = 19;

  constructor(private dashboardService: DashboardService, private toastr: ToastrService) {
    this.chartOptions = {
   series:[],
      chart: {
        height: 350,
        type: 'line',
        toolbar: {
          show: false
        },
        zoom: {
          enabled: false
        }
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: 'smooth',
        width: 3
      },
      markers: {
        size: 6,
        strokeWidth: 2,
        strokeColors: '#fff',
        hover: {
          size: 8
        }
      },
      xaxis: {
        categories: [],
        labels: {
          style: {
            colors: '#6B7280',
            fontSize: '12px'
          }
        },
        axisBorder: {
          show: false
        },
        axisTicks: {
          show: false
        }
      },
      yaxis: {
        min: 0,
        max: 280,
        tickAmount: 7,
        labels: {
          style: {
            colors: '#6B7280',
            fontSize: '12px'
          },
          formatter: function (val) {
            return val.toFixed(0);
          }
        }
      },
      legend: {
        position: 'bottom',
        horizontalAlign: 'left',
        fontSize: '14px',
        markers: {
          width: 8,
          height: 8,
          radius: 4
        },
        itemMargin: {
          horizontal: 20,
          vertical: 10
        }
      },
      colors: ['#3B82F6', '#F97316', '#EC4899'],
      tooltip: {
        theme: 'light',
        y: {
          formatter: function (val) {
            return val + ' events';
          }
        }
      }
    };
  }

  fetchChartData() {
    this.dashboardService.getDataForLineChart({ time_period: this.selectedTimeframe }).subscribe({
      next: (res) => {

        if (res?.status?.success) {

          const chartData: ChartDataItem[] = res.data.chart_data;


          if (!chartData || chartData.length == 0) return

          const pastData: number[] = chartData.length > 0 ? chartData.map(item => item.past) : [];
          const ongoingData: number[] = chartData.length > 0 ? chartData.map(item => item.ongoing) : [];
          const upcomingData: number[] = chartData.length > 0 ? chartData.map(item => item.upcoming) : [];
          const years: string[] = chartData.length > 0 ? chartData.map(item => item.year.toString()) : [];

          this.chartOptions = {
            series: [
              {
                name: 'Past',
                data: pastData
              },
              {
                name: 'Ongoing',
                data: ongoingData
              },
              {
                name: 'Upcoming',
                data: upcomingData
              }
            ],
            chart: {
              height: 350,
              type: 'line',
              toolbar: {
                show: false
              },
              zoom: {
                enabled: false
              }
            },
            dataLabels: {
              enabled: false
            },
            stroke: {
              curve: 'smooth',
              width: 3
            },
            markers: {
              size: 6,
              strokeWidth: 2,
              strokeColors: '#fff',
              hover: {
                size: 8
              }
            },
            xaxis: {
              categories: years,
              labels: {
                style: {
                  colors: '#6B7280',
                  fontSize: '12px'
                }
              },
              axisBorder: {
                show: false
              },
              axisTicks: {
                show: false
              }
            },
            yaxis: {
              min: 0,
              max: 280,
              tickAmount: 7,
              labels: {
                style: {
                  colors: '#6B7280',
                  fontSize: '12px'
                },
                formatter: function (val) {
                  return val.toFixed(0);
                }
              }
            },
            legend: {
              position: 'bottom',
              horizontalAlign: 'left',
              fontSize: '14px',
              markers: {
                width: 8,
                height: 8,
                radius: 4
              },
              itemMargin: {
                horizontal: 20,
                vertical: 10
              }
            },
            colors: ['#3B82F6', '#F97316', '#EC4899'],
            tooltip: {
              theme: 'light',
              y: {
                formatter: function (val) {
                  return val + ' events';
                }
              }
            }
          };


        }
      },
      error: (err) => {
        let errorMessage = 'Something went wrong.';

        if (err?.error?.status?.message) {
          errorMessage = err.error.status.message;
        } else if (err?.status?.message) {
          errorMessage = err.status.message;
        }
        console.error('❌ Venue Analytics API Error:', err);
        this.toastr.error(errorMessage, 'Error');
      },
    });
  }

  ngOnInit(): void {
    this.fetchChartData()
  }


  onTimeframeChange(timeframe: string): void {
    this.selectedTimeframe = timeframe;
    // Here you would typically update the chart data based on the selected timeframe
    console.log('Timeframe changed to:', timeframe);
  }
}