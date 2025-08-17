import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
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
export class VenueAnalyticsDistrictCardComponent implements OnInit {
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
  totalVenueByDistrictSport: string = 'football';
  mapInitialized = false;
  venueData: any[] = [];

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

    this.loadVenuesFromInput();
  }

  ngOnChanges(changes: any) {
    if (changes.topRatedFacilities) {
      this.loadVenuesFromInput();
    }
  }

  loadGoogleMaps() {
    // ✅ Check if google maps is already loaded
    if (typeof google !== 'undefined' && google.maps) {
      this.initializeMap();
      return;
    }

    // ✅ Load Google Maps script for the first time
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBdJkHovEH-NjsxqOEYAwF2x9n3UmNFNCU&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      this.initializeMap();
    };
    script.onerror = (error) => {
      console.error('Failed to load Google Maps script:', error);
    };
    document.head.appendChild(script);
  }

  initializeMap() {
    if (!this.mapContainer) {
      console.error('Map container not found');
      return;
    }

    const kolkataLocation = { lat: this.lat, lng: this.lng };

    this.map = new google.maps.Map(this.mapContainer.nativeElement, {
      center: kolkataLocation,
      zoom: 12,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });

    this.mapInitialized = true;

    // ✅ Load venues immediately after map is ready
    setTimeout(() => {
      this.loadVenuesFromInput();
    }, 500); // Increased timeout for map to be fully ready
  }

  loadVenuesFromInput() {
    this.venueData = [];

    if (!this.topRatedFacilities || this.topRatedFacilities.length === 0) {
      return;
    }

    this.topRatedFacilities.forEach((district: any) => {
      if (district.venues && Array.isArray(district.venues)) {
        district.venues.forEach((venue: any) => {
        

          // ✅ Convert string coordinates to numbers and validate
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
            // ✅ Store venue with converted numeric coordinates
            const processedVenue = {
              ...venue,
              lat: lat,
              lng: lng,
            };

            this.venueData.push(processedVenue);
          } else {
            console.warn('❌ Venue has invalid coordinates:', {
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

        const marker = new google.maps.Marker({
          position: position,
          map: this.map,
          title: venue.name,
          icon: {
            url:
              'data:image/svg+xml;charset=UTF-8,' +
              encodeURIComponent(`
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="12" fill="#DC2626" stroke="#ffffff" stroke-width="3"/>
                <circle cx="16" cy="16" r="6" fill="#ffffff"/>
              </svg>
            `),
            scaledSize: new google.maps.Size(32, 32),
            anchor: new google.maps.Point(16, 16),
          },
        });

        // Simple info window with district name and total venues
        const districtData = this.topRatedFacilities.find(
          (district: any) => district.venues && district.venues.some((v: any) => v.id === venue.id),
        );

        const districtName = districtData?.district || 'Unknown District';
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

  // ✅ Add ngAfterViewInit to ensure ViewChild is ready

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

  // ✅ jab district dropdown change ho
  onTotalVenueDistrictChange(district: string) {
    this.totalVenueByDistrictDistrict = district;
    this.emitTotalVenueByDistrictFilter();
  }

  // ✅ jab sport dropdown change ho
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
  ngAfterViewInit() {
    // If Google Maps is already loaded but map wasn't initialized
    if (typeof google !== 'undefined' && google.maps && !this.mapInitialized) {
      setTimeout(() => {
        this.initializeMap();
      }, 100);
    }
  }
}
