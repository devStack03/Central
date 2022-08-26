import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AuthService } from 'app/shared/services/auth/auth.service';
import { UserService } from 'app/shared/services/user.service';
import { Const_countries } from 'app/shared/constants';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FuseInformDialogComponent } from '@fuse/components/inform-dialog/inform-dialog.component';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
    selector   : 'setting',
    templateUrl: './setting.component.html',
    styleUrls  : ['./setting.component.scss']
})
export class SettingComponent
{
    profileForm: FormGroup;
    user: any;
    countries: any[];
    confirmDialogRef: MatDialogRef<FuseConfirmDialogComponent>;
    informDialogRef: MatDialogRef<FuseInformDialogComponent>;
    /**
     * Constructor
     *
     */
    constructor(
        private _formBuilder: FormBuilder,
        private authService: AuthService,
        private userService: UserService,
        private _matDialog: MatDialog,
        private route: ActivatedRoute,
        private router: Router,
    )
    {
        this.countries = Const_countries;
        this.countries.sort( (a,b) => {return a.text>b.text ? 1 : (a.text<b.text ? -1 : 0);});
        this.authService.isLoggedIn.subscribe((isLoggedIn) => {
            var tempuser = this.authService.getCurrentUser();
            this.user = JSON.parse(tempuser).user;
        });
    }

    get form() { return this.profileForm.controls; }

    ngOnInit(): void
    {
        this.profileForm = this._formBuilder.group({
            'email': [this.user ? this.user.email : ''],
            'country': [this.user ? this.user.country : ''],
            'notificationEmail': [this.user && this.user.notification ? this.user.notification.email : false],
            'notificationPush': [this.user && this.user.notification ? this.user.notification.push : false],
        }); 
    }

    togglePushNotification(e): void 
    {     
        this.updateSettings();
    }

    toggleEmailNotification(e): void 
    {
        this.updateSettings();
    }

    onChangedCountry(): void
    {
        this.updateSettings();
    }

    updateSettings(): void
    {
        let country = this.profileForm.controls['country'].value;
        let notificationPush = this.profileForm.controls['notificationPush'].value;
        let notificationEmail = this.profileForm.controls['notificationEmail'].value;

        this.userService.updateSettings(country, notificationPush, notificationEmail).subscribe((data) => {
            if (data && data['success'] == 1) {
                this.user.country = data.data.country;
                this.user.notification = data.data.notification;

                this.authService.setCurrentUer(this.user);

                this.userService.setNotificationUpdated(this.user.notification.push);
            }
            else {
                
            }
        });
    }

    onUpdateEmail(): void
    {
        let newEmail = this.profileForm.controls['email'].value;

        this.confirmDialogRef = this._matDialog.open(FuseConfirmDialogComponent, {
            disableClose: false
        });

        this.confirmDialogRef.componentInstance.confirmMessage = 'You will get an email to verify your updated email, Are you sure you want to proceed?';

        this.confirmDialogRef.afterClosed().subscribe(result => {
            if ( result )
            {
                this.userService.updateEmail(newEmail).subscribe((data) => {
                    if (data && data['success'] == 1) {

                        this.informDialogRef = this._matDialog.open(FuseInformDialogComponent, {
                            disableClose: false
                        });
                
                        this.informDialogRef.componentInstance.message = 'Changed email successfully, please verify your email address and login again';

                        this.informDialogRef.afterClosed().subscribe(result => {
                            this.authService.logout();
                            this.router.navigate(['/home']);
                        });
                        
                    }
                    else {
                        this.showMessage('Failed to update email address');
                    }
                });
                //
            }
        });
    }

    showMessage(message) : void 
    {
        this.informDialogRef = this._matDialog.open(FuseInformDialogComponent, {
            disableClose: false
        });

        this.informDialogRef.componentInstance.message = message;

    }
}
