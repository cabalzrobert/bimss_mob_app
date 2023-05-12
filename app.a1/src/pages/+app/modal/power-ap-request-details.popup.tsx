import { IonInput, IonItem, IonSelect, IonSelectOption } from '@ionic/react';
import React from 'react';
import styled from 'styled-components';
import { rest } from '../+service/rest.service';
import { app, OnDidBackdrop } from '../../../tools/app';
import Stack, { Alert, Modal } from '../../../tools/components/+common/stack';
import { numberWithComma } from '../../../tools/global';
import { classNames, Input, styles } from '../../../tools/plugins/element';
import { Customer } from '../main-module';

const { Object }: any = window;

export default class PowerApRequestDetailsPopUp extends React.Component<{ modal: Function, Info: any }> implements OnDidBackdrop {
    state: any = {};
    componentWillMount = () => {
        app.component(this);
        const { prop, input } = this;
        const info = (this.info = this.details(this.props.Info || {}));
        input.Transaction = info;
        prop.CanDoAction = (!!info.IsUnpaid);
        this.setState({ prop, input });
    }

    dismiss = (data: any = {}) => this.props.modal().dismiss(data);
    hClose = () => this.dismiss();

    info: any = {};
    input: any = { Method: '2' };
    prop: any = {};
    onDidBackdrop() {
        this.dismiss();
        return false;
    }

    private details(item: any) {
        item.Status = '';
        if (item.IsPending) {
            item.StatusColor = 'white';
            item.Status = 'Pending';
        } else if (item.IsApproved) {
            item.RequestColor = 'limegreen';
            if (item.IsPaid) {
                item.StatusColor = 'limegreen';
                item.Status = 'Paid';
            } else if (item.IsUnpaid) {
                item.IsCredit = true;
                item.StatusColor = 'red';
                item.Status = 'Unpaid';
            }
        } else if (item.IsCancelled) {
            item.RequestColor = 'red';
            item.StatusColor = 'red';
            item.Status = 'Cancelled';
        }
        return Customer(item);
    }
    hPayMethod = () => {
        this.prop.CanProceed = (this.input.Method == '1');
        this.setState({ prop: this.prop });
    }
    hConfirm = () => {
        if (!this.prop.CanProceed)
            return;
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
        rest.post('a/credit/paid', this.input).subscribe(async (res: any) => {
            if (res.Status == 'ok') {
                this.details(Object.rcopy(this.info, { IsUnpaid: false, IsPaid: true }));
                return Alert.showSuccessMessage(res.Message, () => this.dismiss({ IsPaid: true, item: this.info }));
            }
            Alert.showErrorMessage(res.Message);
        }, (err: any) => {
            Alert.showWarningMessage('Please try again');
        });
    }

    hState = (ev: any, key: string) => {
        //this.msg[key]=null;
        this.input[key] = ev.detail.value;
        this.setState({ input: this.input }); //msg:this.msg,
    }

    render() {
        const info = (this.info || {});
        const { prop = {}, input = {} } = this.state;
        return (<>
            <div className="modal-container">
                <Panel>
                    <div className="row m-0 header">
                        <div className="col-10">Request Details</div>
                        <div className="col-2 p-0 btn-close" style={styles('text-align:right;right:5px')} onClick={this.hClose}></div>
                    </div>
                    <div className='row m-0' style={styles('height:100%;padding:10px 0px')}>
                        <div className='col-12' style={styles('padding:0px 10px')}>
                            <div className="row m-0">
                                <div className="col-12 p-0">
                                    <table style={styles('width:100%;font-size:14px')}>
                                        <tr><td className="ticket-info">Account# :</td><td className="ticket-info-details">{info.AccountID}</td></tr>
                                        <tr><td className="ticket-info">Name :</td><td className="ticket-info-details">{info.DisplayName}</td></tr>
                                        <tr><td className="ticket-info">Amount :</td><td className="ticket-info-details">{numberWithComma(info.RequestCredit, 2)}</td></tr>
                                        <tr><td className="ticket-info">Date Requested :</td><td className="ticket-info-details" style={styles('font-size:12px')}>{info.FulldateRequested}</td></tr>
                                        <tr><td className="ticket-info">Date Approved :</td><td className="ticket-info-details" style={styles('font-size:12px')}>{info.FulldateTransaction}</td></tr>
                                        <tr><td className="ticket-info">Request Status :</td><td className="ticket-info-details"><i>Completed</i></td></tr>
                                        <tr><td className="ticket-info">Payment Method :</td><td className="ticket-info-details" style={styles('color:red')}>{(info.IsCredit ? 'Credit' : 'Cash')}</td></tr>
                                        {!!info.IsUnpaid ? null : <>
                                            <tr><td className="ticket-info">Payment Status :</td><td className="ticket-info-details" style={styles({ color: info.StatusColor })}>{info.Status}</td></tr>
                                        </>}
                                        {!info.IsUnpaid ? null : <>
                                            <tr><td className="ticket-info">Payment Status :</td><td>
                                                <IonItem lines="none" style={styles('--padding-start:10px;--min-height:30px')}>
                                                    <Input ion="popup" node={(handle) => <>
                                                        <IonSelect interface="action-sheet" cancelText="Dismiss" style={styles('padding:0px;width:100%')}
                                                            value={input.Method} {...handle({ onChange: (ev) => (this.hState(ev, 'Method'), this.hPayMethod()) })}> {/*[(ngModel)]="input.Method" (ionChange)="handleChangedPayMethod()"*/}
                                                            <IonSelectOption value='2'>Unpaid</IonSelectOption>
                                                            <IonSelectOption value='1'>Paid</IonSelectOption>
                                                        </IonSelect>
                                                    </>} />

                                                </IonItem>
                                            </td></tr>
                                        </>}
                                    </table>
                                    {!prop.CanDoAction ? null : <>
                                        <div>
                                            <hr style={styles('margin:5px')} />
                                            <div className="horizontal" style={styles('margin-top:5px;height:auto')}>
                                                <button className={classNames({ 'btn-red': !prop.CanProceed, 'btn-green': !!prop.CanProceed })} style={styles('width:200px')} onClick={this.hConfirm}>Confirm</button>
                                            </div>
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

    static modal = async (info: any = {}) => {
        var modal: any;
        var stack = await Stack.push(<>
            <Modal className="modal-adjustment width-350 no-bg mwf" ref={(ref) => modal = ref} content={<PowerApRequestDetailsPopUp modal={() => modal} Info={info} />} />
        </>);
        setTimeout(async () => (await modal.onDidDismiss(), stack.pop()));
        return modal;
    }
}

//styles
const Panel = styled.div`
padding-top:5px;
&::before{
    content: ' ';
    background-color: whitesmoke;
    position: absolute;
    top: 0;
    height: 100%;
    width: 100%;
}
.ticket-info{
    width: 1%;
    font-size: 12px;
    text-align: right;
    padding-right: 2.5px;
    white-space: nowrap;
}
.ticket-info-details{
    font-weight: bold;
    font-size: 15px;
    white-space: nowrap;
}
ion-item {
    --background:rgba(245, 245, 245, 0.75);
    --border-radius: 10px;
    --margin-left: 10px;
    --margin-right: 10px;
}
`;