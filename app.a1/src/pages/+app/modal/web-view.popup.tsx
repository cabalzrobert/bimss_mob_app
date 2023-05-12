import React from 'react';
import styled from 'styled-components';
import { app, OnDidBackdrop } from '../../../tools/app';
import Stack, { Alert, Modal } from '../../../tools/components/+common/stack';
import { styles } from '../../../tools/plugins/element';

export default class WebViewPopUp extends React.Component<{modal:Function, Url:any}> implements OnDidBackdrop {
    state:any = {};
    componentWillMount=()=>{
        app.component(this);
    }

    dismiss=()=>this.props.modal().dismiss();
    onDidBackdrop(){
        this.dismiss();
        return false;
    }

    hClose=()=>this.dismiss();

    render(){
        const url = (this.props.Url||null);
        return (<>
<div className="modal-container">
    <div style={styles('padding-top:5px')}>
        <div className="row m-0 header fixed">
            <div className="col-10"></div>
            <div className="col-2 p-0 btn-close" style={styles('text-align:right;right:5px','top:5px')} onClick={this.hClose}></div>
        </div>
        <div className="row m-0" style={styles('overflow:hidden;height:400px;padding:10px')}>
            <div className='col-12 p-0'>
                <div style={styles('content:\'\';position:absolute;top:0;background-color:white;opacity:0.45;border-radius:10px;width:100%;height:100%')}></div>
                <div style={styles('position:relative;height:100%;width:100%;padding:10px')}>
                    <iframe src={url} style={styles('width:100%;height:100%;border:none')} />
                </div>
            </div>
        </div>
    </div>
</div>
        </>);
    }

    static modal=async(url:any)=>{
        var modal:any; 
        var stack = await Stack.push(<>
<Modal className="modal-adjustment width-350" ref={(ref)=>modal=ref} content={<WebViewPopUp modal={()=>modal} Url={url}/>} />
        </>);
        setTimeout(async()=>(await modal.onDidDismiss(), stack.pop()));
        return modal;
    }
}