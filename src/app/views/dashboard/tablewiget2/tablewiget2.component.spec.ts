import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Tablewiget2Component } from './tablewiget2.component';

describe('Tablewiget2Component', () => {
  let component: Tablewiget2Component;
  let fixture: ComponentFixture<Tablewiget2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Tablewiget2Component]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(Tablewiget2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
