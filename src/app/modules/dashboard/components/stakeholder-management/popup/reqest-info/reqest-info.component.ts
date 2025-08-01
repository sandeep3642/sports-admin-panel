import { Component, ViewEncapsulation } from '@angular/core';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import {ChangeDetectionStrategy, inject} from '@angular/core';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import { ButtonComponent } from 'src/app/shared/components/button/button.component';
import {provideNativeDateAdapter} from '@angular/material/core';
import { ApplicationRejectionComponent } from '../application-rejection/application-rejection.component';

@Component({
  selector: 'app-reqest-info',
  templateUrl: './reqest-info.component.html',
  styleUrl: './reqest-info.component.css',
  standalone: true,
   providers: [provideNativeDateAdapter()],
  imports: [MatDialogModule,MatButtonModule,MatDatepickerModule,MatFormFieldModule,ButtonComponent,MatInputModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReqestInfoComponent {
    readonly dialog = inject(MatDialog);

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

}
