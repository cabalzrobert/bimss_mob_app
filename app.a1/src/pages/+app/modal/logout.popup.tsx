import { IonCol, IonRow, NavContext } from '@ionic/react';
import React from 'react';
import styled from 'styled-components';
import { app, OnDidBackdrop } from '../../../tools/app';
import Stack, { Alert, Modal } from '../../../tools/components/+common/stack';
import { styles } from '../../../tools/plugins/element';
import { mtCb } from '../../../tools/plugins/static';
import { storage } from '../../../tools/plugins/storage';
import UserPager from '../../user.page/user-pager';


export default class LogoutPopUp extends React.Component<{modal:Function}> implements OnDidBackdrop {
    state:any = {};
    get cont3xt(){ return UserPager.instance.context; }
    static contextType = NavContext;
    componentWillMount=()=>{
        app.component(this);
    }
    dismiss=()=>this.props.modal().dismiss();
    hClose=()=>this.dismiss();

    onDidBackdrop(){
        this.dismiss();
        return false;
    }
    hYes=async()=>{
        await(storage.user = null);
        Alert.showSuccessMessage('You have logged out',
            ()=>this.cont3xt?.navigate('/out', 'forward', 'pop'));
        this.dismiss();
    };

    render(){
        return (<>
<div style={styles('overflow-y:auto;height:100%;padding-top:15px')}>
    <div className="horizontal" style={styles('height:auto')}>
        <div>Are you sure you want to to exit?</div>
    </div>
    <IonRow className="horizontal" style={styles('height:auto')}>
        <IonCol size="4" style={styles('margin:10px 0px')}>
            <div className="btn-red" style={styles('width:100%')} onClick={this.hYes}>YES</div>
        </IonCol>
        <IonCol size="4" style={styles('margin:10px 0px')}>
            <div className="btn-default" style={styles('width:100%')} onClick={this.hClose}>NO</div>
        </IonCol>
    </IonRow>
</div>
        </>);
    }

    static modal=async(callback:Function=mtCb)=>{
        var modal:any; 
        var stack = await Stack.push(<>
<Modal className="modal-adjustment" ref={(ref)=>modal=ref} content={<LogoutPopUp modal={()=>modal} />} />
        </>);
        setTimeout(async()=>(await modal.onDidDismiss(), stack.pop()));
        return modal;
    }
}