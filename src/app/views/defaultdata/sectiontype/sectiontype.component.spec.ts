import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SectiontypeComponent } from './sectiontype.component';

describe('SectiontypeComponent', () => {
  let component: SectiontypeComponent;
  let fixture: ComponentFixture<SectiontypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SectiontypeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SectiontypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
