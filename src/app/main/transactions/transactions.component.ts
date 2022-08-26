import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import * as moment from 'moment';
import { fuseAnimations } from '@fuse/animations';
import { AuthService } from 'app/shared/services/auth/auth.service';
import { TransactionService } from 'app/shared/services/transaction.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
    selector   : 'transactions',
    templateUrl: './transactions.component.html',
    styleUrls  : ['./transactions.component.scss'],
    animations   : fuseAnimations
})
export class TransactionsComponent
{
    
    transactions: any[] = [];
    currentSort: string;
    sortbys: any[];
    user: any;

    searchTerm: string = '';
    searchInput: FormControl;

    initializing = true;

    /**
     * Constructor
     *
     * @param {FuseTranslationLoaderService} _fuseTranslationLoaderService
     */
    constructor(
        private transactionService: TransactionService,
        private authService: AuthService,
        private router: Router,
    )
    {
        // Set the defaults
        this.currentSort = 'dn';

        this.sortbys = [
            {'value': 'dn', 'label': 'Date newest'},
            {'value': 'do', 'label': 'Date oldest'},
            {'value': 'ah', 'label': 'Amount Highest'},
            {'value': 'al', 'label': 'Amount Lowest'},
            {'value': 'df', 'label': 'Debits First'},
            {'value': 'cf', 'label': 'Credits First'},
        ];

        this.searchInput = new FormControl('');

        this.searchInput.valueChanges.pipe(
            debounceTime(500),
            distinctUntilChanged()
        ).subscribe(searchText => {
            //this.searchConfigService.setSearch(searchText);    
            if (searchText != undefined) {
                this.searchTerm = searchText;
                if (this.initializing && this.searchTerm === '') {
                    this.initializing = false;
                    return;
                }
                this.changedSortby();
            }
        });

        this.authService.isLoggedIn.subscribe((isLoggedIn) => {
            var tempuser = this.authService.getCurrentUser();
            if (tempuser)
            {
                this.user = JSON.parse(tempuser).user;

                this.changedSortby();
                
                this.transactionService.getBalance().subscribe((data) => {
                    if (data && data['success'] == 1) {
                        this.user.balance = data.data.balance;
                    }
                });
            }
        });
    }

    changedSortby()
    {
        this.transactionService.getBySenderAndReceiver(this.currentSort, this.searchTerm).subscribe((data) => {
            if (data && data['success'] == 1) {
                this.transactions = data['data'];
            }
            //
        }, (error) => {
            console.log('error in getting by sender and receiver');
        });
    }

    findWhere(transaction) {
        let prefix = '';
        if (this.user && this.user.id == transaction.sender._id) {
            prefix = 'Sent ' + transaction.amount + ' coins to ' + transaction.receiver.firstName + ' ' + transaction.receiver.lastName;
        }
        else {
            prefix = 'Received ' + transaction.amount + ' coins from ' + transaction.sender.firstName + ' ' + transaction.sender.lastName;
        }

        let where = '';
        if (transaction.type == 1) {
            where = 'for downloading item \'' + transaction.post.title + '\'';
        }
        else if (transaction.type == 2) {
            where = 'for tip';
        }

        return prefix + ' ' + where;
    }

    formatFromNow(value) {
        return moment(value).fromNow();
    }

    onAvatarClicked(transaction) {
        if (this.user && this.user.id == transaction.sender._id) {
            this.router.navigate(['profile_view', transaction.receiver._id]);
        } else {
            this.router.navigate(['profile_view', transaction.sender._id]);
        }
        return false;
    }

    onTransactionClicked(transaction) {
        if (transaction.type == 1) {
            this.router.navigate(['view_stl', transaction.post._id]);
        }
        else {
            this.onAvatarClicked(transaction);
        }
        return false;
    }

    onShowAllClicked() {
        this.searchInput.setValue('');
    }

    onGoClicked() {
        //
    }
}
