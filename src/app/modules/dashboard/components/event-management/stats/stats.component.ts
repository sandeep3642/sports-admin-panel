import { Component, Input, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-stats',
  standalone: true,
  templateUrl: './stats.component.html',
  styleUrl: './stats.component.css'
})
export class StatsComponent {
  @Input() countsData: any;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['countsData']) {
      console.log("countsData updated:", this.countsData);
    }
  }
}
