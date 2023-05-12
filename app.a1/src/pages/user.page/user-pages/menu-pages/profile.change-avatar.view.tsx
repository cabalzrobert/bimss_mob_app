import { IonContent, IonItem, IonRippleEffect, IonSelect, IonSelectOption, IonSpinner } from '@ionic/react';
import React from 'react';
import Layout from '../../../../tools/components/+common/layout';
import { mtCb, mtObj } from '../../../../tools/plugins/static';
import TextFit from '../../../../tools/components/+common/text-fit';
import { numberWithComma, tryBase64ImageFromURL } from '../../../../tools/global';
import { classNames, Input, styles } from '../../../../tools/plugins/element';
import UserPager from '../../user-pager';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { ImagePicker } from '@ionic-native/image-picker';
import { Alert } from '../../../../tools/components/+common/stack';
import { app } from '../../../../tools/app';
import MenusView from './menu.menus.view';
import { rest } from '../../../+app/+service/rest.service';
import { jUser } from '../../../+app/user-module';
import { Crop } from '@ionic-native/crop';
import { Base64 } from '@ionic-native/base64';
import ImgPreloader from '../../../../tools/components/+common/img-preloader';
import { toast } from '../../../../tools/plugins/toast';
import Recycler from '../../../../tools/components/+feature/recycler';
import RecyclerStorage from '../../../intro.page/recycler-storage';

const { Object }: any = window;

export default class ChangeAvatarView extends React.Component {
    shouldComponentUpdate = () => false;
    render() {
        return (<>
            <Recycler storage={RecyclerStorage.instance} from={ViewHolder} />
        </>);
    }
}

