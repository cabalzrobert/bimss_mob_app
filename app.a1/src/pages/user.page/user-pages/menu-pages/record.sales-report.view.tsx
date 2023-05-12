import { IonContent, IonDatetime, IonInput, IonItem, IonList, IonRefresher, IonRefresherContent, IonRippleEffect, IonSelect, IonSelectOption, IonSpinner } from '@ionic/react';
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
import { Ledger } from '../../../+app/main-module';
import moment from 'moment';
import { app } from '../../../../tools/app';
import Recycler from '../../../../tools/components/+feature/recycler';
import RecyclerStorage from '../../../intro.page/recycler-storage';

const { Object }: any = window;

export default class SalesReportView extends React.Component {
    setTitle = (parentTitle: string, pageTitle: string) => this.holder.setTitle(parentTitle, pageTitle);
    //,
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
    list: any = [];
    prop: any = {};
    filter: any = {};
    input: any = {};
    subs: any = {};
    opts: any = {
        dateSelect: {
            opts: [
                { title: 'Beginning of Transaction', value: '0' },
                { title: 'Today\'s Transaction', value: '1' },
                { title: 'Select Date', value: '2' },
            ]
        }
    };
    page: any = {};
    willMount = (didMount = true) => {
        const { opts } = this;
        const list = (this.list = []);
        const prop = (this.prop = { didMount: didMount, IsFiltering: true });
        const filter: any = (this.filter = {});
        const page = (this.page = { ParentTitle: 'Game Profile', PageTitle: 'Sales Report' });
        //
        const today = new Date();
        opts.dtConfig = { MinYear: '1970', MaxYear: today.getFullYear(), };
        opts.dtPicker = { value: '', inited: false };
        const dtToday = moment(today).format('MMM DD, YYYY');
        filter.From = dtToday;
        filter.To = dtToday;
        this.setState({ page, list, prop, opts, filter });
    }
    didMount = () => {
        if (!this.prop.didMount) return;
        timeout(() => this.performSelectedDateSelect(this.opts.dateSelect.opts[1]));
    }
    willUnmount = () => {
        Object.values(this.subs).map((m: any) => m.unsubscribe());
    }

    hBackButton = () => {
        this.pager.back();
    }
    public setTitle(parentTitle: string, pageTitle: string) {
        this.page.ParentTitle = parentTitle;
        this.page.PageTitle = pageTitle;
        this.setState({ page: this.page });
    }

    hDateSelect = () => {
        this.ddDateSelect.open();
    }
    hSelectedDateSelect = (ev: any) => {
        var opt = (ev.detail || {}).value;
        if (!opt) return;
        return this.performSelectedDateSelect(opt);
    }
    performSelectedDateSelect(opt: any) {
        this.input.dateselect = opt;
        this.filter.DateTitle = opt.title;
        this.filter.isAll = (opt.value == '0');
        this.filter.isToday = (opt.value == '1');
        this.filter.isSelectDate = (opt.value == '2');
        this.setState({ filter: this.filter, input: this.input })
        if (this.filter.isAll) this.hFilter();
        else if (this.filter.isToday) this.performTodayFilter();
        else this.hDateFrom();
    }

    performTodayFilter() {
        var today = new Date();
        this.filter.From = this.filter.To = moment(today).format('MMM DD, YYYY');
        this.setState({ filter: this.filter });
        this.hFilter();
    }

