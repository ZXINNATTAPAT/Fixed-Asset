import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetDetails3Component } from './asset-details3.component';

describe('AssetDetails3Component', () => {
  let component: AssetDetails3Component;
  let fixture: ComponentFixture<AssetDetails3Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssetDetails3Component]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AssetDetails3Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
