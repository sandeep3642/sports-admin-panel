import { CommonModule } from '@angular/common';
import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-choosetemplate',
  templateUrl: './choosetemplate.component.html',
  imports: [CommonModule],
  styleUrls: ['./choosetemplate.component.css']
})
export class ChoosetemplateComponent {
  @Output() close = new EventEmitter<void>();

  onClose() {
    this.close.emit();
  }
}