    hDateFrom = () => {
        var apply = false;
        this.opts.dtPicker.callback = (() => {
            const callback = (date: any) => {
                if (!apply) return;
                if (!this.prop.IsDateChanged && this.filter.From == date)
                    return true;
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
        setTimeout(() => (this.vDatetime.open(), apply = true));
    }
    hDateTo = () => {
        var apply = false;
        this.opts.dtPicker.callback = (() => {
            const callback = (date: any) => {
                if (!apply) return;
                if (!this.prop.IsDateChanged && this.filter.To == date) {
                    if (this.opts.dtPicker.inited) return;
                    this.prop.IsDateChanged = true;
                }
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
        this.opts.dtPicker.inited = true;
        this.prop.IsDateChanged = false;
        this.prop.IsFiltering = true;
        this.setState({ prop: this.prop });
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
    hFState = (ev: any, key: string) => this.filter[key] = ev.detail.value;
    hState = (ev: any, key: string) => {
        this.input[key] = ev.detail.value;
        this.setState({ input: this.input });
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
        this.subs.s1 = rest.post('sales/report', Object.rcopy(filter, this.filter)).subscribe(async (res: any) => {
            this.prop.IsFiltering = false;
            if (res.Status != 'error') {
                if (filter.IsReset) this.list = res.map((o: any) => Ledger(o));
                else res.forEach((o: any) => this.list.push(Ledger(o)));
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

    elIonDatetime: any = React.createRef();
    get vDatetime() { return this.elIonDatetime.current; }
    elIonSelect: any = React.createRef();
    get ddDateSelect() { return this.elIonSelect.current; }
    render() {
        const { filter = {}, prop = {}, input = {} } = this.state;
        const { page = {}, list = [], } = this.state;
        return (<>
            <Layout full>
                <Layout>
                    <div className="row m-0 toolbar-panel">
                        <div className="vertical arrow-back" onClick={this.hBackButton}></div>
                        <div className="col-4 p-0 vertical toolbar-parent" onClick={this.hBackButton}>{page.ParentTitle}</div>
                        <div className="col-7 p-0 toolbar-title vertical"><div><TextFit text={page.PageTitle} /></div></div>
                    </div>
                </Layout>
                <Layout>
                    <div className="bg-top_red_panel">
                        <div className="layout-horizontal" style={styles('height:100%')}>
                            <div style={styles('width:10px')}>&nbsp;</div>
                            <div style={styles('width:190px;height:100%', { width: (!filter.isSelectDate ? '200px' : '105px') })} > {/*[style.width]="" <!--105px 190px-->*/}
                                <div className="vertical" style={styles('height:100%')}>
                                    <div className="input_container" style={styles('font-size:15px')} onClick={this.hDateSelect}> {/*(click)="handleClickDateSelect()"*/}
                                        <div className="row m-0" style={styles('padding-left:5px;height:100%')}>
                                            <div className="vertical" style={styles('margin-right:5px')}><span className="icon-sort_arrow_down"></span></div>
                                            <div className="vertical">{filter.DateTitle}</div> {/*<!-- Beginning of transaction -->*/}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {!filter.isSelectDate ? null : <>
                                <div style={styles('width:10px;color:whitesmoke')}><div className="horizontal"><div className="vertical">:</div></div></div>
                                <div style={styles('width:190px;height:100%')}>
                                    <div className="vertical" style={styles('height:100%')}>
                                        <div className="input_container" style={styles('font-size:14px')}>
                                            <div className="row m-0" style={styles('padding-left:5px;height:100%', 'font-size:90%')}>
                                                <div className="vertical" onClick={this.hDateFrom}>{filter.From}</div> {/*(click)="handleClickDateFrom()"*/}
                                                <div className="vertical" style={styles('margin:0px 5px')}> - </div>
                                                <div className="vertical" onClick={this.hDateTo}>{filter.To}</div> {/*(click)="handleClickDateTo()"*/}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>}
                            <div className="auto" style={styles('width:200%')}>&nbsp;</div>
                            <div style={styles('width:10px')} >&nbsp;</div>
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
                                <table style={styles('width:100%;border:none')}> {/*#tblLedger*/}
                                    <tr>
                                        <th align="center" style={styles('min-width:75px')}>DATE</th>
                                        <th align="right" style={styles('width:50%')}>SALES</th>
                                        <th align="right" style={styles('min-width:75px')}>DATE</th>
                                        <th align="right" style={styles('width:50%')}>MAX SALES</th>
                                    </tr>
                                    {list?.map((item: any, idx: any) => <>
                                        {!item.NextFilter ? <Item item={item} /> : <MoreItem item={item} onClick={() => this.hLoadMore(item)} />}
                                    </>)}
                                </table>
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
                        {...handle({ ref: this.elIonDatetime, onChange: (ev) => (this.hState(ev, 'datepicker'), this.hDatePicker(ev)) })}
                        onIonCancel={this.hCancelDatePicker}>
                    </IonDatetime>
                </>} />

                <Input ion="popup" node={(handle) => <>
                    <IonSelect interface="action-sheet"
                        value={input.dateselect}
                        {...handle({ ref: this.elIonSelect, onChange: (ev) => (this.hState(ev, 'dateselect'), this.hSelectedDateSelect(ev)) })}>
                        {this.opts.dateSelect.opts.map((opt: any) =>
                            <IonSelectOption value={opt}>{opt.title}</IonSelectOption>
                        )}
                    </IonSelect>
                </>} />

            </div>
        </>);
    }
}

const Item: React.FC<{ item: any, onClick?: React.MouseEventHandler }> = ({ item, onClick }) => {
    if (!!item.NextFilter) return null;
    return (<>
        <tr>
            <td align="center" style={styles('font-size:10px')}>{item.DateDisplay}</td>
            <td align="right">
                <div style={styles('width:100%')}>
                    <TextFit text={numberWithComma(item.Sales, 2)} />
                </div>
            </td>
            <td align="center" style={styles('font-size:10px')}>{item.DateOfMaxSalesDisplay}</td>
            <td align="right">
                <div style={styles('width:100%')}>
                    <TextFit text={numberWithComma(item.MaxSales, 2)} />
                </div>
            </td>
        </tr>
    </>);
};

const MoreItem: React.FC<{ item: any, onClick?: React.MouseEventHandler }> = ({ item, onClick }) => {
    if (!item.NextFilter) return null;
    return (<>
        <td colSpan={5} align="center" style={styles('border:none;padding-top:5px')}>
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
        </td>
    </>);
};

//styles
const TableView = styled.div`
height: 100%;
padding: 0px 10px;
*{ font-family: Helvetica, Verdana;font-size: 12px; color:#fefed1; } /*color: white; */
table  { width: 100% }
th{ background-color: #B00100; color: white; font-size: 12px; border: 1px solid #FFF; padding: 5px 5px; }
td{ border: 1px solid #eeeeee; padding: 0 2.5px; width: auto; content: ' '; }
b{ font-size: 14px; }
td[hidden]{
    display: none !important;
    max-width: 0px;
}
`;