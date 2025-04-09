import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResponsiblepersonComponent } from './responsibleperson.component';

describe('ResponsiblepersonComponent', () => {
  let component: ResponsiblepersonComponent;
  let fixture: ComponentFixture<ResponsiblepersonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResponsiblepersonComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ResponsiblepersonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
