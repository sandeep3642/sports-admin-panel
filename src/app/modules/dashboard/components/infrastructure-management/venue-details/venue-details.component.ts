import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, Input, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { lastValueFrom, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { VenueAnalyticsService } from 'src/app/core/services/venue-analytics.service';
import { Location } from '@angular/common';
import { BaseVenue, VenueImage } from 'src/app/core/models/venue,model';
import { AngularSvgIconModule } from 'angular-svg-icon';

export interface Venue extends BaseVenue {
  location?: {
    lat: string | number;
    lng: string | number;
    address?: string;
  };
  images: VenueImage[];
  open_status: {
    is_open: boolean;
    open_time: string;
    close_time: string;
  };
}

declare var google: any;

@Component({
  selector: 'app-venue-details',
  templateUrl: './venue-details.component.html',
  styleUrls: ['./venue-details.component.css'],
  imports: [CommonModule, AngularSvgIconModule],
})
export class VenueDetailsComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() venueId?: number;
  @ViewChild('mapContainer') mapContainer!: ElementRef;
  selectedVenue: Venue | null = null;
  expandedVenueId: number | null = null;
  activeActionVenueId: number | null = null;
  currentImageIndex = 0;
  map: any;
  marker: any;
  private destroy$ = new Subject<void>();
  isGoogleMapsLoaded = false;
  isVenueDataLoaded = false;

  constructor(private route: ActivatedRoute, private venueService: VenueAnalyticsService, private location: Location) {}

  ngOnInit(): void {
    if (this.venueId) {
      this.loadVenueData(this.venueId);
    } else {
      this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
        if (params['id']) {
          this.loadVenueData(+params['id']);
        }
      });
    }
  }

  loadGoogleMaps() {
    if (typeof google !== 'undefined' && google.maps) {
      this.initializeMap();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBdJkHovEH-NjsxqOEYAwF2x9n3UmNFNCU&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      this.initializeMap();
    };
    document.head.appendChild(script);
  }

  initializeMap(): void {
    if (!this.selectedVenue?.location?.lat || !this.selectedVenue?.location?.lng) {
      return;
    }

    const lat =
      typeof this.selectedVenue.location.lat === 'string'
        ? parseFloat(this.selectedVenue.location.lat)
        : this.selectedVenue.location.lat;

    const lng =
      typeof this.selectedVenue.location.lng === 'string'
        ? parseFloat(this.selectedVenue.location.lng)
        : this.selectedVenue.location.lng;

    // Validate coordinates
    if (isNaN(lat) || isNaN(lng)) {
      console.error('Invalid coordinates:', { lat, lng });
      return;
    }

    const venueLocation = { lat, lng };

    try {
      // Initialize map
      this.map = new google.maps.Map(this.mapContainer.nativeElement, {
        center: venueLocation,
        zoom: 15, // Closer zoom for venue details
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });

      // Add marker
      this.marker = new google.maps.Marker({
        position: venueLocation,
        map: this.map,
        title: this.selectedVenue.name || 'Venue Location',
      });
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }

  async loadVenueData(id: number): Promise<void> {
    try {
      const res: any = await lastValueFrom(this.venueService.getVenueById(id));

      if (res?.status?.success) {
        this.expandedVenueId = this.expandedVenueId === id ? null : id;
        this.activeActionVenueId = null;
        this.selectedVenue = res.data;
        this.isVenueDataLoaded = true;

        // Try to initialize map now that venue data is loaded
        this.loadGoogleMaps();
      } else {
        console.error('Failed to load venue data:', res);
      }
    } catch (error) {
      console.error('❌ Error loading venue data:', error);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  goBack(): void {
    this.location.back();
  }

  nextImage(): void {
    if (this.hasImages() && this.selectedVenue?.images) {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.selectedVenue.images.length;
    }
  }

  prevImage(): void {
    if (this.hasImages() && this.selectedVenue?.images) {
      this.currentImageIndex =
        this.currentImageIndex === 0 ? this.selectedVenue.images.length - 1 : this.currentImageIndex - 1;
    }
  }

  selectImage(index: number): void {
    if (this.hasImages() && this.selectedVenue?.images && index >= 0 && index < this.selectedVenue.images.length) {
      this.currentImageIndex = index;
    }
  }

  formatTime(time?: string): string {
    if (!time) return '';
    try {
      return new Date(`1970-01-01T${time}`).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return time;
    }
  }

  formatService(service?: string): string {
    if (!service) return '';
    return service.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  }

  formatSportType(sport?: string): string {
    if (!sport) return '';
    return sport.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  }

  getStatusBadgeClass(): string {
    if (!this.selectedVenue) return 'bg-gray-100 text-gray-800';
    if (this.selectedVenue.is_approved) return 'bg-green-100 text-green-800';
    if (this.selectedVenue.is_rejected) return 'bg-red-100 text-red-800';
    return 'bg-yellow-100 text-yellow-800';
  }

  getStatusText(): string {
    if (!this.selectedVenue) return 'Unknown';
    if (this.selectedVenue.is_approved) return 'Approved';
    if (this.selectedVenue.is_rejected) return 'Rejected';
    return 'Pending';
  }

  goToLocation(): void {
    if (this.selectedVenue?.location?.lat && this.selectedVenue?.location?.lng) {
      const { lat, lng } = this.selectedVenue.location;
      window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
    }
  }

  callContactPerson(): void {
    if (this.selectedVenue?.contact_person?.phone) {
      window.open(`tel:${this.selectedVenue.contact_person.phone}`);
    }
  }

  generateStarRating(rating?: number): boolean[] {
    const validRating = rating || 0;
    return Array(5)
      .fill(false)
      .map((_, i) => i < Math.floor(validRating));
  }

  hasImages(): boolean {
    return !!(
      this.selectedVenue?.images &&
      Array.isArray(this.selectedVenue.images) &&
      this.selectedVenue.images.length > 0
    );
  }

  getCurrentImage(): VenueImage | null {
    if (this.hasImages() && this.selectedVenue?.images) {
      return this.selectedVenue.images[this.currentImageIndex] || null;
    }
    return null;
  }

  hasMultipleImages(): boolean {
    return !!(
      this.selectedVenue?.images &&
      Array.isArray(this.selectedVenue.images) &&
      this.selectedVenue.images.length > 1
    );
  }

  getSportTypes(): string[] {
    return this.selectedVenue?.sport_type || [];
  }

  getAvailableServices(): string[] {
    return this.selectedVenue?.available_services || [];
  }

  isOpen(): boolean {
    return this.selectedVenue?.open_status?.is_open || false;
  }

  getOpenTime(): string {
    return this.selectedVenue?.open_status?.open_time || '';
  }

  getCloseTime(): string {
    return this.selectedVenue?.open_status?.close_time || '';
  }

  hasValidLocation(): boolean {
    if (!this.selectedVenue?.location?.lat || !this.selectedVenue?.location?.lng) {
      return false;
    }

    const lat =
      typeof this.selectedVenue.location.lat === 'string'
        ? parseFloat(this.selectedVenue.location.lat)
        : this.selectedVenue.location.lat;

    const lng =
      typeof this.selectedVenue.location.lng === 'string'
        ? parseFloat(this.selectedVenue.location.lng)
        : this.selectedVenue.location.lng;

    return !isNaN(lat) && !isNaN(lng);
  }
  ngAfterViewInit() {
    if (typeof google !== 'undefined' && google.maps) {
      this.initializeMap();
    }
  }
}
