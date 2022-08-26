import { Component, ViewChildren, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, FormControlName } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AuthService } from 'app/shared/services/auth/auth.service';
import { S3UploaderService } from 'app/shared/services/aws/s3-uploader.service';
import {PostService} from 'app/shared/services/post/post.service'
import { first } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { map, startWith } from 'rxjs/operators';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

@Component({
    selector   : 'uploadstl',
    templateUrl: './upload.component.html',
    styleUrls  : ['./upload.component.scss']
})
export class UploadSTLComponent
{
    stlForm: FormGroup;
    tags: string[];
    photos: string[];
    updatedPhotos: string[];

    photoChangedEvent: any = '';

    stlFile: any;

    postId: any;

    dialogRef ;
    
    @BlockUI() blockUI: NgBlockUI;

    searchControl: FormControl;

    @ViewChild('photoCropDialog') photoCropDialog;
    @ViewChild('divPhotos') divPhotos;
    @ViewChild('tagInput') tagInput;

    autoCompleteTags = [];// ['Angular', 'React', 'VueJs', 'Meteor', 'Ember.js', 'Aurelia', 'Backbone.js'];
    items = [];

    user: any;

    stlInfo: any;
    
      slideConfig = {"slidesToShow": 1, "slidesToScroll": 1, "arrows": false};
      @ViewChild('slickModal') slickModal;

      slideConfig_thumb = {"slidesToShow": 3, "slidesToScroll": 1, "arrows": false, "draggable": false};
        @ViewChild('slickModal_thumb') slickModal_thumb;
      
      
      slickInit(e) {
        //console.log('slick initialized');
      }
      
      breakpoint(e) {
        //console.log('breakpoint');
      }
      
      afterChange(e) {
        //console.log('afterChange');
      }
      
