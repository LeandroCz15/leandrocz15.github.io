import { AfterViewInit, Component } from '@angular/core';
import { Issue } from './classes/issue/issue';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {
  title = 'Angular-proyect';
  selectedPageIndex : string = "0";
  currentIssue : Issue = new Issue("", "", "", 0, 0, "", -1);
  issuesToInput : Issue[] = [];
  issues : Issue[] = [];
  logged : boolean = false;
  gDomain : string = "";
  gEmail : string = "";
  gToken : string = "";

  changeCredentials(credentials : any){
    this.logged = true;
    this.gDomain = credentials.domain;
    this.gEmail = credentials.email;
    this.gToken = credentials.token;
  }

  logout(){
    this.logged = false;
    this.gDomain = "";
    this.gEmail = "";
    this.gToken = "";
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

}

const herokuappUrl : string = "https://guarded-reef-52511.herokuapp.com/";
