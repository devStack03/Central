import { Component, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

import { fuseAnimations } from '@fuse/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { BookmarkService } from 'app/shared/services/bookmark/bookmark.service';
import * as moment from 'moment';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector   : 'bookmarks',
    templateUrl: './list.component.html',
    styleUrls  : ['./list.component.scss'],
    animations   : fuseAnimations
})
export class BookmarksComponent
{
    
    bookmarks: any[] = [];
    currentSort: string = 'nf';
    sortbys: any[];
    selectedBookmark: any = null;

    dialogRef: MatDialogRef<BookmarksComponent>;
    @ViewChild('removeBookmarkDialog') removeBookmarkDialog;

    /**
     * Constructor
     *
     * @param {FuseTranslationLoaderService} _fuseTranslationLoaderService
     */
    constructor(
        private bookmarkService: BookmarkService,
        private router: Router,
        private _matDialog: MatDialog
    )
    {
        // Set the defaults

        this.sortbys = [
            {'value': 'nf', 'label': 'Newest First'},
            {'value': 'of', 'label': 'Oldest First'},
            {'value': 'md', 'label': 'Most Downloads'},
            {'value': 'ld', 'label': 'Least Downloads'},
        ];

        this.changedSortby();

    }

    changedSortby()
    {
        this.bookmarkService.getByUser(this.currentSort).subscribe((data) =>{
            if (data && data['success'] == 1) {
                this.bookmarks = data['data'];
            }
            else {
                //
            }
        }, (error) => {
            //
        });
    }

    formatFromNow(value) {
        return moment(value).fromNow();
    }

    onBookmarkClicked(bookmark) {
        this.router.navigate(['view_stl', bookmark.post._id]);
    }

    onBookmarkLongPressed(bookmark) {
        console.log('long pressed: ', bookmark);
        this.selectedBookmark = bookmark;

        this.dialogRef = this._matDialog.open(this.removeBookmarkDialog);
        this.dialogRef.afterClosed().subscribe(result => {
            // Note: If the user clicks outside the dialog or presses the escape key, there'll be no result
            if (result !== undefined) {
                if (result === 'Remove') {
                    // TODO: Replace the following line with your code.
                } else {
                    // TODO: Replace the following line with your code.
                }
            }
        });

        return false;
    }

    onRemoveClicked() {
        this.dialogRef.close();
        if (this.selectedBookmark == null) {
            return;
        }

        // unbookmark
        this.bookmarkService.delete(this.selectedBookmark._id).subscribe((data) => {
            if (data && data['success'] == 1) {
                // should remove bookmark
                for( var i = 0; i < this.bookmarks.length; i++ ) {
                    if( this.bookmarks[i]._id == this.selectedBookmark._id ) {
                        this.bookmarks.splice( i, 1 );  // remove the item
                        break; // finish the loop, as we already found the item
                    }
                }
            }
        });
    }
}
