import { NgModule } from '@angular/core';
import { CookieModule } from 'ngx-cookie';

// import { RouterModule } from '@angular/router';
// import { MatButtonModule } from '@angular/material/button';
// import { MatIconModule } from '@angular/material/icon';
// import { MatMenuModule } from '@angular/material/menu';
// import { MatToolbarModule } from '@angular/material/toolbar';

// import { FuseSearchBarModule, FuseShortcutsModule } from '@fuse/components';
// import { FuseSharedModule } from '@fuse/shared.module';

// import { LoginComponent } from './login.component';

// import { MatDialogModule } from '@angular/material/dialog';
// import { MatChipsModule } from '@angular/material/chips';
// import { MatRippleModule } from '@angular/material/core';
// import { MatExpansionModule } from '@angular/material/expansion';
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatInputModule } from '@angular/material/input';
// import { MatPaginatorModule } from '@angular/material/paginator';
// import { MatSelectModule } from '@angular/material/select';
// import { MatSnackBarModule } from '@angular/material/snack-bar';
// import { MatSortModule } from '@angular/material/sort';
// import { MatTableModule } from '@angular/material/table';
// import { MatTabsModule } from '@angular/material/tabs';
// import { MatCheckboxModule } from '@angular/material/checkbox';

import { SocialLoginModule, SocialAuthServiceConfig } from "angularx-social-login";
import { GoogleLoginProvider, FacebookLoginProvider } from "angularx-social-login";
import { AppConfig } from '../../shared/config';
// import { BlockUIModule } from 'ng-block-ui';


@NgModule({
    declarations: [
        // LoginComponent,
    ],
    imports     : [
        CookieModule.forRoot(),

        // RouterModule,
        // MatIconModule,
        // MatMenuModule,
        // MatToolbarModule,
        // MatButtonModule,
        // MatChipsModule,
        // MatExpansionModule,
        // MatFormFieldModule,
        // MatInputModule,
        // MatPaginatorModule,
        // MatRippleModule,
        // MatSelectModule,
        // MatSortModule,
        // MatSnackBarModule,
        // MatTableModule,
        // MatCheckboxModule,

        // FuseSharedModule,
        // FuseSearchBarModule,
        // FuseShortcutsModule,
        // MatDialogModule,
        // MatTabsModule,

        SocialLoginModule,
        // BlockUIModule.forRoot()
    ],
    providers: [ 
        {
            provide: 'SocialAuthServiceConfig',
            useValue: {
                autoLogin: false,
                providers: [
                {
                    id: GoogleLoginProvider.PROVIDER_ID,
                    provider: new GoogleLoginProvider(
                        AppConfig.Google_ID
                    )
                },
                {
                    id: FacebookLoginProvider.PROVIDER_ID,
                    provider: new FacebookLoginProvider(AppConfig.Facebook_ID)
                }
                ]
            } as SocialAuthServiceConfig,
        }
    ]
})
export class LoginModule
{
}
