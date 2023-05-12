import { IonCol, IonContent, IonIcon, IonInput, IonItem, IonRefresher, IonRefresherContent, IonRow, IonSelect, IonSelectOption, IonSpinner, IonTextarea as ionTextarea, NavContext } from '@ionic/react';
import moment from 'moment';
import React from 'react';
import { rest } from '../../+service/rest.service';
import { app, OnDidBackdrop } from '../../../../tools/app';
import { escape, tryExtractLinks, tryLinks } from '../../../../tools/global';
import ImgPreloader from '../../../../tools/components/+common/img-preloader';
import Layout from '../../../../tools/components/+common/layout';
import PhotoViewerPopUp from '../../../../tools/components/+common/modal/photo-viewer.popup';
import Stack, { Alert, Modal } from '../../../../tools/components/+common/stack';
import { device } from '../../../../tools/plugins/device';
import { classNames, Input, styles } from '../../../../tools/plugins/element';
import { toast } from '../../../../tools/plugins/toast';
import FilteringView from '../../component/common/filtering.view';
import { jUser, jUserModify } from '../../user-module';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { ImagePicker } from '@ionic-native/image-picker';
import { keyboard } from '../../../../tools/plugins/keyboard';
import { Plugins, KeyboardInfo } from '@capacitor/core';
import { stomp } from '../../+service/stomp.service';
import { mtCb } from '../../../../tools/plugins/static';
import { timeout } from '../../../../tools/plugins/delay';
import { images } from 'ionicons/icons';
import styled from 'styled-components';
import { multiState } from '../../../../tools/plugins/react';

const { LocalNotifications } = Plugins;
const { Object, $ }: any = window;

export default class ChatBoxPopUp extends React.Component<{ modal: Function }> implements OnDidBackdrop {
    state: any = {}
    componentWillMount = () => {
        app.component(this);
        const { prop } = this;
        prop.IsDevice = !device.isBrowser;
        this.setState({ prop });
    }

    dismiss = (data: any = undefined) => this.props.modal().dismiss(data);
    hClose = () => this.dismiss();

    subs: any = {};
    msg: any = {};
    input: any = {};
    prop: any = { IsFiltering: true };
    list: any = [];
    opts: any = {
        camera: {
            quality: 50,
            targetHeight: 600,
            targetWidth: 600,
            destinationType: Camera.DestinationType.DATA_URL,
            encodingType: Camera.EncodingType.JPEG,
            mediaType: Camera.MediaType.PICTURE,
            saveToPhotoAlbum: false,
            correctOrientation: true,
        },
        imagePicker: {
            quality: 100,
            outputType: 1,
            maximumImagesCount: 1,
        },
        ImagePickerOpts: [
            { value: '1', name: 'Pick Image', icon: 'images', method: () => this.pickImage() },
            { value: '2', name: 'Take Photo', icon: 'camera', method: () => this.takePhoto() },
        ],
        UploadOpts: {},
    };
    componentDidMount = () => {
        this.stompReceivers();
        this.setUpChat();
        this.prop.IsReady = true;
    }
    componentWillUnmount() {
        Object.values(this.subs).map((m: any) => m.unsubscribe());
    }
    onDidBackdrop() {
        this.dismiss();
        return false;
    }

    private stompReceivers() {
        this.subs.sub3 = stomp.subscribe('/chat/pub', (json: any) => this.receivedChat(json));
    }
    private setUpChat() {
        Object.rcopy(this.prop, chatBox.info);
        if (this.prop.IsLoaded) {
            this.list = chatBox.list;
            this.prop.IsEmpty = (this.list.length < 1);
            this.setState({ list: this.list, prop: this.prop });
            return setTimeout(() => {
                this.prop.IsFiltering = false;
                this.setState({ prop: this.prop });
                this.hScrollMessages();
            }, 125);
        }
        return this.performRequestDetailDelay({ IsReset: true }, () => setTimeout(() => this.hScrollMessages(), 125));
    }
    private receivedChat(data: any) {
        if (data.type == 'public') {
            var content = data.content;
            if (!content) return;
            var message = (content.Messages[0] || null);
            if (!message) return;
            this.list = chatBox.list;
            var found = this.list.find((i: any) => i.ID == message.ID);
            if (!found) {
                this.list.unshift(chatBox.details(message));
                this.prop.IsEmpty = (this.list.length < 1);
            }
            this.setState({ list: this.list, prop: this.prop });
        }
    }


