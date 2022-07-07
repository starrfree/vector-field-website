import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { ShaderService } from '../shader.service';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.css']
})
export class ToolbarComponent implements OnInit {
  @Input() parameters = {
    x: "x",
    y: "y",
    t: 0,
    minT: 0,
    maxT: 10,
    xRange: [-1, 1],
    yRange: [-1, 1],
    lifetime: 100,
    particleCount: 10000,
    normalize: false,
    speed: 1,
    color1: [1, 1, 1, 1],
    color2: [0.4, 0.4, 1, 1]
  }
  @Input() x = ""
  @Input() y = ""
  @Output() parametersChange = new EventEmitter<any>()
  error = {
    x: false,
    y: false
  }
  color1 = "#ffffff"
  color2 = "#6666ff"

  constructor(private shaderService: ShaderService) { }

  ngOnInit(): void {

  }

  ngAfterViewInit(): void {
    this.checkXY()
  }

  blur() {
    (document.activeElement as HTMLElement).blur();
    window.onblur = function () {
      (document.activeElement as HTMLElement).blur();
    };
  }
  
  submitXY() {
    this.checkXY()
    if (!this.error.x && !this.error.y) {
      this.parameters.x = this.x
      this.parameters.y = this.y
      this.parametersChange.emit(this.parameters)
    }
  }

  submitColors() {
    this.parameters.color1 = this.hexToRGB(this.color1) || this.parameters.color1
    this.parameters.color2 = this.hexToRGB(this.color2) || this.parameters.color2
  }

  checkXY() {
    if (!this.shaderService.didInit) {
      return
    }
    var xError = !this.shaderService.checkUpdateShader(this.x, "y")
    var yError = !this.shaderService.checkUpdateShader("x", this.y)
    this.error = {
      x: xError,
      y: yError
    }
  }

  hexToRGB(hex: string) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [parseInt(result[1], 16) / 255, parseInt(result[2], 16) / 255, parseInt(result[3], 16) / 255, 1] : null
  }

  setMinT(event: any) {
    var x = Number(event)
    if (isNaN(x) || !isFinite(x)) {
      x = 0
    }
    this.parameters.minT = x
  }

  setMaxT(event: any) {
    var x = Number(event)
    if (isNaN(x) || !isFinite(x)) {
      x = 0
    }
    this.parameters.maxT = x
  }

  setMinX(event: any) {
    var x = Number(event)
    if (isNaN(x) || !isFinite(x)) {
      x = 0
    }
    this.parameters.xRange[0] = x
  }

  setMaxX(event: any) {
    var x = Number(event)
    if (isNaN(x) || !isFinite(x)) {
      x = 0
    }
    this.parameters.xRange[1] = x
  }
  
  setMinY(event: any) {
    var x = Number(event)
    if (isNaN(x) || !isFinite(x)) {
      x = 0
    }
    this.parameters.yRange[0] = x
  }

  setMaxY(event: any) {
    var x = Number(event)
    if (isNaN(x) || !isFinite(x)) {
      x = 0
    }
    this.parameters.yRange[1] = x
  }
}
