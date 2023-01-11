import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
declare var $: any; 

@Component({
  selector: 'app-app-login',
  templateUrl: './app-login.component.html',
  styleUrls: ['./app-login.component.css']
})
export class AppLoginComponent {
  @Output() validAppLogin = new EventEmitter<{form : string[], admin : boolean}>();
  registerForm : any = FormGroup;
  submited : boolean = false;
  loading : boolean = false;

  constructor(private formBuilder : FormBuilder){
    this.registerForm = this.formBuilder.group({
      appEmail: ["", [Validators.required, Validators.email]],
      appPassword: ["", [Validators.required]],
    })
  }

  get form(){
    return this.registerForm.controls;
  }

  async onSubmit(event: Event){
    event.preventDefault;
    this.submited = true;
    if(this.registerForm.invalid){
      return;
    }
    this.loading = true;
    let userLevel : number = await this.fetchCredentials(this.registerForm.value.appEmail, this.registerForm.value.appPassword);
    if(userLevel === -1){
      this.loading = false;
      return;
    }
    $('#appLoginModal').modal('hide');
    this.validAppLogin.emit({form : this.registerForm.value, admin : userLevel === 3});
    this.loading = false;
    this.registerForm.reset();
    this.submited = false;
   }

  onReset(){
    this.submited = false;
    this.registerForm.reset();
  }

  async fetchCredentials(email : string, password : string) : Promise<number>{
    await fetch("https://leandrobalancer-1914303512.sa-east-1.elb.amazonaws.com/Login", {
      method: 'GET',
       headers: {
       'Authorization': 'Basic ' + btoa(email + ':' + password),
       'Accept': 'application/json',
       'Origin': "https://leandrocz15.github.io/"
       }
     })
     .then(response => response.json())
     .then(data => {
      return data.level;
     });
     return -1;
  }

}