import { IonButton, IonButtons, IonContent, IonDatetime, IonHeader, IonItem, IonList, IonMenu, IonMenuButton, IonPage, IonRefresher, IonRefresherContent, IonTitle, IonToolbar } from '@ionic/react';
import React from 'react';
import styled from 'styled-components';
import ViewPager from '../../../tools/components/+feature/view-pager';
import Layout from '../../../tools/components/+common/layout';
import moment from 'moment';
import { mtCb, mtObj } from '../../../tools/plugins/static';
import NotFoundView from '../../+app/component/common/not-found.view';
import FilteringView from '../../+app/component/common/filtering.view';
import TextFit from '../../../tools/components/+common/text-fit';
import { numberWithComma } from '../../../tools/global';
import { toast } from '../../../tools/plugins/toast';
import { timeout } from '../../../tools/plugins/delay';
import { rest } from '../../+app/+service/rest.service';
import { Input, styles } from '../../../tools/plugins/element';
import { app } from '../../../tools/app';

const { Object }: any = window;

export default class SelectDateTransactionView extends React.Component {
    state: any = {};
    componentWillMount = () => {
        app.component(this);
        this.state = { prop: this.prop, filter: this.filter, input: this.input, trn: this.trn };
        const today = new Date();
        this.opts.dtConfig = { MinYear: '1970', MaxYear: today.getFullYear(), };
        this.opts.dtPicker = { value: '', inited: false };
        const dtToday = moment(today).format('MMM DD, YYYY');
        this.filter.From = dtToday;
        this.filter.To = dtToday;
    }

    prop: any = { IsFiltering: true, };
    opts: any = {};
    filter: any = {};
    input: any = {};
    subs: any = {};
    trn: any = {};
    list: any = [];
    componentDidMount = () => {
        setTimeout(() => this.hDateFrom(), 125);
    }
    componentWillUnmount = () => {
        Object.values(this.subs).map((m: any) => m.unsubscribe());
    }

    hDateFrom = () => {
        var apply = false;
        this.opts.dtPicker.callback = (() => {
            const callback = (date: any) => {
                if (!apply) return;
                if (!this.prop.IsDateChanged && this.filter.From == date) return;
                if (!!date) {
                    this.filter.From = date;
                    this.prop.IsDateChanged = true;
                    return true;
                } else if (!this.opts.dtPicker.inited)
                    return this.hFilter();
            };
            return (date: any) => {
                if (!!callback(date)) setTimeout(() => this.hDateTo(), 450);
                this.setState({ filter: this.filter, prop: this.prop });
                this.opts.dtPicker.applying = false;
            };
        })();
        this.input.datepicker = this.filter.From;
        this.setState({ input: this.input });
        //this.opts.dtPicker.value = this.filter.From;
        setTimeout(() => (this.vDatetime.open(), apply = true));
    }
    hDateTo = () => {
        var apply = false;
        this.opts.dtPicker.callback = (() => {
            const callback = (date: any) => {
                if (!apply) return;
                if (!this.prop.IsDateChanged && this.filter.To == date) return;
                if (!!date) {
                    this.filter.To = date;
                    this.prop.IsDateChanged = true;
                }
                if (!this.prop.IsDateChanged) return;
                this.hFilter();
            }
            return (date: any) => {
                callback(date);
                this.setState({ filter: this.filter, prop: this.prop });
                this.opts.dtPicker.applying = false;
            };
        })();
        this.input.datepicker = this.filter.To;
        this.setState({ input: this.input });
        setTimeout(() => (this.vDatetime.open(), apply = true));
    }
    hDatePicker = (ev: any) => {
        if (this.opts.dtPicker.applying) return;
        this.opts.dtPicker.applying = true;
        if (!this.opts.dtPicker.callback) return;
        this.opts.dtPicker.callback(moment(ev.detail.value).format('MMM DD, YYYY'));
    }
    hCancelDatePicker = (ev: any) => {
        if (this.opts.dtPicker.applying) return;
        this.opts.dtPicker.applying = true;
        if (!this.opts.dtPicker.callback) return;
        this.opts.dtPicker.callback(null);
    }
    hFilter = () => {
        //console.log('hFilter');
        this.opts.dtPicker.inited = true;
        this.prop.IsDateChanged = false;
        this.prop.IsFiltering = true;
        this.performRequestDelay({ IsReset: true }, mtCb, 1275);
    }

