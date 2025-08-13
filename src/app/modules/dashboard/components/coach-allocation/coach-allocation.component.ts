import { Component, OnInit, HostListener } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { FormsModule } from '@angular/forms';
import { EnrollService } from 'src/app/core/services/enroll.service';
import { CoachAssignmentModalComponent } from './coach-assignment-modal/coach-assignment-modal.component';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-coach-allocation',
  imports: [CommonModule, AngularSvgIconModule, FormsModule, CoachAssignmentModalComponent, NgIf],
  templateUrl: './coach-allocation.component.html',
  styleUrl: './coach-allocation.component.css'
})
export class CoachAllocationComponent implements OnInit {

  countsData = {
    total_applications: {
      counts: 0,
      percentage: 0,
      direction: "up"
    },
    application_verified: {
      counts: 0,
      percentage: 0,
      direction: "down"
    },
    awaiting_verification: {
      counts: 0,
      percentage: 0,
      direction: "down"
    },
    user_rejected: {
      counts: 0,
      percentage: 0,
      direction: "down"
    }
  };

  // Table properties
  coachList: any[] = [];
  currentPage: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;
  totalPages: number = 0;
  activeActionDropdown: number | null = null;
  activeNotePopover: number | null = null;
  searchTerm: string = '';
  sortBy: string = 'start_date';
  sortOrder: 'asc' | 'desc' = 'asc';
  isLoading: boolean = false;
  expandedUserId: number | null = null;
  userDetails: any = null;
  isAssignmentModalOpen: boolean = false;
  selectedUserForAssignment: any = null;

  constructor(
    private toastr: ToastrService,
    private enrollService: EnrollService
  ) {}

  ngOnInit(): void {
    // Load coach allocation data
    this.loadCoachData();
    this.loadEnrollStats();
  }

  // Load enrollment statistics
  loadEnrollStats(): void {
    this.enrollService.getEnrollStats().subscribe({
      next: (res) => {
        if (res?.status?.success) {
          // Update counts data based on API response
          const analytics = res?.details?.analytics || [];
          
          // Map analytics array to countsData structure
          analytics.forEach((item: any) => {
            const direction = item.change >= 0 ? "up" : "down";
            const percentage = Math.abs(item.change);
            
            switch (item.label) {
              case "Total Applications":
                this.countsData.total_applications = {
                  counts: item.value,
                  percentage: percentage,
                  direction: direction
                };
                break;
              case "Application Verified":
                this.countsData.application_verified = {
                  counts: item.value,
                  percentage: percentage,
                  direction: direction
                };
                break;
              case "User Awaiting Verification":
                this.countsData.awaiting_verification = {
                  counts: item.value,
                  percentage: percentage,
                  direction: direction
                };
                break;
              case "User Got Rejected":
                this.countsData.user_rejected = {
                  counts: item.value,
                  percentage: percentage,
                  direction: direction
                };
                break;
            }
          });
        }
      },
      error: (err) => {
        console.error('Failed to load enrollment stats:', err);
        this.handleApiError(err);
      }
    });
  }

