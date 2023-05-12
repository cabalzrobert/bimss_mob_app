import { IonInput, IonItem, IonLabel, IonSelect, IonSelectOption } from '@ionic/react';
import React from 'react';
import styled from 'styled-components';
import { rest } from '../+service/rest.service';
import { app, OnDidBackdrop } from '../../../tools/app';
import Stack, { Alert, Modal } from '../../../tools/components/+common/stack';
import { numberWithComma } from '../../../tools/global';
import { classNames, styles } from '../../../tools/plugins/element';

const{ Object }:any = window;

export default class RemittanceDetailsPopUp extends React.Component<{modal:Function, Remittance?:any}> implements OnDidBackdrop {
    state:any = { u:{} };
    componentWillMount=()=>{
        app.component(this);
    }

    dismiss=(data:any={})=>this.props.modal().dismiss(data);
    hClose=()=>this.dismiss();

    remittance:any = {};
    onDidBackdrop(){
        this.dismiss();
        return false;
    }

    render(){
        const remittance = this.props.Remittance||{};
        return (<>
<div className="modal-container">
    <Panel>
        <div className="row m-0 header">
            <div className="col-10">Claim Details</div>
            <div className="col-2 p-0 btn-close" style={styles('text-align:right;right:5px')} onClick={this.hClose}></div>
        </div>
        <div className='row m-0' style={styles('height:100%;padding:10px 0px')}>
            <div className='col-12' style={styles('padding:0px 10px')}>
                <div className="row m-0">
                    <div className="col-12 p-0">
                        <table style={styles('width:100%;font-size:14px')}>
                            <tr><td className="remittance-info">Status :</td><td>
                                <span className={classNames('badge',{'badge-warning':remittance.IsPending,'badge-success':remittance.IsCompleted,'badge-danger':remittance.IsCancelled})}
                                    style={styles('color:whitesmoke;font-size:15px;border-radius:10px')} > 
                                    {remittance.TransactionStatus}
                                </span>
                            </td></tr>
                            <tr><td className="remittance-info">Transaction No :</td><td className="remittance-info-details">{remittance.TransactionNo}</td></tr>
                            <tr><td className="remittance-info">Amount :</td><td className="remittance-info-details">{numberWithComma(remittance.Amount)}</td></tr>
                            {!remittance.IsBank?null:<>
                                <tr><td className="remittance-info">Encash Type :</td><td className="remittance-info-details">Bank to Bank Transfer</td></tr>
                                <tr><td className="remittance-info">Bank Name :</td><td className="remittance-info-details">{remittance.Remittance}</td></tr>
                                <tr><td className="remittance-info">Account No :</td><td className="remittance-info-details">{remittance.Bank?.AccountNo}</td></tr>
                                <tr><td className="remittance-info">Account Name :</td><td className="remittance-info-details">{remittance.Bank?.AccountName}</td></tr>
                                                    
                            </>}
                            {!(remittance.IsCashDelivery || remittance.IsMoneyTransfer)?null:<>
                                <tr><td className="remittance-info">Encash Type :</td><td className="remittance-info-details">{(remittance.IsCashDelivery?'Cash Delivery':'Money Transfer Remittance')}</td></tr>
                                <tr><td className="remittance-info">Remittance :</td><td className="remittance-info-details">{remittance.Remittance}</td></tr>
                                <tr><td className="remittance-info">Receiver Contact :</td><td className="remittance-info-details">{remittance.Receiver?.MobileNumber}</td></tr>
                                <tr><td className="remittance-info">Name of Receiver :</td><td className="remittance-info-details">{remittance.Receiver?.Fullname}</td></tr>
                                {!remittance.IsCashDelivery?null:<>
                                    <tr ><td className="remittance-info">Address :</td><td className="remittance-info-details">{remittance.Receiver?.Address}</td></tr>
                                </>}
                            </>}
                            {!remittance.IsConvertToGameCredit?null:<>
                                <tr><td className="remittance-info">Request :</td><td className="remittance-info-details">Convert to Game Credit</td></tr>
                            </>}
                            <tr><td className="remittance-info">Date Request :</td><td className="remittance-info-details">{remittance.FulldateRequested}</td></tr>
                        </table>
                        {!remittance.IsCompleted?null:<>
                            <div>
                                <hr style={styles('margin:10px 0px')} />
                                <div className="horizontal" style={styles('height:auto')}>- Confirmation Detials -</div>
                                <table style={styles('width:100%;font-size:14px')}>
                                    <tr><td className="remittance-info">Reference No :</td><td className="remittance-info-details">{remittance.Depositor.ReferenceID}</td></tr>
                                    <tr><td className="remittance-info">Amonnt Win :</td><td className="remittance-info-details">{numberWithComma(remittance.Depositor.WinAmount)}</td></tr>
                                    <tr><td className="remittance-info">Service Fee :</td><td className="remittance-info-details">{numberWithComma(remittance.Depositor.ServiceFee)}</td></tr>
                                    <tr><td className="remittance-info">Total Deposit :</td><td className="remittance-info-details">{numberWithComma(remittance.Depositor.TotalSent)}</td></tr>
                                    <tr><td className="remittance-info">Sender Name :</td><td className="remittance-info-details">{remittance.Depositor?.Fullname}</td></tr>
                                    <tr><td className="remittance-info">Sender Contact :</td><td className="remittance-info-details">{remittance.Depositor?.MobileNumber}</td></tr>
                                    <tr><td className="remittance-info">Date Completed :</td><td className="remittance-info-details">{remittance.FulldateCompleted}</td></tr>
                                </table>
                            </div>  
                        </>}
                    </div>
                </div>
            </div>
        </div>
    </Panel>
</div>
        </>);
    }

    static modal=async(remittance:any={})=>{       
        var modal:any; 
        var stack = await Stack.push(<>
<Modal className="modal-adjustment width-350" ref={(ref)=>modal=ref} content={<RemittanceDetailsPopUp modal={()=>modal} Remittance={remittance}/>} />
        </>);
        setTimeout(async()=>(await modal.onDidDismiss(), stack.pop()));
        return modal;
    }
}

//styles
const Panel = styled.div`
padding-top:5px;
min-height: 254.5px;
&::before{
    content: ' ';
    background-color: whitesmoke;
    position: absolute;
    top: 0;
    height: 100%;
    width: 100%;
}
.remittance-info{
    width: 1%;
    font-size: 12px;
    text-align: right;
    padding-right: 2.5px;
    white-space: nowrap;
}
.remittance-info-details{
    font-weight: bold;
    font-size: 15px;
    white-space: nowrap;
}
`;