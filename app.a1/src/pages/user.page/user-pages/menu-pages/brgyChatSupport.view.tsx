import { IonButtons, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonList, IonMenuButton, IonRefresher, IonRefresherContent, IonRippleEffect, IonSearchbar, IonSelect, IonSelectOption, IonSpinner, IonTextarea, IonTitle, IonToolbar } from '@ionic/react';
import React from 'react';
import styled from 'styled-components';
import Layout from '../../../../tools/components/+common/layout';
import FilteringView from '../../../+app/component/common/filtering.view';
import { mtCb, mtObj, subscribe } from '../../../../tools/plugins/static';
import PhotoViewerPopUp from '../../../../tools/components/+common/modal/photo-viewer.popup';
import { classNames, clearAfter, Input, styles } from '../../../../tools/plugins/element';
import { timeout } from '../../../../tools/plugins/delay';
import { rest } from '../../../+app/+service/rest.service';
import { toast } from '../../../../tools/plugins/toast';
import ImgPreloader from '../../../../tools/components/+common/img-preloader';
import { device } from '../../../../tools/plugins/device';
import { stomp } from '../../../+app/+service/stomp.service';
import PersonnalChatBoxPopUp, { personnalchatBox } from '../../../+app/modal/+feature/personnalchat-box.popup';
import YtPlayerView from '../../../../tools/components/+feature/yt-player.view';
import { jCompany, jCompanyModify, jUser, jUserModify } from '../../../+app/user-module';
import { OnSwapFocus, OnSwapLeave } from '../../../../tools/components/+feature/swap-pager';
import Recycler, { rgsMount } from '../../../../tools/components/+feature/recycler';
import RecyclerStorage from '../../../intro.page/recycler-storage';
import TextFit from '../../../../tools/components/+common/text-fit';
import UserPager from '../../user-pager';
import { SuperTabButton } from '@ionic-super-tabs/react';
import { arrowBackOutline, headsetOutline, listOutline } from 'ionicons/icons';
import { app, OnDidBackdrop } from '../../../../tools/app';
import { keyboard } from '../../../../tools/plugins/keyboard';
import Stack, { Modal } from '../../../../tools/components/+common/stack';
import { KeyboardInfo } from '@capacitor/core';
import NotFound2View from '../../../+app/component/common/not-found.view';
import { storage } from '../../../../tools/plugins/storage';

const { Object, $ }: any = window;

export default class ChatSupportView extends React.Component {

    shouldComponentUpdate = () => false;
    holder: ViewHolder = (null as any);
    render() {
        return (<>
            <Recycler storage={RecyclerStorage.instance} from={ViewHolder} bind={(ref) => this.holder = ref} />
        </>);
    }
}

export class ViewHolder extends React.Component {
    prop: any = {};

    input: any = {};
    get pager() { return UserPager.instance.pager; }
    componentWillMount = () => this.willMount(false);
    willMount = (didMount = true) => (this.prop.didMount = didMount);
    //
    rgsMount = rgsMount();
    shouldComponentUpdate = () => false;

    hState = (ev: any, key: string) => {
        if (!!this.prop.lockInput) return;
        //this.msg[key] = null;
        this.input[key] = ev.detail.value;
        this.setState({ input: this.input });
    }

    elIonSelect: any = React.createRef();
    get memberOpts() { return this.elIonSelect.current; }
    render() {
        const { rgsMount, input } = this;

        //const { input = {} } = this.state;
        return (<>
            <Layout full>
                <PublicChatPanel instance={this} ref={rgsMount()} RequestID={this.input.RequestID} Operator={this.input.Operator} />

            </Layout>

        </>);
    }
}


class PublicChatPanel extends React.Component<{ instance: ViewHolder, RequestID: any, Operator: any }> {
    get pager() { return UserPager.instance.pager; }
    state: any = {};
    componentWillMount = () => this.willMount();
    prop: any = {};
    listpersonalchat: any = [];
    info: any = {};
    subs: any = {};
    bryoptr: any = {};
    input: any = {};
    willMount = () => {

        const { prop: { didMount } } = (this.props.instance);
        const prop: any = (this.prop = { didMount: didMount, IsFiltering: true });
        const info = (this.info = {});
        const listpersonalchat = (this.listpersonalchat = []);
        const input = (this.input = {});
        prop.IsDevice = !device.isBrowser;

        this.setState({ prop, info, listpersonalchat, input });
    }
    didMount = () => {
        if (!this.prop.didMount) return;
        this.stompReceivers();
        rest.ready(() => this.setUpChat());
    }
    willUnmount = () => {
        Object.values(this.subs).map((m: any) => m.unsubscribe());
    }

    setOperator(RequestID: any, Operator: any) {
        this.bryoptr.RequestID = RequestID;
        this.bryoptr.Operator = Operator;
        this.setState({ bryoptr: this.bryoptr });
        return this;
    }

