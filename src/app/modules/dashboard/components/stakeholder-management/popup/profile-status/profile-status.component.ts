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

export interface ProfileStatusData {
  status: 'approved' | 'rejected';
}

@Component({
  selector: 'app-profile-status',
  templateUrl: './profile-status.component.html',
  styleUrl: './profile-status.component.css',
  standalone: true,
  imports: [MatDialogModule,CommonModule, MatButtonModule, MatDatepickerModule, MatFormFieldModule, ButtonComponent, MatInputModule, AngularSvgIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileStatusComponent {
  constructor(
    private dialogRef: MatDialogRef<ProfileStatusComponent>,
    private router: Router,
    @Inject(MAT_DIALOG_DATA) public data: ProfileStatusData
  ) {
    console.log("data>>>>>>>>>>>",data.status);
    
  }

  reviewMore() {
    this.dialogRef.close();
  }

  goToDashboard() {
    this.dialogRef.close();
    this.router.navigate(['/dashboard']);
  }
}
