import { Component, Input, Inject, ViewChild } from '@angular/core';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { User } from 'app/shared/models/user.model';
import { Stl } from 'app/shared/models/stl.model';
import { ActivatedRoute, Router } from '@angular/router';
import { Post } from 'app/shared/models/post.model';
import { PostService } from 'app/shared/services/post/post.service';
import { LikeService } from 'app/shared/services/like/like.service';
import { BookmarkService } from 'app/shared/services/bookmark/bookmark.service';
import { CommentService } from 'app/shared/services/comment/comment.service';
import { DownloadService } from 'app/shared/services/download/download.service';
import { AuthService } from 'app/shared/services/auth/auth.service';
import { KudoService } from 'app/shared/services/kudo.service';
import { TransactionService } from 'app/shared/services/transaction.service';
import { ShareDialogComponent } from 'app/main/share-dialog/share-dialog.component';
import {LoginComponent} from 'app/main/user/login.component';

import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';
import { FuseInformDialogComponent } from '@fuse/components/inform-dialog/inform-dialog.component';

import * as moment from 'moment';
import { AppConstants } from 'app/shared/constants';
import { first } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { FuseInformDialogModule } from '@fuse/components';
// import { Lightbox } from 'ngx-lightbox';

@Component({
    selector   : 'viewstl',
    templateUrl: './view.component.html',
    styleUrls  : ['./view.component.scss']
})
export class ViewSTLComponent
{
    @Input() stl: Stl;

    @ViewChild('commentTxtAreaInput') commentTxtAreaInput;
    @ViewChild('giveTipDialog') giveTipDialog;
    @ViewChild('giveTipAmountInput') giveTipAmountInput;
    @ViewChild('socialShareDialog') socialShareDialog;
    @ViewChild('fullScreenDialog') fullScreenDialog;
    @ViewChild('stlViewer') stlViewer;
    
    post: any = null;
    user: any = null;
    currentSlide: number = 0;
    firstTabSelected = true;
    isNew = false;

    loginDialogRef: any;
    isLoggedIn = false;
    totoalCommentsCount : Number = 0;
    isMyPost = false;

    fullImages: any[];

    public dialogRef: MatDialogRef<ViewSTLComponent>;
    confirmDialogRef: MatDialogRef<FuseConfirmDialogComponent>;
    informDialogRef: MatDialogRef<FuseInformDialogComponent>;
    giveTipDialogRef: MatDialogRef<Component>;
    fullScreenDialogRef: MatDialogRef<Component>;

    
    slideConfig = {"slidesToShow": 1, "slidesToScroll": 1, "arrows": false};
    @ViewChild('slickModal') slickModal;

    slideConfig_full = {"slidesToShow": 1, "slidesToScroll": 1, "arrows": false};
    @ViewChild('slickFull') slickFull;

    slideConfig_thumb = {"slidesToShow": 3, "slidesToScroll": 1, "arrows": false, "draggable": false};
    @ViewChild('slickModal_thumb') slickModal_thumb;

    /**
     * Constructor
     *
     * @param 
     */
    constructor(
        public dialog: MatDialog,
        private postService: PostService,
        private likeService: LikeService,
        private bookmarkService: BookmarkService,
        private commentService: CommentService,
        private route: ActivatedRoute,
        private authService: AuthService,
        private downloadService: DownloadService,
        private kudoService: KudoService,
        private transactionService: TransactionService,
        private router: Router,
        private _matDialog: MatDialog,
        //private _lightbox: Lightbox
    ) {
        if (this.route.snapshot.params && this.route.snapshot.params.id) {
            this.postService.getById(this.route.snapshot.params.id).subscribe((data) => {
                console.log('post service resonse data => ', data);
                if (data && data['success'] == 1) {
                    this.post = data['data'];

                    if (this.user != null) {
                        if (this.user.id == this.post.owner._id) {
                            this.isMyPost = true;
                        }
                    }
                }
            });
        }

        this.authService.isLoggedIn.subscribe((isLoggedIn) => {
            var tempuser = this.authService.getCurrentUser();
            if (tempuser)
            {
                this.user = JSON.parse(tempuser).user;

                if (this.post != null) {
                    if (this.user.id == this.post.owner._id) {
                        this.isMyPost = true;
                    }
                }
            }

            this.isLoggedIn = isLoggedIn;
        });

        this.totoalCommentsCount = 0;
    }

