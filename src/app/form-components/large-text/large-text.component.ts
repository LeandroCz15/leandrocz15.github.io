import { CommonModule } from '@angular/common';
import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, FormControl, FormGroup, NG_VALUE_ACCESSOR, ReactiveFormsModule, Validators } from '@angular/forms';
import { CazzeonFormComponent } from '../cazzeon-form-component';
import { DataType } from '../cazzeon-form-builder/cazzeon-form-builder.service';

@Component({
  selector: 'app-large-text',
  templateUrl: './large-text.component.html',
  styleUrls: ['./large-text.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => LargeTextComponent),
      multi: true
    }
  ]
})
export class LargeTextComponent implements ControlValueAccessor {

  /********************** INPUTS **********************/
  @Input() formGroup!: FormGroup;
  @Input() formControl!: FormControl;
  @Input() rows!: number;

  writeValue(obj: any): void { }

  registerOnChange(fn: any): void { }

  registerOnTouched(fn: any): void { }

  setDisabledState?(isDisabled: boolean): void { }

}

export class LargeTextFormComponent extends CazzeonFormComponent {

  private _rows: number;

  constructor(name: string, formName: string, required: boolean, rows: number) {
    super(name, formName, required, DataType.LARGE_TEXT);
    this._rows = rows;
  }

  get rows() {
    return this._rows;
  }

  override buildFormControl = () => {
    return this.required
      ? new FormControl(this.defaultValue, Validators.required)
      : new FormControl(this.defaultValue);
  };

}
