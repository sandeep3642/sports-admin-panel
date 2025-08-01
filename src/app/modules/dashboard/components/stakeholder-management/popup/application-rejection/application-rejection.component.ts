import { Component, ViewEncapsulation } from '@angular/core';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import {ChangeDetectionStrategy, inject} from '@angular/core';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import { ButtonComponent } from 'src/app/shared/components/button/button.component';
import {provideNativeDateAdapter} from '@angular/material/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-application-rejection',
  templateUrl: './application-rejection.component.html',
  styleUrl: './application-rejection.component.css',
  standalone: true,
   providers: [provideNativeDateAdapter()],
  imports: [MatDialogModule,MatButtonModule,MatDatepickerModule,MatFormFieldModule,ButtonComponent,MatInputModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApplicationRejectionComponent {
  form: FormGroup;
  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ApplicationRejectionComponent>
  ) {
    this.form = this.fb.group({
      description: ['']
    });
  }

  submit() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value.description);
    }
  }
}
