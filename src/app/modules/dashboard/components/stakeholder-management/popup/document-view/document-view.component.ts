import { Component, ViewEncapsulation, Inject } from '@angular/core';
import {MatDialog, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import {ChangeDetectionStrategy, inject} from '@angular/core';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import { ButtonComponent } from 'src/app/shared/components/button/button.component';
import {provideNativeDateAdapter} from '@angular/material/core';
import { ApplicationRejectionComponent } from '../application-rejection/application-rejection.component';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-document-view',
  templateUrl: './document-view.component.html',
  styleUrl: './document-view.component.css',
  standalone: true,
   providers: [provideNativeDateAdapter()],
  imports: [CommonModule, MatDialogModule,MatButtonModule,MatDatepickerModule,MatFormFieldModule,MatInputModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocumentViewComponent {
    readonly dialog = inject(MatDialog);
    certificate: any;
    certificates: any[] = [];
    currentIndex: number = 0;

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        private dialogRef: MatDialogRef<DocumentViewComponent>
    ) {
        console.log("certificate", this.data);

        if (data) {
            if (Array.isArray(data.certificates) && data.certificates.length) {
                this.certificates = data.certificates;
                this.currentIndex = data.index || 0;
            } else if (data.certificate) {
                this.certificates = [data.certificate];
                this.currentIndex = 0;
            }
            this.certificate = this.certificates[this.currentIndex];
        }

        
    }

    prev() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.certificate = this.certificates[this.currentIndex];
        }
    }

    next() {
        if (this.currentIndex < this.certificates.length - 1) {
            this.currentIndex++;
            this.certificate = this.certificates[this.currentIndex];
        }
    }

    downloadPDF() {
        if (this.certificate && this.certificate.url) {
            const link = document.createElement('a');
            link.href = this.certificate.url;
            link.download = (this.certificate.name || 'certificate') + '.pdf';
            link.click();
        }
    }

    openDialog() {
        // const dialogRef = this.dialog.open(ReqestInfoComponent);

        let dialogRef = this.dialog.open(ApplicationRejectionComponent, {
        height: '303px',
        width: '580px',
         position: {
        top: '120px' // adjust distance from the top as needed
      },panelClass: 'custom-dialog-top-center',
      backdropClass: 'blurred-backdrop1'
    });

        dialogRef.afterClosed().subscribe(result => {
          console.log(`Dialog result: ${result}`);
        });

    }

    onImageError(event: Event) {
        (event.target as HTMLImageElement).src = '/assets/images/certificate-1.png';
    }
}
