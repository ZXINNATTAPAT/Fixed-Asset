import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetcategoryComponent } from './assetcategory.component';

describe('AssetcategoryComponent', () => {
  let component: AssetcategoryComponent;
  let fixture: ComponentFixture<AssetcategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssetcategoryComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AssetcategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
