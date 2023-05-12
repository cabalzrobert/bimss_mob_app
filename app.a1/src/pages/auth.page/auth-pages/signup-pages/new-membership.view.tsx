import { KeyboardInfo } from '@capacitor/core';
import { Camera } from '@ionic-native/camera';
import { ImagePicker } from '@ionic-native/image-picker';
import { SuperTab, SuperTabButton, SuperTabs, SuperTabsContainer, SuperTabsToolbar } from '@ionic-super-tabs/react';
import { IonAlert, IonButton, IonButtons, IonCheckbox, IonCol, IonContent, IonDatetime, IonGrid, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonList, IonMenuButton, IonModal, IonRefresher, IonRefresherContent, IonRippleEffect, IonRow, IonSearchbar, IonSelect, IonSelectOption, IonSpinner, IonTextarea, IonTitle, IonToolbar } from '@ionic/react';
import { arrowBackOutline, arrowBackSharp, arrowForwardOutline, call, cameraOutline, cardOutline, caretDownOutline, colorFill, idCard, personOutline, saveOutline } from 'ionicons/icons';
import moment from 'moment';
import React from 'react';
import { rest } from '../../../+app/+service/rest.service';
import FilteringView from '../../../+app/component/common/filtering.view';
import NotFound2View from '../../../+app/component/common/not-found.view';
import { jUser, jCompany, jUserModify } from '../../../+app/user-module';
import { app, OnDidBackdrop } from '../../../../tools/app';
import ImgPreloader from '../../../../tools/components/+common/img-preloader';
import Layout from '../../../../tools/components/+common/layout';
import PhotoViewerPopUp from '../../../../tools/components/+common/modal/photo-viewer.popup';
import Stack, { Alert, Modal } from '../../../../tools/components/+common/stack';
import { isAlpha, isAlphaNumeric, isEmail } from '../../../../tools/global';
import { timeout } from '../../../../tools/plugins/delay';
import { device } from '../../../../tools/plugins/device';
import { classNames, clearAfter, Input, styles } from '../../../../tools/plugins/element';
import { keyboard } from '../../../../tools/plugins/keyboard';
import { mtCb, mtObj } from '../../../../tools/plugins/static';
import { toast } from '../../../../tools/plugins/toast';
import { Crop } from '@ionic-native/crop';
import { Base64 } from '@ionic-native/base64';
import AuthPager from '../../auth-pager';
import SignInView from '../sign-in.view';
import { group } from 'console';
import TextFit from '../../../../tools/components/+common/text-fit';
import { storage } from '../../../../tools/plugins/storage';
import { Sitio_List } from '../../../+app/main-module';
import { OverlayEventDetail } from '@ionic/core/components';

const { Object, data = {} } = (window as any);
const { locations } = data;
const { Group } = data;

export default class MembershipRegistrationForm extends React.Component {
    setType = (type: any) => (this.holder.setForm(type), this);
    setForm = (input: any) => (this.holder.setForm(input), this);
    //
    shouldComponentUpdate = () => false;
    holder: ViewHolder = (null as any);
    render() {
        return (<>
            <ViewHolder ref={(ref: any) => this.holder = ref} />
        </>);
    }
}

class ViewHolder extends React.Component {
    //get pager(){ return UserPager.instance.pager; }
    //get swapper(){ return MainTabs.instance.swapper; }
    get pager() { return AuthPager.instance.pager; }
    get cont3xt() { return AuthPager.instance.context; }
    componentWillMount = () => this.willMount(false);
    state: any = {};
    sitioList: any = [];
    LeaderList: any = [];
    filter: any = {};
    constructor(props: any) {
        super(props);
        var today = new Date();
        this.opts.dtConfig = { MinYear: '1910', MaxYear: today.getFullYear(), }
        this.state = { ...this.state, prop: this.prop, };
    }
    willMount = (didMount = true) => {
        const prop = (this.prop = { didMount: didMount, IsFiltering: true });
        const sitiolist = (this.sitioList = []);
        const LeaderList = (this.LeaderList = []);
        const filter = (this.filter = {});
        this.setState({ sitiolist, LeaderList, prop, filter });
    }

    componentDidMount() {
        this.prop.IsFiltering = false;
        this.setState({ prop: this.prop });
    }
    componentWillUnmount() {
        Object.values(this.subs).map((m: any) => m.unsubscribe());
    }
    hBackButton = () => {
        //this.pager.back();
        //this.swapper.show(UserPager);
        this.pager.back(SignInView);
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

    subs: any = {};
    msg: any = {};
    input: any = { Country: '63', Island: '', };
    prop: any = { IsFiltering: true, ImageData: './assets/img/icon_blank_profile.png' };
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
        //rest.post('customer/' + (this.prop.IsUpdate ? 'edit' : 'new'), this.input).subscribe(async (res: any) => {
        rest.post('membership/new', this.input).subscribe(async (res: any) => {
            if (res.Status == 'ok') {
                //this.performSaveLocal();
                const item = Object.rcopy(res.Content, this.input);
                // return Alert.showSuccessMessage(res.Message,
                //     ()=>this.pager.back({ item, component:MembershipRegistrationForm,IsUpdate:!!this.prop.IsUpdate, }));
                // this.performSaveLocal(res.Company, res.Account, res.Auth);
                // return Alert.showSuccessMessage('Successfully Save!', () => this.goToHomePage());
                // return Alert.showSuccessMessage(res.Message,
                //     () => this.pager.back({ item, component: SignInView, IsUpdate: !!this.prop.IsUpdate, }));

                //return Alert.showSuccessMessage(res.Message, () => this.pager.back());
                return Alert.showSuccessMessage(res.Message, () => this.pager.backTo(SignInView, true));
            }
            Alert.showErrorMessage(res.Message);
        }, (err: any) => {
            Alert.showWarningMessage('Please try again');
        });
    }

    private performSaveLocal(company: any, account: any, auth: any) {
        jCompany(company);
        jUser(Object.rcopy(account, { Terminal: !!this.input.Terminal }));
        rest.setBearer(auth.Token);
        storage.Auth = auth;
        storage.Username = this.input.Username;
        storage.IsSignIn = true;
    }

    private goToHomePage() {
        return this.cont3xt?.navigate('/in', 'forward', 'pop');
    }

