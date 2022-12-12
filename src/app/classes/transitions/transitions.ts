export class Transitions {
    id : string = "";
    name : string = "";
    toId : string = "";
    toStatusCategoryId : string = "";


    constructor(id : string, name : string, toId : string, toStatusCategoryId : string){
        this.id = id;
        this.name = name;
        this.toId = toId;
        this.toStatusCategoryId = toStatusCategoryId;
    }

}
