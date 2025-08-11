import { CommonModule } from '@angular/common';
import { Component, OnInit, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { ToastrService } from 'ngx-toastr';
import { RoleService } from 'src/app/core/services/role.service';

@Component({
  selector: 'app-manage-role',
  imports: [FormsModule, CommonModule, ReactiveFormsModule, NgSelectModule],
  templateUrl: './manage-role.component.html',
  styleUrl: './manage-role.component.css'
})
export class ManageRoleComponent implements OnInit {
  modulesData: any = {

  };
  deselectAll: boolean = false;
  roleDetails: any;
  roleName: any;
  selectedSports: string[] = [];
  accessLevel:any;
  selectedLocations: string[] = [];
  rolelist: any;
  dropdownList: any;
  modules: any[] = [];
  selectedModule: any = null;
  permissionForm!: FormGroup;
  ID: any;
  levels:any;
  selectedTab: string = ''; // or null if you prefer
  // permissionStates: { [moduleKey: string]: { [permission: string]: boolean } } = {};
  permissionStates: { [key: string]: { [permission: string]: boolean } } = {};
  accessLevels: { [key: string]: string } = {};
  constructor(private fb: FormBuilder, private route: ActivatedRoute, private toastr: ToastrService, public roleService: RoleService, private router: Router) {
    // Initialize permission toggles
    this.modules.forEach((mod) => {
      this.permissionStates[mod.key] = {};
      mod.permissions.forEach((perm) => {
        this.permissionStates[mod.key][perm] = true;
      });
    });
  }

  ngOnInit(): void {
    // Convert object to array
    this.getModule();
    this.getdropdown();
    this.getRoleList();
    this.selectedTab = this.modules[0]?.key;
    this.route.params.subscribe(params => {
      this.ID = +params['id'];
    });
    if (this.ID) {
      let payload = {
        id: this.ID
      }
      this.roleService.getDetails(payload).subscribe({
        next: (res) => {
          const data = res.data;
          // this.roleStatus = data.status;
          this.selectedSports = data.sports_allowed;
          this.selectedSports = this.dropdownList.sports
            .filter(item => data.sports_allowed.includes(item.value))
            .map(item => item.value);
          this.selectedLocations = data.location_allowed;
          this.accessLevel = data.access_level;
          this.permissionStates = data.permissions; // map this properly based on your logic
          this.roleName = data.id;
        },
        error: (err) => {
          console.error('Failed to fetch role details:', err);
        }
      });
    }
    this.getLevels('customer_management');
    this.buildForm();


  }

  getRoleList(): void {
    const payload = {};
    this.roleService.getRoleList(payload).subscribe({
      next: (res) => {
        this.rolelist = res.data?.roles;
      },
      error: (err) => {
        console.error('Failed to fetch list:', err);
      }
    });
  }



  buildForm() {
    const group: any = {};
    this.selectedModule.permissions.forEach((perm: string) => {
      group[perm] = [false];
    });
  }

  onModuleSelect(module: any) {
    this.selectedModule = module;
    this.buildForm();
  }

  toggleAllPermissions(event: any) {
    const checked = event.target.checked;
    Object.keys(this.permissionForm.controls).forEach(key => {
      this.permissionForm.get(key)?.setValue(checked);
    });
  }


  getPermissionDescription(permission: string): string {
    switch (permission) {
      case 'display':
        return 'Allow users to see the module icon in the navigation bar.';
      case 'read':
        return 'Allow users to view the module.';
      case 'create':
        return 'Allow users to create items in the module.';
      case 'delete':
        return 'Allow users to delete items in the module.';
      default:
        return '';
    }
  }

  onAccessLevelChange(moduleKey: string, level: string): void {
    this.accessLevels[moduleKey] = level;
}

  goBack() {
    this.router.navigate(['/dashboard/role-management']);
  }

  getModule(): void {
    this.roleService.getModule().subscribe({
      next: (res) => {
        this.modulesData = res.data;
        this.modules = Object.values(this.modulesData);
        console.log(" this.modules ", JSON.stringify(this.modules));

        // ✅ Set default selectedTab after modules are fetched
        if (this.modules.length > 0) {
          this.selectedTab = this.modules[0].key;
        }
      },
      error: (err) => {
        console.error('Failed to fetch list:', err);
      }
    });
  }

  getdropdown(): void {
    let payload = {
      districts: true,
      sports: true,
    }
    this.roleService.dropDowns(payload).subscribe({
      next: (res) => {
        this.dropdownList = res.data;
      },
      error: (err) => {
        console.error('Failed to fetch list:', err);
      }
    });
  }

  getLevels(selectedTab): void {
    let payload = {
      key: selectedTab
    }
    this.roleService.getLevel(payload).subscribe({
      next: (res) => {
        this.levels = res.data?.options[0]?.available_levels;
      },
      error: (err) => {
        console.error('Failed to fetch list:', err);
      }
    });
  }
  
  onTabChange(key: string): void {
    this.selectedTab = key;
    this.getLevels(this.selectedTab)
  }


  get selectedModuleLabel(): string {
    const selected = this.modules.find((m) => m.key === this.selectedTab);
    return selected?.label || '';
  }


  get selectedModulePermissions(): string[] {
    const selected = this.modules?.find((m) => m.key === this.selectedTab);
    if (selected && !this.permissionStates[selected.key]) {
      // Initialize permission states if missing
      this.permissionStates[selected.key] = {};
      selected.permissions.forEach(perm => {
        if (this.permissionStates[selected.key][perm] === undefined) {
          this.permissionStates[selected.key][perm] = false;
        }
      });
    }
    return selected?.permissions || [];
  }
  getEnabledPermissions(moduleKey: string): string[] {
    const modulePermissions = this.permissionStates[moduleKey] || {};
    return Object.keys(modulePermissions).filter((perm) => modulePermissions[perm]);
  }

  getLevel(moduleKey: string): string {
    // Example: dynamically return level
    if (moduleKey === 'stakeholder_management') {
      return 'Approver 1';
    }
    return 'N/A';
  }


  onPermissionChange(permission: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    const isChecked = input.checked;

    if (!this.permissionStates[this.selectedTab]) {
      this.permissionStates[this.selectedTab] = {};
    }

    this.permissionStates[this.selectedTab][permission] = isChecked;
  }

  saveConfiguration() {
    const payload: any = {
      role_id: this.roleName,
      status: 'active',
      sports_allowed: this.selectedSports,
      location_allowed: this.selectedLocations,
      permissions: this.permissionStates,
      access_level: this.accessLevels,
    };
  
    console.log('Payload to save:', payload);
  
    // Update mode
    if (this.ID) {
      const updatePayload = { ...payload, id: this.ID };
  
      this.roleService.updateRole(updatePayload).subscribe({
        next: (res) => {
          this.toastr.success(res?.status?.message || 'Role updated successfully.', 'Success');
          this.goBack();
        },
        error: (err) => {
          this.toastr.error(err?.error?.message || 'Failed to update role', 'Error');
          console.error('Update failed:', err);
        }
      });
  
    } else {
      // Create mode
      this.roleService.saveRole(payload).subscribe({
        next: (res) => {
          this.toastr.success(res?.status?.message || 'Role created successfully.', 'Success');
          this.goBack();
        },
        error: (err) => {
          this.toastr.error(err?.error?.message || 'Failed to create role', 'Error');
          console.error('Create failed:', err);
        }
      });
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['deselectAll']) {
      this.handleDeselectAll();
    }
  }
  
  handleDeselectAll() {
    if (!this.selectedTab || !this.permissionStates[this.selectedTab]) return;
  
    const newValue = !this.deselectAll; // toggle logic (if deselectAll = true, set all false)
  
    for (const perm of this.selectedModulePermissions) {
      this.permissionStates[this.selectedTab][perm] = !this.deselectAll;
    }
  }

  permissionDescriptions: { [key: string]: string } = {
    read: 'This permission will allow users to view the module.',
    display:'Allow users to see the module icon in the navigation bar as an accessible button.',
    edit: 'edit content in',
    delete: 'This Permission will allow the user to delete an player profile',
    create: 'This permission allow the users to create new player profile',
    status: 'This permission will allow user to see the verification status',
    verification: 'Allow users to quickly verify player profile details for accuracy.',
    publish:"This permission will allow users to view the module."
    // Add more permission mappings as needed
  };





}

