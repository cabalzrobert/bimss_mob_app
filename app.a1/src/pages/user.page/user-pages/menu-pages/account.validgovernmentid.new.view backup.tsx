import { KeyboardInfo } from '@capacitor/core';
import { Camera } from '@ionic-native/camera';
import { ImagePicker } from '@ionic-native/image-picker';
import { SuperTab, SuperTabButton, SuperTabs, SuperTabsContainer, SuperTabsToolbar } from '@ionic-super-tabs/react';
import { IonButton, IonButtons, IonContent, IonDatetime, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonList, IonMenuButton, IonRefresher, IonRefresherContent, IonRippleEffect, IonSearchbar, IonSelect, IonSelectOption, IonSpinner, IonTextarea, IonTitle, IonToolbar } from '@ionic/react';
import { arrowBackSharp, call, cameraOutline, cardOutline, personOutline, saveOutline } from 'ionicons/icons';
import moment from 'moment';
import React from 'react';
import { rest } from '../../../+app/+service/rest.service';
import FilteringView from '../../../+app/component/common/filtering.view';
import NotFound2View from '../../../+app/component/common/not-found.view';
import { jCompany, jUser, jUserModify } from '../../../+app/user-module';
import { app, OnDidBackdrop } from '../../../../tools/app';
import ImgPreloader from '../../../../tools/components/+common/img-preloader';
import Layout from '../../../../tools/components/+common/layout';
import PhotoViewerPopUp from '../../../../tools/components/+common/modal/photo-viewer.popup';
import Stack, { Alert, Modal } from '../../../../tools/components/+common/stack';
import { isAlpha, isEmail } from '../../../../tools/global';
import { timeout } from '../../../../tools/plugins/delay';
import { device } from '../../../../tools/plugins/device';
import { classNames, clearAfter, Input, styles } from '../../../../tools/plugins/element';
import { keyboard } from '../../../../tools/plugins/keyboard';
import { mtCb, mtObj, subscribe } from '../../../../tools/plugins/static';
import { toast } from '../../../../tools/plugins/toast';
import { Crop } from '@ionic-native/crop';
import { Base64 } from '@ionic-native/base64';
import UserPager from '../../user-pager';
import Recycler from '../../../../tools/components/+feature/recycler';
import RecyclerStorage from '../../../intro.page/recycler-storage';
import TextFit from '../../../../tools/components/+common/text-fit';

const { Object, data = {} } = (window as any);
const { locations } = data;
//const { Group } = data;

export default class ValidGovernmentIDView extends React.Component {
    setType = (type: any) => (this.holder.setType(type), this);
    setForm = (input: any) => (this.holder.setForm(input), this);
    //
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
        opts.dtConfig = { MinYear: '1910', MaxYear: today.getFullYear(), }
        const prop: any = (this.prop = { didMount: didMount, IsFiltering: true, ImageData: './assets/img/icon_blank_id.png' });
        const input: any = (this.input = { Country: '63', Island: '' });
        const msg = (this.msg = {});