    hState = (ev: any, key: string) => {
        this.msg[key] = null;
        this.input[key] = ev.detail.value;
        this.setState({ msg: this.msg, input: this.input });
    }


    hSend = () => {
        if (!this.prop.ChatKey)
            return toast('Please wait for a second...');
        if (!!this.opts.disabledSend) return;
        if (!this.isValidEntries()) return;
        this.tbMessage.setFocus();
        this.opts.disabledSend = true;
        const input = Object.rcopy({}, this.input, {
            isSending: true, Type: 'MSG',
            DateSend: moment(new Date()).format('YYYY-MM-DDTHH:mm:ss'),
            isSend: true, IsYou: true,
            Message: (this.input.Message || '').trim(),
        });
        const copy = chatBox.details(Object.rcopy(input));
        this.list.unshift(copy);
        this.prop.IsEmpty = (this.list.length < 1);
        setTimeout(() => this.performSubmit(input, copy));
        this.input.Message = '';
        const $el = $(this.lstMessages);
        setTimeout(() => $el.scrollTop(!this.prop.IsDevice ? 0 : $el[0].scrollHeight));
        this.opts.disabledSend = false;
        this.setState({ list: this.list, input: this.input });
        this.multiState({ changes: true });
    }

    private isValidEntries(): boolean {
        var isValid = true;

        var message = (this.input.Message || '').trim();
        if (!message) {
            toast('Please enter message');
            isValid = false;
        }
        if (isValid) {

        }
        this.input.IsValid = isValid;
        return isValid;
    }

    private iMsgNotSeen: any;
    hMessage = (item: any) => {
        if (item.isFailed) {
            this.iMsgNotSeen = item;
            this.ddMsgNotSeen.open();
            return;
        }
        if (item.isSending) return;
        item.showDetail = !item.showDetail;
        this.setState({ list: this.list });
    }
    hMsgNotSeen = (ev: any) => {
        var value = (ev.detail || {}).value;
        if (!value) return;
        var item = this.iMsgNotSeen;
        if (value == 'delete')
            return this.performDeleteMessage(item);
        else if (value == 'resend')
            return this.performResendMessage(item);
    }

    hPullRefresh = (ev: any) => {
        if (!this.prop.showRefresher && this.prop.IsLoaded)
            return ev.detail.complete();
        var cb = () => (ev.detail.complete(), setTimeout(() => {
            this.prop.refreshingRefresher = false;
            this.setState({ prop: this.prop });
            this.hScrollMessages();
        }, 250));
        this.prop.refreshingRefresher = true;
        this.setState({ prop: this.prop });
        if (!this.prop.IsLoaded)
            return this.performRequestDetailDelay({ IsReset: true, IsFiltering: true }, cb);
        else this.performRequestDelay({ IsFiltering: true }, cb);
    }
    hScrollMessages = () => {
        if (!this.prop.IsLoaded) return;
        if (this.subs.scrolling) this.subs.scrolling.unsubscribe();
        this.subs.scrolling = timeout(() => {
            var $el = $(this.lstMessages);
            var position = ($el.find('>:last').position() || { top: 0 });
            this.prop.showRefresher = (position.top > -60);
            this.setState({ prop: this.prop });
        }, 35);
    }
    hPreviewImage = async (ev: any, item: any) => {
        ev.preventDefault();
        ev.stopPropagation();
        const modal = await PhotoViewerPopUp.modal('Preview', (item.isSending ? item.Image : item.MediaUrl));
        await modal.present();
    }