    private stompReceivers() {
        this.subs.connect = stomp.subscribe('#connect', () => this.connected());
        this.subs.ws1 = stomp.subscribe('/chat/pub', (json: any) => this.receivedChat(json));
        this.subs.ws1 = stomp.subscribe('/chat', (json: any) => this.receivedChat(json));
    }

    private async connected() {
        //this.performRequestDelay({ IsReset: true });
    }
    private receivedChat(data: any) {
        console.log('receivedChat');
        console.log(data);
        if (data.type == 'personal') {
            var content = data.content;
            var message = (content.Messages[0] || null);
            if (!message) return;
            this.listpersonalchat = personnalchatBox.list;
            var found = this.listpersonalchat.find((i: any) => i.ID == message.ID);
            if (!found) {
                this.listpersonalchat.unshift(personnalchatBox.details(message));
                this.prop.IsEmpty = (this.listpersonalchat.length < 1);
            }
            this.setState({ listpersonalchat: this.listpersonalchat, prop: this.prop });
        }
    }
    private async setUpChat() {
        var reqid = await storage.prevRequestID;
        var reqoperator = await storage.prevOperator;
        var reqchatkey = await storage.chatkey;
        const operatorDetails = { ChatKey: reqchatkey, RequestID: reqid, DisplayName: reqoperator }
        Object.rcopy(this.prop, personnalchatBox.info, operatorDetails);
        if (this.prop.IsLoaded) {
            this.listpersonalchat = personnalchatBox.list;
            this.prop.IsEmpty = (this.listpersonalchat.length < 1);
            this.setState({ list: this.listpersonalchat, prop: this.prop });
            return setTimeout(() => {
                this.prop.IsFiltering = false;
                this.setState({ prop: this.prop });
                this.hScrollMessages();
            }, 125);
        }
        return this.performRequestDetailDelay({ IsReset: true, RequestID: this.prop.RequestID }, () => setTimeout(() => this.hScrollMessages(), 125), 1275);
    }

