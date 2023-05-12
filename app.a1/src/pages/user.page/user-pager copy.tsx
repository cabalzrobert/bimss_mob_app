import { IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonItem, IonList, IonMenu as ionMenu, IonMenuButton, IonPage, IonRefresher, IonRefresherContent, IonRippleEffect, IonSelect, IonSelectOption, IonTitle, IonToolbar, NavContext } from '@ionic/react';
import { menuController, modalController } from '@ionic/core'
import React from 'react';
import axios from 'axios';
import styled from 'styled-components';
import Layout from '../../tools/components/+common/layout';
import ViewPager from '../../tools/components/+feature/view-pager';
//import { File } from '@ionic-native/file';
import SwapPager from '../../tools/components/+feature/swap-pager';

import { numberWithComma, phoneNumber } from '../../tools/global';
import { homeOutline, gameControllerOutline, logOutOutline, saveOutline, ticketOutline, newspaperOutline, logInOutline, settingsOutline, call } from 'ionicons/icons';
//
import { Plugins, KeyboardInfo } from '@capacitor/core'; 
import { SmsRetriever } from '@ionic-native/sms-retriever';
//import HomeView from './user-pages/home.view';
import SelectDateTransactionView from './user-pages/select-date-transaction.view';
//import GameView from './user-pages/+temp/game.view';
import { app, OnDidBackdrop } from '../../tools/app';
import { device } from '../../tools/plugins/device';
import Stack, { Alert, Loading } from '../../tools/components/+common/stack';
import LogoutPopUp from '../+app/modal/logout.popup';
import TicketDetails from '../+app/modal/ticket-details.popup';
import { additionalNotification, checkBalances, jCompany, jCompanyModify, jUser, jUserModify, additionalCommissionBalance } from '../+app/user-module';
import { sms, smsReceiver } from '../../tools/plugins/sms';
import { keyboard } from '../../tools/plugins/keyboard';
import { toast } from '../../tools/plugins/toast';
import { Sim } from '@ionic-native/sim';
import { mtCb, mtObj, subscribe } from '../../tools/plugins/static';
import { AndroidPermissions } from '@ionic-native/android-permissions';
import { storage } from '../../tools/plugins/storage';
import { http } from '../../tools/plugins/http';
import { FileOpener } from '@ionic-native/file-opener';
import { stomp } from '../+app/+service/stomp.service';
import { rest } from '../+app/+service/rest.service';
import { classNames, styles } from '../../tools/plugins/element';
import HomeTabs from './user-pages/home.page/home-tabs';
import { openSms } from '../../tools/plugins/open';
import UWinPopUp from '../+app/modal/u-win.popup';
import CreditReceivedPopUp from '../+app/modal/credit-received.popup';
import { chatBox } from '../+app/modal/+feature/chat-box.popup';
import GameView from '../user.page/user-pages/home.page/home-pages/game.view';
import HomeView from '../user.page/user-pages/home.page/home-pages/home.view';
import { interval, timeout } from '../../tools/plugins/delay';
import moment from 'moment';
import RecyclerPager from '../../tools/components/+feature/recycler';
import IntroRecyclerView from '../intro.page/recycler-storage';

const{ LocalNotifications } = Plugins;
const{ Object, $, addEventListener, removeEventListener }:any = window;

const IonMenu = styled(ionMenu)`
>ion-content{
    ion-list{
        padding: 0px;
        >ion-item{
            >div{
                padding-left: 10px;
            }
        }
    }
}
`;
export default class UserPager extends React.Component implements OnDidBackdrop {
    static instance:UserPager = ({} as any);
    static contextType = NavContext;
    state:any = { 
        inner:{ width: '500px', height:'100%' },
        u:{},
    }
    swapper:SwapPager = (mtObj as SwapPager);
    pager = (mtObj as ViewPager);
    componentWillMount=()=>{
        app.component(UserPager.instance = this);
        const{ state:{inner} } = this;
        if(!device.isBrowser){
            Object.rcopy(inner,{ width: '100%', height:'100%' });
            this.setState({inner});
        }
        chatBox.refresh();
    }
    subs:any = {};
    prop:any = {};
    componentDidMount=async()=>{
        var IsSignIn = await storage.IsSignIn;
        console.log(IsSignIn);
        if(!IsSignIn) return this.goToIntroPage();
        const{ state:{inner} } = this;
        this.subs.u = jUserModify(async()=>{
            const u:any = await jUser();
            if(!!u.ACT_ID) return this.setState({u});
            var IsSignIn = await storage.IsSignIn;
            if(!IsSignIn)return;
            if(Object.keys(u).length!=0)return;
            timeout(()=>jUserModify(),750);
        });
        this.subs.c = jCompanyModify(async()=>this.setState({c:await jCompany()}));
        //
        if(!device.isBrowser){
            const{ scaleHeight, innerHeight }:any = window;
            const height = (scaleHeight + 'px');
            this.subs.k1 = keyboard.addListener('keyboardWillShow', (info: KeyboardInfo) => { 
                inner.height = height;
                this.setState({inner});
            });
            this.subs.k2 = keyboard.addListener('keyboardWillHide', () => {
                inner.height = '100%';
                this.setState({inner});
            });
        }
        this.stompReceivers();
        //this.deviceInactivity();
        //this.tickerSettings();
    }

