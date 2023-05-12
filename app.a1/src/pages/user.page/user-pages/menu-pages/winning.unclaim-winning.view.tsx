import { IonContent, IonInput, IonItem, IonList, IonRefresher, IonRefresherContent, IonRippleEffect, IonSpinner } from '@ionic/react';
import React from 'react';
import styled from 'styled-components';
import Layout from '../../../../tools/components/+common/layout';
import NotFoundView from '../../../+app/component/common/not-found.view';
import FilteringView from '../../../+app/component/common/filtering.view';
import { mtCb, mtObj } from '../../../../tools/plugins/static';
import TextFit from '../../../../tools/components/+common/text-fit';
import { numberWithComma } from '../../../../tools/global';
import { classNames, styles } from '../../../../tools/plugins/element';
import { timeout } from '../../../../tools/plugins/delay';
import UserPager from '../../user-pager';
import { rest } from '../../../+app/+service/rest.service';
import { toast } from '../../../../tools/plugins/toast';
import { Customer, WinTicket } from '../../../+app/main-module';
import { OnPagerFocus } from '../../../../tools/components/+feature/view-pager';
import CustomerActionPopUp from '../../../+app/modal/customer-action.popup';
import TicketDetailsPopUp from '../../../+app/modal/ticket-details.popup';
import ClaimOptionPopUp from '../../../+app/modal/claim-option.popup';
import ClaimWinningView from './winning.claim-winning.view';
import ConvertToGameCreditPopUp from '../../../+app/modal/convert-to-game-credit.popup';
import { app } from '../../../../tools/app';
import Recycler from '../../../../tools/components/+feature/recycler';
import RecyclerStorage from '../../../intro.page/recycler-storage';

const{ Object }:any = window;

export default class UnClaimWinningView extends React.Component implements OnPagerFocus {
    onPagerFocus=(data:any)=>this.holder.onPagerFocus(data);
    resumeRequest=()=>this.holder.resumeRequest();
    pauseRequest=()=>this.holder.pauseRequest();
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
    componentWillMount=()=>this.willMount(false);
    list:any = [];
    prop:any = {};
    filter:any = {};
    subs:any = {};
    rqt:any = {};
    willMount=(didMount=true)=>{
        const list = (this.list = []);
        const prop = (this.prop = { didMount:didMount, IsFiltering:true });
        const filter = (this.filter = {});
        const rqt = (this.rqt = {});
        this.setState({list,prop,filter});
    }
    didMount=()=>{
        if(!this.prop.didMount)return;
        this.performRequestDelay({ IsReset:true }, mtCb, 1275);
    }
    willUnmount=()=>{
        Object.values(this.subs).map((m:any)=>m.unsubscribe());
    }

