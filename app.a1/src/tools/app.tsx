import { AppMinimize } from '@ionic-native/app-minimize';
import { backButton } from './plugins/back-button';
import { toast } from './plugins/toast';
import { mtArr, mtCb } from './plugins/static';
import { device } from './plugins/device';
import { Capacitor } from '@capacitor/core';
import { timeout } from './plugins/delay';

const{ Object, cordova, navigator, location, screen, document }:any = window;
const{ documentElement } = document;

export const app=(()=>{
    var backdropNextHandler:any;
    const event = { RESIZE: new Event('resize'), };
    const prop = { baseOnClick:'' };
    const app = {
        window:{
            resize:()=>!(dispatchEvent(event.RESIZE)),
            isFullscreen:isFullscreen,
            openFullscreen:openFullscreen,
            closeFullscreen:closeFullscreen,
        },
        //
        backdropPriority: 101,
        backdrop:()=>!(backdropNextHandler||mtCb)(),
        component:(component:any)=>(componentAdjustment(component)),
        exit:()=>!(navigator.app?.exitApp()),
        minimize:()=>!(AppMinimize.minimize()),
        attempToClose:(()=>{
            var subscription:any = null;
            var isMinimize = false;
            var backdropPress = false;
            return async()=>{
                if(backdropPress){
                    isMinimize = true;
                    if(subscription) subscription.unsubscribe();
                    return setTimeout(()=>app.minimize(),15);
                }
                setTimeout(()=>backdropPress=false,3000);
                backdropPress = true;
                subscription = toast('Press back again to close this app');
                return false;
            };
        })(),
        hostFile:(path:string)=>(location.origin + '/' + path),
        figureOutFile:(path:string)=>{
            if (device.isIOS) 
                return app.hostFile(path);
            if (device.isAndroid) 
                return ('file:///android_asset/www/'+path);
            return ('./'+path);
        },
        link:(link:string)=>{
            const a = document.createElement('a');
            a.setAttribute('href','javascript:void(0)');
            a.setAttribute('onclick',prop.baseOnClick.replace('{0}','this.text'));
            a.style.color = 'red';
            a.text = ((link.startsWith('http')?'':'//') + link);
            return a.outerHTML;
        },
        linkOnClick:(link:string)=>{
            link = (link.startsWith('http')?'':'//') + link;
            return prop.baseOnClick.replace('{0}','\''+link+'\'');
        },
    };
    device.ready(()=>{
        prop.baseOnClick = baseOnClick();
    });
    return app;
    //
    function baseOnClick(){
        var onclick = 'event.preventDefault();event.stopPropagation();';
        if(device.isBrowser) onclick += 'window.open({0}, \'_blank\');';
        else if(cordova.InAppBrowser) onclick += 'cordova.InAppBrowser.open({0}, \'_system\');';
        else if(Capacitor.Plugins?.Browser) onclick += 'Capacitor.Plugins.Browser.open({ url:{0} });';
        else onclick += 'window.open({0}, \'_blank\');';
        return onclick;
    }
    function isFullscreen(){
        return (screen.width === window.innerWidth&&screen.height === window.innerHeight);
    }
    function openFullscreen(){
        if(isFullscreen())return;
        if(documentElement.requestFullscreen) 
            return documentElement.requestFullscreen();
        else if(documentElement.webkitRequestFullscreen) /* Safari */
            return documentElement.webkitRequestFullscreen();
        else if(documentElement.msRequestFullscreen) /* IE11 */
            return documentElement.msRequestFullscreen();
    }
    function closeFullscreen(){
        if(!isFullscreen())return;
        if(document.exitFullscreen) 
            return document.exitFullscreen();
        else if (document.webkitExitFullscreen) /* Safari */
            return document.webkitExitFullscreen();
        else if (document.msExitFullscreen) /* IE11 */
            return document.msExitFullscreen();
    } 
    //
    function componentAdjustment(component:any){
        //stateAdjustment(component);
        (!!component.onDidBackdrop&&onDidBackdrop(component));
    }
    function stateAdjustment(component:any){
        var didMount = false;
        const setState:any = component.setState;
        const componentDidMount = (component.componentDidMount||mtCb);
        component.setState=(function(state:any){
            if(!component.state||!state) return;
            if(didMount) return setState.apply(component, arguments);
            Object.rcopy(component.state, state);
        } as any);
        component.componentDidMount=()=>{
            didMount = true;
            componentDidMount.apply(component, mtArr);
        };
    }
    function onDidBackdrop(component:any){
        var priority = (app.backdropPriority++);
        var isOnDidBackdropApplied = (!!component.onDidBackdrop);
        //
        var backdropButton = backButton.subscribeWithPriority(priority, async(processNextHandler:any)=>{
            backdropNextHandler = processNextHandler;
            var performHandler = true; 
            if(isOnDidBackdropApplied)
                performHandler = component.onDidBackdrop();
            if(typeof(performHandler)!='boolean')
                performHandler = true;
            if(!performHandler) return;
            backdropNextHandler = null;
            processNextHandler();
        });
        var componentWillUnmount:Function = (component.componentWillUnmount||mtCb);
        component.componentWillUnmount=()=>{
            componentWillUnmount.apply(component, mtArr);
            app.backdropPriority--;
            backdropButton.unsubscribe();
        };
    }
})();
export interface OnDidBackdrop {
    onDidBackdrop():boolean;
}