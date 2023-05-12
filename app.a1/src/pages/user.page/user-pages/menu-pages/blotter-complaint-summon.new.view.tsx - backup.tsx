import { IonButton, IonContent, IonIcon, IonInput, IonItem, IonLabel, IonTextarea, IonSelect, IonSelectOption, IonList, IonRefresher, IonRefresherContent, IonRippleEffect, IonSearchbar, IonSpinner, IonDatetime, IonCheckbox } from '@ionic/react';
import React from 'react';
import Layout from '../../../../tools/components/+common/layout';
import TextFit from '../../../../tools/components/+common/text-fit';
import { classNames, Input, styles } from '../../../../tools/plugins/element';
import UserPager from '../../user-pager';
import { rest } from '../../../+app/+service/rest.service';
import Stack, { Alert, Modal } from '../../../../tools/components/+common/stack';
import { timeout } from '../../../../tools/plugins/delay';
import { device } from '../../../../tools/plugins/device';
import { imagesOutline } from 'ionicons/icons';
import { ImagePicker } from '@ionic-native/image-picker';
import PhotoViewerPopUp from '../../../../tools/components/+common/modal/photo-viewer.popup';
import Recycler from '../../../../tools/components/+feature/recycler';
import RecyclerStorage from '../../../intro.page/recycler-storage';
import { toast } from '../../../../tools/plugins/toast';
import { app, OnDidBackdrop } from '../../../../tools/app';
import { mtCb, mtObj } from '../../../../tools/plugins/static';
import { jUser, jUserModify } from '../../../+app/user-module';
import { keyboard } from '../../../../tools/plugins/keyboard';
import { KeyboardInfo } from '@capacitor/core';
import FilteringView from '../../../+app/component/common/filtering.view';
import NotFound2View from '../../../+app/component/common/not-found.view';
import moment from 'moment';

const { Object }: any = window;

export default class BlotterComplaintSummonAttachmentView extends React.Component {
    setType = (type: any) => (this.holder.setType(type), this);
    setForm = (input: any) => (this.holder.setForm(input), this);
    shouldComponentUpdate = () => false;
    holder: ViewHolder = (null as any);
    render() {
        return (<>
            {/* <Recycler storage={RecyclerStorage.instance} from={ViewHolder} /> */}
            <Recycler storage={RecyclerStorage.instance} from={ViewHolder} bind={(ref: any) => this.holder = ref} />
        </>);
    }
}

export class ViewHolder extends React.Component {
    state: any = {};
    get pager() { return UserPager.instance.pager; }
    componentWillMount = () => this.willMount();
    prop: any = {};
    input: any = {};
    msg: any = {};
    subs: any = {};
    opts: any = {
        imagePicker: {
            maxCount: 5,
            quality: 100,
            outputType: 1,
            maximumImagesCount: 1,
        },
        attachmentOpts: {},
        AttachmentOpts: [
            { value: '1', name: 'Preview', method: () => this.hPreviewImage() }, //icon:'images', 
            { value: '2', name: 'Remove', method: () => this.hRemoveImage() }, //icon:'camera', 
        ],
    };
    willMount = (didMount = true) => {
        const { opts } = this;
        const { dtConfig } = opts;
        const today = new Date();
        opts.dtConfig = { MinYear: today.getFullYear(), MaxYear: today.getFullYear() + 1, MinMonth: ("0" + (today.getMonth() + 1)).slice(-2), MinDate: today.getFullYear() + '-' + ("0" + (today.getMonth() + 1)).slice(-2) + '-' + ("0" + (today.getDate())).slice(-2), MaxDate: (today.getFullYear() + 1) + '-' + ("0" + (today.getMonth() + 1)).slice(-2) + '-' + ("0" + (today.getDate())).slice(-2), MinTime: '00:00', MaxTime: '12:00' }
        const prop = (this.prop = { attachments: [] });
        const input: any = (this.input = {});
        const msg = (this.msg = {});
        this.setState({ prop, input, msg });
        this.setState({ prop, input, msg, opts });
        if (!didMount) return;
        this.subs.u = jUserModify(async () => {
            const u = await jUser();
            Object.rcopy(input, {
                Userid: u.USR_ID,
                Region: u.LOC_REG,
                Province: u.LOC_PROV,
                Municipality: u.LOC_MUN,
                Barangay: u.LOC_BRGY,
                IncidentPlace: u.LOC_SIT,
                ComplainantName: u.FLL_NM,
                ComplainantID: u.USR_ID,
            });

            //this.sitio=this.performSelectSitio();
            //input.SitioName = (this.sitio.find((f: any) => f.SIT_ID == input.Sitio) || mtObj);
            //input.SitioName = (this.sitio.find((f: any) => f.SIT_ID == input.Sitio) || mtObj));
            console.log('u');
            console.log(u);
            this.setState({ u, input });
            console.log('Input');
            console.log(input);

        });
        //console.log(this.input);
    }
    dismiss = (data?: any) => this.input.modal().dismiss(data);

