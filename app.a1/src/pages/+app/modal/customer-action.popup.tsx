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


export default class CustomerActionPopUp extends React.Component<{modal:Function, Subscriber:any}> implements OnDidBackdrop {
    state:any = {};
    componentWillMount=()=>{
        app.component(this);
        this.subscriber = this.props.Subscriber;
    }

    dismiss=()=>this.props.modal().dismiss();
    hClose=()=>this.dismiss();

    subscriber:any = {};
    onDidBackdrop(){
        this.dismiss();
        return false;
    }

    hPowerAp=async()=>{
        if(this.subscriber.IsBlocked)
            return toast('Account bas been blocked');
        const modal = await PowerApPopUp.modal(this.subscriber);
        await modal.present();
        await modal.onDidDismiss();
        this.dismiss();
    }
    hCall=()=>{
        if(device.isBrowser){
            Alert.showWarningMessage('not applicable to browser');
            return;
        }
        return openDialer(this.subscriber.MobileNumber);
    }   
    hText=()=>{
        if(device.isBrowser){
            Alert.showWarningMessage('not applicable to browser');
            return;
        }
        return openSms(this.subscriber.MobileNumber);
    }

    render(){
        const subscriber = (this.subscriber||mtObj);
        return (<>
<div className="modal-container">
    <div className="sm-option-bg">
        <div className="row m-0 bg-top option-container">
            <div className="col-12 p-0 row m-0 options">
                <div className="col-4">
                    <div className={classNames('btn-option',{'disabled':subscriber.IsBlocked})} onClick={this.hPowerAp}>
                        <div className="horizontal" style={styles('height:auto')}>
                            <img src="./assets/img/profile_power_ap.png" style={styles('height:45px')} />
                        </div>
                        <div className="horizontal" style={styles('font-weight:bold')}> {subscriber.Tittle} </div>
                    </div>
                </div>
                <div className="col-4">
                    <div className="btn-option" onClick={this.hCall}>
                        <div className="horizontal" style={styles('height:auto')}>
                            <img src="./assets/img/customer_option_call.png" style={styles('height:45px')} />
                        </div>
                        <div className="horizontal" style={styles('font-weight:bold')}> Call </div>
                    </div>
                </div>
                <div className="col-4">
                    <div className="btn-option" onClick={this.hText}>
                        <div className="horizontal" style={styles('height:auto')}>
                            <img src="./assets/img/customer_option_text.png" style={styles('height:45px')} />
                        </div>
                        <div className="horizontal" style={styles('font-weight:bold')}> Text </div>
                    </div>
                </div>
            </div>
        </div>
        <div className="bg-cut_lines-img"></div>
        <div className="row m-0 bg-bottom">
            <div className="col-12 p-0">
                <div className="horizontal" style={styles('height:auto;font-size:14px;font-weight:bold')}>Please select option above.</div>
                <div className="horizontal" style={styles('height:auto;padding-top:5px')}>
                    <button className="btn-red" type="button" onClick={this.hClose}>CANCEL</button> {/* (click)="handleCloseButton()"*/}
                </div>
            </div>
        </div>
    </div>
</div>
        </>);
    }

    static modal=async(subscriber:any={})=>{
        var modal:any; 
        var stack = await Stack.push(<>
<Modal className="modal-adjustment width-350 no-bg mwf" ref={(ref)=>modal=ref} content={<CustomerActionPopUp modal={()=>modal} Subscriber={subscriber} />} />
        </>);
        setTimeout(async()=>(await modal.onDidDismiss(), stack.pop()));
        return modal;
    }
}