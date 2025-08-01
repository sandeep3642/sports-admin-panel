import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VenueFacilitiesCardComponent } from './venue-facilities-card.component';

describe('VenueFacilitiesCardComponent', () => {
  let component: VenueFacilitiesCardComponent;
  let fixture: ComponentFixture<VenueFacilitiesCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VenueFacilitiesCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VenueFacilitiesCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
