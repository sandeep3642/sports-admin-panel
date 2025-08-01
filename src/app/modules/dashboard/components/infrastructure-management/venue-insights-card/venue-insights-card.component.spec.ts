import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VenueInsightsCardComponent } from './venue-insights-card.component';

describe('VenueInsightsCardComponent', () => {
  let component: VenueInsightsCardComponent;
  let fixture: ComponentFixture<VenueInsightsCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VenueInsightsCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VenueInsightsCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
