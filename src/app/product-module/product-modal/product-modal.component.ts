import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AppCredentials } from 'src/app/classes/app-credentials/app-credentials';
import { Product } from '../classes/product';

@Component({
  selector: 'app-product-modal',
  templateUrl: './product-modal.component.html',
  styleUrls: ['./product-modal.component.css']
})
export class ProductModalComponent {

  @Input() fetchApplicationCredentials!: AppCredentials | null;
  newProduct: Product = new Product("", "", "", 0, "", "", "");

  resetProduct(fileInput: HTMLInputElement){
    this.newProduct.description = "";
    this.newProduct.name = "";
    this.newProduct.price = 0;
    this.newProduct.imageUrl = "";
    fileInput.value = "";
  }

  saveProduct(){
    let data = {
      name: this.newProduct.name,
      sku: this.newProduct.sku,
      description: this.newProduct.description,
      price: this.newProduct.price,
      imgBase64: this.newProduct.imageUrl
    }
    fetch('https://leandrobalancer-1914303512.sa-east-1.elb.amazonaws.com/Product', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(this.fetchApplicationCredentials!.email + ':' + this.fetchApplicationCredentials!.password),
        'Accept': 'application/json',
        'Origin': 'https://leandrocz15.github.io/'
      },
      body: JSON.stringify(data)
      })
      .then(response => response.json())
      .then(data => {
      });
  }

  async onFileSelected(event: any) {
    if(event.target.files.length > 0){
      let file: Blob = event.target.files[0];
      if(this.isImageAllowed(file)){
        this.newProduct.imageUrl = await this.getBase64(file);
        document.getElementById("showImageError")!.hidden = true
      } else {
        document.getElementById("showImageError")!.hidden = false;
        this.newProduct.imageUrl = "";
      }
     }
   }

  isImageAllowed(file: Blob) : boolean{
    return file.type.indexOf("image") != -1 && file.size < 1000000;
   }

  getBase64(file: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      let reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
          let result : string = reader.result as string;
          resolve(result.slice(result.indexOf('/') + 1));
      };
      reader.onerror = (error) => {
        reject(error);
      };
    });
  }
}
