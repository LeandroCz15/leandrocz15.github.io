import { Component } from '@angular/core';
declare var $: any; 

@Component({
  selector: 'app-mage',
  templateUrl: './mage.component.html',
  styleUrls: ['./mage.component.css']
})
export class MageComponent {

  /* Mage */
  static mage: HTMLElement | null = null;
  static mageWidth:number = 100;
  static mageHeight:number = 100;
  showDialog: boolean = false;
  mageMessage: string | undefined = undefined;
  static isDragging: boolean = false;

  ngOnInit(){
    this.initVariables();
    this.showMagePresentation();
  }

  initVariables(): void{
    MageComponent.mage = document.getElementById("mage-container");
    MageComponent.mage!.style.left = (window.innerWidth/2)-(MageComponent.mageWidth/2) + "px";
  }

  showMagePresentation(): void{
    setTimeout(this.startMageTalk, 1900); //1900 ms to show first dialog
  }

  startMageTalk = async (): Promise<void> => {
    this.showDialog = true;
    await this.changeMessages("Hola bu", 2, true);
    await this.changeMessages("No te olvides", 2, true);
    await this.changeMessages("Que te amo", 2, true);
    await this.changeMessages("Con todo mi corazon", 5, false);
    this.addEventsForMage();
  };

  async changeMessages(message: string, seconds: number, keepShowingDialog: boolean): Promise<void>{
    this.mageMessage = message;
    await new Promise(resolve => setTimeout(resolve, seconds * 1000));
    this.showDialog = keepShowingDialog;
  }

  addEventsForMage(): void{
    MageComponent.mage!.addEventListener('mousedown', function(e){
      MageComponent.isDragging = true;
    });
    MageComponent.mage!.addEventListener('mousemove', function(e){
      if(MageComponent.isDragging){
        MageComponent.mage!.style.top = (e.clientY - (MageComponent.mageHeight/2) - 25) + "px"; //Ese - 35 es para que se visualize un poco mejor el alto desde donde se agarra, corregir segun sea necesario
        MageComponent.mage!.style.left = (e.clientX - (MageComponent.mageWidth/2))+ "px";
      }
    });
    MageComponent.mage!.addEventListener('mouseup', function(e){
      MageComponent.isDragging = false;
    });
    MageComponent.mage!.addEventListener('dblclick', function(e){
      $('#jiraLoginModal').modal('show');
      createLine();
    });
  }

}

function createLine(): void{
  console.log("intente crear linea");
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("height", "100");
  svg.setAttribute("width", "100");

  const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
  line.setAttribute("x1", "0");
  line.setAttribute("y1", "0");
  line.setAttribute("x2", "50");
  line.setAttribute("y2", "50");
  line.setAttribute("style", "stroke:rgb(0,0,0);stroke-width:2");

  svg.appendChild(line);
  document.body.appendChild(svg);
}
