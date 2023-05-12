import { IonContent, IonDatetime, IonInput, IonItem, IonLabel, IonRippleEffect, IonTextarea } from '@ionic/react';
import React from 'react';
import Layout from '../../../../tools/components/+common/layout';
import TextFit from '../../../../tools/components/+common/text-fit';
import { isAlpha, isEmail, numberWithComma } from '../../../../tools/global';
import { classNames, Input, styles } from '../../../../tools/plugins/element';
import UserPager from '../../user-pager';
import { rest } from '../../../+app/+service/rest.service';
import ChangeAvatarView from './profile.change-avatar.view';
import ChangePasswordView from './profile.change-password.view';
import { jUser, jUserModify } from '../../../+app/user-module';
import { Alert } from '../../../../tools/components/+common/stack';
import moment from 'moment';
import { storage } from '../../../../tools/plugins/storage';
import { timeout } from '../../../../tools/plugins/delay';
import { app } from '../../../../tools/app';
import Recycler from '../../../../tools/components/+feature/recycler';
import RecyclerStorage from '../../../intro.page/recycler-storage';

const { Object }: any = window;

export default class SettingsView extends React.Component {
    shouldComponentUpdate = () => false;
    holder: ViewHolder = (null as any);
    render() {
        return (<>
            <Recycler storage={RecyclerStorage.instance} from={ViewHolder} />
        </>);
    }
}

export class ViewHolder extends React.Component {
    state: any = {};  // u:{} 
    get pager() { return UserPager.instance.pager; }
    componentWillMount = () => this.willMount();
    prop: any = {};
    input: any = {};
    msg: any = {};
    subs: any = {};
    willMount = () => {
        const { prop } = this;
        const input = (this.input = { NotifAnnouncement: true, NotifLiveStreaming: true, NotifLivePublicChat: true, });
        const msg = (this.msg = {});
        this.setState({ input, msg });
    }
    didMount = async () => {
        const { input, prop } = this;
        Object.rcopy(input, (await storage.BetLimits) || {});
        Object.rcopy(input, (await storage.GameDisabled) || {});
        Object.rcopy(input, (await storage.PopUpNotif) || {});
        this.setState({ input });
    }
    willUnmount = () => {
        Object.values(this.subs).map((m: any) => m.unsubscribe());
    }

    private async performSaveLocal() {
        await (storage.BetLimits = {
            StraightLimit: this.input.StraightLimit,
            RumbleLimit: this.input.RumbleLimit,
        });
        const isDisabled = (!!this.input.IsDisabledBet);
        await (storage.GameDisabled = {
            IsDisabledBet: isDisabled,
            BetDisabledFrom: this.input.BetDisabledFrom,
            BetDisabledUntil: this.input.BetDisabledUntil,
            BetDisabledFromTm: (isDisabled ? this.input.BetDisabledFromTm : ''),
            BetDisabledUntilTm: (isDisabled ? this.input.BetDisabledUntilTm : ''),
        });
        await (storage.PopUpNotif = {
            NotifAnnouncement: this.input.NotifAnnouncement,
            NotifLiveStreaming: this.input.NotifLiveStreaming,
            NotifLivePublicChat: this.input.NotifLivePublicChat,
        });
    }

    hBackButton = () => {
        this.pager.back();
    }
    hChangeAvatar = () => {
        this.pager.next(ChangeAvatarView);
    }
    hChangePassword = () => {
        this.pager.next(ChangePasswordView);
    }
    hConfirm = () => {
        if (!this.isValidEntries()) return;
        Alert.showProgressRequest();
        return setTimeout(() => this.performSubmit(), 750);
    }

    hState = (ev: any, key: string) => {
        this.msg[key] = null;
        this.input[key] = ev.detail.value;
        this.setState({ msg: this.msg, input: this.input });
    }

    private async performSubmit() {
        await this.performSaveLocal();
        return Alert.showSuccessMessage('Successfully saved!');
    }