    hImagePicker = () => {
        if (!this.prop.ChatKey)
            return toast('Please wait for a second...');
        this.ddImagePicker.open();
    }
    hSelectedImageOption = (ev: any) => {
        var result = (ev.detail || {}).value;
        if (!result) return;
        setTimeout(() => result.method(), 275);
    }
    pickImage() {
        ImagePicker.getPictures(this.opts.imagePicker).then((results) => {
            if (!results[0] || results[0].length < 15) return;
            this.setSelectedPicker(results[0]);
        }, (err) => {
            if (err == 'cordova_not_available')
                err = 'Function not supported in this browser!';
            Alert.showWarningMessage(err);
        });
    }
    takePhoto() {
        Camera.getPicture(this.opts.camera).then((imageData) => {
            this.setSelectedPicker(imageData);
        }, (err) => {
            if (err == 'cordova_not_available')
                err = 'Function not supported in this browser!';
            Alert.showWarningMessage(err);
        });
    }
    setSelectedPicker(imgBase64: string) {
        var input = {
            isSending: true, Type: 'IMG', IsImage: true, Message: imgBase64,
            DateSend: moment(new Date()).format('YYYY-MM-DDTHH:mm:ss'),
            isSend: true, IsYou: true,
            Image: ('data:image/jpeg;base64,' + imgBase64),
        };
        this.list.unshift(input);
        this.prop.IsEmpty = (this.list.length < 1);
        this.setState({ list: this.list, prop: this.prop });
        this.performSubmit(input, input);
    }

    private performDeleteMessage(input: any) {
        Alert.swal({
            title: 'Confirmation',
            text: 'Are you sure you want to delete message?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Delete!',
            cancelButtonText: 'Cancel',
            allowOutsideClick: false,
            backdropDismiss: false,
            confirmButtonColor: "#218838",
            cancelButtonColor: "#c82333",
            reverseButtons: true,
        }, (res: any) => {
            if (res.isConfirmed) {
                var index = this.list.indexOf(input);
                this.list.splice(index, 1);
                this.prop.IsEmpty = (this.list.length < 1);
                this.setState({ prop: this.prop, list: this.list });
                toast('Message successfully deleted');
            }
        });
    }
    private performResendMessage(input: any) {
        input.isFailed = false;
        this.setState({ list: this.list });
        this.performSubmit(input, input);
    }
    private performSubmit(input: any, message: any) {
        rest.post('/app/chat/t/' + this.prop.ChatKey, input).subscribe(async (res: any) => {
            if (res.Status != 'error') {
                var found = this.list.find((f: any) => f.ID == res.ID);
                if (!found) {
                    chatBox.details(Object.rcopy(message, res, { isSending: false }));
                    this.setState({ list: this.list });
                    return;
                }
                var index = this.list.indexOf(message);
                if (!(index < 0)) {
                    this.list.splice(index, 1);
                    chatBox.details(Object.rcopy(found, res));
                }
                this.setState({ list: this.list });
            }
        }, (err: any) => {
            message.isFailed = true;
            this.setState({ list: this.list });
            toast('Please try again');
        });
    }

