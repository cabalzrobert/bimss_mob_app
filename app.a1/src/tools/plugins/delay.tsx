import { Observable, Subscription } from 'rxjs';
import { subscribe } from './static';

export const timeout = (callback:()=>any,delay:number=0):Subscription=>{
    const subscription:Subscription = subscribe(()=>{
        const id = setTimeout(()=>(subscription.unsubscribe(),callback()), delay);
        return()=>(clearTimeout(id));
    });
    return subscription;
};
export const interval = (callback:()=>any,delay:number=0):Subscription=>{
    const subscription:Subscription = subscribe(()=>{
        const id = setInterval(callback, delay);
        return()=>(clearInterval(id));
    });
    return subscription;
};
//
export const breaker = (callback:(handler:()=>void)=>any,delay:number=0, tiggerFirst:boolean=false):Subscription=>{
    const subs:any = {};
    const subscription:Subscription = subscribe(()=>{
        var isStop:boolean = false;
        const handler = ()=>{
            var stop = isStop
            isStop = true;
            if(stop)return;
            subscription.unsubscribe();
        }
        const cbTimeout = async()=>{
            if(isStop)return;
            if(subs.timeout)
                subs.timeout.unsubscribe();
            await callback(handler);
            subs.timeout = timeout(cbTimeout,delay);
        };
        if(tiggerFirst) cbTimeout();
        else subs.timeout = timeout(cbTimeout,delay);
        return ()=>{
            isStop = true;
            Object.values(subs).map((m:any)=>m.unsubscribe());
        };
    });
    return subscription;
};