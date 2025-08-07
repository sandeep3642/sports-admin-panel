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
    RouterLink,
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

  isFilterModalOpen = false;
  filterSearch = '';
  filterCategories = [
    'User Type',
    'New Applicants',
    'Sports Category',
    'Level',
    'District',
    'Age Group',
    'Status',
    'Performance Rating',
    'Year of Experience',
  ];
  selectedCategory = 'District';

  userTypes: string[] = [];
  sportsCategories: string[] = [];
  levels: string[] = [];
  districts: string[] = [];
  ageGroups: string[] = [];
  statuses: string[] = [];
  performanceRatings: string[] = [];
  yearsOfExperience: string[] = [];

  // Selected filters
  selectedUserTypes: { [key: string]: boolean } = {};
  selectedSportsCategories: { [key: string]: boolean } = {};
  selectedLevels: { [key: string]: boolean } = {};
  selectedDistricts: { [key: string]: boolean } = {};
  selectedAgeGroups: { [key: string]: boolean } = {};
  selectedStatuses: { [key: string]: boolean } = {};
  selectedPerformanceRatings: { [key: string]: boolean } = {};
  selectedYearsOfExperience: { [key: string]: boolean } = {};

  selectedDocForRejection: any | null = null;
  showRejectModal = false;
  rejectionReason = '';

  constructor(public stackholderService: StackholderService, private toastr: ToastrService, private router: Router) {}

  ngOnInit(): void {
    this.getStakeList();
  }

  readonly dialog = inject(MatDialog);

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
    this.expandedUserId = this.expandedUserId === userId ? null : userId;
    this.getStakeDetails(this.expandedUserId);
  }

  getStakeList(page: number = 1, filtersOverride?: any): void {
    const filtersToUse = filtersOverride || this.filters;
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
        this.extractFilterOptionsFromStakeList();
      },
      error: (err) => {
        console.error('Failed to fetch list:', err);
      },
    });
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
        if (this.expandedUserId === userId) {
          this.expandedUserId = null;
        }
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
            if (this.expandedUserId === userId) {
              this.expandedUserId = null;
            }
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

  getActiveStepCount(statusObj: any): number {
    return this.getSortedSteps(statusObj).filter((step: any) => step.is_active).length;
  }

  getTotalStepCount(statusObj: any): number {
    return this.getSortedSteps(statusObj).length;
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

  resetModalFilters() {}

  selectSort(value: string) {
    this.sort_by = value;
    this.isSortDropdownOpen = false;
    this.getStakeList(1);
  }

  extractFilterOptionsFromStakeList() {
    const getUnique = (arr: any[]) => Array.from(new Set(arr.filter(Boolean)));

    this.userTypes = getUnique(this.stakelist.map((u) => u.customer_type));
    this.sportsCategories = getUnique(this.stakelist.map((u) => u.sport_type?.label));
    this.levels = getUnique(this.stakelist.map((u) => u.level?.label));
    this.districts = getUnique(this.stakelist.map((u) => u.district?.label));
    this.ageGroups = getUnique(this.stakelist.map((u) => u.age_group));
    this.statuses = getUnique(this.stakelist.map((u) => u.status));
    this.performanceRatings = getUnique(this.stakelist.map((u) => u.performance_rating));
    this.yearsOfExperience = getUnique(this.stakelist.map((u) => u.experience_year));
    console.log('userTypes', this.userTypes);
  }

  openFilterModal() {
    this.isFilterModalOpen = true;
  }
  closeFilterModal() {
    this.isFilterModalOpen = false;
  }
  selectCategory(cat: string) {
    this.selectedCategory = cat;
  }
  clearAllFilters() {
    this.selectedUserTypes = {};
    this.selectedSportsCategories = {};
    this.selectedLevels = {};
    this.selectedDistricts = {};
    this.selectedAgeGroups = {};
    this.selectedStatuses = {};
    this.selectedPerformanceRatings = {};
    this.selectedYearsOfExperience = {};
    this.filterSearch = '';
    this.getStakeList(1, {}); // Fetch all data from backend with no filters
  }
  applyFilters() {
    const filterPayload = this.buildFilterPayload();
    this.getStakeList(1, filterPayload);
    this.closeFilterModal();
  }

  get filteredUserTypes() {
    return this.userTypes.filter(
      (type) => !this.filterSearch || type.toLowerCase().includes(this.filterSearch.toLowerCase()),
    );
  }
  get filteredSportsCategories() {
    return this.sportsCategories.filter(
      (cat) => !this.filterSearch || cat.toLowerCase().includes(this.filterSearch.toLowerCase()),
    );
  }
  get filteredLevels() {
    return this.levels.filter(
      (level) => !this.filterSearch || level.toLowerCase().includes(this.filterSearch.toLowerCase()),
    );
  }
  get filteredDistricts() {
    return this.districts.filter(
      (district) => !this.filterSearch || district.toLowerCase().includes(this.filterSearch.toLowerCase()),
    );
  }

  buildFilterPayload() {
    const filters: any = {};

    // User Type
    const selectedUserTypes = Object.keys(this.selectedUserTypes).filter((k) => this.selectedUserTypes[k]);
    if (selectedUserTypes.length) filters.customer_type = selectedUserTypes;

    // Sports Category
    const selectedSportsCategories = Object.keys(this.selectedSportsCategories).filter(
      (k) => this.selectedSportsCategories[k],
    );
    if (selectedSportsCategories.length) filters.sport_type = selectedSportsCategories;

    // Level
    const selectedLevels = Object.keys(this.selectedLevels).filter((k) => this.selectedLevels[k]);
    if (selectedLevels.length) filters.level = selectedLevels;

    // District
    const selectedDistricts = Object.keys(this.selectedDistricts).filter((k) => this.selectedDistricts[k]);
    if (selectedDistricts.length) filters.district = selectedDistricts;

    // Add similar logic for other categories...

    return filters;
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
