import React from 'react';
import styled from 'styled-components';
import { app } from '../../app';
import { timeout } from '../../plugins/delay';
import { mtCb } from '../../plugins/static';

const{ $, Array }:any = window;

export class ListView extends React.Component<{pages:any,}> {
    count:number = 16;
    componentWillMount=()=>{
        this.props.pages.forEach((page:any)=>this.add(page));
        this.count = this.props.pages.length;
    }
    public find(component:any){
        const found = this.components.find((info:any)=>info.type==component);
        if(!found) return null;
        const index = this.components.indexOf(found);
        return {
            info: found, index: index,
            render: this.rfIcv[index],
        };
    }
    components:[any] = ([] as any);
    add(component:any){
        if(!component)return;
        const found = this.components.find((info:any)=>info.type==component);
        if(!!found) return;
        const info:any = { type:component };
        info.element = toViewElement(info);
        this.components.push(info);
    }
    //
    shouldComponentUpdate=()=>false;
    swapper:HTMLDivElement = (null as any);
    rfIcv:any = {};
    render() {
        return (
<View ref={(ref:HTMLDivElement)=>this.swapper=ref}>
    {Array(this.count).fill().map((item:any, idx:any)=>
        <ItemContentView key={idx} bind={(ref)=>(this.rfIcv[idx]=ref)} 
            listView={this} content={this.components[idx]} index={idx}/>
    )}
</View>
        );
    };
}

class ItemContentView extends React.Component<{bind:(ref:any)=>void, listView:ListView, content:any, index:number}> {
    state:any = { info:{} };
    componentWillMount=()=>{
        const{ props } = this;
        const info = (this.info = (props.content||this.state.info));
        info.hidden = !(props.index==0);
        info.render = !!info.element;
        this.setState({info});
        props.bind(this);
    }
    private info:any = {};
    componentDidMount=()=>{
        if(this.info.render)
            return timeout(this.attach);
        $(this.current).detach();
    }
    timeout:any = null;
    attach=()=>{
        const{ listView:{swapper} } = this.props;
        swapper.append(this.current);
        this.timeout = timeout(()=>$(this.current).detach(),3750);
    }
    //
    shouldComponentUpdate=()=>false;
    current:HTMLDivElement = (null as any);
    render() {
        const{ info={} } = this.state;
        return (<>
<div ref={(ref:HTMLDivElement)=>this.current=ref} style={{height:'100%'}}>
    {info.element}
</div>
        </>);
    };
}

const toViewElement = (info:any)=>(<info.type ref={(ref:any)=>info.instance=ref} />);

export interface OnSwapFocus {
    onSwapFocus(data?:any):void;
}
export interface OnSwapLeave {
    onSwapLeave(data?:any):void;
}

export default class Recycler extends React.Component<{storage:ListView, from:any, bind?:(ref:any)=>void}>{
    static get List(){ return ListView; };
    prop:any = {};
    componentWillMount=()=>{
        const{ props, prop } = this;
        const{ storage, from, bind=mtCb  } = props;
        const found = storage.find(from);
        if(!found)return;
        prop.view = found;
        const{ info:{instance} } = found;
        if(!instance)return;
        const{ willMount=mtCb, rgsMount=mtCb } = instance;
        bind(instance);
        willMount();
        rgsMount({willMount:true});
    }
    componentDidMount=()=>{
        const{ props, prop } = this;
        if(!prop.view) return;
        const{ render:view, info:{instance} } = prop.view;
        if(!instance)return;
        const{ didMount=mtCb, rgsMount=mtCb } = instance;
        if(view.timeout)
            view.timeout.unsubscribe();
        $(this.current).append(view.current);
        didMount();
        rgsMount({didMount:true});
    }
    componentWillUnmount=()=>{
        if(!this.prop.view) return;
        const{ info:{instance} } = this.prop.view;
        if(!instance)return;
        const{ willUnmount=mtCb, rgsMount=mtCb } = instance;
        willUnmount();
        rgsMount({willUnmount:true});
    }
    shouldComponentUpdate=()=>false;
    current:HTMLDivElement = (null as any);
    render(){
        return(<>
<div ref={(ref:HTMLDivElement)=>this.current=ref} style={{height:'100%'}}></div>
        </>);
    }
}

export const rgsMount = ()=>{
    const callbacks:any = [];
    const component:any = (ref:any,callback:Function)=>{
        callback(ref);
        return (types:any)=>{
            if(!ref)return;
            Object.keys(types).forEach((key:any)=>{
                if(types[key]!==true) return;
                (ref[key]||mtCb)();
                (ref.rgsMount||mtCb)(types);
            });
        };
    };
    return (obj?:((ref:any)=>void)|{})=>{
        if(obj!=undefined && typeof(obj)!='function')
            return callbacks.forEach((callback:any)=>callback(obj));
        return (ref:any)=>(ref&&callbacks.push(component(ref,(obj||mtCb))));
    };
};

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
//position: relative;
overflow: hidden;
>div{
    height: 100%;
    width: 100%;
    position: relative;
    overflow: hidden;
    opacity:0;
    &[hidden], &.hidden{
        visibility:hidden;
        position:absolute;
        opacity:0;
        z-index:-1;
        top: 0px;
    }
}
visibility: hidden;
position: absolute;
top: 0;
z-index: -9999;
`;