import { Component, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {UserService} from 'app/shared/services/user.service'
import { first } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import {AppConstants} from 'app/shared/constants';
import { Router, ActivatedRoute } from '@angular/router';
import { S3UploaderService } from 'app/shared/services/aws/s3-uploader.service';
import { AuthService } from 'app/shared/services/auth/auth.service';
import { Const_countries } from 'app/shared/constants';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { ImageCroppedEvent } from 'ngx-image-cropper';

import { TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

@Component({
    selector   : 'editprofile',
    templateUrl: './edit.component.html',
    styleUrls  : ['./edit.component.scss']
})
export class EditProfileComponent
{
    profileForm: FormGroup;
    
    //myAvatar : String;
    //myBgImage : String;

    user: any;

    photos: any[];

    test: number;

    countries: any;

    @ViewChildren ('imgAvatar') imgAvatar ;
    @ViewChildren ('imgBackground') imgBackground ;
    @ViewChildren ('username') username ;
    @ViewChildren ('description') description;
    @ViewChildren ('profileAvatar') profileAvatar;
    @ViewChildren ('profileBg') profileBg;
    @ViewChildren ('bgImageEmpty') bgImageEmpty;

    @BlockUI() blockUI: NgBlockUI;
    
    avatarChangedEvent: any = '';
    avatarCroppedImage: any = 'assets/images/avatars/profile.jpg';

    bgChangedEvent: any = '';
    bgCroppedImage: any = 'assets/images/backgrounds/default-bg.jpg';

    @ViewChild('avatarCropDialog') avatarCropDialog;
    @ViewChild('bgCropDialog') bgCropDialog;

    /**
     * Constructor
     *
     * @param 
     */
    constructor(
        private _formBuilder: FormBuilder,
        private userService: UserService,
        private router: Router,
        private s3UploaderService: S3UploaderService,
        private authService: AuthService,
        private route: ActivatedRoute,
        private dialog: MatDialog
    )
    {
        //this.myAvatar = '';
        //this.myBgImage = '';
        this.photos = ['', ''];
        this.test = 0;

        this.countries = Const_countries;
        this.countries.sort( (a,b) => {return a.text>b.text ? 1 : (a.text<b.text ? -1 : 0);});
        this.authService.isLoggedIn.subscribe((isLoggedIn) => {
            var tempuser = this.authService.getCurrentUser();
            if (tempuser)
            {
                this.user = JSON.parse(tempuser).user;

                if (this.user.avatar)
                    this.avatarCroppedImage = this.user.avatar;
                if (this.user.bgImage)
                    this.bgCroppedImage = this.user.bgImage;
            }
        });
    }

    get pf() { return this.profileForm.controls; }

    onAddImage(id): void 
    {
        document.getElementById(id).click();
    }

    onPreview(event): void
    {
        this.username.first.nativeElement.innerHTML = this.pf.firstname.value + " " + this.pf.lastname.value;
        this.description.first.nativeElement.innerHTML = this.pf.description.value;

        this.user.firstname = this.pf.firstname.value;
        this.user.lastname = this.pf.lastname.value;
        this.user.username = this.pf.profilename.value;
        this.user.country = this.pf.country.value;
        this.user.bio = this.pf.description.value;

    }

    showError(msg): void 
    {
        alert(msg);
    }

    updateProfile() : void 
    {
        this.userService.update({
            id: this.user.id,
            firstName: this.pf.firstname.value,
            lastName: this.pf.lastname.value,
            username: this.pf.profilename.value,
            country: this.pf.country.value,
            bio: this.pf.description.value,
            avatar: this.user.avatar,
            bgImage: this.user.bgImage,
            
        }).pipe(first()).subscribe((data) => {
            if ( data['data'] ) {
                //data['data'].token = this.user.token;
                //localStorage.setItem(AppConstants.currentUser, JSON.stringify(data['data']));
                this.authService.setCurrentUer(data['data']);
            }
            this.blockUI.stop();
            this.router.navigate(['profile_view', this.user.id]);
          }, (error) => {
            this.blockUI.stop();
            if (error instanceof HttpErrorResponse) {
              alert(error.error.error);
            } else {
              console.log(error);
            }

          });
    }

    uploadPhoto(type:number): void 
    {
        if ( type == 2 ) {
            this.updateProfile();
            return;
        }

        let event = type == 0 ? this.avatarChangedEvent : this.bgChangedEvent;
        let imageData = type == 0 ? this.avatarCroppedImage : this.bgCroppedImage;


        if ( event == '') {
            this.uploadPhoto(type+1);
        } else {            
            this.s3UploaderService.uploadPhoto(imageData, (err, data) => {
                if ( this.test ) {
                    err = null;
                    if ( type == 0 ) {
                        data = {Location: 'http://localhost:4200/assets/images/avatars/james.jpg'};
                    } else {
                        data = {Location: 'http://localhost:4200/assets/images/backgrounds/default-bg.jpg'};
                    }
                }
                if (err || !data.Location) {
                    this.blockUI.stop();
                    if ( type == 0 ) {
                        this.showError('There was an error uploading your photo.');
                    } else {
                        this.showError('There was an error uploading your background photo.');
                    }
                    
                    return err;
                }

                if ( type == 0 ) {
                    this.user.avatar = data.Location;
                } else {
                    this.user.bgImage = data.Location;
                }

                this.uploadPhoto(type+1);
                
              });
        }
    }

    onSubmit() : void
    {
        this.blockUI.start('Publishing...');

        this.uploadPhoto(0);
    }

    isFormCompleted() : Boolean 
    {
        return !this.profileForm.invalid;
    }

    /**
     * On init
     */
    ngOnInit(): void
    {
        //this.user = JSON.parse(localStorage.getItem(AppConstants.currentUser));
        let isNew = false;
        if ( this.route.snapshot.queryParams && this.route.snapshot.queryParams['new'] ) {
            isNew = true;
        }

        this.profileForm = this._formBuilder.group({
            profilename : [this.user.username, Validators.required],
            firstname : [ isNew ? '' : this.user.firstName, Validators.required],
            lastname : [ isNew ? '' : this.user.lastName, Validators.required],
            country : [ isNew ? '' :  this.user.country, Validators.required],
            description: [this.user.bio, Validators.required],
        }); 

        // setTimeout(() => {
        //     if ( this.user.avatar ) {
        //         this.imgAvatar.first.nativeElement.style.background = 'url(' + this.user.avatar + ')';
        //         this.profileAvatar.first.nativeElement.style.background = 'url(' + this.user.avatar + ')';
        //     } 
        //     if ( this.user.bgImage ) {
        //         this.imgBackground.first.nativeElement.src = this.user.bgImage;
        //         this.profileBg.first.nativeElement.style.background = 'url(' + this.user.bgImage + ')';
        //         this.bgImageEmpty.first.nativeElement.style.display = "none";
        //     }    
        // }, 300);
    }

    onFileInput(type: number, file, event): void
    {
        if ( type == 0 ) {
            this.avatarChangedEvent = event;

            let dialogRef = this.dialog.open(this.avatarCropDialog);
            dialogRef.afterClosed().subscribe(result => {
                // Note: If the user clicks outside the dialog or presses the escape key, there'll be no result
                if (result !== undefined) {
                    if (result === 'yes') {
                        // TODO: Replace the following line with your code.
                        console.log('User clicked yes.');
                    } else if (result === 'no') {
                        // TODO: Replace the following line with your code.
                        console.log('User clicked no.');
                    }
                }
            })
        }
        else {
            this.bgChangedEvent = event;

            let dialogRef2 = this.dialog.open(this.bgCropDialog);
            dialogRef2.afterClosed().subscribe(result => {

                this.profileBg.first.nativeElement.style.background = this.bgCroppedImage;

                // Note: If the user clicks outside the dialog or presses the escape key, there'll be no result
                if (result !== undefined) {
                    if (result === 'yes') {
                        // TODO: Replace the following line with your code.
                        console.log('User clicked yes.');
                    } else if (result === 'no') {
                        // TODO: Replace the following line with your code.
                        console.log('User clicked no.');
                    }
                }
            })
        }
        
        

        
        
        var url = URL.createObjectURL(file);
        this.photos[type] = file;
        if ( type == 0 ) {
            //this.imgAvatar.first.nativeElement.style.background = 'url(' + url + ')';
            //this.profileAvatar.first.nativeElement.style.background = 'url(' + url + ')';
            //this.myAvatar = url;
        } else {
            //this.imgBackground.first.nativeElement.src = url;
            //this.profileBg.first.nativeElement.style.background = 'url(' + url + ')';
            this.bgImageEmpty.first.nativeElement.style.display = "none";
            //this.myBgImage = url;
        }
    }

    onAvatarCropped(event: ImageCroppedEvent) {
        this.avatarCroppedImage = event.base64;
    }
    onAvatarLoaded(/*image: HTMLImageElement*/) {
        // show cropper
    }
    onAvatarCropperReady() {
        // cropper ready
    }
    onAvatarLoadFailed() {
        // show message
    }

    onBgCropped(event: ImageCroppedEvent) {
        this.bgCroppedImage = event.base64;
    }
    onBgLoaded(/*image: HTMLImageElement*/) {
        // show cropper
    }
    onBgCropperReady() {
        // cropper ready
    }
    onBgLoadFailed() {
        // show message
    }
}
