import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Tablewiget4Component } from './tablewiget4.component';

describe('Tablewiget4Component', () => {
  let component: Tablewiget4Component;
  let fixture: ComponentFixture<Tablewiget4Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Tablewiget4Component]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(Tablewiget4Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
