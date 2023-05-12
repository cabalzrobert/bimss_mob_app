import { IonInput, IonItem } from '@ionic/react';
import React from 'react';
import styled from 'styled-components';
import { rest } from '../+service/rest.service';
import { app, OnDidBackdrop } from '../../../tools/app';
import Stack, { Alert, Modal } from '../../../tools/components/+common/stack';
import { numberWithComma } from '../../../tools/global';
import { styles } from '../../../tools/plugins/element';


export default class CreditReceivedPopUp extends React.Component<{modal:Function, CreditAmount?:Number}> implements OnDidBackdrop {
    state:any = {};
    componentWillMount=()=>{
        app.component(this);
    }
    dismiss=()=>this.props.modal().dismiss();
    hClose=()=>this.dismiss();

    onDidBackdrop(){
        this.dismiss();
        return false;
    }
    render(){
        return (<>
<div className="modal-container">
    <div className="md-credit-received-bg">
        <div className="row m-0 bg-top-2">
            <div className="col-12 horizontal" style={styles('position:absolute;left:0;z-index:2;height:auto')}>
                <div className="horizontal"> {/*<!--style="width: 50%;"-->*/}
                    <img src="./assets/img/notif_game_credit_popup_icon.png" style={styles('height:130px')}/>
                </div>  
            </div>
        </div>
        <div className="row m-0 bg-top">
            <div className="col-12 horizontal">
                <div className="panel-credit-received-info">
                    <div className="title">Received Credit</div>
                    <div className="credit-amount">{numberWithComma(this.props.CreditAmount)}</div>
                    <div className="type">Load Credit</div>
                </div>  
            </div>
        </div>
        <div className="bg-cut_lines-img"></div>
        <div className="row m-0 bg-bottom">
            <div className="col-12 p-0 horizontal">
                <div className="panel-credit-received-info">
                    <div className="descriptions">
                        <div className="desc1">Check cash in Transaction</div>
                        <div className="desc2">in Credit Ledger</div>
                    </div>
                </div>   
            </div>
            <div className="col-12 p-0 horizontal" style={styles('padding-top:5px')}>
                <button className="btn-green" type="button" style={styles('height:45px;width:145px')} onClick={this.hClose}>DISMISS</button>
            </div>
        </div>
    </div>
</div>
        </>);
    }

    static modal=async(creditAmount:number)=>{
        var modal:any; 
        var stack = await Stack.push(<>
<Modal className="modal-adjustment width-450 no-bg" ref={(ref)=>modal=ref} content={<CreditReceivedPopUp modal={()=>modal} CreditAmount={creditAmount} />} />
        </>);
        setTimeout(async()=>(await modal.onDidDismiss(), stack.pop()));
        return modal;
    }
}