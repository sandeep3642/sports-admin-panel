import { Component, Input, ViewChild, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  NgApexchartsModule,
  ChartComponent,
  ApexChart,
  ApexAxisChartSeries,
  ApexXAxis,
  ApexYAxis,
  ApexPlotOptions,
  ApexDataLabels,
  ApexFill,
  ApexTooltip,
  ApexStroke,
} from 'ng-apexcharts';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { VenueAnalyticsService } from 'src/app/core/services/venue-analytics.service';

export type BarChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  fill: ApexFill;
  tooltip: ApexTooltip;
  colors: string[];
  plotOptions: ApexPlotOptions;
  dataLabels: ApexDataLabels;
  stroke: ApexStroke;
};

@Component({
  selector: 'app-venue-facilities-card',
  standalone: true,
  imports: [CommonModule, FormsModule, NgApexchartsModule, AngularSvgIconModule],
  templateUrl: './venue-facilities-card.component.html',
  styleUrls: ['./venue-facilities-card.component.css'],
})
export class VenueFacilitiesCardComponent implements OnChanges {
  @ViewChild('facilitiesChart') facilitiesChart!: ChartComponent;
  public facilitiesChartOptions!: Partial<BarChartOptions>;

  @Input() facilities_per_sports: any[] = [];
  @Input() booking_by_user_type: any[] = [];
  @Input() months: any[] = [];
  @Output() filterChanged = new EventEmitter<{ key: string; value: any }>();
  facilitiesPerSportsValue: string | null = null;
  bookingByUserTypeValue: string | null = null;

  selectedPeriod1: string = '6';

  // ✅ Configuration for handling large datasets
  private readonly MAX_VISIBLE_ITEMS = 5;
  showAllItems = false;
  displayedData: any[] = [];

  constructor(private venueService: VenueAnalyticsService) {
    this.initializeChart();
  }

  ngOnInit() {
    if (this.facilities_per_sports?.length) {
      this.updateChartData();
    }

    this.updateChartData();
  }

  onFacilitiesPerSportsChange(period: string) {
    this.facilitiesPerSportsValue = period;
    this.filterChanged.emit({
      key: 'facilities_per_sports_filter',
      value: { time_period: this.facilitiesPerSportsValue },
    });
  }

  /** ✅ Booking by user type dropdown change */
  onBookingByUserTypeChange(period: string) {
    this.bookingByUserTypeValue = period;
    this.filterChanged.emit({
      key: 'booking_by_user_type_filter',
      value: { time_period: this.bookingByUserTypeValue },
    });
  }

