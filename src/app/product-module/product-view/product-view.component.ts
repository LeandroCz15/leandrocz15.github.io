import { Component, OnInit } from "@angular/core";
import { Product } from "../classes/product";
import { Credentials } from "src/app/login-module/credentials";
import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";

@Component({
  selector: "app-product-view",
  templateUrl: "./product-view.component.html",
  styleUrls: ["./product-view.component.css"],
})
export class ProductViewComponent implements OnInit {
  productList: Array<Product> = [];

  movies: string[] = ["A", "B"]

  ngOnInit() {
    this.fetchProducts();
  }

  constructor(public credentials: Credentials) { }

  async fetchProducts() {
    if (this.credentials.getUsserId() == "") {
      return;
    }
    fetch("http://localhost:8080/api/product/*", {
      method: "GET",
      headers: {
        "Authorization": "Basic " + btoa(this.credentials.getEmail() + ":" + this.credentials.getPassword()),
        "Accept": "application/json",
        "Origin": "https://leandrocz15.github.io/"
      }
    }).then(response => response.json())
      .then(data => {
        data.forEach((product: any) => {
          this.productList.push(new Product(product.id, product.name,
            product.description, product.price, product.creationDate, product.imageUrl, product.sku));
        });
      });
  }

  drop(event: CdkDragDrop<any[]>) {
    moveItemInArray(this.movies, event.previousIndex, event.currentIndex);
  }
}
