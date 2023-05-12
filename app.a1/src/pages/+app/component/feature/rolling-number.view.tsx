import React from 'react';
import styled from 'styled-components';
import { timeout } from '../../../../tools/plugins/delay';
//
const{ Object, $, addEventListener, removeEventListener }:any = window;

interface ContainerProps {
    ball?: number;
    max?: number;
    active?: boolean;
    animate?:boolean;
}

export default class RollingNumberView extends React.Component<ContainerProps> {
    state:any = {};
    componentWillMount=()=>{
        this.defNumber = (this.props.animate?0:this.props.ball);
    }

    defNumber?:number = 0;
    $vyw:any = {};
    subs:any = {}
    componentDidMount=()=>{
        addEventListener('resize', this.updateDimensions);
        this.$vyw.c1 = this.$vyw.p1.closest('.rolling-number-container');
        this.componentWillReceiveProps(this.props);
        this.$vyw.v1.css({top:'0'}).attr('data-ball', this.defNumber);
        this.$vyw.v2.css({top:'100%'});
        this.resizePanel();
    }
    componentWillUnmount(){
        Object.values(this.subs).map((m:any)=>m.unsubscribe());
        removeEventListener('resize', this.updateDimensions);
    }
    private updateDimensions=()=>{
        this.resizePanel();
    }
    private prop:any = {};
    private isAnimating:boolean = false;
    private speed:number = 55; //55, 75
    private animate=()=>{ 
        this.isAnimating = true;
        var ball = +(this.$vyw.v1.attr('data-ball')||0);
        if(ball==this.prop.ball) 
            return (this.isAnimating=false);
        var max = (this.prop.max||0);
        var nextBall = (ball + 1)%(max+1);

        this.$vyw.v2.attr('data-ball', nextBall).animate({top:'0'}, this.speed); 
        this.$vyw.v1.animate({top:'-100%'}, this.speed, ()=>{
            this.$vyw.v1.css({top:'100%'});
            this.swap();
            if(ball==this.prop.ball) 
                return (this.isAnimating=false);
            this.animate();
        });
    }
    private swap=()=>{
        var v = this.$vyw.v1;
        this.$vyw.v1 = this.$vyw.v2;
        this.$vyw.v2 = v;
    }
    private resizePanel=()=>{
        if(!this.$vyw.c1||this.$vyw.c1.length==0)return;
        var childrenLength = this.$vyw.c1.children().length;
        var innerHeight = this.$vyw.c1.innerHeight();
        var innerWidth = this.$vyw.c1.innerWidth(); 
        var minSize = innerHeight, maxSize = innerWidth;
        if(minSize>maxSize){
            maxSize = innerHeight;
            minSize = innerWidth;
        }
        var totalMinSize = minSize*childrenLength;
        var colSize = minSize;
        if(totalMinSize>maxSize){
            var percentage = maxSize/(minSize==0?1:minSize);
            colSize = (minSize/childrenLength) * percentage;
        }
        this.$vyw.p1.css({'height':(colSize+'px'), 'width':(colSize+'px')});
    }

    componentWillReceiveProps(props:any){  
        Object.rcopy(this.prop, props);
        if(this.prop.animate){
            this.$vyw.p1.removeClass('single');
            if(props.active) this.$vyw.p1.addClass('active');
            else this.$vyw.p1.removeClass('active');
        }
        if(!this.prop.animate){
            this.$vyw.p1.addClass('single');
            return this.$vyw.v1.attr('data-ball', this.prop.ball);
        }
        if(this.isAnimating)return;
        this.animate();
    }
    //
    renderPanel=()=>{
        if(this.subs.el1) this.subs.el1.unsubscribe();
        this.subs.el1 = timeout(()=>this.resizePanel());
    }
    shouldComponentUpdate=()=>false;
    render(){
        return (<>
<Panel ref={(ref:any)=>(this.$vyw.p1=$(ref), this.renderPanel())}>
    <div className="contrainer">
        <div className="img-ball ball-hidden" data-ball="0"></div>
        <div ref={(ref:any)=>this.$vyw.v1=$(ref)} className="img-ball ball-absolute" data-ball="0"></div>
        <div ref={(ref:any)=>this.$vyw.v2=$(ref)} className="img-ball ball-absolute" data-ball="0"></div>
    </div>
</Panel>
        </>);
    }
}

//styles
const Panel = styled.div`
position:relative;
height: 100%; 
width: 100%; 
border-radius: 50%; 
overflow: hidden;
&.active{
    border: 2px solid white; /*2px solid deepskyblue; maroon;*/
}
&.single{
    >.contrainer{
        >.img-ball:not(:nth-child(2)){
            display:none;
        }
    }
}
>.contrainer{
    height: 100%; 
    width: 100%; 
    > *{
        height: 100%;
        width: 100%;
    }
    >.ball-hidden{
        visibility: hidden;
        opacity: 0;
    }
    >.ball-absolute{
        position: absolute;
        top: 0;
        left: 0;
    }
}
`;