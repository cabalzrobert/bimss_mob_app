import { IonInput, IonItem } from '@ionic/react';
import React from 'react';
import styled from 'styled-components';
import { rest } from '../+service/rest.service';
import { app, OnDidBackdrop } from '../../../tools/app';
import Stack, { Alert, Modal } from '../../../tools/components/+common/stack';
import { numberWithComma } from '../../../tools/global';
import { classNames, Input, styles } from '../../../tools/plugins/element';

import { additionalCreditBalance, additionalWinningBalance, jUser, jUserModify } from '../user-module';

export default class ConvertToGameCreditPopUp extends React.Component<{modal:Function}> implements OnDidBackdrop {
    state:any = { u:{} }
    componentWillMount=()=>{
        app.component(this);
        this.subs.u = jUserModify(async()=>this.setState({u:await jUser()}));
    }

    dismiss=()=>this.props.modal().dismiss();
    hClose=()=>this.dismiss();

    subs:any = {};
    msg:any = {};
    input:any = {};
    componentDidMount=()=>{} 
    componentWillUnmount=()=>{
        Object.values(this.subs).map((m:any)=>m.unsubscribe());
    }

    onDidBackdrop(){
        this.dismiss();
        return false;
    }

    hConfirm=()=>{
        if(!this.isValidEntries()) return;
        Alert.swal({
            title: 'Confirmation',
            text: 'Are you sure you want to Continue?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Confirm!', //'Yes, delete it!',
            cancelButtonText: 'Cancel', //'No, keep it',
            allowOutsideClick: false,
            backdropDismiss:false,
            confirmButtonColor: "#218838",   
            cancelButtonColor: "#c82333",
            reverseButtons: true,
        }, (res:any)=>{
            if(res.isConfirmed){
                Alert.showProgressRequest();
                return setTimeout(()=>this.performSubmit(), 750);
            }
        });
    }
    private performSubmit(){
        rest.post('winning/claiming', this.input).subscribe(async(res:any)=>{
            if(res.Status=='ok'){
                this.performLocalProcess();
                return Alert.showSuccessMessage(res.Message,()=>this.hClose());
            }
            Alert.showErrorMessage(res.Message);
        },(err:any) =>{ 
            Alert.showWarningMessage('Please try again');
        });
    }
    private performLocalProcess(includeCreditBalance:boolean=false){
        var deductBalance = (+this.input.Amount * -1);
        additionalWinningBalance(deductBalance);
        if(includeCreditBalance){
            additionalCreditBalance(+this.input.Amount);
        }
    }

    private isValidEntries():boolean{
        var { u } = this.state;
        var isValid = true;

        var amount = this.input.Amount; 
        if(!amount){
            this.msg.Amount = 'Please enter amount to convert';
            isValid = false;
        }else{
            amount = +amount;
            if(+u.WinningBalance < amount){
                this.msg.Amount = 'Insufficient Balance';
                isValid = false;
            }else if(amount < 10){
                this.msg.Amount = 'Minimum transaction is 10 credit';
                isValid = false;
            } 
        }
        if(isValid){

        }
        this.input.IsValid = isValid;
        this.setState({msg:this.msg, input:this.input});
        return isValid;
    }

    hState=(ev:any, key:string)=>{
        this.msg[key]=null;
        this.input[key]=ev.detail.value;
        this.setState({msg:this.msg});
    }

    render(){
        const{ u, msg={}, input={} } = this.state;
        return (<>
<div className="modal-container">
    <div style={styles('padding-top:5px')}>
        <div className="row m-0 header">
            <div className="col-10">Convert to Game Credit</div>
            <div className="col-2 p-0 btn-close" style={styles('text-align:right;right:5px')} onClick={this.hClose}></div>
        </div>
        <div className='row m-0 bootstrap-form old' style={styles('height:100%;padding:10px 0px')}>
            <div className='col-12 form-container' style={styles('padding:0px 35px')} >
                <div className="horizontal" style={styles('height:auto;padding-bottom:10px')}>
                    <div className="vertical" style={styles('padding-right:7.5px')}>
                        <img src="./assets/svg/icon_peso_coin.svg" style={styles('height:40px')} />
                    </div>
                    <div style={styles('height:auto')}>
                        <div style={styles('font-size:85%')}>Winning Balance</div>
                        <div style={styles('font-size:120%;margin-top:-7.5px')}><b>{numberWithComma(u.WinningBalance)}</b></div>
                    </div>
                </div>
                <form className={classNames('needs-validation',{'form-invalid':!input.IsValid})} noValidate onSubmit={(ev)=>ev.preventDefault()}>
                    <div className={classNames({'input-invalid':!!msg.Amount})} style={styles('position:relative')} >
                        <IonItem className='input-error' style={styles('--highlight-background:unset;--min-height:40px;padding-top:2.5px')}>          
                        <Input ion node={(handle) => <>
                            <IonInput className="text-center font-bold br-0" style={styles('--padding-bottom:0px;--padding-top:0px')} 
                                type="number" placeholder="Amount" 
                                value={input.Amount} {...handle({onChange:(ev)=>this.hState(ev,'Amount')})}/>                                   
                                                                       </>}/>
                            
                        </IonItem>
                        <div className="invalid-tooltip">{msg.Amount}&nbsp;</div>
                    </div>
        
                    <div className="horizontal" style={styles('margin-top:5px;height:auto')}>
                        <button className="btn-green" style={styles('width:200px')} type="button" onClick={this.hConfirm}>CONFIRM</button> {/* (click)='handleClickConfirm()' */}
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>
        </>);
    }

    static modal=async()=>{
        var modal:any; 
        var stack = await Stack.push(<>
<Modal className="modal-adjustment" ref={(ref)=>modal=ref} content={<ConvertToGameCreditPopUp modal={()=>modal} />} />
        </>);
        setTimeout(async()=>(await modal.onDidDismiss(), stack.pop()));
        return modal;
    }
}