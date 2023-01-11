import { Component, Input } from '@angular/core';
import { Product } from 'src/app/classes/product/product';

@Component({
  selector: 'app-product-box',
  templateUrl: './product-box.component.html',
  styleUrls: ['./product-box.component.css']
})
export class ProductBoxComponent {

  @Input() product! : Product;

  ngOnInit(){
    console.log(this.product);
  }

  constructor(){

  }
}
