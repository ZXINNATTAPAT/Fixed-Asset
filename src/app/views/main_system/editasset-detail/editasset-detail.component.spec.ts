import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditassetDetailComponent } from './editasset-detail.component';

describe('EditassetDetailComponent', () => {
  let component: EditassetDetailComponent;
  let fixture: ComponentFixture<EditassetDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditassetDetailComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditassetDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
