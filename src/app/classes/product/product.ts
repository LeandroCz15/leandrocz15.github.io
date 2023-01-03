export class Product {
    name: string;
    description: string;
    price: number;
    //images: Array<ArrayBuffer>;
  
    constructor(name: string, description: string, price: number, /*images: Array<ArrayBuffer>*/){
        this.name = name;
        this.description = description;
        this.price = price;
        //this.images = images;
    }
}
