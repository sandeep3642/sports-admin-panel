import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'app-nft-header',
    templateUrl: './nft-header.component.html',
    standalone: true,
})
export class NftHeaderComponent implements OnInit {
  @Input() title!: string;
  constructor() {}

  ngOnInit(): void {}
}
