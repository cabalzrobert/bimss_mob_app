import { IonContent, IonIcon, IonInput, IonItem, IonLabel, IonRippleEffect, IonSpinner } from '@ionic/react';
import React from 'react';
import Layout from '../../../../tools/components/+common/layout';
import TextFit from '../../../../tools/components/+common/text-fit';
import { isPassword, numberWithComma } from '../../../../tools/global';
import { classNames, Input, styles } from '../../../../tools/plugins/element';
import UserPager from '../../user-pager';
import { rest } from '../../../+app/+service/rest.service';
import { Alert } from '../../../../tools/components/+common/stack';
import { eye, eyeOff } from 'ionicons/icons';
import GameProfileView from './profile.game-profile.view';
import { app } from '../../../../tools/app';
import Recycler from '../../../../tools/components/+feature/recycler';
import RecyclerStorage from '../../../intro.page/recycler-storage';

const { Object }: any = window;

export default class ChangePasswordView extends React.Component {
    shouldComponentUpdate = () => false;
    render() {
        return (<>
            <Recycler storage={RecyclerStorage.instance} from={ViewHolder} />
        </>);
    }
}

export class ViewHolder extends React.Component {
    state: any = {};
    get pager() { return UserPager.instance.pager; }
    componentWillMount = () => this.willMount();
    input: any = {};
    msg: any = {};
    opts: any = {
        password1: { type: 'password', icon: eyeOff },
        password2: { type: 'password', icon: eyeOff },
        password3: { type: 'password', icon: eyeOff },
    };
    willMount = () => {
        const { opts } = this;
        const input = (this.input = {});
        const msg = (this.msg = {});
        this.setState({ opts, input, msg });
    }
    //
    hBackButton = () => {
        this.pager.back();
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

    hState = (ev: any, key: string) => {
        this.msg[key] = null;
        this.input[key] = ev.detail.value;
        this.setState({ msg: this.msg, input: this.input });
    }

    hHideShowPassword = (password: any) => {
        password.type = (password.type === 'text' ? 'password' : 'text');
        password.icon = (password.icon === eyeOff ? eye : eyeOff);
        this.setState({ opts: this.opts });
    }

    private performSubmit() {
        rest.post('password', this.input).subscribe(async (res: any) => {
            if (res.Status == 'ok') {
                return Alert.showSuccessMessage(res.Message, () => this.goToGameProfile());
            }
            Alert.showErrorMessage(res.Message);
        }, (err: any) => {
            Alert.showWarningMessage('Please try again');
        });
    }

    private isValidEntries(): boolean {
        var isValid = true;
        var oldpassword = this.input.OldPassword;
        if (!oldpassword) {
            this.msg.OldPassword = 'Please enter Old Password';
            isValid = false;
        }
        var password = this.input.Password;
        if (!password) {
            this.msg.Password = 'Please enter Password';
            isValid = false;
        } else if (!isPassword(password)) {
            this.msg.Password = 'Your password must include at least one uppercase and one lowercase letter, a number, and at least 6 or more characters';
            isValid = false;
        } else {
            var cpassword = this.input.ConfirmPassword;
            if (!cpassword) {
                this.msg.ConfirmPassword = 'Please enter Confirm Password';
                isValid = false;
            }
            if (password != cpassword) {
                this.msg.ConfirmPassword = 'Password and Confirm Password not match';
                isValid = false;
            }
        }
        if (oldpassword == password) {
            this.msg.Password = 'Your new password cannot be same as old password. Please enter a different password';
            isValid = false;
        }

        this.setState({ msg: this.msg, input: this.input });
        return isValid;
    }

    private goToGameProfile() {
        this.pager.backTo(GameProfileView);
    }

    render() {
        const { msg = {}, input = {}, opts = {} } = this.state;
        return (<>
            <Layout full>
                <Layout>
                    <div className="row m-0 toolbar-panel">
                        <div className="vertical arrow-back" onClick={this.hBackButton}></div>
                        <div className="col-4 p-0 vertical toolbar-parent" onClick={this.hBackButton}>Game Profile</div>
                        <div className="col-7 p-0 toolbar-title vertical"><div><TextFit text="Change Password" /></div></div>
                    </div>
                </Layout>
                <Layout auto>
                    <IonContent scrollY>
                        <div className='row m-0 bootstrap-form'> {/*,padding:10px 0px  style={styles('overflow-y:auto;height:100%')} */}
                            <div className='col-12 form-container' > {/*style={styles('padding:0px 35px')} */}
                                <form className={classNames('needs-validation', { 'form-invalid': !input.IsValid })} noValidate onSubmit={(ev) => ev.preventDefault()}>
                                    <div className={classNames({ 'input-invalid': !!msg.OldPassword })} style={styles('position:relative')} >
                                        <IonItem className='input-error' style={styles('--highlight-background:unset;--min-height:56.5px;margin-top:2.5px')}>
                                            <IonLabel position="floating" style={styles('font-weight:bold;margin-top:-7.5px')}>Old Password</IonLabel>
                                            <Input ion node={(handle) => <>
                                                <IonInput className="font-bold br-0" style={styles('--padding-end:40px')}
                                                    type={opts.password1.type}
                                                    value={input.OldPassword} {...handle({ onChange: (ev) => this.hState(ev, 'OldPassword') })} />
                                            </>} />

                                            <IonIcon className="password" item-end icon={opts.password1.icon} onClick={() => this.hHideShowPassword(opts.password1)} />
                                        </IonItem>
                                        <div className="invalid-tooltip">{msg.OldPassword}&nbsp;</div>
                                    </div>
                                    <div className={classNames({ 'input-invalid': !!msg.Password })} style={styles('position:relative')} >
                                        <IonItem className='input-error' style={styles('--highlight-background:unset;--min-height:56.5px;margin-top:2.5px')}>
                                            <IonLabel position="floating" style={styles('font-weight:bold;margin-top:-7.5px')}>New Password</IonLabel>
                                            <Input ion node={(handle) => <>
                                                <IonInput className="font-bold br-0" style={styles('--padding-end:40px')}
                                                    type={opts.password2.type}
                                                    value={input.Password} {...handle({ onChange: (ev) => this.hState(ev, 'Password') })} />
                                            </>} />

                                            <IonIcon className="password" item-end icon={opts.password2.icon} onClick={() => this.hHideShowPassword(opts.password2)} />
                                        </IonItem>
                                        <div className="invalid-tooltip">{msg.Password}&nbsp;</div>
                                    </div>
                                    <div className={classNames({ 'input-invalid': !!msg.ConfirmPassword })} style={styles('position:relative')} >
                                        <IonItem className='input-error' style={styles('--highlight-background:unset;--min-height:56.5px;margin-top:2.5px')}>
                                            <IonLabel position="floating" style={styles('font-weight:bold;margin-top:-7.5px')}>Verify Password</IonLabel>
                                            <Input ion node={(handle) => <>
                                                <IonInput className="font-bold br-0" style={styles('--padding-end:40px')}
                                                    type={opts.password3.type}
                                                    value={input.ConfirmPassword} {...handle({ onChange: (ev) => this.hState(ev, 'ConfirmPassword') })} />
                                            </>} />

                                            <IonIcon className="password" item-end icon={opts.password3.icon} onClick={() => this.hHideShowPassword(opts.password3)} />
                                        </IonItem>
                                        <div className="invalid-tooltip">{msg.ConfirmPassword}&nbsp;</div>
                                    </div>
                                    <div className="horizontal" style={styles('margin:10px 0px;height:auto')}>
                                        <button className="btn-green" style={styles('width:200px')} type="button" onClick={this.hConfirm}>APPLY</button>
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