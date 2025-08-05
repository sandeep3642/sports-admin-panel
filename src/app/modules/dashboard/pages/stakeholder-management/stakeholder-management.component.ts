import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ViewChild,
  ElementRef,
  NgZone
} from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { FormsModule, FormGroup } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { NgApexchartsModule } from 'ng-apexcharts';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

import { ThemeService } from 'src/app/core/services/theme.service';
import { StackholderService } from 'src/app/core/services/stackholder.service';
import { ChartOptions } from 'src/app/shared/models/chart-options';

import { NftHeaderComponent } from '../../components/nft/nft-header/nft-header.component';
import { UserStatsCardComponent } from '../../components/stakeholder-management/user-stats-card/user-stats-card.component';
import { StakeholderTableComponent } from '../../components/stakeholder-management/stakeholder-table/stakeholder-table.component';
import { PiechartComponent } from '../../components/stakeholder-management/charts/piechart/piechart.component';
import { DonutchartComponent } from '../../components/stakeholder-management/charts/donutchart/donutchart.component';
import { ButtonComponent } from 'src/app/shared/components/button/button.component';

declare var google: any;

@Component({
  selector: 'app-stakeholder-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgIf,
    RouterLink,
    NgApexchartsModule,
    AngularSvgIconModule,
    MatDialogModule,
    MatButtonModule,
    NftHeaderComponent,
    UserStatsCardComponent,
    StakeholderTableComponent,
    PiechartComponent,
    DonutchartComponent,
    ButtonComponent
  ],
  templateUrl: './stakeholder-management.component.html',
  styleUrl: './stakeholder-management.component.css'
})
export class StakeholderManagementComponent implements OnInit, OnDestroy, AfterViewInit {
  public chartOptions: Partial<ChartOptions>;
  public stakelist: any;
  public countsData: any;
  public athletesData: any;
  public donut_chart: any;
  public pie_chart: any;

  public selectedStatus = 'active';
  public selectedTime: any;
  public selectedUser = 'Athletes';

  public donutFilter = {
    status: 'active',
    time_period: ''
  };

  public pieChartFilter = {
    district: '',
    time_period: ''
  };

  public months: any[] = [];
  public districts: any[] = [];

  public visible = false;

  public selectedLocation: any = {}; // store selected lat/lng & address

  map: any;
  marker: any;
  geocoder: any;
  mapInitialized = false;

  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;

