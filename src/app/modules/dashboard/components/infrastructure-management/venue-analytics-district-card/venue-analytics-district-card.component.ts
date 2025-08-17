import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild, AfterViewInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventHeatmapComponent } from '../../event-management/event-heatmap/event-heatmap/event-heatmap.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { FormsModule } from '@angular/forms';
import { EventService } from '../../../../../core/services/event.service';

declare var google: any;

interface Venue {
  id: number;
  name: string;
  owner: string;
  rating: number;
  image: string;
}

interface FeedbackItem {
  name: string;
  cleanliness: number;
  staffBehavior: number;
  facilitiesMaintenance: number;
}

@Component({
  selector: 'app-venue-analytics-district-card',
  standalone: true,
  imports: [CommonModule, AngularSvgIconModule, FormsModule],
  templateUrl: './venue-analytics-district-card.component.html',
  styleUrls: ['./venue-analytics-district-card.component.css'],
})
export class VenueAnalyticsDistrictCardComponent implements OnInit, AfterViewInit, OnChanges {
  @ViewChild('mapContainer') mapContainer!: ElementRef;
  @Input() feedback: any = [];
  @Input() topRatedFacilities: any = [];
  @Output() filterChanged = new EventEmitter<{ key: string; value: any }>();
  @Input() districts: any[] = [];
  @Input() sports: any[] = [];
  
  map: any;
  markers: any[] = [];
  lat = 22.5726;
  lng = 88.3639;

  totalVenueByDistrictDistrict: string = 'kolkata';
  totalVenueByDistrictSport: string = 'cricket';
  mapInitialized = false;
  venueData: any[] = [];
  googleMapsLoaded = false;

  constructor(private eventService: EventService) {}

  featuredVenue = {
    name: 'Emerald Arena',
    location: 'Kolkata, West Bengal 700021, India (Near Babu Ghat',
    image: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=300&h=200&fit=crop',
  };

  topVenues: Venue[] = [
    {
      id: 1,
      name: 'Greenfield Arena',
      owner: 'Santanu Singh',
      rating: 4.5,
      image: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=80&h=80&fit=crop',
    },
    {
      id: 2,
      name: 'Emerald Park Stadium',
      owner: 'Arjun Mehta',
      rating: 4.5,
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=80&h=80&fit=crop',
    },
    {
      id: 3,
      name: 'Sunset Sports Complex',
      owner: 'Ravi Kumar',
      rating: 4.5,
      image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=80&h=80&fit=crop',
    },
    {
      id: 4,
      name: 'Silver Lake Stadium',
      owner: 'Vikram Sharma',
      rating: 4.5,
      image: 'https://images.unsplash.com/photo-1459865264687-595d652de67e?w=80&h=80&fit=crop',
    },
    {
      id: 5,
      name: 'Maple Leaf Grounds',
      owner: 'Nikhil Joshi',
      rating: 4.5,
      image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=80&h=80&fit=crop',
    },
  ];

  feedbackData: FeedbackItem[] = [
    {
      name: 'Champions Arena',
      cleanliness: 4.8,
      staffBehavior: 4.7,
      facilitiesMaintenance: 4.9,
    },
    {
      name: 'Victory Field',
      cleanliness: 4.8,
      staffBehavior: 4.7,
      facilitiesMaintenance: 4.9,
    },
    {
      name: 'Triumph Stadium',
      cleanliness: 4.8,
      staffBehavior: 4.7,
      facilitiesMaintenance: 4.9,
    },
  ];

  ngOnInit(): void {
    this.loadGoogleMaps();
  }

  ngAfterViewInit(): void {
    // Wait a bit for the view to be fully rendered
    setTimeout(() => {
      if (this.googleMapsLoaded && !this.mapInitialized && this.mapContainer) {
        this.initializeMap();
      }
    }, 100);
  }

  ngOnChanges(changes: any) {
    if (changes.topRatedFacilities) {
      this.loadVenuesFromInput();
    }
  }

