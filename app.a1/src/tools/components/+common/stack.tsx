import React from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonModal, IonButton, IonLoading, IonAlert, AlertInput, AlertButton } from '@ionic/react';
import styled from 'styled-components';
import { app, OnDidBackdrop } from '../../app';
import { backButton } from '../../plugins/back-button';
import Swal from 'sweetalert2';
import { mtCb } from '../../plugins/static';
import { timeout } from '../../plugins/delay';
import { proxy } from '../../plugins/proxy';

export default class Stack extends React.Component {
    static instance:Stack = ({} as any);
    state:any = { views:[], }
    componentWillMount=()=>{
        Stack.instance = this;
    }
    static push=(content:any)=>Stack.instance.push(content);
    componentWillUnmount(){
        this.state.views.length = 0;
    }
    push=async (content:any)=>{
        const info:any = {element:content};
        return await new Promise<any>((resolve,reject)=>{
            info.view = ()=>{
                if(!info.isReady){
                    info.isReady = true;
                    resolve({
                        pop:()=>{
                            info.element = null;
                            this.setState({views:this.state.views});
                        }
                    });
                }
                return info.element;
            }
            this.state.views.push(info);
            this.setState({views:this.state.views});
        });
    }
    render(){
        return (<>
            {this.state.views.map((i:any,idx:any)=>!!i.element&&
                <div key={idx}>{i.view()}</div>
            )}
        </>);
    }
}


interface ModalProps {
    className?: string;
    content?: object;
    backdropDismiss?:boolean;
}
export class Modal extends React.Component<ModalProps> {
    state = { showen:false, dismiss:false }; 
    modal:any = React.createRef();
    resolveOnDidDismiss:any[] = [];
    dataDismiss:any = undefined;

    present=async()=>{
        this.setState({showen:true,dismiss:false});
    }
    dismiss=async(data:any=undefined)=>{
        this.dataDismiss = data;
        timeout(()=>this.setState({showen:false}));
    }
    onDidDismiss=async()=>{
        return await new Promise<any>((resolve,reject)=>{
            this.resolveOnDidDismiss.push(resolve);
        });
    }
    private handlerOnDidDismiss=(ev:any)=>{
        this.setState({dismiss:true});
        this.resolveOnDidDismiss.map((resolve:any)=>resolve({data:this.dataDismiss,role:ev.detail.role}));
        this.resolveOnDidDismiss.length = 0;
        this.dataDismiss = undefined;
    }

    render(){
        if(this.state.dismiss)return null;
        return (<>
<IonModal 
    ref={this.modal} 
    cssClass={this.props.className}
    isOpen={this.state.showen}  
    onDidDismiss={this.handlerOnDidDismiss}
    backdropDismiss={this.props.backdropDismiss}>
    {(this.props.content||this.props.children)}
</IonModal>
        </>);
    }
}


interface LoadingProps {
    className?: string;
    message: string;
    backdropDismiss?:boolean;
}
export class Loading extends React.Component<LoadingProps> {
    state = {
        showen:false, dismiss:false,
        message:'',
        backdropDismiss:false,
    };
    loading:any = React.createRef();
    resolveOnDidDismiss:any[] = [];
    dataDismiss:any = undefined;
    componentWillMount=()=>{
        const message =  this.props.message;
        const backdropDismiss = (this.props.backdropDismiss||false);
        this.setState({message,backdropDismiss});
    }

    get message(){ return this.state.message; }
    set message(value){ 
        if(!this.loading.current) return;
        this.loading.current.message = (this.state.message = value);
    }

    componentWillReceiveProps(props:any){
        this.message = props.message;
    }

    present=async()=>{
        this.setState({showen:true, detach:false});
    }
    dismiss=async(data:any=undefined)=>{
        this.dataDismiss = data;
        this.setState({showen:false});
    }
    onDidDismiss=async()=>{
        return await new Promise<any>((resolve,reject)=>{
            this.resolveOnDidDismiss.push(resolve);
        });
    }
    private handlerOnDidDismiss=(ev:any)=>{
        this.setState({dismiss:true});
        this.resolveOnDidDismiss.map((resolve:any)=>resolve({data:this.dataDismiss,role:ev.detail.role}));
        this.resolveOnDidDismiss.length = 0;
        this.dataDismiss = undefined;
    }

