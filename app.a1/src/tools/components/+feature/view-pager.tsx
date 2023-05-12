import { IonSlide as ionSlide, IonSlides as ionSlides } from '@ionic/react';
import React from 'react';
import styled from 'styled-components';
import { app } from '../../app';
import { interval, timeout } from '../../plugins/delay';
import { classNames, styles } from '../../plugins/element';
import { mtArr, mtCb, mtObj } from '../../plugins/static';

const{ $, Array }:any = window;

export default class ViewPager extends React.Component<ContainerProps> {
    elSlides:any = React.createRef();
    componentWillMount=()=>{
        this.defaultPage();
    }
    private defaultPage(){
        this.next(this.props.default);
    }
    prop:any = {};
    subs:any = {};
    componentDidMount=()=>{
        console.log(['ViewPager','componentDidMount'])
        this.nextToSlide();
    }
    componentWillUnmount=()=>{
        console.log(['ViewPager','componentWillUnmount'])
        Object.values(this.subs).map((m:any)=>m.unsubscribe());
    }
    private settings = { speed: 415, };
    public slides:[any] = ([] as any);
    private previousComponent:any = {};
    public currentComponent:any = {};
    private backCount:number = 0;
    private idCounter:number = +(new Date());
    public next(component:any, callback:Function=mtCb, animated:boolean=true){
        console.log('view-pager.tsx next');
        //Comment on December 20, 2022
        // if(!component)return;
        // const found = (this.slides.find((info:any)=>info.type==component));
        // if(found) return;
        const info:any = { id:(++this.idCounter), type:component, callback:callback, animated:animated };
        info.element = toViewElement(info);
        (this.currentComponent.disable||mtCb)();
        this.previousComponent = (this.currentComponent||mtObj);
        this.slides.push(this.currentComponent = info);
        info.index = (this.slides.length - 1);
        return this.nextToSlide();
    }
    //
    private nextToSlide():any{
        if(!this.swiper)return;
        const index = (this.slides.length - 1);
        const view:SlideContentView = this.rfScv[index];
        if(!view)return;
        this.triggerOnPagerLeave(this.previousComponent.instance);
        return view.attach((info:any)=>this.nextSlide(info));
    }
    //
    public back(data:any=null, callback:Function=mtCb, animated:boolean=true):boolean{
        const length = (this.slides.length-this.backCount); 
        if(length<2) return false;
        if(!this.canPerformBack()) return false;
        const info:any = this.currentComponent, activeIndex = (length-1);
        this.currentComponent = (this.slides[activeIndex-1]||mtObj);
        (this.currentComponent.enable||mtCb)();
        this.backCount++;
        timeout(async()=>{
            await this.prevSlide(animated);
            this.triggerOnPagerFocus(this.currentComponent.instance, data);
            timeout(()=>{
                this.backCount--;
                this.slides.splice(activeIndex, 1);
                if(this.slides.length<1 || !this.currentComponent)
                    this.defaultPage();
                (info.detach||mtCb)();
            }, this.settings.speed);
            return (callback&&callback(this.currentComponent));
        });
        return true;
    }
    
    private canPerformBack():boolean{
        var info:any = this.currentComponent;
        var performBack = this.triggerOnPagerBack(info.instance);
        if(typeof(performBack)!='boolean')
            performBack = true;
        return performBack;
    }
    
    public backTo(obj:any, isJump:boolean=false, callback:Function=mtCb, animated:boolean=true){
        if(this.prop.isPerforming)return;
        this.prop.isPerforming = true;
        const tCallback = ()=>{
            (callback&&callback(this.currentComponent));
            timeout(()=>this.prop.isPerforming=false,this.settings.speed*0.75);
        };
        if(Number.isInteger(obj))
            return this.backToCounter(+obj, isJump, tCallback, animated);
        return this.backToComponent(obj, isJump, tCallback, animated);
    }
    
