import { IonContent, IonFab, IonFabButton, IonIcon, IonInput, IonItem, IonLabel, IonList, IonRefresher, IonRefresherContent, IonRippleEffect, IonSelect, IonSelectOption, IonSpinner } from '@ionic/react';
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
import { addCircleOutline, filter } from 'ionicons/icons';
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

const { Object }: any = window;

export default class RequestDocuemntAppHistory extends React.Component implements OnPagerFocus {
    static activeTab: any = null;
    //onPagerFocus = (data: any) => {
    //console.log(data);
    //console.log(IssuesConcernAppHistory.activeTab,IssuesConcernAppHistory.activeTab.onPagerFocus);
    //};
    onPagerFocus = (data: any) => (RequestDocuemntAppHistory.activeTab && RequestDocuemntAppHistory.activeTab.onPagerFocus(data));
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
        const page = (this.page = { ParentTitle: '', PageTitle: 'Request Document' });
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
                    <div className="row m-0 toolbar-panel">
                        <div className="vertical arrow-back" onClick={this.hBackButton}></div>
                        <div className="col-4 p-0 vertical toolbar-parent" onClick={this.hBackButton}>{page.ParentTitle}</div>
                        <div className="col-7 p-0 toolbar-title vertical"><div><TextFit text={page.PageTitle} /></div></div>
                    </div>
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
        { name: 'Open', component: OpenTab1View },
        { name: 'Recv', component: ReceivedTabView },
        { name: 'Unclaim', component: PendingTab2View },
        { name: 'Claim', component: ClosedTab3View },
    ];

    componentDidMount = () => {
        this.hTab(this.tabs[0]);
    }
    componentWillUnmount = () => {
        this.swapper.performViewLeave();
    }
    onSwapChange = () => {
        return timeout(() => {
            RequestDocuemntAppHistory.activeTab = this.swapper.currentComponent.instance;
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
                    <div className="row m-0 tabs-classic">
                        {tabs?.map((tab: any) => <>
                            <div className={classNames('col-3 p-0 horizontal tab', { active: tab.isSelected })} onClick={(ev) => this.hTab(tab)}>
                                <div className="vertical">{tab.name}</div>
                            </div>
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
    view = (mtObj as PageFilterOpenView);
    onPagerFocus = (data: any) => this.view.onPageFocus(data);
    //holder: PageFilterOpenView=(null as any);
    onSwapFocus() { this.view.resumeRequest(); }
    onSwapLeave() { this.view.pauseRequest(); }
    render() {
        return (<>
            <PageFilterOpenView ref={(ref: any) => this.view = ref} status='' />
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
class PendingTab2View extends React.Component implements OnSwapFocus, OnSwapLeave {
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
class ClosedTab3View extends React.Component implements OnSwapFocus, OnSwapLeave {
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

class PageFilterOpenView extends React.Component<{ status?: (undefined | '' | '1' | '2' | '3') }> {
    // popUpCustomerActionPopUp(item: any) {
    //     throw new Error('Method not implemented.');
    // }
    state: any = {};

    get pager() { return UserPager.instance.pager; }
    componentWillMount = () => {
        const { props, prop, filter } = this;
        filter.Status = (props.status || '');
        filter.IsCompleted = (props.status == '1');
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
        if (item.DoctypeID == '1') {
            //this.popBrgyClearanceOpenPopUp(item);
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
                instance?.setType(item.isAdd,item.DoctypeID,item.DoctypeNM).setForm(item);
            });
        }
        else if (item.DoctypeID == '4') {
            this.pager.next(RequestBrgyCTCView, ({ instance }: { instance: RequestBrgyCTCView }) => {
                instance?.setType(item.isAdd,item.DoctypeID,item.DoctypeNM).setForm(item);
            });
        }
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
        if (!this.selectedItem) return;
        if (!data.IsUpdate) {
            this.list.unshift(data.item);
        } else Object.rcopy(this.selectedItem, Customer(data.item));
        this.setState({ list: this.list });
        //}
    }

    private performRequest(filter: any, callback: Function = mtCb) {
        if (!this.subs) return;
        if (this.subs.s1) this.subs.s1.unsubscribe();
        this.subs.s1 = rest.post('reqdoc', Object.rcopy(filter, this.filter)).subscribe(async (res: any) => {
            this.prop.IsFiltering = false;
            if (res.Status != 'error') {
                if (filter.IsReset) this.list = res.map((o: any) => Customer(o));
                else res.forEach((o: any) => this.list.push(Customer(o)));
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
        if (!type) return;
        if (type == 1) {
            this.pager.next(RequestBrgyBusinessPermitView, ({ instance }: { instance: RequestBrgyBusinessPermitView }) => instance?.setType(this.filter.isAdd, type, 'Barangay Business Permit'));
        }
        else if (type == 2) {
            this.pager.next(RequestBrgyDocumentView, ({ instance }: { instance: RequestBrgyDocumentView }) => instance?.setType(this.filter.isAdd, type, 'Request Barangay Document'));
        }
        else if (type == 3) {
            this.pager.next(RequestBrgyClearanceView, ({ instance }: { instance: RequestBrgyClearanceView }) => instance?.setType(this.filter.isAdd, type, 'Request Barangay Clearance'));
        }
        else if (type == 4) {
            this.pager.next(RequestBrgyCTCView, ({ instance }: { instance: RequestBrgyCTCView }) => instance?.setType(this.filter.isAdd, type, 'Cedula (CTC)'));
        }

    }
    hAddItem = (ev: any) => {
        //var type=(ev.detail||mtObj).value;
        //if(!type)return;
        //this.pager.next(LeaderDirectAddMember);
        //if (!this.filter.isGroup)
        this.memberOpts.open();
        //else
        //    this.leaderOpts.open();
    }
    elIonSelect: any = React.createRef();
    get memberOpts() { return this.elIonSelect.current; }

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
                </Layout>
                <Layout auto>
                    <NotFoundView visible={prop.IsEmpty} />
                    <FilteringView visible={prop.IsFiltering} />
                    <IonContent scrollY>
                        <IonRefresher slot="fixed" onIonRefresh={this.hPullRefresh}>
                            <IonRefresherContent />
                        </IonRefresher>
                        <IonList lines='none'>
                            <div className="list wbg">
                                {list?.map((item: any, idx: any) =>
                                    <div className={classNames('list-item', { 'bg': (!item.NextFilter || item.IsBlocked), 'bg-black': !item.NextFilter, 'border-red': item.IsBlocked })} style={styles('background-color:#1d2c65')}>
                                        {!item.NextFilter ? <OpenItem item={item} accntype={filter} onClick={() => this.hViewProfile(item)} onUpdateIssuesConcern={() => this.hItem(item)} onProccessIssuesConcern={() => this.hOnProcess(item)} onViewAttachment={() => this.hViewAttachement(item)} /> : <MoreItem item={item} onClick={() => this.hLoadMore(item)} />}
                                        {/* {!item.NextFilter ? <OpenItem item={item} onClick={() => this.hItem(item)} /> : <MoreItem item={item} onClick={() => this.hLoadMore(item)} />} */}
                                    </div>
                                )}
                            </div>
                        </IonList>
                        <IonFab vertical="bottom" /*hidden={filter.isGroup}*/ horizontal="end" slot="fixed" style={styles('margin-bottom:3vw;margin-right:2vw')}>
                            <IonFabButton onClick={this.hAddItem}>
                                <IonIcon icon={addCircleOutline} />
                            </IonFabButton>
                        </IonFab>
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

class PageFilterReceivedView extends React.Component<{ status?: (undefined | '' | '1' | '2' | '3') }> {
    state: any = {};

    get pager() { return UserPager.instance.pager; }
    componentWillMount = () => {
        const { props, prop, filter } = this;
        filter.Status = (props.status || '');
        filter.IsCompleted = (props.status == '1');
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
        this.subs.s1 = rest.post('reqdoc', Object.rcopy(filter, this.filter)).subscribe(async (res: any) => {
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
class PageFilterPendingView extends React.Component<{ status?: (undefined | '' | '1' | '2' | '3') }> {
    state: any = {};

    get pager() { return UserPager.instance.pager; }
    componentWillMount = () => {
        const { props, prop, filter } = this;
        filter.Status = (props.status || '');
        filter.IsCompleted = (props.status == '1');
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
        this.performRequestDelay({ IsReset: true }, mtCb, 1275);
    }

    private performRequest(filter: any, callback: Function = mtCb) {
        if (!this.subs) return;
        if (this.subs.s1) this.subs.s1.unsubscribe();
        this.subs.s1 = rest.post('reqdoc', Object.rcopy(filter, this.filter)).subscribe(async (res: any) => {
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
                                        {!item.NextFilter ? <PendingItem item={item} accntype={filter} onClick={() => this.hViewProfile(item)} onProccessIssuesConcern={() => this.hItem(item)} onViewAttachment={() => this.hViewAttachement(item)} /> : <MoreItem item={item} onClick={() => this.hLoadMore(item)} />}
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

class PageFilterClosedView extends React.Component<{ status?: (undefined | '' | '1' | '2' | '3') }> {
    state: any = {};

    get pager() { return UserPager.instance.pager; }
    componentWillMount = () => {
        const { props, prop, filter } = this;
        filter.Status = (props.status || '');
        filter.IsCompleted = (props.status == '1');
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
        this.subs.s1 = rest.post('reqdoc', Object.rcopy(filter, this.filter)).subscribe(async (res: any) => {
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
                                <div className="btn-update" hidden={true} style={styles('min-width: 20%;padding: 5px;font-size: 8px;height: 10%;')} onClick={onProccessIssuesConcern}>Process Req. Doc.</div>&nbsp;
                                <div className="btn-primary" hidden={(item.TotalAttachment == 0) ? true : false} style={styles('min-width: 20%;padding: 5px;font-size: 8px;height: 10%;')} onClick={onViewAttachment}>View Attachment</div>&nbsp;
                            </div>

                            <div style={styles('font-weight: bold')}>Requestor: {item.RequestorNM}</div>
                            <div style={styles('font-size: 12px;margin-top: -2.5px')}>Control. No.: {item.ControlNo} {item.NextFilter}</div>
                            <div style={styles('font-size: 12px;margin-top: -2.5px')}>Application Date: {item.ApplicationDate}</div>
                            <div style={styles('font-size: 12px;margin-top: -2.5px')}>Document.:  {(item.DoctypeID=="2") ? item.OTRDocType : item.DoctypeNM}</div>
                            {/* <div style={styles('font-size: 12px;margin-top: -2.5px')}>Details.: {item.Body}</div> */}
                            {/* <div style={styles('font-size: 12px;margin-top: -2.5px')} hidden={(item.STAT == "Closed") ? false : true}>Corrective Action: {item.CorrectiveAction}</div> */}
                            {/* <div style={styles('font-size: 12px;margin-top: -2.5px')} hidden={(item.STAT == "Closed") ? false : true}>Corrective Date: {item.ActionDate}</div> */}
                            <div style={styles('font-size: 12px;margin-top: -2.5px')}>Status: {item.STATUS_NM}</div>
                            <div style={styles('font-size: 12px;margin-top: -2.5px')}>Issued Date.: {item.IssuedDate}</div>
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
                                <div className="btn-update" hidden={(item.STAT == "Open" && item.Userid == accntype.Userid) ? false : true} style={styles('min-width: 20%;padding: 5px;font-size: 8px;height: 10%;')} onClick={onUpdateIssuesConcern}>Update Request Document</div>&nbsp;
                                <div className="btn-update" hidden={(accntype.isUser) ? false : true} style={styles('min-width: 20%;padding: 5px;font-size: 8px;height: 10%;')} onClick={onProccessIssuesConcern}>Process Req. Doc.</div>&nbsp;
                                <div className="btn-primary" hidden={(item.TotalAttachment == 0) ? true : false} style={styles('min-width: 20%;padding: 5px;font-size: 8px;height: 10%;')} onClick={onViewAttachment}>View Attachment</div>&nbsp;
                            </div>

                            <div style={styles('font-weight: bold')}>Requestor: {item.RequestorNM}</div>
                            <div style={styles('font-size: 12px;margin-top: -2.5px')}>Control. No.: {item.ControlNo} {item.NextFilter}</div>
                            <div style={styles('font-size: 12px;margin-top: -2.5px')}>Application Date: {item.ApplicationDate}</div>
                            <div style={styles('font-size: 12px;margin-top: -2.5px')}>Document.: {(item.DoctypeID=="2") ? item.OTRDocType : item.DoctypeNM}</div>
                            {/* <div style={styles('font-size: 12px;margin-top: -2.5px')}>Details.: {item.Body}</div> */}
                            {/* <div style={styles('font-size: 12px;margin-top: -2.5px')} hidden={(item.STAT == "Closed") ? false : true}>Corrective Action: {item.CorrectiveAction}</div> */}
                            {/* <div style={styles('font-size: 12px;margin-top: -2.5px')} hidden={(item.STAT == "Closed") ? false : true}>Corrective Date: {item.ActionDate}</div> */}
                            <div style={styles('font-size: 12px;margin-top: -2.5px')}>Status: {item.STATUS_NM}</div>
                            <div style={styles('font-size: 12px;margin-top: -2.5px')}>Issued Date.: {item.IssuedDate}</div>
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
                                <div className="btn-update" hidden={(accntype.isUser) ? false : true} style={styles('min-width: 20%;padding: 5px;font-size: 8px;height: 10%;')} onClick={onProccessIssuesConcern}>Update Request Document {accntype.isUser}</div>&nbsp;
                                <div className="btn-primary" hidden={(item.TotalAttachment == 0) ? true : false} style={styles('min-width: 20%;padding: 5px;font-size: 8px;height: 10%;')} onClick={onViewAttachment}>View Attachment</div>&nbsp;
                            </div>

                            <div style={styles('font-weight: bold')}>Requestor: {item.RequestorNM}</div>
                            <div style={styles('font-size: 12px;margin-top: -2.5px')}>Control. No.: {item.ControlNo} {item.NextFilter}</div>
                            <div style={styles('font-size: 12px;margin-top: -2.5px')}>Application Date: {item.ApplicationDate}</div>
                            <div style={styles('font-size: 12px;margin-top: -2.5px')}>Document.: {(item.DoctypeID=="2") ? item.OTRDocType : item.DoctypeNM}</div>
                            {/* <div style={styles('font-size: 12px;margin-top: -2.5px')}>Details.: {item.Body}</div> */}
                            {/* <div style={styles('font-size: 12px;margin-top: -2.5px')} hidden={(item.STAT == "Closed") ? false : true}>Corrective Action: {item.CorrectiveAction}</div> */}
                            {/* <div style={styles('font-size: 12px;margin-top: -2.5px')} hidden={(item.STAT == "Closed") ? false : true}>Corrective Date: {item.ActionDate}</div> */}
                            <div style={styles('font-size: 12px;margin-top: -2.5px')}>Status: {item.STATUS_NM}</div>
                            <div style={styles('font-size: 12px;margin-top: -2.5px')}>Issued Date.: {item.IssuedDate}</div>
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
                                <div className="btn-primary" hidden={(item.TotalAttachment == 0) ? true : false} style={styles('min-width: 20%;padding: 5px;font-size: 8px;height: 10%;')} onClick={onViewAttachment}>View Attachment</div>&nbsp;
                            </div>

                            <div style={styles('font-weight: bold')}>Requestor: {item.RequestorNM}</div>
                            <div style={styles('font-size: 12px;margin-top: -2.5px')}>Control. No.: {item.ControlNo} {item.NextFilter}</div>
                            <div style={styles('font-size: 12px;margin-top: -2.5px')}>Application Date: {item.ApplicationDate}</div>
                            <div style={styles('font-size: 12px;margin-top: -2.5px')}>Document.: {(item.DoctypeID=="2") ? item.OTRDocType : item.DoctypeNM}</div>
                            {/* <div style={styles('font-size: 12px;margin-top: -2.5px')}>Details.: {item.Body}</div> */}
                            {/* <div style={styles('font-size: 12px;margin-top: -2.5px')} hidden={(item.STAT == "Closed") ? false : true}>Corrective Action: {item.CorrectiveAction}</div> */}
                            {/* <div style={styles('font-size: 12px;margin-top: -2.5px')} hidden={(item.STAT == "Closed") ? false : true}>Corrective Date: {item.ActionDate}</div> */}
                            <div style={styles('font-size: 12px;margin-top: -2.5px')}>Status: {item.STATUS_NM}</div>
                            <div style={styles('font-size: 12px;margin-top: -2.5px')}>Issued Date.: {item.IssuedDate}</div>
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