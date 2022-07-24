import { Component, OnInit } from '@angular/core';
declare var MathJax: any;

@Component({
  selector: 'app-equa-diff',
  templateUrl: './equa-diff.component.html',
  styleUrls: ['./equa-diff.component.css']
})
export class EquaDiffComponent implements OnInit {
  private _language : "fr" | "en" = "en";
  public get language() : "fr" | "en" {
    return this._language;
  }
  public set language(v : "fr" | "en") {
    this._language = v;
    localStorage.setItem("language", v)
    MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
    MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
  }
  
  
  diff1D = "y'=f(x, y(x))"
  diff2D = `
    \\begin{cases}
      x' = f_{1}(t, (x(t), y(t)))\\\\
      y' = f_{2}(t, (x(t), y(t)))
    \\end{cases}
  `
  diff3D = `
    \\begin{cases}
      x' = f_{1}(t, (x(t), y(t), z(t)))\\\\
      y' = f_{2}(t, (x(t), y(t), z(t)))\\\\
      z' = f_{3}(t, (x(t), y(t), z(t)))
    \\end{cases}\\
  `
  xyVector = `
    \\begin{pmatrix}
    x\\\\
    y
    \\end{pmatrix}
  `
  xyzVector = `
    \\begin{pmatrix}
    x\\\\
    y\\\\
    z
    \\end{pmatrix}
  `
  xy_tVector = `
    \\begin{pmatrix}
    x(t)\\\\
    y(t)
    \\end{pmatrix}
  `
  diff2DVect = `
    ${this.xyVector}' = f(t, ${this.xy_tVector})
  `
  ex12D = `
    \\begin{cases}
      x' = y\\\\
      y' = -x
    \\end{cases}
  `
  ex22D = `
    \\begin{cases}
      x' = xy-y^2\\\\
      y' = -\\cos(3x + y)
    \\end{cases}
  `
  ex13D = `
    \\begin{cases}
      x' = x^2-y^2\\\\
      y' = 2xyz\\\\
      z' = -\\cos(2x)
    \\end{cases}
  `
  f1 = "f_{1}"
  f2 = "f_{2}"
  solx = "y(x)=\\frac{1}{2}x^2 + c"
  der = "\\frac{dy}{dx}"
  derxt = "\\frac{dx}{dt}"
  deryt = "\\frac{dy}{dt}"
  diffd2D = `
    \\begin{cases}
      dx = f_{1}(t, (x(t), y(t)))\\\\
      dy = f_{2}(t, (x(t), y(t)))
    \\end{cases}
  `

  constructor() { }

  ngOnInit(): void {
    this.language = (localStorage.getItem("language") ?? "en") as "en" | "fr"
  }

  ngAfterViewInit(): void {
    MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
    MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
  }

  delareFunction(name: string, from: string, to: string, variables: string, f: string) {
    return `
    \\begin{align*}
    ${name} \\colon ${from} &\\to ${to}\\\\
    ${variables} &\\mapsto ${f}
    \\end{align*}
    `
  }
}
