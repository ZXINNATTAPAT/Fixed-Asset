import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertySellerComponent } from './property-seller.component';

describe('PropertySellerComponent', () => {
  let component: PropertySellerComponent;
  let fixture: ComponentFixture<PropertySellerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PropertySellerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PropertySellerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
