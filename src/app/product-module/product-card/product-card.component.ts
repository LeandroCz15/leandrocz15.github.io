import { Component, Input } from '@angular/core';
import { Product } from '../classes/product';

@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.css']
})
export class ProductCardComponent {

  @Input() product! : Product;

  ngOnInit(){
    console.log(this.product);
  }

  constructor(){

  }
}
