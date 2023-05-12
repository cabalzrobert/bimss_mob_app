import { NavContext, IonPage } from '@ionic/react';
import React from 'react';
import { app, OnDidBackdrop } from '../../tools/app';
import Layout from '../../tools/components/+common/layout';
import { Plugins } from '@capacitor/core';
import { device } from '../../tools/plugins/device';
import { styles } from '../../tools/plugins/element';
import { storage } from '../../tools/plugins/storage';
import { mtCb } from '../../tools/plugins/static';

const { SplashScreen } = Plugins;
const { Object, $, addEventListener, removeEventListener }: any = window;

export default class IntroPage extends React.Component implements OnDidBackdrop {
    static contextType = NavContext;
    state: any = {
        inner: { width: '500px', height: '100%' },
    }
    componentWillMount = () => {
        app.component(this);
        if (!device.isBrowser) {
            this.state.inner = { width: '100%', height: '100%' };
        }
    }

    onDidBackdrop() {
        app.exit();
        return false;
    }

    $vyw: any = {};
    componentDidMount = () => {
        this.$vyw.intro.css('display', 'none');
        device.ready(() => setTimeout(() => this.performSwap(), 275));
    }

    performSwap = async () => {
        var IsSignIn = await storage.IsSignIn;
        // if (IsSignIn) {
        //     setTimeout(() => this.goToHomePage(), 5250);
        //     return setTimeout(async () => await SplashScreen.hide(), 750);
        // }
        await SplashScreen.hide();
        //
        //this.$vyw.intro.css('display', 'none');
        return setTimeout(() => {
            if (IsSignIn) 
                        return this.goToHomePage()
                    this.goToSignInPage();
            return;
            
            this.$vyw.info2.fadeIn(4000, () => { //fadeOut
                setTimeout(() => {
                    if (IsSignIn) 
                        return this.goToHomePage()
                    this.goToSignInPage();
                }, 1000);
            });
        }, (device.isBrowser ? 250 : 1000));
    }
    //
    private goToSignInPage() {
        return this.context?.navigate('/out', 'forward', 'pop');
    }
    private goToHomePage() {
        return this.context?.navigate('/in', 'forward', 'pop');
    }
    //
    shouldComponentUpdate = () => false;
    render() {
        const { inner } = this.state;
        const vyw = this.$vyw;
        return (<>
            <IonPage>
                <div className="horizontal" >
                    <Layout full style={styles('position:relative;background-color:white;max-width:100%', inner)}>
                        <Layout auto>
                            <div style={styles('height:100%;position:relative')}>
                                <FirstPage bind={(ref) => vyw.info = $(ref)} />
                                <SecondPage bind={(ref) => vyw.info2 = $(ref)} />
                                <StartUpPage bind={(ref) => vyw.intro = $(ref)} />
                            </div>
                        </Layout>
                    </Layout>
                </div>
            </IonPage>
        </>);
    }
}

class StartUpPage extends React.Component<{ bind?: (ref: any) => void }>{
    shouldComponentUpdate = () => false;
    render() {
        const { bind = mtCb } = this.props;
        return (<>
            <div ref={bind} style={styles('height:100%', 'width:100%', 'background-color:white;position:absolute;top:0;z-index:100')}>
                <img className="app-logo img-fit" src="./assets/img/applogo.png" style={styles('width:100%')} />
            </div>
        </>);
    }
}

class FirstPage extends React.Component<{ bind?: (ref: any) => void }>{
    shouldComponentUpdate = () => false;
    render() {
        const { bind = mtCb } = this.props;
        return (<>
            <div ref={bind} className="layout full" style={styles('position:relative', 'position:absolute;top:0;z-index:1;padding:5px 0px')}>
                <div className="auto" style={styles('height:15%')}><div style={styles('height:15%')}><div>
                    <div>&nbsp;</div>
                </div></div></div>
                <div ref={bind} style={styles('height:100%', 'width:100%', 'background-color:white;position:absolute;top:0;z-index:100')}>
                    <img className="app-logo img-fit" src="./assets/img/applogo.png" style={styles('width:100%')} />
                </div>
                <div className="auto" style={styles('height:100%')}><div style={styles('height:100%')}><div>
                    <div>&nbsp;</div>
                </div></div></div>
            </div>
        </>);
    }
}

class SecondPage extends React.Component<{ bind?: (ref: any) => void }>{

    shouldComponentUpdate = () => false;
    render() {
        const { bind = mtCb } = this.props;
        return (<>
            <div ref={bind} className="layout full" style={styles('height:100%', 'background-color:white;position:absolute;z-index:99;top:0;display:none;padding:5px 0px')}>
                <div className="auto" style={styles('height:7.5%')}><div style={styles('height:7.5%')}><div>
                    <div>&nbsp;</div>
                </div></div></div>
                <div ref={bind} className="layout full" style={styles('height:100%', 'width:100%', 'background-color:white;position:absolute;top:0;z-index:100')}>
                    <img className="app-logo img-fit" src="./assets/img/69STLPartyList.png" style={styles('width:100%')} />
                </div>
                <div className="auto" style={styles('height:100%')}><div style={styles('height:100%')}><div>
                    <div>&nbsp;</div>
                </div></div></div>
            </div>
        </>);
    }
}




