(function(){
    var _:any = window;
    var { JSON, Object, Date, FormData } = _;
    Object.assign(_, (function(){
        return { delay:delay, rdelay:rdelay, cb:cb, };
        function delay(callback:any, milisec:any){
            var timeout:any = null;
            return function(){
                var self = this, args = arguments;
                if (timeout !== null) clearTimeout(timeout);
                timeout = setTimeout(()=>{
                    callback.apply(self, args);
                }, milisec);
            };
        }
        function rdelay(callback:any, milisec:any) {
            var timeout:any = null;
            var resolves:any = []
            var hold:any = null, isuse = false;
            return function () {
                var self = this, args = arguments;
                var promise = new Promise(function (resolve, reject) {  //async(for func) await(return) 
                    if (timeout !== null) {
                        clearTimeout(timeout);
                        resolves.forEach(function (r:any) { r.resolve(hold); });
                        resolves = [];
                    }
                    timeout = window.setTimeout(function () {
                        timeout = null;
                        hold = callback.apply(self, args);
                        resolve(hold);
                    }, milisec);
                    resolves.push({ resolve: resolve, timeout });
                });
                return promise;
            };
        }
        function cb(that:any, callback:any) {
            return function(){ return callback.apply(that, arguments); };
        }
    })());
    Object.assign(Object, (function(){
        return { rcopy:CopyAsReference, isObject:IsObject, };
        function CopyAsReference(){
            var args = Array.from(arguments);
            if(args.length != 0) {
                var base = args.shift();
                if(args.length===0) return ObjCopy(base);
                else{
                    args=args.map(o=> ObjCopy(o)); 
                    args.unshift(base);
                    return Object.assign.apply(this, args);
                }
            }    
            return {};
        }
        function CopyAsReferencex2(){
            var args = Array.from(arguments);
            if(args.length != 0) {
                var base = args.shift();
                if(args.length===0) return ObjCopy(base);
                else{
                    args=args.map(o=> ObjCopy(o)); 
                    args.unshift(base);
                    return Object.assign.apply(this, args);
                }
            }    
            return {};
        }
        function IsObject (value:any) { return value && typeof value === 'object' && value.constructor === Object; }
        function IsArray (value:any) { return Array.isArray(value); }
    })());
    Object.assign(Array, (function(){
        return { remove:Remove, reduce:ReduceObj, merge:Merge, };
        function Remove(array:Array<any>, element:any, iscallback=false) {
            if(!iscallback){
                const index = array.indexOf(element);
                if (index !== -1) {
                  array.splice(index, 1);
                  return true;
                }
                return false;
            }else if(typeof element==='function'){
                var indexes:any=[], index;
                array.forEach((item, i)=>{
                    if(!!element.apply(Array,[item, i]))
                        indexes.push(i);
                });
                while((index=indexes.pop())>-1)
                    array.splice(index, 1);
            }
        }
        function ReduceObj(array:Array<any>, callback:any, items:any = {}){
            var arrObj=array.reduce(callback, {});
            Object.keys(items).map((key:any)=>{
                if(arrObj[key])
                    items[key]=Object.rcopy(arrObj[key], items[key]);
                return items[key];
            }).forEach((item:any)=>{
                if(array.indexOf(item) === -1)
                    array.push(item);
            });
            //var arrObj = array.reduce(callback, {});
            //console.log(['', arrObj, items]);
            return array;//Object.values(Object.rcopy(array.reduce(callback, {}), items));
        }
        function Merge(array:Array<any>, items:any){
            items.forEach((item:any)=>{
                var index = array.indexOf(item);
                if(array.indexOf(item) === -1)
                    array.push(item);
                //console.log(['index', index]);
            });
            //console.log([array, items]);
            return array;
        }
    })());
    Object.assign(Date.prototype, (function(){
        var MonthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
        var DayNames = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
        return { customFormat:customFormat, };
        function customFormat(formatString:any){
            var YYYY,YY,MMMM,MMM,MM,M,DDDD,DDD,DD,D,hhhh,hhh,hh,h,mm,m,ss,s,ampm,AMPM,dMod,th;
            YY = ((YYYY=this.getFullYear())+"").slice(-2);
            MM = (M=this.getMonth()+1)<10?('0'+M):M;
            MMM = (MMMM=MonthNames[M-1]).substring(0,3);
            DD = (D=this.getDate())<10?('0'+D):D;
            DDD = (DDDD=DayNames[this.getDay()]).substring(0,3);
            th=(D>=10&&D<=20)?'th':((dMod=D%10)==1)?'st':(dMod==2)?'nd':(dMod==3)?'rd':'th';
            formatString = formatString.replace("#YYYY#",YYYY).replace("#YY#",YY).replace("#MMMM#",MMMM).replace("#MMM#",MMM).replace("#MM#",MM).replace("#M#",M).replace("#DDDD#",DDDD).replace("#DDD#",DDD).replace("#DD#",DD).replace("#D#",D).replace("#th#",th);
            h=(hhh=this.getHours());
            if (h==0) h=24;
            if (h>12) h-=12;
            hh = h<10?('0'+h):h;
            hhhh = hhh<10?('0'+hhh):hhh;
            AMPM=(ampm=hhh<12?'am':'pm').toUpperCase();
            mm=(m=this.getMinutes())<10?('0'+m):m;
            ss=(s=this.getSeconds())<10?('0'+s):s;
            return formatString.replace("#hhhh#",hhhh).replace("#hhh#",hhh).replace("#hh#",hh).replace("#h#",h).replace("#mm#",mm).replace("#m#",m).replace("#ss#",ss).replace("#s#",s).replace("#ampm#",ampm).replace("#AMPM#",AMPM);
        }
    })());
    Object.assign(FormData.prototype, (function(){
        return { appendObj:appendObj };
        function appendObj(obj:any){
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    this.append(key, obj[key]);
                }
            }
        }
    })());
    //
    // Helper
    //
    function ObjCopy(obj:any) { return JSON.parse(JSON.stringify(obj, true)); }; //serializer(null, null)
    function serializer(replacer:any, cycleReplacer:any) {
        var stack:any = [], keys:any = []
    
        if (cycleReplacer == null) cycleReplacer = function(key:any, value:any) {
            if (stack[0] === value) return "[Circular ~]"
            return "[Circular ~." + keys.slice(0, stack.indexOf(value)).join(".") + "]"
        }
    
        return function(key:any, value:any) {
            if (stack.length > 0) {
                var thisPos = stack.indexOf(this)
                ~thisPos ? stack.splice(thisPos + 1) : stack.push(this)
                ~thisPos ? keys.splice(thisPos, Infinity, key) : keys.push(key)
                if (~stack.indexOf(value)) 
                    value = cycleReplacer.call(this, key, value)
            }
            else stack.push(value)
            return replacer == null ? value : replacer.call(this, key, value)
        }
    }
} as any).apply(window, []);

export {};