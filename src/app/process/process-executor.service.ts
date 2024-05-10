import { Component, Inject, Injectable } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CazzeonService } from '../cazzeon-service/cazzeon-service';
import { HttpMethod, PROCESS_MODAL, SNACKBAR } from 'src/application-constants';
import { ServerResponse } from 'src/application-utils';
import { SnackbarComponent } from '../basic-view/components/snackbar/snackbar.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SelectorComponent } from '../basic-view/components/selector/selector.component';
import { BasicViewModule } from '../basic-view/basic-view.module';

export interface ProcessData {
  javaClass: string,
  buttonParameters: any[]
}

@Injectable({
  providedIn: 'root'
})
export class ProcessExecutorService {

  constructor(
    private cazzeonService: CazzeonService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private formBuilder: FormBuilder
  ) { }

  callProcess(rows: any[], processData: ProcessData): void {
    if (processData.buttonParameters.length > 0) {
      const processFormGroup: FormGroup = this.buildProcessForm(processData.buttonParameters);
      const processForm = this.formBuilder.group(processFormGroup);
      this.dialog.open(ProcessPopup, {
        data: { rows: rows, processExecutor: this, processData: processData, processForm: processForm },
        height: PROCESS_MODAL.defaultHeight,
        width: PROCESS_MODAL.defaultWidth
      });
    } else {
      this.sendProcessRequest(rows, processData);
    }
  }

  sendProcessRequest(rows: any[], processData: ProcessData, processParameters?: any): void {
    this.cazzeonService.request(`api/execute/${processData.javaClass}`, HttpMethod.POST, async (response: Response) => {
      const jsonResponse = await response.json();
      this.snackBar.openFromComponent(SnackbarComponent, {
        duration: SNACKBAR.defaultSuccessDuration,
        data: jsonResponse as ServerResponse
      });
    }, async (response: Response) => {
      const jsonResponse = await response.json();
      this.snackBar.openFromComponent(SnackbarComponent, {
        duration: SNACKBAR.defaultErrorDuration,
        data: jsonResponse as ServerResponse
      });
    }, (error: TypeError) => {
      console.error(`Unexpected error: ${error.message}`);
    }, JSON.stringify({ processData: processData, rows: rows, processParameters: processParameters }));
  }

  buildProcessForm(buttonParameters: any[]): any {
    const processFormGroup: any = {};
    buttonParameters.forEach((parameter: any) => {
      processFormGroup[parameter.name] = parameter.required ? [null, Validators.required] : [null];
    });
    return processFormGroup;
  }

}

@Component({
  selector: 'app-process-popup',
  styles: ['::ng-deep .cdk-overlay-container { z-index: 1021 !important }'],
  template: `
    <mat-dialog-content class="h-75">
      <div class="rounded overflow-auto p-3">
        <form [formGroup]="processForm">
        <ng-container *ngFor="let filter of data.tabData.formFields; let i = index ; trackBy: trackByFn">
            <!--Workaround to store a value-->
            <ng-container [ngSwitch]="filter.type" *ngIf="filter.hqlProperty | generateIdForForm as idForInput">
                <label [for]="idForInput" class="form-label">{{filter.name}}</label>
                <!--Selector case-->
                <app-selector *ngSwitchCase="'selector'" [formInput]="form" [formName]="idForInput"
                    [rowFormComponent]="this" [programmaticUpdate]="programmaticUpdate" [filter]="filter"
                    [matcher]="matcher">
                </app-selector>
                <!--Text case-->
                <input *ngSwitchCase="'text'" type="text" [id]=idForInput [formControlName]="idForInput"
                    [ngClass]="{'is-invalid': processForm.get(idForInput)?.errors}" class="form-control">
                <!--Large text case-->
                <textarea *ngSwitchCase="'lg-text'" type="text" [id]=idForInput [formControlName]="idForInput"
                    [ngClass]="{'is-invalid': processForm.get(idForInput)?.errors}" class="form-control" rows="6">
                </textarea>
                <input *ngSwitchCase="'password'" type="password" [id]=idForInput [formControlName]="idForInput"
                    [ngClass]="{'is-invalid': processForm.get(idForInput)?.errors}" class="form-control">
                <!--Checkbox case-->
                <input #checkboxInput *ngSwitchCase="'checkbox'" type="checkbox" [id]="idForInput"
                    [formControlName]="idForInput" class="btn ms-2">
                <!--Date case-->
                <div *ngSwitchCase="'date'" class="d-flex flex-column">
                    <mat-form-field *ngSwitchCase="'date'">
                        <mat-label>Choose a date</mat-label>
                        <input matInput [matDatepicker]="picker" [id]="idForInput" [formControlName]="idForInput"
                            [errorStateMatcher]="matcher">
                        <mat-hint>YYYY/MM/DD</mat-hint>
                        <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
                        <mat-datepicker #picker></mat-datepicker>
                    </mat-form-field>
                </div>
                <!--Decimal case-->
                <input *ngSwitchCase="'decimal'" type="number" [id]=idForInput [formControlName]="idForInput"
                    [ngClass]="{'is-invalid': processForm.get(idForInput)?.errors}" class="form-control">
                <!--Natural case-->
                <input *ngSwitchCase="'natural'" type="number" step="1" min="0" [id]=idForInput
                    [formControlName]="idForInput" [ngClass]="{'is-invalid': processForm.get(idForInput)?.errors}"
                    class="form-control">
                <!--Integer case-->
                <input *ngSwitchCase="'integer'" type="number" step="1" [id]=idForInput [formControlName]="idForInput"
                    [ngClass]="{'is-invalid': processForm.get(idForInput)?.errors}" class="form-control">
                <hr>
            </ng-container>
        </ng-container>
        </form>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions class="h-25" align="end">
      <button mat-dialog-close tabindex="-1" class="btn btn-secondary me-2">Close</button>
      <button mat-dialog-close tabindex="-1" class="btn btn-primary me-2" (click)="sendProcessRequestWithParameters()">Execute</button>
    </mat-dialog-actions>
  `,
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, ReactiveFormsModule, CommonModule, BasicViewModule],
})
export class ProcessPopup {

  public processForm: FormGroup;

  constructor(@Inject(MAT_DIALOG_DATA) private data: any) {
    this.processForm = data.processForm;
  }

  sendProcessRequestWithParameters(): void {
    this.data.processExecutor.sendProcessRequest(this.data.rows, this.data.processData, this.processForm.getRawValue());
  }

  // Function to keep track of rows using the index given by the *ngFor
  trackByFn(index: number, item: any): number {
    return index;
  }

}
