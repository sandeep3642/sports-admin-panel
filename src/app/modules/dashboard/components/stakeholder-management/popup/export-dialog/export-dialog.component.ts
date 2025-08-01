import { Component, ViewEncapsulation, Inject } from '@angular/core';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import {ChangeDetectionStrategy, inject} from '@angular/core';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import { ButtonComponent } from 'src/app/shared/components/button/button.component';
import {provideNativeDateAdapter} from '@angular/material/core';
import { ApplicationRejectionComponent } from '../application-rejection/application-rejection.component';
import { StackholderService } from 'src/app/core/services/stackholder.service';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-export-dialog',
  templateUrl: './export-dialog.component.html',
  styleUrl: './export-dialog.component.css',
  standalone: true,
   providers: [provideNativeDateAdapter()],
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatDatepickerModule, MatFormFieldModule, ButtonComponent, MatInputModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExportDialogComponent {
    readonly dialog = inject(MatDialog);
    exportType: string = 'excel';
    page: number = 1;
    limit: number = 20;
    all: boolean = false;
    loading: boolean = false;
    pageList: number[] = [];

    constructor(
      private stackholderService: StackholderService,
      @Inject(MAT_DIALOG_DATA) public data: any
    ) {
      if (data && data.page) {
        this.page = data.page;
      }
      if (data && data.pageSize) {
        this.limit = data.pageSize;
      }
      if (data && data.totalItems && data.pageSize) {
        const totalPages = Math.ceil(data.totalItems / data.pageSize);
        this.pageList = Array.from({ length: totalPages }, (_, i) => i + 1);
      }
    }

    onPageChange(event: any) {
      this.page = +event.target.value;
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

    exportCustomers() {
        this.loading = true;
        const payload = {
          export_type: this.exportType,
          page: this.page,
          limit: this.limit,
          filters: {
            search: '',
            customer_type: '',
            sport_type: '',
            level: '',
            district: '',
            experience_year: {},
            profile_status_key: '',
            age_group: []
          },
          all: this.all
        };
        this.stackholderService.exportCustomers(payload).subscribe({
          next: (res: any) => {
            this.loading = false;
            const blob = new Blob([res], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'stakeholders.xlsx';
            a.click();
            window.URL.revokeObjectURL(url);
          },
          error: (err) => {
            this.loading = false;
            alert('Export failed.');
            console.error('Export error:', err);
          }
        });
    }
}
