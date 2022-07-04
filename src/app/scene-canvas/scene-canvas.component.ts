import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { mat4 } from 'gl-matrix'
import { Observable, fromEvent } from 'rxjs'
import { DeviceDetectorService } from 'ngx-device-detector'

@Component({
  selector: 'app-scene-canvas',
  templateUrl: './scene-canvas.component.html',
  styleUrls: ['./scene-canvas.component.css']
})
export class SceneCanvasComponent implements OnInit {
  didInit = false
  @ViewChild('glCanvas') private canvas!: ElementRef
  private _x: string = "x";
  get x(): string {
    return this._x;
  }
  @Input() set x(value: string) {
    this._x = value;
    if (this.didInit) {
      this.reset = true
      this.main()
    }
  }
  private _y: string = "y";
  get y(): string {
    return this._y;
  }
  @Input() set y(value: string) {
    this._y = value;
    if (this.didInit) {
      this.reset = true
      this.main()
    }
  }
  particleCount: number = 10000
  lifetime: number = 10;

  mousePosition: [number, number] = [0.0, 0.0]
  mouseIsActive: boolean = false
  public fps: number = 1.0/120

  fpsColor = () => {
    if (this.fps >= 60) {
      return "lightgreen"
    } else if (this.fps >= 30) {
      return "orange"
    } else {
      return "lightred"
    }
  }

  updateVertexSource = ""
  updateFragmentSource = ""
  renderVertexSource = ""
  renderFragmentSource = ""
  processVertexSource = ""
  processFragmentSource = ""
  buffers!: any
  textures!: any
  textureOffset = 0
  reset: boolean = false

