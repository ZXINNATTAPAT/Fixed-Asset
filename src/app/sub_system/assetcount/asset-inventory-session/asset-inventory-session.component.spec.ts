import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetInventorySessionComponent } from './asset-inventory-session.component';

describe('AssetInventorySessionComponent', () => {
  let component: AssetInventorySessionComponent;
  let fixture: ComponentFixture<AssetInventorySessionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssetInventorySessionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AssetInventorySessionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
