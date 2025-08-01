import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviewTemplate4Component } from './preview-template4.component';

describe('PreviewTemplate4Component', () => {
  let component: PreviewTemplate4Component;
  let fixture: ComponentFixture<PreviewTemplate4Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PreviewTemplate4Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PreviewTemplate4Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
