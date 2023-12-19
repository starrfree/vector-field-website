import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core'
import { Location } from '@angular/common'
import { HttpClient } from '@angular/common/http'
import { mat4, ReadonlyVec3, vec4, vec3, mat3 } from 'gl-matrix'
import { Observable, fromEvent } from 'rxjs'
import { DeviceDetectorService } from 'ngx-device-detector'
import { ShaderService } from '../shader.service'
import { ActivatedRoute, Router } from '@angular/router'

@Component({
  selector: 'app-scene-canvas',
  templateUrl: './scene-canvas.component.html',
  styleUrls: ['./scene-canvas.component.css']
})
export class SceneCanvasComponent implements OnInit {
  @ViewChild('glCanvas') public canvas!: ElementRef
  
  @Input() parameters: any = {};
  @Output() parametersChange = new EventEmitter<any>();
  public initialize = () => {
    if (this.shaderService.didInit) {
      this.reset = true
    }
  }
  canvasWidthOffset = '270px'
  dt: number = 1.0/60
  mousePosition: [number, number] = [0.0, 0.0]
  mouseIsActive: boolean = false
  public fps: number = 1.0/120
  step: number = 0
  size: number = 1
  cubeRotation: number = 0
  cubeXRotation: number = 0.1//0.1
  cubeYRotation: number = 0//-0.3

  xPosition: [number, number] = [0, 0]

  get fpsColor() {
    if (this.fps > 30) {
      return "lightgreen"
    } else if (this.fps >= 24) {
      return "orange"
    } else {
      return "lightred"
    }
  }

  buffers!: any
  textures!: any
  textureOffset = 0
  reset: boolean = false
  didInit = false

  constructor(private deviceService: DeviceDetectorService,
     private shaderService: ShaderService) {
    shaderService.onInit.subscribe((val) => {
      if (this.didInit) {
        this.main()
      }
    })
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    if (this.shaderService.didInit && !this.didInit) {
      this.main()
    }
    this.didInit = true
    this.addMouseMoveEvents()
  }

  public toogleFullScreen = (state: boolean) => {
    this.canvasWidthOffset = state ? '0px' : '270px'
    setTimeout(() => this.initialize(), 310)
  }

  setXPosition() {
    var pos = vec4.clone([1, -1, -1, 1]);
    const matrices = this.getMatrices(this.shaderService.gl)
    vec4.transformMat4(pos, pos, matrices.projection)
    vec4.transformMat4(pos, pos, matrices.model)
    pos[0] /= pos[2];
    pos[1] /= pos[2];
    // pos = [0.9, -0.9, 0, 1]
    var screenPos: [number, number] = [(pos[0] * 0.5 + 0.5) * this.canvas.nativeElement.clientWidth, (pos[1] * -0.5 + 0.5) * this.canvas.nativeElement.clientHeight]
    this.xPosition = [Math.floor(screenPos[0]), Math.floor(screenPos[1])]
    // console.log([pos[0], pos[1], pos[2], pos[3]])
  }

