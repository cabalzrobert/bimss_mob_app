import { IonAlert, IonButton, IonButtons, IonCard, IonCardContent, IonChip, IonCol, IonContent, IonFab, IonFabButton, IonFooter, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonList, IonMenuButton, IonRefresher, IonRefresherContent, IonRippleEffect, IonRow, IonSelect, IonSelectOption, IonSpinner, IonTitle, IonToolbar } from '@ionic/react';
import React from 'react';
import styled from 'styled-components';
import Layout from '../../../../tools/components/+common/layout';
import NotFoundView from '../../../+app/component/common/not-found.view';
import FilteringView from '../../../+app/component/common/filtering.view';
import { mtCb, mtObj } from '../../../../tools/plugins/static';
import TextFit from '../../../../tools/components/+common/text-fit';
import { numberWithComma } from '../../../../tools/global';
import { classNames, clearAfter, Input, styles } from '../../../../tools/plugins/element';
import { timeout } from '../../../../tools/plugins/delay';
import UserPager from '../../user-pager';
import { rest } from '../../../+app/+service/rest.service';
import { toast } from '../../../../tools/plugins/toast';
import { Customer } from '../../../+app/main-module';
import SwapPager, { OnSwapFocus, OnSwapLeave } from '../../../../tools/components/+feature/swap-pager';
import PowerApRequestPopUp from '../../../+app/modal/power-ap-request.popup';
import ClaimDonationActionPopUp from '../../../+app/modal/claim-donation.popup';
import PowerApSummaryView from './downline.power-ap-summary.view';
import ImgPreloader from '../../../../tools/components/+common/img-preloader';
import Recycler from '../../../../tools/components/+feature/recycler';
import RecyclerStorage from '../../../intro.page/recycler-storage';
import { jUser, jUserModify } from '../../../+app/user-module';
import ReportProblemView from './help.report-problem.view';
import IssuesConcernActionPopUp from '../../../+app/modal/issuesconcern.view.pop';
import { OnPagerFocus } from '../../../../tools/components/+feature/view-pager';
import ProcessIssuesConcernPopUp from '../../../+app/modal/onprocess-issuesconcer.pop';
import { addCircleOutline, addOutline, arrowBackOutline, closeOutline, filter, refreshOutline, removeOutline, searchOutline, trashOutline } from 'ionicons/icons';
import AddReportProblemView from './help.report.add-problem.view';
import IssusConcernAttachmentView from './issuesconcern-attachment.view';
import RequestBrgyClearancePopUp from '../../../+app/modal/requestbrgyclearance.view.pop';
import RequestDocumentAttachmentView from './requestdocument-attachment.view';
import RequestBrgyClearanceView from './brgyclearance.new.view';
import RequestBrgyBusinessPermitView from './brgybusinesspermit.new.view';
import RequestBrgyCTCView from './brgyctc.new.view';
import RequestBrgyDocumentView from './brgyrequestdoc.new.view';
import RequestDocumentPopUp from '../../../+app/modal/requestdocument.view.pop';
import RequestCedulaPopUp from '../../../+app/modal/requestcedula.view.pop';
import { device } from '../../../../tools/plugins/device';
import Stack, { Alert, Modal } from '../../../../tools/components/+common/stack';
import { OnDidBackdrop, app } from '../../../../tools/app';
import { time } from 'console';

const { Object }: any = window;

export default class RequestBarangayCedulaAppHistory extends React.Component implements OnPagerFocus {
    static activeTab: any = null;
    //onPagerFocus = (data: any) => {
    //console.log(data);
    //console.log(IssuesConcernAppHistory.activeTab,IssuesConcernAppHistory.activeTab.onPagerFocus);
    //};
    onPagerFocus = (data: any) => (RequestBarangayCedulaAppHistory.activeTab && RequestBarangayCedulaAppHistory.activeTab.onPagerFocus(data));
    //onPagerFocus = (data: any) => (IssuesConcernAppHistory.activeTab?.onPageFocus(data));
    //setTitle = (parentTitle: string, pageTitle: string) => this.holder.setTitle(parentTitle, pageTitle);
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
    state: any = {};
    get pager() { return UserPager.instance.pager; }
    componentWillMount = () => this.willMount();
    page: any = {};
    filter: any = {};
    list: any = [];
    subs: any = {};
    willMount = () => {
        const page = (this.page = { ParentTitle: '', PageTitle: 'Request Brgy. Cedula' });
        const list = (this.list = []);
        const filter = (this.filter = {});
        this.subs.u = jUserModify(async () => {
            const u = await jUser();
            Object.rcopy(filter, {
                Userid: u.USR_ID,
                PL_ID: u.PL_ID,
                PGRP_ID: u.PGRP_ID,
                OTP_DT: u.OTP_DT,
                ACT_ID: u.ACT_ID,
                SUBSCR_TYP: u.SUBSCR_TYP,
                REF_GRP_ID: u.REF_GRP_ID,
                REF_LDR_ID: (u.isGroup) ? "" : u.USR_ID,
                isGroup: u.isGroup,
                isMember: u.isMember,
                isUser: u.isUser
            });
            this.setState({ u, filter });
        });
        this.setState({ tabs: false, page });
    }
    didMount = () => {
        this.setState({ tabs: true });
    }
    //
    public setTitle(parentTitle: string, pageTitle: string) {
        const { page } = this;
        page.ParentTitle = parentTitle;
        page.PageTitle = pageTitle;
        this.setState({ page });
    }

    hBackButton = () => {
        this.pager.back();
    }

    render() {
        const { page, tabs } = this.state;
        return (<>
            <Layout full>
                <Layout>
                    <IonHeader>
                        <div style={styles('height:70px;')}>
                            <div style={styles('position:relative;top:11px;')}>
                            <IonItem lines="none" style={styles('--background:transparent;')}
                                onClick={this.hBackButton}>
                                <IonIcon size="large" icon={arrowBackOutline} style={styles('color:rgb(0,4,69);')}/>
                                <IonTitle style={styles('font-weight:bold;color:rgb(0,4,69);font-size:20pt;')}>
                                Cedula
                                </IonTitle>
                            </IonItem>
                            </div>
                        </div>
                    </IonHeader>
                </Layout>
                <Layout auto>
                    {!tabs ? null : <PowerApTabsView />}
                </Layout>
            </Layout>
        </>);
    }
}


class PowerApTabsView extends React.Component {
    state: any = {};
    swapper: SwapPager = (mtObj as SwapPager);
    componentWillMount = () => {
        const { tabs } = this;
        this.setState({ tabs });
    }

    tabs: any = [
        { name: 'Request', component: OpenTab1View },
        // { name: 'Recv', component: ReceivedTabView },
        { name: 'Claimed/Cancelled', component: ClaimTab2View },
        // { name: 'Cancelled', component: CancelledTab3View },
    ];

    componentDidMount = () => {
        this.hTab(this.tabs[0]);
    }
    componentWillUnmount = () => {
        this.swapper.performViewLeave();
    }
    onSwapChange = () => {
        return timeout(() => {
            RequestBarangayCedulaAppHistory.activeTab = this.swapper.currentComponent.instance;
        });
        //IssuesConcernAppHistory.activeTab = this.swapper.currentComponent.instance;
    }

    public activeTab: any;
    hTab(tab: any) {
        if (this.activeTab == tab) return;
        if (this.activeTab)
            this.activeTab.isSelected = false;
        this.swapper.show(tab.component);
        this.activeTab = tab;
        tab.isSelected = true;
        this.setState({ tabs: this.tabs });
    }

    render() {
        const { tabs = [] } = this.state;
        return (<>
            <Layout full>
                <Layout>
                    {/* <div className="row m-0 tabs-classic"> */}
                    <div style={styles('border-bottom: 1px solid rgb(0,0,0,0.35);padding:3%;')}>
                        {tabs?.map((tab: any) => <>
                            {/* <div className={classNames('col-6 p-0 horizontal tab', { active: tab.isSelected })} onClick={(ev) => this.hTab(tab)}> */}
                                <IonChip outline={tab.isSelected} onClick={() => this.hTab(tab)} style={styles('font-size:12pt;font-weight:bold;')}>
                                    {tab.name}
                                </IonChip>
                            {/* </div> */}
                            {/* <div className={classNames('col-6 p-0 horizontal tab', { active: tab.isSelected })} onClick={(ev) => this.hTab(tab)}>
                                <div className="vertical">{tab.name}</div>
                            </div> */}
                        </>)}
                    </div>
                </Layout>
                <Layout auto>
                    <SwapPager ref={(ref: any) => this.swapper = ref} onSwapChange={this.onSwapChange} />
                </Layout>
            </Layout>
        </>);
    }
}

class OpenTab1View extends React.Component implements OnSwapFocus, OnSwapLeave {
    view = (mtObj as PageFilterRequestView);
    onPagerFocus = (data: any) => this.view.onPageFocus(data);
    //holder: PageFilterRequestView=(null as any);
    onSwapFocus() { this.view.resumeRequest(); }
    onSwapLeave() { this.view.pauseRequest(); }
    render() {
        return (<>
            <PageFilterRequestView ref={(ref: any) => this.view = ref} status='0' />
        </>);
    }
}

class ReceivedTabView extends React.Component implements OnSwapFocus, OnSwapLeave {
    view = ({} as PageFilterPendingView);
    onPagerFocus = (data: any) => this.view.onPageFocus(data);
    onSwapFocus() { this.view.resumeRequest(); }
    onSwapLeave() { this.view.pauseRequest(); }
    render() {
        return (<>
            <PageFilterReceivedView ref={(ref: any) => this.view = ref} status='1' />
        </>);
    }
}
class ClaimTab2View extends React.Component implements OnSwapFocus, OnSwapLeave {
    view = ({} as PageFilterPendingView);
    onPagerFocus = (data: any) => this.view.onPageFocus(data);
    onSwapFocus() { this.view.resumeRequest(); }
    onSwapLeave() { this.view.pauseRequest(); }
    render() {
        return (<>
            <PageFilterPendingView ref={(ref: any) => this.view = ref} status='2' />
        </>);
    }
}
class CancelledTab3View extends React.Component implements OnSwapFocus, OnSwapLeave {
    view = ({} as PageFilterClosedView);
    onPagerFocus = (data: any) => null;
    onSwapFocus() { this.view.resumeRequest(); }
    onSwapLeave() { this.view.pauseRequest(); }
    render() {
        return (<>
            <PageFilterClosedView ref={(ref: any) => this.view = ref} status='3' />
        </>);
    }
}

class PageFilterRequestView extends React.Component<{ status?: (undefined | '0' | '1' | '2' | '3') }> {
    // popUpCustomerActionPopUp(item: any) {
    //     throw new Error('Method not implemented.');
    // }
    state: any = {};

