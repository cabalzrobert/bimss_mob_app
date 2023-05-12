import { KeyboardInfo } from '@capacitor/core';
import { Camera } from '@ionic-native/camera';
import { ImagePicker } from '@ionic-native/image-picker';
import { SuperTab, SuperTabButton, SuperTabs, SuperTabsContainer, SuperTabsToolbar } from '@ionic-super-tabs/react';
import { IonButton, IonButtons, IonContent, IonDatetime, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonList, IonMenuButton, IonRefresher, IonRefresherContent, IonRippleEffect, IonSearchbar, IonSelect, IonSelectOption, IonSpinner, IonTextarea, IonTitle, IonToolbar } from '@ionic/react';
import { arrowBackSharp, call, cameraOutline, cardOutline, filter, personOutline, saveOutline } from 'ionicons/icons';
import moment from 'moment';
import React from 'react';
import { rest } from '../../../+app/+service/rest.service';
import FilteringView from '../../../+app/component/common/filtering.view';
import NotFound2View from '../../../+app/component/common/not-found.view';
import { jUser, jUserModify } from '../../../+app/user-module';
import { app, OnDidBackdrop } from '../../../../tools/app';
import ImgPreloader from '../../../../tools/components/+common/img-preloader';
import Layout from '../../../../tools/components/+common/layout';
import PhotoViewerPopUp from '../../../../tools/components/+common/modal/photo-viewer.popup';
import Stack, { Alert, Modal } from '../../../../tools/components/+common/stack';
import { isAlpha, isEmail } from '../../../../tools/global';
import { timeout } from '../../../../tools/plugins/delay';
import { device } from '../../../../tools/plugins/device';
import { classNames, clearAfter, styles } from '../../../../tools/plugins/element';
import { keyboard } from '../../../../tools/plugins/keyboard';
import { mtCb, mtObj } from '../../../../tools/plugins/static';
import { toast } from '../../../../tools/plugins/toast';
import { Crop } from '@ionic-native/crop';
import { Base64 } from '@ionic-native/base64';
import UserPager from '../../user-pager';
import Recycler from '../../../../tools/components/+feature/recycler';
import RecyclerStorage from '../../../intro.page/recycler-storage';
import TextFit from '../../../../tools/components/+common/text-fit';
import { type } from 'os';

const { Object, data = {} } = (window as any);
const { locations } = data;
const { Group } = data;

export default class NewEvent extends React.Component {
    setType = (type: any) => (this.holder.setType(type), this);
    setForm = (input: any) => (this.holder.setForm(input), this);
    shouldComponentUpdate = () => false;
    holder: ViewHolder = (null as any);
    render() {
        return (<>
            <Recycler storage={RecyclerStorage.instance} from={ViewHolder} bind={(ref: any) => this.holder = ref} />
        </>);
    }
}

export class ViewHolder extends React.Component {
    get pager() { return UserPager.instance.pager; }
    componentWillMount = () => this.willMount(false);
    state: any = {};
    willMount = (didMount = true) => {
        const { opts } = this;
        const { dtConfig } = opts;
        const today = new Date();
        opts.dtConfig = { MinYear: today.getFullYear(), MaxYear: today.getFullYear()+1,MinMonth: ("0" + (today.getMonth() + 1)).slice(-2), MinDate: today.getFullYear() + '-' + ("0" + (today.getMonth() + 1)).slice(-2) +'-' + ("0" + (today.getDate())).slice(-2), MaxDate: (today.getFullYear()+1) + '-' + ("0" + (today.getMonth() + 1)).slice(-2) +'-' + ("0" + (today.getDate())).slice(-2), MinTime: '00:00:00', MaxTime: '12:00:00' }
        
        const prop: any = (this.prop = { didMount: didMount, IsFiltering: true, ImageData: './assets/img/icon_blank_profile.png' });
        const input: any = (this.input = {});
        const msg = (this.msg = {});

        this.setState({ prop, input, msg, opts });
        if (!didMount) return;
        this.subs.u = jUserModify(async () => {
            const u = await jUser();
            Object.rcopy(input, {
            });
           
            this.setState({ u, input });
        });
    }
    didMount = () => {
        if (!this.prop.didMount) return;
        this.prop.IsFiltering = false;
        this.setState({ prop: this.prop });
    }
    willUnmount = () => {
        Object.values(this.subs).map((m: any) => m.unsubscribe());
    }
    hBackButton = () => {
        //this.pager.back();
        //this.swapper.show(UserPager);
        this.pager.back();
    }

