import { IonIcon, IonInput, IonItem, IonLabel, IonTextarea, } from '@ionic/react';
import React from 'react';
import { NavContext } from '@ionic/react';
import { Alert } from '../../../tools/components/+common/stack';
import { classNames, Input, styles } from '../../../tools/plugins/element';
import { rest } from '../../+app/+service/rest.service';
import AuthPager from '../auth-pager';
import { eye, eyeOff } from 'ionicons/icons';
import { device } from '../../../tools/plugins/device';
import { isAlpha, isEmail, isPassword } from '../../../tools/global';
import SignInView from './sign-in.view';
import { storage } from '../../../tools/plugins/storage';
import { jUser } from '../../+app/user-module';
import { thermalPrinter } from '../../../tools/plugins/therminal-printer';
import Recycler from '../../../tools/components/+feature/recycler';
import RecyclerStorage from '../../intro.page/recycler-storage';

const { Object }: any = window;

export default class SignUpView extends React.Component {
    setInput = (input: any): SignUpView => (this.holder.setInput(input), this);
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
    get cont3xt() { return AuthPager.instance.context; }
    get pager() { return AuthPager.instance.pager; }
    componentWillMount = () => this.willMount(false);
    subs: any = {};
    input: any = {};
    msg: any = {};
    opts: any = {};
    prop: any = {};
    willMount = (base = true) => {
        const input = (this.input = {});
        const msg = (this.msg = {});
        const prop = (this.prop = {});
        const opts = (this.opts = {
            password1: { type: 'password', icon: eyeOff },
            password2: { type: 'password', icon: eyeOff },
        });
        this.setState({ prop, input, msg, opts });
        if (!base) return;
        device.ready(() => this.checkDevice());
    }
    didMount = async () => { }

    private async checkDevice() {
        this.prop.AppVersion = (device.appVersion || 'v1.0');
        this.setState({ prop: this.prop });
        //
        if (!device.isBrowser) {
            if (await thermalPrinter.checkPrinters())
                this.input.Terminal = true;
            else delete this.input.Terminal;
            var deviceID = this.uniqueID();
            var apkVersion = device.appVersion;
            Object.rcopy(this.input, { DeviceName: device.model, DeviceID: deviceID, ApkVersion: apkVersion, });
            this.setState({ input: this.input });
        }
    }
    private uniqueID() {
        const uuid = (device.uuid || +(new Date())).toString();
        const serial = (device.serial || +(new Date())).toString();
        var max = parseInt('0x' + uuid), min = parseInt('0x' + serial);
        if (max < min) { var temp = min; min = max; max = temp; }
        var id = String((max / min)).split('.').map(i => parseInt(i).toString(16)).join('-');
        this.prop.DeviceID = (!!this.input.Terminal ? uuid : serial).toUpperCase();
        this.setState({ prop: this.prop });
        return (id + '-' + this.prop.DeviceID);
    }

    public setInput(input: any) {
        Object.rcopy(this.input, input);
        return this;
    }

