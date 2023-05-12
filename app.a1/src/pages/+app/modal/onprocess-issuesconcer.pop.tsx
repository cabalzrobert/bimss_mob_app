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


export default class ProcessIssuesConcernPopUp extends React.Component<{ modal: Function, Subscriber: any }> implements OnDidBackdrop {
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
        //if (!this.isValidEntries()) return;
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
        console.log("Issuesconcern for Process");
        console.log(this.subscriber);
        rest.post('concern/report/problem/process', (this.subscriber)).subscribe(async (res: any) => {
            if (res.Status == 'ok') {
                // if(this.subscriber!=null){
                //     this.subscriber.OTP = (+this.input.OTP);
                // }
                if (res.Message == "Succesfull save")
                    return Alert.showSuccessMessage("This Issues for Processing and it will work out as soon as possible",
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
                            <div className="col-12 p-0 row m-0 options">
                                <div className="horizontal col-12" style={styles('height:auto;padding-top:5px;width:100%;')}>
                                    <ImgPreloader className='user-image brand-image img-circle elevation-1' style={styles('width:100px;')}
                                        placeholder='./assets/img/icon_blank_profile.png' src={subscriber.ImageUrl} />
                                </div>

                            </div>
                            <div className="col-12 p-0 row m-0 options">
                            <div className="horizontal col-12" style={styles('text-align:center;height:auto;font-size:20px;font-weight:bold')}>{subscriber.Fullname}</div>
                                <div className="horizontal col-12" style={styles('text-align:center;height:auto;font-size:12px')}>{subscriber.MobileNumber}</div>
                            </div>
                            <div className="col-12 p-0 row m-0 options">
                                <div className="horizontal col-12" style={styles('text-align:center;height:auto;font-size:20px;font-weight:bold')}></div>
                            </div>
                            <div className="horizontal col-12" style={styles('height:auto;padding-top:5px;width:100%;')}>
                                <div className="col-5 p-0 row m-0 options">
                                    <div className="col-12" style={styles('text-align:right;height:auto;font-size:12px;font-weight:bold')}>Transaction #</div>
                                </div>
                                <div className="col-7 p-0 row m-0 options">
                                    <div className="col-12" style={styles('text-align:left;height:auto;font-size:12px')}>{subscriber.TransactionNo}</div>
                                </div>
                            </div>
                            <div className="col-12 p-0 row m-0 options">
                                <div className="col-5 p-0 row m-0 options">
                                    <div className="col-12" style={styles('text-align:right;height:auto;font-size:12px;font-weight:bold')}>Tickect #</div>
                                </div>
                                <div className="col-7 p-0 row m-0 options">
                                    <div className="col-12" style={styles('text-align:left;height:auto;font-size:12px')}>{subscriber.TicketNo}</div>
                                </div>
                            </div>
                            <div className="col-12 p-0 row m-0 options">
                                <div className="col-5 p-0 row m-0 options">
                                    <div className="col-12" style={styles('text-align:right;height:auto;font-size:12px;font-weight:bold')}>Sitio</div>
                                </div>
                                <div className="col-7 p-0 row m-0 options">
                                    <div className="col-12" style={styles('text-align:left;height:auto;font-size:12px')}>{subscriber.SitioName}</div>
                                </div>
                            </div>
                            <div className="col-12 p-0 row m-0 options">
                                <div className="col-5 p-0 row m-0 options">
                                    <div className="col-12" style={styles('text-align:right;height:auto;font-size:12px;font-weight:bold')}>Subject</div>
                                </div>
                                <div className="col-7 p-0 row m-0 options">
                                    <div className="col-12" style={styles('text-align:left;height:auto;font-size:12px')}>{subscriber.Subject}</div>
                                </div>
                            </div>
                            <div className="col-12 p-0 row m-0 options">
                                <div className="col-5 p-0 row m-0 options">
                                    <div className="col-12" style={styles('text-align:right;height:auto;font-size:12px;font-weight:bold')}>Details</div>
                                </div>
                                <div className="col-7 p-0 row m-0 options">
                                    <div className="col-12" style={styles('text-align:left;height:auto;font-size:12px')}>{subscriber.Body}</div>
                                </div>
                            </div>

                        </div>
                        <div className="col-12 p-0 row m-0 options">
                            <div className="horizontal col-12" style={styles('text-align:center;height:auto;font-size:14px;font-weight:bold')}>Issues Concern for Processing </div>
                        </div>
                    </div>
                    {/* <div className="bg-cut_lines-img"></div> */}
                    <div className="row m-0 bg-bottom">
                        <div className="col-12 p-0">

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
            <Modal className="modal-adjustment width-350 no-bg mwf" ref={(ref) => modal = ref} content={<ProcessIssuesConcernPopUp modal={() => modal} Subscriber={subscriber} />} />
        </>);
        setTimeout(async () => (await modal.onDidDismiss(), stack.pop()));
        return modal;
    }
}