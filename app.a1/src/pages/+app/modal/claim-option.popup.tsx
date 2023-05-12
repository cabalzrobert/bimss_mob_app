import React from 'react';
import { app, OnDidBackdrop } from '../../../tools/app';
import Stack, { Alert, Modal } from '../../../tools/components/+common/stack';
import { styles } from '../../../tools/plugins/element';


export default class ClaimOptionPopUp extends React.Component<{modal:Function}> implements OnDidBackdrop {
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

    hMoneyTransfer=()=>{
        this.dismiss({isMoneyTransfer:true});
    }
    hBankTransfer=()=>{
        this.dismiss({isBankTransfer:true});
    }
    hCashDelivery=()=>{
        this.dismiss({isCashDelivery:true});
    }
    hConvertToGameCredit=()=>{
        this.dismiss({isConvertToGameCredit:true});
    }

    render(){
        return (<>
<div className="modal-container">
    <div className="sm-option-bg">
        <div className="row m-0 bg-top option-container">
            <div className="col-12 p-0 row m-0 options">
                <div className="col-4">
                    <div className="btn-option" onClick={this.hMoneyTransfer}>
                        <div className="horizontal" style={styles('height:auto')}>
                            <img src="./assets/img/img_claim_transfer.png" style={styles('height:30px')} />
                        </div>
                        <div className="horizontal" style={styles('font-weight:bold;text-align:center;font-size:14px')}> Money<br/>Transfer </div>
                    </div>
                </div>
                <div className="col-4">
                    <div className="btn-option" onClick={this.hBankTransfer}>
                        <div className="horizontal" style={styles('height:auto')}>
                            <img src="./assets/img/img_claim_bank.png" style={styles('height:30px')} />
                        </div>
                        <div className="horizontal" style={styles('font-weight:bold;text-align:center;font-size:14px')}> Bank<br/>Transfer </div>
                    </div>
                </div>
                <div className="col-4">
                    <div className="btn-option" onClick={this.hCashDelivery}>
                        <div className="horizontal" style={styles('height:auto')}>
                            <img src="./assets/img/img_claim_cash.png" style={styles('height:30px')} />
                        </div>
                        <div className="horizontal" style={styles('font-weight:bold;text-align:center;font-size:14px')}> Cash<br/>Delivery </div>
                    </div>
                </div>
            </div>
        </div>
        <div className="bg-cut_lines-img"></div>
        <div className="row m-0 bg-bottom">
            <div className="col-12 p-0">
                <div className="horizontal" style={styles('height:auto;font-size:14px;font-weight:bold')}>Please select claim option above.</div>
                <div className="horizontal" style={styles('height:auto;padding-top:5px')}>
                    <button className="btn-red" type="button" onClick={this.hClose}>CANCEL</button> {/* (click)="handleCloseButton()"*/}
                </div>
            </div>
        </div>
    </div>
</div>
        </>);
    }

    static modal=async()=>{
        var modal:any; 
        var stack = await Stack.push(<>
<Modal className="modal-adjustment width-350 no-bg mwf" ref={(ref)=>modal=ref} content={<ClaimOptionPopUp modal={()=>modal} />} />
        </>);
        setTimeout(async()=>(await modal.onDidDismiss(), stack.pop()));
        return modal;
    }
}