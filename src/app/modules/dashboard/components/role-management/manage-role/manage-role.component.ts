import { CommonModule } from '@angular/common';
import { Component, OnInit, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { ToastrService } from 'ngx-toastr';
import { RoleService } from 'src/app/core/services/role.service';
import { UnderscoreToSpacePipe } from 'src/app/pipes/underscore-to-space.pipe';

@Component({
  selector: 'app-manage-role',
  imports: [FormsModule, CommonModule, ReactiveFormsModule, NgSelectModule, UnderscoreToSpacePipe],
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
  allLevels: { [key: string]: any[] } = {}; // Store levels for each module
  levelsLoaded: boolean = false; // Flag to prevent multiple API calls
  identification:any;
  selectedTab: string = ''; // or null if you prefer
  // permissionStates: { [moduleKey: string]: { [permission: string]: boolean } } = {};
  permissionStates: { [key: string]: { [permission: string]: boolean } } = {};
  accessLevels: { [key: string]: string } = {};
  pendingRoleData: any = null; // Store role data until dropdown is loaded
  isViewMode: boolean = false; // Flag to control view vs edit mode
  constructor(private fb: FormBuilder, private route: ActivatedRoute, private toastr: ToastrService, public roleService: RoleService, private router: Router) {
    // Initialize permission toggles
    this.modules.forEach((mod) => {
      this.permissionStates[mod.key] = {};
      mod.permissions.forEach((perm) => {
        this.permissionStates[mod.key][perm] = true;
      });
    });
    
    // Reset levels loaded flag
    this.levelsLoaded = false;
  }

  // Reset levels loaded flag (useful for testing or component reset)
  resetLevelsLoaded(): void {
    this.levelsLoaded = false;
    this.allLevels = {};
  }

  ngOnInit(): void {
    // Convert object to array
    this.getModule();
    this.getdropdown();
    this.getRoleList();
    console.log('Calling getAllLevels from ngOnInit');
    this.getAllLevels(); // Fetch all levels in one call
    this.selectedTab = this.modules[0]?.key;
    this.route.params.subscribe(params => {
      this.identification = params?.['identification'];      
      this.ID = +params['id'];
      // Check if we're in view mode (you can add a 'mode' parameter to the route)
      const mode = params['mode'];
      this.isViewMode = mode === 'view';
      console.log('View mode:', this.isViewMode);
    });
    if (this.ID) {
      let payload = {
        id: this.ID
      }
      this.roleService.getDetails(payload).subscribe({
        next: (res) => {
          const data = res.data;
          this.roleDetails = data; // Store the complete role data
          this.roleName = data.id;
          
          // Preserve existing access_level values from API
          if (data.access_level && typeof data.access_level === 'object') {
            this.accessLevels = { ...data.access_level };
          } else {
            // If access_level is not an object, initialize with default values
            this.accessLevels = {};
          }
          
          this.permissionStates = data.permissions; // map this properly based on your logic
          
          // Process sports and locations if dropdown is already loaded
          if (this.dropdownList) {
            this.setSportsAndLocationsFromDropdown();
          }
          
          // Wait for modules to be loaded before initializing
          this.waitForModulesAndInitialize();
        },
        error: (err) => {
          console.error('Failed to fetch role details:', err);
        }
      });
    } else {
      // Initialize all modules for new role creation
      this.waitForModulesAndInitialize();
    }
    this.buildForm();
  }

  // Wait for modules to be loaded and then initialize
  waitForModulesAndInitialize(): void {
    if (this.modules && this.modules.length > 0 && Object.keys(this.allLevels).length > 0 && this.levelsLoaded) {
      this.initializeAllModulesWithExistingData();
    } else {
      // If modules or levels are not loaded yet, wait and retry
      setTimeout(() => {
        this.waitForModulesAndInitialize();
      }, 100);
    }
  }

  // Initialize all modules while preserving existing data
  initializeAllModulesWithExistingData(): void {
    if (this.modules && this.modules.length > 0) {
      this.modules.forEach(module => {
        // Initialize permission states for each module
        if (!this.permissionStates[module.key]) {
          this.permissionStates[module.key] = {};
          module.permissions.forEach(perm => {
            this.permissionStates[module.key][perm] = false;
          });
        }
        
        // Only set default if no existing access level value
        if (!this.accessLevels[module.key]) {
          this.accessLevels[module.key] = 'na'; // Default value for new modules only
        }
        
        // No need to call getLevels since we have all levels stored in allLevels
        // this.getLevels(module.key); // REMOVED - causes multiple API calls
      });
    }
  }

  // Initialize all modules to ensure data persistence
  initializeAllModules(): void {
    if (this.modules && this.modules.length > 0) {
      this.modules.forEach(module => {
        // Initialize permission states for each module
        if (!this.permissionStates[module.key]) {
          this.permissionStates[module.key] = {};
          module.permissions.forEach(perm => {
            this.permissionStates[module.key][perm] = false;
          });
        }
        
        // Initialize access levels for each module (only for new roles)
        if (!this.accessLevels[module.key]) {
          this.accessLevels[module.key] = 'na';
        }
        
        // No need to call getLevels since we have all levels stored in allLevels
        // this.getLevels(module.key); // REMOVED - causes multiple API calls
      });
    }
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
    console.log(`Access level changed for ${moduleKey}: ${level}`);
    console.log(`Previous value: ${this.accessLevels[moduleKey]}`);
    
    // Only update the specific module's access level
    this.accessLevels[moduleKey] = level;
    
    // Ensure the data is preserved
    this.preserveCurrentTabData();
    
    console.log('Current access levels:', this.accessLevels);
    console.log('Updated access level for', moduleKey, ':', this.accessLevels[moduleKey]);
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
          // Initialize all modules after they are loaded
          this.initializeAllModules();
          
          // If we have API data waiting, initialize it now
          if (this.accessLevels && Object.keys(this.accessLevels).length > 0) {
            this.initializeAllModulesWithExistingData();
          }
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
        console.log('Dropdown data loaded:', this.dropdownList);
        
        // If role details are already loaded, set sports and locations
        if (this.roleDetails) {
          this.setSportsAndLocationsFromDropdown();
        }
      },
      error: (err) => {
        console.error('Failed to fetch list:', err);
      }
    });
  }

  setSportsAndLocationsFromDropdown(): void {
    if (this.dropdownList && this.dropdownList.sports && this.roleDetails) {
      // Set sports from API response
      if (this.roleDetails.sports_allowed && Array.isArray(this.roleDetails.sports_allowed)) {
        this.selectedSports = this.roleDetails.sports_allowed;
        console.log('Selected sports set to:', this.selectedSports);
      }
    }
    
    if (this.dropdownList && this.dropdownList.districts && this.roleDetails) {
      // Set locations from API response
      if (this.roleDetails.location_allowed && Array.isArray(this.roleDetails.location_allowed)) {
        this.selectedLocations = this.roleDetails.location_allowed;
        console.log('Selected locations set to:', this.selectedLocations);
      }
    }
  }

  getLevels(selectedTab): void {
    let payload = {
      key: selectedTab
    }
    this.roleService.getLevel(payload).subscribe({
      next: (res) => {
        this.levels = res.data?.options[0]?.available_levels;
        console.log(`Levels for ${selectedTab}:`, this.levels);
        console.log(`Current access level for ${selectedTab}:`, this.accessLevels[selectedTab]);
        
        // Only set default value if no existing value is set
        if (this.levels && this.levels.length > 0 && !this.accessLevels[selectedTab]) {
          // Only set 'na' if there's no existing value at all
          this.accessLevels[selectedTab] = 'na';
        }
        
        console.log(`Final access level for ${selectedTab}:`, this.accessLevels[selectedTab]);
        
        // Force change detection to update the display
        setTimeout(() => {
          console.log(`Levels loaded for ${selectedTab}, current value:`, this.accessLevels[selectedTab]);
          console.log(`Dropdown should display:`, this.accessLevels[selectedTab]);
          // Force dropdown update
          this.forceDropdownUpdate();
        }, 50);
      },
      error: (err) => {
        console.error('Failed to fetch list:', err);
      }
    });
  }
  
  onTabChange(key: string): void {
    // Preserve current tab data before switching
    this.preserveCurrentTabData();
    
    this.selectedTab = key;
    console.log(`Switching to tab: ${key}`);
    console.log(`Current access level for ${key}:`, this.accessLevels[key]);
    
    // Use stored levels instead of making API call
    this.getLevelsFromStorage(this.selectedTab);
    
    // Reset deselect all state for new tab
    this.deselectAll = false;
    
    // Force change detection to update the display
    setTimeout(() => {
      console.log(`Switched to tab: ${key}`);
      console.log(`Current access level for ${key}:`, this.accessLevels[key]);
      console.log(`Available levels:`, this.levels);
      this.forceDropdownUpdate();
    }, 100);
  }

  // Get levels from stored data instead of API call
  getLevelsFromStorage(selectedTab: string): void {
    if (this.allLevels[selectedTab]) {
      this.levels = this.allLevels[selectedTab];
      console.log(`Levels for ${selectedTab} from storage:`, this.levels);
      console.log(`Current access level for ${selectedTab}:`, this.accessLevels[selectedTab]);
      
      // Only set default value if no existing value is set
      if (this.levels && this.levels.length > 0 && !this.accessLevels[selectedTab]) {
        // Only set 'na' if there's no existing value at all
        this.accessLevels[selectedTab] = 'na';
      }
      
      console.log(`Final access level for ${selectedTab}:`, this.accessLevels[selectedTab]);
      
      // Force change detection to update the display
      setTimeout(() => {
        console.log(`Levels loaded for ${selectedTab}, current value:`, this.accessLevels[selectedTab]);
        console.log(`Dropdown should display:`, this.accessLevels[selectedTab]);
        // Force dropdown update
        this.forceDropdownUpdate();
      }, 50);
    } else {
      console.log(`No levels found for ${selectedTab} in storage`);
    }
  }

  // Get current selected value for debugging
  getCurrentSelectedValue(): string {
    if (this.selectedTab && this.accessLevels[this.selectedTab]) {
      return this.accessLevels[this.selectedTab];
    }
    return 'No value selected';
  }

  // Force dropdown to update its display
  forceDropdownUpdate(): void {
    if (this.selectedTab && this.accessLevels[this.selectedTab]) {
      console.log(`Forcing dropdown update for ${this.selectedTab} with value:`, this.accessLevels[this.selectedTab]);
      // Trigger change detection
      setTimeout(() => {
        console.log(`Dropdown should now show:`, this.accessLevels[this.selectedTab]);
        console.log(`Current selected value:`, this.getCurrentSelectedValue());
      }, 50);
    }
  }

  // Preserve current tab data
  preserveCurrentTabData(): void {
    if (this.selectedTab) {
      // Ensure current tab data is saved
      if (!this.permissionStates[this.selectedTab]) {
        this.permissionStates[this.selectedTab] = {};
      }
      
      // Ensure access level is saved
      if (!this.accessLevels[this.selectedTab]) {
        this.accessLevels[this.selectedTab] = '';
      }
    }
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
    // Return the actual selected level value from accessLevels
    const selectedLevel = this.accessLevels[moduleKey];
    if (selectedLevel) {
      return selectedLevel;
    }
    return 'NA';
  }

  // Get display label for selected level
  getLevelDisplayLabel(moduleKey: string): string {
    const selectedLevel = this.accessLevels[moduleKey];
    if (!selectedLevel || selectedLevel === 'na') {
      return 'NA';
    }
    
    // Find the label for the selected value
    if (this.levels) {
      const levelItem = this.levels.find(item => item.value === selectedLevel);
      return levelItem ? levelItem.label : selectedLevel;
    }
    
    return selectedLevel;
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
    // Preserve current tab data before saving
    this.preserveCurrentTabData();
    
    // Ensure all modules are initialized in the payload
    this.initializeAllModules();
    
    // Log selected level values for each module
    console.log('Selected level values for each module:');
    this.modules.forEach(module => {
      console.log(`${module.label}: ${this.accessLevels[module.key] || 'Not selected'}`);
    });
    
    const payload: any = {
      role_id: this.roleName,
      status: 'active',
      sports_allowed: this.selectedSports,
      location_allowed: this.selectedLocations,
      permissions: this.permissionStates,
      access_level: this.accessLevels,
    };
  
    console.log('Payload to save:', payload);
    console.log('All permission states:', this.permissionStates);
    console.log('All access levels:', this.accessLevels);
  
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
    
    // Ensure the data is preserved
    this.preserveCurrentTabData();
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

  // Fetch all levels in one API call
  getAllLevels(): void {
    // Prevent multiple API calls
    if (this.levelsLoaded) {
      console.log('Levels already loaded, skipping API call');
      return;
    }
    
    this.levelsLoaded = true;
    this.roleService.getAllLevels().subscribe({
      next: (res) => {
        console.log('All levels response:', res);
        if (res.data && res.data.options) {
          // Store levels for each module
          res.data.options.forEach((option: any) => {
            if (option.value && option.available_levels) {
              this.allLevels[option.value] = option.available_levels;
            }
          });
          console.log('Stored all levels:', this.allLevels);
        }
      },
      error: (err) => {
        console.error('Failed to fetch all levels:', err);
        this.levelsLoaded = false; // Reset flag on error
      }
    });
  }

  // Toggle view mode
  toggleViewMode(): void {
    this.isViewMode = !this.isViewMode;
    console.log('View mode toggled to:', this.isViewMode);
  }

  // Check if component is in view mode
  get isInViewMode(): boolean {
    return this.isViewMode;
  }


}

