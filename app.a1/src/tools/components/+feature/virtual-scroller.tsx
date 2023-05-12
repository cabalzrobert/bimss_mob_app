import { IonContent as ionContent, IonRefresher, IonRefresherContent } from '@ionic/react';
import React from 'react';
import styled from 'styled-components';
import { interval, breaker, timeout } from '../../plugins/delay';
import { multiState } from '../../plugins/react';
import { subscribe } from '../../plugins/static';

const { $ }:any = window;

export default class VirtualScroller extends React.Component<{
    get:(offset:any, limit:any)=>any[], itemCount:()=>number, itemHeight:number
    ,component?:any, instance?:any, view?:(item:any,index:number,handle:()=>void)=>any
    ,className?: string, style?:React.CSSProperties}>{
    subs:any = {};
    componentDidMount=async()=>{
        this.subs.sub = breaker(async(handler)=>{
            if(!this.elScroll)return;
            handler();
            this.initEvents();
        },250,true);
        this.whenScolling(false);
    }
    componentWillUnmount=()=>{
        Object.values(this.subs).map((m:any)=>m.unsubscribe());
    }
    componentWillReceiveProps=(oprops:any,nprops:any)=>{
        this.multiState({notif3:true});
        if(!this.prop.isReady)return;
        if(this.subs.recv)
            this.subs.recv.unsubscribe();
        this.subs.recv = timeout(()=>this.whenScolling(false),15);
    }
    initEvents=()=>{
        this.prop.isReady = true;
        this.subs.scroll = subscribe(()=>{
            const{ prop, elScroll } = this;
            var startY:any, endY:any, lastEndY:any, difference:any, threshold:any;
            var performScroll:boolean, checkOnce:boolean;
            const cbScroll = (ev:any)=>{
                if(this.subs.resizing)
                    this.subs.resizing.unsubscribe();
                if(this.subs.scrolling)
                    this.subs.scrolling.unsubscribe();
                prop.disabledResized = true;
                this.subs.scrolling = timeout(()=>prop.disabledResized=false,1000);
                this.whenScolling();
            };
            const cbTouchstart = (ev:any)=>{
                (function({style}){
                    style.setProperty('scroll-behavior', 'inherit');
                    style.setProperty('--overflow', 'hidden');
                })(elScroll);
                if (ev.touches.length !== 1)
                    return;
                startY = lastEndY = ev.touches[0].clientY;
                performScroll = true;
                checkOnce = false;
            };
            const cbTouchmove = (ev:any)=>{
                if (ev.touches.length !== 1)
                    return;
                endY = ev.touches[0].clientY;
                if(!checkOnce){
                    checkOnce = true;
                    if(elScroll.scrollTop<1){
                        if(((startY - endY) + elScroll.scrollTop)<0)
                            performScroll = false;
                    }
                }
                if(!performScroll) return;
                difference = lastEndY - endY;
                threshold = Math.abs(difference);
                lastEndY = endY;
                //
                const scrollTop = elScroll.scrollTop + difference;
                elScroll.scrollTop = (scrollTop>0?scrollTop:0);
            };
            const cbTouchend = (ev:any)=>{
                if(!performScroll || threshold<5) return;
                const scrollTop = elScroll.scrollTop + (difference * Math.abs((difference/elScroll.offsetHeight) * 100)); 
                (function({style}){
                    style.setProperty('scroll-behavior', 'smooth');
                })(elScroll);
                elScroll.scrollTop = scrollTop;
            };
            elScroll.addEventListener('scroll',cbScroll,{passive:true});
            elScroll.addEventListener('touchstart',cbTouchstart,{passive:true});
            elScroll.addEventListener('touchmove',cbTouchmove,{passive:true});
            elScroll.addEventListener('touchend',cbTouchend,{passive:true});
            return ()=>{
                elScroll.removeEventListener('scroll',cbScroll);
                elScroll.removeEventListener('touchstart',cbTouchstart);
                elScroll.removeEventListener('touchmove',cbTouchmove);
                elScroll.removeEventListener('touchend',cbTouchend);
            };
        });
        this.subs.resize = subscribe(()=>{
            const{ prop, elScroll } = this;
            const callback = ()=>{
                (function({style}){
                    style.setProperty('scroll-behavior', 'inherit');
                    style.setProperty('--overflow', 'inherit');
                })(elScroll);
                if(prop.disabledResized)return;
                if(this.subs.resizing)
                    this.subs.resizing.unsubscribe();
                this.subs.resizing = timeout(()=>this.whenScolling(false),125); 
            };
            window.addEventListener('resize', callback);
            return ()=>window.removeEventListener('resize', callback);
        });
        this.whenScolling();
    }
    prop:any = { scrollSpeed:1, bufferedItems:0, topPaddingHeight:0, bottomPaddingHeight:0, extraItem:8 };
    whenScolling=(checkScroll:boolean=true)=>{ //
        const { elScroll, elContent, prop } = this;
        const{ clientHeight, scrollTop } = (elScroll||{ clientHeight:0, scrollTop:0 });
        const baseScrollTop = scrollTop/prop.scrollSpeed;
        if(prop.scrollSpeed>1){
            (function({current:{style}}){
                if(!style)return;
                style.setProperty('--vs-scroll-top', (scrollTop-baseScrollTop) + 'px');
            })(elContent);
        }
        this.multiState({notif1:true, clientHeight:clientHeight, scrollTop:baseScrollTop, checkScroll:checkScroll});
    }
    //
    els:any = {};
    multiState = multiState();
    shouldComponentUpdate=()=>false;
    elContent:any = React.createRef();
    get elScroll():HTMLDivElement{ 
        if(this.els.elScroll)
            return this.els.elScroll;
        const{ current:{shadowRoot} } = this.elContent;
        if(!shadowRoot) return (null as any);
        return (this.els.elScroll=shadowRoot.querySelector('main')); 
    }
    elDiv:HTMLDivElement = (null as any);
    render() {
        const{ multiState } = this;
        return (<>
<IonContent scrollY ref={this.elContent}>
    <RefresherView instance={this} ref={RefresherView.rgs(multiState)} />
    <BaseScrollPanel ref={(ref:HTMLDivElement)=>this.elDiv=ref}>
        <RenderScrollerView instance={this} ref={RenderScrollerView.rgs(multiState)} />
    </BaseScrollPanel>
</IonContent>
        </>);
    };
}

