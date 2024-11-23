import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetcountComponent } from './assetcount.component';

describe('AssetcountComponent', () => {
  let component: AssetcountComponent;
  let fixture: ComponentFixture<AssetcountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssetcountComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AssetcountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
