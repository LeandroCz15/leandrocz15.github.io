import { Component, Inject, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarRef } from '@angular/material/snack-bar';
import { SNACKBAR, STACK_TRACE_MODAL } from 'src/application-constants';
import { ServerResponse } from 'src/application-utils';

@Component({
  selector: 'app-snackbar',
  templateUrl: './snackbar.component.html',
  styleUrls: ['./snackbar.component.css']
})
export class SnackbarComponent {

  constructor(private dialog: MatDialog) { }

  private snackBarRef = inject(MatSnackBarRef);

  /**
   * Open a modal with the stack trace information
   */
  onErrorDetailClick(): void {
    this.dialog.open(ErrorDialogComponent, { data: this.snackBarData, height: STACK_TRACE_MODAL.defaultHeight, width: STACK_TRACE_MODAL.defaultWidth });
  }

  /**
   * Getter for easy access to snackbar data
   */
  get snackBarData(): ServerResponse {
    return this.snackBarRef.containerInstance.snackBarConfig.data;
  }

  /**
   * Get the error icon of the application constants
   */
  get snackbarErrorIcon(): string {
    return SNACKBAR.defaultMessageDetailIcon;
  }

}

@Component({
  selector: 'app-error-dialog',
  styles: ['::ng-deep .cdk-overlay-container { z-index: 1021 !important }'],
  template: `
    <mat-dialog-content class="h-75">
      <div class="rounded overflow-auto p-3">
        <span class="text-dark text-break fw-bold">{{data.exceptionStackTrace}}</span>
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
export class ErrorDialogComponent {
  
  constructor(@Inject(MAT_DIALOG_DATA) public data: ServerResponse) { }

  /**
   * Copy the error stacktrace to clipboard
   */
  copyStackTrace(): void {
    navigator.clipboard.writeText(this.data.exceptionStackTrace);
  }

}