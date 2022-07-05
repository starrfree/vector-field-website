import { Component, ViewChild } from '@angular/core';
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
    x: "cos(10.0 * y)",
    y: "sin(20.0 * x)",
    lifetime: 10,
    particleCount: 10000,
    normalize: false,
    speed: 1,
    color1: [1, 1, 1, 1],
    color2: [0.4, 0.4, 1, 1]
  }

  initialize(event: any) {
    this.sceneComponent.initialize();
  }
}