    /**
     * On init
     */
    ngOnInit(): void
    {
        //setTimeout(()=> {
        //    this.stlViewer.render();
        //}, 3000);
    }

    selectTabChanged(e) {
        if (e.tab.textLabel == '3D View') {
            if (this.firstTabSelected) {
                setTimeout(()=> {
                    this.stlViewer.setSizes();
                    setTimeout(()=> {
                        this.stlViewer.render();
                    }, 1000);
                }, 1000);
                this.firstTabSelected = false;
            }
        }
    }

    checkLoggedIn() : boolean {
        if (!this.isLoggedIn) {
            // should show login dialog
            this.loginDialogRef = this.dialog.open(LoginComponent, {
                panelClass: 'user-dialog',
                data      : {
                }
            });
            this.loginDialogRef.afterClosed()
                .subscribe(response => {
                    if (this.isLoggedIn) {
                        //this.router.navigate(['upload_stl']);
                    }
                });

            return false;
        }
        return true;
    }

    onBack() {
        let returnUrl = this.route.snapshot.queryParams['returnUrl'];
        if ( !returnUrl ) {
            window.history.back();
        } else {
            let returnParams = this.route.snapshot.queryParams;
            this.router.navigate([returnUrl], { queryParams: returnParams } );
            
        }
    }

    showMessage(message) : void 
    {
        this.informDialogRef = this._matDialog.open(FuseInformDialogComponent, {
            disableClose: false
        });

        this.informDialogRef.componentInstance.message = message;

    }

    onAvatarClick() : void
    {
        this.router.navigate(['/profile_view', this.post.owner._id]);
    }

    onSendTip() : void
    {
        if (!this.checkLoggedIn())
            return;
        if ( this.post.owner._id == this.user.id) {
            this.showMessage('You can\'t give tip to yourself.');  
            return;
        }
        this.giveTipDialogRef = this.dialog.open(this.giveTipDialog);
    }

    onGiveTipClick() : void 
    {
        if (!this.checkLoggedIn())
            return;
        
        if ( this.post.owner._id == this.user.id) {
            this.showMessage('You can\'t give tip to yourself.');  
            return;
        }

        this.confirmDialogRef = this._matDialog.open(FuseConfirmDialogComponent, {
            disableClose: false
        });

        this.confirmDialogRef.componentInstance.confirmMessage = 'Are you sure you want to give tip to ' 
                            + this.post.owner.firstName + ' ' + this.post.owner.lastName + '?';

        this.confirmDialogRef.afterClosed().subscribe(result => {
            if ( result )
            {
                this.giveTipDialogRef.close();
                this.transactionService.send(this.post.owner._id, this.giveTipAmountInput.nativeElement.value, AppConstants.TRANSACTION_GIVE_TIP)
                .pipe(first()).subscribe((data) => {
                    if ( data['success'] == 1 ) {
                        this.showMessage('You have successfully given tip.');  
                    } else {
                        this.showMessage('Your balance is not enough to give tip.');
                    }
                  }, (error) => {
                    this.showMessage('Failed to give tip.');
                    if (error instanceof HttpErrorResponse) {
                    //   alert(error.error.error);
                    } else {
                      console.log(error);
                    }
        
                  });
            }
        });
    }


