import { Plugins, Capacitor as capacitor } from '@capacitor/core';
import { BackgroundMode } from '@ionic-native/background-mode';
import { ready } from './ready';
const{ Device } = Plugins;
const{ Object }:any = window;

export const device:any=(()=>{
    var device:any = { 
        ready:ready(),
        isBrowser:(capacitor.platform=='web'),
        isAndroid:(capacitor.platform=='android'),
        isIOS:(capacitor.platform=='ios'),
    };
    //console.log(Capacitor);
    setTimeout(async()=>{
        Object.rcopy(device, await Device.getInfo());
        //device.isAndroid = (device.platform=='android'); 
        //device.isIOS = (device.platform=='ios'); 
        //device.isBrowser = (device.platform=='web');
        //BackgroundMode.enable();
        device.ready();
    });
    return device;
})();