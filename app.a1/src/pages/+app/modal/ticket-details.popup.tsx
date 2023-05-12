import React from 'react';
import styled from 'styled-components';
import { app, OnDidBackdrop } from '../../../tools/app';
import Stack, { Alert, Modal } from '../../../tools/components/+common/stack';
import { storage } from '../../../tools/plugins/storage';
import { numberWithComma } from '../../../tools/global';
import { QRCode } from "react-qr-svg";
import { classNames, styles } from '../../../tools/plugins/element';
import { jUser, jUserModify } from '../user-module';
import { rest } from '../+service/rest.service';
import { printTicket, Ticket } from '../main-module';
import { mtObj } from '../../../tools/plugins/static';

export default class TicketDetailsPopUp extends React.Component<{modal:Function, Ticket:any, Winning?:any, IsCurrent?:boolean }> implements OnDidBackdrop { //IsTeller?:boolean, CanReprint?:boolean
    state = { u:{} };
    componentWillMount=()=>{
        app.component(this);
        this.subs.u = jUserModify(async()=>this.setState({u:await jUser()}));
    }
    
    dismiss=(data:any=undefined)=>this.props.modal().dismiss(data);
    subs:any = {};
    componentDidMount=()=>{}
    componentWillUnmount=()=>{
        Object.values(this.subs).map((m:any)=>m.unsubscribe());
    }
    onDidBackdrop(){
        this.dismiss();
        return false;
    }

    hClose=()=>this.dismiss();
    
    hClaim=()=>{
        this.dismiss({isClaim:true});
    }

    hReprint=()=>{
        Alert.swal({
            title: 'Confirmation',
            text: 'Are you sure you want to Reprint?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Confirm!',
            cancelButtonText: 'Cancel',
            allowOutsideClick: false,
            backdropDismiss:false,
            confirmButtonColor: "#218838",   
            cancelButtonColor: "#c82333",
            reverseButtons: true,
        }, (res:any)=>{
            if(res.isConfirmed){
                Alert.showProgressRequest();
                return setTimeout(()=>this.performReprint(), 750);
                //
            }
        });
    }
    async performReprint(){
        const ticket = this.props.Ticket||{};
        if(!ticket.TransactionNo)return;
        return rest.post('lottery/reprint/'+ticket.TransactionNo,mtObj).subscribe(async(res:any)=>{
            if(res.Status=='ok'){
                await printTicket(Ticket(res.Ticket));
                return Alert.swal(false);
            }
            Alert.showErrorMessage(res.Message);
        },(err:any) =>{ 
            Alert.showWarningMessage('Please try again');
        });
    }


