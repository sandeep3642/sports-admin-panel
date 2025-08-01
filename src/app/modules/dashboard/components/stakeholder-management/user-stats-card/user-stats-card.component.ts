import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-user-stats-card',
  standalone: true,
  templateUrl: './user-stats-card.component.html',
  styleUrl: './user-stats-card.component.css'
})
export class UserStatsCardComponent implements OnChanges {
  @Input() countsData: any;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['countsData']) {
      console.log("countsData updated:", this.countsData);
    }
  }
}