    private performRequestDetailDelay(filter: any, callback: Function = mtCb, delay: number = 175) {
        if (this.subs.t1) this.subs.t1.unsubscribe();
        this.prop.IsFiltering = !filter.IsFiltering;
        this.setState({ prop: this.prop });
        this.subs.t1 = timeout(() => this.performRequestDetail(filter, callback), delay);
    }
    private performRequestDetail(filter: any, callback: Function = mtCb) {
        if (!this.subs) return;
        if (this.subs.s1) this.subs.s1.unsubscribe();
        this.subs.s1 = rest.post('/app/chat/public', filter).subscribe(async (res: any) => {
            this.prop.IsFiltering = false;
            if (res.Status != 'error') {
                if (chatBox.info.IsLoaded) {
                    Object.rcopy(this.prop, chatBox.info);
                    this.list = chatBox.list;
                } else {
                    res.IsLoaded = true;
                    var messages = res.Messages;
                    delete res.Messages;
                    Object.rcopy(this.prop, chatBox.setInfo(res));
                    this.list = chatBox.setList(messages.map((o: any) => chatBox.details(o)));
                }
                this.prop.IsEmpty = (this.list.length < 1);
                if (callback != null) callback();
                this.setState({ list: this.list, prop: this.prop });
                return;
            }
        }, (err: any) => {
            toast('Failed to retrieve data, Please try again');
            this.prop.IsFiltering = false;
            this.prop.IsEmpty = true;
            if (callback != null) callback(err);
            this.setState({ prop: this.prop });
        });
    }

    private performRequestDelay(filter: any, callback: Function = mtCb, delay: number = 175) {
        if (this.subs.t2) this.subs.t2.unsubscribe();
        this.prop.IsFiltering = !filter.IsFiltering;
        this.setState({ prop: this.prop });
        this.subs.t2 = timeout(() => this.performRequest(filter, callback), delay);
    }
    private performRequest(filter: any, callback: Function = mtCb) {
        if (!this.subs) return;
        if (this.subs.s2) this.subs.s2.unsubscribe();
        var id = ((this.list[this.list.length - 1] || {}).ID || 0);
        this.subs.s2 = rest.post('/app/chat/t/' + this.prop.ChatKey + '/' + id, filter).subscribe(async (res: any) => {
            this.prop.IsFiltering = false;
            if (res.Status != 'error') {
                this.list = chatBox.list;
                var lastID = ((this.list[this.list.length - 1] || {}).ID || 0);
                if (lastID == id) {
                    res.forEach((o: any) => this.list.push(chatBox.details(o)));
                    this.prop.IsEmpty = (this.list.length < 1);
                }
                if (callback != null) callback();
                this.setState({ list: this.list, prop: this.prop });
                return;
            }
        }, (err: any) => {
            toast('Failed to retrieve data, Please try again');
            this.prop.IsFiltering = false;
            this.prop.IsEmpty = true;
            if (callback != null) callback(err);
            this.setState({ prop: this.prop });
        });
    }
    //
    multiState = multiState();
    elIonSelect1: any = React.createRef();
    get ddMsgNotSeen() { return this.elIonSelect1.current; }
    elIonSelect2: any = React.createRef();
    get ddImagePicker() { return this.elIonSelect2.current; }
    lstMessages: any = null;
    elIonTextarea: any = React.createRef();
    get tbMessage() { return this.elIonTextarea.current; }
    render() {
        const { multiState } = this;
        const { filter = {}, prop = {}, } = this.state;
        const { msg = {}, input = {}, } = this.state;
        const { list = [] } = this.state;
        return (<>
            <div className="vertical" style={styles('height:100%')}>
                <div className="modal-container" style={styles('height:675px;max-height:95%;background-color:white;border-radius:15px;')}>
                    <div style={styles('padding-top:5px')}>
                        <div className="row m-0 header">
                            <div className="col-10"><b>Public Chat</b></div>
                            <div className="col-2 p-0 btn-close" style={styles('text-align:right;right:5px')} onClick={this.hClose}></div>
                        </div>
                    </div>
                    <Layout full style={styles('height:calc(100% - 30px)')}>
                        <Layout auto>
                            <div className="row m-0" style={styles('position:relative;height:100%')}> {/* <!--style="position: relative;height:100%;" -->*/}
                                {/*<!--<div className="col-12 p-0 horizontal" style="position: absolute;top: 0;height: 100%;" *ngIf="props.IsEmpty">
                        <div className="vertical"><img src="./assets/img/page_empty.png" style="width: 150px;"></div>
                    </div>-->*/}
                                <FilteringView visible={prop.IsFiltering} />
                                {!prop.IsReady ? null : <>
                                    <IonContent scrollY>
                                        <IonRefresher slot="fixed" onIonRefresh={this.hPullRefresh} disabled={!(prop.showRefresher || prop.refreshingRefresher || !prop.IsLoaded || prop.IsEmpty)}>
                                            <IonRefresherContent />
                                        </IonRefresher>
                                        <MessageScrollView ref={(ref) => this.lstMessages = ref} onScroll={this.hScrollMessages}>
                                            {list.map((item: any, idx: any) => <>
                                                <Item key={idx} item={item} onClick={() => this.hMessage(item)} onImgClick={(ev) => this.hPreviewImage(ev, item)} />
                                            </>)}
                                        </MessageScrollView>
                                    </IonContent>
                                </>}
                            </div>
                        </Layout>
                        <Layout>
                            <div className="horizontal" style={styles('padding:5px 0px;min-height:45px')}>
                                <div className="vertical" onClick={this.hImagePicker}>
                                    <IonIcon icon={images} style={styles('font-size:25px;width:40px')} />
                                </div>
                                <div style={styles('width:100%;background-color:rgba(128,128,128,0.5);border-radius:5px;padding:5px 0px;')}>
                                    <MsMessageInput instance={this} />
                                </div>
                                <div className="vertical" style={styles('padding:0px 10px')} onClick={this.hSend}> {/*(click)="handlelSend()"*/}
                                    <button style={styles('background-color:transparent;color:gray;font-weight:bold;font-size:15px')}>SEND</button>
                                </div>
                            </div>
                        </Layout>
                    </Layout>
                </div>
            </div>
            <div style={styles('visibility:hidden;height:0px;width:0px')}>
                <Input ion node={(handle) => <>
                    <IonSelect
                        interfaceOptions={{ header: 'Select options:' }}
                        interface="action-sheet"
                        {...handle({ ref: this.elIonSelect1, onChange: this.hMsgNotSeen, clearAfter: true })}>
                        <IonSelectOption value='resend'>Resend</IonSelectOption>
                        <IonSelectOption value='delete'>Delete</IonSelectOption>
                    </IonSelect>
                </>} />

                <Input ion node={(handle) => <>
                    <IonSelect
                        interfaceOptions={{ header: 'Select options:' }}
                        interface="action-sheet"
                        {...handle({ ref: this.elIonSelect2, onChange: this.hSelectedImageOption, clearAfter: true })}>
                        {this.opts.ImagePickerOpts.map((opt: any) =>
                            <IonSelectOption value={opt}>{opt.name}</IonSelectOption>
                        )}
                    </IonSelect>
                </>} />

            </div>
        </>);
    }