class RenderScrollerView extends React.Component<{instance:VirtualScroller}>{
    static rgs = ((multiState:any)=>multiState(1,({notif1, clientHeight, scrollTop, checkScroll}:any)=>
        ({notif1, clientHeight, scrollTop, checkScroll})));
    state = { notif1:false, clientHeight:0, scrollTop:0, checkScroll:false };
    whenScolling=(nstate:any)=>{
        const{ clientHeight, scrollTop, checkScroll} = nstate;
        const { elDiv, props:{instance:{prop,props:{itemCount,itemHeight,get}}} } = this;
        const itemLength = (!itemCount?0:itemCount());
        const{ extraItem } = prop;
        const extraDisplayLength = Math.floor(extraItem / 2);
        const displayLength = Math.floor(clientHeight / itemHeight);
        const bufferedItems = (displayLength + extraItem);
        if(prop.bufferedItems!=bufferedItems)
            this.multiState({notif2:true,count:bufferedItems});
        prop.bufferedItems = bufferedItems;
        const endIndex = (itemLength - bufferedItems);
        const itemHeightCheck = (itemHeight * (Math.floor(extraDisplayLength / 2)));
        var startIndex = (Math.floor(scrollTop / itemHeight) - extraDisplayLength);
        if(startIndex<0) startIndex = 0;
        else if(endIndex>0){
            if(endIndex<startIndex)
                startIndex = endIndex;
        }
        if(checkScroll){
            if(prop.outerScroll!==undefined&&prop.innerScroll!==undefined){
                if(prop.outerScroll<scrollTop && scrollTop<=prop.innerScroll){
                    return;
                }
            }
        }
        const data = get(startIndex, bufferedItems);
        prop.dataLength = data.length;
        //
        if(prop.dataLength<displayLength){
            prop.topPaddingHeight = 0;
            prop.bottomPaddingHeight = 0;
            prop.outerScroll = undefined;
            prop.innerScroll = undefined;
        }else{
            prop.topPaddingHeight = Math.max((startIndex) * itemHeight, 0);
            prop.bottomPaddingHeight = Math.max(((itemLength * itemHeight) - (prop.dataLength * itemHeight) - prop.topPaddingHeight), 0);
            prop.outerScroll = scrollTop - itemHeightCheck;
            prop.innerScroll = scrollTop + itemHeightCheck;
        }
        //
        (function({style}){
            if(!style)return;
            style.paddingTop = (prop.topPaddingHeight) + 'px';
            style.paddingBottom = (prop.bottomPaddingHeight) + 'px';
        })(elDiv);
        this.multiState({data});
    }
    //
    shouldComponentUpdate=(props:any,nstate:any)=>{
        this.whenScolling(nstate);
        return false;
    }
    els:any = {};
    multiState = multiState();
    elDiv:HTMLDivElement = (null as any);
    render() {
        const{ multiState, props:{instance} } = this;
        const{ props:{className,style} } = instance;
        return (<>
<div ref={(ref:HTMLDivElement)=>this.elDiv=ref} className={className} style={style}>
    <RenderListView panel={this} instance={instance} ref={RenderListView.rgs(multiState)}/>
</div>
        </>);
    };
}
class RenderListView extends React.Component<{panel:RenderScrollerView,instance:VirtualScroller}>{
    static rgs = ((multiState:any)=>multiState(2,({notif2,data,count}:any)=>({notif2,data,count})));
    state = { notif2:false, data:[], count:0,};
    componentDidUpdate=()=>{
        const{ state } = this;
        state.notif2 = false;
    }
    shouldComponentUpdate=(props:any,nstate:any)=>{
        const{ state, prop } = this;
        state.data = (nstate.data||[]);
        this.componentUpdate();
        return (nstate.notif2!=state.notif2);
    }
    prop:any = { lastCount:0 }
    componentUpdate=()=>{
        const{ rfs, prop } = this;
        const{ data=[], count } = this.state;
        const{ panel:{elDiv} } = this.props;
        const baseCount=(base:any)=>(((base<0?count:0)+base)%count);
        if(data.length!=prop.lastCount){
            prop.lastCount = data.length;
            for(var index=0;index<count;index++){
                const {instance,current}:RenderItemView = (rfs[index]||{});
                if(!instance)continue;
                elDiv.append(current);
                const item = ((index<count?data[index]:null)||{item:null,index:null});
                instance.setState(item);
            }
            return;
        }
        var items:any = [];
        var append = false;
        for(var i=0;i<data.length;i++){
            const item:any = (data[i]||{});
            if(item.index===undefined)
                continue;
            const baseIndex = baseCount(item.index);
            const context:RenderItemView = rfs[baseIndex];
            if(!context) continue;
            const{ instance } = context;
            const state  = (instance.state||{});
            if((state.index===undefined)||item.index==state.index){
                if(!append) append = true;
                continue;
            }
            const detls = { context:context, item:item, append:append, };
            if(append) items.push(detls);
            else items = [detls, ...items];
        }
        if(items.length<1)return;
        items.forEach(({context:{instance, current},item,append}:any)=>{
            if(append) elDiv.append(current);
            else elDiv.prepend(current);
            instance.setState(item);
        });
        items.length = 0;
    }
    //
    rfs:any = {};
    render() {
        const{ rfs } = this;
        const{ props:{component,instance,view} } = this.props.instance;
        const{ count, data } = this.state;
        const tempList = Array(count).fill('');
        const Component = (component||ItemHolder);
        return (<>
{tempList.map(({},index)=><>
    <RenderItemView ref={(ref:any)=>rfs[index]=ref} instance={instance} Component={Component} view={view} data={(data[index]||{})}/>
</>)}
        </>);
    };
}

