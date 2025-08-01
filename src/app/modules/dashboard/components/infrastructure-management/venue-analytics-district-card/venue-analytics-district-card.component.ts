import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventHeatmapComponent } from '../../event-management/event-heatmap/event-heatmap/event-heatmap.component';
import { AngularSvgIconModule } from "angular-svg-icon";

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
  imports: [CommonModule, AngularSvgIconModule],
  templateUrl: './venue-analytics-district-card.component.html',
  styleUrls: ['./venue-analytics-district-card.component.css'],
})
export class VenueAnalyticsDistrictCardComponent implements OnInit {
  @Input() feedback: any = [];
  @Input() topRatedFacilities: any = [];
  selectedDistrict = 'Kolkata';
  selectedCategory = 'Cricket';

  districts = ['Kolkata', 'Howrah', 'Darjeeling', 'Siliguri', 'Durgapur'];
  categories = ['Cricket', 'Football', 'Basketball', 'Tennis', 'Swimming'];

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

  onDistrictChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedDistrict = target.value;
    this.generateRandomData(); // Regenerate data on district change
  }

  onCategoryChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedCategory = target.value;
    this.generateRandomData(); // Regenerate data on category change
  }

  // TrackBy functions for performance optimization
  trackByVenueId(index: number, venue: Venue): number {
    return venue.id;
  }

  trackByFeedbackName(index: number, feedback: FeedbackItem): string {
    return feedback.name;
  }
}
