import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MsalBroadcastService, MsalGuardConfiguration, MsalService, MSAL_GUARD_CONFIG } from '@azure/msal-angular';
import { filter, Subject, takeUntil } from 'rxjs';
import { InteractionStatus, RedirectRequest } from '@azure/msal-browser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {

  loginDisplay:boolean=false
  isFrame=false
  private readonly _destroying$ = new Subject<void>();

  constructor(@Inject(MSAL_GUARD_CONFIG) private msalGuardConfig: MsalGuardConfiguration,
  private msalBroadCastService : MsalBroadcastService,
  private authService: MsalService)
  {

  }
  
  ngOnInit()
  {
    this.isFrame = window !== window.parent && !window.opener;
    this.msalBroadCastService.inProgress$.pipe
    (
      filter((status: InteractionStatus)=>
        status === InteractionStatus.None
      ),takeUntil(this._destroying$)
    ).subscribe(()=>
    {
      this.setloginDisplay();
    })
  }

  login()
  {
    if (this.msalGuardConfig.authRequest)
    {
      this.authService.loginRedirect({...this.msalGuardConfig.authRequest} as RedirectRequest);
    }
    else
    {
      this.authService.loginRedirect();
    }
  }

  logout()
  {
    this.authService.logoutRedirect(
      {
        postLogoutRedirectUri: 'http://localhost:4200/'
      }
    );
  }

  setloginDisplay()
  {
    this.loginDisplay = this.authService.instance.getAllAccounts().length > 0;
  }

  ngOnDestroy():void
  {
    this._destroying$.next(undefined);
    this._destroying$.complete();
  }




}
