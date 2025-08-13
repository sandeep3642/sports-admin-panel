import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-role-stats-card',
  standalone: true,
  templateUrl: './role-stats-card.component.html',
  styleUrl: './role-stats-card.component.css'
})
export class RoleStatsCardComponent implements OnChanges {
  @Input() countsData: any;

  // Safe getters with default values
  get totalAssignedRoles() {
    return this.countsData?.total_assigned_roles || { counts: 0, percentage: 0 };
  }

  get activeRoles() {
    return this.countsData?.active_roles || { counts: 0, percentage: 0 };
  }

  get inactiveRoles() {
    return this.countsData?.inactive_roles || { counts: 0, percentage: 0 };
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['countsData']) {
      console.log("countsData updated..:", this.countsData);
    }
  }
}
