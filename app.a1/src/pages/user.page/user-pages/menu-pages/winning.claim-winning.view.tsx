import { IonContent, IonInput, IonItem, IonList, IonRefresher, IonRefresherContent, IonRippleEffect, IonSelect, IonSelectOption, IonSpinner } from '@ionic/react';
import React from 'react';
import styled from 'styled-components';
import Layout from '../../../../tools/components/+common/layout';
import NotFoundView from '../../../+app/component/common/not-found.view';
import FilteringView from '../../../+app/component/common/filtering.view';
import { mtCb, mtObj } from '../../../../tools/plugins/static';
import TextFit from '../../../../tools/components/+common/text-fit';
import { numberWithComma } from '../../../../tools/global';
import { classNames, Input, styles } from '../../../../tools/plugins/element';
import { timeout } from '../../../../tools/plugins/delay';
import UserPager from '../../user-pager';
import { rest } from '../../../+app/+service/rest.service';
import { toast } from '../../../../tools/plugins/toast';
import { Customer } from '../../../+app/main-module';
import { additionalWinningBalance, jUser, jUserModify } from '../../../+app/user-module';
import { Alert, Loading } from '../../../../tools/components/+common/stack';
import WebViewPopUp from '../../../+app/modal/web-view.popup';
import { app } from '../../../../tools/app';
import { OnPagerBack } from '../../../../tools/components/+feature/view-pager';
import Recycler from '../../../../tools/components/+feature/recycler';
import RecyclerStorage from '../../../intro.page/recycler-storage';

const { Object }: any = window;

export default class ClaimWinningView extends React.Component implements OnPagerBack {
    setClaimType = (ticket: any, data: any) => this.holder.setClaimType(ticket, data);
    onPagerBack = () => (this.holder.onPagerBack(), true);
    //
    shouldComponentUpdate = () => false;
    holder: ViewHolder = (null as any);
    render() {
        return (<>
            <Recycler storage={RecyclerStorage.instance} from={ViewHolder} bind={(ref) => this.holder = ref} />
        </>);
    }
}

export class ViewHolder extends React.Component {
    state: any = { u: {} };
    get pager() { return UserPager.instance.pager; }
    componentWillMount = () => this.willMount(false);
    prop: any = {};
    msg: any = {};
    input: any = {};
    filter: any = {};
    subs: any = {};
    opts: any = {}
    willMount = (didMount = true) => {
        const prop: any = (this.prop = { didMount: didMount });
        const input = (this.input = {});
        const msg = (this.msg = {});
        this.setState({ prop, input, msg });
        if (!didMount) return;
        this.subs.u = jUserModify(async () => this.setState({ u: await jUser() }));
    }
    didMount = () => { }
    willUnmount = () => {
        Object.values(this.subs).map((m: any) => m.unsubscribe());
    }

    shouldComponentUpdate = () => (!this.prop.willUnmount);
    onPagerBack() {
        this.prop.willUnmount = true;
    }

    private performLocalProcess() {
        var deductBalance = (+this.input.Amount * -1);
        additionalWinningBalance(deductBalance);
        //this.state.u.WinningBalance += deductBalance;
        this.page.WinningAmount += deductBalance;
    }

    hBackButton = () => {
        this.pager.back();
    }
    hState = (ev: any, key: string) => {
        this.msg[key] = null;
        this.input[key] = ev.detail.value;
        this.setState({ msg: this.msg, input: this.input });
    }

    public form: any = {};
    public ticket: any = {};
    private tmpTicket: any = {};
    public page: any = {};
    public setClaimType(ticket: any, data: any) {
        Object.rcopy(this.ticket, this.tmpTicket = ticket);
        Object.rcopy(this.prop, data);
        if (this.prop.isBankTransfer) {
            this.prop.RemittanceType = 'BTB';
            this.page.PageTitle = 'Bank Transfer';
        } else if (this.prop.isMoneyTransfer) {
            this.prop.RemittanceType = 'MRC';
            this.page.PageTitle = 'Money Transfer';
        } else if (this.prop.isCashDelivery) {
            this.prop.RemittanceType = 'CD';
            this.page.PageTitle = 'Cash Delivery';
            this.input.MobileNumber = this.state.u.MobileNumber;
        }
        this.setState({ page: this.page, prop: this.prop, ticket: this.ticket });
        this.loadRemmittances();
    }

    private async loadRemmittances() {
        const loading = await Loading.create({
            message: 'Please wait...',
            onDidBackdrop: () => {
                if (this.subs.s1)
                    this.subs.s1.unsubscribe();
                this.pager.back();
                return true;
            },
        });
        await loading.present();
        this.subs.s1 = rest.post('remittances', this.input).subscribe(async (res: any) => {
            if (res.Status != 'error') {
                this.opts.Remmittances = res.filter((f: any) => f.Type === this.prop.RemittanceType);
                var first = (this.opts.Remmittances[0] || null);
                if (first) this.input.Remittance = first.Code;
                loading.dismiss();
                this.setState({ opts: this.opts });
                return;
            }
            Alert.showErrorMessage(res.Message);
            loading.dismiss();
        }, (err: any) => {
            toast('Unable to load remittances');
            loading.dismiss();
            this.pager.back();
        });
        await loading.onDidDismiss();
    }



