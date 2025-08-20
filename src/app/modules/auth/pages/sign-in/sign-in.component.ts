import { NgClass, NgIf } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { SigninService } from 'src/app/core/services/signin.service';
import { UserPermissionsService } from 'src/app/core/services/user-permissions.service';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { ToastrService } from 'ngx-toastr';
import { PermissionService } from 'src/app/core/services/permission.service';
import { RoleService } from 'src/app/core/services/role.service';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css'],
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, RouterLink, AngularSvgIconModule, NgIf, ButtonComponent, NgClass, HttpClientModule],
})
export class SignInComponent implements OnInit {
  form!: FormGroup;
  submitted = false;
  passwordTextType = false;
  loginError: boolean = false;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private toastr: ToastrService,
    public signinService: SigninService,
    private userPermissionsService: UserPermissionsService,
    private permissionService: PermissionService,
    private roleService: RoleService,
  ) { }

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
          const profileUrl = res.details?.profile_image;
          if (profileUrl) {
            localStorage.setItem('profileImage', profileUrl);
          } else {
            localStorage.removeItem('profileImage');
          }

          // Set user permissions
          if (res.details?.role?.permissions) {
            this.userPermissionsService.setUserPermissions(res.details.role.permissions);
          }

          this.roleService.getAllRoles({}).subscribe(res2 => {              
            if (res2?.details?.user?.role?.permissions) {
              this.permissionService.setPermissions(res2.details.user.role.permissions);                
            }
            if (res2?.details?.user?.role?.access_level) {
              const accessLevel = res2.details.user.role.access_level;
    
              // access level store karo
              this.signinService.setAccessLevel(accessLevel);
    
              // 🔥 Redirect priority based
              const menuItems = [
                { key: 'dashboard', route: '/dashboard/dashboard' },
                { key: 'customer_management', route: '/dashboard/stakeholder-management' },
                { key: 'event_management', route: '/dashboard/event-management' },
                { key: 'user_management', route: '/dashboard/user-management' },
                { key: 'role_management', route: '/dashboard/role-management' },
                { key: 'venue_management', route: '/dashboard/infrastructure-management' },
                { key: 'coach_allocation', route: '/dashboard/coach-allocation' }
              ];
    
              let redirectTo = '/errors/404';
    
              if (accessLevel['dashboard'] && accessLevel['dashboard'] !== 'na') {
                redirectTo = '/dashboard/dashboard';
              } else {
                const firstAllowed = menuItems.find(
                  m => accessLevel[m.key] && accessLevel[m.key] !== 'na'
                );
                if (firstAllowed) {
                  redirectTo = firstAllowed.route;
                }
              }
    
              this.router.navigate([redirectTo]);
            }
          });
        } else {
          this.loginError = true;
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