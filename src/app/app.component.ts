import { Component, OnDestroy, OnInit } from '@angular/core';
import { CazzeonService } from './cazzeon-service/cazzeon-service';
import { Subscription } from 'rxjs';
import { LoginStatus } from 'src/application-constants';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {

  public isLogged: boolean = false;

  private loginServiceObservable!: Subscription;

  constructor(private cazzeonService: CazzeonService) { }

  ngOnInit(): void {
    this.cazzeonService.getLoginSubjectAsObservable().subscribe(loginStatus => {
      this.isLogged = loginStatus === LoginStatus.LOGIN;
    });
  }

  ngOnDestroy(): void {
    this.loginServiceObservable.unsubscribe();
  }

}