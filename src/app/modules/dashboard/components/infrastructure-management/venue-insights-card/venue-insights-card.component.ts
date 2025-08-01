import { Component, Input, ViewChild, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  NgApexchartsModule,
  ChartComponent,
  ApexChart,
  ApexNonAxisChartSeries,
  ApexResponsive,
  ApexLegend,
  ApexPlotOptions,
  ApexDataLabels,
  ApexAxisChartSeries,
  ApexXAxis,
  ApexYAxis,
  ApexFill,
  ApexTooltip,
  ApexStroke,
} from 'ng-apexcharts';
import { AngularSvgIconModule } from 'angular-svg-icon';

export type DonutChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  responsive: ApexResponsive[];
  legend: ApexLegend;
  plotOptions: ApexPlotOptions;
  dataLabels: ApexDataLabels;
  colors: string[];
};

export type BarChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  fill: ApexFill;
  tooltip: ApexTooltip;
  colors: string[];
  plotOptions: ApexPlotOptions;
  legend: ApexLegend;
  stroke: ApexStroke;
  dataLabels: ApexDataLabels;
};

@Component({
  selector: 'app-venue-insights-card',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule, AngularSvgIconModule],
  templateUrl: './venue-insights-card.component.html',
  styleUrls: ['./venue-insights-card.component.css'],
})
export class VenueInsightsCardComponent implements OnChanges {
  @Input() donutChartData: any;
  @Input() barChartData: any;

  @ViewChild('donutChart') donutChart!: ChartComponent;
  public donutChartOptions!: Partial<DonutChartOptions>;

  @ViewChild('barChart') barChart!: ChartComponent;
  public barChartOptions!: Partial<BarChartOptions>;

  constructor() {}

  /** ✅ Handle donutChartData dynamically */
  ngOnChanges(changes: SimpleChanges): void {
    console.log(this.donutChartData, 'donutChartData');
    if (changes['donutChartData'] && this.donutChartData) {
      console.log('📊 donutChartData:', this.donutChartData);

      this.donutChartOptions = {
        series: this.donutChartData.series, // 👉 [0, 1, 0]
        labels: this.donutChartData.labels, // 👉 ['<500 Seats', '500-1000 Seats', '>1000 Seats']
        colors: this.donutChartData.colors, // 👉 ['#A7C7E7', '#90EE90', '#FFB6B6']
        chart: {
          type: 'donut',
          height: this.donutChartData.chart_config?.height || 300,
        },
        dataLabels: { enabled: true },
        legend: { position: 'bottom' },
        plotOptions: {
          pie: {
            donut: {
              size: '65%',
              labels: {
                show: true,
                total: {
                  show: true,
                  label: this.donutChartData.chart_config?.total_label || 'Venues',
                  formatter: () =>
                    this.donutChartData.chart_config?.center_text || this.donutChartData.total.toString(),
                },
              },
            },
          },
        },
        responsive: [
          {
            breakpoint: 640,
            options: {
              chart: { width: 250 },
            },
          },
        ],
      };
    }

    if (changes['barChartData'] && this.barChartData) {
      console.log('📊 barChartData:', this.barChartData);
      this.barChartOptions = {
        series: this.barChartData.series, // API से मिला [{name, data}, {...}]
        chart: {
          type: 'bar',
          stacked: true,
          height: 300,
          toolbar: { show: false },
        },
        xaxis: {
          categories: this.barChartData.xaxis.categories, // ✅ ['Sun', 'Mon', 'Tue', ...]
        },
        colors: this.barChartData.colors, // ✅ API से आए colors
        plotOptions: {
          bar: {
            horizontal: false,
            columnWidth: '50%',
            borderRadius: 6,
          },
        },
        dataLabels: {
          enabled: true,
          style: { colors: ['#000'] },
        },
        fill: { opacity: 1 },
        legend: { position: 'bottom' },
        tooltip: {
          y: {
            formatter: (val) => `${val} slots`,
          },
        },
        stroke: {
          show: true,
          width: 1,
          colors: ['#fff'],
        },
      };
    }
  }
}
