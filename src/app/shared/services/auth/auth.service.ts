import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpRequest, HttpHeaders, HttpResponse } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { CookieService } from 'ngx-cookie';
import 'rxjs/add/operator/map';
import 'rxjs/Rx';

import { AppConfig } from '../../config';
import { AppConstants } from '../../constants';
@Injectable()
export class AuthService {
  private loggedIn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  uri = 'auth';
  get isLoggedIn() {
    return this.loggedIn.asObservable();
  }

  public setLoggedIn(bool) {
    this.loggedIn.next(bool);
  }

  constructor(
    private http: HttpClient,
    private _cookieService: CookieService
  ) 
  { 
    //var user = localStorage.getItem(AppConstants.currentUser);
    var cookie = this.getCookie(AppConstants.currentUser);
    var sess = sessionStorage.getItem(AppConstants.currentUser);

    //console.log('user is: ', user);
    //console.log('cookie is: ', cookie);
    //console.log('sess is: ', sess);

    // if (sess)
    // {
    //   var sessObj = JSON.parse(sess);
    //   if (sessObj && sessObj.username && sessObj.token && sessObj.user)
    //     this.loggedIn.next(true);
    // }

    if (cookie)
    {
      var cookieObj = JSON.parse(cookie);
      if (cookieObj && cookieObj.username && cookieObj.token && cookieObj.user)
      {
        this.updateLocalStorage(cookieObj.user);
        this.loggedIn.next(true);
      }
    }
    else if (sess)
    {
      var sessObj = JSON.parse(sess);
      if (sessObj && sessObj.username && sessObj.token && sessObj.user)
      {
        this.updateLocalStorage(sessObj.user);
        this.loggedIn.next(true);
      }
    }
  }

  updateLocalStorage(user: any) {
    console.log('updated local storage: ', user);
    localStorage.setItem(AppConstants.currentUser, JSON.stringify(user));
  }

  public getCurrentUser() :string {

    console.log("getting current user");
    var cookie = this.getCookie(AppConstants.currentUser);
    if (cookie)
    {
      var cookieObj = JSON.parse(cookie);
      console.log("cookieObj: ", cookieObj);
      if (cookieObj && cookieObj.username && cookieObj.token && cookieObj.user)
      {
        console.log("returned cookie obj", cookieObj);
        return cookie;
      }
    }
    else
    {
      var sess = sessionStorage.getItem(AppConstants.currentUser);
      if (sess)
      {
        
        var sessObj = JSON.parse(sess);
        console.log("sess: ", sessObj);

        if (sessObj && sessObj.username && sessObj.token && sessObj.user)
        {
          console.log("returned sess obj", sessObj);
          return sess;
        }
      }
      console.log('current user is null');
      return null;
    }
  }

  public setCurrentUer(user: any) {
    var cookie = this.getCookie(AppConstants.currentUser);
    var shouldSend = false;
    if (cookie)
    {
      var cookieObj = JSON.parse(cookie);
      if (cookieObj && cookieObj.username && cookieObj.token && cookieObj.user)
      {
        cookieObj.user = user;
        cookieObj.user['token'] = cookieObj.token;

        console.log('setCurrentUser: cookie: ', cookieObj);

        this.updateLocalStorage(cookieObj.user);
        this.setCookie(AppConstants.currentUser, cookieObj);
        shouldSend = true;
      }
    }
    //else
    //{
    var sess = sessionStorage.getItem(AppConstants.currentUser);
    if (sess)
    {
      var sessObj = JSON.parse(sess);
      if (sessObj && sessObj.username && sessObj.token && sessObj.user)
      {
        sessObj.user = user;
        sessObj.user['token'] = sessObj.token;

        console.log('setCurrentUser: sess: ', sessObj);
        
        this.updateLocalStorage(sessObj.user);

        sessionStorage.setItem(AppConstants.currentUser, JSON.stringify(sessObj));
        shouldSend = true;
      }
    }

    if (shouldSend)
      this.loggedIn.next(true);

    
    //}
  }

  /**
   * private
   */
  getCookie(key: string){
    return this._cookieService.get(key);
  }

  private setCookie(key: string, value: any, expirationDate?: Date) {
    let expDate = new Date();
    expDate.setDate(expDate.getDate() + 1);
    this._cookieService.putObject(key, value, {expires : expDate})
  }

  private removeCookie(key: string) {
    this._cookieService.remove(key);
  }

  /**
   * public
   */

  public signIn(email: string, password: string, isRemember?: boolean) {
    const params = {
      email: email,
      password: password,
    };
    const url = AppConfig.apiURL + this.uri + '/login';
    return this.postData(url, params, 'login', isRemember);
  }

  public signUp(email: string, password: string, username?: string, fullName?: string) {
    const params = {
      email: email,
      password: password      
    };
    if (username && username.length > 0) {
      params['username'] = username;
    }
    if (fullName && fullName.length > 0) {
      params['fullName'] = fullName;
    }
    console.log('par => ', params);
    const url = AppConfig.apiURL + this.uri + '/register';
    return this.postData(url, params);
  }

  /**
   * google sign in
   */
  public loginWithGoogle(data: any) {
    if (data) {
      const params = {
        username: data.name ? data.name : data.email,
        email: data.email,
        firstName: data.firstName ? data.firstName : '',
        lastName: data.lastName ? data.lastName : '',
        socialId: data.id,
        type: 3,
        access_token: data.idToken,
        avatar: data.photoUrl
      };

      const url = AppConfig.apiURL + this.uri + '/login-social';
      return this.postData(url, params, 'login');

    }
  }

  public loginWithFacebook(data: any) {
    if (data) {
      const params = {
        username: data.name ? data.name : data.email,
        email: data.email,
        firstName: data.firstName ? data.firstName : '',
        lastName: data.lastName ? data.lastName : '',
        socialId: data.id,
        type: 2,
        access_token: data.authToken,
        avatar: data.photoUrl
      };
      const url = AppConfig.apiURL + this.uri + '/login-social';
      return this.postData(url, params, 'login');
    }
  }

  public logout() {
    this.loggedIn.next(false);
    // remove user from local storage to log user out
    this._cookieService.remove(AppConstants.currentUser);
    sessionStorage.removeItem(AppConstants.currentUser);
    localStorage.removeItem(AppConstants.currentUser);
  }

  private postData(url, params, funcName?: string, isRemember?: boolean) {
    return this.http.post<any>(url, params).map(data => {
      console.log('data => ', data);
      if (data && data.success && data.success === 1)
      {
        if ( /*funcName === 'login' && */ data.user && data.user.token) {
          // this.loggedIn.next(true);
          // store user details and jwt token in the local storage to keep user logged in between page refreshes
          if (isRemember) {
            this.setCookie(AppConstants.currentUser, { username: data.user.username, token: data.user.token, user: data.user});
          }
          else {
            this.removeCookie(AppConstants.currentUser);
          }

          sessionStorage.setItem(AppConstants.currentUser, JSON.stringify({ username: data.user.username, token: data.user.token, user: data.user}));

          this.updateLocalStorage(data.user);
          
          this.setLoggedIn(true);
        }
      }

      return data;
    });
  }
}
