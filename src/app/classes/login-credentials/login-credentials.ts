export class JiraLoginCredentials {
    domain: string;
    email: string;
    token: string;

    constructor(domain: string, email: string, token: string){
        this.domain = domain;
        this.email = email;
        this.token = token;
    }
}
