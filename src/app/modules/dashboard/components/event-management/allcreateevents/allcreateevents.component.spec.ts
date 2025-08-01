import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllcreateeventsComponent } from './allcreateevents.component';

describe('AllcreateeventsComponent', () => {
  let component: AllcreateeventsComponent;
  let fixture: ComponentFixture<AllcreateeventsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllcreateeventsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllcreateeventsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
