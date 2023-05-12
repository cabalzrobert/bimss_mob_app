import React from 'react';
import styled from 'styled-components';
import { mtCb } from '../../plugins/static';

const{ Object, $ }:any = window;

interface ContainerProps {
    onReady?: Function;
}
export default class ytPlayerView extends React.Component<ContainerProps> {
    state:any = { swaps:[], isPerforming:false };
    private iframe:any;
    private bridge:any;
    componentDidMount=()=>{
        setTimeout(()=>(this.props.onReady||mtCb)());
    }

    hClick=()=>{
        //console.log(this);
    }

    public State = { BUFFERING: 3, CUED: 5, ENDED: 0, PAUSED: 2, PLAYING: 1, UNSTARTED: -1 };
    public playVideoId(videoId:string, options:any={}, callback:Function=mtCb){
        if(!!this.bridge) this.bridge().unbind();
        this.createFrame(()=>{
            this.loadApi(()=>{
                this.initPlayer(videoId, options, ()=>{
                    if(!!callback)callback();
                });
            });
        });
    }
    public playVideoUrl(videoUrl:string, options:any={}, callback:Function=mtCb){
        var res:any = videoUrl.match(/(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)/);
        if(!res[1])return;
        this.playVideoId(res[1], options, callback);
    }
    public async onStateChange(callback:Function){
        await this.bridge('player.addEventListener', ['onStateChange', callback]);
    }
    public async mute(){
        await this.bridge('player.mute');
    }
    public async unMute(){
        await this.bridge('player.unMute');
    }
    public async pause(){
        await this.bridge('player.pauseVideo');
    }
    public async play(){
        await this.bridge('player.playVideo');
    }
    public async isMuted(){
        return await this.bridge('player.isMuted');
    }
    /*********************************************/
    private async loadApi(callback:Function){
        await this.bridge('loadApi', [callback]);
    }
    private async initPlayer(videoId:string, options:any, callback:Function){
        await this.bridge('initPlayer', [videoId, options, callback]);
    }
    /*********************************************/
    private createFrame(callback:Function){
        var $iframe = $('<iframe allow="autoplay; encrypted-media;" sandbox="allow-forms allow-scripts allow-pointer-lock allow-same-origin allow-top-navigation" />')
                        .css({'border':'0', 'width':'100%', 'height':'100%' });
        var iframe = this.iframe = $iframe[0];
        iframe.src = ytPlayerHtml;
        iframe.onload = (()=>{
            this.bridge = createBridge(iframe.contentWindow);
            if(!!callback)callback();
        });
        $(this.container).html(iframe);
    }
    //https://www.npmjs.com/package/cordova-plugin-whitelist
    shouldComponentUpdate=()=>false;
    container:any = null;
    render() {
        return (<>
<Container ref={(ref)=>this.container=ref} onClick={this.hClick}/>
        </>);
    };
    
}

