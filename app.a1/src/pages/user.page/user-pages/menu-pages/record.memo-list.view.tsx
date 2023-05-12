import { IonButtons, IonCard, IonCardContent, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonList, IonMenuButton, IonRefresher, IonRefresherContent, IonRippleEffect, IonSelect, IonSelectOption, IonSpinner, IonTitle, IonToolbar } from '@ionic/react';
import React from 'react';
import styled from 'styled-components';
import Layout from '../../../../tools/components/+common/layout';
import { OnSwapFocus } from '../../../../tools/components/+feature/swap-pager';
import NotFoundView from '../../../+app/component/common/not-found.view';
import FilteringView from '../../../+app/component/common/filtering.view';
import { mtCb, mtObj } from '../../../../tools/plugins/static';
import TextFit from '../../../../tools/components/+common/text-fit';
import { numberWithComma } from '../../../../tools/global';
import { classNames, clearAfter, Input, inputVal, styles } from '../../../../tools/plugins/element';
import { timeout } from '../../../../tools/plugins/delay';
import UserPager from '../../user-pager';
import { rest } from '../../../+app/+service/rest.service';
import { toast } from '../../../../tools/plugins/toast';
import { Customer, Member } from '../../../+app/main-module';
import CustomerActionPopUp from '../../../+app/modal/customer-action.popup';
import ClaimDonationActionPopUp from '../../../+app/modal/claim-donation.popup';
import ProfileActionPopUp from '../../../+app/modal/profile.view.pop';
import ImgPreloader from '../../../../tools/components/+common/img-preloader';
import Recycler from '../../../../tools/components/+feature/recycler';
import RecyclerStorage from '../../../intro.page/recycler-storage';
import { jUser, jUserModify } from '../../../+app/user-module';
import { addCircleOutline, arrowBackOutline, options, searchOutline } from 'ionicons/icons';
import LeaderDirectAddMember from './leader.direct-member.view';
import LeaderDirectUpdateMember from './leader.direct-updatemember.view';
import { OnPagerFocus } from '../../../../tools/components/+feature/view-pager';
import MemberPromotionPopUp from '../../../+app/modal/member_promote_leader.popup';
import MemberAccountPromotion from './memberpromotion.account.view';
import MemoAttachmentView from './memo.view';
import { DocumentViewer, DocumentViewerOptions } from '@awesome-cordova-plugins/document-viewer';
import { device } from '../../../../tools/plugins/device';

//const{ Object }:any = window;

const { Object, data = {} } = (window as any);
const { locations } = data;
const { Group } = data;

export default class MemorandumHistory extends React.Component implements OnPagerFocus { //OnSwapFocus, 
    //onSwapFocus = (data: any) => this.holder.onSwapFocus(data);
    onPagerFocus = (data: any) => this.holder.onPageFocus(data);
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
    componentWillMount = () => this.willMount(false);
    prop: any = {};
    list: any = [];
    filter: any = {};
    subs: any = {};
    willMount = (didMount = true) => {
        const prop = (this.prop = { didMount: didMount, IsFiltering: true });
        const list = (this.list = []);
        const filter = (this.filter = {});
        this.setState({ list, prop, filter });
        if (!didMount) return;
        this.subs.u = jUserModify(async () => {
            const u = await jUser();
            Object.rcopy(filter, {
                Userid: u.REF_GRP_ID,
                PL_ID: u.PL_ID,
                PGRP_ID: u.PGRP_ID,
                OTP_DT: u.OTP_DT,
                ACT_ID: u.ACT_ID,
                SUBSCR_TYP: u.SUBSCR_TYP,
                REF_GRP_ID: u.REF_GRP_ID,
                REF_LDR_ID: (u.isGroup) ? "" : u.USR_ID,
                isGroup: u.isGroup,
                isMember: u.isMember
            });
            this.setState({ u, filter });
        });

    }
    didMount = () => {
        if (!this.prop.didMount) return;
        this.hFilter();
    }
    willUnmount = () => {
        Object.values(this.subs).map((m: any) => m.unsubscribe());
    }

