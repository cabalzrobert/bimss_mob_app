import { IonButton, IonContent, IonIcon, IonInput, IonItem, IonLabel, IonTextarea, IonSelect, IonSelectOption, IonList, IonRefresher, IonRefresherContent, IonRippleEffect, IonSearchbar, IonSpinner, IonHeader, IonTitle } from '@ionic/react';
import React from 'react';
import Layout from '../../../../tools/components/+common/layout';
import TextFit from '../../../../tools/components/+common/text-fit';
import { classNames, Input, styles } from '../../../../tools/plugins/element';
import UserPager from '../../user-pager';
import { rest } from '../../../+app/+service/rest.service';
import Stack, { Alert, Modal } from '../../../../tools/components/+common/stack';
import { timeout } from '../../../../tools/plugins/delay';
import { device } from '../../../../tools/plugins/device';
import { arrowBackOutline, imagesOutline } from 'ionicons/icons';
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
import { constants } from 'buffer';

const { Object }: any = window;

export default class AccountEducBackgroundView extends React.Component {
    setType = (type: any, EducLevel: any) => (this.holder.setType(type, EducLevel), this);
    setForm = (brgyrequest: any) => (this.holder.setForm(brgyrequest), this);
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
    educattainment: any = {};
    opts: any = {
        imagePicker: {
            maxCount: 100,
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
        const prop = (this.prop = { attachments: [] });
        const input: any = (this.input = {});
        const msg = (this.msg = {});
        const brgyrequest = (this.educattainment = {});
        this.setState({ prop, brgyrequest });
        this.setState({ prop, input, msg });
        this.setState({ prop, input, msg, opts });
        if (!didMount) return;
        this.subs.u = jUserModify(async () => {
            const u = await jUser();
            Object.rcopy(input, {
                USR_ID: u.USR_ID,
                RequestorNM: u.FLL_NM
            });

            Object.rcopy(brgyrequest, this.input);

            //this.sitio=this.performSelectSitio();
            //input.SitioName = (this.sitio.find((f: any) => f.SIT_ID == input.Sitio) || mtObj);
            //input.SitioName = (this.sitio.find((f: any) => f.SIT_ID == input.Sitio) || mtObj));
            this.setState({ u, input });
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
            Object.rcopy(this.educattainment, {
                PL_ID: input.PL_ID,
                PGRP_ID: input.PGRP_ID,
                ClearanceNo: input.ClearanceNo,
                ControlNo: input.ControlNo,
                TypeofClearance: input.TypeofClearance,
                TypeofClearanceNM: input.TypeofClearanceNM,
                PurposeID: input.PurposeID,
                PurposeNM: input.PurposeNM,
                IsUpdate: this.prop.IsUpdate,
            });
            this.setState({ prop: this.prop, input: this.input });
            //console.log(this.educattainment);
        }, 750);
        return this;
    }
    setType(type: any, EducLevel: any) {
        this.input.isAdd = type;
        this.input.EducLevel = EducLevel;
        this.input.EducLevel = EducLevel;

        // console.log('this.input.EducLevel');
        // console.log(this.input);
        this.setState({ input: this.input });
        this.setState({ educattainment: this.input });
        // console.log('this.input');
        // console.log(this.input);
        // console.log('setType');
        // console.log(this.educattainment);
        return this;
    }

    hBackButton = () => {
        this.pager.back();
    }
    hConfirm = () => {
        if (!this.isValidEntries()) return;

        // console.log('this.brgyrequest');
        // console.log(this.educattainment);
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
                //console.log(this.input);
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
        //rest.post('reqbrgyclearance/request', this.educattainment).subscribe(async (res: any) => {
        rest.post('educ/loadattainment/update', this.input).subscribe(async (res: any) => {
            if (res.Status == 'ok') {
                const item = Object.rcopy(res.Content, this.educattainment);
                return Alert.showSuccessMessage(res.Message, () => this.pager.back({ item, component: AccountEducBackgroundView, IsUpdate: !!this.educattainment.IsUpdate, }));
            }
            Alert.showErrorMessage(res.Message);
        }, (err: any) => {
            Alert.showWarningMessage('Please try again');
        });
    }
    private isValidEntries(): boolean {
        var isValid = true;
        console.log('isValidEntries');
        if (!this.input.EducLevel) {
            this.msg.Subject = 'Please Select Level'; //this.msg.Subject = 'Please fill up subject';
            isValid = false;
        }
        if (!this.input.School) {
            this.msg.Subject = 'Please Enter School Name'; //this.msg.Subject = 'Please fill up subject';
            isValid = false;
        }
        if (!this.input.SchoolAddress) {
            this.msg.Subject = 'Please Enter School Address'; //this.msg.Subject = 'Please fill up subject';
            isValid = false;
        }
        if (!this.input.SchoolYear) {
            this.msg.Subject = 'Please Enter School Year'; //this.msg.Subject = 'Please fill up subject';
            isValid = false;
        }
        //this.input.Course=(this.input.Course.IsEmpty()) ? '' : this.input.Course;

        //this.input.Attachments = null;
        if (this.prop.attachments.length > 0) {
            this.educattainment.TotalAttachment = this.prop.attachments.length;
            this.educattainment.Attachments = this.prop.attachments.map((m: any) => m.Base);
        }

        if (isValid) {
            const currentdate = new Date();
            Object.rcopy(this.input, {
                ApplicationDate: `${currentdate.getFullYear()}-${currentdate.getMonth() + 1}-${currentdate.getDate()}`,
            });
        }
        this.input.IsValid = isValid;
        this.setState({ msg: this.msg, educrequest: this.input });
        console.log(isValid);
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

    hTypeofClearance = async () => {
        //if (!this.input.isAdd && this.input.STAT != "Open") return;
        // if (!this.input.Barangay)
        //     return toast('Please select Barangay firts');
        //console.log(this.input.Barangay);

        const modal = await TypeofClearanceSelectPopUp.modal("Type of Clearance", { Type: 2, ID: this.educattainment.TypeofClearanceNM });
        //const modal = await SitioSelectPopUp.modal('Sitio', { Type: 2, ID: this.input.Barangay });
        await modal.present();
        const brgyrequest = this.educattainment;
        const res = await modal.onDidDismiss();
        const data = (res || mtObj).data;
        if (!data) return;
        // if (input.Sitio == data.SIT_ID) return;
        // input.Sitio = data.SIT_ID;
        // input.SitioName = data.SIT_NM;
        this.educattainment.TypeofClearance = data.TypeofClearance;
        this.educattainment.TypeofClearanceNM = data.TypeofClearanceNM;
        this.setState({ brgyrequest: this.educattainment });
    }
    hPurpose = async () => {
        //if (!this.input.isAdd && this.input.STAT != "Open") return;
        // if (!this.input.Barangay)
        //     return toast('Please select Barangay firts');
        //console.log(this.input.Barangay);

        const modal = await PurposeSelectPopUp.modal("Purpose", { Type: 2, ID: this.educattainment.Purpose });
        //const modal = await SitioSelectPopUp.modal('Sitio', { Type: 2, ID: this.input.Barangay });
        await modal.present();
        const brgyrequest = this.educattainment;
        const res = await modal.onDidDismiss();
        const data = (res || mtObj).data;
        if (!data) return;
        // if (input.Sitio == data.SIT_ID) return;
        // input.Sitio = data.SIT_ID;
        // input.SitioName = data.SIT_NM;
        this.educattainment.PurposeID = data.PurposeID;
        this.educattainment.PurposeNM = data.PurposeNM;
        this.setState({ brgyrequest: this.educattainment });
    }

    elIonSelect: any = React.createRef();
    get attachmentOpts() { return this.elIonSelect.current; }
    render() {
        const { input = {}, msg = {}, prop = {} } = this.state;
        const optImagePicker = (this.opts.imagePicker || {});
        const sMaxAttachment = !(prop.attachments.length < optImagePicker.maxCount);
        //this.input.Category_Document = '2';
        //this.input.CategoryID = '2';
        //this.input.URLAttachment = '';
        return (<>
            <Layout full>
                <Layout>
                    {/* <div className="row m-0 toolbar-panel">
                        <div className="vertical arrow-back" onClick={this.hBackButton}></div>
                        <div className="col-4 p-0 vertical toolbar-parentx" onClick={this.hBackButton}></div>
                        <div className="col-7 p-0 vertical" style={styles('align-items: end;color: black;font: message-box;')}><div><TextFit text="Educational Attainment" /></div></div>
                    </div> */}
                    <IonHeader>
                        <div style={styles('height:70px;')}>
                            <div style={styles('position:relative;top:11px;')}>
                                <IonItem lines="none" style={styles('--background:transparent;')}
                                    onClick={this.hBackButton}>
                                    <IonIcon size="large" icon={arrowBackOutline} style={styles('color:rgb(0,4,69);')} />
                                    <IonTitle style={styles('font-weight:bold;color:rgb(0,4,69);font-size:20pt;')}>
                                        Educational Attainment
                                    </IonTitle>
                                </IonItem>
                            </div>
                        </div>
                    </IonHeader>
                </Layout>
                <Layout auto>
                    <IonContent scrollY style={styles('background-color: transparent;')}>
                        <div className="row m-0 bootstrap-form old">
                            <div className='col-12 p-0 form-container' style={styles('width: 100%;')}>
                                <form className={classNames('needs-validation', { 'form-invalid': !input.IsValid })} noValidate onSubmit={(ev) => ev.preventDefault()} style={styles('padding:10px;')}>
                                    <div className={classNames({ 'input-invalid': !!msg.EducLevel })} style={styles('position:relative')}>
                                            <IonLabel position="fixed" style={styles('font-weight:bold;margin-top:-7.5px;margin-left:12px;')}><span style={styles('color:red')}>*</span>Level</IonLabel>
                                        <IonItem className='input-error' style={styles('--highlight-background:unset;--min-height:40px;margin-top:2.5px')}>
                                            <Input ion node={(handle) => <>
                                                <IonInput className="font-bold br-0" readonly={true}
                                                    type="text"
                                                    value={this.input.EducLevel} {...handle({ onChange: (ev) => this.hState(ev, 'EducLevel') })} />
                                            </>} />
                                        </IonItem>
                                        <div className="invalid-tooltip">{msg.EducLevel}</div>
                                    </div>
                                    <div className={classNames({ 'input-invalid': !!msg.School })} style={styles('position:relative;margin-top:7.5px;')}>
                                            <IonLabel position="fixed" style={styles('font-weight:bold;margin-top:-7.5px;margin-left:12px;')}><span style={styles('color:red')}>*</span>School</IonLabel>
                                        <IonItem className='input-error' style={styles('--highlight-background:unset;--min-height:40px;margin-top:2.5px')}>
                                            <Input ion node={(handle) => <>
                                                <IonInput className="font-bold br-0"
                                                    type="text"
                                                    value={this.input.School} {...handle({ onChange: (ev) => this.hState(ev, 'School') })} />
                                            </>} />
                                        </IonItem>
                                        <div className="invalid-tooltip">{msg.School}</div>
                                    </div>
                                    <div className={classNames({ 'input-invalid': !!msg.SchoolAddress })} style={styles('position:relative;margin-top:7.5px;')}>
                                            <IonLabel position="fixed" style={styles('font-weight:bold;margin-top:-7.5px;margin-left:12px;')}><span style={styles('color:red')}>*</span>School Address</IonLabel>
                                        <IonItem className='input-error' style={styles('--highlight-background:unset;--min-height:40px;margin-top:2.5px')}>
                                            <Input ion node={(handle) => <>
                                                <IonInput className="font-bold br-0"
                                                    type="text"
                                                    value={this.input.SchoolAddress} {...handle({ onChange: (ev) => this.hState(ev, 'SchoolAddress') })} />
                                            </>} />
                                        </IonItem>
                                        <div className="invalid-tooltip">{msg.SchoolYear}</div>
                                    </div>
                                    <div className={classNames({ 'input-invalid': !!msg.SchoolYear })} style={styles('position:relative;margin-top:7.5px;')}>
                                            <IonLabel position="fixed" style={styles('font-weight:bold;margin-top:-7.5px;margin-left:12px;')}><span style={styles('color:red')}>*</span>School Year</IonLabel>
                                        <IonItem className='input-error' style={styles('--highlight-background:unset;--min-height:40px;margin-top:2.5px')}>
                                            <Input ion node={(handle) => <>
                                                <IonInput className="font-bold br-0"
                                                    type="text"
                                                    value={this.input.SchoolYear} {...handle({ onChange: (ev) => this.hState(ev, 'SchoolYear') })} />
                                            </>} />
                                        </IonItem>
                                        <div className="invalid-tooltip">{msg.SchoolYear}</div>
                                    </div>
                                    <div className={classNames({ 'input-invalid': !!msg.Course })} style={styles('position:relative;margin-top:7.5px;')} hidden={(input.EducLevel == 'College' || input.EducLevel == 'Vocational' || input.EducLevel == 'Senior Highschool') ? false : true}>
                                            <IonLabel position="fixed" style={styles('font-weight:bold;margin-top:-7.5px;margin-left:12px;')}><span style={styles('color:red')}>*</span>{(input.EducLevel != 'Senior Highschool') ? 'Course' : 'Strand'}</IonLabel>
                                        <IonItem className='input-error' style={styles('--highlight-background:unset;--min-height:40px;margin-top:2.5px')}>
                                            <Input ion node={(handle) => <>
                                                <IonInput className="font-bold br-0"
                                                    type="text"
                                                    value={this.input.Course} {...handle({ onChange: (ev) => this.hState(ev, 'Course') })} />
                                            </>} />
                                        </IonItem>
                                        <div className="invalid-tooltip">{msg.Course}</div>
                                    </div>


                                    {/* <div className="horizontal" style={styles('margin-top:5px;height:auto')}>
                                        <IonButton className="btn-green" style={styles('width:-webkit-fill-available;')} onClick={this.hConfirm}>SUBMIT</IonButton>
                                    </div> */}
                                    <div className="horizontal" style={styles('margin-top:20%;px;height:40px')}>
                                            <IonButton className="btn-green" style={styles('width:-webkit-fill-available;')} onClick={this.hConfirm}>SUBMIT</IonButton>
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

class TypeofClearanceSelectPopUp extends React.Component<{ modal: Function, Title: string, Opts: any }> implements OnDidBackdrop {
    private static cache: any = {};
    state: any = { inner: { height: (window.innerHeight + 'px') } }
    constructor(props: any) {
        super(props);
        app.component(this);
        Object.rcopy(this.filter, (this.props.Opts || mtObj));
        this.prop.IsDevice = !device.isBrowser;
        this.filter.CacheID = (this.filter.Type + '-' + (this.filter.ID || '0'));
        const cache = TypeofClearanceSelectPopUp.cache[this.filter.CacheID] || null;
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
        this.subs.s1 = rest.post('certtype', Object.rcopy(filter, this.filter)).subscribe(async (res: any) => {
            this.prop.IsFiltering = false;
            if (res.Status != 'error') {
                if (filter.IsReset) this.list = res.certtyp.map((o: any) => this.listDetails(o));
                else res.certtyp.forEach((o: any) => this.list.push(this.listDetails(o)));
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
                            placeholder="Search Type of Clearance" />{/*onIonChange={e => setSearchText(e.detail.value!)} */}
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
                                                        <div>{item.TypeofClearanceNM}</div>
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
            <Modal className="modal-adjustment full" ref={(ref) => modal = ref} content={<TypeofClearanceSelectPopUp modal={() => modal} Title={title} Opts={opts} />} />
        </>);
        setTimeout(async () => (await modal.onDidDismiss(), stack.pop()));
        return modal;
    }
}

class PurposeSelectPopUp extends React.Component<{ modal: Function, Title: string, Opts: any }> implements OnDidBackdrop {
    private static cache: any = {};
    state: any = { inner: { height: (window.innerHeight + 'px') } }
    constructor(props: any) {
        super(props);
        app.component(this);
        Object.rcopy(this.filter, (this.props.Opts || mtObj));
        this.prop.IsDevice = !device.isBrowser;
        this.filter.CacheID = (this.filter.Type + '-' + (this.filter.ID || '0'));
        const cache = PurposeSelectPopUp.cache[this.filter.CacheID] || null;
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
        this.subs.s1 = rest.post('reqbrgyclearance/purpose', Object.rcopy(filter, this.filter)).subscribe(async (res: any) => {
            this.prop.IsFiltering = false;
            if (res.Status != 'error') {
                if (filter.IsReset) this.list = res.purpose.map((o: any) => this.listDetails(o));
                else res.purpose.forEach((o: any) => this.list.push(this.listDetails(o)));
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
                            placeholder="Search Purpose" />{/*onIonChange={e => setSearchText(e.detail.value!)} */}
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
                                                        <div>{item.PurposeNM}</div>
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
            <Modal className="modal-adjustment full" ref={(ref) => modal = ref} content={<PurposeSelectPopUp modal={() => modal} Title={title} Opts={opts} />} />
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
