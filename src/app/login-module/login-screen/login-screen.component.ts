import { Component, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { CazzeonService } from '../../cazzeon-service/cazzeon-service';
import { HttpMethod, LoginStatus } from 'src/application-constants';

@Component({
  selector: 'app-login-screen',
  templateUrl: './login-screen.component.html',
  styleUrls: ['./login-screen.component.css']
})
export class LoginScreenComponent implements OnInit {

  public loading: boolean = false;

  public formGroup: FormGroup;

  constructor(public cazzeonService: CazzeonService) {
    this.formGroup = new FormGroup({
      email: new FormControl("", [Validators.required, Validators.email]),
      password: new FormControl("", [Validators.required, Validators.minLength(10)])
    });
  }

  ngOnInit(): void {
    if (this.cazzeonService.getJwtToken() !== "") {
      this.loading = true;
      setTimeout(() => {
        this.checkIfTokenIsValid().then(() => {
          this.cazzeonService.login();
        }).catch(reason => {
          this.loading = false;
          this.cazzeonService.clearTokens();
        });
      }, 1000);
    }
  }

  /**
   * Submit the login form to authenticate the user
   */
  submitLogin(): void {
    this.formGroup.markAllAsTouched();
    if (!this.loginForm.invalid) {
      this.loading = true;
      this.cazzeonService.request(`api/auth/login`, HttpMethod.POST, async (response: Response) => {
        this.loading = false;
        this.cazzeonService.setJwtToken((await response.json()).token);
        this.cazzeonService.login();
      }, async (response: Response) => {
        this.loading = false;
      }, (error: any) => {
        this.loading = false;
      }, JSON.stringify({ email: this.loginForm.get("email")!.value, password: this.loginForm.get("password")!.value }));
    }
  }

  /**
 * If the response of the fetch in this function is OK it means that the jwt token in the session is still valid
 * @returns 
 */
  checkIfTokenIsValid(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.cazzeonService.request(`api/dummy`, HttpMethod.GET, (response: Response) => {
        resolve();
      }, (response: Response) => {
        reject();
      }, (error: any) => {
        reject();
      });
    });
  }

  /**
   * Function used to style the inputs of the login form
   * @param control Form control. In this case it could be password control or email control
   * @returns Boolean to use to style with invalid the inputs
   */
  loginInputStyling(control: AbstractControl<any, any>): boolean {
    return control.errors && control.touched || false;
  }

  get loginForm(): FormGroup {
    return this.formGroup;
  }

}