      beforeChange(e) {
        //console.log('beforeChange');
        if (e.currentSlide == e.nextSlide)
            return;
        if (e.currentSlide < e.nextSlide) {
            if (e.currentSlide == 0 && e.nextSlide == e.slick.slideCount - 1) {
                this.slickModal_thumb.slickPrev();
            }
            else {
                this.slickModal_thumb.slickNext();
            }
        }
        else {
            if (e.currentSlide == e.slick.slideCount - 1 && e.nextSlide == 0) {
                this.slickModal_thumb.slickNext();
            }
            else {
                this.slickModal_thumb.slickPrev();
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


    /**
     * Constructor
     *
     * @param 
     */
    constructor(
        private _formBuilder: FormBuilder,
        private dialog: MatDialog,
        private authService: AuthService,
        private s3UploaderService: S3UploaderService,
        private postService: PostService,
        private router: Router,
        private activatedRoute: ActivatedRoute,
    )
    {
        this.tags = [];
        this.photos = [];
        this.stlFile = '';
        var tempuser = this.authService.getCurrentUser();
        if (tempuser)
        {
            this.user = JSON.parse(tempuser).user;
        }
        this.stlInfo = {};

        this.postId = this.activatedRoute.snapshot.queryParams['id'];

        if ( this.postId ) {
            this.postService.getById(this.postId).subscribe((data) => {
                if (data && data['success'] == 1) {
                    this.pf.title.setValue(data['data']['title']);
                    this.pf.coins.setValue(data['data']['coins']);
                    this.pf.description.setValue(data['data']['description']);

                    this.tags = data['data']['tags'];
                    this.photos = data['data']['photos'];
                    setTimeout(function(self) {
                        self.updatePhotoList();
                    }, 1000, this);


                    
                    this.stlFile = {
                        name: data['data']['assetFile'].split('/').pop().split(/\#|\?/)[0], 
                        path: data['data']['assetFile']
                    };                    
                }
            });
        }



        //this.tagInput.isLoading = true;
        this.postService.getTagCandidates('').subscribe((data) => {    
            if (data && data['success'] == 1) {
                this.autoCompleteTags = this.items = data.data;
            }
            //this.tagInput.isLoading = false;
        }, (error) => {
            //this.tagInput.isLoading = false;
        });

        this.searchControl = new FormControl('');

        this.searchControl.valueChanges.pipe(
            debounceTime(200),
            distinctUntilChanged()
        ).subscribe((value) => {
            this.autoCompleteTags = this.filter(value);
        });
    }

    filter (value) {
        if (value == null)
            return this.items.filter(function (option) { return option.includes(''); });

        var filterValue = value.toLowerCase();
        return this.items.filter(function (option) { return option.toLowerCase().includes(filterValue); });
    };

    get pf() { return this.stlForm.controls; }

    isFormValid() : boolean
    {
        return !!this.pf.title.value && (this.pf.coins.value === 0 || !!this.pf.coins.value)
            && !!this.pf.description.value && this.tags.length > 0 && this.photos.length > 0 && !!this.stlFile ;
    }

    onAddImage(id): void 
    {
        document.getElementById(id).click();
    }

    onAddStl() : void
    {
        document.getElementById('stlfile').click();
    }

    onTagsFocus() {
        // this.tagInput.isLoading = true;

        // this.postService.getTagCandidates('').subscribe((data) => {    
        //     if (data && data['success'] == 1) {
        //         this.autoCompleteTags = data.data;
        //     }
        //     this.tagInput.isLoading = false;
        // }, (error) => {
        //     this.tagInput.isLoading = false;
        // });
    }

    onTagsInputChange($event) {
        console.log($event);

        // if ($event != '') {
        //     this.postService.getTagCandidates($event).subscribe((data) => {
        //         if (data && data['success']) {
        //             this.autoCompleteTags = data.data;
        //         }

        //         this.tagInput.isLoading = false;
        //     }, (error) => {
        //         this.tagInput.isLoading = false;
        //     });
        // }
    }


    removeTag(tag) : void
    {
        const index = this.tags.indexOf(tag);

        if ( index >= 0 )
        {
            this.tags.splice(index, 1);
        }
    }

    addTag(event: MatChipInputEvent): void
    {
        console.log('addTag event', event);

        const input = event.input;
        const value = event.value;

        // Add tag
        if ( value )
        {
            this.tags.push(value);
        }

        // Reset the input value
        if ( input )
        {
            input.value = '';
        }

        this.searchControl.setValue(null);
    }

    onTagSelected(event) {
        console.log('onTagSelected event', event);
        this.tags.pop();
        this.tags.push(event.option.value);

        this.searchControl.setValue(null);

        return false;
    }

    onPhotoFileInput(event: Event) : void
    {
        if ( event.target['files'].length <= 0 ) {
            return;
        }
        this.photoChangedEvent = event;
        this.dialogRef = this.dialog.open(this.photoCropDialog);
        this.dialogRef.afterClosed().subscribe(result => {
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

            this.updatePhotoList();
        })
    }

    
    onAddPhoto() : void 
    {
        document.getElementById('photofile').click();
    }

    onPhotoCropped(event)
    {
        this.photos[this.photos.length-1] = event.base64;
        // setTimeout(function(){
        //     this.updatePhotoList();
        // });
    }

    onPhotoLoaded() : void
    {
        this.photos.push('');
        console.log("onPhotoLoaded");
    }

    onPhotoCropperReady() : void
    {
        
        console.log("onPhotoCropperReady");
    }

    onPhotoLoadFailed() : void
    {
        console.log("onPhotoLoadFailed");
        this.dialogRef.close();
    }

    onRemovePhoto(photo) : void 
    {
        let pos = this.photos.indexOf(photo);
        if ( pos == -1 ) {
            return;
        }
        this.photos.splice(pos, 1);
        this.updatePhotoList();
    }

    /**
     * On init
     */
    ngOnInit(): void
    {
        this.stlForm = this._formBuilder.group({
            title : [''],
            coins : [''],
            description : [''],
        }); 
    }
    onSTLFileInput(file): void
    {
        this.stlFile = file;
    }

    onDrop(event) : void 
    {
        //console.log(this.divPhotos);
        this.updatePhotoList();
        console.log(event);

    }

    updatePhotoList() : void 
    {
        this.updatedPhotos = [];
        for ( var i = 0 ; i < this.divPhotos.nativeElement.children.length; i++) {
            this.updatedPhotos.push(this.divPhotos.nativeElement.children[i].firstChild.src);
        }
        // console.log(this.updatedPhotos);
    }

    showError( message ) : void 
    {
        alert(message);
    }

    uploadSTLInfo(): void
    {
        if ( this.postId ) {
            this.postService.update(this.postId, this.stlInfo).pipe(first()).subscribe((data) => {
                this.blockUI.stop();
                window.history.back();
              }, (error) => {
                this.blockUI.stop();
                if (error instanceof HttpErrorResponse) {
                  alert(error.error.error);
                } else {
                  console.log(error);
                }
    
              });
        } else {
            this.postService.create(this.stlInfo).pipe(first()).subscribe((data) => {
                this.blockUI.stop();
                this.router.navigate(['/home']);
              }, (error) => {
                this.blockUI.stop();
                if (error instanceof HttpErrorResponse) {
                  alert(error.error.error);
                } else {
                  console.log(error);
                }
    
              });
        }
        
    }

    uploadSTLFile(): void 
    {

        if ( this.stlFile.path ) {
            this.stlInfo['assetFile'] = this.stlFile.path;
            this.uploadSTLInfo();
            return;
        }
        this.s3UploaderService.uploadFile(this.stlFile, (err, data) => {
            // if ( true ) {
            //     err = null;
            //     data = {Location: 'http://localhost:4200/assets/images/avatars/james.jpg'};
            // }

            if (err || !data.Location) {
                this.blockUI.stop();
                this.showError('There was an error uploading your photo.');
                
                return err;
            }

            this.stlInfo['assetFile'] = data.Location;

            this.uploadSTLInfo();
            
        });

    } 

    uploadPhoto( pos ): void 
    {
        if ( pos == this.updatedPhotos.length ) {
            this.uploadSTLFile();
            return;
        } 

        if ( this.updatedPhotos[pos].startsWith('http')) {
            this.stlInfo['photos'].push(this.updatedPhotos[pos]);
            this.uploadPhoto(pos+1);
            return;
        }
        
        this.s3UploaderService.uploadPhoto(this.updatedPhotos[pos], (err, data) => {
            // if ( true ) {
            //     err = null;
            //     data = {Location: 'http://localhost:4200/assets/images/avatars/james.jpg'};
            // }

            if (err || !data.Location) {
                this.blockUI.stop();
                this.showError('There was an error uploading your photo.');
                
                return err;
            }

            this.stlInfo['photos'].push(data.Location);

            this.uploadPhoto(pos+1);
            
          });

    }

    onSaveAndPreview() {
        console.log("onSaveAndPreview");
        this.slickModal.unslick();
        this.slickModal_thumb.unslick();
        this.slickModal.initSlick();
        this.slickModal_thumb.initSlick();
    }

    onSubmit() : void {
        this.stlInfo = {
            'title': this.pf.title.value,
            'tags' : this.tags,
            'photos' : [],
            'description' : this.pf.description.value,
            'coins' : this.pf.coins.value,
            'assetType': 1,
            'assetFile': '',
        };
        this.blockUI.start('Publishing...');
        // setTimeout(function(){
            this.uploadPhoto(0);
        // }, 2000);
    }

    
}
