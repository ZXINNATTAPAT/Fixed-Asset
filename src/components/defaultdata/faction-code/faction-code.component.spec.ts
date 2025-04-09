import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FactionCodeComponent } from './faction-code.component';

describe('FactionCodeComponent', () => {
  let component: FactionCodeComponent;
  let fixture: ComponentFixture<FactionCodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FactionCodeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FactionCodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
