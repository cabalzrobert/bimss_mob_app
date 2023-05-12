import moment from 'moment';
import { device } from '../../tools/plugins/device';
import { rest } from './+service/rest.service';
//import { File } from '@ionic-native/file';
import { Plugins, FilesystemDirectory, FilesystemEncoding } from '@capacitor/core';
import { http } from '../../tools/plugins/http';
import { toast } from '../../tools/plugins/toast';
import { FileOpener } from '@ionic-native/file-opener';
import { Loading } from '../../tools/components/+common/stack';
import { thermalPrinter } from '../../tools/plugins/therminal-printer';
import { jCompany, jUser } from './user-module';
import { numberWithComma, tryBase64String } from '../../tools/global';

const{ Filesystem } = Plugins;
const{ Object }:any = window;

const GameLogos:any={
    SWER2:'./assets/img/img_stl_swer2.png',
    SWER3:'./assets/img/img_stl_swer3.png',
    PARES:'./assets/img/img_stl_pares.png',
};

export const Ticket=(ticket:any):any=>{
    if(!ticket) return;
    ticket.GameLogo = (GameLogos[ticket.BetType]||'');
    //
    return ticket;
}

export const SmsTicket=(sms:string):any=>{
    if(!sms)return;
    var split = sms.split('|');
    var TransactionNo = (split[0]||'0').padStart(8,'0');
    var DatePosted = moment.utc(parseInt(split[1], 16) * 1000);
    var DateDrawed = moment.utc(parseInt(split[3], 16) * 1000);
    return Ticket({
        TransactionNo: TransactionNo,
        BetType: split[2],
        DateDrawed:(DateDrawed.format('yyyy-MM-DD')+'('+split[4]+')'),
        DateoPosted:DatePosted.format('yyyy-MM-DD'),
        TimeoPosted:DatePosted.format('HH:mm:ss A'),
        TotalStraightAmount: +(split[5]||0),
        TotalRumbleAmount: +(split[6]||0),
    });
} 

export const SmsTicket2=(ticket:any, sms:string):any=>{
    if(!sms)return ticket;
    Object.rcopy(ticket, { TotalStraightAmount:0, TotalRumbleAmount:0, TotalBetCount:0, TotalBetAmount:0, });
    ticket.Draws = sms.split('I').filter((f:any)=>!!f).map((b:any, idx:any)=>(b=b.split('.'),{ 
        IsSoldOut: (b[1]==='0'), Combination:b[0],
        TransactionNo:ticket.TransactionNo, SequenceNo:(idx+1), StraightAmount: +(b[2]||0), RumbleAmount: +(b[3]||0), 
    }));
    ticket.TotalBetCount = ticket.Draws.length;
    ticket.Draws.reduce((t:any,b:any)=>(t.TotalStraightAmount+=b.StraightAmount,t.TotalRumbleAmount+=b.RumbleAmount,t.TotalBetAmount+=(b.StraightAmount+b.RumbleAmount),t),ticket);
    return ticket;
} 

export const SmsResult=(sms:string):any=>{
    if(!sms)return;
    var split = sms.split('|');
    var DatePosted = moment.utc(parseInt(split[0], 16) * 1000);
    var DateDrawed = moment.utc(parseInt(split[2], 16) * 1000);
    var Numbers = (split[4]||'').split('-').map((n:any)=>(n||'').trim());
    return Ticket({
        Transaction:split[0],
        DateoPosted:DatePosted.format('yyyy-MM-DD'),
        TimeoPosted:DatePosted.format('HH:mm:ss A'),
        BetType: split[1],
        DateDrawed:(DateDrawed.format('yyyy-MM-DD')+'('+split[3]+')'),
        Numbers:Numbers,
    });
} 