    setForm(input: any) {
        this.prop.IsFiltering = true;
        this.prop.IsUpdate = true;
        this.setState({ prop: this.prop });
        this.subs.upt = timeout(() => {
            this.prop.IsFiltering = false;
            //this.prop.ImageData = (input.ImageUrl || this.prop.ImageData);
            this.prop.ImageData = (!input.ImageUrl ? this.prop.ImageData : null);
            Object.rcopy(this.input, input);
            //console.log('setForm');
            //console.log(input.IncidentTime, this.input.IncidentTime);
            //this.input.IncidentTime = input.IncidentDate + ' ' + input.IncidentTime;
            //this.input.IncidentTimeA=input.IncidentTime;

            this.setState({ prop: this.prop, input: this.input });
        }, 750);
        return this;
    }
    setType(type: any) {
        this.input.isAdd = type;
        this.input.SubType = (type != 6) ? 2 : 3;
        this.setState({ input: this.input });
        return this;
    }

    hBackButton = () => {
        this.pager.back();
    }
    hConfirm = () => {
        if (!this.isValidEntries()) return;
        console.log('All Data is Valid');
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
    hState = (ev: any, key: string) => {
        if (!!this.prop.lockInput) return;
        this.msg[key] = null;
        this.input[key] = ev.detail.value;
        this.setState({ msg: this.msg, input: this.input });
    }


    private performSubmit() {
        //rest.post((this.input.isEdit) ? 'complaint/edit' : 'complaint/new', this.input).subscribe(async (res: any) => {
        rest.post((this.input.isEdit) ? 'blotter/complaint/edit' : 'blotter/complaint/new',  {CaseNo:this.input.CaseNo, ComplainantID:this.input.ComplainantID, Respondent: this.input.Respondent, Witness:this.input.Witness, ComplaintType:this.input.ComplaintType,IncidentPlace:this.input.IncidentPlace,IncidentDate:this.input.IncidentDate,IncidentTime:this.input.IncidentTime,Issue:this.input.Issue,Statement:this.input.Statement,Attachments:this.input.Attachments, TotalAttachment:this.input.TotalAttachment, Status_Type:this.input.Status_Type}).subscribe(async (res: any) => {
            if (res.Status == 'ok') {
                console.log('res.Content');
                console.log(res.Content);
                this.input.IncidentTime=this.input.IncidentDate + ' ' + this.input.IncidentTime;
                const item = Object.rcopy(res.Content, this.input);
                console.log('item');
                console.log(item);
                return Alert.showSuccessMessage(res.Message, () => this.pager.back({ item, component: BlotterComplaintSummonAttachmentView, IsUpdate: !!this.input.isEdit, }));
            }
            Alert.showErrorMessage(res.Message);
        }, (err: any) => {
            Alert.showWarningMessage('Please try again');
        });
    }
    private isValidEntries(): boolean {
        var isValid = true;
        console.log('isValid');
        console.log(isValid);
        if (!this.input.Respondent) {
            this.msg.Subject = 'Please select a Respondent'; //this.msg.Subject = 'Please fill up subject';
            isValid = false;
        }
        if (!this.input.ComplaintType) {
            this.msg.Body = 'Please Select Complaint Type';
            isValid = false;
        }
        if (!this.input.IncidentPlace) {
            this.msg.Body = 'Please Select Incident Place';
            isValid = false;
        }

        var incidentdate = (this.input.IncidentDate || '').trim();
        if (!!incidentdate) {
            incidentdate = moment(incidentdate).format('MMM DD, YYYY');
        } else {
            this.msg.IncidentDate = 'Please enter Incident Date';
            isValid = false;
        }
        this.input.IncidentDate = incidentdate;
        console.log(this.input.IncidentTime);
        var incidenttime = (this.input.IncidentTime || '').trim();
        
        if(incidenttime=='Invalid date'){
            this.msg.IncidentTime = 'Please enter Valid Time';
            isValid = false;
        }
        if (!!incidenttime) {
            incidenttime=moment(incidenttime).format('hh:mm:ss A');
        } else{
            this.msg.IncidentTime = 'Please enter Incident Time';
            isValid = false;
        }
        console.log(incidenttime);
        this.input.IncidentTime=incidenttime;

        if (!this.input.Issue) {
            this.msg.Body = 'Please fill up Issue';
            isValid = false;
        }
        if (!this.input.Statement) {
            this.msg.Body = 'Please fill up Statement';
            isValid = false;
        }
        if(this.input.isEdit){
            this.input.Status_Type=0;
        }

        this.input.Attachments = null;
        this.input.TotalAttachment=0
        if (this.prop.attachments.length > 0) {
            this.input.TotalAttachment = this.prop.attachments.length;
            this.input.Attachments = this.prop.attachments.map((m: any) => m.Base);
        }

        if (isValid) {
            Object.rcopy(this.input, {
                DeviceID: device.uuid,
                DeviceName: device.model,
                Manufacturer: device.manufacturer,
                Serial: (device.serial || device.uuid),
                Brand: device.model,
                DeviceOS: device.operatingSystem,
                DeviceVersion: device.osVersion,
            });
        }
        this.input.IsValid = isValid;
        this.setState({ msg: this.msg, input: this.input });
        return isValid;
    }

    hAttachment = () => {
        this.pickImage();
    }

    pickImage() {
        const optImagePicker = (this.opts.imagePicker || {});
        optImagePicker.maximumImagesCount = (optImagePicker.maxCount - this.prop.attachments.length);
        ImagePicker.getPictures(optImagePicker).then((results) => {
            if (!results[0] || results[0].length < 15) return;
            for (var i = 0; i < results.length; i++) {
                this.prop.attachments.push({
                    Base: results[i],
                    ImgData: ('data:image/jpeg;base64,' + results[i]),
                });
            }
            this.setState({ prop: this.prop });
        }, (err) => {
            if (err == 'cordova_not_available')
                err = 'Function not supported in this browser!';
            Alert.showWarningMessage(err);
        });
    }
    hPreviewImage = async () => {
        const item: any = this.opts.attachmentOpts.Selected;
        const modal = await PhotoViewerPopUp.modal('Preview', item.ImgData);
        await modal.present();
    }
    hAttachmentOpts(item: any) {
        this.opts.attachmentOpts.Selected = item;
        this.attachmentOpts.open();
    }
    hAttachmentOption = (ev: any) => {
        var result = (ev.detail || {}).value;
        if (!result) return;
        setTimeout(() => result.method(), 275);
    }
    hRemoveImage = async () => {
        const index = this.prop.attachments.indexOf(this.opts.attachmentOpts.Selected);
        this.prop.attachments.splice(index, 1);
        this.setState({ prop: this.prop });
    }

    hSelectSitio = async () => {
        if (!this.input.isAdd && this.input.Status_Type == 0) return;
        // if (!this.input.Barangay)
        //     return toast('Please select Barangay firts');
        //console.log(this.input.Barangay);

        const modal = await SitioSelectPopUp.modal('Sitio', { Type: 2, ID: this.input.Barangay });
        await modal.present();
        const input = this.input;
        const res = await modal.onDidDismiss();
        const data = (res || mtObj).data;
        console.log(data);
        if (!data) return;
        if (input.IncidentPlace == data.SIT_ID) return;
        input.IncidentPlace = data.SIT_ID;
        input.IncidentPlaceName = data.SIT_NM;
        console.log(this.input.IncidentPlace);
        console.log(this.input.IncidentPlaceName);
        this.setState({ input: this.input });
    }

    hResident = async () => {
        if (!this.input.isAdd && this.input.Status_Type == 0) return;
        // if (!this.input.Barangay)
        //     return toast('Please select Barangay firts');
        //console.log(this.input.Barangay);

        const modal = await SiteRespondentSelectPopUp.modal('Respondent', { Type: 2, Region: this.input.Region, Province: this.input.Province, Municipality: this.input.Municipality, Barangay: this.input.Barangay });
        await modal.present();
        const input = this.input;
        const res = await modal.onDidDismiss();
        const data = (res || mtObj).data;
        if (!data) return;
        if (input.Respondent == data.RespondentID) return;
        input.Respondent = data.RespondentID;
        input.RespondentName = data.RespondentName;
        this.setState({ input: this.input });
    }

    elIonSelect: any = React.createRef();
    get attachmentOpts() { return this.elIonSelect.current; }
    render() {
        const { input = {}, msg = {}, prop = {} } = this.state;
        const optImagePicker = (this.opts.imagePicker || {});
        const sMaxAttachment = !(prop.attachments.length < optImagePicker.maxCount);
        return (<>
            <Layout full>
                <Layout>
                    <div className="row m-0 toolbar-panel">
                        <div className="vertical arrow-back" onClick={this.hBackButton}></div>
                        <div className="col-4 p-0 vertical toolbar-parent" onClick={this.hBackButton}></div>
                        <div className="col-7 p-0 vertical" style={styles('align-items: end;color: black;font: message-box;')}><div><TextFit text="Complaint" /></div></div>
                    </div>
                </Layout>
                <Layout auto>
                    <IonContent scrollY>
                        <div className="row m-0 bootstrap-form old">
                            <div className='col-12 p-0 form-container' style={styles('width: 100%;background-color: #1d2c65;')}>
                                <form className={classNames('needs-validation', { 'form-invalid': !input.IsValid })} noValidate onSubmit={(ev) => ev.preventDefault()}>

                                    {/* Complainant Name */}
                                    <div className={classNames({ 'input-invalid': !!msg.ComplainantName })} style={styles('position:relative')}>
                                        <IonItem className='input-error' style={styles('--highlight-background:unset;--min-height:40px;margin-top:2.5px')}>
                                            <IonLabel position="floating" style={styles('font-weight:bold;margin-top:-7.5px')}><span style={styles('color:red')}>*</span>Complainant</IonLabel>
                                            <Input ion node={(handle) => <>
                                                <IonInput className="font-bold br-0"
                                                    type="text"
                                                    value={input.ComplainantName} {...handle({ onChange: (ev) => this.hState(ev, 'Respondent') })} readonly={true} />
                                            </>} />
                                        </IonItem>
                                        <div className="invalid-tooltip">{msg.ComplainantName}</div>
                                    </div>
                                    {/* Respondent Name */}
                                    <div className={classNames({ 'input-invalid': !!msg.Respondent })} style={styles('position:relative')}
                                        onClick={this.hResident}>
                                        <IonItem className='input-error' style={styles('--highlight-background:unset;--min-height:40px;margin-top:2.5px')}>
                                            <IonLabel position="floating" style={styles('font-weight:bold;margin-top:-7.5px')}><span style={styles('color:red')}>*</span>Select Resident for Respondent</IonLabel>
                                            <Input ion="popup" node={(handle) => <>
                                                <IonInput hidden></IonInput>
                                                <IonSelect interface="action-sheet" cancelText="Dismiss" style={styles('height:40px')} multiple={true}
                                                    value={input.Respondent} onIonChange={(ev) => this.hState(ev, 'Respondent')} >
                                                    <IonSelectOption value={input.Respondent}>{input.RespondentName}</IonSelectOption>
                                                </IonSelect>
                                            </>} />
                                        </IonItem>
                                        <div className="invalid-tooltip">{msg.Respondent}</div>
                                        <div style={styles('position:absolute;top:0;width:100%;height:100%;z-index:1')}>&nbsp;</div>
                                    </div>

                                    <div className={classNames({ 'input-invalid': !!msg.Witness })} style={styles('position:relative')}>
                                        <IonItem className='input-error' style={styles('--highlight-background:unset;--min-height:40px;margin-top:2.5px')}>
                                            <IonLabel position="floating" style={styles('font-weight:bold;margin-top:-7.5px')}><span style={styles('color:red')}>*</span>Witness (Lastname, Firstname, for multiple witness )</IonLabel>
                                            <Input ion node={(handle) => <>
                                                <IonInput className="font-bold br-0"
                                                    type="text"
                                                    value={input.Witness} {...handle({ onChange: (ev) => this.hState(ev, 'Witness') })}  />
                                            </>} />
                                        </IonItem>
                                        <div className="invalid-tooltip">{msg.Issue}</div>
                                    </div>

                                    {/* Complaint Type */}
                                    <div className={classNames({ 'input-invalid': !!msg.ComplaintType })} style={styles('position:relative')}>
                                        <IonItem className='input-error' style={styles('--highlight-background:unset;--min-height:40px;margin-top:2.5px')}>
                                            <IonLabel position="floating" style={styles('font-weight:bold;margin-top:-7.5px')}><span style={styles('color:red')}>*</span>Compaint Type</IonLabel>
                                            <Input ion="popup" node={(handle) => <>
                                                <IonInput hidden></IonInput>
                                                <IonSelect interface="action-sheet" cancelText="Dismiss" style={styles('height:40px')}
                                                    value={input.ComplaintType} {...handle({ onChange: (ev) => this.hState(ev, 'ComplaintType') })} > {/* [(ngModel)]="filter.Method" (ionChange)="handleChangedPayMethod()"*/}
                                                    <IonSelectOption value=''>Select Complaint Type</IonSelectOption>
                                                    <IonSelectOption value='1'>Crime</IonSelectOption>
                                                    <IonSelectOption value='2'>Accident</IonSelectOption>
                                                    <IonSelectOption value='3'>Disturbance</IonSelectOption>
                                                    <IonSelectOption value='4'>Negligence</IonSelectOption>
                                                </IonSelect>
                                            </>} />
                                        </IonItem>
                                        <div className="invalid-tooltip">{msg.ComplaintType}</div>
                                    </div>
                                    {/* Place Incident Sitio/ Purok */}
                                    <div className={classNames({ 'input-invalid': !!msg.IncidentPlace })} style={styles('position:relative')}
                                        onClick={this.hSelectSitio}>
                                        <IonItem className='input-error' style={styles('--highlight-background:unset;--min-height:40px;margin-top:2.5px')}>
                                            <IonLabel position="floating" style={styles('font-weight:bold;margin-top:-7.5px')}><span style={styles('color:red')}>*</span>Select Sitio/ Purok Place of Incedent</IonLabel>
                                            <Input ion="popup" node={(handle) => <>
                                                <IonInput hidden></IonInput>
                                                <IonSelect interface="action-sheet" cancelText="Dismiss" style={styles('height:40px')}
                                                    value={input.IncidentPlace} onIonChange={(ev) => this.hState(ev, 'IncidentPlace')} >
                                                    <IonSelectOption value={input.IncidentPlace}>{input.IncidentPlaceName}</IonSelectOption>
                                                </IonSelect>
                                            </>} />
                                        </IonItem>
                                        <div className="invalid-tooltip">{msg.IncidentPlace}</div>
                                        <div style={styles('position:absolute;top:0;width:100%;height:100%;z-index:1')}>&nbsp;</div>
                                    </div>

                                    {/*Date and Time*/}
                                    <div className="row m-0">
                                        <div className="col-6 p-0">
                                            <div className={classNames({ 'input-invalid': !!msg.IncidentDate })} style={styles('position:relative')}>
                                                <IonItem className='input-error' style={styles('--highlight-background:unset;--min-height:40px;margin-top:2.5px')}>
                                                    <IonLabel position="floating" style={styles('font-weight:bold;margin-top:-7.5px')}><span style={styles('color:red')}>*</span>Incident Date</IonLabel>
                                                    <Input ion node={(handle) => <>
                                                        <IonInput hidden />
                                                        <IonDatetime pickerFormat="MMMM DD YYYY" displayFormat="MMM DD, YYYY" style={styles('--padding-bottom:5px;height:40px')}
                                                            min={this.opts.dtConfig.MinYear} max={this.opts.dtConfig.MaxYear}
                                                            value={input.IncidentDate} {...handle({ onChange: (ev) => this.hState(ev, 'IncidentDate') })} />
                                                    </>} />
                                                </IonItem>
                                                <div className="invalid-tooltip">{msg.IncidentDate}</div>
                                            </div>
                                        </div>
                                        <div className="col-6 p-0">
                                            <div className={classNames({ 'input-invalid': !!msg.IncidentTime })} style={styles('position:relative')}>
                                                <IonItem className='input-error' style={styles('--highlight-background:unset;--min-height:40px;margin-top:2.5px')}>
                                                    <IonLabel position="floating" style={styles('font-weight:bold;margin-top:-7.5px')}><span style={styles('color:red')}>*</span>Time</IonLabel>
                                                    <IonInput hidden />
                                                    <IonDatetime pickerFormat="hh:mm A" displayFormat="hh:mm A" style={styles('--padding-bottom:5px;height:40px')}
                                                        min={this.opts.dtConfig.MinTime} max={this.opts.dtConfig.MaxTime}
                                                        value={input.IncidentTime} onIonChange={(ev) => this.hState(ev, 'IncidentTime')} />
                                                </IonItem>
                                                <div className="invalid-tooltip">{msg.IncidentTime}</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className={classNames({ 'input-invalid': !!msg.Issue })} style={styles('position:relative')}>
                                        <IonItem className='input-error' style={styles('--highlight-background:unset;--min-height:40px;margin-top:2.5px')}>
                                            <IonLabel position="floating" style={styles('font-weight:bold;margin-top:-7.5px')}><span style={styles('color:red')}>*</span>Issue</IonLabel>
                                            <Input ion node={(handle) => <>
                                                <IonInput className="font-bold br-0"
                                                    type="text"
                                                    value={input.Issue} {...handle({ onChange: (ev) => this.hState(ev, 'Issue') })} />
                                            </>} />
                                        </IonItem>
                                        <div className="invalid-tooltip">{msg.Issue}</div>
                                    </div>

                                    <div className={classNames({ 'input-invalid': !!msg.Statement })} style={styles('position:relative;margin-top:10px')}>
                                        <IonItem lines="none" className='input-error' style={styles('--highlight-background:unset')}>
                                            <IonLabel position="stacked" style={styles('font-weight:bold;margin-top:-7.5px')}>Blotter Details</IonLabel>
                                            <Input ion node={(handle) => <>
                                                <IonTextarea rows={10} placeholder="Blotter Details."
                                                    value={input.Statement} {...handle({ onChange: (ev) => this.hState(ev, 'Statement') })} />
                                            </>} />
                                        </IonItem>
                                        <div className="invalid-tooltip" style={styles('top:98%')}>{msg.Statement}</div>
                                    </div>
                                    <div style={styles('color:#fdb67f;padding:10px 2.5px')} >
                                        <div>Attachment(s) <span style={styles('font-size:80%')}>(optional)</span>: </div>
                                        <div className="row m-0">
                                            {prop.attachments?.map((i: any, idx: any) => <>
                                                <div key={idx} style={styles('width:75px;height:75px;position:relative;border:1px solid rgba(255,255,255,0.75);background-color:rgba(0,0,0,0.5);border-radius:5px')} onClick={() => this.hAttachmentOpts(i)}> {/*width:75px;height:75px;position:relative*/}
                                                    <img className="img-fit" src={i.ImgData} /> {/*style={styles('padding:2.5px')}*/}
                                                </div>
                                            </>)}
                                            {sMaxAttachment ? null : <>
                                                <div className="horizontal" style={styles('width:75px;height:75px;position:relative')}>
                                                    <div className="vertical">
                                                        <IonButton style={styles('height:30px;width:30px;--padding-start:0px;--padding-end:0px')} onClick={this.hAttachment}>
                                                            <IonIcon icon={imagesOutline} />
                                                        </IonButton>
                                                    </div>
                                                </div>
                                            </>}
                                        </div>
                                    </div>
                                    <div className="horizontal" style={styles('margin-top:5px;height:auto')}>
                                        <button className="btn-green" style={styles('width:200px')} onClick={this.hConfirm}>Submit Query</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </IonContent>
                </Layout>
            </Layout>
            <div style={styles('visibility:hidden;height:0px;width:0px')}>
                <Input ion="popup" node={(handle) => <>
                    <IonSelect interface="action-sheet"
                        interfaceOptions={{ header: 'Select options:' }}
                        {...handle({ ref: this.elIonSelect, onChange: this.hAttachmentOption, clearAfter: true })}>
                        {this.opts.AttachmentOpts.map((opt: any, idx: any) =>
                            <IonSelectOption key={idx} value={opt}>{opt.name}</IonSelectOption>
                        )}
                    </IonSelect>
                </>} />
            </div>
        </>);
    }
}
class SitioSelectPopUp extends React.Component<{ modal: Function, Title: string, Opts: any }> implements OnDidBackdrop {
    private static cache: any = {};
    state: any = { inner: { height: (window.innerHeight + 'px') } }
    constructor(props: any) {
        super(props);
        app.component(this);
        Object.rcopy(this.filter, (this.props.Opts || mtObj));
        this.prop.IsDevice = !device.isBrowser;
        this.filter.CacheID = (this.filter.Type + '-' + (this.filter.ID || '0'));
        const cache = SitioSelectPopUp.cache[this.filter.CacheID] || null;
        if (!!cache) {
            this.list = cache.List;
            this.prop.IsEmpty = (this.list.length < 1);
            this.prop.IsFiltering = this.prop.IsEmpty;
            if (!this.prop.IsEmpty) Object.rcopy(this.filter, cache.Filter);
        }
        this.state = { ...this.state, prop: this.prop, filter: this.filter, list: this.list };
    }
    dismiss = (data: any = null) => this.props.modal().dismiss(data);
    hClose = () => this.dismiss();

