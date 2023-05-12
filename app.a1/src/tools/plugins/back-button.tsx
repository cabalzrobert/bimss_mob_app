import { Observable, Subscription } from 'rxjs';
import { actionSheetController, pickerController, modalController, menuController } from '@ionic/core';
import { mtCb, subscribe } from './static';
const{ Object }:any = window;
const{ addEventListener }:any = document;

export const backButton=(()=>{
    const callbacks:any = {};
    var callbackKey = 0;
    addEventListener('ionBackButton',async(ev:any)=>{
        Object.values(callbacks).forEach(
            (o:any)=>ev.detail.register(o.priority, 
                async(processNextHandler:any)=>await o.callback(processNextHandler)));
        ev.detail.register(9999,async(processNextHandler:any)=>{
            if(await getTopControllers())return;
            processNextHandler();
        });
    });
    const modals:any[] = []; //ViewerModalComponent
    return {
        subscribeWithPriority:(priority:any, callback:Function=mtCb):Subscription=>{
            const key = (callbackKey++);
            const info = (callbacks[key] = { priority:priority, callback:callback });
            return subscribe(()=>()=>(delete callbacks[key]));
        },
    };
    async function getTopControllers(){
        var picker = await pickerController.getTop();
        if(picker){
            await picker.dismiss();
            return true;
        }
        var actionSheet = await actionSheetController.getTop();
        if(actionSheet){
            await actionSheet.dismiss();
            return true;
        }
        const modal = await modalController.getTop();
        if(!!modal){
            if(modals.indexOf(modal.component)>=0){
                await modalController.dismiss();
                return true;
            }
            return false;
        }
        if(await menuController.isOpen()){
            await menuController.close();
            return true;
        }
        return false;
    }
})();