    private isValidEntries(): boolean {
        var isValid = true;

        var straight = +(this.input.StraightLimit || 0);
        this.input.StraightLimit = (straight > 0 ? Math.floor(straight) : '');
        var rumble = +(this.input.RumbleLimit || 0);
        this.input.RumbleLimit = (rumble > 0 ? Math.floor(rumble) : '');

        this.msg.BetDisabledFrom = this.msg.BetDisabledUntil = '';
        if (!!this.input.IsDisabledBet) {
            if (!this.input.BetDisabledFrom) {
                this.msg.BetDisabledFrom = 'Please select time';
                isValid = false;
            }
            if (!this.input.BetDisabledUntil) {
                this.msg.BetDisabledUntil = 'Please select time';
                isValid = false;
            }
            if (isValid) {
                this.input.BetDisabledFromTm = moment(this.input.BetDisabledFrom).format('hh:mm A');
                this.input.BetDisabledUntilTm = moment(this.input.BetDisabledUntil).format('hh:mm A');
            }
        }

        this.input.IsValid = isValid;
        this.setState({ msg: this.msg, input: this.input });
        return isValid;
    }
    render() {
        const { input = {}, msg = {} } = this.state;
        return (<>
            <Layout full>
                <Layout>
                    <div className="row m-0 toolbar-panel">
                        <div className="vertical arrow-back" onClick={this.hBackButton}></div>
                        <div className="col-4 p-0 vertical toolbar-parent" onClick={this.hBackButton}>Game Profile</div>
                        <div className="col-7 p-0 toolbar-title vertical"><div><TextFit text="Settings" /></div></div>
                    </div>
                </Layout>
                <Layout auto>
                    <IonContent scrollY>
                        <div className="row m-0 bootstrap-form">
                            <div className="col-12 form-container" style={styles('margin-top:5px')}>
                                <form className={classNames('needs-validation', { 'form-invalid': !input.IsValid })} noValidate onSubmit={(ev) => ev.preventDefault()}>
                                    <div style={styles('color:white;font-weight:bold;font-size:18px;')}>Popup Notifications</div>
                                    <div style={styles('color:#fefed1')}>
                                        <div className="custom-control custom-checkbox vertical">
                                            <Input input="checkbox" node={(handle) => <>
                                                <input type="checkbox" className="custom-control-input" id="clvChk0b" checked={input.NotifAnnouncement} {...handle({ onChange: (ev) => this.hState(ev, 'NotifAnnouncement') })} />
                                            </>} />
                                            <label className="custom-control-label" htmlFor="clvChk0b" style={styles('vertical-align:middle;color:#fefed1')}>Announcement</label>
                                        </div>
                                        <div className="custom-control custom-checkbox vertical">
                                            <Input input="checkbox" node={(handle) => <>
                                                <input type="checkbox" className="custom-control-input" id="clvChk0c" checked={input.NotifLiveStreaming} {...handle({ onChange: (ev) => this.hState(ev, 'NotifLiveStreaming') })} />
                                            </>} />
                                            <label className="custom-control-label" htmlFor="clvChk0c" style={styles('vertical-align:middle;color:#fefed1')}>Live Streaming</label>
                                        </div>
                                        <div className="custom-control custom-checkbox vertical">
                                            <Input input="checkbox" node={(handle) => <>
                                                <input type="checkbox" className="custom-control-input" id="clvChk0d" checked={input.NotifLivePublicChat} {...handle({ onChange: (ev) => this.hState(ev, 'NotifLivePublicChat') })} />
                                            </>} />
                                            <label className="custom-control-label" htmlFor="clvChk0d" style={styles('vertical-align:middle;color:#fefed1')}>Live Public Chat</label>
                                        </div>
                                    </div>
                                    <div><hr style={styles('border:0;height:1px;background-image:linear-gradient(to right,rgba(0,0,0,0),rgba(255,255,255,0.75),rgba(0,0,0,0))')} /></div>
                                    <div style={styles('color:white;font-weight:bold;font-size:18px;')}>Game Settings</div>
                                    <div style={styles('color:#fefed1')}>My Bet Limit <span style={styles('font-size:80%')}>(Leave empty for no limit)</span></div>
                                    <div className="row m-0">
                                        <div className="col-6" style={styles('padding:0px;padding-right:5px')}>
                                            <div className={classNames({ 'input-invalid': !!msg.StraightLimit })} style={styles('position:relative')}>
                                                <IonItem className='input-error' style={styles('--highlight-background:unset;--min-height:56.5px;margin-top:2.5px')}>
                                                    <IonLabel position="stacked" style={styles('font-weight:bold;margin-top:-7.5px')}>Straight Bet Limit</IonLabel>
                                                    <Input ion node={(handle) => <>
                                                        <IonInput className="font-bold br-0"
                                                            type="number" placeholder="#"
                                                            value={input.StraightLimit} {...handle({ onChange: (ev) => this.hState(ev, 'StraightLimit') })} />
                                                    </>} />
                                                </IonItem>
                                                <div className="invalid-tooltip">{msg.StraightLimit}</div>
                                            </div>
                                        </div>
                                        <div className="col-6" style={styles('padding:0px;padding-left:5px')}>
                                            <div className={classNames({ 'input-invalid': !!msg.RumbleLimit })} style={styles('position:relative')}>
                                                <IonItem className='input-error' style={styles('--highlight-background:unset;--min-height:56.5px;margin-top:2.5px')}>
                                                    <IonLabel position="stacked" style={styles('font-weight:bold;margin-top:-7.5px')}>Rumble Bet Limit</IonLabel>
                                                    <Input ion node={(handle) => <>
                                                        <IonInput className="font-bold br-0"
                                                            type="number" placeholder="#"
                                                            value={input.RumbleLimit} {...handle({ onChange: (ev) => this.hState(ev, 'RumbleLimit') })} />
                                                    </>} />
                                                </IonItem>
                                                <div className="invalid-tooltip">{msg.RumbleLimit}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div style={styles('color:#fefed1;padding-top:10px')}>
                                        <div className="custom-control custom-checkbox vertical">
                                            <Input input="checkbox" node={(handle) => <>
                                                <input type="checkbox" className="custom-control-input" id="frm1x0a" checked={input.IsDisabledBet} {...handle({ onChange: (ev) => this.hState(ev, 'IsDisabledBet') })} />
                                            </>} />
                                            <label className="custom-control-label" htmlFor="frm1x0a" style={styles('vertical-align:middle;color:#fefed1')}>Disabled Game</label>
                                        </div>
                                        <div className="row m-0">
                                            <div className="col-6" style={styles('padding:0px;padding-left:5px')}>
                                                <div className={classNames({ 'input-invalid': !!msg.BetDisabledFrom })} style={styles('position:relative')}>
                                                    <IonItem className='input-error' style={styles('--highlight-background:unset;--min-height:56.5px;margin-top:2.5px')}>
                                                        <IonLabel position="stacked" style={styles('font-weight:bold;margin-top:-7.5px')}>From</IonLabel>
                                                        <IonInput hidden />
                                                        <Input ion="popup" node={(handle) => <>
                                                            <IonDatetime pickerFormat="hh:mm A" displayFormat="hh:mm A" style={styles('--padding-bottom:5px')}
                                                                placeholder="##:## ##" disabled={!input.IsDisabledBet}
                                                                value={input.BetDisabledFrom} {...handle({ onChange: (ev) => this.hState(ev, 'BetDisabledFrom') })} />
                                                        </>} />
                                                    </IonItem>
                                                    <div className="invalid-tooltip">{msg.BetDisabledFrom}</div>
                                                </div>
                                            </div>
                                            <div className="col-6" style={styles('padding:0px;padding-left:5px')}>
                                                <div className={classNames({ 'input-invalid': !!msg.BetDisabledUntil })} style={styles('position:relative')}>
                                                    <IonItem className='input-error' style={styles('--highlight-background:unset;--min-height:56.5px;margin-top:2.5px')}>
                                                        <IonLabel position="stacked" style={styles('font-weight:bold;margin-top:-7.5px')}>Until</IonLabel>
                                                        <IonInput hidden />
                                                        <Input ion="popup" node={(handle) => <>
                                                            <IonDatetime pickerFormat="hh:mm A" displayFormat="hh:mm A" style={styles('--padding-bottom:5px')}
                                                                placeholder="##:## ##" disabled={!input.IsDisabledBet}
                                                                value={input.BetDisabledUntil} {...handle({ onChange: (ev) => this.hState(ev, 'BetDisabledUntil') })} />
                                                        </>} />
                                                    </IonItem>
                                                    <div className="invalid-tooltip">{msg.BetDisabledUntil}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                                <div className="col-12" style={styles('margin-top:20px')}>
                                    <div className="horizontal" style={styles('height:auto')}>
                                        <div className="btn-green" style={styles('width:200px')} onClick={this.hConfirm}>APPLY</div>
                                    </div>
                                    <div>&nbsp;</div>
                                </div>
                            </div>
                        </div>
                    </IonContent>
                </Layout>
            </Layout>
        </>);
    }
}