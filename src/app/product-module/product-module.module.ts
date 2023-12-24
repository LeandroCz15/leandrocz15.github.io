import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductCardComponent } from './product-card/product-card.component';
import { ProductViewComponent } from './product-view/product-view.component';
import { ProductModalComponent } from './product-modal/product-modal.component';
import { AuthService } from '../login-module/auth-service';
import { DragDropModule } from '@angular/cdk/drag-drop';

@NgModule({
  declarations: [
    ProductCardComponent,
    ProductViewComponent,
    ProductModalComponent,
  ],
  imports: [
    CommonModule,
    DragDropModule
  ],
  exports: [
    ProductCardComponent,
    ProductViewComponent,
    ProductModalComponent,
  ],
  providers: [
    AuthService,
  ]
})
export class ProductModule { }
