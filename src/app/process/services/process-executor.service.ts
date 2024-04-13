/**
 * @author Leandro Cazorla
 * 
 * This service is made for executing processes
 */
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ContextMenuItem } from 'src/app/basic-view/components/context-menu/context-menu.component';
import { SnackbarComponent } from 'src/app/basic-view/components/snackbar/snackbar.component';
import { CazzeonService } from 'src/app/cazzeon-service/cazzeon-service';
import { HttpMethod, SNACKBAR } from 'src/application-constants';

@Injectable({
  providedIn: 'root'
})
export class ProcessExecutorService {

  constructor(
    private cazzeonService: CazzeonService,
    private snackBar: MatSnackBar
  ) { }

  /**
   * Send a request to the backend to execute a cazzeon process
   * 
   * @param rows Rows to execute the process
   * @param item Item clicked
   */
  executeProcess(rows: any[], item: ContextMenuItem): void {
    this.cazzeonService.request(`api/execute/${item.javaClass}`, HttpMethod.POST, async (response: Response) => {
      const jsonResponse = await response.json();
      this.snackBar.openFromComponent(SnackbarComponent, {
        duration: SNACKBAR.defaultSuccessDuration,
        data: jsonResponse
      });
    }, async (response: Response) => {
      const jsonResponse = await response.json();
      this.snackBar.openFromComponent(SnackbarComponent, {
        duration: SNACKBAR.defaultErrorDuration,
        data: jsonResponse
      });
    }, (error: TypeError) => {
      console.error(`Unexpected error: ${error.message}`);
    }, JSON.stringify({ item: item, rows: rows }));
  }

}