import { Component, Input, OnChanges, SimpleChanges } from "@angular/core";
import { ApexNonAxisChartSeries, ApexChart, ApexResponsive, ApexLegend } from 'ng-apexcharts';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { NgApexchartsModule } from 'ng-apexcharts';

export type ChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  responsive: ApexResponsive[];
  labels: string[];
  colors: string[];
  legend?: ApexLegend;
  dataLabels?: any;
  plotOptions?: any;
  tooltip?: any;
};

@Component({
  selector: 'app-piechart',
  standalone: true,
  imports: [AngularSvgIconModule, NgApexchartsModule],
  templateUrl: './piechart.component.html',
  styleUrl: './piechart.component.css'
})
export class PiechartComponent implements OnChanges {
  @Input() donut_chart: any;

  public chartOptions: Partial<ChartOptions> = {};

  ngOnChanges(changes: SimpleChanges): void {
    try {
      if (changes['donut_chart'] && this.donut_chart) {
        this.updateChartOptions();
      }
    } catch (error) {
      console.error('Error in PieChart ngOnChanges:', error);
      this.setDefaultOptions();
    }
  }

  private updateChartOptions(): void {
    try {
      // For Active/Inactive Users - Pie/Donut Chart
      this.chartOptions = {
        series: this.donut_chart.series || [0, 0],
        chart: {
          type: 'donut', // Donut chart for active/inactive users
          height: 350,
          toolbar: { show: false },
          fontFamily: 'inherit'
        },
        labels: this.donut_chart.labels || ['Active Users', 'Inactive Users'],
        responsive: this.donut_chart.responsive || [
          {
            breakpoint: 1366,
            options: {
              chart: {
                width: 200
              },
              legend: {
                position: 'bottom'
              }
            }
          }
        ],
        colors: this.donut_chart.colors || ['#A7C7E7', '#FFC78E'],
        legend: {
          position: 'bottom',
          horizontalAlign: 'center',
          fontSize: '14px'
        },
        dataLabels: {
          enabled: true,
          formatter: function (val: number) {
            return Math.round(val) + "%";
          },
          style: {
            fontSize: '14px',
            fontWeight: 'bold'
          }
        },
        plotOptions: {
          pie: {
            donut: {
              size: '65%',
              labels: {
                show: true,
                total: {
                  show: true,
                  label: 'Total Users',
                  formatter: function (w: any) {
                    const total = w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0);
                    return total.toString();
                  }
                }
              }
            }
          }
        },
        tooltip: {
          enabled: true,
          y: {
            formatter: function (val: number) {
              return val + " users";
            }
          }
        }
      };
    } catch (error) {
      console.error('Error updating pie chart options:', error);
      this.setDefaultOptions();
    }
  }

  private setDefaultOptions(): void {
    this.chartOptions = {
      series: [0, 0],
      chart: {
        type: 'donut',
        height: 350,
        toolbar: { show: false }
      },
      labels: ['Active Users', 'Inactive Users'],
      colors: ['#A7C7E7', '#FFC78E'],
      legend: { position: 'bottom' }
    };
  }
}