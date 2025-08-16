import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EventService } from 'src/app/core/services/event.service';

declare var google: any;

@Component({
  selector: 'app-event-heatmap',
  imports: [CommonModule, FormsModule],
  templateUrl: './event-heatmap.component.html',
  styleUrl: './event-heatmap.component.css'
})
export class EventHeatmapComponent implements OnChanges, AfterViewInit, OnDestroy {
  @ViewChild('mapContainer') mapContainer!: ElementRef;
  @Input() certificateRepository: any;
  @Input() dropDownlist: any;
  timeFilterEvents: string = 'last_6_months';
  districtFilter: string = 'kolkata';
  sportFilter: string = 'cricket';
  @Output() districtChanged = new EventEmitter<string>();
  @Output() timeChanged = new EventEmitter<string>();

  // Map properties
  map: any;
  markers: any[] = [];
  geocoder: any;
  mapInitialized: boolean = false;
  googleMapsLoaded: boolean = false;
  eventData: any[] = [];

  constructor(private eventService: EventService) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['certificateRepository']) {
      console.log('certificateRepository in child:', this.certificateRepository);
      this.getMapLocations();
    }
  }

  ngAfterViewInit(): void {
    this.loadGoogleMaps();
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.clearAllMarkers();
      this.map = null;
    }
    this.mapInitialized = false;
  }

  onDistrictChange(event: any) {
    this.districtFilter = event.target.value;
    this.districtChanged.emit(this.districtFilter);
    this.getMapLocations();
  }

  onTimeChange(event: any) {
    this.timeFilterEvents = event.target.value;
    this.timeChanged.emit(this.timeFilterEvents);
    this.getMapLocations();
  }

  getMapLocations() {
    const payload = {
      map_filter: {
        district: this.districtFilter,
        sport: this.sportFilter,
        time_period: this.timeFilterEvents,
      },
    };
    
    this.eventService.getMapLocations(payload).subscribe({
      next: (res) => {
        console.log('Map Locations Response:', res);
        if (res?.status?.success && res?.data) {
          this.eventData = res.data.map_data.locations || [];
          if (this.mapInitialized) {
            this.updateMapMarkers();
            this.centerMapOnEventLocations();
          }
        } else {
          console.error('Invalid map locations response');
        }
      },
      error: (err) => {
        console.error('Failed to fetch map locations:', err);
      }
    });
  }

  centerMapOnDistrict() {
    if (!this.map || !this.dropDownlist?.districts) return;

    // Find the selected district from dropdown data
    const selectedDistrict = this.dropDownlist.districts.find((district: any) => 
      district.value.toLowerCase() === this.districtFilter.toLowerCase()
    );

    if (selectedDistrict && selectedDistrict.lat && selectedDistrict.lng) {
      // Smooth pan to the new district using coordinates from API
      const coordinates = { lat: selectedDistrict.lat, lng: selectedDistrict.lng };
      this.map.panTo(coordinates);
      this.map.setZoom(10); // Zoom level for district view
      
      console.log(`Map centered on ${this.districtFilter} at coordinates:`, coordinates);
    } else {
      // Default to West Bengal center if district not found
      const westBengalCenter = { lat: 22.9868, lng: 87.8550 };
      this.map.panTo(westBengalCenter);
      this.map.setZoom(7);
      
      console.log(`District ${this.districtFilter} not found in dropdown data, centered on West Bengal`);
    }
  }

  centerMapOnEventLocations() {
    if (!this.map || !this.eventData || this.eventData.length === 0) {
      // If no event data, fall back to district centering
      this.centerMapOnDistrict();
      return;
    }

    // Get all valid coordinates from event locations
    const validLocations = this.eventData.filter((event: any) => 
      event.lat && event.lng && !isNaN(event.lat) && !isNaN(event.lng)
    );

    if (validLocations.length === 0) {
      // If no valid coordinates, fall back to district centering
      this.centerMapOnDistrict();
      return;
    }

    if (validLocations.length === 1) {
      // Single location - center on it
      const location = validLocations[0];
      this.map.panTo({ lat: location.lat, lng: location.lng });
      this.map.setZoom(12); // Closer zoom for single location
      
      console.log(`Map centered on single event location:`, { lat: location.lat, lng: location.lng });
    } else {
      // Multiple locations - fit bounds to show all
      const bounds = new google.maps.LatLngBounds();
      
      validLocations.forEach((location: any) => {
        bounds.extend({ lat: location.lat, lng: location.lng });
      });
      
      this.map.fitBounds(bounds);
      
      // Add some padding to the bounds
      const listener = google.maps.event.addListenerOnce(this.map, 'bounds_changed', () => {
        const currentZoom = this.map.getZoom();
        if (currentZoom > 15) {
          this.map.setZoom(15); // Don't zoom too close
        }
      });
      
      console.log(`Map fitted to ${validLocations.length} event locations`);
    }
  }



  loadGoogleMaps(): void {
    if (typeof google !== 'undefined' && google.maps) {
      this.googleMapsLoaded = true;
      setTimeout(() => {
        this.initializeMap();
      }, 100);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBdJkHovEH-NjsxqOEYAwF2x9n3UmNFNCU&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      this.googleMapsLoaded = true;
      setTimeout(() => {
        this.initializeMap();
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
      const westBengalCenter = { lat: 22.9868, lng: 87.8550 };

      this.map = new google.maps.Map(this.mapContainer.nativeElement, {
        center: westBengalCenter,
        zoom: 7,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });

      this.geocoder = new google.maps.Geocoder();
      this.mapInitialized = true;

      this.getMapLocations();

      console.log('Event heatmap map initialized');
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }

  private clearAllMarkers(): void {
    if (this.markers && this.markers.length > 0) {
      this.markers.forEach(marker => {
        marker.setMap(null);
      });
      this.markers = [];
    }
  }

  private updateMapMarkers(): void {
    if (!this.map || !this.eventData) {
      return;
    }

    this.clearAllMarkers();

    this.eventData.forEach((event: any) => {
      if (event.lat && event.lng) {
        const position = { lat: event.lat, lng: event.lng };

        const marker = new google.maps.Marker({
          position: position,
          map: this.map,
          title: event.title,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="8" fill="#3B82F6" stroke="#ffffff" stroke-width="2"/>
                <circle cx="12" cy="12" r="4" fill="#ffffff"/>
              </svg>
            `),
            scaledSize: new google.maps.Size(24, 24),
            anchor: new google.maps.Point(12, 12)
          }
        });

        // Create venue details content
        const venueDetails = event.venue_details || {};
        const venueImage = venueDetails.image;
        const venueName = event.venue_name || venueDetails.name || 'Venue Name Not Available';
        const venueAddress = event.venue_address || venueDetails.address?.full || 'Address Not Available';
        const venueCapacity = venueDetails.capacity || 'N/A';
        const venueOpenStatus = venueDetails.open_status;
        const nearestTransport = venueDetails.nearest_transport || 'Transport info not available';

        const infoContent = `
          <div style="
            font-family: Arial, sans-serif; 
            background: white; 
            border-radius: 8px; 
            padding: 12px; 
            box-shadow: 0px 2px 8px rgba(0,0,0,0.15);
            width: 200px;
            border: 1px solid #e5e7eb;
          ">
            <!-- Venue Name -->
            <div style="font-weight: bold; font-size: 16px; color: #1F2937; margin-bottom: 8px;">
              ${venueName}
            </div>
            
            <!-- Venue Address -->
            <div style="color: #6B7280; font-size: 14px; line-height: 1.3;">
              ${venueAddress}
            </div>
          </div>
        `;

        const infoWindow = new google.maps.InfoWindow({
          content: infoContent,
          maxWidth: 200,
        });

        // Show popup on hover
        marker.addListener('mouseover', () => {
          this.markers.forEach(m => {
            if (m.infoWindow) {
              m.infoWindow.close();
            }
          });
          infoWindow.open(this.map, marker);
        });

        // Hide popup when mouse leaves marker
        marker.addListener('mouseout', () => {
          setTimeout(() => {
            infoWindow.close();
          }, 100);
        });

        // Also show on click for mobile devices
        marker.addListener('click', () => {
          this.markers.forEach(m => {
            if (m.infoWindow) {
              m.infoWindow.close();
            }
          });
          infoWindow.open(this.map, marker);
        });

        (marker as any).infoWindow = infoWindow;
        this.markers.push(marker);
      }
    });

    console.log(`Created ${this.markers.length} markers for events`);
  }
}
