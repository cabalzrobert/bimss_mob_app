import { Stomp, CompatClient } from '@stomp/stompjs';
import { mtArr, mtCb, mtObj, subscribe } from './static';

export const stomp=(url:any)=>{
    var urlObj = url;
    var client = ({} as CompatClient);
    var isConnected = false;
    var counterID:number = 0;
    const subscribes:any = {};
    const timer:any = {};
    const service = {
        setUrl:(url:any)=>(urlObj=url,service),
        get IsConnected(){ return isConnected; },
        connect:()=>(connect()),
        send:(destination:string, headers?:{[key: string]: any;}, body?:string)=>(!!isConnected&&client.send(destination, headers, body)),
        subscribe:(destination:string, callback:Function)=>subscription(destination,callback),
        disconnect:(callback:Function=mtCb)=>disconnect(callback),
    };
    return service;
    function parse(urlObj:any):string{
        var url:any = (typeof(urlObj)=='string'?urlObj:null);
        if(url===null){
            if(typeof(urlObj)=='function')
                url = urlObj();
            else url = (urlObj||'').toString();
        }
        return url;
    }
    function connect(){
        return disconnect(()=>{
            client = Stomp.over(()=>new WebSocket(parse(urlObj)));
            client.debug = (log:string)=>{};
            client.heartbeat.outgoing = 0; //20000;
            client.heartbeat.incoming = 0;
            client.reconnect_delay = 1000;
            client.onWebSocketError = (err:any)=>distribute('#error', err);
            client.connect({},()=>connected(), (err:any)=>{}, ()=>disconnected());
        });
    }
    function disconnect(callback:Function=mtCb){
        const connected = isConnected;
        isConnected = false;
        client.reconnect_delay = 0;
        if(!!connected&&!!client.forceDisconnect)
            client.forceDisconnect();   
        return !setTimeout(()=>callback(true),275); 
    }
    function subscription(destination:string, callback:Function){
        if(!destination) return subscribe(()=>()=>{});
        var destInfo = (subscribes[destination]||mtObj);
        const ID = ++counterID, hasSubscribe = (Object.keys(destInfo.callbacks||mtArr).length!=0);
        if(!hasSubscribe)
            subscribes[destination] = (destInfo = { callbacks: {}});
        destInfo.callbacks[ID] = callback;
        if(!hasSubscribe)
            pingSubscribe(destination, ID);
        return subscribe(()=>()=>{
            delete destInfo.callbacks[ID];
            setTimeout(()=>unsubscribe(destination));
        });
    }
    function timeoutPing(){
        if(!isConnected)return;
        if(timer.p1)clearInterval(timer.p1);
        timer.p1 = setTimeout(()=>sendPing(),30000);
    }
    function connected(){
        isConnected = true;
        const destinations = Object.keys(subscribes||{});
        if(!destinations||destinations.length<1) return;
        destinations.forEach((destination:any)=>pingSubscribe(destination));
        distribute('#connect', {});
        timeoutPing();
    }
    function sendPing(){
        if(!isConnected)return;
        client.send('#ping',{},'');
        timeoutPing();
    }
    function disconnected(){
        if(timer.p1)clearInterval(timer.p1);
        if(!isConnected)return;
        isConnected = false;
        distribute('#disconnect', {});
    }
    function distribute(destination:string, message:any){
        const callbacks:any[] = Object.values((subscribes[destination]||mtObj).callbacks||mtArr);
        if(callbacks.length<1) return;
        const data = (message.body?JSON.parse(message.body||'{}'):message);
        callbacks.forEach((cb:Function)=>setTimeout(()=>cb(data)));
        timeoutPing();
    }
    function pingSubscribe(destination:string, ID:any = null){
        if(!isConnected) return;
        if(destination.startsWith('#')){
            if(!!ID){
                if(destination=='#connect'){
                    return (subscribes[destination].callbacks[ID])({});
                }
            }
            return;
        }
        const destInfo = subscribes[destination];
        destInfo.subscription = client.subscribe(destination, (message)=>distribute(destination, message));
    }
    function unsubscribe(destination:string){
        const destInfo = (subscribes[destination]||mtObj);
        if(!destInfo) return;
        if(!destInfo.callbacks) return;
        const callbacks = Object.values(destInfo.callbacks||mtObj);
        if(callbacks.length>0) return;
        if(!destInfo.subscription) return;
        if(!!isConnected) destInfo.subscription.unsubscribe();
        delete destInfo.subscription;
    }
};