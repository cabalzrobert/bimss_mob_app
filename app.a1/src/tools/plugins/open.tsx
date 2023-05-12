import { CallNumber } from '@ionic-native/call-number';
import { Alert } from '../components/+common/stack';
//
export const openDialer=(phoneNumber:string)=>{
    CallNumber.callNumber(phoneNumber, true)
        .then(res=>console.log('Launched dialer!', res))
        .catch(err=>Alert.showWarningMessage('Error launching dialer'));
}

export const openSms=(phoneNumber:string, body?:string)=>{
    var content = ';?';
    if(!!phoneNumber){
        //if(!phoneNumber.startsWith('+')) phoneNumber=('//'+phoneNumber);
        content = ';'+phoneNumber+'?';
    }
    if(!!body) content+= '&body='+encodeURIComponent(body);
    return window.open('sms:'+content);
}