import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { fuseAnimations } from '@fuse/animations';

import { PostService } from 'app/shared/services/post/post.service';
import { AuthService } from 'app/shared/services/auth/auth.service';

import {LoginComponent} from 'app/main/user/login.component';
import * as _ from 'lodash';
import { AppConstants } from 'app/shared/constants';
import { Route } from '@angular/compiler/src/core';

@Component({
    selector   : 'home',
    templateUrl: './home.component.html',
    styleUrls  : ['./home.component.scss'],
    animations   : fuseAnimations
})
export class HomeComponent implements OnInit
{
    searchInput: FormControl;

    searchTerm: string;
    currentCategory: string;

    currentSort = 'mp'; // most popular
    sortbys: any[];

    currentSearchSort = 'd';    // downloads
    searchSortbys: any[];


    loading = true;
    posts: any[] = [];

    loadsAtOnce = 10;
    isSearching = false;

    dialogRef: any;
    isLoggedIn = false;

    searchParams: any = {'returnUrl': 'home'};

    // popover
    // popoverTitle = 'Popover title';
    // popoverMessage = 'Popover description';
    // confirmClicked = false;
    // cancelClicked = false;

    @ViewChild('filterDialog') filterDialog;
    filterUploaded: any[];
    filterPrice: any[];
    filterDownloads: any[];
    filterLikes: any[];
    filterPubCount: any[];
    filterPubKudos: any[];

    initialFilterSearchObj = {
        'uploaded': 'none',
        'price': 'none',
        'downloads': 'none',
        'likes': 'none',
        'pubcount': 'none',
        'pubkudos': 'none'
    };
    
    filterSearchObj = _.clone(this.initialFilterSearchObj);

    /**
     * Constructor
     *
     * @param {FuseTranslationLoaderService} _fuseTranslationLoaderService
     */
    constructor(
        private authService: AuthService,
        private postService: PostService,
        private router: Router,
        private route: ActivatedRoute,
        private _matDialog: MatDialog,
    )
    {
        this.sortbys = [
            {'value': 'mp', 'label': 'Most Popular'},
            {'value': 'md', 'label': 'Most Downloaded'},
            {'value': 'ml', 'label': 'Most Liked'},
            {'value': 'mr', 'label': 'Most Recent'},
        ];
        this.searchSortbys = [
            {'value': 'd', 'label': 'Downloads'},
            {'value': 'v', 'label': 'Views'},
            {'value': 'l', 'label': 'Likes'},
            {'value': 'b', 'label': 'Bookmarks'},
            {'value': 'nf', 'label': 'Newest First'},
            {'value': 'of', 'label': 'Oldest First'},
            {'value': 'ph', 'label': 'Price Highest'},
            {'value': 'pl', 'label': 'Price Lowest'},
        ]

        this.filterUploaded = [
            {'value': 'none', 'label': 'Doesn\'t Matter'},
            {'value': 'td', 'label': 'Today'},
            {'value': 'week', 'label': 'Last 7 Days'},
            {'value': 'month', 'label': 'Last 30 Days'},
            {'value': 'halfyear', 'label': 'Last 180 Days'},
            {'value': 'lastyear', 'label': 'Last Year'},
        ];

        this.filterPrice = [
            {'value': 'none', 'label': 'Doesn\'t Matter'},
            {'value': 'u1', 'label': 'Under $1'},
            {'value': 'u5', 'label': 'Under $5'},
            {'value': 'u10', 'label': 'Under $10'},
            {'value': 'u25', 'label': 'Under $25'},
            {'value': 'o25', 'label': 'Over $25'},
        ];

        this.filterDownloads = [
            {'value': 'none', 'label': 'Doesn\'t Matter'},
            {'value': 'mt10', 'label': 'More Than 10'},
            {'value': 'mt50', 'label': 'More Than 50'},
            {'value': 'mt100', 'label': 'More Than 100'},
            {'value': 'mt1000', 'label': 'More Than 1,000'},
            {'value': 'mt10000', 'label': 'More Than 10,000'},
        ];

        this.filterLikes = [
            {'value': 'none', 'label': 'Doesn\'t Matter'},
            {'value': 'mt10', 'label': 'More Than 10'},
            {'value': 'mt50', 'label': 'More Than 50'},
            {'value': 'mt100', 'label': 'More Than 100'},
            {'value': 'mt1000', 'label': 'More Than 1,000'},
            {'value': 'mt10000', 'label': 'More Than 10,000'},
        ];

        this.filterPubCount = [
            {'value': 'none', 'label': 'Doesn\'t Matter'},
            {'value': 'mt5', 'label': 'More Than 5 Items'},
            {'value': 'mt10', 'label': 'More Than 10 Items'},
            {'value': 'mt50', 'label': 'More Than 50 Items'},
            {'value': 'mt100', 'label': 'More Than 100 Items'},
        ];

        this.filterPubKudos = [
            {'value': 'none', 'label': 'Doesn\'t Matter'},
            {'value': 'mt5', 'label': 'More Than 5'},
            {'value': 'mt10', 'label': 'More Than 10'},
            {'value': 'mt50', 'label': 'More Than 50'},
            {'value': 'mt100', 'label': 'More Than 100'},
            {'value': 'mt1000', 'label': 'More Than 1,000'},
        ];

        // Set the defaults
        this.searchInput = new FormControl('');



        this.searchInput.valueChanges.pipe(
            debounceTime(500),
            distinctUntilChanged()
        ).subscribe(searchText => {
            //this.searchConfigService.setSearch(searchText);    
            this.posts = [];
            
            this.searchTerm = searchText;
            if (this.searchTerm && this.searchTerm.length > 0) {
                this.isSearching = true;
            }
            else {
                this.isSearching = false;
                this.filterSearchObj = _.clone(this.initialFilterSearchObj);
            }

            this.loading = true;
            console.log('searchText: ', searchText);
            this.updateSearchParams();
            this.postService.getPopulateAndSort(searchText, this.currentSort, this.filterSearchObj, 0, this.loadsAtOnce).subscribe((res) => {
                if (res.success == 1 ) {
                    for ( let post of res.data.post)
                        this.posts.push( post );
                    //this.loadedCount = this.posts.length;
                    //this.totalCount = res.data.total;
                }
                this.loading = false;
            },(error) => {
                this.loading = false;
            })
        });

        this.authService.isLoggedIn.subscribe((isLoggedIn) => {
            this.isLoggedIn = isLoggedIn;
        });
    }