    componentWillUnmount(){
        Object.values(this.subs).map((m:any)=>m.unsubscribe());
        stomp.disconnect();
    }

    onDidBackdrop(){
        if(app.window.isFullscreen())
            app.window.closeFullscreen();
        else if(!this.pager.back())
            app.attempToClose();
        return false;
    }

    private deviceInactivity(){
        const{ prop } = this;
        this.subs.inEvent = subscribe(()=>{
            $(document.body).on('click.inactivity touchstart.inactivity touchmove.inactivity',()=>{
                if(!!this.subs.inTimeout) this.subs.inTimeout.unsubscribe();
                this.subs.inTimeout = interval(()=>{
                    if(!!prop.IsSessionEnd)return;
                    this.deviceSessionEnd();
                    this.popUpLogoutMessage('Due to inactivity, your account has been logout!');
                },(60000*15)); 
            });
            return ()=>$(document.body).off('.inactivity');
        });
    }

    private tickerSettings(){
        const{ prop } = this;
        const defOpt = { NotifAnnouncement:true, NotifLiveStreaming:true, NotifLivePublicChat:true, };
        const callback = async()=>{
            if(!!this.subs.t1) this.subs.t1.unsubscribe();
            Object.rcopy(prop, (await storage.PopUpNotif||defOpt));
            this.subs.t1 = timeout(callback,1250);
        };
        return callback();
    }

    private stompReceivers(){
        this.subs.wsErr = stomp.subscribe('#error', (err:any)=>this.error());
        this.subs.wsConnect = stomp.subscribe('#connect', ()=>this.connected());
        this.subs.wsDisconnect = stomp.subscribe('#disconnect', ()=>this.disconnect());
        this.subs.ws1 = stomp.subscribe('/test', (json:any)=>this.ReceivedTest(json));
        //this.subs.ws2 = stomp.subscribe('/notify', (json:any)=>this.receivedNotify(json));
        //this.subs.ws2 = stomp.subscribe('/branch', (json:any)=>console.log(json));
        this.subs.ws3 = stomp.subscribe('/branch', (json:any)=>this.receivedNotify(json));
        //this.subs.ws4 = stomp.subscribe('/balance', (json:any)=>this.receivedNotify(json));
        this.subs.ws5 = stomp.subscribe('/chat/pub', (json:any)=>this.receivedChat(json));
        stomp.ready(()=>(stomp.refresh(),stomp.connect()));
    } //
    
    private ReceivedTest(data:any){
        console.log(data);
    }
    private error(){
        this.ping(()=>this.testPing());
    }
    private connected(){
        this.ping(()=>this.testPing());
    }
    private disconnect(){
        this.stopPing();
    }
    private testPing(){
        const{ subs } = this;
        this.stopPing();
        this.ping(()=>subs.tmPing=timeout(()=>this.testPing(),(60000*1)));
    }
    private stopPing(){
        const{ subs } = this;
        const{ tmPing, ping } = subs;
        if(tmPing) tmPing.unsubscribe();
        if(ping) ping.unsubscribe();
    }
    private ping(callback:Function){
        const{ prop, subs } = this;
        this.stopPing();
        this.subs.ping = rest.post('ping',{}).subscribe(async(res:any)=>{
            if(res.Status=='error'){
                if(res.Type=='device.session-end'){
                    if(!!prop.IsSessionEnd)return;
                    this.deviceSessionEnd();
                    return this.popUpLogoutMessage(res.Message);
                }
            }
            if(!stomp.IsConnected)
                return;
            return callback();
        },(err:any)=>{
            if(!stomp.IsConnected)
                return;
            return callback();
        });
    }

