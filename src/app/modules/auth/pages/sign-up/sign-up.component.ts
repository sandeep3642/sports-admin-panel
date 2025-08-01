import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { ButtonComponent } from 'src/app/shared/components/button/button.component';
import { CommonModule, NgClass, NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { SigninService } from 'src/app/core/services/signin.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css'],
  imports: [FormsModule, ReactiveFormsModule,CommonModule, RouterLink, AngularSvgIconModule, ButtonComponent],
})

export class SignUpComponent implements OnInit {
  signupForm!: FormGroup;
  submitted = false;
  passwordTextType = false;
  passwordTextTypeone = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    public signinService:SigninService,
    private toastr: ToastrService,
  ) { }

  ngOnInit(): void {
    this.signupForm = this.fb.group({
      full_name: ['', Validators.required],
      user_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmpassword: ['', Validators.required],
    }, {
      validator: this.passwordMatchValidator
    });
  }

  // Easy access to form controls
  get f(): { [key: string]: AbstractControl } {
    return this.signupForm.controls;
  }

  // Custom validator to check if passwords match
  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirm = form.get('confirmpassword')?.value;
    if (password !== confirm) {
      form.get('confirmpassword')?.setErrors({ mismatch: true });
    } else {
      form.get('confirmpassword')?.setErrors(null);
    }
    return null;
  }

  // onSubmit(): void {    
  //   this.submitted = true;

  //   if (this.signupForm.invalid) {
  //     return;
  //   }

  //   const formData = this.signupForm.value;

  //   this.http.post('https://your-api-url.com/signup', formData).subscribe({
  //     next: () => {
  //       alert('Registration successful');
  //       this.router.navigate(['/dashboard/stakeholder-management']);
  //     },
  //     error: err => {
  //       console.error('Signup error:', err);
  //       alert('Something went wrong during signup');
  //     }
  //   });
  // }

  onSubmit(): void {
    this.submitted = true;
    if (this.signupForm.invalid) return;
    localStorage.setItem('verifiedOtpEmail', this.signupForm.get('email')?.value);
    this.signinService.signup(this.signupForm.value).subscribe({
      next: (res) => {
        if(res.status.success){
          this.toastr.success(res.status?.message, 'Success');
          this.router.navigate(['/auth/verify-code']);
        }
        console.log('signup successful:', res);
        // Redirect, store token, etc.
      },
      error: (err) => {
        console.error('signup failed:', err);
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
