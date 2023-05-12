
import React from 'react';
import { CreateAnimation, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonImg, IonItem, IonLabel, IonList, IonListHeader, IonMenu as ionMenu, IonMenuButton, IonMenuToggle, IonPage, IonRefresher, IonRefresherContent, IonRippleEffect, IonSearchbar, IonSelect, IonSelectOption, IonSlide, IonSpinner, IonTitle, IonToolbar, NavContext } from '@ionic/react';
import { menuController, modalController } from '@ionic/core'
import axios from 'axios';
import styled from 'styled-components';
import Layout from '../../tools/components/+common/layout';
import ViewPager from '../../tools/components/+feature/view-pager';
//import { File } from '@ionic-native/file';
import SwapPager from '../../tools/components/+feature/swap-pager';
import NotFound2View from '../+app/component/common/not-found.view';

import { numberWithComma, phoneNumber } from '../../tools/global';
import {
    homeOutline, gameControllerOutline, logOutOutline, saveOutline, ticketOutline, newspaperOutline, logInOutline, settingsOutline
    , call
    , key
    , informationCircleOutline
    , readerOutline
    , todayOutline
    , chatbubblesOutline
    , personCircleOutline,
    peopleCircleOutline,
    keyOutline,
    keySharp,
    notificationsCircleOutline,
    chevronForward,
    chevronForwardOutline,
    addOutline,
    removeCircleOutline,
    addCircleOutline,
    removeOutline,
    addCircleSharp,
    addCircle,
    schoolSharp,
    businessSharp,
    listCircleOutline
} from 'ionicons/icons';
//
import { Plugins, KeyboardInfo } from '@capacitor/core';
import { SmsRetriever } from '@ionic-native/sms-retriever';
//import HomeView from './user-pages/home.view';
import SelectDateTransactionView from './user-pages/select-date-transaction.view';
//import GameView from './user-pages/+temp/game.view';
import { app, OnDidBackdrop } from '../../tools/app';
import { device } from '../../tools/plugins/device';
import Stack, { Alert, Loading, Modal } from '../../tools/components/+common/stack';
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
import MemberProfileAccount from './user-pages/menu-pages/member.account-profile.view';
import ChangePassword from './user-pages/menu-pages/changepassword.account.view';
import MemorandumHistory from './user-pages/menu-pages/record.memo-list.view';
import IssuesConcernAppHistory from './user-pages/menu-pages/record.issuesconcern-open-pending-close.view';
import EventsView from './user-pages/menu-pages/events.view';
import RequestBarangayOtherDocumentAppHistory from './user-pages/menu-pages/record.requestbrgyotherdoc-open-unclaim-claim.view';
import RequestBarangayBusinessClearacneAppHistory from './user-pages/menu-pages/record.requestbrgybusinessclearance-open-unclaim-claim.view';
import RequestBarangayClearacneAppHistory from './user-pages/menu-pages/record.requestbrgyclearance-open-unclaim-claim.view';
import ChatSupportView from './user-pages/menu-pages/brgyChatSupport.view';
import FilteringView from '../+app/component/common/filtering.view';
import { personnalchatBox } from '../+app/modal/+feature/personnalchat-box.popup';
import BlotterComplaintSummonAppHistory from './user-pages/menu-pages/record.blotter-complaint-summon-close-cancel.view';
import RequestBarangayCedulaAppHistory from './user-pages/menu-pages/record.requestcedula-open-unclaim-claim.view';
import TextFit from '../../tools/components/+common/text-fit';
import NotificationsView from './user-pages/home.page/notifications.view';
import BlotterAppHistory from './user-pages/menu-pages/record.blotter-list.view';
import ImgPreloader from '../../tools/components/+common/img-preloader';
import { chevronDownOutline } from 'ionicons/icons';
import { documentOutline } from 'ionicons/icons';
import { documentsOutline } from 'ionicons/icons';
import ValidGorvernmentIDAppHistory from './user-pages/menu-pages/account.validgovernmentid.list.view';
import EducationBackgroundAppHistory from './user-pages/menu-pages/account.educbackground-list.view';
import OrganizationAppHistory from './user-pages/menu-pages/account.organization-list.view';
import EmployementAppHistory from './user-pages/menu-pages/account.employementhistory-list.view';
import BrgyOfficialAppHistory from './user-pages/menu-pages/record.brgyofficial-list.view';
import EstablishmentView from './user-pages/menu-pages/establishment.view';
import OrherDocumentAppHistory from './user-pages/menu-pages/record.other-document-list.view';

