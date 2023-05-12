import React from 'react';
import { proxy } from './proxy';
const{ Object }:any = window;

export const clearAfter=(callback:Function)=>{
    return (ev:any)=>{
        if(ev.target.value===undefined)return;
        ev.target.value = undefined;
        callback(ev);
    };
};

export const inputVal=(value:string)=>{
    return {
        detail:{ value:value }
    }
}
export const Input = (function(){
    return class Input extends React.Component<{
        input?:('input'|'popup'|'checkbox'),
        ion?:(boolean|'input'|'popup'),
        node:(handle:(props:{
            [index:string]:any;
            ref?:((ref:any)=>void)|React.RefObject<unknown>;
            onChange?:(ev:any)=>any;
        })=>any)=>any
    }>{
        handle=(props:any)=>(false as any);
        componentWillMount=()=>{
            const{ props } = this;
            var{ input, ion } = props;
            var handle = null;
            if(ion==true) ion = 'input';
            else if(input==undefined) input = 'input';
            if(ion!=undefined){
                if(ion=='input')
                    handle = handleIonInput();
                else if(ion=='popup')
                    handle = handleIonPopup();
            }else{
                if(input=='input')
                    handle = handleInput();
                else if(input=='popup')
                    handle = handlePopup();
                else if(input=='checkbox')
                    handle = handleCheckbox();
            }
            if(handle==null)return;
            this.handle = handle;
        }
        render(){
            const{ handle, props:{node} } = this;
            return node(handle);
        }
    }
    //Native HTML
    function handleInput(){
        var focused:boolean = false;
        return (props:any)=>{
            const retProps = {
                onChange:(ev:any)=>{
                    if(!focused) return;
                    (props.onChange&&props.onChange(ev));
                },
                onBlur:(ev:any)=>{
                    focused = false;
                    const detail = (ev.detail||{});
                    detail.value = ev.target.value;
                    (props.onChange&&props.onChange({detail}));
                },
                onFocus:(ev:any)=>{
                    focused = true;
                },
            };
            return retProps;
        };
    }
    function handlePopup(){
        return (props:any)=>{
            const retProps = {};
            return retProps;
        };
    }
    function handleCheckbox(){
        var focused:boolean = false;
        return (props:any)=>{
            const retProps = {
                onChange:(ev:any)=>{
                    if(!focused)return;
                    ev.detail = { value:!!ev.target.checked };
                    (props.onChange&&props.onChange(ev));
                    focused = false;
                },
                onClick:(ev:any)=>{
                    focused = true;
                },
            };
            return retProps;
        };
    }
    //Ionic 
    function handleIonInput(){
        var focused:boolean = false;
        return (props:any)=>{
            const retProps = {
                onIonChange:(ev:any)=>{
                    if(!focused) return;
                    (props.onChange&&props.onChange(ev));
                },
                onIonBlur:(ev:any)=>{
                    focused = false;
                    const detail = (ev.detail||{});
                    detail.value = ev.target.value;
                    (props.onChange&&props.onChange({detail}));
                },
                onIonFocus:(ev:any)=>{
                    focused = true;
                },
                onKeyPress:(ev:any)=>null,
            };
            if(!!props.hitEnter){
                const hitEnter = props.hitEnter;
                retProps.onKeyPress = (ev:any)=>{
                    if(ev.key!='Enter') return;
                    return hitEnter(ev);
                }
            }
            return retProps;
        };
    }
    function handleIonPopup(){
        var focused:boolean = false, clicked:boolean = true;
        return (props:any)=>{
            const retProps = {
                onIonChange:(ev:any)=>{
                    var trigger = props.clearAfter;
                    if(!trigger)
                        trigger = (focused&&clicked);
                    if(!trigger) return;
                    if(props.clearAfter){
                        if(ev.target.value===undefined)return;
                        ev.target.value = undefined;
                    }
                    (props.onChange&&props.onChange(ev));
                },
                onIonFocus:(ev:any)=>{
                    focused = true;
                },
                onClick:(ev:any)=>{
                    clicked = true;
                },
                ref:(actualRef:any)=>{
                    if(!actualRef)return;
                    var ref = actualRef;
                    const fns:any = {};
                    if((actualRef.tagName=='ION-SELECT'||actualRef.tagName=='ION-DATETIME')){
                        ref = proxy(actualRef,{
                            open:()=>{
                                focused = true;
                                clicked = true;
                                (actualRef.open&&actualRef.open());
                            },
                        });
                    }
                    if(Object.keys(fns).length>0)
                        ref = proxy(actualRef,fns);
                    const bind = (props.ref||null);
                    if(bind==null)return;
                    if(typeof(bind)!='function')
                        (bind as any).current = ref;
                    else bind(ref);
                },
            };
            return retProps;
        }
    }
})();
//
export const classNames = (function(){
    return Array.from(arguments).map((a:any)=>{
        if(typeof(a)!='object') return a;
        return Object.keys(a)
            .map((b:any)=>(!!a[b]?b:undefined))
            .filter((b:any)=>!!b).join(' ');
    }).filter((b:any)=>!!b).join(' ')
    .split(' ').filter((c,d,e)=>(e.indexOf(c)==d)).join(' ');
} as any);
export const styles = (()=>{
    const a:any = {};
    return (function(){
        return Array.from(arguments).reduce((b:any,c:any)=>{
            if(typeof(c)=='object'){
                return Object.assign(b,
                Object.keys(c).reduce((d:any,e:any)=>{
                    if(!c[e])return d;
                    const f = c[e];
                    e = ab(e);
                    d[e]=f;
                    return d;
                },{}));
            }
            return Object.assign(b,(!!a[c]?a[c]:(a[c]=aa(c))));
        },{});
    } as any);
    function aa(b:any){
        return (b||'').toString().split(';').reduce((c:any,d:any)=>{
            if(!!a[d]) return Object.assign(c,a[d]);
            if(!d)return c; 
            const h = d;
            var e = (d.split(':')[0]||'');
            if(!e)return c;
            d = d.substring(e.length+1);
            e = ab(e);
            const j:any = {};
            j[e]=(c[e]=d);
            a[h]=j;
            return c;
        },{});
    } 
    function ab(e:any){
        if(!e.startsWith('--')&&e.indexOf('-')>-1)
            e=e.split('-').map((f:any,g:number)=>(!f||g==0?f:`${f.charAt(0).toUpperCase()}${f.substring(1)}`)).join('');
        return e;
    }
})();