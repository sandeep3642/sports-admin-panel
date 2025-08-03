// venue-list.component.ts
import { Component, OnInit, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VenueAnalyticsService } from 'src/app/core/services/venue-analytics.service';
import { Router } from '@angular/router';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { lastValueFrom } from 'rxjs';
import { UnderscoreToSpacePipe } from 'src/app/pipes/underscore-to-space.pipe';
import { ToastrService } from 'ngx-toastr';
import { BaseVenue, VenueImage } from 'src/app/core/models/venue,model';

export interface Venue extends BaseVenue {
  location?: {
    lat: string | number; // flexibility ke liye
    lng: string | number;
    address?: string;
  };
}

export interface SelectedVenue extends BaseVenue {
  open_status: {
    is_open: boolean;
    open_time: string;
    close_time: string;
  };
  location: {
    lat: number;
    lng: number;
  };
  images: VenueImage[];
  nearby_facilities: any[];
}

@Component({
  selector: 'app-venue-list',
  standalone: true,
  imports: [CommonModule, FormsModule, AngularSvgIconModule, UnderscoreToSpacePipe],
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

  expandedVenueId: number | null = null;
  selectedVenue?: SelectedVenue;

  // State for action dialog (keeping for backward compatibility)

  constructor(private venueService: VenueAnalyticsService, private router: Router, private toastr: ToastrService) {}

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

  toggleVenueDetails(venueId: number): void {
    if (venueId) {
      this.loadVenueData(venueId);
    }
  }

  goToLocation(): void {
    if (this.selectedVenue?.location?.lat && this.selectedVenue?.location?.lng) {
      const { lat, lng } = this.selectedVenue.location;
      window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
    }
  }

  async loadVenueData(id: number) {
    try {
      const res: any = await lastValueFrom(this.venueService.getVenueById(id));

      if (res?.status?.success) {
        this.expandedVenueId = this.expandedVenueId === id ? null : id;
        // Close action dialog if open
        this.activeActionVenueId = null;
        const venue = res.data;

        console.log('venue', venue);
        this.selectedVenue = venue;
      }
    } catch (error) {
      console.error('❌ Error loading venue data:', error);
    }
  }

  closeActionDialog(): void {
    this.activeActionVenueId = null;
  }

  onEdit(venue: Venue): void {
    this.closeActionDialog();
    this.router.navigate(['/dashboard/add-new-venue', venue.id]);
  }

  viewDetails(venue: Venue | undefined): void {
    if (venue && venue.id) this.router.navigate(['/dashboard/venue-details', venue.id]);
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
      this.toastr.error('Please enter a rejection reason.');

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
          this.toastr.success(res?.status?.message);
          this.showRejectModal = false;
          this.selectedVenueForRejection = null;
          this.rejectionReason = '';

          this.loadVenues();
        } else {
          this.toastr.error(res?.status?.message);
        }
      },
      error: (err) => {
        this.toastr.error('Something went wrong while rejecting the venue.');
      },
    });
  }

  onApprove(venue: Venue): void {
    if (venue.is_approved) return;

    const payload = {
      venue_id: venue.id,
      status: 'approve',
    };

    // ✅ API call
    this.venueService.updateStatus(payload).subscribe({
      next: (res) => {
        if (res?.status?.success) {
          this.toastr.success(res?.status?.message);

          this.closeActionDialog();

          this.loadVenues();
        } else {
          this.toastr.error(res?.status?.message);
        }
      },
      error: (err) => {
        this.toastr.error('Something went wrong while approving the venue.');
      },
    });
  }
}
