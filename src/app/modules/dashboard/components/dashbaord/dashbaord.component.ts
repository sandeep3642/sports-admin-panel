import { Component, OnDestroy, OnInit, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef } from '@angular/core';

declare var google: any;
import { ThemeService } from 'src/app/core/services/theme.service';
import { StackholderService } from 'src/app/core/services/stackholder.service';
import { DashboardService } from 'src/app/core/services/dashboard.service';
import { NftHeaderComponent } from '../../components/nft/nft-header/nft-header.component';
import { DashboardKpiCardsComponent } from '../../../../shared/components/dashboard-kpi-cards/dashboard-kpi-cards.component';
import { NgIf, NgFor, NgClass, NgSwitch, NgSwitchCase, NgSwitchDefault, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgApexchartsModule } from 'ng-apexcharts';
import { ChartOptions } from '../../../../shared/models/chart-options';

import { AngularSvgIconModule } from 'angular-svg-icon';

interface SportCategory {
  id: string;
  name: string;
  description: string;
  iconPath: string;
  color: string;
}
@Component({
  selector: 'app-dashbaord',
    imports: [NftHeaderComponent, DashboardKpiCardsComponent,
    NgIf,
    NgFor,
    NgClass,
    NgSwitch,
    NgSwitchCase,
    NgSwitchDefault,
    TitleCasePipe,
    FormsModule,
    NgApexchartsModule,
    AngularSvgIconModule
    ],
  templateUrl: './dashbaord.component.html',
  styleUrl: './dashbaord.component.css'
})

