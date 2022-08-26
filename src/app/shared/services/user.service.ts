import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { User } from '../models/user.model';
import { AppConfig } from '../config';
import { AppConstants } from '../constants';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  uri = AppConfig.apiURL + 'user/';

  public notificationUpdated: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  public setNotificationUpdated(bool) {
    this.notificationUpdated.next(bool);
  }

  constructor(private http: HttpClient) { }

  getAll() {
    return this.http.get<User[]>(this.uri);
  }

  getById(id: any): Observable<any> {
    return this.http.get(this.uri + 'profile/' + id);
  }

  getBalanceAndKudo(): Observable<any> {
    return this.http.get(this.uri + 'getBalanceAndKudo');
  }

  getByUsername(username: string): Observable<any> {
    return this.http.get(this.uri + 'username/' + username);
  }

  update(user: any) {
    return this.http.patch(this.uri +  user.id, user);
  }

  delete(id: any) {
    return this.http.delete(this.uri + id);
  }

  updatePassword(params: any) {
    return this.http.post(this.uri + '/change-password', params);
  }

  removeAvatar(id) {
    return this.http.delete(this.uri + id + '/remove-avatar');
  }

  updateAvatar(id, params) {
    return this.http.patch(this.uri + id + '/update-avatar', params);
  }

  // getPoplarPeople(loaded:number): Observable<any> {
  //   return this.http.get(this.uri + 'popular/' + loaded);
  // }

  getLeaderboardOverall(): Observable<any> {
    return this.http.get(this.uri + 'getLeaderboardOverall');
  }

  getLeaderboardData(section: string): Observable<any> {
    return this.http.get(this.uri + 'getLeaderboardData/' + section);
  }

  followUser(following: string): Observable<any> {
    return this.http.post(this.uri + 'follow', {following: following});
  }

  unfollowUser(following: string): Observable<any> {
    return this.http.post(this.uri + 'unfollow', {following: following});
  }

  isFollowed(following: string): Observable<any> {
    return this.http.get(this.uri + 'isFollowed/' + following);
  }

  updateEmail(newEmail: string): Observable<any> {
    return this.http.post(this.uri + 'updateEmail', {newEmail: newEmail});
  }
  updateSettings(country: string, notificationPush: boolean, notificationEmail: boolean): Observable<any> {
    return this.http.post(this.uri + 'updateSettings', {country: country, notification: {push: notificationPush, email: notificationEmail}});
/*    
    .subscribe((user) => {
      if (user) {
        this.settingsUpdated.next(user);
        return true;
      }
    }, (error) => {
      return false;
    });
*/
  }
}
