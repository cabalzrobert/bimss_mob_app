import { IonContent, IonSlide, IonSlides as ionSlides } from '@ionic/react';
import React from 'react';
import styled from 'styled-components';
import { toast } from '../../../../../tools/plugins/toast';
import { sms, smsReceiver } from '../../../../../tools/plugins/sms';
import { device } from '../../../../../tools/plugins/device';
import Layout from '../../../../../tools/components/+common/layout';
import { Alert } from '../../../../../tools/components/+common/stack';
import TextFit from '../../../../../tools/components/+common/text-fit';
import { numberWithComma } from '../../../../../tools/global';
import RollingNumberView from '../../../../+app/component/feature/rolling-number.view';
import RollingTextNumberView from '../../../../+app/component/feature/rolling-text-number.view';
import { AndroidPermissions } from '@ionic-native/android-permissions';
import moment from 'moment';
import TicketDetailsPopUp from '../../../../+app/modal/ticket-details.popup';
import { mtCb, mtObj } from '../../../../../tools/plugins/static';
import { multiState } from '../../../../../tools/plugins/react';
import { additionalCreditBalance, jUser, jUserModify } from '../../../../+app/user-module';
import { OnSwapFocus } from '../../../../../tools/components/+feature/swap-pager';
import { app } from '../../../../../tools/app';
import { classNames, styles } from '../../../../../tools/plugins/element';
import BuyCreditsPopUp from '../../../../+app/modal/buy-credits.popup';
import UserPager from '../../../user-pager';
import AddCustomerMobilePopUp from '../../../../+app/modal/add-customer-mobile.popup';
import PlaceBetTicketsPopUp from '../../../../+app/modal/place-bet-tickets.popup';
import { rest } from '../../../../+app/+service/rest.service';
import { printTicket } from '../../../../+app/main-module';
import { storage } from '../../../../../tools/plugins/storage';
import Recycler from '../../../../../tools/components/+feature/recycler';
import RecyclerStorage from '../../../../intro.page/recycler-storage';

const{ Object }:any = window;

export default class GameView extends React.Component implements OnSwapFocus {
    onSwapFocus=()=>this.holder.onSwapFocus();
    performConfirmBets=()=>this.holder.performConfirmBets();
    //
    shouldComponentUpdate=()=>false;
    holder:ViewHolder = (null as any);
    render(){
        return (<>
<Recycler storage={RecyclerStorage.instance} from={ViewHolder} bind={(ref)=>this.holder=ref} />
        </>);
    }
}

export class ViewHolder extends React.Component {
    state:any = { u:{ CreditBalance: 0 }, }
    get pager(){ return UserPager.instance.pager; }
    componentWillMount=()=>this.willMount(false);
    prefs:any = { ReferenceID:(+new Date()).toString(), }
    input:any = {};
    inputs:any = {};
    balls:any = [];
    bets:any = [];
    tabs:any = [
        { name:'type-swer3', BetType:'SWER3', Balls:3, Min:0, Max:9 },
        { name:'type-swer2', BetType:'SWER2', Balls:2, Min:0, Max:9 },
        { name:'type-pares', BetType:'PARES', Balls:2, Min:0, Max:40 },
    ];
    subs:any = {};
    willMount=(base=true)=>{
        const balls = (this.balls = []);
        const input = (this.input = { isRumble:true, TotalBet:0, BetType:'SWER3' });
        const inputs = (this.inputs = { Straight:{ Value:'', tag:'straight' }, Rumble:{ Value:'', tag:'rumble' } });
        const bets = (this.bets = []);
        this.multiState({balls,input,inputs,bets});
        if(!base)return;
        this.subs.u = jUserModify(async()=>{
            const u = await jUser();
            this.multiState({u});
            this.setState({u});
        });
    }
    didMount=async()=>{
        this.hClickTab(this.tabs[0],true);
    }
    willUnmount=()=>{
        Object.values(this.subs).map((m:any)=>m.unsubscribe());
    }
    //
    onSwapFocus(){
        setTimeout(()=>app.window.resize(),375);
    }
    private activeTab:any;
    private ballCount:number = 0;
    hClickTab(tab:any, init=false){
        if(init){}
        else if(this.activeTab==tab)return;
        const{ input, balls } = this;
        if(this.activeTab)
            this.activeTab.isSelected = false;
        this.activeTab = tab;
        tab.isSelected = true;
        input.BetType = tab.BetType;
        input.Balls = +(tab.Max||9);
        input.Number = 0;
        this.ballCount = tab.Balls;
        this.fillTheBalls();
        this.hRollingBall(balls[0]);
    }
    fillTheBalls(includeBallNumbers = false){
        const{ balls, input } = this;
        var ballNumbers = !includeBallNumbers?[]:balls.map((m:any)=>m.Number);
        balls.length = 0;
        for(var i=0;i<this.ballCount;i++)
            balls.push({ Number:(ballNumbers[i]||0), IsBall:true });
        this.multiState({balls,input});
    }
    randomRollingBall=()=>{
        const{ balls, input } = this;
        balls.forEach((b:any)=>b.Number = Math.floor(Math.random()*(input.Balls+1)));
        this.multiState({balls});
    }

