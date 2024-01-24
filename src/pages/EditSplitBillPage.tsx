import type {RouteProp} from '@react-navigation/native';
import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as ReportUtils from '@libs/ReportUtils';
import * as IOU from '@userActions/IOU';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Report, ReportActions, Transaction} from '@src/types/onyx';
import type {OriginalMessageIOU} from '@src/types/onyx/OriginalMessage';
import EditRequestAmountPage from './EditRequestAmountPage';
import EditRequestCategoryPage from './EditRequestCategoryPage';
import EditRequestCreatedPage from './EditRequestCreatedPage';
import EditRequestDescriptionPage from './EditRequestDescriptionPage';
import EditRequestMerchantPage from './EditRequestMerchantPage';
import EditRequestTagPage from './EditRequestTagPage';

type EditSplitBillOnyxProps = {
    /** The report currently being used */
    report: OnyxEntry<Report>;

    /** The report action for currently used report */
    // Used in withOnyx
    // eslint-disable-next-line react/no-unused-prop-types
    reportActions: OnyxEntry<ReportActions>;

    /** The current transaction */
    transaction: OnyxEntry<Transaction>;

    /** The draft transaction that holds data to be persisted on the current transaction */
    draftTransaction: OnyxEntry<Transaction>;
};

type EditSplitBillProps = EditSplitBillOnyxProps & {
    route: RouteProp<{params: {field: string; reportID: string; reportActionID: string}}>;
};

function EditSplitBillPage({route, transaction, draftTransaction, report}: EditSplitBillProps) {
    const fieldToEdit = route.params.field;
    const reportID = route.params.reportID;
    const reportActionID = route.params.reportActionID;

    const draftTransactionDetails = ReportUtils.getTransactionDetails(draftTransaction);
    const transactionDetails = ReportUtils.getTransactionDetails(transaction);
    const transactionAmount = draftTransactionDetails ? draftTransactionDetails.amount : transactionDetails?.amount;
    const transactionCurrency = draftTransactionDetails ? draftTransactionDetails.currency : transactionDetails?.currency;
    const transactionDescription = draftTransactionDetails ? draftTransactionDetails.comment : transactionDetails?.comment;
    const transactionMerchant = draftTransactionDetails ? draftTransactionDetails.merchant : transactionDetails?.merchant;
    const transactionCreated = draftTransactionDetails ? draftTransactionDetails.created : transactionDetails?.created;
    const transactionCategory = draftTransactionDetails ? draftTransactionDetails.category : transactionDetails?.category;
    const transactionTag = draftTransactionDetails ? draftTransactionDetails.tag : transactionDetails?.tag;

    const defaultCurrency = transactionCurrency;

    function navigateBackToSplitDetails() {
        Navigation.navigate(ROUTES.SPLIT_BILL_DETAILS.getRoute(reportID, reportActionID));
    }

    // eslint-disable-next-line @typescript-eslint/ban-types
    const setDraftSplitTransaction = (transactionChanges: Object) => {
        if (transaction) {
            IOU.setDraftSplitTransaction(transaction.transactionID, transactionChanges);
        }
        navigateBackToSplitDetails();
    };

    if (fieldToEdit === CONST.EDIT_REQUEST_FIELD.DESCRIPTION) {
        return (
            <EditRequestDescriptionPage
                defaultDescription={transactionDescription ?? ''}
                onSubmit={(transactionChanges) => {
                    setDraftSplitTransaction({
                        comment: transactionChanges.comment.trim(),
                    });
                }}
            />
        );
    }

    if (fieldToEdit === CONST.EDIT_REQUEST_FIELD.DATE) {
        return (
            <EditRequestCreatedPage
                defaultCreated={transactionCreated ?? ''}
                onSubmit={setDraftSplitTransaction}
            />
        );
    }

    if (fieldToEdit === CONST.EDIT_REQUEST_FIELD.AMOUNT) {
        return (
            <EditRequestAmountPage
                defaultAmount={transactionAmount ?? 0}
                defaultCurrency={defaultCurrency ?? ''}
                onSubmit={(transactionChanges) => {
                    const amount = CurrencyUtils.convertToBackendAmount(Number.parseFloat(transactionChanges.amount));

                    setDraftSplitTransaction({
                        amount,
                        currency: transactionChanges.currency,
                    });
                }}
                onNavigateToCurrency={() => {
                    const activeRoute = encodeURIComponent(Navigation.getActiveRouteWithoutParams());
                    if (reportID && transactionAmount && defaultCurrency) {
                        Navigation.navigate(ROUTES.EDIT_SPLIT_BILL_CURRENCY.getRoute(reportID, reportActionID, defaultCurrency, activeRoute));
                    }
                }}
            />
        );
    }

    if (fieldToEdit === CONST.EDIT_REQUEST_FIELD.MERCHANT) {
        return (
            <EditRequestMerchantPage
                defaultMerchant={transactionMerchant ?? ''}
                onSubmit={(transactionChanges) => {
                    setDraftSplitTransaction({merchant: transactionChanges.merchant.trim()});
                }}
                isPolicyExpenseChat={false}
            />
        );
    }

    if (fieldToEdit === CONST.EDIT_REQUEST_FIELD.CATEGORY) {
        return (
            <EditRequestCategoryPage
                defaultCategory={transactionCategory ?? ''}
                policyID={report?.policyID ? report.policyID : ''}
                onSubmit={(transactionChanges) => {
                    setDraftSplitTransaction({category: transactionChanges.category.trim()});
                }}
            />
        );
    }

    if (fieldToEdit === CONST.EDIT_REQUEST_FIELD.TAG && transactionTag) {
        return (
            <EditRequestTagPage
                defaultTag={transactionTag}
                policyID={report?.policyID ? report.policyID : ''}
                onSubmit={(transactionChanges) => {
                    setDraftSplitTransaction({tag: transactionChanges.tag.trim()});
                }}
                tagName=""
            />
        );
    }

    return <FullPageNotFoundView shouldShow />;
}

EditSplitBillPage.displayName = 'EditSplitBillPage';

export default withOnyx<EditSplitBillProps, EditSplitBillOnyxProps>({
    report: {
        key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT}${route.params.reportID}`,
    },
    reportActions: {
        key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${route.params.reportID}`,
        canEvict: false,
    },
    transaction: {
        key: ({route, reportActions}: Partial<EditSplitBillProps>) => {
            const reportAction = reportActions?.[`${route?.params.reportActionID.toString()}`];
            const transactionID = (reportAction as OriginalMessageIOU)?.originalMessage.IOUTransactionID ? (reportAction as OriginalMessageIOU).originalMessage.IOUTransactionID : 0;
            return `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`;
        },
    },
    draftTransaction: {
        key: ({route, reportActions}: Partial<EditSplitBillProps>) => {
            const reportAction = reportActions?.[`${route?.params.reportActionID.toString()}`];
            const transactionID = (reportAction as OriginalMessageIOU)?.originalMessage.IOUTransactionID ? (reportAction as OriginalMessageIOU).originalMessage.IOUTransactionID : 0;
            return `${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${transactionID}`;
        },
    },
})(EditSplitBillPage);
