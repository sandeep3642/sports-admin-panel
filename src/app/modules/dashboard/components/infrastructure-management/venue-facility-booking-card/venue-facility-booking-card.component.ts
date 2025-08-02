import { Component, OnInit, Input, OnChanges, SimpleChanges, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgApexchartsModule } from 'ng-apexcharts';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexYAxis,
  ApexDataLabels,
  ApexGrid,
  ApexFill,
  ApexTooltip,
  ApexPlotOptions,
} from 'ng-apexcharts';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { CommonModule } from '@angular/common';
import { EventEmitter } from '@angular/core';

export interface FacilityBookingData {
  facility_booking_rates: {
    sport_category: string;
    facilities: Array<{
      si: number;
      name: string;
      booking_rate: number;
      percentage: number;
    }>;
    statistics: {
      total_bookings: number;
      average_booking_rate: number;
      max_booking_rate: number;
      min_booking_rate: number;
      total_facilities: number;
    };
    chart_config: {
      type: string;
      height: number;
      title: string;
      subtitle: string;
      y_axis_label: string;
      x_axis_label: string;
    };
  };
}

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  dataLabels: ApexDataLabels;
  grid: ApexGrid;
  fill: ApexFill;
  tooltip: ApexTooltip;
  plotOptions: ApexPlotOptions;
  colors: string[];
};

@Component({
  selector: 'app-venue-facility-booking-card',
  standalone: true,
  imports: [FormsModule, NgApexchartsModule, AngularSvgIconModule, CommonModule],
  templateUrl: './venue-facility-booking-card.component.html',
  styleUrls: ['./venue-facility-booking-card.component.css'],
})
export class VenueFacilityBookingCardComponent implements OnInit, OnChanges {
  @Input() facility_booking_rates: FacilityBookingData['facility_booking_rates'] | null = null;
  @Input() sports: any[] = [];
  @Output() filterChanged = new EventEmitter<{ key: string; value: any }>();

  public chartOptions: Partial<ChartOptions> = {};
  public selectedCategory: string | null = null;

  constructor() {}

  ngOnInit(): void {
    if (this.facility_booking_rates) {
      this.initializeChart();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['facility_booking_rates'] && this.facility_booking_rates) {
      this.initializeChart();
    }
  }

  initializeChart(): void {
    if (!this.facility_booking_rates) return;

    const data = this.facility_booking_rates;
    const facilities = data.facilities;

    const facilityNames = facilities.map((facility) => facility.name);
    const bookingRates = facilities.map((facility) => facility.booking_rate);

    const maxRate = Math.max(...bookingRates);
    const yAxisMax = Math.ceil((maxRate * 1.1) / 100) * 100;

    this.chartOptions = {
      series: [{ name: 'Booking Rates', data: bookingRates }],
      chart: {
        height: data.chart_config.height || 400,
        type: 'bar',
        toolbar: { show: false },
        background: 'transparent',
      },
      plotOptions: {
        bar: {
          borderRadius: 4,
          columnWidth: '50%',
          dataLabels: { position: 'top' },
        },
      },
      dataLabels: { enabled: false },
      xaxis: {
        categories: facilityNames,
        labels: {
          style: {
            colors: '#6B7280',
            fontSize: '12px',
            fontFamily: 'Inter, sans-serif',
          },
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        min: 0,
        max: yAxisMax,
        tickAmount: 7,
        labels: {
          style: {
            colors: '#6B7280',
            fontSize: '12px',
            fontFamily: 'Inter, sans-serif',
          },
          formatter: (val) => val.toString(),
        },
      },
      grid: {
        borderColor: '#E5E7EB',
        strokeDashArray: 0,
        xaxis: { lines: { show: false } },
        yaxis: { lines: { show: true } },
      },
      fill: { type: 'solid', opacity: 1 },
      colors: ['#93C5FD'],
      tooltip: {
        y: { formatter: (val) => val + ' bookings' },
        style: { fontSize: '12px', fontFamily: 'Inter, sans-serif' },
      },
    };
  }

  /** ✅ dropdown change */
  onCategoryChange(category: string): void {
    this.selectedCategory = category;
    this.emitFacilityBookingRatesFilter();
  }

  /** ✅ emit correct filter key */
  emitFacilityBookingRatesFilter() {
    this.filterChanged.emit({
      key: 'facility_booking_rates_filter',
      value: {
        sport_type: this.selectedCategory,
      },
    });
  }
}
