import { Component, OnInit } from '@angular/core';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ChangeDetectionStrategy, inject } from '@angular/core';
import { ReqestInfoComponent } from '../popup/reqest-info/reqest-info.component';
import { DocumentViewComponent } from '../popup/document-view/document-view.component';
import { ExportDialogComponent } from '../popup/export-dialog/export-dialog.component';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { StackholderService } from 'src/app/core/services/stackholder.service';
import { ApplicationRejectionComponent } from '../popup/application-rejection/application-rejection.component';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ProfileStatusComponent } from '../popup/profile-status/profile-status.component';

interface Stakeholder {
  sl: string;
  name: string;
  sportsCategory: string;
  role: string;
  district: string;
  status: {
    progress: number;
    label: string;
  };
  registrationDate: string;
  deadline: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  details: string;
}

@Component({
  selector: 'app-stakeholder-table',
  templateUrl: './stakeholder-table.component.html',
  styleUrl: './stakeholder-table.component.css',
  imports: [
    AngularSvgIconModule,
    MatButtonModule,
    MatDialogModule,
    NgIf,
    NgFor,
    CommonModule,
    ButtonComponent,
    FormsModule,
  ],
})
export class StakeholderTableComponent implements OnInit {
  stakelist: any[] = []; // The full, unfiltered data from the API
  filteredStakeList: any[] = []; // The data shown in the table (filtered)
  stakeholders: Stakeholder[] = [];
  isSortDropdownOpen = false;
  sort_by = '';
  stakeDetails: any;
  currentPage: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;
  filters: any = {
    search: '',
    customer_type: '',
    sport_type: '',
    level: '',
    district: '',
    profile_status_key: '',
    experience_year: { min: null, max: null },
    age: { min: null, max: null },
  };
  sort_order: 'ASC' | 'DESC' = 'DESC';
  isFilterDropdownOpen = false;

  // Filter modal properties
  isFilterModalOpen = false;
  filterSearch = '';
  filterCategories = [
    'User Type',
    'Sports Category',
    'Level',
    'District',
    'Age Group',
    'Year of Experience'
  ];
  selectedCategory = 'User Type';
  // Filter dropdowns data
  userTypes: any[] = [
    { label: 'Player', value: 'player' },
    { label: 'Coach', value: 'coach' }
  ]; // Static data
  sportsCategories: any[] = []; // From API
  levels: any[] = []; // From API
  districts: any[] = []; // From API
  ageGroups: any[] = []; // From API
  profileStatuses: any[] = []; // From API
  // Selected filters for multi-select
  selectedUserType: string = ''; // Single selection instead of array
  selectedSportsCategories: string[] = [];
  selectedLevels: string[] = [];
  selectedDistricts: string[] = [];
  selectedAgeGroups: string[] = [];
  selectedProfileStatuses: string[] = [];
  experienceYearRange: any = {};

  selectedDocForRejection: any | null = null;
  showRejectModal = false;
  rejectionReason = '';

  constructor(
    public stackholderService: StackholderService,
    private toastr: ToastrService,
    private router: Router
  ) { }
  ngOnInit(): void {
    this.getStakeList();
    this.getDropdownData();
  }

  readonly dialog = inject(MatDialog);
  getDropdownData(): void {
    try {
      const payload = {
        districts: true,
        sports: true,
        qualifications: true,
        levels: true,
        certificates: true,
        available_services: true,
        guardian_types: true,
        grant_purpose: true,
        training_frequency: true,
        role_management: true,
        admin_months_filter: true,
        delete_account_reasons: true,
        event_type: true,
        event_template_id: true,
        role_management_options: true,
        roles_ddl: true,
        age_group: true
      };

      this.stackholderService.getDropdownLists(payload).subscribe({
        next: (res) => {
          console.log('Dropdown Response:', res);
          if (res?.status?.success) {
            this.districts = res.data.districts || [];
            this.sportsCategories = res.data.sports || [];
            this.levels = res.data.levels || [];
            this.ageGroups = res.data.age_group || [];
            // Add other dropdown mappings as needed
          }
        },
        error: (err) => {
          console.error('Failed to fetch dropdown data:', err);
        },
      });
    } catch (error) {
      console.error('Failed to fetch dropdown data:', error);
    }
  }
  openDialog() {
    // const dialogRef = this.dialog.open(ReqestInfoComponent);

    let dialogRef = this.dialog.open(ReqestInfoComponent, {
      height: '465px',
      width: '580px',
      position: {
        top: '120px', // adjust distance from the top as needed
      },
      panelClass: 'custom-dialog-top-center',
      backdropClass: 'blurred-backdrop1',
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log(`Dialog result: ${result}`);
    });
  }