    hBackButton = () => {
        this.pager.back();
    }
    onPageFocus(data: any) {

        if (!data) return;
        //if (data.component == LeaderDirectAddMember) {
        if (!this.selectedItem) return;
        if (!data.IsUpdate) {
            console.log(data);
            this.list.unshift(data.item);
        }
        else Object.rcopy(this.selectedItem, this.listDetails(data.item));
        this.setState({ list: this.list });
        //}
    }
    hFilter = () => {
        this.prop.IsFiltering = true;
        this.filter.num_row = 0;
        this.performRequestDelay({ IsReset: true }, mtCb, 1275);
    }
    hPullRefresh = (ev: any) => {
        this.performRequestDelay({ IsReset: true, IsFiltering: true }, (err: any) => ev.detail.complete());
    }
    hLoadMore = (item: any) => {
        var filter = item.NextFilter;
        this.filter = item.NextFilter;
        this.filter.num_row = item.NextFilter.NextFilter;
        this.filter.Userid = item.NextFilter.Userid;
        filter.IsFiltering = true;
        this.setState({ list: this.list });
        //console.log(filter);
        this.performRequestDelay(filter, (err: any) => {
            if (!!err) return (filter.IsFiltering = false);
            delete item.NextFilter;
        });
    }
    hAddItem = (ev: any) => {
        //var type=(ev.detail||mtObj).value;
        //if(!type)return;
        //this.pager.next(LeaderDirectAddMember);
        this.filter.isAdd = true;
        this.filter.isEdit = false;
        if (!this.filter.isGroup)
            this.memberOpts.open();
        else
            this.leaderOpts.open();
    }
    hMemberOpt = (ev: any) => {
        var type = (ev.detail || mtObj).value;
        if (!type) return;
        this.pager.next(LeaderDirectAddMember, ({ instance }: { instance: LeaderDirectAddMember }) => instance?.setType(type));
    }
    hLeaderOpt = (ev: any) => {
        console.log(this.filter);

        var type = (ev.detail || mtObj).value;
        if (!type) return;
        this.pager.next(LeaderDirectAddMember, ({ instance }: { instance: LeaderDirectAddMember }) => instance?.setType(type));
    }
    selectedItem: any;
    hItem = async (item: any) => {
        console.log(item);
        this.selectedItem = item;
        this.selectedItem.isEdit = true;
        this.selectedItem.isAdd = false;
        //this.popUpCustomerActionPopUp(subscriber);
        this.pager.next(LeaderDirectUpdateMember, ({ instance }: { instance: LeaderDirectUpdateMember }) => {
            instance?.setType(item.Type).setForm(item);
        });
    }
    hViewProfile = async (item: any) => {
        this.selectedItem = item;
        //this.popUpCustomerActionPopUp(item);
        this.pager.next(MemoAttachmentView, ({ instance }: { instance: MemoAttachmentView }) => {
            instance?.setTitle('Memorandum', 'Attachment')
                .loadUrl(item.MemoURL);
        });

    }
    hViewPDF = async (item: any) => {
        window.open(item.MemoURL, '_blank');
        // return false;
        //document.open(item.MemoURL,"_sytem","location=yes");


    }


    Open(url: any) {
        var win: any = window;
        if (device.isBrowser) window.open(url, '_blank');
        else if (win.cordova.InAppBrowser) win.cordova.InAppBrowser.open(url, '_system');
        else if (win.Capacitor.Plugins?.Browser) win.Capacitor.Plugins.Browser.open({ url: url });
        else window.open(url, '_blank');
    }
    hViewProfilePromotion = async (item: any) => {
        this.selectedItem = item;
        //this.popUpCustomerActionPopUp(subscriber);
        this.pager.next(MemberAccountPromotion, ({ instance }: { instance: MemberAccountPromotion }) => {
            instance?.setType(item.Type).setForm(item);
        });
    }
    hFState = (ev: any, key: string) => this.filter[key] = ev.detail.value;