    private receivedNotify(data:any){
        const{ prop, state:{u} } = this;
        if(data.type=='post-event'){
            additionalNotification(1);
        }
        else if(data.type=='app-update'){
            additionalNotification(1);
        }
        else if(data.type=='post-notification'||data.type=='post-result'){
            additionalNotification(1);
            if(device.isBrowser) return;
            var content = data.content[0];
            var popup = true, id = +(new Date()), smallIcon = 'icon_bell';
            if(content.Type=='streaming'){
                id = 10001;
                smallIcon = 'icon_stop';
                popup = !!prop.NotifLiveStreaming;
            }
            else if(content.Type=='post-result'){
                popup = !!prop.NotifAnnouncement;
                id = 10002;
            }
            if(!popup)return;
            LocalNotifications.schedule({
                notifications:[{
                    id: id, 
                    smallIcon: smallIcon,
                    title: content.Title,
                    body: content.Description,
                }]
            });
        }else if(data.type=='notification'){
            additionalNotification(1);
            if(device.isBrowser) return;
            var content = data.content[0];
            var popup = !!prop.NotifAnnouncement;
            var id = +(new Date()), smallIcon = 'icon_bell';
            if(!popup)return;
            LocalNotifications.schedule({
                notifications:[{
                    id: id, 
                    smallIcon: smallIcon,
                    title: content.Title,
                    body: content.Description,
                }]
            });
            if(content.Type=='change-password'){
                
            }
        }else if(data.type=='load-credit'||data.type=='credit-approval'){
            additionalNotification(1);
            this.pager.performPagerFocus();
            return this.popUpLoadedCredit(data.content[0]);
        }else if(data.type=='request-credit'){
            additionalNotification(1);
            if(device.isBrowser) return;
            var content = data.content[0];
            var popup = !!prop.NotifAnnouncement;
            var id = +(new Date());
            if(!popup)return;
            LocalNotifications.schedule({
                notifications:[{
                    id: id, 
                    smallIcon:'icon_bell',
                    title: content.Title,
                    body: content.Description,
                }]
            });
        }else if(data.type=='winning-approval'){
            if(!data.is_encashment){
                additionalNotification(1);
                return this.performCheckBalance();
            }
        }else if(data.type=='game-winning'){
            additionalNotification(1);
            var popup = !!prop.NotifAnnouncement;
            var content = data.content[0];
            if(!popup)return;
            LocalNotifications.schedule({
                notifications:[{
                    id: +(new Date()), 
                    smallIcon:'icon_bell',
                    title: content.Title,
                    body: content.Description,
                }]
            });
            return this.popUpWinning(content);
        }else if(data.type=='device.session-end'){
            this.deviceSessionEnd();
            return this.popUpLogoutMessage(data.message);
        }else if(data.type=='add-commission'){
            if(u.IsPlayer)return;
            additionalCommissionBalance(data.content||0);
        }
    }
    private receivedChat(data:any){
        const{ prop } = this;
        if(data.type=='public'){
            var content = data.content;
            var message = (content.Messages[0]||null);
            if(!message)return;
            var popup = !!prop.NotifLivePublicChat;
            if(!popup)return;
            chatBox.widget(message);
        }
    }
    //
    private popUpLogoutMessage(message:string){
        Alert.showWarningMessage(message, (res:any)=>{
            setTimeout(async()=>(await modalController.getTop()||{dismiss:mtCb}).dismiss(),275);
            this.goToSignInPage(); //true
        });
    }
    private async popUpLoadedCredit(data:any){
        this.performCheckBalance();
        const modal = await CreditReceivedPopUp.modal((data||mtObj).Amount||0.00);
        await modal.present();
    }
    private async popUpWinning(data:any){
        const modal = await UWinPopUp.modal((data||mtObj).Amount||0.00);
        await modal.present();
    }
    private async performCheckBalance(){
        //checkBalances();
        this.pager.performPagerFocus();
    }
    private goToSignInPage(){ 
        return this.context?.navigate('/out', 'forward', 'pop');
    }
    private goToIntroPage(){ 
        return this.context?.navigate('/intro', 'forward', 'pop');
    }
    private deviceSessionEnd(){
        this.prop.IsSessionEnd = true;
        storage.IsSignIn = false;
        jUser({});
        storage.Auth = {};
    }
    //
    hPageChange=()=>{
        (!!this.elBottomPanel&&this.elBottomPanel.onPageChange());
    }
    hPageBack=()=>{
        (!!this.elBottomPanel&&this.elBottomPanel.onPageBack());
    }
    //
    elBottomPanel:BottomPanel = (null as any);
    render(){
        const{ inner={} } = this.state;
        return (<>
<IonPage>
    <div className='horizontal'>
        <Layout full style={styles('position:relative;background-color:white;max-width:100%;width:100%;height:100%',{width:inner.width, height:inner.height})}>
            <StaticComponentView instance={this} />
        </Layout>
    </div>
</IonPage>
        </>);
    }
}

class StaticComponentView extends React.Component<{instance:UserPager}>{
    shouldComponentUpdate=()=>false;
    render(){
        const{ instance } = this.props;
        return(<>
<div className="app-bg3"></div>
<Layout auto>
    <ViewPager ref={(ref:any)=>instance.pager=ref} default={HomeTabs} onPageChange={instance.hPageChange} onPageBack={instance.hPageBack} />
</Layout>
<BottomPanel ref={(ref:any)=>instance.elBottomPanel=ref} />   
        </>);
    }
}