    static modal = async () => {
        var modal: any;
        var stack = await Stack.push(<>
            <Modal className="modal-adjustment no-bg w-100p h-100p" ref={(ref) => modal = ref} content={<ChatBoxPopUp modal={() => modal} />} />
        </>);
        setTimeout(async () => (await modal.onDidDismiss(), stack.pop()));
        return modal;
    }
}

class MsMessageInput extends React.Component<{ instance: ChatBoxPopUp }>{
    state: any = {};
    shouldComponentUpdate = () => false;
    render() {
        const { instance } = this.props;
        return (<>
            <MessageInput instance={instance} ref={instance.multiState(1, ({ changes }) => ({ changes }))} />
        </>);
    }
}
class MessageInput extends React.Component<{ instance: ChatBoxPopUp }>{
    state: any = {};
    render() {
        const { instance } = this.props;
        const { input } = instance;
        return (<>
            <Input ion node={(handle) => <>
                <IonTextarea ref={instance.elIonTextarea} rows={1} autoGrow maxlength={250}
                    value={input.Message} {...handle({ onChange: (ev) => instance.hState(ev, 'Message') })} />
            </>} />

        </>);
    }
}

const Item: React.FC<{ item: any, onClick?: React.MouseEventHandler, onImgClick?: React.MouseEventHandler }> = ({ item, onClick, onImgClick }) => {
    return (<>
        <div style={styles('padding:0.5px 0px')} onClick={onClick}>
            {!item.IsYou ? <>
                <div style={styles('margin-right:15%;width:calc(100% - 15%)')}>
                    <div style={styles('display:flex')}>
                        <div style={styles('width:50px;height:40px;position:relative')}>
                            <ImgPreloader className="brand-image img-circle elevation-1 img-fit" style={styles('width:40px;height:40px')}
                                placeholder='./assets/img/icon_blank_profile.png' src={item.ProfileImageUrl} />
                        </div>
                        <div style={styles('width:calc(100% - 50px);color:white')}>
                            <div style={styles('font-weight:500;font-size:12px;color:black')}>{item.DisplayName}</div>
                            {!item.IsImage ? <>
                                <div style={styles('max-width:100%;padding:2.5px 10px;border-radius:20px;border:1.5px solid rgba(128, 128, 128, 0.75);border-top-left-radius:0px;font-size:14px;display:inline-block', 'color:black')}
                                    dangerouslySetInnerHTML={{ __html: item.Message }}>
                                    {/*[innerHTML]="|safe:'html'" {item.Message}*/}
                                </div>
                            </> : <>
                                <div style={styles('display:inline-block')} onClick={onImgClick}>
                                    <ImgPreloader style={styles('max-height:150px')}
                                        placeholder='./assets/img/anim_spinner.gif' src={item.MediaUrl}
                                    />
                                </div>
                            </>}
                            {!item.showDetail ? null : <>
                                <div style={styles('margin-left:2.5%', 'font-size:8px;color:rgba(0,0,0,0.5)')}>{item.DateSendName}</div> {/*font-size:10px*/}
                            </>}
                        </div>
                    </div>
                </div>
            </> : <>
                <div style={styles('display:flex;position:relative')}>
                    <div style={styles('flex-grow:1')}></div>
                    <div style={styles('margin-left:15%;width:calc(100% - 15%)')}>
                        <div style={styles('margin-right:1.5%')}>
                            <div style={styles('display:flex')}>
                                <div style={styles('flex-grow:1')}></div>
                                {!item.IsImage ? <>
                                    <div style={styles('max-width:100%;padding:2.5px 10px;border-radius:20px;border:1px solid rgba(128, 128, 128, 0.75);border-top-right-radius:0px;font-size:14px;display:inline-block', 'background-color:#008577;color:white',
                                        { 'background-color': (item.isSending ? (!item.isFailed ? '#005985' : 'rgba(255,0,0,0.85)') : '#008577') })} dangerouslySetInnerHTML={{ __html: item.Message }}>
                                        {/*[innerHTML]="|safe:'html'" {item.Message}   */}
                                    </div>
                                </> : <>
                                    <div onClick={onImgClick}>
                                        {!item.isSending ? <>
                                            <ImgPreloader style={styles('max-height:200px')}
                                                placeholder='./assets/img/anim_spinner.gif' src={item.MediaUrl} />
                                        </> : <>
                                            <img style={styles('max-height:200px')} src={item.Image} />
                                        </>}
                                    </div>
                                </>}
                            </div>
                            <div style={styles('display:flex;height:auto;padding:0px 5px')}>
                                <div style={styles('flex-grow:1')}></div>
                                <div style={styles('margin-right:2.5%;font-size:10px')}>
                                    {!(!item.isSending && item.showDetail) ? null : <>
                                        <span style={styles('font-size:8px;color:rgba(0,0,0,0.5)')}>{item.DateSendName}</span>
                                    </>}
                                    {!item.isSending ? null : <>
                                        {!item.isFailed ? <>
                                            <span>Sending...</span>
                                        </> : <>
                                            <span style={styles('color:red')}>Message not seen</span>
                                        </>}
                                    </>}
                                </div>
                            </div>
                        </div>
                    </div>
                    {/*
            {!item.isFailed?null:<>
                <div style={styles('width:100%;position:absolute;top:0;height:100%')} onClick={onClick}>&nbsp;</div> 
            </>}
            */}
                </div>
            </>}
        </div>
    </>);
};



