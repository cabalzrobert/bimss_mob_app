import { IonButton, IonFooter, IonInput, IonItem } from '@ionic/react';
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
import { classNames, styles } from '../../../tools/plugins/element';
import { mtObj } from '../../../tools/plugins/static';
import { convertToView } from '@ionic/core/dist/types/components/nav/view-controller';
import ImgPreloader from '../../../tools/components/+common/img-preloader';


export default class ComplaintActionPopUp extends React.Component<{ modal: Function, Subscriber: any }> implements OnDidBackdrop {
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
                    return Alert.showSuccessMessage(res.Message, () => this.dismiss({ IsDone: true }));
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
            <div style={styles('background-color:#f7f8f9;')}>
            <div className="modal-container">
                <div className="sm-option-bg">

                    <div className="row m-0 bg-top option-container" style={styles('overflow:auto;')}>

                        {/* <div className="col-12 p-0 row m-0 options">
                            <div className="horizontal col-12" style={styles('height:auto;padding-top:5px;width:100%;')}>
                                <ImgPreloader className='user-image brand-image img-circle elevation-1' style={styles('width:100px;')}
                                    placeholder='./assets/img/icon_blank_profile.png' src={subscriber.ImageUrl} />
                            </div>

                        </div> */}
                        <div className="col-12 p-0 row m-0 options">
                            <div className="horizontal col-12" style={styles('text-align:center;height:auto;font-size:14pt;font-weight:bold;')}>{subscriber.RespondentName}</div>
                            {/* <div className="horizontal col-12" style={styles('text-align:center;height:auto;font-size:12px')}>{subscriber.MobileNumber}</div>
                            <div className="horizontal col-12" style={styles('text-align:center;height:auto;font-size:12px')}>{subscriber.EmailAddress}</div>
                            <div className="horizontal col-12" style={styles('text-align:center;height:auto;font-size:12px')}>{subscriber.BirthDate}</div> */}
                        </div>
                        {/* 
                        <div className="col-12 p-0 row m-0 options">
                            <div className="col-5 p-0 row m-0 options">
                                <div className="col-12" style={styles('text-align:right;height:auto;font-size:12px;font-weight:bold')}>Leader</div>
                            </div>
                            <div className="col-7 p-0 row m-0 options">
                                <div className="col-12" style={styles('text-align:left;height:auto;font-size:12px')}>{subscriber.SiteLeaderName}</div>
                            </div>
                        </div>
                        */}
                        <div className="col-12 p-0 row m-0 options">
                            <div className="col-5 p-0 row m-0 options">
                                <div className="col-12" style={styles('text-align:right;height:auto;font-size:11pt;font-weight:bold')}>Issue</div>
                            </div>
                            <div className="col-7 p-0 row m-0 options">
                                <div className="col-12" style={styles('text-align:left;height:auto;font-size:11pt')}>{subscriber.Issue}</div>
                            </div>
                        </div>
                        <div className="col-12 p-0 row m-0 options">
                            <div className="col-5 p-0 row m-0 options">
                                <div className="col-12" style={styles('text-align:right;height:auto;font-size:11pt;font-weight:bold')}>Date</div>
                            </div>
                            <div className="col-7 p-0 row m-0 options">
                                <div className="col-12" style={styles('text-align:left;height:auto;font-size:11pt')}>{subscriber.IncidentDate}</div>
                            </div>
                        </div>
                        <div className="col-12 p-0 row m-0 options">
                            <div className="col-5 p-0 row m-0 options">
                                <div className="col-12" style={styles('text-align:right;height:auto;font-size:11pt;font-weight:bold')}>Place</div>
                            </div>
                            <div className="col-7 p-0 row m-0 options">
                                <div className="col-12" style={styles('text-align:left;height:auto;font-size:11pt')}>{subscriber.IncidentPlaceName}</div>
                            </div>
                        </div>
                        <div className="col-12 p-0 row m-0 options">
                            <div className="col-5 p-0 row m-0 options">
                                <div className="col-12" style={styles('text-align:right;height:auto;font-size:11pt;font-weight:bold')}>Complaint Type</div>
                            </div>
                            <div className="col-7 p-0 row m-0 options">
                                <div className="col-12" style={styles('text-align:left;height:auto;font-size:11pt')}>{subscriber.ComplaintTypeName}</div>
                            </div>
                        </div>
                        <div className="col-12 p-0 row m-0 options">
                            <div className="col-5 p-0 row m-0 options">
                                <div className="col-12" style={styles('text-align:right;height:auto;font-size:11pt;font-weight:bold')}>Status</div>
                            </div>
                            <div className="col-7 p-0 row m-0 options">
                                <div className="col-12" style={styles('text-align:left;height:auto;font-size:11pt')}>{subscriber.Status_Type_Name}</div>
                            </div>
                        </div>


                    </div>
                    {/* <div className="bg-cut_lines-img"></div> */}
                    {/* <div className="row m-0 bg-bottom">
                        <div className="col-12 p-0">
                            <div className="horizontal" style={styles('height:auto;padding-top:5px;width:100%;')}>
                                <button className="btn-red" style={styles('width: 100%;height: 10%;padding: 1px 7px;')} type="button" onClick={this.hClose}>CANCEL</button>
                            </div>
                        </div>
                    </div> */}
                </div>
            </div>
            <IonFooter style={styles('margin-top:2%;background:#f7f8f9;')}>
                <div style={styles('height:auto;padding:1%;display:flex;justify-content:center;')}>
                    <IonButton onClick={this.hClose} style={styles('width:95%;--background:rgb(219 221 237);--color:#737373;font-size:12pt;font-weight:bold;--border-radius:10px;text-transform:capitalize;')}>Okay</IonButton>
                </div>
            </IonFooter>
            </div>
        </>);
    }

    static modal = async (subscriber: any = {}) => {
        var modal: any;
        var stack = await Stack.push(<>
            <Modal className="modal-adjustment width-350 no-bg mwf" ref={(ref) => modal = ref} content={<ComplaintActionPopUp modal={() => modal} Subscriber={subscriber} />} />
        </>);
        setTimeout(async () => (await modal.onDidDismiss(), stack.pop()));
        return modal;
    }
}