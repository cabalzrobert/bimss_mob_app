import React from 'react';
import {
    IonApp,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonFooter,
    IonMenu,
    IonList as ionList,
    IonListHeader,
    IonMenuToggle,
    IonIcon,
    IonLabel,
    IonPage,
    IonButtons,
    IonButton,
    IonItem as ionItem,
    IonMenuButton
} from '@ionic/react';
import Layout from '../../../../../tools/components/+common/layout';
import { mtObj } from '../../../../../tools/plugins/static';
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
import { Alert } from '../../../../../tools/components/+common/stack';
import styled from 'styled-components';
import { SuperTabButton, SuperTabs, SuperTabsToolbar } from '@ionic-super-tabs/react';
import { personOutline } from 'ionicons/icons';

export default class HomeMenuView extends React.Component implements OnSwapFocus {
    onSwapFocus = () => (this);
    performConfirmBets = () => (this);
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
    input: any = {};
    msg: any = {};
    prop: any = {};
    get pager() { return UserPager.instance.pager; }


    render() {
        //const { input = {}, msg = {}, prop = {} } = this.state;
        return (<>
            <div className="">
                <IonHeader>
                    <IonToolbar class="toolbar-title-default md in-toolbar hydrated bg-top_home_panel" style={styles('--background:transparent;')}>
                        <IonButtons slot="start">
                            <IonMenuButton />
                        </IonButtons>
                        <IonTitle>Acount Profile</IonTitle>


                    </IonToolbar>
                </IonHeader>
            </div>
            <IonContent>
                    <IonListHeader>
                        <Layout full>
                            <Layout>
                                <Layout auto>
                                    <div className="row m-0 bootstrap-form old" style={styles('height:100%')}>
                                        <div className="col-12 p-0 form-container">
                                            <form className={classNames('needs-validation', { 'form-invalid': 'form-invalid' })}
                                                style={styles('height:100%')}
                                                noValidate onSubmit={(ev) => ev.preventDefault()}>
                                                <div style={styles('height:100%;width:100%')}>
                                                    <SuperTabs>
                                                        <SuperTabsToolbar style={styles('height:35px;background:rgba(0,0,0,0.75)')}>
                                                            <SuperTabButton style={styles('height:35px')}>
                                                                <IonIcon icon={personOutline} color='light'></IonIcon>
                                                            </SuperTabButton>
                                                        </SuperTabsToolbar>
                                                    </SuperTabs>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </Layout>
                            </Layout>
                        </Layout>
                    </IonListHeader>
                    {/* <IonMenuToggle auto-hide="false">
                        <IonItem button>
                            <IonIcon slot="start" name='home'></IonIcon>
                            <IonLabel>
                                Home
                            </IonLabel>
                        </IonItem>
                        <IonItem button>
                            <IonIcon slot="start" name='chatbubbles'></IonIcon>
                            <IonLabel>
                                Messenger
                            </IonLabel>
                        </IonItem>

                        <IonItem button>
                            <IonIcon slot="start" name='logOutSharp'></IonIcon>
                            <IonLabel>
                                Logout
                            </IonLabel>
                        </IonItem>
                    </IonMenuToggle> */}
            </IonContent>
        </>);
    }
}

const IonList = styled(ionList)`
background: transparent;
`;
const IonItem = styled(ionItem)`
--background: transparent;
`;