  main(): void {
    const gl = this.canvas.nativeElement.getContext("webgl2")
    // gl.getExtension("EXT_color_buffer_float")
    if (gl === null) {
      console.error("Unable to initialize WebGL")
      alert("Unable to initialize WebGL. Your browser or machine may not support it.")
      return
    }
    this.shaderService.gl = gl;
    this.buffers = this.initBuffers(gl)
    this.textures = this.initTextures(gl, this.canvas.nativeElement.width, this.canvas.nativeElement.height)
    var updateVertexShaderSource = this.shaderService.transformUpdateShader(this.parameters.x, this.parameters.y)
    const updateShaderProgram = this.shaderService.initShaderProgram(gl, updateVertexShaderSource, this.shaderService.updateFragmentSource, ["o_Index", "o_Position", "o_Velocity", "o_Lifetime"])
    const renderShaderProgram = this.shaderService.initShaderProgram(gl, this.shaderService.renderVertexSource, this.shaderService.renderFragmentSource)
    const processShaderProgram = this.shaderService.initShaderProgram(gl, this.shaderService.processVertexSource, this.shaderService.processFragmentSource)
    const cubeRenderShaderProgram = this.shaderService.initShaderProgram(gl, this.shaderService.cubeRenderVertexSource, this.shaderService.cubeRenderFragmentSource)

    if (!updateShaderProgram) {
      return
    }

    const programInfo = {
      updateProgram: updateShaderProgram,
      renderProgram: renderShaderProgram,
      processProgram: processShaderProgram,
      cubeRenderProgram: cubeRenderShaderProgram,
      uniformLocations: {
        update: {
          modelMatrix: gl.getUniformLocation(updateShaderProgram, 'u_ModelViewMatrix'),
          projectionMatrix: gl.getUniformLocation(updateShaderProgram, 'u_ProjectionMatrix'),
          t: gl.getUniformLocation(updateShaderProgram, 't'),
          dt: gl.getUniformLocation(updateShaderProgram, 'dt'),
          lifetime: gl.getUniformLocation(updateShaderProgram, 'u_Lifetime'),
          step: gl.getUniformLocation(updateShaderProgram, 'u_Step'),
          normalize: gl.getUniformLocation(updateShaderProgram, 'u_Normalize'),
          speed: gl.getUniformLocation(updateShaderProgram, 'u_Speed'),
          color1: gl.getUniformLocation(updateShaderProgram, 'u_Color1'),
          color2: gl.getUniformLocation(updateShaderProgram, 'u_Color2'),
          size: gl.getUniformLocation(updateShaderProgram, 'u_Size')
        },
        render: {
          width: gl.getUniformLocation(renderShaderProgram, 'u_Width'),
          height: gl.getUniformLocation(renderShaderProgram, 'u_Height'),
          texture: gl.getUniformLocation(renderShaderProgram, 'u_Texture')
        },
        cubeRender: {
          width: gl.getUniformLocation(cubeRenderShaderProgram, 'u_Width'),
          height: gl.getUniformLocation(cubeRenderShaderProgram, 'u_Height'),
          modelMatrix: gl.getUniformLocation(cubeRenderShaderProgram, 'u_ModelViewMatrix'),
          projectionMatrix: gl.getUniformLocation(cubeRenderShaderProgram, 'u_ProjectionMatrix')
        },
        process: {
          width: gl.getUniformLocation(processShaderProgram, 'u_Width'),
          height: gl.getUniformLocation(processShaderProgram, 'u_Height'),
          noTrail: gl.getUniformLocation(processShaderProgram, 'u_NoTrail'),
          texture: gl.getUniformLocation(processShaderProgram, 'u_Texture')
        }
      },
      attribLocations: {
        update: {
          indexInput: gl.getAttribLocation(updateShaderProgram, 'i_Index'),
          positionInput: gl.getAttribLocation(updateShaderProgram, 'i_Position'),
          velocityInput: gl.getAttribLocation(updateShaderProgram, 'i_Velocity'),
          lifetimeInput: gl.getAttribLocation(updateShaderProgram, 'i_Lifetime'),
          positionOutput: gl.getAttribLocation(updateShaderProgram, 'o_Position'),
          velocityOutput: gl.getAttribLocation(updateShaderProgram, 'o_Velocity'),
          lifetimeOutput: gl.getAttribLocation(updateShaderProgram, 'o_Lifetime'),
        },
        render: {
          vertexPosition: gl.getAttribLocation(renderShaderProgram, 'i_VertexPosition')
        },
        process: {
          vertexPosition: gl.getAttribLocation(processShaderProgram, 'i_VertexPosition')
        },
        cubeRender: {
          vertexPosition: gl.getAttribLocation(cubeRenderShaderProgram, 'i_VertexPosition')
        }
      }
    }

    // var start = new Date().getTime();
    var startFPS = new Date().getTime();
    var startDt = new Date().getTime();
    this.step = 0
    this.size = .5
    if (this.parameters.particleCount > 10000) {
      this.size = 3.16227766017 / Math.pow(this.parameters.particleCount, 1.0/6.0) / 2
    }
    this.parameters.t = 0
    var render = (time: number) => {
      var iterations = 1;
      if (this.parameters.speed > 2) {
        iterations = 2;
      } else if (this.parameters.speed > 4) {
        iterations = 3;
      } else if (this.parameters.speed > 6) {
        iterations = 5;
      } else if (this.parameters.speed > 8) {
        iterations = 6;
      }
      this.drawScene(gl, programInfo, iterations);
      if (!this.reset) {
        requestAnimationFrame(render);
      } else {
        this.reset = false
        this.main()
      }
      if (this.step % 100 == 0 && this.step != 0) {
        this.fps = 1000.0 / (new Date().getTime() - startFPS) * 100;
        startFPS = new Date().getTime();
      }
      this.step++
      this.dt = (new Date().getTime() - startDt);
      startDt = new Date().getTime()
      if (this.parameters.t > this.parameters.maxT) {
        this.parameters.t = this.parameters.minT
      }
      if (this.dt > 0) {
        this.parameters.t += .01 / this.dt * 10.
        this.cubeRotation += this.dt / 2000;
      }
      this.parametersChange.emit(this.parameters)
    }
    requestAnimationFrame(render)

    const resizeCanvas = () => {
      this.canvas.nativeElement.width = 2 * this.canvas.nativeElement.clientWidth
      this.canvas.nativeElement.height = 2 * this.canvas.nativeElement.clientHeight
      this.textures = this.initTextures(gl, this.canvas.nativeElement.width, this.canvas.nativeElement.height)
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
      this.drawScene(gl, programInfo)
    }
    window.addEventListener('resize', resizeCanvas, false)
    resizeCanvas()
    this.setXPosition()
  }

