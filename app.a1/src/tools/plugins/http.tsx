import axios from 'axios';
import moment from 'moment';
import { Observable, Subscription } from 'rxjs';
import { device } from './device';
import { mtCb, mtObj } from './static';
import { HTTP } from '@ionic-native/http';
//import { File } from '@ionic-native/file';
import { FileTransfer, FileTransferObject } from '@ionic-native/file-transfer';
import { Plugins, FilesystemDirectory, FilesystemEncoding } from '@capacitor/core';
const{ Filesystem } = Plugins;

export const http=(()=>{
    const provider = (device.isBrowser?provider0a:provider0b)();
    return {
        get:(url:string, params?:any, options:any={})=>provider.get(url,params,options)as Observable<any>,
        post:(url:string, params:any, options:any={})=>provider.post(url,params,options)as Observable<any>,
        download:(url:string, params?:any, options:any={})=>provider.download(url,params,options)as Observable<any>,
    };
    function provider0a(){
        const plugin = axios;//https://www.npmjs.com/package/axios
        return {
            get:(url:string, params?:any, options:any={})=>request('get',url, params,options),
            post:(url:string, params:any, options:any={})=>request('post',url, params,options),
            download:(url:string, params?:any, options:any={})=>download(url, params, options),
        };
        function request(method:string, url:string, params?:any, options:any={}){
            options.serializer = (!options.serializer?'json':options.serializer);
            options.responseType = (!options.responseType?'json':options.responseType);
            return Observable.create((observer:any)=>{
                var cancelToken:any = plugin.CancelToken.source();
                plugin.request({
                    method:(method as any),
                    url:url, data:params,
                    headers:(options.headers||{}),
                    responseType:options.responseType,
                    cancelToken:cancelToken.token,
                })
                .then((res)=>observer.next(response(options, res)))
                .catch(err=>observer.error({Status:'error',Message:err.message}))
                .finally(()=>observer.complete());
                return ()=>(!!cancelToken&&cancelToken.cancel());
            });
        }
        function response(options:any={}, response?:any){
            var body = null; 
            if(options.serializer=='raw'||options.responseType=='blob')
                body = response.data;
            else if(options.serializer=='json'||options.responseType=='json')
                body = response.data;
            else body = response.data;
            return body;
        }
        function download(url:string, params?:any, options:any={}){
            var catchError = false, isDone = false;
            return Observable.create((observer:any)=>{
                return !plugin.get(url,{
                    responseType: 'blob',
                    onDownloadProgress: (event) => {
                        if(isDone) return;
                        return observer.next({ 
                            type: 'progress',  
                            loaded: event.loaded,  
                            total: event.total,  
                            percentage: Math.round(100 * (event.loaded / event.total)),
                        });
                    }
                })
                .then((res)=>{
                    isDone = true;
                    observer.next({ 
                        type: 'completed', 
                        status: 'success',
                        body: new Blob([res.data]) //body: event.body 
                    });
                    observer.complete();
                })
                .catch(err=>{
                    catchError = true;
                    observer.error({ type:'download', status:'failed', error:err });
                    observer.complete();
                });
            });
        }
    }
    function provider0b(){
        const plugin = HTTP;
        return {
            get:(url:string, params?:any, options:any={})=>request('get',url, params,options),
            post:(url:string, params:any, options:any={})=>request('post',url, params,options),
            download:(url:string, params?:any, options:any={})=>download(url, params, options),
        };
        function request(method:any, url:any, params?:any, options:any={}){
            options.serializer = (!options.serializer?'json':options.serializer);
            options.responseType = (!options.responseType?'json':options.responseType);
            return Observable.create((observer:any)=>{
                plugin.setServerTrustMode('nocheck');
                var requestId:any = plugin.sendRequestSync(url,{
                    method:method, data:params,
                    headers:(options.headers||{}),
                    serializer:options.serializer,
                    responseType:options.responseType,
                }
                ,(res:any)=>(requestId=null,observer.next(response(options,res)),observer.complete())
                ,(err:any)=>(requestId=null,observer.error({Status:'error',Message:err.error}),observer.complete()));
                return ()=>(!!requestId&&plugin.abort(requestId));
            });
        }
        function response(options:any={}, response?:any){
            var body = null; 
            if(options.serializer=='raw'||options.responseType=='blob')
                body = response.data;
            else if(options.serializer=='json'||options.responseType=='json')
                body = response.data;
            else body = response.data;
            return body;
        }
        //#file Opener
        //https://github.com/ionic-team/capacitor/issues/1663
        function download(url:string, params?:any, options:any={}) {
            return Observable.create((observer:any)=>{
                const type = (device.isAndroid?FilesystemDirectory.ExternalStorage:FilesystemDirectory.Cache);
                Filesystem.getUri({
                    directory: type,
                    path: '/'
                }).then(async(result)=>{
                    const xpath = (type==FilesystemDirectory.ExternalStorage?'/Download/':'/');
                    const transfer = FileTransfer.create();
                    var isDone = false;
                    transfer.onProgress((event:any) => {
                        if(isDone) return;
                        return observer.next({ 
                            type: 'progress',  
                            loaded: event.loaded,  
                            total: event.total,  
                            percentage: Math.round(100 * (event.loaded / event.total)),
                        });
                    });
                    const tempfile = (`temp${moment(new Date()).format('YYMMDDHHmmss')}.tmp`);
                    const filepath = (xpath + tempfile);
                    transfer.download(url, (result.uri + filepath), true).then((event)=>{
                        isDone = true;
                        var response:any = { type: 'completed' };
                        Filesystem.readFile({directory:type,path:filepath})//,encoding:FilesystemEncoding.UTF8
                        .then((res)=>{
                            Filesystem.deleteFile({directory:type,path:filepath});
                            response.body = res.data; //res
                            response.status = 'success';
                            observer.next(response);
                        }).catch((err)=>{
                            response.error = err;
                            response.status = 'failed';
                            observer.error(response);
                        }).finally(()=> observer.complete());
                    }, (err) => {
                        observer.error({ type:'download', status:'failed', error:err });
                        observer.complete();
                    });
                },async(err)=>{
                    observer.error({ type:'download', status:'failed', error:err });
                    observer.complete();
                });
            });
        }
    }
})();