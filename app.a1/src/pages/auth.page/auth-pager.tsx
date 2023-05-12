import React from 'react';
import ViewPager from '../../tools/components/+feature/view-pager';
import {IonPage, NavContext} from '@ionic/react';
import SignInView from './auth-pages/sign-in.view'
import { KeyboardInfo } from '@capacitor/core';
import { app, OnDidBackdrop } from '../../tools/app';
import { device } from '../../tools/plugins/device';
import { keyboard } from '../../tools/plugins/keyboard';
import Layout from '../../tools/components/+common/layout';
import { mtObj } from '../../tools/plugins/static';
import { styles } from '../../tools/plugins/element';

const{ Object }:any = window;

export default class AuthPager extends React.Component implements OnDidBackdrop {
    static instance:AuthPager = ({} as any);
    static contextType = NavContext;
    state:any = { inner:{ width: '500px', height:'100%' }, }
    pager = (mtObj as ViewPager);
    componentWillMount=()=>{
        app.component(AuthPager.instance = this);
        const{ state:{inner} } = this;
        if(!device.isBrowser){
            Object.rcopy(inner,{ width: '100%', height:'100%' });
            this.setState({inner});
        }
    }
    subs:any = {};
    componentDidMount=()=>{
        const{ state:{inner} } = this;
        if(!device.isBrowser){
            const{ scaleHeight, innerHeight }:any = window;
            const height = (scaleHeight + 'px');
            this.subs.k1 = keyboard.addListener('keyboardWillShow', (info: KeyboardInfo) => { 
                inner.height = height;
                this.setState({inner});
            });
            this.subs.k2 = keyboard.addListener('keyboardWillHide', () => {
                inner.height = '100%';
                this.setState({inner});
            });
        }
    }
    componentWillUnmount(){
        Object.values(this.subs).map((m:any)=>m.unsubscribe());
    }
    onDidBackdrop(){
        if(!this.pager.back())
            app.attempToClose();
        return false;
    }
    private goToSignInPage(){
        return this.context?.navigate('/out', 'forward', 'pop'); 
    }
    private goToHomePage(){
        return this.context?.navigate('/in', 'forward', 'pop');
    }
    //
    render(){
        const{ inner } = this.state;
        return (<>
<IonPage>
    <div className="horizontal">
        <Layout full style={styles('position:relative;background-color:white;max-width:100%',{width:inner.width,height:inner.height})}>
            <StaticComponentView instance={this}/>
        </Layout>
    </div>
</IonPage>
        </>);
    }
}

class StaticComponentView extends React.Component<{instance:AuthPager}>{
    shouldComponentUpdate=()=>false;
    render(){
        const{ instance } = this.props;
        return(<>
<div className="app-bg2"></div>
<Layout auto>
    <ViewPager ref={(ref:any)=>instance.pager=ref} default={SignInView} />
</Layout> 
        </>);
    }
}