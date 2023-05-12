const{ Proxy }:any = window;

export const proxy = (object:any, fncs:any)=>{
    return new Proxy({},{ 
        get: get(object, fncs), 
        set: set(object),
    }); 
};
//helper
function get(object:any, fncs:any){
    return (target:any, key:string, value:any)=>{
        if(!!fncs[key]) return fncs[key];
        return object[key];
    };
}
function set(object:any){ 
    return (target:any, key:string, value:any)=>{
        return (object[key] = value), true; 
    }
}