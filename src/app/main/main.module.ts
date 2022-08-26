import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';

import { FuseSearchBarModule, FuseShortcutsModule, FuseCountdownModule, FuseHighlightModule, 
    FuseMaterialColorPickerModule, FuseWidgetModule , FuseConfirmDialogModule, FuseInformDialogModule} from '@fuse/components';
import { FuseSharedModule } from '@fuse/shared.module';

import { MatDialogModule } from '@angular/material/dialog';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import { MatRippleModule } from '@angular/material/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { NgxDnDModule } from '@swimlane/ngx-dnd';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import {NgxMatTagInputModule} from 'ngx-mat-tag-input';

import { SocialLoginModule, SocialAuthServiceConfig } from "angularx-social-login";
import { GoogleLoginProvider, FacebookLoginProvider } from "angularx-social-login";
import { BlockUIModule } from 'ng-block-ui';
import { ImageCropperModule } from 'ngx-image-cropper';

import { AppConfig } from 'app/shared/config';
import { SharedModule } from 'app/shared/shared.module';

import { LoginComponent } from 'app/main/user/login.component';
import { BookmarksComponent } from 'app/main/bookmark/list.component';
import { HomeComponent } from 'app/main/home/home.component';
import { KudosComponent } from 'app/main/kudos/kudos.component';
import { ViewProfileComponent } from 'app/main/profile/view.component';
import { EditProfileComponent } from 'app/main/profile/edit.component';
import { SettingComponent } from 'app/main/setting/setting.component';
import { TransactionsComponent } from 'app/main/transactions/transactions.component';
import { StlListComponent } from 'app/main/stl/stllist.component';
import { UploadSTLComponent } from 'app/main/stl/upload.component';
import { ViewSTLComponent } from 'app/main/stl/view.component';
import { LeaderboardComponent } from 'app/main/leaderboard/list.component';

import { ShareDialogComponent } from 'app/main/share-dialog/share-dialog.component';
//import { TimeAgoPipe } from 'time-ago-pipe';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
//import { ConfirmationPopoverModule } from 'angular-confirmation-popover';
//import { SocialShareModule } from 'material-social-share';
//import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { NgxSocialShareModule } from 'ngx-social-share';
import { LazyLoadImageModule } from 'ng-lazyload-image'; 
import { StlModelViewerModule } from 'angular-stl-model-viewer';
//import { LongPressModule } from 'ngx-long-press';
// import { LightboxModule } from 'ngx-lightbox';
//import { NgxNotificationComponent } from 'ngx-notification';

//import { LongPress } from 'app/main/bookmark/longpress.directive';

@NgModule({
    declarations: [
        LoginComponent,
        BookmarksComponent,
        HomeComponent,
        KudosComponent,
        ViewProfileComponent,
        EditProfileComponent,
        SettingComponent,
        TransactionsComponent,
        StlListComponent,
        UploadSTLComponent,
        ViewSTLComponent,
        ShareDialogComponent,
        LeaderboardComponent,
        //TimeAgoPipe
        //LongPress,
        //NgxNotificationComponent,
    ],
    imports     : [
        RouterModule,
        MatIconModule,
        MatMenuModule,
        MatToolbarModule,
        MatButtonModule,
        MatChipsModule,
        MatExpansionModule,
        MatFormFieldModule,
        MatInputModule,
        MatPaginatorModule,
        MatRippleModule,
        MatSelectModule,
        MatSortModule,
        MatSnackBarModule,
        MatTableModule,
        MatTabsModule,
        MatCheckboxModule,
        MatSlideToggleModule,
        NgxDnDModule,
        NgxChartsModule,
        NgxMatTagInputModule,
        MatAutocompleteModule,

        FuseSharedModule,
        FuseSearchBarModule,
        FuseShortcutsModule,
        MatDialogModule,
        MatTabsModule,
        FuseCountdownModule,
        FuseHighlightModule, 
        FuseMaterialColorPickerModule, 
        FuseWidgetModule,
        FuseConfirmDialogModule,
        FuseInformDialogModule,

        ImageCropperModule,
        SlickCarouselModule,
        InfiniteScrollModule,
        //ConfirmationPopoverModule.forRoot({
        //    confirmButtonType: 'danger', // set defaults here
        //  }),
        //SocialShareModule,
        //NgbModule,
        NgxSocialShareModule,
        LazyLoadImageModule,

        SocialLoginModule,
        BlockUIModule.forRoot(),
        StlModelViewerModule,
        //LongPressModule,
        //LightboxModule,

        SharedModule,
    ],
    providers: [ 
        
    ],
    entryComponents: [
        LoginComponent,
        ShareDialogComponent
      ]
})
export class MainModule
{
}
