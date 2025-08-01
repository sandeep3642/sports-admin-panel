import { TestBed } from '@angular/core/testing';



describe('VenueAnalyticsService', () => {
  let service: VenueAnalyticsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VenueAnalyticsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