    updateSearchParams() : void
    {
        this.searchParams['searchTerm'] = this.searchTerm;
        this.searchParams['currentSort'] = this.currentSort;
        this.searchParams['currentSearchSort'] = this.currentSearchSort;
        this.searchParams['uploaded'] = this.filterSearchObj['uploaded'];
        this.searchParams['price'] = this.filterSearchObj['price'];
        this.searchParams['likes'] = this.filterSearchObj['likes'];
        this.searchParams['pubcount'] = this.filterSearchObj['pubcount'];
        this.searchParams['pubkudos'] = this.filterSearchObj['pubkudos'];
    }

    setSearchParams() : void 
    {
        if ( !this.route.snapshot.queryParams || 
                    !this.route.snapshot.queryParams['currentSort']) {
            return;
        }
        
        this.searchTerm =this.route.snapshot.queryParams['searchTerm'];
        this.currentSort =this.route.snapshot.queryParams['currentSort'];
        this.currentSearchSort =this.route.snapshot.queryParams['currentSearchSort'];
        this.filterSearchObj['uploaded'] =this.route.snapshot.queryParams['uploaded'];
        this.filterSearchObj['price'] =this.route.snapshot.queryParams['price'];
        this.filterSearchObj['uplolikesaded'] =this.route.snapshot.queryParams['likes'];
        this.filterSearchObj['pubcount'] =this.route.snapshot.queryParams['pubcount'];
        this.filterSearchObj['pubkudos'] =this.route.snapshot.queryParams['pubkudos'];
    }

    ngOnInit(): void
    {
        const homeContainer = document.querySelector('#container-3');
        if ( homeContainer ) {
            homeContainer.addEventListener('ps-y-reach-end', () => {
                console.log('scroll down');
            });
            console.log('set event for ps-y-reach-end');
        }

        this.setSearchParams();
    }

    changedSortby() {
        console.log('currentSort ', this.currentSort);

        this.loading = true;
        this.updateSearchParams();
        this.postService.getPopulateAndSort(this.searchTerm, this.currentSort, this.filterSearchObj, 0, this.loadsAtOnce).subscribe((res) => {
            this.posts = [];
            if (res.success == 1 ) {
                for ( let post of res.data.post)
                    this.posts.push( post );
            }
            this.loading = false;
        },
        (error) => {
            this.loading = false;
        });
    }

    changedSearchSortby() {
        console.log('currentSearchSort ', this.currentSearchSort);

        this.loading = true;
        this.updateSearchParams();
        this.postService.getPopulateAndSort(this.searchTerm, this.currentSearchSort, this.filterSearchObj, 0, this.loadsAtOnce).subscribe((res) => {
            this.posts = [];
            if (res.success == 1 ) {
                for ( let post of res.data.post)
                    this.posts.push( post );
                //this.loadedCount = this.posts.length;
                //this.totalCount = res.data.total;
            }
            this.loading = false;
        },
        (error)=>{
            this.loading = false;
        });
    }

    onUploadClicked() {
        console.log("upload clicked");
        if (this.isLoggedIn) {
            this.router.navigate(['upload_stl']);
        }
        else {
            // should show login dialog
            this.dialogRef = this._matDialog.open(LoginComponent, {
                panelClass: 'user-dialog',
                data      : {
                }
            });
            this.dialogRef.afterClosed()
                .subscribe(response => {
                    if (this.isLoggedIn) {
                        this.router.navigate(['upload_stl']);
                    }
                });
        }
    }

    onScroll() {
        console.log("scrolled");

        this.loading = true;

        this.postService.getPopulateAndSort(this.searchTerm, this.currentSort, this.filterSearchObj, this.posts.length, this.loadsAtOnce).subscribe((res) => {
            //this.posts = [];
            if (res.success == 1 ) {
                for ( let post of res.data.post)
                    this.posts.push( post );
            }
            this.loading = false;
        },
        (error) => {
            this.loading = false;
        });
    }

    onFilterClicked() {
        console.log("filter clicked");
        this.dialogRef = this._matDialog.open(this.filterDialog);
        this.dialogRef.afterClosed().subscribe(result => {
            // Note: If the user clicks outside the dialog or presses the escape key, there'll be no result
            if (result !== undefined) {
                if (result === 'OK') {
                    // TODO: Replace the following line with your code.
                    console.log('User clicked OK.');

                    // should get filter obj
                    console.log('filtersearchobj ', this.filterSearchObj);

                    this.loading = true;
                    this.updateSearchParams();
                    this.postService.getPopulateAndSort(this.searchTerm, this.currentSearchSort, this.filterSearchObj, 0, this.loadsAtOnce).subscribe((res) => {
                        this.posts = [];
                        if (res.success == 1 ) {
                            for ( let post of res.data.post)
                                this.posts.push( post );
                        }
                        this.loading = false;
                    },
                    (error) => {
                        this.loading = false;
                    });

                } else if (result === 'no') {
                    // TODO: Replace the following line with your code.
                    console.log('User clicked no.');
                }
            }

            //this.updatePhotoList();
        })
    }
}
