import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { mat4 } from 'gl-matrix';
import { Observable, fromEvent } from 'rxjs';
import { DeviceDetectorService } from 'ngx-device-detector';

@Component({
  selector: 'app-scene-canvas',
  templateUrl: './scene-canvas.component.html',
  styleUrls: ['./scene-canvas.component.css']
})
export class SceneCanvasComponent implements OnInit {
  @ViewChild('glCanvas') private canvas!: ElementRef;
  vsSource = "";
  fsSource = "";
  squareRotation = 0.0;
  mousePosition: [number, number] = [0.0, 0.0];
  mouseIsActive: boolean = false;
  sourcesPosition: [number, number][] = [[100, 600], [100, 200]]

  constructor(private http: HttpClient, private deviceService: DeviceDetectorService) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.http.get("shaders/scene-vertex.glsl", {responseType: 'text'})
      .subscribe(res => {
        this.vsSource = res;
        this.http.get("shaders/scene-fragment.glsl", {responseType: 'text'})
          .subscribe(res => {
            this.fsSource = res;
            this.main();
          })
      })
  }

  main(): any {
    const gl = this.canvas.nativeElement.getContext("webgl");
    if (gl === null) {
      console.error("Unable to initialize WebGL")
      alert("Unable to initialize WebGL. Your browser or machine may not support it.");
      return;
    }

    const shaderProgram = this.initShaderProgram(gl, this.vsSource, this.fsSource)

    const programInfo = {
      program: shaderProgram,
      attribLocations: {
        vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
        vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor')
      },
      uniformLocations: {
        projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
        // modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
        sources: gl.getUniformLocation(shaderProgram, 'uSourcePositions'),
      },
    };

    const buffers = this.initBuffers(gl);
    this.drawScene(gl, buffers, programInfo);

    // var render = (time: number) => {
    //   this.squareRotation = -time / 1000;
    //   this.drawScene(gl, buffers, programInfo);
    //   requestAnimationFrame(render);
    // };
    // requestAnimationFrame(render);

    const moveMouse = (event: any) => {
      this.mousePosition = [event.pageX - 5, this.canvas.nativeElement.height - event.pageY + 5]
      var minD: number | undefined = undefined;
      var minIndex: number = 0;
      for (let i = 0; i < this.sourcesPosition.length; i++) {
        const source = this.sourcesPosition[i];
        const d: number = (source[0] - this.mousePosition[0]) * (source[0] - this.mousePosition[0]) + (source[1] - this.mousePosition[1]) * (source[1] - this.mousePosition[1])
        if ((minD == undefined || d < minD) && d < 100 * 100) {
          minD = d;
          minIndex = i;
        }
      }
      if (minD != undefined) {
        this.sourcesPosition[minIndex][0] = this.mousePosition[0];
        this.sourcesPosition[minIndex][1] = this.mousePosition[1];
      }
      this.drawScene(gl, buffers, programInfo);
    }

    if (this.deviceService.isMobile()) {
      console.log("Device is mobile")
      this.canvas.nativeElement.addEventListener('touchstart', (event: any) => {
        this.mouseIsActive = true
        moveMouse(event)
        console.log("down")
      }, false);
      this.canvas.nativeElement.addEventListener('touchend', (event: any) => {
        this.mouseIsActive = false
        console.log("up")
      }, false);
      this.canvas.nativeElement.addEventListener('touchmove', (event: any) => {
        if (this.mouseIsActive) {
          moveMouse(event)
        }
        console.log("move")
      }, false);
    } else {
      this.canvas.nativeElement.addEventListener('mousedown', (event: any) => {
        this.mouseIsActive = true
        moveMouse(event)
      }, false);
      this.canvas.nativeElement.addEventListener('mouseup', (event: any) => {
        this.mouseIsActive = false
      }, false);
      this.canvas.nativeElement.addEventListener('mousemove', (event: any) => {
        if (this.mouseIsActive) {
          moveMouse(event)
        }
      }, false);
    }

    const resizeCanvas = () => {
      this.canvas.nativeElement.width = this.canvas.nativeElement.clientWidth;
      this.canvas.nativeElement.height = this.canvas.nativeElement.clientHeight;
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
      this.drawScene(gl, buffers, programInfo);
    }

    window.addEventListener('resize', resizeCanvas, false);
    resizeCanvas()
  }

  private initShaderProgram(gl: any, vsSource: string, fsSource: string): any {
    const vertexShader = this.loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = this.loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      console.error("Unable to initialize the shader program: " + gl.getProgramInfoLog(shaderProgram))
      alert("Unable to initialize the shader program: " + gl.getProgramInfoLog(shaderProgram));
      return null;
    }

    return shaderProgram;
  }

  private loadShader(gl: any, type: any, source: string): any {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader))
      alert("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  initBuffers(gl: any) {
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const positions = [
      1.0,  1.0,
     -1.0,  1.0,
      1.0, -1.0,
     -1.0, -1.0,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    const colors = [
      1.0,  1.0,  1.0,  1.0,    // white
      1.0,  0.0,  0.0,  1.0,    // red
      0.0,  1.0,  0.0,  1.0,    // green
      0.0,  0.0,  1.0,  1.0,    // blue
    ];
    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

    return {
      position: positionBuffer,
      color: colorBuffer
    };
  }

  drawScene(gl: any, buffers: any, programInfo: any) {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // const fieldOfView = 45 * Math.PI / 180;
    // const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    // const zNear = 0.1;
    // const zFar = 100.0;
    // const projectionMatrix = mat4.create();
    // mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);
    // mat4.ortho(projectionMatrix, -1, 1, -1, 1, zNear, zFar);

    const modelViewMatrix = mat4.create();
    mat4.translate(modelViewMatrix, modelViewMatrix, [-0.0, 0.0, -6.0]);
    mat4.rotate(modelViewMatrix, modelViewMatrix, this.squareRotation, [0, 0, 1]);
    { 
      const numComponents = 2;
      const type = gl.FLOAT;
      const normalize = false;
      const stride = 0;
      const offset = 0;
      gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
      gl.vertexAttribPointer(
        programInfo.attribLocations.vertexPosition,
        numComponents,
        type,
        normalize,
        stride,
        offset);
    }
    {
      const numComponents = 4;
      const type = gl.FLOAT;
      const normalize = false;
      const stride = 0;
      const offset = 0;
      gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
      gl.vertexAttribPointer(
          programInfo.attribLocations.vertexColor,
          numComponents,
          type,
          normalize,
          stride,
          offset);
      gl.enableVertexAttribArray(
          programInfo.attribLocations.vertexColor);
    }
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
    gl.useProgram(programInfo.program);

    // gl.uniformMatrix4fv(
    //   programInfo.uniformLocations.projectionMatrix,
    //   false,
    //   projectionMatrix);
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.modelViewMatrix,
        false,
        modelViewMatrix);
    var sources: number[] = [];
    this.sourcesPosition.forEach(position => {
      sources.push(position[0]);
      sources.push(position[1]);
    });
    gl.uniform2fv(
      programInfo.uniformLocations.sources,
      new Float32Array(sources)
    );
    const vertexCount = 4;
    const offset = 0;
    gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
  }
}
