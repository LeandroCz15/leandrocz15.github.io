import { Component, Inject, Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SelectorComponent, SelectorData, SelectorFormComponent } from '../selector/selector.component';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { DatePickerComponent } from '../date-picker/date-picker.component';
import { FileUploaderComponent, FileUploaderData, FileUploaderFormComponent } from '../file-uploader/file-uploader.component';
import { PROCESS_MODAL } from 'src/application-constants';
import { CazzeonFormComponent } from '../cazzeon-form-component';

export enum DataType {
  TEXT = "text",
  LARGE_TEXT = "lg-text",
  CHECKBOX = "checkbox",
  NATURAL = "natural",
  INTEGER = "integer",
  DECIMAL = "decimal",
  DATE = "date",
  SELECTOR = "selector",
  FILE = "file",
  PASSWORD = "password"
}

@Injectable({
  providedIn: 'root'
})
export class CazzeonFormBuilderService {

  constructor(private dialog: MatDialog) { }

  openCazzeonForm(cazzeonFormData: CazzeonFormData, extraData?: any, heightPcntg?: string, widthPcntg?: string): void {
    this.dialog.open(CazzeonForm, {
      data: { cazzeonFormData: cazzeonFormData, extraData: extraData },
      height: heightPcntg || PROCESS_MODAL.defaultHeight,
      width: widthPcntg || PROCESS_MODAL.defaultWidth
    });
  }

}

export interface CazzeonFormData {
  elements: CazzeonFormComponent[]
  okLabel: string
  cancelLabel: string
  executionFn: (event: Event, form: FormGroup, extraData?: any) => void
  closeFn: (event: Event, form: FormGroup, extraData?: any) => void
}

@Component({
  selector: 'app-cazzeon-form',
  styles: ['::ng-deep .cdk-overlay-container { z-index: 1021 !important }'],
  template: `
  <mat-dialog-content class="h-75">
    <div class="rounded overflow-auto p-2">
      <form [formGroup]="formGroup">
      <ng-container *ngFor="let formElement of data.cazzeonFormData.elements; let i = index ; trackBy: trackByFn">
        <ng-container [ngSwitch]="formElement.dataType">
          <label [for]="formElement.name" class="form-label">{{formElement.name}}</label>
          <!--Selector case-->
          <app-selector *ngSwitchCase="type.SELECTOR"
            [formGroup]="formGroup"
            [formControlName]="formElement.formName"
            [selectorData]="buildSelectorData(formElement)">
          </app-selector>
          <!--Text case-->
          <input *ngSwitchCase="type.TEXT"
            type="text"
            class="form-control"
            [formControl]="formControls[i]"
            [ngClass]="{'is-invalid': formControls[i].errors}">
          <!--Large text case-->
          <textarea *ngSwitchCase="type.LARGE_TEXT"
            type="text"
            class="form-control"
            rows="6"
            [formControl]="formControls[i]"
            [ngClass]="{'is-invalid': formControls[i].errors}">
          </textarea>
          <input *ngSwitchCase="type.PASSWORD"
            type="password"
            class="form-control"
            [formControl]="formControls[i]"
            [ngClass]="{'is-invalid': formControls[i].errors}">
          <!--Checkbox case-->
          <input *ngSwitchCase="type.CHECKBOX"
            type="checkbox"
            class="btn ms-2"
            [formControl]="formControls[i]">
          <!--Date case-->
          <app-date-picker *ngSwitchCase="type.DATE"
            [formGroup]="formGroup"
            [formControlName]="formElement.formName">
          </app-date-picker>
          <!--Decimal case-->
          <app-decimal *ngSwitchCase="type.DECIMAL"
            [formGroup]="formGroup"
            [formControl]="formControls[i]">
          </app-decimal>
          <!--Natural case-->
          <app-natural *ngSwitchCase="type.NATURAL"
            [formGroup]="formGroup"
            [formControl]="formControls[i]">
          </app-natural>
          <!--Integer case-->
          <app-integer *ngSwitchCase="type.INTEGER"
            [formGroup]="formGroup"
            [formControl]="formControls[i]">
          </app-integer>
          <!--File case-->
          <app-file-uploader *ngSwitchCase="type.FILE"
            [formGroup]="formGroup"
            [formControl]="formControls[i]"
            [data]="buildFileUploaderData(formElement)">
          </app-file-uploader>
          <hr>
        </ng-container>
      </ng-container>
      </form>
    </div>
  </mat-dialog-content>
  <mat-dialog-actions class="h-25" align="end">
    <button mat-dialog-close tabindex="-1" class="btn btn-secondary me-2">{{data.cazzeonFormData.cancelLabel}}</button>
    <button mat-dialog-close tabindex="-1" class="btn btn-primary me-2" (click)="data.cazzeonFormData.executionFn($event, formGroup, data.extraData)">{{data.cazzeonFormData.okLabel}}</button>
  </mat-dialog-actions>
  `,
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatDatepickerModule,
    MatInputModule,
    SelectorComponent,
    DatePickerComponent,
    FileUploaderComponent
  ]
})
export class CazzeonForm {

  public type = DataType; // Data types

  public formGroup: FormGroup; // Form group of this form
  public formControls: FormControl[] = []; // Form controls of this form. This variable was made to avoid formGroup.get(...) on every style calculation

  constructor(@Inject(MAT_DIALOG_DATA) public data: { cazzeonFormData: CazzeonFormData, extraData?: any }, private formBuilder: FormBuilder) {
    const newGroup: any = {};
    for (let i = 0; i < data.cazzeonFormData.elements.length; i++) {
      const currentElement = data.cazzeonFormData.elements[i];
      const currentElementControl = currentElement.buildFormControl();
      this.formControls.push(currentElementControl);
      newGroup[currentElement.formName] = currentElementControl;
    }
    this.formGroup = this.formBuilder.group(newGroup);
  }

  buildSelectorData(element: CazzeonFormComponent): SelectorData {
    const castComponent = element as SelectorFormComponent;
    return { entityToSearch: castComponent.entityToSearch, propertyForMatch: castComponent.propertyForMatch, identifiers: castComponent.identifiers };
  }

  buildFileUploaderData(element: CazzeonFormComponent): FileUploaderData {
    const castComponent = element as FileUploaderFormComponent;
    return { maxFileSize: castComponent.maxFileSize, fileExtension: castComponent.fileExtension };
  }

  // Function to keep track of rows using the index given by the *ngFor
  trackByFn(index: number, item: any): number {
    return index;
  }

}
