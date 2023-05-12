import { IonButton, IonButtons, IonContent, IonFooter, IonHeader as ionHeader, IonIcon, IonSlide, IonSlides as ionSlides, IonText, IonTitle, IonToolbar as ionToolbar } from '@ionic/react';
import React from 'react';
import styled from 'styled-components';
import { app, OnDidBackdrop } from '../../../app';
import Stack, { Modal } from '../stack';

const IonHeader = styled(ionHeader)`
opacity: 1;
position: absolute;
`;
const IonToolbar = styled(ionToolbar)`
--border-style: none;
--background: rgba(var(--ion-background-color-rgb, (255, 255, 255)), 0.6);
background: rgba(var(--ion-background-color-rgb,255,255,255),.6);
`;
const IonSlides = styled(ionSlides)`
--height: 100%;
height: 100%;
`;

interface ContainerProps {
    title?: string | undefined;
    src?: string | undefined;
    modal:Function;
}
export default class PhotoViewerPopUp extends React.Component<ContainerProps> implements OnDidBackdrop {
    componentWillMount=()=>{
        app.component(this);
    }
    dismiss=(data:any=undefined)=>this.props.modal().dismiss(data);
    hClose=()=>this.dismiss();

    onDidBackdrop(){
        this.dismiss();
        return false;
    }

    render(){
        const options = { zoom:true, initialSlide: 1, onlyExternal: false, paginationClickable:false, allowTouchMove: false };
        const{ src } = this.props;
        return (<> 
<IonHeader role="banner">
    <IonToolbar>
        <IonButtons slot="primary">
            <IonButton  class="ion-activatable" onClick={this.hClose}>
                <IonIcon slot="icon-only" name="close" role="img" aria-label="close" />
            </IonButton>
        </IonButtons>
        <IonTitle>{this.props.title}</IonTitle>
    </IonToolbar>
</IonHeader>
<IonContent force-overscroll="false">
    <IonSlides pager={false} options={options}>
        <IonSlide><img src={src} /></IonSlide>
    </IonSlides>
</IonContent>
<IonFooter class="no-text" role="contentinfo" hidden>
    <IonToolbar class="ion-text-center">
        <IonText class="md hydrated" />
    </IonToolbar>
</IonFooter>
        </>);
    }

    static modal=async(title:string, src:string)=>{
        var modal:any; 
        var stack = await Stack.push(<>
<Modal className="ion-img-viewer" ref={(ref)=>modal=ref} content={<PhotoViewerPopUp modal={()=>modal} title={title} src={src} />} />
        </>);
        setTimeout(async()=>(await modal.onDidDismiss(), stack.pop()));
        return modal;
    }
}