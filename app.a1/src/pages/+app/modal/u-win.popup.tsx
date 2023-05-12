import React from 'react';
import styled from 'styled-components';
import { app, OnDidBackdrop } from '../../../tools/app';
import Stack, { Alert, Modal } from '../../../tools/components/+common/stack';
import { storage } from '../../../tools/plugins/storage';
import { numberWithComma } from '../../../tools/global';
import { styles } from '../../../tools/plugins/element';

export default class UWinPopUp extends React.Component<{modal:Function, Amount:any}> implements OnDidBackdrop {
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
        const amount = (this.props.Amount||null);
        return (<>
<div onClick={this.hClose}>
    <div className='row m-0' style={styles('height:100%;padding:10px 0px')}>
        <div style={styles('position:absolute;right:0;top:0px')}>
            <img src="./assets/img/anim_you_win.gif" />
            <div className="vertical" style={styles('position:absolute;top:0;height:100%;width:100%')} > {/*[hidden]="!isShow"*/}
                <UWinOutline> {/*className="u-win-outline" style={}*/}
                    <div className="horizontal">{numberWithComma(amount)}</div> {/*[text-fit]="Amount|numberWithComma:'2'"*/}
                </UWinOutline>
            </div>
        </div>
        <div className='col-12 p-0' style={styles('height:350px')}>&nbsp;</div>
    </div>
</div>
        </>);
    }

    static modal=async(amount:any)=>{
        var modal:any; 
        var stack = await Stack.push(<>
<Modal className="modal-adjustment width-350 no-bg" ref={(ref)=>modal=ref} content={<UWinPopUp modal={()=>modal} Amount={amount}/>} />
        </>);
        setTimeout(async()=>(await modal.onDidDismiss(), stack.pop()));
        return modal;
    }
}

//styles
const UWinOutline = styled.div`
font-size: 65px;
font-weight: 900;
color: #003d4c;
-webkit-text-fill-color: white;
-webkit-text-stroke-width: 1px;
-webkit-text-stroke-color: #003d4c;
text-shadow: 0px 4px 0 #003d4c, 0px -1px 0 #003d4c, -1px 1px 0 #003d4c, 1px 1px 0 #003d4c;
transform: rotate(2deg);
/**/
padding-top: 20%;
padding-left: 10%;
padding-right: 10%;
width: 100%;
`;