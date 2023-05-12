import React from 'react';
import styled from 'styled-components';
import { app } from '../../app';
import { timeout } from '../../plugins/delay';
import { styles } from '../../plugins/element';
import { mtCb, mtObj } from '../../plugins/static';

const{ $, Array }:any = window;

export default class SwapPager extends React.Component<ContainerProps> {
    componentWillMount=()=>{
        this.defaultPage();
    }
    //
    private defaultPage(){
        this.show(this.props.default);
    }
    componentDidMount=()=>{
        this.nextToShow();
        timeout(()=>this.emitOnSwapLoad());
    }

    public currentComponent:any = {};
    public swaps:[any] = ([] as any);
    public show(component:any, callback:Function=mtCb){
        if(!component)return;
        const found = this.swaps.find((info:any)=>info.type==component);
        if(!!found) return this.showView(found, callback);
        const info:any = { type:component, callback:callback };
        info.element = toViewElement(info);
        this.swaps.push(info);
        return this.nextToShow();
    }
    //
    private nextToShow(){
        if(!this.swapper)return;
        const index = (this.swaps.length - 1);
        const view:ItemContentView = this.rfIcv[index];
        if(!view)return;
        return view.attach((info:any)=>this.showView(info,info.callback));
    }

    public showView(info:any, callback:Function=mtCb){
        if(this.currentComponent==info){
            (info.show||mtCb)();
            return callback(info);
        }
        (this.currentComponent.hide||mtCb)();
        this.triggerOnSwapLeave(this.currentComponent.instance);
        this.currentComponent = info;
        (info.show||mtCb)();
        callback(info);
        this.emitOnSwapChange();
        this.triggerOnSwapFocus(info.instance);
    }
    //
    shouldComponentUpdate=()=>false;
    swapper:HTMLDivElement = (null as any);
    rfIcv:any = {};
    render() {
        return (
<View ref={(ref:HTMLDivElement)=>this.swapper=ref} style={this.props.style}>
    {Array(16).fill().map((item:any, idx:any)=>
        <ItemContentView key={idx} bind={(ref:ItemContentView)=>(this.rfIcv[idx]=ref)} 
            pager={this} content={this.swaps[idx]} index={idx}/>
    )}
</View>
        );
    };
    //
    public performViewFocus(data:any=null){
        if(!this.currentComponent)return;
        this.triggerOnSwapFocus(this.currentComponent.instance, data);
    }
    public performViewLeave(){
        if(!this.currentComponent)return;
        this.triggerOnSwapLeave(this.currentComponent.instance);
    }
    //
    public emitOnSwapLoad(){
        (this.props.onSwapLoad&&this.props.onSwapLoad(this));
    }
    public emitOnSwapChange(){
        (this.props.onSwapChange&&this.props.onSwapChange());
    }
    //
    private triggerOnSwapFocus(handler:OnSwapFocus, data:any=null):any{
        if(!handler)return;
        return (handler.onSwapFocus||mtCb).apply(handler,[data]);
    }
    private triggerOnSwapLeave(handler:OnSwapLeave, data:any=null):any{
        if(!handler)return;
        return (handler.onSwapLeave||mtCb).apply(handler,[data]);
    }
}

class ItemContentView extends React.Component<{bind:(ref:any)=>void, pager:SwapPager, content:any, index:number}> {
    state:any = { info:{} };
    componentWillMount=()=>{
        const{ props } = this;
        const info = (this.info = (props.content||this.state.info));
        info.hidden = !(props.index==0);
        info.render = !!info.element;
        this.setState({info});
        props.bind(this);
    }
    componentDidMount=()=>{
        if(this.info.render)return;
        $(this.current).detach();
    }
    private info:any = {};
    attach(callback:Function=mtCb){
        const{ pager, index } = this.props;
        const info = pager.swaps[index];
        if(!info)return;
        const{ hidden, render } = (this.info||{});
        info.hidden = (hidden==undefined?true:hidden);
        info.render = true;
        info.show=()=>this.show(true);
        info.hide=()=>this.show(false);
        info.detach=()=>this.detach();
        if(!render) pager.swapper.append(this.current);
        this.setState({info:(this.info=info)},()=>callback(info));
    }
    show(isShow:boolean){
        if(!this.info.hidden == isShow)return;
        this.info.hidden = !isShow;
        //if(!isShow) $(this.target).detach();
        //else this.current.append(this.target);
        this.setState({info:this.info});
    }
    detach(){
        this.info.element = null;
        this.setState({info:this.info});
    }
    //
    current:HTMLDivElement = (null as any);
    target:HTMLDivElement = (null as any);
    render() {
        const{ info={} } = this.state;
        return (<>
<div ref={(ref:HTMLDivElement)=>this.current=ref} className={(!!info.hidden?'hidden':'swap')} >
    {info.element}
</div>
        </>);
    };
}

const toViewElement = (info:any)=>(<info.type ref={(ref:any)=>info.instance=ref} />);

interface ContainerProps {
    default?: object;
    onSwapLoad?: (swapper:SwapPager)=>void;
    onSwapChange?: Function;
    style?: React.CSSProperties|undefined;
}

export interface OnSwapFocus {
    onSwapFocus(data?:any):void;
}
export interface OnSwapLeave {
    onSwapLeave(data?:any):void;
}

//styles
const View = styled.div`
&.block::after{
    background-color:transparent;
    content:' ';
    height: 100%;
    width: 100%;
    display: block;
    position: absolute;
    top: 0;
    z-index: 9999;
}
height: 100%;
width: 100%;
position: relative;
overflow: hidden;
>div{
    height: 100%;
    width: 100%;
    position: relative;
    overflow: hidden;
    &[hidden], &.hidden{
        visibility:hidden;
        position:absolute;
        opacity:0;
        z-index:-1;
        top: 0px;
    }
}
`;