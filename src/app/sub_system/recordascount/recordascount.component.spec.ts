import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecordascountComponent } from './recordascount.component';

describe('RecordascountComponent', () => {
  let component: RecordascountComponent;
  let fixture: ComponentFixture<RecordascountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecordascountComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RecordascountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