    handleClickConfirm() {
        if (!this.input.IAgree) return;
        if (!this.isValidEntries()) return;
        Alert.showProgressRequest();
        return setTimeout(() => this.performSubmit(), 750);
    }
    private performSubmit() {
        rest.post('signup', this.input).subscribe(async (res: any) => {
            if (res.Status == 'ok') {
                this.performSaveLocal(res.Account, res.Auth);
                return Alert.showSuccessMessage(res.Message, () => this.goToHomePage());
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
        if (!!this.input.EmailAddress) {
            if (!isEmail(this.input.EmailAddress)) {
                this.msg.EmailAddress = 'Please enter valid Email Address';
                isValid = false;
            }
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

        if (isValid) {
            this.checkDevice();
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
    private goToHomePage() {
        return this.cont3xt?.navigate('/in', 'forward', 'pop');
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
    private performSaveLocal(account: any, auth: any) {
        jUser(account);
        rest.setBearer(auth.Token);
        storage.Auth = auth;
        storage.Username = this.input.MobileNumber;
        storage.IsSignIn = true;
    }

    render() {
        const { input = {}, msg = {}, opts = {} } = this.state;

        return (<>
            <div className="layout full bootstrap-form" style={styles('padding:0px 10%')}>
                <div style={styles('height:75px')}>
                    <div className="horizontal" style={styles('height:75px')}>
                        <img src='./assets/img/applogo.png' style={styles('width:65%')} />
                    </div>
                    <div className="horizontal" style={styles('height:auto;font-size:90%;font-weight:bold;color:#eceff1')}>
                        Sign-up with us
                    </div>
                    <div className="horizontal" style={styles('height:auto;font-size:60%;font-weight:bold;padding-bottom:10px;color:#eceff1')}>
                        Fill out the required information.
                    </div>
                </div>
                <div className="form-container auto scroll"><div><div>
                    <div>
                        <form className={classNames('needs-validation', { 'form-invalid': !input.IsValid })} noValidate onSubmit={(ev) => ev.preventDefault()}>
                            <div className={classNames({ 'input-invalid': !!msg.Firstname })} style={styles('position:relative')}>
                                <IonItem className='input-error' style={styles('--highlight-background:unset;--min-height:56.5px;margin-top:2.5px')}>
                                    <IonLabel position="floating" style={styles('font-weight:bold;margin-top:-7.5px')}>First Name</IonLabel>
                                    <Input ion node={(handle) => <>
                                        <IonInput className="font-bold br-0" style={styles('--padding-end:40px')}
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
                                        <IonInput className="font-bold br-0" style={styles('--padding-end:40px')}
                                            type="text"
                                            value={input.Lastname} {...handle({ onChange: (ev) => this.hState(ev, 'Lastname') })} />
                                    </>} />

                                </IonItem>
                                <div className="invalid-tooltip">{msg.Lastname}</div>
                            </div>
                            <div className={classNames({ 'input-invalid': !!msg.Address })} style={styles('position:relative')}>
                                <IonItem className='input-error' style={styles('--highlight-background:unset;--min-height:56.5px;margin-top:2.5px')}>
                                    <IonLabel position="floating" style={styles('font-weight:bold;margin-top:-7.5px')}>Current Address</IonLabel>
                                    <Input ion node={(handle) => <>
                                        <IonTextarea rows={2} className="font-bold br-0"
                                            value={input.Address} {...handle({ onChange: (ev) => this.hState(ev, 'Address') })} />
                                    </>} />

                                </IonItem>
                                <div className="invalid-tooltip">{msg.Address}</div>
                            </div>

                            <div className={classNames({ 'input-invalid': !!msg.MobileNumber })} style={styles('position:relative')}>
                                <IonItem className='input-error' style={styles('--highlight-background:unset;--min-height:56.5px;margin-top:2.5px')}>
                                    <IonLabel position="floating" style={styles('font-weight:bold;margin-top:-7.5px')}>Mobile Number</IonLabel>
                                    <Input ion node={(handle) => <>
                                        <IonInput className="font-bold br-0" style={styles('--padding-end:40px')}
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
                                        <IonInput className="font-bold br-0" style={styles('--padding-end:40px')}
                                            type="text" readonly
                                            value={input.EmailAddress} {...handle({ onChange: (ev) => this.hState(ev, 'EmailAddress') })} />
                                    </>} />

                                </IonItem>
                                <div className="invalid-tooltip">{msg.EmailAddress}</div>
                            </div>
                            <div className={classNames({ 'input-invalid': !!msg.Password })} style={styles('position:relative')}>
                                <IonItem className='input-error' style={styles('--highlight-background:unset;--min-height:56.5px;margin-top:2.5px')}>
                                    <IonLabel position="floating" style={styles('font-weight:bold;margin-top:-7.5px')}>New Password</IonLabel>
                                    <Input ion node={(handle) => <>
                                        <IonInput className="font-bold br-0" style={styles('--padding-end:40px')}
                                            type={opts.password1.type}
                                            value={input.Password} {...handle({ onChange: (ev) => this.hState(ev, 'Password') })} />
                                    </>} />

                                    <IonIcon class="password" item-end icon={opts.password1.icon} onClick={() => this.hHideShowPassword(opts.password1)} />
                                </IonItem>
                                <div className="invalid-tooltip">{msg.Password}&nbsp;</div>
                            </div>
                            <div className={classNames({ 'input-invalid': !!msg.ConfirmPassword })} style={styles('position:relative')}>
                                <IonItem className='input-error' style={styles('--highlight-background:unset;--min-height:56.5px;margin-top:2.5px')}>
                                    <IonLabel position="floating" style={styles('font-weight:bold;margin-top:-7.5px')}>Verify Password</IonLabel>
                                    <Input ion node={(handle) => <>
                                        <IonInput className="font-bold br-0" style={styles('--padding-end:40px')}
                                            type={opts.password2.type}
                                            value={input.ConfirmPassword} {...handle({ onChange: (ev) => this.hState(ev, 'ConfirmPassword') })} />
                                    </>} />

                                    <IonIcon class="password" item-end icon={opts.password2.icon} onClick={() => this.hHideShowPassword(opts.password2)} />
                                </IonItem>
                                <div className="invalid-tooltip">{msg.ConfirmPassword}&nbsp;</div>
                            </div>
                            <div className="horizontal" style={styles('height:auto;font-size:65%;font-weight:bold;color:white;padding:10px 0px')}>
                                I hereby declare that the details furnished above are true and correct to the best of my knowledge and belief and I undertake to inform you of any changes therein, immediately.
                                In case any of the above information is found to be false or untrue or misleading or misrepresenting, I am aware that I may be held liable for it.
                            </div>
                            <div className='row' style={styles('margin:0px;padding-top:5px')}>
                                <div className='col-12'>
                                    <div className="custom-control custom-checkbox vertical">
                                        <Input input="checkbox" node={(handle) => <>
                                            <input type="checkbox" className="custom-control-input" id="frm0x0a" defaultChecked={false} {...handle({ onChange: (ev) => this.hState(ev, 'IAgree') })} />
                                        </>} />

                                        <label className="custom-control-label" htmlFor="frm0x0a" style={styles('vertical-align:middle;color:#fefed1')}>I agree to the terms and conditions</label>
                                    </div>
                                </div>
                            </div>
                        </form>
                        <div className={classNames('btn-au_register', { 'disabled': !input.IAgree })} style={styles('margin-top:15px')}>&nbsp;</div>
                        <div>&nbsp;</div>
                    </div>
                </div></div></div>
            </div>
        </>);
    }
}