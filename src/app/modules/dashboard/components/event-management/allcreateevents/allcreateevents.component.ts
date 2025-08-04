import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { UserStatsCardComponent } from '../../stakeholder-management/user-stats-card/user-stats-card.component';

@Component({
  selector: 'app-allcreateevents',
  imports: [CommonModule,RouterModule,UserStatsCardComponent],
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
    console.log("Constructor - eventsData:", this.eventsData);
  }

  ngOnInit(): void {
    console.log("ngOnInit - eventsData:", this.eventsData);
    console.log("ngOnInit - eventsData type:", typeof this.eventsData);
    console.log("ngOnInit - eventsData length:", this.eventsData?.length);
    
    // Mark as loaded if we have data
    if (this.eventsData && this.eventsData.length > 0) {
      this.dataLoaded = true;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['eventsData']) {
      console.log("ngOnChanges - eventsData changed:", this.eventsData);
      console.log("Previous value:", changes['eventsData'].previousValue);
      console.log("Current value:", changes['eventsData'].currentValue);
      console.log("Current value type:", typeof changes['eventsData'].currentValue);
      console.log("Current value length:", changes['eventsData'].currentValue?.length);
      
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

  formatTime(time: string): string {
    const [hour, minute] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(hour, minute);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
}