    private get tab(){ return this.slider.current; }
    private active:any;

    private hRollingBall=(ball:any, isSlide:boolean=true)=>{
        this.performActiveItem(ball);
        const{ balls, input } = this; 
        if(isSlide) this.tab.slideTo(0); //#
        if(balls[balls.length-1]!=ball)
            return this.multiState({input});
        input.Number = '';
        this.multiState({input});
    }
    private hInputBet=(bet:any, callback:Function=mtCb)=>{
        const{ input, inputs } = this;
        if(!input.isRumble){
            if(inputs.Rumble==bet){
                return toast('Disable Rumble input when '+this.ballCount+' roll number is the same');
            }
        }
        this.performActiveItem(bet, callback);
    }
    //
    private performActiveItem(item:any, callback:Function=mtCb){
        const{ balls, input, inputs, active } = this;
        if(!!active)
            active.IsActive = false;
        this.active = item;
        item.IsActive = true;
        var fball = balls[0];
        input.isRumble = !!balls.find((b:any)=>b.Number!=fball.Number);
        this.multiState({input,inputs});
        if(!!callback) callback(); //
    }

    private textNumber(number:number){
        const{ input } = this;
        var maxlen = (''+(+input.Balls)).length;
        number = +(number||0);
        return (''+number).padStart(maxlen, '0');
    }
    
    private hNumPad(key:string){
        if(key=='X')
            return this.performCorrection();
        else if(key=='+')
            return this.performAddBet();

        if(this.active.IsBall)
            return this.performBallNumpad(+key);
        this.performInput(key);
    }

    private performBallNumpad(keyNumber:number){
        const{ balls, input, inputs } = this;
        var activeIndex = this.balls.indexOf(this.active);
        if(input.Balls<10){
            this.active.Number = keyNumber;
            var ball = balls[activeIndex+1];
            if(ball) return this.hRollingBall(ball);
            return this.hInputBet(inputs.Straight);
        }
        var max = (input.Balls+1);
        var number = keyNumber;
        var text = ((input.Number||'')+''+number);
        var temp = +(text||0);
        var form = false, jump = false;
        var index = activeIndex, special = false, active = false;
        var len = (text.length == (''+max).length);
        if((number>4 && temp<10)||(temp==0&&len)) jump = special = true;
        else if(temp<max){
            number = temp;
            if(len) jump = special = true;
            else input.Number = text;
        }else{
            input.Number = number;
            form = true;  //greather = special = 
            index ++;
            special = (index==balls.length);
        }
        var ball = balls[index];
        if(!!ball){
            this.performActiveItem(ball);
            this.active.Number = number;
            active = true;
        }
        if(special){ 
            input.Number = '';
        }
        if(jump){
            index++;
            active = false;
        }
        //
        this.multiState({input});
        if(activeIndex == index || active) return;
        var ball = balls[index];
        if(ball) return this.hRollingBall(ball);
        return this.hInputBet(inputs.Straight, ()=>(!form?0:this.hNumPad(''+keyNumber)));
    }
    
