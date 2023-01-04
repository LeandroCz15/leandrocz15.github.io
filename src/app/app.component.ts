import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Issue } from './classes/issue/issue';
import { JiraLoginCredentials } from './classes/login-credentials/login-credentials';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit, OnInit {
  title = 'Angular-proyect';
  selectedPageIndex : string = "0";
  currentIssue : Issue = new Issue("", "", "", 0, 0, "", -1);
  issuesToInput : Issue[] = [];
  issues : Issue[] = [];
  jiraCredentials : JiraLoginCredentials | null = null; 
  logged : boolean = false;
  gDomain : string = "";
  gEmail : string = "";
  gToken : string = "";

  changeJiraCredentials(credentials : any){
    this.jiraCredentials = new JiraLoginCredentials(credentials.domain, credentials.email, credentials.token);
  }

  jiraLogout(){
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

