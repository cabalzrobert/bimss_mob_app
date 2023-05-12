import { IonContent, IonItem, IonList, IonRefresher, IonRefresherContent, IonRippleEffect, IonSpinner } from '@ionic/react';
import React from 'react';
import Layout from '../../../../tools/components/+common/layout';
import NotFoundView from '../../../+app/component/common/not-found.view';
import FilteringView from '../../../+app/component/common/filtering.view';
import { mtCb } from '../../../../tools/plugins/static';
import TextFit from '../../../../tools/components/+common/text-fit';
import { classNames, styles } from '../../../../tools/plugins/element';
import { timeout } from '../../../../tools/plugins/delay';
import UserPager from '../../user-pager';
import { rest } from '../../../+app/+service/rest.service';
import { toast } from '../../../../tools/plugins/toast';
import Recycler from '../../../../tools/components/+feature/recycler';
import RecyclerStorage from '../../../intro.page/recycler-storage';

const{ Object }:any = window;

export default class ActivityLogsView extends React.Component {
    shouldComponentUpdate=()=>false;
    holder:ViewHolder = (null as any);
    render(){
        return (<>
<Recycler storage={RecyclerStorage.instance} from={ViewHolder}/>
        </>);
    }
}

export class ViewHolder extends React.Component {
    state:any = { };
    get pager(){ return UserPager.instance.pager; }
    componentWillMount=()=>this.willMount(false);
    list:any = [];
    prop:any = {};
    filter:any = {};
    subs:any = {};
    willMount=(didMount=true)=>{
        const prop = (this.prop = { didMount:didMount, IsFiltering:true });
        this.setState({prop});
    }
    didMount=()=>{
        if(!this.prop.didMount)return;
        this.performRequestDelay({ IsReset:true }, mtCb, 1275);
    }
    willUnmount=()=>{
        Object.values(this.subs).map((m:any)=>m.unsubscribe());
    }

    hBackButton=()=>{
        this.pager.back();
    }
    hFilter=()=>{
        this.prop.IsFiltering = true;
        this.performRequestDelay({ IsReset:true }, mtCb, 1275);
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

    private performRequestDelay(filter:any, callback:Function=mtCb, delay:number=175){
        if(this.subs.t1) this.subs.t1.unsubscribe();
        this.prop.IsFiltering = !filter.IsFiltering;
        this.setState({prop:this.prop});
        this.subs.t1 = timeout(()=>this.performRequest(filter, callback), delay);
    }
    private performRequest(filter:any, callback:Function=mtCb){
        if(!this.subs) return;
        if(this.subs.s1) this.subs.s1.unsubscribe();
        this.subs.s1 = rest.post('activity/logs/login', filter).subscribe(async(res:any)=>{
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
            this.prop.IsFiltering = false;
            this.prop.IsEmpty = (this.list.length<1);
            if(callback!=null) callback(err);
            this.setState({prop:this.prop});
        });
    }
    private listDetails(item:any){
        return item;
    }

    render(){
        const{ filter={}, prop={} } = this.state;
        const{ list=[] } = this.state;
        return (<>
<Layout full>
    <Layout>
        <div className="row m-0 toolbar-panel">
            <div className="vertical arrow-back" onClick={this.hBackButton}></div>
            <div className="col-4 p-0 vertical toolbar-parent" onClick={this.hBackButton}>Home</div>
            <div className="col-7 p-0 toolbar-title vertical"><div><TextFit text="Messages"/></div></div>
        </div>
    </Layout>
    <Layout auto>
        <NotFoundView visible={prop.IsEmpty} />
        <FilteringView visible={prop.IsFiltering} />
        <IonContent scrollY>
            <IonRefresher slot="fixed" onIonRefresh={this.hPullRefresh}>
                <IonRefresherContent />
            </IonRefresher>
            <div style={styles('color:#fefed1;font-size:21px;padding:0px 10px;font-weight:bold')}>Login Logs</div>
            <IonList lines='none' style={styles('padding-top:0px')}>
                <div className="list" style={styles('padding:0px 5px')}> {/*wbg*/}
                {list?.map((item:any,idx:any)=>
                    <div className={classNames('list-item')} style={styles('min-height:35px;')}> {/*,{'bg bg-black':!item.NextFilter}*/}
                        {!item.NextFilter?<Item item={item} />:<MoreItem item={item} onClick={()=>this.hLoadMore(item)} />} {/*onClick={()=>this.hItem(item)} */}
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
    
const Item:React.FC<{item:any, onClick?:React.MouseEventHandler}> = ({item, onClick})=>{
    if(!!item.NextFilter) return null;
    return (<>
<div className="row m-0 details ion-activatable" style={styles('padding:0px;margin:5px!important')} onClick={onClick}> 
    <IonRippleEffect /> 
    <div style={styles('position:absolute;top:0;width:100%;height:100%;background-color:rgba(0, 0, 0, .25);border-radius:15px')} ></div>
    <div className="col-12 row m-0" style={styles('position:relative;width:100%')}> {/*<!--height: 60px;-->*/}
        <div className="vertical" style={styles('color:whitesmoke;position:relative')}>
            <div style={styles('font-size:17.5px;margin-top:-4px;font-weight:bold')}>{item.DeviceName}&nbsp;</div>
            <div style={styles('font-weight:bold;font-size:13px')}>{item.DateDisplay}&nbsp;</div>
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