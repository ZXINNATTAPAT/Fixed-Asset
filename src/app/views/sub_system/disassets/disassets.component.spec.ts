import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisassetsComponent } from './disassets.component';

describe('DisassetsComponent', () => {
  let component: DisassetsComponent;
  let fixture: ComponentFixture<DisassetsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DisassetsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DisassetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
