import { Component, ViewChildren, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import {AppConstants} from 'app/shared/constants';
import { AuthService } from 'app/shared/services/auth/auth.service';
import { PostService } from 'app/shared/services/post/post.service';
import { LikeService } from 'app/shared/services/like/like.service';
import { DownloadService } from 'app/shared/services/download/download.service';
import { KudoService } from 'app/shared/services/kudo.service';
import { UserService } from 'app/shared/services/user.service';
import { ActivatedRoute } from '@angular/router';
import { first } from 'rxjs/operators';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';
import { FuseInformDialogComponent } from '@fuse/components/inform-dialog/inform-dialog.component';
import { HttpErrorResponse } from '@angular/common/http';
import {LoginComponent} from 'app/main/user/login.component';

@Component({
    selector   : 'view-profile',
    templateUrl: './view.component.html',
    styleUrls  : ['./view.component.scss']
})
export class ViewProfileComponent
{
    user: any = null;
    posts: any[] = [];
    loading = true;
    loadsAtOnce = 10;
    loggedIn = false;
    loggedInUser : any = null;
    isKudoed = false;
    isFollowed = false;

    @ViewChildren ('profileHeader') profileHeader ;
    @ViewChildren ('avatar') avatar ;
    @ViewChild('socialShareDialog') socialShareDialog;

    dialogRef: MatDialogRef<ViewProfileComponent>;
    confirmDialogRef: MatDialogRef<FuseConfirmDialogComponent>;
    informDialogRef: MatDialogRef<FuseInformDialogComponent>;

    loginDialogRef: any;

    //likedCount = 0;
    //downloadedCount = 0;
    //followedCount = 0;
    //kudosCount = 0;

    /**
     * Constructor
     *
     * @param {FuseTranslationLoaderService} _fuseTranslationLoaderService
     */
    constructor(
        private authService: AuthService,
        private postService: PostService,
        private userService: UserService,
        private likeService: LikeService,
        private downloadService: DownloadService,
        private kudoService: KudoService,

        private route: ActivatedRoute,
        private _matDialog: MatDialog
    )
    {
        this.authService.isLoggedIn.subscribe((isLoggedIn) => {
            var tempuser = this.authService.getCurrentUser();
            if (tempuser)
            {
                this.loggedIn = true;
                this.loggedInUser = JSON.parse(tempuser).user;

                if (this.route.snapshot.params && this.route.snapshot.params.id) {
                    let id = this.route.snapshot.params.id;

                    // get is kudo
                    this.kudoService.isKudoSent(id).subscribe((data) => {
                        if (data && data['success']) {
                            this.isKudoed = data.data.isKudoSent;
                        }
                    });

                    // get is followed
                    this.userService.isFollowed(id).subscribe((data) => {
                        if (data && data['success']) {
                            this.isFollowed = data.data.isFollowed;
                        }
                    })
                }
            }
        });

        if (this.route.snapshot.params && this.route.snapshot.params.id) {
            let id = this.route.snapshot.params.id;

            this.userService.getById(id).subscribe((user) => {
                console.log( 'profile_view => user: ', user);

                if (user && user.success)
                {
                    this.user = user.data;
    
                    this.loading = true;
                    this.postService.getPopulatesByUser(this.user.id, 0, this.loadsAtOnce).subscribe((data) => {
                        //console.log('post service resonse data => ', data);
                        if (data && data['success'] == 1) {
                            for ( let post of data.data.post)
                                this.posts.push( post );
                        }
                        this.loading = false;
                     },
                     (error) => {
                         this.loading = false;
                     });

                     //this.user = JSON.parse(localStorage.getItem(AppConstants.currentUser));
                    setTimeout(() => {
                        if ( this.user.bgImage ) {
                            this.profileHeader.first.nativeElement.style.background = 'url(' + this.user.bgImage + ')';
                        }
                        // if ( this.user.avatar ) {
                        //     this.avatar.first.nativeElement.style.background = 'url(' + this.user.avatar + ')';
                        // }
                    }, 300);
                }
    
            });

        }
    }

    /**
     * On init
     */
    ngOnInit(): void
    {
        
    }
    

    onScroll() {
        console.log("scrolled");

        if (!this.user)
            return;

        this.loading = true;
        this.postService.getPopulatesByUser(this.user._id, this.posts.length, this.loadsAtOnce).subscribe((data) => {
            //console.log('post service resonse data => ', data);
            if (data && data['success'] == 1) {
                for ( let post of data.data.post)
                    this.posts.push( post );
            }
            this.loading = false;
        },
        (error) => {
            this.loading = false;
        });
    }

    showMessage(message) : void 
    {
        this.informDialogRef = this._matDialog.open(FuseInformDialogComponent, {
            disableClose: false
        });

        this.informDialogRef.componentInstance.message = message;

    }

    onGiveKudosClicked() {
        if ( !this.loggedIn || !this.loggedInUser || !this.user || this.loggedInUser.id == this.user.id) {
            this.showMessage('You can\'t give kudo to yourself.');  
            return;
        }
 
        this.confirmDialogRef = this._matDialog.open(FuseConfirmDialogComponent, {
            disableClose: false
        });

        this.confirmDialogRef.componentInstance.confirmMessage = 'Are you sure you want to give kudo to ' 
                            + this.user.firstName + ' ' + this.user.lastName + '?';

        this.confirmDialogRef.afterClosed().subscribe(result => {
            if ( result )
            {
                this.kudoService.sendKudo(this.user.id, AppConstants.KUDO_POSITION_ITEM, null).pipe(first()).subscribe((data) => {
                    if ( data['success'] == 1 ) {
                        this.showMessage('You have successfully given kudo.');
                        this.user.kudo_count++;
                        this.isKudoed = true;
                    } else {
                        this.showMessage('You had already given kudo to this user.');
                        this.isKudoed = true;
                    }
                  }, (error) => {
                    this.showMessage('Failed to give kudo.');
                    if (error instanceof HttpErrorResponse) {
                    //   alert(error.error.error);
                    } else {
                      console.log(error);
                    }
        
                  });
            }
        });
    }

    onFollowClicked() {
        console.log('follow clicked');
        if (!this.checkLoggedIn())
            return;

        if (!this.loggedIn || !this.loggedInUser || (this.user && this.loggedInUser.id == this.user.id))
            return;
        var following = this.user.id;
        this.userService.followUser(following).subscribe((data) => {
            if (data && data['success'] == 1) {
                this.isFollowed = true;

                // if (data['isCreated'])
                   // this.user.follow_count = this.user.follow_count + 1;
            }
        }, (error) => {
            //
        })
    }

    onUnfollowClicked() {
        console.log('unfollow clicked');
        if (!this.checkLoggedIn())
            return;

        if (!this.loggedIn || !this.loggedInUser || (this.user && this.loggedInUser.id == this.user.id))
            return;
        var following = this.user.id;
        this.userService.unfollowUser(following).subscribe((data) => {
            if (data && data['success'] == 1) {
                this.isFollowed = false;

                // if (data['isCreated'])
                   // this.user.follow_count = this.user.follow_count + 1;
            }
        }, (error) => {
            //
        })
    }

    onShareClicked() {
        console.log('share clicked');
        this.dialogRef = this._matDialog.open(this.socialShareDialog);
        this.dialogRef.afterClosed().subscribe(result => {
            // Note: If the user clicks outside the dialog or presses the escape key, there'll be no result
            if (result !== undefined) {
                if (result === 'OK') {
                    // TODO: Replace the following line with your code.
                    console.log('User clicked OK.');
                } else if (result === 'no') {
                    // TODO: Replace the following line with your code.
                    console.log('User clicked no.');
                }
            }
        });
    }

    checkLoggedIn() : boolean {
        if (!this.loggedIn) {
            // should show login dialog
            this.loginDialogRef = this._matDialog.open(LoginComponent, {
                panelClass: 'user-dialog',
                data      : {
                }
            });
            this.loginDialogRef.afterClosed()
                .subscribe(response => {
                    if (this.loggedIn) {
                        //this.router.navigate(['upload_stl']);
                    }
                });

            return false;
        }
        return true;
    }
}
