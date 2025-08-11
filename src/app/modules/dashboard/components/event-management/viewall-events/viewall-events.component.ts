import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EventService } from 'src/app/core/services/event.service';
import { UserStatsCardComponent } from '../../stakeholder-management/user-stats-card/user-stats-card.component';
import { Router } from '@angular/router';
import { StatsComponent } from '../stats/stats.component';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-viewall-events',
  templateUrl: './viewall-events.component.html',
  imports: [CommonModule, StatsComponent, FormsModule, UserStatsCardComponent],
  styleUrls: ['./viewall-events.component.css']
})
export class ViewallEventsComponent implements OnInit {
  events: any[] = [];
  showDropdown: boolean = false;
  activeDropdownIndex: number | null = null;
  currentPage = 1;
  pageSize = 12;
  totalItems = 0;
  searchTerm: string = '';
  filters: any = {
    // Add your filter fields here
    // parking_lot: true
  };
  isModalOpen = false;
  statsCount: any;

  constructor(private eventService: EventService,private toastr: ToastrService, private router: Router) { }

  ngOnInit() {
    this.getEventList();
    this.getstats();
  }

  get totalPages() {
    return Math.ceil(this.totalItems / this.pageSize);
  }

  getEventList(page: number = 1) {
    if (this.searchTerm) {
      this.filters.title = this.searchTerm;
    } else {
      delete this.filters.title;
    }
    const payload = {
      page: page,
      limit: this.pageSize,
      filters: this.filters
    };
    this.eventService.getEventList(payload).subscribe({
      next: (res) => {
        this.events = res.details.events; // Adjust according to your API response
        console.log(this.events);

        this.totalItems = res.details.pagination.total;
        this.currentPage = res.details.pagination.page;
      },
      error: (err) => {
        console.error('Failed to fetch events:', err);
      }
    });
  }

  onSearchChange() {
    this.currentPage = 1;
    this.getEventList();
  }

  onPageChange(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.getEventList(this.currentPage);
  }

  onPageSizeChange() {
    this.pageSize = +this.pageSize; // convert to number
    this.currentPage = 1;
    this.getEventList(this.currentPage);
  }

  goBack() {
    this.router.navigate(['/dashboard/event-management']);
  }

  getstats() {
    this.eventService.getStats().subscribe({
      next: (res) => {
        console.log("events res...", res);
        this.statsCount = res?.details?.dashboard_analytics;
        this.statsCount = res?.details?.dashboard_analytics;
        // Adjust according to your API response
      },
      error: (err) => {
        console.error('Failed to fetch events:', err);
      }
    });
  }

  openChooseTemplateModal() {
    this.isModalOpen = true;
  }
  closeChooseTemplateModal() {
    this.isModalOpen = false;
  }

  goToPreview(event: any) {
    localStorage.setItem('eventID',event?.id);
    this.router.navigate(['dashboard/preview-template/', event.template_id,'view']);
  }


  goToVerification(event: any) {
    localStorage.setItem('eventID',event?.id);
    this.router.navigate(['dashboard/preview-template/', event.template_id,'verification']);
  }

  publishEvent(event){
    let payload = {
      event_id:event?.id
    }
    this.eventService.publishEvent(payload).subscribe({
      next: (res) => {
        this.toastr.success(res.status?.message, 'Success');
      },
      error: (err) => {
        console.error('Failed to fetch events:', err);
      }
    });
  }
  


  toggleDropdown(index: number): void {
    console.log("index",index);
    this.activeDropdownIndex = this.activeDropdownIndex === index ? null : index;
  }

  editSchedule(event: any) {
    this.showDropdown = false;
    this.router.navigate(
      ['dashboard/template-form/', event?.template_id, 'edit'],
      { state: { eventDetails: event } }
    );
  }

  deleteSchedule(event: any) {
    this.showDropdown = false;
    // your logic here
  }

}