    hMessage = (item: any) => {
        item.showDetail = !item.showDetail;
        this.setState({ listpersonalchat: this.listpersonalchat });
    }
    hPullRefresh = (ev: any) => {
        if (!this.prop.showRefresher && this.prop.IsLoaded)
            return ev.detail.complete();
        var tCallback = () => (ev.detail.complete(), setTimeout(() => {
            this.prop.refreshingRefresher = false;
            this.setState({ prop: this.prop });
            this.hScrollMessages();
        }, 250));
        this.prop.refreshingRefresher = true;
        this.setState({ prop: this.prop });

        if (!this.prop.IsLoaded) {
            return this.performRequestDetailDelay({ IsReset: true, IsFiltering: true, RequestID: this.prop.RequestID }, tCallback, 1275);
        }
        else this.performRequestDelay({ IsFiltering: true, RequestID: this.prop.RequestID }, tCallback);
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
    private chatBoxPopUpOpen: boolean = false;
    hChatBox = async () => {
        if (this.chatBoxPopUpOpen) return;
        this.chatBoxPopUpOpen = true;
        const modal = await PersonnalChatBoxPopUp.modal();
        await modal.present();
        await modal.onDidDismiss();
        this.setState({ list: (this.listpersonalchat = personnalchatBox.list) });
        this.hScrollMessages();
        this.chatBoxPopUpOpen = false;
    }

    private performRequestDetailDelay(filter: any, callback: Function = mtCb, delay: number = 175) {
        if (this.subs.t1) this.subs.t1.unsubscribe();
        this.prop.IsFiltering = !filter.IsFiltering;
        this.prop.RequestID = filter.RequestID;
        this.setState({ prop: this.prop });
        this.subs.t1 = timeout(() => this.performRequestDetail(filter, this.input, callback), delay);
    }
    private performRequestDetail(filter: any, input: any, callback: Function = mtCb) {
        if (!this.subs) return;
        if (this.subs.s1) this.subs.s1.unsubscribe();
        //console.log(filter);
        if (input.RequestID == '') return;
        //this.subs.s1 = rest.post('/app/chat/public', filter).subscribe(async (res: any) => {
        this.subs.s1 = rest.post('/app/chat/r/' + filter.RequestID, filter).subscribe(async (res: any) => {
            this.prop.IsFiltering = false;
            if (res.Status != 'error') {
                this.prop.RequestID = input.RequestID;
                this.prop.DisplayName = input.Operator;

                this.prop.IsLoaded = true;
                this.prop.IsReady = true;

                storage.chatkey = res.ChatKey;
                const detaisl = { ChatKey: res.ChatKey, RequestID: filter.RequestID, DisplayName: filter.Operator };
                this.setState({ prop: this.prop });
                if (personnalchatBox.info.IsLoaded) {
                    Object.rcopy(this.prop, personnalchatBox.info, detaisl);
                    this.listpersonalchat = personnalchatBox.list;
                } else {
                    res.IsLoaded = true;
                    var messages = res.Messages;
                    delete res.Messages;
                    Object.rcopy(this.prop, detaisl);
                    this.listpersonalchat = personnalchatBox.setList(messages.map((o: any) => personnalchatBox.details(o)));
                }
                this.prop.IsEmpty = (this.listpersonalchat.length < 1);
                if (callback != null) callback();
                this.setState({ list: this.listpersonalchat, prop: this.prop });
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
        var id = ((this.listpersonalchat[this.listpersonalchat.length - 1] || {}).ID || 0);
        this.subs.s2 = rest.post('/app/chat/t/' + this.prop.ChatKey + '/' + id, filter).subscribe(async (res: any) => {
            this.prop.IsFiltering = false;
            if (res.Status != 'error') {
                this.listpersonalchat = personnalchatBox.list;
                var lastID = ((this.listpersonalchat[this.listpersonalchat.length - 1] || {}).ID || 0);
                if (lastID == id) {
                    res.forEach((o: any) => this.listpersonalchat.push(personnalchatBox.details(o)));
                    this.prop.IsEmpty = (this.listpersonalchat.length < 1);
                }
                if (callback != null) callback();
                this.setState({ list: this.listpersonalchat, prop: this.prop });
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
    hBackButton = () => {
        this.pager.back();
    }
    hSelectOperator = async () => {
        const modal = await BarangayOperatorPopUp.modal("Barangay Operator", { Type: 2, ID: "" });
        await modal.present();
        const input = this.input;
        const res = await modal.onDidDismiss();
        const data = (res || mtObj).data;
        console.log(['hSelectOperator', data]);
        if (!data) return;
        input.RequestID = data.RequestID
        input.Operator = data.Operator;

        if (input.RequestID != await storage.prevRequestID) {
            personnalchatBox.list = [];
            storage.prevRequestID = data.RequestID;
            storage.prevOperator = data.Operator;
            return this.performRequestDetailDelay({ IsReset: true, RequestID: this.input.RequestID, Operator: this.input.Operator }, () => setTimeout(() => this.hScrollMessages(), 125), 1275);
        }
        else {
            storage.prevRequestID = data.RequestID;
            storage.prevOperator = data.Operator;
            return this.performRequestDetailDelay({ IsReset: true, RequestID: this.input.RequestID, Operator: this.input.Operator }, () => setTimeout(() => this.hScrollMessages(), 125), 1275);
        }




    }
    lstMessages: any = null;
    render() {
        const { prop = {}, info = {} } = this.state;
        const { list = [] } = this.state;
        return (<>
            <Layout>
                {/* <div className="row m-0 toolbar-panel">
                    <div className="vertical arrow-back" onClick={this.hBackButton}></div>
                    <div className="col-9 p-0 vertical toolbar-parentx" >Brgy Chat Support</div>
                    <div className="col-2 p-0 toolbar-title vertical">
                    <SuperTabButton style={styles('height:35px')} onClick={this.hSelectOperator}>
                    <IonIcon icon={listOutline} color='light'></IonIcon>
                    </SuperTabButton>
                    </div>
                </div> */}
                <IonHeader>
                    {!this.prop.didMount ? null :
                    <div style={styles('height:70px;')}>
                        <div style={styles('position:relative;top:11px;')}>
                        <IonItem lines="none" style={styles('--background:transparent;')}>
                            <IonIcon size="large" icon={arrowBackOutline} style={styles('color:rgb(0,4,69);')} onClick={this.hBackButton}/>
                            <IonTitle style={styles('font-weight:bold;color:rgb(0,4,69);font-size:20pt;')}>
                            Chat Support
                            </IonTitle>
                            <IonIcon size='large' slot='end' icon={listOutline} style={styles('color:rgb(0,4,69);')} onClick={this.hSelectOperator}/>
                        </IonItem>
                        </div>
                    </div>
                    }
                </IonHeader>
            </Layout>
            <Layout auto>
                    <FilteringView visible={prop.IsFiltering} />
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
                <div className="btn-chat_box" style={styles('position:absolute;bottom:0;right:25px')} onClick={this.hChatBox}>&nbsp;</div>
            </Layout>
        </>);
    }
}

class MsMessageInput extends React.Component<{ instance: PersonnalChatBoxPopUp }>{
    state: any = {};
    shouldComponentUpdate = () => false;
    render() {
        const { instance } = this.props;
        return (<>
            <MessageInput instance={instance} ref={instance.multiState(1, ({ changes }) => ({ changes }))} />
        </>);
    }
}
class MessageInput extends React.Component<{ instance: PersonnalChatBoxPopUp }>{
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

class BarangayOperatorPopUp extends React.Component<{ modal: Function, Title: string, Opts: any }> implements OnDidBackdrop {
    private static cache: any = {};
    state: any = { inner: { height: (window.innerHeight + 'px') } }
    constructor(props: any) {
        super(props);
        app.component(this);
        Object.rcopy(this.filter, (this.props.Opts || mtObj));
        this.prop.IsDevice = !device.isBrowser;
        this.filter.CacheID = (this.filter.Type + '-' + (this.filter.ID || '0'));
        const cache = BarangayOperatorPopUp.cache[this.filter.CacheID] || null;
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
        this.subs.s1 = rest.post('brgyoperator/list', Object.rcopy(filter, this.filter)).subscribe(async (res: any) => {
            this.prop.IsFiltering = false;
            if (res.Status != 'error') {
                if (filter.IsReset) this.list = res.brgyoptr.map((o: any) => this.listDetails(o));
                else res.brgyoptr.forEach((o: any) => this.list.push(this.listDetails(o)));
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
                                                        <div>{item.Operator}</div>
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
            <Modal className="modal-adjustment full" ref={(ref) => modal = ref} content={<BarangayOperatorPopUp modal={() => modal} Title={title} Opts={opts} />} />
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
const Item: React.FC<{ item: any, onClick?: React.MouseEventHandler, onImgClick?: React.MouseEventHandler }> = ({ item, onClick, onImgClick }) => {

    if (!!item.isSending) return null;

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
                            <div style={styles('font-weight:500;font-size:12px')}>{item.DisplayName}</div>
                            {!item.IsImage ? <>
                                <div style={styles('max-width:100%;padding:2.5px 10px;border-radius:20px;border:1px solid rgba(128, 128, 128, 0.75);border-top-left-radius:0px;font-size:14px;display:inline-block', 'background-color:rgba(0, 0, 0, 0.50)')}
                                    dangerouslySetInnerHTML={{ __html: item.Message }}>
                                    {/*[innerHTML]="|safe:'html'" {item.Message}  */}
                                </div>
                            </> : <>
                                <div style={styles('display:inline-block')} onClick={onImgClick}>
                                    <ImgPreloader style={styles('max-height:150px')}
                                        placeholder='./assets/img/anim_spinner.gif' src={item.MediaUrl}
                                    />
                                </div>
                            </>}
                            {!item.showDetail ? null : <>
                                <div style={styles('margin-left:2.5%;font-size:8px')}>{item.DateSendName}</div>
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
                                <div style={styles('display:flex')}>
                                    {!item.IsImage ? <>
                                        <div style={styles('max-width: 100%;padding: 2.5px 10px;border-radius: 20px 0px 20px 20px;border: 1px solid rgba(128, 128, 128, 0.75);font-size: 14px;display: inline-block;background-color: #5e5c68;color: white;')} dangerouslySetInnerHTML={{ __html: item.Message }}>
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
                                <div style={styles('width:50px;height:40px;position:relative')}>
                                    <ImgPreloader className="brand-image img-circle elevation-1 img-fit" style={styles('width:40px;height:40px')}
                                        placeholder='./assets/img/icon_blank_profile.png' src={item.ProfileImageUrl} />
                                </div>

                            </div>
                            <div style={styles('display:flex;height:auto;padding:0px 5px')}>
                                <div style={styles('flex-grow:1')}></div>
                                <div style={styles('margin-right:2.5%;font-size:10px')}>
                                    {!(!item.isSending && item.showDetail) ? null : <>
                                        <span style={styles('font-size:8px;color:white')}>{item.DateSendName}</span>
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
const ItemOperator: React.FC<{ item: any, onClick?: React.MouseEventHandler }> = ({ item, onClick }) => {
    return (<>
        <IonItem className='input-error' style={styles('--highlight-background:unset;--min-height:40px;margin-top:2.5px')}>
            <IonLabel position="floating" style={styles('font-weight:bold;margin-top:-7.5px')}><span style={styles('color:red')}>*</span>Marital Status</IonLabel>
            <Input ion="popup" node={(handle) => <>
                <IonInput hidden></IonInput>
                <IonSelect interface="action-sheet" cancelText="Dismiss" style={styles('height:40px')}
                     > {/* [(ngModel)]="filter.Method" (ionChange)="handleChangedPayMethod()"*/}
                    <IonSelectOption value={item.RequestID}>{item.Operator}</IonSelectOption>
                    {/* <IonSelectOption value='m'>Married</IonSelectOption>
                    <IonSelectOption value='w'>Widowed</IonSelectOption> */}

                </IonSelect>
            </>} />
        </IonItem>
    </>);
}


//styles
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