    private isValidateEntries(): boolean {
        var isValid = true;
        
        var username = (this.input.Username || '');
        if (!username) {
            this.msg.Username = 'Please enter Username';
            isValid = false;
        } else if (!isAlphaNumeric(username)) { //lastname
            this.msg.Username = 'Username must be alphanumerics';
            isValid = false;
        }else if(username.length < 8)
        {
            this.msg.Username = 'Username must have atleast 8 characters length';
            isValid = false;
        }
        var firstname = (this.input.Firstname || '').trim();
        if (!firstname) {
            this.msg.Firstname = 'Please enter First Name';
            isValid = false;
        } else if (!isAlpha(firstname)) { //lastname
            this.msg.Firstname = 'First Name should contain only letters';
            isValid = false;
        }
        var lastname = (this.input.Lastname || '').trim();
        if (!lastname) {
            this.msg.Lastname = 'Please enter Last Name';
            isValid = false;
        } else if (!isAlpha(lastname)) { //lastname
            this.msg.Lastname = 'Last Name should contain only letters';
            isValid = false;
        }
        var birthDate = (this.input.BirthDate || '').trim();
        if (!!birthDate) {
            birthDate = moment(birthDate).format('MMM DD, YYYY');
        } 
        // else {
        //     this.msg.BirthDate = 'Please enter birthdate';
        //     isValid = false;
        // }

        this.input.BirthDate = birthDate;
        if (!!this.input.EmailAddress) {
            if (!isEmail(this.input.EmailAddress)) {
                this.msg.EmailAddress = 'Please enter valid Email Address';
                isValid = false;
            }
        }

        var number = (this.input.MobileNumber || '');
        var isPlus63 = number.startsWith('+63');
        if (number.startsWith('9')) number = ('0' + number);
        if (!number) {
            this.msg.MobileNumber = 'Please enter mobile number';
            isValid = false;
        } else if (number.length < (10 + (isPlus63 ? 3 : 1))) {
            this.msg.MobileNumber = 'Please enter a valid mobile number';
            isValid = false;
        }

        var citizenship = this.input.Citizenship;
        if (!citizenship) {
            this.msg.Citizenship = 'Please enter citizenship';
            isValid = false;
        }
        var homeaddress = this.input.HomeAddress;
        if (!homeaddress) {
            this.msg.HomeAddress = 'Please enter Home Address';
            isValid = false;
        }

        var issameaddress = this.input?.IsSameAddress ?? true;
        var address = !issameaddress ? this.input.PresentAddress : this.input.HomeAddress;
        this.input.PresentAddress = address;
        if (!address) {
            this.msg.PresentAddress = 'Please enter your present address';
            isValid = false;
        }

        var type = this.input.Type;

        var group = this.input.Group;
        if (!group) {
            this.msg.Group = 'Please select user group';
            isValid = false;
        }

        var region = this.input.Region;
        if (!region) {
            this.msg.Region = 'Please select region';
            isValid = false;
        }
        var province = this.input.Province;
        if (!province) {
            this.msg.Province = 'Please select province';
            isValid = false;
        }
        var municipality = this.input.Municipality;
        if (!municipality) {
            this.msg.Municipality = 'Please select municipality';
            isValid = false;
        }
        var barangay = this.input.Barangay;
        if (!barangay) {
            this.msg.Barangay = 'Please select barangay';
            isValid = false;
        }
        var sitio = this.input.Sitio
        if(!sitio){
            this.msg.Sitio = 'Please select sitio';
            isValid = false;
        }

        var maritalStatus  = this.input.MaritalStatus;
        var spouse = this.input.Spouse;
        if(maritalStatus === 'm' && !spouse)
        {
            this.msg.Spouse = 'Please enter Spouse Name';
            isValid = false;
        }

        var siteLeader = this.input.SiteLeaderName;
        if (!barangay) {
            this.msg.SiteLeader = 'Please select Site Leader';
            isValid = false;
        }

        if (isValid) {
            this.input.Fullname = (this.input.Lastname + ', ' + this.input.Firstname + ' ' + this.input.Middlename).trim();
            this.input.RoleName = (data.Role.find(((f: any) => (f.value == this.input.Role))) || mtObj).name;
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
    //
    hSelectRegion = async () => {
        if(!this.input.Country)
            return toast('Please select country first');
        const modal = await LocationSelectPopUp.modal('Region', locations.Region, { Type: 'Region' });
        await modal.present();
        const res = await modal.onDidDismiss();
        const data = (res || mtObj).data;
        if (!data) return;
        const input = this.input;
        if (input.Region == data.Code) return;
        input.Island = data.Island;
        input.Region = data.Code;
        input.RegionName = data.Name;
        input.Province = '';
        input.ProvinceName = '';
        input.Municipality = '';
        input.MunicipalityName = '';
        input.Barangay = '';
        input.BarangayName = '';
        input.Sitio = '';
        input.SitioName = '';
        this.setState({ input: this.input });
    }

    hSelectProvince = async () => {
        if (!this.input.Region)
            return toast('Please select region first');
        const input = this.input;
        const ID = `${input.Island}${input.Region}`;
        const Region = locations.Province.find((f: any) => f.Region == ID);
        const modal = await LocationSelectPopUp.modal('Province', ((Region || {}).Province || []), { Type: 'Province', ID: ID });
        await modal.present();
        const res = await modal.onDidDismiss();
        const data = (res || mtObj).data;
        if (!data) return;
        if (input.Province == data.Code) return;
        input.Province = data.Code;
        input.ProvinceName = data.Name;
        input.Municipality = '';
        input.MunicipalityName = '';
        input.Barangay = '';
        input.BarangayName = '';
        input.Sitio = '';
        input.SitioName = '';
        this.setState({ input: this.input });
    }
    hSelectMunicipality = async () => {
        if (!this.input.Province)
            return toast('Please select province first');
        const input = this.input;
        const ID = `${input.Island}${input.Region}${input.Province}`;
        const Province = locations.Municipality.find((f: any) => f.Province == ID);
        const modal = await LocationSelectPopUp.modal('Municipality', ((Province || {}).Municipality || []), { Type: 'Municipality', ID: ID });
        await modal.present();
        const res = await modal.onDidDismiss();
        const data = (res || mtObj).data;
        if (!data) return;
        if (input.Municipality == data.Code) return;
        input.Municipality = data.Code;
        input.MunicipalityName = data.Name;
        input.Barangay = '';
        input.BarangayName = '';
        input.Sitio = '';
        input.SitioName = '';
        this.setState({ input: this.input });
    }
    hSelectBarangay = async () => {
        if (!this.input.Municipality)
            return toast('Please select municipality first');
        const input = this.input;
        const ID = `${input.Island}${input.Region}${input.Province}${input.Municipality}`;
        const Municipality = locations.Barangay.find((f: any) => f.Municipality == ID);
        const modal = await BarangaySelectPopUp.modal('Barangay', { Type: 'Barangay', ID: ID });
        await modal.present();
        const res = await modal.onDidDismiss();
        const data = (res || mtObj).data;
        if (!data) return;
        if (input.Barangay == data.Code) return;
        input.Barangay = data.Code;
        input.BarangayName = data.Name;
        input.Sitio = '';
        input.SitioName = '';
        this.setState({ input: this.input });
    }
    hSelectSitio = async () => {
        if (!this.input.Barangay)
            return toast('Please select Barangay first');

        const modal = await SitioSelectPopUp.modal('Sitio', { Type: 2, ID: this.input.Barangay });
        await modal.present();
        const input = this.input;
        const res = await modal.onDidDismiss();
        const data = (res || mtObj).data;
        if (!data) return;
        if (input.Sitio == data.SIT_ID) return;
        input.Sitio = data.SIT_ID;
        input.SitioName = data.SIT_NM;
        this.setState({ input: this.input });
    }
    hSelectSiteLeader = async () => {
        // if (!this.input.Group)
        //     return toast('Please select Group firts');
        var grp = Group[0] || {};

        const modal = await SiteLeaderSelectPopUp.modal('Leader', { Type: 2, PGRP_ID: grp.GroupID, PL_ID: grp.PLID, USR_ID: grp.REF_GRP_ID });
        await modal.present();
        const input = this.input;
        const res = await modal.onDidDismiss();
        const data = (res || mtObj).data;
        if (!data) return;
        if (input.SiteLeader == data.SUBSCR_ID) return;
        input.SiteLeader = data.SUBSCR_ID;
        input.SiteLeaderName = data.FLL_NM;
        this.setState({ input: this.input });
    }

    hInputCollegeBackground = async (dataCollege: any) => {
        const modal = await EducationalBackgroundPopUp.modal('School', dataCollege? {Name: dataCollege!.SchoolName,Address: dataCollege!.SchoolAddress,Course: dataCollege!.SchoolCourse ,Year: dataCollege!.SchoolYear} : dataCollege);
        await modal.present();
        const input = this.input;
        const res = await modal.onDidDismiss();
        const data = (res || mtObj).data;
        if (!data) return;
        input.College = {};
        input.College.SchoolName = data.Name;
        input.College.SchoolAddress = data.Address;
        input.College.SchoolCourse = data.Course;
        input.College.SchoolYear = data.Year;
        this.setState({ input: this.input });
    }

    hInputSHSBackground = async () => {
        
        // const modal = await EducationalBackgroundPopUp.modal('School');
        // await modal.present();
        // const input = this.input;
        // const res = await modal.onDidDismiss();
        // const data = (res || mtObj).data;
        // if (!data) return;
        // input.SHS = {};
        // input.SHS.SchoolName = data.Name;
        // input.SHS.SchoolAddress = data.Address;
        // input.SHS.SchoolCourse = data.Course;
        // input.SHS.SchoolYear = data.Year;
        this.setState({ input: this.input });
    }

    hInputElemBackground = async () => {
        // const modal = await EducationalBackgroundPopUp.modal('School');
        // await modal.present();
        // const input = this.input;
        // const res = await modal.onDidDismiss();
        // const data = (res || mtObj).data;
        // if (!data) return;
        // input.Elem = {};
        // input.Elem.SchoolName = data.Name;
        // input.Elem.SchoolAddress = data.Address;
        // input.Elem.SchoolCourse = data.Course;
        // input.Elem.SchoolYear = data.Year;
        this.setState({ input: this.input });
    }

    hInputOthersBackground = async () => {
        // const modal = await EducationalBackgroundPopUp.modal('School');
        // await modal.present();
        // const input = this.input;
        // const res = await modal.onDidDismiss();
        // const data = (res || mtObj).data;
        // if (!data) return;
        // input.Others = {};
        // input.Others.SchoolName = data.Name;
        // input.Others.SchoolAddress = data.Address;
        // input.Others.SchoolCourse = data.Course;
        // input.Others.SchoolYear = data.Year;
        this.setState({ input: this.input });
    }

    hInputFathersName = async (name: any) => {
        const modal = await FullNamePopUp.modal('Father\'s Name', name? {Firstname: name!.FirstName,Middlename: name!.MiddleName,Lastname: name!.LastName} : name);
        await modal.present();
        const input = this.input;
        const res = await modal.onDidDismiss();
        const data = (res || mtObj).data;
        if (!data) return;
        input.Father = {};
        input.Father.FirstName = data.Firstname;
        input.Father.MiddleName = data.Middlename;
        input.Father.LastName = data.Lastname;
        input.Father.FullName = data.Lastname+', '+data.Firstname+' '+data.Middlename;
        this.setState({ input: this.input });
    }

    hInputMothersName =async (name: any) => {
        const modal = await FullNamePopUp.modal('Mother\'s Name', name? {Firstname: name!.FirstName,Middlename: name!.MiddleName,Lastname: name!.LastName} : name);
        await modal.present();
        const input = this.input;
        const res = await modal.onDidDismiss();
        const data = (res || mtObj).data;
        if (!data) return;
        input.Mother = {};
        input.Mother.FirstName = data.Firstname;
        input.Mother.MiddleName = data.Middlename;
        input.Mother.LastName = data.Lastname;
        input.Mother.FullName = data.Lastname+', '+data.Firstname+' '+data.Middlename;
        this.setState({ input: this.input });
    }

    hInputSpouseName =async (name: any) => {
        const modal = await FullNamePopUp.modal('Spouse Name', name? {Firstname: name!.FirstName,Middlename: name!.MiddleName,Lastname: name!.LastName} : name);
        await modal.present();
        const input = this.input;
        const res = await modal.onDidDismiss();
        const data = (res || mtObj).data;
        if (!data) return;
        input.Spouse = {};
        input.Spouse.FirstName = data.Firstname;
        input.Spouse.MiddleName = data.Middlename;
        input.Spouse.LastName = data.Lastname;
        input.Spouse.FullName = data.Lastname+', '+data.Firstname+' '+data.Middlename;
        this.setState({ input: this.input });
    }

    private performSitioRequest(filter: any, callback: Function = mtCb) {
        if (!this.subs) return;
        if (this.subs.s1) this.subs.s1.unsubscribe();
        this.subs.s1 = rest.post('sitio', Object.rcopy(filter, this.filter)).subscribe(async (res: any) => {
            this.prop.IsFiltering = false;
            if (res.Status != 'error') {
                if (filter.IsReset) this.sitioList = res.map((o: any) => Sitio_List(o));
                else res.forEach((o: any) => this.sitioList.push(Sitio_List(o)));
                this.prop.IsEmpty = (this.sitioList.length < 1);
                if (callback != null) callback();
                this.setState({ filter: this.filter, prop: this.prop, list: this.sitioList });
                return;
            }
        }, (err: any) => {
            toast('Failed to retrieve data, Please try again');
            this.prop.IsFiltering = false;
            this.prop.IsEmpty = (this.sitioList.length < 1);
            if (callback != null) callback(err);
            this.setState({ prop: this.prop });
        });
    }

    checkSameAddress = async (checked:boolean) => {
        const input = this.input;
        input.IsSameAddress = checked;
        this.setState({input: this.input});
    }

    checkParentLivesInBarangay = async (checked:boolean) => {
        const input = this.input;
        input.IsParentLiveInBarangay = checked;
        this.setState({input: this.input});
        return checked;
    }

    checkLivingWithParents = async (checked:boolean) => {
        const input = this.input;
        input.IsLivingWithParents = checked;
        this.setState({input: this.input});
    }
    checkSeniorCitizen = async (checked:boolean) => {
        const input = this.input;
        input.IsSeniorCitizen = checked;
        this.setState({input: this.input});
    }
    checkSingleParent = async (checked:boolean) => {
        const input = this.input;
        input.IsSingleParent = checked;
        this.setState({input: this.input});
    }
    checkIndigent = async (checked:boolean) => {
        const input = this.input;
        input.IsIndigent = checked;
        this.setState({input: this.input});
    }
    checkPersonWithDisability = async (checked:boolean) => {
        const input = this.input;
        input.IsPWD = checked;
        this.setState({input: this.input});
    }
    checkRegisteredVoter = async (checked:boolean) => {
        const input = this.input;
        input.IsRegisteredVoter = checked;
        this.setState({input: this.input});
    }

    supposedNextPage = async (page:number) => {
        const supposedPages = ['p1','p2'];
        const index = page+1;
        const input = this.input;
        input.NextPage = supposedPages[index];
        input.PageIndex = index;
        this.setState({input: this.input});
    }
    supposedPrevPage = async (page:number) => {
        const supposedPages = ['p1','p2'];
        const index = page-1;
        const input = this.input;
        input.NextPage = supposedPages[index];
        input.PageIndex = index;
        this.setState({input: this.input});
    }

    // onModalOpen = async (isOpen:boolean) => {
    //     const input = this.input;
    //     input.isModalOpen = isOpen;
    //     this.setState({input: this.input});
    // }

    elIonSelect: any = React.createRef();
    get imagePickerOpts() { return this.elIonSelect.current; }
    render() {
        const { input = {}, msg = {}, prop = {} } = this.state;
        input.Gender = (input.Gender || 'm');
        //input.Role = (input.Role || '4');
        var grp = Group[0] || {};
        input.AccountType = '5';
        input.Group = grp.GroupID;
        input.GroupRef = grp.REF_GRP_ID;
        input.MaritalStatus = (input.MaritalStatus || 's');
        input.PageIndex = input?.PageIndex ?? 0;
        input.NextPage = input!.PageIndex ? 'p2' : 'p1';
        input.IsSameAddress = input?.IsSameAddress ?? true;
        input.PGRP_ID = grp.GroupID;
        input.PL_ID = grp.PLID;
        input.PSNCD = grp.PSNCD;
        input.Nationality = (input.Nationality || 'PHL');
        input.Country = {Code: 'PHL',Name: 'Philippines'};
        return (<>
            <Layout full>
                <Layout>
                    {/* <IonHeader> */}
                    {/* <IonToolbar color='blue' style={styles('background:rgba(0,0,0,0.75);color:white')}> */}
                    {/* <IonButtons slot="start"><IonButton onClick={this.hBackButton}><IonIcon icon={arrowBackSharp} /></IonButton></IonButtons> */}
                    {/*<IonMenuButton hidden={false}></IonMenuButton>*/}
                    {/*<IonTitle>{prop.IsUpdate?'Update Form':'Registration'} - {this.getType(input.Type)}</IonTitle>*/}
                    {/* <IonTitle>{prop.IsUpdate ? 'Update Form' : 'Membership Form'}</IonTitle> */}
                    {/* </IonToolbar> */}
                    {/* </IonHeader> */}

                    {/* <div className="row m-0 toolbar-panel">
                        <div className="vertical arrow-back" onClick={this.hBackButton}></div>
                        <div className="col-4 p-0 vertical toolbar-parent" onClick={this.hBackButton}>Back</div>
                        <div className="col-7 p-0 toolbar-title vertical"><div><TextFit text="Membership Form" /></div></div>
                    </div> */}
                    <IonHeader>
                        <div style={styles('height:70px;')}>
                            <div style={styles('position:relative;top:11px;')}>
                            <IonItem lines="none" style={styles('--background:transparent;')}
                                onClick={this.hBackButton}>
                                <IonIcon size="large" icon={arrowBackOutline} style={styles('color:rgb(0,4,69);')}/>
                                <IonTitle style={styles('font-weight:bold;color:rgb(0,4,69);font-size:20pt;')}>
                                Registration
                                </IonTitle>
                            </IonItem>
                            </div>
                        </div>
                    </IonHeader>
                </Layout>
                <Layout auto>
                    <FilteringView visible={prop.IsFiltering} />
                    <Layout full>
                        <Layout>
                            <div className="horizontal">
                                <div style={styles('margin:5% 0px;position:relative;')}>
                                    <div style={styles('height:100px;width:100px;border-radius:50%;overflow:hidden;display:flex;justify-content:center;border:3px solid rgb(90,155,255);')} onClick={this.hViewImg}>
                                        <ImgPreloader placeholder="./assets/img/icon_blank_profile.png"
                                            src={prop.ImageData} />
                                    </div>
                                    <div style={styles('position:absolute;bottom:0px;right:0px;')}>
                                        <IonButton style={styles('--padding-start:0px;--padding-end:0px;height:25px;width:30px;')}
                                            onClick={this.hPickImage}>
                                            <IonIcon icon={cameraOutline} />
                                        </IonButton>
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
                                                <SuperTabsContainer style={styles('width:100%;background-color:#fff;padding:2%;')}>
                                                    <SuperTab noScroll style={styles('width:100%')}>


                                                        {/* <div className={classNames({ 'input-invalid': !!msg.Group })} style={styles('position:relative')}>
                                                            <IonItem className='input-error' style={styles('--highlight-background:unset;--min-height:40px;margin-top:2.5px')}>
                                                                <IonLabel position="floating" style={styles('font-weight:bold;margin-top:-7.5px')}><span style={styles('color:red')}>*</span>Groups</IonLabel>
                                                                <Input ion="popup" node={(handle) => <>
                                                                    <IonInput hidden></IonInput>
                                                                    <IonSelect interface="action-sheet" cancelText="Dismiss" style={styles('height:40px')}
                                                                        value={input.Group} {...handle({ onChange: (ev) => this.hState(ev, 'Group') })} disabled={true}>
                                                                        {data?.Group?.map((m: any, idx: any) => <>
                                                                            <IonSelectOption key={idx} value={m.GroupID}>{m.GroupName}</IonSelectOption>
                                                                        </>)}
                                                                    </IonSelect>
                                                                </>} />
                                                            </IonItem>
                                                            <div className="invalid-tooltip">{msg.Group}</div>
                                                        </div> */}

                                                        {/* <div className={classNames({ 'input-invalid': !!msg.SiteLeader })} style={styles('position:relative')}
                                                            onClick={this.hSelectSiteLeader}>
                                                            <IonItem className='input-error' style={styles('--highlight-background:unset;--min-height:40px;margin-top:2.5px')}>
                                                                <IonLabel position="floating" style={styles('font-weight:bold;margin-top:-7.5px')}><span style={styles('color:red')}>*</span>Site Leader</IonLabel>
                                                                <Input ion="popup" node={(handle) => <>
                                                                    <IonInput hidden></IonInput>
                                                                    <IonSelect interface="action-sheet" cancelText="Dismiss" style={styles('height:40px')}
                                                                        value={input.SiteLeader} {...handle({ onChange: (ev) => this.hState(ev, 'SiteLeader') })}> 
                                                                        <IonSelectOption value={input.SiteLeader}>{input.SiteLeaderName}</IonSelectOption>
                                                                    </IonSelect>
                                                                </>} />
                                                            </IonItem>
                                                            <div className="invalid-tooltip">{msg.SiteLeader}</div>
                                                            <div style={styles('position:absolute;top:0;width:100%;height:100%;z-index:1')}>&nbsp;</div>
                                                        </div> */}

                                                        <div className="page-1" style={styles('padding:1px;')} hidden={input!.NextPage === 'p1' ? false : true}>

                                                        <div className={classNames({ 'input-invalid': !!msg.Username })} style={styles('position:relative')}>
                                                                <IonLabel position="floating" style={styles('font-weight:bold;margin-top:-7.5px;margin-left:12px;')}><span style={styles('color:red')}>*</span>Username</IonLabel>
                                                            <IonItem lines="none" className='input-error' style={styles('--highlight-background:unset;--min-height:40px;margin-top:2.5px')}>
                                                                <Input ion node={(handle) => <>
                                                                    <IonInput className="font-bold br-0"
                                                                        type="text"
                                                                        value={input.Username} {...handle({ onChange: (ev) => this.hState(ev, 'Username') })} />
                                                                </>} />
                                                            </IonItem>
                                                            <div className="invalid-tooltip">{msg.Username}</div>
                                                        </div>
                                                        <div className={classNames({ 'input-invalid': !!msg.Firstname })} style={styles('position:relative')}>
                                                                <IonLabel position="floating" style={styles('font-weight:bold;margin-top:-7.5px;margin-left:12px;')}><span style={styles('color:red')}>*</span>First Name</IonLabel>
                                                            <IonItem lines="none" className='input-error' style={styles('--highlight-background:unset;--min-height:40px;margin-top:2.5px')}>
                                                                <Input ion node={(handle) => <>
                                                                    <IonInput className="font-bold br-0"
                                                                        type="text"
                                                                        value={input.Firstname} {...handle({ onChange: (ev) => this.hState(ev, 'Firstname') })} />
                                                                </>} />
                                                            </IonItem>
                                                            <div className="invalid-tooltip">{msg.Firstname}</div>
                                                        </div>
                                                        <div className={classNames({ 'input-invalid': !!msg.Middlename })} style={styles('position:relative')}>
                                                                <IonLabel position="floating" style={styles('font-weight:bold;margin-top:-7.5px;margin-left:12px;')}>Middle Name</IonLabel>
                                                            <IonItem lines="none" className='input-error' style={styles('--highlight-background:unset;--min-height:40px;margin-top:2.5px')}>
                                                                <Input ion node={(handle) => <>
                                                                    <IonInput className="font-bold br-0"
                                                                        type="text"
                                                                        value={input.Middlename} {...handle({ onChange: (ev) => this.hState(ev, 'Middlename') })} />
                                                                </>} />
                                                            </IonItem>
                                                            <div className="invalid-tooltip">{msg.Middlename}</div>
                                                        </div>

                                                        <div className={classNames({ 'input-invalid': !!msg.Lastname })} style={styles('position:relative')}>
                                                                <IonLabel position="floating" style={styles('font-weight:bold;margin-top:-7.5px;margin-left:12px;')}><span style={styles('color:red')}>*</span>Last Name</IonLabel>
                                                            <IonItem lines="none" className='input-error' style={styles('--highlight-background:unset;--min-height:40px;margin-top:2.5px')}>
                                                                <Input ion node={(handle) => <>
                                                                    <IonInput className="font-bold br-0"
                                                                        type="text"
                                                                        value={input.Lastname} {...handle({ onChange: (ev) => this.hState(ev, 'Lastname') })} />
                                                                </>} />
                                                            </IonItem>
                                                            <div className="invalid-tooltip">{msg.Lastname}</div>
                                                        </div>
                                                        <div className={classNames({ 'input-invalid': !!msg.Nickname })} style={styles('position:relative')}>
                                                                <IonLabel position="floating" style={styles('font-weight:bold;margin-top:-7.5px;margin-left:12px;')}>Alias or Nickname</IonLabel>
                                                            <IonItem lines="none" className='input-error' style={styles('--highlight-background:unset;--min-height:40px;margin-top:2.5px')}>
                                                                <Input ion node={(handle) => <>
                                                                    <IonInput className="font-bold br-0"
                                                                        type="text"
                                                                        value={input.Nickname} {...handle({ onChange: (ev) => this.hState(ev, 'Nickname') })} />
                                                                </>} />
                                                            </IonItem>
                                                            <div className="invalid-tooltip">{msg.Nickname}</div>
                                                        </div>

                                                        <div className="row m-0">
                                                            <div className="col-5 p-0">
                                                                <div className={classNames({ 'input-invalid': !!msg.BirthDate })} style={styles('position:relative')}>
                                                                        <IonLabel position="floating" style={styles('font-weight:bold;margin-top:-7.5px;margin-left:12px;')}><span style={styles('color:red')}>*</span>Birth Date</IonLabel>
                                                                    <IonItem lines="none" className='input-error' style={styles('--highlight-background:unset;--min-height:40px;margin-top:2.5px;margin-right:1.25px;')}>
                                                                        <Input ion node={(handle) => <>
                                                                            <IonLabel hidden position='stacked'></IonLabel>
                                                                            <IonInput hidden />
                                                                            <IonDatetime pickerFormat="MMMM DD YYYY" displayFormat="MMM DD, YYYY" style={styles('--padding-bottom:5px;height:50px;')}
                                                                                min={this.opts.dtConfig.MinYear} max={this.opts.dtConfig.MaxYear}
                                                                                value={input.BirthDate}  {...handle({ onChange: (ev) => this.hState(ev, 'BirthDate') })}/>
                                                                        </>} />
                                                                    </IonItem>
                                                                    <div className="invalid-tooltip">{msg.BirthDate}</div>
                                                                </div>
                                                            </div>
                                                            <div className="col-7 p-0">
                                                                <div className={classNames({ 'input-invalid': !!msg.Birthplace })} style={styles('position:relative')}>
                                                                        <IonLabel position="floating" style={styles('font-weight:bold;margin-top:-7.5px;margin-left:12px;')}>Place of Birth</IonLabel>
                                                                    <IonItem lines="none" className='input-error' style={styles('--highlight-background:unset;--min-height:40px;margin-top:2.5px;margin-left:1.25px;')}>
                                                                        <Input ion node={(handle) => <>
                                                                            <IonInput className="font-bold br-0"
                                                                                type="text"
                                                                                value={input.Birthplace} {...handle({ onChange: (ev) => this.hState(ev, 'Birthplace') })} />
                                                                        </>} />
                                                                    </IonItem>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="row m-0">
                                                            <div className="col-4 p-0">
                                                                <div className={classNames({ 'input-invalid': !!msg.Gender })} style={styles('position:relative')}>
                                                                        <IonLabel position="floating" style={styles('font-weight:bold;margin-top:-7.5px;margin-left:12px;')}><span style={styles('color:red')}>*</span>Gender</IonLabel>
                                                                    <IonItem lines="none" className='input-error' style={styles('--highlight-background:unset;--min-height:40px;margin-top:2.5px;margin-right:1.25px')}>
                                                                        <Input ion="popup" node={(handle) => <>
                                                                            <IonLabel hidden position='stacked'></IonLabel>
                                                                            <IonInput hidden></IonInput>
                                                                            <IonSelect interface="action-sheet" cancelText="Dismiss" style={styles('height:50px;color:rgb(122,123,127);font-weight:bold;')}
                                                                                value={input.Gender} {...handle({ onChange: (ev) => this.hState(ev, 'Gender') })} >
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
                                                                        <IonLabel position="floating" style={styles('font-weight:bold;margin-top:-7.5px;margin-left:12px;')}>Blood Type</IonLabel>
                                                                    <IonItem lines="none" className='input-error' style={styles('--highlight-background:unset;--min-height:40px;margin-top:2.5px;margin-left:1.25px;margin-right:1.25px;')}>
                                                                        <Input ion="popup" node={(handle) => <>
                                                                            <IonLabel hidden position='stacked'></IonLabel>
                                                                            <IonInput hidden></IonInput>
                                                                            <IonSelect interface="action-sheet" cancelText="Dismiss" style={styles('height:50px;color:rgb(122,123,127);font-weight:bold;')}
                                                                                value={input.BloodType} {...handle({ onChange: (ev) => this.hState(ev, 'BloodType') })} >
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
                                                            <div className="col-4 p-0">
                                                                <div className={classNames({ 'input-invalid': !!msg.MaritalStatus })} style={styles('position:relative')}>
                                                                        <IonLabel position="floating" style={styles('font-weight:bold;margin-top:-7.5px;margin-left:12px;')}><span style={styles('color:red')}>*</span>Marital Status</IonLabel>
                                                                    <IonItem lines="none" className='input-error' style={styles('--highlight-background:unset;--min-height:40px;margin-top:2.5px;margin-left:1.25px;')}>
                                                                        <Input ion="popup" node={(handle) => <>
                                                                            <IonLabel hidden position='stacked'></IonLabel>
                                                                            <IonInput hidden></IonInput>
                                                                            <IonSelect interface="action-sheet" cancelText="Dismiss" style={styles('height:50px;color:rgb(122,123,127);font-weight:bold;')}
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
                                                        </div>

                                                        <div className="row m-0">
                                                            <div className="col-4 p-0">
                                                                <div className={classNames({ 'input-invalid': !!msg.Citizenship })} style={styles('position:relative')}>
                                                                        <IonLabel position="floating" style={styles('font-weight:bold;margin-top:-7.5px;margin-left:12px;')}><span style={styles('color:red')}>*</span>Citizenship</IonLabel>
                                                                    <IonItem lines="none" className='input-error' style={styles('--highlight-background:unset;--min-height:40px;margin-top:2.5px;margin-right:1.25px;')}>
                                                                        <Input ion node={(handle) => <>
                                                                            <IonInput className="font-bold br-0"
                                                                                type="text"
                                                                                value={input.Citizenship} {...handle({ onChange: (ev) => this.hState(ev, 'Citizenship') })} />
                                                                        </>} />
                                                                    </IonItem>
                                                                    <div className="invalid-tooltip">{msg.Citizenship}</div>
                                                                </div>
                                                            </div>
                                                            <div className="col-4 p-0">
                                                                <div className={classNames({ 'input-invalid': !!msg.Height })} style={styles('position:relative')}>
                                                                        <IonLabel position="floating" style={styles('font-weight:bold;margin-top:-7.5px;margin-left:12px;')}>Height <span style={styles('font-size:85%')}>(ft)</span></IonLabel>
                                                                    <IonItem lines="none" className='input-error' style={styles('--highlight-background:unset;--min-height:40px;margin-top:2.5px;margin-right:1.25px;')}>
                                                                        <Input ion node={(handle) => <>
                                                                            <IonInput className="font-bold br-0"
                                                                                type="text"
                                                                                value={input.Height} {...handle({ onChange: (ev) => this.hState(ev, 'Height') })} />
                                                                        </>} />
                                                                    </IonItem>
                                                                    <div className="invalid-tooltip">{msg.Height}</div>
                                                                </div>
                                                            </div>
                                                            <div className="col-4 p-0">
                                                                <div className={classNames({ 'input-invalid': !!msg.Weight })} style={styles('position:relative')}>
                                                                        <IonLabel position="floating" style={styles('font-weight:bold;margin-top:-7.5px;margin-left:12px;')}>Weight <span style={styles('font-size:85%')}>(kg)</span></IonLabel>
                                                                    <IonItem lines="none" className='input-error' style={styles('--highlight-background:unset;--min-height:40px;margin-top:2.5px;margin-left:1.25px;')}>
                                                                        <Input ion node={(handle) => <>
                                                                            <IonInput className="font-bold br-0"
                                                                                type="number"
                                                                                value={input.Weight} {...handle({ onChange: (ev) => this.hState(ev, 'Weight') })} />
                                                                        </>} />
                                                                    </IonItem>
                                                                    <div className="invalid-tooltip">{msg.Weight}</div>
                                                                </div>
                                                            </div>
                                                            {/* <div className="col-6 p-0">
                                                                <div className={classNames({ 'input-invalid': !!msg.Religion })} style={styles('position:relative')}
                                                                        onClick={() => console.log('religion')}>
                                                                    <IonItem lines="none" className='input-error' style={styles('--highlight-background:unset;--min-height:40px;margin-top:2.5px;margin-left:1.25px;')}>
                                                                        <IonLabel position="floating" style={styles('font-weight:bold;margin-top:-7.5px')}>Religion</IonLabel>
                                                                        <IonInput hidden></IonInput>
                                                                        <IonSelect interface="action-sheet" cancelText="Dismiss" style={styles('height:40px')}
                                                                            value={input.Religion} onIonChange={(ev) => this.hState(ev, 'Religion')}>
                                                                            <IonSelectOption value={input.Religion}>{input.ReligionName}</IonSelectOption>
                                                                        </IonSelect>
                                                                    </IonItem>
                                                                    <div className="invalid-tooltip">{msg.Region}</div>
                                                                    <div style={styles('position:absolute;top:0;width:100%;height:100%;z-index:1')}>&nbsp;</div>
                                                                </div>
                                                            </div> */}
                                                        </div>

                                                        {/* <div className="row m-0">
                                                        </div> */}

                                                        <div className={classNames({ 'input-invalid': !!msg.HomeAddress })} style={styles('position:relative')}>
                                                                <IonLabel position="floating" style={styles('font-weight:bold;margin-top:-7.5px;margin-left:12px;')}><span style={styles('color:red')}>*</span>Home Address</IonLabel>
                                                            <IonItem lines="none" className='input-error' style={styles('--highlight-background:unset;--min-height:40px;margin-top:2.5px')}>
                                                                <IonTextarea rows={2} className="font-bold br-0"
                                                                    value={input.HomeAddress} onIonChange={(ev) => this.hState(ev, 'HomeAddress')} />
                                                            </IonItem>
                                                            <div className="invalid-tooltip">{msg.HomeAddress}</div>
                                                        </div>
                                                        
                                                        <div style={styles('position:relative')}>
                                                            <IonItem lines="none" style={styles('--background: primary;margin-top: 2px;--color: #000;')}>
                                                            <IonCheckbox style={styles('--border-color:#bbb;--border-color-checked:#bbb;--background-checked:#bbb;--checkmark-color:#000;opacity:1;')}
                                                                onIonChange={e => this.checkSameAddress(e.detail.checked)} 
                                                                checked={input.IsSameAddress}/>
                                                                <IonLabel><span>&nbsp;</span>Present address is the same as home address.</IonLabel>
                                                            </IonItem>
                                                        </div>

                                                        <div className={classNames({ 'input-invalid': !!msg.PresentAddress })} style={styles('position:relative')} hidden={input?.IsSameAddress ?? true}>
                                                                <IonLabel position="floating" style={styles('font-weight:bold;margin-top:-7.5px;margin-left:12px;')}><span style={styles('color:red')}>*</span>Present Address</IonLabel>
                                                            <IonItem lines="none" className='input-error' style={styles('--highlight-background:unset;--min-height:40px;margin-top:2.5px')}>
                                                                <IonTextarea rows={2} className="font-bold br-0"
                                                                    value={input?.PresentAddress} onIonChange={(ev) => this.hState(ev, 'PresentAddress')} />
                                                            </IonItem>
                                                            <div className="invalid-tooltip">{msg.PresentAddress}</div>
                                                        </div>

                                                        <div className="row m-0">
                                                            <div className="col-6 p-0">
                                                                <div className={classNames({ 'input-invalid': !!msg.Nationality })} style={styles('position:relative')} >
                                                                        <IonLabel position="floating" style={styles('font-weight:bold;margin-top:-7.5px;margin-left:12px;')}><span style={styles('color:red')}>*</span>Country</IonLabel>
                                                                    <IonItem lines="none" className='input-error' style={styles('--highlight-background:unset;--min-height:40px;margin-top:2.5px;margin-right:1.25px;')}>
                                                                        <IonInput value={input.Country!.Name} readonly></IonInput>
                                                                    </IonItem>
                                                                    <div className="invalid-tooltip">{msg.Nationality}</div>
                                                                </div>
                                                            </div>
                                                            <div className="col-6 p-0">
                                                                <div className={classNames({ 'input-invalid': !!msg.Region })} style={styles('position:relative')}
                                                                    onClick={this.hSelectRegion}>
                                                                        <IonLabel position="floating" style={styles('font-weight:bold;margin-top:-7.5px;margin-left:12px;')}><span style={styles('color:red')}>*</span>Region</IonLabel>
                                                                    <IonItem lines="none" className='input-error' style={styles('--highlight-background:unset;--min-height:40px;margin-top:2.5px;margin-left:1.25px;')}>
                                                                        <IonLabel hidden position='stacked'></IonLabel>
                                                                        <IonInput hidden></IonInput>
                                                                        <IonSelect interface="action-sheet" cancelText="Dismiss" style={styles('height:50px;color:rgb(122,123,127);font-weight:bold;')}
                                                                            value={input.Region} onIonChange={(ev) => this.hState(ev, 'Region')}> {/* [(ngModel)]="filter.Method" (ionChange)="handleChangedPayMethod()"*/}
                                                                            <IonSelectOption value={input.Region}>{input.RegionName}</IonSelectOption>
                                                                        </IonSelect>
                                                                    </IonItem>
                                                                    <div className="invalid-tooltip">{msg.Region}</div>
                                                                    <div style={styles('position:absolute;top:0;width:100%;height:100%;z-index:1')}>&nbsp;</div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="row m-0">
                                                            <div className="col-6 p-0">
                                                                <div className={classNames({ 'input-invalid': !!msg.Province })} style={styles('position:relative')}
                                                                    onClick={this.hSelectProvince}>
                                                                        <IonLabel position="floating" style={styles('font-weight:bold;margin-top:-7.5px;margin-left:12px;')}><span style={styles('color:red')}>*</span>Province</IonLabel>
                                                                    <IonItem lines="none" className='input-error' style={styles('--highlight-background:unset;--min-height:40px;margin-top:2.5px;margin-right:1.25px;')}>
                                                                        <IonLabel hidden position='stacked'></IonLabel>
                                                                        <IonInput hidden></IonInput>
                                                                        <IonSelect interface="action-sheet" cancelText="Dismiss" style={styles('height:50px;color:rgb(122,123,127);font-weight:bold;')}
                                                                            value={input.Province} onIonChange={(ev) => this.hState(ev, 'Province')}> {/* [(ngModel)]="filter.Method" (ionChange)="handleChangedPayMethod()"*/}
                                                                            <IonSelectOption value={input.Province}>{input.ProvinceName}</IonSelectOption>
                                                                        </IonSelect>
                                                                    </IonItem>
                                                                    <div className="invalid-tooltip">{msg.Province}</div>
                                                                    <div style={styles('position:absolute;top:0;width:100%;height:100%;z-index:1')}>&nbsp;</div>
                                                                </div>
                                                            </div>
                                                            <div className="col-6 p-0">
                                                                <div className={classNames({ 'input-invalid': !!msg.Municipality })} style={styles('position:relative')}
                                                                    onClick={this.hSelectMunicipality}>
                                                                        <IonLabel position="floating" style={styles('font-weight:bold;margin-top:-7.5px;margin-left:12px;')}><span style={styles('color:red')}>*</span>Municipality</IonLabel>
                                                                    <IonItem lines="none" className='input-error' style={styles('--highlight-background:unset;--min-height:40px;margin-top:2.5px;margin-left:1.25px;')}>
                                                                        <IonLabel hidden position='stacked'></IonLabel>
                                                                        <IonInput hidden></IonInput>
                                                                        <IonSelect interface="action-sheet" cancelText="Dismiss" style={styles('height:50px;color:rgb(122,123,127);font-weight:bold;')}
                                                                            value={input.Municipality} onIonChange={(ev) => this.hState(ev, 'Municipality')}> {/* [(ngModel)]="filter.Method" (ionChange)="handleChangedPayMethod()"*/}
                                                                            <IonSelectOption value={input.Municipality}>{input.MunicipalityName}</IonSelectOption>
                                                                        </IonSelect>
                                                                    </IonItem>
                                                                    <div className="invalid-tooltip">{msg.Municipality}</div>
                                                                    <div style={styles('position:absolute;top:0;width:100%;height:100%;z-index:1')}>&nbsp;</div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="row m-0">
                                                            <div className="col-6 p-0">
                                                                <div className={classNames({ 'input-invalid': !!msg.Barangay })} style={styles('position:relative')}
                                                                    onClick={this.hSelectBarangay}>
                                                                        <IonLabel position="floating" style={styles('font-weight:bold;margin-top:-7.5px;margin-left:12px;')}><span style={styles('color:red')}>*</span>Barangay</IonLabel>
                                                                    <IonItem lines="none" className='input-error' style={styles('--highlight-background:unset;--min-height:40px;margin-top:2.5px;margin-right:1.25px;')}>
                                                                        <IonLabel hidden position='stacked'></IonLabel>
                                                                        <IonInput hidden></IonInput>
                                                                        <IonSelect interface="action-sheet" cancelText="Dismiss" style={styles('height:50px;color:rgb(122,123,127);font-weight:bold;')}
                                                                            value={input.Barangay} onIonChange={(ev) => this.hState(ev, 'Barangay')}> {/* [(ngModel)]="filter.Method" (ionChange)="handleChangedPayMethod()"*/}
                                                                            <IonSelectOption value={input.Barangay}>{input.BarangayName}</IonSelectOption>
                                                                        </IonSelect>
                                                                    </IonItem>
                                                                    <div className="invalid-tooltip">{msg.Barangay}</div>
                                                                    <div style={styles('position:absolute;top:0;width:100%;height:100%;z-index:1')}>&nbsp;</div>
                                                                </div>
                                                            </div>
                                                            <div className="col-6 p-0">
                                                                <div className={classNames({ 'input-invalid': !!msg.Sitio })} style={styles('position:relative')}
                                                                    onClick={this.hSelectSitio}>
                                                                        <IonLabel position="floating" style={styles('font-weight:bold;margin-top:-7.5px;margin-left:12px;')}><span style={styles('color:red')}>*</span>Sitio</IonLabel>
                                                                    <IonItem lines="none" className='input-error' style={styles('--highlight-background:unset;--min-height:40px;margin-top:2.5px;margin-left:1.25px;')}>
                                                                        <IonLabel hidden position='stacked'></IonLabel>
                                                                        <IonInput hidden></IonInput>
                                                                        <IonSelect interface="action-sheet" cancelText="Dismiss" style={styles('height:50px;color:rgb(122,123,127);font-weight:bold;')}
                                                                            value={input.Sitio} onIonChange={(ev) => this.hState(ev, 'Sitio')}> {/* [(ngModel)]="filter.Method" (ionChange)="handleChangedPayMethod()"*/}
                                                                            <IonSelectOption value={input.Sitio}>{input.SitioName}</IonSelectOption>
                                                                        </IonSelect>
                                                                    </IonItem>
                                                                    <div className="invalid-tooltip">{msg.Sitio}</div>
                                                                    <div style={styles('position:absolute;top:0;width:100%;height:100%;z-index:1')}>&nbsp;</div>
                                                                </div>
                                                            </div>
                                                        </div>



                                                        <div className="row m-0">
                                                            <div className="col-6 p-0">
                                                                <div className={classNames({ 'input-invalid': !!msg.MobileNumber })} style={styles('position:relative')}>
                                                                        <IonLabel position="floating" style={styles('font-weight:bold;margin-top:-7.5px;margin-left:12px;')}><span style={styles('color:red')}>*</span>Mobile Number</IonLabel>
                                                                    <IonItem lines="none" className='input-error' style={styles('--highlight-background:unset;--min-height:40px;margin-top:2.5px;margin-right:1.25px;')}>
                                                                        <Input ion node={(handle) => <>
                                                                            <IonInput className="font-bold br-0"
                                                                                type="tel"
                                                                                value={input.MobileNumber} {...handle({ onChange: (ev) => this.hState(ev, 'MobileNumber') })} />
                                                                        </>} />
                                                                    </IonItem>
                                                                    <div className="invalid-tooltip">{msg.MobileNumber}</div>
                                                                </div>
                                                            </div>
                                                            <div className="col-6 p-0">
                                                                <div className={classNames({ 'input-invalid': !!msg.EmailAddress })} style={styles('position:relative')}>
                                                                        <IonLabel position="floating" style={styles('font-weight:bold;margin-top:-7.5px;margin-left:12px;')}>Email Address <span style={styles('font-size:85%')}>(Optional)</span></IonLabel>
                                                                    <IonItem lines="none" className='input-error' style={styles('--highlight-background:unset;--min-height:40px;margin-top:2.5px;margin-left:1.25px;')}>
                                                                        <Input ion node={(handle) => <>
                                                                            <IonInput className="font-bold br-0"
                                                                                type="text"
                                                                                value={input.EmailAddress} {...handle({ onChange: (ev) => this.hState(ev, 'EmailAddress') })} />
                                                                        </>} />
                                                                    </IonItem>
                                                                    <div className="invalid-tooltip">{msg.EmailAddress}</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        
                                                        <div className={classNames({ 'input-invalid': !!msg.Occupation })} style={styles('position:relative')}>
                                                                <IonLabel position="floating" style={styles('font-weight:bold;margin-top:-7.5px;margin-left:12px;')}>Occupation</IonLabel>
                                                            <IonItem lines="none" className='input-error' style={styles('--highlight-background:unset;--min-height:40px;margin-top:2.5px')}>
                                                                <IonInput className="font-bold br-0"
                                                                    value={input.Occupation} onIonChange={(ev) => this.hState(ev, 'Occupation')} />
                                                            </IonItem>
                                                            <div className="invalid-tooltip">{msg.Occupation}</div>
                                                        </div>

                                                        <div className={classNames({ 'input-invalid': !!msg.Skills })} style={styles('position:relative')}>
                                                                <IonLabel position="floating" style={styles('font-weight:bold;margin-top:-7.5px;margin-left:12px;')}>Skills  <span style={styles('font-size:85%')}>(Optional)</span></IonLabel>
                                                            <IonItem lines="none" className='input-error' style={styles('--highlight-background:unset;--min-height:40px;margin-top:2.5px')}>
                                                                <Input ion node={(handle) => <>
                                                                    <IonInput className="font-bold br-0"
                                                                        type="text"
                                                                        value={input.Skills} {...handle({ onChange: (ev) => this.hState(ev, 'Skills') })} />
                                                                </>} />
                                                            </IonItem>
                                                            <div className="invalid-tooltip">{msg.Skills}</div>
                                                        </div>
                                                        
                                                        {/*Parent Info*/}
                                                        {/* <div className={classNames({ 'input-invalid': !!msg.Fathername })} style={styles('position:relative')} 
                                                            onClick={() => this.hInputFathersName(input?.Father ?? null)}>
                                                            <IonItem className='input-error' style={styles('--highlight-background:unset;--min-height:40px;margin-top:2.5px')}>
                                                                <IonLabel position="floating" style={styles('font-weight:bold;margin-top:-7.5px')}>Father's Name</IonLabel>
                                                                <Input ion node={(handle) => <>
                                                                    <IonInput className="font-bold br-0"
                                                                        type="text"
                                                                        value={input?.Father?(input.Father.FullName):''} readonly/>
                                                                </>} />
                                                            </IonItem>
                                                            <div className="invalid-tooltip">{msg.Fathername}</div>
                                                        </div>

                                                        <div className={classNames({ 'input-invalid': !!msg.Mothername })} style={styles('position:relative')}
                                                            onClick={() => this.hInputMothersName(input?.Mother ?? null)}>
                                                            <IonItem className='input-error' style={styles('--highlight-background:unset;--min-height:40px;margin-top:2.5px')}>
                                                                <IonLabel position="floating" style={styles('font-weight:bold;margin-top:-7.5px')}>Mother's Name</IonLabel>
                                                                <Input ion node={(handle) => <>
                                                                    <IonInput className="font-bold br-0"
                                                                        type="text"
                                                                        value={input?.Mother?input.Mother.FullName:''} readonly/>
                                                                </>} />
                                                            </IonItem>
                                                            <div className="invalid-tooltip">{msg.Mothername}</div>
                                                        </div>

                                                        <div style={styles('position:relative')}>
                                                            <IonItem style={styles('--background: primary;margin-top: 2px;--color: #fdb67f;')}>
                                                                <IonCheckbox style={styles('--background:primary;--border-color: rgba(245, 233, 12, 0.75);--background-checked: #fdb67f;--border-color-checked:rgba(245, 233, 12, 0.75);--checkmark-color: #000;')} 
                                                                onIonChange={e => this.checkParentLivesInBarangay(e.detail.checked)} 
                                                                checked={input.IsParentLiveInBarangay}/>
                                                                <IonLabel><span>&nbsp;</span>Your parents live in this barangay</IonLabel>
                                                            </IonItem>
                                                        </div> */}

                                                        {/*Spouse Info*/}
                                                        {/* <div className={classNames({ 'input-invalid': !!msg.Spouse })} style={styles('position:relative')} 
                                                            hidden={input.MaritalStatus === 'm' ? false : true} 
                                                            onClick={() => this.hInputSpouseName(input?.Spouse ?? null)}>
                                                            <IonItem className='input-error' style={styles('--highlight-background:unset;--min-height:40px;margin-top:2.5px')}>
                                                                <IonLabel position="floating" style={styles('font-weight:bold;margin-top:-7.5px')}><span style={styles('color:red')}>*</span>Spouse Name</IonLabel>
                                                                <Input ion node={(handle) => <>
                                                                    <IonInput className="font-bold br-0"
                                                                        type="text"
                                                                        value={input?.Spouse?input.Spouse.FullName:''} readonly/>
                                                                </>} />
                                                            </IonItem>
                                                            <div className="invalid-tooltip">{msg.Spouse}</div>
                                                        </div> */}
                                                        </div>

                                                        <div className="page-2" hidden={input!.NextPage === 'p2' ? false : true}>
                                                            <div className={classNames({ 'input-invalid': !!msg.SocialDetails })} style={styles('position:relative;background:linear-gradient(#f6f642, #ff9701);')}>
                                                                <div className="invalid-tooltip">{msg.SocialDetails}</div>
                                                            </div>
                                                            <div style={styles('position:relative;padding:1px;margin-top:2.5px;')}>
                                                                <div style={styles('border: 1px solid #bbb;border-radius:12px;')}>
                                                                    <IonList lines="none" style={styles('background:rgba(204, 207, 231,0.5);')}>
                                                                        <IonTitle style={styles('color:#000;')}>Social Details</IonTitle>
                                                                        <IonItem lines="none">
                                                                        <IonCheckbox style={styles('--border-color:#bbb;--border-color-checked:#bbb;--background-checked:#bbb;--checkmark-color:#000;opacity:1;')}
                                                                            checked={input?.IsLivingWithParents ?? false} onIonChange={(e) => this.checkLivingWithParents(e.detail.checked)}/>
                                                                            <IonLabel style={styles('color:#000;')}><span>&nbsp;</span>Living with Parents</IonLabel>
                                                                        </IonItem>
                                                                        <IonItem lines="none">
                                                                        <IonCheckbox style={styles('--border-color:#bbb;--border-color-checked:#bbb;--background-checked:#bbb;--checkmark-color:#000;opacity:1;')}
                                                                            checked={input?.IsSeniorCitizen ?? false} onIonChange={(e) => this.checkSeniorCitizen(e.detail.checked)}/>
                                                                            <IonLabel style={styles('color:#000;')}><span>&nbsp;</span>Senior Citizen</IonLabel>
                                                                        </IonItem>
                                                                        <IonItem lines="none">
                                                                        <IonCheckbox style={styles('--border-color:#bbb;--border-color-checked:#bbb;--background-checked:#bbb;--checkmark-color:#000;opacity:1;')}
                                                                            checked={input?.IsSingleParent ?? false} onIonChange={(e) => this.checkSingleParent(e.detail.checked)}/>
                                                                            <IonLabel style={styles('color:#000;')}><span>&nbsp;</span>Single Parent</IonLabel>
                                                                        </IonItem>
                                                                        <IonItem lines="none">
                                                                        <IonCheckbox style={styles('--border-color:#bbb;--border-color-checked:#bbb;--background-checked:#bbb;--checkmark-color:#000;opacity:1;')}
                                                                            checked={input?.IsIndigent ?? false} onIonChange={(e) => this.checkIndigent(e.detail.checked)}/>
                                                                            <IonLabel style={styles('color:#000;')}><span>&nbsp;</span>Belong to Indigent Family</IonLabel>
                                                                        </IonItem>
                                                                        <IonItem lines="none">
                                                                        <IonCheckbox style={styles('--border-color:#bbb;--border-color-checked:#bbb;--background-checked:#bbb;--checkmark-color:#000;opacity:1;')}
                                                                            checked={input?.IsPWD ?? false} onIonChange={(e) => this.checkPersonWithDisability(e.detail.checked)}/>
                                                                            <IonLabel style={styles('color:#000;')}><span>&nbsp;</span>Person with Disability</IonLabel>
                                                                        </IonItem>
                                                                    </IonList>
                                                                </div>
                                                            </div>

                                                            <div style={styles('position:relative')}>
                                                                <IonItem lines="none" style={styles('--background: primary;margin-top: 2px;--color: #000;')}>
                                                                <IonCheckbox style={styles('--border-color:#bbb;--border-color-checked:#bbb;--background-checked:#bbb;--checkmark-color:#000;opacity:1;')}
                                                                    onIonChange={e => this.checkRegisteredVoter(e.detail.checked)} 
                                                                    checked={input.IsRegisteredVoter}/>
                                                                    <IonLabel><span>&nbsp;</span>Are you a registered voter?</IonLabel>
                                                                </IonItem>
                                                            </div>

                                                            <div className="row m-0" hidden={!input.IsRegisteredVoter}>
                                                            <div className="col-6 p-0">
                                                                <div className={classNames({ 'input-invalid': !!msg.PrecinctNumber })} style={styles('position:relative')}>
                                                                        <IonLabel position="floating" style={styles('font-weight:bold;margin-top:-7.5px;margin-left:12px;')}>Precinct Number</IonLabel>
                                                                    <IonItem lines="none" className='input-error' style={styles('--highlight-background:unset;--min-height:40px;margin-top:2.5px;margin-right:1.25px;')}>
                                                                        <Input ion node={(handle) => <>
                                                                            <IonInput className="font-bold br-0"
                                                                                type="text"
                                                                                value={input.PrecinctNumber} {...handle({ onChange: (ev) => this.hState(ev, 'PrecinctNumber') })} />
                                                                        </>} />
                                                                    </IonItem>
                                                                    <div className="invalid-tooltip">{msg.PrecinctNumber}</div>
                                                                </div>
                                                            </div>
                                                            <div className="col-6 p-0">
                                                                <div className={classNames({ 'input-invalid': !!msg.ClusterNumber })} style={styles('position:relative')}>
                                                                        <IonLabel position="floating" style={styles('font-weight:bold;margin-top:-7.5px;margin-left:12px;')}>Cluster Number</IonLabel>
                                                                    <IonItem lines="none" className='input-error' style={styles('--highlight-background:unset;--min-height:40px;margin-top:2.5px;margin-left:1.25px;')}>
                                                                        <Input ion node={(handle) => <>
                                                                            <IonInput className="font-bold br-0"
                                                                                type="text"
                                                                                value={input.ClusterNumber} {...handle({ onChange: (ev) => this.hState(ev, 'ClusterNumber') })} />
                                                                        </>} />
                                                                    </IonItem>
                                                                    <div className="invalid-tooltip">{msg.ClusterNumber}</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        </div>
                                                        
                                                        {/*Educational Background*/}
                                                        {/* <div className="educational-attainment" hidden={input!.NextPage === 'ea' ? false : true}>
                                                            <div style={styles('position:relative;background:linear-gradient(#f6f642, #ff9701);')}>
                                                                <IonTitle style={styles('font-weight:bold;color:#fff;padding:3px')}>Educational Background</IonTitle>
                                                            </div>
                                                            <div style={styles('position:relative;')} onClick={() => this.hInputCollegeBackground(input?.College ?? null)}>
                                                                <IonItem className='input-error' style={styles('--highlight-background:unset;--min-height:80px;margin-top:2.5px')} >
                                                                    <IonLabel position="floating" style={styles('font-weight:bold;margin-top:-7.5px')}>College</IonLabel>
                                                                    <Input ion node={(handle) => <>
                                                                        <IonTextarea className="font-bold br-0 "
                                                                            value={input?.College ? (input.College.SchoolYear +" - "+input.College.SchoolCourse+" at "+input.College.SchoolName+", "+input.College.SchoolAddress) : ""} readonly/>
                                                                    </>} />
                                                                </IonItem>
                                                            </div>
                                                            <div style={styles('position:relative;')} onClick={this.hInputSHSBackground}>
                                                                <IonItem className='input-error' style={styles('--highlight-background:unset;--min-height:80px;margin-top:2.5px')}>
                                                                    <IonLabel position="floating" style={styles('font-weight:bold;margin-top:-7.5px')}>SHS / High School</IonLabel>
                                                                    <Input ion node={(handle) => <>
                                                                        <IonTextarea className="font-bold br-0 "
                                                                            value={input?.SHS ? (input.SHS.SchoolYear +" - "+(input.SHS?.SchoolCourse  ? input.SHS?.SchoolCourse + " at " : "")+input.SHS.SchoolName+", "+input.SHS.SchoolAddress) : ""} readonly/>
                                                                    </>} />
                                                                </IonItem>
                                                            </div>
                                                            <div style={styles('position:relative;')} onClick={this.hInputElemBackground}>
                                                                <IonItem className='input-error' style={styles('--highlight-background:unset;--min-height:80px;margin-top:2.5px')}>
                                                                    <IonLabel position="floating" style={styles('font-weight:bold;margin-top:-7.5px')}>Elementary</IonLabel>
                                                                    <Input ion node={() => <>
                                                                        <IonTextarea className="font-bold br-0 "
                                                                            value={input?.Elem ? (input.Elem.SchoolYear +" - "+input.Elem.SchoolCourse+" at "+input.Elem.SchoolName+", "+input.Elem.SchoolAddress) : ""} readonly/>
                                                                    </>} />
                                                                </IonItem>
                                                            </div>
                                                            
                                                        </div> */}

                                                        {/*Pagination */}
                                                        <div style={styles('position:relative;')}>
                                                            <IonRow>
                                                                <IonCol size="6">
                                                                    <IonItem lines="none" style={styles('--background:primary;--highlight-background:unset;--min-height:40px;margin-top:2.5px;')}>
                                                                        <IonButton slot="start" size="default" style={styles('font-size:14pt;font-weight:bold;--background:linear-gradient(#000066, #000645);--border-radius:15px;')}
                                                                            onClick={() => this.supposedPrevPage(input!.PageIndex)} hidden={input!.PageIndex === 0 ? true : false}>
                                                                            <IonIcon slot="start" icon={arrowBackOutline}/>
                                                                            Prev
                                                                        </IonButton>
                                                                    </IonItem>
                                                                </IonCol>
                                                                <IonCol size="6">
                                                                    <IonItem lines="none" style={styles('--background:primary;--highlight-background:unset;--min-height:40px;margin-top:2.5px;')}
                                                                        hidden={input!.PageIndex === 1 ? true : false}>
                                                                        <IonButton slot="end" size="default" style={styles('font-size:14pt;font-weight:bold;--background:linear-gradient(#000066, #000645);--border-radius:15px;')}
                                                                            onClick={() => this.supposedNextPage(input!.PageIndex)}>
                                                                            <IonIcon slot="end" icon={arrowForwardOutline}/>
                                                                            Next
                                                                        </IonButton>
                                                                    </IonItem>
                                                                    <IonItem lines="none" style={styles('--background:primary;--highlight-background:unset;--min-height:40px;margin-top:2.5px;')}
                                                                        hidden={input!.PageIndex === 0 ? true : false}>
                                                                        <IonButton slot="end" size="default" style={styles('font-size:14pt;font-weight:bold;--background:linear-gradient(#33ccff, #0066ff);--border-radius:15px;margin-left:0px;')/*(#f6f642, #ff9701)*/} 
                                                                            onClick={this.hConfirm}>
                                                                            <IonIcon slot="start" icon={saveOutline}/>
                                                                            {prop.IsUpdate ? 'Save Changes' : 'Submit'}
                                                                        </IonButton>
                                                                    </IonItem>
                                                                </IonCol>
                                                            </IonRow>
                                                        </div>

                                                        <br/>

                                                        {/* <div className={classNames({ 'input-invalid': !!msg.Sitio })} style={styles('position:relative')}>
                                                            <IonItem className='input-error' style={styles('--highlight-background:unset;--min-height:40px;margin-top:2.5px')}>
                                                                <IonLabel position="floating" style={styles('font-weight:bold;margin-top:-7.5px')}><span style={styles('color:red')}>*</span>Sitio</IonLabel>
                                                                <Input ion node={(handle) => <>
                                                                    <IonInput className="font-bold br-0"
                                                                        type="text"
                                                                        value={input.Sitio}  {...handle({ onChange: (ev) => this.hState(ev, 'Sitio') })} />
                                                                </>} />
                                                            </IonItem>
                                                            <div className="invalid-tooltip">{msg.Sitio}</div>
                                                        </div> */}

                                                    </SuperTab>
                                                </SuperTabsContainer>
                                            </SuperTabs>
                                            
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </Layout>
                        {/* <div style={styles('position:relative;background-color:rgb(29, 44, 101)')}>
                            <IonRow>
                                <IonCol>
                                    <IonItem className="" style={styles('--background:primary;--highlight-background:unset;--min-height:40px;margin-top:2.5px;padding:5px;')}>
                                        <IonButton slot="start" size="default" style={styles('font-size:12pt;font-weight:bold;--background:linear-gradient(#f6f642, #ff9701)')}
                                            onClick={() => this.supposedNextPage(input?.pageIndex ?? 0)}>
                                            <IonIcon slot="start" icon={arrowBackOutline}/>
                                            Prev
                                        </IonButton>
                                    </IonItem>
                                </IonCol>
                                <IonCol>
                                    <IonItem className="" style={styles('--background:primary;--highlight-background:unset;--min-height:40px;margin-top:2.5px;padding:5px;')}>
                                        <IonButton slot="end" size="default" style={styles('font-size:12pt;font-weight:bold;--background:linear-gradient(#f6f642, #ff9701)')}
                                            onClick={() => this.supposedNextPage(input?.pageIndex ?? 0)}>
                                            <IonIcon slot="end" icon={arrowForwardOutline}/>
                                            Next
                                        </IonButton>
                                    </IonItem>
                                </IonCol>
                            </IonRow>
                        </div> */}

                        {/*Register Button*/}
                        {/* <Layout>
                            <div style={styles('padding:5px 2.5px;')}>
                                <IonButton style={styles('width:100%;margin:0px;')} onClick={this.hConfirm}>
                                    <IonIcon icon={saveOutline} style={styles('padding-right:5px;')} />
                                    {prop.IsUpdate ? 'Save Changes' : 'Register'}
                                </IonButton>
                            </div>
                        </Layout> */}
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
class BarangaySelectPopUp extends React.Component<{ modal: Function, Title: string, Opts: any }> implements OnDidBackdrop {
    private static cache: any = {};
    state: any = { inner: { height: (window.innerHeight + 'px') } }
    constructor(props: any) {
        super(props);
        app.component(this);
        Object.rcopy(this.filter, (this.props.Opts || mtObj));
        this.prop.IsDevice = !device.isBrowser;
        this.filter.CacheID = (this.filter.Type + '-' + (this.filter.ID || '0'));
        const cache = BarangaySelectPopUp.cache[this.filter.CacheID] || null;
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
        this.subs.s1 = rest.post('brgy', Object.rcopy(filter, this.filter)).subscribe(async (res: any) => {
            this.prop.IsFiltering = false;
            if (res.Status != 'error') {
                if (filter.IsReset) this.list = res.Barangay.map((o: any) => this.listDetails(o));
                else res.Barangay.forEach((o: any) => this.list.push(this.listDetails(o)));
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
            <Modal className="modal-adjustment full" ref={(ref) => modal = ref} content={<BarangaySelectPopUp modal={() => modal} Title={title} Opts={opts} />} />
        </>);
        setTimeout(async () => (await modal.onDidDismiss(), stack.pop()));
        return modal;
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

class SiteLeaderSelectPopUp extends React.Component<{ modal: Function, Title: string, Opts: any }> implements OnDidBackdrop {
    private static cache: any = {};
    state: any = { inner: { height: (window.innerHeight + 'px') } }
    constructor(props: any) {
        super(props);
        app.component(this);
        Object.rcopy(this.filter, (this.props.Opts || mtObj));
        this.prop.IsDevice = !device.isBrowser;
        this.filter.CacheID = (this.filter.Type + '-' + (this.filter.ID || '0'));
        const cache = SiteLeaderSelectPopUp.cache[this.filter.CacheID] || null;
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
        this.subs.s1 = rest.post('group/siteleader', Object.rcopy(filter, this.filter)).subscribe(async (res: any) => {
            this.prop.IsFiltering = false;
            if (res.Status != 'error') {
                if (filter.IsReset) this.list = res.siteleader.map((o: any) => this.listDetails(o));
                else res.siteleader.forEach((o: any) => this.list.push(this.listDetails(o)));
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
                                                        <div>{item.FLL_NM}</div>
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
            <Modal className="modal-adjustment full" ref={(ref) => modal = ref} content={<SiteLeaderSelectPopUp modal={() => modal} Title={title} Opts={opts} />} />
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

class LocationSelectPopUp extends React.Component<{ modal: Function, Title: string, Locations: any, Opts: any }> implements OnDidBackdrop {
    private static cache: any = {};
    state: any = { inner: { height: (window.innerHeight + 'px') } }
    constructor(props: any) {
        super(props);
        app.component(this);
        Object.rcopy(this.filter, (this.props.Opts || mtObj));
        this.prop.IsDevice = !device.isBrowser;
        this.filter.CacheID = (this.filter.Type + '-' + (this.filter.ID || '0'));
        const cache = LocationSelectPopUp.cache[this.filter.CacheID] || null;
        if (!!cache) {
            this.list = cache.List;
            this.prop.IsEmpty = (this.list.length < 1);
            this.prop.IsFiltering = this.prop.IsEmpty;
            if (!this.prop.IsEmpty) Object.rcopy(this.filter, cache.Filter);
        }
        this.locations = [...this.props.Locations];
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
            LocationSelectPopUp.cache[this.filter.CacheID] = { Filter: this.filter, List: this.list, };
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

    static modal = async (title: string, locations: any, opts: any) => {
        var modal: any;
        var stack = await Stack.push(<>
            <Modal className="modal-adjustment full" ref={(ref) => modal = ref} content={<LocationSelectPopUp modal={() => modal} Title={title} Locations={locations} Opts={opts} />} />
        </>);
        setTimeout(async () => (await modal.onDidDismiss(), stack.pop()));
        return modal;
    }
}

class EducationalBackgroundPopUp extends React.Component<{ modal: Function, Title: string, Fields: any }> implements OnDidBackdrop {
    private static cache: any = {};
    state: any = { inner: { height: (window.innerHeight + 'px') } }
    // constructor(props: any) {
    //     super(props);
    //     app.component(this);
    //     Object.rcopy(this.filter, (this.props.Opts || mtObj));
    //     this.prop.IsDevice = !device.isBrowser;
    //     this.filter.CacheID = (this.filter.Type + '-' + (this.filter.ID || '0'));
    //     const cache = EducationalBackgroundPopUp.cache[this.filter.CacheID] || null;
    //     if (!!cache) {
    //         this.list = cache.List;
    //         this.prop.IsEmpty = (this.list.length < 1);
    //         this.prop.IsFiltering = this.prop.IsEmpty;
    //         if (!this.prop.IsEmpty) Object.rcopy(this.filter, cache.Filter);
    //     }
    //     this.locations = [...this.props.Locations];
    //     this.locations.sort((a: any, b: any) => (a.Code + 0) < (b.Code + 0) ? -1 : 1);
    //     this.state = { ...this.state, prop: this.prop, filter: this.filter, list: this.list };
    // }
    // dismiss = (name:any=null,address:any=null,year:any=null,course:any=null) => this.props.modal().dismiss(name,address,year,course);
    dismiss = (data: any = null) => this.props.modal().dismiss(data);
    hClose = () => this.dismiss();

    onDidBackdrop() {
        this.dismiss();
        return false;
    }

    hItem = (item: any) => {
        console.log(item);
        this.dismiss(item);
    }

    render() {
        const { inner = {} } = this.state;
        const input: any = this.props.Fields || {};
        return (<>
            <div className="modal-container" style={styles({ 'height': inner.height })}>
                <div style={styles('padding-top:5px;padding-bottom:5px;border-bottom: 1px solid rgba(0,0,0,0.25);')}>
                    <div className="row m-0 header">
                        <div className="col-10">{this.props.Title}</div>
                        <div className="col-2 p-0 btn-close" style={styles('text-align:right;right:5px')} onClick={this.hClose}></div>
                    </div>
                </div>
                <Layout full style={styles('height:calc(100% - 30px)')}>
                    <div style={styles('position:relative')}>
                        <IonItem style={styles('margin-top:2.5px;')}>
                            <IonLabel position="floating">Name</IonLabel>
                            <IonInput value={input.Name} onIonChange={(e) => input.Name = e.detail.value}></IonInput>
                        </IonItem>
                        <IonItem style={styles('margin-top:2.5px;')}>
                            <IonLabel position="floating">Address</IonLabel>
                            <IonInput value={input.Address} onIonChange={(e) => input.Address = e.detail.value}></IonInput>
                        </IonItem>
                        <IonItem style={styles('margin-top:2.5px;')}>
                            <IonLabel position="floating">Course</IonLabel>
                            <IonInput value={input.Course} onIonChange={(e) => input.Course = e.detail.value}></IonInput>
                        </IonItem>
                        <IonItem style={styles('margin-top:2.5px;')}>
                            <IonLabel position="floating">Year</IonLabel>
                            <IonInput value={input.Year} onIonChange={(e) => input.Year = e.detail.value}></IonInput>
                        </IonItem>
                        <div style={styles('position:relative;margin-top:2.5px;float:right')}>
                            <IonRow>
                                <IonCol>
                                    <IonButton size="default" onClick={() => this.hItem(input)}>
                                        Done
                                    </IonButton>
                                </IonCol>
                            </IonRow>
                        </div>
                    </div>

                    {/* <Layout>
                        <IonSearchbar value={filter.Search} onIonChange={(ev) => (this.hFState(ev, 'Search'), this.hFilter())}
                            placeholder="Search Location" debounce={0} />
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
                    </Layout> */}
                </Layout>
            </div>
        </>);
    }

    static modal = async (title: string, fields: any) => {
        var modal: any;
        var stack = await Stack.push(<>
            <Modal className="modal-adjustment full" ref={(ref) => modal = ref} content={<EducationalBackgroundPopUp modal={() => modal} Title={title} Fields={fields}/>} />
        </>);
        setTimeout(async () => (await modal.onDidDismiss(), stack.pop()));
        return modal;
    }
}

class FullNamePopUp extends React.Component<{ modal: Function, Title: string, Fields: any }> implements OnDidBackdrop {
    private static cache: any = {};
    state: any = { inner: { height: (window.innerHeight + 'px') } }
    dismiss = (data: any = null) => this.props.modal().dismiss(data);
    hClose = () => this.dismiss();

    onDidBackdrop() {
        this.dismiss();
        return false;
    }

    hItem = (item: any) => {
        console.log(item);
        this.dismiss(item);
    }

    hValidation = (input:any) => {
        if(!input.Firstname || !input.Middlename || !input.Lastname)
            Alert.showErrorMessage('All fields are required');
        else
            this.hItem(input);
    }

    render() {
        const { inner = {} } = this.state;
        const input: any = this.props.Fields || {};
        return (<>
            <div className="modal-container" style={styles({ 'height': inner.height })}>
                <div style={styles('padding-top:5px;padding-bottom:5px;border-bottom: 1px solid rgba(0,0,0,0.25);')}>
                    <div className="row m-0 header">
                        <div className="col-10">{this.props.Title}</div>
                        <div className="col-2 p-0 btn-close" style={styles('text-align:right;right:5px')} onClick={this.hClose}></div>
                    </div>
                </div>
                <Layout full style={styles('height:calc(100% - 30px)')}>
                    <div style={styles('position:relative')}>
                        
                        <IonItem style={styles('margin-top:2.5px;')}>
                            <IonLabel position="floating">First Name</IonLabel>
                            <IonInput value={input.Firstname} onIonChange={(e) => input.Firstname = e.detail.value}></IonInput>
                        </IonItem>
                        <IonItem style={styles('margin-top:2.5px;')}>
                            <IonLabel position="floating">Middle Name</IonLabel>
                            <IonInput value={input.Middlename} onIonChange={(e) => input.Middlename = e.detail.value}></IonInput>
                        </IonItem>
                        <IonItem style={styles('margin-top:2.5px;')}>
                            <IonLabel position="floating">Last Name</IonLabel>
                            <IonInput value={input.Lastname} onIonChange={(e) => input.Lastname = e.detail.value}></IonInput>
                        </IonItem>
                        <div style={styles('position:relative;margin-top:2.5px;float:right')}>
                            <IonRow>
                                <IonCol>
                                    <IonButton size="default" onClick={() => this.hValidation(input)}>
                                        Done
                                    </IonButton>
                                </IonCol>
                            </IonRow>
                        </div>
                    </div>
                </Layout>
            </div>
        </>);
    }

    static modal = async (title: string, fields: any) => {
        var modal: any;
        var stack = await Stack.push(<>
            <Modal className="modal-adjustment full" ref={(ref) => modal = ref} content={<FullNamePopUp modal={() => modal} Title={title} Fields={fields}/>} />
        </>);
        setTimeout(async () => (await modal.onDidDismiss(), stack.pop()));
        return modal;
    }
}