    get pager() { return UserPager.instance.pager; }
    componentWillMount = () => {
        const { props, prop, filter } = this;
        filter.Status = (props.status || '0');
        filter.IsCompleted = (props.status == '0');
        this.subs.u = jUserModify(async () => {
            const u = await jUser();
            Object.rcopy(filter, {
                RequestBy: u.USR_ID,
                PL_ID: u.PL_ID,
                PGRP_ID: u.PGRP_ID,
                OTP_DT: u.OTP_DT,
                ACT_ID: u.ACT_ID,
                SUBSCR_TYP: u.SUBSCR_TYP,
                REF_GRP_ID: u.REF_GRP_ID,
                REF_LDR_ID: u.REF_LDR_ID,
                FLL_NM: u.FLL_NM,
                isUser: u.isUser
            });
            this.setState({ u, filter });
        });
        this.setState({ prop, filter });
        console.log(this.filter);
    }

    list: any = [];
    prop: any = { IsFiltering: true };
    filter: any = { Method: '', num_row: '0' };
    subs: any = {};
    rqt: any = {};
    componentDidMount = () => {
        this.performRequestDelay({ IsReset: true }, mtCb, 1275);
    }
    componentWillUnmount = () => {
        Object.values(this.subs).map((m: any) => m.unsubscribe());
    }
    hBackButton = () => {
        this.pager.back();
    }
    hPullRefresh = (ev: any) => {
        this.performRequestDelay({ IsReset: true, IsFiltering: true }, (err: any) => ev.detail.complete());
    }
    hLoadMore = (item: any) => {
        var filter = item.NextFilter;
        this.filter.num_row = item.NextFilter.NextFilter;
        filter.IsFiltering = true;
        this.setState({ list: this.list });
        this.performRequestDelay(filter, (err: any) => {
            if (!!err) return (filter.IsFiltering = false);
            delete item.NextFilter;
        });
    }
    hPayMethod = () => {
        this.performRequestDelay({ IsReset: true });
    }
    // hItem = async (item: any) => {
    //     this.popUpPowerAp(item);
    // }
    selectedItem: any;
    hItem = async (item: any) => {
        item.isEdit = true;
        item.isAdd = false
        this.selectedItem = item;
        //console.log(item);
        this.pager.next(RequestBrgyClearanceView, ({ instance }: { instance: RequestBrgyClearanceView }) => {
            instance?.setType(item.isAdd,item.ClearanceNo,item.ControlNo).setForm(item);
        });
        // if (item.DoctypeID == '1') {
        //     //this.popBrgyClearanceOpenPopUp(item);
        //     this.pager.next(RequestBrgyBusinessPermitView, ({ instance }: { instance: RequestBrgyBusinessPermitView }) => {
        //         instance?.setType(item.isAdd, item.DoctypeID, item.DoctypeNM).setForm(item);
        //     });
        // }
        // else if (item.DoctypeID == '3') {
        //     this.pager.next(RequestBrgyClearanceView, ({ instance }: { instance: RequestBrgyClearanceView }) => {
        //         instance?.setType(item.isAdd,item.DoctypeID,item.DoctypeNM).setForm(item);
        //     });
        // }
        // else if (item.DoctypeID == '2') {
        //     this.pager.next(RequestBrgyDocumentView, ({ instance }: { instance: RequestBrgyDocumentView }) => {
        //         instance?.setType(item.isAdd,item.DoctypeID,item.DoctypeNM).setForm(item);
        //     });
        // }
        // else if (item.DoctypeID == '4') {
        //     this.pager.next(RequestBrgyCTCView, ({ instance }: { instance: RequestBrgyCTCView }) => {
        //         instance?.setType(item.isAdd,item.DoctypeID,item.DoctypeNM).setForm(item);
        //     });
        // }
    }
    hOnProcess = async (item: any) => {
        this.popUpPowerAp(item);
    }
    hViewAttachement = async (item: any) => {
        item.isEdit = true;
        item.isAdd = false
        this.selectedItem = item;
        //console.log(this.selectedItem);
        //this.popUpCustomerActionPopUp(subscriber);
        console.log(item);
        this.pager.next(RequestDocumentAttachmentView, ({ instance }: { instance: RequestDocumentAttachmentView }) => {
            instance?.setType(item.isAdd).setForm(item);
        });
    }
    hViewProfile = async (item: any) => {
        this.selectedItem = item;
        //this.popUpCustomerActionPopUp(item);
        this.popBrgyClearanceOpenPopUp(item);
        // if (item.DoctypeID == '3') {
        //     this.popBrgyClearanceOpenPopUp(item);
        // }
        // else if (item.DoctypeID == '2') {
        //     this.popRequestDocumentPopUp(item);
        // }
        // else if (item.DoctypeID == '4') {
        //     this.popRequestDocumentPopUp(item);
        // }


    }

    async popBrgyClearanceOpenPopUp(subscriber: any) {
        const modal = await RequestBrgyClearancePopUp.modal(subscriber);
        await modal.present();
        const { data: { IsDone } = mtObj } = await modal.onDidDismiss();
        if (!IsDone) return;
        const { list } = this;
        const index = list.indexOf(subscriber);
        list.splice(index, 1);
        this.setState({ list });
    }
    async popRequestDocumentPopUp(subscriber: any) {
        const modal = await RequestDocumentPopUp.modal(subscriber);
        await modal.present();
        const { data: { IsDone } = mtObj } = await modal.onDidDismiss();
        if (!IsDone) return;
        const { list } = this;
        const index = list.indexOf(subscriber);
        list.splice(index, 1);
        this.setState({ list });
    }
    async popRequestCedulaPopUp(subscriber: any) {
        const modal = await RequestCedulaPopUp.modal(subscriber);
        await modal.present();
        const { data: { IsDone } = mtObj } = await modal.onDidDismiss();
        if (!IsDone) return;
        const { list } = this;
        const index = list.indexOf(subscriber);
        list.splice(index, 1);
        this.setState({ list });
    }

    hFState = (ev: any, key: string) => this.filter[key] = ev.detail.value;

    public pauseRequest() {
        if (this.subs.s1) this.subs.s1.unsubscribe();
    }
    public resumeRequest() {
        if (this.rqt.r1) this.rqt.r1();
    }
    private performRequestDelay(filter: any, callback: Function = mtCb, delay: number = 175) {
        if (this.subs.t1) this.subs.t1.unsubscribe();
        this.prop.IsFiltering = !filter.IsFiltering;
        console.log(this.filter);
        this.setState({ prop: this.prop });
        this.subs.t1 = timeout(() => this.performRequest(filter, callback), delay);
    }
    hFilter = () => {
        this.prop.IsFiltering = true;
        this.filter.num_row = 0;
        this.performRequestDelay({ IsReset: true }, mtCb, 1275);
    }

    onPageFocus = (data: any) => {
        if (!data) return;
        //if (data.component == LeaderDirectAddMember) {
        //if (!this.selectedItem) return;
        if (!data.IsUpdate) {
            this.list.unshift(data.item);
        } else Object.rcopy(this.selectedItem, Customer(data.item));
        this.setState({ list: this.list });
        //}
    }