    private backToCounter(counter:number, isJump:boolean, callback:Function=mtCb, animated:boolean=true){
        if(isJump) return this.backToJumper(this.slides.length-counter, callback);
        return this.performBackCounter(counter, callback, animated);
    }
    private backToComponent(component:any, isJump:boolean, callback:Function=mtCb, animated:boolean=true){
        if(this.currentComponent.type==component)
            return (callback&&callback());
        if(!isJump) return this.performBackClass(component, callback, animated);
        var index = this.findIndex(component);
        return this.backToJumper(index+1, callback, animated);
    }
    private findIndex(component:any){
        for(var i=this.slides.length-1;i>=0;i--){
            var slide = this.slides[i];
            if(slide.type==component)
                return i;
        }
        return -1;
    }
    private performBackClass(component:any, callback:Function=mtCb, animated:boolean=true){
        var attempt = false;
        const tCallback = ()=>{
            if(attempt){
                if(this.currentComponent.type==component)
                    return callback();
                if(this.slides.length<1){
                    this.defaultPage();
                    return callback();
                }
            }
            this.back(null,()=>timeout(tCallback,this.settings.speed*1.15), animated);
            attempt = true;
        };
        return tCallback();
    }
    private performBackCounter(counter:number, callback:Function=mtCb, animated:boolean=true){
        var attempt = false;
        const tCallback = ()=>{
            if(attempt){
                if(counter<1) 
                    return callback();
                if(this.slides.length<1){
                    this.defaultPage();
                    return callback();
                }
            }
            this.back(null,()=>timeout(tCallback,this.settings.speed*1.15), animated);
            attempt = false; counter--;
        };
        return tCallback();
    }

    private backToJumper(index:number, callback:Function=mtCb, animated:boolean=true){
        if(index<0) return this.defaultPage();
        var length = (this.slides.length-this.backCount);
        var trimIndex = length - (index + 1); 
        if(trimIndex<0 || length<1)return;
        if(trimIndex!=0){
            var lenIndex = (index+(trimIndex-1));
            var slides = this.slides.filter((f:any,idx:number)=>index<=idx && idx<=lenIndex);
            slides.forEach(slide=>(slide.detach||mtCb)());
            this.slides.splice(index, trimIndex);
        }
        return timeout(()=>{
            this.back(null, callback, animated);
            timeout(()=>this.prop.isPerforming=false,this.settings.speed);
        });
    }

    public async nextSlide(info:any){
        if(!await this.tryToNextSlide(info))return; 
        (info.callback&&info.callback(info));
        this.emitOnPageChange();
        this.triggerOnPagerInit(info.instance);
        this.triggerOnPagerFocus(info.instance);
    }
    private async tryToNextSlide(info:any){
        if(!this.swiper) return false;
        const index = info.index;//this.slides.length-1;
        return (new Promise(async(resolve)=>{
            await(info.animated?this.swiper.slideNext():this.swiper.slideNext(0));
            var counter = 0;
            const tCallback = async()=> {
                if(counter>10) return resolve(!!this.swiper);
                if(!this.swiper) return resolve(!!this.swiper);
                const active = await this.swiper.getActiveIndex();
                if(active>=index) return resolve(!!this.swiper);
                await(info.animated?this.swiper.slideNext():this.swiper.slideNext(0));
                timeout(tCallback);
                counter++;
            };
            return tCallback();
        })); 
    }
    private async prevSlide(animated:boolean){
        if(!this.swiper)return;
        await(animated?this.swiper.slidePrev():this.swiper.slidePrev(0));
        this.emitOnPageChange();
        this.emitOnPageBack();
    }
    //
    shouldComponentUpdate=()=>false;
    get swiper(){ return this.elSlides?.current; }
    rfScv:any = {};
    render() {
        return (<>
<IonSlides ref={this.elSlides} pager={true} 
    options={{ speed:this.settings.speed, zoom:false, onlyExternal: false, paginationClickable:false, allowTouchMove: false }}>
    {Array(16).fill().map((info:any, idx:any)=>
        <SlideContentView key={idx} bind={(ref)=>this.rfScv[idx]=ref} 
            pager={this} content={this.slides[idx]} index={idx}/>
    )}
</IonSlides>
        </>); 
    };
    //
    public performPagerFocus(){
        this.triggerOnPagerFocus(this.currentComponent.instance);
    }
    //
    private emitOnPageChange(){
        (this.props.onPageChange&&this.props.onPageChange());
    }
    private emitOnPageBack(){
        (this.props.onPageBack&&this.props.onPageBack());
    }
    //
    private triggerOnPagerBack(handler:OnPagerBack):any{
        if(!handler)return;
        return (handler.onPagerBack||mtCb).apply(handler,mtArr);
    }
    private triggerOnPagerLeave(handler:OnPagerLeave):any{
        if(!handler)return;
        return (handler.onPagerLeave||mtCb).apply(handler,mtArr);
    }
    private triggerOnPagerInit(handler:OnPagerInit):any{
        if(!handler)return;
        return (handler.onPagerInit||mtCb).apply(handler,mtArr);
    }
    private triggerOnPagerFocus(handler:OnPagerFocus, data:any=null):any{
        if(!handler)return;
        return (handler.onPagerFocus||mtCb).apply(handler,[data]);
    }
}