  documentview() {
    let dialogRef = this.dialog.open(DocumentViewComponent, {

      position: {
        // top: '120px', // adjust distance from the top as needed
      },
      panelClass: 'custom-dialog-top-center',
      backdropClass: 'blurred-backdrop1',
    });
  }

  Exportdialog() {
    let dialogRef = this.dialog.open(ExportDialogComponent, {
      height: '300px',
      width: '350px',
      position: {
        top: '120px', // adjust distance from the top as needed
      },
      panelClass: 'custom-dialog-top-center',
      backdropClass: 'blurred-backdrop1',
      data: { page: this.currentPage, totalItems: this.totalItems, pageSize: this.pageSize },
    });
  }

  onReject(cert: any): void {
    this.selectedDocForRejection = cert;
    this.showRejectModal = true; // ✅ modal खोलेगा
  }

  expandedUserId: number | null = null;

  toggleRow(userId: number) {
    console.log('Toggle row called for userId:', userId);
    console.log('Current expandedUserId:', this.expandedUserId);

    // If clicking on the same row, close it
    if (this.expandedUserId === userId) {
      this.expandedUserId = null;
      this.stakeDetails = null;
      console.log('Closing row, expandedUserId set to null');
    } else {
      // If clicking on a different row, open it and close others
      this.expandedUserId = userId;
      console.log('Opening row, expandedUserId set to:', userId);
      this.getStakeDetails(userId);
    }
  }

  getStakeList(page: number = 1, filtersOverride?: any): void {
    const filtersToUse = filtersOverride !== undefined ? filtersOverride : this.buildFilterPayload();

    const payload = {
      page: page,
      limit: this.pageSize,
      sort_by: this.sort_by || undefined,
      sort_order: this.sort_by ? this.sort_order : undefined,
      filters: filtersToUse,
    };

    this.stackholderService.getListing(payload).subscribe({
      next: (res) => {
        this.stakelist = res.data.customers;
        this.filteredStakeList = [...this.stakelist];
        this.totalItems = res.data.pagination.total;
        this.currentPage = res.data.pagination.page;
        this.resetExpandedState();
      },
      error: (err) => {
        console.error('Failed to fetch list:', err);
      },
    });
  }

  buildFilterPayload(): any {
    const filters: any = {};

    // Search
    if (this.filters.search?.trim()) {
      filters.search = this.filters.search.trim();
    }

    // User Type (multi-select)
    if (this.selectedUserType) {
      filters.customer_type = this.selectedUserType; // API expects array format
    }

    // Sports Category (multi-select)
    if (this.selectedSportsCategories.length > 0) {
      filters.sport_type = this.selectedSportsCategories;
    }

    // Level (multi-select)
    if (this.selectedLevels.length > 0) {
      filters.level = this.selectedLevels;
    }

    // District (multi-select)
    if (this.selectedDistricts.length > 0) {
      filters.district = this.selectedDistricts;
    }

    // Age Group (multi-select)
    if (this.selectedAgeGroups.length > 0) {
      filters.age_group = this.selectedAgeGroups;
    }

    // Profile Status
    if (this.selectedProfileStatuses.length > 0) {
      filters.profile_status_key = this.selectedProfileStatuses;
    }

    // Experience Year Range
    if (this.experienceYearRange.min !== null || this.experienceYearRange.max !== null) {
      filters.experience_year = {
        min: this.experienceYearRange.min,
        max: this.experienceYearRange.max
      };
    }

    return filters;
  }

