import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from 'src/app/core/services/user.service';
import { ToastrService } from 'ngx-toastr';
import { VenueAnalyticsService } from 'src/app/core/services/venue-analytics.service';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  // Tabs
  activeTab: 'details' | 'security' = 'details';

  // Details form
  editForm!: FormGroup;

  // Security form
  securityForm!: FormGroup;
  showCurrent = false;
  showNew = false;

  profileImage: string | null = null;
  showImageModal = false;
  modalImageUrl: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService,
    private toastr: ToastrService,
    private venueService: VenueAnalyticsService
  ) {}

  ngOnInit(): void {
    // initial tab from query param
    const initialTab = (this.route.snapshot.queryParamMap.get('tab') as 'details' | 'security') || 'details';
    this.activeTab = initialTab;

    // react to tab changes via query params (e.g., when navigating from navbar)
    this.route.queryParamMap.subscribe((params) => {
      const tab = (params.get('tab') as 'details' | 'security') || 'details';
      if (tab !== this.activeTab) {
        this.activeTab = tab;
      }
    });

    const name = localStorage.getItem('userName') || localStorage.getItem('full_name') || '';
    const email = localStorage.getItem('userEmail') || localStorage.getItem('email') || '';
    const username = localStorage.getItem('userName') || localStorage.getItem('user_name') || '';
    this.profileImage = localStorage.getItem('profileImage') || null;

    this.editForm = this.fb.group({
      fullName: [name, [Validators.required, Validators.maxLength(60)]],
      email: [email, [Validators.required, Validators.email]],
    });

    this.securityForm = this.fb.group({
      username: [username, [Validators.required, Validators.maxLength(60)]],
      currentPassword: ['', [Validators.required, Validators.minLength(6)]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  setTab(tab: 'details' | 'security'): void {
    this.activeTab = tab;
    // reflect in URL
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab },
      queryParamsHandling: 'merge'
    });
  }

  get pageTitle(): string {
    return this.activeTab === 'details' ? 'User Details' : 'Account & Security';
  }

  get headerTitle(): string {
    return this.activeTab === 'details' ? 'Details' : 'Settings';
  }

  triggerFileInput(fileInput: HTMLInputElement): void {
    fileInput.click();
  }

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    const maxBytes = 5 * 1024 * 1024; // 5MB
    // Check if file is a valid image format (JPG, PNG only - no SVG)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      this.toastr.error('Please select a valid image file (JPG or PNG only)');
      return;
    }
    if (file.size > maxBytes) {
      this.toastr.error('Image must be 5MB or less');
      return;
    }

    try {
      const uploadRes: any = await lastValueFrom(this.venueService.bulkUploadImages([file]));
      if (!uploadRes?.status?.success || !uploadRes?.data?.successful_uploads?.length) {
        throw new Error(uploadRes?.status?.message || 'Image upload failed');
      }
      const url = uploadRes.data.successful_uploads[0]?.storage_info?.url;
      if (!url) throw new Error('Image URL missing from upload response');

      // Update preview immediately
      this.profileImage = url;
      localStorage.setItem('profileImage', url);

      // Persist to user profile via updateDetails
      await lastValueFrom(this.userService.updateDetails({ profile_image: url }));
      // Notify other parts of the app (e.g., navbar) to update avatar
      window.dispatchEvent(new CustomEvent('profileImageUpdated', { detail: { url } }));
      this.toastr.success('Profile photo updated');
    } catch (err: any) {
      this.toastr.error(err?.message || 'Failed to upload image');
    }
  }

  viewProfileImage(): void {
    if (this.profileImage) {
      this.modalImageUrl = this.profileImage;
      this.showImageModal = true;
    }
  }

  closeImageModal(): void {
    this.showImageModal = false;
    this.modalImageUrl = null;
  }

  saveDetails(): void {
    if (this.editForm.invalid) return;
    const payload = {
      profile_image: this.profileImage || undefined,
      full_name: this.editForm.value.fullName,
    };
    this.userService.updateDetails(payload).subscribe({
      next: (res) => {
        this.toastr.success(res?.status?.message || 'Profile updated');
        if (payload.full_name) localStorage.setItem('userName', payload.full_name);
        if (payload.profile_image) {
          localStorage.setItem('profileImage', payload.profile_image);
          // Notify navbar avatar to refresh
          window.dispatchEvent(new CustomEvent('profileImageUpdated', { detail: { url: payload.profile_image } }));
        }
      },
      error: (err) => {
        this.toastr.error(err?.error?.message || 'Failed to update');
      }
    });
  }

  toggleCurrent(): void {
    this.showCurrent = !this.showCurrent;
  }

  toggleNew(): void {
    this.showNew = !this.showNew;
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/auth']);
  }

  updatePassword(): void {
    if (this.securityForm.invalid) {
      this.toastr.error('Please fill password fields correctly');
      return;
    }
    const payload = {
      old_password: this.securityForm.value.currentPassword,
      new_password: this.securityForm.value.newPassword,
    };
    this.userService.changePassword(payload).subscribe({
      next: (res) => {
        this.toastr.success(res?.status?.message || 'Password updated');
        this.securityForm.reset({ username: this.securityForm.value.username, currentPassword: '', newPassword: '' });
      },
      error: (err) => {
        this.toastr.error(err?.error?.status?.message || err?.error?.message || 'Failed to update password');
      }
    });
  }
}