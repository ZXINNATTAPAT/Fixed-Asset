import { TestBed } from '@angular/core/testing';

import { ApiService } from '../../../coreui-free-angular-admin-template/src/app/api-service.service';

describe('ApiService', () => {
  let service: ApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
