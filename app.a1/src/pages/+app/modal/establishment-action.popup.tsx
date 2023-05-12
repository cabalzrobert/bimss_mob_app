import { IonButton, IonFooter, IonInput, IonItem, IonLabel, IonTitle, IonToolbar } from '@ionic/react';
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
import NewEvent from '../../user.page/user-pages/menu-pages/event.new.view';
import UserPager from '../../user.page/user-pager';


export default class EstablishmentActionPopUp extends React.Component<{modal:Function, Subscriber:any,filter:any}> implements OnDidBackdrop {
    state:any = {};
    get pager() { return UserPager.instance.pager; }
    componentWillMount=()=>{
        app.component(this);
        this.subscriber = this.props.Subscriber;
        this.filter=this.props.filter;
    }

    dismiss=()=>this.props.modal().dismiss();
    hClose=()=>this.dismiss();
    hUpdate=async(item:any)=>{
        this.hClose();
        this.pager.next(NewEvent, ({ instance }: { instance: NewEvent }) => instance?.setForm(this.subscriber));
        //this.pager.next(ViewEvents);
        
    }

    subscriber:any = {};
    filter:any={};
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
        //subscriber.isUpdate=true;
        const filter = (this.filter||mtObj);
        return (<>
            {/* <div className="modal-container">
                <div className="sm-option-bg">
                    <div className="row m-0 bg-top option-container">
                        <div className="col-12 p-0 row m-0 options">
                            <div className="col-12" style={styles('background-color: #1d2c65;border-radius: 10px;')}>
                                <div className={classNames('modal-header')} style={styles('color:#fefed1')}>
                                    <div className="horizontal" style={styles('font-weight:bold')}> {subscriber.Est_Name} </div>
                                </div>
                            </div>
                            <div className="col-12" style={styles('background-color: #1d2c65;border-radius: 10px;')}>
                                <div className={classNames('modal-body')} style={styles('color:#fefed1')}>
                                    <div className="" style={styles('height:auto;font-size:14px;font-weight:bold')}>Contact:</div>
                                    <div> {subscriber.ContactDetails} </div><br/>
                                    <div className="" style={styles('height:auto;font-size:14px;font-weight:bold')}>Email</div>
                                    <div className="" style={styles('font-size:12px')}> {subscriber.EmailAddress} </div><br/>
                                    <div className="" style={styles('height:auto;font-size:14px;font-weight:bold')}>Address</div>
                                    <div className="" style={styles('font-size:12px')}> {subscriber.Address} </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="row m-0 bg-bottom">
                        <div className="col-12 p-0">
                            <div className="horizontal" style={styles('height:auto;padding-top:5px')}>
                                <button className="btn-red" type="button" onClick={this.hClose} style={styles('width:100%;')}>CANCEL</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div> */}
            <div style={styles('color:#737373;padding:2%;')}> 
                <div>
                    <IonTitle style={styles('font-weight:bold;font-size:18pt;')}>{subscriber.Est_Name} </IonTitle>
                </div>
                <div style={styles('padding-left:6%;padding-right:6%;margin-bottom:5%;margin-top:2%;')}>
                    <div style={styles('font-weight:bold;font-size:12pt;')}>
                        <IonLabel >Contact</IonLabel>
                    </div>
                    <div>
                        <IonLabel>{!subscriber.ContactDetails ? '-' : subscriber.ContactDetails.replace('Telphone::',',Telephone:')}</IonLabel>
                    </div>
                    <div style={styles('font-weight:bold;font-size:12pt;margin-top:2.5px;')}>
                        <IonLabel >Email</IonLabel>
                    </div>
                    <div>
                        <IonLabel>{!subscriber.EmailAddress ? '-' : subscriber.EmailAddress}</IonLabel>
                    </div>
                    <div style={styles('font-weight:bold;font-size:12pt;margin-top:2.5px;')}>
                        <IonLabel >Address</IonLabel>
                    </div>
                    <div>
                        <IonLabel>{!subscriber.Address ? '-' : subscriber.Address}</IonLabel>
                    </div>
                </div>
                <IonFooter>
                    <div style={styles('height:auto;padding-top:1%;')}>
                        <IonButton onClick={this.hClose} style={styles('width:100%;--background:rgb(219 221 237);--color:#737373;font-size:12pt;font-weight:bold;--border-radius:10px;')}>CANCEL</IonButton>
                    </div>
                </IonFooter>
            </div>
        </>);
    }

    static modal=async(subscriber:any,filter:any={})=>{
        var modal:any; 
        var stack = await Stack.push(<>
<Modal className="modal-adjustment width-350 no-bg mwf" ref={(ref)=>modal=ref} content={<EstablishmentActionPopUp modal={()=>modal} Subscriber={subscriber} filter={filter} />} />
        </>);
        setTimeout(async()=>(await modal.onDidDismiss(), stack.pop()));
        return modal;
    }
}