import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Tablewiget3Component } from './tablewiget3.component';

describe('Tablewiget3Component', () => {
  let component: Tablewiget3Component;
  let fixture: ComponentFixture<Tablewiget3Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Tablewiget3Component]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(Tablewiget3Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