    subs: any = {};
    filter: any = { Search: '' };
    prop: any = { IsFiltering: true };
    list: any = [];
    componentDidMount = () => {
        this.subs.u = jUserModify(async () => this.setState({ u: await jUser() }));
        this.onResize();
        if (!!this.prop.IsDevice) {
            this.subs.k1 = keyboard.addListener('keyboardWillShow', (info: KeyboardInfo) => {
                this.prop.KeyboardIsVisible = true;
                setTimeout(() => this.onResize(true), 750);
            });
            this.subs.k2 = keyboard.addListener('keyboardWillHide', () => {
                this.prop.KeyboardIsVisible = false;
                this.onResize(true);
            });
        }
        this.hFilter();
    }
    onResize(triggerByKeyboard: boolean = false) {
        var height = window.innerHeight;//((window.innerHeight<500||(triggerByKeyboard && this.prop.KeyboardIsVisible))?window.innerHeight:500);
        this.state.inner.height = ((height * 0.975) + 'px');
        this.setState({ inner: this.state.inner });
    }
    componentWillUnmount = () => {
        Object.values(this.subs).map((m: any) => m.unsubscribe());
    }
    onDidBackdrop() {
        this.dismiss();
        return false;
    }

    hItem = (item: any) => {
        this.dismiss(item);
    }

