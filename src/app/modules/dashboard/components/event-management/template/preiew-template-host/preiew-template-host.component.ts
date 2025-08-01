import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PreviewTemplateComponent } from '../preview-template1/preview-template.component';
import { PreviewTemplate2Component } from '../preview-template2/preview-template2.component';
import { PreviewTemplate3Component } from '../preview-template3/preview-template3.component';
import { PreviewTemplate4Component } from '../preview-template4/preview-template4.component';
import { EventService } from 'src/app/core/services/event.service';

@Component({
  selector: 'app-preiew-template-host',
  imports: [CommonModule,PreviewTemplateComponent,PreviewTemplate2Component,PreviewTemplate3Component,PreviewTemplate4Component],
  templateUrl: './preiew-template-host.component.html',
  styleUrl: './preiew-template-host.component.css'
})
export class PreiewTemplateHostComponent {
  templateId: any;
  identification:any;
  eventDetails: any;
  constructor(private route: ActivatedRoute,) {
    this.route.paramMap.subscribe(p => {
      this.templateId = Number(p.get('id'));
      this.identification = p.get('identification'); 
      console.log("  this.identification",  this.identification);
    });
  }

 


}