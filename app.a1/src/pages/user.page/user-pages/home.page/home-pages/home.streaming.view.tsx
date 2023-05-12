import { IonContent, IonInput, IonItem, IonLabel, IonList, IonRefresher, IonRefresherContent, IonRippleEffect, IonSelect, IonSelectOption, IonSpinner } from '@ionic/react';
import React from 'react';
import styled from 'styled-components';
import Layout from '../../../../../tools/components/+common/layout';
import FilteringView from '../../../../+app/component/common/filtering.view';
import { mtCb, subscribe } from '../../../../../tools/plugins/static';
import PhotoViewerPopUp from '../../../../../tools/components/+common/modal/photo-viewer.popup';
import { styles } from '../../../../../tools/plugins/element';
import { timeout } from '../../../../../tools/plugins/delay';
import { rest } from '../../../../+app/+service/rest.service';
import { toast } from '../../../../../tools/plugins/toast';
import ImgPreloader from '../../../../../tools/components/+common/img-preloader';
import { device } from '../../../../../tools/plugins/device';
import { stomp } from '../../../../+app/+service/stomp.service';
import ChatBoxPopUp, { chatBox } from '../../../../+app/modal/+feature/chat-box.popup';
import YtPlayerView from '../../../../../tools/components/+feature/yt-player.view';
import { jCompany, jCompanyModify } from '../../../../+app/user-module';
import { OnSwapFocus, OnSwapLeave } from '../../../../../tools/components/+feature/swap-pager';
import Recycler, { rgsMount } from '../../../../../tools/components/+feature/recycler';
import RecyclerStorage from '../../../../intro.page/recycler-storage';

const { Object, $ }: any = window;

export default class StreamingHomeView extends React.Component implements OnSwapFocus, OnSwapLeave {
    onSwapFocus = () => this.holder.onSwapFocus();
    onSwapLeave = () => this.holder.onSwapLeave();
    //
    shouldComponentUpdate = () => false;
    holder: ViewHolder = (null as any);
    render() {
        return (<>
            <Recycler storage={RecyclerStorage.instance} from={ViewHolder} bind={(ref) => this.holder = ref} />
        </>);
    }
}

export class ViewHolder extends React.Component implements OnSwapFocus, OnSwapLeave {
    prop: any = {};
    componentWillMount = () => this.willMount(false);
    willMount = (didMount = true) => (this.prop.didMount = didMount);
    onSwapFocus = () => this.refStreamingPanel?.onViewFocus();
    onSwapLeave = () => this.refStreamingPanel?.onViewLeave();
    //
    rgsMount = rgsMount();
    shouldComponentUpdate = () => false;
    refStreamingPanel: StreamingPanel = (null as any);
    render() {
        const { rgsMount } = this;
        return (<>
            <Layout full>
                <Layout style={styles('height:250px')}>
                    <StreamingPanel instance={this} ref={rgsMount((ref: any) => this.refStreamingPanel = ref)} />
                </Layout>
                <PublicChatPanel instance={this} ref={rgsMount()} />
            </Layout>
        </>);
    }
}

class StreamingPanel extends React.Component<{ instance: ViewHolder }> {
    state: any = { c: {}, };
    componentWillMount = () => this.willMount();
    prop: any = {};
    subs: any = {};
    willMount = () => {
        const { prop: { didMount } } = this.props.instance;
        const prop: any = (this.prop = { didMount: didMount });
        prop.IsDevice = !device.isBrowser;
        this.ytPlaying = false;
        this.pageFocused = false;
        this.isPlayerInit = false;
        this.playedVideoUrl = '';
        this.isYtPlaying = false;
        this.setState({ prop });
        console.log('StreamingPanel');
        console.log(prop);
        if (!didMount) return;
        this.subs.c = jCompanyModify(async () => this.setState({ c: await jCompany() }));
    }

    didMount = () => {
        console.log('didMount Home.Streaming.View.tsx');
        if (!this.prop.didMount) return;
        this.prop.isReady = true;
        this.stompReceivers();
        rest.ready(() => this.performRequestDelay({ IsReset: true }));
    }
    willUnmount = () => {
        Object.values(this.subs).map((m: any) => m.unsubscribe());
    }
    private stompReceivers() {
        this.subs.connect = stomp.subscribe('#connect', () => this.connected());
        this.subs.ws1 = stomp.subscribe('/branch', (json: any) => this.receivedNotify(json));
    }

