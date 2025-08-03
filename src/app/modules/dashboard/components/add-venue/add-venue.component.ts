import { Component, OnInit, ViewChild, ElementRef, NgZone, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { VenueAnalyticsService } from 'src/app/core/services/venue-analytics.service';
import { ActivatedRoute, Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';

declare var google: any;

interface SportCategory {
  id: string;
  label: string;
  selected: boolean;
  value: string;
}

interface Service {
  id: string;
  label: string;
  selected: boolean;
  value: string;
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
export class AddVenueComponent implements OnInit, AfterViewInit {
  @ViewChild('mapContainer') mapContainer!: ElementRef;

  venueForm: FormGroup;
  isSubmitting = false;
  mapInitialized = false;

  uploadedImages: any[] = [];
  selectedLocation: any = null;

  map: any;
  marker: any;
  geocoder: any;

  isEditMode = false;

  sportCategories: SportCategory[] = [];
  availableServices: Service[] = [];

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

  states = [
    { label: 'Andhra Pradesh', value: 'andhra_pradesh' },
    { label: 'Arunachal Pradesh', value: 'arunachal_pradesh' },
    { label: 'Assam', value: 'assam' },
    { label: 'Bihar', value: 'bihar' },
    { label: 'Chhattisgarh', value: 'chhattisgarh' },
    { label: 'Goa', value: 'goa' },
    { label: 'Gujarat', value: 'gujarat' },
    { label: 'Haryana', value: 'haryana' },
    { label: 'Himachal Pradesh', value: 'himachal_pradesh' },
    { label: 'Jharkhand', value: 'jharkhand' },
    { label: 'Karnataka', value: 'karnataka' },
    { label: 'Kerala', value: 'kerala' },
    { label: 'Madhya Pradesh', value: 'madhya_pradesh' },
    { label: 'Maharashtra', value: 'maharashtra' },
    { label: 'Manipur', value: 'manipur' },
    { label: 'Meghalaya', value: 'meghalaya' },
    { label: 'Mizoram', value: 'mizoram' },
    { label: 'Nagaland', value: 'nagaland' },
    { label: 'Odisha', value: 'odisha' },
    { label: 'Punjab', value: 'punjab' },
    { label: 'Rajasthan', value: 'rajasthan' },
    { label: 'Sikkim', value: 'sikkim' },
    { label: 'Tamil Nadu', value: 'tamil_nadu' },
    { label: 'Telangana', value: 'telangana' },
    { label: 'Tripura', value: 'tripura' },
    { label: 'Uttar Pradesh', value: 'uttar_pradesh' },
    { label: 'Uttarakhand', value: 'uttarakhand' },
    { label: 'West Bengal', value: 'west_bengal' },
    { label: 'Andaman and Nicobar Islands', value: 'andaman_and_nicobar_islands' },
    { label: 'Chandigarh', value: 'chandigarh' },
    { label: 'Dadra and Nagar Haveli and Daman and Diu', value: 'dadra_and_nagar_haveli_and_daman_and_diu' },
    { label: 'Delhi', value: 'delhi' },
    { label: 'Jammu and Kashmir', value: 'jammu_and_kashmir' },
    { label: 'Ladakh', value: 'ladakh' },
    { label: 'Lakshadweep', value: 'lakshadweep' },
    { label: 'Puducherry', value: 'puducherry' },
  ];

  constructor(
    private fb: FormBuilder,
    private venueService: VenueAnalyticsService,
    private router: Router,
    private ngZone: NgZone,
    private route: ActivatedRoute,
  ) {
    this.venueForm = this.fb.group({
      venueName: ['', [Validators.required, Validators.maxLength(25)]],
      venueDescription: ['', [Validators.maxLength(150)]],
      contactPersonName: [
        '',
        [Validators.required, Validators.maxLength(25), Validators.pattern(/^[A-Z][a-zA-Z\s]*$/)],
      ],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      streetAddress: ['', [Validators.required]],
      city: ['', [Validators.required]],
      state: ['', [Validators.required]],
      postalCode: ['', [Validators.pattern(/^\d{6}$/)]],
      openTime: [''],
      closeTime: [''],
      venueCapacity: ['', [Validators.pattern(/^\d+$/), Validators.min(1)]],
      latitude: ['22.5726'],
      longitude: ['88.3639'],
    });
  }

  ngOnInit() {
    this.loadGoogleMaps();
    this.getDropdownsForVenue();
    const venueId = this.route.snapshot.paramMap.get('id');
    if (venueId) {
      this.loadVenueData(Number(venueId));
      this.isEditMode = true;
    }
  }

  ngAfterViewInit() {
    // Initialize map after view is ready
    setTimeout(() => {
      if (typeof google !== 'undefined' && google.maps && this.mapContainer) {
        this.initializeMap();
      }
    }, 100);
  }

  async getDropdownsForVenue() {
    const payload = {
      sports: true,
      available_services: true,
    };

    try {
      const res: any = await lastValueFrom(this.venueService.getDropdownLists(payload));

      if (res?.status?.success) {
        this.availableServices = res.data.available_services.map((service: any, index: number) => ({
          id: (index + 1).toString(),
          label: service.label,
          value: service.value,
          selected: false,
        }));

        this.sportCategories = res.data.sports.map((sport: any, index: number) => ({
          id: (index + 1).toString(),
          label: sport.label,
          value: sport.value,
          selected: false,
        }));
      }
    } catch (error) {
      console.error('❌ Error loading dropdown data:', error);
    }
  }

  loadGoogleMaps() {
    if (typeof google !== 'undefined' && google.maps) {
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBdJkHovEH-NjsxqOEYAwF2x9n3UmNFNCU&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setTimeout(() => {
        this.initializeMap();
      }, 100);
    };
    document.head.appendChild(script);
  }

  initializeMap() {
    if (!this.mapContainer || !this.mapContainer.nativeElement) {
      console.error('Map container not found');
      return;
    }
    const defaultLocation = { lat: 22.5726, lng: 88.3639 };

    try {
      this.map = new google.maps.Map(this.mapContainer.nativeElement, {
        center: defaultLocation,
        zoom: 10,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });

      this.geocoder = new google.maps.Geocoder();
      this.mapInitialized = true;

      // Add click listener to map
      this.map.addListener('click', (event: any) => {
        this.placeMarker(event.latLng);
      });

      console.log('Map initialized successfully');
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }

  placeMarker(location: any) {
    // Remove old marker if exists
    if (this.marker) {
      this.marker.setMap(null);
    }

    // Add new marker
    this.marker = new google.maps.Marker({
      position: location,
      map: this.map,
      draggable: true,
      title: 'Venue Location',
      animation: google.maps.Animation.DROP,
    });

    // Update selected location
    this.ngZone.run(() => {
      this.selectedLocation = {
        lat: location.lat(),
        lng: location.lng(),
        address: `Lat: ${location.lat().toFixed(6)}, Lng: ${location.lng().toFixed(6)}`,
      };

      // Update form values
      this.venueForm.patchValue({
        latitude: this.selectedLocation.lat,
        longitude: this.selectedLocation.lng,
      });
    });

    // Reverse geocode to get address
    this.reverseGeocode(location);

    // Add drag listener to marker
    this.marker.addListener('dragend', (event: any) => {
      this.placeMarker(event.latLng);
    });
  }

  reverseGeocode(location: any) {
    if (this.geocoder) {
      this.geocoder.geocode({ location: location }, (results: any, status: any) => {
        if (status === 'OK' && results[0]) {
          this.ngZone.run(() => {
            this.selectedLocation.address = results[0].formatted_address;
          });
        }
      });
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

  convertTo24Hour(time12h: string): string {
    if (!time12h) return '';

    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':').map(Number);

    if (modifier === 'PM' && hours < 12) {
      hours += 12;
    }
    if (modifier === 'AM' && hours === 12) {
      hours = 0;
    }

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  convertTo12Hour(time24: string): string {
    if (!time24) return '';

    let [hour, minute] = time24.split(':').map(Number);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;

    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${ampm}`;
  }

  validateBeforeSubmit(): string | null {
    if (!this.venueForm.valid) {
      Object.keys(this.venueForm.controls).forEach((key) => {
        this.venueForm.get(key)?.markAsTouched();
      });
      return 'Please fill all required fields correctly.';
    }

    if (!this.sportCategories.some((s) => s.selected)) {
      return 'Please select at least one sport category.';
    }

    if (!this.availableServices.some((s) => s.selected)) {
      return 'Please select at least one available service.';
    }

    if (!this.selectedLocation || !this.selectedLocation.lat || !this.selectedLocation.lng) {
      return 'Please select a valid location on the map.';
    }

    if (!this.uploadedImages || this.uploadedImages.length === 0) {
      return 'Please upload at least one image.';
    }

    if (this.venueForm.value.openTime && !this.venueForm.value.closeTime) {
      return 'Please enter both opening and closing times.';
    }
    if (this.venueForm.value.closeTime && !this.venueForm.value.openTime) {
      return 'Please enter both opening and closing times.';
    }

    return null;
  }

  async onSubmit() {
    const validationError = this.validateBeforeSubmit();
    if (validationError) {
      alert(validationError);
      return;
    }

    this.isSubmitting = true;

    try {
      const newFiles = this.uploadedImages.filter((img) => img.file).map((img) => img.file);

      let uploadedImageUrls: any[] = [];

      if (newFiles.length > 0) {
        const uploadRes = await lastValueFrom(this.venueService.bulkUploadImages(newFiles));

        if (!uploadRes?.status?.success) {
          throw new Error(uploadRes?.status?.message || 'Image upload failed!');
        }

        uploadedImageUrls = uploadRes?.data?.successful_uploads.map((item: any, index: number) => ({
          id: index + 1,
          name: item.file_info.name || `image-${index + 1}`,
          url: item.storage_info.url,
        }));
      }

      const existingImages = this.uploadedImages
        .filter((img) => !img.file)
        .map((img) => ({
          id: img.id || null,
          name: img.name,
          url: img.preview,
        }));

      const finalImages = [...existingImages, ...uploadedImageUrls];

      const openTime24 = this.convertTo24Hour(this.venueForm.value.openTime);
      const closeTime24 = this.convertTo24Hour(this.venueForm.value.closeTime);
      const routeId = this.route.snapshot.paramMap.get('id');

      const formData = {
        id: this.isEditMode ? routeId || undefined : undefined,
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
          is_open: this.venueForm.value.openTime && this.venueForm.value.closeTime ? true : false,
          open_time: this.venueForm.value.openTime ? openTime24 : null,
          close_time: this.venueForm.value.closeTime ? closeTime24 : null,
        },
        sportCategories: this.sportCategories.filter((s) => s.selected).map((s) => s.value),
        availableServices: this.availableServices.filter((s) => s.selected).map((s) => s.value),
        images: finalImages,
      };

      if (this.isEditMode) {
        await lastValueFrom(this.venueService.updateVenue(formData));
        alert('Venue updated successfully!');
      } else {
        await lastValueFrom(this.venueService.createVenue(formData));
        alert('Venue created successfully!');
      }

      this.router.navigate(['/dashboard/infrastructure-management']);
    } catch (err: any) {
      console.error('❌ Error:', err);
      alert(err.message || 'Something went wrong!');
    } finally {
      this.isSubmitting = false;
    }
  }

  async loadVenueData(id: number) {
    try {
      const res: any = await lastValueFrom(this.venueService.getVenueById(id));

      if (res?.status?.success) {
        const venue = res.data;

        this.venueForm.patchValue({
          venueName: venue.name,
          venueDescription: venue.descriptions,
          contactPersonName: venue.contact_person?.name,
          phoneNumber: venue.contact_person?.phone,
          streetAddress: venue.address?.line1,
          city: venue.address?.city,
          state: this.states.find((val) => val.value === venue.address?.state)?.value,
          postalCode: venue.address?.pincode,
          openTime: venue.open_status?.open_time ? this.convertTo12Hour(venue.open_status?.open_time) : null,
          closeTime: venue.open_status?.close_time ? this.convertTo12Hour(venue.open_status?.close_time) : null,
          venueCapacity: venue.capacity,
          latitude: venue.location?.lat,
          longitude: venue.location?.lng,
        });

        // Set location and update map
        if (venue.location) {
          this.selectedLocation = {
            lat: venue.location.lat,
            lng: venue.location.lng,
            address: venue.address?.full || 'Selected location',
          };

          // Wait for map to be initialized before setting marker
          setTimeout(() => {
            if (this.map) {
              this.map.setCenter(this.selectedLocation);
              this.map.setZoom(15);

              if (this.marker) {
                this.marker.setMap(null);
              }

              this.marker = new google.maps.Marker({
                position: this.selectedLocation,
                map: this.map,
                title: 'Selected Venue Location',
                draggable: true,
              });

              // Add drag listener
              this.marker.addListener('dragend', (event: any) => {
                this.placeMarker(event.latLng);
              });
            }
          }, 500);
        }

        // Set sport categories
        this.sportCategories.forEach((cat) => {
          cat.selected = venue.sport_type.includes(cat.value.toLowerCase());
        });

        // Set services
        this.availableServices.forEach((service) => {
          service.selected = venue.available_services.includes(service.value.toLowerCase());
        });

        // Set images
        if (venue.images && venue.images.length) {
          this.uploadedImages = venue.images.map((img: any) => ({
            file: null,
            name: img.name,
            preview: img.url,
            id: img.id,
          }));
        }
      }
    } catch (error) {
      console.error('❌ Error loading venue data:', error);
    }
  }
}
