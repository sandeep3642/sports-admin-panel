import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventHeatmapComponent } from '../../event-management/event-heatmap/event-heatmap/event-heatmap.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { FormsModule } from '@angular/forms';

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
  lat = 22.5726;
  lng = 88.3639;

  totalVenueByDistrictDistrict: string = 'kolkata';
  totalVenueByDistrictSport: string = 'cricket';
  mapInitialized = false;

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

      // ✅ Marker add karo
      new google.maps.Marker({
        position: kolkataLocation,
        map: this.map,
        title: 'Kolkata',
      });

      this.mapInitialized = true;
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
  }

  // ✅ jab sport dropdown change ho
  onTotalVenueSportChange(sport: string) {
    this.totalVenueByDistrictSport = sport;
    this.emitTotalVenueByDistrictFilter();
  }

  ngAfterViewInit() {
    if (typeof google !== 'undefined' && google.maps) {
      this.initializeMap();
    }
  }
  
}
