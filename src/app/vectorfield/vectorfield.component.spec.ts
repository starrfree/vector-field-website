import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VectorfieldComponent } from './vectorfield.component';

describe('VectorfieldComponent', () => {
  let component: VectorfieldComponent;
  let fixture: ComponentFixture<VectorfieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VectorfieldComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VectorfieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
