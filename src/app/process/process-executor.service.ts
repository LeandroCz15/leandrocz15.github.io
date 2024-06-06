import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CazzeonService } from '../cazzeon-service/cazzeon-service';
import { HttpMethod, SNACKBAR } from 'src/application-constants';
import { ServerResponse } from 'src/application-utils';
import { SnackbarComponent } from '../basic-view/components/snackbar/snackbar.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CazzeonFormBuilderService, DataType } from '../form-components/cazzeon-form-builder/cazzeon-form-builder.service';
import { FormGroup } from '@angular/forms';
import { CazzeonFormComponent } from '../form-components/cazzeon-form-component';
import { FileExtension, FileUploaderFormComponent } from '../form-components/file-uploader/file-uploader.component';
import { SelectorFormComponent } from '../form-components/selector/selector.component';
import { DatePickerFormComponent } from '../form-components/date-picker/date-picker.component';
import { DecimalFormComponent } from '../form-components/decimal/decimal.component';
import { IntegerFormComponent } from '../form-components/integer/integer.component';
import { NaturalFormComponent } from '../form-components/natural/natural.component';

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
    private snackBar: MatSnackBar,
    private cazzeonFormBuilderService: CazzeonFormBuilderService,
  ) { }

  callProcess(rows: any[], processData: ProcessData): void {
    const elements = this.buildElements(processData);
    this.cazzeonFormBuilderService.openCazzeonForm(
      {
        elements: elements,
        okLabel: 'Execute',
        cancelLabel: 'Cancel',
        executionFn: this.sendProcessRequest.bind(this),
        closeFn: () => { }
      },
      { rows: rows, processData: processData });
  }

  sendProcessRequest(event: Event, form: FormGroup, extraData?: any): void {
    this.cazzeonService.request(`api/execute/${extraData!.processData.javaClass}`, HttpMethod.POST, async (response: Response) => {
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
    }, JSON.stringify({ rows: extraData!.rows, processParameters: form.getRawValue() }));
  }

  buildElements(processData: ProcessData): CazzeonFormComponent[] {
    const components: CazzeonFormComponent[] = [];
    processData.buttonParameters.forEach(btnParamter => {
      const formName = btnParamter.name.replaceAll(' ', '_').toLowerCase();
      let componentToAdd;
      switch (btnParamter.type) {
        case DataType.FILE:
          componentToAdd = new FileUploaderFormComponent(btnParamter.name, formName, btnParamter.required, 100000, FileExtension.PDF);
          break;
        case DataType.SELECTOR:
          componentToAdd = new SelectorFormComponent(btnParamter.name, formName, btnParamter.required, btnParamter.searchClass, btnParamter.propertyForMatch, btnParamter.identifiers);
          break;
        case DataType.DATE:
          componentToAdd = new DatePickerFormComponent(btnParamter.name, formName, btnParamter.required);
          break;
        case DataType.DECIMAL:
          componentToAdd = new DecimalFormComponent(btnParamter, formName, btnParamter.required);
          break;
        case DataType.INTEGER:
          componentToAdd = new IntegerFormComponent(btnParamter, formName, btnParamter.required);
          break;
        case DataType.NATURAL:
          componentToAdd = new NaturalFormComponent(btnParamter, formName, btnParamter.required);
          break;
        case DataType.
        default:
          console.warn(`Unknown type of button parameter: ${btnParamter.type}`);
      }
      if (componentToAdd != undefined) {
        components.push(componentToAdd);
      }
    });
    return components;
  }

}
