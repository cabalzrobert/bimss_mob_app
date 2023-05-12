import { Observable, Subscription } from 'rxjs';
import moment from 'moment';
import { mtArr, mtCb, subscribe } from '../../tools/plugins/static';
import { storage } from '../../tools/plugins/storage';
import { sms } from '../../tools/plugins/sms';
import { rest } from './+service/rest.service';
import { timeout } from '../../tools/plugins/delay';
import { whenReady } from '../../tools/plugins/ready';
import { device } from '../../tools/plugins/device';

const{ Object }:any = window;

export const jUser = (()=>{
    var jUser:any = {};
    const untilReady = whenReady((ready)=>device.ready(async()=>(Object.rcopy(jUser, (await storage.user||jUser)),ready())),true);
    return async(user:any=null, isMerge:boolean=false)=>{
        await untilReady();
        if(!user) return jUser;
        if(!isMerge) jUser = user;
        else Object.rcopy(jUser, user);
        await (storage.user = jUser);
        timeout(jUserModify);
        return jUser;
    };
})();

export const jUserModify=(()=>{
    const callbacks:any = {};
    var callbackKey = 0;
    return (callback:Function=mtCb, apply:boolean=true):Subscription=>{
        if(callback==mtCb)
            return (Object.values(callbacks).forEach((cb:any)=>timeout(cb)) as any);
        const key = (callbackKey++);
        callbacks[key] = callback;
        if(apply)callback();
        return subscribe(()=>()=>delete callbacks[key]);
    }
})();

export const additionalCreditBalance=async(amount:number)=>{
    const user = await jUser();
    user.CreditBalance += amount;
    return await jUser(user,true);
}
export const additionalCommissionBalance=async(amount:number)=>{
    const user = await jUser();
    user.CommissionBalance += amount;
    return await jUser(user,true);
}
export const additionalWinningBalance=async(amount:number)=>{
    const user = await jUser();
    user.WinningBalance += amount;
    return await jUser(user,true);
}
export const checkBalances=(()=>{
    // const ready = whenReady((ready)=>rest.ready(()=>ready()));
    // var subscription:any;
    // return async()=>{
    //     if(!await ready()) return;
    //     if(subscription) subscription.unsubscribe();
    //     subscription = rest.post('balance').subscribe(async(res:any)=>{
    //         if(res.Status!='error'){
    //             const user = await jUser();
    //             const update:any = { Balance: res.Balance, CreditBalance: res.CreditBalance, WinningBalance: (res.WinningBalance||0), };
    //             if(((user.IsGeneralCoordinator||user.IsCoordinator) && (!user.IsPlayer)))
    //                 update.CommissionBalance = res.CommissionBalance;
    //             return await jUser(update,true);
    //         }
    //     },(err:any) =>{});
    // };
})();
//
export const livestreamupdate=(()=>{
    const ready = whenReady((ready)=>rest.ready(()=>ready()));
    var subscription:any;
    return async()=>{
        if(!await ready()) return;
        if(subscription) subscription.unsubscribe();
        subscription = rest.post('profile').subscribe(async(res:any)=>{
            if(res.Status!='error'){
                return jCompany;
            }
        },(err:any) =>{});
   };
})();
export const notificationCount=(()=>{ 
     const ready = whenReady((ready)=>rest.ready(()=>ready()));
     var subscription:any;
     return async()=>{
         if(!await ready()) return;
         if(subscription) subscription.unsubscribe();
         subscription = rest.post('notification/unseen').subscribe(async(res:any)=>{
             if(res.Status!='error'){
                 return additionalNotification(+res, true);
             }
         },(err:any) =>{});
    };
})();
export const additionalNotification=async(additional:number, isSet:boolean=false)=>{
    var user = await jUser();
    if(!user.NotificationCount) user.NotificationCount = 0;
    if(isSet) user.NotificationCount = additional;
    else user.NotificationCount += additional;
    return await jUser(user,true);
}
//--
export const jCompany = (()=>{
    var jCompany:any = {};
    const untilReady = whenReady((ready)=>device.ready(async()=>(Object.rcopy(jCompany, (await storage.company||jCompany)),ready())),true);
    return async(company:any=null, isMerge:boolean=false)=>{
        await untilReady();
        if(!company) return jCompany;
        if(!isMerge) jCompany = company;
        else Object.rcopy(jCompany, company);
        await (storage.company = jCompany);
        timeout(jCompanyModify);
        return jCompany;
    };
})();

export const jCompanyModify=(()=>{
    const callbacks:any = {};
    var callbackKey = 0;
    return (callback:Function=mtCb, apply:boolean=true):Subscription=>{
        if(callback==mtCb)
            return (Object.values(callbacks).forEach((cb:any)=>timeout(cb)) as any);
        const key = (callbackKey++);
        callbacks[key] = callback;
        if(apply)callback();
        return subscribe(()=>()=>(delete callbacks[key]));
    }
})();