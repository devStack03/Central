import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import * as moment from 'moment';
import { KudoService } from 'app/shared/services/kudo.service';

@Component({
    selector   : 'kudos',
    templateUrl: './kudos.component.html',
    styleUrls  : ['./kudos.component.scss'],
    animations   : fuseAnimations
})
export class KudosComponent
{
    
    kudos: any[] = [];
    currentSort: string;
    sortbys: any[];

    /**
     * Constructor
     *
     * @param {FuseTranslationLoaderService} _fuseTranslationLoaderService
     */
    constructor(
        private kudoService: KudoService,
        private router: Router,
    )
    {
        this.currentSort = 'nf';

        this.sortbys = [
            {'value': 'nf', 'label': 'Newest First'},
            {'value': 'of', 'label': 'Oldest First'}
        ];

        this.changedSortby();
    }

    changedSortby()
    {
        // Set the defaults
        this.kudoService.getByReceiver(this.currentSort).subscribe((data) => {
            if (data && data['success'] == 1) {
                this.kudos = data.data;
            }
        });
    }

    findPosition(kudo) {
        if (kudo.position == 1) {
            return 'While viewing the item \'' + kudo.post.title + '\'';
        }
        else if (kudo.position == 2) {
            return 'While viewing your profile';
        }
        return 'Unknown position';
    }

    formatFromNow(value) {
        return moment(value).fromNow();
    }

    onAvatarClicked(kudo) {
        this.router.navigate(['profile_view', kudo.sender._id]);
        return false;
    }

    onKudoClicked(kudo) {
        if (kudo.position == 1) {
            this.router.navigate(['view_stl', kudo.post._id]);
        }
        else {
            return this.onAvatarClicked(kudo);
        }
        return false;
    }
}
