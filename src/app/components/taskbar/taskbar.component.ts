import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Issue } from 'src/app/classes/issue/issue';
import { JiraLoginCredentials } from 'src/app/classes/login-credentials/login-credentials';

@Component({
  selector: 'app-taskbar',
  templateUrl: './taskbar.component.html',
  styleUrls: ['./taskbar.component.css']
})
export class TaskbarComponent {
  @Input() issuesParam! : Issue[];
  @Input() issuesToInputParam! : Issue[];
  @Input() fetchCredentials! : JiraLoginCredentials | null;
  @Output() changeCurrentIssueEvent = new EventEmitter<Issue>();

  filterByInputedChk : boolean = false;
  isLoading : boolean = false;
  filterArray : string[] = ["Open", "En test", "Closed", "In progress"];

  changeCheckValue(){
    this.filterByInputedChk = !this.filterByInputedChk;
  }
  
  emitIssueEvent(issue: Issue) {
    this.changeCurrentIssueEvent.emit(issue);
  }

  async getIssues(){
    await fetch(herokuappUrl + jiraSearchUrl, {
      method: 'GET',
      headers: {
        'Authorization': 'Basic ' + btoa(this.fetchCredentials!.email + ':' + this.fetchCredentials!.token),
        'Accept': 'application/json'
      }
    })
    .then(response => response.json())
    .then(data => {
      this.issuesParam.splice(0);
        data.issues.forEach((issue: { id: string; key: string; fields: { summary: string; timeoriginalestimate: number; timespent: number; status: { name: string; statusCategory: { id: number; }; }; }; }) => {
          if(!this.checkExistingIssue(issue.id)){
            this.issuesParam.push(new Issue(
              issue.id,
              issue.key,
              issue.fields.summary,
              issue.fields.timeoriginalestimate,
              issue.fields.timespent,
              issue.fields.status.name,
              issue.fields.status.statusCategory.id));
          }
        });
      });
      fetch('http://leandroapp-env-1.eba-sg55vjwj.sa-east-1.elasticbeanstalk.com/Query?tableName=users', {
        method: 'GET',
        headers: {
          'Authorization': 'Basic ' + btoa('Leandro' + ':' + 'cacholamcp'),
          'Accept': 'application/json',
          'Origin': 'https://leandrocz15.github.io/'
        }
      }).then(response => response.json())
      .then(data => console.log(data));
    }

    checkExistingIssue(id : string) {
      let returnValue : boolean = false;
      this.issuesToInputParam.forEach(issue => {
        if(issue.id === id){
          returnValue = true;
        }
      })
      return returnValue;
    }

    filterIssue(issue : Issue){
      for(let i=0 ; i < this.filterArray.length ; i++){
        if(false || this.filterArray[i].toLocaleLowerCase() === issue.statusName.toLowerCase()){
          return true
        }
      }
      return false;
    }

    filterIssueByName(inputString : string){
      if(inputString[0] !== undefined){
      this.issuesParam.forEach(issue =>{
          let lowerCaseInput = inputString.toLowerCase();
          issue.hidden = !issue.key.toLowerCase().includes(lowerCaseInput) && !issue.summary.toLowerCase().includes(lowerCaseInput);      
        });
      } else{
        this.issuesParam.forEach(issue =>{
          issue.hidden = false;
        });
      }
    }

    inputIssues(){
      let date = new Date();
      this.issuesToInputParam.forEach(async issue => {
        console.log("Currently input in: " + issue.key);
        let data = {
          "timeSpentSeconds": (issue.loggedHours * 60 * 60) + (issue.loggedMinutes * 60),
          "comment": {
            "type": "doc",
            "version": 1,
            "content": [{
              "type": "paragraph",
              "content": [{
                "text": issue.loggedText,
                "type": "text",
              }]
            }]
          },
        }
        await fetch(herokuappUrl + this.fetchCredentials!.domain + jiraLogWorkUrl.replace("?", issue.key), {
          method: 'POST',
          headers: {
            'Authorization': 'Basic ' + btoa(this.fetchCredentials!.email + ':' + this.fetchCredentials!.token),
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data)
        }).then(response => {
          console.log(response);
          if(response.ok){
            this.issuesToInputParam.splice(this.issuesToInputParam.indexOf(issue), 1);
            console.log(issue.key + " logged correctly");
          }
        });
      });
      //empieza peticion.
      //esconder issues.
      //mostrar carga.
      //termina peticion.
      //mover issues a arreglo de issues no inputados.
    }
  
}

const herokuappUrl : string = "https://guarded-reef-52511.herokuapp.com/";
const jiraSearchUrl : string = "https://etendoproject.atlassian.net/rest/api/3/search?jql=assignee=currentUser()";
const jiraLogWorkUrl: string = "/rest/api/3/issue/?/worklog";