    render(){
        const u:any = (this.state.u||{});//this.props.u||{};
        const ticket = this.props.Ticket||{};
        const isWinning = (typeof(this.props.Winning)=='number');
        const winningAmount = (!isWinning?0:this.props.Winning);
        const isTeller = (!!(ticket.Customer||'').trim() || (u.Terminal===true));
        const canReprint = (this.props.IsCurrent&&isTeller);
        return (<>
<div className="modal-container">
    <div className="bet-ticket-summary">
        <div className="row m-0 header fixed">
            <div className="col-10"></div>
            <div className="col-2 p-0 btn-close" onClick={this.hClose}></div>
        </div>
        <div className="row m-0 bg-top">
            <div className="col-12 p-0">
                <table style={styles('width:100%','font-size:14px')}>
                    {!isTeller?<>
                    <tr><td className="ticket-info">CUSTOMER NAME:</td><td className="ticket-info-details">{u.Fullname}</td></tr>
                    <tr><td className="ticket-info">EMAIL ADDRESS:</td><td className="ticket-info-details">{u.EmailAddress}</td></tr>
                    <tr><td className="ticket-info">CONTACT NUMBER:</td><td className="ticket-info-details">{u.MobileNumber}</td></tr>
                    <tr><td className="ticket-info">ACCOUNT NUMBER:</td><td className="ticket-info-details">{u.AccountID}</td></tr>
                    </>:<>
                    <tr><td className="ticket-info">TELLER ID:</td><td className="ticket-info-details">{u.AccountID}</td></tr>
                    <tr><td className="ticket-info">TELLER NAME:</td><td className="ticket-info-details">{u.Fullname}</td></tr>
                    <tr><td className="ticket-info">CUSTOMER:</td><td className="ticket-info-details">{(ticket.Customer||'-')}</td></tr>
                    </>}
                    <tr><td className="ticket-info">TICKET DATE:</td><td  className="ticket-info-details nowrap">{ticket.DateoPosted} {ticket.TimeoPosted}</td></tr>
                </table>
            </div>
            <div className="col-12 p-0 ticket-bets-panel">
                <table style={styles('width:100%','margin-bottom:2.5px')}>
                    <tbody>
                        <tr>
                            <td className="ticket-header">CTR</td>
                            <td className="ticket-header">COMBI.</td>
                            <td className="ticket-header">Bet(S):</td>
                            <td className="ticket-header">Bet(R):</td>
                            <td className="ticket-header">Status</td>
                        </tr>
                        {ticket.Draws?.map((b:any)=><>
                            <tr className={classNames({'ticket-win':!!b.WinType},(!b.WinType?'':(b.WinType||'').toLowerCase().replace('/',' ')))}>
                                <td className="ticket-details">{(b.TransactionNo+'-'+b.SequenceNo)}</td>
                                <td><div className="ticket-details2">{(b.Combination||b.Numbers)}</div></td>
                                <td><div className="ticket-details3">{numberWithComma(b.StraightAmount,2)}</div></td>
                                <td><div className="ticket-details4">{numberWithComma(b.RumbleAmount,2)}</div></td>
                                <td className="ticket-details5">
                                    {(!!b.IsSoldOut)?null:<span style={styles('color:green')}>OK</span>}
                                    {(!b.IsSoldOut)?null:<span style={styles('color:red')}>Sold Out</span>}
                                </td>
                            </tr>
                        </>)}
                        <tr>
                            <td className="ticket-footer-details">Total Bet</td><td></td>
                            <td><div className="ticket-footer-details2">{numberWithComma(ticket.TotalStraightAmount,2)}</div></td>
                            <td><div className="ticket-footer-details3">{numberWithComma(ticket.TotalRumbleAmount,2)}</div></td><td></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        <div className="bg-cut_lines-img"></div>
        <div className="row m-0 bg-bottom">
            <div className="col-12 p-0 horizontal ticket-title" style={styles('height:auto')}>
                TICKET NO: {ticket.TransactionNo}
            </div>
            <div className="col-12 p-0 row m-0">
                <div className="col-3 p-0 horizontal" style={styles('height:auto')} >
                    <div style={styles('background-color:white')}>
                        <QRCode value={(ticket.TransactionNo||'-')} level='Q' style={styles('margin:5px;height:70px')} />
                    </div>
                </div>
                <div className="col-9" style={styles('padding:0px;padding-left:5px')}>
                    <table style={styles('width:100%')}>
                        <tr><td className="ticket-overall">TOTAL TRANSACTION:</td><td className="ticket-overall-details">{numberWithComma(ticket.TotalBetCount,0)}</td></tr>
                        <tr><td className="ticket-overall">TOTAL AMOUNT:</td><td className="ticket-overall-details">{numberWithComma(ticket.TotalBetAmount,2)}</td></tr>
                    </table>
                    <div style={styles('margin-top:-5px')}>
                        <div className="ticket-confirmation">
                            <img className="confirmation-icon" src="./assets/img/ticket_sent_icon.png" />
                            <span className="confirmation-title">TICKET CONFIRMATION</span>
                        </div>
                        <div className="ticket-confirmation">
                            <img className="confirmation-icon" src="./assets/img/ticket_sent_icon.png" />
                            <span className="confirmation-title">SMS CONFIRMATION</span>
                        </div>
                        <div className="ticket-confirmation" hidden> 
                            <img className="confirmation-icon" src="./assets/img/ticket_sent_icon.png" />
                            <span className="confirmation-title">EMAIL CONFIRMATION</span>
                        </div>
                    </div>
                </div>
            </div>
            {!!isWinning?null:
            <div className="col-12 p-0 row" style={styles('margin:0px;margin-top:7.5px')}>
                <div className="col-12 p-0 horizontal" style={styles('height:85px')}>
                    <img src="./assets/img/img_stl_logo.png" style={styles('width:75px;height:75px')} />
                    <SvgLicensce width="100%" height="100%" viewBox="0 0 275 45" preserveAspectRatio="xMinYMin meet" style={styles('width:70%;margin-left:5px')}>
                        <foreignObject className="ticket-license-text">
                            <div className="horizontal" style={styles('font-size:11px;font-weight:bold;color:#212529')} >PHILIPPINE CHARITY SWEEPSTAKES OFFICE</div>      
                            <div className="horizontal" style={styles('font-size:13px')}>Victoria Development and Ventures Corp.</div>
                            <div className="horizontal" style={styles('font-size:10px')}>STL License #: CS 000-000-000</div>
                            <div className="horizontal" style={styles('font-size:10px')}>TIN #: 000-000-000</div>
                            <div className="horizontal">Purok Slaughter, Brgy 99 Diit, Tacloban City</div>
                        </foreignObject>
                    </SvgLicensce>
                </div>
                {!!canReprint?null:<>
                    <div className="col-12 p-0">
                        <div className="horizontal" style={styles('padding-top:5px')}>
                            <button className="btn-green" type="button" style={styles('width:90px')} onClick={this.hClose}>OK</button>
                        </div>
                    </div>
                </>}
                {!canReprint?null:<>
                    <div className="col-12 p-0" >
                        <div className="horizontal" style={styles('padding-top:5px')}>
                            <button className="btn-green" type="button"  style={styles('width:90px')} onClick={this.hReprint}>Reprint</button>
                        </div>
                    </div> 
                </>}
            </div>
            }
            {!isWinning?null:<>
            <div className="col-12 p-0 row" style={styles('margin:0px;margin-top:12.5px')}>
                <div className="col-12 p-0">
                    <div className="horizontal" style={styles('height:auto;font-weight:bold')}>AMOUNT WINNING</div>
                    <div className="horizontal" style={styles('font-size:35px;font-weight:bold;height:45px;margin-top:-12.5px;color:green')}>{numberWithComma(winningAmount, 2)}</div>
                </div>
                <div className="col-12 p-0">
                    <div className="horizontal" style={styles('padding-top:5px')}>
                        <button className="btn-green" type="button" style={styles('width:100px')} onClick={this.hClaim}>CLAIM</button>
                    </div>
                </div>
            </div>
            </>}
        </div>
    </div>
</div>
        </>);
    }


    static modal=async(ticket:any, {isCurrent=false, winningAmount=undefined}={})=>{
        var modal:any; 
        var stack = await Stack.push(<>
<Modal className="modal-adjustment width-400 no-bg mwf" ref={(ref)=>modal=ref} content={<TicketDetailsPopUp modal={()=>modal} Ticket={ticket} IsCurrent={isCurrent} Winning={winningAmount} />} />
        </>);
        setTimeout(async()=>(await modal.onDidDismiss(), stack.pop()));
        return modal;
    }
}

//styles
const SvgLicensce = styled.svg`
>.ticket-license-text{
    width: 250px;
    height: 90px;
    >*{ 
        font-size: 12px;
        height: auto; 
        color: darkgray;
        margin-top: -2.5px;
        white-space: nowrap; 
    } 
}
`;