  loadGoogleMaps() {
    // Check if google maps is already loaded
    if (typeof google !== 'undefined' && google.maps) {
      this.googleMapsLoaded = true;
      // Don't initialize here, wait for AfterViewInit
      return;
    }

    // Load Google Maps script for the first time
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBdJkHovEH-NjsxqOEYAwF2x9n3UmNFNCU&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      this.googleMapsLoaded = true;
      // Only initialize if view is ready
      if (this.mapContainer) {
        this.initializeMap();
      }
    };
    script.onerror = (error) => {
      console.error('Failed to load Google Maps script:', error);
    };
    document.head.appendChild(script);
  }

  initializeMap() {
    if (!this.mapContainer || !this.mapContainer.nativeElement) {
      console.error('Map container not found or not ready');
      return;
    }

    if (!this.googleMapsLoaded) {
      console.error('Google Maps not loaded yet');
      return;
    }

    const kolkataLocation = { lat: this.lat, lng: this.lng };

    try {
      this.map = new google.maps.Map(this.mapContainer.nativeElement, {
        center: kolkataLocation,
        zoom: 12,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });

      this.mapInitialized = true;
      console.log('Map initialized successfully');

      // Load venues if they are already available
      if (this.topRatedFacilities && this.topRatedFacilities.length > 0) {
        this.loadVenuesFromInput();
      }
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }

  loadVenuesFromInput() {
    this.venueData = [];

    if (!this.topRatedFacilities || this.topRatedFacilities.length === 0) {
      // Clear existing markers when no facilities are available
      if (this.mapInitialized && this.map) {
        this.clearAllMarkers();
      }
      return;
    }

    this.topRatedFacilities.forEach((district: any) => {
      if (district.venues && Array.isArray(district.venues)) {
        district.venues.forEach((venue: any) => {
          // Convert string coordinates to numbers and validate
          const lat = typeof venue.lat === 'string' ? parseFloat(venue.lat) : venue.lat;
          const lng = typeof venue.lng === 'string' ? parseFloat(venue.lng) : venue.lng;

          // Validate converted coordinates
          if (
            lat &&
            lng &&
            typeof lat === 'number' &&
            typeof lng === 'number' &&
            !isNaN(lat) &&
            !isNaN(lng) &&
            lat !== 0 &&
            lng !== 0
          ) {
            // Store venue with converted numeric coordinates
            const processedVenue = {
              ...venue,
              lat: lat,
              lng: lng,
            };

            this.venueData.push(processedVenue);
          } else {
            console.warn('Venue has invalid coordinates:', {
              name: venue.name,
              originalLat: venue.lat,
              originalLng: venue.lng,
              convertedLat: lat,
              convertedLng: lng,
            });
          }
        });
      } else {
        console.warn('District missing venues array:', district);
      }
    });

    // Update markers if map is ready
    if (this.mapInitialized && this.map) {
      this.updateVenueMarkers();
      this.centerMapOnVenues();
    } else {
      console.log('Map not ready yet, will update markers when map initializes');
    }
  }

  updateVenueMarkers() {
    if (!this.map || !this.venueData || this.venueData.length === 0) {
      return;
    }

    this.clearAllMarkers();

    this.venueData.forEach((venue: any, index: number) => {
      if (venue.lat && venue.lng) {
        const position = { lat: venue.lat, lng: venue.lng };

        // Fixed marker icon configuration
        const marker = new google.maps.Marker({
          position: position,
          map: this.map,
          title: venue.name,
          // Use a simple pin or custom icon URL
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="#DC2626">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            `),
            scaledSize: new google.maps.Size(32, 32),
            anchor: new google.maps.Point(16, 32),
          }
        });

        // Simple info window with district name and total venues
        const districtData = this.topRatedFacilities.find(
          (district: any) => district.venues && district.venues.some((v: any) => v.id === venue.id),
        );

        const districtName = districtData?.district || 'Unknown District';
        const venueName =
          districtData?.venues?.find((v: any) => v.id === venue.id)?.name || venue.name || 'Unknown Venue';
        const totalVenues = districtData?.total_venues || districtData?.venues?.length || 0;

        const infoContent = `
        <div style="
          font-family: 'Segoe UI', Arial, sans-serif; 
          background: white; 
          border-radius: 8px; 
          padding: 12px; 
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          width: 200px;
          border: 1px solid #e5e7eb;
        ">
          <div style="
            font-weight: 600; 
            font-size: 16px; 
            color: #1F2937; 
            margin-bottom: 8px;
            text-transform: capitalize;
          ">
            📍 ${districtName}
          </div>
          
          <div style="
            color: #374151; 
            font-size: 14px; 
            font-weight: 500;
            margin-bottom: 6px;
          ">
            🏢 ${venueName}
          </div>
          
          <div style="
            color: #DC2626; 
            font-size: 14px; 
            font-weight: 500;
          ">
            🏟️ Total Venues: ${totalVenues}
          </div>
        </div>
      `;

        const infoWindow = new google.maps.InfoWindow({
          content: infoContent,
          maxWidth: 220,
        });

        // Click event
        marker.addListener('click', () => {
          this.markers.forEach((m: any) => {
            if (m.infoWindow && m.infoWindow !== infoWindow) {
              m.infoWindow.close();
            }
          });
          infoWindow.open(this.map, marker);
        });

        (marker as any).infoWindow = infoWindow;
        this.markers.push(marker);
      }
    });
  }

  // TrackBy functions for performance optimization
  trackByVenueId(index: number, venue: Venue): number {
    return venue.id;
  }

  trackByFeedbackName(index: number, feedback: FeedbackItem): string {
    return feedback.name;
  }

  emitTotalVenueByDistrictFilter() {
    this.filterChanged.emit({
      key: 'total_venue_by_district_filter',
      value: {
        district: this.totalVenueByDistrictDistrict,
        sport_type: this.totalVenueByDistrictSport,
      },
    });
  }

  // jab district dropdown change ho
  onTotalVenueDistrictChange(district: string) {
    this.totalVenueByDistrictDistrict = district;
    this.emitTotalVenueByDistrictFilter();
  }

  // jab sport dropdown change ho
  onTotalVenueSportChange(sport: string) {
    this.totalVenueByDistrictSport = sport;
    this.emitTotalVenueByDistrictFilter();
  }

  clearAllMarkers(): void {
    if (this.markers && this.markers.length > 0) {
      this.markers.forEach((marker) => {
        marker.setMap(null);
      });
      this.markers = [];
    }
  }

  centerMapOnVenues() {
    if (!this.map || !this.venueData || this.venueData.length === 0) {
      // Default to Kolkata center if no venues
      const kolkataCenter = { lat: 22.5726, lng: 88.3639 };
      this.map.panTo(kolkataCenter);
      this.map.setZoom(10);
      return;
    }

    // Get all valid coordinates from venue locations
    const validVenues = this.venueData.filter(
      (venue: any) => venue.lat && venue.lng && !isNaN(venue.lat) && !isNaN(venue.lng),
    );

    if (validVenues.length === 0) {
      // Default to Kolkata center if no valid coordinates
      const kolkataCenter = { lat: 22.5726, lng: 88.3639 };
      this.map.panTo(kolkataCenter);
      this.map.setZoom(10);
      return;
    }

    if (validVenues.length === 1) {
      // Single venue - center on it
      const venue = validVenues[0];
      this.map.panTo({ lat: venue.lat, lng: venue.lng });
      this.map.setZoom(14); // Closer zoom for single venue
    } else {
      // Multiple venues - fit bounds to show all
      const bounds = new google.maps.LatLngBounds();

      validVenues.forEach((venue: any) => {
        bounds.extend({ lat: venue.lat, lng: venue.lng });
      });

      this.map.fitBounds(bounds);
    }
  }
}