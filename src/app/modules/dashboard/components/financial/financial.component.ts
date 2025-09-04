import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FinancialService } from 'src/app/core/services/financial.service';
import { StackholderService } from 'src/app/core/services/stackholder.service';
import { StatsFinancialComponent } from './stats-financial/stats-financial.component';
import { UnderscoreToSpacePipe } from 'src/app/pipes/underscore-to-space.pipe';
import { AngularSvgIconModule } from 'angular-svg-icon';
@Component({
  selector: 'app-financial',
  standalone: true,
  imports: [StatsFinancialComponent, CommonModule, FormsModule, UnderscoreToSpacePipe, AngularSvgIconModule],
  templateUrl: './financial.component.html',
  styleUrls: ['./financial.component.css'] // ✅ fixed typo: styleUrl → styleUrls
})
export class FinancialComponent implements OnInit {
  @ViewChild(StatsFinancialComponent) statsComponent!: StatsFinancialComponent;

  pageSize = 5;
  countsData:any;
  currentPage = 1;
  totalPages = 1;
  totalCount = 0;
  statsData: any;
  searchText = "";
  filterType = "active";
  sortType = "newest";
  isLoading: boolean = false;
  groupedAssistances: Record<string, any[]> = {};

  // Filter modal properties
  isFilterModalOpen = false;
  filterSearch = '';
  filterCategories = ['Status', 'District', 'Sports Type'];
  selectedCategory = 'Status';

