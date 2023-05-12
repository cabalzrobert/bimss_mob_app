import { IonContent, IonInput, IonItem, IonLabel, IonList, IonRefresher, IonRefresherContent, IonRippleEffect, IonSelect, IonSelectOption, IonSpinner } from '@ionic/react';
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
import SwapPager, { OnSwapFocus, OnSwapLeave } from '../../../../tools/components/+feature/swap-pager';
import PowerApRequestPopUp from '../../../+app/modal/power-ap-request.popup';
import PowerApSummaryView from './downline.power-ap-summary.view';
import ImgPreloader from '../../../../tools/components/+common/img-preloader';
import Recycler from '../../../../tools/components/+feature/recycler';
import RecyclerStorage from '../../../intro.page/recycler-storage';

const{ Object }:any = window;

export default class PowerApView extends React.Component {
    setTitle=(parentTitle:string, pageTitle:string)=>this.holder.setTitle(parentTitle, pageTitle);
    //
    shouldComponentUpdate=()=>false;
    holder:ViewHolder = (null as any);
    render(){
        return (<>
<Recycler storage={RecyclerStorage.instance} from={ViewHolder} bind={(ref)=>this.holder=ref}/>
        </>);
    }
}

export class ViewHolder extends React.Component {
    state:any = {};
    get pager(){ return UserPager.instance.pager; }
    componentWillMount=()=>this.willMount();
    page:any = {};
    willMount=()=>{
        const page = (this.page = { ParentTitle:'Game Profile', PageTitle:'Request Credit' });
        this.setState({tabs:false, page});
    }
    didMount=()=>{
        this.setState({tabs:true});
    }
    //
    public setTitle(parentTitle:string, pageTitle:string){
        const{ page } = this;
        page.ParentTitle = parentTitle;
        page.PageTitle = pageTitle;
        this.setState({page});
    }
    hBackButton=()=>{
        this.pager.back();
    }
    render(){
        const{ page, tabs } = this.state;
        return (<>
<Layout full>
    <Layout>
        <div className="row m-0 toolbar-panel">
            <div className="vertical arrow-back" onClick={this.hBackButton}></div>
            <div className="col-4 p-0 vertical toolbar-parent" onClick={this.hBackButton}>{page.ParentTitle}</div>
            <div className="col-7 p-0 toolbar-title vertical"><div><TextFit text={page.PageTitle}/></div></div>
        </div>
    </Layout>
    <Layout auto>
        {!tabs?null:<PowerApTabsView />}
    </Layout>
</Layout>
        </>);
    }
}


class PowerApTabsView extends React.Component {
    state:any = { };
    swapper:SwapPager = (mtObj as SwapPager);
    componentWillMount=()=>{
        const{ tabs } = this;
        this.setState({tabs});
    }

    tabs:any = [
        { name:'Pending', component:PowerApTab1View },
        { name:'Completed', component:PowerApTab2View },
        { name:'Cancelled', component:PowerApTab3View },
        { name:'Overall', component:PowerApTab4View },
    ];

    componentDidMount=()=>{
        this.hTab(this.tabs[0]);
    }
    componentWillUnmount=()=>{
        this.swapper.performViewLeave();
    }
    
    public activeTab:any;
    hTab(tab:any){
        if(this.activeTab==tab)return;
        if(this.activeTab)
            this.activeTab.isSelected = false;
        this.swapper.show(tab.component);
        this.activeTab = tab;
        tab.isSelected = true;
        this.setState({tabs:this.tabs});
    }

    render(){
        const{ tabs=[] } = this.state;
        return (<>
<Layout full>
    <Layout>
        <div className="row m-0 tabs-classic">
            {tabs?.map((tab:any)=><>
                <div className={classNames('col-3 p-0 horizontal tab',{active:tab.isSelected})} onClick={(ev)=>this.hTab(tab)}>
                    <div className="vertical">{tab.name}</div> 
                </div>
            </>)} 
        </div>
    </Layout>
    <Layout auto>
        <SwapPager ref={(ref:any)=>this.swapper=ref} />
    </Layout>
</Layout>
        </>);
    }
}

