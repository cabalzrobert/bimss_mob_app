import { Observable, Subscription } from 'rxjs';
//
export const mtCb=()=>{};
export const mtPCb:any=async()=>{};
export const mtObj={};
export const mtArr:any=[];
//
export const subscribe=(callback:Function):Subscription=>Observable.create(callback).subscribe();