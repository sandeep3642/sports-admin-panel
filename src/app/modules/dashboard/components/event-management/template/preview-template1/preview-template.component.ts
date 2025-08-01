import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { EventService } from 'src/app/core/services/event.service';

@Component({
  selector: 'app-preview-template',
  templateUrl: './preview-template.component.html',
  imports: [CommonModule],
  styleUrls: ['./preview-template.component.css']
})
export class PreviewTemplateComponent {
  @Input() templateId:any;
  @Input() identification:any;
  eventDetails:any;
  event = {
    title: 'State Level Athletics Championship 2025',
    date: 'May 10–12, 2025',
    time: '8:00 AM – 6:00 PM',
    location: 'Salt Lake Stadium',
    image: '../../../../../../assets/events/templateprivew.svg',
    mapImage: 'assets/images/map-placeholder.png', // Replace with your map image or use a real map
    venueAddress: 'Salt Lake Stadium, Sector III, Kolkata',
    description: `This is a state-level athletics championship for young talent across West Bengal. It offers a platform to compete in track and field events with professional standards. The event promotes sportsmanship, fitness, and community spirit. Top performers may be selected for national training camps. It’s where ambition meets opportunity — for athletes, coaches, and fans alike.

Join us for the most anticipated state-level athletics meet of the year! The State Level Athletics Championship 2025 brings together the best young talent from across West Bengal for three days of thrilling competition. Athletes will compete in various track and field events, aiming for medals, recognition, and potential selection to the national training camp.

This event serves as a platform to scout future stars and foster a culture of sportsmanship and excellence across the state.`,
    organizer: 'West Bengal Sports',
    organizerDesc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur eget vestibulum libero. Proin sagittis maximus sem, sed pulvinar quam cursus vel. Donec nec gravida nibh. Suspendisse tincidunt.',
    organizerInsta: 'instagram.com/sportsevent',
    faqs: [
      {
        question: 'Who can participate in this event?',
        answer: 'Athletes must be residents of West Bengal and fall under the defined age groups (U-14, U-17, U-19, Senior).',
        open: true
      },
      {
        question: 'Can coaches attend the event?',
        answer: 'Yes, coaches are welcome to attend and support their athletes.',
        open: false
      },
      {
        question: 'What if it rains?',
        answer: 'The event will be rescheduled in case of inclement weather. Updates will be provided to all participants.',
        open: false
      },
      {
        question: 'How do I register?',
        answer: 'You can register online through our official website or at the venue on the event day.',
        open: false
      }
    ],
    schedule: [
      {
        day: 'Day 1',
        date: '26 December 2025',
        items: [
          { title: '800m Run', desc: '', time: '', maxSeats: '', image: '' },
          { title: '4x100m & 4x400m Relays', desc: '', time: '', maxSeats: '', image: '' },
          {
            title: '1. 4x100m & 4x400m Relays',
            desc: 'Lorem ipsum dolor site amet the best consectetur diam nerd adipiscing elites sed diam nonummy nibh the ebest eiusmod tincidunt ut laoreet dolore magna aliquam erat',
            time: '3PM – 6PM',
            maxSeats: '2,250 seats',
            image: 'assets/images/event-detail.jpg'
          }
        ]
      },
      {
        day: 'Day 2',
        date: '27 December 2025',
        items: [
          { title: '1500m Run', desc: '', time: '', maxSeats: '', image: '' },
          { title: 'Long Jump', desc: '', time: '', maxSeats: '', image: '' }
        ]
      },
      {
        day: 'Day 3',
        date: '28 December 2025',
        items: [
          { title: 'Shot Put', desc: '', time: '', maxSeats: '', image: '' },
          { title: 'Discus Throw', desc: '', time: '', maxSeats: '', image: '' }
        ]
      }
    ],
    included: [
      '800m Run', '1500m Run', '4x100m & 4x400m Relays', 'Long Jump', 'High Jump', 'Shot Put', 'Discus Throw', '200m Sprint'
    ],
    prizes: [
      'Gold, Silver & Bronze Medals for top 3 finishers in each category',
      'Official Participation Certificates for all athletes',
      '“Best Athlete” awards (Boys & Girls in each age group)',
      'Shortlisted candidates to be considered for state-level coaching & camps'
    ],
    documents: [
      'Aadhaar Card / School ID',
      'Medical Fitness Certificate',
      'District Recommendation Letter (optional)'
    ],
    travel: [
      'Nearest Metro Station: Salt Lake Stadium (Line 2 – Green Line)',
      'Railway Access: Sealdah Station (10 km)',
      'Airport: Netaji Subhas Chandra Bose Intl. Airport (12 km)',
      'Limited rooms available for district athletes (upon request)',
      'Nearby hotels & hostels available (see Travel Desk)'
    ]
  };

  selectedDay = 0;

  constructor(private router: Router,private eventService: EventService) {
    
  }

  ngOnInit() {
    console.log('templateId:', this.templateId);
    if(this.identification==='edit'){
      this.getEventDetails();
    }

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

  goBack() {
    this.router.navigate(['dashboard/event-management']);
  }

  useTemplate() {
    this.router.navigate(['dashboard/template-form/',this.templateId]);
  }

  editTemplate() {
    this.eventService.getDetails({ event_id: this.templateId }).subscribe(
      res => {
        // Option 1a: Pass data via router state (Angular 7+)
        this.router.navigate(
          ['dashboard/template-form/', this.templateId,'edit'],
          { state: { eventDetails: res.details } }
        );
      }
    );
  }

  toggleFaq(idx: number) {
    this.event.faqs = this.event.faqs.map((faq, i) => ({ ...faq, open: i === idx ? !faq.open : false }));
  }
}
