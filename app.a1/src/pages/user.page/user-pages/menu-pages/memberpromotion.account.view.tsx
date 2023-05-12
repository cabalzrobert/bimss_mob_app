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
import { jUser, jUserModify } from '../../../+app/user-module';
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
import { mtCb, mtObj } from '../../../../tools/plugins/static';
import { toast } from '../../../../tools/plugins/toast';
import { Crop } from '@ionic-native/crop';
import { Base64 } from '@ionic-native/base64';
import UserPager from '../../user-pager';
import Recycler from '../../../../tools/components/+feature/recycler';
import RecyclerStorage from '../../../intro.page/recycler-storage';
import TextFit from '../../../../tools/components/+common/text-fit';

const { Object, data = {} } = (window as any);
const { locations } = data;
const { Group } = data;
const { leader } = data;

export default class MemberAccountPromotion extends React.Component {
    setType = (type: any) => (this.holder.setType(type), this);
    setForm = (input: any) => (this.holder.setForm(input), this);
    //
    shouldComponentUpdate = () => false;
    holder: ViewHolder = (null as any);
    render() {
        return (<>
            {/**/}
            {/* <ViewHolder ref={(ref: any) => this.holder = ref} /> */}
            <Recycler storage={RecyclerStorage.instance} from={ViewHolder} bind={(ref: any) => this.holder = ref} />
        </>);
    }
}

