import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TablewigetComponent } from './tablewiget.component';

describe('TablewigetComponent', () => {
  let component: TablewigetComponent;
  let fixture: ComponentFixture<TablewigetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TablewigetComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TablewigetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
