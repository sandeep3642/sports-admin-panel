import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventHeatmapComponent } from './event-heatmap.component';

describe('EventHeatmapComponent', () => {
  let component: EventHeatmapComponent;
  let fixture: ComponentFixture<EventHeatmapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventHeatmapComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventHeatmapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