    render(){
        if(this.state.dismiss)return null;
        return (<>
<IonLoading
    ref={this.loading} 
    cssClass={this.props.className}
    isOpen={this.state.showen}  
    onDidDismiss={this.handlerOnDidDismiss}
    message={this.state.message}
    backdropDismiss={this.state.backdropDismiss} />
        </>);
    }
    //
    static create=async (opts:any)=>{
        const priority = (app.backdropPriority++);
        const onDidBackdrop = (opts.onDidBackdrop&&typeof(opts.onDidBackdrop)=='function');
        var backdropButton:any = null, didBackdrop = false;
        var loading:any;
        var stack = await Stack.push(<Loading ref={(ref)=>loading=ref} {...opts} />);
        timeout(async()=>await onDidDismiss());
        return proxy(loading, {
            present:present,
            dismiss:dismiss,
            onDidDismiss:onDidDismiss,  
            stack:stack,
        });
        async function dismiss(){ 
            return await loading.dismiss(); 
        }
        async function present(){
            if(onDidBackdrop && !backdropButton){
                backdropButton = backButton.subscribeWithPriority(priority, (processNextHandler:any)=>{
                    var performHandler = opts.onDidBackdrop();
                    if(typeof(performHandler)!='boolean')
                        performHandler = false;
                    if(performHandler) {
                        didBackdrop = true;
                        timeout(dismiss);
                    }
                });
            }
            return await loading.present();
        }
        async function onDidDismiss(){
            const subscription = backdropButton;
            backdropButton = null;
            const result = await loading.onDidDismiss();
            if(didBackdrop)
                result.role = 'backdrop';
            if(!!subscription){
                subscription.unsubscribe();
                app.backdropPriority--;
            }
            return result;
        }
    }
}

interface AlertProps {
    message?: string;
    header?:string;
    subHeader?:string;
    inputs?:AlertInput[];
    buttons?:(string | AlertButton)[];
    className?: string;
    backdropDismiss?:boolean;
}
export class Alert extends React.Component<AlertProps> {

    state = {
        showen:false, dismiss:false,
        message:'',
        backdropDismiss:false,
    };
    alert:any = React.createRef();
    resolveOnDidDismiss:any[] = [];
    dataDismiss:any = undefined;
    componentWillMount=()=>{
        const backdropDismiss = (this.props.backdropDismiss||false);
        this.setState({backdropDismiss});
    }

    present=async()=>{
        this.setState({showen:true, detach:false});
    }
    dismiss=async(data:any=undefined)=>{
        this.dataDismiss = data;
        this.setState({showen:false});
    }
    onDidDismiss=async()=>{
        return await new Promise<any>((resolve,reject)=>{
            this.resolveOnDidDismiss.push(resolve);
        });
    }
    private handlerOnDidDismiss=(ev:any)=>{
        this.setState({dismiss:true});
        this.resolveOnDidDismiss.map((resolve:any)=>resolve({data:this.dataDismiss,role:ev.detail.role}));
        this.resolveOnDidDismiss.length = 0;
        this.dataDismiss = undefined;
    }