    private connected() {
        this.performRequestDelay({ IsReset: true });
    }
    private receivedNotify(data: any) {
        if (data.type == 'streaming-update') {
            this.setInfo(data.content);
        }
    }
    private ytPlaying: boolean = false;
    private pageFocused: boolean = false;
    async onViewFocus() {
        this.pageFocused = true;
        this.prop.isFocused = true;
        this.setState({ prop: this.prop });
        if (this.subs.focus) this.subs.focus.unsubscribe();
        if (!this.prop.isReady) return;
        if (this.ytPlayer && this.ytPlaying) {
            this.subs.yt = timeout(() => {
                this.ytPlaying = false;
                this.ytPlayer.play();
            }, 150);
        }
    }
    async onViewLeave() {
        this.pageFocused = false;
        this.subs.focus = timeout(() => (this.prop.isFocused = false, this.setState({ prop: this.prop })), 1000);
        if (!this.prop.isReady) return;
        if (this.ytPlayer) {
            if (this.subs.yt) this.subs.yt.unsubscribe();
            if (this.isYtPlaying) {
                this.ytPlaying = true;
                this.ytPlayer.pause();
            }
        }
    }

    hPullRefresh = (ev: any) => {
        this.performRequestDelay({ IsReset: true, IsFiltering: true }, (err: any) => ev.detail.complete());
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
        this.subs.s1 = subscribe(() => {
            var restDone = false;
            const sub = rest.post('lottery/profile', filter).subscribe(async (res: any) => {
                restDone = true;
                this.prop.IsFiltering = false;
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
        this.loadVideoUrl(info.LiveStreamUrl);
    }
    /*****/
    ytReady = () => {
        const c: any = (this.state.c || {});
        this.loadVideoUrl(c.LiveStreamUrl);
    }
    ytPlayer: YtPlayerView = (null as any);
    public isPlayerInit: boolean = false;
    private playedVideoUrl: string = '';
    private isYtPlaying: boolean = false;
    loadVideoUrl(videoUrl: string) {
        if (!this.ytPlayer) return;
        if (!videoUrl) return;
        if (this.isPlayerInit) {
            if (this.isYtPlaying) {
                if (this.playedVideoUrl == videoUrl)
                    return;
            }
        }
        this.isPlayerInit = false;
        this.ytPlayer.playVideoUrl(videoUrl, { autoplay: true, controls: false }, () => {
            this.prop.isStreamLoaded = true;
            this.setState({ prop: this.prop });
            this.playedVideoUrl = videoUrl;
            this.isPlayerInit = true;
            this.isYtPlaying = false; //true;
            this.ytPlayer.onStateChange(async (state: any) => {
                if (state.data == this.ytPlayer.State.PAUSED) {
                    this.isYtPlaying = false;
                } else if (state.data == this.ytPlayer.State.PLAYING) {
                    this.isYtPlaying = true;
                    if (await this.ytPlayer.isMuted()) {
                        this.ytPlayer.unMute();
                    }
                }
                if (!this.pageFocused)
                    return this.ytPlayer.pause();
            });
        });
    }

    rgsMount = rgsMount();
    render() {
        const { rgsMount } = this;
        const { prop = {}, c = {} } = this.state;
        return (<>
            <IonContent style={styles('height:275px')}>
                <IonRefresher slot="fixed" onIonRefresh={this.hPullRefresh}>
                    <IonRefresherContent />
                </IonRefresher>
                <Layout full>
                    <Layout>
                        <div className="horizontal" style={styles('color:whitesmoke')}>Live Streaming Video</div>
                    </Layout>
                    <Layout auto>
                        <div className="row m-0" style={styles('position:relative;height:100%;width:100%;background-color:#000')}>
                            {!(!prop.isStreamLoaded || !prop.isFocused) ? null : <>
                                <div className="col-12 p-0 horizontal" style={styles('position:absolute;top:0;width:100%;height:100%')}>
                                    <div className="vertical"><IonSpinner name="crescent" color="primary" style={styles('height:50px;width:50px')} /></div>
                                </div>
                            </>}
                            <div style={styles('width:100%;height:100%', { 'display': (!prop.isReady ? 'none' : 'block') })}>
                                <YtPlayertView instance={this} />
                            </div>
                        </div>
                    </Layout>
                    <Layout>
                        <div style={styles('position:relative;width:100%')}>
                            <div style={styles('position:absolute;z-index:0;height:100%;width:100%;background-color:#000;opacity:0.75')}></div>
                            <div className='vertical' style={styles('padding:2.5px 10px;position:relative;z-index:1;color:#fefed1;min-height:32px')}>
                                {!(prop.isLoaded || prop.isReady) ? <>Loading..</> : <>{c.LiveStreamName}</>}
                            </div>
                        </div>
                    </Layout>
                </Layout>
            </IonContent>
        </>);
    }
}

class YtPlayertView extends React.Component<{ instance: StreamingPanel }> {
    shouldComponentUpdate = () => false;
    render() {
        const { instance } = this.props;
        const { rgsMount } = instance;
        return (<>
            <YtPlayerView ref={rgsMount((ref: any) => instance.ytPlayer = ref)} onReady={instance.ytReady} />
        </>);
    }
}

class PublicChatPanel extends React.Component<{ instance: ViewHolder }> {
    state: any = {};
    componentWillMount = () => this.willMount();
    prop: any = {};
    list: any = [];
    info: any = {};
    subs: any = {};
    willMount = () => {
        const { prop: { didMount } } = this.props.instance;
        const prop: any = (this.prop = { didMount: didMount, IsFiltering: true });
        const info = (this.info = {});
        const list = (this.list = []);
        prop.IsDevice = !device.isBrowser;
        this.setState({ prop, info, list });
        
        console.log('this.props.instance');
        console.log(this.props.instance);
        console.log('WillMount');
        console.log(this.prop);
    }
    didMount = () => {
        if (!this.prop.didMount) return;
        this.stompReceivers();
        rest.ready(() => this.setUpChat());
    }
    willUnmount = () => {
        Object.values(this.subs).map((m: any) => m.unsubscribe());
    }
    private stompReceivers() {
        this.subs.connect = stomp.subscribe('#connect', () => this.connected());
        this.subs.ws1 = stomp.subscribe('/chat/pub', (json: any) => this.receivedChat(json));
    }

    private connected() {
        //this.performRequestDelay({ IsReset:true });
    }
    private receivedChat(data: any) {
        if (data.type == 'public') {
            var content = data.content;
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
    private setUpChat() {
        console.log('setUpChat');
        console.log(chatBox.info);
        Object.rcopy(this.prop, chatBox.info);
        console.log('Object.rcopy(this.prop, personnalchatBox.info)')
        console.log(chatBox.info);
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
        return this.performRequestDetailDelay({ IsReset: true }, () => setTimeout(() => this.hScrollMessages(), 125), 1275);
    }

    hMessage = (item: any) => {
        item.showDetail = !item.showDetail;
        this.setState({ list: this.list });
    }
    hPullRefresh = (ev: any) => {
        console.log('hPullRefresh');
        console.log([this.prop.showRefresher, this.prop.isLoaded]);
        if (!this.prop.showRefresher && this.prop.IsLoaded)
            return ev.detail.complete();
        var tCallback = () => (ev.detail.complete(), setTimeout(() => {
            this.prop.refreshingRefresher = false;
            this.setState({ prop: this.prop });
            this.hScrollMessages();
        }, 250));
        this.prop.refreshingRefresher = true;
        this.setState({ prop: this.prop });
        if (!this.prop.IsLoaded)
            return this.performRequestDetailDelay({ IsReset: true, IsFiltering: true }, tCallback, 1275);
        else this.performRequestDelay({ IsFiltering: true }, tCallback);
    }
    hScrollMessages = () => {
        if (!this.prop.IsLoaded) return;
        if (this.subs.scrolling) this.subs.scrolling.unsubscribe();
        this.subs.scrolling = timeout(() => {
            var $el = $(this.lstMessages);
            var position = ($el.find('>:last').position() || { top: 0 });
            this.prop.showRefresher = (position.top > -60);
            this.setState({ prop: this.prop });
            console.log('hScrollMessage Function');
            console.log(this.prop);
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
        const modal = await ChatBoxPopUp.modal();
        await modal.present();
        await modal.onDidDismiss();
        this.setState({ list: (this.list = chatBox.list) });
        this.hScrollMessages();
        this.chatBoxPopUpOpen = false;
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
            console.log('chatBox.info.IsLoaded');
            console.log(chatBox.info.IsLoaded);
            console.log('this.prop');
            console.log(this.prop);
            if (res.Status != 'error') {
                if (chatBox.info.IsLoaded) {
                    Object.rcopy(this.prop, chatBox.info);
                    this.list = chatBox.list;
                } else {
                    
                    console.log('inside else condition if(personnalchatBox.inf.IsLoaded) is false');
                    res.IsLoaded = true;
                    var messages = res.Messages;
                    delete res.Messages;
                    Object.rcopy(this.prop, chatBox.setInfo(res));
                    this.list = chatBox.setList(messages.map((o: any) => chatBox.details(o)));
                }
                this.prop.IsEmpty = (this.list.length < 1);
                if (callback != null) callback();
                this.setState({ list: this.list, prop: this.prop });
                
                console.log('this.listpersonalchat');
                console.log(this.list);
                console.log('this.prop');
                console.log(this.prop);
                console.log('this.prop.IsEmpty');
                console.log(this.prop.IsEmpty);

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
    lstMessages: any = null;
    render() {
        const { prop = {}, info = {} } = this.state;
        const { list = [] } = this.state;
        return (<>
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

const Item: React.FC<{ item: any, onClick?: React.MouseEventHandler, onImgClick?: React.MouseEventHandler }> = ({ item, onClick, onImgClick }) => {
    if (!!item.isSending) return null;
    return (<>
        <div style={styles('padding:0.5px 0px')} onClick={onClick}>
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
        </div>
    </>);
};

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