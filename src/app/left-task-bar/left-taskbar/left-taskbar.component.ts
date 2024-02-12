import { Component, ElementRef, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { CazzeonService } from 'src/app/cazzeon-service/cazzeon-service';
import * as bootstrap from 'bootstrap';
import { HttpMethod, LoginStatus } from 'src/application-constants';
import { ToggleSidebarService } from 'src/app/top-navbar/services/toggle-sidebar.service';
import { Subscription } from 'rxjs';
import { NavbarElementComponent } from '../navbarelement/navbarelement.component';

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

  @ViewChild("userText") userText!: ElementRef;

  @ViewChildren(NavbarElementComponent) sidebarButtons!: QueryList<NavbarElementComponent>;

  constructor(private cazzeonService: CazzeonService, private toggleSidebarService: ToggleSidebarService) { }

  ngOnInit(): void {
    this.toggleSidebarSubscription = this.toggleSidebarService.getObservable().subscribe(data => this.toggleSidebar(data));
    this.cazzeonService.request(`api/data/menu`, HttpMethod.GET, async (response: Response) => {
      this.menuItems = await response.json();
      this.viewReady = true;
    }, async (response: Response) => {
      console.error(`Error while retrieving menu items. Error: ${await response.text()}`);
    }, (error: any) => {
      console.error("Timeout when fetching menu items");
    });
  }

  ngOnDestroy(): void {
    this.toggleSidebarSubscription.unsubscribe();
  }

  toggleSidebar(toggle: boolean): void {
    if (toggle) {
      this.sidebarButtons.forEach(button => {
        button.titleDisplayer.nativeElement.style.display = "none";
      });
      this.userText.nativeElement.style.display = "none";
      this.sidebarElement.nativeElement.style.width = SIDEBAR_TOGGLED_WIDTH;
    } else {
      this.sidebarButtons.forEach(button => {
        button.titleDisplayer.nativeElement.style.display = "";
      });
      this.userText.nativeElement.style.display = "";
      this.sidebarElement.nativeElement.style = null;
    }
  }

  logout(): void {
    this.cazzeonService.clearTokens();
    this.cazzeonService.loginSubject.next(LoginStatus.LOGOUT);
  }

  // Opens the login modal. Deprecated, only left for future reference
  openLoginModal(): void {
    bootstrap.Modal.getOrCreateInstance("#appLoginModal").show();
  }

  // Function to keep track of rows using the index given by the *ngFor
  trackByFn(index: number, item: any): number {
    return index;
  }

}