    hFState = (ev: any, key: string) => this.filter[key] = ev.detail.value;
    hFilter = () => {
        if (this.filter.LastSearch == this.filter.Search) return;
        this.filter.LastSearch = this.filter.Search
        this.prop.IsFiltering = true;
        this.performRequestDelay({ IsReset: true }, mtCb, 750);
    }
    hPullRefresh = (ev: any) => {
        this.performRequestDelay({ IsReset: true, IsFiltering: true }, (err: any) => ev.detail.complete());
    }
    hLoadMore = (item: any) => {
        var filter = item.NextFilter;
        filter.IsFiltering = true;
        this.setState({ list: this.list });
        this.performRequestDelay(filter, (err: any) => {
            if (!!err) return (filter.IsFiltering = false);
            delete item.NextFilter;
        });
    }

    private performRequestDelay(filter: any, callback: Function = mtCb, delay: number = 175) {
        if (this.subs.t1) this.subs.t1.unsubscribe();
        this.prop.IsFiltering = !filter.IsFiltering;
        this.setState({ prop: this.prop });
        this.subs.t1 = timeout(() => this.performRequest(filter, callback), delay);
    }
    private performRequest(filter: any, callback: Function = mtCb) {
        if (!this.subs) return;
        if (this.subs.s1) this.subs.s1.unsubscribe();
        console.log(this.filter);
        this.subs.s1 = rest.post('sitio', Object.rcopy(filter, this.filter)).subscribe(async (res: any) => {
            this.prop.IsFiltering = false;
            if (res.Status != 'error') {
                if (filter.IsReset) this.list = res.sitio.map((o: any) => this.listDetails(o));
                else res.sitio.forEach((o: any) => this.list.push(this.listDetails(o)));
                //SitioSelectPopUp.cache[this.filter.CacheID] = { Filter: this.filter, List: this.list, };
                this.prop.IsEmpty = (this.list.length < 1);
                if (callback != null) callback();
                this.setState({ filter: this.filter, prop: this.prop, list: this.list });
                return;
            }
        }, (err: any) => {
            toast('Failed to retrieve data, Please try again');
            this.prop.IsFiltering = false;
            this.prop.IsEmpty = (this.list.length < 1);
            if (callback != null) callback(err);
            this.setState({ prop: this.prop });
        });
    }
    private listDetails(item: any) {
        return item;
    }

