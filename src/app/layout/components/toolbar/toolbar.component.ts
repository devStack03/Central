import { Component, OnDestroy, OnInit, ViewChild, ViewChildren, ViewEncapsulation } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import * as _ from 'lodash';

import { FuseConfigService } from '@fuse/services/config.service';
import { FuseSidebarService } from '@fuse/components/sidebar/sidebar.service';

import { navigation } from 'app/navigation/navigation';
import {LoginComponent} from 'app/main/user/login.component';

import { AuthService } from 'app/shared/services/auth/auth.service';
import { UserService } from 'app/shared/services/user.service';
import { NotificationService } from 'app/shared/services/notification.service';
import { ActivatedRoute, Router } from '@angular/router' ;
import { MatSnackBar } from '@angular/material/snack-bar';
import * as moment from 'moment';
import { MatMenu } from '@angular/material/menu';
//import { NgxNotificationService } from 'ngx-notification';

@Component({
    selector     : 'toolbar',
    templateUrl  : './toolbar.component.html',
    styleUrls    : ['./toolbar.component.scss'],
    encapsulation: ViewEncapsulation.None
})

export class ToolbarComponent implements OnInit, OnDestroy
{
    horizontalNavbar: boolean;
    rightNavbar: boolean;
    hiddenNavbar: boolean;
    languages: any;
    navigation: any;
    selectedLanguage: any;
    userStatusOptions: any[];
    dialogRef: any;

    userLoggedIn: boolean;
    user: any;
    balance = 0;
    kudo = 0;

    notifications : any[];
    noitificationTimer : any = 0;
    loadMore : boolean;

    PAGE_COUNT = 20;

    firstPush = true;
    

    @ViewChildren ('avatar') avatar;
    @ViewChild ('notificationMenu') notificationMenu;
    @ViewChild ('matMenuContent') matMenuContent;
    

    // Private
    private _unsubscribeAll: Subject<any>;

    /**
     * Constructor
     *
     * @param {FuseConfigService} _fuseConfigService
     * @param {FuseSidebarService} _fuseSidebarService
     * @param {TranslateService} _translateService
     */
    constructor(
        private _fuseConfigService: FuseConfigService,
        private _fuseSidebarService: FuseSidebarService,
        private _translateService: TranslateService,
        private _matDialog: MatDialog,
        private authService: AuthService,
        private userSerivce: UserService,
        private notificationService: NotificationService,
        private route: ActivatedRoute,
        private router: Router,
        private _matSnackBar: MatSnackBar,
        //private location: Location,
        //private ngxNotificationService: NgxNotificationService,
    )
    {
        // Set the defaults
        this.userStatusOptions = [
            {
                title: 'Online',
                icon : 'icon-checkbox-marked-circle',
                color: '#4CAF50'
            },
            {
                title: 'Away',
                icon : 'icon-clock',
                color: '#FFC107'
            },
            {
                title: 'Do not Disturb',
                icon : 'icon-minus-circle',
                color: '#F44336'
            },
            {
                title: 'Invisible',
                icon : 'icon-checkbox-blank-circle-outline',
                color: '#BDBDBD'
            },
            {
                title: 'Offline',
                icon : 'icon-checkbox-blank-circle-outline',
                color: '#616161'
            }
        ];

        this.languages = [
            {
                id   : 'en',
                title: 'English',
                flag : 'us'
            },
            {
                id   : 'tr',
                title: 'Turkish',
                flag : 'tr'
            }
        ];

        this.navigation = navigation;

        // Set the private defaults
        this._unsubscribeAll = new Subject();

        this.userLoggedIn = false;

        this.notifications = [];
        this.noitificationTimer = 0;
        this.loadMore = true; 

        this.authService.isLoggedIn.subscribe((isLoggedIn) => {
            console.log( 'In toolbar component got loggedin changed: ' + isLoggedIn);

            this.userLoggedIn = isLoggedIn;

            if (this.userLoggedIn) 
            {
                var tempuser = this.authService.getCurrentUser();
                if (tempuser) {
                    this.user = JSON.parse(tempuser);
                    this.onUserClicked();

                    if (this.user.user.notification && this.user.user.notification.push && this.noitificationTimer == 0) {
                        this.noitificationTimer = setInterval(()=>{
                            this.getNotifications(true, true);
                        }, 2000);
                    }
                    else {
                        this.loadMore = true; 
                        this.notifications = [];
                        if ( !!this.noitificationTimer ) {
                            clearTimeout(this.noitificationTimer);
                        }
                        this.noitificationTimer = 0;
                    }
                }
            } else {
                this.loadMore = true; 
                this.notifications = [];
                if ( !!this.noitificationTimer ) {
                    clearTimeout(this.noitificationTimer);
                }
                this.noitificationTimer = 0;
            }

            //setTimeout(() => {
            //    if ( this.user.user.avatar ) {
            //        this.avatar.first.nativeElement.style.background = 'url(' + this.user.user.avatar + ')';
            //    }
            //}, 300);

        });

        this.userSerivce.notificationUpdated.subscribe((push) => {
            if (this.firstPush) {
                this.firstPush = false;
                return;
            }

            if (push) 
            {
                if (this.user && this.noitificationTimer == 0) {
                    this.noitificationTimer = setInterval(()=>{
                        this.getNotifications(true, true);
                    }, 2000);
                }
            } else {
                this.loadMore = true; 
                this.notifications = [];
                if ( !!this.noitificationTimer ) {
                    clearTimeout(this.noitificationTimer);
                }
                this.noitificationTimer = 0;
            }
        });
    }

