import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-eventsdetails',
  templateUrl: './eventsdetails.component.html',
  imports: [CommonModule, FormsModule,

  ],
  styleUrls: ['./eventsdetails.component.scss']
})
export class EventsdetailsComponent {
  @Input() countsData: any;
  isModalOpen = false;

  searchTerm = '';
  startDate: string = '';
  endDate: string = '';
  selectedStatus: string = '';
  itemsPerPage = 10;
  currentPage = 1;

  statusOptions = [
    'Pending Verification',
    'On Going',
    'Upcoming',
    'Verified Event',
    'Past Event'
  ];

  events = [
    {
      name: 'Summer Football Cup',
      date: new Date('2025-04-04'),
      image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
      status: 'Pending Verification',
      statusClass: 'pending',
      location: 'Eco Park, New Town, Kolkata',
      startDate: new Date('2025-01-12'),
      endDate: new Date('2025-01-20'),
      time: '12:01 PM',
      sports: ['Football', 'Cricket']
    },
    {
      name: 'Summer Cricket Cup',
      date: new Date('2025-04-04'),
      image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=400&q=80',
      status: 'On Going',
      statusClass: 'ongoing',
      location: 'Eco Park, New Town, Kolkata',
      startDate: new Date('2025-01-12'),
      endDate: new Date('2025-01-20'),
      time: '12:01 PM',
      sports: ['Football', 'Cricket', 'Hockey']
    },
    {
      name: 'Summer Badminton Cup',
      date: new Date('2025-04-04'),
      image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=400&q=80',
      status: 'Upcoming',
      statusClass: 'upcoming',
      location: 'Eco Park, New Town, Kolkata',
      startDate: new Date('2025-01-12'),
      endDate: new Date('2025-01-20'),
      time: '12:01 PM',
      sports: ['Badminton']
    },
    {
      name: 'Kabaddi Champions Cup',
      date: new Date('2025-04-04'),
      image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=400&q=80',
      status: 'Verified Event',
      statusClass: 'verified',
      location: 'Eco Park, New Town, Kolkata',
      startDate: new Date('2025-01-12'),
      endDate: new Date('2025-01-20'),
      time: '12:01 PM',
      sports: ['Kabaddi']
    },
    {
      name: 'Hockey Tournament',
      date: new Date('2025-04-04'),
      image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=400&q=80',
      status: 'Pending Verification',
      statusClass: 'pending',
      location: 'Eco Park, New Town, Kolkata',
      startDate: new Date('2025-01-12'),
      endDate: new Date('2025-01-20'),
      time: '12:01 PM',
      sports: ['Football']
    },
    {
      name: 'Tennis Tournament',
      date: new Date('2025-04-04'),
      image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=400&q=80',
      status: 'Past Event',
      statusClass: 'past',
      location: 'Eco Park, New Town, Kolkata',
      startDate: new Date('2025-01-12'),
      endDate: new Date('2025-01-20'),
      time: '12:01 PM',
      sports: ['Badminton']
    }
  ];

  constructor(private router: Router) { }

  get filteredEvents() {
    let filtered = this.events;

    if (this.searchTerm) {
      filtered = filtered.filter(event =>
        event.name.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
    if (this.selectedStatus) {
      filtered = filtered.filter(event => event.status === this.selectedStatus);
    }
    if (this.startDate) {
      filtered = filtered.filter(event => new Date(event.startDate) >= new Date(this.startDate));
    }
    if (this.endDate) {
      filtered = filtered.filter(event => new Date(event.endDate) <= new Date(this.endDate));
    }

    // Pagination
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return filtered.slice(start, start + this.itemsPerPage);
  }

  get totalPages() {
    let filtered = this.events;
    if (this.searchTerm) {
      filtered = filtered.filter(event =>
        event.name.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
    if (this.selectedStatus) {
      filtered = filtered.filter(event => event.status === this.selectedStatus);
    }
    if (this.startDate) {
      filtered = filtered.filter(event => new Date(event.startDate) >= new Date(this.startDate));
    }
    if (this.endDate) {
      filtered = filtered.filter(event => new Date(event.endDate) <= new Date(this.endDate));
    }
    return Math.ceil(filtered.length / this.itemsPerPage);
  }

  get totalPagesArray() {
    return Array(this.totalPages).fill(0).map((x, i) => i + 1);
  }

  goToPage(page: number) {
    this.currentPage = page;
  }

  prevPage() {
    if (this.currentPage > 1) this.currentPage--;
  }

  nextPage() {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  onItemsPerPageChange() {
    this.currentPage = 1;
  }

  openChooseTemplateModal() {
    this.isModalOpen = true;
  }
  
  closeChooseTemplateModal() {
    this.isModalOpen = false;
  }

  goToPreview(id: number) {
    this.router.navigate(['dashboard/preview-template/', id]);
  }
}
