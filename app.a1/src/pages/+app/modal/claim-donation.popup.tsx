import { IonInput, IonItem } from '@ionic/react';
import React from 'react';
import styled from 'styled-components';
import { rest } from '../+service/rest.service';
import { app, OnDidBackdrop } from '../../../tools/app';
import Stack, { Alert, Modal } from '../../../tools/components/+common/stack';
import { numberWithComma } from '../../../tools/global';
import { device } from '../../../tools/plugins/device';
import { toast } from '../../../tools/plugins/toast';
import { openDialer, openSms } from '../../../tools/plugins/open';
import PowerApPopUp from './power-ap.popup';
import { classNames, Input, styles } from '../../../tools/plugins/element';
import { mtObj } from '../../../tools/plugins/static';
import { convertToView } from '@ionic/core/dist/types/components/nav/view-controller';
import ImgPreloader from '../../../tools/components/+common/img-preloader';


export default class CustomerActionPopUp extends React.Component<{ modal: Function, Subscriber: any }> implements OnDidBackdrop {
    state: any = {};
    filter: any = {};
    componentWillMount = () => {
        app.component(this);
        this.subscriber = this.props.Subscriber;
    }

    dismiss = (data?: any) => this.props.modal().dismiss(data);
    hClose = () => this.dismiss();

    subs: any = {};
    msg: any = {};
    input: any = {};

    subscriber: any = {};
    otp: any = {};
    onDidBackdrop() {
        this.dismiss();
        return false;
    }

    hPowerAp = async () => {
        if (this.subscriber.IsBlocked)
            return toast('Account bas been blocked');
        const modal = await PowerApPopUp.modal(this.subscriber);
        await modal.present();
        await modal.onDidDismiss();
        this.dismiss();
    }
    hCall = () => {
        if (device.isBrowser) {
            Alert.showWarningMessage('not applicable to browser');
            return;
        }
        return openDialer(this.subscriber.MobileNumber);
    }
    hText = () => {
        if (device.isBrowser) {
            Alert.showWarningMessage('not applicable to browser');
            return;
        }
        return openSms(this.subscriber.MobileNumber);
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
        rest.post('donation/claim', (this.subscriber)).subscribe(async (res: any) => {
            if (res.Status == 'ok') {
                // if(this.subscriber!=null){
                //     this.subscriber.OTP = (+this.input.OTP);
                // }
                if (res.Message == "Successfully Claim")
                    return Alert.showSuccessMessage(res.Message, 
                        () => this.dismiss({ IsDone: true }));
            }
            Alert.showErrorMessage(res.Message);
        }, (err: any) => {
            Alert.showWarningMessage('Please try again');
        });
    }

    private isValidEntries(): boolean {
        var { u } = this.state;
        var isValid = true;
        var otp = (this.subscriber.OTP || '').trim();
        if (!otp) {
            this.msg.OTP = ('Please Enter OTP');
            isValid = false;
        }
        // var subscriber = (this.input.Subscriber||'').toString();
        // if(!subscriber){
        //     this.msg.Subscriber = 'Please enter account/mobile number';
        //     isValid = false;
        // }else if(subscriber.length<6){
        //     this.msg.Subscriber = 'Please enter a valid account/mobile number';
        //     isValid = false;
        // }else if(subscriber==u.AccountID||subscriber==u.MobileNumber){
        //     this.msg.Subscriber = 'You cannot share to your own account number!';
        //     isValid = false;
        // }

        // var amount = this.input.Amount; 
        // if(!amount){
        //     this.msg.Amount = 'Please enter load credit amount';
        //     isValid = false;
        // }else{
        //     amount = +amount;
        //     if(amount < 10){
        //         this.msg.Amount = 'Minimum transaction is 10 cash credit';
        //         isValid = false;
        //     }else if(+u.CreditBalance < amount){
        //         this.msg.Amount = 'Insufficient Balance';
        //         isValid = false;
        //     }
        // // }
        // if (isValid) {
        //     if (this.otp != null) {
        //         this.input.OTP = this.subscriber.DONO_ID;
        //     }
        // }

        // if(isValid){
        //     if(this.subscriber!=null){
        //         this.input.Subscriber = this.subscriber.AccountID;
        //     }
        // }
        // this.setState({msg:this.msg, input:this.input});
        return isValid;
    }
    hState = (ev: any, key: string) => {
        this.msg[key] = null;
        this.subscriber[key] = ev.detail.value;
        this.setState({ msg: this.msg, input: this.input });
    }

