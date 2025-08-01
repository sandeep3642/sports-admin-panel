import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VenueAnalyticsDistrictCardComponent } from './venue-analytics-district-card.component';

describe('VenueAnalyticsDistrictCardComponent', () => {
  let component: VenueAnalyticsDistrictCardComponent;
  let fixture: ComponentFixture<VenueAnalyticsDistrictCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VenueAnalyticsDistrictCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VenueAnalyticsDistrictCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
