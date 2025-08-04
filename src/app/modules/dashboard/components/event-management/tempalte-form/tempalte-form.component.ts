import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AbstractControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { EventService } from 'src/app/core/services/event.service';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-tempalte-form',
  templateUrl: './tempalte-form.component.html',
  imports: [
    ReactiveFormsModule, CommonModule,NgSelectModule

  ],
 styleUrls: ['./tempalte-form.component.css']
})
export class TempalteFormComponent implements OnInit {
  eventForm!: FormGroup;
  newScheduleForm!: FormGroup;
  templateId: any;
  parkingAvailable: boolean | undefined;
  accommodation: boolean | undefined;
  dropdownList: any;
  isModalOpen = false;
  // Drag and drop properties
  isDragOver = false;
  isGalleryDragOver = false;
  selectedImages: File[] = [];
  selectedGalleryImages: File[] = [];
  imagePreviewUrls: string[] = [];
  galleryPreviewUrls: string[] = [];
  uploadedImageUrls: string[] = [];
  uploadedGalleryUrls: string[] = [];
  maxImages = 4; // Maximum number of images allowed
  maxGalleryImages = 10; // Maximum number of gallery images allowed
  isUploading = false;
  isGalleryUploading = false;
  // Schedule image upload properties
  isScheduleImageUploading = false;
  isScheduleImageDragOver = false;
  selectedScheduleImage: File | null = null;
  scheduleImagePreviewUrl: string | null = null;
  uploadedScheduleImageUrl: string | null = null;
  eventDetails:any;
  identification: string | null = null;
  constructor(private route: ActivatedRoute, private toastr: ToastrService, private fb: FormBuilder, private router: Router, private eventService: EventService,) { }

