import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { UserStatsCardComponent } from '../../stakeholder-management/user-stats-card/user-stats-card.component';

@Component({
  selector: 'app-allcreateevents',
  imports: [CommonModule,RouterModule],
  templateUrl: './allcreateevents.component.html',
  styleUrl: './allcreateevents.component.css'
})
export class AllcreateeventsComponent implements OnInit, OnChanges {
 @Input() eventsData: any = []; // Initialize with empty array as default
  @Input() sportsAchievement:any =[]
  // Make Array and typeof available in template
  Array = Array;
  getTypeOf = (value: any) => typeof value;
  
  // Track if data has been loaded
  dataLoaded = false;
  
  constructor(private router: Router) {
  }

  ngOnInit(): void {    
    // Mark as loaded if we have data
    if (this.eventsData && this.eventsData.length > 0) {
      this.dataLoaded = true;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['eventsData']) {      
      // Mark as loaded when we receive data
      if (this.eventsData && this.eventsData.length > 0) {
        this.dataLoaded = true;
      }
    }
  }

  trackByEvent(index: number, event: any): any {
    return event.id || index;
  }
  
  goToViewAllEvents() {
    this.router.navigate(['/dashboard/view-all-events']);
  }

  onImageError(event: any) {
    event.target.src = '../../../../../../assets/events/Indian Tennis player.svg';
  }

  formatTime(time: string): string {
    const [hour, minute] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(hour, minute);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  getStatusClasses(status: string): string {
    const statusLower = status.toLowerCase();
    
    switch (statusLower) {
      case 'pending verification':
        return 'bg-orange-100 text-orange-700';
      case 'on going':
      case 'ongoing':
        return 'bg-green-100 text-green-700';
      case 'upcoming':
        return 'bg-yellow-100 text-yellow-700';
      case 'verified event':
        return 'bg-blue-100 text-blue-700';
      case 'past event':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-orange-100 text-orange-700'; // Default to pending verification style
    }
  }

  getStatusIcon(status: string): string {
    const statusLower = status.toLowerCase();
    
    switch (statusLower) {
      case 'pending verification':
        return 'fa fa-clock';
      case 'on going':
      case 'ongoing':
        return 'fa fa-play-circle';
      case 'upcoming':
        return 'fa fa-hourglass-half';
      case 'verified event':
        return 'fa fa-check-circle';
      case 'past event':
        return 'fa fa-clock-o';
      default:
        return 'fa fa-clock'; // Default to clock icon
    }
  }
}
