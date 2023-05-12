import { IonContent, IonDatetime, IonInput, IonItem, IonLabel, IonRippleEffect, IonTextarea } from '@ionic/react';
import React from 'react';
import Layout from '../../../../tools/components/+common/layout';
import TextFit from '../../../../tools/components/+common/text-fit';
import { isAlpha, isEmail, numberWithComma } from '../../../../tools/global';
import { classNames, Input, styles } from '../../../../tools/plugins/element';
import UserPager from '../../user-pager';
import { rest } from '../../../+app/+service/rest.service';
import ChangeAvatarView from './profile.change-avatar.view';
import ChangePasswordView from './profile.change-password.view';
import { jUser, jUserModify } from '../../../+app/user-module';
import { Alert } from '../../../../tools/components/+common/stack';
import moment from 'moment';
import { app } from '../../../../tools/app';
import { OnPagerBack } from '../../../../tools/components/+feature/view-pager';
import Recycler from '../../../../tools/components/+feature/recycler';
import RecyclerStorage from '../../../intro.page/recycler-storage';

const { Object }: any = window;

export default class GameProfileView extends React.Component implements OnPagerBack {
    onPagerBack = () => (this.holder.onPagerBack(), true);
    //
    shouldComponentUpdate = () => false;
    holder: ViewHolder = (null as any);
    render() {
        return (<>
            <Recycler storage={RecyclerStorage.instance} from={ViewHolder} bind={(ref: any) => this.holder = ref} />
        </>);
    }
}

export class ViewHolder extends React.Component {
    state: any = { u: {} };
    get pager() { return UserPager.instance.pager; }
    componentWillMount = () => this.willMount(false);
    prop: any = {};
    input: any = {};
    msg: any = {};
    opts: any = {
        dtConfig: { MinYear: '1970', MaxYear: '1970' },
    };
    subs: any = {};
    willMount = (didMount = true) => {
        const { opts } = this;
        const { dtConfig } = opts;
        const prop: any = (this.prop = { didMount: didMount });
        const input = (this.input = {});
        const msg = (this.msg = {});
        //
        const today = new Date();
        dtConfig.MaxYear = today.getFullYear();
        this.setState({ prop, input, msg, opts });
        if (!didMount) return;
        this.subs.u = jUserModify(async () => {
            const u = await jUser();
            Object.rcopy(input, {
                Firstname: u.Firstname,
                Lastname: u.Lastname,
                DisplayName: u.DisplayName,
                BirthDate: u.BirthDate,
                Address: u.Address,
                PresentAddress: u.PresentAddress,
                MobileNumber: u.MobileNumber,
                EmailAddress: u.EmailAddress,
            });
            this.setState({ u, input });
        });
    }
    didMount = () => { }
    willUnmount = () => {
        Object.values(this.subs).map((m: any) => m.unsubscribe());
    }
    //
    shouldComponentUpdate = () => (!this.prop.willUnmount);
    onPagerBack() {
        this.prop.willUnmount = true;
    }

    private async performSaveLocal() {
        const { input } = this;
        await jUser({
            Firstname: input.Firstname,
            Lastname: input.Lastname,
            Fullname: input.Fullname,
            DisplayName: input.DisplayName,
            BirthDate: input.BirthDate,
            Address: input.Address,
            PresentAddress: input.PresentAddress,
            MobileNumber: input.MobileNumber,
            EmailAddress: input.EmailAddress,
        }, true);
    }

    hBackButton = () => {
        this.pager.back();
    }
    hChangeAvatar = () => {
        this.pager.next(ChangeAvatarView);
    }
    hChangePassword = () => {
        this.pager.next(ChangePasswordView);
    }