  // Filter modal methods
  openFilterModal(): void {
    this.isFilterModalOpen = true;
  }

  closeFilterModal(): void {
    this.isFilterModalOpen = false;
    this.filterSearch = '';
  }

  selectCategory(category: string): void {
    this.selectedCategory = category;
    this.filterSearch = '';
  }

  applyFilters(): void {
    this.getStakeList(1);
    this.closeFilterModal();
  }

  // Update the clearAllFilters method:
  clearAllFilters(): void {
    this.selectedUserType = ''; // UPDATED - clear single selection
    this.selectedSportsCategories = [];
    this.selectedLevels = [];
    this.selectedDistricts = [];
    this.selectedAgeGroups = [];
    this.selectedProfileStatuses = [];
    this.experienceYearRange = { min: 0, max: 20 };
    this.filters.search = '';
    this.getStakeList(1, {}); // Pass empty filters to get all data
  }



  // Filtered lists for search functionality
  get filteredUserTypes(): any[] {
    if (!this.filterSearch) return this.userTypes;
    return this.userTypes.filter(type =>
      type.label.toLowerCase().includes(this.filterSearch.toLowerCase())
    );
  }

  get filteredSportsCategories(): any[] {
    if (!this.filterSearch) return this.sportsCategories;
    return this.sportsCategories.filter(cat =>
      cat.label?.toLowerCase().includes(this.filterSearch.toLowerCase()) ||
      cat.toLowerCase().includes(this.filterSearch.toLowerCase())
    );
  }

  get filteredLevels(): any[] {
    if (!this.filterSearch) return this.levels;
    return this.levels.filter(level =>
      level.label?.toLowerCase().includes(this.filterSearch.toLowerCase()) ||
      level.toLowerCase().includes(this.filterSearch.toLowerCase())
    );
  }

  get filteredDistricts(): any[] {
    if (!this.filterSearch) return this.districts;
    return this.districts.filter(district =>
      district.label?.toLowerCase().includes(this.filterSearch.toLowerCase()) ||
      district.toLowerCase().includes(this.filterSearch.toLowerCase())
    );
  }

  get filteredAgeGroups(): any[] {
    if (!this.filterSearch) return this.ageGroups;
    return this.ageGroups.filter(ageGroup =>
      ageGroup.label?.toLowerCase().includes(this.filterSearch.toLowerCase()) ||
      ageGroup.toLowerCase().includes(this.filterSearch.toLowerCase())
    );
  }


  toggleSportsCategory(category: string): void {
    const index = this.selectedSportsCategories.indexOf(category);
    if (index > -1) {
      this.selectedSportsCategories.splice(index, 1);
    } else {
      this.selectedSportsCategories.push(category);
    }
  }

  toggleLevel(level: string): void {
    const index = this.selectedLevels.indexOf(level);
    if (index > -1) {
      this.selectedLevels.splice(index, 1);
    } else {
      this.selectedLevels.push(level);
    }
  }

  toggleDistrict(district: string): void {
    const index = this.selectedDistricts.indexOf(district);
    if (index > -1) {
      this.selectedDistricts.splice(index, 1);
    } else {
      this.selectedDistricts.push(district);
    }
  }

  toggleAgeGroup(ageGroup: string): void {
    const index = this.selectedAgeGroups.indexOf(ageGroup);
    if (index > -1) {
      this.selectedAgeGroups.splice(index, 1);
    } else {
      this.selectedAgeGroups.push(ageGroup);
    }
  }

  // Add new single selection methods:
  selectUserType(userType: string): void {
    this.selectedUserType = userType;
  }

  isSportsCategorySelected(category: string): boolean {
    return this.selectedSportsCategories.includes(category);
  }

  isLevelSelected(level: string): boolean {
    return this.selectedLevels.includes(level);
  }

