import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-event-heatmap',
  imports: [CommonModule, FormsModule],
  templateUrl: './event-heatmap.component.html',
  styleUrl: './event-heatmap.component.css'
})
export class EventHeatmapComponent implements OnChanges {
  @Input() certificateRepository: any;
  @Input() dropDownlist: any;
  timeFilterEvents: string = 'today';
  districtFilter: string = 'kolkata';
  @Output() districtChanged = new EventEmitter<string>();
  @Output() timeChanged = new EventEmitter<string>();

  ngOnChanges(changes: SimpleChanges) {
    if (changes['certificateRepository']) {
      console.log('certificateRepository in child:', this.certificateRepository);
    }
  }

  onDistrictChange(event: any) {
    this.districtFilter = event.target.value;
    this.districtChanged.emit(this.districtFilter);
  }

  onTimeChange(event: any) {
    this.districtFilter = event.target.value;
    this.districtChanged.emit(this.districtFilter);
  }
}
