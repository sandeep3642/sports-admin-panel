// venue-list.component.ts
import { Component, OnInit, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VenueAnalyticsService } from 'src/app/core/services/venue-analytics.service';
import { Router } from '@angular/router';
import { AngularSvgIconModule } from 'angular-svg-icon';

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
  imports: [CommonModule, FormsModule, AngularSvgIconModule],
  templateUrl: './venue-list.component.html',
  styleUrls: ['./venue-list.component.css'],
})
export class VenueListComponent implements OnInit {
  @Input() showActions: boolean = false; // Input from parent component
  @Output() editVenue = new EventEmitter<Venue>();
  @Output() approveVenue = new EventEmitter<Venue>();
  @Output() rejectVenue = new EventEmitter<Venue>();
  @Output() viewAllClicked = new EventEmitter<void>();
  selectedVenueForRejection: Venue | null = null;
  showRejectModal = false;
  rejectionReason = '';

  venues: Venue[] = [];
  loading = false;
  error: string | null = null;

  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  totalPages = 0;

  activeActionVenueId: number | null = null;
  venue_id?: number;
  Math = Math;

  constructor(private venueService: VenueAnalyticsService, private router: Router) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.relative')) {
      this.activeActionVenueId = null;
    }
  }

  ngOnInit(): void {
    this.loadVenues();
  }

  onViewAll(): void {
    this.showActions = true;
    this.viewAllClicked.emit();
  }

  toggleActionDialog(venueId: number): void {
    this.activeActionVenueId = this.activeActionVenueId === venueId ? null : venueId;
  }

  closeActionDialog(): void {
    this.activeActionVenueId = null;
  }

  onEdit(venue: Venue): void {
    this.closeActionDialog();
    this.router.navigate(['/dashboard/add-new-venue', venue.id]);
  }

  onReject(venue: Venue): void {
    if (!venue.is_rejected) {
      this.selectedVenueForRejection = venue;
      this.showRejectModal = true; // ✅ modal खोलेगा
      this.venue_id = venue.id;
    }
    this.closeActionDialog();
  }

  loadVenues(): void {
    this.loading = true;
    this.error = null;

    const requestBody = {
      page: this.currentPage,
      limit: this.pageSize,
      filters: {
        district: [],
      },
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
      },
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

  submitRejection(): void {
    if (this.rejectionReason.trim() === '') {
      alert('Please enter a rejection reason.');
      return;
    }

    const payload = {
      venue_id: this.venue_id,
      status: 'reject',
      reason: this.rejectionReason,
    };

    this.venueService.updateStatus(payload).subscribe({
      next: (res) => {
        if (res?.status?.success) {
          alert(res?.status?.message);

          this.showRejectModal = false;
          this.selectedVenueForRejection = null;
          this.rejectionReason = '';

          this.loadVenues();
        } else {
          alert(res?.status?.message);
        }
      },
      error: (err) => {
        console.error('❌ Error while rejecting venue:', err);
        alert('Something went wrong while rejecting the venue.');
      },
    });
  }

  onApprove(venue: Venue): void {
    if (venue.is_approved) return; // ✅ अगर पहले से approve है तो कुछ मत करो

    const payload = {
      venue_id: venue.id,
      status: 'approve',
    };

    // ✅ API call
    this.venueService.updateStatus(payload).subscribe({
      next: (res) => {
        if (res?.status?.success) {
          alert(res?.status?.message);

          this.closeActionDialog();

          this.loadVenues();
        } else {
          alert(res?.status?.message);
        }
      },
      error: (err) => {
        console.error('❌ Error while approving venue:', err);
        alert('Something went wrong while approving the venue.');
      },
    });
  }
}
