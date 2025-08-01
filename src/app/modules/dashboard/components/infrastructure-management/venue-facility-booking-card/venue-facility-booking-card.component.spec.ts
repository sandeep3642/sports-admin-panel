import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VenueFacilityBookingCardComponent } from './venue-facility-booking-card.component';

describe('VenueFacilityBookingCardComponent', () => {
  let component: VenueFacilityBookingCardComponent;
  let fixture: ComponentFixture<VenueFacilityBookingCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VenueFacilityBookingCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VenueFacilityBookingCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
