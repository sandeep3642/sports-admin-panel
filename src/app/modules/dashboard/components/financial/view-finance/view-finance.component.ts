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
interface ProfileStatusEntry {
  key: string;
  label: string;
  is_active: boolean;
  // Add other fields if needed
}
@Component({
  selector: 'app-view-finance',
  standalone: true,
  imports: [CommonModule, AngularSvgIconModule,MatButtonModule, ButtonComponent],
  templateUrl: './view-finance.component.html',
  styleUrl: './view-finance.component.css'
})

export class ViewFinanceComponent implements OnInit {
  public grant: any;
  defaultImg = '../../../../../assets/avatars/user.png'

  // Flattened documents for rendering
  public submittedDocuments: { type: string; label: string; file: string }[] = [];
  public totalSubmittedFiles = 0;

  constructor(
    private route: ActivatedRoute,
    private financialService: FinancialService,
    private location: Location,
    private router: Router,
    private dialog: MatDialog,
    private toastr: ToastrService
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const grant_id = params.get('id');
        this.financialService.getDetails({ grant_id: grant_id }).subscribe(res => {
          this.grant = res.details;
          this.prepareSubmittedDocuments(this.grant);
        });
    });
  }

  private prepareSubmittedDocuments(grant: any): void {
    this.submittedDocuments = [];
    this.totalSubmittedFiles = 0;

    const docs = grant?.documents_submitted;
    if (Array.isArray(docs)) {
      docs.forEach((group: any) => {
        const files: string[] = group?.files || [];
        const label = this.mapDocumentTypeToLabel(group?.type);
        files.forEach((fileUrl: string) => {
          if (fileUrl && typeof fileUrl === 'string') {
            this.submittedDocuments.push({ type: group?.type, label, file: fileUrl });
          }
        });
      });
      this.totalSubmittedFiles = this.submittedDocuments.length;
    }
  }

  private mapDocumentTypeToLabel(type: string): string {
    if (!type) return 'Document';
    const map: Record<string, string> = {
      proof_of_residency: 'Aadhar Card',
      cv_and_resume: 'Sports Bio Data',
      sports_certificates_awards: 'Sport Certificate',
      fitness_assessment: 'Fitness Assessment',
      insurance_policy: 'Insurance Policy',
      training_schedule: 'Training Schedule',
      financial_documents: 'Financial Documents'
    };
    return map[type] || type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
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
    this.router.navigate(['/dashboard/financial-assistance']);
  }

  refreshGrantDetails() {
    if (this.grant?.id) {
      this.financialService.getDetails({ grant_id: this.grant.id }).subscribe(res => {
        this.grant = res.details;
        console.log("Refreshed grant details:", this.grant);
        this.prepareSubmittedDocuments(this.grant);
      });
    }
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    // Set a fallback image when the document image fails to load
    target.src = '/assets/images/preview.png';
  }

  isImageFile(fileUrl: string): boolean {
    if (!fileUrl) return false;
    const extension = fileUrl.split('.').pop()?.toLowerCase() || '';
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension);
  }

  onImageLoad(event: Event): void {
    const target = event.target as HTMLImageElement;
    target.style.opacity = '1';
  }

  downloadFile(cert: any) {
    const fileUrl = typeof cert === 'string' ? cert : cert?.file;
    if (!fileUrl) return;
    window.open(fileUrl, '_blank');

    // Trigger the download
    const link = document.createElement('a');
    link.href = fileUrl;
    link.target = '_blank';
    link.download = (cert?.title || cert?.name || 'document');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  viewFullProfile(userId: number | string | null) {
    if (userId) {
      this.router.navigate(['/dashboard/stakeholder-profile', userId]);
    }
  }

  openCertificateDialog(cert: any, index: number) {
    const certificate = typeof cert === 'string' ? { file: cert, title: 'Document' } : cert;
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
        certificate: certificate,
        certificates: this.submittedDocuments.map(d => ({ file: d.file, title: d.label })),
        index: index
      }
    });
  }

  approveProfile(grant) {
    if (!this.grant?.id) return;
    const payload = {
      customer_id: grant?.customer_id,
      status_type: 'approved',
      grant_id:grant?.id
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
    if (!this.grant?.documents) {
      return [];
    }

    const allAchievements: any[] = [];

    this.grant.documents.forEach(doc => {
      if (doc.achievements && doc.achievements.length > 0) {
        doc.achievements.forEach((achievement: string) => {
          if (achievement.trim() !== '') {
            allAchievements.push({
              text: achievement,
              documentType: doc.document_type,
              documentTitle: doc.title,
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
  if (!this.grant?.profile_status) return null;

  const statuses = this.grant.profile_status;

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


  rejectProfile(grant) {
    console.log("grant",grant);
    
    if (!this.grant?.id) return;
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
          customer_id: grant?.customer_id,
          status_type: 'declined',
          reason: description,
          grant_id:grant?.id
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
    // Check if full_access status_type is approved - if yes, all steps should be green
    const isFullAccessApproved = this.grant?.approver_details?.full_access?.status_type === 'approved';
    
    if (isFullAccessApproved) {
      return 'bg-green-600'; // All steps green if full_access is approved
    }
    
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
    
    if (step === 3 || step === 4) {
      if (isRejected && currentStep >= 2) {
        return 'bg-red-500'; // Pink for rejected at final stage
      } else if (currentStep >= 2) {
        return 'bg-green-600' ; // Green if approved (step 2 completed)
      } else {
        return 'bg-orange-400'; // Gray for pending
      }
    }
    
    return 'bg-gray-400';
  }
  
  getStepIcon(profileStatus: any, step: number): string {
    // Check if full_access status_type is approved - if yes, all steps should show checkmark
    const isFullAccessApproved = this.grant?.approver_details?.full_access?.status_type === 'approved';
    
    if (isFullAccessApproved) {
      return '✓'; // All steps show checkmark if full_access is approved
    }
    
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
    
    if (step === 3 || step === 4) {
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
