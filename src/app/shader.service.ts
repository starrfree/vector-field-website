import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ShaderService {
  updateVertexSource = ""
  updateFragmentSource = ""
  renderVertexSource = ""
  renderFragmentSource = ""
  processVertexSource = ""
  processFragmentSource = ""
  cubeRenderVertexSource = ""
  cubeRenderFragmentSource = ""
  didInit = false

  onInit: Observable<any>
  gl!: WebGL2RenderingContext

  constructor(private http: HttpClient) { 
    this.onInit =  new Observable((observer) => {
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
                          this.http.get("shaders/cube-render-fragment.glsl", {responseType: 'text'})
                            .subscribe(res => {
                              this.cubeRenderFragmentSource = res
                              this.http.get("shaders/cube-render-vertex.glsl", {responseType: 'text'})
                              .subscribe(res => {
                                this.cubeRenderVertexSource = res
                                this.didInit = true
                                observer.next(true)
                              })
                            })
                        })
                      })
                  })
              })
            })
        })
    })
  }



  public initShaderProgram(gl: any, vsSource: string, fsSource: string, transform_feedback_varyings: string[] | null = null): any {
    const vertexShader = this.loadShader(gl, gl.VERTEX_SHADER, vsSource)
    const fragmentShader = this.loadShader(gl, gl.FRAGMENT_SHADER, fsSource)
    if (!vertexShader || !fragmentShader) {
      return null
    }

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

  public loadShader(gl: any, type: any, source: string): any {
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

  public checkUpdateShader(x: string, y: string): boolean {
    if (!this.gl) {
      return true
    }
    var updateVertexShaderSource = this.transformUpdateShader(x, y)
    const shader = this.gl.createShader(this.gl.VERTEX_SHADER)
    if (!shader) {
      return false
    }
    this.gl.shaderSource(shader, updateVertexShaderSource)
    this.gl.compileShader(shader)
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      this.gl.deleteShader(shader)
      return false
    }
    return true
  }

  public transformUpdateShader(x: string, y: string): string {
    var newX = x.replace(/\d*\.?\d+/g, (match) => {
      return match.includes('.') ? match : match + '.0';
    });
    var newY = y.replace(/\d*\.?\d+/g, (match) => {
      return match.includes('.') ? match : match + '.0';
    });
    var updateVertexShaderSource = this.updateVertexSource.replace("$$x$$", newX).replace("$$y$$", newY)
    return updateVertexShaderSource
  }
}
