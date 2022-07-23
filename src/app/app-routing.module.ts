import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EquaDiffComponent } from './equa-diff/equa-diff.component';
import { VectorfieldComponent } from './vectorfield/vectorfield.component';

const routes: Routes = [
  { path: 'help', component: EquaDiffComponent },
  { path: '', component: VectorfieldComponent } 
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
