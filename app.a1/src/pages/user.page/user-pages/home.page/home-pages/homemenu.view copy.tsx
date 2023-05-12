import React from 'react';
import {
    IonApp,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonFooter,
    IonMenu,
    IonList,
    IonListHeader,
    IonMenuToggle,
    IonIcon,
    IonLabel,
    IonPage,
    IonButtons,
    IonButton,
    IonItem
} from '@ionic/react';
import Layout from '../../../../../tools/components/+common/layout';
import { mtObj } from '../../../../../tools/plugins/static';
import TextFit from '../../../../../tools/components/+common/text-fit';
import { numberWithComma } from '../../../../../tools/global';
import { styles } from '../../../../../tools/plugins/element';
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

    get pager() { return UserPager.instance.pager; }


    render() {

        return (<>
            <IonApp>
                <IonMenu content-id="main-content">
                    <IonHeader>
                        <IonToolbar color="primary">
                            <IonTitle>Menu</IonTitle>
                        </IonToolbar>
                    </IonHeader>

                    <IonContent>
                        <IonList>
                            <IonListHeader>
                                Navigate
                            </IonListHeader>
                            <IonMenuToggle auto-hide="false">
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
                            </IonMenuToggle>
                        </IonList>
                    </IonContent>
                </IonMenu>

                <IonPage className="ion-page" id="main-content">
                    <IonHeader>
                        <IonToolbar>
                            <IonButtons slot="start">
                                <IonMenuToggle>
                                    <IonButton>
                                        <IonIcon slot="icon-only" name='menu'></IonIcon>
                                    </IonButton>
                                </IonMenuToggle>
                            </IonButtons>
                            <IonTitle>Header</IonTitle>
                        </IonToolbar>
                    </IonHeader>
                    <IonContent className="ion-padding">
                        <h1>Main Content</h1>
                        <p>Click the icon in the top left to toggle the menu.</p>
                    </IonContent>
                </IonPage>
            </IonApp>
        </>);
    }
}