import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetDetails2Component } from './asset-details2.component';

describe('AssetDetails2Component', () => {
  let component: AssetDetails2Component;
  let fixture: ComponentFixture<AssetDetails2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssetDetails2Component]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AssetDetails2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
