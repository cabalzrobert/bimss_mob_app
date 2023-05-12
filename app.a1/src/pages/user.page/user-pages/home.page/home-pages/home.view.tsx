import React from 'react';
import Layout from '../../../../../tools/components/+common/layout';
import { mtCb, mtObj } from '../../../../../tools/plugins/static';
import TextFit from '../../../../../tools/components/+common/text-fit';
import { numberWithComma } from '../../../../../tools/global';
import { classNames, styles } from '../../../../../tools/plugins/element';
import UserPager from '../../../user-pager';
import SwapPager, { OnSwapFocus, OnSwapLeave } from '../../../../../tools/components/+feature/swap-pager';
import { checkBalances, jUser, jUserModify, livestreamupdate, notificationCount } from '../../../../+app/user-module';
import { stomp } from '../../../../+app/+service/stomp.service';
import MenusView from '../../menu-pages/menu.menus.view';
import BuyCreditsPopUp from '../../../../+app/modal/buy-credits.popup';
import { OnPagerFocus } from '../../../../../tools/components/+feature/view-pager';
import StreamingHomeView from './home.streaming.view';
import NotificationsView from '../notifications.view';
import Recycler from '../../../../../tools/components/+feature/recycler';
import RecyclerStorage from '../../../../intro.page/recycler-storage';
import ImgPreloader from '../../../../../tools/components/+common/img-preloader';
import PhotoViewerPopUp from '../../../../../tools/components/+common/modal/photo-viewer.popup';
import Stack, { Alert, Modal } from '../../../../../tools/components/+common/stack';
import { IonButton, IonButtons, IonCard, IonCardContent, IonCol, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonMenuButton, IonRefresher, IonRefresherContent, IonRippleEffect, IonRow, IonSegment, IonSegmentButton, IonSpinner, IonTitle, IonToolbar } from '@ionic/react';
import { alertCircleOutline, businessOutline, chatboxEllipsesOutline, chatbubbleEllipses, chatbubblesOutline, documentTextOutline, documentsOutline, homeOutline, homeSharp, idCardOutline, journalOutline, keySharp, listCircleOutline, logOutOutline, logoAndroid, logoIonic, logoJavascript, menuOutline, newspaperOutline, notificationsOutline, peopleCircleOutline, personCircleOutline, readerOutline, reorderThreeOutline, schoolSharp, todayOutline, walkOutline, warningOutline } from 'ionicons/icons';
import BrgyOfficialAppHistory from '../../menu-pages/record.brgyofficial-list.view';
import { KeyboardInfo, Geolocation } from '@capacitor/core';
import FilteringView from '../../../../+app/component/common/filtering.view';
import NotFound2View from '../../../../+app/component/common/not-found.view';
import { rest } from '../../../../+app/+service/rest.service';
import { toast } from '../../../../../tools/plugins/toast';
import { timeout } from '../../../../../tools/plugins/delay';
import { keyboard } from '../../../../../tools/plugins/keyboard';
import { device } from '../../../../../tools/plugins/device';
import { OnDidBackdrop, app } from '../../../../../tools/app';
import RequestBarangayCedulaAppHistory from '../../menu-pages/record.requestcedula-open-unclaim-claim.view';
import ChatSupportView from '../../menu-pages/brgyChatSupport.view';
import MemberProfileAccount from '../../menu-pages/member.account-profile.view';
import ChangePassword from '../../menu-pages/changepassword.account.view';
import { storage } from '../../../../../tools/plugins/storage';
import EstablishmentView from '../../menu-pages/establishment.view';
import ValidGorvernmentIDAppHistory from '../../menu-pages/account.validgovernmentid.list.view';
import OrganizationAppHistory from '../../menu-pages/account.organization-list.view';
import EducationBackgroundAppHistory from '../../menu-pages/account.educbackground-list.view';
import EmployementAppHistory from '../../menu-pages/account.employementhistory-list.view';
import RequestBarangayClearacneAppHistory from '../../menu-pages/record.requestbrgyclearance-open-unclaim-claim.view';
import RequestBarangayBusinessClearacneAppHistory from '../../menu-pages/record.requestbrgybusinessclearance-open-unclaim-claim.view';
import BlotterAppHistory from '../../menu-pages/record.blotter-list.view';
import OrherDocumentAppHistory from '../../menu-pages/record.other-document-list.view';
import MemorandumHistory from '../../menu-pages/record.memo-list.view';
import MenuSettingsView from '../../menu-pages/menu.settings.view';
import { IonicNativePlugin } from '@ionic-native/core';
import EventsView from '../../menu-pages/events.view';
import IssuesConcernAppHistory from '../../menu-pages/record.issuesconcern-open-pending-close.view';
import EmergencyAlertHistory from '../../menu-pages/record.emergency-alert-list.view';

