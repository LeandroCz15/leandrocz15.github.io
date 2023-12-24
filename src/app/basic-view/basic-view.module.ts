import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header/header.component';
import { RowsComponent } from './rows/rows.component';
import { ViewComponent } from './view/view.component';
import { FormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { PaginationComponent } from './pagination/pagination.component';
import { ShouldShowPipe } from './should-show.pipe';



@NgModule({
  declarations: [
    HeaderComponent,
    RowsComponent,
    ViewComponent,
    PaginationComponent,
    ShouldShowPipe
  ],
  imports: [
    CommonModule,
    FormsModule,
    DragDropModule,
  ],
  exports: [
    ViewComponent
  ]
})
export class BasicViewModule { }