        this.setState({ prop, input, msg, opts });
        if (!didMount) return;
        this.subs.u = jUserModify(async () => {
            const u = await jUser();
            Object.rcopy(input, {
                Userid: u.USR_ID,
                Barangay: u.LOC_BRGY,
                Sitio: u.LOC_SIT,
            });
            this.setState({ u, input });
        });
    }
    didMount = () => {
        if (!this.prop.didMount) return;
        this.prop.IsFiltering = false;
        this.setState({ prop: this.prop });
        rest.ready(() => this.performRequestDelay({ IsReset: true }));
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

        console.log('Member Account Profile performRequestDelay');
        this.subs.s1 = subscribe(() => {
            var restDone = false;
            const sub = rest.post('lottery/profile', filter).subscribe(async (res: any) => {
                restDone = true;
                this.prop.IsFiltering = false;
                console.log(sub);
                if (res.Status != 'error') {
                    this.setInfo(res);
                    this.prop.isLoaded = true;
                    this.prop.isReady = true;
                    if (callback != null) callback();
                    this.setState({ prop: this.prop });
                    return;
                }
            }, (err: any) => {
                this.prop.IsFiltering = false;
                if (callback != null) callback(err);
                this.setState({ prop: this.prop });
            });
            return () => (sub.unsubscribe(), (!restDone ? callback : mtCb)());
        });
    }
    private async setInfo(info: any) {
        await jCompany(info, true);
    }
    willUnmount = () => {
        Object.values(this.subs).map((m: any) => m.unsubscribe());
    }
    hBackButton = () => {
        this.pager.back();
    }
    private listDetails(item: any) {
        return item;
    }

    setForm(input: any) {
        this.prop.IsFiltering = true;
        this.prop.IsUpdate = true;
        this.setState({ prop: this.prop });
        this.subs.upt = timeout(() => {
            this.prop.IsFiltering = false;
            this.prop.ImageData = (input.ImageUrl || this.prop.ImageData);
            Object.rcopy(this.input, input);
            this.setState({ prop: this.prop, input: this.input });
        }, 750);
        return this;
    }
    setType(type: any) {
        this.input.Type = type;
        this.setState({ input: this.input });
        return this;
    }
    Sitiolist: any = [];
    SiteLeaderList: any = [];
    sitio: any = [];
    subs: any = {};
    msg: any = {};
    input: any = {};
    prop: any = {};
    opts: any = {
        camera: {
            quality: 75,
            targetHeight: 600,
            targetWidth: 600,
            //destinationType:Camera.DestinationType.DATA_URL,
            encodingType: Camera.EncodingType.JPEG,
            mediaType: Camera.MediaType.PICTURE,
            saveToPhotoAlbum: false,
            correctOrientation: true,
        },
        imagePicker: {
            quality: 100,
            //outputType: 1,
            maximumImagesCount: 1,
        },
        ImagePickerOpts: [
            { value: '1', name: 'Pick Image', icon: 'images', method: () => this.pickImage() },
            { value: '2', name: 'Take Photo', icon: 'camera', method: () => this.takePhoto() },
        ],
        UploadOpts: {},
    };
    pickImage() {
        ImagePicker.getPictures(this.opts.imagePicker).then((results) => {
            if (!results[0] || results[0].length < 15) return;
            //this.setSelectedPicker(results[0]);
            this.cropPicker(results[0]);
        }, (err) => {
            if (err == 'cordova_not_available')
                err = 'Function not supported in this browser!';
            Alert.showWarningMessage(err);
        });
    }
    takePhoto() {
        Camera.getPicture(this.opts.camera).then((imageData) => {
            //this.setSelectedPicker(imageData);
            this.cropPicker(imageData);
        }, (err) => {
            if (err == 'cordova_not_available')
                err = 'Function not supported in this browser!';
            Alert.showWarningMessage(err);
        });
    }

    cropPicker(imgBase64: string) {
        //https://enappd.com/blog/how-to-add-image-cropper-in-ionic-apps/149/
        Crop.crop(imgBase64, { quality: 100 }).then((res) => {
            this.showCroppedImage(res.split('?')[0]);
        }, (err) => {
            if (!err) return;
            if (err.code == 'userCancelled') return;
            Alert.showWarningMessage('Error in cropping image: ' + err.message);
        });
    }

    showCroppedImage(imagePath: any) {
        Base64.encodeFile(imagePath).then((base64File: string) => {
            this.setSelectedPicker(base64File.split(';base64,')[1]);
        }, (err) => {
            Alert.showWarningMessage('Error in showing image: ' + JSON.stringify(err));
        });
    }

    setSelectedPicker(imgBase64: string) {
        var item = this.opts.UploadOpts;
        item.img = ('data:image/jpeg;base64,' + (item.pickImg = imgBase64));
        item.hasPicked = true;
        this.prop.ImageData = item.img;
        this.setState({ prop: this.prop });
    }

    hPickImage = () => {
        //console.log(['upload img']);
        this.imagePickerOpts.open();
    }
    hViewImg = async () => {
        const img = this.prop.ImageData || this.input.ImageUrl;
        if (!img) return;
        const modal = await PhotoViewerPopUp.modal('Preview', img);
        await modal.present();
    }
    handleClickImagePicker() {
        this.imagePickerOpts.open();
    }
    hImageOption = (ev: any) => {
        var result = (ev.detail || {}).value;
        if (!result) return;
        setTimeout(() => result.method(), 275);
    }

    hConfirm = () => {
        if (!this.isValidEntries()) return;
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
        rest.post('validid/update', this.input).subscribe(async (res: any) => {
            if (res.Status == 'ok') {
                const item = Object.rcopy(res.Content, this.input);
                return Alert.showSuccessMessage(res.Message, () => this.pager.back({ item, component: ValidGovernmentIDView, IsUpdate: !!this.input.isEdit, }));
            }
            Alert.showErrorMessage(res.Message);
        }, (err: any) => {
            Alert.showWarningMessage('Please try again');
        });
    }

    private isValidEntries(): boolean {
        var isValid = true;

        if (!this.input.GovernmentID) {
            this.msg.GovernmentID = 'Please select a Government Issued ID'; //this.msg.Subject = 'Please fill up subject';
            isValid = false;
        }

        if (!this.input.GovValIDNo) {
            this.msg.GovValIDNo = 'Please fill up ID Number';
            isValid = false;
        }

        if (isValid) {
            if (!!this.prop.ImageData) {
                this.input.Img = this.opts.UploadOpts.pickImg;
                delete this.input.ImageUrl;
            }
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

    hGovernmentID = async () => {
        //if(!this.input.isAdd && this.input.STAT != "Open")return;
        

        const modal = await GovernmentIDPopUp.modal('Government Issued ID', { Type: 2, ID: this.input.Barangay });
        await modal.present();
        const input = this.input;
        const res = await modal.onDidDismiss();
        const data = (res || mtObj).data;
        if (!data) return;
        if (input.Sitio == data.SIT_ID) return;
        input.GovernmentID = data.GovernmentID;
        input.GovernmentID_NM = data.GovernmentID_NM;
        this.setState({ input: this.input });
    }


    elIonSelect: any = React.createRef();
    get imagePickerOpts() { return this.elIonSelect.current; }
    render() {
        const { input = {}, msg = {}, prop = {} } = this.state;
        input.Gender = (input.Gender || 'm');
        input.MaritalStatus = (input.MaritalStatus || 's');

        input.Nationality = (input.Nationality || 'PHL');
        return (<>
            <Layout full>
                <Layout>
                    <div className="row m-0 toolbar-panel">
                        <div className="vertical arrow-back" onClick={this.hBackButton}></div>
                        <div className="col-4 p-0 vertical toolbar-parent" onClick={this.hBackButton}></div>
                        <div className="col-7 p-0 vertical" style={styles('align-items: end;color: black;font: message-box;')}><div><TextFit text="Valid Government ID" /></div></div>
                    </div>
                </Layout>
                <Layout auto>
                    <FilteringView visible={prop.IsFiltering} />
                    <Layout full>
                        <Layout auto>

                            <div className="row m-0 bootstrap-form old">
                                <div className='col-12 p-0 form-container' style={styles('width: 100%;background-color: #1d2c65;')}>
                                    <form className={classNames('needs-validation', { 'form-invalid': !input.IsValid })} noValidate onSubmit={(ev) => ev.preventDefault()}>
                                        <div className={classNames({ 'input-invalid': !!msg.GovernmentID })} style={styles('position:relative')}
                                            onClick={this.hGovernmentID}>
                                            <IonItem className='input-error' style={styles('--highlight-background:unset;--min-height:40px;margin-top:2.5px')}>
                                                <IonLabel position="floating" style={styles('font-weight:bold;margin-top:-7.5px')}><span style={styles('color:red')}>*</span>Select Government ID</IonLabel>
                                                <Input ion="popup" node={(handle) => <>
                                                    <IonInput hidden></IonInput>
                                                    <IonSelect interface="action-sheet" cancelText="Dismiss" style={styles('height:40px')}
                                                        value={input.GovernmentID} onIonChange={(ev) => this.hState(ev, 'GovernmentID')} >
                                                        <IonSelectOption value={input.GovernmentID}>{input.GovernmentID_NM}</IonSelectOption>
                                                    </IonSelect>
                                                </>} />
                                            </IonItem>
                                            <div className="invalid-tooltip">{msg.GovernmentID}</div>
                                            <div style={styles('position:absolute;top:0;width:100%;height:100%;z-index:1')}>&nbsp;</div>
                                        </div>

                                        <div className={classNames({ 'input-invalid': !!msg.GovValIDNo })} style={styles('position:relative')}>
                                            <IonItem className='input-error' style={styles('--highlight-background:unset;--min-height:40px;margin-top:2.5px')}>
                                                <IonLabel position="floating" style={styles('font-weight:bold;margin-top:-7.5px')}><span style={styles('color:red')}>*</span>ID Number</IonLabel>
                                                <Input ion node={(handle) => <>
                                                    <IonInput className="font-bold br-0"
                                                        type="text"
                                                        value={input.GovValIDNo} {...handle({ onChange: (ev) => this.hState(ev, 'GovValIDNo') })} />
                                                </>} />
                                            </IonItem>
                                            <div className="invalid-tooltip">{msg.GovValIDNo}</div>
                                        </div>
                                        <div style={styles('color:#fdb67f;padding:10px 2.5px')} >
                                            <div>Attachment: </div>
                                            <div className="horizontal">
                                                <div style={styles('margin:5px 0px;position:relative;')}>

                                                    <div className="img.img-fit-stl" onClick={this.hViewImg}>
                                                        <ImgPreloader placeholder="./assets/img/icon_blank_profile.png"
                                                            src={(prop.ImageData || input.ImageUrl)}
                                                        />
                                                    </div>
                                                    <div style={styles('position:absolute;bottom:0px;right:0px;')}>
                                                        <IonButton style={styles('--padding-start:0px;--padding-end:0px;height:25px;width:30px;')}
                                                            onClick={this.hPickImage}>
                                                            <IonIcon icon={cameraOutline} />
                                                        </IonButton>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="horizontal" style={styles('margin-top:5px;height:auto')}>
                                            <button className="btn-green" style={styles('width:200px')} onClick={this.hConfirm}>Submit Query</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </Layout>
                    </Layout>
                </Layout>
            </Layout>
            <div style={styles('visibility:hidden;height:0px;width:0px')}>
                <IonSelect ref={this.elIonSelect} interface="action-sheet"
                    interfaceOptions={{ header: 'Select options:' }}
                    onIonChange={clearAfter(this.hImageOption)}>
                    {this.opts.ImagePickerOpts.map((opt: any, idx: any) =>
                        <IonSelectOption key={idx} value={opt}>{opt.name}</IonSelectOption>
                    )}
                </IonSelect>
            </div>
        </>);
    }
}

class GovernmentIDPopUp extends React.Component<{ modal: Function, Title: string, Opts: any }> implements OnDidBackdrop {
    private static cache: any = {};
    state: any = { inner: { height: (window.innerHeight + 'px') } }
    constructor(props: any) {
        super(props);
        app.component(this);
        Object.rcopy(this.filter, (this.props.Opts || mtObj));
        this.prop.IsDevice = !device.isBrowser;
        this.filter.CacheID = (this.filter.Type + '-' + (this.filter.ID || '0'));
        const cache = GovernmentIDPopUp.cache[this.filter.CacheID] || null;
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
        console.log('Perform Request Government Issued');
        console.log(this.filter);
        this.subs.s1 = rest.post('validid/list', Object.rcopy(filter, this.filter)).subscribe(async (res: any) => {
            this.prop.IsFiltering = false;
            if (res.Status != 'error') {
                if (filter.IsReset) this.list = res.govid.map((o: any) => this.listDetails(o));
                else res.govid.forEach((o: any) => this.list.push(this.listDetails(o)));
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
                                                        <div>{item.GovernmentID_NM}</div>
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
            <Modal className="modal-adjustment full" ref={(ref) => modal = ref} content={<GovernmentIDPopUp modal={() => modal} Title={title} Opts={opts} />} />
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

