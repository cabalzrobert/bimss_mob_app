import { IonContent, IonInput, IonItem, IonList, IonRefresher, IonRefresherContent, IonRippleEffect, IonSpinner } from '@ionic/react';
import React from 'react';
import Layout from '../../../../tools/components/+common/layout';
import NotFoundView from '../../../+app/component/common/not-found.view';
import FilteringView from '../../../+app/component/common/filtering.view';
import { mtCb, mtObj } from '../../../../tools/plugins/static';
import TextFit from '../../../../tools/components/+common/text-fit';
import { classNames, styles } from '../../../../tools/plugins/element';
import { timeout } from '../../../../tools/plugins/delay';
import UserPager from '../../user-pager';
import { rest } from '../../../+app/+service/rest.service';
import { toast } from '../../../../tools/plugins/toast';
import WebView from '../web.view';
import { base64HTML } from '../../../../tools/global';
import { app } from '../../../../tools/app';
import Recycler from '../../../../tools/components/+feature/recycler';
import RecyclerStorage from '../../../intro.page/recycler-storage';

const{ Object }:any = window;

export default class AnnouncementView extends React.Component {
    shouldComponentUpdate=()=>false;
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
    prop:any = {};
    list:any = [];
    filter:any = {};
    subs:any = {};
    willMount=(didMount=true)=>{
        const prop = (this.prop = { didMount:didMount, IsFiltering:true });
        const list = (this.list = []);
        const filter = (this.filter = {});
        this.setState({list,prop,filter});
    }
    didMount=()=>{
        if(!this.prop.didMount)return;
        this.hFilter();
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
    hItem=async(item:any)=>{
        this.pager.next(WebView, ({instance}:{instance:WebView})=>{
            instance?.setTitle('Announcement')
                .loadUrl('./assets/static/html.htm?data:text/html;base64='+encodeURIComponent(base64HTML(item.MessageBody))); 
        });
    }
    hFState=(ev:any, key:string)=>this.filter[key]=ev.detail.value;

    private performRequestDelay(filter:any, callback:Function=mtCb, delay:number=175){
        if(this.subs.t1) this.subs.t1.unsubscribe();
        this.prop.IsFiltering = !filter.IsFiltering;
        this.setState({prop:this.prop});
        this.subs.t1 = timeout(()=>this.performRequest(filter, callback), delay);
    }
    private performRequest(filter:any, callback:Function=mtCb){
        if(!this.subs) return;
        if(this.subs.s1) this.subs.s1.unsubscribe();
        this.subs.s1 = rest.post('post/announcement', filter).subscribe(async(res:any)=>{
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
        const{ list=[], } = this.state;
        return (<>
<Layout full>
    <Layout>
        <div className="row m-0 toolbar-panel">
            <div className="vertical arrow-back" onClick={this.hBackButton}></div>
            <div className="col-4 p-0 vertical toolbar-parent" onClick={this.hBackButton}>Game Profile</div>
            <div className="col-7 p-0 toolbar-title vertical"><div><TextFit text="Announcement"/></div></div>
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
                <div className="list wbg">
                {list?.map((item:any,idx:any)=>
                    <div className={classNames('list-item arrow',{'bg bg-black':!item.NextFilter})}>
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
<div className="row m-0 details ion-activatable" onClick={onClick}> 
    <IonRippleEffect /> 
    <div className="col-1"></div>
    <div className="col-9 vertical title" style={styles('height:50px')}>{item.Title}</div>
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