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

  /* Page index variable */
  selectedPageIndex : string = "0";

  /* Jira integration related variables */
  issuesToInput : Issue[] = [];
  issues : Issue[] = [];
  currentIssue : Issue = new Issue("", "", "", 0, 0, "", 0);

  /* Credentials variables */
  jiraCredentials : JiraLoginCredentials | null = null;
  appCredentials : AppCredentials | null = null;

  /* Sidebar util variables */
  sidebarToggled: boolean = false;
  sidebar: HTMLElement | null = null;
  sidebarButtons: HTMLCollectionOf<HTMLElement> | null = null;
  sidebarToggler: HTMLElement | null = null;

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
    this.initVariables();
  }

  toggleSidebar(){
    if(!this.sidebarToggled) {
      this.sidebarToggler!.setAttribute("src", "assets/right-arrow.svg");
      this.sidebar!.style.width = "55px";
      for(let i = 0 ; i < this.sidebarButtons!.length ; i++){
        this.sidebarButtons!.item(i)!.style.display = "none"; 
      }
    } else {
      //remove style so the sidebar will stay with the default configuration, otherwise it will get overlap
      this.sidebarToggler!.setAttribute("src", "assets/left-arrow.svg");
      this.sidebar!.removeAttribute("style");
      for(let i = 0 ; i < this.sidebarButtons!.length ; i++){
        //remove style so the buttons will stay with the default configuration, otherwise it will get overlap
        this.sidebarButtons!.item(i)!.removeAttribute("style"); 
      }
    }
    this.sidebarToggled = !this.sidebarToggled;
  }

  initVariables(){
    this.sidebar = document.getElementById("side-bar");
    this.sidebarButtons = document.getElementsByClassName("btn-text") as HTMLCollectionOf<HTMLElement>;
    this.sidebarToggler = document.getElementById("side-bar-toggler");
  }

}