class PowerApTab1View extends React.Component implements OnSwapFocus, OnSwapLeave  {
    view = (mtObj as PageFilterView); 
    onSwapFocus(){ this.view.resumeRequest(); }
    onSwapLeave(){ this.view.pauseRequest(); }
    render(){
        return (<>
<PageFilterView ref={(ref:any)=>this.view=ref} status='0'/>
        </>);
    }
}
class PowerApTab2View extends React.Component implements OnSwapFocus, OnSwapLeave  {
    view = ({} as PageFilterView); 
    onSwapFocus(){ this.view.resumeRequest(); }
    onSwapLeave(){ this.view.pauseRequest(); }
    render(){
        return (<>
<PageFilterView ref={(ref:any)=>this.view=ref} status='1'/>
        </>);
    }
}
class PowerApTab3View extends React.Component implements OnSwapFocus, OnSwapLeave  {
    view = ({} as PageFilterView); 
    onSwapFocus(){ this.view.resumeRequest(); }
    onSwapLeave(){ this.view.pauseRequest(); }
    render(){
        return (<>
<PageFilterView ref={(ref:any)=>this.view=ref} status='2'/>
        </>);
    }
}
class PowerApTab4View extends React.Component implements OnSwapFocus, OnSwapLeave  {
    view = ({} as PageFilterView); 
    onSwapFocus(){ this.view.resumeRequest(); }
    onSwapLeave(){ this.view.pauseRequest(); }
    render(){
        return (<>
<PageFilterView ref={(ref:any)=>this.view=ref}/>
        </>);
    }
}

class PageFilterView extends React.Component<{status?:(undefined|'0'|'1'|'2')}> {
    state:any = { };
    get pager(){ return UserPager.instance.pager; }
    componentWillMount=()=>{
        const{ props, prop, filter } = this;
        filter.Status = (props.status||'');
        filter.IsCompleted = (props.status=='1');
        this.setState({prop, filter});
    }

    list:any = [];
    prop:any = { IsFiltering:true };
    filter:any = { Method:'' };
    subs:any = {};
    rqt:any = {};
    componentDidMount=()=>{
        this.performRequestDelay({ IsReset:true }, mtCb, 1275);
    }
    componentWillUnmount=()=>{
        Object.values(this.subs).map((m:any)=>m.unsubscribe());
    }
    hBackButton=()=>{
        this.pager.back();
    }
    hPullRefresh=(ev: any)=>{
        this.performRequestDelay({ IsReset:true, IsFiltering:true },(err:any)=>ev.detail.complete());
    }
    hLoadMore=(item:any)=>{
        var filter = item.NextFilter;
        filter.IsFiltering = true;
        this.setState({list:this.list});
        this.performRequestDelay(filter, (err:any)=>{
            if(!!err) return (filter.IsFiltering = false);
            delete item.NextFilter;
        });
    }
    hPayMethod=()=>{
        this.performRequestDelay({ IsReset:true });
    }
    hItem=async(item:any)=>{
        if(item.IsCancelled)return;
        if(item.IsPending) {
            return this.popUpPowerAp(item);
        }else if(item.IsApproved){
            return this.pager.next(PowerApSummaryView, ({instance}:{instance:PowerApSummaryView})=>instance?.setCustomer(item));
        }
    }
    hFState=(ev:any, key:string)=>this.filter[key]=ev.detail.value;

    public pauseRequest(){
        if(this.subs.s1) this.subs.s1.unsubscribe();
    }
    public resumeRequest(){
        if(this.rqt.r1) this.rqt.r1();
    }
    private performRequestDelay(filter:any, callback:Function=mtCb, delay:number=175){
        if(this.subs.t1) this.subs.t1.unsubscribe();
        this.prop.IsFiltering = !filter.IsFiltering;
        this.setState({prop:this.prop});
        this.subs.t1 = timeout(()=>this.performRequest(filter, callback), delay);
    }
    private performRequest(filter:any, callback:Function=mtCb){
        if(!this.subs) return;
        if(this.subs.s1) this.subs.s1.unsubscribe();
        this.rqt.r1=()=>this.performRequest(filter, callback);
        this.subs.s1 = rest.post('a/credit/requests', Object.rcopy(filter, this.filter)).subscribe(async(res:any)=>{
            this.rqt.r1 = null;
            this.prop.IsFiltering = false;
            if(res.Status!='error'){
                if(filter.IsReset) this.list = res.map((o:any)=>this.listDetails(o));
                else res.forEach((o:any)=>this.list.push(this.listDetails(o)));
                this.prop.IsEmpty = (this.list.length<1);
                if(callback!=null) callback();
                this.setState({filter:this.filter,prop:this.prop,list:this.list});
                return;
            }
        },(err:any) =>{ 
            toast('Failed to retrieve data, Please try again');
            this.rqt.r1 = null;
            this.prop.IsFiltering = false;
            this.prop.IsEmpty = (this.list.length<1);
            if(callback!=null) callback(err);
            this.setState({prop:this.prop});
        });
    }
    private listDetails(item:any){
        item.Status = '';
        if(item.IsPending) {
            item.StatusColor = 'white';
            item.Status = 'Pending';
        }else if(item.IsApproved){
            item.RequestColor = 'limegreen';
            if(item.IsPaid) {
                item.StatusColor = 'limegreen';
                item.Status = 'Paid';
            }else if(item.IsUnpaid){
                item.IsCredit = true;
                item.StatusColor = 'red';
                item.Status = 'Unpaid';
            }
        }else if(item.IsCancelled){
            item.RequestColor = 'red';
            item.StatusColor = 'red';
            item.Status = 'Cancelled';
        }
        return Customer(item);
    }
    async popUpPowerAp(subscriber:any){
        const modal = await PowerApRequestPopUp.modal(subscriber);
        await modal.present();
        const res = await modal.onDidDismiss();
        const data = (res||{}).data;
        if(!data)return;
        Object.rcopy(subscriber,data.item);
        this.setState({list:this.list});
    }
    /*async popUpPowerApDetails(subscriber:any){
        const modal = await PowerApRequestDetailsPopUp.modal(subscriber);
        await modal.present();
        await modal.onDidDismiss();
    }*/
   
