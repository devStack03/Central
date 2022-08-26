import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../shared/guards/auth/auth.guard';

import { ViewProfileComponent } from 'app/main/profile/view.component';
import { BookmarksComponent } from 'app/main/bookmark/list.component';
import { HomeComponent } from 'app/main/home/home.component';
import { KudosComponent } from 'app/main/kudos/kudos.component';
import { SettingComponent } from 'app/main/setting/setting.component';
import { EditProfileComponent } from 'app/main/profile/edit.component';
import { UploadSTLComponent } from 'app/main/stl/upload.component';
import { ViewSTLComponent } from 'app/main/stl/view.component';
import { TransactionsComponent } from 'app/main/transactions/transactions.component';
import { LeaderboardComponent } from 'app/main/leaderboard/list.component';
import { PrivacyComponent } from 'app/main/other/privacy.component';
import { TermsComponent } from 'app/main/other/terms.component';

const routers: Routes = [
  // { path: '**', redirectTo: '', pathMatch: 'full', canActivate: [AuthGuard] },
   { path: 'bookmark', component: BookmarksComponent, data: { title: '' }, canActivate: [AuthGuard] },
   { path: '', component: HomeComponent, data: { title: '' } },
   { path: 'home', component: HomeComponent, data: { title: '' } },
   { path: 'kudos', component: KudosComponent, data: { title: '' }, canActivate: [AuthGuard] },
   { path: 'setting', component: SettingComponent, data: { title: '' }, canActivate: [AuthGuard] },
   { path: 'myprofile/:id', component: ViewProfileComponent, data: { title: '' }, canActivate: [AuthGuard]},
   { path: 'profile_view/:id', component: ViewProfileComponent, data: { title: '' }},
   { path: 'profile_edit', component: EditProfileComponent, data: { title: '' }, canActivate: [AuthGuard] },
   { path: 'upload_stl', component: UploadSTLComponent, data: { title: '' }, canActivate: [AuthGuard] },
   { path: 'view_stl/:id', component: ViewSTLComponent, data: { title: '' } },
   { path: 'transactions', component: TransactionsComponent, data: { title: '' }, canActivate: [AuthGuard] },
   { path: 'leaderboard', component: LeaderboardComponent, data: { title: '' }, canActivate: [AuthGuard] },
   { path: 'privacy', component: PrivacyComponent, data: { title: '' }},
   { path: 'terms', component: TermsComponent, data: { title: '' }},
  // { path: 'terms', component: TermsComponent },
  // {
  //   path: 'accounts',
  //   loadChildren: '../main/content/home/accounts/accounts.module#AccountsModule'
  // },
  // { path: 'users/:username', component: ProfileComponent, data: { title: '' }, canActivate: [AuthGuard] },
  // { path: '**', redirectTo: '', pathMatch: 'full', canActivate: [AuthGuard] },
]

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forRoot(routers),
  ],
  declarations: [],
  exports: [RouterModule]
})
export class AppRoutingModule { }
