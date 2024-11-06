import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardinfoComponent } from './cardinfo.component';

describe('CardinfoComponent', () => {
  let component: CardinfoComponent;
  let fixture: ComponentFixture<CardinfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardinfoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CardinfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
