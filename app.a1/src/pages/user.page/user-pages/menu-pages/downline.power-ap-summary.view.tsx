import { IonContent, IonInput, IonItem, IonLabel, IonList, IonRefresher, IonRefresherContent, IonRippleEffect, IonSelect, IonSelectOption, IonSpinner } from '@ionic/react';
import React from 'react';
import styled from 'styled-components';
import Layout from '../../../../tools/components/+common/layout';
import NotFoundView from '../../../+app/component/common/not-found.view';
import FilteringView from '../../../+app/component/common/filtering.view';
import { mtCb } from '../../../../tools/plugins/static';
import TextFit from '../../../../tools/components/+common/text-fit';
import { numberWithComma } from '../../../../tools/global';
import { classNames, Input, styles } from '../../../../tools/plugins/element';
import { timeout } from '../../../../tools/plugins/delay';
import UserPager from '../../user-pager';
import { rest } from '../../../+app/+service/rest.service';
import { toast } from '../../../../tools/plugins/toast';
import { Customer } from '../../../+app/main-module';
import PowerApRequestPopUp from '../../../+app/modal/power-ap-request.popup';
import PowerApRequestDetailsPopUp from '../../../+app/modal/power-ap-request-details.popup';
import ImgPreloader from '../../../../tools/components/+common/img-preloader';
import Recycler from '../../../../tools/components/+feature/recycler';
import RecyclerStorage from '../../../intro.page/recycler-storage';

const { Object }: any = window;

export default class PowerApSummaryView extends React.Component {
    setCustomer = (customer: any) => this.holder.setCustomer(customer);
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
    customer: any = {};
    summary: any = {};
    list: any = [];
    prop: any = {};
    filter: any = {};
    subs: any = {};
    willMount = () => {
        const customer = (this.customer = { fullname: '-', creditBalance: '-', mobileNumber: '-', accountID: '000000000000' });
        const summary = (this.summary = { Paid: '-', Unpaid: '-' });
        const list = (this.list = []);
        const prop = (this.prop = { IsFiltering: true });
        const filter = (this.filter = { Method: '', Status: '1', IsCompleted: true, });
        this.setState({ list, prop, filter, summary, customer });
    }
    didMount = () => { }
    willUnmount = () => {
        Object.values(this.subs).map((m: any) => m.unsubscribe());
    }