    private async performInput(number:string){
        const{ inputs, active } = this;
        var value = (active.Value||'').toString();
        if(value.length==8)return;
        active.Value = await this.tryCheckLimits((+(`${value}${number}`)).toString());
        this.multiState({inputs});
    }

    private async tryCheckLimits(input:any){
        const value = +input;
        const limits = (await storage.BetLimits||{});
        if(this.inputs.Straight==this.active){
            if(!!limits.StraightLimit&&typeof(limits.StraightLimit)=='number'){
                if(limits.StraightLimit<value){
                    input = (limits.StraightLimit||'0').toString();
                    toast('Straight bet amount exceed to max bet limit');
                }
            }
        }else if(this.inputs.Rumble==this.active){
            if(!!limits.RumbleLimit&&typeof(limits.RumbleLimit)=='number'){
                if(limits.RumbleLimit<value){
                    input = (limits.RumbleLimit||'0').toString();
                    toast('Rumble bet amount exceed to max bet limit');
                }
            }
        }
        return input;
    }
    
    private isTapping:boolean = false;
    private timer:any = {};
    async slideTapLocker(){
        if(this.isTapping) return;
        if(this.timer.tab) clearTimeout(this.timer.tab);
        if(await this.tab.getActiveIndex()!=0)return;
        this.isTapping = true;
        this.tab.lockSwipes(true);
        this.timer.tab = setTimeout(()=>(this.tab.lockSwipes(false), this.isTapping=false), 1250);
        setTimeout(()=>this.isTapping=false);
    }

    private performCorrection(){
        const{ inputs, active } = this;
        if(active.IsBall) return;
        var value = (active.Value||'').toString();
        if(value.length==0)return;
        this.active.Value = value.substring(0, value.length-1);
        this.multiState({inputs});
    }

    private performAddBet(){
        const{ state:{u}, bets } = this;
        if(bets.length>4)
            return toast('Only 5 Max Bet Limit'); 
        var straight:any = +this.inputs.Straight.Value;
        var rumble:any = +(this.input.isRumble?this.inputs.Rumble.Value:0);
        var combination = this.balls.map((b:any)=>this.textNumber(b.Number)).join(' - ');
        if(straight==0&&rumble==0)
            return toast('Please fill Straight/Rumble');
        const total = (straight + rumble), balance = (u.CreditBalance||0) - (this.input.TotalBet||0);
        if(balance<total)
            return toast('Insufficient Credit Balance');
        bets.push({ Combination:combination, Straight:straight, Rumble:rumble, Total:total, BetType:this.input.BetType });
        this.multiState({bets});
        this.recomputeBetTable();
        this.tab.lockSwipes(false);
        this.tab.slideTo(1);
        this.resetInput(); 
    }
    private resetInput(){
        const{ balls, inputs } = this;
        inputs.Straight.Value = '';
        inputs.Rumble.Value = '';
        balls.forEach((b:any)=>b.Number='');
        this.multiState({balls,inputs});
        this.hRollingBall(balls[0],false);
    }
    private recomputeBetTable(){
        const{ state:{u}, bets, input } = this;
        const detl = { TotalBet:0, TotalBetStraight:0, TotalBetRumble:0, RemainingBalance:0  };
        bets.forEach((b:any)=>(detl.TotalBet+=b.Total, detl.TotalBetStraight+=b.Straight, detl.TotalBetRumble+=b.Rumble ));
        detl.RemainingBalance = u.CreditBalance - detl.TotalBet;
        Object.rcopy(input, detl);
        this.multiState({input});
    }
    private removeBetTable(tickets:[]){
        const{ bets } = this;
        var betTypes = tickets.map((m:any)=>m.BetType);
        var filters = bets.filter((f:any)=>betTypes.indexOf(f.BetType)>-1);
        if(filters.length==0)return;
        this.performLocalProcess(tickets.reduce((sum:any,ticket:any)=>sum+ticket.TotalBetAmount,0));
        filters.map((m:any)=>bets.indexOf(m)).reverse().forEach((i:any)=>bets.splice(i, 1));
        return this.recomputeBetTable();
    }

