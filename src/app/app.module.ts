import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SceneCanvasComponent } from './scene-canvas/scene-canvas.component';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { FormsModule } from '@angular/forms';
import { AnimatedSliderComponent } from './animated-slider/animated-slider.component';
import { EquaDiffComponent } from './equa-diff/equa-diff.component';
import { VectorfieldComponent } from './vectorfield/vectorfield.component';

@NgModule({
  declarations: [
    AppComponent,
    SceneCanvasComponent,
    ToolbarComponent,
    AnimatedSliderComponent,
    EquaDiffComponent,
    VectorfieldComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    BrowserAnimationsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