  previousTouch: any;
  addMouseMoveEvents() {
    const moveMouse = (event: any) => {
      var x = event.movementX
      var y = event.movementY
      if (this.deviceService.isMobile()) {
        const touch = event.touches[0]
        if (this.previousTouch) {
          // be aware that these only store the movement of the first touch in the touches array
          x = touch.pageX - this.previousTouch.pageX
          y = touch.pageY - this.previousTouch.pageY
          event.stopPropagation()
          event.preventDefault()
        } else {
          x = 0
          y = 0
        }
        this.previousTouch = touch
      }
      // this.mousePosition = [event.pageX, this.canvas.nativeElement.height - event.pageY]
      this.cubeYRotation += x / 360
      this.cubeXRotation += y / 360
      this.setXPosition()
    }
    if (this.deviceService.isMobile()) {
      console.log("Device is mobile")
      this.canvas.nativeElement.addEventListener('touchstart', (event: any) => {
        this.mouseIsActive = true
        moveMouse(event)
      }, false)
      this.canvas.nativeElement.addEventListener('touchend', (event: any) => {
        this.previousTouch = event.touches[0]
        this.mouseIsActive = false
      }, false)
      this.canvas.nativeElement.addEventListener('touchmove', (event: any) => {
        if (this.mouseIsActive) {
          moveMouse(event)
        }
      }, false)
    } else {
      // this.canvas.nativeElement
      this.canvas.nativeElement.addEventListener('mousedown', (event: any) => {
        this.mouseIsActive = true
        moveMouse(event)
      }, false)
      this.canvas.nativeElement.addEventListener('mouseup', (event: any) => {
        this.mouseIsActive = false
      }, false)
      this.canvas.nativeElement.addEventListener('mousemove', (event: any) => {
        if (this.mouseIsActive) {
          moveMouse(event)
        }
      }, false)
    }
  }

