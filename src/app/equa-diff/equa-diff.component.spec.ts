import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EquaDiffComponent } from './equa-diff.component';

describe('EquaDiffComponent', () => {
  let component: EquaDiffComponent;
  let fixture: ComponentFixture<EquaDiffComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EquaDiffComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EquaDiffComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
