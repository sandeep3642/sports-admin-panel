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
    if (changes['donut_chart'] && this.donut_chart) {
      this.chartOptions = {
        series: this.donut_chart.series || [],
        chart: this.donut_chart.chart || { type: 'donut', height: 350 },
        labels: this.donut_chart.labels || [],
        responsive: this.donut_chart.responsive || [],
        colors: this.donut_chart.colors || [],
        legend: this.donut_chart.legend || { position: 'bottom' },

      };
    }
  }
}

