import { IonCol, IonInput, IonRow, NavContext } from '@ionic/react';
import React from 'react';
import styled from 'styled-components';
import { app, OnDidBackdrop } from '../../../tools/app';
import Stack, { Alert, Modal } from '../../../tools/components/+common/stack';
import { Input, styles } from '../../../tools/plugins/element';
import { mtCb } from '../../../tools/plugins/static';
import { storage } from '../../../tools/plugins/storage';
import { toast } from '../../../tools/plugins/toast';

const { Object }: any = window;

export default class AddMobileReceiverPopUp extends React.Component<{ modal: Function }> implements OnDidBackdrop {
    state = { MobileNumber: '', }
    componentWillMount = () => {
        app.component(this);
    }

    dismiss = (data: any = undefined) => this.props.modal().dismiss(data);
    hClose = () => this.dismiss();

    onDidBackdrop() {
        this.dismiss();
        return false;
    }
    hAdd = () => {
        if (!this.isValidEntries()) return;
        this.dismiss(this.input);
    };

    input: any = {};
    private isValidEntries(): boolean {
        var isValid = true;
        Object.rcopy(this.input, this.state);
        //
        var mobileNumber = (this.input.MobileNumber || '').replace(/ /ig, '');
        if (!mobileNumber) {
            toast('Please enter mobile number');
            isValid = false;
        } else if (mobileNumber.startsWith('+63')) {
            if (mobileNumber.length != 13) {
                toast('Please enter valid mobile number');
                isValid = false;
            }
        } else if (mobileNumber.startsWith('09')) {
            if (mobileNumber.length != 11) {
                toast('Please enter valid mobile number');
                isValid = false;
            }
        } else {
            toast('Please enter valid mobile number');
            isValid = false;
        }

        if (isValid) {
            var temp = ((mobileNumber.startsWith('+639') ? '' : '+') + mobileNumber).replace('+09', '+639');
            if (!(temp == ('+' + mobileNumber))) mobileNumber = temp;
            this.input.MobileNumber = mobileNumber;
        }
        this.input.IsValid = isValid;
        return isValid;
    }

    render() {
        return (<>
            <div className='row m-0'>
                <div className='row m-0' style={styles('padding-top:5px')}>
                    <div className='col-10'><b>Add Receiver</b></div>
                    <div className='col-2 p-0' style={styles('text-align:right;right:5px')} onClick={this.hClose}>
                        <img src='./assets/img/popup_close_window.png' style={styles('width:20px')} />
                    </div>
                </div>
                <div style={styles('overflow-y:auto;height:100%;padding-top:15px')}>
                    <div className="horizontal" style={styles('height:auto')}>
                        <Input ion="popup" node={(handle) => <>
                            <IonInput placeholder="Enter mobile number"
                                value={this.state.MobileNumber}
                                {...handle({ onChange: ({ detail }) => this.setState({ MobileNumber: detail?.value }) })} />
                        </>} />

                    </div>
                    <IonRow className="horizontal" style={styles('height:auto')}>
                        <IonCol size="4" style={styles('margin:10px 0px')}>
                            <div className="btn-default" style={styles('width:100%')} onClick={this.hAdd}>Add</div>
                        </IonCol>
                    </IonRow>
                </div>
            </div>
        </>);
    }

    static modal = async (callback: Function = mtCb) => {
        var modal: any;
        var stack = await Stack.push(<>
            <Modal className="modal-adjustment" ref={(ref) => modal = ref} content={<AddMobileReceiverPopUp modal={() => modal} />} />
        </>);
        setTimeout(async () => (await modal.onDidDismiss(), stack.pop()));
        return modal;
    }
}