    hConfirm = () => {
        if (!this.isValidEntries()) return;
        Alert.swal({
            title: 'Confirmation',
            text: 'Are you sure you want to Continue?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Confirm!', //'Yes, delete it!',
            cancelButtonText: 'Cancel', //'No, keep it',
            allowOutsideClick: false,
            backdropDismiss: false,
            confirmButtonColor: "#218838",
            cancelButtonColor: "#c82333",
            reverseButtons: true,
        }, (res: any) => {
            if (res.isConfirmed) {
                Alert.showProgressRequest();
                return setTimeout(() => this.performSubmit(), 750);
            }
        });
    }

    private performSubmit() {
        rest.post('winning/claiming', this.form).subscribe(async (res: any) => {
            if (res.Status == 'ok') {
                this.performLocalProcess();
                return Alert.showSuccessMessage(res.Message, () => this.pager.back(this.tmpTicket));
            }
            Alert.showErrorMessage(res.Message);
        }, (err: any) => {
            Alert.showWarningMessage('Please try again');
        });
    }
    private isValidEntries(): boolean {
        var isValid = true;

        if (!this.input.Remittance) {
            this.msg.Remittance = 'Please select transfer service';
            isValid = false;
        }

        if (this.prop.isBankTransfer) {
            if (!this.input.AccountName) {
                this.msg.AccountName = 'Please enter account name';
                isValid = false;
            }
            if (!this.input.AccountNo) {
                this.msg.AccountNo = 'Please enter valid account number';
                isValid = false;
            }
        } else if (this.prop.isMoneyTransfer || this.prop.isCashDelivery) {
            if (!this.input.Fullname) {
                this.msg.Fullname = 'Please enter receiver name';
                isValid = false;
            }
            if (!this.input.MobileNumber) {
                this.msg.MobileNumber = 'Please enter valid mobile number';
                isValid = false;
            }

            if (this.prop.isCashDelivery) {
                if (!this.input.Address) {
                    this.msg.Address = 'Please enter complete address';
                    isValid = false;
                }
            }

        }

        if (isValid) {
            this.form.Type = this.prop.RemittanceType;
            this.form.Remittance = this.input.Remittance;
            this.form.Amount = this.ticket.TotalWinAmount;
            this.form.ReferenceID = this.ticket.TransactionNo;
            if (this.prop.isBankTransfer)
                this.form.Bank = this.input;
            else if (this.prop.isMoneyTransfer || this.prop.isCashDelivery)
                this.form.Receiver = this.input;
        }
        this.input.IsValid = isValid;
        this.setState({ msg: this.msg, input: this.input });
        return isValid;
    }

    hReminder = async () => {
        const modal = await WebViewPopUp.modal('./assets/html/reminder.htm');
        await modal.present();
    }

