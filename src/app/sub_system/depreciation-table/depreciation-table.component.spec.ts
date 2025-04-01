import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DepreciationTableComponent } from './depreciation-table.component';

describe('DepreciationTableComponent', () => {
  let component: DepreciationTableComponent;
  let fixture: ComponentFixture<DepreciationTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DepreciationTableComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DepreciationTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
