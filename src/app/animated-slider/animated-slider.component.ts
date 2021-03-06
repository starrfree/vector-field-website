import { Component, ElementRef, HostListener, Input, OnInit, Output, ViewChild, EventEmitter } from '@angular/core';
import { DeviceDetectorService } from 'ngx-device-detector';

@Component({
  selector: 'app-animated-slider',
  templateUrl: './animated-slider.component.html',
  styleUrls: ['./animated-slider.component.css']
})
export class AnimatedSliderComponent implements OnInit {
  @ViewChild('wrapper') private slider!: ElementRef
  @Input() min: number = 0
  @Input() max: number = 1
  
  private _value: number = 5;
  public get value(): number {
    return this._value
  }
  @Input() public set value(v: number) {
    this._value = v
    this.setTicks()
  }
  
  // value: number = 0.5
  @Output() valueChange = new EventEmitter<number>()
  @Output() onUp = new EventEmitter<any>()
  @Input() default: number = 0.5
  @Input() color: string = "#3273F6"
  @Input() icon: string | null = null
  ticks: number = 25
  selections: [boolean] = [false].constructor(this.ticks + 1);
  isDragged = false

  get height(): number {
    const slider = this.slider.nativeElement;
    return slider?.clientHeight ?? 0;
  }

  get positionY(): number {
    const slider = this.slider.nativeElement;
    const {x, y} = slider.getBoundingClientRect();
    return y;
  }

  constructor(private deviceService: DeviceDetectorService) { }

  ngOnInit(): void {
    this.setTicks()
    if (this.deviceService.isMobile()) {
      document.addEventListener("touchmove", (event: any) => {
        if (this.isDragged) {
          this.updateValue(event.touches[0].clientY);
          event.stopPropagation();
          event.preventDefault();
        }
      }, {
        passive: false
      });
    }
  }

  ngAfterViewInit(): void {
  }
  
  @HostListener('mousedown', ['$event'])
  public onMouseDown(event: any): void {
    if (!this.deviceService.isMobile()) {
      this.isDragged = true;
      this.updateValue(event.clientY, true);
    }
  }

  @HostListener('window:mousemove', ['$event'])
  public onMouseMove(event: any): void {
    if (!this.deviceService.isMobile()) {
      if (this.isDragged) {
        this.updateValue(event.clientY);
        event.stopPropagation();
        // event.prev entDefault();
      }
    }
  }

  @HostListener('touchstart', ['$event'])
  public onTouchDown(event: any): void {
    if (this.deviceService.isMobile()) {
      this.isDragged = true;
      this.updateValue(event.touches[0].clientY, true);
    }
  }

  @HostListener('window:mouseup')
  public onMouseUp(): void {
    if (this.isDragged) {
      this.onUp.emit()
    }
    this.isDragged = false;
  }

  @HostListener('window:touchend')
  public onTouchUp(): void {
    if (this.isDragged) {
      this.onUp.emit()
    }
    this.isDragged = false;
  }

  // prevent the dragstart event
  @HostListener('dragstart', ['$event'])
  public onDragStart(event: any): void {
    event.stopPropagation();
    event.preventDefault();
  }

  updateValue(offset: number, snap: boolean = false) {
    const prop = Math.min(Math.max((offset - this.positionY) / this.height, 0), 1)
    this.value = this.min + (1 - prop) * (this.max - this.min)
    if (snap && Math.abs(this.value - this.default) < 2 * (this.max - this.min) / this.ticks) {
      this.value = this.default
    }
    this.valueChange.emit(this.value)
    this.setTicks()
  }

  setTicks() {
    for (let i = 0; i < this.selections.length; i++) {
      if (i / this.ticks >= 1 - (this.value - this.min) / (this.max - this.min)) {
        this.selections[i] = true
      } else {
        this.selections[i] = false
      }
    }
  }

  barColor(i: number) {
    if (this.selections[i]) {
      return this.color
    } else {
      return 'rgb(180, 180, 180)'
    }
  }

  barWidth(i: number) {
    if (this.selections[i]) {
      const v = 1 - (this.value - this.min) / (this.max - this.min)
      const x = i / this.ticks
      const d = v - x 
      return `${5 * Math.exp(-d * d * 100) + 12}px`
    } else {
      return '10px'
    }
  }
}
