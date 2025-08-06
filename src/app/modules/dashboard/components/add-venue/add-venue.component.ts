import { Component, OnInit, ViewChild, ElementRef, NgZone, AfterViewInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { VenueAnalyticsService } from 'src/app/core/services/venue-analytics.service';
import { ActivatedRoute, Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { ChangeDetectorRef } from '@angular/core';
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
  @ViewChild('fileInput') fileInput!: ElementRef;
  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const clickedInside = target.closest('.dropdown-wrapper');
    if (!clickedInside) {
      this.dropdownOpen = false;
      this.serviceDropdownOpen = false;
    }
  }

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
  dropdownOpen = false;
  serviceDropdownOpen = false;

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
    { label: 'Andhra Pradesh', value: 'Andhra Pradesh' },
    { label: 'Arunachal Pradesh', value: 'Arunachal Pradesh' },
    { label: 'Assam', value: 'Assam' },
    { label: 'Bihar', value: 'Bihar' },
    { label: 'Chhattisgarh', value: 'Chhattisgarh' },
    { label: 'Goa', value: 'Goa' },
    { label: 'Gujarat', value: 'Gujarat' },
    { label: 'Haryana', value: 'Haryana' },
    { label: 'Himachal Pradesh', value: 'Himachal Pradesh' },
    { label: 'Jharkhand', value: 'Jharkhand' },
    { label: 'Karnataka', value: 'Karnataka' },
    { label: 'Kerala', value: 'Kerala' },
    { label: 'Madhya Pradesh', value: 'Madhya Pradesh' },
    { label: 'Maharashtra', value: 'Maharashtra' },
    { label: 'Manipur', value: 'Manipur' },
    { label: 'Meghalaya', value: 'Meghalaya' },
    { label: 'Mizoram', value: 'Mizoram' },
    { label: 'Nagaland', value: 'Nagaland' },
    { label: 'Odisha', value: 'Odisha' },
    { label: 'Punjab', value: 'Punjab' },
    { label: 'Rajasthan', value: 'Rajasthan' },
    { label: 'Sikkim', value: 'Sikkim' },
    { label: 'Tamil Nadu', value: 'Tamil Nadu' },
    { label: 'Telangana', value: 'Telangana' },
    { label: 'Tripura', value: 'Tripura' },
    { label: 'Uttar Pradesh', value: 'Uttar Pradesh' },
    { label: 'Uttarakhand', value: 'Uttarakhand' },
    { label: 'West Bengal', value: 'West Bengal' },
    { label: 'Andaman and Nicobar Islands', value: 'Andaman and Nicobar Islands' },
    { label: 'Chandigarh', value: 'Chandigarh' },
    { label: 'Dadra and Nagar Haveli and Daman and Diu', value: 'Dadra and Nagar Haveli and Daman and Diu' },
    { label: 'Delhi', value: 'Delhi' },
    { label: 'Jammu and Kashmir', value: 'Jammu and Kashmir' },
    { label: 'Ladakh', value: 'Ladakh' },
    { label: 'Lakshadweep', value: 'Lakshadweep' },
    { label: 'Puducherry', value: 'Puducherry' },
  ];

  districts: any[] = [];

  constructor(
    private fb: FormBuilder,
    private venueService: VenueAnalyticsService,
    private router: Router,
    private ngZone: NgZone,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef,
  ) {
    this.venueForm = this.fb.group({
      venueName: ['', [Validators.required, Validators.maxLength(50)]],
      venueDescription: ['', [Validators.maxLength(250)]],
      contactPersonName: [
        '',
        [Validators.required, Validators.maxLength(25), Validators.pattern(/^[A-Z][a-zA-Z\s]*$/)],
      ],
     
      phoneNumber: ['', [Validators.required, Validators.pattern(/^(\+91)?\d{10}$/)]],
      streetAddress: ['', [Validators.required]],
      city: ['', [Validators.required]],
      district: ['', [Validators.required]],
      // state: ['west_bengal', [Validators.required]],
      postalCode: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
      openTime: ['', Validators.required],
      closeTime: ['', Validators.required],
      venueCapacity: [
        '',
        [Validators.required, Validators.pattern(/^\d+$/), Validators.min(1), Validators.max(999999)],
      ],

      latitude: [''],
      longitude: [''],
      email: ['', [Validators.email]],
      alternativePhone: ['', [Validators.pattern(/^(\+91)?\d{10}$/)]],
      sportCategories: [[]],
      availableServices: [[]],
    });
  }

  async ngOnInit() {
    this.loadGoogleMaps();

    await this.getDropdownsForVenue();

    const venueId = this.route.snapshot.paramMap.get('id');
    if (venueId) {
      this.isEditMode = true;
      await this.loadVenueData(Number(venueId));
    }
  }

  get selectedSportLabels(): string[] {
    return this.sportCategories.filter((s) => s.selected).map((s) => s.label);
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  get selectedServices(): Service[] {
    return this.availableServices.filter((service) => service.selected);
  }

  get selectedSports(): SportCategory[] {
    return this.sportCategories.filter((s) => s.selected);
  }

  toggleService(service: Service) {
    service.selected = !service.selected;
    this.updateServiceForm();
    this.cdr.detectChanges();
  }

  removeService(service: Service) {
    service.selected = false;
    this.updateServiceForm();
  }

  toggleServiceDropdown() {
    this.serviceDropdownOpen = !this.serviceDropdownOpen;
  }

  updateServiceForm() {
    const selected = this.availableServices.filter((s) => s.selected).map((s) => s.value);
    this.venueForm.get('availableServices')?.setValue(selected);
  }

  updateSportForm() {
    const selected = this.sportCategories.filter((s) => s.selected).map((s) => s.value);
    this.venueForm.get('sportCategories')?.setValue(selected);
  }

  trackByServiceId(index: number, service: Service): string {
    return service.id;
  }

  async getDropdownsForVenue() {
    const payload = {
      sports: true,
      available_services: true,
      districts: true,
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

        this.districts = res.data.districts;
        this.cdr.detectChanges();
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

    this.map = new google.maps.Map(this.mapContainer.nativeElement, {
      center: defaultLocation,
      zoom: 10,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });

    this.geocoder = new google.maps.Geocoder();
    this.mapInitialized = true;

    // Listen for map clicks
    this.map.addListener('click', (event: any) => {
      this.placeMarker(event.latLng);
    });

    // Try to get current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const currentLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          // Center map to current location
          this.map.setCenter(currentLocation);

          // Place a marker at current location
          // this.placeMarker(currentLocation);

          // Optionally update form
          this.venueForm.patchValue({
            latitude: currentLocation.lat,
            longitude: currentLocation.lng,
          });

          console.log('Current location set on map:', currentLocation);
        },
        (error) => {
          console.warn('Geolocation error:', error.message);
          // fallback: keep default center
        },
      );
    } else {
      console.warn('Geolocation not supported by this browser');
    }

    console.log('Map initialized successfully');
  }

  placeMarker(location: any) {
    if (this.marker) {
      this.marker.setMap(null);
    }

    this.marker = new google.maps.Marker({
      position: location,
      map: this.map,
      draggable: true,
      title: 'Venue Location',
      animation: google.maps.Animation.DROP,
    });

    this.ngZone.run(() => {
      this.selectedLocation = {
        lat: location.lat(),
        lng: location.lng(),
        address: `Lat: ${location.lat().toFixed(6)}, Lng: ${location.lng().toFixed(6)}`,
      };

      this.venueForm.patchValue({
        latitude: this.selectedLocation.lat,
        longitude: this.selectedLocation.lng,
      });
    });

    this.reverseGeocode(location);

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

  triggerFileInput() {
    const fileInput = this.fileInput.nativeElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  onFileSelect(event: any) {
    this.ngZone.run(() => {
      const files = event.target.files;
      this.processFiles(files);
    });
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

  closeDropdown() {
    this.dropdownOpen = false;
  }

  removeSport(sport: SportCategory) {
    sport.selected = false;
    this.updateSportForm();
  }

  processFiles(files: FileList) {
    this.ngZone.run(() => {
      const remainingSlots = 4 - this.uploadedImages.length;
      if (files.length > remainingSlots) {
        this.toastr.warning(`You can only upload 4 image(s).`);
        return;
      }

      for (let i = 0; i < files.length && this.uploadedImages.length < 4; i++) {
        const file = files[i];
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (e) => {
            this.ngZone.run(() => {
              this.uploadedImages.push({
                file: file,
                name: file.name,
                preview: e.target?.result as string,
              });
              this.cdr.detectChanges();
            });
          };
          reader.readAsDataURL(file);
        } else {
          this.toastr.warning('Only image files are allowed.');
        }
      }
    });
  }

  removeImage(index: number) {
    this.uploadedImages.splice(index, 1);
  }

  toggleSportCategory(sport: SportCategory) {
    sport.selected = !sport.selected;
    this.updateSportForm();
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

  getCurrentLocationAndSetInForm(): void {
    if (!navigator.geolocation) {
      this.toastr.error('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        console.log('Current Location:', lat, lng);

        // Update the form with the current location
        this.venueForm.patchValue({
          latitude: lat,
          longitude: lng,
        });

        // Update the map and place a marker
        if (this.mapInitialized && this.map) {
          const location = new google.maps.LatLng(lat, lng);
          this.placeMarker(location); // Use existing placeMarker method to update map and marker
          this.map.setZoom(10); // Optional: Set a closer zoom level for better visibility
        } else {
          console.warn('Map not initialized yet');
          // Fallback: Store the location and try to set it once the map is ready
          this.selectedLocation = { lat, lng };
          this.cdr.detectChanges();
        }
      },
      (error) => {
        this.toastr.error('Error getting location: ' + error.message);
      },
    );
  }

  async onSubmit() {
    Object.keys(this.venueForm.controls).forEach((key) => {
      this.venueForm.get(key)?.markAsTouched();
    });

    this.cdr.detectChanges();

    if (this.venueForm.invalid) {
      this.toastr.error('Please fill all required fields correctly.');
      return;
    }

    const validationError = this.validateBeforeSubmit();
    if (validationError) {
      this.toastr.error(validationError);
      this.cdr.detectChanges(); // Ensure UI updates for toastr
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
          district: this.venueForm.value.district,
          pincode: this.venueForm.value.postalCode,
          full: `${this.venueForm.value.city}, ${this.venueForm.value.state}`,
        },
        alt_phone: this.venueForm.value.alternativePhone,
        email: this.venueForm.value.email,
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
        this.toastr.success('Venue updated successfully!');
      } else {
        await lastValueFrom(this.venueService.createVenue(formData));
        this.toastr.success('Venue created successfully!');
      }

      this.router.navigate(['/dashboard/infrastructure-management']);
    } catch (err: any) {
      console.error('❌ Error:', err);
      this.toastr.error(err.message || 'Something went wrong!');
    } finally {
      this.isSubmitting = false;
      this.cdr.detectChanges(); // Ensure UI updates after submission
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
          alt_phone: venue.alt_phone,
          email: venue.email,
          district: venue.address?.district,
        });

        if (venue.location) {
          this.selectedLocation = {
            lat: venue.location.lat,
            lng: venue.location.lng,
            address: venue.address?.full || 'Selected location',
          };

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

              this.marker.addListener('dragend', (event: any) => {
                this.placeMarker(event.latLng);
              });
            }
          }, 500);
        }

        if (venue.sport_type && this.sportCategories.length > 0) {
          this.sportCategories.forEach((cat) => {
            cat.selected = venue.sport_type.some(
              (sportType: string) => sportType.toLowerCase() === cat.value.toLowerCase(),
            );
          });
          this.updateSportForm();
        }

        if (venue.available_services && this.availableServices.length > 0) {
          this.availableServices.forEach((service) => {
            service.selected = venue.available_services.some(
              (availableService: string) => availableService.toLowerCase() === service.value.toLowerCase(),
            );
          });
          this.updateServiceForm();
        }

        if (venue.images && venue.images.length) {
          this.uploadedImages = venue.images.map((img: any) => ({
            file: null,
            name: img.name,
            preview: img.url,
            id: img.id,
          }));
        }

        this.cdr.detectChanges();
      }
    } catch (error) {
      console.error('❌ Error loading venue data:', error);
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      if (typeof google !== 'undefined' && google.maps && this.mapContainer) {
        this.initializeMap();
      }
    }, 100);
  }
}
