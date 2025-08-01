import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreiewTemplateHostComponent } from './preiew-template-host.component';

describe('PreiewTemplateHostComponent', () => {
  let component: PreiewTemplateHostComponent;
  let fixture: ComponentFixture<PreiewTemplateHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PreiewTemplateHostComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PreiewTemplateHostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
