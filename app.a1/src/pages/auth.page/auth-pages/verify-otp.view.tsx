import { IonInput, IonItem, } from '@ionic/react';
import React from 'react';
import { NavContext } from '@ionic/react';
import { Alert } from '../../../tools/components/+common/stack';
import { classNames, Input, styles } from '../../../tools/plugins/element';
import { rest } from '../../+app/+service/rest.service';
import AuthPager from '../auth-pager';
import SignInView from './sign-in.view';
import { mtCb } from '../../../tools/plugins/static';
import Recycler from '../../../tools/components/+feature/recycler';
import RecyclerStorage from '../../intro.page/recycler-storage';

const { Object }: any = window;

export default class VerifyOtpView extends React.Component {
    setInput = (input: any, callback: Function): VerifyOtpView => (this.holder.setInput(input, callback), this);
    nextPage = (page: any, callback: Function = mtCb): VerifyOtpView => (this.holder.nextPage(page, callback), this);
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
    subs: any = {};
    msg: any = {};
    input: any = {};
    prop: any = {};
    willMount = () => {
        const input = (this.input = { IsPin: true });
        const msg = (this.msg = {});
        const prop = (this.prop = {});
        this.setState({ input, msg, prop });
    }
    private page: any;
    private callback: any;
    public nextPage(page: any, callback: Function = mtCb) {
        this.page = page;
        this.callback = callback;
    }
    private callbackResend: any;
    public setInput(input: any, callback: Function) {
        this.callbackResend = callback;
        Object.rcopy(this.input, input);
        return this;
    }
    private performNextPage(res: any) {
        var callback: any = mtCb;
        if (this.callback)
            callback = (page: any) => this.callback(page, res);
        this.pager.next(this.page, callback);
    }

    hConfirm = () => {
        if (!this.isValidEntries()) return;
        Alert.showProgressRequest();
        return setTimeout(() => this.performSubmit(), 750);
    }
    private performSubmit() {
        rest.post('verify/otp', this.input).subscribe(async (res: any) => {
            if (res.Status == 'ok') {
                res.input = this.input;
                this.allowBack = true;
                this.performNextPage(res);
                return Alert.showSuccessMessage('Verified Successfull!');
            }
            Alert.showErrorMessage(res.Message);
        }, (err: any) => {
            Alert.showWarningMessage('Please try again');
        });
    }

    private isValidEntries(): boolean {
        var isValid = true;

        var otpcode = this.input.OTPCode;
        if (!otpcode) {
            this.msg.OTPCode = 'Please enter otp code';
            isValid = false;
        }
        if (isValid) {

        }
        this.input.IsValid = isValid;
        this.setState({ msg: this.msg, input: this.input });
        return isValid;
    }
    hResetOtp = () => {
        if (!this.callbackResend) return;
        Alert.swal({
            title: 'Confirmation',
            text: 'Are you sure you want to Resent?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Confirm!',
            cancelButtonText: 'Cancel',
            allowOutsideClick: false,
            backdropDismiss: false,
            confirmButtonColor: "#218838",
            cancelButtonColor: "#c82333",
            reverseButtons: true,
        }, (res: any) => {
            if (res.isConfirmed)
                return this.performCallbackResend();
        });
    }
    private performCallbackResend() {
        Alert.showProgressRequest();
        return setTimeout(() => this.callbackResend((res: any, err: any) => this.receiveCallbackResend(res, err)), 750);
    }
    private receiveCallbackResend(res: any, err: any) {
        if (!!err) {
            Alert.showWarningMessage('Please try again');
            return;
        }
        if (res.Status == 'ok')
            return Alert.showSuccessMessage(res.Message);
        Alert.showErrorMessage(res.Message);
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

    render() {
        const { input = {}, msg = {}, opts = {} } = this.state;

        return (<>
            <div className="layout full bootstrap-form" style={styles('padding:5px 10%')}>
                <div className="auto" style={styles('height:7.5%')}><div style={styles('height:7.5%')}><div>
                    <div>&nbsp;</div>
                </div></div></div>
                <div style={styles('height:250px')}>
                    <div style={styles('position:relative;height:250px')}>
                        <img className="img-fit" src='./assets/img/applogo2.png' />
                    </div>
                </div>
                <div className="form-container">
                    <div className='horizontal' style={styles('height:auto;padding:10px 0px')}>
                        <div style={styles('text-align:center;font-size:85%;font-weight:bold;width:90%;color:#eceff1')}>
                            We’ve sent a 6 Digit One-Time PIN (OTP) to your mobile number. Please enter the OTP below
                        </div>
                    </div>
                    <form className={classNames('needs-validation', { 'form-invalid': !input.IsValid })} noValidate onSubmit={(ev) => ev.preventDefault()}>
                        <div className={classNames({ 'input-invalid': !!msg.OTPCode })} style={styles('position:relative')}>
                            <IonItem lines="none" className='input-error' style={styles('--min-height:40px;margin:2.5px 0px')}>
                                <Input ion node={(handle) => <>
                                    <IonInput className="text-center font-bold br-0" style={styles('--padding-bottom:0px;--padding-top:0px')}
                                        type="tel" inputmode="numeric" placeholder="OTP Code"
                                        value={input.OTPCode} {...handle({ onChange: (ev) => this.hState(ev, 'OTPCode'), hitEnter: this.hConfirm })} />
                                </>} />

                            </IonItem>
                            <div className="invalid-tooltip">{msg.OTPCode}</div>
                        </div>
                    </form>
                    <div className="btn-au_confirm" style={styles('margin-top:15px')} onClick={this.hConfirm}>&nbsp;</div>
                    <div className='horizontal' style={styles('height:auto')}>
                        <div style={styles('text-align:center;font-size:90%;font-weight:bold;color:white;padding:30px 0px')}
                            onClick={this.hResetOtp}>
                            Resend One-Time PIN
                        </div>
                    </div>
                </div>
                <div className="auto" style={styles('height:20%')}><div style={styles('height:20%')}><div>
                    <div>&nbsp;</div>
                </div></div></div>
            </div>
        </>);
    }
}