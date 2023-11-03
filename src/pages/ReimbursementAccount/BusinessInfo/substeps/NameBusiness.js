import React from 'react';
import {withOnyx} from 'react-native-onyx';
import {View} from 'react-native';
import useLocalize from '../../../../hooks/useLocalize';
import styles from '../../../../styles/styles';
import Text from '../../../../components/Text';
import TextInput from '../../../../components/TextInput';
import CONST from '../../../../CONST';
import Form from '../../../../components/Form';
import ONYXKEYS from '../../../../ONYXKEYS';
import subStepPropTypes from '../../subStepPropTypes';
import * as ValidationUtils from '../../../../libs/ValidationUtils';
import {reimbursementAccountPropTypes} from '../../reimbursementAccountPropTypes';
import * as BankAccounts from '../../../../libs/actions/BankAccounts';
import getDefaultStateForField from '../../utils/getDefaultStateForField';

const propTypes = {
    /** Reimbursement account from ONYX */
    reimbursementAccount: reimbursementAccountPropTypes.isRequired,

    ...subStepPropTypes,
};

const companyNameKey = CONST.BANK_ACCOUNT.BUSINESS_INFO_STEP.INPUT_KEY.COMPANY_NAME;

const validate = (values) => ValidationUtils.getFieldRequiredErrors(values, [companyNameKey]);

function NameBusiness({reimbursementAccount, onNext, isEditing}) {
    const {translate} = useLocalize();

    const defaultCompanyName = getDefaultStateForField({reimbursementAccount, fieldName: companyNameKey, defaultValue: ''});

    const bankAccountID = getDefaultStateForField({reimbursementAccount, fieldName: 'bankAccountID', defaultValue: 0});

    const shouldDisableCompanyName = Boolean(bankAccountID && defaultCompanyName);

    const handleSubmit = (values) => {
        BankAccounts.updateOnyxVBBAData({
            [companyNameKey]: values[companyNameKey],
        });

        onNext();
    };

    return (
        <Form
            formID={ONYXKEYS.REIMBURSEMENT_ACCOUNT}
            submitButtonText={isEditing ? translate('common.confirm') : translate('common.next')}
            validate={validate}
            onSubmit={handleSubmit}
            style={[styles.mh5, styles.flexGrow1]}
            submitButtonStyles={[styles.pb5, styles.mb0]}
        >
            <View>
                <Text style={styles.textHeadline}>{translate('businessInfoStep.enterTheNameOfYourBusiness')}</Text>
                <TextInput
                    label={translate('businessInfoStep.businessName')}
                    accessibilityLabel={translate('businessInfoStep.businessName')}
                    accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
                    inputID={companyNameKey}
                    containerStyles={[styles.mt4]}
                    disabled={shouldDisableCompanyName}
                    defaultValue={defaultCompanyName}
                    shouldSaveDraft
                    shouldUseDefaultValue={shouldDisableCompanyName}
                />
            </View>
        </Form>
    );
}

NameBusiness.propTypes = propTypes;
NameBusiness.displayName = 'NameBusiness';

export default withOnyx({
    reimbursementAccount: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
    },
})(NameBusiness);
