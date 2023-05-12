import { IonContent, IonInput, IonItem, IonList, IonRefresher, IonRefresherContent, IonRippleEffect, IonSpinner, NavContext } from '@ionic/react';
import React from 'react';
import styled from 'styled-components';
import Layout from '../../../../tools/components/+common/layout';
import ImgPreloader from '../../../../tools/components/+common/img-preloader';
import { numberWithComma } from '../../../../tools/global';
import { classNames, styles } from '../../../../tools/plugins/element';
import UserPager from '../../user-pager';
import { device } from '../../../../tools/plugins/device';
import { Alert } from '../../../../tools/components/+common/stack';
import { checkBalances, jUser, jUserModify } from '../../../+app/user-module';
import { OnPagerBack, OnPagerFocus, OnPagerInit, OnPagerLeave } from '../../../../tools/components/+feature/view-pager';
import { storage } from '../../../../tools/plugins/storage';
import WebView from '../web.view';
import HelpCenterView from './help.help-center.view';
import ReportProblemView from './help.report-problem.view';
import GameProfileView from './profile.game-profile.view';
import BuyCreditsPopUp from '../../../+app/modal/buy-credits.popup';
import PowerApPopUp from '../../../+app/modal/power-ap.popup';
import PowerApView from './downline.power-ap.view';
import CustomersView from './events.view';
import SettingsView from './setting.settings.view';
import ActivityLogsView from './log.activity-logs.view';
import CreditLedgerView from './ledger.credit-ledger.view';
import SalesReportView from './record.sales-report.view';
import AnnouncementView from './other.announcement.view';
import moment from 'moment';
import Recycler from '../../../../tools/components/+feature/recycler';
import RecyclerStorage from '../../../intro.page/recycler-storage';
import MemberProfileAccount from './member.account-profile.view'
import EventsView from './events.view';
import DonationHistoryView from './record.donation-history.view';
import MemberHistory from './record.member-list.view';
import UnclaimClaimDonation from './record.donation-claim-unclaim.view';
import PhotoViewerPopUp from '../../../../tools/components/+common/modal/photo-viewer.popup';
import ChangePassword from './changepassword.account.view';
import ChangePasswordView from './profile.change-password.view';
import IssuesConcerHistory from './record.issuesconcern-list.view';
import IssuesConcernAppHistory from './record.issuesconcern-open-pending-close.view';
import ChangeAvatarView from './profile.change-avatar.view';
import MemorandumHistory from './record.memo-list.view';
import RequestDocuemntAppHistory from './record.requestdoc-open-unclaim-claim.view';
import RequestBarangayClearacneAppHistory from './record.requestbrgyclearance-open-unclaim-claim.view';
import ChatSupportView from './brgyChatSupport.view';
import RequestBarangayBusinessClearacneAppHistory from './record.requestbrgybusinessclearance-open-unclaim-claim.view';
import RequestBarangayOtherDocumentAppHistory from './record.requestbrgyotherdoc-open-unclaim-claim.view';

const { Object, features = false }: any = window;

export default class MenusView extends React.Component implements OnPagerInit, OnPagerFocus, OnPagerBack {
    onPagerInit = () => this.holder.onPagerInit();
    onPagerFocus = () => this.holder.onPagerFocus();
    onPagerBack = () => (this.holder.onPagerBack(), true);
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
    static contextType = NavContext;
    state: any = { u: {} };
    get cont3xt() { return UserPager.instance.context; }
    get pager() { return UserPager.instance.pager; }
    componentWillMount = () => this.willMount(false);
    subs: any = {};
    prop: any = {};
    willMount = (didMount = true) => {
        const u: any = { hasCustomer: false, FLL_NM: '-', CreditBalance: '-', MOB_NO: '-', ACT_ID: '-', EML_ADD: '-' };
        const prop: any = (this.prop = { didMount: didMount });
        prop.AppVersion = (device.appVersion || 'v1.0');
        this.setState({ prop, u });
        if (!didMount) return;
        this.subs.u = jUserModify(async () => {
            const u: any = await jUser();
            if (!u.ACT_ID) return;
            if (u.IsCoordinator || u.IsGeneralCoordinator)
                u.IsPlayer = false;
            u.hasCustomer = (u.IsPlayer || u.IsCoordinator || u.IsGeneralCoordinator);
            u.LastLogIn = moment(u.LastLogIn).format('MMM DD, YYYY hh:mm A');
            this.setState({ u });
        });
        console.group('willmount');
        console.log(u);
    }
    didMount = () => { }
    willUnmount = () => {
        Object.values(this.subs).map((m: any) => m.unsubscribe());
    }
    //
    onPagerInit() {
        this.prop.isReady = true;
    }
    shouldComponentUpdate = () => (!this.prop.willUnmount);
    onPagerBack() {
        this.prop.willUnmount = true;
    }
    onPagerFocus() {
        if (!this.prop.isReady) return;
    }


    hBackButton = () => {
        this.pager.back();
    }

