import { mtCb, mtObj } from './static';
const{ Object }:any = window;

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
        setTimeout(()=>Object.values(callbacks).forEach((info:any)=>info.callback()));
    };
};

export const whenReady=(callback:(handler:()=>void)=>void)=>{
    var isReady = false, isPerforming = false;
    const handler=(resolve:any)=>{
        return()=>{
            if(!ready)return;
            isPerforming = false;
            resolve(isReady = true);
        };
    }
    return async()=>{
        if(isReady)return true;
        const perform = isPerforming;
        isPerforming = true;
        if(perform)return false;
        return await (new Promise<any>((resolve)=>{
            callback(handler(resolve));
        }));
    };
};