    onScroll(event) {
        console.log("scrolled");

        if ( this.loadMore ) {
            this.getNotifications(false, false);
            // this.notificationMenu.open();
            //event.preventDefault();
        }
        return false;
    }

    onMenuOpen() {
        //console.log(this.notificationMenu);
        console.log(this.matMenuContent);
        
    }

    onMenuClick(event) {
        console.log(event);
        event.preventDefault();
    }

    getNotifications(isNew: boolean, reset: boolean) {
        if ( isNew ) {
            this.notificationService.get(0, this.PAGE_COUNT, true).subscribe((data) => {
                if (data && data['success'] == 1) {
                    if ( data.data && data.data.length > 0 ) {
                        this.getNotifications(false, true);
                        this.sendNotification(data.data[0].msg);
                    }
                }
             },
             (error) => {
             });
        } else {
            if ( reset ) {
                this.notifications = [];
                this.loadMore = true;
            }
            this.notificationService.get(this.notifications.length, this.PAGE_COUNT, false).subscribe((data) => {
                if (data && data['success'] == 1) {
                    if ( data.data && data.data.length > 0 ) {
                        this.notifications = [...this.notifications, ...data.data];
                        if ( data.data.length < this.PAGE_COUNT ) {
                            this.loadMore = false;
                        }
                    }
                }
             },
             (error) => {
             });

        }
        
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        // Subscribe to the config changes
        this._fuseConfigService.config
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((settings) => {
                this.horizontalNavbar = settings.layout.navbar.position === 'top';
                this.rightNavbar = settings.layout.navbar.position === 'right';
                this.hiddenNavbar = settings.layout.navbar.hidden === true;
            });

        // Set the selected language from default languages
        this.selectedLanguage = _.find(this.languages, {id: this._translateService.currentLang});
       
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    toggleSidebarOpen(key): void
    {
        //this._fuseSidebarService.getSidebar(key).toggleOpen();
    }

    /**
     * Toggle Notifications
     *
     * @param key
     */
    toggleNotifications(): void
    {
        if ( this.notifications.length == 0 ) {
            this.getNotifications(false, false);
        }
    }

    getNoticationIcon(notification) {
        let icon = '';
        switch (notification.type) {
            case 1:
                icon = 'cloud_download';
                break;
            case 2:
                icon = 'person_add';
                break;
            case 3:
                icon = 'person_add_disabled';
                break;
            case 4:
                icon = 'star';
                break;
            case 5:
                icon = 'attach_money';
                break;
            case 6:
                icon = 'featured_play_list';
                break;
            case 7:
                icon = 'thumb_up';
                break;
            case 8:
                icon = 'cloud_download';
                break;
            default:
                break;
        }
        return icon;
    }

    onClickNotification(notification) {
        if ( !!notification.post )
            this.gotoPost(notification.post);
        else 
            this.gotoProfile(notification.sender._id);
    }

    formatFromNow(value) {
        return moment(value).fromNow();
    }

    gotoProfile(id) {
        this.router.navigate(['profile_view', id]);
    }

    gotoPost(id) {
        this.router.navigate(['view_stl', id]);
    }

    clearNotifications() {
        this.notificationService.delete('all').subscribe((data) => {
            if (data && data['success'] == 1) {
                this.notifications = [];
                this.loadMore = true;
            }
         },
         (error) => {
         });
    }
    /**
     * Toggle User Login
     *
     * @param key
     */
    toggleUser(): void
    {
        MatMenu
        this.dialogRef = this._matDialog.open(LoginComponent, {
            panelClass: 'user-dialog',
            data      : {
            }
        });
        this.dialogRef.afterClosed()
            .subscribe(response => {

            });
    }


    /**
     * Search
     *
     * @param value
     */
    search(value): void
    {
        // Do your search here...
        console.log(value);
    }

    /**
     * Set the language
     *
     * @param lang
     */
    setLanguage(lang): void
    {
        // Set the selected language for the toolbar
        this.selectedLanguage = lang;

        // Use the selected language for translations
        this._translateService.use(lang.id);
    }

    logout()
    {
        this.authService.logout();

        // redirect to '/home'
        this.router.navigate(['/home']);

        return false;
    }

    onProfileView() {
        if (this.userLoggedIn && this.user && this.user.user)
        {
            this.router.navigate(['myprofile', this.user.user.id]);
        }
    }

    onUserClicked() {
        this.userSerivce.getBalanceAndKudo().subscribe((data) => {
            if (data && data['success'] == 1) {
                this.balance = data.data.balance;
                this.kudo = data.data.kudo;
            }
        });

    }

    sendNotification(msg) {        
        this._matSnackBar.open(msg, '', {
            verticalPosition: 'bottom',
            horizontalPosition: 'right',
            politeness : 'assertive',
            duration        : 2000
        });
    }
}
