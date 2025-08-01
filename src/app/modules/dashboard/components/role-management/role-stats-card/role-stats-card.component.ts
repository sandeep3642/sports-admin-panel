import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-role-stats-card',
  standalone: true,
  templateUrl: './role-stats-card.component.html',
  styleUrl: './role-stats-card.component.css'
})
export class RoleStatsCardComponent implements OnChanges {
  @Input() countsData: any;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['countsData']) {
      console.log("countsData updated..:", this.countsData);
    }
  }
}