export class ViewHolder extends React.Component {
    state: any = {};
    get pager() { return UserPager.instance.pager; }
    componentWillMount = () => this.willMount(false);
    prop: any = {};
    input: any = {};
    subs: any = {};
    opts: any = {
        camera: {
            quality: 50,
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
    imgs: any = [
        [
            { img: './assets/img/img_avatar_rooster.png' },
            { img: './assets/img/img_avatar_carabao.png', },
            { img: './assets/img/img_avatar_pig.png', },
        ],
        [
            { img: './assets/img/img_avatar_tarsier.png', },
            { img: './assets/img/img_avatar_dog.png', },
            { img: './assets/img/img_avatar_quail.png', },
        ],
        [
            { img: './assets/img/img_avatar_eagle.png', },
            { img: './assets/img/img_avatar_horse.png', },
            { img: './assets/img/img_avatar_upload.png', isUpload: true },
        ],
    ];
    willMount = (didMount = true) => {
        const { imgs } = this;
        imgs[2][2].img = './assets/img/img_avatar_upload.png';
        const prop = (this.prop = { didMount: didMount });
        this.setState({ prop, imgs });
    }
    didMount = () => {
        if (!this.prop.didMount) return;
        this.opts.UploadOpts = (this.imgs[2][2] || {});
        this.hSelectedAvatar(null, this.imgs[0][0]);
    }
    willUnmount = () => {
        Object.values(this.subs).map((m: any) => m.unsubscribe());
    }
    //
    private performSaveLocal() {
        jUser({ ImageUrl: this.input.ImageUrl }, true);
    }
    hBackButton = () => {
        this.pager.back();
    }
    hSelectedAvatar = (ev: any, item: any) => {
        if (item.isUpload) {
            this.performPickImage();
            if (!item.hasPicked) return;
        }
        return this.changeFocusItem(item);
    }
    setSelectedPicker(imgBase64: string) {
        var item = this.opts.UploadOpts;
        item.img = ('data:image/jpeg;base64,' + (item.pickImg = imgBase64));
        item.hasPicked = true;
        return this.changeFocusItem(item);
    }
    private currentSelected: any;
    changeFocusItem(item: any) {
        if (this.currentSelected)
            this.currentSelected.isSelected = false;
        item.isSelected = true;
        this.currentSelected = item;
        this.setState({ imgs: this.imgs });
    }

    performPickImage() {
        //console.log(['upload img']);
        this.imagePickerOpts.open();
    }

    hConfirm = async () => {
        if (!await this.isValidEntries()) return;
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

    handleClickImagePicker() {
        this.imagePickerOpts.open();
    }
    hImageOption = (ev: any) => {
        var result = (ev.detail || {}).value;
        if (!result) return;
        setTimeout(() => result.method(), 275);
    }
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

    private performSubmit() {
        rest.post('profile/image', this.input).subscribe(async (res: any) => {
            if (res.Status == 'ok') {
                this.input.ImageUrl = res.ImageUrl;
                this.performSaveLocal();
                return Alert.showSuccessMessage(res.Message, () => this.goToGameProfile());
            }
            Alert.showErrorMessage(res.Message);
        }, (err: any) => {
            Alert.showWarningMessage('Please try again');
        });
    }
    private async isValidEntries() {
        var isValid = true;
        var imgUrl = '';
        if (!this.currentSelected.isUpload) {
            imgUrl = app.hostFile(this.currentSelected.img.replace('./', ''));
            this.input.Img = await tryBase64ImageFromURL(imgUrl);
        } else {
            this.input.Img = this.currentSelected.pickImg;
        }

        if (!this.input.Img) {
            if (!!imgUrl) {
                Alert.showWarningMessage('error to load selected image : ' + imgUrl);
            }
            isValid = false;
        }
        return isValid;
    }
    private goToGameProfile() {
        this.pager.backTo(MenusView, true);
    }

    elIonSelect: any = React.createRef();
    get imagePickerOpts() { return this.elIonSelect.current; }
    render() {
        const { input = {}, imgs = [] } = this.state;
        return (<>
            <Layout full>
                <Layout>
                    <div className="row m-0 toolbar-panel">
                        <div className="vertical arrow-back" onClick={this.hBackButton}></div>
                        <div className="col-4 p-0 vertical toolbar-parent" onClick={this.hBackButton}>Game Profile</div>
                        <div className="col-7 p-0 toolbar-title vertical"><div><TextFit text="Change Avatar" /></div></div>
                    </div>
                </Layout>
                <Layout auto>
                    <IonContent scrollY>
                        <div className='row'>
                            <div className="col-12" style={styles('text-align:center;color:#fefed1;font-size:20px;margin-top:10px')}>
                                Choosen or Upload<br />
                                an Avatar
                            </div>
                        </div>
                        <div className='row'>
                            <div className="col-12">
                                <div className="horizontal choose-img-container">
                                    {imgs.map(((cols: any) => <>
                                        <div className="panels">
                                            {cols?.map(((col: any) => <>
                                                <div className={classNames('panel', { 'active': col.isSelected })} onClick={(ev) => this.hSelectedAvatar(ev, col)}>
                                                    <ImgPreloader className="brand-image img-circle elevation-1 target" style={styles('width:100%;height:100%;background-color:#eceff1')}
                                                        src={col.img} placeholder='data:image/png;charset=utf-8;base64,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' />
                                                </div>
                                            </>))}
                                        </div>
                                    </>))}
                                </div>
                            </div>
                        </div>
                        <div className='row'>
                            <div className="col-12" style={styles('margin:20px 0px')}>
                                <div className="horizontal">
                                    <div className="btn-green" style={styles('width:200px')} onClick={this.hConfirm}>APPLY</div>
                                </div>
                            </div>
                        </div>
                    </IonContent>
                </Layout>
            </Layout>
            <div style={styles('visibility:hidden;height:0px;width:0px')}>
                <Input ion="popup" node={(handle) => <>
                    <IonSelect interface="action-sheet"
                        interfaceOptions={{ header: 'Select options:' }}
                        {...handle({ ref: this.elIonSelect, onChange: this.hImageOption, clearAfter: true })}>
                        {this.opts.ImagePickerOpts.map((opt: any, idx: any) =>
                            <IonSelectOption key={idx} value={opt}>{opt.name}</IonSelectOption>
                        )}
                    </IonSelect>
                </>} />

            </div>
        </>);
    }
}