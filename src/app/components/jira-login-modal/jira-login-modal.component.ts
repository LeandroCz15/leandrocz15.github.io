import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
declare var $: any; 

@Component({
  selector: 'app-jira-login-modal',
  templateUrl: './jira-login-modal.component.html',
  styleUrls: ['./jira-login-modal.component.css']
})
export class JiraLoginModalComponent {
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
    let responseStatus : number = await this.fetchForLogin(this.registerForm.value.domain, this.registerForm.value.email, this.registerForm.value.token);
    if(responseStatus !== 200){
      this.loading = false;
      return;
    }
    $('#jiraLoginModal').modal('hide');
    this.validLogin.emit(this.registerForm.value);
    this.loading = false;
    this.registerForm.reset();
    this.submited = false;
   }

  onReset(){
    this.submited = false;
    this.registerForm.reset();
  }

  async fetchForLogin(domain : string, email : string, token : string) : Promise<number>{
    return await fetch(herokuappUrl + "https://" + domain + jiraSearchUrl, {
      method: 'GET',
       headers: {
       'Authorization': 'Basic ' + btoa(email + ':' + token),
       'Accept': 'application/json'
       }
     })
     .then(response => {
      return response.status;
     })
  }
}
  

const herokuappUrl : string = "https://guarded-reef-52511.herokuapp.com/";
const jiraSearchUrl : string = "/rest/api/3/search?jql=assignee=currentUser()&maxResults=1";