import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Credentials } from '../credentials';
declare var $: any;

@Component({
  selector: 'app-application-login-modal',
  templateUrl: './application-login-modal.component.html',
  styleUrls: ['./application-login-modal.component.css']
})
export class ApplicationLoginModalComponent {

  registerForm: any = FormGroup;
  submited: boolean = false;
  loading: boolean = false;

  constructor(private formBuilder: FormBuilder, private credentials: Credentials) {
    this.registerForm = this.formBuilder.group({
      appEmail: ["", [Validators.required, Validators.email]],
      appPassword: ["", [Validators.required]],
    });
  }

  get form() {
    return this.registerForm.controls;
  }

  async onSubmit(event: Event) {
    event.preventDefault;
    this.submited = true;
    if (this.registerForm.invalid) {
      return;
    }
    this.loading = true;
    try {
      await this.fetchCsrfToken(this.registerForm.value.appEmail, this.registerForm.value.appPassword);
      await this.fetchRole();
      $('#appLoginModal').modal('hide');
      this.registerForm.reset();
    } catch (error) {
      //Poner imagen de error hasta que vuelva a picar al fetch
      console.log(error);
    }
    this.loading = false;
    this.submited = false;
  }

  onReset() {
    this.submited = false;
    this.registerForm.reset();
  }

  fetchRole() {
    if (this.credentials.getToken() == "" || this.credentials.getToken() == null) {
      return null;
    }
    return fetch("http://localhost:8080/api/loginservice", {
      method: 'GET',
      headers: {
        "Authorization": "Basic " + btoa(this.credentials.getEmail() + ":" + this.credentials.getPassword()),
        "Accept": 'application/json',
        "Origin": "https://leandrocz15.github.io/"
      }
    }).then(response => {
      if (!response.ok) {
        throw new Error("Response status is not 200");
      }
      return response.json();
    }).then(data => {
      this.credentials.setUsserId(data.usserId);
    });
  }

  async fetchCsrfToken(email: string, password: string) {
    return await fetch("http://localhost:8080/generate-csrf-token", {
      method: 'GET',
      headers: {
        "Authorization": "Basic " + btoa(email + ":" + password),
        "Accept": 'application/json',
        "Origin": "https://leandrocz15.github.io/"
      }
    })
      .then(response => {
        if (!response.ok) {
          throw new Error("Response status is not 200");
        }
        return response.json();
      })
      .then(data => {
        this.credentials.setToken(data.token);
        this.credentials.setEmail(email);
        this.credentials.setPassword(password);
      });
  }

  //https://leandrobalancer-1914303512.sa-east-1.elb.amazonaws.com/Login

}