class BottomPanel extends React.Component{
    get pager(){ return UserPager.instance.pager; }
    state:any = { c:{}, disabledBet:true };
    componentWillMount=()=>{
        this.subs.c = jCompanyModify(async()=>this.setState({c:await jCompany()}));
    }
    
    subs:any = {};
    componentDidMount(){
        //this.tickerSettings();
    }
    componentWillUnmount(){
        Object.values(this.subs).map((m:any)=>m.unsubscribe());
    }

    private tickerSettings(){
        const callback = async()=>{
            const{ prop, state } = this;
            if(!!this.subs.t1) this.subs.t1.unsubscribe();
            const settings = (await storage.GameDisabled||{});
            if(!!settings.IsDisabledBet){
                var from = 0, until = 0;
                var today:any = moment(moment().format('MMM DD, YYYY hh:mm A')); 
                var todaydt = today.format('MMM DD, YYYY');
                try{
                    from = moment(todaydt+' '+settings.BetDisabledFromTm).valueOf();
                    until = moment(todaydt+' '+settings.BetDisabledUntilTm).valueOf();
                }catch{}
                today = today.valueOf();
                prop.disabledBet = (from<=today && today<=until);
            }else prop.disabledBet = false;
            if(prop.disabledBet!=state.disabledBet){
                const disabledBet = prop.disabledBet;
                this.setState({disabledBet});
            }
            this.subs.t1 = timeout(callback,1250);
        };
        return callback();
    }

    prop:any = {};
    onPageChange(){
        const{ prop } = this;
        prop.isPlaying = false;
        this.setState({prop});
    }
    onPageBack(){
        const{ prop } = this;
        if(this.pager.currentComponent.type==HomeTabs){
            if(!!prop.focusInGameView){
                prop.isPlaying = true;
                this.setState({prop});
            }
        }
    }

    hHomeButton=()=>{
        this.backToHomeView((view:HomeView)=>view.viewStreaming());
    }
    hPlayButton=()=>{
        const{ state:{disabledBet} } = this;
        if(disabledBet)return;
        this.backToHomeTabs((pager:HomeTabs)=>pager.setView(GameView),true);
    }
    hPlayConfirmButton=()=>{
        const{ prop, state:{disabledBet} } = this;
        if(disabledBet)
            return toast('You disabled the game!');
        if(!prop.isPlaying) return;
        const{ instance }:{instance:HomeTabs} = this.pager.currentComponent;
        if(!instance) return;
        const view:GameView = instance.getView();
        (!!view&&view.performConfirmBets());
    }
    hShareAppButton=()=>{
        const{ c:{AppSharingDescription} } = this.state;
        openSms('', AppSharingDescription);
    }
    hRecordsButton=()=>{
        this.backToHomeView((view:HomeView)=>view.viewTicket());
    }
    hResultsButton=()=>{
        this.backToHomeView((view:HomeView)=>view.viewResult());
    }
    private backToHomeView(callback:Function){
        this.backToHomeTabs((pager:HomeTabs)=>pager.setView(HomeView,
            (view:any)=>callback(view.instance)));
    }
    private backToHomeTabs(callback:Function, focused:boolean=false){
        const{ prop } = this;
        this.pager.backTo(HomeTabs, true, (view:any)=>{
            callback(view.instance);
            prop.focusInGameView = prop.isPlaying = focused;
            this.setState({prop});
        });
    }
    render(){
        const{ prop={}, disabledBet=false, } = this.state;
        return (<>
{/* <Layout style={styles('height:100px')}> */}
    {/* <div className="row m-0" style={styles('height:100px')}> 
        <div className="col-12 p-0">
            <div className="bg-btm_red_panel">&nbsp;</div>  
            <div className={classNames('layout-horizontal',{'block':prop.disabled})} style={styles('height:100%;padding-bottom:5px')}>
                <div style={styles('width:20px')}>&nbsp;</div>
                <div className="auto"><div className="btn-btm_home" onClick={this.hHomeButton}></div></div>
                <div className="auto"><div className="btn-btm_share" onClick={this.hShareAppButton}></div></div>
                <div className="auto" style={styles('width:200%')}>
                    {!prop.isPlaying?<>
                        <div className={classNames('btn-btm_bet_now',{'disabled':disabledBet})} onClick={this.hPlayButton}></div>
                    </>:<>
                        <div className={classNames('btn-btm_place_bet',{'disabled':disabledBet})} onClick={this.hPlayConfirmButton}></div>
                    </>}
                </div>
                <div className="auto"><div className="btn-btm_bets" onClick={this.hRecordsButton}></div></div>
                <div className="auto"><div className="btn-btm_result" onClick={this.hResultsButton}></div></div>
                <div style={styles('width:20px')}>&nbsp;</div>
            </div>
        </div> 
    </div> */}
{/* </Layout> */}
        </>);
    }
}




