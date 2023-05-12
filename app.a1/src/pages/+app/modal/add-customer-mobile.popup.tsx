import { IonCol, IonInput, IonItem, IonRow, NavContext } from '@ionic/react';
import React from 'react';
import { app, OnDidBackdrop } from '../../../tools/app';
import Stack, { Alert, Modal } from '../../../tools/components/+common/stack';
import { classNames, Input, styles } from '../../../tools/plugins/element';

const { Object }: any = window;

export default class AddCustomerMobilePopUp extends React.Component<{ modal: Function }> implements OnDidBackdrop {
    state: any = {}
    componentWillMount = () => {
        app.component(this);
    }

    dismiss = (data: any = undefined) => this.props.modal().dismiss(data);
    hClose = () => this.dismiss();

    subs: any = {};
    msg: any = {};
    input: any = {};
    onDidBackdrop() {
        this.dismiss();
        return false;
    }

    hConfirm = () => {
        if (!this.isValidEntries()) return;
        this.dismiss({ MobileNumber: this.input.MobileNumber });
    }
    hCancel = () => {
        this.dismiss({ isSkip: true });
    }

    private isValidEntries(): boolean {
        var isValid = true;

        var mobileNumber = (this.input.MobileNumber || '').toString().trim();
        if (!mobileNumber) {
            this.msg.MobileNumber = 'Please enter mobile number';
            isValid = false;
        }
        var length = (!mobileNumber.startsWith('+63') ? 11 : 13);
        if (length != mobileNumber.length) {
            this.msg.MobileNumber = 'Please enter valid mobile number';
            isValid = false;
        }
        this.input.IsValid = isValid;
        return isValid;
    }

    hState = (ev: any, key: string) => {
        this.msg[key] = null;
        this.input[key] = ev.detail.value;
        this.setState({ msg: this.msg, input: this.input });
    }

    render() {
        const { msg = {}, input = {} } = this.state;

        return (<>
            <div className="modal-container">
                <div style={styles('padding-top:5px')}>
                    <div className="row m-0 header">
                        <div className="col-10">Customer</div>
                        <div className="col-2 p-0 btn-close" style={styles('text-align:right;right:5px')} onClick={this.hCancel}></div>
                    </div>
                    <div className='row m-0 bootstrap-form old' style={styles('height:100%;padding:10px 0px')}>
                        <div className='col-12 form-container' style={styles('padding:0px 35px')} >
                            <form className={classNames('needs-validation', { 'form-invalid': !input.IsValid })} noValidate onSubmit={(ev) => ev.preventDefault()}>
                                <div className={classNames({ 'input-invalid': !!msg.MobileNumber })} style={styles('position:relative')}>
                                    <IonItem className='input-error' style={styles('--highlight-background:unset;--min-height:40px;padding-top:2.5px')}>
                                        <Input ion node={(handle) => <>
                                            <IonInput className="text-center font-bold br-0" style={styles('--padding-bottom:0px;--padding-top:0px')}
                                                type="text" placeholder="Mobile Number"
                                                value={input.MobileNumber} {...handle({ onChange: (ev) => this.hState(ev, 'MobileNumber') })} />
                                        </>} />

                                    </IonItem>
                                    <div className="invalid-tooltip">{msg.MobileNumber}&nbsp;</div>
                                </div>
                                <div>
                                    <hr style={styles('margin:5px')} />
                                    <div className="horizontal" style={styles('margin-top:5px;height:auto')}>
                                        <button className="btn-green" style={styles('width:200px')} type="button" onClick={this.hConfirm}>Continue</button>
                                    </div>
                                    <div className="horizontal" style={styles('margin-top:5px;height:auto')}>
                                        <button className="btn-red" style={styles('width:200px')} type="button" onClick={this.hCancel}>Skip</button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>);
    }

    static modal = async () => {
        var modal: any;
        var stack = await Stack.push(<>
            <Modal className="modal-adjustment" ref={(ref) => modal = ref} content={<AddCustomerMobilePopUp modal={() => modal} />} />
        </>);
        setTimeout(async () => (await modal.onDidDismiss(), stack.pop()));
        return modal;
    }
}