export const WinTicket=(info:any)=>{
    var ticket = (info.Ticket = Ticket(info.Ticket));
    info.GameLogo = ticket.GameLogo;
    info.DateDrawed = ticket.DateDrawed;
    info.DateoPosted = ticket.DateoPosted;
    info.TimeoPosted = ticket.TimeoPosted;
    return info;
}
export const GameResult=(result:any)=>{
    result.Title = ('STL ' + result.BetType);
    result.GameLogo = (GameLogos[result.BetType]||'');
    result.Numbers = result.Numbers.split('-');
    return result;
}
export const Customer=(subscriber:any)=>{
    if(!subscriber.DisplayName){
        if(!!subscriber.Fullname) subscriber.DisplayName = subscriber.Fullname;
        else subscriber.DisplayName = (subscriber.Firstname + ' ' + subscriber.Lastname);
    }
    if(!!subscriber.ImageUrl){
        var url = (subscriber.ImageUrl||'').toString();
        if(!(url.startsWith('http://')||url.startsWith('https://')))
        subscriber.ImageUrl = rest.httpFullname(subscriber.ImageUrl);
    }
    return subscriber;
}
export const Member=(subscriber:any)=>{
    if(!subscriber.DisplayName){
        if(!!subscriber.Fullname) subscriber.DisplayName = subscriber.Fullname;
        else subscriber.DisplayName = (subscriber.Firstname + ' ' + subscriber.Lastname);
    }
    if(!!subscriber.ImageUrl){
        var url = (subscriber.ImageUrl||'').toString();
        if(!(url.startsWith('http://')||url.startsWith('https://')))
        subscriber.ImageUrl = rest.httpFullname(subscriber.ImageUrl);
    }
    return subscriber;
}
export const Sitio_List=(sit:any)=>{
    sit.SIT_NM=sit.SIT_NM;
    sit.SIT_ID=sit.SIT_ID;
    return sit;
}

export const Ledger=(ledger:any)=>{
    ledger.Title = 'Unknown amount';
    if(ledger.IsConvertToGameCredit)
        ledger.Title = 'Converting to game credit'; // with Ref# + ledger.TransactionNo;
    else if(ledger.IsConvertToWinCredit)
        ledger.Title = 'Convert to win credit'; // with Ref# + ledger.TransactionNo;
    else if(ledger.IsTranferCredit){
        if(ledger.IsReceived) ledger.Title = 'Received account credit from #' + ledger.AccountID;
        else ledger.Title = 'Transfer account credit to #' + ledger.AccountID;
    }/*else if(ledger.IsReturn){
        if(ledger.IsCancelled) ledger.Title = 'Return credit due to cancelled Fight#' + ledger.FightNo;
        else if(ledger.IsDraw) ledger.Title = 'Return credit due to draw Fight#' + ledger.FightNo;
        else ledger.Title = 'Return credit';
    }*/else if(ledger.IsPlay) ledger.Title = 'Play Bet: TicketNo#' + ledger.TransactionNo;
    else if(ledger.IsCommission){
        if(ledger.IsReceived){
            if(ledger.IsFromArena) ledger.Title = 'Received commission from Fight#' + ledger.FightNo;
            else ledger.Title = 'Received commission from #' + ledger.AccountID;
        }else ledger.Title = 'Claimed commission with Ref#' + ledger.TransactionNo;
    }else if(ledger.IsReceived||ledger.IsSold){
        if(!!ledger.AccountID){
            if(ledger.IsReceived) ledger.Title = 'Received credit from #' + ledger.AccountID;
            else ledger.Title = 'Sold credit to #' + ledger.AccountID;
        }else{
            if(ledger.IsReceived) ledger.Title = "Unknown: Received credit";
            else ledger.Title = "Unknown: Sold credit";
        }
    }
    //
    ledger.dBegBal = numberWithComma(ledger.BeginningBalance);
    ledger.dCredit = numberWithComma(ledger.Credit>0?ledger.Credit:'-');
    ledger.dDebit = numberWithComma(ledger.Debit>0?ledger.Debit:'-');
    ledger.dEndBal = numberWithComma(ledger.EndBalance);
    ledger.TimeTransaction = (ledger.TimeTransaction||'').toUpperCase();
    return ledger;
}
export const Notify=(notify:any)=>{
    var title = (notify.Title||'').toLowerCase();
    var type = (notify.Type||'');
    notify.Icon = './assets/img/profile_announcement_icon.png';
    if(type=='announcement')
        notify.Icon = './assets/img/profile_announcement_icon.png';
    else if(type=='app-update')
        notify.Icon = './assets/img/icon_alert.png';
    else if(type=='streaming')
        notify.Icon = './assets/img/icon_youtube.png';
    else if(type.startsWith('win'))
        notify.Icon = './assets/img/profile_winnings_icon.png';
    else if(type=='encashment')
        notify.Icon = './assets/img/profile_buy_credits.png';
    else if(type=='load-approved' || type=='load-received')
        notify.Icon = './assets/img/icon_bag_coin.png';
    else if(type=='load-requested')
        notify.Icon = './assets/img/img_claim_cash.png';
    else if(type=='post-result'){
        if(title.indexOf('swer3')>-1) notify.Icon = './assets/img/img_stl_swer3.png';
        else if((title.indexOf('swer2')>-1 || title.indexOf('d2')>-1)) 
            notify.Icon = './assets/img/img_stl_swer2.png';
        else if(title.indexOf('pares')>-1) notify.Icon = './assets/img/img_stl_pares.png';
    }
    return notify;
}