    private performRequest(filter: any, callback: Function = mtCb) {
        if (!this.subs) return;
        if (this.subs.s1) this.subs.s1.unsubscribe();
        this.subs.s1 = rest.post('cedula/list', Object.rcopy(filter, this.filter)).subscribe(async (res: any) => {
            this.prop.IsFiltering = false;
            if (res.Status != 'error') {
                if (filter.IsReset) this.list = res.requestcedula.map((o: any) => o);
                else res.requestcedula.forEach((o: any) => this.list.push(o));
                this.prop.IsEmpty = (this.list.length < 1);
                if (callback != null) callback();
                this.setState({ filter: this.filter, prop: this.prop, list: this.list });
                console.log(this.list);
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

    async popUpPowerAp(subscriber: any) {
        const modal = await ProcessIssuesConcernPopUp.modal(subscriber);
        await modal.present();
        const { data: { IsDone } = mtObj } = await modal.onDidDismiss();
        if (!IsDone) return;
        const { list } = this;
        const index = list.indexOf(subscriber);
        list.splice(index, 1);
        this.setState({ list });


    }
    hMemberOpt = (ev: any) => {
        this.filter.isAdd = true;
        this.filter.isEdit = false;
        this.filter.STAT = "Open";
        console.log(this.filter);

        var type = (ev.detail || mtObj).value;
        this.pager.next(RequestBrgyClearanceView, ({ instance }: { instance: RequestBrgyClearanceView }) => instance?.setType(this.filter.isAdd, type, 'Request Barangay Clearance'));

        // if (!type) return;
        // if (type == 1) {
        //     this.pager.next(RequestBrgyBusinessPermitView, ({ instance }: { instance: RequestBrgyBusinessPermitView }) => instance?.setType(this.filter.isAdd, type, 'Barangay Business Permit'));
        // }
        // else if (type == 2) {
        //     this.pager.next(RequestBrgyDocumentView, ({ instance }: { instance: RequestBrgyDocumentView }) => instance?.setType(this.filter.isAdd, type, 'Request Barangay Document'));
        // }
        // else if (type == 3) {
        //     this.pager.next(RequestBrgyClearanceView, ({ instance }: { instance: RequestBrgyClearanceView }) => instance?.setType(this.filter.isAdd, type, 'Request Barangay Clearance'));
        // }
        // else if (type == 4) {
        //     this.pager.next(RequestBrgyCTCView, ({ instance }: { instance: RequestBrgyCTCView }) => instance?.setType(this.filter.isAdd, type, 'Cedula (CTC)'));
        // }

    }
    hAddItem = (ev: any) => {
        //var type=(ev.detail||mtObj).value;
        //if(!type)return;
        //this.pager.next(LeaderDirectAddMember);
        //if (!this.filter.isGroup)
        this.filter.isAdd = true;
        this.filter.isEdit = false;
        console.log(this.filter.isAdd);
        // this.pager.next(RequestBrgyClearanceView, ({ instance }: { instance: RequestBrgyClearanceView }) => instance?.setType(this.filter.isAdd, '', ''));
        //this.memberOpts.open();


        //else
        //    this.leaderOpts.open();
    }

    hInputRequest = async (key: string,opts: any) => {
        const input: any = {};
        const list = this.list;
        // if(!input.ToggleEdit) return;
        const modal = await RequestPopUp.modal('REQUEST',{PL_ID: this.filter.PL_ID,PGRP_ID: this.filter.PGRP_ID,USR_ID: this.filter.RequestBy});
        await modal.present();
        const res = await modal.onDidDismiss();
        const data = (res || mtObj).data;
        if (!data) return;
        input.RequestId = this.filter.PL_ID+this.filter.PGRP_ID+data.RequestId;
        input.GrossBusinessIncome = data.GrossBusinessIncome;
        input.Salary = data.Salary;
        input.RealPropertyIncome = data.RealPropertyIncome;
        input.AmountPaid = (input.AmountPaid || '0.00');
        input.Fullname = this.filter.FLL_NM;
        list.push(Customer(input));
        this.setState({list: this.list});
        console.log(list.sort());
    }

    isValidation = (item: any) => {
        if(!item) return false;

        const request = item;
        request.RequestBy = this.filter.FLL_NM;
        request.CancelledReason = "test";
        request.PL_ID = this.filter.PL_ID;
        request.PGRP_ID = this.filter.PGRP_ID;
        return true;
    }

    hConfirm = async (item: any) => {
        if(!this.isValidation(item)) return;
        Alert.swal({
            title: 'Confirmation',
            text: 'Are you sure you want to Cancel?',
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
                return setTimeout(() => this.performSubmit(item), 750);
            }
        });
    }

    private performSubmit(item: any) {
        rest.post('cedula/cancel', item).subscribe(async (res: any) => {
            if (res.Status == 'ok') {
                Alert.showSuccessMessage(res.Message);
                const index = this.list.indexOf(item);
                this.list.splice(index,1);
                return this.setState({list: this.list});
            }
            Alert.showErrorMessage(res.Message);
        }, (err: any) => {
            Alert.showWarningMessage('Please try again');
        });
    }

    elIonSelect: any = React.createRef();
    get memberOpts() { return this.elIonSelect.current; }

    render() {
        const { filter = {}, prop = {} } = this.state;
        const { list = [] } = this.state;
        return (<>
            <Layout full>
                {/* <Layout className="row m-0" style={styles('height:auto')}>
                    <div className="col-12 p-0 filter_options-bg">
                        <div style={styles('padding:5px')}>
                            <div className="row m-0">
                                <div className="col-12 p-0">
                                    <div style={styles('font-size:12px;color:#000000;')}>Enter any keyword to search and hit search button</div>
                                </div>
                            </div>
                            <div className="row m-0">
                                <div className="col-9 p-0" style={styles('height:auto')}>
                                    <IonItem lines="none" className="input-error bg-adjust" style={styles('--highlight-background:unset;--min-height:40px;border-radius:10px;--background: rgba(0,0,0,0.75);')}>
                                        <Input ion node={(handle) => <>
                                            <IonInput className="font-bold br-0" style={styles('--padding-bottom:0px;--padding-top:0px;color:#fefed1')}
                                                type="text" placeholder="Search" value={filter.Search} {...handle({ onChange: (ev) => this.hFState(ev, 'Search') })} />
                                        </>} />
                                    </IonItem>
                                </div>
                                <div className="col-3 p-0 horizontal">
                                    <div className="btn-default" style={styles('width:100px;padding:5px')} onClick={this.hFilter}>SEARCH</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Layout> */}
                <Layout auto>
                    <NotFoundView visible={list.length<1?prop.IsEmpty:false} />
                    <FilteringView visible={prop.IsFiltering} />
                    <IonContent scrollY>
                        <IonRefresher slot="fixed" onIonRefresh={this.hPullRefresh}>
                            <IonRefresherContent />
                        </IonRefresher>
                            <div style={styles('margin-top:5%;')}>
                                {list?.map((item: any, idx: any) =>
                                    <div className="zoomIn-fadeIn">
                                        <IonCard style={styles('--background:rgba(0, 6, 69, 0.1);font-weight:bold;')}>
                                            <IonCardContent >
                                                <div className="row m-0">
                                                    <div className='col-8'>
                                                        <div style={styles('font-size:14pt;')}>
                                                            <IonLabel style={styles('')} position="fixed">REQ #: {item.RequestId}</IonLabel>
                                                        </div>
                                                        <div className="">
                                                            <IonLabel style={styles({color: item.isClaimable?'rgb(90,155,255)':''})}>{item.isClaimable?'Claimable':'Pending'}</IonLabel>
                                                        </div>
                                                    </div>
                                                    <div className="col-4" style={styles('margin-top:auto;margin-bottom:auto;')}>
                                                        <div className="lbl-status">
                                                            <div style={styles('font-size:14pt;')}>
                                                                <IonLabel style={styles('')}>
                                                                    <span hidden={item.AmountPaid === '0.00'?true:false}>&#8369;</span>
                                                                    {item.AmountPaid === '0.00'?'-':item.AmountPaid}
                                                                </IonLabel>
                                                            </div>
                                                            <div >
                                                                <IonLabel style={styles('')}>{ item.RequestDate || new Date().toLocaleDateString()}</IonLabel>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </IonCardContent>
                                        </IonCard>
                                    </div>
                                )}
                            </div>
                            {/* <div className="">
                                {list?.map((item: any, idx: any) =>
                                    <div className={classNames('list-item', { 'bg': (!item.NextFilter || item.IsBlocked), 'bg-black': !item.NextFilter, 'border-red': item.IsBlocked })} style={styles('background-color:#1d2c65')}>
                                        {!item.NextFilter ? <OpenItem item={item} accntype={filter} onClick={() => this.hViewProfile(item)} onUpdateIssuesConcern={() => this.hItem(item)} onProccessIssuesConcern={() => this.hOnProcess(item)} onViewAttachment={() => this.hViewAttachement(item)} /> : <MoreItem item={item} onClick={() => this.hLoadMore(item)} />}
                                    </div>
                                )}
                            </div> */}
                        {/* </IonList> */}
                        {/* <IonFab vertical="bottom" horizontal="end" slot="fixed" style={styles('margin-bottom:3vw;margin-right:2vw;bottom:5%;')}>
                            <IonFabButton onClick={() => this.hInputRequest('Request',null)} style={styles('height:75px;width:75px;')}>
                                <IonIcon icon={addOutline} />
                            </IonFabButton>
                        </IonFab> */}
                        {/* <div className="btn-like-fab"> */}
                            <IonButton className='btn-like-fab' slot='fixed' onClick={() => this.hInputRequest('Request',null)} style={styles('height:50px;width:75px;--border-radius:10px;')}>
                                <IonIcon size="large" icon={addOutline} />
                            </IonButton>
                        {/* </div> */}
                    </IonContent>
                </Layout>

            </Layout>
            <div style={styles('visibility:hidden;height:0px;width:0px')}>
                {/*
                <IonSelect ref={this.elIonSelect} interface="action-sheet"
                    onIonChange={clearAfter(this.hMemberOpt)}>
                    <IonSelectOption value='6'>Concern and Issues</IonSelectOption>
                </IonSelect>

                */}
                <IonSelect ref={this.elIonSelect} interface="action-sheet"
                    onIonChange={clearAfter(this.hMemberOpt)}>
                    {/* <IonSelectOption value='1'>Request Barangay Business Permit</IonSelectOption> */}
                    <IonSelectOption value='2'>Request Barangay Document</IonSelectOption>
                    {/* <IonSelectOption value='3'>Request Barangay Clearance</IonSelectOption> */}
                    <IonSelectOption value='4'>Request Community Tax Certificate (CTC)</IonSelectOption>
                </IonSelect>
            </div>
        </>);
    }
}

class PageFilterReceivedView extends React.Component<{ status?: (undefined | '0' | '1' | '2' | '3') }> {
    state: any = {};

    get pager() { return UserPager.instance.pager; }
    componentWillMount = () => {
        const { props, prop, filter } = this;
        filter.Status = (props.status || '');
        filter.IsCompleted = (props.status == '2');
        this.subs.u = jUserModify(async () => {
            const u = await jUser();
            Object.rcopy(filter, {
                Userid: u.USR_ID,
                PL_ID: u.PL_ID,
                PGRP_ID: u.PGRP_ID,
                OTP_DT: u.OTP_DT,
                ACT_ID: u.ACT_ID,
                SUBSCR_TYP: u.SUBSCR_TYP,
                REF_GRP_ID: u.REF_GRP_ID,
                REF_LDR_ID: u.REF_LDR_ID,
                isUser: u.isUser
            });
            this.setState({ u, filter });
        });
        this.setState({ prop, filter });
    }

    list: any = [];
    prop: any = { IsFiltering: true };
    filter: any = { Method: '', num_row: '0' };
    subs: any = {};
    rqt: any = {};
    componentDidMount = () => {
        this.performRequestDelay({ IsReset: true }, mtCb, 1275);
    }
    componentWillUnmount = () => {
        Object.values(this.subs).map((m: any) => m.unsubscribe());
    }
    hBackButton = () => {
        this.pager.back();
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
    hPayMethod = () => {
        this.performRequestDelay({ IsReset: true });
    }

    selectedItem: any;
    hItem = async (item: any) => {
        item.isEdit = true;
        item.isAdd = false
        this.selectedItem = item;
        if (item.DoctypeID == '1') {
            this.pager.next(RequestBrgyBusinessPermitView, ({ instance }: { instance: RequestBrgyBusinessPermitView }) => {
                instance?.setType(item.isAdd, item.DoctypeID, item.DoctypeNM).setForm(item);
            });
        }

        else if (item.DoctypeID == '3') {
            this.pager.next(RequestBrgyClearanceView, ({ instance }: { instance: RequestBrgyClearanceView }) => {
                instance?.setType(item.isAdd,item.DoctypeID,item.DoctypeNM).setForm(item);
            });
        }
        else if (item.DoctypeID == '2') {
            this.pager.next(RequestBrgyDocumentView, ({ instance }: { instance: RequestBrgyDocumentView }) => {
                instance?.setType(item.isAdd, item.DoctypeID, item.DoctypeNM).setForm(item);
            });
        }
        else if (item.DoctypeID == '4') {
            this.pager.next(RequestBrgyCTCView, ({ instance }: { instance: RequestBrgyCTCView }) => {
                instance?.setType(item.isAdd,item.DoctypeID,item.DoctypeNM).setForm(item);
            });
        }
    }
    hViewAttachement = async (item: any) => {
        item.isEdit = true;
        item.isAdd = false
        this.selectedItem = item;
        //console.log(this.selectedItem);
        //this.popUpCustomerActionPopUp(subscriber);
        console.log(item);
        this.pager.next(RequestDocumentAttachmentView, ({ instance }: { instance: RequestDocumentAttachmentView }) => {
            instance?.setType(item.isAdd).setForm(item);
        });
    }
    // hItem = async (item: any) => {
    //     if (item.IsCancelled) return;
    //     if (item.IsPending) {
    //         return this.popUpPowerAp(item);
    //     } else if (item.IsApproved) {
    //         return this.pager.next(PowerApSummaryView, ({ instance }: { instance: PowerApSummaryView }) => instance?.setCustomer(item));
    //     }
    // }

    hFState = (ev: any, key: string) => this.filter[key] = ev.detail.value;

    public pauseRequest() {
        if (this.subs.s1) this.subs.s1.unsubscribe();
    }
    public resumeRequest() {
        if (this.rqt.r1) this.rqt.r1();
    }
    private performRequestDelay(filter: any, callback: Function = mtCb, delay: number = 175) {
        if (this.subs.t1) this.subs.t1.unsubscribe();
        this.prop.IsFiltering = !filter.IsFiltering;
        this.setState({ prop: this.prop });
        this.subs.t1 = timeout(() => this.performRequest(filter, callback), delay);
    }

    hFilter = () => {
        this.prop.IsFiltering = true;
        this.performRequestDelay({ IsReset: true }, mtCb, 1275);
    }

    private performRequest(filter: any, callback: Function = mtCb) {
        if (!this.subs) return;
        if (this.subs.s1) this.subs.s1.unsubscribe();
        this.subs.s1 = rest.post('reqbrgyclearance', Object.rcopy(filter, this.filter)).subscribe(async (res: any) => {
            this.prop.IsFiltering = false;
            if (res.Status != 'error') {
                if (filter.IsReset) this.list = res.map((o: any) => Customer(o));
                else res.forEach((o: any) => this.list.push(Customer(o)));
                this.prop.IsEmpty = (this.list.length < 1);
                if (callback != null) callback();
                this.setState({ filter: this.filter, prop: this.prop, list: this.list });
                console.log(this.filter);
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


    hViewProfile = async (item: any) => {
        this.selectedItem = item;
        this.popBrgyClearanceOpenPopUp(item);
        //this.popUpCustomerActionPopUp(item);
        // if (item.DoctypeID == '3') {
        //     this.popBrgyClearanceOpenPopUp(item);
        // }
        // else if (item.DoctypeID == '2') {
        //     this.popRequestDocumentPopUp(item);
        // }
        // else if (item.DoctypeID == '4') {
        //     this.popRequestDocumentPopUp(item);
        // }


    }

    async popBrgyClearanceOpenPopUp(subscriber: any) {
        const modal = await RequestBrgyClearancePopUp.modal(subscriber);
        await modal.present();
        const { data: { IsDone } = mtObj } = await modal.onDidDismiss();
        if (!IsDone) return;
        const { list } = this;
        const index = list.indexOf(subscriber);
        list.splice(index, 1);
        this.setState({ list });
    }
    async popRequestDocumentPopUp(subscriber: any) {
        const modal = await RequestDocumentPopUp.modal(subscriber);
        await modal.present();
        const { data: { IsDone } = mtObj } = await modal.onDidDismiss();
        if (!IsDone) return;
        const { list } = this;
        const index = list.indexOf(subscriber);
        list.splice(index, 1);
        this.setState({ list });
    }
    async popRequestCedulaPopUp(subscriber: any) {
        const modal = await RequestCedulaPopUp.modal(subscriber);
        await modal.present();
        const { data: { IsDone } = mtObj } = await modal.onDidDismiss();
        if (!IsDone) return;
        const { list } = this;
        const index = list.indexOf(subscriber);
        list.splice(index, 1);
        this.setState({ list });
    }
    onPageFocus = (data: any) => {

        // if (!data) return;
        // if (!this.selectedItem) return;
        // if (!data.IsUpdate) {
        //     this.list.unshift(data.item);
        // } else {
        //     const { list } = this;
        //     const index = list.indexOf(this.selectedItem);
        //     list.splice(index, 1);
        //     this.setState({ list });
        // }

        if (!data) return;
        //if (data.component == LeaderDirectAddMember) {
        if (!this.selectedItem) return;
        if (!data.IsUpdate) {
            this.list.unshift(data.item);
        } else Object.rcopy(this.selectedItem, Customer(data.item));
        this.setState({ list: this.list });
    }

    async popUpPowerAp(subscriber: any) {
        const modal = await PowerApRequestPopUp.modal(subscriber);
        await modal.present();
        const res = await modal.onDidDismiss();
        const data = (res || {}).data;
        if (!data) return;
        Object.rcopy(subscriber, data.item);
        this.setState({ list: this.list });
    }

    render() {
        const { filter = {}, prop = {} } = this.state;
        const { list = [] } = this.state;
        return (<>
            <Layout full>
                <Layout className="row m-0" style={styles('height:auto')}>
                    <div className="col-12 p-0 filter_options-bg">
                        <div style={styles('padding:5px')}>
                            <div className="row m-0">
                                <div className="col-12 p-0">
                                    <div style={styles('font-size:12px;color:#000000;')}>Enter any keyword to search and hit search button</div>
                                </div>
                            </div>
                            <div className="row m-0">
                                <div className="col-9 p-0" style={styles('height:auto')}>
                                    <IonItem lines="none" className="input-error bg-adjust" style={styles('--highlight-background:unset;--min-height:40px;border-radius:10px;--background: rgba(0,0,0,0.75);')}>
                                        <Input ion node={(handle) => <>
                                            <IonInput className="font-bold br-0" style={styles('--padding-bottom:0px;--padding-top:0px;color:#fefed1;')}
                                                type="text" placeholder="Search" value={filter.Search} {...handle({ onChange: (ev) => this.hFState(ev, 'Search') })} />
                                        </>} />
                                    </IonItem>
                                </div>
                                <div className="col-3 p-0 horizontal">
                                    <div className="btn-default" style={styles('width:100px;padding:5px')} onClick={this.hFilter}>SEARCH</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Layout>
                <Layout auto>
                    <NotFoundView visible={prop.IsEmpty} />
                    <FilteringView visible={prop.IsFiltering} />
                    <IonContent scrollY>
                        <IonRefresher slot="fixed" onIonRefresh={this.hPullRefresh}>
                            <IonRefresherContent />
                        </IonRefresher>
                        <IonList lines='none'>
                            <div className="list wbg filter_options-bg">
                                {list?.map((item: any, idx: any) =>
                                    <div className={classNames('list-item', { 'bg': (!item.NextFilter || item.IsBlocked), 'bg-black': !item.NextFilter, 'border-red': item.IsBlocked })} style={styles('background-color:#1d2c65')}>
                                        {!item.NextFilter ? <RecievedItem item={item} accntype={filter} onClick={() => this.hViewProfile(item)} onProccessIssuesConcern={() => this.hItem(item)} onViewAttachment={() => this.hViewAttachement(item)} /> : <MoreItem item={item} onClick={() => this.hLoadMore(item)} />}
                                        {/* {!item.NextFilter ? <PendingItem item={item} onClick={() => this.hItem(item)} /> : <MoreItem item={item} onClick={() => this.hLoadMore(item)} />} */}
                                    </div>
                                )}
                            </div>
                        </IonList>
                    </IonContent>
                </Layout>
            </Layout>
        </>);
    }
}
class PageFilterPendingView extends React.Component<{ status?: (undefined | '0' | '1' | '2' | '3') }> {
    state: any = {};

    get pager() { return UserPager.instance.pager; }
    componentWillMount = () => {
        const { props, prop, filter } = this;
        filter.Status = (props.status || '');
        filter.IsCompleted = (props.status == '2');
        this.subs.u = jUserModify(async () => {
            const u = await jUser();
            Object.rcopy(filter, {
                RequestBy: u.USR_ID,
                PL_ID: u.PL_ID,
                PGRP_ID: u.PGRP_ID,
                OTP_DT: u.OTP_DT,
                ACT_ID: u.ACT_ID,
                SUBSCR_TYP: u.SUBSCR_TYP,
                REF_GRP_ID: u.REF_GRP_ID,
                REF_LDR_ID: u.REF_LDR_ID,
                isUser: u.isUser,
                Type: 1
            });
            this.setState({ u, filter });
        });
        this.setState({ prop, filter });
    }

    list: any = [];
    prop: any = { IsFiltering: true };
    filter: any = { Method: '', num_row: '0' };
    subs: any = {};
    rqt: any = {};
    componentDidMount = () => {
        this.performRequestDelay({ IsReset: true }, mtCb, 1275);
    }
    componentWillUnmount = () => {
        Object.values(this.subs).map((m: any) => m.unsubscribe());
    }
    hBackButton = () => {
        this.pager.back();
    }
    hPullRefresh = (ev: any) => {
        this.filter.Search = '';
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
    hPayMethod = () => {
        this.performRequestDelay({ IsReset: true });
    }
    selectedItem: any;
    hItem = async (item: any) => {
        item.isEdit = true;
        item.isAdd = false
        this.selectedItem = item;
        //console.log(this.selectedItem);
        //this.popUpCustomerActionPopUp(subscriber);
        // this.pager.next(ReportProblemView, ({ instance }: { instance: ReportProblemView }) => {
        //     instance?.setType(item.isAdd).setForm(item);
        // });
        if (item.DoctypeID == '3') {
            this.pager.next(RequestBrgyClearanceView, ({ instance }: { instance: RequestBrgyClearanceView }) => {
                instance?.setType(item.isAdd,item.DoctypeID,item.DoctypeNM).setForm(item);
            });
        }
        else if (item.DoctypeID == '2') {
            this.pager.next(RequestBrgyDocumentView, ({ instance }: { instance: RequestBrgyDocumentView }) => {
                instance?.setType(item.isAdd,item.DoctypeID,item.DoctypeNM).setForm(item);
            });
        }
        else if (item.DoctypeID == '4') {
            this.pager.next(RequestBrgyCTCView, ({ instance }: { instance: RequestBrgyCTCView }) => {
                instance?.setType(item.isAdd,item.DoctypeID,item.DoctypeNM).setForm(item);
            });
        }
    }
    hViewAttachement = async (item: any) => {
        item.isEdit = true;
        item.isAdd = false
        this.selectedItem = item;
        //console.log(this.selectedItem);
        //this.popUpCustomerActionPopUp(subscriber);
        console.log(item);
        this.pager.next(RequestDocumentAttachmentView, ({ instance }: { instance: RequestDocumentAttachmentView }) => {
            instance?.setType(item.isAdd).setForm(item);
        });
    }
    // hItem = async (item: any) => {
    //     if (item.IsCancelled) return;
    //     if (item.IsPending) {
    //         return this.popUpPowerAp(item);
    //     } else if (item.IsApproved) {
    //         return this.pager.next(PowerApSummaryView, ({ instance }: { instance: PowerApSummaryView }) => instance?.setCustomer(item));
    //     }
    // }

    hFState = (ev: any, key: string) => this.filter[key] = ev.detail.value;

    public pauseRequest() {
        if (this.subs.s1) this.subs.s1.unsubscribe();
    }
    public resumeRequest() {
        if (this.rqt.r1) this.rqt.r1();
    }
    private performRequestDelay(filter: any, callback: Function = mtCb, delay: number = 175) {
        if (this.subs.t1) this.subs.t1.unsubscribe();
        this.prop.IsFiltering = !filter.IsFiltering;
        this.setState({ prop: this.prop });
        this.subs.t1 = timeout(() => this.performRequest(filter, callback), delay);
    }

    hFilter = () => {
        this.prop.IsFiltering = true;
        // this.performRequestDelay({ IsReset: true }, mtCb, 1275);
        timeout(() => this.onSearching(), 175);
    }

    private onSearching ()
    {
        this.list = this.list.filter((o: any) => this.searching(o));
        this.prop.IsFiltering = false;
        this.setState({list: this.list});
    }
    private searching(item: any){
        // return (item.RequestId === this.filter.Search || 
        //     item.ReleaseDate === this.filter.Search || 
        //     item.CancelDate === this.filter.Search);
        var searchResult: string = '';
        if(item.RequestId.includes(this.filter.Search))
            searchResult = item.RequestId;
        if(String(item.ReleaseDate).includes(this.filter.Search))
            searchResult = item.ReleaseDate;
        if(String(item.CancelledDate).includes(this.filter.Search))
            searchResult = item.CancelledDate;
        
        return (item.RequestId === searchResult || 
                item.ReleaseDate === searchResult || 
                item.CancelledDate === searchResult);
    }

    private performRequest(filter: any, callback: Function = mtCb) {
        if (!this.subs) return;
        if (this.subs.s1) this.subs.s1.unsubscribe();
        this.subs.s1 = rest.post('cedula/list', Object.rcopy(filter, this.filter)).subscribe(async (res: any) => {
            this.prop.IsFiltering = false;
            if (res.Status != 'error') {
                console.log(res.requestcedula);
                if (filter.IsReset) this.list = res.requestcedula.map((o: any) => o);
                else res.requestcedula.forEach((o: any) => this.list.push(o));
                this.prop.IsEmpty = (this.list.length < 1);
                if (callback != null) callback();
                this.setState({ filter: this.filter, prop: this.prop, list: this.list.reverse() });
                console.log(this.filter);
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


    hViewProfile = async (item: any) => {
        this.selectedItem = item;
        this.popBrgyClearanceOpenPopUp(item);
        //this.popUpCustomerActionPopUp(item);
        // if (item.DoctypeID == '3') {
        //     this.popBrgyClearanceOpenPopUp(item);
        // }
        // else if (item.DoctypeID == '2') {
        //     this.popRequestDocumentPopUp(item);
        // }
        // else if (item.DoctypeID == '4') {
        //     this.popRequestDocumentPopUp(item);
        // }


    }

    async popBrgyClearanceOpenPopUp(subscriber: any) {
        const modal = await RequestBrgyClearancePopUp.modal(subscriber);
        await modal.present();
        const { data: { IsDone } = mtObj } = await modal.onDidDismiss();
        if (!IsDone) return;
        const { list } = this;
        const index = list.indexOf(subscriber);
        list.splice(index, 1);
        this.setState({ list });
    }
    async popRequestDocumentPopUp(subscriber: any) {
        const modal = await RequestDocumentPopUp.modal(subscriber);
        await modal.present();
        const { data: { IsDone } = mtObj } = await modal.onDidDismiss();
        if (!IsDone) return;
        const { list } = this;
        const index = list.indexOf(subscriber);
        list.splice(index, 1);
        this.setState({ list });
    }
    async popRequestCedulaPopUp(subscriber: any) {
        const modal = await RequestCedulaPopUp.modal(subscriber);
        await modal.present();
        const { data: { IsDone } = mtObj } = await modal.onDidDismiss();
        if (!IsDone) return;
        const { list } = this;
        const index = list.indexOf(subscriber);
        list.splice(index, 1);
        this.setState({ list });
    }
    onPageFocus = (data: any) => {
        // if (!data) return;
        // if (!this.selectedItem) return;
        // if (!data.IsUpdate) {
        //     this.list.unshift(data.item);
        // } else {
        //     const { list } = this;
        //     const index = list.indexOf(this.selectedItem);
        //     list.splice(index, 1);
        //     this.setState({ list });
        // }
        if (!data) return;
        //if (data.component == LeaderDirectAddMember) {
        if (!this.selectedItem) return;
        if (!data.IsUpdate) {
            this.list.unshift(data.item);
        } else Object.rcopy(this.selectedItem, Customer(data.item));
        this.setState({ list: this.list });
    }

    async popUpPowerAp(subscriber: any) {
        const modal = await PowerApRequestPopUp.modal(subscriber);
        await modal.present();
        const res = await modal.onDidDismiss();
        const data = (res || {}).data;
        if (!data) return;
        Object.rcopy(subscriber, data.item);
        this.setState({ list: this.list });
    }

    render() {
        const { filter = {}, prop = {} } = this.state;
        const { list = [] } = this.state;
        return (<>
            <Layout full>
                <Layout className="row m-0" style={styles('height:auto')}>
                    <div className="col-12 p-0 filter_options-bg">
                        {/* <div style={styles('padding:5px')}>
                            <div className="row m-0">
                                <div className="col-12 p-0">
                                    <div style={styles('font-size:12px;color:#000000;')}>Enter any keyword to search and hit search button</div>
                                </div>
                            </div>
                            <div className="row m-0">
                                <div className="col-9 p-0" style={styles('height:auto')}>
                                    <IonItem lines="none" className="input-error bg-adjust" style={styles('--highlight-background:unset;--min-height:40px;border-radius:10px;--background: rgba(0,0,0,0.75);')}>
                                        <Input ion node={(handle) => <>
                                            <IonInput className="font-bold br-0" style={styles('--padding-bottom:0px;--padding-top:0px;color:#fefed1;')}
                                                type="text" placeholder="Search" value={filter.Search} {...handle({ onChange: (ev) => this.hFState(ev, 'Search') })} />
                                        </>} />
                                    </IonItem>
                                </div>
                                <div className="col-3 p-0 horizontal">
                                    <div className="btn-default" style={styles('width:100px;padding:5px')} onClick={this.hFilter}>SEARCH</div>
                                </div>
                            </div>
                        </div> */}
                        <div style={styles('padding:5px;')}>
                            <div className="row m-0" style={styles('border-radius:20px;background:rgb(219 221 237);')}>
                                <div className="col-10 p-0">
                                    <IonItem className="ion-searchbar" lines='none'>
                                        <Input ion node={(handle) => <>
                                            <IonInput
                                                type="text" placeholder="Search" value={filter.Search} {...handle({ onChange: (ev) => this.hFState(ev, 'Search') })} />
                                        </>} />
                                    </IonItem>
                                </div>
                                <div className="col-2 p-0" style={styles('border-radius:20px;background:#fff;border:1px solid rgb(219 221 237);')}>
                                    <div className="btn-search" >
                                        <IonItem lines="none" style={styles('border-radius:20px;background:#fff;')}
                                             onClick={this.hFilter}>
                                            <IonIcon size="large" icon={searchOutline} />
                                        </IonItem>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Layout>
                <Layout auto>
                    <NotFoundView visible={prop.IsEmpty} />
                    <FilteringView visible={prop.IsFiltering} />
                    <IonContent scrollY>
                        <IonRefresher slot="fixed" onIonRefresh={this.hPullRefresh}>
                            <IonRefresherContent />
                        </IonRefresher>
                        <IonList lines='none'>
                            {list?.map((item: any, idx: any) =>
                                <div className="zoomIn-fadeIn">
                                    <IonCard style={styles('--background:rgba(0, 6, 69, 0.1);font-weight:bold;')}>
                                        <IonCardContent >
                                            <div className="row m-0">
                                                <div className='col-8'>
                                                    <div style={styles('font-size:14pt;')}>
                                                        <IonLabel style={styles('')} position="fixed">REQ #: {item.RequestId}</IonLabel>
                                                    </div>
                                                    <div className="">
                                                        <IonLabel style={styles({color: item.isClaimed?'rgb(90,155,255)':''})}>{item.isClaimed?'Claimed':item.isCanceled?'Cancelled':''}</IonLabel>
                                                    </div>
                                                </div>
                                                <div className="col-4" style={styles('margin-top:auto;margin-bottom:auto;')}>
                                                    <div className="lbl-status">
                                                        <div style={styles('font-size:14pt;')}>
                                                            <IonLabel style={styles('')}>
                                                                <span hidden={item.AmountPaid === '0.00'?true:false}>&#8369;</span>
                                                                {item.AmountPaid === '0.00'?'-':item.AmountPaid}
                                                            </IonLabel>
                                                        </div>
                                                        <div >
                                                            <IonLabel style={styles('')}>{item?.ReleaseDate ?? item.CancelledDate}</IonLabel>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </IonCardContent>
                                    </IonCard>
                                </div>
                            )}
                            {/* <div className="list wbg filter_options-bg">
                                {list?.map((item: any, idx: any) =>
                                    <div className={classNames('list-item', { 'bg': (!item.NextFilter || item.IsBlocked), 'bg-black': !item.NextFilter, 'border-red': item.IsBlocked })} style={styles('background-color:#1d2c65')}>
                                        {!item.NextFilter ? <PendingItem item={item} accntype={filter} onClick={() => this.hViewProfile(item)} onProccessIssuesConcern={() => this.hItem(item)} onViewAttachment={() => this.hViewAttachement(item)} /> : <MoreItem item={item} onClick={() => this.hLoadMore(item)} />}
                                    </div>
                                )}
                            </div> */}
                        </IonList>
                    </IonContent>
                </Layout>
            </Layout>
        </>);
    }
}

class PageFilterClosedView extends React.Component<{ status?: (undefined | '0' | '1' | '2' | '3') }> {
    state: any = {};

    get pager() { return UserPager.instance.pager; }
    componentWillMount = () => {
        const { props, prop, filter } = this;
        filter.Status = (props.status || '');
        filter.IsCompleted = (props.status == '3');
        this.subs.u = jUserModify(async () => {
            const u = await jUser();
            Object.rcopy(filter, {
                Userid: u.USR_ID,
                PL_ID: u.PL_ID,
                PGRP_ID: u.PGRP_ID,
                OTP_DT: u.OTP_DT,
                ACT_ID: u.ACT_ID,
                SUBSCR_TYP: u.SUBSCR_TYP,
                REF_GRP_ID: u.REF_GRP_ID,
                REF_LDR_ID: u.REF_LDR_ID,
            });
            this.setState({ u, filter });
        });
        this.setState({ prop, filter });
    }

    list: any = [];
    prop: any = { IsFiltering: true };
    filter: any = { Method: '', num_row: '0' };
    subs: any = {};
    rqt: any = {};
    componentDidMount = () => {
        this.performRequestDelay({ IsReset: true }, mtCb, 1275);
    }
    componentWillUnmount = () => {
        Object.values(this.subs).map((m: any) => m.unsubscribe());
    }
    hBackButton = () => {
        this.pager.back();
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
    hPayMethod = () => {
        this.performRequestDelay({ IsReset: true });
    }
    selectedItem: any;
    hItem = async (item: any) => {
        if (item.IsCancelled) return;
        if (item.IsPending) {
            return this.popUpPowerAp(item);
        } else if (item.IsApproved) {
            return this.pager.next(PowerApSummaryView, ({ instance }: { instance: PowerApSummaryView }) => instance?.setCustomer(item));
        }
    }
    hFState = (ev: any, key: string) => this.filter[key] = ev.detail.value;

    public pauseRequest() {
        if (this.subs.s1) this.subs.s1.unsubscribe();
    }
    public resumeRequest() {
        if (this.rqt.r1) this.rqt.r1();
    }
    private performRequestDelay(filter: any, callback: Function = mtCb, delay: number = 175) {
        if (this.subs.t1) this.subs.t1.unsubscribe();
        this.prop.IsFiltering = !filter.IsFiltering;
        this.setState({ prop: this.prop });
        this.subs.t1 = timeout(() => this.performRequest(filter, callback), delay);
    }

    hFilter = () => {
        this.prop.IsFiltering = true;
        this.performRequestDelay({ IsReset: true }, mtCb, 1275);
    }

    private performRequest(filter: any, callback: Function = mtCb) {
        if (!this.subs) return;
        if (this.subs.s1) this.subs.s1.unsubscribe();
        this.subs.s1 = rest.post('reqbrgyclearance', Object.rcopy(filter, this.filter)).subscribe(async (res: any) => {
            this.prop.IsFiltering = false;
            if (res.Status != 'error') {
                if (filter.IsReset) this.list = res.map((o: any) => Customer(o));
                else res.forEach((o: any) => this.list.push(Customer(o)));
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

    async popUpPowerAp(subscriber: any) {
        const modal = await PowerApRequestPopUp.modal(subscriber);
        await modal.present();
        const res = await modal.onDidDismiss();
        const data = (res || {}).data;
        if (!data) return;
        Object.rcopy(subscriber, data.item);
        this.setState({ list: this.list });
    }

    hViewProfile = async (item: any) => {
        this.selectedItem = item;
        //this.popUpCustomerActionPopUp(item);
        if (item.DoctypeID == '3') {
            this.popBrgyClearanceOpenPopUp(item);
        }
        else if (item.DoctypeID == '2') {
            this.popRequestDocumentPopUp(item);
        }
        else if (item.DoctypeID == '4') {
            this.popRequestDocumentPopUp(item);
        }


    }

    async popBrgyClearanceOpenPopUp(subscriber: any) {
        const modal = await RequestBrgyClearancePopUp.modal(subscriber);
        await modal.present();
        const { data: { IsDone } = mtObj } = await modal.onDidDismiss();
        if (!IsDone) return;
        const { list } = this;
        const index = list.indexOf(subscriber);
        list.splice(index, 1);
        this.setState({ list });
    }
    async popRequestDocumentPopUp(subscriber: any) {
        const modal = await RequestDocumentPopUp.modal(subscriber);
        await modal.present();
        const { data: { IsDone } = mtObj } = await modal.onDidDismiss();
        if (!IsDone) return;
        const { list } = this;
        const index = list.indexOf(subscriber);
        list.splice(index, 1);
        this.setState({ list });
    }
    async popRequestCedulaPopUp(subscriber: any) {
        const modal = await RequestCedulaPopUp.modal(subscriber);
        await modal.present();
        const { data: { IsDone } = mtObj } = await modal.onDidDismiss();
        if (!IsDone) return;
        const { list } = this;
        const index = list.indexOf(subscriber);
        list.splice(index, 1);
        this.setState({ list });
    }

    hViewAttachement = async (item: any) => {
        item.isEdit = true;
        item.isAdd = false
        this.selectedItem = item;
        //console.log(this.selectedItem);
        //this.popUpCustomerActionPopUp(subscriber);
        console.log(item);
        this.pager.next(RequestDocumentAttachmentView, ({ instance }: { instance: RequestDocumentAttachmentView }) => {
            instance?.setType(item.isAdd).setForm(item);
        });
    }
    Open(url: any) {
        var win: any = window;
        if (device.isBrowser) window.open(url, '_blank');
        else if (win.cordova.InAppBrowser) win.cordova.InAppBrowser.open(url, '_system');
        else if (win.Capacitor.Plugins?.Browser) win.Capacitor.Plugins.Browser.open({ url: url });
        else window.open(url, '_blank');
    }

    render() {
        const { filter = {}, prop = {} } = this.state;
        const { list = [] } = this.state;
        return (<>
            <Layout full>
                <Layout className="row m-0" style={styles('height:auto')}>
                    <div className="col-12 p-0 filter_options-bg">
                        <div style={styles('padding:5px')}>
                            <div className="row m-0">
                                <div className="col-12 p-0">
                                    <div style={styles('font-size:12px;color:#000000;')}>Enter any keyword to search and hit search button</div>
                                </div>
                            </div>
                            <div className="row m-0">
                                <div className="col-9 p-0" style={styles('height:auto')}>
                                    <IonItem lines="none" className="input-error bg-adjust" style={styles('--highlight-background:unset;--min-height:40px;border-radius:10px;--background: rgba(0,0,0,0.75);')}>
                                        <Input ion node={(handle) => <>
                                            <IonInput className="font-bold br-0" style={styles('--padding-bottom:0px;--padding-top:0px;color:#fefed1;')}
                                                type="text" placeholder="Search" value={filter.Search} {...handle({ onChange: (ev) => this.hFState(ev, 'Search') })} />
                                        </>} />
                                    </IonItem>
                                </div>
                                <div className="col-3 p-0 horizontal">
                                    <div className="btn-default" style={styles('width:100px;padding:5px')} onClick={this.hFilter}>SEARCH</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Layout>
                <Layout auto>
                    <NotFoundView visible={prop.IsEmpty} />
                    <FilteringView visible={prop.IsFiltering} />
                    <IonContent scrollY>
                        <IonRefresher slot="fixed" onIonRefresh={this.hPullRefresh}>
                            <IonRefresherContent />
                        </IonRefresher>
                        <IonList lines='none'>
                            <div className="list wbg filter_options-bg">
                                {list?.map((item: any, idx: any) =>
                                    <div className={classNames('list-item', { 'bg': (!item.NextFilter || item.IsBlocked), 'bg-black': !item.NextFilter, 'border-red': item.IsBlocked })} style={styles('background-color:#1d2c65')}>
                                        {!item.NextFilter ? <ClosedItem item={item} onClick={() => this.hViewProfile(item)} onViewAttachment={() => this.hViewAttachement(item)} onOpen={()=>this.Open(item.URL_DocPath)} /> : <MoreItem item={item} onClick={() => this.hLoadMore(item)} />}
                                        {/* {!item.NextFilter ? <ClosedItem item={item} onClick={() => this.hItem(item)} /> : <MoreItem item={item} onClick={() => this.hLoadMore(item)} />} */}
                                    </div>
                                )}
                            </div>
                        </IonList>
                    </IonContent>
                </Layout>
            </Layout>
        </>);
    }
}

const OpenItem: React.FC<{ item: any, accntype: any, onClick?: React.MouseEventHandler, onUpdateIssuesConcern?: React.MouseEventHandler, onProccessIssuesConcern?: React.MouseEventHandler, onViewAttachment?: React.MouseEventHandler, }> = ({ item, accntype, onClick, onUpdateIssuesConcern, onProccessIssuesConcern, onViewAttachment }) => {
    if (!!item.NextFilter) return null;
    return (<>
        <div className="row m-0 details ion-activatable" style={styles('padding:5px')}>
            <IonRippleEffect />
            <div className="col-12 p-0 row m-0" style={styles('position:relative;width:100%;padding:5px!important')}>
                <div className="layout-horizontal">
                    <div className="auto" style={styles('width:15%')}>
                        <div className="horizontal" >
                            <div className="vertical" style={styles('padding:0px 2.5px')}>
                                <ImgPreloader className='user-image brand-image img-circle elevation-1 img-fit' style={styles('width:45px')}
                                    placeholder='./assets/img/icon_blank_profile.png' src={item.ProfilePicture} />
                            </div>
                        </div>
                    </div>
                    <div className="auto">
                        <div className="vertical" style={styles('position:relative;color:#fefed1;')}>
                            <div className="horizontal" style={styles('justify-content: left;')}>
                                <div className="btn-primary" style={styles('min-width: 20%;padding: 5px;font-size: 8px;height: 10%;')} onClick={onClick}>View Req. Doc</div>&nbsp;
                                <div className="btn-update" style={styles('min-width: 20%;padding: 5px;font-size: 8px;height: 10%;')} onClick={onUpdateIssuesConcern}>Update Request Document</div>&nbsp;
                                {/* <div className="btn-update" hidden={true} style={styles('min-width: 20%;padding: 5px;font-size: 8px;height: 10%;')} onClick={onProccessIssuesConcern}>Process Req. Doc.</div>&nbsp; */}
                                {/* <div className="btn-primary" hidden={(item.TotalAttachment == 0) ? true : false} style={styles('min-width: 20%;padding: 5px;font-size: 8px;height: 10%;')} onClick={onViewAttachment}>View Attachment</div>&nbsp; */}
                            </div>

                            <div style={styles('font-weight: bold')}>Requestor: {item.Requestor}</div>
                            <div style={styles('font-size: 12px;margin-top: -2.5px')}>Control. No.: {item.ControlNo} {item.NextFilter}</div>
                            <div style={styles('font-size: 12px;margin-top: -2.5px')}>Application Date: {item.ApplicationDate}</div>
                            <div style={styles('font-size: 12px;margin-top: -2.5px')}>Type: {item.TypeofClearanceNM}</div>
                            <div style={styles('font-size: 12px;margin-top: -2.5px')}>Purpose: {item.PurposeNM}</div>
                            {/* <div style={styles('font-size: 12px;margin-top: -2.5px')}>Details.: {item.Body}</div> */}
                            {/* <div style={styles('font-size: 12px;margin-top: -2.5px')} hidden={(item.STAT == "Closed") ? false : true}>Corrective Action: {item.CorrectiveAction}</div> */}
                            {/* <div style={styles('font-size: 12px;margin-top: -2.5px')} hidden={(item.STAT == "Closed") ? false : true}>Corrective Date: {item.ActionDate}</div> */}
                            {/* <div style={styles('font-size: 12px;margin-top: -2.5px')}>Status: {(item.Release) ? "Release":  "For Releasing"}</div> */}
                            {/* <div style={styles('font-size: 12px;margin-top: -2.5px')}>Issued Date.: {(item.Release) ? item.DateRelease:  ""}</div> */}
                        </div>
                        <div className="vertical" style={styles('position:relative;color:#fefed1;')}>

                        </div>
                    </div>
                </div>
                {/* <div className="vertical" style={styles('position:absolute;top:0px;right:5px;height:100%;text-align:right')}> */}
                {/* <div className="btn-default" style={styles('min-width: 100px;padding: 5px;background: limegreen')}>{item.Location}</div>  */}{/*item.CreditBalance|numberWithComma:'0'*/}
                {/* </div> */}
            </div>
        </div>
    </>);
};

const RecievedItem: React.FC<{ item: any, accntype: any, onClick?: React.MouseEventHandler, onUpdateIssuesConcern?: React.MouseEventHandler, onProccessIssuesConcern?: React.MouseEventHandler, onViewAttachment?: React.MouseEventHandler, }> = ({ item, accntype, onClick, onUpdateIssuesConcern, onProccessIssuesConcern, onViewAttachment }) => {
    if (!!item.NextFilter) return null;
    return (<>
        <div className="row m-0 details ion-activatable" style={styles('padding:5px')}>
            <IonRippleEffect />
            <div className="col-12 p-0 row m-0" style={styles('position:relative;width:100%;padding:5px!important')}>
                <div className="layout-horizontal">
                    {/* <div className="auto" style={styles('width:75px;')}> */}
                    {/* <div className="horizontal" > */}
                    {/* <div className="vertical"> */}
                    {/* <img className="user-image brand-image img-circle elevation-1 img-fit" style={styles('width:65px;height:65px')}
                            /> [img-preloader]="item.ImageUrl" default="./assets/img/icon_blank_profile.png"*/ }
                    {/* <ImgPreloader className='user-image brand-image img-circle elevation-1 img-fit' style={styles('width:65px;height:65px')}  */}
                    {/* placeholder="./assets/img/icon_blank_profile.png" src={item.ImageUrl} /> */}
                    {/* </div> */}
                    {/* </div> */}
                    {/* </div> */}
                    <div className="auto" style={styles('width:15%')}>
                        <div className="horizontal" >
                            <div className="vertical" style={styles('padding:0px 2.5px')}>
                                <ImgPreloader className='user-image brand-image img-circle elevation-1 img-fit' style={styles('width:45px')}
                                    placeholder='./assets/img/icon_blank_profile.png' src={item.ProfilePicture} />
                            </div>
                        </div>
                    </div>
                    <div className="auto">
                        <div className="vertical" style={styles('position:relative;color:#fefed1;')}>
                            <div className="horizontal" style={styles('justify-content: left;')}>
                                <div className="btn-primary" style={styles('min-width: 20%;padding: 5px;font-size: 8px;height: 10%;')} onClick={onClick}>View Req. Doc.</div>&nbsp;
                                <div className="btn-update" style={styles('min-width: 20%;padding: 5px;font-size: 8px;height: 10%;')} onClick={onUpdateIssuesConcern}>Update Request Document</div>&nbsp;
                                {/* <div className="btn-update" hidden={(accntype.isUser) ? false : true} style={styles('min-width: 20%;padding: 5px;font-size: 8px;height: 10%;')} onClick={onProccessIssuesConcern}>Process Req. Doc.</div>&nbsp; */}
                                {/* <div className="btn-primary" hidden={(item.TotalAttachment == 0) ? true : false} style={styles('min-width: 20%;padding: 5px;font-size: 8px;height: 10%;')} onClick={onViewAttachment}>View Attachment</div>&nbsp; */}
                            </div>

                            <div style={styles('font-weight: bold')}>Requestor: {item.Requestor}</div>
                            <div style={styles('font-size: 12px;margin-top: -2.5px')}>Control. No.: {item.ControlNo} {item.NextFilter}</div>
                            <div style={styles('font-size: 12px;margin-top: -2.5px')}>Application Date: {item.ApplicationDate}</div>
                            <div style={styles('font-size: 12px;margin-top: -2.5px')}>Type: {item.TypeofClearanceNM}</div>
                            <div style={styles('font-size: 12px;margin-top: -2.5px')}>Purpose: {item.PurposeNM}</div>
                            <div style={styles('font-size: 12px;margin-top: -2.5px')}>Appointment Date: {item.AppointmentDate}</div>
                            {/* <div style={styles('font-size: 12px;margin-top: -2.5px')} hidden={(item.STAT == "Closed") ? false : true}>Corrective Action: {item.CorrectiveAction}</div> */}
                            {/* <div style={styles('font-size: 12px;margin-top: -2.5px')} hidden={(item.STAT == "Closed") ? false : true}>Corrective Date: {item.ActionDate}</div> */}
                            {/* <div style={styles('font-size: 12px;margin-top: -2.5px')}>Status: {(item.Release) ? "Release":  "For Releasing"}</div> */}
                            {/* <div style={styles('font-size: 12px;margin-top: -2.5px')}>Issued Date.: {(item.Release) ? item.DateRelease:  ""}</div> */}
                        </div>
                        <div className="vertical" style={styles('position:relative;color:#fefed1;')}>

                        </div>
                    </div>
                </div>
                {/* <div className="vertical" style={styles('position:absolute;top:0px;right:5px;height:100%;text-align:right')}> */}
                {/* <div className="btn-default" style={styles('min-width: 100px;padding: 5px;background: limegreen')}>{item.Location}</div>  */}{/*item.CreditBalance|numberWithComma:'0'*/}
                {/* </div> */}
            </div>
        </div>
    </>);
};
const PendingItem: React.FC<{ item: any, accntype: any, onClick?: React.MouseEventHandler, onProccessIssuesConcern?: React.MouseEventHandler, onViewAttachment?: React.MouseEventHandler, }> = ({ item, accntype, onClick, onProccessIssuesConcern, onViewAttachment }) => {
    if (!!item.NextFilter) return null;
    return (<>
        <div className="row m-0 details ion-activatable" style={styles('padding:5px')}>
            <IonRippleEffect />
            <div className="col-12 p-0 row m-0" style={styles('position:relative;width:100%;color:#fefed1')}>
                <div className="layout-horizontal">

                    <div className="auto" style={styles('width:15%')}>
                        <div className="horizontal" >
                            <div className="vertical" style={styles('padding:0px 2.5px')}>
                                <ImgPreloader className='user-image brand-image img-circle elevation-1 img-fit' style={styles('width:45px')}
                                    placeholder='./assets/img/icon_blank_profile.png' src={item.ProfilePicture} />
                            </div>
                        </div>
                    </div>
                    <div className="auto">
                        <div className="vertical" style={styles('position:relative;color:#fefed1;')}>
                            <div className="horizontal" style={styles('justify-content: left;')}>
                                <div className="btn-primary" style={styles('min-width: 20%;padding: 5px;font-size: 8px;height: 10%;')} onClick={onClick}>View Req. Doc.</div>&nbsp;
                                {/* <div className="btn-update" hidden={(accntype.isUser) ? false : true} style={styles('min-width: 20%;padding: 5px;font-size: 8px;height: 10%;')} onClick={onProccessIssuesConcern}>Update Request Document {accntype.isUser}</div>&nbsp; */}
                                {/* <div className="btn-primary" hidden={(item.TotalAttachment == 0) ? true : false} style={styles('min-width: 20%;padding: 5px;font-size: 8px;height: 10%;')} onClick={onViewAttachment}>View Attachment</div>&nbsp; */}
                            </div>

                            <div style={styles('font-weight: bold')}>Requestor: {item.Requestor}</div>
                            <div style={styles('font-size: 12px;margin-top: -2.5px')}>Control. No.: {item.ControlNo} {item.NextFilter}</div>
                            <div style={styles('font-size: 12px;margin-top: -2.5px')}>Application Date: {item.ApplicationDate}</div>
                            <div style={styles('font-size: 12px;margin-top: -2.5px')}>Type: {item.TypeofClearanceNM}</div>
                            <div style={styles('font-size: 12px;margin-top: -2.5px')}>Purpose: {item.PurposeNM}</div>
                            {/* <div style={styles('font-size: 12px;margin-top: -2.5px')}>Details.: {item.Body}</div> */}
                            {/* <div style={styles('font-size: 12px;margin-top: -2.5px')} hidden={(item.STAT == "Closed") ? false : true}>Corrective Action: {item.CorrectiveAction}</div> */}
                            {/* <div style={styles('font-size: 12px;margin-top: -2.5px')} hidden={(item.STAT == "Closed") ? false : true}>Corrective Date: {item.ActionDate}</div> */}
                            <div style={styles('font-size: 12px;margin-top: -2.5px')}>Status: {(item.Release) ? "Release":  "For Releasing"}</div>
                            <div style={styles('font-size: 12px;margin-top: -2.5px')}>Issued Date.: {(item.Release) ? item.DateRelease:  ""}</div>
                        </div>
                        <div className="vertical" style={styles('position:relative;color:#fefed1;')}>

                        </div>
                    </div>
                </div>


            </div>
        </div>
    </>);
};

const ClosedItem: React.FC<{ item: any, onClick?: React.MouseEventHandler, onViewAttachment?: React.MouseEventHandler, onOpen?:React.MouseEventHandler }> = ({ item, onClick, onViewAttachment, onOpen }) => {
    if (!!item.NextFilter) return null;
    return (<>
        <div className="row m-0 details ion-activatable" style={styles('padding:5px')}>
            <IonRippleEffect />
            <div className="col-12 p-0 row m-0" style={styles('position:relative;width:100%;color:#fefed1')}>
                <div className="layout-horizontal">
                    <div className="auto" style={styles('width:25%')}>
                        <div className="horizontal" >
                            <div className="vertical">
                                <ImgPreloader className='brand-image img-circle elevation-1' style={styles('width:65px;height:65px;')}
                                    placeholder="./assets/img/icon_blank_profile.png" src={item.ProfilePicture} />
                            </div>
                        </div>
                    </div>
                    <div className="auto">
                        <div className="vertical" style={styles('position:relative;color:#fefed1;')}>
                            <div className="horizontal" style={styles('justify-content: left;')}>
                                <div className="btn-primary" style={styles('min-width: 20%;padding: 5px;font-size: 8px;height: 10%;')} onClick={onClick}>View Req. Doc.</div>&nbsp;
                                <div className="btn-primary" style={styles('min-width: 20%;padding: 5px;font-size: 8px;height: 10%;')} onClick={onOpen}>Open Req. Doc.</div>&nbsp;
                                {/* <div className="btn-primary" hidden={(item.TotalAttachment == 0) ? true : false} style={styles('min-width: 20%;padding: 5px;font-size: 8px;height: 10%;')} onClick={onViewAttachment}>View Attachment</div>&nbsp; */}
                            </div>

                            <div style={styles('font-weight: bold')}>Requestor: {item.Requestor}</div>
                            <div style={styles('font-size: 12px;margin-top: -2.5px')}>Control. No.: {item.ControlNo} {item.NextFilter}</div>
                            <div style={styles('font-size: 12px;margin-top: -2.5px')}>Application Date: {item.ApplicationDate}</div>
                            <div style={styles('font-size: 12px;margin-top: -2.5px')}>Type: {item.TypeofClearanceNM}</div>
                            <div style={styles('font-size: 12px;margin-top: -2.5px')}>Purpose: {item.PurposeNM}</div>
                            {/* <div style={styles('font-size: 12px;margin-top: -2.5px')}>Details.: {item.Body}</div> */}
                            {/* <div style={styles('font-size: 12px;margin-top: -2.5px')} hidden={(item.STAT == "Closed") ? false : true}>Corrective Action: {item.CorrectiveAction}</div> */}
                            {/* <div style={styles('font-size: 12px;margin-top: -2.5px')} hidden={(item.STAT == "Closed") ? false : true}>Corrective Date: {item.ActionDate}</div> */}
                            <div style={styles('font-size: 12px;margin-top: -2.5px')} hidden={(!item.Release) ? true : false }>Status: {(item.Release) ? "Release":  "For Releasing"}</div>
                            <div style={styles('font-size: 12px;margin-top: -2.5px')} hidden={(!item.Release) ? true : false }>Released Date.: {(item.Release) ? item.DateRelease:  ""}</div>
                            <div style={styles('font-size: 12px;margin-top: -2.5px')} hidden={(!item.Cancelled) ? true : false }>Status: {(item.Cancelled) ? "Cancelled":  "For Releasing"}</div>
                            <div style={styles('font-size: 12px;margin-top: -2.5px')} hidden={(!item.Cancelled) ? true : false }>Date Cancelled: {item.Cancelled}</div>
                        </div>
                    </div>
                </div>


            </div>
        </div>
    </>);
};

const MoreItem: React.FC<{ item: any, onClick?: React.MouseEventHandler }> = ({ item, onClick }) => {
    if (!item.NextFilter) return null;
    return (<>
        <IonItem lines="none">
            <div className="horizontal" style={styles('width:100%', 'color:#fefed1')}>
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

class RequestPopUp extends React.Component<{ modal: Function, Title: string, Opts: any }> implements OnDidBackdrop {
    private static cache: any = {};
    state: any = { inner: { height: (window.innerHeight + 'px') } }
    input: any = {};
    componentWillMount=()=>{
        app.component(this);
    }
    
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

    hState =async (e: any,key: string) => {
        const input = this.input;
        input[key] = +e.detail.value;
        this.setState({input: this.input});
        // this.calculateAmountPaid(input);
        
    }

    calculateAmountPaid = async (input: any) => {
        const _input = input;
        _input.GEBTax = (+(input?.GrossBusinessIncome ?? 0)/1000) * 1;
        _input.GEPTax = (+(input.Salary ?? 0)/1000) * 1;
        _input.IRPTax = (+(input.RealPropertyIncome ?? 0)/1000) * 1;
        // const total = (gbi+salary+rpi)>5000? (5005) : (5+gbi+salary+rpi);
        // const amountpaid = (total * 1.01);
        // _input.AmountPaid = +(amountpaid.toFixed(2));
        this.setState({input: _input});
        console.log(input);
    }

    isValidateEntries = () => {
        const input = this.input;
        if(+input.GrossBusinessIncome === 0 && 
            +input.Salary === 0 && 
            +input.RealPropertyIncome === 0) 
            return false;
        if(!this.generateSeries()) return false;
        
        this.calculateAmountPaid(input);
        return true;
        // this.hItem(input);
    }

    hClear = (key:string) => {
        const input = this.input;
        input[key] = '';
        this.setState({input: this.input});
    }

    hConfirm = async () => {
        if (!this.isValidateEntries()){
            toast('Please input atleast 1 peso to proceed.');
            return;
        }
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
        rest.post('cedula/new', this.input).subscribe(async (res: any) => {
            if (res.Status == 'ok') {
                //this.performSaveLocal(Object.rcopy(res.Content, this.input));
                //this.performSaveLocal(Object.rcopy)
                // this.performSaveLocal();
                Alert.showSuccessMessage(res.Message);
                return this.hItem(this.input);
                // return Alert.showSuccessMessage(res.Message); //, ()=>this.pager.back()
            }
            Alert.showErrorMessage(res.Message);
        }, (err: any) => {
            Alert.showWarningMessage('Please try again');
        });
    }

    generateSeries = () => {
        const result = rest.post('cedula/series',this.input).subscribe(async (res: any) => {
                if (res.Status != 'error') {
                    this.input.RequestId = res.series;
                    this.setState({input: this.input});
                    return true;
                }
            }, (err: any) => {
                toast('Failed to generate control series, Please try again');
                return false;
            });
        
        return result;
    }

    render() {
        const { inner = {} } = this.state;
        const input = this.input;
        input.GrossBusinessIncome = (input.GrossBusinessIncome || 0.00);
        input.Salary = (input.Salary || 0.00);
        input.RealPropertyIncome = (input.RealPropertyIncome || 0.00);
        input.PL_ID = this.props.Opts.PL_ID;
        input.PGRP_ID = this.props.Opts.PGRP_ID;
        input.RequestBy = this.props.Opts.USR_ID;
        input.RequestId = (input.RequestId || null)
        return (<>
            {/* <div className="modal-container" style={styles({ 'height': inner.height })}>
                <div style={styles('padding-top:5px;padding-bottom:5px;border-bottom: 1px solid rgba(0,0,0,0.25);')}>
                    <div className="row m-0 header">
                        <div className="col-10">{this.props.Title}</div>
                        <div className="col-2 p-0 btn-close" style={styles('text-align:right;right:5px')} onClick={this.hClose}></div>
                    </div>
                </div> */}
                <Layout full style={styles('height:calc(100%-30px)')}>
                    <IonContent>
                        <IonToolbar style={styles('--background: rgb(0 6 69);font-weight:bold;--color:#fff;')}>
                            <IonTitle>{this.props.Title}</IonTitle>
                            <IonButtons slot="end">
                                <IonButton color="light" onClick={this.hClose}
                                    style={styles('font-weight:bold;')}>
                                    Close
                                </IonButton>
                            </IonButtons>
                        </IonToolbar>
                        <div style={styles('position:relative;padding:3%;font-weight:bold;')}>
                            <div style={styles('margin-top:5%;font-size:14pt;')}>
                                <IonLabel position="floating">Gross Income from Business</IonLabel>
                                <IonItem className="input-color" lines="none" style={styles('margin-top:2.5px;border-radius:10px;border: 1px solid rgb(115, 115, 115, 0.5);')}>
                                    <IonInput type="number" value={input.GrossBusinessIncome !== 0 ? input.GrossBusinessIncome:null} 
                                    placeholder="0.00" onIonChange={(e) => this.hState(e,'GrossBusinessIncome')}
                                    style={styles('font-weight:bolder')}>
                                        <span style={styles('color:#000;padding-right:5px;')}>&#8369;</span>
                                    </IonInput>
                                    <IonIcon slot="end" icon={closeOutline} hidden={input.GrossBusinessIncome !== 0 ? false:true}
                                    onClick={() => this.hClear('GrossBusinessIncome')}/>
                                </IonItem>
                            </div>
                            <div style={styles('margin-top:5%;font-size:14pt;')}>
                                <IonLabel position="floating">Salary</IonLabel>
                                <IonItem className="input-color" lines="none" style={styles('margin-top:2.5px;border-radius:10px;border: 1px solid rgb(115, 115, 115, 0.5);')}>
                                    <IonInput type="number" value={input.Salary !== 0 ? input.Salary:null} 
                                    placeholder="0.00" onIonChange={(e) => this.hState(e,'Salary')}
                                    style={styles('font-weight:bolder')}>
                                        <span style={styles('color:#000;padding-right:5px')}>&#8369;</span>
                                    </IonInput>
                                    <IonIcon slot="end" icon={closeOutline} hidden={input.Salary !== 0 ? false:true}
                                    onClick={() => this.hClear('Salary')}/>
                                </IonItem>
                            </div>
                            <div style={styles('margin-top:5%;font-size:14pt;')}>
                                <IonLabel position="floating">Income from Real Property</IonLabel>
                                <IonItem className="input-color" lines="none" style={styles('margin-top:2.5px;border-radius:10px;border: 1px solid rgb(115, 115, 115, 0.5);')}>
                                    <IonInput type="number" value={input.RealPropertyIncome !== 0 ? input.RealPropertyIncome:null} 
                                    placeholder="0.00" onIonChange={(e) => this.hState(e,'RealPropertyIncome')}
                                    style={styles('font-weight:bolder')}>
                                        <span style={styles('color:#000;padding-right:5px;')}>&#8369;</span>
                                    </IonInput>
                                    <IonIcon slot="end" icon={closeOutline} hidden={input.RealPropertyIncome !== 0 ? false:true}
                                    onClick={() => this.hClear('RealPropertyIncome')}/>
                                </IonItem>
                            </div>
                        </div>
                    </IonContent>
                        <div style={styles('position:relative;')}>
                            <div style={styles('text-align:center;')}>
                                <IonButton slot="fixed" style={styles('width:80%;height:40px;font-size:14pt;--border-radius:20px;--background:linear-gradient(#000066, #000645);')} size="default" onClick={this.hConfirm}>
                                    Submit
                                </IonButton>
                            </div>
                        </div>
                </Layout>
            {/* </div> */}
        </>);
    }

    static modal = async (title: string, opts: any) => {
        var modal: any;
        var stack = await Stack.push(<>
            {/* <Modal className="modal-adjustment full" ref={(ref) => modal = ref} content={<RequestPopUp modal={() => modal} Title={title} Opts={opts}/>} /> */}
            <Modal className="modal-size" ref={(ref) => modal = ref} content={<RequestPopUp modal={() => modal} Title={title} Opts={opts}/>} />
        </>);
        setTimeout(async () => (await modal.onDidDismiss(), stack.pop()));
        return modal;
    }
}

//styles
const FilterPanel = styled.div`
padding: 0px 10px;
/*background-color: rgba(255,255,255,0.15);*/
background-color: rgba(0,0,0,0.1);
ion-item.select{
    --background: none;
    width: 100%;
    color: white;
    --min-height: 36px;
    ion-select{
        padding: 0px 10px;
        width: 100%;
        max-width: 85%;
        background-color: rgba(255,255,255,0.15);
        border-radius: 15px;
        margin: 0px 5px;
    }
}
`;