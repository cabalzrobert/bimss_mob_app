import { IonInput, IonItem, IonLabel, IonSelect, IonSelectOption } from '@ionic/react';
import React from 'react';
import styled from 'styled-components';
import { rest } from '../+service/rest.service';
import { app, OnDidBackdrop } from '../../../tools/app';
import Stack, { Alert, Modal } from '../../../tools/components/+common/stack';
import { numberWithComma } from '../../../tools/global';
import { classNames, inputVal, styles } from '../../../tools/plugins/element';
import { Customer } from '../main-module';
import { additionalCreditBalance, jUser, jUserModify } from '../user-module';

const{ Object }:any = window;

export default class PowerApRequestPopUp extends React.Component<{modal:Function, Subscriber?:any}> implements OnDidBackdrop {
    state:any = { u:{} };
    componentWillMount=()=>{
        app.component(this);
        const{ input } = this;
        this.subs.u = jUserModify(async()=>this.setState({u:await jUser()}));
        const subscriber = (this.subscriber = this.props.Subscriber);
        if(!!subscriber){
            input.HasSubscriber = true;
            input.Transaction = subscriber;
            input.Subscriber = subscriber.AccountID;
            input.Amount = +subscriber.RequestCredit;
            this.setState({input});
        }
    } 

    dismiss=(data:any={})=>this.props.modal().dismiss(data);
    hClose=()=>this.dismiss();

