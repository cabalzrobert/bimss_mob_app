import { timeout } from './delay';
import { mtCb } from './static';

export const ready = ()=>{
    const callbacks:any = {};
    var callbackKey = 0, isReady = false;
    return (callback:Function=mtCb)=>{
        if(isReady) return callback();
        else if(!isReady&&callback!=mtCb){
            const key = (callbackKey++);
            return (callbacks[key] = { callback:callback });
        }
        isReady = true;
        timeout(()=>Object.values(callbacks).forEach((info:any)=>info.callback()));
    };
};
export const whenReady=(callback:(handler:()=>void)=>void, stack=false)=>{
    const callbacks:any = [];
    var isReady = false, isPerforming = false;
    const handler=()=>{
        return()=>{
            if(isReady)return;
            isPerforming = false;
            isReady = true
            callbacks.forEach((resolve:any)=>resolve(isReady));
        };
    };
    return async()=>{
        if(isReady)return true;
        const perform = isPerforming;
        isPerforming = true;
        if(!stack&&perform)return false;
        return await (new Promise((resolve:any)=>{
            callbacks.push(resolve);
            if(perform)return;    
            callback(handler());
        }));
    };
};