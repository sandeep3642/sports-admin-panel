import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { ButtonComponent } from 'src/app/shared/components/button/button.component';
import { CommonModule, NgClass, NgIf } from '@angular/common';
import { SigninService } from 'src/app/core/services/signin.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-new-password',
  templateUrl: './new-password.component.html',
  styleUrls: ['./new-password.component.css'],
  imports: [FormsModule, ReactiveFormsModule, CommonModule, RouterLink, AngularSvgIconModule, ButtonComponent],
})
export class NewPasswordComponent implements OnInit {

  resetPasswordForm!: FormGroup;
  submitted = false;
  passwordTextType!: boolean;
  passwordTextTypeone!:boolean;

  constructor(private fb: FormBuilder,     private toastr: ToastrService,
  private signinService: SigninService, private router: Router) { }

  ngOnInit() {
    this.resetPasswordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmpassword: ['', Validators.required]
    }, { validators: this.passwordsMatchValidator });
  }

  get f() {
    return this.resetPasswordForm.controls;
  }

  // Custom validator to check if passwords match
  passwordsMatchValidator(group: FormGroup) {
    return group.get('password')?.value === group.get('confirmpassword')?.value
      ? null
      : { mismatch: true };
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.resetPasswordForm.invalid) return;

    const email = localStorage.getItem('resetEmail') || '';

    const payload = {
      new_password: this.resetPasswordForm.value.password
    };

    this.signinService.resetPassword(payload).subscribe({
      next: (res) => {
        this.toastr.success(res.status?.message, 'Success');
        this.router.navigate(['/auth/sign-in']);
      },
      error: (err) => {
        console.error('Password reset failed:', err);
      }
    });
  }

  togglePasswordTextType() {
    this.passwordTextType = !this.passwordTextType;
  }
  togglePasswordTextTypeconfirm() {
    this.passwordTextTypeone = !this.passwordTextTypeone;
  }

}
