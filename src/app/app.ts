import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ProductListComponent } from './components/product-list.component/product-list.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ProductListComponent],
  template: `<app-product-list></app-product-list><router-outlet></router-outlet>`,
  styles: []
})
export class App {
  title = 'descriptAI-frontend';
}