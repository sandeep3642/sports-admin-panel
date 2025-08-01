import { NgClass, NgIf } from '@angular/common';
import { HttpClientModule } from '@angular/common/http'; 
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { SigninService } from 'src/app/core/services/signin.service';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css'],
  standalone:true,
  imports: [FormsModule, ReactiveFormsModule,RouterLink, AngularSvgIconModule, NgIf, ButtonComponent, NgClass,HttpClientModule],
})
export class SignInComponent implements OnInit {
  form!: FormGroup;
  submitted = false;
  passwordTextType = false;
  loginError: boolean = false;

  constructor(private router: Router,private fb: FormBuilder,private toastr: ToastrService, public signinService:SigninService) {}

  ngOnInit(): void {

    this.form = this.fb.group({
      user_name: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

   
  }


  get f() {
    return this.form.controls;
  }

  togglePasswordTextType(): void {
    this.passwordTextType = !this.passwordTextType;
  }

  onSubmit(): void {
    this.submitted = true;
    this.loginError = false;
  
    if (this.form.invalid) return;
  
    this.signinService.login(this.form.value).subscribe({
      next: (res) => {
        if (res.status?.success) {
          this.toastr.success(res.status?.message, 'Success');
          localStorage.setItem('authToken', res.token); 
          localStorage.setItem('userEmail', res.details?.email); 
          localStorage.setItem('userName', res.details?.full_name); 
          this.router.navigate(['/dashboard/dashboard']);
        } else {
          this.loginError = true;  // 👈 failed login
        }
      },
      error: (err) => {
        this.toastr.error(err.status?.message, 'Error');
        console.error('Login failed:', err);
        this.loginError = true;  // 👈 failed login
      }
    });
  }
  

}