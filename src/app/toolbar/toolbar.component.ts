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
    lifetime: 10,
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
  };

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

  submitXY() {
    this.checkXY()
    if (!this.error.x && !this.error.y) {
      this.parameters.x = this.x
      this.parameters.y = this.y
      this.parametersChange.emit(this.parameters)
    }
  }
}