    setForm(input: any) {
        this.prop.IsFiltering = true;
        this.prop.IsUpdate = true;
        this.setState({ prop: this.prop });


        this.subs.upt = timeout(() => {
            this.prop.IsFiltering = false;
            Object.rcopy(this.input, input);
            this.setState({ prop: this.prop, input: this.input });
        }, 750);
        return this;
    }
    setType(type: any) {
        this.input.Type = type;
        this.setState({ input: this.input });
        console.log(this.opts);
        return this;
    }
    subs: any = {};
    msg: any = {};
    input: any = {};
    prop: any = {};
    opts: any = {};

    hState = (ev: any, key: string) => {
        if (!!this.prop.lockInput) return;
        this.msg[key] = null;
        this.input[key] = ev.detail.value;
        this.setState({ msg: this.msg, input: this.input });
    }


    hConfirm = () => {
        if (!this.isValidateEntries()) return;
        Alert.swal({
            title: 'Confirmation',
            text: 'Are you sure you want to Save?',
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
        rest.post('a/event/'+(this.prop.IsUpdate?'edit':'new'), this.input).subscribe(async(res:any)=>{
            if(res.Status=='ok'){
                const item = Object.rcopy(res.Content, this.input);
                return Alert.showSuccessMessage(res.Message,
                    ()=>this.pager.back({ item, component:NewEvent,IsUpdate:!!this.prop.IsUpdate, }));
            }
            Alert.showErrorMessage(res.Message);
        },(err:any) =>{
            Alert.showWarningMessage('Please try again');
        });
    }

    private isValidateEntries(): boolean {
        var isValid = true;

        var title = (this.input.Title || '').trim();
        if (!title) {
            this.msg.Title = 'Please enter Title Event';
            isValid = false;
        }

        var description = (this.input.Description || '').trim();
        if (!description) {
            this.msg.Description = 'Please enter Description';
            isValid = false;
        }
        var eventdate = (this.input.EventDate || '').trim();
        if (!!eventdate) {
            eventdate = moment(eventdate).format('MMM DD, YYYY');
        } else {
            this.msg.EventDate = 'Please enter Event Date';
            isValid = false;
        }
        this.input.EventDate = eventdate;
        
        
        
        var eventtime = (this.input.EventDateTime || '').trim();
        if (!!eventtime) {
            eventtime=moment(eventtime).format('hh:mm:ss A');
        } else{
            this.msg.EventDateTime = 'Please enter Event Time';
            isValid = false;
        }
        this.input.EventDateTime=eventtime;
        var location = this.input.Location;
        if (!location) {
            this.msg.Location = 'Please enter Location';
            isValid = false;
        }
        if(isValid){
            this.input.EventTime = eventtime;
            this.input.EventDateTime=(this.input.EventDate + ' ' + this.input.EventTime).trim();
        }
        this.input.IsValid = isValid;
        this.prop.lockInput = true;
        this.setState({ msg: this.msg, input: this.input },
            () => setTimeout(() => this.prop.lockInput = false, 275));
        return isValid;
    }

    


    elIonSelect: any = React.createRef();
    get imagePickerOpts() { return this.elIonSelect.current; }
    render() {
        const { input = {}, msg = {}, prop = {} } = this.state;
        var grp = Group[0] || {};

        input.PGRP_ID = grp.GroupID;
        input.PL_ID = grp.PLID;
        return (<>
            <Layout full>
                <Layout>
                    <div className="row m-0 toolbar-panel">
                        <div className="vertical arrow-back" onClick={this.hBackButton}></div>
                        <div className="col-4 p-0 vertical toolbar-parent" onClick={this.hBackButton}>Back</div>
                        <div className="col-7 p-0 toolbar-title vertical"><div><TextFit text="Event" /></div></div>
                    </div>
                </Layout>
                <Layout auto>
                    <FilteringView visible={prop.IsFiltering} />
                    <Layout full>
                        <Layout auto>

                            <div className="row m-0 bootstrap-form old" style={styles('height:100%')}>
                                <div className="col-12 p-0 form-container">
                                    <form className={classNames('needs-validation', { 'form-invalid': !input.IsValid })}
                                        style={styles('height:100%')}
                                        noValidate onSubmit={(ev) => ev.preventDefault()}>

                                        <div style={styles('height:100%;width:100%')}>
                                            <SuperTabs>
                                                <SuperTab noScroll style={styles('width:100%;background-color: #1d2c65;')}>

                                                    <div className={classNames({ 'input-invalid': !!msg.Title })} style={styles('position:relative')}>
                                                        <IonItem className='input-error' style={styles('--highlight-background:unset;--min-height:40px;margin-top:2.5px')}>
                                                            <IonLabel position="floating" style={styles('font-weight:bold;margin-top:-7.5px')}><span style={styles('color:red')}>*</span>Title</IonLabel>
                                                            <IonTextarea className="font-bold br-0"
                                                                rows={2}
                                                                value={input.Title} onIonChange={(ev) => this.hState(ev, 'Title')} />
                                                        </IonItem>
                                                        <div className="invalid-tooltip">{msg.Title}</div>
                                                    </div>

                                                    <div className={classNames({ 'input-invalid': !!msg.Description })} style={styles('position:relative')}>
                                                        <IonItem className='input-error' style={styles('--highlight-background:unset;--min-height:40px;margin-top:2.5px')}>
                                                            <IonLabel position="floating" style={styles('font-weight:bold;margin-top:-7.5px')}><span style={styles('color:red')}>*</span>Description</IonLabel>
                                                            <IonTextarea className="font-bold br-0"
                                                                style={styles('--padding-bottom:0px;--padding-top:0px')}
                                                                rows={4}
                                                                value={input.Description} onIonChange={(ev) => this.hState(ev, 'Description')} />
                                                        </IonItem>
                                                        <div className="invalid-tooltip">{msg.Description}</div>
                                                    </div>
                                                    <div className={classNames({ 'input-invalid': !!msg.Location })} style={styles('position:relative')}>
                                                        <IonItem className='input-error' style={styles('--highlight-background:unset;--min-height:40px;margin-top:2.5px')}>
                                                            <IonLabel position="floating" style={styles('font-weight:bold;margin-top:-7.5px')}><span style={styles('color:red')}>*</span>Location</IonLabel>
                                                            <IonTextarea className="font-bold br-0"
                                                                rows={2}
                                                                value={input.Location} onIonChange={(ev) => this.hState(ev, 'Location')} />
                                                        </IonItem>
                                                        <div className="invalid-tooltip">{msg.Location}</div>
                                                    </div>
                                                    <div className="row m-0">
                                                        <div className="col-6 p-0">
                                                            <div className={classNames({ 'input-invalid': !!msg.EventDate })} style={styles('position:relative')}>
                                                                <IonItem className='input-error' style={styles('--highlight-background:unset;--min-height:40px;margin-top:2.5px')}>
                                                                    <IonLabel position="floating" style={styles('font-weight:bold;margin-top:-7.5px')}><span style={styles('color:red')}>*</span>Date</IonLabel>
                                                                    <IonInput hidden />
                                                                    <IonDatetime pickerFormat="MMMM DD YYYY" displayFormat="MMM DD, YYYY" style={styles('--padding-bottom:5px;height:40px')}
                                                                        min={this.opts.dtConfig.MinDate} max={this.opts.dtConfig.MaxDate}
                                                                        value={input.EventDate} onIonChange={(ev) => this.hState(ev, 'EventDate')} />
                                                                </IonItem>
                                                                <div className="invalid-tooltip">{msg.EventDate}</div>
                                                            </div>
                                                        </div>
                                                        <div className="col-6 p-0">
                                                            <div className={classNames({ 'input-invalid': !!msg.EventDateTime })} style={styles('position:relative')}>
                                                                <IonItem className='input-error' style={styles('--highlight-background:unset;--min-height:40px;margin-top:2.5px')}>
                                                                    <IonLabel position="floating" style={styles('font-weight:bold;margin-top:-7.5px')}><span style={styles('color:red')}>*</span>Time</IonLabel>
                                                                    <IonInput hidden />
                                                                    <IonDatetime pickerFormat="hh:mm:ss A" displayFormat="hh:mm:ss A" style={styles('--padding-bottom:5px;height:40px')}
                                                                        min={this.opts.dtConfig.MinTime} max={this.opts.dtConfig.MaxTime}
                                                                        value={input.EventDateTime} onIonChange={(ev) => this.hState(ev, 'EventDateTime')} />
                                                                </IonItem>
                                                                <div className="invalid-tooltip">{msg.EventDateTime}</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <br />
                                                </SuperTab>
                                            </SuperTabs>
                                        </div>
                                    </form>

                                </div>
                            </div>
                        </Layout>
                        <Layout>
                            <div style={styles('padding:5px 2.5px;')}>
                                <IonButton style={styles('width:100%;margin:0px;')} onClick={this.hConfirm}>
                                    <IonIcon icon={saveOutline} style={styles('padding-right:5px;')} />
                                    {prop.IsUpdate ? 'Save Changes' : 'Save Event'}
                                </IonButton>
                            </div>
                        </Layout>
                    </Layout>
                </Layout>
            </Layout>
        </>);
    }
}

