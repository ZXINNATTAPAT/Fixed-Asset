import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SellassetsComponent } from './sellassets.component';

describe('SellassetsComponent', () => {
  let component: SellassetsComponent;
  let fixture: ComponentFixture<SellassetsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SellassetsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SellassetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
