import { Component, Input, OnInit } from '@angular/core';
import { AppCredentials } from 'src/app/classes/credentials/app-credentials';
import { Product } from 'src/app/classes/product/product';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent {
  productList: Array<Product> = [];

  ngOnInit(){
    this.fetchProducts();
  }

  constructor(){

  }

  async fetchProducts(){
    await fetch('https://leandrobalancer-1914303512.sa-east-1.elb.amazonaws.com/Query?tableName=products', {
      method: 'GET',
      headers: {
        'Authorization': 'Basic ' + btoa('Leandro' + ':' + 'cacholamcp'),
        'Accept': 'application/json',
        'Origin': 'https://leandrocz15.github.io/'
      }
    }).then(response => response.json())
    .then(data => {
      data.result.forEach((product: any) => {
        this.productList.push(new Product(product.products_name, product.products_description,
          product.products_price, product.products_image_url, product.products_sku));
      });
    });
  }
}
