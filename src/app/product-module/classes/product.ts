export class Product {
    id: string;
    name: string;
    description: string;
    price: number;
    creationDate: string;
    imageUrl: string;
    sku: string;

    constructor(id: string, name: string, description: string, price: number, creationDate: string, imageUrl: string, sku: string) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.price = price;
        this.creationDate = creationDate;
        this.imageUrl = imageUrl;
        this.sku = sku;
    }
}
