import { Component, Inject, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { Subject } from 'rxjs';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';
import { FuseUtils } from '@fuse/utils';

import { takeUntil } from 'rxjs/operators';

import { SocialAuthService, SocialUser } from 'angularx-social-login';
import { AuthService } from 'app/shared/services/auth/auth.service';
import { fuseAnimations } from '@fuse/animations';
import { Router, ActivatedRoute } from '@angular/router';
import { first } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';

import { FacebookLoginProvider, GoogleLoginProvider } from 'angularx-social-login';

import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector     : 'login',
    templateUrl  : './login.component.html',
    styleUrls    : ['./login.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: [fuseAnimations]
})
export class LoginComponent implements OnInit, OnDestroy
{
    card: any;
    board: any;
    list: any;
    loginForm: FormGroup;
    registerForm: FormGroup;

    submitted = false;
    loading = false;

    errorOccurred = false;
    error = 'Unknown Error';

    private user: SocialUser;
    private loggedIn: boolean;

    toggleInArray = FuseUtils.toggleInArray;
    confirmDialogRef: MatDialogRef<FuseConfirmDialogComponent>;

    @ViewChild('checklistMenuTrigger')
    checklistMenu: MatMenuTrigger;

    @ViewChild('newCheckListTitleField')
    newCheckListTitleField;

    @BlockUI() blockUI: NgBlockUI;

    // Private
    private _unsubscribeAll: Subject<any>;

