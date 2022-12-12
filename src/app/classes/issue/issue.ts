export class Issue{
    id : string = "";
    key : string = "";
    summary : string = "";
    toggled : boolean = false;
    loggedText : string = "";
    loggedHours : number = 0;
    loggedMinutes : number = 0;
    originalEstimate : number = 0;
    timeSpent : number = 0;
    statusName : string = "";
    statusCategoryId : number = 0;
    hidden : boolean = false;
  
    constructor(id : string,
      key : string,
      summary : string,
      originalEstimate : number,
      timeSpent : number,
      statusName : string,
      statusCategoryId : number,
      ){
      this.id = id;
      this.key = key
      this.summary = summary;
      this.originalEstimate = originalEstimate;
      this.timeSpent = timeSpent;
      this.statusName = statusName;
      this.statusCategoryId = statusCategoryId;
    }

    cleanProperties() : void{
      this.loggedText = "";
      this.loggedHours = 0;
      this.loggedMinutes = 0;
    }

  }


  