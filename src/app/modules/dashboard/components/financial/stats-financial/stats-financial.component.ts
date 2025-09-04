import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

interface DashboardAnalytics {
  totalApplications: {
    count: number;
    change: number;
    period: string;
  };
  applicationVerified: {
    count: number;
    change: number;
    period: string;
  };
  applicationAwaitingVerification: {
    count: number;
    change: number;
    period: string;
  };
  applicationRejected: {
    count: number;
    change: number;
    period: string;
  };
}

@Component({
  selector: 'app-stats-financial',
  imports: [CommonModule],
  templateUrl: './stats-financial.component.html',
  styleUrl: './stats-financial.component.css'
})
export class StatsFinancialComponent  {
  @Input() analyticsData:any;

 
}
