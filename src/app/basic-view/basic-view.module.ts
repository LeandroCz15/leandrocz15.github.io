import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/header/header.component';
import { GridComponent } from './components/grid/grid.component';
import { ViewComponent } from './components/view/view.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { PaginationComponent } from './components/pagination/pagination.component';
import { ShouldShowPipe } from './pipes/should-show.pipe';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RowFormComponent } from './components/row-form/row-form.component';
import { GenerateIdForFormPipe } from './pipes/generate-id-for-form.pipe';
import { MatInputModule } from '@angular/material/input';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { SelectorComponent } from '../form-components/selector/selector.component';
import { MatDialogModule } from '@angular/material/dialog';
import { DisplayEmptyValuePipe } from './pipes/display-empty-value.pipe';
import { RowComponent } from './components/row/row.component';
import { ContextMenuComponent } from './components/context-menu/context-menu.component';
import { IconSrcResolverPipe } from './pipes/icon-src-resolver.pipe';
import { MultiCaseSwitchPipe } from './pipes/multi-case-switch.pipe';
import { TabComponent } from './components/tab/tab.component';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import { SnackbarComponent } from './components/snackbar/snackbar.component';
import { DatePickerComponent } from '../form-components/date-picker/date-picker.component';
import { ShowIfPipe } from './pipes/show-if.pipe';

@NgModule({
  declarations: [
    HeaderComponent,
    GridComponent,
    ViewComponent,
    PaginationComponent,
    ShouldShowPipe,
    RowFormComponent,
    GenerateIdForFormPipe,
    DisplayEmptyValuePipe,
    RowComponent,
    ContextMenuComponent,
    IconSrcResolverPipe,
    MultiCaseSwitchPipe,
    TabComponent,
    SnackbarComponent,
    ShowIfPipe,
  ],
  imports: [
    CommonModule,
    FormsModule,
    DragDropModule,
    MatNativeDateModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    BrowserModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    NgbModule,
    MatAutocompleteModule,
    MatDialogModule,
    MatSnackBarModule,
    SelectorComponent,
    DatePickerComponent
  ],
  exports: [
    ViewComponent,
    IconSrcResolverPipe,
  ],
  providers: [
    GenerateIdForFormPipe,
  ]
})
export class BasicViewModule { }
