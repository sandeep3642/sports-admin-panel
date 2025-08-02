import { Component, OnInit, ViewChild, ElementRef, NgZone } from '@angular/core';
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
    // 🌍 States
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

    // 🏛️ Union Territories
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
      venueName: ['', [Validators.required]],
      venueDescription: [''],
      contactPersonName: ['', [Validators.required]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[\+]?[0-9\s\-\(\)]{10,}$/)]],
      streetAddress: ['', [Validators.required]],
      city: ['', [Validators.required]],
      state: ['', [Validators.required]],
      postalCode: [''],
      openTime: [''],
      closeTime: [''],
      venueCapacity: ['', [Validators.min(1)]],
      latitude: [''],
      longitude: [''],
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

  async getDropdownsForVenue() {
    const payload = {
      sports: true,
      available_services: true,
    };

    try {
      const res: any = await lastValueFrom(this.venueService.getDropdownLists(payload));

      if (res?.status?.success) {
        // ✅ Map API response to add `selected: false`
        this.availableServices = res.data.available_services.map((service: any, index: number) => ({
          id: (index + 1).toString(), // ✅ agar id chahiye to index se banalo
          label: service.label,
          value: service.value,
          selected: false,
        }));

        this.sportCategories = res.data.sports.map((sport: any, index: number) => ({
          id: (index + 1).toString(), // ✅ agar id chahiye to index se banalo
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
        lng: location.lng(),
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

  // ✅ Helper to convert 12h -> 24h
  convertTo24Hour(time12h: string): string {
    if (!time12h) return '';

    const [time, modifier] = time12h.split(' '); // e.g. "08:00 AM" -> ["08:00", "AM"]
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

    // Split hour & minute
    let [hour, minute] = time24.split(':').map(Number);

    // Determine AM/PM
    const ampm = hour >= 12 ? 'PM' : 'AM';

    // Convert hour to 12-hour format
    hour = hour % 12 || 12; // 0 -> 12

    // Return formatted time (e.g. "02:30 PM")
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${ampm}`;
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
      // ✅ 1️⃣ Filter only NEW images (jo edit mode me file object ke sath ayi hain)
      const newFiles = this.uploadedImages
        .filter((img) => img.file) // sirf nayi images
        .map((img) => img.file);

      let uploadedImageUrls: any[] = [];

      // ✅ 2️⃣ Agar nayi images hain to upload karo
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

      // ✅ 3️⃣ Purani images bhi rakho (jo edit mode me load hui thi)
      const existingImages = this.uploadedImages
        .filter((img) => !img.file) // file=null means old image
        .map((img) => ({
          id: img.id || null,
          name: img.name,
          url: img.preview,
        }));

      // ✅ 4️⃣ Merge old + new images
      const finalImages = [...existingImages, ...uploadedImageUrls];

      const openTime24 = this.convertTo24Hour(this.venueForm.value.openTime);
      const closeTime24 = this.convertTo24Hour(this.venueForm.value.closeTime);
      const routeId = this.route.snapshot.paramMap.get('id');

      // ✅ 5️⃣ Final payload
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

      // ✅ 6️⃣ API call: Add vs Edit
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

        // ✅ Location Map Marker
        if (venue.location) {
          this.selectedLocation = {
            lat: venue.location.lat,
            lng: venue.location.lng,
          };

          if (this.map) {
            this.map.setCenter(this.selectedLocation);
            this.map.setZoom(15);

            this.marker = new google.maps.Marker({
              position: this.selectedLocation,
              map: this.map,
              title: 'Selected Venue Location',
            });
          }
        }

        // ✅ Sport Categories selection update
        this.sportCategories.forEach((cat) => {
          cat.selected = venue.sport_type.includes(cat.value.toLowerCase());
        });

        // ✅ Services selection update
        this.availableServices.forEach((service) => {
          service.selected = venue.available_services.includes(service.value.toLowerCase());
        });

        // ✅ Images pre-fill for preview
        if (venue.images && venue.images.length) {
          this.uploadedImages = venue.images.map((img: any) => ({
            file: null,
            name: img.name,
            preview: img.url,
          }));
        }
      }
    } catch (error) {
      console.error('❌ Error loading venue data:', error);
    }
  }
  ngAfterViewInit() {
    if (typeof google !== 'undefined' && google.maps) {
      this.initializeMap();
    }
  }
}
