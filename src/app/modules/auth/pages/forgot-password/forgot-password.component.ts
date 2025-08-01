import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { SigninService } from 'src/app/core/services/signin.service';
import { ButtonComponent } from 'src/app/shared/components/button/button.component';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css'],
  imports: [FormsModule, ReactiveFormsModule, RouterLink, CommonModule,ButtonComponent],
})
export class ForgotPasswordComponent implements OnInit {
  forgotForm!: FormGroup;
  submitted = false;

  constructor(private router: Router,    private toastr: ToastrService,
    private fb: FormBuilder, public signinService:SigninService
    ) {}

  ngOnInit(): void {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  get f() {
    return this.forgotForm.controls;
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.forgotForm.invalid) return;
    const email = this.forgotForm.value.email;
    localStorage.setItem('verifiedEmail', email);
    this.signinService.forgotPassword(this.forgotForm.value).subscribe({
      next: (res) => {
        if (res.status?.success) {
          this.toastr.success(res.status?.message, 'Success');
          this.router.navigate(['/auth/two-steps']);
        } 
      },
      error: (err) => {
        console.error('Error sending reset link', err);
      }
    });
  }
}
