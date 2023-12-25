import { Component, OnInit } from '@angular/core';
import { AuthService, HttpMethod } from 'src/app/login-module/auth-service';
import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-left-taskbar',
  templateUrl: './left-taskbar.component.html',
  styleUrls: ['./left-taskbar.component.css']
})
export class LeftTaskbarComponent implements OnInit {

  // Menu items
  public menuItems: Array<any> = [];

  // Boolean used to render the view once is ready
  public viewReady: boolean = false;

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.authService.fetchInformation(`api/data/menu`, HttpMethod.GET, async (response: Response) => {
      this.menuItems = await response.json();
      this.viewReady = true;
    }, (response: Response) => {
      console.log(`Error while retrieving menu items: Error status: ${response.status}`);
    });
  }

  // Opens the login modal
  openLoginModal(): void {
    bootstrap.Modal.getOrCreateInstance("#appLoginModal").show();
  }

  // Function to keep track of rows using the index given by the *ngFor
  trackByFn(index: number, item: any): number {
    return index;
  }

}
