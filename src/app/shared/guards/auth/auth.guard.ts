import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie';
import { AuthService } from '../../services/auth/auth.service';
import { AppConstants } from '../../constants';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {

  }
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    // console.log(this.authService.isLoggedIn);
    // return this.authService.isLoggedIn.pipe(
    //   take(1),
    //   map((isLoggedIn: boolean) => {
    //     if (!isLoggedIn) {
    //       console.log('logout');
    //       this.router.navigate(['/login']);
    //       return false;
    //     }
    //     return true;
    //   })
    // );

    // if (localStorage.getItem(AppConstants.currentUser)) {
    //   // logged in so return true
    //   return true;
    // }
    //console.log('cookie => ', this.authService.getCookie(AppConstants.currentUser));
    //console.log('session => ', JSON.stringify(sessionStorage.getItem(AppConstants.currentUser)));
    if (this.authService.getCookie(AppConstants.currentUser)) {      
      return true;
    } else if (sessionStorage.getItem(AppConstants.currentUser)) {
      return true;
    }

    // not logged in so redirect to login page with the return url
    this.router.navigate(['/home'], { queryParams: { returnUrl: state.url } });
    return false;
  }
}
