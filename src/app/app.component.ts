import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Vector Field';
  
  x: string = "cos(10.0 * y)"
  y: string = "sin(20.0 * x)"
}
