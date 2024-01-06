import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { LeftTaskbarComponent } from './left-task-bar/left-taskbar/left-taskbar.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  /* Page index variable */
  selectedPageIndex: string = "100";


  /* Sidebar util variables */
  sidebarToggled: boolean = false;
  sidebarButtons: HTMLCollectionOf<HTMLElement> | null = null;
  sidebarToggler: HTMLElement | null = null;

  @ViewChild(LeftTaskbarComponent) taskBarComponent!: LeftTaskbarComponent;

  updatePage(newPageIndex: string) {
    document.getElementById(this.selectedPageIndex)!.style.backgroundColor = "#212529";
    document.getElementById(newPageIndex)!.style.backgroundColor = "#0d6efd";
    this.selectedPageIndex = newPageIndex;
  }

  ngOnInit() {
    this.initVariables();
  }

  toggleSidebar() {
    if (!this.sidebarToggled) {
      //this.sidebarToggler!.setAttribute("src", "assets/right-arrow.svg");
      this.taskBarComponent.sideBarElement.nativeElement.style.width = "55px";
      for (let i = 0; i < this.sidebarButtons!.length; i++) {
        this.sidebarButtons!.item(i)!.style.display = "none";
      }
    } else {
      //remove style so the sidebar will stay with the default configuration, otherwise it will get overlap
      //this.sidebarToggler!.setAttribute("src", "assets/left-arrow.svg");
      this.taskBarComponent.sideBarElement.nativeElement.removeAttribute("style");
      for (let i = 0; i < this.sidebarButtons!.length; i++) {
        //remove style so the buttons will stay with the default configuration, otherwise it will get overlap
        this.sidebarButtons!.item(i)!.removeAttribute("style");
      }
    }
    this.sidebarToggled = !this.sidebarToggled;
  }

  initVariables() {
    this.sidebarButtons = document.getElementsByClassName("btn-text") as HTMLCollectionOf<HTMLElement>;
    this.sidebarToggler = document.getElementById("side-bar-toggler");
  }

}

