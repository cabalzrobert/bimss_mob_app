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
import { addCircleOutline, arrowBackOutline, keySharp } from 'ionicons/icons';
import EstablishmentActionPopUp from '../../../+app/modal/establishment-action.popup';
import { storage } from '../../../../tools/plugins/storage';
import { Alert } from '../../../../tools/components/+common/stack';
import ChangePassword from './changepassword.account.view';

const { Object }: any = window;

export default class MenuSettingsView extends React.Component implements OnPagerFocus {
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
    get cont3xt() { return UserPager.instance.context; }
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

    hChangePassword = async () => {
        console.log('hChangePassword');
        this.pager.next(ChangePassword);
        //this.pager.next(ChangePasswordView);
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
                                        <IonIcon size="large" icon={arrowBackOutline} style={styles('color:rgb(0,4,69);')} />
                                        <IonTitle style={styles('font-weight:bold;color:rgb(0,4,69);font-size:20pt;')}>
                                            Settings
                                        </IonTitle>
                                    </IonItem>
                                </div>
                            </div>
                        }
                    </IonHeader>
                </Layout>
                <Layout className="row m-0" style={styles('height:auto')}>
                    <div>
                        <IonCard>
                            <IonCardContent>
                                <IonItem lines="none">
                                    <IonIcon slot="start" icon={keySharp}
                                        style={styles('font-size:18pt;')} />
                                    <IonLabel onClick={this.hChangePassword} style={styles('font-size:14pt;--color:#7a7b7f;')}>
                                        Change Password
                                    </IonLabel>
                                </IonItem>
                            </IonCardContent>
                        </IonCard>
                    </div>
                    <div className="btn-sign-out" style={styles('margin-top:15px;display:flex;justify-content:center;')}>
                        <IonButton className="signOut" onClick={this.hSignOut}>
                            Logout
                        </IonButton>
                    </div>
                    {/* <div style={styles('height:auto;position:relative;padding:10px 0px;position:')} > */}
                        {/* <div style={styles('position: absolute;top:0px;width:100%;height:100%;background-color:rgba(0, 0, 0, 0.25);border-radius:10px;border:1px solid rgba(255, 255, 255, 0.25)')} ></div> */}
                        {/* <div className="horizontal" style={styles('font-size:15px;color:white;position:relative')}> <!--color:#f49e2b--> */}
                            {/* <div className="vertical"> */}
                                {/* <div className="horizontal">Last Login:&nbsp;<b>{u.LastLogIn}</b></div> */}
                                {/* <div className="horizontal">App Version:&nbsp;<b>{prop.AppVersion}</b></div> */}
                            {/* </div> */}
                        {/* </div> */}
                    {/* </div> */}
                </Layout>
                <Layout auto>
                    <IonContent scrollY>
                        <div className="vertical">
                            {/* <div className="horizontal">Last Login:&nbsp;<b>{u.LastLogIn}</b></div> */}
                            <div className="horizontal">App Version:&nbsp;<b>{prop.AppVersion}</b></div>
                        </div>
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
                        <div className="vertical" style={styles('position:relative;color:#fefed1;')}>
                            <div className="horizontal" style={styles('justify-content: left;')}>
                                <div className="btn-primary" style={styles('min-width: 20%;padding: 5px;font-size: 8px;height: 10%;')} onClick={onClick}>View</div>&nbsp;
                                {/* <div className="btn-update" hidden={accntype.isMember} style={styles('min-width: 20%;padding: 5px;font-size: 8px;height: 10%;')} onClick={onUpdateEvent}>Update</div> */}
                            </div>
                            <div style={styles('font-weight: bold')}>Establishment: {item.Est_Name} {item.NextFilter}</div>
                            {/* <div style={styles('font-size: 12px;margin-top: -2.5px')}>Establishment: {item.Est_Name} {item.NextFilter}</div> */}
                            <div style={styles('font-size: 12px;margin-top: -2.5px')}>Contact Details: {item.ContactDetails}</div>
                            <div style={styles('font-size: 12px;margin-top: -2.5px')}>Email: {item.EmailAddress}</div>
                            <div style={styles('font-size: 12px;margin-top: -2.5px')}>Address: {item.Address}</div>
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