    hGameProfile = () => {
        this.pager.next(MemberProfileAccount);
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

    hEventsList = async () => {
        this.pager.next(EventsView);
    }
    hRequestDocumentsList = async () => {
        this.pager.next(RequestDocuemntAppHistory);
    }
    hRequestBarangayClearance =async () => {
        this.pager.next(RequestBarangayClearacneAppHistory);
    }
    hRequestBarangayBusinessClearance = async() => {
        this.pager.next(RequestBarangayBusinessClearacneAppHistory);
    }
    hRequestBarangayOtherDocument = async() => {
        this.pager.next(RequestBarangayOtherDocumentAppHistory);
    }
    hReportIssuesConcern = async () => {
        //this.pager.next(IssuesConcerHistory);
        this.pager.next(IssuesConcernAppHistory);
    }
    hDonationsList = async () => {
        this.pager.next(UnclaimClaimDonation);
    }
    
    hAvatar = async () => {
        this.pager.next(ChangeAvatarView);
    }
    hMemo=async()=>{
        this.pager.next(MemorandumHistory);
    }
    hbrgySupport=async()=>{
        this.pager.next(ChatSupportView);
    }

    hChangePassword = async () => {
        this.pager.next(ChangePassword);
        //this.pager.next(ChangePasswordView);
    }

    hMemberRecord = async () => {
        this.pager.next(MemberHistory);
    }
    private goToSignInPage() {
        return this.cont3xt?.navigate('/out', 'forward', 'pop');
    }
    private deviceSessionEnd() {
        storage.Auth = {};
        storage.IsSignIn = false;
        jUser({});
    }
    hViewImg = async (url: any) => {
        const img = url;
        if (!img) return;
        const modal = await PhotoViewerPopUp.modal('Preview', img);
        await modal.present();
    }
    

    render() {
        const { filter = {}, prop = {} } = this.state;
        const{input={}}=this.state;
        const { u = {} } = this.state;
        return (<>
            <Layout full>
                <Layout className="row m-0 toolbar-panel no-border">
                    {!device.isBrowser ? null : <>
                        <div className="vertical arrow-back" style={styles('position:absolute;top:0px;height:auto;z-index:2')}
                            onClick={this.hBackButton}></div>{/*height:100%*/}
                    </>}
                    <div className="col-12 p-0 horizontal toolbar-parent" style={styles('font-weight:bold;font-size:20px;height:27.5px')}>
                        <div className="vertical">ACCOUNT'S PROFILE</div>
                    </div>
                </Layout>
                <Layout auto>
                    <IonContent scrollY>
                        <div className="row m-0" style={styles('height:100%;')}>
                            <div className='col-12 p-0 native'>
                                <UserPanel>
                                    <div className="horizontal user-image">
                                        <ImgPreloader className='brand-image img-circle elevation-1 img-fit'
                                            placeholder="./assets/img/icon_blank_profile.png" src={u.ImageUrl} />
                                    </div>
                                    <div className='horizontal user-name'><b>{u.FLL_NM}&nbsp;</b></div>
                                    {!u.EmailAddress ? null : <>
                                        <div className='horizontal label-extra'>{u.EmailAddress}&nbsp;</div>
                                    </>}
                                    <div className='horizontal label-extra'>Mobile No.: {u.MOB_NO}&nbsp;</div>
                                    <div className='horizontal label-extra'>Email: {u.EML_ADD}&nbsp;</div>
                                    <div className='horizontal label-extra' hidden={u.isGroup}>Barangay: {u.LOC_BRGY_NM}&nbsp;</div>
                                </UserPanel>
                                <div className="list" style={styles('border-radius: 25px;margin-left: 40px;margin-right: 40px;margin-bottom: 10px;background-color: #2953a5;')}>
                                    <Item name="Account Profile" icon="./assets/img/profile_edit_data.png" onClick={this.hGameProfile} />
                                </div>
                                <div className="list" style={styles('border-radius: 25px;margin-left: 40px;margin-right: 40px;margin-bottom: 10px;background-color: #2953a5;')}>
                                    <Item name="Change Password" icon="./assets/img/password.png" onClick={this.hChangePassword} />
                                </div>
                                <div className="list" hidden={(u.isUser) ? false:true} style={styles('border-radius: 25px;margin-left: 40px;margin-right: 40px;margin-bottom: 10px;background-color: #2953a5;')}>
                                    <Item name="Member" icon="./assets/img/profile_agent_list.png" onClick={this.hMemberRecord} />
                                </div>
                                <div className="list" style={styles('border-radius: 25px;margin-left: 40px;margin-right: 40px;margin-bottom: 10px;background-color: #2953a5;')}>
                                    <Item name="Issues and Concern" icon="./assets/img/profile_report_a_problem_icon.png" onClick={this.hReportIssuesConcern} />
                                </div>
                                <div className="list" style={styles('border-radius: 25px;margin-left: 40px;margin-right: 40px;margin-bottom: 10px;background-color: #2953a5;')}>
                                    <Item name="Brgy. Clearance" icon="./assets/img/profile_game_result_icon.png" onClick={this.hRequestBarangayClearance} />
                                </div>
                                <div className="list" hidden={(u.TTL_BIZ!=0) ? false : true} style={styles('border-radius: 25px;margin-left: 40px;margin-right: 40px;margin-bottom: 10px;background-color: #2953a5;')}>
                                    <Item name="Brgy Business Permit" icon="./assets/img/profile_game_result_icon.png" onClick={this.hRequestBarangayBusinessClearance} />
                                </div>
                                <div className="list" style={styles('border-radius: 25px;margin-left: 40px;margin-right: 40px;margin-bottom: 10px;background-color: #2953a5;')}>
                                    <Item name="Brgy Other Document" icon="./assets/img/profile_game_result_icon.png" onClick={this.hRequestBarangayOtherDocument} />
                                </div>

                                <div className="list" style={styles('border-radius: 25px;margin-left: 40px;margin-right: 40px;margin-bottom: 10px;background-color: #2953a5;')}>
                                    <Item name="Events" icon="./assets/img/profile_game_result_icon.png" onClick={this.hEventsList} />
                                </div>
                                <div className="list" hidden={u.isMember} style={styles('border-radius: 25px;margin-left: 40px;margin-right: 40px;margin-bottom: 10px;background-color: #2953a5;')}>
                                    <Item name="Donation" icon="./assets/img/notif_game_credit_popup_icon.png" onClick={this.hDonationsList} />
                                </div>
                                <div className="list" hidden={(u.isUser) ? false:true} style={styles('border-radius: 25px;margin-left: 40px;margin-right: 40px;margin-bottom: 10px;background-color: #2953a5;')}>
                                    <Item name="Memorandum" icon="./assets/img/Memorandum.png" onClick={this.hMemo} />
                                </div>
                                
                                <div className="list" style={styles('border-radius: 25px;margin-left: 40px;margin-right: 40px;margin-bottom: 10px;background-color: #2953a5;')}>
                                    <Item name="Contact Bgy Operator" icon="./assets/img/Memorandum.png" onClick={this.hbrgySupport} />
                                </div>

                                <div>&nbsp;</div>
                                <div className="list" style={styles('border-radius: 25px;margin-left: 40px;margin-right: 40px;margin-bottom: 10px;background-color: #2953a5;')}>
                                    <Item name="Logout" icon="./assets/img/profile_logout_icon.png" onClick={this.hSignOut} />
                                </div>
                                <div>&nbsp;</div>
                                {!features ? null : <>
                                    <div style={styles('height:auto;position:relative;padding:10px 0px;position:')} >
                                        <div style={styles('position: absolute;top:0px;width:100%;height:100%;background-color:rgba(0, 0, 0, 0.25);border-radius:10px;border:1px solid rgba(255, 255, 255, 0.25)')} ></div>
                                        <div className="horizontal" style={styles('font-size:15px;color:white;position:relative')}> {/*<!--color:#f49e2b-->*/}
                                            <div className="vertical">
                                                <div className="horizontal">Last Login:&nbsp;<b>{u.LastLogIn}</b></div>
                                                <div className="horizontal">App Version:&nbsp;<b>{prop.AppVersion}</b></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div style={styles('height:auto;position:relative;padding:10px 0px;position:')} >
                                        <div style={styles('position: absolute;top:0px;width:100%;height:100%;background-color:rgba(0, 0, 0, 0.25);border-radius:10px;border:1px solid rgba(255, 255, 255, 0.25)')} ></div>
                                        <div className="horizontal" style={styles('font-size:15px;color:white;position:relative')}> {/*<!--color:#f49e2b-->*/}
                                            <div className="vertical" onClick={() => this.hViewImg('./assets/img/STLPartyListTarp.png')}>
                                                <div className="horizontal">
                                                    <div style={styles('height:250px')}>
                                                        <div>
                                                            <img className="img.img-fit-stl" src="./assets/img/STLPartyListTarp.png" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </>}


                            </div>
                        </div>

                    </IonContent>
                </Layout>
            </Layout>
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


//styles

const UserPanel = styled.div`
padding: 0px 10px;
margin-bottom: 25px;
.user-image{
    position: relative;
    height: 150px;  /*//height: 150px;*/
    margin-top: 10px;
    >img{
        background-color: #eceff1;
        width: 150px; /*//width: 150px;*/
    }
}
.user-name{
    font-size: 20pt;
    height: auto;
    text-align: center;
    color:#fdb67f; /*//color:#default;*/
}
.user-coins{
    img.img-coins{
        height: 40px;
    }
    .label-coins{
        text-align: right;
        font-size: 30px;
        color: white;
        font-weight: bold;
        padding-left: 5px;
        line-height: 35px;
        color:#f49e2b;
    }
}
.label-extra{
    font-size: 14pt;
    height: auto;
    color:#fefed1;
}
`;
const ListItem = styled.div`
height: 50px;
`;