    render(){
        const{ filter={}, prop={} } = this.state;
        const{ list=[] } = this.state;
        return (<>
<Layout full>
    {!filter.IsCompleted?null:<>
        <FilterPanel className="col-12 p-0 row m-0">
            <IonItem className="select" lines="none">
                <IonLabel style={styles('margin:0px')}>FILTER: </IonLabel>              
                <IonInput hidden></IonInput> 
                <Input ion="popup" node={(handle) => <>
                    <IonSelect interface="action-sheet" cancelText="Dismiss" value={filter.Method} {...handle({onChange:(ev)=>(this.hFState(ev,'Method'),this.hPayMethod())})}> 
                    <IonSelectOption value="">All</IonSelectOption>
                    <IonSelectOption value="1">Paid</IonSelectOption>
                    <IonSelectOption value="2">Unpaid</IonSelectOption>
                </IonSelect>                                                     
                                                                       </>}/>
                
            </IonItem>
        </FilterPanel>
    </>}
    <Layout auto>
        <NotFoundView visible={prop.IsEmpty} />
        <FilteringView visible={prop.IsFiltering} />
        <IonContent scrollY>
            <IonRefresher slot="fixed" onIonRefresh={this.hPullRefresh}>
                <IonRefresherContent />
            </IonRefresher>
            <IonList lines='none'>
                <div className="list wbg">
                {list?.map((item:any,idx:any)=>
                    <div className={classNames('list-item',{'bg bg-black':!item.NextFilter})}>
                        {!item.NextFilter?<Item item={item} onClick={()=>this.hItem(item)} />:<MoreItem item={item} onClick={()=>this.hLoadMore(item)} />}
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

const Item:React.FC<{item:any, onClick?:React.MouseEventHandler}> = ({item,onClick})=>{
    if(!!item.NextFilter) return null;
    return (<>
<div className="row m-0 details ion-activatable" style={styles('padding:5px')} onClick={onClick}> 
    <IonRippleEffect /> 
    <div className="col-12 p-0 row m-0" style={styles('position:relative;width:100%;color:#fefed1')}>
        <div className="layout-horizontal">
            <div className="auto" style={styles('width:25%')}>
                <div className="horizontal" >
                    <div className="vertical">
                        {/* <img className="brand-image img-circle elevation-1" style={styles('height:65px')} /> 
                            [img-preloader]="item.ImageUrl" default="./assets/img/icon_blank_profile.png"*/}
                        <ImgPreloader className='brand-image img-circle elevation-1' style={styles('width:65px;height:65px')}
                            placeholder="./assets/img/icon_blank_profile.png" src={item.ImageUrl} />
                    </div>
                </div>
            </div>
            <div className="auto">
                <div className="vertical" style={styles('position:relative')}>
                    <div style={styles('font-weight:bold')}>{item.DisplayName}</div>
                    <div style={styles('font-size:14px;margin-top:-2.5px')}>{item.AccountID}</div>
                    <div className="row" style={styles('font-size:14px;margin:0px;margin-top:-5px;font-size:12px')}>
                        <div className="vertical"><div>Status: <span style={styles('font-size:14px;font-weight:bold',{color:item.StatusColor})}>{item.Status}</span></div></div>
                        {!!item.IsPending?null:<>
                            <div className="vertical"><div><span style={styles('padding:0px 2.5px')}>|</span><span>{item.FulldateTransaction}</span></div></div>
                        </>}
                    </div>
                </div>
            </div>
        </div>
        <div className="vertical" style={styles('position:absolute;top:0px;right:5px;height:100%;text-align:right')}>
            <span style={styles('font-size:10px')}>{item.FulldateRequested}</span>
            <div className="btn-default" style={styles('min-width:100px;padding:5px',{background:item.RequestColor})}>{numberWithComma(item.RequestCredit,0)}</div>
        </div>
    </div>
</div>
    </>);
};

const MoreItem:React.FC<{item:any, onClick?:React.MouseEventHandler}> = ({item, onClick})=>{
    if(!item.NextFilter) return null;
    return (<>
<IonItem lines="none">
    <div className="horizontal" style={styles('width:100%','color:#fefed1')}> 
        <div className="vertical">
        {!item.NextFilter.IsFiltering?<>
            <div onClick={onClick}>Load more ..</div>
        </>:<>                      
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