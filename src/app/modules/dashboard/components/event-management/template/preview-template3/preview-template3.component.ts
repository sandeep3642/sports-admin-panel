import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { EventService } from 'src/app/core/services/event.service';

@Component({
  selector: 'app-preview-template3',
  imports: [CommonModule],
  templateUrl: './preview-template3.component.html',
  styleUrl: './preview-template3.component.css'
})
export class PreviewTemplate3Component {
  @Input() templateId:any;
  @Input() identification:any;
  eventDetails:any;
  constructor(private router: Router,private eventService: EventService) {}

  ngOnInit() {
    console.log('templateId:', this.templateId);
    if(this.identification==='edit'){
      this.getEventDetails();
    }
  }

  goBack() {
    this.router.navigate(['dashboard/event-management']);
  }

  useTemplate() {
    this.router.navigate(['dashboard/template-form/',this.templateId]);
  }

  getEventDetails() {
    const payload = { event_id: this.templateId };
    this.eventService.getDetails(payload).subscribe(
      (res) => {
        this.eventDetails = res?.details;
        console.log('Event Details:', res);
      },
      (err) => {
        console.error('Error fetching event details:', err);
      }
    );
  }
  
}