  // Filter options
  statuses = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
    { label: 'All', value: 'all' }
  ];

  sorts = [
    { label: 'Newest', value: 'newest' },
    { label: 'Oldest', value: 'oldest' },
    { label: 'Amount High → Low', value: 'amount_desc' },
    { label: 'Amount Low → High', value: 'amount_asc' }
  ];

  // District and Sports Type options (will be populated from API)
  districts: any[] = [];
  sportsTypes: any[] = [];

  // Selected filters
  selectedStatus = 'active';
  selectedSort = 'newest';
  selectedDistricts: string[] = [];
  selectedSportsTypes: string[] = [];

  // Dropdown state for sort
  isSortDropdownOpen = false;

  constructor(
    private financialService: FinancialService,
    private stackholderService: StackholderService,
    private router: Router
  ) { }

  statusMapping = [
    { key: 'enrolled', label: 'Enrolled', bg: '#FFF9E6', badge: '#FF9500' },
    { key: 'approved', label: 'Approved', bg: '#F0FFF4', badge: '#2D9C4A' },
    { key: 'in_review', label: 'In Review', bg: '#EFF5FA', badge: '#075FB0' },
    { key: 'declined', label: 'Declined', bg: '#FDF1F1', badge: '#F46C6C' }
  ];

  ngOnInit() {
    this.loadGrants();
    this.getStatus();
    this.getDropdownData();
  }

  loadGrants() {
    this.isLoading = true;
    const payload = {
      page: this.currentPage,
      limit: this.pageSize,
      sort_by: this.getSortByField(),
      sort_order: this.getSortOrder(),
      filters: {
        search: this.searchText,
        filter: this.filterType,
        ...(this.selectedDistricts.length > 0 && { district: this.selectedDistricts }),
        ...(this.selectedSportsTypes.length > 0 && { sport_type: this.selectedSportsTypes })
      }
    };

    this.financialService.getGrants(payload).subscribe(res => {
      if (res?.status?.success) {
        this.isLoading = false;
        this.groupedAssistances = res.details.grants || {};
        this.totalCount = res.details.totalCount;
        this.totalPages = res.details.totalPages;
        this.districts = res.details.districts;
        this.sportsTypes = res.details.sports_types;
      }
    });
  }

  getStatus() {

    this.financialService.getStats({}).subscribe(res => {
      if (res?.status?.success) {
        const analytics = res.details.dashboard_analytics;
    
        this.countsData = {
          total_applications: {
            counts: analytics.totalApplications.count,
            percentage: Math.abs(analytics.totalApplications.change),
            direction: analytics.totalApplications.change >= 0 ? "up" : "down"
          },
          application_verified: {
            counts: analytics.applicationVerified.count,
            percentage: Math.abs(analytics.applicationVerified.change),
            direction: analytics.applicationVerified.change >= 0 ? "up" : "down"
          },
          awaiting_verification: {
            counts: analytics.applicationAwaitingVerification.count,
            percentage: Math.abs(analytics.applicationAwaitingVerification.change),
            direction: analytics.applicationAwaitingVerification.change >= 0 ? "up" : "down"
          },
          user_rejected: {
            counts: analytics.applicationRejected.count,
            percentage: Math.abs(analytics.applicationRejected.change),
            direction: analytics.applicationRejected.change >= 0 ? "up" : "down"
          }
        };
      }
    });
    
  }

  getDropdownData(): void {
    try {
      const payload = {
        sports: true,
        districts: true,
      };

      this.stackholderService.getDropdownLists(payload).subscribe({
        next: (res) => {
          console.log('Dropdown Response:', res);
          if (res?.status?.success) {
            this.districts = res.data.districts || [];
            this.sportsTypes = res.data.sports || [];
            console.log('Districts loaded:', this.districts);
            console.log('Sports loaded:', this.sportsTypes);
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

  onPageSizeChange() {
    this.currentPage = 1;
    this.loadGrants();
  }

  onPageChange(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadGrants();
    }
  }

  onSearchChange() {
    this.currentPage = 1;
    this.loadGrants();
  }

  onFilterChange(value: string) {
    this.filterType = value;
    this.currentPage = 1;
    this.loadGrants();
  }

  onSortChange(value: string) {
    this.sortType = value;
    this.currentPage = 1;
    this.loadGrants();
  }

  viewMore(id: number) {
    this.router.navigate(['dashboard/financial-assistance-view', id]);
  }

  // Filter modal methods
  openFilterModal(): void {
    this.isFilterModalOpen = true;
    // Always ensure dropdown data is loaded when modal opens
    this.getDropdownData();
  }

  closeFilterModal(): void {
    this.isFilterModalOpen = false;
    // Don't clear filterSearch to preserve user's search
    // this.filterSearch = '';
  }

  selectCategory(category: string): void {
    this.selectedCategory = category;
    // Don't clear filterSearch when switching categories
    // this.filterSearch = '';
  }

  selectStatus(value: string): void {
    this.selectedStatus = value;
  }

  selectSort(value: string): void {
    this.selectedSort = value;
  }

  applyFilters(): void {
    this.filterType = this.selectedStatus;
    this.currentPage = 1;
    this.loadGrants();
    this.closeFilterModal();
    // Don't clear selections - keep them for next time
  }

  clearAllFilters(): void {
    this.selectedStatus = 'active';
    this.selectedDistricts = [];
    this.selectedSportsTypes = [];
    this.filterType = 'active';
    this.filterSearch = ''; // Only clear search when explicitly clearing all
    this.currentPage = 1;
    this.loadGrants();
  }

  getSelectedCount(category: string): number {
    switch (category) {
      case 'Status':
        return this.selectedStatus !== 'active' ? 1 : 0;
      case 'District':
        return this.selectedDistricts.length;
      case 'Sports Type':
        return this.selectedSportsTypes.length;
      default:
        return 0;
    }
  }

  get filteredStatuses(): any[] {
    if (!this.filterSearch) return this.statuses;
    return this.statuses.filter(status =>
      status.label.toLowerCase().includes(this.filterSearch.toLowerCase())
    );
  }

  get filteredSorts(): any[] {
    if (!this.filterSearch) return this.sorts;
    return this.sorts.filter(sort =>
      sort.label.toLowerCase().includes(this.filterSearch.toLowerCase())
    );
  }

  get filteredDistricts(): any[] {
    if (!this.filterSearch) return this.districts;
    return this.districts.filter(district =>
      (district.label || district).toLowerCase().includes(this.filterSearch.toLowerCase())
    );
  }

  get filteredSportsTypes(): any[] {
    if (!this.filterSearch) return this.sportsTypes;
    return this.sportsTypes.filter(sport =>
      (sport.label || sport).toLowerCase().includes(this.filterSearch.toLowerCase())
    );
  }

  // District and Sports Type selection methods
  isDistrictSelected(district: any): boolean {
    const districtValue = district?.value || district?.label || district;
    console.log('Checking district selection:', districtValue, 'Selected districts:', this.selectedDistricts);
    return this.selectedDistricts.includes(districtValue);
  }

  isSportsTypeSelected(sport: any): boolean {
    const sportValue = sport?.value || sport?.label || sport;
    console.log('Checking sport selection:', sportValue, 'Selected sports:', this.selectedSportsTypes);
    return this.selectedSportsTypes.includes(sportValue);
  }

  toggleDistrict(district: any): void {
    const districtValue = district?.value || district?.label || district;
    console.log('Toggling district:', districtValue);
    const index = this.selectedDistricts.indexOf(districtValue);
    if (index > -1) {
      this.selectedDistricts.splice(index, 1);
    } else {
      this.selectedDistricts.push(districtValue);
    }
    console.log('Updated selected districts:', this.selectedDistricts);
  }

  toggleSportsType(sport: any): void {
    const sportValue = sport?.value || sport?.label || sport;
    console.log('Toggling sport:', sportValue);
    const index = this.selectedSportsTypes.indexOf(sportValue);
    if (index > -1) {
      this.selectedSportsTypes.splice(index, 1);
    } else {
      this.selectedSportsTypes.push(sportValue);
    }
    console.log('Updated selected sports:', this.selectedSportsTypes);
  }

  // Select All methods
  isAllDistrictsSelected(): boolean {
    return this.filteredDistricts.length > 0 &&
      this.filteredDistricts.every(district =>
        this.isDistrictSelected(district.value || district)
      );
  }

  isAllSportsTypesSelected(): boolean {
    return this.filteredSportsTypes.length > 0 &&
      this.filteredSportsTypes.every(sport =>
        this.isSportsTypeSelected(sport.value || sport)
      );
  }

  toggleAllDistricts(): void {
    if (this.isAllDistrictsSelected()) {
      // Deselect all filtered districts
      this.filteredDistricts.forEach(district => {
        const districtValue = district?.value || district?.label || district;
        const index = this.selectedDistricts.indexOf(districtValue);
        if (index > -1) {
          this.selectedDistricts.splice(index, 1);
        }
      });
    } else {
      // Select all filtered districts
      this.filteredDistricts.forEach(district => {
        const districtValue = district?.value || district?.label || district;
        if (!this.selectedDistricts.includes(districtValue)) {
          this.selectedDistricts.push(districtValue);
        }
      });
    }
    console.log('After toggle all districts:', this.selectedDistricts);
  }

  toggleAllSportsTypes(): void {
    if (this.isAllSportsTypesSelected()) {
      // Deselect all filtered sports
      this.filteredSportsTypes.forEach(sport => {
        const sportValue = sport?.value || sport?.label || sport;
        const index = this.selectedSportsTypes.indexOf(sportValue);
        if (index > -1) {
          this.selectedSportsTypes.splice(index, 1);
        }
      });
    } else {
      // Select all filtered sports
      this.filteredSportsTypes.forEach(sport => {
        const sportValue = sport?.value || sport?.label || sport;
        if (!this.selectedSportsTypes.includes(sportValue)) {
          this.selectedSportsTypes.push(sportValue);
        }
      });
    }
    console.log('After toggle all sports:', this.selectedSportsTypes);
  }

  // Sort dropdown methods
  toggleSortDropdown(): void {
    this.isSortDropdownOpen = !this.isSortDropdownOpen;
  }

  selectSortOption(value: string): void {
    this.selectedSort = value;
    this.sortType = value;
    this.isSortDropdownOpen = false;
    this.currentPage = 1;
    this.loadGrants();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    // Close sort dropdown if clicking outside
    const target = event.target as HTMLElement;
    if (!target.closest('.sort-dropdown')) {
      this.isSortDropdownOpen = false;
    }
  }

  // Helper methods for sort API payload
  private getSortByField(): string {
    switch (this.sortType) {
      case 'newest':
      case 'oldest':
        return 'created_at';
      case 'amount_desc':
      case 'amount_asc':
        return 'grant_amount_request';
      default:
        return 'created_at';
    }
  }

  private getSortOrder(): string {
    switch (this.sortType) {
      case 'newest':
      case 'amount_desc':
        return 'DESC';
      case 'oldest':
      case 'amount_asc':
        return 'ASC';
      default:
        return 'DESC';
    }
  }
}