export const downloadLatestApp = async(url:string)=>{
    if(device.isBrowser)return;
    const loading = await Loading.create({
        message: 'Please wait...',
        onDidBackdrop:()=>false,
    });
    await loading.present();
    //
    const type = (device.isAndroid?FilesystemDirectory.ExternalStorage:FilesystemDirectory.Cache);
    Filesystem.getUri({
        directory: type,
        path: '/'
    }).then(async(result)=>{
        const xpath = (type==FilesystemDirectory.ExternalStorage?'/Download/':'/');
        setTimeout(()=>{
            var isError = false;
            http.download(url).subscribe(async(res:any) => {
                if(isError) return;
                if (res.type == 'progress') {
                    loading.message = ('Downloading.. <b>'+res.percentage+'%</b>');
                } else if (res.type == 'completed') {
                    toast('Download complete!');
                    loading.message = 'Attemp to open file.<br/>Please wait..';
                    //
                    var pkg = device.appId;
                    let tempfile = (xpath + pkg + '.apk');
                    //await Filesystem.deleteFile({ path:tempfile, directory:type, });
                    await Filesystem.writeFile({directory:type, path:tempfile, data:res.body }); //, encoding:FilesystemEncoding.UTF8
                    await loading.dismiss();
                    setTimeout(()=>
                        FileOpener.open((result.uri + tempfile), 'application/vnd.android.package-archive')  //filePath+'/'
                            .then(()=>toast('Launch application installer'))
                            .catch(err=>toast('Error opening file')));
                }
            },async(err:any)=>{
                isError = true;
                toast('Failed to download app');
                await loading.dismiss();
            });
        }, 1000);
    },async(err)=>{
        await loading.dismiss();
    });
    await loading.onDidDismiss();
}


