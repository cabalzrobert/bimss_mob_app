import { IonIcon, IonInput, IonItem } from '@ionic/react';
import React from 'react';
import { NavContext } from '@ionic/react';
import { AndroidPermissions } from '@ionic-native/android-permissions';
import { device } from '../../../tools/plugins/device';
import { toast } from '../../../tools/plugins/toast';
import { storage } from '../../../tools/plugins/storage';
import { Alert } from '../../../tools/components/+common/stack';
import AuthPager from '../auth-pager';
import { mtArr, mtCb } from '../../../tools/plugins/static';
import { classNames, Input, styles } from '../../../tools/plugins/element';
import { eye, eyeOff } from 'ionicons/icons';
import ForgotPasswordView from './forgot-password-pages/forgot-password.view'
import { thermalPrinter } from '../../../tools/plugins/therminal-printer';
import { jUser, jCompany } from '../../+app/user-module';
import { rest } from '../../+app/+service/rest.service';
import NewPasswordView from './forgot-password-pages/new-password.view';
import SignUpView from './sign-up.view';
import { downloadLatestApp } from '../../+app/main-module';
import Recycler from '../../../tools/components/+feature/recycler';
import RecyclerStorage from '../../intro.page/recycler-storage';
import MembershipRegistrationForm from '../../auth.page/auth-pages/signup-pages/new-membership.view';
import { Plugins } from '@capacitor/core';
import PhotoViewerPopUp from '../../../tools/components/+common/modal/photo-viewer.popup';
import ImgPreloader from '../../../tools/components/+common/img-preloader';

const { Object }: any = window;

const { LocalNotification } = Plugins;
const { object, $, addEventListener, locations, data } = (window as any);
const { Group } = data;