    hConfirm = () => {
        if (!this.isValidEntries()) return;
        Alert.swal({
            title: 'Confirmation',
            text: 'Are you sure you want to Save?',
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

    hState = (ev: any, key: string) => {
        this.msg[key] = null;
        this.input[key] = ev.detail.value;
        this.setState({ msg: this.msg, input: this.input });
    }

    private performSubmit() {
        rest.post('profile', this.input).subscribe(async (res: any) => {
            if (res.Status == 'ok') {
                await this.performSaveLocal();
                return Alert.showSuccessMessage(res.Message);
            }
            Alert.showErrorMessage(res.Message);
        }, (err: any) => {
            Alert.showWarningMessage('Please try again');
        });
    }

    private isValidEntries(): boolean {
        var isValid = true;

        var firstname = (this.input.Firstname || '').trim();
        if (!firstname) {
            this.msg.Firstname = 'Please enter First Name';
            isValid = false;
        } else if (!isAlpha(firstname)) { //lastname
            this.msg.Firstname = 'First Name should contain only letters';
            isValid = false;
        }
        var lastname = (this.input.Lastname || '').trim();
        if (!lastname) {
            this.msg.Lastname = 'Please enter Last Name';
            isValid = false;
        } else if (!isAlpha(lastname)) { //lastname
            this.msg.Lastname = 'Last Name should contain only letters';
            isValid = false;
        }
        var birthDate = (this.input.BirthDate || '').trim();
        if (!!birthDate) {
            birthDate = moment(birthDate).format('MMM DD, YYYY');
        }
        this.input.BirthDate = birthDate;
        /*var lastname = (this.input.LastName||'').Trim();
        if(!lastname){
            this.msg.LastName = 'Please enter Last Name';
            isValid = false;
        }*/
        //var Address = this.input.Address;
        //var EmailAddress = this.input.EmailAddress;
        if (!!this.input.EmailAddress) {
            if (!isEmail(this.input.EmailAddress)) {
                this.msg.EmailAddress = 'Please enter valid Email Address';
                isValid = false;
            }
        }

        if (isValid) {
            this.input.Fullname = (this.input.Firstname + ' ' + this.input.Lastname).trim();
            if (!this.input.DisplayName)
                this.input.DisplayName = this.input.Fullname;
        }
        this.input.IsValid = isValid;
        this.setState({ msg: this.msg, input: this.input });
        //console.log(this.input);
        return isValid;
    }

    render() {
        const { input = {}, msg = {}, opts: { dtConfig } } = this.state;
        return (<>
            <Layout full>
                <Layout>
                    <div className="row m-0 toolbar-panel">
                        <div className="vertical arrow-back" onClick={this.hBackButton}></div>
                        <div className="col-4 p-0 vertical toolbar-parent" onClick={this.hBackButton}>Game Profile</div>
                        <div className="col-7 p-0 toolbar-title vertical"><div><TextFit text="Game Profile" /></div></div>
                    </div>
                </Layout>
                <div className="list">
                    <div className="list-item bg arrow" onClick={this.hChangeAvatar} >
                        <div className="row m-0 details ion-activatable">
                            <IonRippleEffect />
                            <div className="col-1"></div>
                            <div className="col-10 vertical title">Change Avatar</div>
                        </div>
                    </div>
                    <div className="list-item bg arrow" onClick={this.hChangePassword} >
                        <div className="row m-0 details ion-activatable">
                            <IonRippleEffect />
                            <div className="col-1"></div>
                            <div className="col-9 vertical title">Change Password</div>
                        </div>
                    </div>
                </div>
                <Layout auto>
                    <IonContent scrollY>
                        <div className="row m-0 bootstrap-form">
                            <div className="col-12 form-container">
                                <form className={classNames('needs-validation', { 'form-invalid': !input.IsValid })} noValidate onSubmit={(ev) => ev.preventDefault()}>
                                    <div className={classNames({ 'input-invalid': !!msg.Firstname })} style={styles('position:relative')}>
                                        <IonItem className='input-error' style={styles('--highlight-background:unset;--min-height:56.5px;margin-top:2.5px')}>
                                            <IonLabel position="floating" style={styles('font-weight:bold;margin-top:-7.5px')}>First Name</IonLabel>
                                            <Input ion node={(handle) => <>
                                                <IonInput className="font-bold br-0"
                                                    type="text"
                                                    value={input.Firstname} {...handle({ onChange: (ev) => this.hState(ev, 'Firstname') })} />
                                            </>} />

                                        </IonItem>
                                        <div className="invalid-tooltip">{msg.Firstname}</div>
                                    </div>
                                    <div className={classNames({ 'input-invalid': !!msg.Lastname })} style={styles('position:relative')}>
                                        <IonItem className='input-error' style={styles('--highlight-background:unset;--min-height:56.5px;margin-top:2.5px')}>
                                            <IonLabel position="floating" style={styles('font-weight:bold;margin-top:-7.5px')}>Last Name</IonLabel>
                                            <Input ion node={(handle) => <>
                                                <IonInput className="font-bold br-0"
                                                    type="text"
                                                    value={input.Lastname} {...handle({ onChange: (ev) => this.hState(ev, 'Lastname') })} />
                                            </>} />

                                        </IonItem>
                                        <div className="invalid-tooltip">{msg.Lastname}</div>
                                    </div>
                                    <div className={classNames({ 'input-invalid': !!msg.DisplayName })} style={styles('position:relative')}>
                                        <IonItem className='input-error' style={styles('--highlight-background:unset;--min-height:56.5px;margin-top:2.5px')}>
                                            <IonLabel position="floating" style={styles('font-weight:bold;margin-top:-7.5px')}>Display Name</IonLabel>
                                            <Input ion node={(handle) => <>
                                                <IonInput className="font-bold br-0"
                                                    type="text"
                                                    value={input.DisplayName} {...handle({ onChange: (ev) => this.hState(ev, 'DisplayName') })} />
                                            </>} />

                                        </IonItem>
                                        <div className="invalid-tooltip">{msg.DisplayName}</div>
                                    </div>
                                    <div className={classNames({ 'input-invalid': !!msg.BirthDate })} style={styles('position:relative')}>
                                        <IonItem className='input-error' style={styles('--highlight-background:unset;--min-height:56.5px;margin-top:2.5px')}>
                                            <IonLabel position="floating" style={styles('font-weight:bold;margin-top:-7.5px')}>Birth Date</IonLabel>
                                            <IonInput hidden />
                                            <Input ion node={(handle) => <>
                                                <IonDatetime pickerFormat="MMMM DD YYYY" displayFormat="MMM DD, YYYY" style={styles('--padding-bottom:5px')}
                                                    min={dtConfig.MinYear} max={dtConfig.MaxYear}
                                                    value={input.BirthDate} {...handle({ onChange: (ev) => this.hState(ev, 'BirthDate') })} />
                                            </>} />

                                        </IonItem>
                                        <div className="invalid-tooltip">{msg.BirthDate}</div>
                                    </div>
                                    <div className={classNames({ 'input-invalid': !!msg.PresentAddress })} style={styles('position:relative')}>
                                        <IonItem className='input-error' style={styles('--highlight-background:unset;--min-height:56.5px;margin-top:2.5px')}>
                                            <IonLabel position="floating" style={styles('font-weight:bold;margin-top:-7.5px')}>Current Address</IonLabel>
                                            <Input ion node={(handle) => <>
                                                <IonTextarea rows={2} className="font-bold br-0"
                                                    value={input.PresentAddress} {...handle({ onChange: (ev) => this.hState(ev, 'PresentAddress') })} />
                                            </>} />

                                        </IonItem>
                                        <div className="invalid-tooltip">{msg.PresentAddress}</div>
                                    </div>
                                    <div className={classNames({ 'input-invalid': !!msg.MobileNumber })} style={styles('position:relative')}>
                                        <IonItem className='input-error' style={styles('--highlight-background:unset;--min-height:56.5px;margin-top:2.5px')}>
                                            <IonLabel position="floating" style={styles('font-weight:bold;margin-top:-7.5px')}>Mobile Number</IonLabel>
                                            <Input ion node={(handle) => <>
                                                <IonInput className="font-bold br-0"
                                                    type="text" readonly
                                                    value={input.MobileNumber} {...handle({ onChange: (ev) => this.hState(ev, 'MobileNumber') })} />
                                            </>} />

                                        </IonItem>
                                        <div className="invalid-tooltip">{msg.MobileNumber}</div>
                                    </div>
                                    <div className={classNames({ 'input-invalid': !!msg.EmailAddress })} style={styles('position:relative')}>
                                        <IonItem className='input-error' style={styles('--highlight-background:unset;--min-height:56.5px;margin-top:2.5px')}>
                                            <IonLabel position="floating" style={styles('font-weight:bold;margin-top:-7.5px')}>Email Address <span style={styles('font-size:85%')}>(Optional)</span></IonLabel>
                                            <Input ion node={(handle) => <>
                                                <IonInput className="font-bold br-0"
                                                    type="text"
                                                    value={input.EmailAddress} {...handle({ onChange: (ev) => this.hState(ev, 'EmailAddress') })} />
                                            </>} />

                                        </IonItem>
                                        <div className="invalid-tooltip">{msg.EmailAddress}</div>
                                    </div>
                                </form>
                                <div className="col-12" style={styles('margin-top:20px')}>
                                    <div className="horizontal" style={styles('height:auto')}>
                                        <div className="btn-green" style={styles('width:200px')} onClick={this.hConfirm}>APPLY</div>
                                    </div>
                                    <div>&nbsp;</div>
                                </div>
                            </div>
                        </div>
                    </IonContent>
                </Layout>
            </Layout>
        </>);
    }
}