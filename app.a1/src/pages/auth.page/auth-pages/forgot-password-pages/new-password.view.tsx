import { IonIcon, IonInput, IonItem, } from '@ionic/react';
import React from 'react';
import { NavContext } from '@ionic/react';
import { Alert } from '../../../../tools/components/+common/stack';
import { classNames, Input, styles } from '../../../../tools/plugins/element';
import { rest } from '../../../+app/+service/rest.service';
import AuthPager from '../../auth-pager';
import { eye, eyeOff } from 'ionicons/icons';
import SignInView from '../sign-in.view';
import { isPassword } from '../../../../tools/global';
import Recycler from '../../../../tools/components/+feature/recycler';
import RecyclerStorage from '../../../intro.page/recycler-storage';

//const{ Object }:any = window;
const { Object, data = {} } = (window as any);
const { locations } = data;
const { Group } = data;

export default class NewPasswordView extends React.Component {
    setInput = (input: any): NewPasswordView => (this.holder.setInput(input), this);
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
    static contextType = NavContext;
    state: any = {}
    elIonSelect: any = React.createRef();
    get pager() { return AuthPager.instance.pager; }
    componentWillMount = () => this.willMount();
    input: any = {};
    msg: any = {};
    prop: any = {};
    opts: any = {};
    subs: any = {};
    willMount = () => {
        const input = (this.input = {});
        const msg = (this.msg = {});
        const prop = (this.prop = {});
        const opts = (this.opts = {
            password1: { type: 'password', icon: eyeOff },
            password2: { type: 'password', icon: eyeOff },
        });
        this.setState({ input, msg, prop, opts });
    }

    public setInput(input: any) {
        Object.rcopy(this.input, input);
        return this;
    }

    hConfirm = () => {
        if (!this.isValidEntries()) return;
        Alert.showProgressRequest();
        return setTimeout(() => this.performSubmit(), 750);
    }
    private performSubmit() {
        rest.post('account/changepassword', this.input).subscribe(async (res: any) => {
            if (res.Status == 'ok') {
                this.allowBack = true;
                return Alert.showSuccessMessage(res.Message, () => this.pager.backTo(SignInView, true));
            }
            Alert.showErrorMessage(res.Message);
        }, (err: any) => {
            Alert.showWarningMessage('Please try again');
        });
    }

    private isValidEntries(): boolean {
        var isValid = true;

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

        if (isValid) {
            delete this.input.RequestForm;
            this.input.RequestForm = Object.rcopy(this.input);
        }
        this.input.IsValid = isValid;
        this.setState({ msg: this.msg, input: this.input });
        return isValid;
    }

    private allowBack: boolean = false;
    onPagerBack() {
        if (this.allowBack)
            return true;
        Alert.swal({
            title: 'Confirmation',
            text: 'Are you sure you want to Cancel?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Cancel!',
            cancelButtonText: 'Cancel',
            allowOutsideClick: false,
            backdropDismiss: false,
            confirmButtonColor: "#218838",
            cancelButtonColor: "#c82333",
            reverseButtons: true,
        }, (res: any) => {
            if (res.isConfirmed) {
                this.allowBack = true;
                return this.pager.backTo(SignInView, true);
            }
        });
        return false;
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
        var grp = Group[0] || {};
        const { input = {}, msg = {}, opts = {} } = this.state;
        input.PGRPID = grp.GroupID;
        input.PLID = grp.PLID;
        input.PSNCD = grp.PSNCD;
        return (<>
            <div className="layout full bootstrap-form" style={styles('padding:5px 10%')}>
                <div className="auto" style={styles('height:7.5%')}><div style={styles('height:7.5%')}><div>
                    <div>&nbsp;</div>
                </div></div></div>
                <div style={styles('height:250px')}>
                    <div style={styles('position:relative;height:250px')}>
                        <img className="img-fit" src='./assets/img/applogo.png' />
                    </div>
                </div>
                <div className="form-container">
                    <div className='horizontal' style={styles('height:auto;padding:10px 0px')}>
                        <div style={styles('text-align:center;font-size:85%;font-weight:bold;width:90%;color:#000000')}>
                            Please enter your New Password
                        </div>
                    </div>
                    <form className={classNames('needs-validation', { 'form-invalid': !input.IsValid })} noValidate onSubmit={(ev) => ev.preventDefault()}>
                        <div className={classNames({ 'input-invalid': !!msg.Password })} style={styles('position:relative')}>
                            <IonItem lines="none" className='input-error' style={styles('--min-height:40px;margin:2.5px 0px')}>
                                <Input ion node={(handle) => <>
                                    <IonInput className="text-center font-bold br-0" style={styles('--padding-bottom:0px;--padding-top:0px;--padding-start:25px')}
                                        type={opts.password1.type} placeholder="Password"
                                        value={input.Password} {...handle({ onChange: (ev) => this.hState(ev, 'Password') })} />
                                </>} />

                                <IonIcon class="password" item-end icon={opts.password1.icon} onClick={() => this.hHideShowPassword(opts.password1)} />
                            </IonItem>
                            <div className="invalid-tooltip" style={styles('white-space:normal')}>{msg.Password}</div>
                        </div>
                        <div className={classNames({ 'input-invalid': !!msg.ConfirmPassword })} style={styles('position:relative')}>
                            <IonItem lines="none" className='input-error' style={styles('--min-height:40px;margin:2.5px 0px')}>
                                <Input ion node={(handle) => <>
                                    <IonInput className="text-center font-bold br-0" style={styles('--padding-bottom:0px;--padding-top:0px;--padding-start:25px')}
                                        type={opts.password2.type} placeholder="Confirm Password"
                                        value={input.ConfirmPassword} {...handle({ onChange: (ev) => this.hState(ev, 'ConfirmPassword'), hitEnter: this.hConfirm })} />
                                </>} />

                                <IonIcon class="password" item-end icon={opts.password2.icon} onClick={() => this.hHideShowPassword(opts.password2)} />
                            </IonItem>
                            <div className="invalid-tooltip">{msg.ConfirmPassword}</div>
                        </div>
                    </form>
                    {/*
        <!--<div className="horizontal" style="margin-top: 15px;height: auto;">
            <div className="btn-default" style="width: 100%;" (click)='handleClickConfirm()' >CONFIRM</div>
        </div>--> (click)="handleClickConfirm()" 
        */}
                    <div className="btn-au_confirm" style={styles('margin-top:15px')} onClick={this.hConfirm}>&nbsp;</div>
                </div>
                <div className="auto" style={styles('height:20%')}><div style={styles('height:20%')}><div>
                    <div>&nbsp;</div>
                </div></div></div>
            </div>
        </>);
    }
}