export class AppCredentials {
    email : string;
    password : string;
    admin : boolean;

    constructor(email : string, password : string, admin : boolean){
        this.email = email;
        this.password = password;
        this.admin = admin;
    }
}