const { LocalNotifications } = Plugins;
const { Object, $, addEventListener, removeEventListener }: any = window;

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
    static instance: UserPager = ({} as any);
    static contextType = NavContext;
    state: any = {
        inner: { width: '500px', height: '100%' },
        u: {},
    }
    input: any = {};
    listpersonalchat: any = [];
    swapper: SwapPager = (mtObj as SwapPager);
    pager = (mtObj as ViewPager);

    componentWillMount = () => {
        app.component(UserPager.instance = this);
        console.log(['UserPageer', UserPager.instance]);
        const { state: { inner } } = this;
        if (!device.isBrowser) {
            Object.rcopy(inner, { width: '100%', height: '100%' });
            this.setState({ inner });
        }
        chatBox.refresh();
    }
    subs: any = {};
    prop: any = {};
    componentDidMount = async () => {
        var IsSignIn = await storage.IsSignIn;
        console.log('IsSignIn');
        if (!IsSignIn) return this.goToIntroPage();
        const { state: { inner } } = this;
        this.subs.u = jUserModify(async () => {
            const u: any = await jUser();
            this.input.Fullname = u.FLL_NM;
            this.input.Username = u.Username;
            this.input.ImageUrl = u.ImageUrl;
            this.input.BarangayName = u.LOC_BRGY_NM;
            this.input.SitioName = u.LOC_SIT_NM;
            if (!!u.ACT_ID) return this.setState({ u });
            var IsSignIn = await storage.IsSignIn;
            if (!IsSignIn) return;
            if (Object.keys(u).length != 0) return;
            timeout(() => jUserModify(), 750);
        });
        this.subs.c = jCompanyModify(async () => this.setState({ c: await jCompany() }));
        //
        if (!device.isBrowser) {
            const { scaleHeight, innerHeight }: any = window;
            const height = (scaleHeight + 'px');
            this.subs.k1 = keyboard.addListener('keyboardWillShow', (info: KeyboardInfo) => {
                inner.height = height;
                this.setState({ inner });
            });
            this.subs.k2 = keyboard.addListener('keyboardWillHide', () => {
                inner.height = '100%';
                this.setState({ inner });
            });
        }
        console.log(['User Pager Sample', UserPager.instance]);
        this.stompReceivers();
        rest.ready(() => this.performRequestDelay({ IsReset: true }));
        //this.deviceInactivity();
        //this.tickerSettings();
    }

    componentWillUnmount() {
        Object.values(this.subs).map((m: any) => m.unsubscribe());
        stomp.disconnect();
    }

    onDidBackdrop() {
        if (app.window.isFullscreen())
            app.window.closeFullscreen();
        else if (!this.pager.back())
            app.attempToClose();
        return false;
    }
    private performRequestDelay(filter: any, callback: Function = mtCb, delay: number = 175) {
        if (this.subs.t1) this.subs.t1.unsubscribe();
        this.prop.IsFiltering = !filter.IsFiltering;
        this.setState({ prop: this.prop });
        this.subs.t1 = timeout(() => this.performRequest(filter, callback), delay);
    }
    private async setInfo(info: any) {
        await jCompany(info, true);
        //this.loadVideoUrl(info.LiveStreamUrl);
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

    private deviceInactivity() {
        const { prop } = this;
        this.subs.inEvent = subscribe(() => {
            $(document.body).on('click.inactivity touchstart.inactivity touchmove.inactivity', () => {
                if (!!this.subs.inTimeout) this.subs.inTimeout.unsubscribe();
                this.subs.inTimeout = interval(() => {
                    if (!!prop.IsSessionEnd) return;
                    this.deviceSessionEnd();
                    this.popUpLogoutMessage('Due to inactivity, your account has been logout!');
                }, (60000 * 15));
            });
            return () => $(document.body).off('.inactivity');
        });
    }

    private tickerSettings() {
        const { prop } = this;
        const defOpt = { NotifAnnouncement: true, NotifLiveStreaming: true, NotifLivePublicChat: true, };
        const callback = async () => {
            if (!!this.subs.t1) this.subs.t1.unsubscribe();
            Object.rcopy(prop, (await storage.PopUpNotif || defOpt));
            this.subs.t1 = timeout(callback, 1250);
        };
        return callback();
    }

    private stompReceivers() {
        console.log('stompReceiver');
        this.subs.wsErr = stomp.subscribe('#error', (err: any) => this.error());
        this.subs.wsConnect = stomp.subscribe('#connect', () => this.connected());
        this.subs.wsDisconnect = stomp.subscribe('#disconnect', () => this.disconnect());
        this.subs.ws1 = stomp.subscribe('/test', (json: any) => this.ReceivedTest(json));
        //this.subs.ws2 = stomp.subscribe('/notify', (json:any)=>this.receivedNotify(json));
        //this.subs.ws2 = stomp.subscribe('/branch', (json:any)=>console.log(json));
        this.subs.ws3 = stomp.subscribe('/branch', (json: any) => this.receivedNotify(json));
        //this.subs.ws4 = stomp.subscribe('/balance', (json:any)=>this.receivedNotify(json));
        this.subs.ws5 = stomp.subscribe('/chat/pub', (json: any) => this.receivedChat(json));
        stomp.ready(() => (stomp.refresh(), stomp.connect()));
    } //

    private ReceivedTest(data: any) {
        console.log(data);
    }
    private error() {
        this.ping(() => this.testPing());
    }
    private connected() {
        this.ping(() => this.testPing());
    }
    private disconnect() {
        this.stopPing();
    }
    private testPing() {
        const { subs } = this;
        this.stopPing();
        this.ping(() => subs.tmPing = timeout(() => this.testPing(), (60000 * 1)));
    }
    private stopPing() {
        const { subs } = this;
        const { tmPing, ping } = subs;
        if (tmPing) tmPing.unsubscribe();
        if (ping) ping.unsubscribe();
    }
    private ping(callback: Function) {
        const { prop, subs } = this;
        this.stopPing();
        this.subs.ping = rest.post('ping', {}).subscribe(async (res: any) => {
            if (res.Status == 'error') {
                if (res.Type == 'device.session-end') {
                    if (!!prop.IsSessionEnd) return;
                    this.deviceSessionEnd();
                    return this.popUpLogoutMessage(res.Message);
                }
            }
            if (!stomp.IsConnected)
                return;
            return callback();
        }, (err: any) => {
            if (!stomp.IsConnected)
                return;
            return callback();
        });
    }

    private receivedNotify(data: any) {
        const { prop, state: { u } } = this;
        if (data.type == 'post-event') {
            console.log('Notification');
            additionalNotification(1);
        }
        else if (data.type == 'app-update') {
            additionalNotification(1);
        }
        else if (data.type == 'post-notification' || data.type == 'post-result') {
            additionalNotification(1);
            if (device.isBrowser) return;
            var content = data.content[0];
            var popup = true, id = +(new Date()), smallIcon = 'icon_bell';
            if (content.Type == 'streaming') {
                id = 10001;
                smallIcon = 'icon_stop';
                popup = !!prop.NotifLiveStreaming;
            }
            else if (content.Type == 'post-result') {
                popup = !!prop.NotifAnnouncement;
                id = 10002;
            }
            if (!popup) return;
            LocalNotifications.schedule({
                notifications: [{
                    id: id,
                    smallIcon: smallIcon,
                    title: content.Title,
                    body: content.Description,
                }]
            });
        } else if (data.type == 'notification') {
            additionalNotification(1);
            if (device.isBrowser) return;
            var content = data.content[0];
            var popup = !!prop.NotifAnnouncement;
            var id = +(new Date()), smallIcon = 'icon_bell';
            if (!popup) return;
            LocalNotifications.schedule({
                notifications: [{
                    id: id,
                    smallIcon: smallIcon,
                    title: content.Title,
                    body: content.Description,
                }]
            });
            if (content.Type == 'change-password') {

            }
        } else if (data.type == 'load-credit' || data.type == 'credit-approval') {
            additionalNotification(1);
            this.pager.performPagerFocus();
            return this.popUpLoadedCredit(data.content[0]);
        } else if (data.type == 'request-credit') {
            additionalNotification(1);
            if (device.isBrowser) return;
            var content = data.content[0];
            var popup = !!prop.NotifAnnouncement;
            var id = +(new Date());
            if (!popup) return;
            LocalNotifications.schedule({
                notifications: [{
                    id: id,
                    smallIcon: 'icon_bell',
                    title: content.Title,
                    body: content.Description,
                }]
            });
        } else if (data.type == 'winning-approval') {
            if (!data.is_encashment) {
                additionalNotification(1);
                return this.performCheckBalance();
            }
        } else if (data.type == 'game-winning') {
            additionalNotification(1);
            var popup = !!prop.NotifAnnouncement;
            var content = data.content[0];
            if (!popup) return;
            LocalNotifications.schedule({
                notifications: [{
                    id: +(new Date()),
                    smallIcon: 'icon_bell',
                    title: content.Title,
                    body: content.Description,
                }]
            });
            return this.popUpWinning(content);
        } else if (data.type == 'device.session-end') {
            this.deviceSessionEnd();
            return this.popUpLogoutMessage(data.message);
        } else if (data.type == 'add-commission') {
            if (u.IsPlayer) return;
            additionalCommissionBalance(data.content || 0);
        }
    }


    private receivedChat(data: any) {
        const { prop } = this;
        if (data.type == 'public') {
            var content = data.content;
            var message = (content.Messages[0] || null);
            if (!message) return;
            var popup = !!prop.NotifLivePublicChat;
            if (!popup) return;
            chatBox.widget(message);
        }
    }
    //
    private popUpLogoutMessage(message: string) {
        Alert.showWarningMessage(message, (res: any) => {
            setTimeout(async () => (await modalController.getTop() || { dismiss: mtCb }).dismiss(), 275);
            this.goToSignInPage(); //true
        });
    }
    private async popUpLoadedCredit(data: any) {
        this.performCheckBalance();
        const modal = await CreditReceivedPopUp.modal((data || mtObj).Amount || 0.00);
        await modal.present();
    }
    private async popUpWinning(data: any) {
        const modal = await UWinPopUp.modal((data || mtObj).Amount || 0.00);
        await modal.present();
    }
    private async performCheckBalance() {
        //checkBalances();
        this.pager.performPagerFocus();
    }
    private goToSignInPage() {
        return this.context?.navigate('/out', 'forward', 'pop');
    }
    private goToIntroPage() {
        return this.context?.navigate('/intro', 'forward', 'pop');
    }
    private deviceSessionEnd() {
        this.prop.IsSessionEnd = true;
        storage.IsSignIn = false;
        jUser({});
        storage.Auth = {};
    }
    hGameProfile = () => {
        console.log('hGameProfile');
        this.pager.next(MemberProfileAccount);
    }
    hbrgySupport = async () => {
        console.log('hbrgySupport');
        this.pager.next(ChatSupportView);
    }
    hChangePassword = async () => {
        console.log('hChangePassword');
        this.pager.next(ChangePassword);
        //this.pager.next(ChangePasswordView);
    }

    hOrganization = () => {
        this.pager.next(OrganizationAppHistory);
    }
    hEmployementHistory = () => {
        this.pager.next(EmployementAppHistory);
    }
    hGovernmentID = () => {
        this.pager.next(ValidGorvernmentIDAppHistory);
    }
    hEducationalBackground = () => {
        this.pager.next(EducationBackgroundAppHistory);
    }
    hMemo = async () => {
        console.log('hMemo');
        this.pager.next(MemorandumHistory);
    }
    hbrgyofficial = async () => {
        this.pager.next(BrgyOfficialAppHistory);
    }


    hHome = () => {
        this.pager.next(HomeView);
    }
    hEstablshiment = async () => {
        this.pager.next(EstablishmentView);
    }
    hReportIssuesConcern = async () => {
        console.log('hReportIssuesConcern');
        //this.pager.next(IssuesConcerHistory);
        this.pager.next(IssuesConcernAppHistory);
    }
    hRequestBarangayClearance = async () => {
        console.log('hRequestBarangayClearance');
        this.pager.next(RequestBarangayClearacneAppHistory);
    }

    hRequestBarangayCedula = async () => {
        console.log('hRequestBarangayCedula');
        this.pager.next(RequestBarangayCedulaAppHistory);
    }

    hRequestBarangayBusinessClearance = async () => {
        console.log('hRequestBarangayBusinessClearance');
        this.pager.next(RequestBarangayBusinessClearacneAppHistory);
    }
    hBrgyBlotter = async () => {
        console.log('hRequestBarangayBusinessClearance');
        //this.pager.next(BlotterComplaintSummonAppHistory);
        this.pager.next(BlotterAppHistory);
    }
    hRequestBarangayOtherDocument = async () => {
        console.log('hRequestBarangayOtherDocument');
        this.pager.next(OrherDocumentAppHistory);
    }
    hEventsList = async () => {
        console.log('hEventsList');
        this.pager.next(EventsView);
    }
    //
    hPageChange = () => {
        this.setState({ ...this.state, ready: true });
        (!!this.elBottomPanel && this.elBottomPanel.onPageChange());
    }
    hPageBack = () => {
        (!!this.elBottomPanel && this.elBottomPanel.onPageBack());
    }
    private performRequestDetailDelay(filter: any, callback: Function = mtCb, delay: number = 175) {
        if (this.subs.t1) this.subs.t1.unsubscribe();
        this.prop.IsFiltering = !filter.IsFiltering;
        this.prop.RequestID = filter.RequestID;
        this.setState({ prop: this.prop });
        this.subs.t1 = timeout(() => this.performRequestDetail(filter, this.input, callback), delay);
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

    hSelectOperator = async () => {
        const modal = await BarangayOperatorPopUp.modal("Barangay Operator", { Type: 2, ID: "" });
        await modal.present();
        const input = this.input;
        const res = await modal.onDidDismiss();
        const data = (res || mtObj).data;
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
    hMessages = () => {
        this.pager.next(NotificationsView);
        //this.pager.next(HomeView);
    }

    hSignOut = () => {
        Alert.swal({
            title: 'Confirmation',
            text: 'Are you sure you want to log out?',
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
                this.deviceSessionEnd();
                return Alert.showSuccessMessage('You have logged out', () => this.goToSignInPage());
            }
        });
    }

    showGroupItem = async () => {
        const input = this.input;
        input.ShowDocuments = input?.ShowDocuments ? false : true;
        this.setState({ input: this.input });
        console.log(input.ShowDocuments)
    }
    //
    elBottomPanel: BottomPanel = (null as any);
    lstMessages: any = null;
    render() {
        const { inner = {}, ready = false } = this.state;
        const { u = {} } = this.state;
        this.prop.ImageData = './assets/img/icon_blank_profile.png';
        this.input.Icon = (this.input.Icon || chevronForwardOutline);
        return (<>
            <IonPage id="main-content">
                <div className='horizontal'>
                    <Layout full style={styles('position:relative;background-color:white;max-width:100%;width:100%;height:100%', { width: inner.width, height: inner.height })}>

                        <div className="app-bg3"></div>
                        <Layout auto>
                            <ViewPager ref={(ref: any) => this.pager = ref} default={HomeTabs} onPageChange={this.hPageChange} onPageBack={this.hPageBack} />
                        </Layout>
                        <BottomPanel ref={(ref: any) => this.elBottomPanel = ref} />
                    </Layout>
                </div>
            </IonPage>
            {!ready ? null : <>
                {/* <IonMenu content-id="main-content">
                    <IonHeader>
                        <Layout>
                            <div style={styles('position:relative;padding:5%;')}>
                                <IonMenuToggle>
                                    <div className="horizontal">
                                        <div style={styles('margin:5px 0px;position:relative;')}>
                                            <div style={styles('height:100px;border-radius:50%;overflow:hidden;display:flex;justify-content:center;border: 3px solid rgb(0,6,69);')} onClick={this.hGameProfile}>
                                                <ImgPreloader placeholder="./assets/img/icon_blank_profile.png"
                                                    src={(this.input.ImageUrl || this.prop.ImageData)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </IonMenuToggle>
                                <div style={styles('text-align:center;')}>
                                    <IonTitle>{this.input.Fullname}</IonTitle>
                                </div>
                                <div style={styles('text-align:center;')}>
                                    <IonLabel style={styles('font-size:10pt')}>
                                        {this.input.Username}
                                        <span style={styles('font-size:5px;vertical-align:middle;')}>&nbsp;&#9899;&nbsp;</span>
                                        {this.input.BarangayName}
                                        <span style={styles('font-size:5px;vertical-align:middle;')}>&nbsp;&#9899;&nbsp;</span>
                                        {this.input.SitioName}
                                    </IonLabel>
                                </div>
                            </div>
                        </Layout>
                    </IonHeader>
                    <IonContent>

                        <IonList style={styles('background: transparent;margin-top:3%;')}>
                            <IonMenuToggle>
                                <IonItem>
                                    <IonIcon slot="start" icon={homeOutline}></IonIcon>
                                    <IonLabel onClick={this.hHome}>
                                        Home
                                    </IonLabel>
                                </IonItem>
                            </IonMenuToggle>
                            <IonItem>
                                <IonIcon slot="start" icon={documentsOutline} />
                                <IonIcon slot="end" onClick={this.showGroupItem} icon={!this.input.ShowDocuments ? addCircleOutline : removeCircleOutline} style={!this.input.ShowDocuments ? styles('transition:0.3s;transform:rotate(-90deg);') : styles('transition:0.3s;')} />
                                <IonLabel onClick={this.showGroupItem}>
                                    Documents
                                </IonLabel>
                            </IonItem>
                            <div style={this.input.ShowDocuments == true ? styles('position:relative;height:250px;transition:height 1s;') : styles('position:relative;height:0px;transition:height 1s;')}>
                                <IonList style={styles('margin-left:5%;')} >
                                    <IonMenuToggle>
                                        <IonItem button>
                                            <IonIcon slot="start" icon={readerOutline}></IonIcon>
                                            <IonLabel onClick={this.hRequestBarangayCedula}>
                                                Cedula (CTC)
                                            </IonLabel>
                                        </IonItem>
                                    </IonMenuToggle>
                                    <IonMenuToggle>
                                        <IonItem button>
                                            <IonIcon slot="start" icon={readerOutline}></IonIcon>
                                            <IonLabel onClick={this.hRequestBarangayClearance}>
                                                Brgy. Clearance
                                            </IonLabel>
                                        </IonItem>
                                    </IonMenuToggle>
                                    <IonMenuToggle>
                                        <IonItem button>
                                            <IonIcon slot="start" icon={readerOutline}></IonIcon>
                                            <IonLabel onClick={this.hRequestBarangayBusinessClearance}>
                                                Brgy Business Permit
                                            </IonLabel>
                                        </IonItem>
                                    </IonMenuToggle>
                                    <IonMenuToggle>
                                        <IonItem button>
                                            <IonIcon slot="start" icon={readerOutline}></IonIcon>
                                            <IonLabel onClick={this.hRequestBarangayOtherDocument}>
                                                Other Document
                                            </IonLabel>
                                        </IonItem>
                                    </IonMenuToggle>
                                    <IonMenuToggle>
                                        <IonItem button>
                                            <IonIcon slot="start" icon={readerOutline}></IonIcon>
                                            <IonLabel onClick={this.hBrgyBlotter}>
                                                Complaint
                                            </IonLabel>
                                        </IonItem>
                                    </IonMenuToggle>
                                    <IonMenuToggle>
                                        <IonItem button>
                                            <IonIcon slot="start" icon={readerOutline}></IonIcon>
                                            <IonLabel onClick={this.hMemo}>
                                                Memorandum
                                            </IonLabel>
                                        </IonItem>
                                    </IonMenuToggle>
                                </IonList>
                            </div>
                            <IonMenuToggle>
                                <IonItem>
                                    <IonIcon slot="start" icon={personCircleOutline}></IonIcon>
                                    <IonLabel onClick={this.hGovernmentID}>
                                        Valid Government ID
                                    </IonLabel>
                                </IonItem>
                            </IonMenuToggle>
                            <IonMenuToggle>
                                <IonItem>
                                    <IonIcon slot="start" icon={schoolSharp}></IonIcon>
                                    <IonLabel onClick={this.hEducationalBackground}>
                                        Educational Attainment
                                    </IonLabel>
                                </IonItem>
                            </IonMenuToggle>
                            <IonMenuToggle>
                                <IonItem>
                                    <IonIcon slot="start" icon={businessSharp}></IonIcon>
                                    <IonLabel onClick={this.hEmployementHistory}>
                                        Employment History
                                    </IonLabel>
                                </IonItem>
                            </IonMenuToggle>
                            <IonMenuToggle>
                                <IonItem>
                                    <IonIcon slot="start" icon={personCircleOutline}></IonIcon>
                                    <IonLabel onClick={this.hOrganization}>
                                        Organization
                                    </IonLabel>
                                </IonItem>
                            </IonMenuToggle>
                            <IonMenuToggle>
                                <IonItem button>
                                    <IonIcon slot="start" icon={informationCircleOutline}></IonIcon>
                                    <IonLabel onClick={this.hReportIssuesConcern}>
                                        Issues and Concern
                                    </IonLabel>
                                </IonItem>
                            </IonMenuToggle>
                            <IonMenuToggle>
                                <IonItem button>
                                    <IonIcon slot="start" icon={todayOutline}></IonIcon>
                                    <IonLabel onClick={this.hEventsList}>
                                        Events
                                    </IonLabel>
                                </IonItem>
                            </IonMenuToggle>
                            <IonMenuToggle>
                                <IonItem button>
                                    <IonIcon slot="start" icon={peopleCircleOutline}></IonIcon>
                                    <IonLabel onClick={this.hMemo}>
                                        Barangay Official
                                    </IonLabel>
                                </IonItem>
                            </IonMenuToggle>

                            <IonMenuToggle>
                                <IonItem button>
                                    <IonIcon slot="start" icon={listCircleOutline}></IonIcon>
                                    <IonLabel onClick={this.hEstablshiment}>
                                        Establishment List
                                    </IonLabel>
                                </IonItem>
                            </IonMenuToggle>
                            <IonMenuToggle>
                                <IonItem button>
                                    <IonIcon slot="start" icon={peopleCircleOutline}></IonIcon>
                                    <IonLabel onClick={this.hbrgyofficial}>
                                        Barangay Official
                                    </IonLabel>
                                </IonItem>
                            </IonMenuToggle>
                            <IonMenuToggle>
                                <IonItem button>
                                    <IonIcon slot="start" icon={chatbubblesOutline}></IonIcon>
                                    <IonLabel onClick={this.hbrgySupport}>
                                        Contact Brgy Operator
                                    </IonLabel>
                                </IonItem>
                            </IonMenuToggle>
                            <IonMenuToggle>
                                <IonItem button>
                                    <IonIcon slot="start" icon={notificationsCircleOutline}></IonIcon>
                                    <IonLabel onClick={this.hMessages}>
                                        Notifications
                                    </IonLabel>
                                    <div className='col-2 p-0'>
                                        <div className="btn-top_sm_msg" >
                                            {!((u.NotificationCount || 0) > 0) ? null : <>
                                                <div className="vertical count">
                                                    <div><TextFit text={(100 > u.NotificationCount ? u.NotificationCount : '99+')} /></div>
                                                </div>
                                            </>}
                                        </div>
                                    </div>

                                </IonItem>
                            </IonMenuToggle>
                            <IonMenuToggle>
                                <IonItem button>
                                    <IonIcon slot="start" icon={keySharp}></IonIcon>
                                    <IonLabel onClick={this.hChangePassword}>
                                        Change Password
                                    </IonLabel>
                                </IonItem>
                            </IonMenuToggle>
                            <IonMenuToggle>
                                <IonItem button>
                                    <IonIcon slot="start" icon={logOutOutline}></IonIcon>
                                    <IonLabel onClick={this.hSignOut}>
                                        Log-out
                                    </IonLabel>
                                </IonItem>
                            </IonMenuToggle>
                        </IonList>
                    </IonContent>
                </IonMenu> */}
            </>}
        </>);
    }
}
const Item: React.FC<{ name: any, icon: any, onClick?: React.MouseEventHandler }> = React.memo(({ name, icon, onClick }) => {
    return (<>
        <ListItem className="list-item bg arrow" onClick={onClick}>
            <div className="row m-0 details ion-activatable">
                <IonRippleEffect />
                <div className="col-3 horizontal">
                    <div className="horizontal" style={styles('height:40px;width:40px')}>
                        <img src={icon} style={styles('height:100%')} />
                    </div>
                </div>
                <div className="col-9 vertical title">{name}</div>
            </div>
        </ListItem>
    </>);
});
class StaticComponentView extends React.Component<{ instance: UserPager }>{
    shouldComponentUpdate = () => false;
    render() {
        const { instance } = this.props;
        return (<>
            <div className="app-bg3"></div>
            <Layout auto>
                <ViewPager ref={(ref: any) => instance.pager = ref} default={HomeTabs} onPageChange={instance.hPageChange} onPageBack={instance.hPageBack} />
            </Layout>
            <BottomPanel ref={(ref: any) => instance.elBottomPanel = ref} />
        </>);
    }
}

class BottomPanel extends React.Component {
    get pager() { return UserPager.instance.pager; }
    state: any = { c: {}, disabledBet: true };
    componentWillMount = () => {
        this.subs.c = jCompanyModify(async () => this.setState({ c: await jCompany() }));
    }

    subs: any = {};
    componentDidMount() {
        //this.tickerSettings();
    }
    componentWillUnmount() {
        Object.values(this.subs).map((m: any) => m.unsubscribe());
    }

    private tickerSettings() {
        const callback = async () => {
            const { prop, state } = this;
            if (!!this.subs.t1) this.subs.t1.unsubscribe();
            const settings = (await storage.GameDisabled || {});
            if (!!settings.IsDisabledBet) {
                var from = 0, until = 0;
                var today: any = moment(moment().format('MMM DD, YYYY hh:mm A'));
                var todaydt = today.format('MMM DD, YYYY');
                try {
                    from = moment(todaydt + ' ' + settings.BetDisabledFromTm).valueOf();
                    until = moment(todaydt + ' ' + settings.BetDisabledUntilTm).valueOf();
                } catch { }
                today = today.valueOf();
                prop.disabledBet = (from <= today && today <= until);
            } else prop.disabledBet = false;
            if (prop.disabledBet != state.disabledBet) {
                const disabledBet = prop.disabledBet;
                this.setState({ disabledBet });
            }
            this.subs.t1 = timeout(callback, 1250);
        };
        return callback();
    }

    prop: any = {};
    onPageChange() {
        const { prop } = this;
        prop.isPlaying = false;
        this.setState({ prop });
    }
    onPageBack() {
        const { prop } = this;
        if (this.pager.currentComponent.type == HomeTabs) {
            if (!!prop.focusInGameView) {
                prop.isPlaying = true;
                this.setState({ prop });
            }
        }
    }

    hHomeButton = () => {
        this.backToHomeView((view: HomeView) => view.viewStreaming());
    }
    hPlayButton = () => {
        const { state: { disabledBet } } = this;
        if (disabledBet) return;
        this.backToHomeTabs((pager: HomeTabs) => pager.setView(GameView), true);
    }
    hPlayConfirmButton = () => {
        const { prop, state: { disabledBet } } = this;
        if (disabledBet)
            return toast('You disabled the game!');
        if (!prop.isPlaying) return;
        const { instance }: { instance: HomeTabs } = this.pager.currentComponent;
        if (!instance) return;
        const view: GameView = instance.getView();
        (!!view && view.performConfirmBets());
    }
    hShareAppButton = () => {
        const { c: { AppSharingDescription } } = this.state;
        openSms('', AppSharingDescription);
    }
    hRecordsButton = () => {
        this.backToHomeView((view: HomeView) => view.viewTicket());
    }
    hResultsButton = () => {
        this.backToHomeView((view: HomeView) => view.viewResult());
    }
    private backToHomeView(callback: Function) {
        this.backToHomeTabs((pager: HomeTabs) => pager.setView(HomeView,
            (view: any) => callback(view.instance)));
    }
    private backToHomeTabs(callback: Function, focused: boolean = false) {
        const { prop } = this;
        this.pager.backTo(HomeTabs, true, (view: any) => {
            callback(view.instance);
            prop.focusInGameView = prop.isPlaying = focused;
            this.setState({ prop });
        });
    }
    render() {
        const { prop = {}, disabledBet = false, } = this.state;
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
        this.subs.s1 = rest.post('brgyoperator', Object.rcopy(filter, this.filter)).subscribe(async (res: any) => {
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
const ListItem = styled.div`
height: 50px;
`;





