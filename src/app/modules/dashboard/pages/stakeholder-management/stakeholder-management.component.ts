import { NftHeaderComponent } from '../../components/nft/nft-header/nft-header.component';
import { UserStatsCardComponent } from '../../components/stakeholder-management/user-stats-card/user-stats-card.component';
import { StakeholderTableComponent } from '../../components/stakeholder-management/stakeholder-table/stakeholder-table.component';
import { CommonModule, NgIf } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild, AfterViewInit, ChangeDetectorRef, HostListener } from '@angular/core';
import { ThemeService } from 'src/app/core/services/theme.service';
import { ChartOptions } from '../../../../shared/models/chart-options';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { ButtonComponent } from 'src/app/shared/components/button/button.component';
import { StackholderService } from 'src/app/core/services/stackholder.service';
import { FormsModule } from '@angular/forms';
import { PiechartComponent } from '../../components/stakeholder-management/charts/piechart/piechart.component';
import { DonutchartComponent } from '../../components/stakeholder-management/charts/donutchart/donutchart.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { UnderscoreToSpacePipe } from 'src/app/pipes/underscore-to-space.pipe';
import { Router } from '@angular/router';

declare var google: any;

@Component({
  selector: 'app-stakeholder-management',
  imports: [
    NftHeaderComponent,
    UserStatsCardComponent,
    StakeholderTableComponent,
    NgIf,
    CommonModule,
    NgApexchartsModule,
    AngularSvgIconModule,
    PiechartComponent,
    ButtonComponent,
    FormsModule,
    DonutchartComponent,
    MatDialogModule,
    MatButtonModule,
    UnderscoreToSpacePipe,
  ],
  templateUrl: './stakeholder-management.component.html',
  styleUrl: './stakeholder-management.component.css',
})
export class StakeholderManagementComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('mapContainer') mapContainer!: ElementRef;

  public chartOptions: Partial<ChartOptions>;
  stakelist: any;
  countsData: any;
  athletesData: any = [];
  selectedStatus = 'active';
  selectedTime = 'last_6_months';
  selectedUser = 'player'; // Default selection is player
  isRoleDropdownOpen = false;
  roleOptions = [
    { value: '', label: 'All' },
    { value: 'player', label: 'Player' },
    { value: 'coach', label: 'Coach' }
  ];
  donut_chart: any;
  pie_chart: any;
  months: any[] = [];
  districts: any[] = [];
  map: any;
  markers: any[] = []; // Changed from single marker to array of markers
  geocoder: any;
  mapInitialized: boolean = false;
  currentPage: number = 1;
  pageSize: number = 5;
  visible: boolean = false;
  googleMapsLoaded: boolean = false;
  donutChartdescription: String = "";
  pieChartdescription: String = "";

  constructor(
    public stackholderService: StackholderService,
    private cdr: ChangeDetectorRef,
    private router: Router,
  ) {
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
      dataLabels: {
        enabled: false,
      },
      chart: {
        fontFamily: 'inherit',
        type: 'bar',
        height: 350,
        toolbar: {
          show: false,
        },
        sparkline: {
          enabled: false,
        },
      },
      fill: {
        opacity: 1,
      },
      stroke: {
        show: false,
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
      colors: ['#A7C7E7', '#FFC78E'],
    };
  }

  ngOnInit(): void {
    this.getStakeList();
    this.getCount();
    this.getAthletes();
    this.getDropdownData();
    this.loadGoogleMaps();
    this.getDonutChart();
    this.getPieChart();
  }

  ngAfterViewInit(): void {
    // Add a small delay to ensure the view is fully rendered
    setTimeout(() => {
      this.checkAndInitializeMap();
    }, 100);
  }

  ngOnDestroy(): void {
    // Clean up map resources if needed
    if (this.map) {
      this.clearAllMarkers();
      this.map = null;
    }
    this.mapInitialized = false;
  }

  toggleDisplay() {
    this.visible = !this.visible;
    this.router.navigate(['/dashboard/stakeholder-management-details']);
    // If returning to main view (visible = false), reinitialize map
    if (!this.visible) {
      setTimeout(() => {
        this.checkAndInitializeMap();
      }, 100);
    }
  }

  private checkAndInitializeMap(): void {
    if (!this.visible && this.googleMapsLoaded && this.mapContainer && this.mapContainer.nativeElement) {
      // Reset map initialization flag
      this.mapInitialized = false;
      // Force change detection
      this.cdr.detectChanges();
      // Initialize map with a slight delay
      setTimeout(() => {
        this.initializeMap();
      }, 50);
    }
  }

  getStakeList(): void {
    const payload = {
      page: 1,
      limit: 5,
      filters: {
        ...(this.selectedUser && { customer_type: this.selectedUser }) // Only include if user has selected a role
      },
    };

    this.stackholderService.getListing(payload).subscribe({
      next: (res) => {
        this.stakelist = res.data.customers;
      },
      error: (err) => {
        console.error('Failed to fetch list:', err);
      },
    });
  }

  private handleError(error: any): void {
    console.error('Component error:', error);
  }

  donutFilter = {
    status: 'active',
    time_period: 'last_6_months',
  };

  pieChartFilter = {
    district: 'kolkata',
    time_period: 'last_6_months',
  };

  onPieChartFilterChange(value: string, type: string) {
    this.pieChartFilter[type] = value;
    this.getPieChart();
  }

  onDonutFilterChange(value: string, type: string) {
    this.donutFilter[type] = value;
    this.getDonutChart();
  }

  getDonutChart(): void {
    try {
      const payload = {
        donut_filter: {
          status: this.donutFilter.status,
          time_period: this.donutFilter.time_period,
        },
      };
      this.stackholderService.getdonutChart(payload).subscribe({
        next: (res) => {
          console.log('Analytics Response:', res);
          if (res?.status?.success && res?.data) {
            this.processAnalyticsResponse(res.data);
            this.donutChartdescription = res.data.donut_chart?.description;
          } else {
            this.handleError('Invalid analytics response');
          }
        },
        error: (err) => {
          console.error('Failed to fetch user analytics:', err);
          this.handleError(err);
        },
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  getPieChart(): void {
    try {
      const payload = {
        pie_chart_filter: {
          district: this.pieChartFilter.district,
          time_period: this.pieChartFilter.time_period,
        },
      };
      this.stackholderService.getpieChart(payload).subscribe({
        next: (res) => {
          console.log('Analytics Response:', res);
          if (res?.status?.success && res?.data) {
            this.processAnalyticsResponse(res.data);
            this.pieChartdescription = res.data.pie_chart?.description;

          } else {
            this.handleError('Invalid analytics response');
          }
        },
        error: (err) => {
          console.error('Failed to fetch user analytics:', err);
          this.handleError(err);
        },
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  private processAnalyticsResponse(data: any): void {
    try {
      if (data.donut_chart) {
        this.donut_chart = {
          series: data.donut_chart.series || [0, 0],
          labels: data.donut_chart.labels || ['Active Users', 'Inactive Users'],
          colors: data.donut_chart.colors || ['#A7C7E7', '#FFC78E'],
          chart: data.donut_chart.chart || { type: 'donut', height: 350 },
          responsive: data.donut_chart.responsive || [],
        };
      }

      // Process pie chart data safely
      if (data.pie_chart) {
        this.pie_chart = {
          series: data.pie_chart.series || [],
          xaxis: data.pie_chart.xaxis || { categories: ['Aug'] },
        };
      }
    } catch (error) {
      console.error('Error processing analytics response:', error);
      this.handleError(error);
    }
  }

  getCount(): void {
    this.stackholderService.getCounts().subscribe({
      next: (res) => {
        this.countsData = res.data?.dashboard_analytics;
      },
      error: (err) => {
        console.error('Failed to fetch list:', err);
      },
    });
  }

  getAthletes(): void {
    console.log('selected ', this.selectedTime);
    const payload = {
      status: this.selectedStatus,
      time_period: this.selectedTime,
      user_type: this.selectedUser,
      district: 'kolkata',
    };

    this.stackholderService.getAthletes(payload).subscribe({
      next: (res) => {
        this.athletesData = res.data.map.districts;
        console.log('this.athletesData ', this.athletesData);

        // If map is initialized and we're on the main view, update markers
        if (this.mapInitialized && !this.visible) {
          this.updateMapMarkers();
        }
      },
      error: (err) => {
        console.error('Failed to fetch list:', err);
      },
    });
  }

  // --- Status/Progress Helper Methods ---
  get profileStatusSteps() {
    if (!this.athletesData?.profile_status) return [];
    // Convert object to array and sort by order_num if present, else fallback to key order
    return Object.values(this.athletesData.profile_status).sort(
      (a: any, b: any) => (a.order_num ?? 0) - (b.order_num ?? 0),
    );
  }

  getSortedSteps(statusObj: any): any[] {
    return Object.values(statusObj || {}).sort((a: any, b: any) => (a.order_num || 0) - (b.order_num || 0));
  }

// Add these methods to your StakeholderTableComponent class

/**
 * Get the current profile step count (0/2, 1/2, or 2/2)
 */
getProfileStepCount(profileStatus: any): string {
  if (!profileStatus) return '0';
  
  // If approved, show 2/2
  if (profileStatus.approved?.is_active) {
    return '2';
  }
  
  // If rejected, show the step where it was rejected
  if (profileStatus.rejected?.is_active) {
    // If under_review exists and was active, it means it reached review stage
    if (profileStatus.under_review) {
      return '1'; // Rejected at review stage
    }
    return '0'; // Rejected at initial stage
  }
  
  // If under review, show 1
  if (profileStatus.under_review?.is_active) {
    return '1';
  }
  
  // If only enrolled, show 0
  if (profileStatus.enrolled?.is_active) {
    return '0';
  }
  
  return '0';
}

/**
 * Get the CSS class for step icons based on profile status
 */
getStepIconClass(profileStatus: any, step: number): string {
  const currentStep = parseInt(this.getProfileStepCount(profileStatus));
  const isRejected = profileStatus?.rejected?.is_active;
  
  if (step === 1) {
    // Step 1 is always completed (green) since profile is created
    return 'bg-green-600';
  }
  
  if (step === 2) {
    if (isRejected && currentStep >= 1) {
      return 'bg-red-500'; // Pink for rejected at this stage or later
    } else if (currentStep >= 1) {
      return 'bg-green-600'; // Green if reached or passed this step
    } else {
      return 'bg-orange-400'; // Gray for pending
    }
  }
  
  if (step === 3) {
    if (isRejected && currentStep >= 2) {
      return 'bg-red-500'; // Pink for rejected at final stage
    } else if (currentStep >= 2) {
      return 'bg-green-600'; // Green if approved (step 2 completed)
    } else {
      return 'bg-orange-400'; // Gray for pending
    }
  }
  
  return 'bg-gray-400';
}

/**
 * Get the icon HTML for each step
 */
getStepIcon(profileStatus: any, step: number): string {
  const currentStep = parseInt(this.getProfileStepCount(profileStatus));
  const isRejected = profileStatus?.rejected?.is_active;
  
  if (step === 1) {
    // Step 1 is always completed (checkmark)
    return '✓';
  }
  
  if (step === 2) {
    if (isRejected && currentStep >= 1) {
      return '✕'; // Cross for rejected
    } else if (currentStep >= 1) {
      return '✓'; // Checkmark if completed
    } else {
      return '!'; // Exclamation for pending
    }
  }
  
  if (step === 3) {
    if (isRejected && currentStep >= 2) {
      return '✕'; // Cross for rejected
    } else if (currentStep >= 2) {
      return '✓'; // Checkmark if approved
    } else {
      return '!'; // Exclamation for pending
    }
  }
  
  return '!';
}

/**
 * Get the progress line CSS class
 */
getProgressLineClass(profileStatus: any): string {
  const isRejected = profileStatus?.rejected?.is_active;
  const isApproved = profileStatus?.approved?.is_active;
  
  if (isRejected) {
    return 'bg-red-500'; // Pink line for rejected
  } else if (isApproved) {
    return 'bg-green-600'; // Green line for approved
  } else {
    return 'bg-orange-500'; // Orange line for in progress
  }
}

/**
 * Update the existing getActiveStepCount method to work with the new logic
 */
getActiveStepCount(statusObj: any): number {
  return parseInt(this.getProfileStepCount(statusObj));
}

/**
 * Update the existing getTotalStepCount method
 */
getTotalStepCount(statusObj: any): number {
  return 2; // Always 2 as per your requirement
}


  getProgressPercent(status: any): string {
    if (status?.approved?.is_active) {
      return '100%';
    }
    const total = this.getTotalStepCount(status);
    const active = this.getActiveStepCount(status);
    const percent = total ? Math.round((active / total) * 100) : 0;
    return `${percent}%`;
  }

  isFinalStatus(statusObj: any): boolean {
    if (!statusObj) return false;

    const finalKeys = ['approved', 'rejected'];
    return finalKeys.some((key) => statusObj[key]?.is_active);
  }

  getFinalStatus(statusObj: any): string {
    if (statusObj?.approved?.is_active) {
      return 'Approved';
    } else if (statusObj?.rejected?.is_active) {
      return 'Rejected';
    }
    return '';
  }


  getDropdownData(): void {
    try {
      const payload = {
        sports: true,
        roles_ddl: true,
        districts: true,
        admin_months_filter: true,
      };

      this.stackholderService.getDropdownLists(payload).subscribe({
        next: (res) => {
          console.log('Dropdown Response:', res);
          if (res?.status?.success) {
            this.months = res.data.admin_months_filter;
            this.districts = res.data.districts;
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

  loadGoogleMaps(): void {
    // Check if Google Maps is already loaded
    if (typeof google !== 'undefined' && google.maps) {
      this.googleMapsLoaded = true;
      setTimeout(() => {
        this.checkAndInitializeMap();
      }, 100);
      return;
    }

    // Load Google Maps script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBdJkHovEH-NjsxqOEYAwF2x9n3UmNFNCU&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      this.googleMapsLoaded = true;
      setTimeout(() => {
        this.checkAndInitializeMap();
      }, 100);
    };
    script.onerror = () => {
      console.error('Failed to load Google Maps script');
    };
    document.head.appendChild(script);
  }

  initializeMap(): void {
    if (this.mapInitialized || !this.mapContainer || !this.mapContainer.nativeElement) {
      return;
    }

    try {
      // West Bengal center coordinates
      const westBengalCenter = { lat: 22.9868, lng: 87.8550 };

      // Initialize map centered on West Bengal
      this.map = new google.maps.Map(this.mapContainer.nativeElement, {
        center: westBengalCenter,
        zoom: 7, // Adjusted zoom to show entire West Bengal
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });

      this.geocoder = new google.maps.Geocoder();
      this.mapInitialized = true;

      // Create markers for all districts
      this.updateMapMarkers();

      console.log('Map initialized with West Bengal view');
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }

  // Clear all existing markers
  private clearAllMarkers(): void {
    if (this.markers && this.markers.length > 0) {
      this.markers.forEach(marker => {
        marker.setMap(null);
      });
      this.markers = [];
    }
  }

  // Get growth direction icon based on direction
  private getGrowthIcon(direction: string): string {
    switch (direction) {
      case 'up':
        return '↗';
      case 'down':
        return '↘';
      case 'neutral':
      default:
        return '→';
    }
  }

  // Get growth color based on direction
  private getGrowthColor(direction: string): string {
    switch (direction) {
      case 'up':
        return '#16A34A'; // Green
      case 'down':
        return '#DC2626'; // Red
      case 'neutral':
      default:
        return '#6B7280'; // Gray
    }
  }

  // Update map with markers for all districts
  private updateMapMarkers(): void {
    if (!this.map || !this.athletesData) {
      return;
    }

    // Clear existing markers
    this.clearAllMarkers();

    // Create markers for all districts
    this.athletesData.forEach((district: any) => {
      if (district.lat && district.lng) {
        const position = { lat: district.lat, lng: district.lng };

        // Create marker with red color
        const marker = new google.maps.Marker({
          position: position,
          map: this.map,
          title: district.district,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="8" fill="#DC2626" stroke="#ffffff" stroke-width="2"/>
                <circle cx="12" cy="12" r="4" fill="#ffffff"/>
              </svg>
            `),
            scaledSize: new google.maps.Size(24, 24),
            anchor: new google.maps.Point(12, 12)
          }
        });

        // Create InfoWindow content with dynamic data
        const growthIcon = this.getGrowthIcon(district.growth_direction);
        const growthColor = this.getGrowthColor(district.growth_direction);
        const growthText = district.growth_direction === 'neutral'
          ? 'No change'
          : `${growthIcon} ${district.growth_percentage}% over ${district.time_period?.replace('last_', '').replace('_', ' ')}`;

        const infoContent = `
          <div style="
            font-family: Arial, sans-serif; 
            font-size: 14px; 
            background: white; 
            border-radius: 8px; 
            padding: 12px; 
            box-shadow: 0px 2px 8px rgba(0,0,0,0.3);
            width: 200px;
            max-width: 250px;
          ">
            <h3 style="margin: 0 0 8px; font-weight: bold; font-size: 16px; color: #1F2937;">${district.district}</h3>
            
            <div style="display: flex; align-items: center; margin-bottom: 6px;">
              <span style="display:inline-block; width: 10px; height: 10px; background-color: #DC2626; border-radius: 50%; margin-right: 8px;"></span>
              <span style="color: #374151; font-weight: 500;">Total Users: ${district.total_users}</span>
            </div>
            
            <div style="color: ${growthColor}; font-size: 12px; font-weight: 500; margin-top: 8px;">
              ${growthText}
            </div>
            
            ${district.description ? `
              <div style="color: #6B7280; font-size: 11px; margin-top: 4px; font-style: italic;">
                ${district.description}
              </div>
            ` : ''}
          </div>
        `;

        // Create InfoWindow
        const infoWindow = new google.maps.InfoWindow({
          content: infoContent,
        });

        // Show InfoWindow on marker click
        marker.addListener('click', () => {
          // Close all other info windows first
          this.markers.forEach(m => {
            if (m.infoWindow) {
              m.infoWindow.close();
            }
          });

          infoWindow.open(this.map, marker);
        });

        // Store InfoWindow reference with marker
        (marker as any).infoWindow = infoWindow;

        // Add marker to array
        this.markers.push(marker);
      }
    });

    console.log(`Created ${this.markers.length} markers for districts`);
  }

  // Center map on specific district
  centerMapOnDistrict(district: any): void {
    if (!this.map || !district?.lat || !district?.lng) {
      console.warn('Cannot center map: map not initialized or district coordinates missing');
      return;
    }

    const position = { lat: district.lat, lng: district.lng };
    
    // Pan to the district location
    this.map.panTo(position);
    
    // Set zoom level for better district view
    this.map.setZoom(10);
    
    // Find and highlight the marker for this district
    const marker = this.markers.find(m => {
      const markerPos = m.getPosition();
      return markerPos && 
             markerPos.lat() === position.lat && 
             markerPos.lng() === position.lng;
    });
    
    if (marker) {
      // Open info window for this district
      if ((marker as any).infoWindow) {
        // Close all other info windows first
        this.markers.forEach(m => {
          if (m !== marker && (m as any).infoWindow) {
            (m as any).infoWindow.close();
          }
        });
        
        // Open info window for the clicked district
        (marker as any).infoWindow.open(this.map, marker);
      }
    }
    
    console.log(`Map centered on district: ${district.district}`);
  }

  // Role dropdown methods
  toggleRoleDropdown(): void {
    this.isRoleDropdownOpen = !this.isRoleDropdownOpen;
  }

  selectRole(role: string): void {
    this.selectedUser = role;
    this.isRoleDropdownOpen = false;
    // Trigger data refresh with new filter
    this.getStakeList();
  }

  closeRoleDropdown(): void {
    this.isRoleDropdownOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    // Close dropdown if clicking outside
    const target = event.target as HTMLElement;
    if (!target.closest('.role-dropdown')) {
      this.isRoleDropdownOpen = false;
    }
  }
}