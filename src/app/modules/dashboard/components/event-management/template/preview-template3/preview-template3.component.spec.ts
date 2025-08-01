import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviewTemplate3Component } from './preview-template3.component';

describe('PreviewTemplate3Component', () => {
  let component: PreviewTemplate3Component;
  let fixture: ComponentFixture<PreviewTemplate3Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PreviewTemplate3Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PreviewTemplate3Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
