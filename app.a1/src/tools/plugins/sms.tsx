import { Observable, Subscription } from 'rxjs';
import { SMS } from '@ionic-native/sms';
import { mtCb, mtObj, subscribe } from './static'
const{ Object, SMSReceive }:any = window;
const{ addEventListener }:any = document;

export const smsReceiver=(()=>{
    var plugin:any = mtObj;
    setTimeout(()=>plugin=(SMSReceive||plugin));
    const callbacks:any = {};
    var callbackKey = 0;
    addEventListener('onSMSArrive',(ev:any)=>Object.values(callbacks)
        .forEach((info:any)=>((info.callback(ev.data)===true)&&info.subscription.unsubscribe())));
    return {    
        startWatch:(then:Function,err:Function=mtCb)=>{
            if(!plugin.startWatch)return err('cordova_not_available');
            plugin.startWatch(then,err);
        },
        onArrive:(callback:Function):Subscription=>{
            const key = (callbackKey++);
            const info:any = (callbacks[key] = { callback:callback });
            info.subscription = subscribe(()=>()=>(delete callbacks[key]));
            return info.subscription;
        },
    };
})();

export const sms=(()=>{
    var plugin:any = SMS;
    return {    
        send: async(phoneNumber:string, message:string, slot:number=-1)=>{
            //phoneNumber   //'9999'
            return await plugin.send(phoneNumber,message, { slot:slot });
        },
    };
})();