  initBuffers(gl: WebGL2RenderingContext) {
    const values: number[] = []
    for (var i = 0; i < this.parameters.particleCount; i += 1) {
      const r = () => (Math.random() * 2 - 1)
      
      // INDEX
      values.push(i)

      // POSITION
      let x = r(), y = r(), z = r()
      let norm = Math.sqrt(x*x + y*y + z*z)
      x /= norm
      y /= norm
      z /= norm
      values.push(x)
      values.push(y)
      values.push(z)
      
      // VELOCITY
      values.push(0)
      values.push(0)
      values.push(0)

      // LIFETIME
      values.push(r() * this.parameters.lifetime)
    }

    const input = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, input)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(values), gl.STREAM_DRAW)

    const output = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, output)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(values), gl.STREAM_DRAW)

    var positions: number[] = [1.0,  1.0,
      -1.0,  1.0,
       1.0, -1.0,
      -1.0, -1.0]
    const corners = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, corners)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)
    var sphere: number [] = []
    for (var i = 0; i <= 2; i++) {
      let x = 0, y = 0, z = 0
      let count = 0
      for (var theta = 0; theta <= 2 * Math.PI; theta += 2 * Math.PI / 70) {
        let a = Math.cos(theta)
        let b = Math.sin(theta)
        x = i == 0 ? a : i == 1 ? b : 0
        y = i == 0 ? b : i == 1 ? 0 : a
        z = i == 0 ? 0 : i == 1 ? a : b
        sphere.push(x); sphere.push(y); sphere.push(z)
        if (count > 0) {
          sphere.push(x); sphere.push(y); sphere.push(z)
          count++
        }
        count++
      }
      sphere.push(x); sphere.push(y); sphere.push(z)
    }
    positions = []
    if (this.parameters.showCube) {
      positions.push(...sphere)
    }
    const vertices = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, vertices)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)

    gl.bindBuffer(gl.ARRAY_BUFFER, null)

    return {
      input: input,
      output: output,
      corners: corners,
      cubeVertices: vertices,
      cubeVerticesCount: positions.length
    }
  }

  initTextures(gl: WebGL2RenderingContext, width: number, height: number) {
    var textures = []
    var frameBuffers = []
    for (let i = 0; i < 2; i++) {
      const targetTexture = gl.createTexture();
      textures.push(targetTexture)
      gl.bindTexture(gl.TEXTURE_2D, targetTexture);

      const level = 0;
      const internalFormat = gl.RGBA;
      const border = 0;
      const format = gl.RGBA;
      const type = gl.UNSIGNED_BYTE;
      const data = null;
      gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                    width, height, border,
                    format, type, data);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

      const fb = gl.createFramebuffer();
      frameBuffers.push(fb)
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
      gl.viewport(0, 0, width, height)
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, targetTexture, level);
    }

    return {
      textures: textures,
      frameBuffers: frameBuffers
    }
  }

  getMatrices(gl: WebGL2RenderingContext) {
    const canvas = gl.canvas as HTMLElement
    const fieldOfView = 35 * Math.PI / 180;   // in radians
    const aspect = canvas.clientWidth / canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 100.0;
    var projectionMatrix = mat4.create();
    mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);

    var modelViewMatrix = mat4.create();
    mat4.translate(modelViewMatrix, modelViewMatrix, [0.0, 0.0, -4.0]);

    var xAxis = vec4.clone([1, 0, 0, 1]);
    {
      var rotationMatrix = mat4.create();
      mat4.rotate(rotationMatrix, rotationMatrix, this.cubeYRotation, [0, -1, 0]);
      vec4.transformMat4(xAxis, xAxis, rotationMatrix)
    }
    mat4.rotate(modelViewMatrix, modelViewMatrix, this.cubeYRotation, [0, 1, 0]);
    mat4.rotate(modelViewMatrix, modelViewMatrix, this.cubeXRotation, [xAxis[0], xAxis[1], xAxis[2]]);
    return {
      projection: projectionMatrix,
      model: modelViewMatrix
    }
  }

  drawScene(gl: WebGL2RenderingContext, programInfo: any, iterations: number = 1) {
    for (let i = 0; i < iterations; i++) {
      gl.clearColor(0.0, 0.0, 0.0, 1.0)
      gl.clearDepth(1.0)
      gl.enable(gl.DEPTH_TEST)
      gl.depthFunc(gl.LEQUAL)
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

      var matrices = this.getMatrices(gl)
      var projectionMatrix = matrices.projection
      var modelViewMatrix = matrices.model

      gl.useProgram(programInfo.updateProgram)
      gl.uniformMatrix4fv(programInfo.uniformLocations.update.modelMatrix, false, modelViewMatrix)
      gl.uniformMatrix4fv(programInfo.uniformLocations.update.projectionMatrix, false, projectionMatrix)
      gl.uniform1f(programInfo.uniformLocations.update.t, this.parameters.t)
      gl.uniform1f(programInfo.uniformLocations.update.dt, this.dt)
      gl.uniform1f(programInfo.uniformLocations.update.lifetime, this.parameters.lifetime)
      gl.uniform1i(programInfo.uniformLocations.update.step, this.step)
      gl.uniform1i(programInfo.uniformLocations.update.normalize, this.parameters.normalize)
      gl.uniform1f(programInfo.uniformLocations.update.speed, this.parameters.speed / iterations)
      gl.uniform4f(programInfo.uniformLocations.update.color1, this.parameters.color1[0], this.parameters.color1[1], this.parameters.color1[2], this.parameters.color1[3])
      gl.uniform4f(programInfo.uniformLocations.update.color2, this.parameters.color2[0], this.parameters.color2[1], this.parameters.color2[2], this.parameters.color2[3])
      gl.uniform1f(programInfo.uniformLocations.update.size, this.size)
      {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.input);
        var step = Float32Array.BYTES_PER_ELEMENT;
        var total = 1 + 3 + 3 + 1;
        var stride = step * total;
        gl.vertexAttribPointer(programInfo.attribLocations.update.indexInput, 1, gl.FLOAT, false, stride, 0);
        gl.vertexAttribPointer(programInfo.attribLocations.update.positionInput, 3, gl.FLOAT, false, stride, step * 1);
        gl.vertexAttribPointer(programInfo.attribLocations.update.velocityInput, 3, gl.FLOAT, false, stride, step * 4);
        gl.vertexAttribPointer(programInfo.attribLocations.update.lifetimeInput, 1, gl.FLOAT, false, stride, step * 7);
        gl.enableVertexAttribArray(programInfo.attribLocations.update.indexInput);
        gl.enableVertexAttribArray(programInfo.attribLocations.update.positionInput);
        gl.enableVertexAttribArray(programInfo.attribLocations.update.velocityInput);
        gl.enableVertexAttribArray(programInfo.attribLocations.update.lifetimeInput);
      }
      gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, this.buffers.output)
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.textures.frameBuffers[(this.textureOffset) % 2]);
      gl.beginTransformFeedback(gl.POINTS)
      gl.drawArrays(gl.POINTS, 0, this.parameters.particleCount)
      gl.endTransformFeedback()

      gl.useProgram(programInfo.processProgram)
      { 
        const numComponents = 2
        const type = gl.FLOAT
        const normalize = false
        const stride = 0
        const offset = 0
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.corners)
        gl.vertexAttribPointer(
          programInfo.attribLocations.process.vertexPosition,
          numComponents,
          type,
          normalize,
          stride,
          offset)
        gl.enableVertexAttribArray(programInfo.attribLocations.process.vertexPosition)
      }
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.textures.frameBuffers[(this.textureOffset + 1) % 2])
      gl.bindTexture(gl.TEXTURE_2D, this.textures.textures[(this.textureOffset) % 2]);
      gl.uniform1f(programInfo.uniformLocations.process.width, gl.canvas.width)
      gl.uniform1f(programInfo.uniformLocations.process.height, gl.canvas.height)
      gl.uniform1i(programInfo.uniformLocations.process.noTrail, this.mouseIsActive ? 1 : 0)
      gl.uniform1i(programInfo.uniformLocations.process.texture, 0);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)

      if (this.parameters.showCube || this.parameters.showAxes) {
        gl.useProgram(programInfo.cubeRenderProgram)
        { 
          const numComponents = 3
          const type = gl.FLOAT
          const normalize = false
          const stride = 0
          const offset = 0
          gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.cubeVertices)
          gl.vertexAttribPointer(
            programInfo.attribLocations.cubeRender.vertexPosition,
            numComponents,
            type,
            normalize,
            stride,
            offset)
          gl.enableVertexAttribArray(programInfo.attribLocations.cubeRender.vertexPosition)
        }
        gl.uniform1f(programInfo.uniformLocations.cubeRender.width, gl.canvas.width)
        gl.uniform1f(programInfo.uniformLocations.cubeRender.height, gl.canvas.height)
        gl.uniformMatrix4fv(programInfo.uniformLocations.cubeRender.modelMatrix, false, modelViewMatrix)
        gl.uniformMatrix4fv(programInfo.uniformLocations.cubeRender.projectionMatrix, false, projectionMatrix)
        gl.bindTexture(gl.TEXTURE_2D, this.textures.textures[(this.textureOffset) % 2]);
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.textures.frameBuffers[(this.textureOffset + 1) % 2])
        var count: number = 0
        if (this.parameters.showAxes) {
          count += 18
        }
        if (this.parameters.showCube) {
          count += 44
        }
        gl.drawArrays(gl.LINES, 0, this.buffers.cubeVerticesCount / 3)
      }

      gl.bindFramebuffer(gl.FRAMEBUFFER, null)

      gl.useProgram(programInfo.renderProgram)
      { 
        const numComponents = 2
        const type = gl.FLOAT
        const normalize = false
        const stride = 0
        const offset = 0
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.corners)
        gl.vertexAttribPointer(
          programInfo.attribLocations.render.vertexPosition,
          numComponents,
          type,
          normalize,
          stride,
          offset)
        gl.enableVertexAttribArray(programInfo.attribLocations.render.vertexPosition)
      }
      gl.bindTexture(gl.TEXTURE_2D, this.textures.textures[(this.textureOffset) % 2]);
      gl.uniform1f(programInfo.uniformLocations.render.width, gl.canvas.width)
      gl.uniform1f(programInfo.uniformLocations.render.height, gl.canvas.height)
      gl.uniform1i(programInfo.uniformLocations.render.texture, 0);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)

      gl.bindTexture(gl.TEXTURE_2D, null);

      {
        var temp = this.buffers.output
        this.buffers.output = this.buffers.input
        this.buffers.input = temp
      }
      this.textureOffset += 1
    }
  }
}