    render() {
        const { filter = {}, prop = {}, opts = {} } = this.state;
        const { page = {}, ticket = {} } = this.state;
        const { msg = {}, input = {} } = this.state;
        return (<>
            <Layout full>
                <Layout>
                    <div className="row m-0 toolbar-panel">
                        <div className="vertical arrow-back" onClick={this.hBackButton}></div>
                        <div className="col-4 p-0 vertical toolbar-parent" onClick={this.hBackButton}>Winnings</div>
                        <div className="col-7 p-0 toolbar-title vertical"><div><TextFit text={('Claim - ' + page.PageTitle)} /></div></div>
                    </div>
                </Layout>
                <Layout auto>
                    <IonContent scrollY>
                        <div className="row m-0 bootstrap-form">
                            <div className='col-12 form-container' style={styles('padding-top:10px')}>
                                <form className={classNames('needs-validation', { 'form-invalid': !input.IsValid })} style={styles('color:#fefed1')} noValidate>
                                    <div style={styles('font-size:12px;font-weight:bold')}>Please select Transfer Services</div>
                                    <div className={classNames({ 'input-invalid': !!msg.Remittance })} style={styles('position:relative')} >
                                        <IonItem lines="none" className='input-error' style={styles('--min-height: 40px;')}>
                                            <IonInput hidden></IonInput>
                                            <Input ion="popup" node={(handle) => <>
                                                <IonSelect interface="action-sheet" cancelText="Dismiss" style={styles('width: 100%')}
                                                    value={input.Remittance} {...handle({ onChange: (ev) => this.hState(ev, 'Remittance') })}>
                                                    {opts.Remmittances?.map((opt: any) => <>
                                                        <IonSelectOption value={opt.Code}>{opt.Description}</IonSelectOption>
                                                    </>)}
                                                </IonSelect>
                                            </>} />

                                        </IonItem>
                                        <div className="invalid-tooltip">{msg.Remittance}</div>
                                    </div>
                                    <div className="horizontal" style={styles('height:auto;padding-top:20px')}>
                                        <div className="vertical" style={styles('padding-right:7.5px')}>
                                            <img src="./assets/svg/icon_peso_coin.svg" style={styles('height:40px')} />
                                        </div>
                                        <div style={styles('height:auto')}>
                                            <div style={styles('font-size:85%')}>Winning Amount</div>
                                            <div style={styles('font-size:120%;margin-top:-7.5px')}><b>{numberWithComma(ticket.TotalWinAmount)}</b></div>
                                        </div>
                                    </div>
                                    {!prop.isBankTransfer ? null : <>
                                        <div className="horizontal" style={styles('margin-top:5px;height:auto')}>
                                            <button type="button" className="btn-red" style={styles('width:175px;padding:2px;font-size:11px')} onClick={this.hReminder}>Important Reminder</button>
                                        </div>
                                    </>}
                                    <div style={styles('position:relative;margin-top:10px')}>
                                        {!prop.isBankTransfer ? null : <>
                                            <div className={classNames({ 'input-invalid': !!msg.AccountName })} style={styles('position:relative;padding:2.5px 0px')}>
                                                <IonItem lines="none" className='input-error' style={styles('--min-height: 40px')}>
                                                    <Input ion node={(handle) => <>
                                                        <IonInput className="text-center font-bold br-0" style={styles('--padding-bottom:0px;--padding-top:0px')}
                                                            type="text" placeholder="Account Name"
                                                            value={input.AccountName} {...handle({ onChange: (ev) => this.hState(ev, 'AccountName') })} />
                                                    </>} />

                                                </IonItem>
                                                <div className="invalid-tooltip">{msg.AccountName}</div>
                                            </div>
                                            <div className={classNames({ 'input-invalid': !!msg.AccountNo })} style={styles('position:relative;padding:2.5px 0px')}>
                                                <IonItem lines="none" className='input-error' style={styles('--min-height: 40px')}>
                                                    <Input ion node={(handle) => <>
                                                        <IonInput className="text-center font-bold br-0" style={styles('--padding-bottom:0px;--padding-top:0px')}
                                                            type="text" placeholder="Account Number"
                                                            value={input.AccountNo} {...handle({ onChange: (ev) => this.hState(ev, 'AccountNo') })} />
                                                    </>} />

                                                </IonItem>
                                                <div className="invalid-tooltip">{msg.AccountNo}</div>
                                            </div>
                                        </>}
                                        {!(prop.isCashDelivery || prop.isMoneyTransfer) ? null : <>
                                            <div className={classNames({ 'input-invalid': !!msg.Fullname })} style={styles('position:relative;padding:2.5px 0px')}>
                                                <IonItem lines="none" className='input-error' style={styles('--min-height: 40px')}>
                                                    <Input ion node={(handle) => <>
                                                        <IonInput className="text-center font-bold br-0" style={styles('--padding-bottom:0px;--padding-top:0px')}
                                                            type="text" placeholder="Fullname"
                                                            value={input.Fullname} {...handle({ onChange: (ev) => this.hState(ev, 'Fullname') })} />
                                                    </>} />

                                                </IonItem>
                                                <div className="invalid-tooltip">{msg.Fullname}</div>
                                            </div>
                                            <div className={classNames({ 'input-invalid': !!msg.MobileNumber })} style={styles('position:relative;padding:2.5px 0px')}>
                                                <IonItem lines="none" className='input-error' style={styles('--min-height: 40px')}>
                                                    <Input ion node={(handle) => <>
                                                        <IonInput className="text-center font-bold br-0" style={styles('--padding-bottom:0px;--padding-top:0px')}
                                                            type="text" placeholder="Mobile Number"
                                                            value={input.MobileNumber} {...handle({ onChange: (ev) => this.hState(ev, 'MobileNumber') })} />
                                                    </>} />

                                                </IonItem>
                                                <div className="invalid-tooltip">{msg.AccountNo}</div>
                                            </div>
                                            {!(prop.isCashDelivery) ? null : <>
                                                <div className={classNames({ 'input-invalid': !!msg.Address })} style={styles('position:relative;padding:2.5px 0px')}>
                                                    <IonItem lines="none" className='input-error' style={styles('--min-height: 40px')}>
                                                        <Input ion node={(handle) => <>
                                                            <IonInput className="text-center font-bold br-0" style={styles('--padding-bottom:0px;--padding-top:0px')}
                                                                type="text" placeholder="Address"
                                                                value={input.Address} {...handle({ onChange: (ev) => this.hState(ev, 'Address') })} />
                                                        </>} />

                                                    </IonItem>
                                                    <div className="invalid-tooltip">{msg.Address}</div>
                                                </div>
                                            </>}
                                        </>}
                                    </div>
                                    <div className="horizontal" style={styles('margin-top:5px;height:auto')}>
                                        <div className='col-10' style={styles('padding:0px 5px')}>
                                            <div className="btn-green horizontal" style={styles('height:45px')} onClick={this.hConfirm}>
                                                <div className='vertical title-sm'>CONFIRM ENCASHMENT</div>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </IonContent>
                </Layout>
            </Layout>
        </>);
    }
}