    onGiveKudo() : void 
    {
        if ( this.post.owner._id == this.user.id) {
            this.showMessage('You can\'t give kudos to yourself.');  
            return;
        }
        this.confirmDialogRef = this._matDialog.open(FuseConfirmDialogComponent, {
            disableClose: false
        });

        this.confirmDialogRef.componentInstance.confirmMessage = 'Are you sure you want to give kudos to ' 
                            + this.post.owner.firstName + ' ' + this.post.owner.lastName + '?';

        this.confirmDialogRef.afterClosed().subscribe(result => {
            if ( result )
            {
                this.kudoService.sendKudo(this.post.owner._id, AppConstants.KUDO_POSITION_ITEM, this.post._id).pipe(first()).subscribe((data) => {
                    if ( data['success'] == 1 ) {
                        this.showMessage('You have successfully given kudos.');
                    } else {
                        this.showMessage('You had already given kudos to this user.');
                    }
                  }, (error) => {
                    this.showMessage('Failed to give kudos.');
                    if (error instanceof HttpErrorResponse) {
                    //   alert(error.error.error);
                    } else {
                      console.log(error);
                    }
        
                  });
            }
        });
    }

    /**
     * Button actions
     */

     onShareClicked() {
         console.log('share clicked');

         /*
         if (!this.checkLoggedIn())
            return;

        var dialogRef = this.dialog.open(ShareDialogComponent, {
            panelClass: 'share-dialog',
        });
        this.dialogRef.componentInstance.post = this.post;
        dialogRef.afterClosed().subscribe(result => {
            
        });
        */
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

     onBookmarkClicked() {
        console.log('bookmark clicked');

        if (!this.checkLoggedIn())
            return;

        this.post.bookmark = !this.post.bookmark;
        this.post.bookmarkCount += 1;
        this.bookmarkService.create(this.post).subscribe((data) => {
            if (data.success != 1) {
                this.post.bookmark = !this.post.bookmark;
                this.post.bookmarkCount -= 1;
            }
        },
        (err: any) => {
            this.post.bookmark = !this.post.bookmark;
        });
     }

     onLikeClicked() {
        console.log('like clicked');

        if (!this.checkLoggedIn())
            return;
    
        this.post.myLiked = !this.post.myLiked;
        this.post.likeCount += 1;

        this.likeService.create(this.post).subscribe((data) => {
            if (data.success != 1) {
                this.post.myLiked = !this.post.myLiked;
                this.post.likeCount -= 1;
            }
        },
        (err: any) => {
            this.post.myLiked = !this.post.myLiked;
        });

     }

     onDownloadClicked() {
        console.log('download clicked');

        if (!this.checkLoggedIn())
            return;

            if ( this.post.coins > 0 ) {

                this.confirmDialogRef = this._matDialog.open(FuseConfirmDialogComponent, {
                    disableClose: false
                });

                let filename = this.post.assetFile.split('/');
                this.confirmDialogRef.componentInstance.confirmMessage = `You are about to download ${filename[filename.length-1]} for ${this.post.coins} coins`;
                this.confirmDialogRef.componentInstance.confirmButtonText = `Download`;
        
                this.confirmDialogRef.afterClosed().subscribe(result => {
                    if ( result )
                    {
                        this.performDownload();
                    }
                });

            } else {
                this.performDownload();
            }
        
     }

     performDownload() {
        this.downloadService.create(this.post).subscribe((data) => {
            if (data.success != 1) {
                this.showMessage(data.error);
            }
            else {
                if (this.isLoggedIn && this.user != null && this.user.id == this.post.owner._id) {
                    //
                }
                else if (data.data.isCreated) {
                    this.post.downloadCount++;
                }
                window.location.href = data.data.file;
            }
        },
        (err: any) => {
            this.showMessage("Failed to download stl file.");
        });
     }

     onEditSTL() {
        this.router.navigate(['upload_stl'], { queryParams: {id: this.post._id} } );
     }

     onPostCommentClicked() {

        if (!this.checkLoggedIn())
            return;

        const comment = this.commentTxtAreaInput.nativeElement.value;
        if (comment.length > 0) {

            this.commentService.create(this.post, comment).subscribe((data) => {

                if (data.success == 1) {
                    let commentObj = data.data.comment;
                    this.post.commentCount = data.data.count;
                    commentObj['commenter'] = {
                        username: this.user.firstName + ' ' + this.user.lastName,
                        firstName: this.user.firstName,
                        lastName: this.user.lastName,
                        _id: this.user.id,
                        avatar: this.user.avatar
                    };
                    //console.log(this.user);
                    this.post.comments.push(commentObj);
                    this.commentTxtAreaInput.nativeElement.value = '';
                    //this.commentTxtAreaInput.blur();
                }
            });
        }
     }

     loadMoreComments() {
        console.log('load more clicked');
        this.commentService.loadComments(this.post._id, this.post.comments.length).subscribe((data) => {

            if (data.success == 1) {
                this.post.commentCount = data.data.total;
                for (let index = data.data.comments.length - 1; index >= 0 ; index--) {
                    this.post.comments.unshift(data.data.comments[index]);    
                }
                
                
            }
        });
     }

     formatPeriod(value) {
        let str: string = moment(value).fromNow();
        if (str.length > 3 && str.substr(str.length - 4) === 'ago') {
           str = str.substr(0, str.length - 4);
        }
        return str;
     }

     getFormattedNumberOnly(number) {
      var ret = "";
      var temp = Number.parseInt(number + "");
      if (temp == undefined) {
          return "";
      }
      var i = 0;
      while (temp > 10) {
          ret = ((temp % 10) + "") + ret;
          if ((i % 3) == 2) {
              ret = "," + ret;
          }
          i++;
          temp = Number.parseInt((temp / 10) + "");
      }
      ret = temp + ret;
      return ret;
    }
  
    getFormattedNumber(number) {
  
      var prefNum = 0;
      if (number > 1000000) {
          prefNum = Number.parseInt((number / 1000000) + "");
          return this.getFormattedNumberOnly(prefNum) + "m";
      }
      else if (number > 1000) {
          prefNum = Number.parseInt((number / 1000) + "");
          return this.getFormattedNumberOnly(prefNum) + "k";
      }
      else {
          prefNum = Number.parseInt(number + "");
          return this.getFormattedNumberOnly(prefNum);
      }
    }

    /**
     * slide actions
     */

    slickInit(e) {
        //console.log('slick initialized');
    }
    
    breakpoint(e) {
        //console.log('breakpoint');
    }
    
    afterChange(e) {
        //console.log('afterChange', e);
    }
    
    beforeChange(e) {
        //console.log('beforeChange', e);
        this.currentSlide = e.nextSlide;
        if (e.currentSlide == e.nextSlide)
            return;
        if (e.currentSlide < e.nextSlide) {
            if (e.currentSlide == 0 && e.nextSlide == e.slick.slideCount - 1) {
                this.slickModal_thumb.slickPrev();
                // this.slickFull.slickPrev();
            }
            else {
                this.slickModal_thumb.slickNext();
                // this.slickFull.slickNext();
            }
        }
        else {
            if (e.currentSlide == e.slick.slideCount - 1 && e.nextSlide == 0) {
                this.slickModal_thumb.slickNext();
                // this.slickFull.slickNext();
            }
            else {
                this.slickModal_thumb.slickPrev();
                // this.slickFull.slickPrev();
            }
        }
    }

    onSlideLeftClicked() {
        this.slickModal.slickPrev();
        //this.slickModal_thumb.slickPrev();
    }

    onSlideRightClicked() {
        this.slickModal.slickNext();
        //this.slickModal_thumb.slickNext();
    }

    onFullClicked() { 
        this.fullImages = [];
        for ( let i = 0; i < this.post.photos.length; i++ ) {
            this.fullImages.push( this.post.photos[(i + this.currentSlide) % this.post.photos.length]);
        }
        this.fullScreenDialogRef = this.dialog.open(this.fullScreenDialog, {
            panelClass: 'full-screen',
            data      : {
            }
        });
    }

    fullSlickInit(e) {
        //this.slickFull.slickGoTo(this.currentSlide);
        // e.slick.changeSlide(this.currentSlide);
    }

    onFullSlideLeftClicked() {
        this.slickFull.slickPrev();
        //this.slickModal_thumb.slickPrev();
    }

    onFullSlideRightClicked() {
        this.slickFull.slickNext();
        //this.slickModal_thumb.slickNext();
    }

    afterChange_thumb(e) {
        //console.log('afterChange_thumb', e);
    }
    
    beforeChange_thumb(e) {
        //console.log('beforeChange_thumb', e);
    }
}
