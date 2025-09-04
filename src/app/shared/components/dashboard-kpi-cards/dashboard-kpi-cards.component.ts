import { Component, Input } from '@angular/core';
import { NgClass, NgIf, NgFor } from '@angular/common';

@Component({
  selector: 'app-dashboard-kpi-cards',
  imports: [NgClass, NgIf, NgFor],
  templateUrl: './dashboard-kpi-cards.component.html',
  styleUrls: ['./dashboard-kpi-cards.component.css']
})
export class DashboardKpiCardsComponent {
  @Input() analyticsData: any;
  @Input() isLoading: boolean = false;
  @Input() error: string = '';

  constructor() { }
}
