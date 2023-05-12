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
import { classNames, styles } from '../../../tools/plugins/element';
import { mtObj } from '../../../tools/plugins/static';
import { convertToView } from '@ionic/core/dist/types/components/nav/view-controller';
import ImgPreloader from '../../../tools/components/+common/img-preloader';


export default class ProfileActionPopUp extends React.Component<{ modal: Function, Subscriber: any }> implements OnDidBackdrop {
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
            <div className="modal-container">
                <div className="sm-option-bg">

                    <div className="row m-0 bg-top option-container" style={styles('overflow:auto;')}>

                        <div className="col-12 p-0 row m-0 options">
                            <div className="horizontal col-12" style={styles('height:auto;padding-top:5px;width:100%;')}>
                                <ImgPreloader className='user-image brand-image img-circle elevation-1' style={styles('width:100px;')}
                                    placeholder='./assets/img/icon_blank_profile.png' src={subscriber.ImageUrl} />
                            </div>

                        </div>
                        <div className="col-12 p-0 row m-0 options">
                            <div className="horizontal col-12" style={styles('text-align:center;height:auto;font-size:16px;font-weight:bold;')}>{subscriber.DisplayName}</div>
                            <div className="horizontal col-12" style={styles('text-align:center;height:auto;font-size:12px')}>{subscriber.MobileNumber}</div>
                            <div className="horizontal col-12" style={styles('text-align:center;height:auto;font-size:12px')}>{subscriber.EmailAddress}</div>
                            <div className="horizontal col-12" style={styles('text-align:center;height:auto;font-size:12px')}>{subscriber.BirthDate}</div>
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
                                <div className="col-12" style={styles('text-align:right;height:auto;font-size:12px;font-weight:bold')}>Precent Number</div>
                            </div>
                            <div className="col-7 p-0 row m-0 options">
                                <div className="col-12" style={styles('text-align:left;height:auto;font-size:12px')}>{subscriber.PrecentNumber}</div>
                            </div>
                        </div>
                        <div className="col-12 p-0 row m-0 options">
                            <div className="col-5 p-0 row m-0 options">
                                <div className="col-12" style={styles('text-align:right;height:auto;font-size:12px;font-weight:bold')}>Cluster Number</div>
                            </div>
                            <div className="col-7 p-0 row m-0 options">
                                <div className="col-12" style={styles('text-align:left;height:auto;font-size:12px')}>{subscriber.ClusterNumber}</div>
                            </div>
                        </div>
                        <div className="col-12 p-0 row m-0 options">
                            <div className="col-5 p-0 row m-0 options">
                                <div className="col-12" style={styles('text-align:right;height:auto;font-size:12px;font-weight:bold')}>Region</div>
                            </div>
                            <div className="col-7 p-0 row m-0 options">
                                <div className="col-12" style={styles('text-align:left;height:auto;font-size:12px')}>{subscriber.RegionName}</div>
                            </div>
                        </div>
                        <div className="col-12 p-0 row m-0 options">
                            <div className="col-5 p-0 row m-0 options">
                                <div className="col-12" style={styles('text-align:right;height:auto;font-size:12px;font-weight:bold')}>Province</div>
                            </div>
                            <div className="col-7 p-0 row m-0 options">
                                <div className="col-12" style={styles('text-align:left;height:auto;font-size:12px')}>{subscriber.ProvinceName}</div>
                            </div>
                        </div>
                        <div className="col-12 p-0 row m-0 options">
                            <div className="col-5 p-0 row m-0 options">
                                <div className="col-12" style={styles('text-align:right;height:auto;font-size:12px;font-weight:bold')}>City/ Municipality</div>
                            </div>
                            <div className="col-7 p-0 row m-0 options">
                                <div className="col-12" style={styles('text-align:left;height:auto;font-size:12px')}>{subscriber.MunicipalityName}</div>
                            </div>
                        </div>
                        <div className="col-12 p-0 row m-0 options">
                            <div className="col-5 p-0 row m-0 options">
                                <div className="col-12" style={styles('text-align:right;height:auto;font-size:12px;font-weight:bold')}>Barangay</div>
                            </div>
                            <div className="col-7 p-0 row m-0 options">
                                <div className="col-12" style={styles('text-align:left;height:auto;font-size:12px')}>{subscriber.BarangayName}</div>
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
                                <div className="col-12" style={styles('text-align:right;height:auto;font-size:12px;font-weight:bold')}>Home Address</div>
                            </div>
                            <div className="col-7 p-0 row m-0 options">
                                <div className="col-12" style={styles('text-align:left;height:auto;font-size:12px')}>{subscriber.HomeAddress}</div>
                            </div>
                        </div>
                        <div className="col-12 p-0 row m-0 options">
                            <div className="col-5 p-0 row m-0 options">
                                <div className="col-12" style={styles('text-align:right;height:auto;font-size:12px;font-weight:bold')}>Present Address</div>
                            </div>
                            <div className="col-7 p-0 row m-0 options">
                                <div className="col-12" style={styles('text-align:left;height:auto;font-size:12px')}>{subscriber.PresentAddress}</div>
                            </div>
                        </div>


                    </div>
                    {/* <div className="bg-cut_lines-img"></div> */}
                    <div className="row m-0 bg-bottom">
                        <div className="col-12 p-0">
                            <div className="horizontal" style={styles('height:auto;padding-top:5px;width:100%;')}>
                                <button className="btn-red" style={styles('width: 100%;height: 10%;padding: 1px 7px;')} type="button" onClick={this.hClose}>CANCEL</button> {/* (click)="handleCloseButton()"*/}
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
            <Modal className="modal-adjustment width-350 no-bg mwf" ref={(ref) => modal = ref} content={<ProfileActionPopUp modal={() => modal} Subscriber={subscriber} />} />
        </>);
        setTimeout(async () => (await modal.onDidDismiss(), stack.pop()));
        return modal;
    }
}