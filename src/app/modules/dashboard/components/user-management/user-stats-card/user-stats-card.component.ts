import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-user-stats-card',
  standalone: true,
  templateUrl: './user-stats-card.component.html',
  styleUrl: './user-stats-card.component.css',
  imports:[CommonModule]
})
export class UserStatsCardComponent implements OnChanges {
  @Input() athletesData: any;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['athletesData']) {
      console.log("athletesData updated:", this.athletesData);
    }
  }
}