class SlideContentView extends React.Component<{bind:(ref:any)=>void, pager:ViewPager, content:any, index:number}> {
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
    };
    private info:any = {};
    attach(callback:Function=mtCb){
        const{ pager, index } = this.props;
        const info = pager.slides[index];
        if(!info)return;
        const{ hidden, render } = (this.info||{});
        info.hidden = (hidden==undefined?true:hidden);
        info.render = true;
        info.detach=()=>this.detach();
        info.disable=()=>this.disable(true);
        info.enable=()=>this.disable(false);
        if(!render)$(pager.swiper).find('>div.swiper-wrapper').append(this.current);
        this.setState({info:(this.info=info)},()=>callback(info));
    }
    disable(disabled:boolean){
        if(this.info.disabled == disabled)return;
        this.info.disabled = disabled;
        this.setState({info:this.info});
    }
    detach(){
        this.info.element = null;
        this.setState({info:this.info});
    }
    //
    current:HTMLDivElement = (null as any);
    render() {
        const{ info={} } = this.state;
        return (<>
<IonSlide ref={(ref:HTMLDivElement)=>this.current=ref} className={classNames('md swiper-slide hydrated swiper-zoom-container',(!info.element?'hidden':'ion-slide'),(!info.disabled?'':'disabled'))}>      
    <div>{info.element}</div>
</IonSlide>
        </>);
    };
}

const toViewElement = (info:any)=>(<info.type ref={(ref:any)=>info.instance=ref} />);

interface ContainerProps {
    default?: object;
    onPageChange?: Function;
    onPageBack?: Function;
}

export interface OnPagerBack {
    onPagerBack():boolean;
}

export interface OnPagerInit {
    onPagerInit():void;
}
export interface OnPagerFocus {
    onPagerFocus(data?:any):void;
}
export interface OnPagerLeave {
    onPagerLeave(data?:any):void;
}

//styles
const IonSlides = styled(ionSlides)`
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
overflow: hidden;
>.swiper-wrapper{
    >ion-slide, >div{
      &.hidden{ display:none; }
      overflow: hidden;
      font-size: inherit;
      >div{
          height: 100%;
          width: 100%;
          position: relative;
          text-align: left;
          /*overflow-x: auto;*/
      }
  }
}
& > .swiper-pagination.swiper-pagination-bullets{
    display: none;
}
`;
const IonSlide = styled.div`
font-size: inherit;
position:relative;
&.disabled{
    >::after{
        display: block;
        content: ' ';
        position: absolute;
        top: 0;
        width: 100%;
        height: 100%;
        z-index: 9999;
    }
}
`;