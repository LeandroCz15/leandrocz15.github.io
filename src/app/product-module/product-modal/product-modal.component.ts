import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Product } from '../classes/product';

@Component({
  selector: 'app-product-modal',
  templateUrl: './product-modal.component.html',
  styleUrls: ['./product-modal.component.css']
})
export class ProductModalComponent {

  newProduct: Product = new Product("", "", "", 0, "", "", "");

  resetProduct(fileInput: HTMLInputElement){
    this.newProduct.description = "";
    this.newProduct.name = "";
    this.newProduct.price = 0;
    this.newProduct.imageUrl = "";
    fileInput.value = "";
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
