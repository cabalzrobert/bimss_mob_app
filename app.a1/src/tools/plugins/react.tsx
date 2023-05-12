import { mtCb } from "./static";

const{ Object }:any = window;

export const multiState=(instance?:any)=>{
    const callbacks:any = {};
    const component:any = (ref:any,callback:(state:any)=>any)=>{
        return (state:any)=>{
            if(!ref)return;
            const data = (callback(state)||{});
            Object.keys(data).forEach((key:any)=>{
                const temp = data[key];
                if(temp==null || temp==undefined)
                    delete data[key];
            });
            ref.setState(data);
        };
    };
    return (function(){
        const[obj, extra]:any = arguments;
        if(!(typeof(obj)=='string'||typeof(obj)=='number')){
            if(!!instance&&extra===true)
                instance.setState(obj);
            return Object.values(callbacks).forEach((callback:any)=>callback(obj));
        }
        if(obj==null||obj==undefined)return;
        if(!extra) return null;
        const id = obj, refCallback = extra;
        return (ref:any)=>callbacks[id]=component(ref,refCallback);
    } as (obj:{}|string|number, extra?:boolean|((state:any)=>any))=>any);
};