    private hRemoveBet=(info:any)=>{
        const{ bets } = this;
        Alert.swal({
            title: 'Deleting: '+info.Combination.replace(/\s/g, ''),
            text: 'Are you sure you want to Continue?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Remove!', //'Yes, delete it!',
            cancelButtonText: 'Cancel', //'No, keep it',
            allowOutsideClick: false,
            backdropDismiss:false,
            confirmButtonColor: "#218838",   
            cancelButtonColor: "#c82333",
            reverseButtons: true,
        }, (res:any)=>{
            if(res.isConfirmed){
                var index = bets.indexOf(info);
                bets.splice(index, 1);
                this.multiState({bets});
                return this.recomputeBetTable();
            }
        });
    }

    hConfirmBets=()=>{
        this.performConfirmBets();
        /*this.checkAndroidPermission((granted:any)=>{
            if(!!granted) return this.performConfirmBets();
            return toast('Please grant required permission.');
        });*/
    }
    
    /*
    //sms
    private checkAndroidPermission(callback:Function=mtCb){
        if(!device.isAndroid) return callback();
        return AndroidPermissions.checkPermission(AndroidPermissions.PERMISSION.READ_SMS).then(
            res=>(!res.hasPermission?this.requestAndroidPermission(callback):callback(true)),
            err=>this.requestAndroidPermission(callback),
        );
    }
    private requestAndroidPermission(callback:Function=mtCb){
        if(!device.isAndroid) return callback(false);
        return AndroidPermissions.requestPermissions([
            AndroidPermissions.PERMISSION.READ_SMS,]).then(
            res=>(toast('Permission '+(!res.hasPermission?'Denied':'Granted')),callback(!!res.hasPermission)),
            err=>(toast('Permission Denied'),callback(false)),
        );
    }*/

    
    performConfirmBets=async()=>{
        const{ state:{u} } = this;
        this.tab.slideTo(1);
        if(!this.isValidEntries()) return;
        if(!!u.Terminal){
            var res:any = await this.popUpAddCustomer();
            var data = (res.data||mtObj);
            this.input.isNotSkip = !(data.isSkip===true);
            if(this.input.isNotSkip) this.input.MobileNumber = data.MobileNumber;
        }
        Alert.swal({
            title: 'Confirmation',
            text: 'Are you sure you want to Continue?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Confirm!', //'Yes, delete it!',
            cancelButtonText: 'Cancel', //'No, keep it',
            allowOutsideClick: false,
            backdropDismiss:false,
            confirmButtonColor: "#218838",    
            cancelButtonColor: "#c82333",
            reverseButtons: true,
        }, (res:any)=>{
            if(res.isConfirmed){
                Alert.showProgressRequest();
                return setTimeout(()=>this.performSubmit(), 150);
            }
        });
    }
    
    private performSubmit(){
        const{ prefs } = this;
        var form:any = { details:this.input, bets:this.bets };
        if(this.input.isNotSkip) form.MobileNumber = this.input.MobileNumber;
        rest.post('lottery/play', Object.rcopy(form, prefs)).subscribe(async(res:any)=>{
            if(res.Status=='ok'){
                prefs.ReferenceID = (+(new Date())).toString();
                if(!res.Tickets)
                    return Alert.showSuccessMessage(res.Message);
                Alert.swal(false);
                setTimeout(()=>this.removeBetTable(res.Tickets.filter((f:any)=>f.Status=='ok').map((m:any)=>m.Ticket)));
                setTimeout(()=>this.printTickets(res.Tickets));
                if(res.Tickets.length==1){
                    this.popUpTicketDetails(res.Tickets[0].Ticket);
                    return toast(res.Message);
                }
                return this.popUpTickets(res.Tickets);
            }
            Alert.showErrorMessage(res.Message);
        },(err:any) =>{
            Alert.showWarningMessage('Please try again');
        });
    }
    private printTickets(tickets:any){
        tickets.forEach((ticket:any)=>printTicket(ticket.Ticket));
    }
    
    private isValidEntries():boolean{
        const{ state:{u}, bets, input } = this;
        var isValid = true;
        if(bets.length==0 || input.TotalBet<1){
            toast('Please add any bet number first.');
            isValid = false;
        }else if(u.CreditBalance<input.TotalBet){
            toast('Insufficient Credit Balance');
            isValid = false;
        }

        return isValid;
    }
    