    render(){
        if(this.state.dismiss)return null;
        return (<>
<IonAlert
    ref={this.alert} 
    cssClass={this.props.className}
    isOpen={this.state.showen}  
    onDidDismiss={this.handlerOnDidDismiss}
    message={this.props.message}
    backdropDismiss={this.state.backdropDismiss} 
    inputs={this.props.inputs}
    buttons={this.props.buttons}
    header={this.props.header}
    subHeader={this.props.subHeader} />
        </>);
    }
    //
    static create=async (opts:any)=>{
        const priority = (app.backdropPriority++);
        const onDidBackdrop = (opts.onDidBackdrop&&typeof(opts.onDidBackdrop)=='function');
        var backdropButton:any = null, didBackdrop = false;
        var alert:any;
        var stack = await Stack.push(<Alert ref={(ref)=>alert=ref} {...opts} />);
        timeout(async()=>await onDidDismiss());
        return proxy(alert, {
            present:present,
            dismiss:dismiss,
            onDidDismiss:onDidDismiss,  
            stack:stack,
        });
        async function dismiss(){ 
            return await alert.dismiss(); 
        }
        async function present(){
            if(onDidBackdrop && !backdropButton){
                backdropButton = backButton.subscribeWithPriority(priority, (processNextHandler:any)=>{
                    var performHandler = opts.onDidBackdrop();
                    if(typeof(performHandler)!='boolean')
                        performHandler = false;
                    if(performHandler) {
                        didBackdrop = true;
                        timeout(dismiss);
                    }
                });
            }
            return await alert.present();
        }
        async function onDidDismiss(){
            const subscription = backdropButton;
            backdropButton = null;
            const result = await alert.onDidDismiss();
            if(didBackdrop)
                result.role = 'backdrop';
            if(!!subscription){
                subscription.unsubscribe();
                app.backdropPriority--;
            }
            return result;
        }
    }
    //
    static swal=(()=>{
        var currentModal:any;
        return async (opts:any, thenHandler:Function=mtCb)=>{
            if(!!currentModal){
                currentModal.dismiss();
                currentModal = null;
            }
            if(opts===false) 
                return Swal.close();
            //
            var isClose = false;
            var backdropDismiss = (opts.backdropDismiss===false?false:true);
            var modal:any; 
            var stack = await Stack.push(
                <Modal className="modal-adjustment hidden" ref={(ref)=>modal=ref} backdropDismiss={backdropDismiss} 
                    content={<NoWrapper modal={()=>modal} backdropDismiss={backdropDismiss} />} />);
            if(opts.isLoadding===true){
                opts.willOpen=()=>Swal.showLoading();
            }
            currentModal = modal;
            Swal.fire(opts).then(swalTriggerThen);
            modal.present().then(modalTriggerThen);
            function swalTriggerThen(result:any){
                if(!isClose)modal.dismiss();
                if(!thenHandler)return;
                timeout(()=>thenHandler(result), 375);
            }
            async function modalTriggerThen(){
                if(isClose) return;
                const result = await modal.onDidDismiss();
                stack.pop();
                isClose = true;
                if(!!result.data && result.data=='backdrop')
                    return Swal.close();
            }
        };
    })();

    static showProgressRequest(){
        Alert.swal({
            text: 'Please wait while processing your request',
            allowOutsideClick: false,
            backdropDismiss: false,
            showConfirmButton: false,
            isLoadding:true,
        });
    }
    static showErrorMessage(message:string, callback:Function=mtCb){
        Alert.swal({
            title: 'Failed!',
            icon: 'error',
            text: message,
            confirmButtonText: 'Dismiss',
            allowOutsideClick: false,
            backdropDismiss: false,
            //confirmButtonColor: "#218838",   
        }, callback);
    }
    static showSuccessMessage(message:string, callback:Function=mtCb){
        Alert.swal({
            text: message,
            icon: 'success',
            confirmButtonText: 'Ok!',
            allowOutsideClick: false,
            backdropDismiss: false,
            confirmButtonColor: "#218838",   
        }, callback);
    }
    static showWarningMessage(message:string, callback:Function=mtCb){
        Alert.swal({
            text: message,
            icon: 'warning',
            confirmButtonText: 'Ok!',
            allowOutsideClick: false,
            backdropDismiss: false,
            confirmButtonColor: "#218838", 
        }, callback);
    }
}

export class NoWrapper extends React.Component<{modal:Function, backdropDismiss?:boolean}> implements OnDidBackdrop {
    componentWillMount=()=>{
        app.component(this);
    }
    onDidBackdrop(){
        if(this.props.backdropDismiss)
            this.props.modal().dismiss('backdrop');
        return false;
    }
    render(){
        return (<>
        </>);
    }
}