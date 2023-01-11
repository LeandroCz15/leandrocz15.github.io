import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarElementComponent } from './navbarelement/navbarelement.component'
import { SidebarComponent } from './sidebar/sidebar.component'
import { TaskbarComponent } from './taskbar/taskbar.component'
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IssueModalComponent } from './issue-modal/issue-modal.component';
import { DropdownButtonComponent } from './dropdown-button/dropdown-button.component';
import { SearchUserModalComponent } from './search-user-modal/search-user-modal.component';
import { LoginModalComponent } from './login-modal/login-modal.component';
import { ProductListComponent } from './product-list/product-list.component';
import { ProductBoxComponent } from './product-box/product-box.component';
import { AppLoginComponent } from './app-login/app-login.component';



@NgModule({
  declarations: [
    NavbarElementComponent, 
    SidebarComponent,
    TaskbarComponent,
    IssueModalComponent,
    DropdownButtonComponent,
    SearchUserModalComponent,
    LoginModalComponent,
    ProductListComponent,
    ProductBoxComponent,
    AppLoginComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  exports: [
    NavbarElementComponent,
    SidebarComponent,
    TaskbarComponent,
    IssueModalComponent,
    DropdownButtonComponent,
    SearchUserModalComponent,
    LoginModalComponent,
    ProductListComponent,
    ProductBoxComponent,
    AppLoginComponent,
  ]
})
export class ComponentsModule { 
  
}
