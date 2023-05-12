import { IonButton, IonButtons, IonContent, IonHeader, IonItem, IonList, IonMenu, IonMenuButton, IonPage, IonRefresher, IonRefresherContent, IonTitle, IonToolbar } from '@ionic/react';
import React from 'react';
import styled from 'styled-components';
import ViewPager from '../../../tools/components/+feature/view-pager';
import Layout from '../../../tools/components/+common/layout';
import FilteringView from '../../+app/component/common/filtering.view';
import { mtObj } from '../../../tools/plugins/static';
import { numberWithComma } from '../../../tools/global';
import AnimAmount from '../../../tools/components/+common/anim-amount';
import { stomp } from '../../+app/+service/stomp.service';
import { styles } from '../../../tools/plugins/element';
import { app } from '../../../tools/app';


const { Object }: any = window;

export default class HomeView extends React.Component {
    state: any = { prop: mtObj, list: [], trn: {} };
    componentWillMount = () => {
        app.component(this);
        this.state = { ...this.state, prop: this.prop, trn: this.trn };
    }

    prop: any = { IsFiltering: true, };
    trn: any = { total_straight: 0, total_rumble: 0, total_sales: 0 };
    list: any = [];
    subs: any = {};
    componentDidMount = () => {
        this.subs.disconnect = stomp.subscribe('#disconnect', () => this.disconnected());
        this.subs.ws1 = stomp.subscribe('/dashboard', (json: any) => this.receivedNotify(json));
    }
    componentWillUnmount = () => {
        Object.values(this.subs).map((m: any) => m.unsubscribe());
    }

    private disconnected() {
        this.prop.IsFiltering = true;
        this.setState({ prop: this.prop });
    }
    private receivedNotify(data: any) {
        this.prop.IsFiltering = false;
        Object.rcopy(this.trn, data);
        delete this.trn.transaction;
        this.trn.total_sales = (this.trn.total_straight + this.trn.total_rumble);
        this.list = (data.transaction || []).map((o: any) => this.listDetails(o));
        this.setState({ trn: this.trn, list: this.list, prop: this.prop });
    }
    private listDetails(item: any) {
        item.total_sales = (item.total_straight + item.total_rumble);
        return item;
    }

    render() {
        return (<>
            <Layout full>
                <Layout>
                    <IonHeader>
                        <IonToolbar color="black" style={styles('background:rgba(0,0,0,0.75);color:white')}>
                            <IonButtons slot="start"><IonMenuButton hidden={false}></IonMenuButton></IonButtons>
                            <IonTitle>Home</IonTitle>
                        </IonToolbar>
                    </IonHeader>
                </Layout>
                <Layout auto>
                    <FilteringView visible={this.state.prop.IsFiltering} />
                    <IonContent scrollY>
                        <div className="col-12 p-0 horizontal">
                            <div className="vertical" style={styles('width:100%')}>
                                <div style={styles('margin-top:-35%')}>
                                    <div>
                                        <div className="horizontal" style={styles('height:100px;position:relative')}>
                                            <img className="img-fit" src="./assets/img/mario.png" style={styles('padding:0 2.5%')} />
                                        </div>
                                        <div style={styles('text-align:center;font-weight:bold', 'font-size:16px')}>Total Current Sales</div>
                                        <div style={styles('text-align:center;font-weight:bold', 'font-size:45px;color:#fbb207;line-height:85%')}>
                                            <AnimAmount number={this.state.trn.total_sales} />
                                        </div>
                                    </div>
                                    {(this.state.list.length == 0 ? null : <>
                                        <div>
                                            <div><hr style={styles('border:0;height:1px;background-image:\'linear-gradient(to right,rgba(0, 0, 0, 0),rgba(0, 0, 0, 0.75),rgba(0, 0, 0, 0))\'')} /></div>
                                            <div className="horizontal" style={styles('height:auto')}>
                                                <table>
                                                    <tr>
                                                        {this.state.list.map((item: any, idx: any) =>
                                                            <td>
                                                                <table style={styles('font-size:12px;text-align:center;margin:10px')}>
                                                                    <tbody>
                                                                        <tr><td style={styles('text-decoration:underline;font-weight:bold;font-size:20px')}>
                                                                            {item.game_name}
                                                                        </td></tr>
                                                                        <tr><td style={styles('font-size:14px;margin-top:-5px;display:block')}>
                                                                            {item.draw_date} ({item.draw_schedule})
                                                                        </td></tr>
                                                                        <tr><td style={styles('text-align:center;font-weight:bold', 'font-size:27.5px;color:#fbb207;margin-top:-7.5px;display:block')}>
                                                                            <div>{numberWithComma(item.total_sales, 2)}</div> {/**/}
                                                                        </td></tr>
                                                                    </tbody>
                                                                </table>
                                                            </td>
                                                        )}
                                                    </tr>
                                                </table>
                                            </div>
                                        </div>
                                    </>)}
                                </div>
                            </div>
                        </div>
                    </IonContent>
                </Layout>
            </Layout>
        </>);
    }
}