    subscriber:any = {};
    subs:any = {};
    msg:any = {};
    input:any = { Type:'credit' };
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
                Object.rcopy(this.input,{Status:'1'});
                Alert.showProgressRequest();
                return setTimeout(()=>this.performSubmit(), 750);
            }
        });
    }
    hCancel=()=>{
        Alert.swal({
            title: 'Confirmation',
            text: 'Are you sure you want to Cancelled?',
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
                Object.rcopy(this.input,{Status:'0'});
                Alert.showProgressRequest();
                return setTimeout(()=>this.performSubmit(), 750);
            }
        });
    }
    private performSubmit(){
        rest.post('a/credit/approval', this.input).subscribe(async(res:any)=>{
            if(res.Status=='ok'){
                if(this.input.Status=='1')
                    this.performLocalProcess();
                this.details(Object.rcopy(this.subscriber, res.Data));
                return Alert.showSuccessMessage(res.Message,()=>this.dismiss({item:this.subscriber}));
            }
            Alert.showErrorMessage(res.Message);
        },(err:any) =>{ 
            Alert.showWarningMessage('Please try again');
        });
    }
    private performLocalProcess(){
        var deductBalance = (+this.input.Amount * -1);
        additionalCreditBalance(deductBalance);
    }
    
    private details(item:any){
        item.Status = '';
        if(item.IsPending) {
            item.StatusColor = 'white';
            item.Status = 'Pending';
        }else if(item.IsApproved){
            item.RequestColor = 'limegreen';
            if(item.IsPaid) {
                item.StatusColor = 'limegreen';
                item.Status = 'Paid';
            }else if(item.IsUnpaid){
                item.IsCredit = true;
                item.StatusColor = 'red';
                item.Status = 'Unpaid';
            }
        }else if(item.IsCancelled){
            item.RequestColor = 'red';
            item.StatusColor = 'red';
            item.Status = 'Cancelled';
        }
        return Customer(item);
    }

    private isValidEntries():boolean{
        var { u } = this.state;
        var isValid = true;
        var subscriber = (this.input.Subscriber||'').toString();
        if(!subscriber){
            this.msg.Subscriber = 'Please enter account/mobile number';
            isValid = false;
        }else if(subscriber.length<6){
            this.msg.Subscriber = 'Please enter a valid account/mobile number';
            isValid = false;
        }else if(subscriber==u.AccountID||subscriber==u.MobileNumber){
            this.msg.Subscriber = 'You cannot share to your own account number!';
            isValid = false;
        }

        var amount = this.input.Amount; 
        if(!amount){
            this.msg.Amount = 'Please enter load credit amount';
            isValid = false;
        }else{
            amount = +amount;
            if(amount < 10){
                this.msg.Amount = 'Minimum transaction is 10 cash credit';
                isValid = false;
            }else if(+u.CreditBalance < amount){
                this.msg.Amount = 'Insufficient Balance';
                isValid = false;
            }
        }

        if(isValid){
            if(this.subscriber!=null){
                this.input.Subscriber = this.subscriber.AccountID;
            }
        }
        this.setState({msg:this.msg, input:this.input});
        return isValid;
    }

    hState=(ev:any, key:string)=>{
        this.msg[key]=null;
        this.input[key]=ev.detail.value;
        this.setState({msg:this.msg, input:this.input});
    }


    render(){
        const{ u, msg={}, input={} } = this.state;
        return (<>
<div className="modal-container">
    <Panel>
        <div className="row m-0 header">
            <div className="col-10">Power-AP Request</div>
            <div className="col-2 p-0 btn-close" style={styles('text-align:right;right:5px')} onClick={this.hClose}></div>
        </div>
        <div className='row m-0 bootstrap-form old' style={styles('height:100%;padding:10px 0px')}>
            <div className='col-12 form-container' style={styles('padding:0px 35px')} >  
                <div className="horizontal" style={styles('height:auto;padding-bottom:10px')}>
                    <div className="vertical" style={styles('padding-right:7.5px')}>
                        <img src="./assets/svg/icon_peso_coin.svg" style={styles('height:40px')} />
                    </div>
                    <div style={styles('height:auto')}>
                        <div style={styles('font-size:85%')}>Credit Balance</div>
                        <div style={styles('font-size:120%;margin-top:-7.5px')}><b>{numberWithComma(u.CreditBalance)}</b></div>
                    </div>
                </div>
                <form className={classNames('needs-validation',{'form-invalid':!input.IsValid})} noValidate onSubmit={(ev)=>ev.preventDefault()}>
                    <div className={classNames({'input-invalid':!!msg.Subscriber})} style={styles('position:relative')}>
                        <IonItem className='input-error' style={styles('--highlight-background:unset;--min-height:40px;padding-top:2.5px')}>          
                            <IonInput className="text-center font-bold br-0" style={styles('--padding-bottom:0px;--padding-top:0px')} 
                                type="text" placeholder="Account Number" 
                                value={input.Subscriber} readonly={input.HasSubscriber} /> 
                        </IonItem>
                        <div className="invalid-tooltip">{msg.Subscriber}&nbsp;</div>
                    </div>
                    <div className={classNames({'input-invalid':!!msg.Amount})} style={styles('position:relative')}>
                        <IonItem className='input-error' style={styles('--highlight-background:unset;--min-height:40px;paddingT-top:2.5px')}>        
                            <IonInput className="text-center font-bold br-0" style={styles('--padding-bottom:0px;--padding-top:0px')} 
                                type="number" placeholder="Amount" 
                                value={input.Amount} readonly={input.HasSubscriber} />
                        </IonItem>
                        <div className="invalid-tooltip">{msg.Amount}&nbsp;</div>
                    </div>
                    <div className="horizontal" style={styles('margin-top:5px;height:auto')}>
                        <div style={styles('margin-right:10px')}>Method: </div>
                        <div style={styles('margin:0px 5px')}><label><input type="radio" value="credit" name="method" onClick={()=>this.hState(inputVal('credit'),'Type')} checked={(input.Type=='credit')} /> Credit</label></div>
                        <div style={styles('margin:0px 5px')}><label><input type="radio" value="cash" name="method" onClick={()=>this.hState(inputVal('cash'),'Type')} checked={(input.Type=='cash')} /> Cash</label></div> 
                    </div>
                    <div>
                        <hr style={styles('margin:5px')} />
                        <div className="horizontal" style={styles('margin-top:5px;height:auto')}>
                            <button className="btn-green" style={styles('width:200px')} onClick={this.hConfirm}>Approve Request</button>
                        </div>
                        <div className="horizontal" style={styles('margin-top:5px;height:auto')}>
                            <button className="btn-red" style={styles('width:200px')} onClick={this.hCancel}>Cancel Request</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </Panel>
</div>
        </>);
    }

    static modal=async(subscriber:any={})=>{
        var modal:any; 
        var stack = await Stack.push(<>
<Modal className="modal-adjustment" ref={(ref)=>modal=ref} content={<PowerApRequestPopUp modal={()=>modal} Subscriber={subscriber} />} />
        </>);
        setTimeout(async()=>(await modal.onDidDismiss(), stack.pop()));
        return modal;
    }
}

//styles
const Panel = styled.div`
padding-top:5px;
ion-item {
    --background:rgba(245, 245, 245, 0.75);
    --border-radius: 10px;
    --margin-left: 10px;
    --margin-right: 10px;
}
`;