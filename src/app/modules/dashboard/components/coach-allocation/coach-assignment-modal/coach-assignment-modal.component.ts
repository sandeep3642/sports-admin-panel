import { Component, EventEmitter, Input, Output, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { ButtonComponent } from 'src/app/shared/components/button/button.component';

@Component({
  selector: 'app-coach-assignment-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, AngularSvgIconModule, ButtonComponent],
  templateUrl: './coach-assignment-modal.component.html',
  styleUrl: './coach-assignment-modal.component.css'
})
export class CoachAssignmentModalComponent {
  @Input() isOpen: boolean = false;
  @Input() user: any = null;
  @Output() closeModal = new EventEmitter<void>();
  @Output() assignCoach = new EventEmitter<any>();

  // Form data
  formData = {
    enroll_id: 0,
    coach_id: 0,
    sport: '',
    date: '',
    remarks: ''
  };

  // Mock data for dropdowns (in real app, these would come from API)
  sportsCategories = [
    { id: 1, name: 'Cricket' },
    { id: 2, name: 'Football' },
    { id: 3, name: 'Basketball' },
    { id: 4, name: 'Tennis' },
    { id: 5, name: 'Swimming' },
    { id: 6, name: 'Athletics' },
    { id: 7, name: 'Badminton' },
    { id: 8, name: 'Volleyball' },
    { id: 9, name: 'Table Tennis' },
    { id: 10, name: 'Boxing' }
  ];

  coaches = [
    { id: 93, name: 'Ajay Kumar Singh' },
    { id: 94, name: 'Rahul Sharma' },
    { id: 95, name: 'Priya Patel' },
    { id: 96, name: 'Amit Kumar' },
    { id: 97, name: 'Vikram Malhotra' }
  ];

  selectedSport: any = null;
  selectedCoach: any = null;
  sportsDropdownOpen: boolean = false;
  coachesDropdownOpen: boolean = false;

  ngOnInit() {
    this.initializeForm();
  }

  ngOnChanges() {
    if (this.user) {
      this.initializeForm();
    }
  }

  initializeForm() {
    if (this.user) {
      this.formData = {
        enroll_id: this.user.id,
        coach_id: 0,
        sport: this.user.sports_category || '',
        date: this.formatDate(new Date()),
        remarks: ''
      };
      
      // Set selected sport if it exists in the list
      this.selectedSport = this.sportsCategories.find(s => 
        s.name.toLowerCase() === this.user.sports_category?.toLowerCase()
      ) || null;
    }
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  onSportChange(sport: any) {
    this.selectedSport = sport;
    this.formData.sport = sport.name;
  }

  onCoachChange(coach: any) {
    this.selectedCoach = coach;
    this.formData.coach_id = coach.id;
  }

  onClose() {
    this.closeModal.emit();
  }

  onSubmit() {
    if (!this.selectedCoach) {
      alert('Please select a coach');
      return;
    }

    if (!this.selectedSport) {
      alert('Please select a sports category');
      return;
    }

    if (!this.formData.date) {
      alert('Please select a date');
      return;
    }

    this.assignCoach.emit(this.formData);
  }

  // Prevent modal close when clicking inside modal
  onModalClick(event: Event) {
    event.stopPropagation();
  }

  // Close dropdowns when clicking outside
  @HostListener('document:click')
  onDocumentClick() {
    this.sportsDropdownOpen = false;
    this.coachesDropdownOpen = false;
  }
} 