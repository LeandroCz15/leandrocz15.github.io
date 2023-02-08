import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-main-page-index',
  templateUrl: './main-page-index.component.html',
  styleUrls: ['./main-page-index.component.css']
})
export class MainPageIndexComponent implements OnInit {

  /* This component */
  component = MainPageIndexComponent;
  
  /* Mage */
  static mage: HTMLElement | null = null;
  showDialog: boolean = false;
  mageMessage: string | undefined = undefined;

  /* Scenario */
  static scenario: HTMLElement | null = null;

  ngOnInit(){
    this.initVariables();
    this.showMagePresentation();
  }

  initVariables(): void{
    MainPageIndexComponent.mage = document.getElementById("mage");
    MainPageIndexComponent.scenario = document.getElementById("scenario");
  }

  showMagePresentation(): void{
    setTimeout(this.startMageTalk, 2200); //2200 ms to show first dialog
  }

  startMageTalk = async () => {
    this.showDialog = true;
    await this.changeMessages("Hola bu" , 3, true);
    await this.changeMessages("No te olvides" , 2, true);
    await this.changeMessages("Que te amo" , 2, true);
    await this.changeMessages("Con todo mi corazon" , 5, false);

  };

  async changeMessages(message: string, seconds: number, keepShowingDialog: boolean){
    this.mageMessage = message;
    await new Promise(resolve => setTimeout(resolve, seconds * 1000));
    this.showDialog = keepShowingDialog;
  }

}
