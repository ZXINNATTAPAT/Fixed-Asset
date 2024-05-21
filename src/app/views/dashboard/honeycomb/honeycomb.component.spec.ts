import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HoneycombComponent } from './honeycomb.component';

describe('HoneycombComponent', () => {
  let component: HoneycombComponent;
  let fixture: ComponentFixture<HoneycombComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HoneycombComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HoneycombComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