const { Object }: any = window;
const { data } = (window as any);
const { Group } = data;
const { locations } = data;

export default class HomeView extends React.Component implements OnPagerFocus, OnSwapFocus, OnSwapLeave {
    onPagerFocus = () => this.holder.onPagerFocus();
    onSwapFocus = () => this.holder.onSwapFocus();
    onSwapLeave = () => this.holder.onSwapLeave();
    //
    viewTicket = () => this.holder.swapper.show(TicketHomeView);
    viewStreaming = () => this.holder.swapper.show(StreamingHomeView);
    viewResult = () => this.holder.swapper.show(ResultHomeView);
    //
    shouldComponentUpdate = () => false;
    holder: ViewHolder = (null as any);
    render() {
        return (<>
            <Recycler storage={RecyclerStorage.instance} from={ViewHolder} bind={(ref) => this.holder = ref} />
        </>);
    }
}

export class ViewHolder extends React.Component {
    state: any = { u: {} };
    get cont3xt() { return UserPager.instance.context; }
    get pager() { return UserPager.instance.pager; }
    componentWillMount = () => this.willMount(false);
    subs: any = {};
    prop: any = {};
    input: any = {};
    willMount = (didMount = true) => {
        const input: any = this.input;
        const prop = (this.prop = { didMount: didMount });
        this.setState({ prop });
        this.stompReceivers();
        if (!didMount) return;

        this.subs.u = jUserModify(async () => {
            const u: any = await jUser();
            if (u.IsCoordinator || u.IsGeneralCoordinator)
                u.IsPlayer = false;
                Object.rcopy(input, {
                    PL_ID: u.PL_ID,
                    PGRP_ID: u.PGRP_ID,
                    Userid: u.USR_ID,
                    Fullname: u.FLL_NM,
                    MobileNumber: u.MOB_NO,
                    Region: u.LOC_REG,
                    Province: u.LOC_PROV,
                    Municipality: u.LOC_MUN,
                    Barangay: u.LOC_BRGY,
                    Firstname: u.FRST_NM,
                    ImageUrl: u.ImageUrl
                });
                var region = (locations.Region.find((f: any) => f.Code == input.Region) || mtObj);
                input.Island = (region.Island || '').replace(input.Country, '');
                var regioncode = `${input.Island}${input.Region}`;
                var provincecode = `${regioncode}${input.Province}`;
                var municipalitycode = `${provincecode}${input.Municipality}`;
                input.BarangayName = (((locations.Barangay.find((f: any) => f.Municipality == municipalitycode) || mtObj).Barangay || []).find((f: any) => f.Code == input.Barangay) || mtObj).Name;
                this.setState({ u, input});
                console.log(this.input);
            this.setState({ u });
        });

    }
    didMount = () => {
        const { input } = this;
        if (!this.prop.didMount) return;
        this.stompReceivers();
        this.prop.isReady = true;
        var grp = Group[0] || {};
        input.plid = grp.PLID;
        input.groupid = grp.GroupID;
        input.psncd = grp.PSNCD;
        this.setState({ input });
    }
    willUnmount = () => {
        Object.values(this.subs).map((m: any) => m.unsubscribe());
        //
        const { prop } = this;
        prop.didMount = false;
        this.setState({ prop });
    }

