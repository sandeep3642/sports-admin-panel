import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicationRejectionComponent } from './application-rejection.component';

describe('ReqestInfoComponent', () => {
  let component: ApplicationRejectionComponent;
  let fixture: ComponentFixture<ApplicationRejectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApplicationRejectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApplicationRejectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