    /**
     * Constructor
     *
     * @param {MatDialogRef<LoginComponent>} matDialogRef
     * @param _data
     * @param {MatDialog} _matDialog
     * @param {ScrumboardService} _scrumboardService
     */
    constructor(
        public matDialogRef: MatDialogRef<LoginComponent>,
        @Inject(MAT_DIALOG_DATA) private _data: any,
        private _matDialog: MatDialog,
        private _formBuilder: FormBuilder,
        private socialAuthService: SocialAuthService,
        private userAuthService: AuthService,
        private router: Router,
        private route: ActivatedRoute,
        private _matSnackBar: MatSnackBar
    )
    {
        // Set the private defaults
        this._unsubscribeAll = new Subject();

        this.socialAuthService.authState.pipe(first()).subscribe((user) => {
            this.user = user;
            console.log(' user => ', user);
            this.loggedIn = (user != null);
          }, (error) => {
            console.log(error);
          });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        this.loginForm = this._formBuilder.group({
            email   : ['', [Validators.required, Validators.email]],
            password: ['', Validators.required],
            rememberCheckbox: ['']
        });

        this.registerForm = this._formBuilder.group({
            email   : ['', [Validators.required, Validators.email]],
            password: ['', Validators.required],
            passwordConfirm: ['', [Validators.required, confirmPassword]],
        });

        
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

    get rf() { return this.registerForm.controls; }
    get lf() { return this.loginForm.controls; }

    onRegisterSubmit() {

        this.blockUI.start('Loading...');

        console.log(this.registerForm.invalid);
        this.submitted = true;
        this.loading = true;
        this.userAuthService.signUp(this.rf.email.value, this.rf.password.value, null, null).pipe(first()).subscribe((success) => {
            this.blockUI.stop();

            this.loading = false;
            console.log(success);

            if (success && success.success)
            {
                //this.userAuthService.setLoggedIn(true);
                this.matDialogRef.close();
                this.router.navigate(['/profile_edit'], { queryParams: {new: 1} } );
            }
            else
            {
                this.errorOccurred = true;

                if (success && success.error)
                    this.error = success.error;

                // Show the error message
                this._matSnackBar.open('Register Failed, ' + this.error, 'Close', {
                    verticalPosition: 'top',
                    duration        : 2000
                });
            }
        }, (error) => {
            this.blockUI.stop();
            
            this.loading = false;
            if (error instanceof HttpErrorResponse) {
                this.error = error?.error?.error || 'Http response error';
            } else {
                console.log(error);
                this.error = error;
            }

            // Show the error message
            this._matSnackBar.open('Register Failed, ' + this.error, 'Close', {
                verticalPosition: 'top',
                duration        : 2000
            });
        });
    }

    onLoginSubmit() {

        this.blockUI.start('Loading...');

        console.log(this.loginForm.invalid);
        this.submitted = true;
        this.loading = true;
        this.errorOccurred = false;
        this.error = 'Unknown Error';
        this.userAuthService.signIn(this.lf.email.value, this.lf.password.value, this.lf.rememberCheckbox.value).pipe(first()).subscribe((data) => {
                this.blockUI.stop();
                
                this.loading = false;
                
                console.log('success : ', data);
                if (data.success && data.success > 0) {
                    this.matDialogRef.close();

                    //this.userAuthService.setLoggedIn(true);
                    
                } else {
                    this.errorOccurred = true;
                    this.error = data.error;

                    // Show the error message
                    this._matSnackBar.open('Login Failed, ' + this.error, 'Close', {
                        verticalPosition: 'top',
                        duration        : 2000
                    });
                }
            }, 
            (error) => {
                this.blockUI.stop();

                this.loading = false;
                this.errorOccurred = true;
                console.log(error);
                if (error instanceof HttpErrorResponse) {
                    this.error = error.error.error;
                } else {
                    this.error = error;
                }

                // Show the error message
                this._matSnackBar.open('Login Failed, ' + this.error, 'Close', {
                    verticalPosition: 'top',
                    duration        : 2000
                });
            }
        );
    }

    onClickLoginWithFB() {
        this.socialAuthService.signIn(FacebookLoginProvider.PROVIDER_ID).then((data) => {
          console.log(data);
          this.submitted = true;
          this.loading = true;
          this.userAuthService.loginWithFacebook(data).pipe(first()).subscribe((user) => {
            this.loading = false;
            //this.userAuthService.setLoggedIn(true);
            console.log('success : ', user);
            this.matDialogRef.close();

            //this.router.navigate(['/']);
          }, (error) => {
            console.log(error);
            this.loading = false;
            //this.alertService.error(error);
          });
        }, error => {
          console.log(error);
        });
      }
    
      onClickLoginWithGoogle() {
        this.socialAuthService.signIn(GoogleLoginProvider.PROVIDER_ID).then((data) => {
          console.log(data);
          this.submitted = true;
          this.loading = true;
          this.userAuthService.loginWithGoogle(data).pipe(first()).subscribe((user) => {
            this.loading = false;
            //this.userAuthService.setLoggedIn(true);
            console.log('success : ', user);
            this.matDialogRef.close();
            
            //this.router.navigate(['/']);
          }, (error) => {
            console.log(error);
            this.loading = false;
            //this.alertService.error(error);
          });
        }, error => {
          console.log(error);
        });
      }

    /**
     * Remove due date
     */
    removeDueDate(): void
    {
        this.card.due = '';
        this.updateCard();
    }

    /**
     * Toggle subscribe
     */
    toggleSubscribe(): void
    {
        this.card.subscribed = !this.card.subscribed;

        this.updateCard();
    }

    /**
     * Toggle cover image
     *
     * @param attachmentId
     */
    toggleCoverImage(attachmentId): void
    {
        if ( this.card.idAttachmentCover === attachmentId )
        {
            this.card.idAttachmentCover = '';
        }
        else
        {
            this.card.idAttachmentCover = attachmentId;
        }

        this.updateCard();
    }

    /**
     * Remove attachment
     *
     * @param attachment
     */
    removeAttachment(attachment): void
    {
        if ( attachment.id === this.card.idAttachmentCover )
        {
            this.card.idAttachmentCover = '';
        }

        this.card.attachments.splice(this.card.attachments.indexOf(attachment), 1);

        this.updateCard();
    }

    /**
     * Remove checklist
     *
     * @param checklist
     */
    removeChecklist(checklist): void
    {
        this.card.checklists.splice(this.card.checklists.indexOf(checklist), 1);

        this.updateCard();
    }

    /**
     * Update checked count
     *
     * @param list
     */
    updateCheckedCount(list): void
    {
        const checkItems = list.checkItems;
        let checkedItems = 0;
        let allCheckedItems = 0;
        let allCheckItems = 0;

        for ( const checkItem of checkItems )
        {
            if ( checkItem.checked )
            {
                checkedItems++;
            }
        }

        list.checkItemsChecked = checkedItems;

        for ( const item of this.card.checklists )
        {
            allCheckItems += item.checkItems.length;
            allCheckedItems += item.checkItemsChecked;
        }

        this.card.checkItems = allCheckItems;
        this.card.checkItemsChecked = allCheckedItems;

        this.updateCard();
    }

    /**
     * Remove checklist item
     *
     * @param checkItem
     * @param checklist
     */
    removeChecklistItem(checkItem, checklist): void
    {
        checklist.checkItems.splice(checklist.checkItems.indexOf(checkItem), 1);

        this.updateCheckedCount(checklist);

        this.updateCard();
    }

    /**
     * Add check item
     *
     * @param {NgForm} form
     * @param checkList
     */
    addCheckItem(form: NgForm, checkList): void
    {
        const checkItemVal = form.value.checkItem;

        if ( !checkItemVal || checkItemVal === '' )
        {
            return;
        }

        const newCheckItem = {
            name   : checkItemVal,
            checked: false
        };

        checkList.checkItems.push(newCheckItem);

        this.updateCheckedCount(checkList);

        form.setValue({checkItem: ''});

        this.updateCard();
    }

    /**
     * Add checklist
     *
     * @param {NgForm} form
     */
    addChecklist(form: NgForm): void
    {
        this.card.checklists.push({
            id               : FuseUtils.generateGUID(),
            name             : form.value.checklistTitle,
            checkItemsChecked: 0,
            checkItems       : []
        });

        form.setValue({checklistTitle: ''});
        form.resetForm();
        this.checklistMenu.closeMenu();
        this.updateCard();
    }

    /**
     * On checklist menu open
     */
    onChecklistMenuOpen(): void
    {
        setTimeout(() => {
            this.newCheckListTitleField.nativeElement.focus();
        });
    }

    /**
     * Add new comment
     *
     * @param {NgForm} form
     */
    addNewComment(form: NgForm): void
    {
        const newCommentText = form.value.newComment;

        const newComment = {
            idMember: '36027j1930450d8bf7b10158',
            message : newCommentText,
            time    : 'now'
        };

        this.card.comments.unshift(newComment);

        form.setValue({newComment: ''});

        this.updateCard();
    }

    /**
     * Remove card
     */
    removeCard(): void
    {
        this.confirmDialogRef = this._matDialog.open(FuseConfirmDialogComponent, {
            disableClose: false
        });

        this.confirmDialogRef.componentInstance.confirmMessage = 'Are you sure you want to delete the card?';

        this.confirmDialogRef.afterClosed().subscribe(result => {
            if ( result )
            {
                this.matDialogRef.close();
            }
        });
    }

    /**
     * Update card
     */
    updateCard(): void
    {
    }
}

function confirmPassword(control: AbstractControl) {
    if (!control.parent || !control) {
      return;
    }
  
    const password = control.parent.get('password');
    const passwordConfirm = control.parent.get('passwordConfirm');
  
    if (!password || !passwordConfirm) {
      return;
    }
  
    if (passwordConfirm.value === '') {
      return;
    }
  
    if (password.value !== passwordConfirm.value) {
      return {
        passwordsNotMatch: true
      };
    }
  }