    private stompReceivers() {
        //this.subs.connected = this.stomp.subscribe('#connect', ()=>this.connected());
        //this.subs.disconnected = this.stomp.subscribe('#disconnect', ()=>this.disconnected());
        //this.subs.sub1 = this.stomp.subscribe('/arena', (json)=>this.receivedNotify(json));
        this.subs.ws1 = stomp.subscribe('/notify', (json: any) => this.receivedNotify(json));
        this.subs.ls = stomp.subscribe('/livestream', (json: any) => this.updatelivestream(json))
        //this.subs.ws2 = stomp.subscribe('/balance', (json:any)=>this.receivedNotify(json));
    }
    private async receivedNotify(data: any) {
        if (data.type == 'load-credit' || data.type == 'credit-approval') {
            await this.refreshData();
        } else if (data.type == 'add-commission') {
            if (this.state.u.IsPlayer) return;
            await this.refreshData();
        }
    }
    private async updatelivestream(data: any) {
        if (data.type == 'load-credit' || data.type == 'credit-approval') {
            await this.refreshData();
        } else if (data.type == 'add-commission') {
            if (this.state.u.IsPlayer) return;
            await this.refreshData();
        }
    }


    onPagerFocus = () => this.focused();
    onSwapFocus = () => this.focused();
    private focused() {
        if (!this.prop.isReady) return;
        this.refreshAccount();
        notificationCount();
        // this.refreshLiveStream();
        //livestreamupdate();
        //
        // this.swapper.performViewFocus();
    }
    onSwapLeave() {
        // this.swapper.performViewLeave();
    }
    private refreshLiveStream() {
        livestreamupdate();
    }
    private refreshAccount() {
        //checkBalances();
    }
    private async refreshData() {
        jUserModify();
    }
    hMessages = () => {
        this.pager.next(NotificationsView);
    }

    hMenu = () => {
        this.pager.next(MenusView);
    }
    private goToSignInPage() {
        return this.cont3xt?.navigate('/out', 'forward', 'pop');
    }
    
    hViewImg = async () => {
        // this.input.ImageUrl = './assets/img/STLPartyListTarp.png';
        const img = this.input.ImageUrl;
        if (!img) return;
        const modal = await PhotoViewerPopUp.modal('Preview', img);
        await modal.present();
    }

    hbrgyofficial = async () => {
        this.pager.next(BrgyOfficialAppHistory);
    }

    hEmergencyAlert = async () => {
        const coordinates = await Geolocation.getCurrentPosition();
        console.log(coordinates);
        const modal = await EmergencyAlertPopUp.modal('Emergency', {Type: 2,PL_ID: this.input.PL_ID,PGRP_ID: this.input.PGRP_ID,UserId: this.input.Userid,Latitude: coordinates.coords.latitude,Longitude: coordinates.coords.longitude,Brgyname: this.input.BarangayName,Sendername: this.input.Fullname,Mobileno: this.input.MobileNumber});
        await modal.present();
        const res = await modal.onDidDismiss();
        const data = (res || mtObj).data;
        if (!data) return;
    }

    hSettings = () => {
        //console.log('hSettings');
        this.pager.next(MenuSettingsView);
        //MenusView
        //this.pager.next(MenusView);
    }

    hProfile = () => {
        console.log('hProfile');
        this.pager.next(MemberProfileAccount);
    }
    
    hPullRefresh = (ev: any) => {
        ev.detail.complete();
    }