  // Load coach allocation data from API
  loadCoachData(): void {
    this.isLoading = true;
    
    const payload = {
      page: this.currentPage,
      limit: this.pageSize
    };

    this.enrollService.getAllEnroll(payload).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res?.status?.success) {
          // Map API response to table data
          this.coachList = (res?.details?.enrolls || []).map((enrollment: any) => ({
            id: enrollment.id,
            full_name: enrollment.customer_details?.full_name || enrollment.customer_name,
            sports_category: enrollment.sport,
            location: enrollment.location,
            additional_note: enrollment.notes,
            registration_date: enrollment.created_at,
            status: enrollment.status?.key || enrollment.status?.label?.toLowerCase() || 'pending',
            customer_details: enrollment.customer_details,
            coach_id: enrollment.coach_id,
            enroll_type: enrollment.enroll_type
          }));
          
          this.totalItems = res?.details?.pagination?.total || 0;
          this.totalPages = res?.details?.pagination?.total_pages || Math.ceil(this.totalItems / this.pageSize);
        } else {
          this.coachList = [];
          this.totalItems = 0;
          this.totalPages = 0;
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Failed to load coach allocation data:', err);
        this.handleApiError(err);
        this.coachList = [];
        this.totalItems = 0;
        this.totalPages = 0;
      }
    });
  }

  // Table interaction methods
  toggleActionDropdown(index: number): void {
    this.activeActionDropdown = this.activeActionDropdown === index ? null : index;
    this.activeNotePopover = null; // Close note popover when opening action dropdown
  }

  toggleNotePopover(index: number): void {
    this.activeNotePopover = this.activeNotePopover === index ? null : index;
    this.activeActionDropdown = null; // Close action dropdown when opening note popover
  }

  closeNotePopover(): void {
    this.activeNotePopover = null;
  }

  toggleRow(userId: number): void {
    console.log('Toggle row called for userId:', userId);
    console.log('Current expandedUserId:', this.expandedUserId);
    
    // If clicking on the same row, close it
    if (this.expandedUserId === userId) {
      this.expandedUserId = null;
      this.userDetails = null;
      console.log('Closing row, expandedUserId set to null');
    } else {
      // If clicking on a different row, open it and close others
      this.expandedUserId = userId;
      console.log('Opening row, expandedUserId set to:', userId);
      this.getUserDetails(userId);
    }
  }

  getUserDetails(userId: number): void {
    this.isLoading = true;
    
    this.enrollService.getEnrollmentDetails(userId).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res?.status?.success) {
          this.userDetails = res.details;
          console.log('User details loaded:', this.userDetails);
        } else {
          console.error('Failed to load user details:', res?.status?.message);
          this.toastr.error('Failed to load user details', 'Error');
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Failed to load user details:', err);
        this.handleApiError(err);
      }
    });
  }

  // Action methods
  viewDetails(user: any): void {
    console.log('View details for:', user);
    this.enrollService.getEnrollmentDetails(user.id).subscribe({
      next: (res) => {
        if (res?.status?.success) {
          this.toastr.info(`Viewing details for ${user.full_name}`, 'Info');
          // You can open a modal or navigate to details page here
        } else {
          this.toastr.error('Failed to load details', 'Error');
        }
      },
      error: (err) => {
        console.error('Failed to load enrollment details:', err);
        this.handleApiError(err);
      }
    });
    this.activeActionDropdown = null;
  }

  allocateCoach(user: any): void {
    console.log('Open coach assignment modal for:', user);
    this.selectedUserForAssignment = user;
    this.isAssignmentModalOpen = true;
  }

  onCloseAssignmentModal(): void {
    this.isAssignmentModalOpen = false;
    this.selectedUserForAssignment = null;
  }

  onAssignCoach(formData: any): void {
    console.log('Assigning coach with data:', formData);
    
    this.enrollService.allocateCoach(formData).subscribe({
      next: (res) => {
        if (res?.status?.success) {
          this.toastr.success(`Coach allocated for ${this.selectedUserForAssignment.full_name}`, 'Success');
          this.loadCoachData(); // Refresh the list
          this.onCloseAssignmentModal();
          this.expandedUserId = null; // Close the expanded view
        } else {
          this.toastr.error(res?.status?.message || 'Failed to allocate coach', 'Error');
        }
      },
      error: (err) => {
        console.error('Failed to allocate coach:', err);
        this.handleApiError(err);
      }
    });
  }

  removeAllocation(user: any): void {
    console.log('Reject enrollment for:', user);
    
    // Simple confirmation dialog
    const action = user.coach_id ? 'remove coach from' : 'reject application for';
    const confirmed = confirm(`Are you sure you want to ${action} ${user.full_name}?`);
    
    if (!confirmed) {
      return;
    }
    
    // For now, using a default reason. In a real implementation, you might want to show a modal for reason input
    const payload = {
      enroll_id: user.id,
      reason: user.coach_id ? 'Coach removed by admin' : 'Application rejected by admin'
    };
    
    this.enrollService.rejectCoachEnrollment(payload).subscribe({
      next: (res) => {
        if (res?.status?.success) {
          const message = user.coach_id ? 
            `Coach removed for ${user.full_name}` : 
            `Application rejected for ${user.full_name}`;
          this.toastr.warning(message, 'Warning');
          this.loadCoachData(); // Refresh the list
          this.expandedUserId = null; // Close the expanded view
        } else {
          this.toastr.error(res?.status?.message || 'Failed to process request', 'Error');
        }
      },
      error: (err) => {
        console.error('Failed to process request:', err);
        this.handleApiError(err);
      }
    });
  }

  // Search functionality
  onSearch(): void {
    this.currentPage = 1;
    this.loadCoachData();
  }

  // Sort functionality
  onSort(sortBy: string): void {
    if (this.sortBy === sortBy) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = sortBy;
      this.sortOrder = 'asc';
    }
    this.loadCoachData();
  }

  // Pagination methods
  onPageSizeChange(): void {
    this.currentPage = 1;
    this.loadCoachData();
  }

  onPageChange(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadCoachData();
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadCoachData();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadCoachData();
    }
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.loadCoachData();
  }

  // Close dropdowns when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.action-dropdown') && !target.closest('.note-popover')) {
      this.activeActionDropdown = null;
      this.activeNotePopover = null;
    }
  }

  // Method to handle API errors with specific status codes
  handleApiError(error: any): void {
    if (error?.status === 401) {
      this.toastr.error('Unauthorized access. Please login again.', 'Error');
    } else if (error?.status === 403) {
      this.toastr.error('Access denied. You do not have permission.', 'Error');
    } else if (error?.status === 404) {
      this.toastr.error('Resource not found.', 'Error');
    } else {
      const message = error?.error?.status?.message || error?.error?.message || 'An error occurred';
      this.toastr.error(message, 'Error');
    }
  }
}
