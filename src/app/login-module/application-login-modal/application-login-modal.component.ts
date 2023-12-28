import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AuthService } from '../auth-service';
import { HttpMethod } from 'src/application-constants';
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

  constructor(private formBuilder: FormBuilder, private authService: AuthService) {
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

  fetchCsrfToken(email: string, password: string) {
    return new Promise((resolve, reject) => {
      this.authService.fetchInformation(`generate-csrf-token`, HttpMethod.GET, async (response: Response) => {
        let responseJson = await response.json();
        this.authService.setToken(responseJson.token);
        responseJson.userDTO.password = password;
        this.authService.setUser(responseJson.userDTO);
        resolve(responseJson);
      }, (response: Response) => {
        console.log(`Error while fetching csrf token. Error: ${response}`);
        reject(response);
      }, (error: any) => {
        console.error("Error while fetching CSRF TOKEN");
      }, undefined, email, password);
    });
  }

}