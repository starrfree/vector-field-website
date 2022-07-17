import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { ShaderService } from '../shader.service';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.css']
})
export class ToolbarComponent implements OnInit {
  @Input() parameters: any = {
    x: "x",
    y: "y",
    z: "z",
    t: 0,
    minT: 0,
    maxT: 10,
    xRange: [-1, 1],
    yRange: [-1, 1],
    zRange: [-1, 1],
    lifetime: 100,
    particleCount: 10000,
    normalize: false,
    speed: 1,
    showCube: true,
    showAxes: true,
    color1: [1, 1, 1, 1],
    color2: [0.4, 0.4, 1, 1]
  }
  @Output() parametersChange = new EventEmitter<any>()
  @Input() x = ""
  @Input() y = ""
  @Input() z = ""
  @Input() ranges = {
    minT: 0,
    maxT: 10,
    xRange: [-1, 1],
    yRange: [-1, 1],
    zRange: [-1, 1]
  }
  error = {
    x: false,
    y: false,
    z: false
  }
  
  _color1: string = "#ffffff"
  get color1() : string {
    return this._color1
  }
  set color1(val: string) {
    this._color1 = val
  }

  _color2: string = "#6666ff"
  get color2() : string {
    return this._color2
  }
  set color2(val: string) {
    this._color2 = val
  }

  constructor(private shaderService: ShaderService,
    private location: Location, private router: Router, private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    // this.changeURL()
    this.shaderService.onInit.subscribe(val => {
      this.activatedRoute.queryParamMap.subscribe((map: any) => {
        var params = map.params
        var parameters: any = this.parameters
        var keys = Object.keys(this.parameters)
        keys.forEach(key => {
          if (params[key]) {
            parameters[key] = params[key]
          } else {
            params[key] = parameters[key]
          }
        });
        var error = this.checkParams(parameters)
        if (!error) {
          parameters.particleCount = Number(parameters.particleCount)
          parameters.speed = Number(parameters.speed)
          parameters.lifetime = Number(parameters.lifetime)
          parameters.normalize = parameters.normalize == "true" ? true : false
          parameters.showAxes = parameters.showAxes == "false" ? false : true
          parameters.showCube = parameters.showCube == "false" ? false : true
          parameters.minT = Number(parameters.minT)
          parameters.maxT = Number(parameters.maxT)
          parameters.t = Number(parameters.t)
          this.color1 = this.rgbToHex(parameters.color1[0] * 255, parameters.color1[1] * 255, parameters.color1[2] * 255)
          this.color2 = this.rgbToHex(parameters.color2[0] * 255, parameters.color2[1] * 255, parameters.color2[2] * 255)
          this.parameters = parameters
          this.parametersChange.emit(this.parameters)
        }
      })
    })
  }

  open2D() {
    window.location.href = 'https://vectorfield-dot-starfree.ew.r.appspot.com'
    // window.location.href = 'http://localhost:4200'
  }

  goToRoot() {
    this.router.navigate(['/'])
  }

  changeURL() {
    var params = Object.assign({}, this.parameters)
    params.t = 0
    const url = this.router.createUrlTree([], {relativeTo: this.activatedRoute, queryParams: params}).toString()
    this.location.go(url);
  }

  blur() {
    (document.activeElement as HTMLElement).blur();
    window.onblur = function () {
      (document.activeElement as HTMLElement).blur();
    };
  }
  
  submitXY() {
    this.checkXY()
    if (!this.error.x && !this.error.y  && !this.error.z) {
      this.parameters.x = this.x
      this.parameters.y = this.y
      this.parameters.z = this.z
      this.parametersChange.emit(this.parameters)
      this.changeURL()
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
    var xError = !this.shaderService.checkUpdateShader(this.x, "y", "z")
    var yError = !this.shaderService.checkUpdateShader("x", this.y, "z")
    var zError = !this.shaderService.checkUpdateShader("x", "y", this.z)
    this.error = {
      x: xError,
      y: yError,
      z: zError
    }
  }

  checkParams(params: any) {
    var xError = !this.shaderService.checkUpdateShader(params.x, "y", "z")
    var yError = !this.shaderService.checkUpdateShader("x", params.y, "z")
    var zError = !this.shaderService.checkUpdateShader("x", "y", params.z)
    var particleCountError = isNaN(Number(params.particleCount))
    var lifetimeError = isNaN(Number(params.lifetime))
    var speedError = isNaN(Number(params.speed))
    var minTError = isNaN(Number(params.minT))
    var maxTError = isNaN(Number(params.maxT))
    var tError = isNaN(Number(params.t))
    var minXError = isNaN(Number(params.xRange[0]))
    var maxXError = isNaN(Number(params.xRange[1]))
    var minYError = isNaN(Number(params.yRange[0]))
    var maxYError = isNaN(Number(params.yRange[1]))
    var minZError = isNaN(Number(params.zRange[0]))
    var maxZError = isNaN(Number(params.zRange[1]))
    return xError || yError || zError || minTError || maxTError || minXError || maxXError || minYError || maxYError || minZError || maxZError || particleCountError || lifetimeError || speedError || tError
  }

  hexToRGB(hex: string) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [parseInt(result[1], 16) / 255, parseInt(result[2], 16) / 255, parseInt(result[3], 16) / 255, 1] : null
  }

  componentToHex(c: number) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
  }

  rgbToHex(r: number, g: number, b: number) {
    return "#" + this.componentToHex(r) + this.componentToHex(g) + this.componentToHex(b);
  }

  setMinT() {
    var n = Number(this.ranges.minT)
    if (isNaN(n) || !isFinite(n)) {
      n = 0
    }
    this.parameters.minT = n
  }

  setMaxT() {
    var n = Number(this.ranges.maxT)
    if (isNaN(n) || !isFinite(n)) {
      n = 0
    }
    this.parameters.maxT = n
  }

  setMinX() {
    var n = Number(this.ranges.xRange[0])
    if (isNaN(n) || !isFinite(n)) {
      n = 0
    }
    this.parameters.xRange[0] = n
  }

  setMaxX() {
    var n = Number(this.ranges.xRange[1])
    if (isNaN(n) || !isFinite(n)) {
      n = 0
    }
    this.parameters.xRange[1] = n
  }
  
  setMinY() {
    var n = Number(this.ranges.yRange[0])
    if (isNaN(n) || !isFinite(n)) {
      n = 0
    }
    this.parameters.yRange[0] = n
  }

  setMaxY() {
    var n = Number(this.ranges.yRange[1])
    if (isNaN(n) || !isFinite(n)) {
      n = 0
    }
    this.parameters.yRange[1] = n
  }

  setMinZ() {
    var n = Number(this.ranges.zRange[0])
    if (isNaN(n) || !isFinite(n)) {
      n = 0
    }
    this.parameters.zRange[0] = n
  }

  setMaxZ() {
    var n = Number(this.ranges.zRange[1])
    if (isNaN(n) || !isFinite(n)) {
      n = 0
    }
    this.parameters.zRange[1] = n
  }
}