    private performRequestDelay(filter: any, callback: Function = mtCb, delay: number = 175) {
        var grp = Group[0] || {};
        if (this.subs.t1) this.subs.t1.unsubscribe();
        this.prop.IsFiltering = !filter.IsFiltering;

        this.setState({ prop: this.prop });
        this.subs.t1 = timeout(() => this.performRequest(filter, callback), delay);
    }

    private performRequest(filter: any, callback: Function = mtCb) {
        if (!this.subs) return;
        if (this.subs.s1) this.subs.s1.unsubscribe();
        console.log(filter);
        this.subs.s1 = rest.post('memo', Object.rcopy(filter, this.filter)).subscribe(async (res: any) => {
            this.prop.IsFiltering = false;
            if (res.Status != 'error') {
                if (filter.IsReset) this.list = res.map((o: any) => this.listDetails(o));
                else res.forEach((o: any) => this.list.push(this.listDetails(o)));
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
    private listDetails(item: any) {
        item.Country = '63';
        item.Role = (item.Role || '').toString();
        item.RoleName = (data.Role.find((f: any) => f.Code == item.Role) || mtObj).Name;
        //
        var region = (locations.Region.find((f: any) => f.Code == item.Region) || mtObj);
        item.RegionName = region.Name;
        item.Island = (region.Island || '').replace(item.Country, '');
        var regioncode = `${item.Country}${item.Island}${item.Region}`;
        var provincecode = `${regioncode}${item.Province}`;
        var municipalitycode = `${provincecode}${item.Municipality}`;
        item.ProvinceName = (((locations.Province.find((f: any) => f.Region == regioncode) || mtObj).Province || []).find((f: any) => f.Code == item.Province) || mtObj).Name;
        item.MunicipalityName = (((locations.Municipality.find((f: any) => f.Province == provincecode) || mtObj).Municipality || []).find((f: any) => f.Code == item.Municipality) || mtObj).Name;
        item.BarangayName = (((locations.Barangay.find((f: any) => f.Municipality == municipalitycode) || mtObj).Barangay || []).find((f: any) => f.Code == item.Barangay) || mtObj).Name;

        if (!!item.ImageUrl) {
            var url = (item.ImageUrl || '').toString();
            if (!(url.startsWith('http://') || url.startsWith('https://')))
                item.ImageUrl = rest.httpFullname(item.ImageUrl);
        }
        return Member(item);
    }
    async popUpCustomerActionPopUp(subscriber: any) {
        const modal = await ProfileActionPopUp.modal(subscriber);
        await modal.present();
        const { data: { IsDone } = mtObj } = await modal.onDidDismiss();
        if (!IsDone) return;
        const { list } = this;
        const index = list.indexOf(subscriber);
        list.splice(index, 1);
        this.setState({ list });
    }

    async popUpMemberPromotion(subscriber: any) {
        const modal = await MemberPromotionPopUp.modal(subscriber);
        await modal.present();
        const { data: { IsDone } = mtObj } = await modal.onDidDismiss();
        if (!IsDone) return;
        const { list } = this;
        const index = list.indexOf(subscriber);
        list.splice(index, 1);
        this.setState({ list });


    }

    elIonSelect: any = React.createRef();
    elLeaderSelect: any = React.createRef();
    get memberOpts() { return this.elIonSelect.current; }
    get leaderOpts() { return this.elLeaderSelect.current; }
    render() {
        const { filter, prop } = this.state;
        const { list } = this.state;
        return (<>
            <Layout full>
                <Layout>
                    {/* <div className="row m-0 toolbar-panel">
                        <div className="vertical arrow-back" onClick={this.hBackButton}></div>
                        <div className="col-4 p-0 vertical toolbar-parent" onClick={this.hBackButton}></div>
                        <div className="col-7 p-0 toolbar-title vertical"><div><TextFit text="Memorandum List" /></div></div>
                    </div> */}
                    <IonHeader>
                        {!prop.didMount ? null :
                        <div style={styles('height:70px;')}>
                            <div style={styles('position:relative;top:11px;')}>
                            <IonItem lines="none" style={styles('--background:transparent;')}
                                onClick={this.hBackButton}>
                                <IonIcon size="large" icon={arrowBackOutline} style={styles('color:rgb(0,4,69);')}/>
                                <IonTitle style={styles('font-weight:bold;color:rgb(0,4,69);font-size:20pt;')}>
                                Memorandum
                                </IonTitle>
                            </IonItem>
                            </div>
                        </div>
                            // <IonToolbar className="toolbar-title-default md in-toolbar hydrated bg-top_home_panel" style={styles('--background:transparent;')}>
                            //     <IonButtons slot="start">
                            //         <IonMenuButton />
                            //         <IonTitle>Memorandum</IonTitle>
                            //     </IonButtons>
                            // </IonToolbar>
                        }
                    </IonHeader>
                </Layout>
                <Layout className="row m-0" style={styles('height:auto')}>
                    <div className="col-12 p-0 filter_options-bg">
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
                            <div className="list wbg">
                                {list?.map((item: any, idx: any) =>
                                <IonCard style={styles('--background:rgba(0, 6, 69, 0.1);')}>
                                    <IonCardContent>
                                        <div className={classNames('list-item', { 'bg': (!item.NextFilter || item.IsBlocked), 'bg-black': !item.NextFilter, 'border-red': item.IsBlocked })} style={styles('')}>
                                            {!item.NextFilter ? <Item item={item} accntype={filter} onClick={() => /*filter.isGroup ? "" :*/ /*this.hViewProfile(item)*/ this.Open(item.MemoURL) /*window.open(item.MemoURL)*/} onUpdateProfile={() => /*filter.isGroup ? "" :*/ this.hItem(item)} /> : <MoreItem item={item} onClick={() => this.hLoadMore(item)} />}
                                        </div>
                                    </IonCardContent>
                                </IonCard>
                                )}
                            </div>
                        </IonList>
                    </IonContent>
                </Layout>
            </Layout>
        </>);
    }
}

const IonItemSearch = styled(IonItem)`
--background:rgba(0, 0, 0, 0.75);//rgba(245, 245, 245, 0.75);
--border-radius: 10px;
--margin-left: 10px;
--margin-right: 10px;
--padding-start: 10px;
`;

const Item: React.FC<{ item: any, accntype: any, onClick?: React.MouseEventHandler, onUpdateProfile?: React.MouseEventHandler, }> = ({ item, accntype, onClick, onUpdateProfile }) => {
    if (!!item.NextFilter) return null;
    return (<>
        <div className="row m-0 details ion-activatable" style={styles('padding:5px;')} onClick={onClick}>
            <IonRippleEffect />
            <div className="col-12 p-0 row m-0" style={styles('position:relative;width:100%;padding:5px!important')}>
                <div className="layout-horizontal">

                    <div className="auto">
                        <div className="vertical" style={styles('position:relative;color:#737373;')}>
                            <div style={styles('font-size: 12pt;font-weight:bold;margin-top: -2.5px')}>Memorandum #: {item.MemorandumNo} {item.NextFilter}</div>
                        </div>
                    </div>
                    <div className="auto" style={styles('width:15%')}>
                        <div className="horizontal" >
                            <div className="vertical" style={styles('padding:0px 2.5px')}>
                                <ImgPreloader className='user-image brand-image elevation-1'
                                    placeholder='./assets/img/PDF.png' src={'./assets/img/PDF.png'} />
                            </div>
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

const MoreItem: React.FC<{ item: any, onClick?: React.MouseEventHandler }> = ({ item, onClick }) => {
    if (!item.NextFilter) return null;
    return (<>
        <IonItem lines="none" style={styles('--background:transparent')}>
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