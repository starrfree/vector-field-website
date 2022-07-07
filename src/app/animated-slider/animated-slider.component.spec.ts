import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnimatedSliderComponent } from './animated-slider.component';

describe('AnimatedSliderComponent', () => {
  let component: AnimatedSliderComponent;
  let fixture: ComponentFixture<AnimatedSliderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AnimatedSliderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AnimatedSliderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
