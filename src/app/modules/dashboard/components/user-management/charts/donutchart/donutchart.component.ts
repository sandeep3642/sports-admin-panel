import {
  Component,
  Input,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';
import { FormsModule } from '@angular/forms';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { ChartOptions } from 'src/app/shared/models/chart-options';

@Component({
  selector: 'app-donutchart',
  standalone: true,
  imports: [CommonModule, NgIf, NgApexchartsModule, AngularSvgIconModule, FormsModule],
  templateUrl: './donutchart.component.html',
  styleUrls: ['./donutchart.component.css']
})
export class DonutchartComponent implements OnChanges {
  @Input() donut_chart: any; // Fixed: Changed from pie_chart to donut_chart
  public chartOptions: Partial<ChartOptions> = {};

  ngOnChanges(changes: SimpleChanges): void {
    try {
      if (changes['donut_chart'] && this.donut_chart) {
        this.updateChartOptions();
      }
    } catch (error) {
      console.error('Error in DonutChart ngOnChanges:', error);
      this.setDefaultOptions();
    }
  }

  private updateChartOptions(): void {
    try {
      // For Mobile/Web Application Users - Bar Chart
      this.chartOptions = {
        series: this.donut_chart.series || [],
        chart: {
          type: 'bar', // Bar chart for mobile vs web users
          height: 350,
          toolbar: { show: false },
          fontFamily: 'inherit'
        },
        xaxis: this.donut_chart.xaxis || { categories: [] },
        yaxis: {
          title: {
            text: 'Number of Users'
          }
        },
        dataLabels: {
          enabled: true,
          formatter: function (val: number) {
            return val.toString();
          }
        },
        fill: {
          opacity: 1,
          colors: ['#075FB0', '#E77213']
        },
        stroke: {
          show: true,
          width: 2,
          colors: ['transparent']
        },
        tooltip: {
          y: {
            formatter: (val: number) => `${val} users`
          }
        },
        legend: {
          position: 'bottom',
          horizontalAlign: 'center'
        },
        grid: {
          borderColor: '#f1f1f1',
          strokeDashArray: 3
        },
        plotOptions: {
          bar: {
            horizontal: false,
            columnWidth: '50%',
            borderRadius: 8,
          }
        },
        colors: ['#075FB0', '#E77213']
      };
    } catch (error) {
      console.error('Error updating chart options:', error);
      this.setDefaultOptions();
    }
  }

  private setDefaultOptions(): void {
    this.chartOptions = {
      series: [],
      chart: {
        type: 'bar',
        height: 350,
        toolbar: { show: false }
      },
      xaxis: { categories: [] },
      dataLabels: { enabled: false },
      colors: ['#075FB0', '#E77213']
    };
  }
}