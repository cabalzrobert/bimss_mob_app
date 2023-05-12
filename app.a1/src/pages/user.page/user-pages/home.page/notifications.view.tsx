import { IonButtons, IonContent, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonList, IonMenuButton, IonRefresher, IonRefresherContent, IonRippleEffect, IonSelect, IonSelectOption, IonSpinner, IonTitle, IonToolbar } from '@ionic/react';
import React from 'react';
import Layout from '../../../../tools/components/+common/layout';
import NotFoundView from '../../../+app/component/common/not-found.view';
import FilteringView from '../../../+app/component/common/filtering.view';
import { mtCb, subscribe } from '../../../../tools/plugins/static';
import TextFit from '../../../../tools/components/+common/text-fit';
import { base64HTML, escape } from '../../../../tools/global';
import { classNames, styles } from '../../../../tools/plugins/element';
import { timeout } from '../../../../tools/plugins/delay';
import UserPager from '../../user-pager';
import { rest } from '../../../+app/+service/rest.service';
import { toast } from '../../../../tools/plugins/toast';
import { Notify } from '../../../+app/main-module';
import ImgPreloader from '../../../../tools/components/+common/img-preloader';
import { stomp } from '../../../+app/+service/stomp.service';
import WebView from '../web.view';
import CreditLedgerView from '../menu-pages/ledger.credit-ledger.view';
import { additionalNotification } from '../../../+app/user-module';
import Recycler from '../../../../tools/components/+feature/recycler';
import RecyclerStorage from '../../../intro.page/recycler-storage';
import VirtualScroller from '../../../../tools/components/+feature/virtual-scroller';
import WebEventView from '../eventweb.view';
import { arrowBackOutline } from 'ionicons/icons';

const { Object }: any = window;

