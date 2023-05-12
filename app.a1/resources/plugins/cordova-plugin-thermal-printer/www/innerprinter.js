let exec = require('cordova/exec');
let deferred = (cb)=>new Promise((res,rej)=>cb.apply(window,[res, rej]));
let plugin = 'ThermalPrinter';
module.exports = {
  printerInit:()=>deferred((resolve, reject)=>exec(resolve, reject, plugin, 'printerInit', [])),
  hasPrinter:()=>deferred((resolve, reject)=>exec(resolve, reject, plugin, 'hasPrinter', [])),
  //
  setDepth:(depth)=>deferred((resolve, reject)=>exec(resolve, reject, plugin, 'setDepth', [depth])),
  setAlignment:(alignment)=>deferred((resolve, reject)=>exec(resolve, reject, plugin, 'setAlignment', [alignment])),
  setFontName:(typeface)=>deferred((resolve, reject)=>exec(resolve, reject, plugin, 'setFontName', [typeface])),
  setFontSize:(fontSize)=>deferred((resolve, reject)=>exec(resolve, reject, plugin, 'setFontSize', [fontSize])),
  //
  printerFeedLines:(lines)=>deferred((resolve, reject)=>exec(resolve, reject, plugin, 'printerFeedLines', [lines])),
  printBlankLines:(lines, height)=>deferred((resolve, reject)=>exec(resolve, reject, plugin, 'printBlankLines', [lines, height])),
  //
  printTextWithFont:(text, typeface, fontSize)=>deferred((resolve, reject)=>exec(resolve, reject, plugin, 'printTextWithFont', [text, typeface, fontSize])),
  printTextAlignWithFont:(text, typeface, fontSize, alignment)=>deferred((resolve, reject)=>exec(resolve, reject, plugin, 'printTextAlignWithFont', [text, typeface, fontSize, alignment])),
  printColumnsText:(colsTextArr, colsWidthArr, colsAlign, isContinuousPrint)=>deferred((resolve, reject)=>exec(resolve, reject, plugin, 'printColumnsText', [colsTextArr, colsWidthArr, colsAlign, isContinuousPrint])),
  //
  printBitmap:(base64Data, width, height, isScaled=false)=>deferred((resolve, reject)=>exec(resolve, reject, plugin, 'printBitmap', [base64Data, width, height, isScaled])),
  printBarCode:(barCodeData, symbology, width, height, textPosition)=>deferred((resolve, reject)=>exec(resolve, reject, plugin, 'printBarCode', [barCodeData, symbology, width, height, textPosition])),
  printQRCode:(qrCodeData, moduleSize, errorLevel)=>deferred((resolve, reject)=>exec(resolve, reject, plugin, 'printQRCode', [qrCodeData, moduleSize, errorLevel])),
  printString:(text)=>deferred((resolve, reject)=>exec(resolve, reject, plugin, 'printText', [text])),
  //
  printRawData:(base64Data)=>deferred((resolve, reject)=>exec(resolve, reject, plugin, 'printRawData', [base64Data])),
  sendUserCMDData:(base64Data)=>deferred((resolve, reject)=>exec(resolve, reject, plugin, 'sendUserCMDData', [base64Data])),
  performPrint:(feedlines)=>deferred((resolve, reject)=>exec(resolve, reject, plugin, 'performPrint', [feedlines])),

  //setDepth: function (depth, resolve, reject) {
  //  exec(resolve, reject, "ThermalPrinter", "setDepth", [depth]);
  //},
  //setAlignment: function (alignment, resolve, reject) {
  //  exec(resolve, reject, "ThermalPrinter", "setAlignment", [alignment]);
  //},
  //setFontName: function (typeface, resolve, reject) {
  //  exec(resolve, reject, "ThermalPrinter", "setFontName", [typeface]);
  //},
  //setFontSize: function (fontSize, resolve, reject) {
  //  exec(resolve, reject, "ThermalPrinter", "setFontSize", [fontSize]);
  //},
  //
  //printerFeedLines: function (lines, resolve, reject) {
  //  exec(resolve, reject, "ThermalPrinter", "printerFeedLines", [lines]);
  //},
  //printBlankLines: function (lines, height, resolve, reject) {
  //  exec(resolve, reject, "ThermalPrinter", "printBlankLines", [lines, height]);
  //},
  //
  //printTextWithFont: function (text, typeface, fontSize, resolve, reject) {
  //  exec(resolve, reject, "ThermalPrinter", "printTextWithFont", [text, typeface, fontSize]);
  //},
  //printTextAlignWithFont: function (text, typeface, fontSize, alignment, resolve, reject) {
  //  exec(resolve, reject, "ThermalPrinter", "printTextWithFont", [text, typeface, fontSize, alignment]);
  //},
  //printColumnsText: function (colsTextArr, colsWidthArr, colsAlign, isContinuousPrint, resolve, reject) {
  //  exec(resolve, reject, "ThermalPrinter", "printColumnsText", [colsTextArr, colsWidthArr, colsAlign, isContinuousPrint]);
  //},
  //
  //printBitmap: function (base64Data, width, height, resolve, reject) {
  //  exec(resolve, reject, "ThermalPrinter", "printBitmap", [base64Data, width, height]);
  //},
  //printBarCode: function (barCodeData, symbology, width, height, textPosition, resolve, reject) {
  //  exec(resolve, reject, "ThermalPrinter", "printBarCode", [barCodeData, symbology, width, height, textPosition]);
  //},
  //printQRCode: function (qrCodeData, moduleSize, errorLevel, resolve, reject) {
  //  exec(resolve, reject, "ThermalPrinter", "printQRCode", [qrCodeData, moduleSize, errorLevel]);
  //},
  //printString: function (text, resolve, reject) {
  //  exec(resolve, reject, "ThermalPrinter", "printText", [text]);
  //},
  //
  //printRawData: function (base64Data, resolve, reject) {
  //  exec(resolve, reject, "ThermalPrinter", "printRawData", [base64Data]);
  //},
  //sendUserCMDData: function (base64Data, resolve, reject) {
  //  exec(resolve, reject, "ThermalPrinter", "sendUserCMDData", [base64Data]);
  //},
  //
  //performPrint: function (feedlines, resolve, reject) {
  //  exec(resolve, reject, "ThermalPrinter", "performPrint", [feedlines]);
  //},
}
/*
  
  printerInit: function (resolve, reject) {
    exec(resolve, reject, "ThermalPrinter", "printerInit", []); 
  },


  printerInit: function (resolve, reject) {
    return new Promise((res, rej) => {

        callbacks[id]=((ret)=>res(ret));
        post({ id:id, n:notation, d:values });  //--, r
        setTimeout(()=> rej(undefined), 60000);
    });


    //exec(resolve, reject, "ThermalPrinter", "printerInit", []); 
  },

  printerInit: function () {
    return deferred((res, rej)=>exec(res, rej, "ThermalPrinter", "printerInit", []))
  },

  //(res,rej)

  new Promise((res,rej) => {
                callbacks[id]=((ret)=>res(ret));
                post({ id:id, n:notation, d:values });  //--, r
                setTimeout(()=> rej(undefined), 60000);
            });
*/