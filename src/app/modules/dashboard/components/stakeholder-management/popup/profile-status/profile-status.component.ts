import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { ButtonComponent } from 'src/app/shared/components/button/button.component';
import { StackholderService } from 'src/app/core/services/stackholder.service';

export interface ProfileStatusData {
  status: 'approved' | 'rejected';
  details: any;
}

@Component({
  selector: 'app-profile-status',
  templateUrl: './profile-status.component.html',
  styleUrl: './profile-status.component.css',
  standalone: true,
  imports: [MatDialogModule, CommonModule, MatButtonModule, MatDatepickerModule, MatFormFieldModule, MatInputModule, AngularSvgIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileStatusComponent {
  stakeDetails: any;

  constructor(
    public stackholderService: StackholderService,
    private dialogRef: MatDialogRef<ProfileStatusComponent>,
    private router: Router,
    @Inject(MAT_DIALOG_DATA) public data: ProfileStatusData
  ) {
  }

  ngOnInit(): void {
    console.log("Dialog Data:", this.data);
    this.stakeDetails = this?.data?.details
  }

  getStakeDetails(expandedUserId): void {
    const payload = {
      customer_id: expandedUserId,
    };
    this.stackholderService.getDetails(payload).subscribe({
      next: (res) => {
        this.stakeDetails = res.data;
        console.log('Stake Details:', this.stakeDetails);
      },
      error: (err) => {
        console.error('Failed to fetch list:', err);
      },
    });
  }

  reviewMore() {
    this.dialogRef.close();
  }

  goToDashboard() {
    this.dialogRef.close();
    this.router.navigate(['/dashboard']);
  }

  // Exact same methods as stakeholder table component

  /**
   * Get the current profile step count (0/2, 1/2, or 2/2)
   */
  getProfileStepCount(profileStatus: any): string {
    if (!profileStatus) return '0';
    
    // If approved, show 2/2
    if (profileStatus.approved?.is_active) {
      return '2';
    }
    
    // If rejected, show the step where it was rejected
    if (profileStatus.rejected?.is_active) {
      // If under_review exists and was active, it means it reached review stage
      if (profileStatus.under_review) {
        return '1'; // Rejected at review stage
      }
      return '0'; // Rejected at initial stage
    }
    
    // If under review, show 1
    if (profileStatus.under_review?.is_active) {
      return '1';
    }
    
    // If only enrolled, show 0
    if (profileStatus.enrolled?.is_active) {
      return '0';
    }
    
    return '0';
  }

  /**
   * Get the CSS class for step icons based on profile status
   */
  getStepIconClass(profileStatus: any, step: number): string {
    const currentStep = parseInt(this.getProfileStepCount(profileStatus));
    const isRejected = profileStatus?.rejected?.is_active;
    
    if (step === 1) {
      // Step 1 is always completed (green) since profile is created
      return 'bg-green-600';
    }
    
    if (step === 2) {
      if (isRejected && currentStep >= 1) {
        return 'bg-red-500'; // Red for rejected at this stage or later
      } else if (currentStep >= 1) {
        return 'bg-green-600'; // Green if reached or passed this step
      } else {
        return 'bg-orange-400'; // Orange for pending
      }
    }
    
    if (step === 3) {
      if (isRejected && currentStep >= 2) {
        return 'bg-red-500'; // Red for rejected at final stage
      } else if (currentStep >= 2) {
        return 'bg-green-600'; // Green if approved (step 2 completed)
      } else {
        return 'bg-orange-400'; // Orange for pending
      }
    }
    
    return 'bg-gray-400';
  }

  /**
   * Get the icon HTML for each step
   */
  getStepIcon(profileStatus: any, step: number): string {
    const currentStep = parseInt(this.getProfileStepCount(profileStatus));
    const isRejected = profileStatus?.rejected?.is_active;
    
    if (step === 1) {
      // Step 1 is always completed (checkmark)
      return '✓';
    }
    
    if (step === 2) {
      if (isRejected && currentStep >= 1) {
        return '✕'; // Cross for rejected
      } else if (currentStep >= 1) {
        return '✓'; // Checkmark if completed
      } else {
        return '!'; // Exclamation for pending
      }
    }
    
    if (step === 3) {
      if (isRejected && currentStep >= 2) {
        return '✕'; // Cross for rejected
      } else if (currentStep >= 2) {
        return '✓'; // Checkmark if approved
      } else {
        return '!'; // Exclamation for pending
      }
    }
    
    return '!';
  }

  /**
   * Get the progress line CSS class
   */
  getProgressLineClass(profileStatus: any): string {
    const isRejected = profileStatus?.rejected?.is_active;
    const isApproved = profileStatus?.approved?.is_active;
    
    if (isRejected) {
      return 'bg-red-500'; // Red line for rejected
    } else if (isApproved) {
      return 'bg-green-600'; // Green line for approved
    } else {
      return 'bg-orange-500'; // Orange line for in progress
    }
  }

  /**
   * Get the number of active steps
   */
  getActiveStepCount(statusObj: any): number {
    return parseInt(this.getProfileStepCount(statusObj));
  }

  /**
   * Get total number of steps (always 2 as per requirement)
   */
  getTotalStepCount(statusObj: any): number {
    return 2; // Always 2 as per your requirement
  }

  /**
   * Check if profile has reached final status
   */
  isFinalStatus(): boolean {
    return this.stakeDetails?.profile_status?.approved?.is_active || 
           this.stakeDetails?.profile_status?.rejected?.is_active;
  }
}