    hPullRefresh = (ev: any) => {
        if (this.filter.IsFiltering) return (ev.detail.complete());
        this.performRequestDelay({ IsReset: true, IsFiltering: true, BaseFilter: false }, (err: any) => ev.detail.complete());
    }
    hLoadMore = (item: any) => {
        var filter = item.NextFilter;
        filter.IsFiltering = true;
        this.performRequestDelay(filter, (err: any) => {
            if (!!err) return (filter.IsFiltering = false);
            delete item.NextFilter;
        });
    }
    handleChangedPayMethod() {
        this.performRequestDelay({ IsReset: true });
    }
    private performRequestDelay(filter: any, callback: Function = mtCb, delay: number = 175) {
        if (this.subs.t1) this.subs.t1.unsubscribe();
        this.prop.IsFiltering = !filter.IsFiltering;
        this.setState({ prop: this.prop });
        this.subs.t1 = timeout(() => this.performRequest(filter, callback), delay);
    }
    private performRequest(filter: any, callback: Function = mtCb) {
        if (!this.subs) return;
        if (this.subs.s1) this.subs.s1.unsubscribe();
        this.subs.s1 = rest.post('lottery/sales', Object.rcopy(filter, this.filter)).subscribe(async (res: any) => {
            this.prop.IsFiltering = false;
            if (res.Status != 'error') {
                if (filter.IsReset) this.list = res.map((o: any) => o); //this.lsm.Ledger(o)
                else res.forEach((o: any) => this.list.push(o)); //this.lsm.Ledger(o)
                this.prop.IsEmpty = (this.list.length < 1);
                this.trn = { TotalSales: 0, TotalStraight: 0, TotalRumble: 0 };
                this.list.reduce((r: any, i: any) => ((r.TotalSales += i.TotalSales, r.TotalStraight += i.TotalStraight, r.TotalRumble += i.TotalRumble), r), this.trn);
                if (callback != null) callback();
                this.setState({ filter: this.filter, prop: this.prop, list: this.list, trn: this.trn });
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


    elIonDatetime: any = React.createRef();
    get vDatetime() { return this.elIonDatetime.current; }
    render() {
        const { filter = {}, prop = {}, input = {} } = this.state;
        const { list = [], trn = {} } = this.state;
        return (<>
            <Layout full>
                <Layout>
                    <IonHeader>
                        <IonToolbar color="black" style={styles('background:rgba(0,0,0,0.75);color:white')}>
                            <IonButtons slot="start"><IonMenuButton hidden={false}></IonMenuButton></IonButtons>
                            <IonTitle>Sales Report</IonTitle>
                        </IonToolbar>
                    </IonHeader>
                    <div>
                        <div style={styles('height:50px;background-color:rgba(64,64,64,0.85)')}> {/*<!--class="bg-top_red_panel" -->*/}
                            <div className="layout-horizontal" style={styles('height:100%')}>
                                <div style={styles('width:10px')}>&nbsp;</div>
                                <div style={styles('width:85px;color:whitesmoke;font-size:15px')}><div className="horizontal"><div className="vertical">Select Date:</div></div></div>
                                <div style={styles('width:190px;height:100%')}>
                                    <div className="vertical" style={styles('height:100%')}>
                                        <div className="input_container" style={styles('font-size:14px')} >
                                            <div className="row m-0" style={styles('height:100%', 'padding-left:5px')}>
                                                <div className="vertical" onClick={this.hDateFrom}>{filter.From}</div> {/*(click)="handleClickDateFrom()"*/}
                                                <div className="vertical" style={styles('margin:0px 5px')}> - </div>
                                                <div className="vertical" onClick={this.hDateTo}>{filter.To}</div> {/*(click)="handleClickDateTo()"*/}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="auto" style={styles('width:200%')}>&nbsp;</div>
                                <div style={styles('width:10px')}>&nbsp;</div>
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
                            <TableView>
                                <table style={styles('width:100%', 'border:none')}>
                                    <tbody>
                                        <tr>
                                            <th align="center" style={styles('min-width:65px')}>DATE DRAW</th>
                                            <th align="center">STRAIGHT</th>
                                            <th align="center">RUMBLE</th>
                                            <th align="center">TOTAL GROSS</th>
                                        </tr>
                                        {list?.map((item: any, idx: any) =>
                                            <tr>
                                                <td align="center">{item.TransactionDate}</td>
                                                <td align="right">
                                                    <div style={styles('width:100%')}>
                                                        <TextFit text={numberWithComma(item.TotalStraight, 2)} />
                                                    </div>
                                                </td>
                                                <td align="right">
                                                    <div style={styles('width:100%')}>
                                                        <TextFit text={numberWithComma(item.TotalRumble, 2)} />
                                                    </div>
                                                </td>
                                                <td align="right">
                                                    <div style={styles('width:100%;font-weight:bold')}>
                                                        <TextFit text={numberWithComma(item.TotalSales, 2)} />
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                        {!!list && (list.length == 0 ? null : <>
                                            <tr > {/*ngIf="getTotal(); let tot"*/}
                                                <td align="center"><b>TOTAL</b></td>
                                                <td align="right">
                                                    <div style={styles('width:100%;font-weight:bold')}>
                                                        <TextFit text={numberWithComma(trn.TotalStraight, 2)} />
                                                    </div>
                                                </td>
                                                <td align="right">
                                                    <div style={styles('width:100%;font-weight:bold')}>
                                                        <TextFit text={numberWithComma(trn.TotalRumble, 2)} />
                                                    </div>
                                                </td>
                                                <td align="right">
                                                    <div style={styles('width:100%;font-weight:bold')}>
                                                        <TextFit text={numberWithComma(trn.TotalSales, 2)} />
                                                    </div>
                                                </td>
                                            </tr>
                                        </>)}
                                    </tbody>

                                </table>
                                <div>&nbsp;</div>
                            </TableView>
                        </IonList>
                    </IonContent>
                </Layout>
            </Layout>
            <div style={styles('visibility:hidden;height:0px;width:0px')}>
                <Input ion node={(handle) => <>
                    <IonDatetime
                        pickerFormat="MMMM DD YYYY" displayFormat="MMM DD, YYYY"
                        min={this.opts.dtConfig.MinYear} max={this.opts.dtConfig.MaxYear}
                        value={input.datepicker}
                        {...handle({ ref: this.elIonDatetime, onChange: this.hDatePicker })}
                        onIonCancel={this.hCancelDatePicker}>
                    </IonDatetime>
                </>} />

            </div>
        </>);
    }
}

//styles
const TableView = styled.div`
height: 100%;
padding: 0px 10px;
*{ font-family: Helvetica, Verdana;font-size: 12.5px;} /*color: white; */
table  { width: 100% }
th{ background-color: #B00100; color: white; font-size: 12px; border: 1px solid #FFF; padding: 5px 5px; }
td{ border: 1px solid #eeeeee; padding: 0 2.5px; }
b{ font-size: 14px; }
td[hidden]{
    display: none !important;
    max-width: 0px;
}
`;