  constructor(private http: HttpClient, private deviceService: DeviceDetectorService) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.http.get("shaders/particle-update-vertex.glsl", {responseType: 'text'})
      .subscribe(res => {
        this.updateVertexSource = res
        this.http.get("shaders/particle-rendering-vertex.glsl", {responseType: 'text'})
          .subscribe(res => {
            this.renderVertexSource = res
            this.http.get("shaders/particle-rendering-fragment.glsl", {responseType: 'text'})
            .subscribe(res => {
              this.renderFragmentSource = res
              this.http.get("shaders/particle-update-fragment.glsl", {responseType: 'text'})
                .subscribe(res => {
                  this.updateFragmentSource = res
                  this.http.get("shaders/texture-process-fragment.glsl", {responseType: 'text'})
                    .subscribe(res => {
                      this.processFragmentSource = res
                      this.http.get("shaders/texture-process-vertex.glsl", {responseType: 'text'})
                      .subscribe(res => {
                        this.processVertexSource = res
                        this.didInit = true
                        this.main()
                      })
                    })
                })
            })
          })
      })
  }

  main(): any {
    const gl = this.canvas.nativeElement.getContext("webgl2")
    if (gl === null) {
      console.error("Unable to initialize WebGL")
      alert("Unable to initialize WebGL. Your browser or machine may not support it.")
      return
    }
    this.buffers = this.initBuffers(gl)
    this.textures = this.initTextures(gl, this.canvas.nativeElement.width, this.canvas.nativeElement.height)
    const updateVertexShaderSource = this.updateVertexSource.replace("$$x$$", this.x).replace("$$y$$", this.y)
    const updateShaderProgram = this.initShaderProgram(gl, updateVertexShaderSource, this.updateFragmentSource, ["o_Position", "o_Velocity"])
    const renderShaderProgram = this.initShaderProgram(gl, this.renderVertexSource, this.renderFragmentSource)
    const processShaderProgram = this.initShaderProgram(gl, this.processVertexSource, this.processFragmentSource)

    const programInfo = {
      updateProgram: updateShaderProgram,
      renderProgram: renderShaderProgram,
      processProgram: processShaderProgram,
      uniformLocations: {
        update: {
          lifetime: gl.getUniformLocation(updateShaderProgram, 'u_Lifetime')
        },
        render: {
          width: gl.getUniformLocation(renderShaderProgram, 'u_Width'),
          height: gl.getUniformLocation(renderShaderProgram, 'u_Height'),
          texture: gl.getUniformLocation(renderShaderProgram, 'u_Texture')
        },
        process: {
          width: gl.getUniformLocation(processShaderProgram, 'u_Width'),
          height: gl.getUniformLocation(processShaderProgram, 'u_Height'),
          texture: gl.getUniformLocation(processShaderProgram, 'u_Texture')
        }
      },
      attribLocations: {
        update: {
          positionInput: gl.getAttribLocation(updateShaderProgram, 'i_Position'),
          velocityInput: gl.getAttribLocation(updateShaderProgram, 'i_Velocity'),
          lifetimeInput: gl.getAttribLocation(updateShaderProgram, 'i_Lifetime'),
          positionOutput: gl.getAttribLocation(updateShaderProgram, 'o_Position'),
          velocityOutput: gl.getAttribLocation(updateShaderProgram, 'o_Velocity'),
          lifetimeOutput: gl.getAttribLocation(updateShaderProgram, 'o_Lifetime'),
        },
        render: {
          // position: gl.getAttribLocation(renderShaderProgram, 'i_Position'),
          // velocity: gl.getAttribLocation(renderShaderProgram, 'i_Velocity'),
          vertexPosition: gl.getAttribLocation(renderShaderProgram, 'i_VertexPosition')
        },
        process: {
          vertexPosition: gl.getAttribLocation(renderShaderProgram, 'i_VertexPosition')
        }
      }
    }

    var start = new Date().getTime();
    var it = 0;
    var render = (time: number) => {
      this.drawScene(gl, programInfo);
      if (!this.reset) {
        requestAnimationFrame(render);
      } else {
        this.reset = false
      }
      if (it % 100 == 0) {
        this.fps = 1000.0 / (new Date().getTime() - start) * 100;
        start = new Date().getTime();
      }
      it++;
    }
    requestAnimationFrame(render)

    const moveMouse = (event: any) => {
      this.mousePosition = [event.pageX - 5, this.canvas.nativeElement.height - event.pageY + 5]
      // this.drawScene(gl, programInfo)
    }
    if (this.deviceService.isMobile()) {
      console.log("Device is mobile")
      this.canvas.nativeElement.addEventListener('touchstart', (event: any) => {
        this.mouseIsActive = true
        moveMouse(event)
      }, false)
      this.canvas.nativeElement.addEventListener('touchend', (event: any) => {
        this.mouseIsActive = false
      }, false)
      this.canvas.nativeElement.addEventListener('touchmove', (event: any) => {
        if (this.mouseIsActive) {
          moveMouse(event)
        }
      }, false)
    } else {
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

    const resizeCanvas = () => {
      this.canvas.nativeElement.width = 3 * this.canvas.nativeElement.clientWidth
      this.canvas.nativeElement.height = 3 * this.canvas.nativeElement.clientHeight
      this.textures = this.initTextures(gl, this.canvas.nativeElement.width, this.canvas.nativeElement.height)
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
      this.drawScene(gl, programInfo)
    }
    window.addEventListener('resize', resizeCanvas, false)
    resizeCanvas()
  }

  private initShaderProgram(gl: any, vsSource: string, fsSource: string, transform_feedback_varyings: string[] | null = null): any {
    const vertexShader = this.loadShader(gl, gl.VERTEX_SHADER, vsSource)
    const fragmentShader = this.loadShader(gl, gl.FRAGMENT_SHADER, fsSource)

    const shaderProgram = gl.createProgram()
    gl.attachShader(shaderProgram, vertexShader)
    gl.attachShader(shaderProgram, fragmentShader)
    if (transform_feedback_varyings != null) {
      gl.transformFeedbackVaryings(
        shaderProgram,
        transform_feedback_varyings,
        gl.INTERLEAVED_ATTRIBS)
    }  
    gl.linkProgram(shaderProgram) 

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      console.error("Unable to initialize the shader program: " + gl.getProgramInfoLog(shaderProgram))
      // alert("Unable to initialize the shader program: " + gl.getProgramInfoLog(shaderProgram))
      return null
    }

    return shaderProgram
  }

  private loadShader(gl: any, type: any, source: string): any {
    const shader = gl.createShader(type)
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader))
      // alert("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader))
      gl.deleteShader(shader)
      return null
    }
    return shader
  }

  initBuffers(gl: WebGL2RenderingContext) {
    const values: number[] = []
    for (var i = 0; i < this.particleCount; i += 1) {
      const r = () => (Math.random() * 2 - 1)

      // POSITION
      values.push(r())
      values.push(r())
      
      // VELOCITY
      values.push(r() * 3)
      values.push(r() * 3)

      // LIFETIME
      values.push(r() * this.lifetime)
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

    return {
      input: input,
      output: output,
      corners: corners
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
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
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

  drawScene(gl: any, programInfo: any) {
    gl.clearColor(0.0, 0.0, 0.0, 1.0)
    gl.clearDepth(1.0)
    gl.enable(gl.DEPTH_TEST)
    gl.depthFunc(gl.LEQUAL)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    gl.useProgram(programInfo.updateProgram)
    gl.uniform1f(programInfo.uniformLocations.update.lifetime, this.lifetime)
    { 
      var step = Float32Array.BYTES_PER_ELEMENT
      const numComponents = 2
      const type = gl.FLOAT
      const normalize = false
      const stride = 4 * step
      const offset = 0
      gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.input)
      gl.vertexAttribPointer(
        programInfo.attribLocations.update.positionInput,
        numComponents,
        type,
        normalize,
        stride,
        offset)
      gl.enableVertexAttribArray(programInfo.attribLocations.update.positionInput)
    }
    { 
      var step = Float32Array.BYTES_PER_ELEMENT
      const numComponents = 2
      const type = gl.FLOAT
      const normalize = false
      const stride = 4 * step
      const offset = 2 * step
      gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.input)
      gl.vertexAttribPointer(
        programInfo.attribLocations.update.velocityInput,
        numComponents,
        type,
        normalize,
        stride,
        offset)
      gl.enableVertexAttribArray(programInfo.attribLocations.update.velocityInput)
    }
    // { 
    //   var step = Float32Array.BYTES_PER_ELEMENT
    //   const numComponents = 1
    //   const type = gl.FLOAT
    //   const normalize = false
    //   const stride = 5 * step
    //   const offset = 4 * step
    //   gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.input)
    //   gl.vertexAttribPointer(
    //     programInfo.attribLocations.update.lifetimeInput,
    //     numComponents,
    //     type,
    //     normalize,
    //     stride,
    //     offset)
    //   gl.enableVertexAttribArray(programInfo.attribLocations.update.lifetimeInput)
    // }
    gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, this.buffers.output)
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.textures.frameBuffers[(this.textureOffset) % 2]);
    // gl.enable(gl.RASTERIZER_DISCARD)
    gl.beginTransformFeedback(gl.POINTS)
    gl.drawArrays(gl.POINTS, 0, this.particleCount)
    gl.endTransformFeedback()
    // gl.disable(gl.RASTERIZER_DISCARD)

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
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.textures.frameBuffers[(this.textureOffset + 1) % 2]);
    gl.bindTexture(gl.TEXTURE_2D, this.textures.textures[(this.textureOffset) % 2]);
    gl.uniform1f(programInfo.uniformLocations.process.width, gl.canvas.width)
    gl.uniform1f(programInfo.uniformLocations.process.height, gl.canvas.height)
    gl.uniform1i(programInfo.uniformLocations.process.texture, 0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    
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
    gl.bindTexture(gl.TEXTURE_2D, this.textures.textures[(this.textureOffset + 1) % 2]);
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
