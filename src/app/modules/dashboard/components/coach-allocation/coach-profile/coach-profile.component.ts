import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, Location, NgFor, NgIf } from '@angular/common';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { DocumentViewComponent } from '../../stakeholder-management/popup/document-view/document-view.component';
import { ApplicationRejectionComponent } from '../../stakeholder-management/popup/application-rejection/application-rejection.component';
import { FinancialService } from 'src/app/core/services/financial.service';
import { ButtonComponent } from 'src/app/shared/components/button/button.component';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { EnrollService } from 'src/app/core/services/enroll.service';
interface ProfileStatusEntry {
  key: string;
  label: string;
  is_active: boolean;
  // Add other fields if needed
}
@Component({
  selector: 'app-coach-profile',
  templateUrl: './coach-profile.component.html',
  styleUrl: './coach-profile.component.css',
  imports: [CommonModule, AngularSvgIconModule,MatButtonModule],
})

export class CoachProfileComponent implements OnInit {
  public enroll: any;
  defaultImg = '../../../../../assets/avatars/user.png'

  constructor(
    private route: ActivatedRoute,
    private financialService: FinancialService,
    private location: Location,
    private router: Router,
    private enrollService: EnrollService,
    private dialog: MatDialog,
    private toastr: ToastrService
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const enroll_id = params.get('id');
        this.enrollService.getDetails({ enroll_id: enroll_id }).subscribe(res => {
          this.enroll = res.details;
        });
    });
  }

  mapSteps(statuses: any[], approverDetails: any): any[] {
    const stepLabels: any = {
      enrolled: "Application Submitted",
      approver_1: "1st Step Verification",
      approver_2: "2nd Step Verification",
      approver_3: "3rd Step Verification",
      approver_4: "4th Step Verification"
    };
  
    return statuses.map((s, idx) => {
      // map status to step
      const label = stepLabels[s.key] || stepLabels[s.access_level] || s.label;
  
      // get approver info if exists
      const approverInfo = s.access_level ? approverDetails[s.access_level] : null;
  
      return {
        order: idx + 1,
        key: s.key,
        label: label,
        is_active: s.is_active,
        date: s.date || approverInfo?.approval_date || null,
        approver_name: approverInfo?.approver_name || null,
        approver_email: approverInfo?.approver_email || null,
        description: approverInfo?.description || s.description
      };
    });
  }
  

  goBack() {
    this.router.navigate(['/dashboard/coach-allocation']);
  }

  downloadFile(cert: any) {
    if (!cert?.url) return;
    window.open(cert.url, '_blank');

    // Trigger the download
    const link = document.createElement('a');
    link.href = cert.url;
    link.target = '_blank';
    link.download = (cert.document_type || 'document') + '.pdf';
    document.body.appendChild(link);
    link.click();
  }

  viewFullProfile(userId: number | string | null) {
    if (userId) {
      this.router.navigate(['/dashboard/stakeholder-profile', userId]);
    }
  }

  openCertificateDialog(cert: any, index: number) {
    this.dialog.open(DocumentViewComponent, {
      height: '665px',
      width: '944px',
      maxWidth: '95vw',
      position: {
        top: '120px'
      },
      panelClass: 'custom-dialog-top-center',
      backdropClass: 'blurred-backdrop1',
      data: {
        certificate: cert,
        certificates: this.enroll?.certificates || [],
        index: index
      }
    });
  }

  approveProfile(enroll) {
    if (!this.enroll?.id) return;
    const payload = {
      customer_id: enroll?.customer_id,
      status_type: 'approved',
      enroll_id:enroll?.id
    };
    this.financialService.updateProfileStatus(payload).subscribe({
      next: (response) => {
        this.toastr.success(response.status?.message, 'Success');
        // Optionally refresh user details here
      },
      error: (err) => {
        this.toastr.error('Failed to approve profile.');
        console.error(err);
      }
    });
  }
  // Component method to extract all achievements from documents
  getAllAchievements(): any[] {
    if (!this.enroll?.documents) {
      return [];
    }

    const allAchievements: any[] = [];

    this.enroll.documents.forEach(doc => {
      if (doc.achievements && doc.achievements.length > 0) {
        doc.achievements.forEach((achievement: string) => {
          if (achievement.trim() !== '') {
            allAchievements.push({
              text: achievement,
              documentType: doc.document_type,
              documentTitle: doc.document_type,
              isApproved: doc.is_approved
            });
          }
        });
      }
    });

    return allAchievements;
  }
  // Add this method to your component class

 getActiveProfileStatus(): ProfileStatusEntry | null {
  if (!this.enroll?.profile_status) return null;

  const statuses = this.enroll.profile_status;

  for (const [key, statusObj] of Object.entries(statuses)) {
    const typedStatus = statusObj as ProfileStatusEntry;
    if (typedStatus?.is_active === true) {
      return { ...typedStatus, key };  // Attach `key` manually
    }
  }

  return null;
}

formatDuration(val: string): string {
  if (!val) return '--';

  const match = val.match(/(\d+)_(\d+)hr/);
  if (match) {
    const hours = parseInt(match[1], 10);
    const half = parseInt(match[2], 10);
    return half === 5 ? `${hours} hr 30 min` : `${hours} hr`;
  }

  return val;
}


  rejectProfile(enroll) {
    console.log("enroll",enroll);
    
    if (!this.enroll?.id) return;
    const dialogRef = this.dialog.open(ApplicationRejectionComponent, {
      height: '305px',
      width: '580px',
      position: { top: '120px' },
      panelClass: 'custom-dialog-top-center',
      backdropClass: 'blurred-backdrop1'
    });
    dialogRef.afterClosed().subscribe((description: string) => {
      if (description) {
        const payload = {
          customer_id: enroll?.customer_id,
          status_type: 'declined',
          reason: description,
          enroll_id:enroll?.id
        };
        this.financialService.updateProfileStatus(payload).subscribe({
          next: (response) => {
            this.toastr.success(response.status?.message, 'Success');
            // Optionally refresh user details here
          },
          error: (err) => {
            this.toastr.error('Failed to reject profile.');
            console.error(err);
          }
        });
      }
    });
  }

  getProgressLineClass(profileStatus: any): string {
    const isRejected = profileStatus?.rejected?.is_active;
    const isApproved = profileStatus?.approved?.is_active;
    
    if (isRejected) {
      return 'bg-red-500'; // Pink line for rejected
    } else if (isApproved) {
      return 'bg-green-600'; // Green line for approved
    } else {
      return 'bg-orange-500'; // Orange line for in progress
    }
  }

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

  getStepIconClass(profileStatus: any, step: number): string {
    const currentStep = parseInt(this.getProfileStepCount(profileStatus));
    const isRejected = profileStatus?.rejected?.is_active;
    
    if (step === 1) {
      // Step 1 is always completed (green) since profile is created
      return 'bg-green-600';
    }
    
    if (step === 2) {
      if (isRejected && currentStep >= 1) {
        return 'bg-red-500'; // Pink for rejected at this stage or later
      } else if (currentStep >= 1) {
        return 'bg-green-600'; // Green if reached or passed this step
      } else {
        return 'bg-orange-400'; // Gray for pending
      }
    }
    
    if (step === 3) {
      if (isRejected && currentStep >= 2) {
        return 'bg-red-500'; // Pink for rejected at final stage
      } else if (currentStep >= 2) {
        return 'bg-green-600'; // Green if approved (step 2 completed)
      } else {
        return 'bg-orange-400'; // Gray for pending
      }
    }
    
    return 'bg-gray-400';
  }
  
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
}
