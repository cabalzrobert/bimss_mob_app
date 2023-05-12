import { IonInput, IonItem, IonRippleEffect } from '@ionic/react';
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
import TicketDetailsPopUp from './ticket-details.popup';
import { styles } from '../../../tools/plugins/element';


export default class PlaceBetTicketsPopUp extends React.Component<{modal:Function, Tickets:any}> implements OnDidBackdrop {
    state:any = {};
    componentWillMount=()=>{
        app.component(this);
    }
    dismiss=(data:any=undefined)=>this.props.modal().dismiss(data);
    hClose=()=>this.dismiss();

    subscriber:any = {};
    onDidBackdrop(){
        this.dismiss();
        return false;
    }

    hViewItem=(ticket:any)=>{
        this.popUpTicketDetails(ticket);
    }
    popUpTicketDetails=async(ticket:any)=>{
        const modal = await TicketDetailsPopUp.modal(ticket);
        await modal.present();
    }

    render(){
        const tickets = (this.props.Tickets||[]);

        return (<>
<div className="modal-container">
    <div style={styles('padding-top:5px')}>
        <div className="row m-0 header">
            <div className="col-10">Tickets</div>
            <div className="col-2 p-0 btn-close" style={styles('text-align:right;right:5px')} onClick={this.hClose}></div>
        </div>
        <div className='row m-0' style={styles('height:100%;padding:10px 0px')}>
            <div style={styles('position:absolute;right:0;top:0px')} hidden>
                <img src="./assets/img/img_popup_bg.png" style={styles('width:225px')} />
            </div>
            <div className='col-12 m-0' style={styles('padding:0px;padding-bottom:10px')}>
                {tickets?.map((bet:any)=><>
                    <div className="row m-0 ion-activatable" style={styles('position:relative')} onClick={()=>this.hViewItem(bet.Ticket)}> {/**ngFor="let bet of bets" (click)="handleClickItem(bet.Ticket)" */}
                        <IonRippleEffect/>
                        <div className="row col-12 m-0" style={styles('padding:7.5px 10px;position:relative')}>
                            <span style={styles('width:65px;font-weight:bold')}>{bet.BetType} :</span>
                            {!(bet.status!='ok')?null:<><span style={styles('color:red')}>{bet.Message}</span></>}
                            {!(bet.status=='ok')?null:<><span>TRN# {bet.Ticket.TransactionNo}</span></>}
                        </div>
                    </div>
                </>)}
            </div>
        </div>
    </div>
</div>
        </>);
    }

    static modal=async(tickets:any=[])=>{
        var modal:any; 
        var stack = await Stack.push(<>
<Modal className="modal-adjustment width-350" ref={(ref)=>modal=ref} content={<PlaceBetTicketsPopUp modal={()=>modal} Tickets={tickets} />} />
        </>);
        setTimeout(async()=>(await modal.onDidDismiss(), stack.pop()));
        return modal;
    }
} 