  isDistrictSelected(district: string): boolean {
    return this.selectedDistricts.includes(district);
  }

  isAgeGroupSelected(ageGroup: string): boolean {
    return this.selectedAgeGroups.includes(ageGroup);
  }

  // Experience year range methods
  updateExperienceRange(type: 'min' | 'max', value: number): void {
    this.experienceYearRange[type] = value;

    // Ensure min is not greater than max
    if (type === 'min' && this.experienceYearRange.max < value) {
      this.experienceYearRange.max = value;
    }
    if (type === 'max' && this.experienceYearRange.min > value) {
      this.experienceYearRange.min = value;
    }
  }

  // Get selected count for display
  getSelectedCount(category: string): number {
    switch (category) {
      case 'User Type': return this.selectedUserType ? 1 : 0; // UPDATED
      case 'Sports Category': return this.selectedSportsCategories.length;
      case 'Level': return this.selectedLevels.length;
      case 'District': return this.selectedDistricts.length;
      case 'Age Group': return this.selectedAgeGroups.length;
      default: return 0;
    }
  }


  resetExpandedState(): void {
    // Reset expanded state when data changes
    this.expandedUserId = null;
    this.stakeDetails = null;
  }

  getStakeDetails(expandedUserId): void {
    const payload = {
      customer_id: expandedUserId,
    };
    this.stackholderService.getDetails(payload).subscribe({
      next: (res) => {
        this.stakeDetails = res.data;
      },
      error: (err) => {
        console.error('Failed to fetch list:', err);
      },
    });
  }

  onPageChange(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.getStakeList(page);
  }

  approveProfile(userId: number | null) {
    if (userId == null) return;
    const payload = {
      customer_id: userId,
      status_key: 'approved',
    };
    this.stackholderService.updateProfileStatus(payload).subscribe({
      next: (response) => {
        this.dialog.open(ProfileStatusComponent, {
          width: '400px',
          data: { status: 'approved' },
        });
        this.getStakeDetails(userId);
        this.getStakeList(this.currentPage);
        // Keep the row expanded after approval
        this.expandedUserId = userId;
      },
      error: (err) => {
        alert('Failed to approve profile.');
        console.error(err);
      },
    });
  }

  rejectProfile(userId: number | null) {
    if (userId == null) return;
    const dialogRef = this.dialog.open(ApplicationRejectionComponent, {
      height: '305px',
      width: '580px',
      position: {
        top: '120px',
      },
      panelClass: 'custom-dialog-top-center',
      backdropClass: 'blurred-backdrop1',
    });
    dialogRef.afterClosed().subscribe((description: string) => {
      if (description) {
        const payload = {
          customer_id: userId,
          status_key: 'rejected',
          description: description,
        };
        this.stackholderService.updateProfileStatus(payload).subscribe({
          next: (response) => {
            this.dialog.open(ProfileStatusComponent, {
              width: '400px',
              data: { status: 'rejected' },
            });
            this.getStakeDetails(userId);
            this.getStakeList(this.currentPage);
            // Keep the row expanded after rejection
            this.expandedUserId = userId;
          },
          error: (err) => {
            alert('Failed to reject profile.');
            console.error(err);
          },
        });
      }
    });
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize);
  }

  resetFilters() {
    this.filters = {
      search: '',
      customer_type: '',
      sport_type: '',
      level: '',
      district: '',
      profile_status_key: '',
      experience_year: { min: null, max: null },
      age: { min: null, max: null },
    };
    this.getStakeList(1);
  }

  onPageSizeChange(): void {
    this.getStakeList(1);
  }

  openCertificateDialog(cert: any, index: number) {
    this.dialog.open(DocumentViewComponent, {
      height: '665px',
      width: '944px',
      maxWidth: '95vw',
      position: {
        top: '120px',
      },
      panelClass: 'custom-dialog-top-center',
      backdropClass: 'blurred-backdrop1',
      data: {
        certificate: cert,
        certificates: this.stakeDetails?.documents || [],
        index: index,
      },
    });
  }

  // downloadPDF() {
  //   if (this.certificate && this.certificate.file) {
  //       const link = document.createElement('a');
  //       link.href = this.certificate.file;
  //       link.download = (this.certificate.title || this.certificate.name || 'certificate') + '.pdf';
  //       link.click();
  //   }
  // }

  // Returns sorted status steps for the expanded user
  get profileStatusSteps() {
    if (!this.stakeDetails?.profile_status) return [];
    // Convert object to array and sort by order_num if present, else fallback to key order
    return Object.values(this.stakeDetails.profile_status).sort(
      (a: any, b: any) => (a.order_num ?? 0) - (b.order_num ?? 0),
    );
  }

  getSortedSteps(statusObj: any): any[] {
    return Object.values(statusObj || {}).sort((a: any, b: any) => (a.order_num || 0) - (b.order_num || 0));
  }

