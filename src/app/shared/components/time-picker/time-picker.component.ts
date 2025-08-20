import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-time-picker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './time-picker.component.html',
  styleUrls: ['./time-picker.component.css']
})
export class TimePickerComponent implements OnInit, OnChanges {
  @Input() value: string = '';
  @Input() placeholder: string = 'Select Time';
  @Input() disabled: boolean = false;
  @Output() valueChange = new EventEmitter<string>();

  isOpen = false;
  selectedHour = 12;
  selectedMinute = 0;
  selectedPeriod = 'AM';
  displayValue = '';

  hours = Array.from({ length: 12 }, (_, i) => i + 1);
  minutes = Array.from({ length: 60 }, (_, i) => i);

  constructor() {}

  ngOnInit() {
    this.parseValue();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['value'] && !changes['value'].firstChange) {
      console.log('🕐 TimePicker received new value:', this.value);
      this.parseValue();
    }
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.time-picker-container')) {
      this.isOpen = false;
    }
  }

  parseValue() {
    if (this.value) {
      console.log('🕐 Parsing time value:', this.value);
      const match = this.value.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
      if (match) {
        this.selectedHour = parseInt(match[1]);
        this.selectedMinute = parseInt(match[2]);
        this.selectedPeriod = match[3].toUpperCase();
        console.log('🕐 Parsed time:', { hour: this.selectedHour, minute: this.selectedMinute, period: this.selectedPeriod });
        this.updateDisplayValue(false); // Don't emit when parsing from parent
      } else {
        console.log('🕐 Failed to parse time value:', this.value);
      }
    }
  }

  togglePicker() {
    if (!this.disabled) {
      this.isOpen = !this.isOpen;
    }
  }

  selectHour(hour: number) {
    this.selectedHour = hour;
    this.updateDisplayValue();
  }

  selectMinute(minute: number) {
    this.selectedMinute = minute;
    this.updateDisplayValue();
  }

  selectPeriod(period: string) {
    this.selectedPeriod = period;
    this.updateDisplayValue();
  }

  updateDisplayValue(emitChange: boolean = true) {
    const hourStr = this.selectedHour.toString().padStart(2, '0');
    const minuteStr = this.selectedMinute.toString().padStart(2, '0');
    this.displayValue = `${hourStr}:${minuteStr} ${this.selectedPeriod}`;
    if (emitChange) {
      this.valueChange.emit(this.displayValue);
    }
  }

  formatMinute(minute: number): string {
    return minute.toString().padStart(2, '0');
  }

  closePicker() {
    this.isOpen = false;
  }
}