    render() {
        const { filter = {}, prop = {}, inner = {} } = this.state;
        const { list = [] } = this.state;
        return (<>
            <div className="modal-container" style={styles({ 'height': inner.height })}>
                <div style={styles('padding-top:5px')}>
                    <div className="row m-0 header">
                        <div className="col-10">Select {this.props.Title}</div>
                        <div className="col-2 p-0 btn-close" style={styles('text-align:right;right:5px')} onClick={this.hClose}></div>
                    </div>
                </div>
                <Layout full style={styles('height:calc(100% - 30px)')}>
                    <Layout>
                        <IonSearchbar value={filter.Search} onIonChange={(ev) => (this.hFState(ev, 'Search'), this.hFilter())}
                            placeholder="Search Customer" />{/*onIonChange={e => setSearchText(e.detail.value!)} */}
                    </Layout>
                    <Layout auto>
                        <NotFound2View visible={prop.IsEmpty} />
                        <FilteringView visible={prop.IsFiltering} />
                        <IonContent scrollY>
                            <IonRefresher slot="fixed" onIonRefresh={this.hPullRefresh}>
                                <IonRefresherContent />
                            </IonRefresher>
                            <IonList lines='none'>
                                <div className="list wbg">
                                    {list?.map((item: any, idx: any) =>
                                        <div key={idx} className={classNames('list-item')} style={styles('border:0px;margin:0px')}>
                                            {!item.NextFilter ? <>
                                                <div className="row m-0 details ion-activatable" onClick={() => this.hItem(item)}
                                                    style={styles('padding:5px;', { 'border-top': (idx == 0 ? null : '1px solid rgba(128,128,128,0.75)') })}>
                                                    <IonRippleEffect />
                                                    <div className="col-12 p-0 vertical">
                                                        <div>{item.SIT_NM}</div>
                                                    </div>
                                                </div>
                                            </> : <MoreItem item={item} onClick={() => this.hLoadMore(item)} />}
                                        </div>
                                    )}
                                </div>
                            </IonList>
                        </IonContent>
                    </Layout>
                </Layout>
            </div>
        </>);
    }