class RenderItemView extends React.Component<{instance:any,Component:any,view:any,data:any}>{
    state:any = null;
    shouldComponentUpdate=()=>false;
    current:any;
    instance:any;
    render(){
        const{ props:{instance,Component,view,data} } = this;
        return(<>
<ItemPanel ref={(ref:any)=>this.current=ref}>
    <Component ref={(ref:any)=>this.instance=ref} instance={instance} data={data} view={view} />
</ItemPanel>
        </>);
    }
}

class ItemHolder extends React.Component<{view:(item:any,index:number,handle:()=>void)=>any, data:any}>{
    state:any = null;
    updateItem=()=>this.setState(this.state);
    render(){
        const{ props:{view,data}, state } = this;
        const{ item, index } = (state||data||{});
        if(!view||!item) return null;
        return view(item,index,this.updateItem);
    }
}
//
class RefresherView extends React.Component<{instance:VirtualScroller}>{
    static rgs = ((multiState:any)=>multiState(3,({notif3}:any)=>({notif3})));
    state = {notif3:false};
    render() {
        const{ props:{children} } = this.props.instance;
        return children;
    };
}

//styles
const IonContent = styled(ionContent)`
--vs-scroll-top: 0px;
`;
const BaseScrollPanel = styled.div`
position:relative;
&>*:first-child{
    width: 100%;
    height: 100%;
    transform: translateY(var(--vs-scroll-top));
}
`;
const ItemPanel = styled.div`
width: 100%;
`;