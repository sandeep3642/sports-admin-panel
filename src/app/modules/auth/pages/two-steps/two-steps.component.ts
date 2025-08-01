import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SigninService } from 'src/app/core/services/signin.service';
import { ButtonComponent } from 'src/app/shared/components/button/button.component';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-two-steps',
  templateUrl: './two-steps.component.html',
  styleUrls: ['./two-steps.component.css'],
  imports: [FormsModule, ReactiveFormsModule, CommonModule, RouterLink, ButtonComponent],
})
export class TwoStepsComponent implements OnInit {
  verifyForm!: FormGroup;
  submitted = false;
  currentStep: any;

  constructor(private fb: FormBuilder, private toastr: ToastrService, private route: ActivatedRoute,
    public signinService: SigninService,
    private router: Router) { }

  ngOnInit(): void {
    this.verifyForm = this.fb.group({
      code: ['', Validators.required]
    });
    this.route.url.subscribe(urlSegment => {
      this.currentStep = urlSegment.map(segment => segment.path).join('/');
    });

  }

  get f() {
    return this.verifyForm.controls;
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.verifyForm.invalid) return;

    // Declare email outside
    let email = '';
    if (this.currentStep === 'verify-code') {
      email = localStorage.getItem('verifiedOtpEmail') || '';
    } else {
      email = localStorage.getItem('verifiedEmail') || '';
    }

    const payload: { email: string; otp: string } = {
      email: email,
      otp: this.verifyForm.value.code
    };

    this.signinService.verifyCode(payload).subscribe({
      next: (res) => {
        console.log('Code verified:', res);
    
        if (res?.status?.success) {
          this.toastr.success(res.status.message || 'Verification successful', 'Success');
    
          if (this.currentStep === 'verify-code') {
            this.router.navigate(['/auth/sign-in']);
          } else {
            this.router.navigate(['/auth/new-password']);
          }
        } else {
          this.toastr.error(res.status.message || 'Verification failed', 'Error');
        }
      },
      error: (err) => {
        console.error('Code verification failed:', err);
        this.toastr.error(err.error?.status?.message || 'Server error occurred.', 'Error');
      }
    });
    
    
  }

}