  ngOnInit() {
    this.eventForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      tagline: ['', Validators.required],
      event_type: ['', Validators.required],
      sport_category: ['', Validators.required],
      host: ['', Validators.required],
      images: this.fb.array([this.createImageGroup()]),
      gallery: this.fb.array([this.createGalleryGroup()]),
      start_date: ['', Validators.required],
      end_date: ['', Validators.required],
      start_time: ['', Validators.required],
      end_time: ['', Validators.required],
      capacity: [0],
      parking_lot: [false],
      location: this.fb.group({
        lat: [''],
        lng: ['']
      }),
      address: this.fb.group({
        line1: [''],
        city: [''],
        state: [''],
        pincode: [''],
        full: ['']
      }),
      contact_person: this.fb.group({
        name: [''],
        phone: ['']
      }),
      contact_info: this.fb.group({
        coordinator_name: ['', Validators.required],
        coordinator_phone_number: ['', [Validators.required, Validators.pattern(/^[0-9+\-\s()]+$/)]],
        coordinator_email: ['', [Validators.required, Validators.email]],
        additional_help_info: ['', Validators.required,]
      }),
      venue_details: this.fb.group({
        name: ['', Validators.required],
        address: ['', Validators.required],
        location: this.fb.group({
          lat: [''],
          lng: ['']
        }),
        nearest_transport_info: ['']
      }),
      event_and_schedule:this.fb.array([this.createEventScheduleGroup()]),
      registration_details: this.fb.group({
        start_date: ['', Validators.required],
        end_date: ['', Validators.required],
        required_document: [[], Validators.required],
        additional_link: ['', Validators.required]
      }),
      awards_and_recognition: this.fb.array([
        this.fb.control('', Validators.required)
      ]),
      travel_and_accomodation: this.fb.group({
        is_accomodation_provided: ['', Validators.required],
        accommodation_details: this.fb.group({
          hotel: ['', Validators.required],
          limited_rooms: ['']
        }),
        is_parking_available: ['', Validators.required],
        public_transport_info: ['', Validators.required]
      }),
      faq: this.fb.array([
        this.createFaqGroup()
      ]),
      eligibility_and_categories: this.fb.group({
        eligibile_participants: this.fb.array([
          this.fb.control('', Validators.required)
        ]),
        age_categories: this.fb.group({
          is_u14: [false],
          is_18_25: [false],
          is_senior: [false]
        }),
        gender_categories: this.fb.group({
          is_boys: [false],
          is_girls: [false],
          is_others: [false]
        })
      }),
      event_schedule: this.fb.array([]),
      event_included: this.fb.array([])
    });

    this.route.params.subscribe(params => {
      this.templateId = +params['id'];
      this.identification = params['identification'];
    });
    

    // Only fetch/patch event details if identification is 'edit'
    if (this.identification === 'edit') {
      const nav = this.router.getCurrentNavigation();
      const isEventDetails = nav?.extras?.state?.['eventDetails'] || history.state?.['eventDetails'];
      console.log("isEventDetails",isEventDetails);
      localStorage.setItem('eventID',isEventDetails.id);

      if (isEventDetails) {
        this.eventForm.patchValue(isEventDetails);
        // this.setKeyDetailsFromEventDetails();
      } else {
        let ID =  localStorage.getItem('eventID');
        this.eventService.getDetails({ event_id:isEventDetails?.id || ID }).subscribe(res => {
          this.eventDetails = res.details;
          console.log(" this.eventDetails ", JSON.stringify(this.eventDetails?.event_and_schedule));
          this.eventForm.patchValue(this.eventDetails);
          // this.setKeyDetailsFromEventDetails();
        });
      }
    }
    this.getDropDown();

    this.newScheduleForm = this.fb.group({
      sports_event_included: ['', Validators.required],
      title: ['', Validators.required],
      key_details: this.fb.array([this.fb.control('')]),
      description: ['', Validators.required],
      image: [''],
      start_date: ['', Validators.required],
      end_date: ['', Validators.required],
      start_time: ['', Validators.required],
      end_time: ['', Validators.required]
    });
    
  }

  setKeyDetailsFromEventDetails() {
    const keyDetailsArray = this.eventForm.get('event_and_schedule.key_details') as FormArray;
    keyDetailsArray.clear();
    const details = this.eventDetails?.event_and_schedule?.key_details || this.eventDetails?.key_details;
    if (Array.isArray(details)) {
      if (details.length > 0) {
        details.forEach((val: string) => keyDetailsArray.push(this.fb.control(val)));
      }
    }
    // Always ensure at least one input
    if (keyDetailsArray.length === 0) {
      keyDetailsArray.push(this.fb.control(''));
    }
  }

  getDropDown() {
    let payload = {
      district: true,
      sports: true,
      qualifications: true,
      levels: true,
      certificates: true,
      event_type: true
    }
    this.eventService.dropDowns(payload).subscribe((res: any) => {
      if (res.status.success) {
        this.dropdownList = res?.data;
        console.log(" this.dropdownList", this.dropdownList);
        
      }
    })
  }

  createEventScheduleGroup(): FormGroup {
    return this.fb.group({
      sports_event_included: ['', Validators.required],
      title: ['', Validators.required],
      key_details: this.fb.array([this.fb.control('')]),
      description: ['', Validators.required],
      image: [''],
      start_date: ['', Validators.required],
      end_date: ['', Validators.required],
      start_time: ['', Validators.required],
      end_time: ['', Validators.required]
    });
  }
  
  get eventScheduleArray(): FormArray {
    return this.eventForm.get('event_and_schedule') as FormArray;
  }

  get keyDetails(): FormArray {
    return (this.eventForm.get('event_and_schedule.key_details') as FormArray);
  }


  // --- FormArray Creators ---
  createImageGroup() {
    return this.fb.group({
      url: [''],
      caption: ['']
    });
  }
  createGalleryGroup() {
    return this.fb.group({
      url: ['']
    });
  }
  createFaqGroup() {
    return this.fb.group({
      question: ['', Validators.required],
      answer: ['', Validators.required]
    });
  }


  // --- Getters for FormArrays ---
  get images() { return this.eventForm.get('images') as FormArray; }
  get gallery() { return this.eventForm.get('gallery') as FormArray; }
  get awards() { return this.eventForm.get('awards_and_recognition') as FormArray; }
  get faq() { return this.eventForm.get('faq') as FormArray; }
  get requiredDocs() { return this.eventForm.get('registration_details.required_document') as FormArray; }
  get eligibileParticipants() {
    return (this.eventForm?.get('eligibility_and_categories.eligibile_participants') as FormArray) || this.fb.array([]);
  }
  get eventSchedule() { return this.eventForm.get('event_schedule') as FormArray; }
  get eventIncluded() { return this.eventForm.get('event_included') as FormArray; }

  get travel_and_accomodation() {
    return this.eventForm.get('travel_and_accomodation') as FormGroup;
  }

  // --- Add/Remove Methods ---
  addImage() { this.images.push(this.createImageGroup()); }
  removeImage(i: number) { this.images.removeAt(i); }
  addGallery() { this.gallery.push(this.createGalleryGroup()); }
  removeGallery(i: number) { this.gallery.removeAt(i); }
  addAward() { this.awards.push(new FormControl('', Validators.required)); }
  removeAward(i: number) { this.awards.removeAt(i); }
  addFaq() { this.faq.push(this.createFaqGroup()); }
  removeFaq(i: number) { this.faq.removeAt(i); }
  addRequiredDoc() { this.requiredDocs.push(new FormControl('')); }
  removeRequiredDoc(i: number) { this.requiredDocs.removeAt(i); }
  addEligibileParticipant() { this.eligibileParticipants.push(new FormControl('', Validators.required)); }
  removeEligibileParticipant(i: number) { this.eligibileParticipants.removeAt(i); }
  // addEventSchedule() { this.eventSchedule.push(this.createEventScheduleGroup()); }
  removeEventSchedule(i: number) { this.eventSchedule.removeAt(i); }
  addEventIncluded() { this.eventIncluded.push(new FormControl('')); }
  removeEventIncluded(i: number) { this.eventIncluded.removeAt(i); }

  addEventToSchedule(scheduleIndex: number) {
    const events = (this.eventSchedule.at(scheduleIndex).get('events') as FormArray);
    events.push(new FormControl(''));
  }

  getEvents(schedule: AbstractControl) {
    return (schedule.get('events') as FormArray).controls;
  }

  goBack() {
    this.router.navigate(['dashboard/event-management']);
  }

  onSubmit() {
    this.markFormGroupTouched(this.eventForm);
  
    Object.entries(this.eventForm.controls).forEach(([key, control]) => {
      if (control.errors?.['required']) {
        console.log(`❗ Field '${key}' is required and missing.`);
      }
    });
  
    if (this.eventForm.valid) {
      const formData: any = {
        ...this.eventForm.value,
        template_id: this.templateId,
        images: this.uploadedImageUrls,
        gallery: this.uploadedGalleryUrls
      };
  
      // ➕ Add event_id if in edit mode
      if (this.identification === 'edit') {
        const eventId = localStorage.getItem('eventID');
        if (eventId) {
          formData.event_id = eventId;
        }
      }
  
      // Save to localStorage
      localStorage.setItem('eventData', JSON.stringify(formData));
  
      this.eventService.addEvents(formData).subscribe({
        next: (res: any) => {
          this.toastr.success(res.status?.message, 'Success');
          localStorage.setItem('eventID', res?.details?.id);
          this.router.navigate(['dashboard/preview-template', res?.details?.template_id, 'edit']);
        },
        error: (err: any) => {
          console.error('Event creation failed:', err);
          this.toastr.error('Failed to create event', 'Error');
        }
      });
    } else {
      Object.entries(this.eventForm.controls).forEach(([key, control]) => {
        if (control.errors?.['required']) {
          console.log(`❗ Field '${key}' is required and missing.`);
        }
      });
      this.toastr.warning('Please fill all required fields correctly', 'Warning');
      this.scrollToFirstError();
    }
  }
  

  // Mark all form controls as touched to show validation errors
  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else if (control instanceof FormArray) {
        control.controls.forEach((ctrl: any) => {
          if (ctrl instanceof FormGroup) {
            this.markFormGroupTouched(ctrl);
          } else {
            ctrl.markAsTouched();
          }
        });
      } else {
        control?.markAsTouched();
      }
    });
  }

  // Scroll to the first error field
  private scrollToFirstError() {
    setTimeout(() => {
      const firstErrorElement = document.querySelector('.border-red-500');
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }, 100);
  }

  // Drag and drop methods
  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    const files = event.dataTransfer?.files;
    if (files) {
      this.handleFiles(Array.from(files));
    }
  }

  // Gallery drag and drop methods
  onGalleryDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isGalleryDragOver = true;
  }

  onGalleryDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isGalleryDragOver = false;
  }

  onGalleryDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isGalleryDragOver = false;

    const files = event.dataTransfer?.files;
    if (files) {
      this.handleGalleryFiles(Array.from(files));
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.handleFiles(Array.from(input.files));
    }
  }

  onGalleryFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.handleGalleryFiles(Array.from(input.files));
    }
  }

  private handleFiles(files: File[]) {
    const imageFiles = files.filter(file => file.type.startsWith('image/'));

    if (this.selectedImages.length + imageFiles.length > this.maxImages) {
      this.toastr.warning(`You can only upload a maximum of ${this.maxImages} images.`, 'Warning');
      return;
    }

    imageFiles.forEach(file => {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        this.toastr.warning(`File ${file.name} is too large. Maximum size is 5MB.`, 'Warning');
        return;
      }
      // Prevent duplicate files
      if (!this.selectedImages.some(f => f.name === file.name && f.size === file.size)) {
        this.selectedImages.push(file);
        this.createImagePreview(file);
      }
    });
  }

  uploadAllImages() {
    if (this.selectedImages.length === 0) {
      this.toastr.warning('Please select images to upload.', 'Warning');
      return;
    }
    this.isUploading = true;
    const formData = new FormData();
    this.selectedImages.forEach(file => {
      formData.append('files', file);
    });
    formData.append('category', 'event');
    formData.append('title', 'Event Images');

    this.eventService.upload(formData).subscribe({
      next: (response: any) => {
        if (response && response.data && response.data.successful_uploads && Array.isArray(response.data.successful_uploads)) {
          response.data.successful_uploads.forEach((upload: any) => {
            if (upload.storage_info && upload.storage_info.url) {
              this.uploadedImageUrls.push(upload.storage_info.url);
            }
          });
          this.toastr.success('All images uploaded successfully!', 'Success');
          // Optionally clear selected images and previews
          this.selectedImages = [];
          this.imagePreviewUrls = [];
        } else {
          this.toastr.error('Upload failed: Invalid response', 'Error');
        }
        this.isUploading = false;
      },
      error: (error) => {
        this.isUploading = false;
        this.toastr.error('Failed to upload images', 'Error');
      }
    });
  }

  private handleGalleryFiles(files: File[]) {
    const imageFiles = files.filter(file => file.type.startsWith('image/'));

    if (this.selectedGalleryImages.length + imageFiles.length > this.maxGalleryImages) {
      this.toastr.warning(`You can only upload a maximum of ${this.maxGalleryImages} gallery images.`, 'Warning');
      return;
    }

    imageFiles.forEach(file => {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        this.toastr.warning(`File ${file.name} is too large. Maximum size is 5MB.`, 'Warning');
        return;
      }
      // Prevent duplicate files
      if (!this.selectedGalleryImages.some(f => f.name === file.name && f.size === file.size)) {
        this.selectedGalleryImages.push(file);
        this.createGalleryImagePreview(file);
      }
    });
  }

  uploadAllGalleryImages() {
    if (this.selectedGalleryImages.length === 0) {
      this.toastr.warning('Please select gallery images to upload.', 'Warning');
      return;
    }
    this.isGalleryUploading = true;
    const formData = new FormData();
    this.selectedGalleryImages.forEach(file => {
      formData.append('files', file);
    });
    formData.append('category', 'gallery');
    formData.append('title', 'Gallery Images');

    this.eventService.upload(formData).subscribe({
      next: (response: any) => {
        if (response && response.data && response.data.successful_uploads && Array.isArray(response.data.successful_uploads)) {
          response.data.successful_uploads.forEach((upload: any) => {
            if (upload.storage_info && upload.storage_info.url) {
              this.uploadedGalleryUrls.push(upload.storage_info.url);
            }
          });
          this.toastr.success('All gallery images uploaded successfully!', 'Success');
          // Optionally clear selected gallery images and previews
          this.selectedGalleryImages = [];
          this.galleryPreviewUrls = [];
        } else {
          this.toastr.error('Gallery upload failed: Invalid response', 'Error');
        }
        this.isGalleryUploading = false;
      },
      error: (error) => {
        this.isGalleryUploading = false;
        this.toastr.error('Failed to upload gallery images', 'Error');
      }
    });
  }

  private createImagePreview(file: File) {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.imagePreviewUrls.push(e.target.result);
    };
    reader.readAsDataURL(file);
  }

  private createGalleryImagePreview(file: File) {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.galleryPreviewUrls.push(e.target.result);
    };
    reader.readAsDataURL(file);
  }

  removeSelectedImage(index: number) {
    this.selectedImages.splice(index, 1);
    this.imagePreviewUrls.splice(index, 1);
    this.uploadedImageUrls.splice(index, 1);
  }

  removeSelectedGalleryImage(index: number) {
    this.selectedGalleryImages.splice(index, 1);
    this.galleryPreviewUrls.splice(index, 1);
    this.uploadedGalleryUrls.splice(index, 1);
  }

  openFileDialog() {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = 'image/*';
    input.onchange = (event: Event) => {
      this.onFileSelected(event);
    };
    input.click();
  }

  openGalleryFileDialog() {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = 'image/*';
    input.onchange = (event: Event) => {
      this.onGalleryFileSelected(event);
    };
    input.click();
  }

  // Schedule Image Upload Methods
  onScheduleImageDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isScheduleImageDragOver = true;
  }

  onScheduleImageDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isScheduleImageDragOver = false;
  }

  onScheduleImageDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isScheduleImageDragOver = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleScheduleImageFile(files[0]);
    }
  }

  onScheduleImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleScheduleImageFile(input.files[0]);
    }
  }

  private handleScheduleImageFile(file: File) {
    if (!file.type.startsWith('image/')) {
      this.toastr.warning('Please select an image file.', 'Warning');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      this.toastr.warning('File is too large. Maximum size is 5MB.', 'Warning');
      return;
    }

    this.selectedScheduleImage = file;
    this.createScheduleImagePreview(file);
    this.uploadScheduleImage(file);
  }

  private uploadScheduleImage(file: File) {
    this.isScheduleImageUploading = true;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', 'schedule');
    formData.append('title', 'Schedule Image');

    this.eventService.uploadSingleFile(formData).subscribe({
      next: (response: any) => {
        if (response && response.data && response.data.storage_info.url) {
          this.uploadedScheduleImageUrl = response.data.storage_info.key;
          // Update the form control with the uploaded image URL
          this.eventForm.get('event_and_schedule.image')?.setValue(response.data.storage_info.key);
          this.toastr.success('Schedule image uploaded successfully!', 'Success');
        } 
        this.isScheduleImageUploading = false;
      },
      error: (error) => {
        console.error('Schedule image upload error:', error);
        this.toastr.error('Failed to upload schedule image', 'Error');
        this.isScheduleImageUploading = false;
      }
    });
  }

  private createScheduleImagePreview(file: File) {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.scheduleImagePreviewUrl = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  removeScheduleImage() {
    this.selectedScheduleImage = null;
    this.scheduleImagePreviewUrl = null;
    this.uploadedScheduleImageUrl = null;
    this.eventForm.get('event_and_schedule.image')?.setValue('');
  }

  openScheduleImageDialog() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (event: Event) => {
      this.onScheduleImageSelected(event);
    };
    input.click();
  }

  // Validation helper methods
  isFieldInvalid(fieldName: string): boolean {
    const field = this.eventForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  isFieldRequired(fieldName: string): boolean {
    const field = this.eventForm.get(fieldName);
    return !!(field && field.errors && field.errors['required']);
  }

  getFieldError(fieldName: string): string {
    const field = this.eventForm.get(fieldName);
    if (field && field.errors) {
      if (field.errors['required']) return 'This field is required';
      if (field.errors['email']) return 'Please enter a valid email address';
      if (field.errors['minlength']) return `Minimum length is ${field.errors['minlength'].requiredLength} characters`;
      if (field.errors['min']) return `Minimum value is ${field.errors['min'].min}`;
      if (field.errors['pattern']) return 'Please enter a valid format';
    }
    return '';
  }

  // Get nested form control (for nested form groups)
  getNestedControl(path: string): any {
    return this.eventForm.get(path);
  }

  // Check if nested field is invalid
  isNestedFieldInvalid(path: string): boolean {
    const field = this.getNestedControl(path);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  // Get error for nested field
  getNestedFieldError(path: string): string {
    const field = this.getNestedControl(path);
    if (field && field.errors) {
      if (field.errors['required']) return 'This field is required';
      if (field.errors['email']) return 'Please enter a valid email address';
      if (field.errors['minlength']) return `Minimum length is ${field.errors['minlength'].requiredLength} characters`;
      if (field.errors['min']) return `Minimum value is ${field.errors['min'].min}`;
      if (field.errors['pattern']) return 'Please enter a valid format';
    }
    return '';
  }

  isFormArrayFieldInvalid(formArrayName: string, index: number): boolean {
    const formArray = this.eventForm.get(formArrayName) as FormArray;
    const field = formArray.at(index);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFormArrayFieldError(formArrayName: string, index: number): string {
    const formArray = this.eventForm.get(formArrayName) as FormArray;
    const field = formArray.at(index);
    if (field && field.errors) {
      if (field.errors['required']) return 'This field is required';
      if (field.errors['email']) return 'Please enter a valid email address';
      if (field.errors['minlength']) return `Minimum length is ${field.errors['minlength'].requiredLength} characters`;
    }
    return '';
  }

  addNewSchedule() {
    this.isModalOpen = true;
  }
  closeChooseTemplateModal() {
    this.isModalOpen = false;
  }

  removeSchedule(i: number) {
    this.eventScheduleArray.removeAt(i);
  }

  addKeyDetail(i: number) {
    this.getKeyDetails(i).push(this.fb.control('', Validators.required));
  }

  removeKeyDetail(i: number, j: number) {
    if (j !== 0) this.getKeyDetails(i).removeAt(j);
  }

  getKeyDetails(i: number): FormArray {
    return (this.eventScheduleArray.at(i).get('key_details') as FormArray);
  }

  closeScheduleModal(){
    this.isModalOpen =false;
  }
  
  addSchedule(): void {
  
    // Push modal form value as new schedule group
    this.eventAndScheduleArray.push(
      this.fb.group({
        sports_event_included: this.newScheduleForm.value.sports_event_included,
        title: this.newScheduleForm.value.title,
        key_details: this.fb.array(
          this.newScheduleForm.value.key_details.map((kd: string) => this.fb.control(kd))
        ),
        description: this.newScheduleForm.value.description,
        image: this.newScheduleForm.value.image,
        start_date: this.newScheduleForm.value.start_date,
        end_date: this.newScheduleForm.value.end_date,
        start_time: this.newScheduleForm.value.start_time,
        end_time: this.newScheduleForm.value.end_time
      })
    );
    this.closeScheduleModal();

  
    // Optional: clear modal form and hide
    this.newScheduleForm.reset();
    this.keyDetails.clear();
    this.keyDetails.push(this.fb.control('')); // Add default key_detail again
    this.scheduleImagePreviewUrl = null;
    this.closeScheduleModal();
  }
  

  get eventAndScheduleArray(): FormArray {
    return this.eventForm.get('event_and_schedule') as FormArray;
  }

  get keyDetailsNew(): FormArray {
    return this.newScheduleForm.get('key_details') as FormArray;
  }
  
  addKeyDetailNew() {
    this.keyDetailsNew.push(this.fb.control('', Validators.required));
  }
  
  removeKeyDetailNew(index: number) {
    this.keyDetailsNew.removeAt(index);
  }

}