export const printTicket=async(ticket:any)=>{
    if(!await thermalPrinter.checkPrinters())return;
    const company:any = await jCompany();
    const user:any = await jUser(); //getBase64String
    await thermalPrinter.printBitmap(await tryBase64String('./assets/img/img_pcso_print.png'), 1, 4);
    await thermalPrinter.printBlankLines(1, 16);
    await thermalPrinter.printTextAlignWithFont('PCSO\n', 'ST', 32, 1);
    //await thermalPrinter.printBlankLines(1, 16); //20
    await thermalPrinter.printTextAlignWithFont('VDVC-STL\n', 'ST', 32, 1);
    //await thermalPrinter.printTextAlignWithFont(company.CompanyName+'\n', 'ST', 24, 1);
    //await thermalPrinter.printTextAlignWithFont(company.CompanyAddress+'\n', 'ST', 24, 1);
    await thermalPrinter.printBlankLines(1, 16); //30
    await thermalPrinter.printTextAlignWithFont('OFFICIAL TICKET\n', 'ST', 32, 1);
    //await thermalPrinter.printTextAlignWithFont('Terminal No: 001\n', 'ST', 24, 1);
    await thermalPrinter.printTextAlignWithFont('Terminal: '+device.uuid+'\n', 'ST', 24, 1); //device.uuid device.serial //Serial No: ('abcdef1234567890')
    await thermalPrinter.printTextAlignWithFont('Teller ID: '+user.AccountID+'\n', 'ST', 24, 1);
    await thermalPrinter.printTextAlignWithFont('Teller Name: '+user.Firstname+'\n', 'ST', 24, 1);
    //
    //await thermalPrinter.printBlankLines(1, 30); // not exist
    await thermalPrinter.printTextAlignWithFont('Ticket No: '+ticket.TransactionNo+'\n', 'ST', 24, 1);
    //await thermalPrinter.printTextAlignWithFont('Game: '+ticket.BetType+'\n', 'ST', 24, 1);
    await thermalPrinter.printTextAlignWithFont('Date: '+(((ticket.DateoPosted||'').replace(', ',','))+' '+ticket.TimeoPosted)+'\n', 'ST', 24, 1);
    //await thermalPrinter.printTextAlignWithFont('Draw: '+ticket.DateDrawed+'\n', 'ST', 24, 1);
    await thermalPrinter.printTextAlignWithFont('Customer: '+(ticket.Customer||'-')+'\n', 'ST', 24, 1);
    if(!!ticket.RequestDate) await thermalPrinter.printTextAlignWithFont('Reprint: '+(ticket.RequestDate||'✔').replace(', ',',')+'\n', 'ST', 24, 1);
    //
    await thermalPrinter.printBlankLines(1, 16); // not exist
    await thermalPrinter.setAlignment(0);
    await thermalPrinter.setFontSize(24);
    var widthArr = [7, 6, 6, 8], alignArr = [1, 1, 1, 1];
    var textArr = ['COMBI', 'S', 'R', 'STAT'];
    await thermalPrinter.printColumnsText(textArr, widthArr, alignArr, 1);
    for(var b of ticket.Draws){
        textArr[0] = (b.Combination||b.Numbers);
        textArr[1] = textArr[2] = '-';
        textArr[3] = 'S/O';
        if(!b.IsSoldOut){
            textArr[1] = (b.StraightAmount>0?b.StraightAmount:'-');
            textArr[2] = (b.RumbleAmount>0?b.RumbleAmount:'-');
            textArr[3] = 'OK';
        }
        await thermalPrinter.printColumnsText(textArr, widthArr, alignArr, 1);
    }
    textArr[0] = 'TOTAL';
    textArr[1] = (ticket.TotalStraightAmount>0?ticket.TotalStraightAmount:'-');
    textArr[2] = (ticket.TotalRumbleAmount>0?ticket.TotalRumbleAmount:'-');
    textArr[3] = '';
    await thermalPrinter.printColumnsText(textArr, widthArr, alignArr, 0);
    await thermalPrinter.printBlankLines(1, 16);
    await thermalPrinter.printTextAlignWithFont('Total Transaction: '+ticket.TotalBetCount+'\n', 'ST', 24, 0);
    await thermalPrinter.printTextAlignWithFont('Total Amount: '+ticket.TotalBetAmount+'\n', 'ST', 24, 0);
    //await thermalPrinter.printBlankLines(1, 20);
    //await thermalPrinter.setAlignment(1);
    //await thermalPrinter.printQRCode(ticket.TransactionNo, 8, 1);
    //await thermalPrinter.printTextAlignWithFont(ticket.TransactionNo+'\n', 'ST', 24, 1);
    await thermalPrinter.performPrint(100); //160
}