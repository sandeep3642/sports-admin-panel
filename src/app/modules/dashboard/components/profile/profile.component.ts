import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StackholderService } from 'src/app/core/services/stackholder.service';
import { CommonModule, Location } from '@angular/common';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { ApplicationRejectionComponent } from '../stakeholder-management/popup/application-rejection/application-rejection.component';
import { ButtonComponent } from 'src/app/shared/components/button/button.component';
import { DocumentViewComponent } from '../stakeholder-management/popup/document-view/document-view.component';

@Component({
  selector: 'app-profile',
  imports: [CommonModule,AngularSvgIconModule,ButtonComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  public user: any;
  defaultImg = '../../../../../assets/avatars/avt-01.jpg'
  
  constructor(
    private route: ActivatedRoute,
    private stackholderService: StackholderService,
    private location: Location,
    private router: Router,
    private dialog: MatDialog,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const userId = params.get('id');
      if (userId) {
        this.stackholderService.getDetails({ customer_id: userId }).subscribe(res => {
          this.user = res.data;
          console.log("this.user",this.user);
          
        });
      }
    });
  }

  goBack() {
    this.router.navigate(['/dashboard/stakeholder-management']);
  }

  downloadFile(cert: any) {
    if (!cert?.file_url) return;
    window.open(cert.file_url, '_blank');

    // Trigger the download
    const link = document.createElement('a');
    link.href = cert.file_url;
    link.target = '_blank';
    link.download = (cert.title || cert.name || 'certificate') + '.pdf';
    document.body.appendChild(link);
    link.click();
  }

  viewFullProfile(userId: number | string | null) {
    if (userId) {
      this.router.navigate(['/dashboard/profile', userId]);
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
        certificates: this.user?.certificates || [],
        index: index
      }
    });
  }

  approveProfile() {
    if (!this.user?.id) return;
    const payload = {
      customer_id: this.user.id,
      status_key: 'approved'
    };
    this.stackholderService.updateProfileStatus(payload).subscribe({
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

  rejectProfile() {
    if (!this.user?.id) return;
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
          customer_id: this.user.id,
          status_key: 'rejected',
          description: description
        };
        this.stackholderService.updateProfileStatus(payload).subscribe({
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

}
