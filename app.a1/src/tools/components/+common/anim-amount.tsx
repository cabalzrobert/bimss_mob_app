import React from 'react';
import { numberWithComma, comma } from '../../global';

const{ Object, $, addEventListener, removeEventListener }:any = window;

interface ContainerProps {
    number: number;
    comma?: number;
}

export default class AnimAmount extends React.Component<ContainerProps> {
    $vyw:any = {};
    number:number = 0;
    comma:number = 0;
    result:any = 0;
    isReady:boolean = false;
    isChanged:boolean = false;
    componentWillMount=()=>{
        this.number = (this.props.number||0);
        this.comma = comma(this.props.comma,2);
    }
    componentDidMount(){
        this.$vyw.v1.text(numberWithComma(this.result,this.comma))
        this.performAnim();
        this.isReady = true;
    }
    componentWillReceiveProps(props:any){  
        this.number = (props.number||0);
        this.comma = comma(props.comma,2);
        this.isChanged = true;
        this.performAnim();
    }

    performAnim(){
        if(!this.isChanged || this.result==0 || this.number<this.result){
            this.result = this.number;
            this.$vyw.v1.text(numberWithComma(this.result,this.comma));
            return;
        }
        this.$vyw.v1.stop();
        this.$vyw.v1.prop('Counter', this.result).animate({ Counter: +(this.number||0) }, {
            duration: 1250,
            easing: 'swing',
            step:(now:any)=> setTimeout(()=>(this.result=Math.ceil(now), this.$vyw.v1.text(numberWithComma(this.result,this.comma)))),
        });
    }

    shouldComponentUpdate=()=>false;
    render(){
        return (<>
<span ref={(ref)=>this.$vyw.v1=$(ref)}></span>
        </>);
    }
}

/*

    componentWillMount=()=>{
    }
    componentDidMount(){

    }
    componentWillUnmount(){
    }
    componentWillReceiveProps(props:any){  
        this.performAnim();
    }
    private performAnim(){
        
    }
    render(){
        var props:any = { style:{ whiteSpace:'nowrap', lineHeight:'0px' }};
        if(!!this.props.style) props.style = {...this.props.style, ...props.style};
        return (<>
    
        </>);
    }

*/