    public setCustomer(customer: any) {
        Object.rcopy(this.customer, customer);
        this.filter.Search = this.customer.AccountID;
        this.setState({ customer: this.customer, filter: this.filter })
        this.popUpPowerApDetails(customer);
        this.performRequestDelay({ IsReset: true }, mtCb, 1275);
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
    hPayMethod = () => {
        this.performRequestDelay({ IsReset: true });
    }
    hItem = async (item: any) => {
        if (item.IsCancelled || !item.IsApproved) return;
        return this.popUpPowerApDetails(item);
    }
    hFState = (ev: any, key: string) => this.filter[key] = ev.detail.value;

    private performRequestDelay(filter: any, callback: Function = mtCb, delay: number = 175) {
        if (this.subs.t1) this.subs.t1.unsubscribe();
        this.prop.IsFiltering = !filter.IsFiltering;
        this.setState({ prop: this.prop });
        this.subs.t1 = timeout(() => this.performRequest(filter, callback), delay);
    }
    private performRequest(filter: any, callback: Function = mtCb) {
        if (!this.subs) return;
        if (this.subs.s1) this.subs.s1.unsubscribe();
        this.subs.s1 = rest.post('a/credit/complete', Object.rcopy(filter, this.filter)).subscribe(async (res: any) => {
            this.prop.IsFiltering = false;
            if (res.Status != 'error') {
                Object.rcopy(this.summary, res.Summary)
                if (filter.IsReset) this.list = res.List.map((o: any) => this.listDetails(o));
                else res.List.forEach((o: any) => this.list.push(this.listDetails(o)));
                this.prop.IsEmpty = (this.list.length < 1);
                if (callback != null) callback();
                this.setState({ filter: this.filter, prop: this.prop, summary: this.summary, list: this.list });
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
        item.Status = '';
        if (item.IsPending) {
            item.StatusColor = 'white';
            item.Status = 'Pending';
        } else if (item.IsApproved) {
            item.RequestColor = 'limegreen';
            if (item.IsPaid) {
                item.StatusColor = 'limegreen';
                item.Status = 'Paid';
            } else if (item.IsUnpaid) {
                item.IsCredit = true;
                item.StatusColor = 'red';
                item.Status = 'Unpaid';
            }
        } else if (item.IsCancelled) {
            item.RequestColor = 'red';
            item.StatusColor = 'red';
            item.Status = 'Cancelled';
        }
        return Customer(item);
    }

    async popUpPowerAp(subscriber: any) {
        const modal = await PowerApRequestPopUp.modal(subscriber);
        await modal.present();
        await modal.onDidDismiss();
    }
    async popUpPowerApDetails(subscriber: any) {
        const modal = await PowerApRequestDetailsPopUp.modal(subscriber);
        await modal.present();
        const res = await modal.onDidDismiss();
        const data = (res || {}).data;
        if (!data || !data.IsPaid) return;
        if (this.list.indexOf(subscriber) < 0)
            return this.hFilter();
        Object.rcopy(subscriber, data.item);
        var amount = +subscriber.RequestCredit;
        this.summary.Paid += amount
        this.summary.Unpaid -= amount;
        this.setState({ summary: this.summary, list: this.list });
    }

    render() {
        const { filter = {}, prop = {}, customer } = this.state;
        const { list = [], summary = {} } = this.state;
        return (<>
            <Layout full>
                <Layout>
                    <div className="row m-0 toolbar-panel">
                        <div className="vertical arrow-back" onClick={this.hBackButton}></div>
                        <div className="col-4 p-0 vertical toolbar-parent" onClick={this.hBackButton}>Request Credit</div>
                        <div className="col-7 p-0 toolbar-title vertical"><div><TextFit text="Customer" /></div></div>
                    </div>
                </Layout>
                <Layout auto>
                    <Layout full>
                        <Layout className="row m-0">
                            <CustomerView customer={customer} summary={summary} />
                            <FilterPanel className="col-12 p-0 row m-0">
                                <IonItem className="select" lines="none">
                                    <IonLabel style={styles('margin:0px')}>FILTER: </IonLabel>
                                    <IonInput hidden></IonInput>
                                    <Input ion="popup" node={(handle) => <>
                                        <IonSelect interface="action-sheet" cancelText="Dismiss" value={filter.Method} {...handle({ onChange: (ev) => (this.hFState(ev, 'Method'), this.hPayMethod()) })}>
                                            <IonSelectOption value="">All</IonSelectOption>
                                            <IonSelectOption value="1">Paid</IonSelectOption>
                                            <IonSelectOption value="2">Unpaid</IonSelectOption>
                                        </IonSelect>
                                    </>} />

                                </IonItem>
                            </FilterPanel>
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
                                            <div className={classNames('list-item', { 'bg bg-black': !item.NextFilter })}>
                                                {!item.NextFilter ? <Item item={item} onClick={() => this.hItem(item)} /> : <MoreItem item={item} onClick={() => this.hLoadMore(item)} />}
                                            </div>
                                        )}
                                    </div>
                                </IonList>
                            </IonContent>
                        </Layout>
                    </Layout>
                </Layout>
            </Layout>
        </>);
    }
}

const CustomerView: React.FC<{ customer: any, summary: any }> = ({ customer, summary }) => {
    return (<>
        <CustomerPanel className="col-12 p-0">
            {/*<!-- <div style="position: absolute;top: 0;width: 100%;height: 100%;background-color: rgba(0, 0, 0, .25);z-index: -1;"></div>  border-radius: 15px; -->*/}
            <div style={styles('height:auto')}>
                <div className="horizontal user-image">
                    {/* <img className="brand-image img-circle elevation-1 img-fit" /> 
                [img-preloader]="c.ImageUrl" default="./assets/img/icon_blank_profile.png"*/}
                    <ImgPreloader className='brand-image img-circle elevation-1 img-fit'
                        placeholder="./assets/img/icon_blank_profile.png" src={customer.ImageUrl} />
                </div>
                <div className="horizontal user-name"><b>{customer.DisplayName}&nbsp;</b></div>
                <div className="horizontal label-extra" style={styles('margin-top:-10px')}>UID:{customer.AccountID}&nbsp;</div>
                <hr style={styles('margin:0px')} />
                <div className="row m-0" style={styles('position:relative;padding-top:2.5px')}>
                    <div style={styles('position:absolute;top:0;width:100%;height:100%;background-color:rgba(255, 255, 255, .1);z-index:-1')}></div>
                    <div className="col-6 p-0 horizontal" style={styles('color:limegreen')}>
                        Paid :&nbsp;<b>{numberWithComma(summary.Paid)}</b>
                    </div>
                    <div className="col-6 p-0 horizontal" style={styles('color:red')}>
                        Unpaid :&nbsp;<b>{numberWithComma(summary.Unpaid)}</b>
                    </div>
                </div>
            </div>
        </CustomerPanel>
    </>);
};

const Item: React.FC<{ item: any, onClick?: React.MouseEventHandler }> = ({ item, onClick }) => {
    if (!!item.NextFilter) return null;
    return (<>
        <div className="row m-0 details ion-activatable" style={styles('padding:5px')} onClick={onClick}>
            <IonRippleEffect />
            <div className="col-12 p-0 row m-0" style={styles('position:relative;width:100%;height:60px;color:#fefed1')}>
                <div className="layout-horizontal">
                    <div className="auto" style={styles('width:79.16%')}>
                        <div className="vertical" style={styles('padding-left:10px')}> {/*<!--position:relative;-->*/}
                            <div className="row" style={styles('font-size:14px;margin:0px;margin-top:-5px;font-size:12px')}>
                                <div className="vertical"><div>Status: <span style={styles('font-size:14px;font-weight:bold', { color: item.StatusColor })}>{item.Status}</span></div></div>
                            </div>
                            {!!item.IsPending ? null : <><div style={styles('font-size:10px;margin-top:-2.5px')}><span>{item.FulldateTransaction}</span></div></>}
                        </div>
                    </div>
                </div>
                <div className="vertical" style={styles('position:absolute;top:0px;right:5px;height:100%;text-align:right')}>
                    <span style={styles('font-size:10px')}>{item.FulldateRequested}</span>
                    <div className="btn-default" style={styles('min-width:100px;padding:5px', { background: item.RequestColor })}>{numberWithComma(item.RequestCredit, 0)}</div>
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
const CustomerPanel = styled.div`
margin-bottom: 25px;
position:relative;
margin:0px;

.user-image{
    position: relative;
    height: 75px;
    margin-top: 10px;
    >img{
        background-color: #eceff1;
        width: 75px;
    }
}
.user-name{
    font-size: 20pt;
    height: auto;
    text-align: center;
    //color:#default;
    color:#fdb67f;
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