  private initializeChart() {
    this.facilitiesChartOptions = {
      series: [{ name: 'Facilities', data: [] }],
      chart: {
        type: 'bar',
        toolbar: { show: false },
        background: 'transparent',
      },
      plotOptions: {
        bar: {
          horizontal: true,
          borderRadius: 8,
          borderRadiusApplication: 'around' as any,
          dataLabels: { position: 'center' },
          barHeight: '70%',
          distributed: true,
        } as any,
      },
      dataLabels: {
        enabled: true,
        formatter: (val: number) => val.toString(),
        style: {
          fontSize: '12px',
          fontWeight: 'bold',
          colors: ['#FFFFFF'],
        },
      },
      xaxis: {
        categories: [],
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: { show: false },
      },
      yaxis: {
        labels: {
          style: {
            fontSize: '13px',
            fontWeight: '500',
            colors: ['#374151'],
          },
          maxWidth: 120,
        },
      },
      colors: this.generateColors(50), // Generate enough colors
      fill: {
        opacity: 1,
        type: 'gradient',
        gradient: {
          shade: 'light',
          type: 'horizontal',
          shadeIntensity: 0.25,
          gradientToColors: this.generateGradientColors(50),
          inverseColors: false,
          opacityFrom: 1,
          opacityTo: 0.85,
          stops: [0, 100],
        },
      },
      tooltip: {
        y: { formatter: (val: number) => `${val} facilities` },
      },
      stroke: {
        show: true,
        width: 1,
        colors: ['#FFFFFF'],
      },
    };
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['facilities_per_sports'] && this.facilities_per_sports) {
      this.updateChartData();
    }
  }

  private updateChartData() {
    if (!this.facilities_per_sports?.length) {
      this.displayedData = [];
      return;
    }

    // ✅ Sort by count (descending) and handle display logic
    const sortedData = [...this.facilities_per_sports]
      .sort((a, b) => b.count - a.count)
      .map((item) => ({
        ...item,
        label: this.truncateLabel(item.label, 18),
      }));

    // ✅ Determine what data to display
    this.displayedData = this.showAllItems ? sortedData : sortedData.slice(0, this.MAX_VISIBLE_ITEMS);

    const categories = this.displayedData.map((item) => item.label);
    const data = this.displayedData.map((item) => item.count);

    // ✅ Calculate dynamic height based on items
    const dynamicHeight = this.calculateChartHeight(this.displayedData.length);

    // ✅ Update chart options safely
    this.facilitiesChartOptions = {
      ...this.facilitiesChartOptions,
      series: [{ name: 'Facilities', data }],
      chart: {
        ...this.facilitiesChartOptions.chart!,
        height: dynamicHeight,
      },
      xaxis: {
        ...this.facilitiesChartOptions.xaxis!,
        categories,
      },
    };
  }

  private calculateChartHeight(itemCount: number): number {
    const baseHeight = 200;
    const itemHeight = 40;
    const maxHeight = 600;

    const calculatedHeight = baseHeight + itemCount * itemHeight;
    return Math.min(calculatedHeight, maxHeight);
  }

  private truncateLabel(label: string, maxLength: number): string {
    return label.length > maxLength ? label.substring(0, maxLength) + '...' : label;
  }

  private generateColors(count: number): string[] {
    const baseColors: string[] = [
      '#8B5CF6',
      '#06B6D4',
      '#F59E0B',
      '#EF4444',
      '#10B981',
      '#F97316',
      '#84CC16',
      '#EC4899',
      '#6366F1',
      '#14B8A6',
      '#F472B6',
      '#A78BFA',
      '#34D399',
      '#FCD34D',
      '#FCA5A5',
    ];

    const colors: string[] = []; // ✅ Explicit type added
    for (let i = 0; i < count; i++) {
      colors.push(baseColors[i % baseColors.length]);
    }
    return colors;
  }

  private generateGradientColors(count: number): string[] {
    const baseGradients: string[] = [
      '#A78BFA',
      '#67E8F9',
      '#FCD34D',
      '#FCA5A5',
      '#34D399',
      '#FB923C',
      '#A3E635',
      '#F472B6',
      '#818CF8',
      '#2DD4BF',
      '#F9A8D4',
      '#C4B5FD',
      '#6EE7B7',
      '#FDE68A',
      '#FECACA',
    ];

    const gradients: string[] = []; // ✅ Explicit type added
    for (let i = 0; i < count; i++) {
      gradients.push(baseGradients[i % baseGradients.length]);
    }
    return gradients;
  }

  // ✅ Toggle between showing limited and all items
  toggleShowAll() {
    this.showAllItems = !this.showAllItems;
    this.updateChartData();
  }

  // ✅ Get summary statistics
  get totalFacilities(): number {
    return this.facilities_per_sports?.reduce((sum, item) => sum + item.count, 0) || 0;
  }

  get sportsCount(): number {
    return this.facilities_per_sports?.length || 0;
  }

  get averageFacilities(): number {
    return this.sportsCount > 0 ? Math.round(this.totalFacilities / this.sportsCount) : 0;
  }

  get shouldShowToggle(): boolean {
    return this.facilities_per_sports?.length > this.MAX_VISIBLE_ITEMS;
  }

  get toggleButtonText(): string {
    return this.showAllItems ? `Show Top ${this.MAX_VISIBLE_ITEMS}` : `Show All (${this.sportsCount})`;
  }

  onPeriodChange() {
    this.showAllItems = false;
    this.updateChartData();
  }

  downloadExcel(type?: string) {
    const payload = {
      type: type || 'booking_by_user_type',
      time_period: type === 'facilities_per_sports' ? this.facilitiesPerSportsValue : this.bookingByUserTypeValue,
    };

    this.venueService.donwloadReport(payload).subscribe((response: Blob) => {
      const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = 'VenueReport.xlsx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    });
  }
}