    static modal = async (title: string, opts: any) => {
        var modal: any;
        var stack = await Stack.push(<>
            <Modal className="modal-adjustment full" ref={(ref) => modal = ref} content={<SitioSelectPopUp modal={() => modal} Title={title} Opts={opts} />} />
        </>);
        setTimeout(async () => (await modal.onDidDismiss(), stack.pop()));
        return modal;
    }
}

class SiteRespondentSelectPopUp extends React.Component<{ modal: Function, Title: string, Opts: any }> implements OnDidBackdrop {
    private static cache: any = {};
    state: any = { inner: { height: (window.innerHeight + 'px') } }
    constructor(props: any) {
        super(props);
        app.component(this);
        console.log('SiteRespondentSelectPopUp');
        console.log(this.props.Opts);
        Object.rcopy(this.filter, (this.props.Opts || mtObj));
        this.prop.IsDevice = !device.isBrowser;
        this.filter.CacheID = (this.filter.Type + '-' + (this.filter.ID || '0'));
        const cache = SiteRespondentSelectPopUp.cache[this.filter.CacheID] || null;
        if (!!cache) {
            this.list = cache.List;
            this.prop.IsEmpty = (this.list.length < 1);
            this.prop.IsFiltering = this.prop.IsEmpty;
            if (!this.prop.IsEmpty) Object.rcopy(this.filter, cache.Filter);
        }
        this.state = { ...this.state, prop: this.prop, filter: this.filter, list: this.list };
    }
    dismiss = (data: any = null) => this.props.modal().dismiss(data);
    hClose = () => this.dismiss();

