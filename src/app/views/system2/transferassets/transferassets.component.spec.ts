import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransferassetsComponent } from './transferassets.component';

describe('TransferassetsComponent', () => {
  let component: TransferassetsComponent;
  let fixture: ComponentFixture<TransferassetsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransferassetsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TransferassetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