export const chatBox = (() => {
    var isDevice: boolean = !device.isBrowser;
    const WidgetID = ('101' + String(+(new Date())).substr(0, 5));
    const u: any = {};
    jUserModify(async () => Object.rcopy(u, (await jUser()) || {}), false);
    const App = {
        info: ({} as any),
        list: ([] as any),
        refresh: () => App.info.IsLoaded = false,
        setList: (list: any) => (App.list.length = 0, App.list.unshift.apply(App.list, list), list),
        setInfo: (info: any) => Object.rcopy(App.info, info),
        details: details,
        widget: widget,
    };
    return App;
    function details(item: any, plain: boolean = false) {
        item.DateSendName = moment(item.DateSend).format('MMM DD, YYYY hh:mm:ss a');
        var message = (item.Message || '');
        var extracts = tryExtractLinks(message);
        //if(extracts.length==0) extracts.push(message);
        if (!plain) item.Message = extracts.map((m: any) => (typeof (m) == 'string' ? escape(m) : app.link(m.link)))
            .join('').replace(/(\n)+/g, '<br/>').trim();
        if (!item.Message) item.Message = '&nbsp;';
        item.IsYou = (!!item.IsYou || (item.SenderID || '').indexOf(u.AccountID) > -1);
        if (!!item.ProfileImageUrl && !item.ProfileImageUrl.startsWith('http')) item.ProfileImageUrl = rest.httpFullname(item.ProfileImageUrl);
        if (!!item.MediaUrl && !item.MediaUrl.startsWith('http')) item.MediaUrl = rest.httpFullname(item.MediaUrl);
        return item;
    }
    function widget(message: any) {
        var item = details(message, true);
        //https://github.com/katzer/cordova-plugin-local-notifications
        //
        var person = (item.IsYou ? 'You' : item.DisplayName);
        var body = (item.Message || '').replace(/(<br\/>)+/g, '');
        body = (body.length > 25 ? body.substr(0, 25).trim() + ' ...' : body);
        if (item.IsImage || item.IsFile)
            body = body.replace('{0}', person); //body.replace('{0}', item.DisplayName);
        else body = (person + ': ' + body);
        //else body = (item.IsYou?'You':item.DisplayName) + ': ' + body;
        if (item.IsPublicChat) {
            var schedId = parseInt(WidgetID + String(item.ChatID)); //+ (item.ID%6)
            LocalNotifications.schedule({
                notifications: [{
                    id: schedId,
                    smallIcon: 'icon_chat',
                    title: 'Public Chat',
                    body: body, //[{message:body, person:person}]
                }]
            });
        }
    }
})();

//styles
const IonTextarea = styled(ionTextarea)`
margin:0px;
padding:0px;
max-height:92px;
min-height:24px;
>div{
    min-height: 24px !important;
    >textarea{
        min-height: 24px !important;
        padding: 0px 8px !important;
    }
}
`;
const MessageScrollView = styled.div`
height:100%;
overflow-x: hidden; 
overflow-y: auto;
display:flex;
display:-webkit-box;
display:-ms-flexbox;
display:-webkit-flex;
flex-direction:column-reverse;
-webkit-box-orient:horizontal;
-webkit-flex-direction:column-reverse;
-ms-flex-direction:column-reverse;
flex: 1; 
-webkit-flex: 1;
-moz-box-flex: 1;
-ms-flex: 1;
-webkit-box-flex: 1;
`;