    private async popUpAddCustomer(){
        const modal = await AddCustomerMobilePopUp.modal();
        await modal.present();
        return await modal.onDidDismiss();
    }
    private async popUpTicketDetails(ticket:any){
        const modal = await TicketDetailsPopUp.modal(ticket);
        await modal.present();
        await modal.onDidDismiss();
    }
    private async popUpTickets(tickets:any){
        const modal = await PlaceBetTicketsPopUp.modal(tickets);
        await modal.present();
        await modal.onDidDismiss();
    }
    
    private performLocalProcess=async(creditUsed:number)=>{
        var deductBalance = (+creditUsed * -1);
        additionalCreditBalance(deductBalance);
    }


    hHowToPlay=()=>{
        
    }
    //
    multiState = multiState();
    shouldComponentUpdate=()=>false;
    slider:any = React.createRef();
    render(){
        const{ multiState } = this;
        return (<>
<Layout full>
    <BalancePanel ref={BalancePanel.rgs(multiState)} />
    <Layout auto>
        <IonContent>
            <Layout full>
                <Layout auto height='100%'>
                    <Layout full>
                        <Layout auto height='47.5%'>
                            <Layout full>
                                <RollingBallPanel ref={RollingBallPanel.rgs(multiState)} hRollingBall={this.hRollingBall}/>
                                <BetInputPanel ref={BetInputPanel.rgs(multiState)} hInputBet={this.hInputBet}/>
                            </Layout>
                        </Layout>
                        <Layout auto>
                            <IonSlides ref={this.slider} pager options={{initialSlide:0,speed:275,onlyExternal:false}} onIonSlideTap={()=>this.slideTapLocker()}>
                                <IonSlide>
                                    <KeyboardPanel onKeyPress={(key:any)=>this.hNumPad(key)} />
                                </IonSlide>
                                <IonSlide>
                                    <BetsPanel ref={BetsPanel.rgs(multiState)} hRemoveBet={this.hRemoveBet} />
                                </IonSlide>
                            </IonSlides>
                        </Layout>
                    </Layout>
                </Layout>
            </Layout>
        </IonContent>
    </Layout>
</Layout>
        </>);
    }
}

class BalancePanel extends React.Component{
    static rgs = ((multiState:any)=>multiState(1,({u}:any)=>({u})));
    state:any = { u:{} };
    get pager(){ return UserPager.instance.pager; }
    //
    hBuyCredits=async()=>{
        const{ state:{u} } = this;
        if(u.IsGeneralCoordinator)return;
        const modal = await BuyCreditsPopUp.modal();
        await modal.present();
    }
    hCommissionLedger=()=>{
        
    }
    //
    render(){
        const{ u } = this.state;
        return (<>
<Layout style={styles('height:55px')}>
    <div className="bg-top_red_panel"> 
        <div className="layout-horizontal" style={styles('height:100%')}> 
            <div style={styles('width:25px')}>&nbsp;</div>
            <div className="auto" style={styles('width:150%')}>
                <div className="vertical" style={styles('height:100%')}>
                    <div className="input_container" style={styles('font-size:25px')}> 
                        <div className="horizontal" onClick={this.hBuyCredits}> 
                            <div className="vertical" style={styles('width:20%;margin-right:2.5px')}>
                                <div className="horizontal"><div className="icon-sm_coin">&nbsp;</div></div>  
                            </div>
                            <div className="vertical" style={styles('width:70%')}>
                                <div><TextFit text={numberWithComma(u.CreditBalance||0,0)} /></div>
                            </div>
                        </div>
                    </div>  
                </div>  
            </div>
            <div className="auto" style={styles('width:45%')}>&nbsp;</div>
            <div className="auto" style={styles('width:152.5%')}>
                <div className="vertical" style={styles('height:100%')}>
                    <div className="input_container" style={styles('font-size:25px')}> 
                        {!!u.IsPlayer?null:<>
                            <div className="horizontal" onClick={this.hCommissionLedger}>
                                <div className="vertical" style={styles('width:20%;margin-right:2.5px')}>
                                    <div className="horizontal"><div className="icon-sm_commission">&nbsp;</div></div>  
                                </div>
                                <div className="vertical" style={styles('width:70%')}>
                                    <div><TextFit text={numberWithComma(u.CommissionBalance||0,2)} /></div>
                                </div>
                            </div>
                        </>}
                        {!u.IsPlayer?null:<>
                            <div className="horizontal">
                                <div className="vertical" style={styles('width:20%;margin-right:2.5px')}>
                                    <div className="horizontal"><div className="icon-sm_star">&nbsp;</div></div>
                                </div>
                                <div className="vertical" style={styles('width:70%')}>
                                    <div><TextFit text={u.AccountID} /></div>
                                </div>
                            </div>
                        </>}
                    </div>  
                </div>  
            </div>
            <div style={styles('width:25px')}>&nbsp;</div>
        </div>
    </div>  
</Layout>
        </>);
    }
} 

