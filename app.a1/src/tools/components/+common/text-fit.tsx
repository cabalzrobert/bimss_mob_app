import React from 'react';
import styled from 'styled-components';

const{ Object, $, addEventListener, removeEventListener }:any = window;

interface ContainerProps {
    text?: string;
    style?: React.CSSProperties;
}

export default class TextFit extends React.Component<ContainerProps> {

    text?:string;
    componentWillMount=()=>{
        this.text = this.props.text;
    }

    $vyw:any = { span:$('<span/>').html('&nbsp;') };
    componentDidMount(){
        this.$vyw.v1.html(this.text);
        this.$vyw.parent.prepend(this.$vyw.span);
        setTimeout(()=>this.performTextFit(),15);
        this.$vyw.span.remove();
        addEventListener('resize', this.updateDimensions);
    }
    componentWillUnmount(){
        removeEventListener('resize', this.updateDimensions);
    }
    componentWillReceiveProps(props:any){  
        this.text = props.text;
        this.performTextFit();
    }
    private updateDimensions=()=>{
        this.performTextFit();
    }
    private performTextFit(){
        this.$vyw.v1.html(this.text).css('font-size', '100%');
        var outerWidthParent = this.$vyw.parent.outerWidth();
        var outerWidthChild = this.$vyw.v1.outerWidth();
        if(outerWidthChild>outerWidthParent){
            var prctg = (outerWidthParent/outerWidthChild);
            this.$vyw.v1.css({'font-size':(prctg*100)+'%'}); 
        }
    }

    shouldComponentUpdate=()=>false;
    render(){
        var props:any = { style:{ whiteSpace:'nowrap', lineHeight:'0px' }};
        if(!!this.props.style) props.style = {...this.props.style, ...props.style};
        return (<>
<div ref={(ref)=>this.$vyw.parent=$(ref)} {...props}>
    <span style={{visibility:'hidden',width:'0px',display:'inline-block'}}>&nbps;</span>
    <span ref={(ref)=>this.$vyw.v1=$(ref)}></span>
</div>
        </>);
    }
}