// Add these methods to your StakeholderTableComponent class

/**
 * Get the current profile step count (0/2, 1/2, or 2/2)
 */
getProfileStepCount(profileStatus: any): string {
  if (!profileStatus) return '0';
  
  // If approved, show 2/2
  if (profileStatus.approved?.is_active) {
    return '2';
  }
  
  // If rejected, show the step where it was rejected
  if (profileStatus.rejected?.is_active) {
    // If under_review exists and was active, it means it reached review stage
    if (profileStatus.under_review) {
      return '1'; // Rejected at review stage
    }
    return '0'; // Rejected at initial stage
  }
  
  // If under review, show 1
  if (profileStatus.under_review?.is_active) {
    return '1';
  }
  
  // If only enrolled, show 0
  if (profileStatus.enrolled?.is_active) {
    return '0';
  }
  
  return '0';
}

/**
 * Get the CSS class for step icons based on profile status
 */
getStepIconClass(profileStatus: any, step: number): string {
  const currentStep = parseInt(this.getProfileStepCount(profileStatus));
  const isRejected = profileStatus?.rejected?.is_active;
  
  if (step === 1) {
    // Step 1 is always completed (green) since profile is created
    return 'bg-green-600';
  }
  
  if (step === 2) {
    if (isRejected && currentStep >= 1) {
      return 'bg-red-500'; // Pink for rejected at this stage or later
    } else if (currentStep >= 1) {
      return 'bg-green-600'; // Green if reached or passed this step
    } else {
      return 'bg-orange-400'; // Gray for pending
    }
  }
  
  if (step === 3) {
    if (isRejected && currentStep >= 2) {
      return 'bg-red-500'; // Pink for rejected at final stage
    } else if (currentStep >= 2) {
      return 'bg-green-600'; // Green if approved (step 2 completed)
    } else {
      return 'bg-orange-400'; // Gray for pending
    }
  }
  
  return 'bg-gray-400';
}

/**
 * Get the icon HTML for each step
 */
getStepIcon(profileStatus: any, step: number): string {
  const currentStep = parseInt(this.getProfileStepCount(profileStatus));
  const isRejected = profileStatus?.rejected?.is_active;
  
  if (step === 1) {
    // Step 1 is always completed (checkmark)
    return '✓';
  }
  
  if (step === 2) {
    if (isRejected && currentStep >= 1) {
      return '✕'; // Cross for rejected
    } else if (currentStep >= 1) {
      return '✓'; // Checkmark if completed
    } else {
      return '!'; // Exclamation for pending
    }
  }
  
  if (step === 3) {
    if (isRejected && currentStep >= 2) {
      return '✕'; // Cross for rejected
    } else if (currentStep >= 2) {
      return '✓'; // Checkmark if approved
    } else {
      return '!'; // Exclamation for pending
    }
  }
  
  return '!';
}

/**
 * Get the progress line CSS class
 */
getProgressLineClass(profileStatus: any): string {
  const isRejected = profileStatus?.rejected?.is_active;
  const isApproved = profileStatus?.approved?.is_active;
  
  if (isRejected) {
    return 'bg-red-500'; // Pink line for rejected
  } else if (isApproved) {
    return 'bg-green-600'; // Green line for approved
  } else {
    return 'bg-orange-500'; // Orange line for in progress
  }
}