class RollingBallPanel extends React.Component<{hRollingBall?:Function}> {
    static rgs = ((multiState:any)=>multiState(2,({balls,input}:any)=>({balls,input})));
    state:any = { balls:[], input:{} };
    render(){
        const{ balls, input } = this.state;
        const{ hRollingBall=mtCb } = this.props;
        return(<>
<Layout auto>      
    <div style={styles('height:100%','padding:5px')}>
        <div className="horizontal rolling-number-container" style={styles('height:100%')}>
        {balls.map((i:any,idx:any)=> 
            <div key={idx} className="horizontal" style={styles('margin:0px 1px')} onClick={()=>hRollingBall(i)}>
                <div className="vertical">
                    {!(input.BetType=='SWER3'||input.BetType=='SWER2')?null:<>
                        <RollingNumberView animate ball={i.Number} max={input.Balls} active={!!i.IsActive} />
                    </>}
                    {!(input.BetType=='PARES')?null:<>
                        <RollingTextNumberView animate ball={i.Number} max={input.Balls} active={!!i.IsActive} />
                    </>}
                </div>
            </div>
        )}
        </div>
    </div>
</Layout>
        </>);
    }
}
class BetInputPanel extends React.Component<{hInputBet?:Function}> {
    static rgs = ((multiState:any)=>multiState(3,({inputs}:any)=>({inputs})));
    state:any = { inputs:{} };
    render(){
        const{ inputs } = this.state;
        const{ hInputBet=mtCb } = this.props;
        return(<>
<Layout height='47.5px'>
    <div style={styles('height:100%')}>
        <div className="row m-0 bet_input_panel"  style={styles('padding-left:10px')}>
            {[inputs.Straight,inputs.Rumble].map((i:any, idx:any)=>(!i?null:
                <div key={idx} className="col-6 p-0 panel" onClick={()=>hInputBet(i)}>
                    <div className={classNames(('per_type_panel '+i.tag),{'active':i.IsActive})}>
                        <div className="vertical input">
                            <TextFit style={styles('display:flex;justify-content:center;font-size:150%;color:#fefed1')}
                                text={(numberWithComma(i.Value,0))} />
                        </div>
                    </div>
                </div>    
            ))}
        </div>
    </div>
</Layout>
        </>);
    }
}
class KeyboardPanel extends React.Component<{onKeyPress:Function}> {
    private numpads:any[] = [
        [ '1', '2', '3', '4', ],
        [ '5', '6', '7', '8', ],
        [ '9', '0', 'X', '+', ],
    ];
    shouldComponentUpdate=()=>false;
    render(){
        const{ onKeyPress=mtCb } = this.props;
        return (<>
<div className="horizontal" style={styles('height:100%','width:100%')}>
    <div style={styles('padding:1px','height:100%','width:100%')}>
        {this.numpads.map((cols:any, idx:any)=>
        <div key={idx} className="row m-0" style={styles('width:100%','height:33.336%')}>
            {cols.map((i:any, idx:any)=>                                  
                <div key={idx} className="col-3" style={styles('padding:2.5px')} onClick={()=>onKeyPress(i)}>
                    <div className='btn-numpad' data-pad={i}></div>
                </div>
            )}
        </div>
        )}
    </div>
</div>
        </>);
    }
}
class BetsPanel extends React.Component<{hRemoveBet?:Function}>{
    static rgs = ((multiState:any)=>multiState(4,({bets,input}:any)=>({bets,input})));
    state:any = { bets:[], input:{} };
    render(){
        const{ bets, input } = this.state;
        const{ hRemoveBet=mtCb } = this.props;
        return(<>
<BetTableView>
    <div className="table-bets">
        <div className="panel">
            <div>
                <table style={styles('width:100%','border:0')}>
                    <thead>
                        <tr>
                            <td className="header">COMBINATION</td>
                            <td className="header">STRAIGHT</td>
                            <td className="header">RUMBLE</td>
                            <td width="50"></td>
                        </tr>
                    </thead>
                    {bets.length==0?
                        <tbody><tr><td colSpan={5} align="center">- Empty -</td></tr></tbody>
                        :<>
                        <tbody>
                            {bets.map((b:any, idx:any)=><>
                                <tr key={idx}>
                                    <td align="center" style={styles('font-weight:bold')}>{b.Combination}</td>
                                    <td align="center">{numberWithComma((b.Straight>0?b.Straight:'-'), 0)}</td>
                                    <td align="center">{numberWithComma(b.Rumble>0?b.Rumble:'-',0)}</td>
                                    <td align="center" onClick={()=>hRemoveBet(b)}>
                                        <div className="btn-sm_delete"></div> 
                                    </td>
                                </tr>
                            </>)}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td className="footer1">
                                    <div className="details">
                                        <small>Total :</small> 
                                        <div className="total"><b>{numberWithComma(input.TotalBet,0)}</b>&nbsp;=</div>
                                    </div>
                                </td>
                                
                                <td className="footer"><b>{numberWithComma((input.TotalBetStraight>0?input.TotalBetStraight:''),0)}</b></td>
                                <td className="footer"><b>{numberWithComma((input.TotalBetRumble>0?input.TotalBetRumble:''),0)}</b></td>
                            </tr>
                            <tr>
                                <td className="footer2" align="center" colSpan={5}>
                                    <small>Remaining Balance : </small> 
                                    <b className="total">{numberWithComma(input.RemainingBalance,0)}</b>
                                    <br/>
                                </td>
                            </tr>
                        </tfoot>
                    </>}
                </table>
            </div>
        </div>
    </div>
</BetTableView>
        </>);
    }
}