    //
    swapper: SwapPager = (mtObj as SwapPager);
    render() {
        const { u = {}, input = {}, prop: { didMount } } = this.state;
        // const { input = {} } = this.state;
        const notifications: number=0;
        return (<>
            <Layout full>
                <Layout>
                    <div className="home-container">
                    <div className="row m-0" style={styles('height:100px;padding-bottom:30%;')}>
                        <div className="col-4 p-0">
                            <div style={styles('position:relative;height:80px;')}>
                                <img className="img-fit-bimss" src="./assets/img/bimss.png"></img>
                            </div>
                        </div>
                        <div className="col-8 p-0">
                            <IonRow>
                                <IonCol></IonCol>
                                <IonCol></IonCol>
                                <IonCol>
                                    {/* <div className="emergency" style={styles('right:15%;')}>
                                        <IonButton className="btn-emergency" color="primary" 
                                            onClick={this.hEmergencyAlert} style={styles('font-size:12pt;')}>
                                            Help
                                        </IonButton>
                                    </div> */}
                                </IonCol>
                                <IonCol style={styles('top:10px;right:2%;')}>
                                    <div onClick={this.hSettings}>
                                        <IonIcon icon={menuOutline} style={styles('font-size:30pt;')}/>
                                    </div>
                                </IonCol>
                            </IonRow>
                        </div>
                    </div>
                    {/* <div style={styles('width:100px;height:100%')}>
                        <div className="horizontal">
                            <div className="vertical" style={styles('width:50%')}>

                                <div className="btn-top_sm_msg" onClick={this.hMessages} >
                                    {!((u.NotificationCount || 0) > 0) ? null : <>
                                        <div className="vertical count">
                                            <div><TextFit text={(100 > u.NotificationCount ? u.NotificationCount : '99+')} /></div>
                                        </div>
                                    </>}
                                </div>

                            </div>
                        </div>
                    </div> */}
                    <div className="profile-container" style={styles('position:absolute;width:100%;padding:0 15px 0 15px;top:8%;')}>
                        <IonCard style={styles('border-radius:15px;--background:rgb(219 221 237);')}>
                            <IonCardContent>
                                <div className="row m-0">
                                    <div className="col-3 p-0">
                                        <div className="home-horizontal">
                                            <div style={styles('margin:10px 5px 0 5px;position:relative;')}>
                                                <div slot="end" style={styles('height:60px;width:60px;border-radius:50%;overflow:hidden;display:flex;justify-content:left;')} onClick={this.hViewImg}>
                                                    <ImgPreloader placeholder="./assets/img/icon_blank_profile.png"
                                                        src={(input.ImageUrl)} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-9 p-0">
                                        <div className="prof-detail" >
                                            <div className="prof-title">
                                                <IonLabel style={styles('font-size:18pt;')}>Hi, {input.Firstname}</IonLabel>
                                                <IonIcon className={1 > u.NotificationCount ? '':'notify-shake'} size="large" icon={notificationsOutline} 
                                                style={styles('font-size:18pt;float:right;')}
                                                onClick={this.hMessages}/>
                                                <div className="btn-top_sm_msg" onClick={this.hMessages}>
                                                    {!((u.NotificationCount || 0) > 0) ? null : <>
                                                    <div className="vertical count">
                                                        <div><TextFit text={(100 > u.NotificationCount ? u.NotificationCount : '99+')} /></div>
                                                    </div>
                                                    </>}
                                                </div>
                                            </div>
                                            <div className="prof-greet">
                                                <IonLabel>Welcome back to BIMSS</IonLabel>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </IonCardContent>
                            <div className="view-prof">
                                <IonItem lines="none">
                                    <IonButton slot="start" style={styles('font-size:10pt;')}
                                    onClick={this.hProfile}>
                                        View Profile
                                    </IonButton>
                                </IonItem>
                            </div>
                        </IonCard>
                    </div>
                    </div>
                    
                </Layout>
                <HomeMenu u={u} Opts={this.input}/>
            </Layout>
        </>);
    }
}

class HomeMenu extends React.Component<{u: any, Opts: any}>{
    get pager() {return UserPager.instance.pager;}
    get cont3xt() { return UserPager.instance.context; }
    u: any = this.props.u;
    input: any = {SelectMenu: 'Home'};
    prop: any = {};
    filter: any = this.props.Opts;
    hProfile = () => {
        console.log('hProfile');
        this.pager.next(MemberProfileAccount);
    }

    hBrgyOfficial = () => {
        console.log('hBrgyOfficial');
        this.pager.next(BrgyOfficialAppHistory);
    }

    hSelectionMenu = (e: any) => {
        const input = this.input;
        input.SelectMenu = e.detail.value
        this.setState({input: this.input});
        console.log(input);
    }

    hRequestBarangayCedula = async () => {
        console.log('hRequestBarangayCedula');
        this.pager.next(RequestBarangayCedulaAppHistory);
    }

