import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-cards',
  standalone: true,
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.css'],
  imports: [CommonModule],
})
export class InfrastructureManagementCardComponent implements OnChanges {
  @Input() countsData: any;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['countsData']) {
      console.log('countsData updated:', this.countsData);
    }
  }
}
