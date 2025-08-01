// calendar.component.ts
import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';

interface CalendarEvent {
  id: number;
  title: string;
  sport_category: string;
  start_time: string;
  end_time: string;
  venue: string;
  capacity: number;
  host: string;
  isMultiDay: boolean;
  event_start_date: string;
  event_end_date: string;
}

interface CalendarDay {
  date: string;
  day: number;
  month: number;
  year: number;
  dayName: string;
  events: CalendarEvent[];
  total_events: number;
}

interface CalendarData {
  year: number;
  month: number;
  sport_type: string;
  view_type: string;
  calendar_data: CalendarDay[];
  total_events: number;
  unique_dates: number;
}

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css'],
  imports: [CommonModule],
})
export class CalendarComponent implements OnInit, OnChanges {
  @Input() calendar_events!: CalendarData;

  weekDays: string[] = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  monthNames: string[] = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  calendarGrid: (CalendarDay | null)[][] = [];
  currentMonth: number = 0;
  currentYear: number = 0;
  currentSportType: string = '';
  currentViewType: string = 'week';

  ngOnInit(): void {
    if (this.calendar_events) {
      this.initializeCalendar();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['calendar_events'] && this.calendar_events) {
      this.initializeCalendar();
    }
  }

  initializeCalendar(): void {
    this.currentMonth = this.calendar_events.month;
    this.currentYear = this.calendar_events.year;
    this.currentSportType = this.calendar_events.sport_type;
    this.currentViewType = this.calendar_events.view_type;
    this.generateCalendarGrid();
  }

  generateCalendarGrid(): void {
    if (this.currentViewType === 'week') {
      this.generateWeekView();
    } else {
      this.generateMonthView();
    }
  }

  generateWeekView(): void {
    const weekRow: (CalendarDay | null)[] = [];

    // Create a map for quick event lookup
    const eventMap = new Map<string, CalendarDay>();
    this.calendar_events.calendar_data.forEach((day) => {
      eventMap.set(day.date, day);
    });

    // Get the week containing events or current week
    let referenceDate: Date;
    if (this.calendar_events.calendar_data.length > 0) {
      referenceDate = new Date(this.calendar_events.calendar_data[0].date);
    } else {
      // If no events, show current week of the specified month/year
      referenceDate = new Date(this.currentYear, this.currentMonth - 1, 1);
    }

    // Find the start of the week (Sunday)
    const startOfWeek = new Date(referenceDate);
    const dayOfWeek = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek);

    // Generate 7 days for the week
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startOfWeek);
      currentDate.setDate(startOfWeek.getDate() + i);

      const dateString = this.formatDate(currentDate);
      const dayData = eventMap.get(dateString);

      if (dayData) {
        weekRow.push(dayData);
      } else {
        // Create empty day
        weekRow.push({
          date: dateString,
          day: currentDate.getDate(),
          month: currentDate.getMonth() + 1,
          year: currentDate.getFullYear(),
          dayName: this.getDayName(currentDate.getDay()),
          events: [],
          total_events: 0,
        });
      }
    }

    this.calendarGrid = [weekRow];
  }

  generateMonthView(): void {
    const firstDay = new Date(this.currentYear, this.currentMonth - 1, 1);
    const lastDay = new Date(this.currentYear, this.currentMonth, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const eventMap = new Map<string, CalendarDay>();
    this.calendar_events.calendar_data.forEach((day) => {
      eventMap.set(day.date, day);
    });

    this.calendarGrid = [];
    let currentDate = new Date(startDate);

    while (currentDate <= lastDay || this.calendarGrid.length < 6) {
      const week: (CalendarDay | null)[] = [];

      for (let i = 0; i < 7; i++) {
        const dateString = this.formatDate(currentDate);
        const dayData = eventMap.get(dateString);

        if (dayData) {
          week.push(dayData);
        } else if (currentDate.getMonth() === this.currentMonth - 1) {
          week.push({
            date: dateString,
            day: currentDate.getDate(),
            month: currentDate.getMonth() + 1,
            year: currentDate.getFullYear(),
            dayName: this.getDayName(currentDate.getDay()),
            events: [],
            total_events: 0,
          });
        } else {
          week.push(null);
        }

        currentDate.setDate(currentDate.getDate() + 1);
      }

      this.calendarGrid.push(week);

      if (currentDate > lastDay && this.calendarGrid.length >= 4) {
        break;
      }
    }
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  getDayName(dayIndex: number): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayIndex];
  }

  getMonthName(): string {
    return this.monthNames[this.currentMonth - 1] || '';
  }

  getSportCategoryColor(category: string): string {
    const colors: { [key: string]: string } = {
      cricket: 'bg-green-200 text-green-800',
      tennis: 'bg-purple-200 text-purple-800',
      hockey: 'bg-red-200 text-red-800',
      basketball: 'bg-green-200 text-green-800',
      volleyball: 'bg-blue-200 text-blue-800',
      badminton: 'bg-blue-200 text-blue-800',
      'table tennis': 'bg-red-200 text-red-800',
      kabaddi: 'bg-purple-200 text-purple-800',
    };
    return colors[category.toLowerCase()] || 'bg-gray-200 text-gray-800';
  }

  onPreviousMonth(): void {
    // Emit event to parent component
    console.log('Previous month clicked');
  }

  onNextMonth(): void {
    // Emit event to parent component
    console.log('Next month clicked');
  }

  onSportCategoryChange(event: any): void {
    // Emit event to parent component
    console.log('Sport category changed:', event.target.value);
  }

  onViewTypeChange(event: any): void {
    // Emit event to parent component
    console.log('View type changed:', event.target.value);
  }

  onEventClick(event: CalendarEvent): void {
    // Emit event to parent component
    console.log('Event clicked:', event);
  }

  trackByWeek(index: number, week: (CalendarDay | null)[]): number {
    return index;
  }

  trackByDay(index: number, day: CalendarDay | null): string {
    return day ? day.date : `empty-${index}`;
  }

  trackByEventId(index: number, event: CalendarEvent): number {
    return event.id;
  }

  isToday(day: CalendarDay): boolean {
    const today = new Date();
    const todayString = this.formatDate(today);
    return day.date === todayString;
  }

  isCurrentMonth(day: CalendarDay): boolean {
    return day.month === this.currentMonth;
  }
}
