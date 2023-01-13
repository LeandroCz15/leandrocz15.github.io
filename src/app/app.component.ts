import { AfterViewInit, Component, OnInit } from '@angular/core';
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
    adjustMainLayout();
    window.onresize = function(event){
      adjustMainLayout();
    }
    }
  }

  function adjustMainLayout(){
    let topBarPx = document.getElementById("topNavbar")!.clientHeight;
    let leftBar : HTMLElement | null = document.getElementById("leftBar");
    leftBar!.style.height = window.innerHeight - topBarPx + "px";
    let mainContent : HTMLElement | null = document.getElementById("mainBoxContent");
    mainContent!.style.height = window.innerHeight - topBarPx + "px";
    mainContent!.style.width = document.getElementById("mainContainer")!.clientWidth - leftBar!.clientWidth + "px";
  }

