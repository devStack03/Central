import { Component, OnInit, ElementRef, Input } from '@angular/core';
import { Location, LocationStrategy, PathLocationStrategy } from '@angular/common';
import { Stl } from 'app/shared/models/stl.model';
import { Post } from 'app/shared/models/post.model';
import { ActivatedRoute, Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';

@Component({
    selector: 'app-stllist',
    templateUrl: './stllist.component.html',
    styleUrls: ['./stllist.component.scss'],
    animations   : fuseAnimations
})

export class StlListComponent implements OnInit {
    stls: Stl[];
    @Input() posts: any[];
    @Input() loading: boolean = true;
    @Input() returnParams: any = {};

    constructor(public location: Location, 
        private element : ElementRef,
        private route: ActivatedRoute,
        private router: Router,) 
    { 
    }

    
    ngOnInit() {

    }

    onStlClicked(post) {
        console.log("stl clicked", post);
        this.router.navigate(['view_stl', post._id], { queryParams: this.returnParams } );
    }
}
