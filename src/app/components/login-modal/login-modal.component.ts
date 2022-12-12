import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
declare var $: any; 

@Component({
  selector: 'app-login-modal',
  templateUrl: './login-modal.component.html',
  styleUrls: ['./login-modal.component.css']
})
export class LoginModalComponent {
  @Output() validLogin = new EventEmitter<string[]>();
  registerForm : any = FormGroup;
  submited : boolean = false;
  loading : boolean = false;

  constructor(private formBuilder : FormBuilder){
    this.registerForm = this.formBuilder.group({
      domain: ["", [Validators.required]],
      email: ["", [Validators.required, Validators.email]],
      token: ["", [Validators.required]],
    })
  }

  get form(){
    return this.registerForm.controls;
  }

  async onSubmit(event: Event, modalElement : Element){
    event.preventDefault;
    this.submited = true;
    if(this.registerForm.invalid){
      return;
    }
    this.loading = true;
    let responseStatus : number = await this.fetchIssues("", this.registerForm.value.email, this.registerForm.value.token);
    if(responseStatus !== 200){
      this.loading = false;
      return;
    }
    $('#loginModal').modal('hide');
    this.validLogin.emit(this.registerForm.value);
    this.loading = false;
   }

  onReset(){
    this.submited = false;
    this.registerForm.reset();
  }

  async fetchIssues(domain : string, email : string, token : string) : Promise<number>{
    let responseStatus : number = 0;
    await fetch(herokuappUrl + jiraSearchUrl, {
      method: 'GET',
       headers: {
       'Authorization': 'Basic ' + btoa(email + ':' + token),
       'Accept': 'application/json'
       }
     })
     .then(response => {
       return responseStatus = response.status;
     });
     return responseStatus;
  }
}
  

const herokuappUrl : string = "https://guarded-reef-52511.herokuapp.com/";
const jiraSearchUrl : string = "https://etendoproject.atlassian.net/rest/api/3/search?jql=assignee=currentUser()&maxResults=1";