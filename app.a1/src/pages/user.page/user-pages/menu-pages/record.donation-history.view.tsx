import { IonContent, IonInput, IonItem, IonList, IonRefresher, IonRefresherContent, IonRippleEffect, IonSpinner } from '@ionic/react';
import React from 'react';
import styled from 'styled-components';
import Layout from '../../../../tools/components/+common/layout';
import NotFoundView from '../../../+app/component/common/not-found.view';
import FilteringView from '../../../+app/component/common/filtering.view';
import { mtCb, mtObj } from '../../../../tools/plugins/static';
import TextFit from '../../../../tools/components/+common/text-fit';
import { numberWithComma } from '../../../../tools/global';
import { classNames, Input, styles } from '../../../../tools/plugins/element';
import { timeout } from '../../../../tools/plugins/delay';
import UserPager from '../../user-pager';
import { rest } from '../../../+app/+service/rest.service';
import { toast } from '../../../../tools/plugins/toast';
import { Customer } from '../../../+app/main-module';
import CustomerActionPopUp from '../../../+app/modal/customer-action.popup';
import ClaimDonationActionPopUp from '../../../+app/modal/claim-donation.popup';
import ImgPreloader from '../../../../tools/components/+common/img-preloader';
import Recycler from '../../../../tools/components/+feature/recycler';
import RecyclerStorage from '../../../intro.page/recycler-storage';
import { jUser, jUserModify } from '../../../+app/user-module';

//const{ Object }:any = window;

const { Object, data = {} } = (window as any);
const { locations } = data;
const { Group } = data;

export default class DonationHistoryView extends React.Component {
    shouldComponentUpdate = () => false;
    render() {
        return (<>
            <Recycler storage={RecyclerStorage.instance} from={ViewHolder} />
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
    hFilter = () => {
        this.prop.IsFiltering = true;
        this.performRequestDelay({ IsReset: true }, mtCb, 1275);
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
    hItem = async (subscriber: any) => {
        this.popUpCustomerActionPopUp(subscriber);
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
        this.subs.s1 = rest.post('donation', Object.rcopy(filter, this.filter)).subscribe(async (res: any) => {
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
    async popUpCustomerActionPopUp(subscriber: any) {
        const modal = await ClaimDonationActionPopUp.modal(subscriber);
        await modal.present();
        const { data: { IsDone } = mtObj } = await modal.onDidDismiss();
        if (!IsDone) return;
        const { list } = this;
        const index = list.indexOf(subscriber);
        list.splice(index, 1);
        this.setState({ list });
    }

    render() {
        const { filter, prop } = this.state;
        const { list } = this.state;
        return (<>
            <Layout full>
                <Layout>
                    <div className="row m-0 toolbar-panel">
                        <div className="vertical arrow-back" onClick={this.hBackButton}></div>
                        <div className="col-4 p-0 vertical toolbar-parent" onClick={this.hBackButton}></div>
                        <div className="col-7 p-0 toolbar-title vertical"><div><TextFit text="Donation" /></div></div>
                    </div>
                </Layout>
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
                                    <IonItemSearch lines="none" className="input-error bg-adjust" style={styles('--highlight-background:unset;--min-height:40px')}>
                                        <Input ion node={(handle) => <>
                                            <IonInput className="font-bold br-0" style={styles('--padding-bottom:0px;--padding-top:0px;color:#fefed1')}
                                                type="text" placeholder="Search Donation" value={filter.Search} {...handle({ onChange: (ev) => this.hFState(ev, 'Search') })} />
                                        </>} />

                                    </IonItemSearch>
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
                                        {!item.NextFilter ? <Item item={item} onClick={() => this.hItem(item)} /> : <MoreItem item={item} onClick={() => this.hLoadMore(item)} />}
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

const IonItemSearch = styled(IonItem)`
--background:rgba(0, 0, 0, 0.75);//rgba(245, 245, 245, 0.75);
--border-radius: 10px;
--margin-left: 10px;
--margin-right: 10px;
--padding-start: 10px;
`;

const Item: React.FC<{ item: any, onClick?: React.MouseEventHandler }> = ({ item, onClick }) => {
    if (!!item.NextFilter) return null;
    return (<>
        <div className="row m-0 details ion-activatable" style={styles('padding:5px;')} onClick={onClick}>
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
                                    placeholder='./assets/img/icon_blank_profile.png' src={item.ImageUrl} />
                            </div>
                        </div>
                    </div>
                    <div className="auto">
                        <div className="vertical" style={styles('position:relative;color:#fefed1;')}>
                            <div style={styles('font-weight: bold')}>Name: {item.FLL_NM}</div>
                            <div style={styles('font-size: 12px;margin-top: -2.5px')}>Donation ID: {item.DONO_ID}</div>
                            <div style={styles('font-size: 12px;margin-top: -2.5px')}>Date: {item.OTP_DT}</div>
                            <div style={styles('font-size: 12px;margin-top: -2.5px')}>Purpose: {item.PUR}</div>
                            <div style={styles('font-size: 12px;margin-top: -2.5px')}>Amount: Php {numberWithComma(item.AMNT, 2)}</div>
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