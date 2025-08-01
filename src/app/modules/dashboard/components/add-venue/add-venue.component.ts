import { Component, OnInit, ViewChild, ElementRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { VenueAnalyticsService } from 'src/app/core/services/venue-analytics.service';
import { Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';

declare var google: any;

interface SportCategory {
  id: string;
  name: string;
  selected: boolean;
}

interface Service {
  id: string;
  name: string;
  selected: boolean;
}

@Component({
  selector: 'app-add-venue',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],

  templateUrl: './add-venue.component.html',
  styles: [
    `
      :host {
        display: block;
        width: 100%;
      }
    `,
  ],
})
export class AddVenueComponent implements OnInit {
  @ViewChild('mapContainer') mapContainer!: ElementRef;
  @ViewChild('modalMapContainer') modalMapContainer!: ElementRef;

  venueForm: FormGroup;
  isSubmitting = false;
  mapInitialized = false;
  showMapModal = false;

  uploadedImages: any[] = [];
  selectedLocation: any = null;
  tempSelectedLocation: any = null;

  map: any;
  modalMap: any;
  marker: any;
  modalMarker: any;

  sportCategories: SportCategory[] = [
    { id: '1', name: 'Cricket', selected: true },
    { id: '2', name: 'Football', selected: true },
    { id: '3', name: 'Badminton', selected: true },
    { id: '4', name: 'Table Tennis', selected: true },
    { id: '5', name: 'Basketball', selected: false },
    { id: '6', name: 'Tennis', selected: false },
    { id: '7', name: 'Swimming', selected: false },
  ];

  availableServices: Service[] = [
    { id: '1', name: 'Group Fitness Classes', selected: true },
    { id: '2', name: 'Food Services', selected: true },
    { id: '3', name: 'Equipment Rentals', selected: true },
    { id: '4', name: 'Personal Training', selected: true },
    { id: '5', name: 'Locker Rooms', selected: false },
    { id: '6', name: 'Parking', selected: false },
    { id: '7', name: 'WiFi', selected: false },
  ];

  timeSlots: string[] = [
    '06:00 AM',
    '06:30 AM',
    '07:00 AM',
    '07:30 AM',
    '08:00 AM',
    '08:30 AM',
    '09:00 AM',
    '09:30 AM',
    '10:00 AM',
    '10:30 AM',
    '11:00 AM',
    '11:30 AM',
    '12:00 PM',
    '12:30 PM',
    '01:00 PM',
    '01:30 PM',
    '02:00 PM',
    '02:30 PM',
    '03:00 PM',
    '03:30 PM',
    '04:00 PM',
    '04:30 PM',
    '05:00 PM',
    '05:30 PM',
    '06:00 PM',
    '06:30 PM',
    '07:00 PM',
    '07:30 PM',
    '08:00 PM',
    '08:30 PM',
    '09:00 PM',
    '09:30 PM',
    '10:00 PM',
    '10:30 PM',
    '11:00 PM',
    '11:30 PM',
  ];

  constructor(private fb: FormBuilder, private venueService: VenueAnalyticsService, private router: Router,private ngZone:NgZone) {
    this.venueForm = this.fb.group({
      venueName: ['Rishikesh', [Validators.required]],
      venueDescription: ['Kya krega bhai description ka'],
      contactPersonName: ['Sandeep', [Validators.required]],
      phoneNumber: ['7878781232', [Validators.required, Validators.pattern(/^[\+]?[0-9\s\-\(\)]{10,}$/)]],
      streetAddress: ['14th Beega', [Validators.required]],
      city: ['Rishikesh', [Validators.required]],
      state: ['Uttarakhand', [Validators.required]],
      postalCode: ['345678'],
      openTime: [''],
      closeTime: [''],
      venueCapacity: ['800', [Validators.min(1)]],
      latitude: [''],
      longitude: [''],
    });
  }

  ngOnInit() {
    this.loadGoogleMaps();
  }

  loadGoogleMaps() {
    if (typeof google !== 'undefined') {
      this.initializeMap();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyA5Lt3E5gYb-lfogvaSpCrvCpocLqHwNOI&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      this.initializeMap();
    };
    document.head.appendChild(script);
  }

  initializeMap() {
    // Default location (Delhi, India)
    const defaultLocation = { lat: 28.6139, lng: 77.209 };

    if (this.mapContainer) {
      this.map = new google.maps.Map(this.mapContainer.nativeElement, {
        center: defaultLocation,
        zoom: 10,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });

      this.mapInitialized = true;
    }
  }

  openMapModal() {
    this.showMapModal = true;
    setTimeout(() => {
      this.initializeModalMap();
    }, 100);
  }

  closeMapModal() {
    this.showMapModal = false;
    this.tempSelectedLocation = null;
  }

  initializeModalMap() {
    const defaultLocation = { lat: 28.6139, lng: 77.209 };

    this.modalMap = new google.maps.Map(this.modalMapContainer.nativeElement, {
      center: defaultLocation,
      zoom: 12,
      mapTypeControl: true,
      streetViewControl: true,
      fullscreenControl: true,
    });

    // Add click listener to map
    this.modalMap.addListener('click', (event: any) => {
      console.log('📍 Map clicked:', event.latLng.toJSON());
      this.placeMarker(event.latLng);
    });

    // Initialize Places service for address lookup
    const geocoder = new google.maps.Geocoder();
    this.geocoder = geocoder;
  }

  private geocoder: any;

  // placeMarker(location: any) {
  //   console.log('📍 Placing marker at:', location.toJSON());

  //   if (this.modalMarker) {
  //     this.modalMarker.setMap(null);
  //   }

  //   this.modalMarker = new google.maps.Marker({
  //     position: location,
  //     map: this.modalMap,
  //     draggable: true,
  //     title: 'Venue Location',
  //   });

  //   console.log('✅ Marker created');

  //   this.geocoder.geocode({ location: location }, (results: any, status: any) => {
  //     console.log('🌍 Geocode status:', status, results);

  //     if (status === 'OK' && results[0]) {
  //       this.ngZone.run(() => {
  //         this.tempSelectedLocation = {
  //           lat: location.lat(),
  //           lng: location.lng(),
  //           address: results[0].formatted_address,
  //         };
  //         console.log('✅ tempSelectedLocation updated:', this.tempSelectedLocation);
  //       });
  //     }
  //   });

  //   this.modalMarker.addListener('dragend', (event: any) => {
  //     console.log('🔄 Marker dragged to:', event.latLng.toJSON());
  //     this.placeMarker(event.latLng);
  //   });
  // }

  placeMarker(location: any) {
    // Remove old marker if exists
    if (this.modalMarker) {
      this.modalMarker.setMap(null);
    }
  
    // Add new marker
    this.modalMarker = new google.maps.Marker({
      position: location,
      map: this.modalMap,
      draggable: true,
      title: 'Venue Location',
    });
  
    // ✅ सिर्फ lat और lng save कर रहे हैं (address नहीं)
    this.ngZone.run(() => {
      this.tempSelectedLocation = {
        lat: location.lat(),
        lng: location.lng()
      };
    });
  
    // Marker drag करने पर भी location update हो
    this.modalMarker.addListener('dragend', (event: any) => {
      this.placeMarker(event.latLng);
    });
  }
  
  confirmLocation() {
    if (this.tempSelectedLocation) {
      this.selectedLocation = { ...this.tempSelectedLocation };
      this.venueForm.patchValue({
        latitude: this.selectedLocation.lat,
        longitude: this.selectedLocation.lng,
      });

      // Update main map
      if (this.map) {
        this.map.setCenter({ lat: this.selectedLocation.lat, lng: this.selectedLocation.lng });
        this.map.setZoom(15);

        if (this.marker) {
          this.marker.setMap(null);
        }

        this.marker = new google.maps.Marker({
          position: { lat: this.selectedLocation.lat, lng: this.selectedLocation.lng },
          map: this.map,
          title: 'Selected Venue Location',
        });
      }

      this.closeMapModal();
    }
  }

  onFileSelect(event: any) {
    const files = event.target.files;
    this.processFiles(files);
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    const files = event.dataTransfer?.files;
    if (files) {
      this.processFiles(files);
    }
  }

  processFiles(files: FileList) {
    for (let i = 0; i < files.length && this.uploadedImages.length < 4; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.uploadedImages.push({
            file: file,
            name: file.name,
            preview: e.target?.result as string,
          });
        };
        reader.readAsDataURL(file);
      }
    }
  }

  removeImage(index: number) {
    this.uploadedImages.splice(index, 1);
  }

  toggleSportCategory(sport: SportCategory) {
    sport.selected = !sport.selected;
  }

  toggleService(service: Service) {
    service.selected = !service.selected;
  }

  goBack() {
    window.history.back();
  }

  async onSubmit() {
    if (!this.venueForm.valid) {
      Object.keys(this.venueForm.controls).forEach((key) => {
        this.venueForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;

    try {
      const files = this.uploadedImages.map((img) => img.file);

      // 🔹 1️⃣ Bulk upload
      const uploadRes = await lastValueFrom(this.venueService.bulkUploadImages(files));

      // ✅ Status check
      if (!uploadRes?.status?.success) {
        throw new Error(uploadRes?.status?.message || 'Image upload failed!');
      }

      const uploadedImageUrls = uploadRes?.data?.successful_uploads.map((item: any, index: number) => ({
        id: index + 1,
        name: item.file_info.name || `image-${index + 1}`,
        url: item.storage_info.url,
      }));

      // 🔹 2️⃣ Venue payload
      const formData = {
        venueName: this.venueForm.value.venueName,
        venueDescription: this.venueForm.value.venueDescription,
        address: {
          line1: this.venueForm.value.streetAddress,
          area: this.venueForm.value.city,
          city: this.venueForm.value.city,
          state: this.venueForm.value.state,
          pincode: this.venueForm.value.postalCode,
          full: `${this.venueForm.value.city}, ${this.venueForm.value.state}`,
        },
        contactPersonName: {
          name: this.venueForm.value.contactPersonName,
          phone: this.venueForm.value.phoneNumber,
        },
        venueCapacity: this.venueForm.value.venueCapacity,
        location: this.selectedLocation,
        open_status: {
          is_open: true,
          open_time: this.venueForm.value.openTime,
          close_time: this.venueForm.value.closeTime,
        },
        sportCategories: this.sportCategories.filter((s) => s.selected).map((s) => s.name),
        availableServices: this.availableServices.filter((s) => s.selected).map((s) => s.name),
        images: uploadedImageUrls,
      };

      // 🔹 3️⃣ Venue create
      const venueRes = await lastValueFrom(this.venueService.createVenue(formData));

      // ✅ Response handling
      if (venueRes?.status?.success && (venueRes.status.code === 1 || venueRes.status.code === 201)) {
        console.log('✅ Venue Created:', venueRes);
        alert(venueRes.status.message || 'Venue created successfully!');

        // 🚀 Navigate on success
        this.router.navigate(['/dashboard/infrastructure-management']);
      } else {
        throw new Error(venueRes?.status?.message || 'Venue creation failed!');
      }
    } catch (err: any) {
      console.error('❌ Error:', err);
      alert(err.message || 'Something went wrong!');
    } finally {
      this.isSubmitting = false;
    }
  }
}
