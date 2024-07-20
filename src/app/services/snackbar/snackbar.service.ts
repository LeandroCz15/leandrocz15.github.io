import { CommonModule } from '@angular/common';
import { Component, Inject, inject, Injectable } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarRef } from '@angular/material/snack-bar';
import { SNACKBAR } from 'src/application-constants';

@Injectable({
  providedIn: 'root'
})
export class SnackbarService {

  constructor(private snackBar: MatSnackBar) { }

  /**
   * This function will open a generic snackbar.
   * 
   * @param snackbarData Data to configure the snackbar.
   * @returns A reference to the opened snackbar.
   */
  show(snackbarData: SnackbarData): MatSnackBarRef<Snackbar> {
    return this.snackBar.openFromComponent(Snackbar,
      {
        data: snackbarData,
        duration: snackbarData.duration
      }
    );
  }

  /**
   * This function will open a snackbar representing a success.
   * 
   * @param message Message to show.
   * @param messageDetail A larger message, if this parameter is provided then a dialog can be opened to visualize it.
   * @param duration Duration of the snackbar.
   * @returns A reference to the opened snackbar.
   */
  showSuccess(message: string, messageDetail?: string, duration?: number): MatSnackBarRef<Snackbar> {
    return this.show(
      {
        status: SnackbarStatus.SUCCESS,
        message: message,
        duration: duration || SNACKBAR.defaultSuccessDuration,
        messageDetail: messageDetail
      }
    );
  }

  /**
   * This function will open a snackbar representing an error.
   * 
   * @param message Message to show.
   * @param messageDetail A larger message, if this parameter is provided then a dialog can be opened to visualize it.
   * @param duration Duration of the snackbar.
   * @returns A reference to the opened snackbar.
   */
  showError(message: string, messageDetail?: string, duration?: number): MatSnackBarRef<Snackbar> {
    return this.show(
      {
        status: SnackbarStatus.ERROR,
        message: message,
        duration: duration || SNACKBAR.defaultErrorDuration,
        messageDetail: messageDetail
      }
    );
  }

}

export interface SnackbarData {
  status: SnackbarStatus,
  duration: number,
  message: string,
  messageDetail?: string
}

export enum SnackbarStatus {
  SUCCESS, ERROR
}

@Component({
  selector: 'app-snackbar',
  styles: [`
    .snackbar-container {
      z-index: 1022;
    }

    .snackbar-ok {
      color: rgb(101, 216, 101);
    }

    .snackbar-error {
      color: hotpink;
    }

    .error-btn:hover {
      border-color: hotpink;
    }
    `],
  template: `
    <div class="d-flex justify-content-center align-items-center snackbar-container">
      <span class="d-flex justify-content-center fw-bold pe-0"
        matSnackBarLabel
        [ngClass]="snackbarData.status == snackbarStatus.SUCCESS ? 'snackbar-ok' : 'snackbar-error'">
          {{snackbarData.message}}
      </span>
      <span *ngIf="snackbarData.messageDetail" class="fw-bold">
        <button class="btn error-btn m-0"
          mat-button
          matSnackBarAction
          (click)="openDetail()">
            {{defaultSnackbarValues.defaultMessageDetailIcon}}
          </button>
      </span>
    </div>
  `,
  standalone: true,
  imports: [CommonModule]
})
class Snackbar {

  constructor(private dialog: MatDialog) { }

  public snackbarStatus = SnackbarStatus;

  private _snackbarRef = inject(MatSnackBarRef);


  /**
   * Returns a reference to the current snackbar.
   */
  get snackbarRef(): MatSnackBarRef<Snackbar> {
    return this._snackbarRef;
  }

  /**
   * Returns the snackbar data of the current snackbar.
   */
  get snackbarData(): SnackbarData {
    return this._snackbarRef.containerInstance.snackBarConfig.data;
  }

  /**
   * Return the default values for snackbar. This object is contained in
   * the application constants file.
   */
  get defaultSnackbarValues(): typeof SNACKBAR {
    return SNACKBAR;
  }

  /**
   * Open a detail modal to show the detail message of the current snackbar.
   * 
   * @returns A reference to the opened modal. 
   */
  openDetail(): MatDialogRef<MessageDetail, any> {
    return this.dialog.open(MessageDetail,
      {
        data: this.snackbarData.messageDetail
      }
    );
  }

}

@Component({
  selector: 'app-message-detail',
  styles: ['::ng-deep .cdk-overlay-container { z-index: 1021 !important }'],
  template: `
    <mat-dialog-content class="h-75">
      <div class="rounded overflow-auto p-3">
        <span class="text-dark text-break fw-bold">{{messageDetail}}</span>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions class="h-25" align="end">
      <button mat-dialog-close tabindex="-1" class="btn btn-secondary me-2">Close</button>
      <button mat-dialog-close tabindex="-1" class="btn btn-primary me-2" (click)="copyStackTrace()">Copy</button>
    </mat-dialog-actions>
  `,
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
})
class MessageDetail {

  constructor(@Inject(MAT_DIALOG_DATA) public messageDetail: string) { }

  /**
   * This function will copy the message detail to clipboard.
   */
  copyStackTrace(): void {
    navigator.clipboard.writeText(this.messageDetail);
  }

}