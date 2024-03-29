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
  @Input() ranges = {
    minT: 0,
    maxT: 10,
    xRange: [-1, 1],
    yRange: [-1, 1]
  }
  @Output() parametersChange = new EventEmitter<any>()
  error = {
    x: false,
    y: false
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

  open3D() {
    this.activatedRoute.queryParamMap.subscribe((map: any) => {
      if (this.location.path(true) !== '') {
        var params: any = {...this.parameters}
        params.t = 0
        params.z = "0"
        params.zRange = [-1, 1]
        params.showCube = true
        params.showAxes = true
        var url = this.router.createUrlTree(['vectorfield3d.starfree.app/'], {relativeTo: this.activatedRoute, queryParams: params}).toString()
        url = url.slice(1)
        window.location.href = 'https://' + url
      } else {
        window.location.href = 'https://vectorfield3d.starfree.app/'
      }
    })
  }

  openSphere() {
    this.activatedRoute.queryParamMap.subscribe((map: any) => {
      if (this.location.path(true) !== '') {
        var params: any = {...this.parameters}
        params.t = 0
        delete params['xRange']
        delete params['yRange']
        params.showCube = true
        var url = this.router.createUrlTree(['vectorfield2s.starfree.app/'], {relativeTo: this.activatedRoute, queryParams: params}).toString()
        url = url.slice(1)
        window.location.href = 'https://' + url
      } else {
        window.location.href = 'https://vectorfield2s.starfree.app/'
      }
    })
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
    if (!this.error.x && !this.error.y) {
      this.parameters.x = this.x
      this.parameters.y = this.y
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
    var xError = !this.shaderService.checkUpdateShader(this.x, "y")
    var yError = !this.shaderService.checkUpdateShader("x", this.y)
    this.error = {
      x: xError,
      y: yError
    }
  }

  checkParams(params: any) {
    var xError = !this.shaderService.checkUpdateShader(params.x, "y")
    var yError = !this.shaderService.checkUpdateShader("x", params.y)
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
    return xError || yError || minTError || maxTError || minXError || maxXError || minYError || maxYError || particleCountError || lifetimeError || speedError || tError
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
    var x = Number(this.ranges.minT)
    if (isNaN(x) || !isFinite(x)) {
      x = 0
    }
    this.parameters.minT = x
  }

  setMaxT() {
    var x = Number(this.ranges.maxT)
    if (isNaN(x) || !isFinite(x)) {
      x = 0
    }
    this.parameters.maxT = x
  }

  setMinX() {
    var x = Number(this.ranges.xRange[0])
    if (isNaN(x) || !isFinite(x)) {
      x = 0
    }
    this.parameters.xRange[0] = x
  }

  setMaxX() {
    var x = Number(this.ranges.xRange[1])
    if (isNaN(x) || !isFinite(x)) {
      x = 0
    }
    this.parameters.xRange[1] = x
  }
  
  setMinY() {
    var x = Number(this.ranges.yRange[0])
    if (isNaN(x) || !isFinite(x)) {
      x = 0
    }
    this.parameters.yRange[0] = x
  }

  setMaxY() {
    var x = Number(this.ranges.yRange[1])
    if (isNaN(x) || !isFinite(x)) {
      x = 0
    }
    this.parameters.yRange[1] = x
  }

  removeSnackbar() {
    localStorage.setItem("tuto diff", "true")
  }
}
