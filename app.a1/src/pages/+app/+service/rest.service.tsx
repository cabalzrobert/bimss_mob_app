import { ready } from '../../../tools/plugins/ready';
import { device } from '../../../tools/plugins/device';
import { http } from '../../../tools/plugins/http';
import { storage } from '../../../tools/plugins/storage';

export const rest=(()=>{
    //const localhost = '210.213.236.203:5102';

    //  const localhost = '210.213.236.205:3122';
    //  const path:string = '/app/v1/subscriber/';

    //const localhost = 'localhost:19002';
    //const localhost = 'localhost:5000';
    //const localhost = '192.168.2.20:5000';

    //const localhost = '192.168.2.20:55504';

    //const localhost = 'localhost:55511';
    //const localhost = '122.52.219.195:55511';
    const localhost = '122.52.219.195:55511';
    //const localhost = '192.168.2.201:55511';

    //production
    //const localhost = '18.139.66.234:55507';


    //const localhost = 'LAPTOP-7MJEDSAK:55504';
    const path:string = '/app/v1/stl/';
    const httpLocalhost:string = ('http://'+localhost); // api
    // const httpLocalhost:string = ('http://localhost:38020');
    const wsLocalhost:string = ('ws://'+localhost);
    const headers:any = {
        'X-Requested-With': 'XMLHttpRequest', 
        'Content-Type': 'application/json-patch+json; application/json; charset=UTF-8;', 
    };
    var authorization = '';
    const rest = {
        ready:ready(),
        setBearer:(bearer:string)=>setBearer(bearer),
        post:(url:string, data:any={})=>post(url,data),
        get:(url:string)=>get(url),
        ws:(url:string='', includeBearer:boolean=false)=>ws(url,includeBearer),
        Post:(url:string, data:any={}, headers:any={})=>Post(url,data,headers),
        Get:(url:string, headers:any={})=>Get(url,headers),
        Download:(url:string, headers:any={})=>Download(url,headers),
        httpFullname:(url:string)=>httpFullname(url),
        endpoint:(url:string)=>endpoint(url),
    };
    
    device.ready(()=>setTimeout(async()=>{
        var auth = (await storage.Auth||{});
        if(!!auth.Token){
            rest.setBearer(auth.Token);
        }/*else{
            auth = await(storage.Auth = {token:'123123123weqewqewq'});
            rest.setBearer(auth.token);
        }*/
        rest.ready();
    },475));
    return rest;
    function setBearer(bearer:string){
        headers['Authorization'] = ('Bearer ' + (authorization = bearer));
        return rest;
    }
    function post(url:string, data:any={}){
        return Post(httpLocalhost + endpoint(url), data, headers);
    }
    function get(url:string) {
        return Get(httpLocalhost + endpoint(url), headers);
    }
    function ws(url:string='', includeBearer:boolean=false){
        var url = endpoint(url);
        if(includeBearer) url += ('?token=' + authorization);
        return (wsLocalhost + url);
    }
    function Post(url:string, data:any={}, headers:any={}){
        return http.post(url, data, { headers:headers });
    }
    function Get(url:string, headers:any={}){
        return http.get(url, {}, { headers:headers });
    }
    function Download(url:string, headers:any={}){
        return http.download(url, null, { headers:headers });
    }
    function httpFullname(url:string){
        return (httpLocalhost + (!url.startsWith('/')?'/':'') + url);
    }
    function endpoint(url:string){
        return (!!url?(url[0]=='/'?url:path+url):'');
    }
})();