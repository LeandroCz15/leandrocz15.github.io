import { Component, Inject, Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SelectorComponent, SelectorData, SelectorFormComponent } from '../selector/selector.component';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { DatePickerComponent } from '../date-picker/date-picker.component';
import { FileUploaderComponent, FileUploaderData, FileUploaderFormComponent } from '../file-uploader/file-uploader.component';
import { PROCESS_MODAL } from 'src/application-constants';
import { CazzeonFormComponent } from '../cazzeon-form-component/cazzeon-form-component';
import { LargeTextComponent, LargeTextFormComponent } from '../large-text/large-text.component';
import { PasswordComponent } from '../password/password.component';
import { CheckboxComponent } from '../checkbox/checkbox.component';
import { TextComponent } from '../text/text.component';
import { IntegerComponent } from '../integer/integer.component';
import { DecimalComponent } from '../decimal/decimal.component';
import { NaturalComponent } from '../natural/natural.component';

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

export interface CazzeonFormData {
  elements: CazzeonFormComponent[]
  okLabel: string
  cancelLabel: string
  executionFn: (event: Event, form: FormGroup) => void
  closeFn: (event: Event, form: FormGroup) => void
}

@Injectable({
  providedIn: 'root'
})
export class CazzeonFormBuilderService {

  constructor(private dialog: MatDialog) { }

  openCazzeonForm(cazzeonFormData: CazzeonFormData, heightPcntg?: string, widthPcntg?: string): MatDialogRef<CazzeonForm, any> {
    return this.dialog.open(CazzeonForm, {
      data: cazzeonFormData,
      height: heightPcntg || PROCESS_MODAL.defaultHeight,
      width: widthPcntg || PROCESS_MODAL.defaultWidth
    });
  }

}

@Component({
  selector: 'app-cazzeon-form',
  styles: ['::ng-deep .cdk-overlay-container { z-index: 1021 !important }'],
  template: `
  <mat-dialog-content class="h-75">
    <div class="rounded overflow-auto p-2">
      <form [formGroup]="formGroup">
      <ng-container *ngFor="let formElement of cazzeonFormData.elements; let i = index ; trackBy: trackByFn">
        <ng-container [ngSwitch]="formElement.dataType">
          <label [for]="formElement.name" class="form-label">{{formElement.name}}</label>
          <!--Selector case-->
          <app-selector *ngSwitchCase="type.SELECTOR"
            [formGroup]="formGroup"
            [formControl]="formControls[i]"
            [labelText]="'Prueba'"
            [placeHolderText]="'Poronga'"
            [selectorData]="buildSelectorData(formElement)">
          </app-selector>
          <!--Text case-->
          <app-text *ngSwitchCase="type.TEXT"
            [formGroup]="formGroup"
            [formControl]="formControls[i]">
          </app-text>
          <!--Large text case-->
          <app-large-text *ngSwitchCase="type.LARGE_TEXT"
            [formGroup]="formGroup"
            [formControl]="formControls[i]"
            [rows]="buildLargeTextData(formElement)">
          </app-large-text>
          <!--Password case-->
          <app-password *ngSwitchCase="type.PASSWORD"
            [formGroup]="formGroup"
            [formControl]="formControls[i]">
          </app-password>
          <!--Checkbox case-->
          <app-checkbox *ngSwitchCase="type.CHECKBOX"
            [formGroup]="formGroup"
            [formControl]="formControls[i]">
          </app-checkbox>
          <!--Date case-->
          <app-date-picker *ngSwitchCase="type.DATE"
            [formGroup]="formGroup"
            [formControl]="formControls[i]">
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
            [fileUploaderData]="buildFileUploaderData(formElement)">
          </app-file-uploader>
          <hr>
        </ng-container>
      </ng-container>
      </form>
    </div>
  </mat-dialog-content>
  <mat-dialog-actions class="h-25" align="end">
    <button tabindex="-1" class="btn btn-secondary me-2" (click)="cazzeonFormData.closeFn($event, formGroup)">{{cazzeonFormData.cancelLabel}}</button>
    <button tabindex="-1" class="btn btn-primary me-2" (click)="cazzeonFormData.executionFn($event, formGroup)">{{cazzeonFormData.okLabel}}</button>
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
    FileUploaderComponent,
    IntegerComponent,
    DecimalComponent,
    NaturalComponent,
    TextComponent,
    LargeTextComponent,
    PasswordComponent,
    CheckboxComponent
  ]
})
export class CazzeonForm {

  public type = DataType;

  public formGroup: FormGroup;

  // Form controls of this form. This variable exists to avoid formGroup.get(...) on every style calculation
  public formControls: FormControl[] = [];

  constructor(@Inject(MAT_DIALOG_DATA) public cazzeonFormData: CazzeonFormData, private formBuilder: FormBuilder) {
    const newGroup: any = {};
    for (let i = 0; i < cazzeonFormData.elements.length; i++) {
      const currentElement = cazzeonFormData.elements[i];
      const currentElementControl = currentElement.buildFormControl();
      this.formControls.push(currentElementControl);
      newGroup[currentElement.formName] = currentElementControl;
    }
    this.formGroup = this.formBuilder.group(newGroup);
  }

  buildSelectorData(element: CazzeonFormComponent): SelectorData {
    return (element as SelectorFormComponent).selectorData;
  }

  buildFileUploaderData(element: CazzeonFormComponent): FileUploaderData {
    const castComponent = element as FileUploaderFormComponent;
    return { maxFileSize: castComponent.maxFileSize, fileExtension: castComponent.fileExtension };
  }

  buildLargeTextData(element: CazzeonFormComponent): number {
    const castComponent = element as LargeTextFormComponent;
    return castComponent.rows;
  }

  // Function to keep track of rows using the index given by the *ngFor
  trackByFn(index: number, item: any): number {
    return index;
  }

}
