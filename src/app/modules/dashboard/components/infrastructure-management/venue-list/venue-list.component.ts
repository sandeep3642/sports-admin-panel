// venue-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VenueAnalyticsService } from 'src/app/core/services/venue-analytics.service';

export interface Venue {
  id: number;
  user_id: number | null;
  customer_id: number | null;
  name: string;
  descriptions: string;
  district: string | null;
  address: {
    area: string;
    city: string;
    full: string;
    line1: string;
    state: string;
    pincode: string;
  };
  capacity: number;
  food_court: boolean | null;
  contact_person: {
    name: string;
    phone: string;
    email?: string;
    alt_phone?: string;
  };
  sport_type: string[];
  available_services: string[];
  is_approved: boolean;
  is_rejected: boolean;
  venue_status: any;
  rating: number;
  created_at: string;
  updated_at: string;
}

@Component({
  selector: 'app-venue-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './venue-list.component.html',
  styleUrls: ['./venue-list.component.css']
})
export class VenueListComponent implements OnInit {
  venues: Venue[] = [];
  loading = false;
  error: string | null = null;
  
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  totalPages = 0;
  
  Math = Math;

  constructor(private venueService: VenueAnalyticsService) {
    // Inject your VenueListService here
  }

  ngOnInit(): void {
    this.loadVenues();
  }

  loadVenues(): void {
    this.loading = true;
    this.error = null;

    const requestBody = {
      page: this.currentPage,
      limit: this.pageSize,
      filters: {
        district: []
      }
    };

    this.venueService.getVenues(requestBody).subscribe({
      next: (response: any) => {
        if (response.status.success) {
          this.venues = response.data.venues;
          this.totalItems = response.data.pagination.total;
          this.totalPages = response.data.pagination.total_pages;
          this.currentPage = response.data.pagination.page;
        } else {
          this.error = response.status.message;
        }
        this.loading = false;
      },
      error: (error: any) => {
        this.error = 'Failed to load venues';
        this.loading = false;
      }
    });
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadVenues();
    }
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
    this.loadVenues();
  }

  getVisiblePages(): number[] {
    const pages: number[] = [];
    const totalVisible = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(totalVisible / 2));
    let endPage = Math.min(this.totalPages, startPage + totalVisible - 1);
    
    if (endPage - startPage + 1 < totalVisible) {
      startPage = Math.max(1, endPage - totalVisible + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  getPrimarySportType(venue: Venue): string {
    return venue.sport_type && venue.sport_type.length > 0 
      ? venue.sport_type[0].charAt(0).toUpperCase() + venue.sport_type[0].slice(1)
      : 'N/A';
  }

  getContactPersonName(venue: Venue): string {
    return venue.contact_person?.name || 'N/A';
  }

  getDistrict(venue: Venue): string {
    return venue.district || venue.address?.city || 'N/A';
  }

  getVenueStatus(venue: Venue): string {
    if (venue.is_approved) return 'Approved';
    if (venue.is_rejected) return 'Rejected';
    return 'Pending';
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-orange-100 text-orange-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusDotClass(status: string): string {
    switch (status) {
      case 'Approved':
        return 'bg-green-400';
      case 'Pending':
        return 'bg-orange-400';
      case 'Rejected':
        return 'bg-red-400';
      default:
        return 'bg-gray-400';
    }
  }
}