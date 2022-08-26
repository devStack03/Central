import { Component } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

import { fuseAnimations } from '@fuse/animations';
import { UserService } from 'app/shared/services/user.service';
import * as moment from 'moment';
import { element } from 'protractor';
import { ActivatedRoute, Router } from '@angular/router';
import { Const_countries } from 'app/shared/constants';

@Component({
    selector   : 'leaderboard',
    templateUrl: './list.component.html',
    styleUrls  : ['./list.component.scss'],
    animations   : fuseAnimations
})
export class LeaderboardComponent
{

    kudos: any[] = [];
    stldownloaded: any[] = [];
    stluploaded: any[] = [];
    tipsgained: any[] = [];
    likesreceived: any[] = [];
    mostfloowers: any[] = [];

    sections: any[] = [];

    /**
     * Constructor
     *
     * @param {FuseTranslationLoaderService} _fuseTranslationLoaderService
     */
    constructor(
        private userService: UserService,
        private router: Router,
    )
    {
        // Set the defaults
        this.sections = [
            {id: 'ke', title: 'Kudos Earned', data: this.kudos, more: false},
            {id: 'sd', title: 'STLs Downloaded by Others', data: this.stldownloaded, more: false},
            {id: 'su', title: 'STLs Uploaded', data: this.stluploaded, more: false},
            {id: 'tg', title: 'Tips Gained', data: this.tipsgained, more: false},
            {id: 'lr', title: 'Likes Received', data: this.likesreceived, more: false},
            {id: 'mf', title: 'Most Followers', data: this.mostfloowers, more: false}
        ];

        this.getOverallData();
    }

    getOverallData() {
        this.userService.getLeaderboardOverall().subscribe((data) => {
            if (data && data['success'] == 1) {
                this.sections.forEach((element) => {
                    element.data = data.data[element.id];
                });
            }
        }, (error) => {
            //
        });
    }

    getLeaderboardData(sectionId: string) {
        this.userService.getLeaderboardData(sectionId).subscribe((data) => {
            if (data && data['success'] == 1) {
                this.sections.forEach((element) => {
                    if (element.id == sectionId) {
                        element.data = data.data;   
                        element.more = true;                     
                    }
                });
            }
        }, (error) => {
            //
        });
    }

    onViewMoreClicked(sectionId) {
        this.getLeaderboardData(sectionId);
    }

    onCollapseClicked(sectionId) {
        this.sections.forEach((element) => {
            if (element.id == sectionId) {
                element.data = element.data.slice(0, 3);
                element.more = false;                     
            }
        });
    }

    onUserClicked(user) {
        this.router.navigate(['profile_view', user._id]);
        return false;
    }

    getMemberCountry(user) {
        var ret = '';
        Const_countries.forEach((element) => {
            if (element.value == user.country) {
                ret = element.text;
            }
        });

        return ret;
    }

    getMemberFor(user) {
        let ret =  moment(user.createdAt).fromNow();
        ret = ret.substr(0, ret.length - 4);
        return 'Member for ' + ret;
    }

}