    subs: any = {};
    filter: any = { Search: '' };
    prop: any = { IsFiltering: true };
    list: any = [];
    componentDidMount = () => {
        this.subs.u = jUserModify(async () => this.setState({ u: await jUser() }));
        this.onResize();
        if (!!this.prop.IsDevice) {
            this.subs.k1 = keyboard.addListener('keyboardWillShow', (info: KeyboardInfo) => {
                this.prop.KeyboardIsVisible = true;
                setTimeout(() => this.onResize(true), 750);
            });
            this.subs.k2 = keyboard.addListener('keyboardWillHide', () => {
                this.prop.KeyboardIsVisible = false;
                this.onResize(true);
            });
        }
        this.hFilter();
    }
    onResize(triggerByKeyboard: boolean = false) {
        var height = window.innerHeight;//((window.innerHeight<500||(triggerByKeyboard && this.prop.KeyboardIsVisible))?window.innerHeight:500);
        this.state.inner.height = ((height * 0.975) + 'px');
        this.setState({ inner: this.state.inner });
    }
    componentWillUnmount = () => {
        Object.values(this.subs).map((m: any) => m.unsubscribe());
    }
    onDidBackdrop() {
        this.dismiss();
        return false;
    }

    hItem = (item: any) => {
        this.dismiss(item);
    }

    hFState = (ev: any, key: string) => this.filter[key] = ev.detail.value;
    hFilter = () => {
        if (this.filter.LastSearch == this.filter.Search) return;
        this.filter.LastSearch = this.filter.Search
        this.prop.IsFiltering = true;
        this.performRequestDelay({ IsReset: true }, mtCb, 750);
    }
    hPullRefresh = (ev: any) => {
        this.performRequestDelay({ IsReset: true, IsFiltering: true }, (err: any) => ev.detail.complete());
    }
    hLoadMore = (item: any) => {
        var filter = item.NextFilter;
        filter.IsFiltering = true;
        this.setState({ list: this.list });
        this.performRequestDelay(filter, (err: any) => {
            if (!!err) return (filter.IsFiltering = false);
            delete item.NextFilter;
        });
    }

