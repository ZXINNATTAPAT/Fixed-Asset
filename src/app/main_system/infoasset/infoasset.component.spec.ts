import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoassetComponent } from './infoasset.component';

describe('InfoassetComponent', () => {
  let component: InfoassetComponent;
  let fixture: ComponentFixture<InfoassetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InfoassetComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(InfoassetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
