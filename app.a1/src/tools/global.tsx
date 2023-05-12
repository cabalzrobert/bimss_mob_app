import { mtArr } from "./plugins/static";

export const numberWithComma=(...args:any[])=>{
    var value = comma(args[0]);
    args.splice(0,1);
    if(value!==0 && !value) return null;
    var number = +value;
    if(number!==0 && !number) return value;
    var parts=number.toString().split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    var precision = 2;
    if(!!args[0] || typeof(args[0])=='number')
        precision = +args[0];
    if(precision!==0 && (!number && typeof(number)!='number'))
        precision = 2;
    if(precision==0) parts=[parts[0]];
    else parts[1] = (+((+('0.'+(+(parts[1]||0)))).toPrecision(precision))).toFixed(precision).toString().split('.')[1];
    return parts.join('.');
};

export const comma=(comma:any,def:any=null)=>{
    return (typeof(comma)=='number'?comma:(comma||def));
}

export const phoneNumber=(phoneNumber:string)=>{
    if(!(phoneNumber||'')) return phoneNumber;
    if(phoneNumber.startsWith('+63')||phoneNumber.startsWith('09')) return phoneNumber;
    return ('+'+phoneNumber);
}

const strongPasswordRegex:RegExp = new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{6,})');
export const isPassword=(password:string)=>{
    return strongPasswordRegex.test(password);
}
const emailRegex:RegExp = new RegExp('^[A-Z0-9_\'%=+!`#~$*?^{}&|-]+([\.][A-Z0-9_\'%=+!`#~$*?^{}&|-]+)*@[A-Z0-9-]+(\.[A-Z0-9-]+)+$', 'i');
export const isEmail=(email:string)=>{
    return emailRegex.test(email);
}
const alphaRegex:RegExp = new RegExp(`^[a-zA-Z ]*$`);
export const isAlpha=(text:string)=>{
    return alphaRegex.test(text);
}
const alphaNumericRegex:RegExp = new RegExp(`^[^0-9][a-zA-Z0-9]*$`);
export const isAlphaNumeric=(text:string)=>{
    return alphaNumericRegex.test(text);
}

export const tryBase64String=async(url:string)=>{
    var blob = await fetch(url).then(r => r.blob());
    var dataUrl:any = await new Promise(resolve => {
        let reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(blob);
    });
    return dataUrl.replace(/^data:(.*,)?/, '');
}

export const tryBase64Image=(img:HTMLImageElement)=>{
    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    var ctx:any = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    var dataURL = canvas.toDataURL("image/png");
    return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
}
export const tryBase64ImageFromURL=async(url:string)=>{
    return await new Promise<any>((resolve) => {
        let img = new Image();
        img.src = url;
        if (!img.complete) {
            img.onload=()=>resolve(tryBase64Image(img));
            img.onerror=(err:any)=>resolve(null);
        } else {
            resolve(tryBase64Image(img));
        }
    });
}
export const base64HTML=(html:string)=>{
    return btoa('<style>body{color:#262626;background:whitesmoke;}</style>' + html);
    //return btoa('<style>body{color:#fefed1}</style>' + html);
    // //btoa('<style>body{color:#fefed1}</style>'+item.MessageBody)
}
const elemTags:any = {'<':'&lt;', '>':'&gt;', '/':'&sol;', '&':'&amp;'};
export const escape=(html:string)=>{
    return (html||'').replace(/[</>&]/g, (m)=>(elemTags[m]||''));
}


const linkRegex:RegExp = /(https?:\/\/(?:www\.|(?!www))[^\s\.]+\.[^\s]{2,}|www\.[^\s]+\.[^\s]{2,})/gi;
export const tryLinks=(str:string)=>{
    var matches = str.match(linkRegex);
    if(!matches||matches.length<1) return [];
    var counterIndex = 0;
    return matches.map((match)=>{
        var temp = (counterIndex==0?str:str.substr(counterIndex));
        var startIndex = counterIndex + temp.indexOf(match);
        counterIndex = startIndex + match.length;
        return {
            link:match,
            startsAt: startIndex,
            endsAt: counterIndex,
        };
    });
}
export const tryExtractLinks=(str:string)=>{
    var matches = str.match(linkRegex);
    if(!matches||matches.length<1) return [str];
    var counterIndex = 0;
    var results:any = [];
    matches.forEach((match)=>{
        var temp = (counterIndex==0?str:str.substr(counterIndex));
        var index = temp.indexOf(match);
        var startIndex = counterIndex + index;
        if(index>0) results.push(temp.substr(0, index));
        counterIndex = startIndex + match.length;
        results.push({
            link:match,
            startsAt: startIndex,
            endsAt: counterIndex,
        });
    });
    return results;
}