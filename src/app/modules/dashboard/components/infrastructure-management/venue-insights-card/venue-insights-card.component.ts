import { Component, Input, ViewChild, OnChanges, SimpleChanges, EventEmitter, Output } from '@angular/core';
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
import { FormsModule } from '@angular/forms';

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
  imports: [CommonModule, NgApexchartsModule, AngularSvgIconModule, FormsModule],
  templateUrl: './venue-insights-card.component.html',
  styleUrls: ['./venue-insights-card.component.css'],
})
export class VenueInsightsCardComponent implements OnChanges {
  @Output() filterChanged = new EventEmitter<{ key: string; value: any }>();
  @Input() donutChartData: any;
  @Input() barChartData: any;
  @Input() months: any[] = [];

  summary?: string;
  @ViewChild('donutChart') donutChart!: ChartComponent;
  public donutChartOptions!: Partial<DonutChartOptions>;

  @ViewChild('barChart') barChart!: ChartComponent;
  public barChartOptions!: Partial<BarChartOptions>;

  donutFilterValue?: string;
  pieChartFilterValue?: string;

  constructor() {}

  /** ✅ Handle donutChartData dynamically */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['donutChartData'] && this.donutChartData) {
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
      this.summary = this.barChartData.summary.description;

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

  onDonutFilterChange(period: string) {
    this.donutFilterValue = period;
    this.filterChanged.emit({
      key: 'donut_filter',
      value: { time_period: this.donutFilterValue },
    });
  }

  /** ✅ Pie chart filter ke liye method */
  onPieChartFilterChange(period: string) {
    this.pieChartFilterValue = period;
    this.filterChanged.emit({
      key: 'pie_chart_filter',
      value: { time_period: this.pieChartFilterValue },
    });
  }
}
