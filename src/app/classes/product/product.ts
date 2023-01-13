export class Product {
    name: string;
    description : string;
    price: number;
    imageUrl: string | undefined;
    sku: string;
  
    constructor(name: string, description: string, price: number, imageUrl: string | undefined, sku: string){
        this.name = name;
        this.description = description;
        this.price = price;
        this.imageUrl = imageUrl;
        this.sku = sku;
    }
}