export class ViewHolder extends React.Component {
    //get pager(){ return UserPager.instance.pager; }
    //get swapper(){ return MainTabs.instance.swapper; }
    get pager() { return UserPager.instance.pager; }
    componentWillMount = () => this.willMount(false);
    state: any = {};
    //componentWillMount=()=>{
    //    var today = new Date();
    //    this.opts.dtConfig = { MinYear: '1970', MaxYear: today.getFullYear(), }
    //    this.state = { ...this.state, prop: this.prop, };
    //}
    willMount = (didMount = true) => {
        const { opts } = this;
        const { dtConfig } = opts;
        const today = new Date();
        opts.dtConfig = { MinYear: '1970', MaxYear: today.getFullYear(), }
        const prop: any = (this.prop = { didMount: didMount, IsFiltering: true, ImageData: './assets/img/icon_blank_profile.png' });
        const input: any = (this.input = { Country: '63', Island: '' });
        const msg = (this.msg = {});

        this.setState({ prop, input, msg, opts });
        if (!didMount) return;
        this.subs.u = jUserModify(async () => {
            const u = await jUser();
            Object.rcopy(input, {
                //SiteLeader: u.USR_ID,
                //SiteLeaderName: u.FLL_NM,
                GroupRef: u.REF_GRP_ID,
                LeaderType:u.LDR_TYP_NM,
            });
            prop.ImageData = (!input.ImageUrl ? prop.ImageData : null);
            var region = (locations.Region.find((f: any) => f.Code == input.Region) || mtObj);
            input.RegionName = region.Name;
            input.Island = (region.Island || '').replace(input.Country, '');
            var regioncode = `${input.Country}${input.Island}${input.Region}`;
            var provincecode = `${regioncode}${input.Province}`;
            var municipalitycode = `${provincecode}${input.Municipality}`;
            input.ProvinceName = (((locations.Province.find((f: any) => f.Region == regioncode) || mtObj).Province || []).find((f: any) => f.Code == input.Province) || mtObj).Name;
            input.MunicipalityName = (((locations.Municipality.find((f: any) => f.Province == provincecode) || mtObj).Municipality || []).find((f: any) => f.Code == input.Municipality) || mtObj).Name;
            input.BarangayName = (((locations.Barangay.find((f: any) => f.Municipality == municipalitycode) || mtObj).Barangay || []).find((f: any) => f.Code == input.Barangay) || mtObj).Name;
            

            this.setState({ u, input });
            console.log(input);
        });

        //this.setState({input});


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
    private performSelectSitio() {
        rest.post('sitio', { ID: this.input.Barangay }).subscribe(async (res: any) => {
            if (res.Status != 'error') {
                this.Sitiolist = res.sitio.map((o: any) => this.listDetails(o));
                this.setState(this.Sitiolist);
            }
        })
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
            //this.prop.ImageData = (input.ImageUrl || this.prop.ImageData);
            this.prop.ImageData = (!input.ImageUrl ? this.prop.ImageData : null);
            Object.rcopy(this.input, input);
            this.setState({ prop: this.prop, input: this.input });
        }, 750);
        this.sitio.upt = timeout(() => {
            this.performSelectSitio();
            this.setState(this.sitio);
        });
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
        console.log(this.input);
        rest.post('siteleader/member/promote', this.input).subscribe(async (res: any) => {
            if (res.Status == 'ok') {
                //this.performSaveLocal(Object.rcopy(res.Content, this.input));
                //this.performSaveLocal(Object.rcopy)
                // this.performSaveLocal();
                // return Alert.showSuccessMessage(res.Message); //, ()=>this.pager.back()
                const item = Object.rcopy(res.Content, this.input);
                console.log(item);
                return Alert.showSuccessMessage(res.Message,
                    () => this.pager.back({ item, component: MemberAccountPromotion, IsUpdate: !!this.prop.IsUpdate, }));
            }
            Alert.showErrorMessage(res.Message);
        }, (err: any) => {
            Alert.showWarningMessage('Please try again');
        });
    }
    hSelectLeaderType = async () => {
        console.log(leader.leadertype);
        const modal = await LeaderTypeSelectPopUp.modal('Leader', { Type: 'Leader' });
        await modal.present();
        const res = await modal.onDidDismiss();
        const data = (res || mtObj).data;
        if (!data) return;
        const input = this.input;
        if (input.Num == data.Num) return;
        input.Num = data.Num;
        input.Type = data.LeaderType;
        this.setState({ input: this.input });
    }
    private isValidateEntries(): boolean {
        var isValid = true;

        var firstname = (this.input.Firstname || '').trim();
        if (!firstname) {
            this.msg.Firstname = 'Please enter First Name';
            isValid = false;
        } else if (!isAlpha(firstname)) { //lastname
            this.msg.Firstname = 'First Name should contain only letters';
            isValid = false;
        }
        var leadertype = this.input.LeaderType;
        if (!leadertype) {
            this.msg.LeaderType = 'Leader Type is required';
            isValid = false;
        }
        if (leadertype == '2') {
            this.input.LDR_TYP_NM = 'Provincial Leader';
            this.input.Type = leadertype;
            this.input.SUBSCR_TYP = '2';
            this.input.LocationSite = this.input.Province;
        }
        else if (leadertype == '3') {
            this.input.LDR_TYP_NM = 'Municipal Leader';
            this.input.Type = leadertype;
            this.input.SUBSCR_TYP = '2';
            this.input.LocationSite = this.input.Municipality;
        }
        else if (leadertype == '4') {
            this.input.LDR_TYP_NM = 'Barangay Leader';
            this.input.Type = leadertype;
            this.input.SUBSCR_TYP = '2';
            this.input.LocationSite = this.input.Barangay;
        }
        else if (leadertype == '5') {
            this.input.LDR_TYP_NM = 'Sitio Leader';
            this.input.Type = leadertype;
            this.input.SUBSCR_TYP = '2';
            this.input.LocationSite = this.input.Sitio;
        }
        else if (leadertype == '6') {
            this.input.LDR_TYP_NM = 'Member';
            this.input.Type = leadertype;
            this.input.SUBSCR_TYP = '3';
            this.input.LocationSite = this.input.Sitio;
        }




        // var sitio = this.input.Sitio;
        // if (!sitio) {
        //     this.msg.Sitio = 'Please select sitio';
        //     isValid = false;
        // }

        if (isValid) {
            this.input.Fullname = (this.input.Lastname + ', ' + this.input.Firstname + ' ' + this.input.Middlename).trim();
            this.input.RoleName = (data.Role.find(((f: any) => (f.value == this.input.Role))) || mtObj).name;
            this.input.SiteLeader = '';
            this.input.SiteLeaderName = '';
            this.input.isLeader = true;
            if (!!this.prop.ImageData) {
                this.input.Img = this.opts.UploadOpts.pickImg;
                delete this.input.ImageUrl;
            }
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
        input.Gender = (input.Gender || 'm');
        //input.Role = (input.Role || '4');
        var grp = Group[0] || {};
        //input.AccountType = '5';
        input.Group = grp.GroupID;
        input.GroupRef = grp.REF_GRP_ID;
        input.MaritalStatus = (input.MaritalStatus || 's');


        input.PGRPID = grp.GroupID;
        input.PLID = grp.PLID;
        input.PSNCD = grp.PSNCD;
        input.Nationality = (input.Nationality || 'PHL');
        return (<>
            <Layout full>
                <Layout>
                    <div className="row m-0 toolbar-panel">
                        <div className="vertical arrow-back" onClick={this.hBackButton}></div>
                        <div className="col-4 p-0 vertical toolbar-parent" onClick={this.hBackButton}>Back</div>
                        <div className="col-7 p-0 toolbar-title vertical"><div><TextFit text="Member's Promote as Leader" /></div></div>
                    </div>
                </Layout>
                <Layout auto>
                    <FilteringView visible={prop.IsFiltering} />
                    <Layout full>
                        <Layout>
                            <div className="horizontal">
                                <div style={styles('margin:5px 0px;position:relative;')}>
                                    <div style={styles('height:100px;width:100px;border-radius:50%;overflow:hidden;display:flex;justify-content:center;')} onClick={this.hViewImg}>
                                        <ImgPreloader placeholder="./assets/img/icon_blank_profile.png"
                                            src={(prop.ImageData || input.ImageUrl)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </Layout>
                        <Layout auto>

                            <div className="row m-0 bootstrap-form old" style={styles('height:100%')}>
                                <div className="col-12 p-0 form-container">
                                    <form className={classNames('needs-validation', { 'form-invalid': !input.IsValid })}
                                        style={styles('height:100%')}
                                        noValidate onSubmit={(ev) => ev.preventDefault()}>

                                        <div style={styles('height:100%;width:100%')}>
                                            <SuperTabs>
                                                <SuperTabsToolbar style={styles('height:35px;background:rgba(0,0,0,0.75)')}>
                                                    <SuperTabButton style={styles('height:35px')}>
                                                        <IonIcon icon={personOutline} color='light'></IonIcon>
                                                    </SuperTabButton>
                                                </SuperTabsToolbar>
                                                <SuperTabsContainer style={styles('width: 100%;background-color: #1d2c65;')}>
                                                    <SuperTab noScroll style={styles('width:100%')}>

                                                        <div className={classNames({ 'input-invalid': !!msg.Group })} style={styles('position:relative')}>
                                                            <IonItem className='input-error' style={styles('--highlight-background:unset;--min-height:40px;margin-top:2.5px')}>
                                                                <IonLabel position="floating" style={styles('font-weight:bold;margin-top:-7.5px')}><span style={styles('color:red')}>*</span>Groups</IonLabel>
                                                                <Input ion="popup" node={(handle) => <>
                                                                    <IonInput hidden></IonInput>
                                                                    <IonSelect interface="action-sheet" cancelText="Dismiss" style={styles('height:40px')}
                                                                        value={input.Group}  {...handle({ onChange: (ev) => this.hState(ev, 'Group') })} disabled={true}> {/* [(ngModel)]="filter.Method" (ionChange)="handleChangedPayMethod()"*/}
                                                                        {data?.Group?.map((m: any, idx: any) => <>
                                                                            <IonSelectOption key={idx} value={m.GroupID}>{m.GroupName}</IonSelectOption>
                                                                        </>)}
                                                                    </IonSelect>
                                                                </>} />
                                                            </IonItem>
                                                            <div className="invalid-tooltip">{msg.Group}</div>
                                                        </div>
                                                        <div className={classNames({ 'input-invalid': !!msg.Firstname })} style={styles('position:relative')}>
                                                            <IonItem className='input-error' style={styles('--highlight-background:unset;--min-height:40px;margin-top:2.5px')}>
                                                                <IonLabel position="floating" style={styles('font-weight:bold;margin-top:-7.5px')}><span style={styles('color:red')}>*</span>First Name</IonLabel>
                                                                <Input ion node={(handle) => <>
                                                                    <IonInput className="font-bold br-0"
                                                                        type="text" readonly={true}
                                                                        value={input.Firstname} {...handle({ onChange: (ev) => this.hState(ev, 'Firstname') })} />
                                                                </>} />
                                                            </IonItem>
                                                            <div className="invalid-tooltip">{msg.Firstname}</div>
                                                        </div>
                                                        <div className={classNames({ 'input-invalid': !!msg.Middlename })} style={styles('position:relative')}>
                                                            <IonItem className='input-error' style={styles('--highlight-background:unset;--min-height:40px;margin-top:2.5px')}>
                                                                <IonLabel position="floating" style={styles('font-weight:bold;margin-top:-7.5px')}>Middle Name</IonLabel>
                                                                <Input ion node={(handle) => <>
                                                                    <IonInput className="font-bold br-0"
                                                                        type="text" readonly={true}
                                                                        value={input.Middlename} {...handle({ onChange: (ev) => this.hState(ev, 'Middlename') })} />
                                                                </>} />
                                                            </IonItem>
                                                            <div className="invalid-tooltip">{msg.Middlename}</div>
                                                        </div>

                                                        <div className={classNames({ 'input-invalid': !!msg.Lastname })} style={styles('position:relative')}>
                                                            <IonItem className='input-error' style={styles('--highlight-background:unset;--min-height:40px;margin-top:2.5px')}>
                                                                <IonLabel position="floating" style={styles('font-weight:bold;margin-top:-7.5px')}><span style={styles('color:red')}>*</span>Last Name</IonLabel>
                                                                <Input ion node={(handle) => <>
                                                                    <IonInput className="font-bold br-0"
                                                                        style={styles('--padding-bottom:0px;--padding-top:0px')}
                                                                        type="text" readonly={true}
                                                                        value={input.Lastname} {...handle({ onChange: (ev) => this.hState(ev, 'Lastname') })} />
                                                                </>} />
                                                            </IonItem>
                                                            <div className="invalid-tooltip">{msg.Lastname}</div>
                                                        </div>
                                                        <div className="row m-0">
                                                            <div className="col-6 p-0">
                                                                <div className={classNames({ 'input-invalid': !!msg.PrecentNumber })} style={styles('position:relative')}>
                                                                    <IonItem className='input-error' style={styles('--highlight-background:unset;--min-height:40px;margin-top:2.5px')}>
                                                                        <IonLabel position="floating" style={styles('font-weight:bold;margin-top:-7.5px')}>Precent Number</IonLabel>
                                                                        <Input ion node={(handle) => <>
                                                                            <IonInput className="font-bold br-0"
                                                                                type="text" readonly={true}
                                                                                value={input.PrecentNumber} {...handle({ onChange: (ev) => this.hState(ev, 'PrecentNumber') })} />
                                                                        </>} />
                                                                    </IonItem>
                                                                    <div className="invalid-tooltip">{msg.PrecentNumber}</div>
                                                                </div>
                                                            </div>
                                                            <div className="col-6 p-0">
                                                                <div className={classNames({ 'input-invalid': !!msg.ClusterNumber })} style={styles('position:relative')}>
                                                                    <IonItem className='input-error' style={styles('--highlight-background:unset;--min-height:40px;margin-top:2.5px')}>
                                                                        <IonLabel position="floating" style={styles('font-weight:bold;margin-top:-7.5px')}> Cluster Number</IonLabel>
                                                                        <Input ion node={(handle) => <>
                                                                            <IonInput className="font-bold br-0"
                                                                                type="text" readonly={true}
                                                                                value={input.ClusterNumber}  {...handle({ onChange: (ev) => this.hState(ev, 'ClusterNumber') })} />
                                                                        </>} />
                                                                    </IonItem>
                                                                    <div className="invalid-tooltip">{msg.ClusterNumber}</div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="row m-0">
                                                            <div className="col-4 p-0">
                                                                <div className={classNames({ 'input-invalid': !!msg.BirthDate })} style={styles('position:relative')}>
                                                                    <IonItem className='input-error' style={styles('--highlight-background:unset;--min-height:40px;margin-top:2.5px')}>
                                                                        <IonLabel position="floating" style={styles('font-weight:bold;margin-top:-7.5px')}><span style={styles('color:red')}>*</span>Birth Date</IonLabel>
                                                                        <IonInput hidden />
                                                                        <IonDatetime pickerFormat="MMMM DD YYYY" displayFormat="MMM DD, YYYY" style={styles('--padding-bottom:5px;height:40px')}
                                                                            min={this.opts.dtConfig.MinYear} max={this.opts.dtConfig.MaxYear}
                                                                            value={input.BirthDate} onIonChange={(ev) => this.hState(ev, 'BirthDate')} readonly={true} />
                                                                    </IonItem>
                                                                    <div className="invalid-tooltip">{msg.BirthDate}</div>
                                                                </div>
                                                            </div>
                                                            <div className="col-4 p-0">
                                                                <div className={classNames({ 'input-invalid': !!msg.Gender })} style={styles('position:relative')}>
                                                                    <IonItem className='input-error' style={styles('--highlight-background:unset;--min-height:40px;margin-top:2.5px')}>
                                                                        <IonLabel position="floating" style={styles('font-weight:bold;margin-top:-7.5px')}><span style={styles('color:red')}>*</span>Gender</IonLabel>
                                                                        <Input ion="popup" node={(handle) => <>
                                                                            <IonInput hidden></IonInput>
                                                                            <IonSelect interface="action-sheet" cancelText="Dismiss" style={styles('height:40px')}
                                                                                value={input.Gender} {...handle({ onChange: (ev) => this.hState(ev, 'Gender') })} disabled={true}> {/* [(ngModel)]="filter.Method" (ionChange)="handleChangedPayMethod()"*/}
                                                                                <IonSelectOption value='m'>Male</IonSelectOption>
                                                                                <IonSelectOption value='f'>Female</IonSelectOption>
                                                                            </IonSelect>
                                                                        </>} />
                                                                    </IonItem>
                                                                    <div className="invalid-tooltip">{msg.Gender}</div>
                                                                </div>
                                                            </div>
                                                            <div className="col-4 p-0">
                                                                <div className={classNames({ 'input-invalid': !!msg.BloodType })} style={styles('position:relative')}>
                                                                    <IonItem className='input-error' style={styles('--highlight-background:unset;--min-height:40px;margin-top:2.5px')}>
                                                                        <IonLabel position="floating" style={styles('font-weight:bold;margin-top:-7.5px')}>Blood Type</IonLabel>
                                                                        <Input ion="popup" node={(handle) => <>
                                                                            <IonInput hidden></IonInput>
                                                                            <IonSelect interface="action-sheet" cancelText="Dismiss" style={styles('height:40px')}
                                                                                value={input.BloodType} {...handle({ onChange: (ev) => this.hState(ev, 'BloodType') })} disabled={true} > {/* [(ngModel)]="filter.Method" (ionChange)="handleChangedPayMethod()"*/}
                                                                                <IonSelectOption value=''></IonSelectOption>
                                                                                <IonSelectOption value='A+'>A+</IonSelectOption>
                                                                                <IonSelectOption value='A-'>A-</IonSelectOption>
                                                                                <IonSelectOption value='B+'>B+</IonSelectOption>
                                                                                <IonSelectOption value='B-'>B-</IonSelectOption>
                                                                                <IonSelectOption value='AB+'>AB+</IonSelectOption>
                                                                                <IonSelectOption value='AB-'>AB-</IonSelectOption>
                                                                                <IonSelectOption value='O+'>O+</IonSelectOption>
                                                                                <IonSelectOption value='O-'>O-</IonSelectOption>
                                                                            </IonSelect>
                                                                        </>} />
                                                                    </IonItem>
                                                                    <div className="invalid-tooltip">{msg.BloodType}</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="row m-0">
                                                            <div className="col-4 p-0">
                                                                <div className={classNames({ 'input-invalid': !!msg.MaritalStatus })} style={styles('position:relative')}>
                                                                    <IonItem className='input-error' style={styles('--highlight-background:unset;--min-height:40px;margin-top:2.5px')}>
                                                                        <IonLabel position="floating" style={styles('font-weight:bold;margin-top:-7.5px')}><span style={styles('color:red')}>*</span>Marital Status</IonLabel>
                                                                        <Input ion="popup" node={(handle) => <>
                                                                            <IonInput hidden></IonInput>
                                                                            <IonSelect interface="action-sheet" cancelText="Dismiss" style={styles('height:40px')} disabled={true}
                                                                                value={input.MaritalStatus} {...handle({ onChange: (ev) => this.hState(ev, 'MaritalStatus') })}> {/* [(ngModel)]="filter.Method" (ionChange)="handleChangedPayMethod()"*/}
                                                                                <IonSelectOption value='s'>Single</IonSelectOption>
                                                                                <IonSelectOption value='m'>Married</IonSelectOption>
                                                                                <IonSelectOption value='w'>Widowed</IonSelectOption>

                                                                            </IonSelect>
                                                                        </>} />
                                                                    </IonItem>
                                                                    <div className="invalid-tooltip">{msg.MaritalStatus}</div>
                                                                </div>
                                                            </div>
                                                            <div className="col-4 p-0">
                                                                <div className={classNames({ 'input-invalid': !!msg.Nationality })} style={styles('position:relative')}>
                                                                    <IonItem className='input-error' style={styles('--highlight-background:unset;--min-height:40px;margin-top:2.5px')}>
                                                                        <IonLabel position="floating" style={styles('font-weight:bold;margin-top:-7.5px')}><span style={styles('color:red')}>*</span>Nationality</IonLabel>
                                                                        <Input ion="popup" node={(handle) => <>
                                                                            <IonInput hidden></IonInput>
                                                                            <IonSelect interface="action-sheet" cancelText="Dismiss" style={styles('height:40px')}
                                                                                value={input.Nationality} {...handle({ onChange: (ev) => this.hState(ev, 'Nationality') })} disabled={true}> {/* [(ngModel)]="filter.Method" (ionChange)="handleChangedPayMethod()"*/}
                                                                                {data?.Nationality?.map((m: any, idx: any) => <>
                                                                                    <IonSelectOption key={idx} value={m.Code}>{m.Name}</IonSelectOption>
                                                                                </>)}
                                                                            </IonSelect>
                                                                        </>} />
                                                                    </IonItem>
                                                                    <div className="invalid-tooltip">{msg.Nationality}</div>
                                                                </div>
                                                            </div>
                                                            <div className="col-4 p-0">
                                                                <div className={classNames({ 'input-invalid': !!msg.Citizenship })} style={styles('position:relative')}>
                                                                    <IonItem className='input-error' style={styles('--highlight-background:unset;--min-height:40px;margin-top:2.5px')}>
                                                                        <IonLabel position="floating" style={styles('font-weight:bold;margin-top:-7.5px')}><span style={styles('color:red')}>*</span>Citizenship</IonLabel>
                                                                        <Input ion node={(handle) => <>
                                                                            <IonInput className="font-bold br-0"
                                                                                type="text" readonly={true}
                                                                                value={input.Citizenship} {...handle({ onChange: (ev) => this.hState(ev, 'Citizenship') })} />
                                                                        </>} />
                                                                    </IonItem>
                                                                    <div className="invalid-tooltip">{msg.Citizenship}</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="row m-0">
                                                            <div className="col-6 p-0">
                                                                <div className={classNames({ 'input-invalid': !!msg.MobileNumber })} style={styles('position:relative')}>
                                                                    <IonItem className='input-error' style={styles('--highlight-background:unset;--min-height:40px;margin-top:2.5px')}>
                                                                        <IonLabel position="floating" style={styles('font-weight:bold;margin-top:-7.5px')}><span style={styles('color:red')}>*</span>Mobile Number</IonLabel>
                                                                        <Input ion node={(handle) => <>
                                                                            <IonInput className="font-bold br-0"
                                                                                type="tel" readonly={true}
                                                                                value={input.MobileNumber} {...handle({ onChange: (ev) => this.hState(ev, 'MobileNumber') })} />
                                                                        </>} />
                                                                    </IonItem>
                                                                    <div className="invalid-tooltip">{msg.MobileNumber}</div>
                                                                </div>
                                                            </div>
                                                            <div className="col-6 p-0">
                                                                <div className={classNames({ 'input-invalid': !!msg.EmailAddress })} style={styles('position:relative')}>
                                                                    <IonItem className='input-error' style={styles('--highlight-background:unset;--min-height:40px;margin-top:2.5px')}>
                                                                        <IonLabel position="floating" style={styles('font-weight:bold;margin-top:-7.5px')}>Email Address <span style={styles('font-size:85%')}>(Optional)</span></IonLabel>
                                                                        <Input ion node={(handle) => <>
                                                                            <IonInput className="font-bold br-0"
                                                                                type="text" readonly={true}
                                                                                value={input.EmailAddress} {...handle({ onChange: (ev) => this.hState(ev, 'EmailAddress') })} />
                                                                        </>} />
                                                                    </IonItem>
                                                                    <div className="invalid-tooltip">{msg.EmailAddress}</div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className={classNames({ 'input-invalid': !!msg.LeaderType })} style={styles('position:relative')}>
                                                            <IonItem className='input-error' style={styles('--highlight-background:unset;--min-height:40px;margin-top:2.5px')}>
                                                                <IonLabel position="floating" style={styles('font-weight:bold;margin-top:-7.5px')}>Leader Type</IonLabel>
                                                                <Input ion="popup" node={(handle) => <>
                                                                    <IonInput hidden></IonInput>
                                                                    <IonSelect interface="action-sheet" cancelText="Dismiss" style={styles('height:40px')}
                                                                        value={input.LeaderType}  {...handle({ onChange: (ev) => this.hState(ev, 'LeaderType') })}> {/* [(ngModel)]="filter.Method" (ionChange)="handleChangedPayMethod()"*/}
                                                                        <IonSelectOption value=''>Select Leader Type</IonSelectOption>
                                                                        <IonSelectOption value='2'>Provincial</IonSelectOption>
                                                                        <IonSelectOption value='3'>Municipal</IonSelectOption>
                                                                        <IonSelectOption value='4'>Barangay</IonSelectOption>
                                                                        <IonSelectOption value='5'>Sitio</IonSelectOption>
                                                                        {/* <IonSelectOption value='6'>Member</IonSelectOption> */}
                                                                    </IonSelect>
                                                                </>} />
                                                            </IonItem>
                                                            <div className="invalid-tooltip">{msg.LeaderType}</div>
                                                        </div>
                                                        <br />
                                                    </SuperTab>
                                                </SuperTabsContainer>
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
                                    {prop.IsUpdate ? 'Save Changes' : 'Save Member'}
                                </IonButton>
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
class LeaderTypeSelectPopUp extends React.Component<{ modal: Function, Title: string, Opts: any }> implements OnDidBackdrop {
    private static cache: any = {};
    state: any = { inner: { height: (window.innerHeight + 'px') } }
    constructor(props: any) {
        super(props);
        app.component(this);
        Object.rcopy(this.filter, (this.props.Opts || mtObj));
        this.prop.IsDevice = !device.isBrowser;
        this.filter.CacheID = (this.filter.Type + '-' + (this.filter.ID || '0'));
        const cache = LeaderTypeSelectPopUp.cache[this.filter.CacheID] || null;
        if (!!cache) {
            this.list = cache.List;
            this.prop.IsEmpty = (this.list.length < 1);
            this.prop.IsFiltering = this.prop.IsEmpty;
            if (!this.prop.IsEmpty) Object.rcopy(this.filter, cache.Filter);
        }
        //this.locations = [...this.props.Locations];
        this.locations.sort((a: any, b: any) => (a.Code + 0) < (b.Code + 0) ? -1 : 1);
        this.state = { ...this.state, prop: this.prop, filter: this.filter, list: this.list };
    }
    dismiss = (data: any = null) => this.props.modal().dismiss(data);
    hClose = () => this.dismiss();

    subs: any = {};
    filter: any = { Search: '' };
    prop: any = { IsFiltering: true };
    list: any = [];
    locations: any = [];
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
        Object.rcopy(filter, this.filter);
        this.subs.s1 = timeout(() => {
            this.prop.IsFiltering = false;
            //var found = (locations[this.filter.Type]||{}).find((f:any)=>f[this.filter.Base])
            this.list = this.locations.filter((f: any) => (f.Name || '').indexOf(filter.Search || '') > -1);
            this.list.sort((a: any, b: any) => (a.Code + 0) < (b.Code + 0) ? -1 : 1);
            LeaderTypeSelectPopUp.cache[this.filter.CacheID] = { Filter: this.filter, List: this.list, };
            this.prop.IsEmpty = (this.list.length < 1);
            if (callback != null) callback();
            this.setState({ filter: this.filter, prop: this.prop, list: this.list });
        }, 250);
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
                            placeholder="Search Location" debounce={0} />{/*onIonChange={e => setSearchText(e.detail.value!)} */}
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
                                                    style={styles('padding:5px;height:50px;', { 'border-top': (idx == 0 ? null : '1px solid rgba(128,128,128,0.75)') })}>
                                                    <IonRippleEffect />
                                                    <div className="col-12 p-0 vertical">
                                                        <div>{item.Name}</div>
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
            <Modal className="modal-adjustment full" ref={(ref) => modal = ref} content={<LeaderTypeSelectPopUp modal={() => modal} Title={title} Opts={opts} />} />
        </>);
        setTimeout(async () => (await modal.onDidDismiss(), stack.pop()));
        return modal;
    }
}




