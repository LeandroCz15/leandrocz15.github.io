import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AuthService } from 'src/app/login-module/auth-service';
import * as bootstrap from 'bootstrap';
import { HttpMethod } from 'src/application-constants';
import { ToggleSidebarService } from 'src/app/top-navbar/services/toggle-sidebar.service';
import { Subscription } from 'rxjs';

const SIDEBAR_TOGGLED_WIDTH = "55px";

@Component({
  selector: 'app-left-taskbar',
  templateUrl: './left-taskbar.component.html',
  styleUrls: ['./left-taskbar.component.css']
})
export class LeftTaskbarComponent implements OnInit, OnDestroy {

  // Menu items
  public menuItems: any[] = [];

  // Boolean used to render the view once is ready
  public viewReady: boolean = false;

  // Subscription of the toggle sidebar service
  private toggleSidebarSubscription!: Subscription;

  @ViewChild("sideBarElement") sidebarElement!: ElementRef;

  constructor(private authService: AuthService, private toggleSidebarService: ToggleSidebarService) { }

  ngOnInit(): void {
    this.toggleSidebarSubscription = this.toggleSidebarService.getObservable().subscribe(data => this.toggleSidebar(data));
    this.authService.fetchInformation(`api/data/menu`, HttpMethod.GET, async (response: Response) => {
      this.menuItems = await response.json();
      this.viewReady = true;
    }, (response: Response) => {
      console.log(`Error while retrieving menu items: Error status: ${response.status}`);
    }, (error: any) => {
      console.error("Timeout when fetching menu items");
    });
  }

  ngOnDestroy(): void {
    this.toggleSidebarSubscription.unsubscribe();
  }

  toggleSidebar(toggle: boolean): void {
    if (toggle) {
      this.sidebarElement.nativeElement.style.width = SIDEBAR_TOGGLED_WIDTH;
    } else {
      //this.sidebarToggler!.setAttribute("src", "assets/left-arrow.svg");
      this.sidebarElement.nativeElement.style = null;
    }
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