    private performRequestDelay(filter: any, callback: Function = mtCb, delay: number = 175) {
        if (this.subs.t1) this.subs.t1.unsubscribe();
        this.prop.IsFiltering = !filter.IsFiltering;
        this.setState({ prop: this.prop });
        this.subs.t1 = timeout(() => this.performRequest(filter, callback), delay);
    }
    private performRequest(filter: any, callback: Function = mtCb) {
        if (!this.subs) return;
        if (this.subs.s1) this.subs.s1.unsubscribe();
        console.log(this.filter);
        this.subs.s1 = rest.post('resident/respondent1', Object.rcopy(filter, this.filter)).subscribe(async (res: any) => {
            this.prop.IsFiltering = false;
            if (res.Status != 'error') {
                if (filter.IsReset) this.list = res.respondent.map((o: any) => this.listDetails(o));
                else res.respondent.forEach((o: any) => this.list.push(this.listDetails(o)));
                //SitioSelectPopUp.cache[this.filter.CacheID] = { Filter: this.filter, List: this.list, };
                this.prop.IsEmpty = (this.list.length < 1);
                if (callback != null) callback();
                this.setState({ filter: this.filter, prop: this.prop, list: this.list });
                return;
            }
        }, (err: any) => {
            toast('Failed to retrieve data, Please try again');
            this.prop.IsFiltering = false;
            this.prop.IsEmpty = (this.list.length < 1);
            if (callback != null) callback(err);
            this.setState({ prop: this.prop });
        });
    }
    private listDetails(item: any) {
        return item;
    }

    render() {
        const { filter = {}, prop = {}, inner = {} } = this.state;
        const { list = [] } = this.state;
        return (<>
            <div className="modal-container" style={styles({ 'height': inner.height })}>
                <div style={styles('padding-top:5px')}>
                    <div className="row m-0 header">
                        <div className="col-10">Select {this.props.Title}</div>
                        <div className="col-2 p-0 btn-close" style={styles('text-align:right;right:5px')} onClick={this.hClose}></div>
                    </div>
                </div>
                <Layout full style={styles('height:calc(100% - 30px)')}>
                    <Layout>
                        <IonSearchbar value={filter.Search} onIonChange={(ev) => (this.hFState(ev, 'Search'), this.hFilter())}
                            placeholder="Search Customer" />{/*onIonChange={e => setSearchText(e.detail.value!)} */}
                    </Layout>
                    <Layout auto>
                        <NotFound2View visible={prop.IsEmpty} />
                        <FilteringView visible={prop.IsFiltering} />
                        <IonContent scrollY>
                            <IonRefresher slot="fixed" onIonRefresh={this.hPullRefresh}>
                                <IonRefresherContent />
                            </IonRefresher>
                            <IonList lines='none'>
                                <div className="list wbg">
                                    {list?.map((item: any, idx: any) =>
                                        <div key={idx} className={classNames('list-item')} style={styles('border:0px;margin:0px')}>
                                            {!item.NextFilter ? <>
                                                <div className="row m-0 details ion-activatable" onClick={() => this.hItem(item)}
                                                    style={styles('padding:5px;', { 'border-top': (idx == 0 ? null : '1px solid rgba(128,128,128,0.75)') })}>
                                                    <IonRippleEffect />
                                                    <div className="col-12 p-0 vertical">
                                                        <div>{item.RespondentName}</div>
                                                    </div>
                                                </div>
                                            </> : <MoreItem item={item} onClick={() => this.hLoadMore(item)} />}
                                        </div>
                                    )}
                                </div>
                            </IonList>
                        </IonContent>
                    </Layout>
                </Layout>
            </div>
        </>);
    }

    static modal = async (title: string, opts: any) => {
        var modal: any;
        var stack = await Stack.push(<>
            <Modal className="modal-adjustment full" ref={(ref) => modal = ref} content={<SiteRespondentSelectPopUp modal={() => modal} Title={title} Opts={opts} />} />
        </>);
        setTimeout(async () => (await modal.onDidDismiss(), stack.pop()));
        return modal;
    }
}

const MoreItem: React.FC<{ item: any, onClick?: React.MouseEventHandler }> = ({ item, onClick }) => {
    if (!item.NextFilter) return null;
    return (<>
        <IonItem lines="none">
            <div className="horizontal" style={styles('width:100%', 'color:darkslategray')}>
                <div className="vertical">
                    {!item.NextFilter.IsFiltering ? <>
                        <div onClick={onClick}>Load more ..</div>
                    </> : <>
                        <div className="horizontal" style={styles('width:100%')}>
                            <div className="vertical"><IonSpinner name="crescent" color="primary" style={styles('height:25px;width:25px')} /></div>
                            <div className="vertical"><span style={styles('font-size:85%')}>&nbsp; Loading ..</span></div>
                        </div>
                    </>}
                </div>
            </div>
        </IonItem>
    </>);
};
