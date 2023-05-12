import { Plugins } from '@capacitor/core';
import { device } from './device';

export const thermalPrinter=(()=>{
    const{ sunmiInnerPrinter, thermalPrinter }:any = window;
    var isCordovaAvailable = false, printer:any = null;
    device.ready(()=>isCordovaAvailable=(!!sunmiInnerPrinter||!!thermalPrinter));
    return {    
        checkPrinters: async()=>{
            if(!isCordovaAvailable) return false;
            /*if(this.sunmiPrinter.hasPrinter()){
                this.printer = this.sunmiPrinter;
                return true;
            }*/
            if(!!thermalPrinter.hasPrinter){
                try{
                    if(await thermalPrinter.hasPrinter()){
                        printer = thermalPrinter;
                        return true;
                    }
                }catch{}
            }
            return false;
        },
        hasPrinter: async()=>{
            if(!printer.hasPrinter) return false;
            return await printer.hasPrinter();
        },
        printString: async(text:string)=>await printer.printString(text),
        performPrint: async(feedlines:number=50)=>await printer.performPrint(feedlines),
        setAlignment: async(alignment:number)=>await printer.setAlignment(alignment),
        setFontName: async(typeface:string)=>await printer.setFontName(typeface),
        setFontSize: async(fontSize:number)=>await printer.setFontSize(fontSize),
        printBlankLines: async(lines:number, height:number)=>await printer.printBlankLines(lines, height),
        printTextAlignWithFont: async(text:string, typeface:string, fontSize:number, alignment:number)=>await printer.printTextAlignWithFont(text, typeface, fontSize, alignment),
        printColumnsText: async(colsTextArr:any, colsWidthArr:any, colsAlign:any, isContinuousPrint:number)=>await printer.printColumnsText(colsTextArr, colsWidthArr, colsAlign, isContinuousPrint),
        printBitmap: async(base64Data:any, width:any, height:any)=>await printer.printBitmap(base64Data, width, height),
        printBarCode: async(barCodeData:any, symbology:any, width:any, height:any, textPosition:any)=>await printer.printBarCode(barCodeData, symbology, width, height, textPosition),
        printQRCode: async(qrCodeData:any, moduleSize:any, herrorLeveleight:any)=>await printer.printQRCode(qrCodeData, moduleSize, herrorLeveleight),
    };
})();