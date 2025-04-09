import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubassetComponent } from './subasset.component';

describe('SubassetComponent', () => {
  let component: SubassetComponent;
  let fixture: ComponentFixture<SubassetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubassetComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SubassetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