    onPagerFocus(data:any){
        if(!data)return;
        var index = this.list.indexOf(data);
        this.list.splice(index, 1);
        this.prop.IsEmpty = (this.list.length<1);
        this.setState({list:this.list, prop:this.prop});
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
    hItem=async(ticket:any)=>{
        this.popUpViewTicket(ticket);
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
        this.subs.s1 = rest.post('lottery/winnings', filter).subscribe(async(res:any)=>{
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
    private listDetails(ticket:any){
        return WinTicket(ticket);
    }

    async popUpViewTicket(ticket:any){
        const modal = await TicketDetailsPopUp.modal(ticket.Ticket, {winningAmount:ticket.TotalWinAmount});
        await modal.present();
        var res = await modal.onDidDismiss();
        var data = res.data||{};
        if(data.isClaim)
            return this.popUpClaimOption(ticket); 
    }
    
    async popUpClaimOption(ticket:any):Promise<any>{
        const modal = await ClaimOptionPopUp.modal();
        await modal.present();
        var res = await modal.onDidDismiss();
        var data = res.data||null;
        if(!data) return this.popUpViewTicket(ticket);
        return this.pager.next(ClaimWinningView,({instance}:{instance:ClaimWinningView})=>instance?.setClaimType(ticket, data));
    }
    async popUpGameCreditConvertion(){        
        const modal = await ConvertToGameCreditPopUp.modal();
        await modal.present();
    }
    
    render(){
        const{ list=[], filter={}, prop={} } = this.state;
        return (<>
<Layout full>
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
                        {!item.NextFilter?<Item item={item} first={(idx===0)} onClick={()=>this.hItem(item)} />:<MoreItem item={item} onClick={()=>this.hLoadMore(item)} />}
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

const Item:React.FC<{item:any, first?:boolean, onClick?:React.MouseEventHandler}> = ({item,first,onClick})=>{
    if(!!item.NextFilter) return null;
    return (<>
<div className="row m-0 details ion-activatable" style={styles('padding:5px 7.5px','color:#fefed1')} onClick={onClick}>
    <IonRippleEffect /> 
    <div className="col-12 p-0 row m-0">
        <div className="col-2 p-0 vertical" style={styles('height:100%')}>
            <div className="horizontal">
                <div className="horizontal" style={styles('width:50px;height:50px')}>
                    <img src={item.GameLogo} style={styles('height:100%')}/>
                </div>
            </div>
            <div className="horizontal" style={styles('height:auto;font-size:9px;font-weight:bold;white-space:nowrap')}>{item.DateoPosted}</div> {/*<!--{{item.DateDrawed}}--> */}
            <div className="horizontal" style={styles('height:auto;font-size:11px;white-space:nowrap')}>{item.TimeoPosted}</div>
        </div>
        <BetInfoPanel className="col-5" style={styles('padding:0px 5px;height:100%')}>
            <div className="row m-0 ticket-bet" style={styles('padding:0px')}>
                <div className="col-12 p-0"> 
                    <div className="bet-title" style={styles('margin-bottom:3px')}>
                        TOTAL STRAIGHT
                        <div className="bet-amount">{numberWithComma(item.TotalBetStraightAmount,0)}</div>
                    </div>
                </div>
                <div className="col-12 p-0"> 
                    <div className="bet-title">
                        TOTAL RUMBLE
                        <div className="bet-amount">{numberWithComma(item.TotalBetRumbleAmount,0)}</div>
                    </div>
                </div>
            </div>
            <div style={styles('font-weight:bold;font-size:15px')}>TRN#: {item.TransactionNo}</div>
        </BetInfoPanel>
        <div className="col-5" style={styles('height:100%;padding:0px;padding-left:5px')}>
            <div style={styles('position:relative;margin-bottom:1.5px')}> 
                <span style={styles('font-size:12px')}> WINNING(S): </span> 
                <div style={styles('position:absolute;right:0;top:0;width:50%;border:1px solid #62c9ee;border-top-right-radius:5px;border-bottom-right-radius:5px;padding:0px 2.5px;text-align:right;font-weight:bold','font-size:15px')}>
                    {numberWithComma(item.TotalWinStraightAmount,0)}
                </div>
                {/*<!-- float: right; -->*/}
            </div>
            <div style={styles('position:relative;margin-bottom:1.5px')}> 
                <span style={styles('font-size:12px')}> WINNING(R): </span> 
                <div style={styles('position:absolute;right:0;top:0;width:50%;border:1px solid #62c9ee;border-top-right-radius:5px;border-bottom-right-radius:5px;padding:0px 2.5px;text-align:right;font-weight:bold','font-size:15px')}>
                    {numberWithComma(item.TotalWinRumbleAmount,0)}
                </div>
                {/*<!-- float: right; -->*/}
            </div>
            <div style={styles('position:relative')}> 
                <span style={styles('font-size:12px')}> TOTAL WIN: </span> 
                <div style={styles('position:absolute;right:0;top:0;width:50%;border:1px solid #62c9ee;border-top-right-radius:5px;border-bottom-right-radius:5px;padding:0px 2.5px;text-align:right;font-weight:bold','font-size:16px;background-color:#62c9ee;color:white')}>
                    {numberWithComma(item.TotalWinAmount,0)}
                </div>
            </div>
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
const BetInfoPanel = styled.div`
>*.ticket-details{
    position: relative;
    .detail1{
        font-weight: bold;
    }
    .detail2{
        position: absolute;top: 0;right: 0;
        .date-process{
            text-align: right;
            font-size: 10px;
        }
        .time-process{
            text-align: right;
            font-size: 15px;
            font-weight: bold;
            margin-top: -5px;
        }
    }
}
>*.ticket-bet{
    height: auto;
    padding-top: 7.5px;
    .bet-title{
        font-size: 12px;
        font-weight: bold;
        background-color: #5fcbf2;
        padding: 2.5px 5px;
        color: white;
        border-radius: 5px;
        .bet-amount{
            position: absolute;
            top: 0;right: 0;
            float:right;
            background-color: #5bbdd7;
            padding: 2.5px 5px;
            //margin-top: -2.5px;
            //margin-right: -5px;
            border-bottom-right-radius: 5px;
            border-top-right-radius: 5px;
        }
    }
}
`;
