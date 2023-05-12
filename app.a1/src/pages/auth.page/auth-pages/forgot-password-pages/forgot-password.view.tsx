import { IonInput, IonItem, } from '@ionic/react';
import React from 'react';
import { NavContext } from '@ionic/react';
import { Alert } from '../../../../tools/components/+common/stack';
import { classNames, Input, styles } from '../../../../tools/plugins/element';
import { rest } from '../../../+app/+service/rest.service';
import AuthPager from '../../auth-pager';
import VerifyOtpView from '../verify-otp.view';
import NewPasswordView from './new-password.view';
import Recycler from '../../../../tools/components/+feature/recycler';
import RecyclerStorage from '../../../intro.page/recycler-storage';

export default class ForgotPasswordView extends React.Component {
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
    get pager() { return AuthPager.instance.pager; }
    componentWillMount = () => this.willMount();
    input: any = {};
    msg: any = {};
    prop: any = {};
    subs: any = {};
    willMount = () => {
        const input = (this.input = { IsChangePassword: true, });
        const msg = (this.msg = {});
        const prop = (this.prop = {});
        this.setState({ input, msg, prop });
    }

    hConfirm = () => {
        if (!this.isValidEntries()) return;
        Alert.showProgressRequest();
        return setTimeout(() => this.performSubmit(), 750);
    }
    private performSubmit() {
        return this.performRequest(this.input, (res: any, err: any) => this.receiveRequest(res, err));
    }
    private receiveRequest(res: any, err: any) {
        if (!!err) {
            Alert.showWarningMessage('Please try again');
            return;
        }
        if (res.Status == 'ok') {
            this.pager.next(VerifyOtpView, ({ instance }: { instance: VerifyOtpView }) => {
                instance?.setInput(this.input, (callback: any) => this.performRequest(this.input, callback))
                    .nextPage(NewPasswordView, ({ instance }: { instance: NewPasswordView }, res: any) => instance?.setInput(res.input));
            });
            return Alert.showSuccessMessage(res.Message);
        }
        Alert.showErrorMessage(res.Message);
    }
    private performRequest(input: any, callback: Function) {
        return rest.post('r/forgot/password', input)
            .subscribe(async (res: any) => callback(res), (err: any) => callback(null, err));
    }


    private isValidEntries(): boolean {
        var isValid = true;

        var mobilenumber = this.input.MobileNumber;
        if (!mobilenumber) {
            this.msg.MobileNumber = 'Please enter mobile number';
            isValid = false;
        }
        if (isValid) {

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
                            Please enter your registered mobile number
                        </div>
                    </div>
                    <form className={classNames('needs-validation', { 'form-invalid': !input.IsValid })} noValidate onSubmit={(ev) => ev.preventDefault()}>
                        <div className={classNames({ 'input-invalid': !!msg.MobileNumber })} style={styles('position:relative')}>
                            <IonItem lines="none" className='input-error' style={styles('--min-height:40px;margin:2.5px 0px')}>
                                <Input ion node={(handle) => <>
                                    <IonInput className="text-center font-bold br-0" style={styles('--padding-bottom:0px;--padding-top:0px')}
                                        type="tel" inputmode="numeric" placeholder="Mobile Number"
                                        value={input.MobileNumber} {...handle({ onChange: (ev) => this.hState(ev, 'MobileNumber'), hitEnter: this.hConfirm })} />
                                </>} />

                            </IonItem>
                            <div className="invalid-tooltip">{msg.MobileNumber}</div>
                        </div>

                    </form>
                    <div className='horizontal' style={styles('height:auto')}>
                        <div style={styles('text-align:center;font-size:70%;font-weight:bold;width:85%;color:white')}>
                            Tap &quot;Next&quot; to verify your account with your mobile number.
                        </div>
                    </div>
                    <div className="btn-au_next" style={styles('margin-top:15px')} onClick={this.hConfirm}>&nbsp;</div>
                </div>
                <div className="auto" style={styles('height:20%')}><div style={styles('height:20%')}><div>
                    <div>&nbsp;</div>
                </div></div></div>
            </div>
        </>);
    }
}