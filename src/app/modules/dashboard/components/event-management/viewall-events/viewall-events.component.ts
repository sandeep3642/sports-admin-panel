import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EventService } from 'src/app/core/services/event.service';
import { UserStatsCardComponent } from '../../stakeholder-management/user-stats-card/user-stats-card.component';
import { Router } from '@angular/router';
import { StatsComponent } from '../stats/stats.component';

@Component({
  selector: 'app-viewall-events',
  templateUrl: './viewall-events.component.html',
  imports: [CommonModule,StatsComponent,FormsModule,UserStatsCardComponent],
  styleUrls: ['./viewall-events.component.css']
})
export class ViewallEventsComponent implements OnInit {
  events: any[] = [];
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  searchTerm: string = '';
  filters: any = {
    // Add your filter fields here
    parking_lot: true
  };
  isModalOpen = false;
  statsCount:any;

  constructor(private eventService: EventService, private router: Router) {}

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
        console.log("events res...",res);
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

  goToPreview(id:number) {
    this.router.navigate(['dashboard/preview-template/',id]);
  }

}
