import { CommonModule, NgIf } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { NgApexchartsModule } from 'ng-apexcharts';
import { NftHeaderComponent } from '../nft/nft-header/nft-header.component';
import { ChartOptions } from '../../../../shared/models/chart-options';

import { Router } from '@angular/router';
import { InfrastructureManagementCardComponent } from './cards/cards.component';
import { VenueAnalyticsService } from 'src/app/core/services/venue-analytics.service';
import { VenueAnalyticsDistrictCardComponent } from './venue-analytics-district-card/venue-analytics-district-card.component';
import { VenueInsightsCardComponent } from './venue-insights-card/venue-insights-card.component';
import { VenueFacilitiesCardComponent } from './venue-facilities-card/venue-facilities-card.component';
import { VenueFacilityBookingCardComponent } from './venue-facility-booking-card/venue-facility-booking-card.component';
import { CalendarComponent } from '../event-management/calendar/calendar.component';
import { VenueListComponent } from './venue-list/venue-list.component';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-infrastructure-management',
  imports: [
    NftHeaderComponent,
    NgIf,
    NgApexchartsModule,
    AngularSvgIconModule,
    CommonModule,
    InfrastructureManagementCardComponent,
    VenueAnalyticsDistrictCardComponent,
    VenueInsightsCardComponent,
    VenueFacilitiesCardComponent,
    VenueFacilityBookingCardComponent,
    CalendarComponent,
    VenueListComponent,
  ],
  templateUrl: './infrastructure-management.component.html',
  styleUrl: './infrastructure-management.component.css',
})
export class InfrastructureManagementComponent implements OnInit, OnDestroy {
  public chartOptions: Partial<ChartOptions>;

  analyticsdata: any = {
    total_venues: { counts: 0, percentage: 0, direction: 'neutral' },
    total_venue_verified: { counts: 0, percentage: 0, direction: 'neutral' },
    venue_awaiting_verification: { counts: 0, percentage: 0, direction: 'neutral' },
    venue_awaiting_rejected: { counts: 0, percentage: 0, direction: 'neutral' },
  };

  filters = {
    donut_filter: { status: 'active', time_period: null },
    pie_chart_filter: { time_period: null },
    top_rated_facility_filter: { district: 'kolkata', sport_type: null },
    total_venue_by_district_filter: { district: 'west_bengal', sport_type: null },
    facilities_per_sports_filter: { time_period: 'last_6_months' },
    booking_by_user_type_filter: { time_period: null },
    // calender_filter: { year: 2025, month: 5, sport_type: 'tennis', view_type: 'week' },
    // feedback_filter: { page: 1, limit: 5 },
  };

  feedback: any;
  topRatedFacilities: any;
  facilities_per_sports: any;
  booking_by_user_type: any;
  totalFacilities: number = 0;
  donut_chart_data: any;
  barChartData: any;
  facility_booking_rates: any;
  calendar_events: any;
  showActions: boolean = false;
  sports: any[] = [];
  months: any[] = [];
  districts: any[] = [];

  constructor(private router: Router, private venueService: VenueAnalyticsService) {
    this.chartOptions = {
      series: [
        {
          name: 'Athletes',
          data: [144, 195, 177, 200, 211, 259],
        },
        {
          name: 'Coaches',
          data: [96, 105, 141, 168, 187, 169],
        },
      ],
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '10%',
          borderRadius: 10,
        },
      },
      //  grid: {
      //   row: {
      //     colors: ["#f3f3f3", "transparent"], // takes an array which will be repeated on columns
      //     opacity: 0.5
      //   }
      // },
      dataLabels: {
        enabled: false, // inside chart counter
      },
      chart: {
        fontFamily: 'inherit',
        type: 'bar',
        height: 350,
        //width: 800, // Optional: Adjust container width for visual precision
        toolbar: {
          show: false,
        },
        sparkline: {
          enabled: false,
        },
      },
      // fill: {
      //   type: 'gradient',
      //   gradient: {
      //     shadeIntensity: 1,
      //     opacityFrom: 0.4,
      //     opacityTo: 0.2,
      //     stops: [15, 120, 100],
      //   },
      // },
      fill: {
        opacity: 1,
      },
      // stroke: {
      //   curve: 'smooth',
      //   show: true,
      //   width: 3,
      //   colors: [baseColor], // line color
      // },
      stroke: {
        // curve: 'smooth',
        show: false,
        // width: 2,
        // colors: ['#000'], // line color
      },
      xaxis: {
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      },
      tooltip: {
        y: {
          formatter: function (val) {
            return '' + val;
          },
        },
      },
      colors: ['#A7C7E7', '#FFC78E'], //line colors
    };
  }

  ngOnInit(): void {
    this.fetchVenueAnalytics();
    this.getDropdownsForVenue();
  }

  ngOnDestroy(): void {}

  visible: boolean = false;

  toggleDisplay() {
    this.visible = !this.visible;
  }

  goToAddVenue() {
    this.router.navigate(['/dashboard/add-new-venue']);
  }

  fetchVenueAnalytics() {
    this.venueService.getVenueAnalytics(this.filters).subscribe({
      next: (res) => {
        if (res?.status?.success) {
          this.analyticsdata = {
            total_venues: res.data.dashboard_analytics.total_venues,
            total_venue_verified: res.data.dashboard_analytics.total_venue_verified,
            venue_awaiting_verification: res.data.dashboard_analytics.venue_awaiting_verification,
            venue_awaiting_rejected: res.data.dashboard_analytics.venue_rejected,
          };
          this.feedback = res.data.feedback.data;

          this.topRatedFacilities = res.data.top_rated_facility.facilities;
          this.facilities_per_sports = res.data.facilities_per_sports;
          this.booking_by_user_type = res.data.booking_by_user_type.data;
          this.totalFacilities = res.data.total_facilities;
          this.donut_chart_data = res.data.donut_chart;
          this.barChartData = res.data.pie_chart;
          this.facility_booking_rates = res.data.facility_booking_rates;
          this.calendar_events = res.data.calendar_events;
        }
      },
      error: (err) => {
        console.error('❌ Venue Analytics API Error:', err);
      },
    });
  }

  onViewAllClicked() {
    this.showActions = true;
  }

  async getDropdownsForVenue() {
    const payload = {
      sports: true,
      districts: true,
      admin_months_filter: true,
    };

    try {
      const res: any = await lastValueFrom(this.venueService.getDropdownLists(payload));

      if (res?.status?.success) {
        // ✅ Map API response to add `selected: false`
        console.log('jksdfkjshkdjg', res.data);
        this.months = res.data.admin_months_filter;
        this.sports = res.data.sports;
        this.districts = res.data.districts;
      }
    } catch (error) {
      console.error('❌ Error loading dropdown data:', error);
    }
  }
  onFilterUpdate(event: { key: string; value: any }) {
    console.log('🔥 Filter updated:', event);
    this.filters[event.key] = event.value;
    this.fetchVenueAnalytics();
  }
}
