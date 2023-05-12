import { Observable, Subscription } from 'rxjs';
import { Plugins } from '@capacitor/core';
import { subscribe } from './static';
const{ Keyboard } = Plugins;

export const keyboard=(()=>{
    var plugin = (Keyboard as any);
    return {
        addListener:(name:string, callback:Function):Subscription=>{
            const subscription = plugin.addListener(name, callback);
            return subscribe(()=>()=>(subscription.remove()));
        },
    };
})();