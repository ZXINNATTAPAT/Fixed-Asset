import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThailandMapComponent } from './thailand-map.component';

describe('ThailandMapComponent', () => {
  let component: ThailandMapComponent;
  let fixture: ComponentFixture<ThailandMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThailandMapComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ThailandMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
