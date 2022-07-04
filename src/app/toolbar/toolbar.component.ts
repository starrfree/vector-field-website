import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.css']
})
export class ToolbarComponent implements OnInit {
  @Input() x: string = "x"
  @Output() xChange = new EventEmitter<string>()
  @Input() y: string = "y"
  @Output() yChange = new EventEmitter<string>()

  constructor() { }

  ngOnInit(): void {
  }

}
