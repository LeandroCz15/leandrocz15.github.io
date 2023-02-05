import { AfterViewInit, Component, OnInit } from '@angular/core';
import { event } from 'jquery';
import { AppCredentials } from './classes/app-credentials/app-credentials';
import { Issue } from './classes/issue/issue';
import { JiraLoginCredentials } from './classes/jira-login-credentials/jira-login-credentials';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit, OnInit {
  title = 'Leandro\'s-proyect';
  selectedPageIndex : string = "0";
  currentIssue : Issue = new Issue("", "", "", 0, 0, "", -1);
  issuesToInput : Issue[] = [];
  issues : Issue[] = [];
  jiraCredentials : JiraLoginCredentials | null = null;
  appCredentials : AppCredentials | null = null;
  sideBarToggled: boolean = false;

  appLogin(credentials : any){
    this.appCredentials = new AppCredentials(credentials.form.appEmail, credentials.form.appPassword, credentials.admin);
  }

  appLogout(){
    this.appCredentials = null;
  }

  jiraLogin(credentials : any){
    this.jiraCredentials = new JiraLoginCredentials(credentials.domain, credentials.email, credentials.token);
  }

  jiraLogout(){
    this.issues.splice(0);
    this.issuesToInput.splice(0);
    this.jiraCredentials = null;
  }

  changeIssueInput(issue : Issue){
    if(issue.toggled) {
      issue.toggled = false;
      this.issuesToInput.splice(this.issuesToInput.indexOf(issue), 1);
      this.issues.push(issue);
    } else {
      issue.toggled = true;
      this.issues.splice(this.issues.indexOf(issue), 1);
      this.issuesToInput.push(issue);
    }
  }

  changeSelectedIssue(issue : Issue){
    this.currentIssue = issue;
  }

  updatePage(newPageIndex : string){
    document.getElementById(this.selectedPageIndex)!.style.backgroundColor = "#212529";
    document.getElementById(newPageIndex)!.style.backgroundColor = "#0d6efd";
    this.selectedPageIndex = newPageIndex;
  }

  ngAfterViewInit(){
    document.getElementById(this.selectedPageIndex)!.style.backgroundColor = "#0d6efd";
  }

  ngOnInit(){
    this.resizeTopNavbarOnWindowChange()
    this.resizeTopNavbarOnInit();
  }

  toggleSidebar(){
    //toggler function of left sidebar
    let newWidth: number;
    let sideBar: HTMLElement | null = document.getElementById("side-bar");
    let sideBarButtons: HTMLCollectionOf<HTMLElement> = document.getElementsByClassName("btn-text") as HTMLCollectionOf<HTMLElement>;
    let sideBarToggler: HTMLElement | null = document.getElementById("side-bar-toggler");
    if(!this.sideBarToggled) {
      sideBarToggler!.setAttribute("src", "assets/right-arrow.svg");
      newWidth = 55;
      sideBar!.style.width = newWidth + "px";
      for(let i = 0 ; i < sideBarButtons.length ; i++){
        sideBarButtons.item(i)!.style.display = "none"; 
      }
    } else {
      sideBarToggler!.setAttribute("src", "assets/left-arrow.svg");
      newWidth = 155;
      sideBar!.style.width = newWidth + "px";
      for(let i = 0 ; i < sideBarButtons.length ; i++){
        sideBarButtons.item(i)!.style.display = "inline"; 
      }
    }
    this.sideBarToggled = !this.sideBarToggled;
    this.resizeTopNavbarOnSideBarChange(newWidth);
  }

  resizeTopNavbarOnSideBarChange(newSize: number){
    let navBar: HTMLElement | null = document.getElementById("navbar");
    navBar!.style.width = window.innerWidth - newSize + "px";
  }

  resizeTopNavbarOnInit(){
    //function to handle the size of the top navbar, since i didnt find a way to make it look good when adding property fixed to the navbar
    let navBar: HTMLElement | null = document.getElementById("navbar");
    let sideBar: HTMLElement | null = document.getElementById("side-bar");
    navBar!.style.width = window.innerWidth - sideBar!.clientWidth + "px";
  }

  resizeTopNavbarOnWindowChange(){
    window.onresize = function(){
      let navBar: HTMLElement | null = document.getElementById("navbar");
      let sideBar: HTMLElement | null = document.getElementById("side-bar");
      navBar!.style.width = window.innerWidth - sideBar!.clientWidth + "px";
    }
  }

}