/*
#container (click)="handleClick($event)"
*/
const ytPlayerHtml = './assets/static/ytPlayer.htm';//ytiframedata = 'data:text/html;base64,PCFET0NUWVBFIGh0bWw+CjxodG1sPgo8aGVhZD4KPG1ldGEgbmFtZT0idmlld3BvcnQiIGNvbnRlbnQ9IndpZHRoPWRldmljZS13aWR0aCwgaW5pdGlhbC1zY2FsZT0xLjAsIG1heGltdW0tc2NhbGU9MS4wLCB1c2VyLXNjYWxhYmxlPW5vIj4KPHN0eWxlPmh0bWwsIGJvZHl7b3ZlcmZsb3c6IGhpZGRlbjtoZWlnaHQ6IDEwMCU7bWFyZ2luOiAwcHg7fWlmcmFtZXtoZWlnaHQ6MTAwJTt3aWR0aDoxMDAlO308L3N0eWxlPgo8L2hlYWQ+CiAgPGJvZHk+CiAgICA8ZGl2IGlkPSJwbGF5ZXIiPjwvZGl2PgoJPHNjcmlwdD4KCXdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgKCgpPT57CgkJdmFyIF8gPSB3aW5kb3c7CgkJcmV0dXJuIGZ1bmN0aW9uKGUpewoJCQlpZigoZS5vcmlnaW58fCcnKS5pbmRleE9mKCdsb2NhbGhvc3QnKTwwKXJldHVybjsKCQkJdmFyIGRhdGEgPSBKU09OLnBhcnNlKGUuZGF0YXx8J3t9Jyk7CgkJCWlmKGRhdGEuaWQmJmRhdGEubil7CgkJCQlpZighZGF0YS50KW4oZGF0YSwgZSk7CgkJCQllbHNlIGlmKGRhdGEudD09J2xpc3RlbmVyJylubChkYXRhLCBlKTsKCQkJfQoJCX0KCQlmdW5jdGlvbiBuKGRhdGEsIGUpewoJCQl2YXIgcyA9IGRhdGEubi5zcGxpdCgnLicpOwoJCQlpZighcylyZXR1cm47CgkJCXZhciBrID0gcywgb2JqID0gXzsKCQkJaWYocy5sZW5ndGg+MSl7CgkJCQlrID0gcy5wb3AoKTsKCQkJCW9iaj1zLnJlZHVjZSgobyxpKT0+b1tpXSwgb2JqKTsKCQkJfQoJCQl2YXIgbyA9IChvYmpba10pOwoJCQlpZih0eXBlb2Yobyk9PSdmdW5jdGlvbicpCgkJCQlkYXRhLnIgPSAoby5hcHBseShvYmosIGRhdGEuZCl8fHVuZGVmaW5lZCk7CgkJCWVsc2UgZGF0YS5yID0gKG98fHVuZGVmaW5lZCk7CgkJCXBhcmVudC5wb3N0TWVzc2FnZShKU09OLnN0cmluZ2lmeShkYXRhKSxlLm9yaWdpbik7CgkJfQoJCWZ1bmN0aW9uIG5sKGRhdGEsIGUpewoJCQl2YXIgcyA9IGRhdGEubi5zcGxpdCgnLicpOwoJCQlpZighcylyZXR1cm47CgkJCXZhciBrID0gcywgb2JqID0gXzsKCQkJaWYocy5sZW5ndGg+MSl7CgkJCQlrID0gcy5wb3AoKTsKCQkJCW9iaj1zLnJlZHVjZSgobyxpKT0+b1tpXSwgb2JqKTsKCQkJfQoJCQl2YXIgbyA9IChvYmpba10pOwoJCQlpZih0eXBlb2YobykhPSdmdW5jdGlvbicpIHJldHVybjsKCQkJdmFyIG5kID0gZGF0YS5kLm1hcCgobSwgaSk9PnsKCQkJCWlmKG0hPSdmKCl7fScpIHJldHVybiBtOwoJCQkJcmV0dXJuIChmdW5jdGlvbigpewoJCQkJCXZhciBuZCA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoZGF0YSkpOyAKCQkJCQluZC5pID0gaTsgbmQuciA9IE9iamVjdC52YWx1ZXMoYXJndW1lbnRzKTsKCQkJCQlwYXJlbnQucG9zdE1lc3NhZ2UoSlNPTi5zdHJpbmdpZnkobmQpLGUub3JpZ2luKTsKCQkJCX0pOwoJCQl9KTsKCQkJKG8uYXBwbHkob2JqLCBuZCkpOwoJCX0KCX0pKCksIGZhbHNlKTsKCTwvc2NyaXB0PgogICAgPHNjcmlwdD4KCXZhciBwbGF5ZXIgPSB7fTsKCXZhciBvcHRpb25zID0gewoJCWF1dG9wbGF5OiAwLCAvLzEKCQljb250cm9sczogMSwKCQltb2Rlc3RicmFuZGluZzogMSwKCQlwbGF5c2lubGluZTogMCwKCQlkaXNhYmxla2I6MSwKCQljY19sb2FkX3BvbGljeTowLAoJCWNjX2xhbmdfcHJlZjowLAoJCXNob3dpbmZvOjAsCgkJcmVsIDogMCwKCX07Cgl2YXIgaXNQbGF5ZXJSZWFkeSA9IGZhbHNlOwoJdmFyIGlzQXBpUmVhZHkgPSBmYWxzZTsKCXZhciBhcGlDYWxsYmFjayA9IG51bGw7Cgl2YXIgcGxheWVyQ2FsbGJhY2sgPSBudWxsOwoJZnVuY3Rpb24gbG9hZEFwaShjYWxsYmFjaz1udWxsKXsKCQlhcGlDYWxsYmFjayA9IGNhbGxiYWNrOwoJCXZhciB0YWcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKTsKCQl0YWcuc3JjID0gImh0dHBzOi8vd3d3LnlvdXR1YmUuY29tL2lmcmFtZV9hcGkiOwoJCXZhciBmaXJzdFNjcmlwdFRhZyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdzY3JpcHQnKVswXTsKCQlmaXJzdFNjcmlwdFRhZy5wYXJlbnROb2RlLmluc2VydEJlZm9yZSh0YWcsIGZpcnN0U2NyaXB0VGFnKTsKCX0KCWZ1bmN0aW9uIG9uWW91VHViZUlmcmFtZUFQSVJlYWR5KCl7CgkJaXNBcGlSZWFkeSA9IHRydWU7CgkJaWYoIWFwaUNhbGxiYWNrKXJldHVybjsKCQlhcGlDYWxsYmFjaygpOwoJfQoJZnVuY3Rpb24gaW5pdFBsYXllcih2aWRlb0lkLCBvcHRzLCBjYWxsYmFjaz1udWxsKXsJCgkJcGxheWVyQ2FsbGJhY2sgPSBjYWxsYmFjazsKCQlpZighIW9wdHMpewoJCQlpZihvcHRzLmhhc093blByb3BlcnR5KCdhdXRvcGxheScpKSBvcHRpb25zLmF1dG9wbGF5PShvcHRzLmF1dG9wbGF5PT10cnVlPzE6MCk7CgkJCWlmKG9wdHMuaGFzT3duUHJvcGVydHkoJ2NvbnRyb2xzJykpIG9wdGlvbnMuY29udHJvbHM9KG9wdHMuY29udHJvbHM9PXRydWU/MTowKTsKCQl9CgkJcGxheWVyID0gbmV3IFlULlBsYXllcigncGxheWVyJywgewoJCQl2aWRlb0lkOiB2aWRlb0lkLAoJCQlwbGF5ZXJWYXJzOiBvcHRpb25zLAoJCQlldmVudHM6IHsgb25SZWFkeTogb25QbGF5ZXJSZWFkeSB9CgkJfSk7Cgl9CglmdW5jdGlvbiBvblBsYXllclJlYWR5KGV2ZW50KSB7CgkJaXNQbGF5ZXJSZWFkeSA9IHRydWU7CgkJaWYob3B0aW9ucy5hdXRvcGxheSl7CgkJCXNldFRpbWVvdXQoKCk9PnsKCQkJCWlmKHBsYXllci5nZXRQbGF5ZXJTdGF0ZSgpPT1ZVC5QbGF5ZXJTdGF0ZS5VTlNUQVJURUQpewoJCQkJCXBsYXllci5tdXRlKCk7CgkJCQkJcGxheWVyLnBsYXlWaWRlbygpOwoJCQkJfQoJCQl9LDc1MCk7CgkJfQoJCWlmKCFwbGF5ZXJDYWxsYmFjaylyZXR1cm47CgkJcGxheWVyQ2FsbGJhY2soKTsKCX0KICAgIDwvc2NyaXB0PgogIDwvYm9keT4KPC9odG1sPg==';
function createBridge(iframeWindow:any){
    var childWindow = iframeWindow;
    window.addEventListener('message', handleMessage, false);
    var counterId = +(new Date());
    var callbacks:any = {};
    var obj = {unbind:unbind};
    return (function(notation=null, values:any=null){
        if(arguments.length==0) return obj;
        var id = ++counterId;
        if(!values) values=[];
        if(!values.find((f:any)=>(typeof(f)=='function'))){
            return new Promise((res,rej) => {
                callbacks[id]=((ret:any)=>res(ret));
                post({ id:id, n:notation, d:values });  //--, r
                setTimeout(()=> rej(undefined), 60000);
            });
        }
        var mixValues = values.map((m:any)=>(typeof(m)!='function'?m:'f(){}'));
        callbacks[id]=((ret:any, i:any)=>(values[i].apply(this, ret)));
        post({ id:id, n:notation, d:mixValues, t:'listener' });
    });
    function post(msg:any){
        return childWindow.postMessage(JSON.stringify(msg),'*');
    }
    function unbind(){
        return window.removeEventListener('message', handleMessage, false);
    }
    function handleMessage(ev:any){
        //console.log(['Message received', e.data, e]);
        //if (e.origin==='localhost') {
            var data = JSON.parse(ev.data);
            if(data.id&&data.n){
                var cb = (callbacks[data.id]);
                if(!cb)return;
                (cb.apply(this, [data.r, data.i]));
            }
        //}
    }
}

//styles
const Container = styled.div`
height: 100%;
width: 100%;
`;