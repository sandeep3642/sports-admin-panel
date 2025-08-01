import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewallEventsComponent } from './viewall-events.component';

describe('ViewallEventsComponent', () => {
  let component: ViewallEventsComponent;
  let fixture: ComponentFixture<ViewallEventsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewallEventsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewallEventsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
