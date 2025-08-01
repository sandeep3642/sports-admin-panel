import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChoosetemplateComponent } from './choosetemplate.component';

describe('ChoosetemplateComponent', () => {
  let component: ChoosetemplateComponent;
  let fixture: ComponentFixture<ChoosetemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChoosetemplateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChoosetemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