    hRequestBarangayClearance = async () => {
        console.log('hRequestBarangayClearance');
        this.pager.next(RequestBarangayClearacneAppHistory);
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

    hMemo = async () => {
        console.log('hMemo');
        this.pager.next(MemorandumHistory);
    }

    hbrgySupport = async () => {
        console.log('hbrgySupport');
        this.pager.next(ChatSupportView);
    }

    hNotify = () =>{
        console.log(["Notification",this.u]);
        return this.u.NotificationCount;
    }

    hChangePassword = async () => {
        console.log('hChangePassword');
        this.pager.next(ChangePassword);
        //this.pager.next(ChangePasswordView);
    }
    

    private goToSignInPage() {
        return this.cont3xt?.navigate('/out', 'forward', 'pop');
    }

    private deviceSessionEnd() {
        this.prop.IsSessionEnd = true;
        storage.IsSignIn = false;
        jUser({});
        storage.Auth = {};
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

    hEstablshiment = async () => {
        this.pager.next(EstablishmentView);
    }

    hGovernmentID = () => {
        this.pager.next(ValidGorvernmentIDAppHistory);
    }

    hEducationalBackground = () => {
        this.pager.next(EducationBackgroundAppHistory);
    }

    hEmployementHistory = () => {
        this.pager.next(EmployementAppHistory);
    }

    hOrganization = () => {
        this.pager.next(OrganizationAppHistory);
    }

    hSettings = () => {
        console.log('hSettings');
        this.pager.next(MenuSettingsView);
    }

    hEventsList = async () => {
        console.log('hEventsList');
        this.pager.next(EventsView);
    }

    hReportIssuesConcern = async () => {
        console.log('hReportIssuesConcern');
        //this.pager.next(IssuesConcerHistory);
        this.pager.next(IssuesConcernAppHistory);
    }

    hEmergencyList = () => {
        console.log('hEmergencyList');
        this.pager.next(EmergencyAlertHistory);
    }

    hEmergencyAlert = async () => {
        // console.log('filter', this.filter);
        // console.log('input', this.input);
        const coordinates = await Geolocation.getCurrentPosition();
        console.log(coordinates);
        const modal = await EmergencyAlertPopUp.modal('Emergency', {Type: 2,PL_ID: this.filter.PL_ID,PGRP_ID: this.filter.PGRP_ID,UserId: this.filter.Userid,Latitude: coordinates.coords.latitude,Longitude: coordinates.coords.longitude,Brgyname: this.filter.BarangayName,Sendername: this.filter.Fullname,Mobileno: this.filter.MobileNumber});
        await modal.present();
        const res = await modal.onDidDismiss();
        const data = (res || mtObj).data;
        if (!data) return;
    }

    render(){
        const {input} = this;
        const u = this.u;
        input.SelectMenu = (input.SelectMenu || 'Home');
        return(<>
            <Layout>
                <div className="segment-container" style={styles('background:rgb(0,6,69);border-top-left-radius:25%;border-top-right-radius:25%;')}>
                    <div style={styles('padding-top:25%;')}>
                        <IonSegment style={styles('border-bottom:1px solid rgba(0,0,0, 0.35);color:#fff;')} value={input.SelectMenu} onIonChange={(e) => this.hSelectionMenu(e)}>
                            <IonSegmentButton value="Home" style={styles('--color:#fff;--color-checked:rgb(0,132,255);')}>
                                <IonIcon size="large" icon={homeOutline}></IonIcon>
                            </IonSegmentButton>
                            <IonSegmentButton value="Documents" style={styles('--color:#fff;--color-checked:rgb(0,132,255);')}>
                                <IonIcon size="large" icon={documentsOutline}></IonIcon>
                            </IonSegmentButton>
                            <IonSegmentButton value="Events" style={styles('--color:#fff;--color-checked:rgb(0,132,255);')}>
                                <IonIcon size="large" icon={newspaperOutline}></IonIcon>
                            </IonSegmentButton>
                        </IonSegment>
                    </div>
                </div>
            </Layout>
            <Layout auto style={styles('height:80%')}>
                <div style={styles('position:relative;text-align:center;margin-top:5%;')} hidden={input.SelectMenu!=='Home'?true:false}>
                    <IonRow>
                        <IonCol >
                            <div onClick={this.hBrgyOfficial}>
                                <IonIcon icon={peopleCircleOutline} style={styles('font-size:36pt;')}/>
                            </div>
                            <div>
                                <IonLabel style={styles('font-weight:bold;')}>Barangay Officials</IonLabel>
                            </div>
                        </IonCol>
                        <IonCol >
                            <div onClick={this.hEstablshiment}>
                                <IonIcon icon={businessOutline} style={styles('font-size:36pt;')}/>
                            </div>
                            <div>
                                <IonLabel style={styles('font-weight:bold;')}>Establishments</IonLabel>
                            </div>
                        </IonCol>
                        <IonCol >
                            <div onClick={this.hGovernmentID}>
                                <IonIcon icon={idCardOutline} style={styles('font-size:36pt;')}/>
                            </div>
                            <div>
                                <IonLabel style={styles('font-weight:bold;')}>Government ID</IonLabel>
                            </div>
                        </IonCol>
                    </IonRow>
                    <IonRow>
                        <IonCol >
                            <div onClick={this.hEducationalBackground}>
                                <IonIcon icon={schoolSharp} style={styles('font-size:36pt;')}/>
                            </div>
                            <div>
                                <IonLabel style={styles('font-weight:bold;')}>Educational Background</IonLabel>
                            </div>
                        </IonCol>
                        <IonCol >
                            <div onClick={this.hEmployementHistory}>
                                <IonIcon icon={journalOutline} style={styles('font-size:36pt;')}/>
                            </div>
                            <div>
                                <IonLabel style={styles('font-weight:bold;')}>Employment History</IonLabel>
                            </div>
                        </IonCol>
                        <IonCol size='4'>
                            <div onClick={this.hOrganization}>
                                <IonIcon icon={peopleCircleOutline} style={styles('font-size:36pt;')}/>
                            </div>
                            <div>
                                <IonLabel style={styles('font-weight:bold;')}>Organization</IonLabel>
                            </div>
                        </IonCol>
                    </IonRow>
                    {/* <IonRow>
                        <IonCol size='4'>
                            <div onClick={this.hEmergencyList}>
                                <IonIcon icon={alertCircleOutline} style={styles('font-size:36pt;')}/>
                            </div>
                            <div>
                                <IonLabel style={styles('font-weight:bold;')}>Emergency List</IonLabel>
                            </div>
                        </IonCol>
                    </IonRow> */}
                </div>
                <div style={styles('position:relative;text-align:center;margin-top:5%;')} hidden={input.SelectMenu!=='Documents'?true:false}>
                    <IonRow>
                        <IonCol>
                            <div onClick={this.hRequestBarangayCedula}>
                                <IonIcon icon={documentTextOutline} style={styles('font-size:36pt;')}/>
                            </div>
                            <div>
                                <IonLabel style={styles('font-weight:bold;')}>Cedula</IonLabel>
                            </div>
                        </IonCol>
                        <IonCol>
                            <div onClick={this.hRequestBarangayClearance}>
                                <IonIcon icon={documentTextOutline} style={styles('font-size:36pt;')}/>
                            </div>
                            <div>
                                <IonLabel style={styles('font-weight:bold;')}>Barangay Clearance</IonLabel>
                            </div>
                        </IonCol>
                        <IonCol>
                            <div onClick={this.hRequestBarangayBusinessClearance}>
                                <IonIcon icon={documentTextOutline} style={styles('font-size:36pt;')}/>
                            </div>
                            <div>
                                <IonLabel style={styles('font-weight:bold;')}>Business<br/>Permit</IonLabel>
                            </div>
                        </IonCol>
                    </IonRow>
                    <IonRow>
                        <IonCol>
                            <div onClick={this.hBrgyBlotter}>
                                <IonIcon icon={documentTextOutline} style={styles('font-size:36pt;')}/>
                            </div>
                            <div>
                                <IonLabel style={styles('font-weight:bold;')}>Blotter</IonLabel>
                            </div>
                        </IonCol>
                        <IonCol>
                            <div onClick={this.hMemo}>
                                <IonIcon icon={readerOutline} style={styles('font-size:36pt;')}/>
                            </div>
                            <div>
                                <IonLabel style={styles('font-weight:bold;')}>Memorandum</IonLabel>
                            </div>
                        </IonCol>
                        <IonCol>
                            <div onClick={this.hRequestBarangayOtherDocument}>
                                <IonIcon icon={documentTextOutline} style={styles('font-size:36pt;')}/>
                            </div>
                            <div>
                                <IonLabel style={styles('font-weight:bold;')}>Other<br/>Document</IonLabel>
                            </div>
                        </IonCol>
                    </IonRow>
                </div>
                <div style={styles('position:relative;text-align:center;margin-top:5%;')} hidden={input.SelectMenu!=='Events'?true:false}>
                    <IonRow>
                        <IonCol size='4'>
                            <div onClick={this.hEventsList}>
                                <IonIcon icon={newspaperOutline} style={styles('font-size:36pt;')}/>
                            </div>
                            <div>
                                <IonLabel style={styles('font-weight:bold;')}>Events</IonLabel>
                            </div>
                        </IonCol>
                        <IonCol size='4'>
                            <div onClick={this.hReportIssuesConcern}>
                                <IonIcon icon={todayOutline} style={styles('font-size:36pt;')}/>
                            </div>
                            <div>
                                <IonLabel style={styles('font-weight:bold;')}>Issues & Concerns</IonLabel>
                            </div>
                        </IonCol>
                    </IonRow>
                </div>
                <div className='menu-footer' style={styles('')}>
                    <div style={styles('width:80%;margin-top: auto;margin-bottom: auto;')}>
                        <div style={styles('--background:rgb(0,6,69);float:left;width:fit-content;')}
                            onClick={this.hEmergencyList}>
                            <IonIcon icon={listCircleOutline} style={styles('font-size:xxx-large;color:#fff;')}/>
                        </div>
                        <div style={styles('--background:rgb(0,6,69);float:right;width:fit-content;')} 
                            onClick={this.hbrgySupport}>
                            <IonIcon icon={chatbubbleEllipses} style={styles('font-size:xxx-large;color:#fff;')}/>
                        </div>
                        {/* <IonCard >
                            <IonCardContent>
                                <IonButton size='large' style={styles('--background:rgb(0,6,69);')}
                                    onClick={this.hEmergencyList}>
                                    <IonIcon size='large' icon={logoIonic}/>
                                </IonButton>
                                <IonButton size='large' style={styles('--background:rgb(0,6,69);')} 
                                    onClick={this.hEmergencyAlert}>
                                    <IonIcon size='large' icon={warningOutline}/>
                                </IonButton>
                                <IonButton size='large' style={styles('--background:rgb(0,6,69);')} 
                                    onClick={this.hbrgySupport}>
                                    <IonIcon size='large' icon={chatbubbleEllipses}/>
                                </IonButton>
                            </IonCardContent>
                        </IonCard> */}
                    </div>
                    <div style={styles('position:absolute;bottom:0%;')}>
                        <div style={styles('border-radius: 50%;border:2px solid rgb(0,6,69);display:-webkit-inline-box;background:#fff;')}>
                            <IonButton size='large' style={styles('--border-radius:50%;height:100px;width:100px;--background:rgb(0,6,69);font-weight:bold;')}
                                onClick={this.hEmergencyAlert}>
                                HELP
                            </IonButton>
                        </div>
                    </div>
                </div>
            </Layout>
            {/* <Layout>
                <div style={styles('position:relative;')}>
                    <IonFab vertical="bottom" horizontal="end" slot="fixed" style={styles('margin-bottom:7vw;margin-right:2vw')}>
                        <IonFabButton onClick={this.hbrgySupport} style={styles('height:75px;width:75px;')}>
                            <IonIcon size="large" icon={chatbubblesOutline} style={styles('transform: rotate(360deg);')}/>
                        </IonFabButton>
                    </IonFab>
                </div>
            </Layout> */}
        </>);
    }
}

class StaticComponentView extends React.Component<{ instance: ViewHolder }>{
    shouldComponentUpdate = () => false;
    render() {
        const { instance } = this.props;
        return (<>
            <Layout auto>
                {/* <SwapPager ref={(ref: any) => instance.swapper = ref} onSwapLoad={(swapper) => swapper.show(StreamingHomeView)} /> */}
            </Layout>
        </>);
    }
}
//
class ResultHomeView extends React.Component {
    shouldComponentUpdate = () => false;
    render() {
        return (<>

        </>);
    }
}
class TicketHomeView extends React.Component {
    shouldComponentUpdate = () => false;
    render() {
        return (<>

        </>);
    }
}

class EmergencyAlertPopUp extends React.Component<{ modal: Function, Title: string, Opts: any }> implements OnDidBackdrop {
    private static cache: any = {};
    state: any = { inner: { height: (window.innerHeight + 'px') } }
    componentWillMount=()=>{
        app.component(this);
        Object.rcopy(this.filter, (this.props.Opts || mtObj));
        this.prop.IsDevice = !device.isBrowser;
        this.filter.CacheID = (this.filter.Type + '-' + (this.filter.PL_ID || '0') + (this.filter.PGRP_ID || '0'));
        const cache = EmergencyAlertPopUp.cache[this.filter.CacheID] || null;
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
    request: any = {}; 
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
        this.subs.s1 = rest.post('emergency/type', Object.rcopy(filter, this.filter)).subscribe(async (res: any) => {
            this.prop.IsFiltering = false;
            if (res.Status != 'error') {
                if (filter.IsReset) this.list = res.emergency.map((o: any) => this.listDetails(o));
                else res.emergency.forEach((o: any) => this.list.push(this.listDetails(o)));
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

    isValidateEntries = async (item: any) => {
        const request = this.request;
        request.PL_ID = this.filter.PL_ID;
        request.PGRP_ID = this.filter.PGRP_ID;
        request.UserId = this.filter.UserId;
        request.Latitude = this.filter.Latitude;
        request.Longitude = this.filter.Longitude;
        request.EmergencyId = item.EmergencyId;
        const message = this.constructMessage({Sendername: this.filter.Sendername,Contactno: this.filter.Mobileno,Message: item.EmergencyMessage});
        request.EmergencyMessage = message;
        request.SenderMobileno = '+639185807309';
        this.setState({request: this.request})
        return true;
    }

    private constructMessage = (content: any) => {
        var header = 'Emergency Alert\r\n\r\n';
        var body = content.Message+'\r\n\r\nSender Name: '+content.Sendername+'\r\nContact #: '+content.Contactno;
        var footer = '\r\n\r\n For further assistance please call this barangay contact #: +639123456789';
        const message = header.concat(body,footer);
        return message;
    }

    hConfirm = async (item: any) => {
        if (!this.isValidateEntries(item)) return;
        Alert.showProgressRequest();
        return setTimeout(() => this.performSubmit(), 750);
    }

    private performSubmit() {
        console.log(this.request);
        rest.post('emergency/send', this.request).subscribe(async (res: any) => {
            if (res.Status == 'ok') {
                return Alert.showSuccessMessage(res.Message);
            }
            Alert.showErrorMessage(res.Message);
        }, (err: any) => {
            Alert.showWarningMessage('Please try again');
        });
    }

    render() {
        const { filter = {}, prop = {}, inner = {} } = this.state;
        const { list = [] } = this.state;
        return (<>
            <div className="modal-container" style={styles({ 'height': inner.height })}>
                <div style={styles('padding:5px 0px 5px;border-bottom: 1px solid rgba(0,0,0,0.25);')}>
                    <div className="row m-0 header">
                        <div className="col-10">Select {this.props.Title}</div>
                        <div className="col-2 p-0 btn-close" style={styles('text-align:right;right:5px')} onClick={this.hClose}></div>
                    </div>
                </div>
                <Layout full style={styles('height:calc(100% - 30px)')}>
                    {/* <Layout>
                        <IonSearchbar value={filter.Search} onIonChange={(ev) => (this.hFState(ev, 'Search'), this.hFilter())}
                            placeholder="Search Customer" />
                    </Layout> */}
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
                                                <div className="row m-0 details ion-activatable" onClick={() => this.hConfirm(item)}
                                                    style={styles('padding:5px;', { 'border-top': (idx == 0 ? null : '1px solid rgba(128,128,128,0.75)') },)}>
                                                    <IonRippleEffect />
                                                    <div className="col-12 p-0 vertical">
                                                        <div>{item.EmergencyName}</div>
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
            <Modal className="modal-adjustment full" ref={(ref) => modal = ref} content={<EmergencyAlertPopUp modal={() => modal} Title={title} Opts={opts} />} />
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