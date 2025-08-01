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
  @Input() pie_chart: any;
  public chartOptions: Partial<ChartOptions> = {};

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['pie_chart'] && this.pie_chart) {
      this.chartOptions = {
        series: this.pie_chart.series || [],
        chart: this.pie_chart.chart || {
          type: 'bar',
          height: 350,
          toolbar: { show: false }
        },
        xaxis: this.pie_chart.xaxis || { categories: [] },
        yaxis: this.pie_chart.yaxis || {},
        dataLabels: { enabled: false },
        fill: { opacity: 1 },
        stroke: {
          show: true,
          width: 2,
          colors: ['transparent']
        },
        tooltip: {
          y: {
            formatter: (val: number) => `${val}`
          }
        },
        legend: this.pie_chart.legend || { position: 'bottom' },
        grid: this.pie_chart.grid || {},
        title: this.pie_chart.title || {},
        states: this.pie_chart.states || {},
        responsive: this.pie_chart.responsive || [],
        colors: this.pie_chart.colors || ['#A7C7E7', '#FFC78E']
      };
    }
  }
}
