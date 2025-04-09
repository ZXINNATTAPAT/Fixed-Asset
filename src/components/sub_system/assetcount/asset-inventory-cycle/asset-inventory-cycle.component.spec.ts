import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetInventoryCycleComponent } from './asset-inventory-cycle.component';

describe('AssetInventoryCycleComponent', () => {
  let component: AssetInventoryCycleComponent;
  let fixture: ComponentFixture<AssetInventoryCycleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssetInventoryCycleComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AssetInventoryCycleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
