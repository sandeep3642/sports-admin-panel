import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
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

// Interface for API data structure
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
  imports: [FormsModule, NgApexchartsModule, AngularSvgIconModule,CommonModule],
  templateUrl: './venue-facility-booking-card.component.html',
  styleUrls: ['./venue-facility-booking-card.component.css'],
})
export class VenueFacilityBookingCardComponent implements OnInit, OnChanges {
  @Input() facility_booking_rates: FacilityBookingData['facility_booking_rates'] | null = null;

  public chartOptions: Partial<ChartOptions> = {};
  public selectedCategory: string = 'Cricket';
  public categories: string[] = ['Cricket', 'Football', 'Basketball', 'Tennis'];

  constructor() {}

  ngOnInit(): void {
    if (this.facility_booking_rates) {
      this.initializeChart();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['facility_booking_rates'] && this.facility_booking_rates) {
      // this.selectedCategory = this.capitalizeFirst(this.facility_booking_rates.sport_category);
      this.initializeChart();
    }
  }

  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  initializeChart(): void {
    if (!this.facility_booking_rates) {
      return;
    }

    const data = this.facility_booking_rates;
    const facilities = data.facilities;

    // Extract data for chart
    const facilityNames = facilities.map((facility) => facility.name);
    const bookingRates = facilities.map((facility) => facility.booking_rate);

    // Calculate dynamic max value with some padding
    const maxRate = Math.max(...bookingRates);
    const yAxisMax = Math.ceil((maxRate * 1.1) / 100) * 100; // Round up to nearest 100

    this.chartOptions = {
      series: [
        {
          name: 'Booking Rates',
          data: bookingRates,
        },
      ],
      chart: {
        height: data.chart_config.height || 400,
        type: 'bar',
        toolbar: {
          show: false,
        },
        background: 'transparent',
      },
      plotOptions: {
        bar: {
          borderRadius: 4,
          columnWidth: '50%', // Reduced bar width
          dataLabels: {
            position: 'top',
          },
        },
      },
      dataLabels: {
        enabled: false,
      },
      xaxis: {
        categories: facilityNames,
        labels: {
          style: {
            colors: '#6B7280',
            fontSize: '12px',
            fontFamily: 'Inter, sans-serif',
          },
        },
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
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
          formatter: function (val) {
            return val.toString();
          },
        },
      },
      grid: {
        borderColor: '#E5E7EB',
        strokeDashArray: 0,
        xaxis: {
          lines: {
            show: false,
          },
        },
        yaxis: {
          lines: {
            show: true,
          },
        },
      },
      fill: {
        type: 'solid',
        opacity: 1,
      },
      colors: ['#93C5FD'],
      tooltip: {
        y: {
          formatter: function (val) {
            return val + ' bookings';
          },
        },
        style: {
          fontSize: '12px',
          fontFamily: 'Inter, sans-serif',
        },
      },
    };
  }

  onCategoryChange(): void {
    // Here you can implement logic to update chart data based on selected category
    console.log('Selected category:', this.selectedCategory);
    // You would typically call an API or update the chart data here
  }
}
