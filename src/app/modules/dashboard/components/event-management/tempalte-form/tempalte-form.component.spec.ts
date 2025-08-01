import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TempalteFormComponent } from './tempalte-form.component';

describe('TempalteFormComponent', () => {
  let component: TempalteFormComponent;
  let fixture: ComponentFixture<TempalteFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TempalteFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TempalteFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
