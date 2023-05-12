import { IonIcon, IonInput, IonItem, IonLabel } from '@ionic/react';
import { eye, eyeOff } from 'ionicons/icons';
import React from 'react';
import styled from 'styled-components';
import { rest } from '../+service/rest.service';
import { app, OnDidBackdrop } from '../../../tools/app';
import { isPassword } from '../../../tools/global';
import Stack, { Alert, Modal } from '../../../tools/components/+common/stack';

import { jUser, jUserModify } from '../user-module';
import { classNames, Input, styles } from '../../../tools/plugins/element';

export default class ChangePasswordPopUp extends React.Component<{ modal: Function }> implements OnDidBackdrop {
    state: any = { u: {} }
    componentWillMount = () => {
        app.component(this);
        const { opts } = this;
        this.subs.u = jUserModify(async () => this.setState({ u: await jUser() }));
        this.setState({ opts });
    }

    dismiss = () => this.props.modal().dismiss();
    hClose = () => this.dismiss();

    subs: any = {};
    msg: any = {};
    input: any = {};
    opts: any = {
        password1: { type: 'password', icon: eyeOff },
        password2: { type: 'password', icon: eyeOff },
        password3: { type: 'password', icon: eyeOff },
    };
    componentDidMount = () => { }
    componentWillUnmount = () => {
        Object.values(this.subs).map((m: any) => m.unsubscribe());
    }

    onDidBackdrop() {
        this.dismiss();
        return false;
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
        rest.post('password', this.input).subscribe(async (res: any) => {
            if (res.Status == 'ok') {
                return Alert.showSuccessMessage(res.Message, () => this.hClose());
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

        this.setState({ msg: this.msg, input: this.input });
        return isValid;
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

    render() {
        const { msg = {}, input = {}, opts = {} } = this.state;
        return (<>
            <div className="modal-container">
                <div style={styles('padding-top:5px')}>
                    <div className="row m-0 header">
                        <div className="col-10">Change Password</div>
                        <div className="col-2 p-0 btn-close" style={styles('text-align:right;right:5px')} onClick={this.hClose}></div>
                    </div>
                    <div className='row m-0 form-classic bootstrap-form' style={styles('overflow-y:auto;height:100%')}> {/*,padding:10px 0px*/}
                        <div className='col-12 form-container' > {/*style={styles('padding:0px 35px')} */}
                            <form className={classNames('needs-validation', { 'form-invalid': !input.IsValid })} noValidate onSubmit={(ev) => ev.preventDefault()}>
                                <div className={classNames({ 'input-invalid': !!msg.OldPassword })} style={styles('position:relative')} >
                                    <IonItem className='input-error' style={styles('--highlight-background:unset;--min-height:40px;margin-top:2.5px')}>
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
                                    <IonItem className='input-error' style={styles('--highlight-background:unset;--min-height:40px;margin-top:2.5px')}>
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
                                    <IonItem className='input-error' style={styles('--highlight-background:unset;--min-height:40px;margin-top:2.5px')}>
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
                </div>
            </div>
        </>);
    }

    static modal = async () => {
        var modal: any;
        var stack = await Stack.push(<>
            <Modal className="modal-adjustment" ref={(ref) => modal = ref} content={<ChangePasswordPopUp modal={() => modal} />} />
        </>);
        setTimeout(async () => (await modal.onDidDismiss(), stack.pop()));
        return modal;
    }
}