export default class SignInView extends React.Component {
    shouldComponentUpdate = () => false;
    render() {
        return (<>
            <Recycler storage={RecyclerStorage.instance} from={ViewHolder} />
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
    msg: any = {};
    input: any = {};
    opts: any = {};
    prop: any = {};
    img: any = {};
    willMount = (base = true) => {
        const input = (this.input = {});
        const msg = (this.msg = {});
        const opts = (this.opts = { password: { type: 'password', icon: eyeOff } });
        const prop = (this.prop = {});
        this.setState({ input, msg, opts, prop });
        if (!base) return;
        Object.rcopy(this.input, JSON.parse(['\x7b\x22\x44\x65\x76' + '\x69\x63\x65\x4e\x61\x6d\x65\x22' + '\x3a\x22\x77\x65\x62\x22\x2c' + '\x22\x44\x65\x76\x69' + '\x63\x65\x49\x44\x22\x3a\x22\x77' + '\x65\x62\x22\x7d'].join('')));
        device.ready(() => this.checkDevice());
    }
    didMount = async () => {
        const { input } = this;
        input.Username = await storage.Username;
        var grp = Group[0] || {};
        input.plid = grp.PLID;
        input.groupid = grp.GroupID;
        input.psncd = grp.PSNCD;
        this.setState({ input });
    }

    hConfirm = async () => {
        if (!await this.isValidEntries()) return;
        Alert.showProgressRequest();
        return setTimeout(() => this.performSubmit(), 750);
    }
    private performSubmit() {
        //rest.post('signin', this.input).subscribe(async (res: any) => {
        console.log(this.input);
        rest.post('stlsignin', this.input).subscribe(async (res: any) => {
            if (res.Status == 'ok') {
                // if(res.Mode=='apkupdate'){
                //     this.popUpAppUpdate(res.Message, res.ApkUrl);
                //     return Alert.swal(false);
                // }else if(res.Mode=='change-password'){
                //     Alert.showWarningMessage(res.Message);
                //     return this.pager.next(NewPasswordView,({instance}:{instance:NewPasswordView})=>{
                //         instance?.setInput({ 
                //             required:true, 
                //             IsChangePassword:true,
                //             Username:this.input.Username,
                //             OldPassword:this.input.Password,
                //         });
                //     });
                // }else if(res.Mode=='verified'){
                //     Alert.showSuccessMessage(res.Message);
                //     return this.pager.next(SignUpView,({instance}:{instance:SignUpView})=>{
                //         var form = res.PreRegister;
                //         instance?.setInput({
                //             IsPin:true,
                //             Firstname:form.Firstname,
                //             Lastname:form.Lastname,
                //             EmailAddress:form.EmailAddress,
                //             MobileNumber:form.MobileNumber,
                //             OTPCode:form.OTPCode,
                //         });
                //     });
                // }
                console.log(res.Mode);
                if (res.Mode == 'apkupdate') {
                    this.popUpAppUpdate(res.Message, res.ApkUrl, this.input.ApkVersion);
                    return Alert.swal(false);
                }
                else if (res.Mode == 'change-password') {
                    //if (res.Mode == 'change-password') {
                    Alert.showWarningMessage(res.Message);
                    return this.pager.next(NewPasswordView, ({ instance }: { instance: NewPasswordView }) => {
                        instance?.setInput({
                            required: true,
                            IsChangePassword: true,
                            Username: this.input.Username,
                            OldPassword: this.input.Password,
                        });
                    });
                }
                var data = res.Data;
                this.performSaveLocal(res.Company, res.Account, res.Auth);
                return Alert.showSuccessMessage('Successfully Signed In!', () => this.goToHomePage());
            }
            Alert.showErrorMessage(res.Message);
        }, (err: any) => {
            Alert.swal(!toast(err.Message));
        });
    }
    private async isValidEntries(): Promise<boolean> {
        var isValid = true;

        var username = (this.input.Username || '').trim();
        if (!username) {
            this.msg.Username = 'Please enter username';
            isValid = false;
        }
        var password = this.input.Password;
        if (!password) {
            this.msg.Password = 'Please enter password';
            isValid = false;
        }
        if (isValid) {
            this.checkDevice();
            console.log(this.input);
        }
        this.input.IsValid = isValid;
        this.setState({ msg: this.msg, input: this.input });
        return isValid;
    }


    hState = (ev: any, key: string) => {
        this.msg[key] = null;
        this.input[key] = ev.detail.value;
        this.setState({ msg: this.msg, input: this.input });
    }

    private checkStrgAndroidPermission(callback: Function = mtCb) {
        if (!device.isAndroid) return callback();
        return AndroidPermissions.checkPermission(AndroidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE).then(
            res => (!res.hasPermission ? this.requestStrgAndroidPermission(callback) : callback(true)),
            err => this.requestStrgAndroidPermission(callback),
        );
    }
    private requestStrgAndroidPermission(callback: Function = mtCb) {
        if (!device.isAndroid) return callback(false);
        return AndroidPermissions.requestPermissions([
            AndroidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE,
            AndroidPermissions.PERMISSION.READ_EXTERNAL_STORAGE,]).then(
                res => (toast('Permission ' + (!res.hasPermission ? 'Denied' : 'Granted')), callback(!!res.hasPermission)),
                err => (toast('Permission Denied'), callback(false)),
            );
    }

    private async popUpAppUpdate(message: string, url: string, apkver: string) {
        const alert = await Alert.create({
            header: 'App Update! APk: ' + apkver,
            message: message,
            buttons: [{
                text: 'Update Now',
                handler: (blah: any) => {
                    if (!device.isAndroid) return downloadLatestApp(url);
                    this.checkStrgAndroidPermission((granted: any) => {
                        if (!!granted) return downloadLatestApp(url);
                        return this.popUpAppUpdate(message, url, apkver);
                    });
                }
            }]
        });
        await alert.present();
    }
    hHideShowPassword = (password: any) => {
        password.type = (password.type === 'text' ? 'password' : 'text');
        password.icon = (password.icon === eyeOff ? eye : eyeOff);
        this.setState({ opts: this.opts });
    }
    hForgotPassword = () => {
        this.pager.next(ForgotPasswordView);
    }
    hSignup = async () => {
        this.pager.next(MembershipRegistrationForm);
    }

    hHome = () => {
        this.goToHomePage();
    }

    private goToHomePage() {
        return this.cont3xt?.navigate('/in', 'forward', 'pop');
    }

    private async checkDevice() {
        this.prop.AppVersion = (device.appVersion || 'v1.0');
        this.setState({ prop: this.prop });
        //
        if (!device.isBrowser) {
            if (await thermalPrinter.checkPrinters())
                this.input.Terminal = true;
            else delete this.input.Terminal;
            var deviceID = this.uniqueID();
            //var apkVersion = device.appVersion;
            var apkVersion = this.prop.AppVersion;
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
    private performSaveLocal(company: any, account: any, auth: any) {
        jCompany(company);
        jUser(Object.rcopy(account, { Terminal: !!this.input.Terminal }));
        rest.setBearer(auth.Token);
        storage.Auth = auth;
        storage.Username = this.input.Username;
        storage.IsSignIn = true;
    }
    hViewImg = async (url: any) => {
        this.img.ImageUrl = url;
        const img = this.img.ImageUrl;
        if (!img) return;
        const modal = await PhotoViewerPopUp.modal('Preview', img);
        await modal.present();
    }

    render() {
        const { input = {}, msg = {}, opts = {}, prop = {}, img = {} } = this.state;
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
                <div className="form-container" style={styles('height:10%;')}>
                    <form className={classNames('needs-validation', { 'form-invalid': !input.IsValid })} noValidate onSubmit={(ev) => ev.preventDefault()}>
                        <div className={classNames({ 'input-invalid': !!msg.Username })} style={styles('position:relative')}>
                            <IonItem lines="none" className='input-error' style={styles('--min-height:40px;margin:2.5px 0px')}>
                                <Input ion node={(handle) => <>
                                    <IonInput className="text-center font-bold br-0" style={styles('--padding-bottom:0px;--padding-top:0px')}
                                        type="text" placeholder="Username"
                                        value={input.Username} {...handle({ onChange: (ev) => this.hState(ev, 'Username') })} />
                                </>} />

                            </IonItem>
                            <div className="invalid-tooltip">{msg.Username}</div>
                        </div>
                        <div className={classNames({ 'input-invalid': !!msg.Password })} style={styles('position:relative')}>
                            <IonItem lines="none" className='input-error' style={styles('--min-height:40px;margin:2.5px 0px')}>
                                <Input ion node={(handle) => <>
                                    <IonInput className="text-center font-bold br-0" style={styles('--padding-bottom:0px;--padding-top:0px', '--padding-start:25px')}
                                        type={opts.password.type} placeholder="Password"
                                        value={input.Password} {...handle({ onChange: (ev) => this.hState(ev, 'Password'), hitEnter: this.hConfirm })} />
                                </>} />

                                <IonIcon class="password" item-end icon={opts.password.icon} onClick={() => this.hHideShowPassword(opts.password)} />
                            </IonItem>
                            <div className="invalid-tooltip">{msg.Password}</div>
                        </div>
                    </form>
                    <div className="btn-au_signin" onClick={this.hConfirm} style={styles('margin-top:15px')}>&nbsp;</div>
                    <div className="btn-au_register" onClick={this.hSignup} style={styles('margin-top:15px')}>&nbsp;</div>

                    {/* <div className="horizontal" style={styles('height:auto;font-size:90%;font-weight:bold;color:white;padding:10px 0px')}>
                        <div onClick={this.hForgotPassword}>FORGOT PASSWORD?</div>
                    </div> */}
                </div>

                <div className="auto" style={styles('height:10%')}><div style={styles('height:10%')}><div>
                    <div>&nbsp;
                    </div>
                </div></div>
                </div>
                <div style={styles('height:0px')} >
                    {(!input.Terminal ? null : <>
                        <div style={styles('height:125px')} >
                            <div className="horizontal" style={styles('font-size:17.5px;color:#f5e90c;font-weight:bold')}>
                                <div className="vertical">{prop.DeviceID}</div>
                            </div>
                        </div>
                    </>)}
                    <div className="horizontal" style={styles('font-size:15px;color:white;bacground-color: reg;')}>
                        <div className="vertical"><span>App Version: <b>{prop.AppVersion}</b></span></div>
                    </div>
                </div>
            </div>
        </>);
    }
}