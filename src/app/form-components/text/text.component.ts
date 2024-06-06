import { CommonModule } from '@angular/common';
import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, FormControl, FormGroup, NG_VALUE_ACCESSOR, ReactiveFormsModule, Validators } from '@angular/forms';
import { CazzeonFormComponent } from '../cazzeon-form-component';
import { DataType } from '../cazzeon-form-builder/cazzeon-form-builder.service';

@Component({
  selector: 'app-text',
  templateUrl: './text.component.html',
  styleUrls: ['./text.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextComponent),
      multi: true
    }
  ]
})
export class TextComponent implements ControlValueAccessor {

  /********************** INPUTS **********************/
  @Input() formGroup!: FormGroup;
  @Input() formControl!: FormControl;

  writeValue(obj: any): void { }

  registerOnChange(fn: any): void { }

  registerOnTouched(fn: any): void { }

  setDisabledState?(isDisabled: boolean): void { }

}

export class NaturalFormComponent extends CazzeonFormComponent {

  constructor(name: string, formName: string, required: boolean) {
    super(name, formName, required, DataType.TEXT);
  }

  override buildFormControl = () => {
    return this.required
      ? new FormControl(this.defaultValue, Validators.required)
      : new FormControl(this.defaultValue);
  };

}