//styles
const IonSlides = styled(ionSlides)`
height: 100%;
width: 100%;
overflow: hidden;
>.swiper-wrapper{
    >ion-slide{
      &.hidden{ display:none; }
      overflow: hidden;
      >div{
          height: 100%;
          width: 100%;
          position: relative;
          text-align: left;
          overflow-x: auto;
      }
  }
}
&[pager='true'] > .swiper-pagination.swiper-pagination-bullets{
    display: none;
}
`;
const BetTableView = styled.div`
height: 100%;
width: 100%;
padding: 0px 5px;
overflow: hidden !important;
color:#fefed1;
>.table-bets{
    height: 100%;
    >*.panel{
        height: 100%;
        &::before{
            background-color: black;
            height: 100%;
            width: 100%;
            content: ' ';
            border-radius: 15px;
            position: absolute; 
            z-index: -1;
            top: 0;
            left: 0;
            opacity: 0.5;   
        }
        >*:first-child{
            position: relative; 
            margin: 5px 0px; /*padding: 7.5px;*/ 
            height: calc(100% - 10px); /*height: 100%;*/ 
            overflow-x: hidden;
            overflow-y: auto;
            table{
                >thead > tr > td.header{
                    font-weight: bold;
                    text-align: center;
                    &:not(:first-child){
                        padding: 0px 2.5px;
                    }
                } 
                >tfoot > tr > td{
                    &.footer{
                        border-top: 1px solid gray;
                        text-align: center;
                    }
                    &.footer1{
                        >*.details{
                            width:100%; 
                            position: relative;
                            >*.total{
                                position: absolute;
                                top: 0;
                                right: 0;
                            }
                        }
                    }
                    &.footer2{
                        color: #dc3545;
                        >*.total{
                            text-decoration: underline;
                        }
                    }
                }

            }
        }
    }
}
`;