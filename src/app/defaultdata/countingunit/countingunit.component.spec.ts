import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CountingunitComponent } from './countingunit.component';

describe('CountingunitComponent', () => {
  let component: CountingunitComponent;
  let fixture: ComponentFixture<CountingunitComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CountingunitComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CountingunitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