  constructor(
    private themeService: ThemeService,
    public stackholderService: StackholderService,
    private ngZone: NgZone
  ) {
    this.chartOptions = {
      series: [
        {
          name: 'Athletes',
          data: [144, 195, 177, 200, 211, 259]
        },
        {
          name: 'Coaches',
          data: [96, 105, 141, 168, 187, 169]
        }
      ],
      chart: {
        fontFamily: 'inherit',
        type: 'bar',
        height: 350,
        toolbar: { show: false },
        sparkline: { enabled: false }
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '10%',
          borderRadius: 10
        }
      },
      dataLabels: { enabled: false },
      fill: { opacity: 1 },
      stroke: { show: false },
      xaxis: {
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
      },
      tooltip: {
        y: { formatter: val => `${val}` }
      },
      colors: ['#A7C7E7', '#FFC78E']
    };
  }

  ngOnInit(): void {
    this.getStakeList();
    this.getCount();
    this.getAthletes();
    this.getDropdownData();
    this.getStakeAnalytics();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.loadGoogleMaps();
    }, 100);
  }

  ngOnDestroy(): void { }

  toggleDisplay(): void {
    this.visible = !this.visible;
  }

  loadGoogleMaps(): void {
    if (typeof google !== 'undefined' && google.maps) {
      this.initializeMap();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBdJkHovEH-NjsxqOEYAwF2x9n3UmNFNCU&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      this.initializeMap();
    };
    document.head.appendChild(script);
  }

  initializeMap(): void {
    const defaultLocation = { lat: 22.5726, lng: 88.3639 };

    if (!this.mapContainer?.nativeElement) return;

    this.map = new google.maps.Map(this.mapContainer.nativeElement, {
      center: defaultLocation,
      zoom: 10,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false
    });

    this.geocoder = new google.maps.Geocoder();
    this.mapInitialized = true;

    this.map.addListener('click', (event: any) => {
      this.placeMarker(event.latLng);
    });

    // Reset map & marker
    setTimeout(() => {
      if (this.map && this.selectedLocation?.lat) {
        this.map.setCenter(this.selectedLocation);
        this.map.setZoom(15);

        if (this.marker) this.marker.setMap(null);

        this.marker = new google.maps.Marker({
          position: this.selectedLocation,
          map: this.map,
          title: 'Selected Venue Location',
          draggable: true
        });

        this.marker.addListener('dragend', (event: any) => {
          this.placeMarker(event.latLng);
        });
      }
    }, 500);
  }

  placeMarker(location: any): void {
    if (this.marker) this.marker.setMap(null);

    this.marker = new google.maps.Marker({
      position: location,
      map: this.map,
      draggable: true,
      title: 'Total Users by Locations',
      animation: google.maps.Animation.DROP
    });

    this.ngZone.run(() => {
      this.selectedLocation = {
        lat: location.lat(),
        lng: location.lng(),
        address: `Lat: ${location.lat().toFixed(6)}, Lng: ${location.lng().toFixed(6)}`
      };
    });

    this.reverseGeocode(location);

    this.marker.addListener('dragend', (event: any) => {
      this.placeMarker(event.latLng);
    });
  }

  reverseGeocode(location: any): void {
    if (this.geocoder) {
      this.geocoder.geocode({ location }, (results: any, status: any) => {
        if (status === 'OK' && results[0]) {
          this.ngZone.run(() => {
            this.selectedLocation.address = results[0].formatted_address;
          });
        }
      });
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  getStakeList(): void {
    const payload = { page: 1, limit: 5, filters: {} };

    this.stackholderService.getListing(payload).subscribe({
      next: res => this.stakelist = res.data.customers,
      error: err => console.error('Failed to fetch list:', err)
    });
  }

  getCount(): void {
    this.stackholderService.getCounts().subscribe({
      next: res => this.countsData = res.data?.dashboard_analytics,
      error: err => console.error('Failed to fetch counts:', err)
    });
  }

  getAthletes(): void {
    const payload = {
      status: this.selectedStatus,
      time_period: this.selectedTime,
      user_type: this.selectedUser,
      district: 'Kolkata'
    };

    this.stackholderService.getAthletes(payload).subscribe({
      next: res => this.athletesData = res.data,
      error: err => console.error('Failed to fetch athletes:', err)
    });
  }

  getDropdownData(): void {
    const payload = {
      sports: true,
      roles_ddl: true,
      districts: true,
      admin_months_filter: true
    };

    this.stackholderService.getDropdownLists(payload).subscribe({
      next: res => {
        if (res?.status?.success) {
          this.months = res.data.admin_months_filter;
          this.districts = res.data.districts;
        }
      },
      error: err => console.error('Failed to fetch dropdown data:', err)
    });
  }

  onPieChartFilterChange(value: string, type: string): void {
    this.pieChartFilter[type] = value;
    this.getStakeAnalytics();
  }

  onDonutFilterChange(value: string, type: string): void {
    this.donutFilter[type] = value;
    this.getStakeAnalytics();
  }

  getStakeAnalytics(): void {
    const payload = {
      donut_filter: this.donutFilter,
      pie_chart_filter: this.pieChartFilter
    };

    this.stackholderService.getStakeAnalytics(payload).subscribe({
      next: res => {
        if (res?.status?.success && res.data) {
          this.processAnalyticsResponse(res.data);
        }
      },
      error: err => this.handleError(err)
    });
  }

  private processAnalyticsResponse(data: any): void {
    this.donut_chart = {
      series: data.donut_chart?.series || [0, 0],
      labels: data.donut_chart?.labels || ['Active Users', 'Inactive Users'],
      colors: data.donut_chart?.colors || ['#A7C7E7', '#FFC78E'],
      chart: data.donut_chart?.chart || { type: 'donut', height: 350 },
      responsive: data.donut_chart?.responsive || []
    };

    this.pie_chart = {
      series: data.pie_chart?.series || [],
      xaxis: data.pie_chart?.xaxis || { categories: ['Aug'] }
    };
  }

  private handleError(error: any): void {
    console.error('Component error:', error);
  }

  // Helper methods
  getSortedSteps(statusObj: any): any[] {
    return Object.values(statusObj || {}).sort((a: any, b: any) => (a.order_num || 0) - (b.order_num || 0));
  }

  getActiveStepCount(statusObj: any): number {
    return this.getSortedSteps(statusObj).filter((step: any) => step.is_active).length;
  }

  getTotalStepCount(statusObj: any): number {
    return this.getSortedSteps(statusObj).length;
  }

  getProgressPercent(status: any): string {
    const total = this.getTotalStepCount(status);
    const active = this.getActiveStepCount(status);
    return `${total ? Math.round((active / total) * 100) : 0}%`;
  }

  isFinalStatus(statusObj: any): boolean {
    return ['approved', 'rejected'].some(key => statusObj?.[key]?.is_active);
  }

  getFinalStatus(statusObj: any): string {
    if (statusObj?.approved?.is_active) return 'Approved';
    if (statusObj?.rejected?.is_active) return 'Rejected';
    return '';
  }
}
