import { Observable, Subscription } from 'rxjs';
import { Plugins } from '@capacitor/core';
import { Toast } from '@ionic-native/toast';
import { device } from './device';
import { mtCb, mtObj, subscribe } from './static';
const{ Object }:any = window;

export const toast=(()=>{
    const provider = (device.isBrowser?provider0a:provider0b)();
    return (text:string, options:any=mtObj)=>{
        return provider.show(text, options);
    };
    function provider0a(){
        const plugin = Plugins.Toast;
        return ({
            show:(text:string, options:any=mtObj):Subscription=>{
                return subscribe(()=>{
                    plugin.show(Object.rcopy({text:text},options));
                    return mtCb;
                });
            },
        });
    }
    function provider0b(){
        const plugin = Toast;
        return ({
            show:(text:string, options:any=mtObj):Subscription=>{
                return subscribe(()=>{
                    plugin.show(text, (options.duration||'short'), (options.position||'bottom')).subscribe(mtCb);
                    return ()=>plugin.hide();
                });
            },
        });
    }
})();