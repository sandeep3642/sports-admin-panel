import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-event-heatmap',
  imports: [CommonModule],
  templateUrl: './event-heatmap.component.html',
  styleUrl: './event-heatmap.component.css'
})
export class EventHeatmapComponent implements OnChanges {
  @Input() certificateRepository: any;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['certificateRepository']) {
      console.log('certificateRepository in child:', this.certificateRepository);
    }
  }
}
