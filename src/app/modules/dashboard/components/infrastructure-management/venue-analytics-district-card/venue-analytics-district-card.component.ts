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
    this.generateRandomData();
    this.loadGoogleMaps();
  }

  loadGoogleMaps() {
    // ✅ अगर google already loaded है तब भी दोनो maps (main + modal) को initialize कर
    if (typeof google !== 'undefined' && google.maps) {
      this.initializeMap();
      return;
    }

    // ✅ पहली बार script load करना
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBdJkHovEH-NjsxqOEYAwF2x9n3UmNFNCU&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      this.initializeMap();
    };
    document.head.appendChild(script);
  }

  initializeMap() {
    // ✅ Kolkata Lat/Lng
    const kolkataLocation = { lat: this.lat, lng: this.lng };

    if (this.mapContainer) {
      this.map = new google.maps.Map(this.mapContainer.nativeElement, {
        center: kolkataLocation,
        zoom: 12,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });

      this.mapInitialized = true;
      
      // Load venue data after map is initialized
      this.getVenueMapLocations();
    }
  }

  generateRandomData(): void {
    // Generate random ratings for venues
    this.topVenues.forEach((venue) => {
      venue.rating = Math.round((Math.random() * 1 + 4) * 10) / 10;
    });

    // Generate random feedback scores
    this.feedbackData.forEach((feedback) => {
      feedback.cleanliness = Math.round((Math.random() * 0.5 + 4.5) * 10) / 10;
      feedback.staffBehavior = Math.round((Math.random() * 0.5 + 4.5) * 10) / 10;
      feedback.facilitiesMaintenance = Math.round((Math.random() * 0.5 + 4.5) * 10) / 10;
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

  // ✅ jab district dropdown change ho
  onTotalVenueDistrictChange(district: string) {
    this.totalVenueByDistrictDistrict = district;
    this.emitTotalVenueByDistrictFilter();
    this.getVenueMapLocations();
  }

  // ✅ jab sport dropdown change ho
  onTotalVenueSportChange(sport: string) {
    this.totalVenueByDistrictSport = sport;
    this.emitTotalVenueByDistrictFilter();
    this.getVenueMapLocations();
  }

  getVenueMapLocations() {
    const payload = {
      map_filter: {
        district: this.totalVenueByDistrictDistrict,
        sport_category: this.totalVenueByDistrictSport,
      },
    };
    
    this.eventService.getVenueMapLocations(payload).subscribe({
      next: (res) => {
        console.log('Venue Map Locations Response:', res);
        if (res?.status?.success && res?.data) {
          const districts = res.data.map.districts || [];
          this.venueData = [];
          
          districts.forEach((district: any) => {
            if (district.venues && Array.isArray(district.venues)) {
              this.venueData.push(...district.venues);
            }
          });
          
          if (this.mapInitialized) {
            this.updateVenueMarkers();
            this.centerMapOnVenues();
          }
        } else {
          console.error('Invalid venue map locations response');
        }
      },
      error: (err) => {
        console.error('Failed to fetch venue map locations:', err);
      }
    });
  }

  updateVenueMarkers() {
    if (!this.map || !this.venueData) {
      return;
    }

    this.clearAllMarkers();

    this.venueData.forEach((venue: any) => {
      if (venue.lat && venue.lng) {
        const position = { lat: venue.lat, lng: venue.lng };

        const marker = new google.maps.Marker({
          position: position,
          map: this.map,
          title: venue.name,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="8" fill="#10B981" stroke="#ffffff" stroke-width="2"/>
                <circle cx="12" cy="12" r="4" fill="#ffffff"/>
              </svg>
            `),
            scaledSize: new google.maps.Size(24, 24),
            anchor: new google.maps.Point(12, 12)
          }
        });

        // Create venue info content
        const venueDetails = venue.venue_details || {};
        const venueImage = venue.image;
        const venueName = venue.name || 'Venue Name Not Available';
        const venueAddress = venue.address || venueDetails.address?.full || 'Address Not Available';
        const venueCapacity = venue.capacity || venueDetails.capacity || 'N/A';
        const venueRating = venue.rating || venueDetails.rating || 'N/A';
        const venueOpenStatus = venue.open_status || venueDetails.open_status;
        const sportTypes = venue.sport_type || venueDetails.sport_type || [];

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
            
            <!-- Rating -->
            <div style="margin-top: 6px; color: #059669; font-weight: 500;">
              ⭐ ${venueRating}/5.0
            </div>
            
            <!-- Capacity -->
            <div style="margin-top: 4px; color: #374151; font-size: 13px;">
              🏟️ Capacity: ${venueCapacity.toLocaleString()}
            </div>
            
            <!-- Sport Types -->
            <div style="margin-top: 4px; color: #6B7280; font-size: 12px;">
              🏃 Sports: ${sportTypes.slice(0, 3).join(', ')}${sportTypes.length > 3 ? '...' : ''}
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

    console.log(`Created ${this.markers.length} markers for venues`);
  }

  clearAllMarkers(): void {
    if (this.markers && this.markers.length > 0) {
      this.markers.forEach(marker => {
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
    const validVenues = this.venueData.filter((venue: any) => 
      venue.lat && venue.lng && !isNaN(venue.lat) && !isNaN(venue.lng)
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
      
      console.log(`Map centered on single venue:`, { lat: venue.lat, lng: venue.lng });
    } else {
      // Multiple venues - fit bounds to show all
      const bounds = new google.maps.LatLngBounds();
      
      validVenues.forEach((venue: any) => {
        bounds.extend({ lat: venue.lat, lng: venue.lng });
      });
      
      this.map.fitBounds(bounds);
      
      // Add some padding to the bounds
      const listener = google.maps.event.addListenerOnce(this.map, 'bounds_changed', () => {
        const currentZoom = this.map.getZoom();
        if (currentZoom > 15) {
          this.map.setZoom(15); // Don't zoom too close
        }
      });
      
      console.log(`Map fitted to ${validVenues.length} venues`);
    }
  }

  ngAfterViewInit() {
    if (typeof google !== 'undefined' && google.maps) {
      this.initializeMap();
    }
  }
  
}