/**
 * Update the existing getActiveStepCount method to work with the new logic
 */
getActiveStepCount(statusObj: any): number {
  return parseInt(this.getProfileStepCount(statusObj));
}

/**
 * Update the existing getTotalStepCount method
 */
getTotalStepCount(statusObj: any): number {
  return 2; // Always 2 as per your requirement
}


  getProgressPercent(status: any): string {
    if (status?.approved?.is_active) {
      return '100%';
    }
    const total = this.getTotalStepCount(status);
    const active = this.getActiveStepCount(status);
    const percent = total ? Math.round((active / total) * 100) : 0;
    return `${percent}%`;
  }

  isFinalStatus(statusObj: any): boolean {
    if (!statusObj) return false;

    const finalKeys = ['approved', 'rejected'];
    return finalKeys.some((key) => statusObj[key]?.is_active);
  }

  getFinalStatus(statusObj: any): string {
    if (statusObj?.approved?.is_active) {
      return 'Approved';
    } else if (statusObj?.rejected?.is_active) {
      return 'Rejected';
    }
    return '';
  }

  downloadFile(cert: any) {
    if (!cert?.file) return;
    window.open(cert.file, '_blank');

    // Trigger the download
    const link = document.createElement('a');
    link.href = cert.file;
    link.target = '_blank';
    link.download = (cert.title || cert.name || 'certificate') + '.pdf';
    document.body.appendChild(link);
    link.click();
  }

  viewFullProfile(userId: number | string | null) {
    if (userId) {
      this.router.navigate(['/dashboard/profile', userId]);
    }
  }

  toggleFilterDropdown() {
    this.isFilterDropdownOpen = !this.isFilterDropdownOpen;
  }

  closeFilterDropdown() {
    this.isFilterDropdownOpen = false;
  }

  resetModalFilters() { }

  selectSort(value: string) {
    this.sort_by = value;
    this.isSortDropdownOpen = false;
    this.getStakeList(1);
  }

  extractFilterOptionsFromStakeList() {
    const getUnique = (arr: any[]) => Array.from(new Set(arr.filter(Boolean)));
    this.userTypes = getUnique(this.stakelist.map((u) => u.customer_type));
    this.levels = getUnique(this.stakelist.map((u) => u.level?.label));
    this.ageGroups = getUnique(this.stakelist.map((u) => u.age_group));
    console.log('userTypes', this.userTypes);
  }



  approveCertificate(cert: any) {
    const payload = {
      customer_id: cert?.customer_id,
      doc_id: cert?.id,
      status_key: 'approved',
    };
    this.stackholderService.approveRejectDocument(payload).subscribe({
      next: (response) => {
        const message = response?.status?.message || 'Certificate approved successfully';
        this.toastr.success(message);
        this.getStakeDetails(this.expandedUserId);
        this.getStakeList(this.currentPage);
      },
      error: (err) => {
        this.toastr.error('Failed to approve certificate');
        console.error(err);
      },
    });
  }

  rejectCertificate() {
    const payload = {
      customer_id: this.selectedDocForRejection?.customer_id,
      doc_id: this.selectedDocForRejection?.id,
      status_key: 'rejected',
      is_rejected: true,
      reason: this.rejectionReason || 'No reason provided',
    };
    this.stackholderService.approveRejectDocument(payload).subscribe({
      next: (response) => {
        const message = response?.status?.message || 'Certificate rejected successfully';
        this.toastr.success(message);
        this.getStakeDetails(this.expandedUserId);
        this.getStakeList(this.currentPage);
        this.showRejectModal = false; // Close the modal
        this.selectedDocForRejection = null; // Clear the selected document
        this.rejectionReason = ''; // Clear the rejection reason
      },
      error: (err) => {
        this.toastr.error('Failed to reject certificate');
        console.error(err);
      },
    });
  }
}