    render() {
        const subscriber = (this.subscriber || mtObj);
        const { u, msg = {}, input = {} } = this.state;
        return (<>
            <div className="modal-container">
                <div className="sm-option-bg">

                    <div className="row m-0 bg-top option-container">

                        <div className="col-12 p-0 row m-0 options">
                            <div className="horizontal col-12" style={styles('height:auto;padding-top:5px;width:100%;')}>
                                <ImgPreloader className='user-image brand-image img-circle elevation-1' style={styles('width:100px;')}
                                    placeholder='./assets/img/icon_blank_profile.png' src={subscriber.ImageUrl} />
                            </div>

                        </div>
                        <div className="col-12 p-0 row m-0 options">
                            <div className="horizontal col-12" style={styles('text-align:center;height:auto;font-size:20px;font-weight:bold')}>{subscriber.FLL_NM}</div>
                        </div>
                        <div className="col-12 p-0 row m-0 options">
                            <div className="horizontal col-12" style={styles('text-align:center;height:auto;font-size:14px;font-weight:bold')}>Received Donation with amount of </div>
                        </div>
                        <div className="col-12 p-0 row m-0 options">
                            <div className="horizontal col-12" style={styles('text-align:center;height:auto;font-size:40px;font-weight:bold')}> Php {numberWithComma(subscriber.AMNT, 2)}</div>
                        </div>
                    </div>
                    {/* <div className="bg-cut_lines-img"></div> */}
                    <div className="row m-0 bg-bottom">
                        <div className="col-12 p-0">
                            <div className="horizontal" style={styles('height:auto;font-size:14px;font-weight:bold')}>Please Enter the Confirmation Code (OTP)</div>
                            <IonItem className='input-error' style={styles('--highlight-background:unset;--min-height:40px;padding-top:2.5px;--border-radius: 10px;--border-width: 1 1 1 1;--background:#1d2c65;')}>
                                <Input ion="popup" node={(handle) => <>
                                    <IonInput className="text-center font-bold br-0" style={styles('--padding-bottom:0px;--padding-top:0px;color:#fefed1;font-weight: bolder;')}
                                        type="numeric" placeholder="Enter the OTP or Code Number"
                                        value={subscriber.OTP} {...handle({ onChange: (ev) => this.hState(ev, 'OTP') })} readonly={subscriber.HasSOTP} />
                                </>} />

                            </IonItem>
                            <div className="horizontal" style={styles('margin-top:5px;height:auto;width:100%;')}>
                                <button className="btn-green" style={styles('width:100%')} type="button" onClick={this.hConfirm}>CONFIRM</button> {/* (click)='handleClickConfirm()' */}
                            </div>
                            <div className="horizontal" style={styles('height:auto;padding-top:5px;width:100%;')}>
                                <button className="btn-red" style={styles('width:100%')} type="button" onClick={this.hClose}>CANCEL</button> {/* (click)="handleCloseButton()"*/}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>);
    }

    static modal = async (subscriber: any = {}) => {
        var modal: any;
        var stack = await Stack.push(<>
            <Modal className="modal-adjustment width-350 no-bg mwf" ref={(ref) => modal = ref} content={<CustomerActionPopUp modal={() => modal} Subscriber={subscriber} />} />
        </>);
        setTimeout(async () => (await modal.onDidDismiss(), stack.pop()));
        return modal;
    }
}