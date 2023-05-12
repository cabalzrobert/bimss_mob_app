import { IonButton, IonButtons, IonCard, IonCardContent, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonList, IonMenuButton, IonRefresher, IonRefresherContent, IonRippleEffect, IonSelect, IonSelectOption, IonSpinner, IonTitle, IonToolbar } from '@ionic/react';
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
import CustomerActionPopUp from '../../../+app/modal/customer-action.popup';
import EventActionPopUp from '../../../+app/modal/events-action.popup';
import ImgPreloader from '../../../../tools/components/+common/img-preloader';
import Recycler from '../../../../tools/components/+feature/recycler';
import RecyclerStorage from '../../../intro.page/recycler-storage';
import ViewEvents from './view.events';
import { jUser, jUserModify } from '../../../+app/user-module';
import { OnPagerFocus } from '../../../../tools/components/+feature/view-pager';
import NewEvent from './event.new.view';
import { addCircleOutline, arrowBackOutline, searchOutline } from 'ionicons/icons';
import EstablishmentActionPopUp from '../../../+app/modal/establishment-action.popup';

const { Object }: any = window;

export default class EstablishmentView extends React.Component implements OnPagerFocus {
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
        this.subs.u = jUserModify(async () => {
            const u = await jUser();
            Object.rcopy(filter, {
                isUser: u.isUser,
                isMember: u.isMember
            });
            this.setState({ u, filter });
        });
        this.setState({ list, prop, filter });
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
        if (!this.selectedItem) return;
        if (!data.IsUpdate) {
            console.log(data);
            this.list.unshift(data.item);
        }
        else Object.rcopy(this.selectedItem, Customer(data.item));
        this.setState({ list: this.list });
        //}
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
        console.log(filter);
        this.performRequestDelay(filter, (err: any) => {
            if (!!err) return (filter.IsFiltering = false);
            delete item.NextFilter;
        });
    }
    selectedItem: any;
    hItem = async (item: any) => {
        this.selectedItem = item;
        this.popUpCustomerActionPopUp(item, this.filter);

    }
    hUpdateEvent = async (item: any) => {
        this.selectedItem = item;
        // this.popUpCustomerActionPopUp(item, this.filter);
        this.pager.next(NewEvent, ({ instance }: { instance: NewEvent }) => instance?.setForm(item));

    }
    hAddItem = (ev: any) => {
        this.EventOpts.open();
    }
    hEventOpt = (ev: any) => {
        console.log(this.filter);

        var type = (ev.detail || mtObj).value;
        if (!type) return;
        this.pager.next(NewEvent, ({ instance }: { instance: NewEvent }) => instance?.setType(type));
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
        this.subs.s1 = rest.post('establishment/list', Object.rcopy(filter, this.filter)).subscribe(async (res: any) => {
            this.prop.IsFiltering = false;
            if (res.Status != 'error') {
                if (filter.IsReset) this.list = res.establishment.map((o: any) => Customer(o));
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
    async popUpCustomerActionPopUp(subscriber: any, filter: any) {
        const modal = await EstablishmentActionPopUp.modal(subscriber, filter);
        await modal.present();
        await modal.onDidDismiss();
        this.setState({ list: this.list });
    }

    elIonSelect: any = React.createRef();
    get EventOpts() { return this.elIonSelect.current; }
    render() {
        const { filter, prop } = this.state;
        const { list } = this.state;
        const { input } = this.state;
        return (<>
            <Layout full>
                <Layout>
                    {/* <div className="row m-0 toolbar-panel">
                        <div className="vertical arrow-back" onClick={this.hBackButton}></div>
                        <div className="col-4 p-0 vertical toolbar-parent" onClick={this.hBackButton}></div>
                        <div className="col-7 p-0 toolbar-title vertical"><div><TextFit text="Upcoming Events" /></div></div>
                    </div> */}
                    <IonHeader>
                        {!prop.didMount ? null :
                        <div style={styles('height:70px;')}>
                            <div style={styles('position:relative;top:11px;')}>
                            <IonItem lines="none" style={styles('--background:transparent;')}
                                onClick={this.hBackButton}>
                                <IonIcon size="large" icon={arrowBackOutline} style={styles('color:rgb(0,4,69);')}/>
                                <IonTitle style={styles('font-weight:bold;color:rgb(0,4,69);font-size:20pt;')}>
                                Establishments
                                </IonTitle>
                            </IonItem>
                            </div>
                        </div>
                            }
                    </IonHeader>
                </Layout>
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
                                    <Input ion node={(handle) => <>
                                        <IonItemSearch lines="none" className="input-error bg-adjust" style={styles('--highlight-background:unset;--min-height:40px')}>
                                            <IonInput className="font-bold br-0" style={styles('--padding-bottom:0px;--padding-top:0px;color:#fefed1')}
                                                type="text" placeholder="Search Event" value={filter.Search} {...handle({ onChange: (ev) => this.hFState(ev, 'Search') })} />
                                        </IonItemSearch>
                                    </>} />

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
                            <div className="list wbg">
                                {list?.map((item: any, idx: any) =>
                                    <IonCard style={styles('--background:rgba(0, 6, 69, 0.1);')}>
                                        <IonCardContent>
                                            <div className={classNames('list-item', { 'bg': (!item.NextFilter || item.IsBlocked), 'bg-black': !item.NextFilter, 'border-red': item.IsBlocked })} style={styles('')}>
                                                {!item.NextFilter ? <Item item={item} accntype={filter} onClick={() => this.hItem(item)} onUpdateEvent={() => this.hUpdateEvent(item)} /> : <MoreItem item={item} onClick={() => this.hLoadMore(item)} />}
                                            </div>
                                        </IonCardContent>
                                    </IonCard>
                                )}
                            </div>
                        </IonList>
                        <IonFab hidden={filter.isMember} vertical="bottom" /*hidden={filter.isGroup}*/ horizontal="end" slot="fixed" style={styles('margin-bottom:3vw;margin-right:2vw')}>
                            <IonFabButton onClick={this.hAddItem}>
                                <IonIcon icon={addCircleOutline} />
                            </IonFabButton>
                        </IonFab>
                    </IonContent>
                </Layout>
            </Layout>
            <div style={styles('visibility:hidden;height:0px;width:0px')}>
                <IonSelect hidden={filter.isMember} ref={this.elIonSelect} interface="action-sheet"
                    onIonChange={clearAfter(this.hEventOpt)}> {/*interfaceOptions={{header:'Select options:'}}*/}
                    <IonSelectOption value='1'>New Event</IonSelectOption>
                </IonSelect>
            </div>
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

const Item: React.FC<{ item: any, accntype: any, onClick?: React.MouseEventHandler, onUpdateEvent?: React.MouseEventHandler }> = ({ item, accntype, onClick, onUpdateEvent }) => {
    if (!!item.NextFilter) return null;
    return (<>
        <div className="row m-0 details ion-activatable" style={styles('padding:5px')}>
            <IonRippleEffect />
            <div className="col-12 p-0 row m-0" style={styles('position:relative;width:100%;padding:5px!important')}>
                <div className="layout-horizontal">
                    <div className="auto">
                        <div className="vertical" style={styles('position:relative;color:#737373;')}>
                            <div style={styles('font-size:12pt;font-weight: bold')}>Establishment: {item.Est_Name} {item.NextFilter}</div>
                            {/* <div style={styles('font-size: 12px;margin-top: -2.5px')}>Establishment: {item.Est_Name} {item.NextFilter}</div> */}
                            <div style={styles('font-size: 11pt;margin-top: -2.5px')}>Contact Details: {item.ContactDetails}</div>
                            <div style={styles('font-size: 11pt;margin-top: -2.5px')}>Email: {item.EmailAddress}</div>
                            <div style={styles('font-size: 11pt;margin-top: -2.5px')}>Address: {item.Address}</div>
                            <div style={styles('')}>
                                <IonButton fill='clear' size="small" style={styles('text-transform:capitalize;float:right;')} onClick={onClick}>
                                    Details
                                </IonButton>
                            </div>
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