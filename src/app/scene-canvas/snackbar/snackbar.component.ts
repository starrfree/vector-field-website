import { Component, Inject } from '@angular/core'
import { MatSnackBarRef, MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';

@Component({
  selector: 'app-snackbar',
  templateUrl: './snackbar.component.html',
  styleUrls: ['./snackbar.component.css']
})
export class SnackbarComponent {
  constructor(
    public snackBarRef: MatSnackBarRef<SnackbarComponent>,
    @Inject(MAT_SNACK_BAR_DATA) public data: any
  ) { }
  
  navigate() {
    localStorage.setItem("tuto diff", "true")
    // window.location.href = 'https://vectorfield3d-dot-starfree.ew.r.appspot.com/help'
    this.snackBarRef.dismiss()
  }

  cancel() {
    localStorage.setItem("tuto diff", "true")
    this.snackBarRef.dismiss()
  }
}