export default class NotificationsView extends React.Component {
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
    }
    didMount = () => {
        if (!this.prop.didMount) return;
        this.stompReceivers();
        this.performRequestDelay({ IsReset: true }, mtCb, 1275);
    }
    willUnmount = () => {
        Object.values(this.subs).map((m: any) => m.unsubscribe());
    }
    private stompReceivers() {
        this.subs.ws1 = stomp.subscribe('/notify', (json: any) => this.receivedNotify(json));
        this.subs.ws2 = stomp.subscribe('/branch', (json: any) => this.receivedNotify(json));
    }
    private receivedNotify(data: any) {
        if (!(data.type == 'device.session-end')) {
            var content = data.content[0];
            if (!content) return;
            this.list.unshift(Notify(content));
            this.setState({ list: this.list });
        }
    }

    hBackButton = () => {
        this.pager.back();
    }
    hFilter = () => {
        this.prop.IsFiltering = true;
        this.performRequestDelay({ IsReset: true }, mtCb, 1275);
    }
    hPullRefresh = (ev: any) => {
        const sub = (this.subs.hpr = subscribe(() => () => ev.detail.complete()));
        this.performRequestDelay({ IsReset: true, IsFiltering: true }, (err: any) => sub.unsubscribe());
    }
    hLoadMore = (item: any, handle = mtCb) => {
        var filter = item.NextFilter;
        filter.IsFiltering = true;
        handle(); //this.setState({list:this.list});
        this.performRequestDelay(filter, (err: any) => {
            if (!!err) filter.IsFiltering = false;
            else delete item.NextFilter;
            handle();
        });
    }
    hPayMethod = () => {
        this.performRequestDelay({ IsReset: true });
    }
    hItem = async (item: any, handle = mtCb) => {
        item.Description = String(item.Description).replace("Decription","Description").replace(", When","<br><br>When").replace(", Location","<br><br>Location");
        console.log(item);
        var type = (item.Type || '');
        if (type == 'load-event') {
            this.pager.next(WebView, ({ instance }: { instance: WebEventView }) => {
                instance?.setTitle('Messsages', 'Event')
                    .loadUrl('./assets/static/html.htm?data:text/html;base64=' + encodeURIComponent(base64HTML('<div style="font-size:20pt;font-weight:bold;margin-bottom:10px;">' + escape(item.Title) + '</div>' + '<div style="font-size:14pt;height:150px;">' + item.Description + '</div>')));
            });
        }
        else if (type == 'announcement') {
            this.pager.next(WebView, ({ instance }: { instance: WebView }) => {
                instance?.setTitle('Messsages', 'Announcement')
                    .loadUrl('./assets/static/html.htm?data:text/html;base64=' + encodeURIComponent(base64HTML('<h2 style="margin-bottom: 5px;">' + escape(item.Title) + '</h2>' + item.Description)));
            });
        }
        else if (type == 'app-update') { }
        else if (type == 'streaming') { }
        else if (type == 'load-approved' || type == 'load-received')
            this.pager.next(CreditLedgerView, ({ instance }: { instance: CreditLedgerView }) => instance?.setTitle('Messsages', 'Credit Ledger'));
        //else if(type=='post-result')
        //    this.glbl.pager.next(GameResultView,({instance}:{instance:GameResultView})=>instance?.setTitle('Messsages','Game Result'));
        if (item.IsOpen) return;
        item.IsOpen = true;
        handle();
        return this.performNotificationOpen(item.NotificationID, (err: any) => {
            if (!err) return additionalNotification(-1);
            item.IsOpen = false;
            handle();
        });
    }
    hFState = (ev: any, key: string) => this.filter[key] = ev.detail.value;

    private performRequestDelay(filter: any, callback: Function = mtCb, delay: number = 175) {
        if (this.subs.t1) this.subs.t1.unsubscribe();
        this.prop.IsFiltering = !filter.IsFiltering;
        this.setState({ prop: this.prop });
        this.subs.t1 = timeout(() => this.performRequest(filter, callback), delay);
    }
    private performRequest(filter: any, callback: Function = mtCb) {
        console.log(filter);
        if (!this.subs) return;
        if (this.subs.s1) this.subs.s1.unsubscribe();
        this.subs.s1 = rest.post('notification', filter).subscribe(async (res: any) => {
            this.prop.IsFiltering = false;
            if (res.Status != 'error') {
                if (filter.IsReset) this.list = res.map((o: any) => Notify(o));
                else res.forEach((o: any) => this.list.push(Notify(o)));
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
    private performNotificationOpen(notificationID: any, callback: Function = mtCb) {
        this.subs.s2 = rest.post('notification/' + notificationID + '/seen').subscribe(async (res: any) => {
            if ((res || {}).status != 'error') {
                if (callback != null) callback();
                return;
            }
        }, (err: any) => {
            if (callback != null) callback(err);
        });
    }

    lstItem = (offset: any, limit: any) => {
        const { list = [] } = this;
        const data: any[] = [];
        const start = Math.max(0, offset);
        const end = Math.min(offset + limit, list.length);
        if (start <= end) {
            for (var i = start; i < end; i++)
                data.push({ index: i, item: list[i] });
        }
        return data;
    }
    render() {
        const { filter = {}, prop = {} } = this.state;
        const { list = [] } = this.state;
        return (<>
            <Layout full>
                <Layout>
                    {/* <div className="row m-0 toolbar-panel">
            <div className="vertical arrow-back" onClick={this.hBackButton}></div>
            <div className="col-4 p-0 vertical toolbar-parent" onClick={this.hBackButton}>Home</div>
            <div className="col-7 p-0 toolbar-title vertical"><div><TextFit text="Messages"/></div></div>
        </div> */}
                    <IonHeader>
                        {!this.prop.didMount ? null :
                        <div style={styles('height:70px;')}>
                            <div style={styles('position:relative;top:11px;')}>
                            <IonItem lines="none" style={styles('--background:transparent;')}
                                onClick={this.hBackButton}>
                                <IonIcon size="large" icon={arrowBackOutline} style={styles('color:rgb(0,4,69);')}/>
                                <IonTitle style={styles('font-weight:bold;color:rgb(0,4,69);font-size:20pt;')}>
                                Notifications
                                </IonTitle>
                            </IonItem>
                            </div>
                        </div>
                            }
                    </IonHeader>
                </Layout>
                <Layout auto>
                    <NotFoundView visible={prop.IsEmpty} />
                    <FilteringView visible={prop.IsFiltering} />
                    <VirtualScroller get={this.lstItem} itemCount={() => this.list.length} itemHeight={56}
                        view={(item, index, handle) => <>
                            <div className="list" style={styles('padding:0px 5px')}>
                                <div className={classNames('list-item')}> {/*,{'bg bg-black':!item.NextFilter}*/}
                                    {!item.NextFilter ? <Item item={item} onClick={() => this.hItem(item, handle)} /> : <MoreItem item={item} onClick={() => this.hLoadMore(item, handle)} />}
                                </div>
                            </div>
                        </>}>
                        <IonRefresher slot="fixed" onIonRefresh={this.hPullRefresh}>
                            <IonRefresherContent />
                        </IonRefresher>
                    </VirtualScroller>
                </Layout>
            </Layout>
        </>);
    }
}

const Item = (() => {
    return ((({ item, onClick }) => {
        if (!!item.NextFilter) return null;
        return (<>
            <div className="row m-0 p-0 details ion-activatable" onClick={onClick}>
                <IonRippleEffect />
                <div style={styles('position:absolute;top:0;width:100%;height:100%;background-color:rgba(0, 0, 0, .25);border-bottom:1px solid rgba(0,0,0,0.35);',
                    { 'background-color': (!item.IsOpen ? 'rgba(255, 255, 255, .25)' : 'rgba(0, 0, 0, .15)') })} ></div>
                <div className="col-12 p-0 row m-0" style={styles('position:relative;width:100%;')}>
                    <div className="layout-horizontal" style={styles('padding:2.5px 0px')}>
                        <div className="auto" style={styles('width:15%')}>
                            <div className="horizontal" >
                                <div className="vertical" style={styles('padding:0px 2.5px')}>
                                    <ImgPreloader style={styles('width:45px')}
                                        placeholder='./assets/img/profile_announcement_icon.png' src={item.Icon} />
                                </div>
                            </div>
                        </div>
                        <div className="auto">
                            <div className="vertical" style={styles('position:relative;min-height:50px;color:rgb(0,6,69);')}>
                                <div style={styles('font-weight:bold;font-size:16px')}>{item.Title}</div>
                                <div style={styles('font-weight:bold;margin-top:-5px;font-size:13px;text-decoration:underline')}>{description(item)}&nbsp;</div>
                                <div style={styles('font-size:11px;margin-top:-4px')}>{item.FulldateDisplay}&nbsp;</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>);
    }) as React.FC<{ item: any, onClick?: React.MouseEventHandler }>);

    function description(item: any): string {
        var type = (item.Type || '');
        var description = (item.Description || '');
        if (type == 'announcement') {
            if (description.length > 100)
                description = description.substr(0, 100) + ' ...';
        }
        return description;
    }
})();

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