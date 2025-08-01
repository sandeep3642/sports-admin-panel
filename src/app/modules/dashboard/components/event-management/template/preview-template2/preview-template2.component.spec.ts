import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviewTemplate2Component } from './preview-template2.component';

describe('PreviewTemplate2Component', () => {
  let component: PreviewTemplate2Component;
  let fixture: ComponentFixture<PreviewTemplate2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PreviewTemplate2Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PreviewTemplate2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
