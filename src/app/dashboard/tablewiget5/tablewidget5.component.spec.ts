import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Tablewidget5Component } from './tablewidget5.component';

describe('Tablewidget5Component', () => {
  let component: Tablewidget5Component;
  let fixture: ComponentFixture<Tablewidget5Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Tablewidget5Component]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(Tablewidget5Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
