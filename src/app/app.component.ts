import { Component, ViewChild, OnInit } from '@angular/core';
import { SceneCanvasComponent } from './scene-canvas/scene-canvas.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  @ViewChild(SceneCanvasComponent) sceneComponent!: SceneCanvasComponent;

  title = 'Vector Field';
  parameters = {
    x: "x",//"cos(10.0 * y)",
    y: "y",//"sin(20.0 * x)",
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
  fullScreen: boolean = false

  ngOnInit() {
    // function replaceInt(str: string): string {
    //   return str.replace(/\d*\.?\d+/g, (match) => { // (?![u0-9])
    //     return match.includes('.') ? match : match + '.0';
    //   });
    // }
    
    // console.log(replaceInt("12.75"));
    // console.log(replaceInt("12"));
    // console.log(replaceInt("12.75 and 12 and 3"));
    // console.log(replaceInt("1 and 12.54 and 13u"));
    // console.log(replaceInt("12.21 and 12544323u and 0"));
  }

  initialize(event: any) {
    this.sceneComponent.initialize()
  }

  toggleFullScreen(): void {
    this.fullScreen = !this.fullScreen
    this.sceneComponent.toogleFullScreen(this.fullScreen)
  }
}
