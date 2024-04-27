import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetTableComponent } from './asset-table.component';

describe('AssetTableComponent', () => {
  let component: AssetTableComponent;
  let fixture: ComponentFixture<AssetTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssetTableComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AssetTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