export class DashbaordComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('venueMapContainer') venueMapContainer!: ElementRef;
  public chartOptions: Partial<ChartOptions> | null = null;
  public donutChartOptions: any = null;
  public facilityChartOptions: any = null;
  userName: string = 'User';

  // Map related properties
  venueMap: any;
  venueMapInitialized: boolean = false;
  googleMapsLoaded: boolean = false;
  venueMarkers: any[] = [];
  errorInfoWindow: any = null;

  // Dropdown data
  districts: any[] = [];
  months: any[] = [];
  ageGroups: any[] = [];

  // Filter selections
  selectedDistrict: string = 'kolkata';
  selectedTime: string = 'past_6_months';
  selectedVenueDistrict: string = '';
  selectedVenueTime: string = '';
  selectedFacilityTime: string = '';
  selectedAthleteAgeGroup: string = '';

  // Active/Inactive Users Chart properties
  selectedActiveInactiveStatus: string = 'active';
  selectedActiveInactiveTime: string = 'last_6_months';
  activeInactiveChartData: any = null;

  // User Registration Chart properties
  userRegistrationGrowthMessage: string = '';
  userRegistrationChartLoading: boolean = false;
  userRegistrationChartError: string = '';
  userRegistrationHasData: boolean = true;

  // Active/Inactive Users Chart error handling
  activeInactiveChartLoading: boolean = false;
  activeInactiveChartError: string = '';
  activeInactiveHasData: boolean = true;
  activeInactiveGrowthMessage: string = '';

  // Venue Map error handling
  venueMapLoading: boolean = false;
  venueMapError: string = '';
  venueMapHasData: boolean = true;

  // Facility Chart error handling
  facilityChartLoading: boolean = false;
  facilityChartError: string = '';
  facilityHasData: boolean = true;

  // Athlete Chart error handling
  athleteChartLoading: boolean = false;
  athleteChartError: string = '';
  athleteHasData: boolean = true;

  // Athletes by District Table properties
  athleteDistrictData: any[] = [];
  athleteDistrictLoading: boolean = false;
  athleteDistrictError: string = '';
  athleteDistrictHasData: boolean = true;

  // Financial Aid Chart error handling
  financialAidChartLoading: boolean = false;
  financialAidChartError: string = '';
  financialAidHasData: boolean = true;

  // Financial Overview Chart error handling
  financialOverviewChartLoading: boolean = false;
  financialOverviewChartError: string = '';
  financialOverviewHasData: boolean = true;
  selectedAthleteUserType: string = 'players';
  selectedFinancialAidTime: string = 'last_6_months';
  financialAidTimeOptions: any[] = [];
  financialAidGrowthMessage: string = '';
  selectedFinancialOverviewTime: string = 'last_6_months';
  financialOverviewTimeOptions: any[] = [];

  // Chart configurations
  athleteChartOptions: any = {};
  financialAidChartOptions: any = {};
  financialOverviewChartOptions: any = {};

  sportsCategories: SportCategory[] = [
    {
      id: 'cricket',
      name: 'Cricket',
      description: 'Cricket is a beloved game with a fascinating history.',
      iconPath: 'M12 2L8 14h8L12 2zM12 8.5c-.83 0-1.5-.67-1.5-1.5S11.17 5.5 12 5.5s1.5.67 1.5 1.5S12.83 8.5 12 8.5z',
      color: 'bg-blue-500'
    },
    {
      id: 'football',
      name: 'Football',
      description: 'Football is a popular team sport enjoyed by many fans.',
      iconPath: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z',
      color: 'bg-blue-600'
    },
    {
      id: 'kabaddi',
      name: 'Kabaddi',
      description: 'Kabaddi is an exciting sport with teams raiding.',
      iconPath: 'M12 5.5c1.38 0 2.5-1.12 2.5-2.5S13.38.5 12 .5 9.5 1.62 9.5 3 10.62 5.5 12 5.5zM21 9h-6l-2-4h-2L9 9H3c-.55 0-1 .45-1 1s.45 1 1 1h6v12h6V11h6c.55 0 1-.45 1-1s-.45-1-1-1z',
      color: 'bg-blue-500'
    },
    {
      id: 'basketball',
      name: 'Basketball',
      description: 'Basketball is a thrilling game of teamwork and skill.',
      iconPath: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8 0-1.82.62-3.49 1.64-4.83C7.43 8.34 9.6 9 12 9s4.57-.66 6.36-1.83C19.38 8.51 20 10.18 20 12c0 4.41-3.59 8-8 8z',
      color: 'bg-blue-600'
    },
    {
      id: 'tennis',
      name: 'Tennis',
      description: 'Tennis is an exciting sport for two players.',
      iconPath: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z',
      color: 'bg-blue-500'
    },
    {
      id: 'chess',
      name: 'Chess',
      description: 'Chess is a classic game of strategic thinking.',
      iconPath: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM7 7h2v2H7V7zm8 0h2v2h-2V7zm-4 4h2v2h-2v-2zm-4 0h2v2H7v-2zm8 0h2v2h-2v-2zm-4 4h2v2h-2v-2z',
      color: 'bg-blue-600'
    }
  ];
  // Loading and error states
  isLoadingKPIs: boolean = true;
  kpiError: string = '';

  // Dynamic analytics data from API
  analyticsdata: any = {
    total_users: {
      counts: 0,
      percentage: 0,
      direction: "neutral"
    },
    new_applicants: {
      counts: 0,
      percentage: 0,
      direction: "neutral"
    },
    registered_venues: {
      counts: 0,
      percentage: 0,
      direction: "neutral"
    },
    events: {
      counts: 0,
      percentage: 0,
      direction: "neutral"
    },
    financial_aid_requests: {
      counts: 0,
      percentage: 0,
      direction: "neutral"
    }
  };

  constructor(
    private themeService: ThemeService,
    private cdr: ChangeDetectorRef,
    private stackholderService: StackholderService,
    private dashboardService: DashboardService
  ) {

    // Initialize empty - will be populated when API data loads
    this.chartOptions = null;

    // Initialize empty - will be populated when API data loads
    this.donutChartOptions = null;

    // Facility Utilization Chart Configuration
    // Initialize empty - will be populated when API data loads
    this.facilityChartOptions = null;
    
    /*this.facilityChartOptions = {
      series: [
        {
          name: 'Booking Slots',
          data: [55, 50, 80, 65, 77, 52] // Exact percentages from the image
        },
        {
          name: 'Pending/Inactive Slots',
          data: [0, 5, 15, 20, 13, 40] // Orange sections
        },
        {
          name: 'Unused Slots',
          data: [45, 45, 5, 15, 10, 8] // Pink/red sections at top
        }
      ],
      chart: {
        type: 'bar',
        height: 280,
        stacked: true,
        stackType: '100%',
        toolbar: {
          show: false
        },
        fontFamily: 'inherit'
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '70%',
          borderRadius: 8,
          borderRadiusApplication: 'end',
          borderRadiusWhenStacked: 'last'
        }
      },
      xaxis: {
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        axisBorder: {
          show: false
        },
        axisTicks: {
          show: false
        },
        labels: {
          style: {
            colors: '#6b7280',
            fontSize: '14px',
            fontWeight: 500
          }
        }
      },
      yaxis: {
        max: 100,
        show: false
      },
      grid: {
        show: false
      },
      colors: ['#A7C7E7', '#FFC78E', '#FF9999'], // Exact colors: light blue, amber, light red
      legend: {
        show: false // We're using custom legend
      },
      dataLabels: {
        enabled: false
      },
      tooltip: {
        shared: true,
        intersect: false,
        y: {
          formatter: function (val: any, opts: any) {
            const seriesName = opts.series[opts.seriesIndex].name;
            if (seriesName === 'Booking Slots') {
              return val + '% (3,800 slots)';
            } else if (seriesName === 'Pending/Inactive Slots') {
              return val + '% (600 slots)';
            } else {
              return val + '% (600 slots)';
            }
          }
        },
        custom: function ({ series, seriesIndex, dataPointIndex, w }: any) {
          const month = w.globals.labels[dataPointIndex];
          const bookedVal = series[0][dataPointIndex];
          const pendingVal = series[1][dataPointIndex];
          const unusedVal = series[2][dataPointIndex];

          return `
            <div class="bg-white p-3 rounded-lg shadow-lg border">
              <div class="font-semibold text-gray-900 mb-2">${month}</div>
              <div class="space-y-1 text-sm">
                <div class="flex items-center gap-2">
                  <div class="w-3 h-3 bg-sky-300 rounded-full"></div>
                  <span>Booked: 3,800 (${bookedVal}%)</span>
                </div>
                <div class="flex items-center gap-2">
                  <div class="w-3 h-3 bg-amber-400 rounded-full"></div>
                  <span>Pending: 600 (${pendingVal}%)</span>
                </div>
                <div class="flex items-center gap-2">
                  <div class="w-3 h-3 bg-red-400 rounded-full"></div>
                  <span>Unused: 600 (${unusedVal}%)</span>
                </div>
              </div>
            </div>
          `;
        }
      },
      states: {
        hover: {
          filter: {
            type: 'lighten',
            value: 0.1
          }
        }
      }
    };*/

    // Athlete Distribution Chart Configuration
    // Initialize empty - will be populated when API data loads
    this.athleteChartOptions = null;
    
    /*this.athleteChartOptions = {
      series: [45, 30, 15, 8, 2], // Percentages for each age group
      chart: {
        type: 'donut',
        height: 300,
        fontFamily: 'inherit'
      },
      labels: ['Under 14 Years', 'Under 18 Years', '18 - 25 Years', '25 - 30 Years', '30+ Years'],
      colors: ['#A7C7E7', '#FFC78E', '#FF9999', '#B9E3C6', '#FDE047'],
      stroke: {
        width: 4,
        colors: ['#ffffff']
      },
      plotOptions: {
        pie: {
          donut: {
            size: '60%',
            labels: {
              show: true,
              name: {
                show: true,
                fontSize: '14px',
                fontWeight: 600,
                color: '#374151'
              },
              value: {
                show: true,
                fontSize: '16px',
                fontWeight: 700,
                color: '#111827',
                formatter: function (val: string) {
                  return val + '%';
                }
              },
              total: {
                show: true,
                showAlways: true,
                label: 'Under 18 Years: 210',
                fontSize: '12px',
                fontWeight: 500,
                color: '#6b7280'
              }
            }
          }
        }
      },
      dataLabels: {
        enabled: false
      },
      legend: {
        show: false // Using custom legend
      },
      tooltip: {
        y: {
          formatter: function (val: any) {
            return val + '%';
          }
        }
      },
      states: {
        hover: {
          filter: {
            type: 'lighten',
            value: 0.1
          }
        }
      }
    };*/

    // Financial Aid Application Chart Configuration
    // Initialize empty - will be populated when API data loads
    this.financialAidChartOptions = null;
    
    /*this.financialAidChartOptions = {
      series: [{
        name: 'Applications',
        data: [1450, 1700, 1400, 1980, 1600, 1200] // Jan to Jun data matching the image
      }],
      chart: {
        type: 'bar',
        height: 300,
        fontFamily: 'inherit',
        toolbar: {
          show: false
        }
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '60%',
          borderRadius: 4,
          borderRadiusApplication: 'end'
        }
      },
      xaxis: {
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        axisBorder: {
          show: false
        },
        axisTicks: {
          show: false
        },
        labels: {
          style: {
            colors: '#6b7280',
            fontSize: '14px',
            fontWeight: 500
          }
        }
      },
      yaxis: {
        min: 0,
        max: 2000,
        tickAmount: 5,
        labels: {
          style: {
            colors: '#6b7280',
            fontSize: '12px'
          }
        }
      },
      colors: ['#A7C7E7'],
      dataLabels: {
        enabled: false
      },
      grid: {
        show: true,
        borderColor: '#f3f4f6',
        strokeDashArray: 0,
        xaxis: {
          lines: {
            show: false
          }
        },
        yaxis: {
          lines: {
            show: true
          }
        }
      },
      tooltip: {
        shared: false,
        intersect: true,
        custom: function ({ series, seriesIndex, dataPointIndex, w }: any) {
          const categories = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
          const month = categories[dataPointIndex];
          const value = series[seriesIndex][dataPointIndex];
          const isApril = month === 'Apr';

          if (isApril) {
            return `
              <div class="bg-white p-3 rounded-lg shadow-lg border">
                <div class="font-semibold text-gray-900 mb-1">${month}</div>
                <div class="text-gray-700 mb-1">New Application: ${value}</div>
                <div class="flex items-center text-blue-600">
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
                  </svg>
                  <span class="font-medium">12.5% than last month</span>
                </div>
              </div>
            `;
          }
          return `
            <div class="bg-white p-3 rounded-lg shadow-lg border">
              <div class="font-semibold text-gray-900 mb-1">${month}</div>
              <div class="text-gray-700">Applications: ${value}</div>
            </div>
          `;
        }
      }
    };*/

    // Financial Aid Overview Chart Configuration
    // Initialize empty - will be populated when API data loads
    this.financialOverviewChartOptions = null;
    
    /*this.financialOverviewChartOptions = {
      series: [60, 25, 15], // Approved, In Review, Rejected percentages
      chart: {
        type: 'donut',
        height: 300,
        fontFamily: 'inherit'
      },
      labels: ['Approved', 'In Review', 'Rejected'],
      colors: ['#A7C7E7', '#FFC78E', '#FF9999'], // Sky blue, orange, red
      stroke: {
        width: 4,
        colors: ['#ffffff']
      },
      plotOptions: {
        pie: {
          donut: {
            size: '70%',
            labels: {
              show: false
            }
          }
        }
      },
      dataLabels: {
        enabled: false
      },
      legend: {
        show: false // Using custom legend
      },
      tooltip: {
        y: {
          formatter: function (val: any, opts: any) {
            const label = opts.w.globals.labels[opts.seriesIndex];
            if (label === 'Approved') {
              return '540 applications';
            } else if (label === 'In Review') {
              return '225 applications';
            } else {
              return '135 applications';
            }
          }
        },
        custom: function ({ series, seriesIndex, dataPointIndex, w }: any) {
          const labels = ['Approved', 'In Review', 'Rejected'];
          const counts = [540, 225, 135];
          const label = labels[seriesIndex];
          const count = counts[seriesIndex];
          const percentage = series[seriesIndex];

          return `
            <div class="bg-white p-3 rounded-lg shadow-lg border">
              <div class="flex items-center gap-2 mb-1">
                <div class="w-3 h-3 rounded-full" style="background-color: ${w.globals.colors[seriesIndex]};"></div>
                <span class="font-semibold text-gray-900">${label}</span>
              </div>
              <div class="text-gray-700">${count} applications (${percentage}%)</div>
            </div>
          `;
        }
      },
      states: {
        hover: {
          filter: {
            type: 'lighten',
            value: 0.1
          }
        }
      }
    };*/

  }


  ngOnInit(): void { 
    try {
      const stored = localStorage.getItem('userName') || localStorage.getItem('user_name') || localStorage.getItem('full_name');
      if (stored) {
        this.userName = stored;
      }
    } catch { }

    // Load Google Maps for venue map
    this.loadGoogleMaps();

    // Load dropdown data
    this.getDropdownData();

    // Fetch dashboard KPIs
    this.fetchDashboardKPIs();

    // Load initial chart data after dropdowns are loaded
    setTimeout(() => {
      this.loadInitialChartData();
    }, 1000);
  }

  loadInitialChartData() {
    // Load user registration chart with default values
    this.fetchUserRegistrationChart();

    // Load active/inactive users chart with default values
    this.fetchActiveInactiveUsersChart();

    // Load athlete distribution chart with default values
    this.fetchAthleteDistributionChart();

    // Load total players by district table with default values
    this.fetchTotalPlayersByDistrict();

    // Load financial aid applications chart with default values
    this.fetchFinancialAidApplications();

    // Load financial overview chart with default values
    this.fetchFinancialOverviewChart();

    // Load facility utilization chart with default values
    this.fetchFacilityChart();

    // Load venue data with default values (after a delay to ensure dropdowns and map are loaded)
    setTimeout(() => {
      if (this.selectedVenueDistrict && this.selectedVenueTime && this.venueMap) {
        this.fetchVenuesByDistrict();
      }
    }, 1000);
  }

  ngAfterViewInit(): void {
    // Initialize venue map after view is ready
    if (this.googleMapsLoaded) {
      // Reduce delay for faster initialization
      setTimeout(() => {
        this.initializeVenueMap();
      }, 50);
    } else {
      // If Google Maps not loaded yet, wait and check again
      setTimeout(() => {
        if (this.googleMapsLoaded) {
          this.initializeVenueMap();
        }
      }, 500);
    }
  }

  ngOnDestroy(): void { }


  visible: boolean = false

  toggleDisplay() {
    this.visible = !this.visible
  }

  onViewDetails(sportId: string): void {
    console.log(`View details for ${sportId}`);
    // Implement navigation or modal logic here
  }

  // Dropdown data methods
  getDropdownData(): void {
    try {
      const payload = {
        districts: true,
        admin_months_filter: true,
        age_groups: true,
      };

      this.stackholderService.getDropdownLists(payload).subscribe({
        next: (res) => {
          console.log('Dropdown Response:', res);
          if (res?.status?.success) {
            this.districts = res.data.districts || [];
            this.months = res.data.admin_months_filter || [];
            this.ageGroups = res.data.age_groups || [];
            // Use admin_months_filter for Financial Aid time options as well
            this.financialAidTimeOptions = res.data.admin_months_filter || [
              { value: 'last_6_months', label: 'Past 6 Months' },
              { value: 'last_year', label: 'Past 1 Year' },
              { value: 'last_3_months', label: 'Past 3 Months' }
            ];
            // Use admin_months_filter for Financial Overview time options as well
            this.financialOverviewTimeOptions = res.data.admin_months_filter || [
              { value: 'last_6_months', label: 'Past 6 Months' },
              { value: 'last_year', label: 'Past 1 Year' },
              { value: 'last_3_months', label: 'Past 3 Months' }
            ];

            // Set default selections
            this.setDefaultSelections();
          }
        },
        error: (err) => {
          console.error('Failed to fetch dropdown data:', err);
        },
      });
    } catch (error) {
      console.error('Failed to fetch dropdown data:', error);
    }
  }

  setDefaultSelections() {
    // Set default district to kolkata if available in the dropdown data
    const kolkataDistrict = this.districts.find(district =>
      district.value.toLowerCase().includes('kolkata') ||
      district.label.toLowerCase().includes('kolkata')
    );
    if (kolkataDistrict) {
      this.selectedDistrict = kolkataDistrict.value;
      this.selectedVenueDistrict = kolkataDistrict.value;
    } else if (this.districts.length > 0) {
      this.selectedDistrict = this.districts[0].value || '';
      this.selectedVenueDistrict = this.districts[0].value || '';
    }

    // Set default time period to 6 months variation if available
    const sixMonthsOption = this.months.find(month =>
      month.value === 'past_6_months' ||
      month.value === '6_months' ||
      month.value === 'last_6_months' ||
      month.label.toLowerCase().includes('6 month')
    );
    if (sixMonthsOption) {
      this.selectedTime = sixMonthsOption.value;
      this.selectedVenueTime = sixMonthsOption.value;
      this.selectedFacilityTime = sixMonthsOption.value;
      this.selectedActiveInactiveTime = sixMonthsOption.value;
      this.selectedFinancialAidTime = sixMonthsOption.value;
      this.selectedFinancialOverviewTime = sixMonthsOption.value;
    } else if (this.months.length > 0) {
      this.selectedTime = this.months[0].value || '';
      this.selectedVenueTime = this.months[0].value || '';
      this.selectedFacilityTime = this.months[0].value || '';
      this.selectedActiveInactiveTime = this.months[0].value || '';
      this.selectedFinancialAidTime = this.months[0].value || '';
      this.selectedFinancialOverviewTime = this.months[0].value || '';
    }

    // Set default age group if available
    if (this.ageGroups.length > 0) {
      this.selectedAthleteAgeGroup = this.ageGroups[0].value || '';
    }

    console.log('Default selections set:', {
      selectedDistrict: this.selectedDistrict,
      selectedTime: this.selectedTime,
      selectedActiveInactiveTime: this.selectedActiveInactiveTime
    });
  }

  // Filter change handlers
  onUserRegistrationFilterChange(): void {
    console.log('User registration filter changed:', this.selectedDistrict, this.selectedTime);
    if (this.selectedDistrict && this.selectedTime) {
      this.fetchUserRegistrationChart();
    }
  }

  fetchUserRegistrationChart() {
    if (!this.selectedDistrict || !this.selectedTime) return;

    this.userRegistrationChartLoading = true;
    this.userRegistrationChartError = '';
    this.userRegistrationHasData = true;

    this.dashboardService.getUserRegistrationChart(this.selectedDistrict, this.selectedTime)
      .subscribe({
        next: (response) => {
          this.userRegistrationChartLoading = false;
          if (response.status.success && response.data) {
            this.updateUserRegistrationChart(response.data);
          } else {
            this.userRegistrationChartError = 'Failed to load chart data';
            this.userRegistrationHasData = false;
          }
        },
        error: (error) => {
          this.userRegistrationChartLoading = false;
          console.error('Error fetching user registration chart:', error);
          this.userRegistrationChartError = 'Failed to load chart data. Please try again.';
          this.userRegistrationHasData = false;
        }
      });
  }

  updateUserRegistrationChart(data: any) {
    // Check if we have valid data
    if (!data.chart_data || !data.categories || data.chart_data.length === 0) {
      this.userRegistrationHasData = false;
      this.userRegistrationChartError = 'No data available for the selected filters';
      return;
    }

    // Check if all data points are zero
    const hasNonZeroData = data.chart_data.some((item: any) => 
      data.categories.some((category: any) => (item[category.key] || 0) > 0)
    );

    if (!hasNonZeroData) {
      this.userRegistrationHasData = false;
      this.userRegistrationChartError = 'No data available for the selected filters';
      return;
    }

    // Update the chart options with new data from API response
    if (data.chart_data && data.categories) {
      // Extract months for x-axis
      const months = data.chart_data.map((item: any) => item.month);

      // Use consistent static colors to prevent color changes from API
      const staticColors = ['#A7C7E7', '#FFC78E', '#FF9999', '#A8E6A3'];
      
      // Create series data for each category
      const series = data.categories.map((category: any, index: number) => ({
        name: category.label,
        data: data.chart_data.map((item: any) => item[category.key] || 0)
      }));

      // Create complete chart configuration
      this.chartOptions = {
        series: series,
        xaxis: {
          categories: months
        },
      chart: {
        fontFamily: 'inherit',
        type: 'bar',
          height: 300,
        toolbar: {
          show: false,
        },
        sparkline: {
          enabled: false,
        },
      },
        plotOptions: {
          bar: {
            horizontal: false,
            columnWidth: '70%',
            borderRadius: 0,
          }
        },
        dataLabels: {
          enabled: false // inside chart counter
      },
      legend: {
        position: 'bottom',
        horizontalAlign: 'center'
      },
      fill: {
        opacity: 1
      },
      stroke: {
        show: false,
      },
      tooltip: {
        y: {
          formatter: function (val) {
            return val + " users";
          }
        }
      },
        colors: staticColors.slice(0, data.categories.length)
      };

      // Update growth trend message
      if (data.growth_trend) {
        this.userRegistrationGrowthMessage = data.growth_trend.message;
      }

      // Mark as having data
      this.userRegistrationHasData = true;
      this.userRegistrationChartError = '';
    }
  }

  fetchActiveInactiveUsersChart() {
    this.activeInactiveChartLoading = true;
    this.activeInactiveChartError = '';
    this.activeInactiveHasData = true;

    this.dashboardService.getActiveInactiveUsersChart(this.selectedActiveInactiveStatus, this.selectedActiveInactiveTime)
      .subscribe({
        next: (response) => {
          this.activeInactiveChartLoading = false;
          if (response.status.success && response.data) {
            this.updateActiveInactiveUsersChart(response.data);
          } else {
            this.activeInactiveChartError = 'Failed to load chart data. Please try again.';
            this.activeInactiveHasData = false;
          }
        },
        error: (error) => {
          this.activeInactiveChartLoading = false;
          console.error('Error fetching active/inactive users chart:', error);
          this.activeInactiveChartError = 'Failed to load chart data. Please try again.';
          this.activeInactiveHasData = false;
        }
      });
  }

  updateActiveInactiveUsersChart(data: any) {
    // Check if we have valid data
    if (!data.chart_segments || data.chart_segments.length === 0) {
      this.activeInactiveHasData = false;
      this.activeInactiveChartError = 'No data available for the selected filters';
      return;
    }

    // Check if all data points are zero
    const hasNonZeroData = data.chart_segments.some((segment: any) => parseInt(segment.value) > 0);
    if (!hasNonZeroData) {
      this.activeInactiveHasData = false;
      this.activeInactiveChartError = 'No data available for the selected filters';
      return;
    }

    // Store the full chart data
    this.activeInactiveChartData = data;

    // Update the donut chart options with new data
    if (data.chart_segments) {
      const series = data.chart_segments.map((segment: any) => segment.value);
      
      // Map labels to match UI requirements
      const labels = data.chart_segments.map((segment: any) => {
        const label = segment.label;
        // Convert singular to plural forms to match the image
        if (label === 'Venue Manager') return 'Venue Managers';
        if (label === 'Athlete') return 'Athletes';
        if (label === 'Coach') return 'Coaches';
        if (label === 'Officer') return 'Officers';
        return label; // Return original if no mapping needed
      });
      
      console.log('Active/Inactive Chart Data:', {
        series: series,
        labels: labels,
        centerValue: data.center_value,
        growthMessage: data.summary?.growth_message
      });
      
      // Use static colors since API doesn't provide them
      const staticColors = ['#A7C7E7', '#FFC78E', '#FF9999', '#A8E6A3'];

      // Create complete donut chart configuration
      this.donutChartOptions = {
        series: series,
        chart: {
          type: 'donut',
          height: 300
        },
        labels: labels,
        colors: staticColors.slice(0, data.chart_segments.length),
        stroke: {
          width: 4,
          colors: ['#ffffff']
        },
        plotOptions: {
          pie: {
            donut: {
              size: '60%',
              labels: {
                show: true,
                name: {
                  show: true,
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#263238'
                },
                value: {
                  show: true,
                  fontSize: '16px',
                  fontWeight: 600,
                  color: '#263238'
                },
                total: {
                  show: true,
                  label: data.center_value?.label || 'Total',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#263238',
                  formatter: () => data.center_value?.total?.toString() || '0'
                }
              }
            }
          }
        },
        legend: {
          position: 'bottom',
          horizontalAlign: 'center'
        },
        dataLabels: {
          enabled: false
        },
        tooltip: {
          y: {
            formatter: function (val: any) {
              return val + " users";
            }
          }
        }
      };

      // Update growth message
      if (data.summary && data.summary.growth_message) {
        this.activeInactiveGrowthMessage = data.summary.growth_message;
      }

      // Mark as having data
      this.activeInactiveHasData = true;
      this.activeInactiveChartError = '';
    }
  }

  onActiveInactiveFilterChange() {
    this.fetchActiveInactiveUsersChart();
  }

  onVenueFilterChange(): void {
    console.log('Venue filter changed:', this.selectedVenueDistrict, this.selectedVenueTime);
    
    // Only call API if both district and time are selected
    if (this.selectedVenueDistrict && this.selectedVenueTime) {
      // Ensure map is initialized before making API calls
      if (!this.venueMap) {
        console.log('Map not initialized yet, waiting...');
        setTimeout(() => {
          this.onVenueFilterChange();
        }, 500);
        return;
      }
      
      // Call API to get venue data (this will also update map location)
      this.fetchVenuesByDistrict();
    }
  }

  fetchVenuesByDistrict(): void {
    // Don't start loading if map isn't initialized
    if (!this.venueMap) {
      console.error('Cannot fetch venues: Map not initialized');
      this.venueMapError = 'Map is not ready. Please wait or refresh the page.';
      this.venueMapHasData = true; // Keep map visible
      return;
    }

    this.venueMapLoading = true;
    this.venueMapError = '';
    this.venueMapHasData = true;

    const payload = {
      district: this.selectedVenueDistrict,
      time_period: this.selectedVenueTime
    };

    console.log('Fetching venues with payload:', payload);

    this.dashboardService.getVenuesByDistrict(payload)
      .subscribe({
        next: (response) => {
          this.venueMapLoading = false;
          console.log('Venue API response:', response);
          
          if (response.status && response.status.success && response.data) {
            this.updateVenueMapWithApiData(response.data);
          } else {
            this.venueMapError = response.status?.message || 'Failed to load venue data. Please try again.';
            this.venueMapHasData = true; // Keep map visible
            // Clear existing markers but keep map
            this.clearVenueMarkers();
            this.showErrorMessageOnMap('No venue data available for selected filters');
          }
        },
        error: (error) => {
          this.venueMapLoading = false;
          console.error('Error fetching venues by district:', error);
          
          // More specific error messages
          if (error.status === 0) {
            this.venueMapError = 'Network error. Please check your connection and try again.';
          } else if (error.status === 404) {
            this.venueMapError = 'Venue service not found. Please contact support.';
          } else if (error.status >= 500) {
            this.venueMapError = 'Server error. Please try again later.';
          } else {
            this.venueMapError = 'Failed to load venue data. Please try again.';
          }
          
          this.venueMapHasData = true; // Keep map visible
          // Clear existing markers but keep map
          this.clearVenueMarkers();
          this.showErrorMessageOnMap(this.venueMapError);
        }
      });
  }

  updateVenueMapWithApiData(data: any): void {
    // Check if map is initialized
    if (!this.venueMap) {
      console.error('Map not initialized, cannot update with venue data');
      this.venueMapError = 'Map initialization failed. Please refresh the page.';
      this.venueMapHasData = true; // Keep map visible
      return;
    }

    // Close any existing error info window
    if (this.errorInfoWindow) {
      this.errorInfoWindow.close();
      this.errorInfoWindow = null;
    }

    // Clear existing markers
    this.clearVenueMarkers();

    // Check if we have venue data
    if (!data.venues || data.venues.length === 0) {
      this.venueMapHasData = true; // Keep map visible
      this.venueMapError = 'No venues found for the selected district and time period';
      this.showErrorMessageOnMap('No venues found for the selected district and time period');
      return;
    }

    // Update map center using district coordinates first
    const districtCoords = this.getDistrictCoordinates(this.selectedVenueDistrict);
    if (districtCoords) {
      this.venueMap.panTo(districtCoords);
      this.venueMap.setZoom(11);
    }

    // If we have map bounds from API, use them for fine-tuning
    if (data.metadata && data.metadata.map_bounds) {
      const bounds = data.metadata.map_bounds;
      // Only adjust if bounds are significantly different from district center
      if (Math.abs(bounds.north - bounds.south) > 0.01 || Math.abs(bounds.east - bounds.west) > 0.01) {
        const center = {
          lat: (bounds.north + bounds.south) / 2,
          lng: (bounds.east + bounds.west) / 2
        };
        this.venueMap.panTo(center);
        this.venueMap.setZoom(12);
      }
    }

    // Add markers for venues from API
    console.log('Adding markers for venues:', data.venues.length);
    data.venues.forEach((venue: any, index: number) => {
      console.log(`Adding marker ${index + 1}:`, {
        name: venue.name,
        lat: venue.latitude,
        lng: venue.longitude
      });
      
      // Use venue latitude/longitude from API response
      const venueCoords = {
        lat: venue.latitude,
        lng: venue.longitude
      };

      const marker = new google.maps.Marker({
        position: venueCoords,
        map: this.venueMap,
        title: venue.name || 'Sports Venue',
        icon: {
          url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
          scaledSize: new google.maps.Size(32, 32),
          origin: new google.maps.Point(0, 0),
          anchor: new google.maps.Point(16, 32)
        }
      });

      // Create rich info window using available API data
      const sportsText = venue.sport_types && venue.sport_types.length > 0 
        ? `Sports: ${venue.sport_types.join(', ')}` 
        : 'Sports information not available';

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div class="p-3 max-w-xs">
            <h3 class="font-semibold text-gray-900 mb-1">${venue.name || 'Sports Venue'}</h3>
            <p class="text-sm text-gray-600 mb-2">${venue.district || 'Unknown District'}</p>
            
            <p class="text-xs text-gray-500 mb-2">${sportsText}</p>
            
            <div class="border-t border-gray-200 pt-2 mt-2">
              <p class="text-xs text-gray-400 mb-1">${venue.address?.full || venue.address?.line1 || 'Address not available'}</p>
              ${venue.capacity ? `<p class="text-xs text-blue-600 mt-1">Capacity: ${venue.capacity}</p>` : ''}
              ${venue.rating ? `<p class="text-xs text-yellow-600 mt-1">★ ${venue.rating}/5</p>` : ''}
              ${venue.operating_hours?.is_open ? 
                `<p class="text-xs text-green-600 mt-1">Open: ${venue.operating_hours.open_time} - ${venue.operating_hours.close_time}</p>` : 
                venue.operating_hours ? `<p class="text-xs text-red-600 mt-1">Closed</p>` : ''
              }
              <p class="text-xs text-gray-300 mt-1">ID: ${venue.id}</p>
            </div>
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(this.venueMap, marker);
      });

      this.venueMarkers.push(marker);
      console.log(`Marker ${index + 1} added successfully`);
    });

    console.log(`Total markers added: ${this.venueMarkers.length}`);

    // Fit map bounds to show all markers if we have multiple venues
    if (data.venues.length > 1) {
      const bounds = new google.maps.LatLngBounds();
      data.venues.forEach((venue: any) => {
        bounds.extend(new google.maps.LatLng(venue.latitude, venue.longitude));
      });
      this.venueMap.fitBounds(bounds);
      
      // Ensure minimum zoom level
      google.maps.event.addListenerOnce(this.venueMap, 'bounds_changed', () => {
        if (this.venueMap.getZoom() > 15) {
          this.venueMap.setZoom(15);
        }
      });
    }

    // Update venue statistics if provided
    if (data.summary) {
      console.log('Venue Summary:', {
        totalVenues: data.summary.total_venues,
        byDistrict: data.summary.by_district,
        bySportType: data.summary.by_sport_type,
        averageRating: data.summary.average_rating
      });
    }

    // Mark as having data
    this.venueMapHasData = true;
    this.venueMapError = '';
  }

  generateVenueCoordinates(districtCoords: { lat: number; lng: number } | null): { lat: number; lng: number } {
    if (!districtCoords) {
      return { lat: 22.5726, lng: 88.3639 }; // Fallback to Kolkata
    }

    // Generate random coordinates within ~5km of district center
    const latOffset = (Math.random() - 0.5) * 0.1; // ~5km range
    const lngOffset = (Math.random() - 0.5) * 0.1;

    return {
      lat: districtCoords.lat + latOffset,
      lng: districtCoords.lng + lngOffset
    };
  }

  getDistrictLabel(districtValue: string): string {
    const district = this.districts.find(d => 
      d.value === districtValue || 
      d.value.toLowerCase() === districtValue.toLowerCase()
    );
    return district ? district.label : districtValue;
  }

  updateMapForDistrict(): void {
    if (!this.venueMap || !this.selectedVenueDistrict) {
      return;
    }

    // Get district coordinates
    const districtCoordinates = this.getDistrictCoordinates(this.selectedVenueDistrict);
    
    if (districtCoordinates) {
      // Pan to the new district
      this.venueMap.panTo(districtCoordinates);
      this.venueMap.setZoom(11);
      
      // Clear existing markers
      this.clearVenueMarkers();
      
      // Add new markers for the selected district
      this.addVenueMarkersForDistrict(this.selectedVenueDistrict);
      
      console.log('Map updated for district:', this.selectedVenueDistrict, districtCoordinates);
    }
  }

  getDistrictCoordinates(districtValue: string): { lat: number; lng: number } | null {
    // Find the district in the API response data
    const district = this.districts.find(d => 
      d.value === districtValue || 
      d.value.toLowerCase() === districtValue.toLowerCase()
    );

    // If found and has coordinates, return them
    if (district && district.coordinates) {
      return {
        lat: district.coordinates.lat,
        lng: district.coordinates.lng
      };
    }

    // Fallback: try to find by partial match
    const partialMatch = this.districts.find(d => 
      d.value.toLowerCase().includes(districtValue.toLowerCase()) ||
      districtValue.toLowerCase().includes(d.value.toLowerCase())
    );

    if (partialMatch && partialMatch.coordinates) {
      return {
        lat: partialMatch.coordinates.lat,
        lng: partialMatch.coordinates.lng
      };
    }

    // Default fallback to first district if available, otherwise Kolkata
    if (this.districts.length > 0 && this.districts[0].coordinates) {
      return {
        lat: this.districts[0].coordinates.lat,
        lng: this.districts[0].coordinates.lng
      };
    }

    // Final fallback to Kolkata coordinates
    return { lat: 22.5726, lng: 88.3639 };
  }

  clearVenueMarkers(): void {
    this.venueMarkers.forEach(marker => {
      marker.setMap(null);
    });
    this.venueMarkers = [];
  }

  showErrorMessageOnMap(message: string): void {
    if (!this.venueMap) return;

    // Get current map center
    const center = this.venueMap.getCenter();
    if (!center) return;

    // Create an info window at the center of the map
    const errorInfoWindow = new google.maps.InfoWindow({
      content: `
        <div class="p-3 max-w-sm text-center">
          <div class="mb-2">
            <svg class="w-8 h-8 text-orange-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
          </div>
          <h3 class="font-semibold text-gray-900 mb-2">No Venues Found</h3>
          <p class="text-sm text-gray-600 mb-3">${message}</p>
          <button onclick="document.querySelector('.retry-venues-btn').click()" 
            class="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700">
            Retry
          </button>
        </div>
      `,
      position: center
    });

    // Open the info window
    errorInfoWindow.open(this.venueMap);

    // Store reference to close it later
    this.errorInfoWindow = errorInfoWindow;
  }

  addVenueMarkersForDistrict(districtValue: string): void {
    // Get the district coordinates
    const districtCoords = this.getDistrictCoordinates(districtValue);
    
    if (!districtCoords) {
      console.warn('No coordinates found for district:', districtValue);
      return;
    }

    // Find the district object to get the label
    const district = this.districts.find(d => 
      d.value === districtValue || 
      d.value.toLowerCase() === districtValue.toLowerCase()
    );

    const districtLabel = district ? district.label : districtValue;

    // Create sample venues around the district coordinates
    // In a real app, this would come from an API
    const venues = this.generateSampleVenuesForDistrict(districtCoords, districtLabel);

    // Add markers for venues
    venues.forEach(venue => {
      const marker = new google.maps.Marker({
        position: { lat: venue.lat, lng: venue.lng },
        map: this.venueMap,
        title: venue.name,
        icon: {
          url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
          scaledSize: new google.maps.Size(32, 32),
          origin: new google.maps.Point(0, 0),
          anchor: new google.maps.Point(16, 32)
        }
      });

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div class="p-2">
            <h3 class="font-semibold text-gray-900">${venue.name}</h3>
            <p class="text-sm text-gray-600">${venue.type}</p>
            <p class="text-xs text-gray-500">${districtLabel}</p>
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(this.venueMap, marker);
      });

      this.venueMarkers.push(marker);
    });
  }

  generateSampleVenuesForDistrict(coords: { lat: number; lng: number }, districtLabel: string): any[] {
    // Generate sample venues around the district coordinates
    const venues = [
      {
        name: `${districtLabel} Sports Complex`,
        lat: coords.lat + 0.005,
        lng: coords.lng + 0.005,
        type: 'Multi-Sport Complex'
      },
      {
        name: `${districtLabel} Stadium`,
        lat: coords.lat - 0.003,
        lng: coords.lng + 0.007,
        type: 'Football Stadium'
      },
      {
        name: `${districtLabel} Indoor Arena`,
        lat: coords.lat + 0.008,
        lng: coords.lng - 0.004,
        type: 'Indoor Arena'
      }
    ];

    return venues;
  }

  onFacilityFilterChange(): void {
    // Call the fetch method to reload facility chart
    this.fetchFacilityChart();
  }

  onAthleteAgeGroupChange(): void {
    console.log('Athlete age group changed:', this.selectedAthleteAgeGroup);
    // Handle age group filter changes - update chart data based on age group
    this.fetchAthleteDistributionChart();
  }

  fetchAthleteDistributionChart(): void {
    this.athleteChartLoading = true;
    this.athleteChartError = '';
    this.athleteHasData = true;

    const payload: any = {
      filter_type: 'age'
    };

    // Add age group filter
    if (this.selectedAthleteAgeGroup) {
      payload.age_group = this.selectedAthleteAgeGroup;
    }

    this.dashboardService.getAthleteDistribution(payload)
      .subscribe({
        next: (response) => {
          this.athleteChartLoading = false;
          if (response.status.success && response.data) {
            // Update age groups from API metadata if available
            if (response.data.metadata && response.data.metadata.age_groups_definition) {
              this.updateAgeGroupsFromMetadata(response.data.metadata.age_groups_definition);
            }
            this.updateAthleteDistributionChart(response.data);
          } else {
            this.athleteChartError = 'Failed to load chart data. Please try again.';
            this.athleteHasData = false;
          }
        },
        error: (error) => {
          this.athleteChartLoading = false;
          console.error('Error fetching athlete distribution chart:', error);
          this.athleteChartError = 'Failed to load chart data. Please try again.';
          this.athleteHasData = false;
        }
      });
  }

  updateAthleteDistributionChart(data: any): void {
    // Check if we have valid data
    if (!data.chart_data || data.chart_data.length === 0) {
      // Check if total_athletes is 0 - this means no data for selected filter
      if (data.total_athletes === 0) {
        this.athleteHasData = false;
        this.athleteChartError = 'No athletes found for the selected age group';
        return;
      } else {
        this.athleteHasData = false;
        this.athleteChartError = 'No data available for the selected age group';
        return;
      }
    }

    // Check if all data points are zero
    const hasNonZeroData = data.chart_data.some((item: any) => (item.count || item.value) > 0);
    if (!hasNonZeroData && data.total_athletes === 0) {
      this.athleteHasData = false;
      this.athleteChartError = 'No athletes found for the selected age group';
      return;
    }

    // Update the chart options with new data from API response
    // Handle both 'count' and 'value' properties for flexibility
    const series = data.chart_data.map((item: any) => item.count || item.value || 0);
    const labels = data.chart_data.map((item: any) => item.label || item.name);
    
    // Use static colors since API doesn't provide them
    const staticColors = ['#A7C7E7', '#FFC78E', '#FF9999', '#B9E3C6', '#FDE047'];
    const colors = staticColors.slice(0, data.chart_data.length);

    console.log('Athlete Distribution Chart Data:', {
      series: series,
      labels: labels,
      colors: colors,
      centerHighlight: data.center_highlight
    });

    // Create complete athlete chart configuration
    this.athleteChartOptions = {
      series: series,
      chart: {
        type: 'donut',
        height: 300,
        fontFamily: 'inherit'
      },
      labels: labels,
      colors: colors,
      stroke: {
        width: 4,
        colors: ['#ffffff']
      },
      plotOptions: {
        pie: {
          donut: {
            size: '60%',
            labels: {
              show: true,
              name: {
                show: true,
                fontSize: '14px',
                fontWeight: 600,
                color: '#374151'
              },
              value: {
                show: true,
                fontSize: '16px',
                fontWeight: 700,
                color: '#111827',
                formatter: function (val: string) {
                  return val + '%';
                }
              },
              total: {
                show: true,
                showAlways: true,
                label: data.center_highlight?.display_text || 'Total Athletes',
                fontSize: '12px',
                fontWeight: 500,
                color: '#6b7280',
                formatter: () => data.center_highlight?.count?.toString() || data.total_athletes?.toString() || '0'
              }
            }
          }
        }
      },
      dataLabels: {
        enabled: false
      },
      legend: {
        show: false // Using custom legend
      },
      tooltip: {
        y: {
          formatter: function (val: any) {
            return val + '%';
          }
        }
      },
      states: {
        hover: {
          filter: {
            type: 'lighten',
            value: 0.1
          }
        }
      }
    };

    // Mark as having data
    this.athleteHasData = true;
    this.athleteChartError = '';
  }

  updateAgeGroupsFromMetadata(ageGroupsDefinition: any[]): void {
    // Update age groups with the ones from API metadata
    if (ageGroupsDefinition && ageGroupsDefinition.length > 0) {
      this.ageGroups = ageGroupsDefinition.map(group => ({
        value: group.value,
        label: group.label
      }));
      
      // Set default selection if not already set
      if (!this.selectedAthleteAgeGroup && this.ageGroups.length > 0) {
        this.selectedAthleteAgeGroup = this.ageGroups[0].value;
      }
      
      console.log('Age groups updated from API metadata:', this.ageGroups);
    }
  }

  onAthleteDistrictFilterChange(): void {
    console.log('Athlete district filter changed:', this.selectedAthleteUserType);
    // Handle athlete district filter changes - update table data based on user type
    this.fetchTotalPlayersByDistrict();
  }

  fetchTotalPlayersByDistrict(): void {
    this.athleteDistrictLoading = true;
    this.athleteDistrictError = '';
    this.athleteDistrictHasData = true;

    const payload = {
      user_type: this.selectedAthleteUserType
    };

    this.dashboardService.getTotalPlayersByDistrict(payload)
      .subscribe({
        next: (response) => {
          this.athleteDistrictLoading = false;
          if (response.status.success && response.data) {
            this.updateTotalPlayersByDistrict(response.data);
          } else {
            this.athleteDistrictError = 'Failed to load table data. Please try again.';
            this.athleteDistrictHasData = false;
          }
        },
        error: (error) => {
          this.athleteDistrictLoading = false;
          console.error('Error fetching total players by district:', error);
          this.athleteDistrictError = 'Failed to load table data. Please try again.';
          this.athleteDistrictHasData = false;
        }
      });
  }

  updateTotalPlayersByDistrict(data: any): void {
    // Check if we have valid data
    if (!data.district_data || data.district_data.length === 0) {
      this.athleteDistrictHasData = false;
      this.athleteDistrictError = 'No data available for the selected user type';
      return;
    }

    // Map the API response to match the frontend structure
    this.athleteDistrictData = data.district_data.map((district: any) => ({
      name: district.name,
      count: district.total_count
    }));

    console.log('Total Players by District Data:', {
      userType: this.selectedAthleteUserType,
      districts: this.athleteDistrictData,
      rawApiData: data
    });

    // Mark as having data
    this.athleteDistrictHasData = true;
    this.athleteDistrictError = '';
  }

  onFinancialAidFilterChange(): void {
    console.log('Financial aid filter changed:', this.selectedFinancialAidTime);
    // Handle financial aid application filter changes - update chart data based on time period
    this.fetchFinancialAidApplications();
  }

  fetchFinancialAidApplications(): void {
    this.financialAidChartLoading = true;
    this.financialAidChartError = '';
    this.financialAidHasData = true;

    const payload = {
      time_period: this.selectedFinancialAidTime
    };

    this.dashboardService.getFinancialAidApplications(payload)
      .subscribe({
        next: (response) => {
          this.financialAidChartLoading = false;
          if (response.status.success && response.data) {
            this.updateFinancialAidApplicationsChart(response.data);
          } else {
            this.financialAidChartError = 'Failed to load chart data. Please try again.';
            this.financialAidHasData = false;
          }
        },
        error: (error) => {
          this.financialAidChartLoading = false;
          console.error('Error fetching financial aid applications:', error);
          this.financialAidChartError = 'Failed to load chart data. Please try again.';
          this.financialAidHasData = false;
        }
      });
  }

  updateFinancialAidApplicationsChart(data: any): void {
    // Check if we have valid data
    if (!data.chart_data || data.chart_data.length === 0) {
      this.financialAidHasData = false;
      this.financialAidChartError = 'No data available for the selected time period';
      return;
    }

    // Check if all data points are zero
    const hasNonZeroData = data.chart_data.some((item: any) => item.total_applications > 0);
    if (!hasNonZeroData) {
      this.financialAidHasData = false;
      this.financialAidChartError = 'No data available for the selected time period';
      return;
    }

    // Update the chart options with new data from API response
    const series = [{
      name: 'Total Applications',
      data: data.chart_data.map((item: any) => item.total_applications)
    }];
    const labels = data.chart_data.map((item: any) => item.month);
    
    // Use static colors since API might not provide them
    const staticColors = ['#4F46E5', '#06B6D4', '#10B981'];

    // Create complete financial aid chart configuration
    this.financialAidChartOptions = {
      series: series,
      chart: {
        type: 'bar',
        height: 300,
        fontFamily: 'inherit',
        toolbar: {
          show: false
        }
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '55%',
          endingShape: 'rounded'
        }
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        show: true,
        width: 2,
        colors: ['transparent']
      },
      xaxis: {
        categories: labels
      },
      yaxis: {
        title: {
          text: 'Applications'
        }
      },
      fill: {
        opacity: 1
      },
      tooltip: {
        y: {
          formatter: function (val: any) {
            return val + " applications"
          }
        }
      },
      colors: staticColors,
      legend: {
        position: 'top',
        horizontalAlign: 'left',
        offsetX: 40
      }
    };

    // Set growth trend message if available
    if (data.growth_trend && data.growth_trend.formatted_message) {
      this.financialAidGrowthMessage = data.growth_trend.formatted_message;
    }

    console.log('Financial Aid Applications Chart Data:', {
      series: series,
      labels: labels,
      colors: staticColors,
      growthMessage: this.financialAidGrowthMessage
    });

    // Mark as having data
    this.financialAidHasData = true;
    this.financialAidChartError = '';
  }

  onFinancialOverviewFilterChange(): void {
    console.log('Financial overview filter changed:', this.selectedFinancialOverviewTime);
    // Handle financial aid overview filter changes - update donut chart data based on time period
  }

  // API Methods
  fetchDashboardKPIs(): void {
    this.dashboardService.getDashboardKPIs()
      .subscribe({
        next: (response: any) => {
          this.isLoadingKPIs = false;
          if (response.status.success && response.data) {
            this.updateAnalyticsData(response.data);
            this.kpiError = '';
          } else {
            this.kpiError = 'Failed to load dashboard data';
          }
        },
        error: (error) => {
          this.isLoadingKPIs = false;
          this.kpiError = 'Error loading dashboard data';
          console.error('Error fetching dashboard KPIs:', error);
          // Keep default values on error
        }
      });
  }

  private updateAnalyticsData(apiData: any): void {
    // Map API response to component data structure
    this.analyticsdata = {
      total_users: {
        counts: apiData.total_users?.value || 0,
        percentage: Math.abs(apiData.total_users?.growth_percentage || 0),
        direction: this.getDirection(apiData.total_users?.growth_percentage || 0)
      },
      new_applicants: {
        counts: apiData.new_applicants?.value || 0,
        percentage: Math.abs(apiData.new_applicants?.growth_percentage || 0),
        direction: this.getDirection(apiData.new_applicants?.growth_percentage || 0)
      },
      registered_venues: {
        counts: apiData.registered_venues?.value || 0,
        percentage: Math.abs(apiData.registered_venues?.growth_percentage || 0),
        direction: this.getDirection(apiData.registered_venues?.growth_percentage || 0)
      },
      events: {
        counts: apiData.events?.value || 0,
        percentage: Math.abs(apiData.events?.growth_percentage || 0),
        direction: this.getDirection(apiData.events?.growth_percentage || 0)
      },
      financial_aid_requests: {
        counts: apiData.financial_aid_requests?.value || 0,
        percentage: Math.abs(apiData.financial_aid_requests?.growth_percentage || 0),
        direction: this.getDirection(apiData.financial_aid_requests?.growth_percentage || 0)
      }
    };

    console.log('Updated analytics data:', this.analyticsdata);
  }

  private getDirection(percentage: number): string {
    if (percentage > 0) return 'up';
    if (percentage < 0) return 'down';
    return 'neutral';
  }

  fetchFinancialOverviewChart(): void {
    this.financialOverviewChartLoading = true;
    this.financialOverviewChartError = '';
    this.financialOverviewHasData = true;

    // For now, create a static chart since we don't have the API endpoint
    // This can be replaced with actual API call later
    setTimeout(() => {
      this.financialOverviewChartOptions = {
        series: [60, 25, 15], // Approved, In Review, Rejected percentages
      chart: {
        type: 'donut',
          height: 300,
          fontFamily: 'inherit'
        },
        colors: ['#A7C7E7', '#FFC78E', '#FF9999'],
        stroke: {
          width: 4,
          colors: ['#ffffff']
        },
        labels: ['Approved', 'In Review', 'Rejected'],
      plotOptions: {
        pie: {
          donut: {
            size: '60%',
            labels: {
              show: true,
              name: {
                show: true,
                fontSize: '14px',
                fontWeight: 600,
                  color: '#374151'
              },
              value: {
                show: true,
                fontSize: '16px',
                  fontWeight: 700,
                  color: '#111827',
                  formatter: function (val: string) {
                    return val + '%';
                  }
              },
              total: {
                show: true,
                  showAlways: true,
                  label: 'Approved: 60%',
                  fontSize: '12px',
                  fontWeight: 500,
                  color: '#6b7280'
              }
            }
          }
        }
      },
      dataLabels: {
        enabled: false
      },
      legend: {
          show: false // Using custom legend
        },
      tooltip: {
        y: {
          formatter: function (val: any) {
              return val + '%';
            }
          }
        },
        states: {
          hover: {
            filter: {
              type: 'lighten',
              value: 0.1
          }
        }
      }
    };

      this.financialOverviewChartLoading = false;
    }, 1000);
  }

  fetchFacilityChart(): void {
    this.facilityChartLoading = true;
    this.facilityChartError = '';
    this.facilityHasData = true;

    // For now, create a static chart since we don't have the API endpoint
    // This can be replaced with actual API call later
    setTimeout(() => {
      this.facilityChartOptions = {
        series: [
          {
            name: 'Booking Slots',
            data: [55, 50, 80, 65, 77, 52] // Exact percentages from the image
          },
          {
            name: 'Pending/Inactive Slots',
            data: [0, 5, 15, 20, 13, 40] // Orange sections
          },
          {
            name: 'Unused Slots',
            data: [45, 45, 5, 15, 10, 8] // Pink/red sections at top
          }
        ],
        chart: {
          type: 'bar',
          height: 280,
          stacked: true,
          stackType: '100%',
          toolbar: {
            show: false
          },
          fontFamily: 'inherit'
        },
        plotOptions: {
          bar: {
            horizontal: false,
            columnWidth: '70%',
            borderRadius: 8,
            borderRadiusApplication: 'end',
            borderRadiusWhenStacked: 'last'
          }
        },
        xaxis: {
          categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          axisBorder: {
            show: false
          },
          axisTicks: {
            show: false
          },
          labels: {
            style: {
              colors: '#6b7280',
              fontSize: '14px',
              fontWeight: 500
            }
          }
        },
        yaxis: {
          max: 100,
          show: false
        },
        grid: {
          show: false
        },
        colors: ['#A7C7E7', '#FFC78E', '#FF9999'], // Exact colors: light blue, amber, light red
        legend: {
          show: false // We're using custom legend
      },
      dataLabels: {
        enabled: false
      },
      tooltip: {
          shared: true,
          intersect: false,
          y: {
            formatter: function (val: any, opts: any) {
              const seriesName = opts.series[opts.seriesIndex].name;
              if (seriesName === 'Booking Slots') {
                return val + '% (3,800 slots)';
              } else if (seriesName === 'Pending/Inactive Slots') {
                return val + '% (600 slots)';
              } else {
                return val + '% (600 slots)';
              }
            }
          },
          x: {
            show: false
          }
        }
      };

      this.facilityChartLoading = false;
    }, 1000);
  }

  // Google Maps methods
  retryMapInitialization(): void {
    console.log('Retrying map and venue data...');
    
    // Close any existing error info window
    if (this.errorInfoWindow) {
      this.errorInfoWindow.close();
      this.errorInfoWindow = null;
    }
    
    // If map is not initialized, reinitialize it
    if (!this.venueMap) {
      this.venueMapLoading = true;
      this.venueMapError = '';
      this.venueMapInitialized = false;
      
      // Reload Google Maps if necessary
      if (typeof google === 'undefined' || !google.maps) {
        this.googleMapsLoaded = false;
        this.loadGoogleMaps();
      } else {
        // Try to initialize immediately
        setTimeout(() => {
          this.initializeVenueMap();
        }, 500);
      }
    } else {
      // Map exists, just retry venue data
      if (this.selectedVenueDistrict && this.selectedVenueTime) {
        this.fetchVenuesByDistrict();
      }
    }
  }

  loadGoogleMaps(): void {
    console.log('Loading Google Maps...');
    
    // Check if Google Maps is already loaded
    if (typeof google !== 'undefined' && google.maps) {
      console.log('Google Maps already loaded');
      this.googleMapsLoaded = true;
      // Try to initialize immediately if view is ready
      if (this.venueMapContainer && this.venueMapContainer.nativeElement) {
        setTimeout(() => {
          this.initializeVenueMap();
        }, 50);
      }
      return;
    }

    // Check if script is already in the document
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      console.log('Google Maps script already exists, waiting for load...');
      // Wait for existing script to load
      setTimeout(() => {
        if (typeof google !== 'undefined' && google.maps) {
          this.googleMapsLoaded = true;
          if (this.venueMapContainer) {
            this.initializeVenueMap();
          }
        }
      }, 2000);
      return;
    }

    console.log('Creating Google Maps script...');
    
    // Create script element
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBdJkHovEH-NjsxqOEYAwF2x9n3UmNFNCU&libraries=places`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      console.log('Google Maps script loaded successfully');
      this.googleMapsLoaded = true;
      if (this.venueMapContainer && this.venueMapContainer.nativeElement) {
        setTimeout(() => {
          this.initializeVenueMap();
        }, 100);
      } else {
        console.log('Map container not ready yet, will initialize later');
      }
    };

    script.onerror = (error) => {
      console.error('Failed to load Google Maps script:', error);
      this.venueMapLoading = false;
      this.venueMapError = 'Failed to load Google Maps. Please check your internet connection.';
    };

    document.head.appendChild(script);
    console.log('Google Maps script added to document head');
  }

  initializeVenueMap(): void {
    console.log('Attempting to initialize venue map...');
    
    if (this.venueMapInitialized) {
      console.log('Map already initialized');
      return;
    }
    
    if (!this.venueMapContainer) {
      console.error('Map container ViewChild not available');
      return;
    }
    
    if (!this.venueMapContainer.nativeElement) {
      console.error('Map container native element not available');
      return;
    }

    if (typeof google === 'undefined' || !google.maps) {
      console.error('Google Maps not loaded yet');
      this.venueMapError = 'Google Maps is still loading. Please wait...';
      return;
    }

    console.log('Initializing venue map...');
    this.venueMapLoading = true;
    this.venueMapError = '';
    this.venueMapHasData = true;

    try {
      // Get coordinates based on selected district or default to Kolkata
      const mapCenter = this.getDistrictCoordinates(this.selectedVenueDistrict) || { lat: 22.5726, lng: 88.3639 };
      console.log('Map center:', mapCenter);

      this.venueMap = new google.maps.Map(this.venueMapContainer.nativeElement, {
        zoom: 11,
        center: mapCenter,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: true,
        styles: [
          {
            featureType: 'water',
            elementType: 'geometry',
            stylers: [{ color: '#e3f2fd' }]
          },
          {
            featureType: 'landscape',
            elementType: 'geometry',
            stylers: [{ color: '#f5f5f5' }]
          }
        ]
      });

      // Add venue markers based on selected district
      this.addVenueMarkersForDistrict(this.selectedVenueDistrict);
      this.venueMapInitialized = true;
      this.venueMapLoading = false;
      this.venueMapHasData = true;

      // Trigger map resize to ensure proper rendering
      setTimeout(() => {
        if (this.venueMap) {
          google.maps.event.trigger(this.venueMap, 'resize');
          console.log('Map resize triggered');
        }
      }, 100);

      this.cdr.detectChanges();
      console.log('Venue map initialized successfully');

    } catch (error) {
      console.error('Error initializing venue map:', error);
      this.venueMapLoading = false;
      this.venueMapError = 'Failed to load map.';
      this.venueMapHasData = false;
    }
  }

  addVenueMarkers(): void {
    const venues = [
      { name: 'Eden Gardens', lat: 22.5648, lng: 88.3426 },
      { name: 'Salt Lake Stadium', lat: 22.5645, lng: 88.4107 },
      { name: 'Netaji Indoor Stadium', lat: 22.5726, lng: 88.3639 },
      { name: 'Rabindra Sarobar Stadium', lat: 22.5186, lng: 88.3639 },
      { name: 'Mohun Bagan Ground', lat: 22.5726, lng: 88.3539 }
    ];

    venues.forEach(venue => {
      const marker = new google.maps.Marker({
        position: { lat: venue.lat, lng: venue.lng },
        map: this.venueMap,
        title: venue.name,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#f44336"/>
              <circle cx="12" cy="9" r="2.5" fill="white"/>
            </svg>
          `),
          scaledSize: new google.maps.Size(24, 24),
          anchor: new google.maps.Point(12, 24)
        }
      });

      // Add info window
      const infoWindow = new google.maps.InfoWindow({
        content: `<div style="padding: 8px;"><strong>${venue.name}</strong></div>`
      });

      marker.addListener('click', () => {
        infoWindow.open(this.venueMap, marker);
      });

      this.venueMarkers.push(marker);
    });
  }
}